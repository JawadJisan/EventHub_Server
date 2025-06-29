const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const eventController = require("../controllers/eventController");

// Private routes (require authentication)
router.use(auth);

// @route   POST api/events
// @desc    Create new event
router.post("/", eventController.createEvent);

// @route   GET api/events
// @desc    Get all events (with search/filters)
router.get("/", eventController.getEvents);

// @route   PUT api/events/join/:id
// @desc    Join an event
router.put("/join/:id", eventController.joinEvent);

// @route   GET api/events/my-events
// @desc    Get user's events
router.get("/my-events", eventController.getUserEvents);

// @route   PUT api/events/:id
// @desc    Update event
router.put("/:id", eventController.updateEvent);

// @route   DELETE api/events/:id
// @desc    Delete event
router.delete("/:id", eventController.deleteEvent);

module.exports = router;
