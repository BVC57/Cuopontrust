const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");
const Notification = require("../models/Notification");
const TrustHistory = require("../models/TrustHistory");
const Wallet = require("../models/Wallet");
const User = require("../models/User");
const Coupon = require("../models/Coupon");
const { ensureReferralCode, processRewardEvent } = require("../services/reward.service");

const SELLER_PROFILE_SELECT =
  "name email avatar country trustScore accountStatus totalSales createdAt successfulCouponFeedbackCount";

const maskEmail = (email) => {
  const value = String(email || "").trim().toLowerCase();
  if (!value || !value.includes("@")) {
    return "";
  }

  const [localPart, domain] = value.split("@");
  if (!localPart || !domain) {
    return "";
  }

  const visiblePrefix = localPart.slice(0, 2);
  const hiddenLength = Math.max(localPart.length - visiblePrefix.length, 1);
  return `${visiblePrefix}${"*".repeat(hiddenLength)}@${domain}`;
};

const buildPublicSeller = async (userDoc, { includeCoupons = false } = {}) => {
  if (!userDoc) {
    return null;
  }

  const [listedCouponsCount, activeCouponsCount, soldCouponsCount, coupons] = await Promise.all([
    Coupon.countDocuments({ sellerId: userDoc._id }),
    Coupon.countDocuments({ sellerId: userDoc._id, status: "available", aiVerificationStatus: "matched" }),
    Coupon.countDocuments({ sellerId: userDoc._id, status: "sold" }),
    includeCoupons
      ? Coupon.find({
          sellerId: userDoc._id,
          status: "available",
          aiVerificationStatus: "matched"
        })
          .sort({ createdAt: -1 })
          .limit(6)
          .populate("sellerId", "name trustScore country avatar accountStatus")
      : Promise.resolve([])
  ]);

  return {
    _id: userDoc._id,
    name: userDoc.name || "Seller",
    avatar: userDoc.avatar || "",
    country: userDoc.country || "India",
    trustScore: Number(userDoc.trustScore || 0),
    accountStatus: userDoc.accountStatus || "active",
    totalSales: Number(userDoc.totalSales || 0),
    successfulCouponFeedbackCount: Number(userDoc.successfulCouponFeedbackCount || 0),
    memberSince: userDoc.createdAt,
    emailHint: maskEmail(userDoc.email),
    listedCouponsCount,
    activeCouponsCount,
    soldCouponsCount,
    isVerifiedSeller: listedCouponsCount > 0 && userDoc.accountStatus !== "banned" && Number(userDoc.trustScore || 0) >= 40,
    coupons
  };
};

const getProfile = asyncHandler(async (req, res) => {
  await ensureReferralCode(req.user);
  return sendResponse(res, 200, "Profile fetched", { user: req.user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const fields = ["name", "country", "currency", "avatar"];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      req.user[field] = req.body[field];
    }
  });
  if (req.body.notificationPreferences && typeof req.body.notificationPreferences === "object") {
    req.user.notificationPreferences = {
      ...(req.user.notificationPreferences || {}),
      ...req.body.notificationPreferences
    };
  }
  if (req.file) {
    const fs = require("fs");
    const fileBase64 = fs.readFileSync(req.file.path, { encoding: "base64" });
    const mimeType = req.file.mimetype || "image/jpeg";
    req.user.avatar = `data:${mimeType};base64,${fileBase64}`;
    try {
      fs.unlinkSync(req.file.path);
    } catch (e) {}
  }
  await ensureReferralCode(req.user);
  await req.user.save();

  const profileComplete = Boolean(req.user.name && req.user.country && req.user.currency);
  if (profileComplete) {
    await processRewardEvent({
      userId: req.user._id,
      event: "PROFILE_COMPLETED",
      referenceId: `${req.user._id}-profile-complete`,
      description: "Profile completion reward"
    });
  }

  if (req.file) {
    await processRewardEvent({
      userId: req.user._id,
      event: "UPLOAD_PROFILE_PICTURE",
      referenceId: `${req.user._id}-avatar`,
      description: "Profile photo reward"
    });
  }

  return sendResponse(res, 200, "Profile updated", { user: req.user });
});

const getTrustScore = asyncHandler(async (req, res) => {
  const history = await TrustHistory.find({ userId: req.user._id }).sort({ createdAt: -1 });
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

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, audience: "user", isRead: false },
    { $set: { isRead: true } }
  );

  return sendResponse(res, 200, "All notifications marked as read");
});

const getWalletSnapshot = asyncHandler(async (req, res) => {
  const wallet = await Wallet.findOne({ userId: req.user._id });
  return sendResponse(res, 200, "Wallet fetched", { wallet });
});

const searchPublicSellers = asyncHandler(async (req, res) => {
  const search = String(req.query.search || "").trim();
  const sellerIds = await Coupon.distinct("sellerId");

  if (!sellerIds.length) {
    return sendResponse(res, 200, "Seller profiles fetched", { sellers: [] });
  }

  const filters = {
    _id: { $in: sellerIds }
  };

  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const searchRegex = new RegExp(escapedSearch, "i");
    filters.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  const users = await User.find(filters)
    .select(SELLER_PROFILE_SELECT)
    .sort({ trustScore: -1, totalSales: -1, createdAt: 1 })
    .limit(10);

  const sellers = await Promise.all(users.map((user) => buildPublicSeller(user)));
  return sendResponse(res, 200, "Seller profiles fetched", { sellers: sellers.filter(Boolean) });
});

const getPublicSellerProfile = asyncHandler(async (req, res) => {
  const seller = await User.findById(req.params.id).select(SELLER_PROFILE_SELECT);
  if (!seller) {
    return sendResponse(res, 404, "Seller not found");
  }

  const listedCouponsCount = await Coupon.countDocuments({ sellerId: seller._id });
  if (!listedCouponsCount) {
    return sendResponse(res, 404, "Seller profile not found");
  }

  const publicSeller = await buildPublicSeller(seller, { includeCoupons: true });
  return sendResponse(res, 200, "Seller profile fetched", {
    seller: {
      ...publicSeller,
      coupons: undefined
    },
    coupons: publicSeller.coupons || []
  });
});

module.exports = {
  getProfile,
  updateProfile,
  getTrustScore,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getWalletSnapshot,
  searchPublicSellers,
  getPublicSellerProfile
};
