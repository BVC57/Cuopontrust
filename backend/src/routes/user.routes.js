const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const bannedMiddleware = require("../middleware/banned.middleware");
const { profileUpload } = require("../middleware/upload.middleware");
const {
  getProfile,
  updateProfile,
  getTrustScore,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
} = require("../controllers/user.controller");

const router = express.Router();

router.use(authMiddleware);
router.get("/profile", getProfile);
router.put("/profile", bannedMiddleware, profileUpload, updateProfile);
router.get("/trust-score", getTrustScore);
router.get("/notifications", getNotifications);
router.put("/notifications/read-all", markAllNotificationsRead);
router.put("/notifications/:id/read", markNotificationRead);

module.exports = router;
