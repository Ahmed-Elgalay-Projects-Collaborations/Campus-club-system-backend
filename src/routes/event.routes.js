const express = require("express");
const eventController = require("../controllers/event.controller");
const {
  authenticate,
  authorizeRoles,
  requireApprovedUser,
} = require("../middlewares/auth");
const {
  validateCreateEvent,
  validateUpdateEvent,
  validateEventIdParam,
  validateListEventsQuery,
} = require("../validators/event.validator");
const { ROLES } = require("../constants/roles");

const router = express.Router();

router.post(
  "/events",
  authenticate,
  requireApprovedUser,
  authorizeRoles(ROLES.ADMIN),
  validateCreateEvent,
  eventController.createEvent
);
router.get(
  "/events",
  authenticate,
  requireApprovedUser,
  validateListEventsQuery,
  eventController.listEvents
);
router.get(
  "/events/:id",
  authenticate,
  requireApprovedUser,
  validateEventIdParam,
  eventController.getEventById
);
router.put(
  "/events/:id",
  authenticate,
  requireApprovedUser,
  authorizeRoles(ROLES.ADMIN),
  validateEventIdParam,
  validateUpdateEvent,
  eventController.updateEvent
);
router.delete(
  "/events/:id",
  authenticate,
  requireApprovedUser,
  authorizeRoles(ROLES.ADMIN),
  validateEventIdParam,
  eventController.deleteEvent
);

module.exports = router;
