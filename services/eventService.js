const Event = require("../models/Event");

// Create new event
exports.createEvent = async (eventData) => {
  const event = new Event(eventData);
  return await event.save();
};

// Get all events (sorted by date descending)
exports.getAllEvents = async (filters = {}) => {
  const { search, dateFilter } = filters;
  let query = {};

  // Search by title
  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  // Date filtering
  if (dateFilter) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (dateFilter) {
      case "today":
        query.date = {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        };
        break;
      case "current-week":
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        query.date = { $gte: startOfWeek, $lt: endOfWeek };
        break;
      case "last-week":
        const startOfLastWeek = new Date(today);
        startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
        const endOfLastWeek = new Date(startOfLastWeek);
        endOfLastWeek.setDate(startOfLastWeek.getDate() + 7);
        query.date = { $gte: startOfLastWeek, $lt: endOfLastWeek };
        break;
      // Add cases for month filters similarly
    }
  }

  return await Event.find(query)
    .sort({ date: -1 })
    .populate("createdBy", "name photoURL");
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

// Get user's events
exports.getUserEvents = async (userId) => {
  return await Event.find({ createdBy: userId }).sort({ createdAt: -1 });
};

// Update event
exports.updateEvent = async (eventId, updateData) => {
  return await Event.findByIdAndUpdate(eventId, updateData, { new: true });
};

// Delete event
exports.deleteEvent = async (eventId) => {
  return await Event.findByIdAndDelete(eventId);
};
