const eventService = require("../services/eventService");

exports.createEvent = async (req, res) => {
  try {
    const eventData = { ...req.body, createdBy: req.user.id };
    const event = await eventService.createEvent(eventData);
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await eventService.getAllEvents(req.query);
    res.json(events);
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
    const events = await eventService.getUserEvents(req.user.id);
    res.json(events);
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
