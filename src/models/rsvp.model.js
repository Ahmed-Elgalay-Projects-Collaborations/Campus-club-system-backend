const mongoose = require("mongoose");

const rsvpSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

rsvpSchema.index({ userId: 1, eventId: 1 }, { unique: true });

const RSVP = mongoose.model("RSVP", rsvpSchema);

module.exports = RSVP;
