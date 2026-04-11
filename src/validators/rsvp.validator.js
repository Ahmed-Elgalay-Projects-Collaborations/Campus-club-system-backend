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

const validateListMyRsvpsQuery = validate(
  {
    page: {
      required: false,
      type: "string",
      custom: (value) =>
        /^\d+$/.test(value) && Number.parseInt(value, 10) > 0
          ? null
          : "page must be a positive integer.",
    },
    limit: {
      required: false,
      type: "string",
      custom: (value) =>
        /^\d+$/.test(value) && Number.parseInt(value, 10) > 0
          ? null
          : "limit must be a positive integer.",
    },
  },
  "query"
);

const validateListAttendeesQuery = validate(
  {
    page: {
      required: false,
      type: "string",
      custom: (value) =>
        /^\d+$/.test(value) && Number.parseInt(value, 10) > 0
          ? null
          : "page must be a positive integer.",
    },
    limit: {
      required: false,
      type: "string",
      custom: (value) =>
        /^\d+$/.test(value) && Number.parseInt(value, 10) > 0
          ? null
          : "limit must be a positive integer.",
    },
  },
  "query"
);

module.exports = {
  validateCreateRsvp,
  validateEventIdParam,
  validateListMyRsvpsQuery,
  validateListAttendeesQuery,
};
