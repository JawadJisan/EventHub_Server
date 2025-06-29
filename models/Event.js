const mongoose = require("mongoose");

// const eventSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true },
//     name: { type: String, required: true }, // Name of the user who posted
//     date: { type: Date, required: true },
//     location: { type: String, required: true },
//     description: { type: String, required: true },
//     attendeeCount: { type: Number, default: 0 },
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//   },
//   { timestamps: true }
// );

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    organizer: { type: String, required: true },
    date: { type: Date, required: true }, // Combined date + time in UTC
    location: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Virtual for attendee count
eventSchema.virtual("attendeeCount").get(function () {
  return this.attendees.length;
});

// Virtual for time extraction (HH:mm format)
eventSchema.virtual("time").get(function () {
  return this.date.toISOString().slice(11, 16);
});

// Virtual for date extraction (YYYY-MM-DD format)
eventSchema.virtual("dateOnly").get(function () {
  return this.date.toISOString().split("T")[0];
});

module.exports = mongoose.model("Event", eventSchema);
