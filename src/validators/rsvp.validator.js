const validate = require("../middlewares/validate");
const { isValidObjectId } = require("../validation/rules");

const validateCreateRsvp = validate({
  eventId: {
    required: true,
    type: "string",
    custom: (value) =>
      isValidObjectId(value) ? null : "eventId must be a valid id.",
  },
});

const validateEventIdParam = validate(
  {
    eventId: {
      required: true,
      type: "string",
      custom: (value) =>
        isValidObjectId(value) ? null : "eventId must be a valid id.",
    },
  },
  "params"
);

module.exports = {
  validateCreateRsvp,
  validateEventIdParam,
};
