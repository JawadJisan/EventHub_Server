const Event = require("../models/Event");

// Create new event
exports.createEvent = async (eventData) => {
  const event = new Event(eventData);
  return await event.save();
};

// Get all events (sorted by date descending)
exports.getAllEvents = async (filters = {}) => {
  const { search, dateFilter, page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;

  let query = {};

  // Search by title
  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  // Date filtering with UTC handling
  if (dateFilter) {
    const now = new Date();
    const today = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );

    switch (dateFilter) {
      case "today":
        const tomorrow = new Date(today);
        tomorrow.setUTCDate(today.getUTCDate() + 1);
        query.date = { $gte: today, $lt: tomorrow };
        break;

      case "current-week":
        const startOfWeek = new Date(today);
        startOfWeek.setUTCDate(today.getUTCDate() - today.getUTCDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 7);
        query.date = { $gte: startOfWeek, $lt: endOfWeek };
        break;

      case "last-week":
        const startOfLastWeek = new Date(today);
        startOfLastWeek.setUTCDate(today.getUTCDate() - today.getUTCDay() - 7);
        const endOfLastWeek = new Date(startOfLastWeek);
        endOfLastWeek.setUTCDate(startOfLastWeek.getUTCDate() + 7);
        query.date = { $gte: startOfLastWeek, $lt: endOfLastWeek };
        break;

      case "current-month":
        const startOfMonth = new Date(
          Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)
        );
        const endOfMonth = new Date(
          Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1)
        );
        query.date = { $gte: startOfMonth, $lt: endOfMonth };
        break;

      case "last-month":
        const startOfLastMonth = new Date(
          Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1)
        );
        const endOfLastMonth = new Date(
          Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)
        );
        query.date = { $gte: startOfLastMonth, $lt: endOfLastMonth };
        break;

      case "upcoming":
        query.date = { $gte: today };
        break;

      case "past":
        query.date = { $lt: today };
        break;
    }
  }

  return await Event.find(query)
    .sort({ date: -1 }) // Sort by date descending
    .populate("createdBy", "name photoURL")
    .populate("attendees", "name photoURL")
    .skip(skip)
    .limit(limit);
};

// Get total count for pagination
exports.getEventsCount = async (filters = {}) => {
  const { search, dateFilter } = filters;
  let query = {};

  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  // Same date filtering logic as above

  return await Event.countDocuments(query);
};

// Join an event
exports.joinEvent = async (eventId, userId) => {
  const event = await Event.findById(eventId);
  if (!event) throw new Error("Event not found");

  // Check if user already joined
  if (event.attendees.includes(userId)) {
    throw new Error("Already joined this event");
  }

  event.attendees.push(userId);
  event.attendeeCount = event.attendees.length;
  return await event.save();
};

exports.getUserEvents = async (filters = {}) => {
  const { userId, search, dateFilter, page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;

  let query = { createdBy: userId };

  // Search by title
  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  // Date filtering with UTC handling
  if (dateFilter) {
    const now = new Date();
    const today = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );

    switch (dateFilter) {
      case "today":
        const tomorrow = new Date(today);
        tomorrow.setUTCDate(today.getUTCDate() + 1);
        query.date = { $gte: today, $lt: tomorrow };
        break;

      case "current-week":
        const startOfWeek = new Date(today);
        startOfWeek.setUTCDate(today.getUTCDate() - today.getUTCDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 7);
        query.date = { $gte: startOfWeek, $lt: endOfWeek };
        break;

      case "last-week":
        const startOfLastWeek = new Date(today);
        startOfLastWeek.setUTCDate(today.getUTCDate() - today.getUTCDay() - 7);
        const endOfLastWeek = new Date(startOfLastWeek);
        endOfLastWeek.setUTCDate(startOfLastWeek.getUTCDate() + 7);
        query.date = { $gte: startOfLastWeek, $lt: endOfLastWeek };
        break;

      case "current-month":
        const startOfMonth = new Date(
          Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)
        );
        const endOfMonth = new Date(
          Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1)
        );
        query.date = { $gte: startOfMonth, $lt: endOfMonth };
        break;

      case "last-month":
        const startOfLastMonth = new Date(
          Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1)
        );
        const endOfLastMonth = new Date(
          Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)
        );
        query.date = { $gte: startOfLastMonth, $lt: endOfLastMonth };
        break;

      case "upcoming":
        query.date = { $gte: today };
        break;

      case "past":
        query.date = { $lt: today };
        break;
    }
  }

  return await Event.find(query)
    .sort({ date: -1 }) // Sort by date descending
    .populate("createdBy", "name photoURL")
    .populate("attendees", "name photoURL")
    .skip(skip)
    .limit(limit);
};

// Get total count of user's events with filters
exports.getUserEventsCount = async (filters = {}) => {
  const { userId, search, dateFilter } = filters;
  let query = { createdBy: userId };

  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  // Date filtering - same logic as getUserEvents
  if (dateFilter) {
    const now = new Date();
    const today = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );

    switch (dateFilter) {
      case "today":
        const tomorrow = new Date(today);
        tomorrow.setUTCDate(today.getUTCDate() + 1);
        query.date = { $gte: today, $lt: tomorrow };
        break;

      case "current-week":
        const startOfWeek = new Date(today);
        startOfWeek.setUTCDate(today.getUTCDate() - today.getUTCDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 7);
        query.date = { $gte: startOfWeek, $lt: endOfWeek };
        break;

      case "last-week":
        const startOfLastWeek = new Date(today);
        startOfLastWeek.setUTCDate(today.getUTCDate() - today.getUTCDay() - 7);
        const endOfLastWeek = new Date(startOfLastWeek);
        endOfLastWeek.setUTCDate(startOfLastWeek.getUTCDate() + 7);
        query.date = { $gte: startOfLastWeek, $lt: endOfLastWeek };
        break;

      case "current-month":
        const startOfMonth = new Date(
          Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)
        );
        const endOfMonth = new Date(
          Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1)
        );
        query.date = { $gte: startOfMonth, $lt: endOfMonth };
        break;

      case "last-month":
        const startOfLastMonth = new Date(
          Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1)
        );
        const endOfLastMonth = new Date(
          Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)
        );
        query.date = { $gte: startOfLastMonth, $lt: endOfLastMonth };
        break;

      case "upcoming":
        query.date = { $gte: today };
        break;

      case "past":
        query.date = { $lt: today };
        break;
    }
  }

  return await Event.countDocuments(query);
};

// Update event with validation
exports.updateEvent = async (eventId, updateData) => {
  // Find event first to validate
  const event = await Event.findById(eventId);
  if (!event) throw new Error("Event not found");

  return await Event.findByIdAndUpdate(eventId, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("createdBy", "name photoURL")
    .populate("attendees", "name photoURL");
};

// Delete event with existence check
exports.deleteEvent = async (eventId) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new Error("Event not found");
  }

  await Event.findByIdAndDelete(eventId);
  return { message: "Event deleted successfully" };
};

// Get single event by ID with full population
exports.getEventById = async (eventId) => {
  return await Event.findById(eventId)
    .populate("createdBy", "name email photoURL")
    .populate("attendees", "name email photoURL");
};

// Get latest 3 events (sorted by date descending)
exports.getLatestEvents = async () => {
  return await Event.find()
    .sort({ date: -1 })
    .limit(3)
    .populate("createdBy", "name photoURL")
    .populate("attendees", "name photoURL");
};
