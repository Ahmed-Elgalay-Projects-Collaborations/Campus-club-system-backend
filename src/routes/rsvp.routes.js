const express = require("express");
const rsvpController = require("../controllers/rsvp.controller");
const {
  authenticate,
  authorizeRoles,
  requireApprovedUser,
} = require("../middlewares/auth");
const { ROLES } = require("../constants/roles");
const {
  validateCreateRsvp,
  validateEventIdParam,
  validateListMyRsvpsQuery,
  validateListAttendeesQuery,
} = require("../validators/rsvp.validator");

const router = express.Router();

router.post(
  "/rsvps",
  authenticate,
  requireApprovedUser,
  authorizeRoles(ROLES.USER),
  validateCreateRsvp,
  rsvpController.createRsvp
);
router.delete(
  "/rsvps/:eventId",
  authenticate,
  requireApprovedUser,
  authorizeRoles(ROLES.USER),
  validateEventIdParam,
  rsvpController.cancelRsvp
);
router.get(
  "/rsvps/me",
  authenticate,
  requireApprovedUser,
  authorizeRoles(ROLES.USER),
  validateListMyRsvpsQuery,
  rsvpController.listMyRsvps
);
router.get(
  "/events/:eventId/attendees",
  authenticate,
  requireApprovedUser,
  authorizeRoles(ROLES.ADMIN),
  validateEventIdParam,
  validateListAttendeesQuery,
  rsvpController.listAttendees
);

module.exports = router;
