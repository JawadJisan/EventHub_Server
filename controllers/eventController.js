const eventService = require("../services/eventService");
const Event = require("../models/Event");

exports.createEvent = async (req, res) => {
  try {
    // Combine date and time into UTC Date object
    const dateTime = new Date(`${req.body.date}T${req.body.time}:00.000Z`);

    const eventData = {
      title: req.body.title,
      organizer: req.body.organizer,
      date: dateTime,
      location: req.body.location,
      description: req.body.description,
      createdBy: req.user.id,
    };

    const event = await eventService.createEvent(eventData);
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const { search, dateFilter, page, limit } = req.query;

    // Get events with pagination
    const events = await eventService.getAllEvents({
      search,
      dateFilter,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
    });

    // Get total count for pagination
    const totalEvents = await eventService.getEventsCount({
      search,
      dateFilter,
    });
    const totalPages = Math.ceil(totalEvents / (parseInt(limit) || 10));

    res.json({
      events,
      pagination: {
        currentPage: parseInt(page) || 1,
        totalPages,
        totalEvents,
        hasNextPage: (parseInt(page) || 1) < totalPages,
        hasPreviousPage: (parseInt(page) || 1) > 1,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// exports.joinEvent = async (req, res) => {
//   try {
//     const event = await eventService.joinEvent(req.params.id, req.user.id);
//     res.json(event);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };
exports.joinEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if user already joined
    if (event.attendees.includes(userId)) {
      return res.status(400).json({ error: "User already joined this event" });
    }

    // Add user to attendees
    event.attendees.push(userId);
    await event.save();

    // Populate attendees for response
    const populatedEvent = await Event.findById(eventId)
      .populate("createdBy", "name email photoURL")
      .populate("attendees", "name email photoURL");

    res.json({
      message: "Successfully joined the event",
      event: populatedEvent,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getUserEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search, dateFilter, page, limit } = req.query;

    // Get events with pagination
    const events = await eventService.getUserEvents({
      userId,
      search,
      dateFilter,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
    });

    // Get total count for pagination
    const totalEvents = await eventService.getUserEventsCount({
      userId,
      search,
      dateFilter,
    });

    const totalPages = Math.ceil(totalEvents / (parseInt(limit) || 10));

    res.json({
      events,
      pagination: {
        currentPage: parseInt(page) || 1,
        totalPages,
        totalEvents,
        hasNextPage: (parseInt(page) || 1) < totalPages,
        hasPreviousPage: (parseInt(page) || 1) > 1,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update event with validation
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check ownership
    if (event.createdBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Unauthorized to update this event" });
    }

    // Validate required fields
    const { title, organizer, date, time, location, description } = req.body;
    if (!title || !organizer || !date || !time || !location || !description) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Combine date and time into UTC
    const dateTime = new Date(`${date}T${time}:00.000Z`);

    const updateData = {
      title,
      organizer,
      date: dateTime,
      location,
      description,
    };

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("createdBy", "name photoURL")
      .populate("attendees", "name photoURL");

    res.json(updatedEvent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    // Check if event exists and user is owner
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (event.createdBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this event" });
    }

    await eventService.deleteEvent(req.params.id);
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get single event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get latest 3 events (no auth required)
exports.getLatestEvents = async (req, res) => {
  try {
    const events = await eventService.getLatestEvents();
    res.json(events);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Server error while fetching latest events" });
  }
};
