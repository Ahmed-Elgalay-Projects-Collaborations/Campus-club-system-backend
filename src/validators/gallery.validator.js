const validate = require("../middlewares/validate");
const {
  isValidDate,
  isValidObjectId,
} = require("../validation/rules");

const validateCreatePhoto = validate({
  title: { required: true, type: "string", minLength: 2, maxLength: 180 },
  description: { required: true, type: "string", minLength: 3, maxLength: 2000 },
  date: {
    required: true,
    type: "string",
    custom: (value) => (isValidDate(value) ? null : "date must be valid."),
  },
  imageUrl: { required: false, type: "string", minLength: 5 },
});

const validateUpdatePhoto = validate({
  title: { required: false, type: "string", minLength: 2, maxLength: 180 },
  description: { required: false, type: "string", minLength: 3, maxLength: 2000 },
  date: {
    required: false,
    type: "string",
    custom: (value) => (isValidDate(value) ? null : "date must be valid."),
  },
  imageUrl: { required: false, type: "string", minLength: 5 },
  publicId: { required: false, type: "string", minLength: 1 },
});

const validateListPhotosQuery = validate(
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

const validatePhotoIdParam = validate(
  {
    id: {
      required: true,
      type: "string",
      custom: (value) => (isValidObjectId(value) ? null : "id must be valid."),
    },
  },
  "params"
);

module.exports = {
  validateCreatePhoto,
  validateUpdatePhoto,
  validateListPhotosQuery,
  validatePhotoIdParam,
};
