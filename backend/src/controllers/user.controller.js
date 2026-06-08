const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");
const Notification = require("../models/Notification");
const TrustHistory = require("../models/TrustHistory");
const Wallet = require("../models/Wallet");

const getProfile = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, "Profile fetched", { user: req.user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const fields = ["name", "country", "currency", "avatar"];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      req.user[field] = req.body[field];
    }
  });
  if (req.file) {
    req.user.avatar = `/uploads/profile/${req.file.filename}`;
  }
  await req.user.save();
  return sendResponse(res, 200, "Profile updated", { user: req.user });
});

const getTrustScore = asyncHandler(async (req, res) => {
  const history = await TrustHistory.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
  return sendResponse(res, 200, "Trust score fetched", {
    trustScore: req.user.trustScore,
    accountStatus: req.user.accountStatus,
    history
  });
});

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id, audience: "user" }).sort({ createdAt: -1 }).limit(50);
  const unreadCount = notifications.filter((item) => !item.isRead).length;
  return sendResponse(res, 200, "Notifications fetched", { notifications, unreadCount });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id, audience: "user" },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return sendResponse(res, 404, "Notification not found");
  }

  return sendResponse(res, 200, "Notification marked as read", { notification });
});

const getWalletSnapshot = asyncHandler(async (req, res) => {
  const wallet = await Wallet.findOne({ userId: req.user._id });
  return sendResponse(res, 200, "Wallet fetched", { wallet });
});

module.exports = {
  getProfile,
  updateProfile,
  getTrustScore,
  getNotifications,
  markNotificationRead,
  getWalletSnapshot
};
