const eventService = require("../services/eventService");

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

exports.joinEvent = async (req, res) => {
  try {
    const event = await eventService.joinEvent(req.params.id, req.user.id);
    res.json(event);
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

exports.updateEvent = async (req, res) => {
  try {
    const event = await eventService.updateEvent(req.params.id, req.body);
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    await eventService.deleteEvent(req.params.id);
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
