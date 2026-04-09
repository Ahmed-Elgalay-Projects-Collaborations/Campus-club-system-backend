const express = require("express");
const galleryController = require("../controllers/gallery.controller");
const {
  authenticate,
  authorizeRoles,
  requireApprovedUser,
} = require("../middlewares/auth");
const { ROLES } = require("../constants/roles");
const { uploadImage } = require("../utils/multer");
const {
  validateCreatePhoto,
  validateUpdatePhoto,
  validatePhotoIdParam,
} = require("../validators/gallery.validator");

const router = express.Router();

router.post(
  "/gallery",
  authenticate,
  requireApprovedUser,
  authorizeRoles(ROLES.ADMIN),
  uploadImage.single("image"),
  validateCreatePhoto,
  galleryController.createPhoto
);
router.get(
  "/gallery",
  authenticate,
  requireApprovedUser,
  galleryController.listPhotos
);
router.put(
  "/gallery/:id",
  authenticate,
  requireApprovedUser,
  authorizeRoles(ROLES.ADMIN),
  uploadImage.single("image"),
  validatePhotoIdParam,
  validateUpdatePhoto,
  galleryController.updatePhoto
);
router.delete(
  "/gallery/:id",
  authenticate,
  requireApprovedUser,
  authorizeRoles(ROLES.ADMIN),
  validatePhotoIdParam,
  galleryController.deletePhoto
);

module.exports = router;
