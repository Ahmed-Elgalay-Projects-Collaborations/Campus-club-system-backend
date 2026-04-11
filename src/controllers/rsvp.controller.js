const asyncHandler = require("../utils/asyncHandler");
const rsvpService = require("../services/rsvp.service");

const createRsvp = asyncHandler(async (req, res) => {
  const rsvp = await rsvpService.createRsvp({
    eventId: req.body.eventId,
    userId: req.user.userId,
  });

  res.status(201).json({
    success: true,
    message: "RSVP created successfully.",
    data: rsvp,
  });
});

const cancelRsvp = asyncHandler(async (req, res) => {
  const rsvp = await rsvpService.cancelRsvp({
    eventId: req.params.eventId,
    userId: req.user.userId,
  });

  res.status(200).json({
    success: true,
    message: "RSVP cancelled successfully.",
    data: rsvp,
  });
});

const listAttendees = asyncHandler(async (req, res) => {
  const result = await rsvpService.listAttendees(req.params.eventId, req.query);
  res.status(200).json({
    success: true,
    data: result.items,
    ...(result.pagination ? { meta: { pagination: result.pagination } } : {}),
  });
});

const listMyRsvps = asyncHandler(async (req, res) => {
  const result = await rsvpService.listMyRsvps(req.user.userId, req.query);
  res.status(200).json({
    success: true,
    data: result.items,
    meta: { pagination: result.pagination },
  });
});

module.exports = {
  createRsvp,
  cancelRsvp,
  listAttendees,
  listMyRsvps,
};
