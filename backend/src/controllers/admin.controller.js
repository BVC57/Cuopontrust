const User = require("../models/User");
const Coupon = require("../models/Coupon");
const Transaction = require("../models/Transaction");
const Dispute = require("../models/Dispute");
const Withdrawal = require("../models/Withdrawal");
const FraudReport = require("../models/FraudReport");
const TrustHistory = require("../models/TrustHistory");
const Revenue = require("../models/Revenue");
const AdminSetting = require("../models/AdminSetting");
const Notification = require("../models/Notification");
const ContactIssue = require("../models/ContactIssue");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");
const { capturePayment, refundPayment } = require("../services/razorpay.service");
const { applyTrustPenalty } = require("../services/trustScore.service");
const { releasePendingToAvailable, reversePending } = require("../services/wallet.service");
const { createNotification } = require("../services/notification.service");

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const buildLastNDays = (days) =>
  Array.from({ length: days }, (_, index) => {
    const date = startOfDay(new Date(Date.now() - (days - index - 1) * DAY_MS));
    return {
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      date
    };
  });

const getSettings = async () =>
  (await AdminSetting.findOne()) ||
  AdminSetting.create({
    commissionPercent: 10,
    minimumTrustScore: 40,
    aiMatchThreshold: 90,
    maxFreeListings: 10,
    withdrawalFee: 2
  });

const createAdminTrustHistoryEntry = async (user, reason) => {
  await TrustHistory.create({
    userId: user._id,
    oldScore: user.trustScore,
    newScore: user.trustScore,
    change: 0,
    reason
  });
};

const getDashboard = asyncHandler(async (req, res) => {
  const todayStart = startOfDay();
  const tomorrowStart = new Date(todayStart.getTime() + DAY_MS);
  const recentDays = buildLastNDays(7);
  const last7Start = recentDays[0].date;

  const [
    totalUsers,
    totalCoupons,
    activeCoupons,
    failedAiCoupons,
    suspiciousUsers,
    totalTransactions,
    openDisputes,
    pendingWithdrawals,
    bannedUsers,
    soldCoupons,
    dailyListedCoupons,
    dailyActiveUsers,
    expiredCoupons,
    revenueRows,
    pendingEscrow,
    completedSales,
    couponStatusCounts,
    dailyCouponActivity,
    dailyTransactionActivity,
    dailyUserActivity
  ] =
    await Promise.all([
      User.countDocuments(),
      Coupon.countDocuments(),
      Coupon.countDocuments({ status: "available" }),
      Coupon.countDocuments({ status: "ai_failed" }),
      User.countDocuments({ suspiciousUploadCount: { $gt: 0 } }),
      Transaction.countDocuments(),
      Dispute.countDocuments({ status: { $in: ["open", "under_review"] } }),
      Withdrawal.countDocuments({ status: "pending" }),
      User.countDocuments({ accountStatus: "banned" }),
      Coupon.countDocuments({ status: "sold" }),
      Coupon.countDocuments({ createdAt: { $gte: todayStart, $lt: tomorrowStart } }),
      User.countDocuments({
        accountStatus: "active",
        lastLogin: { $gte: todayStart, $lt: tomorrowStart }
      }),
      Coupon.countDocuments({
        $or: [{ status: "expired" }, { expiryDate: { $lt: new Date() } }]
      }),
      Revenue.find({ createdAt: { $gte: last7Start } }).sort({ createdAt: 1 }),
      Transaction.aggregate([
        { $match: { escrowStatus: "holding" } },
        { $group: { _id: null, total: { $sum: "$sellerAmount" } } }
      ]),
      Transaction.aggregate([
        {
          $match: {
            transactionStatus: { $in: ["completed", "coupon_revealed"] }
          }
        },
        {
          $group: {
            _id: null,
            gross: { $sum: "$amount" },
            platformFee: { $sum: "$platformFee" }
          }
        }
      ]),
      Coupon.aggregate([{ $group: { _id: "$status", total: { $sum: 1 } } }]),
      Coupon.aggregate([
        { $match: { createdAt: { $gte: last7Start } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            listed: { $sum: 1 },
            sold: {
              $sum: {
                $cond: [{ $eq: ["$status", "sold"] }, 1, 0]
              }
            }
          }
        }
      ]),
      Transaction.aggregate([
        { $match: { createdAt: { $gte: last7Start } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            salesAmount: {
              $sum: {
                $cond: [
                  { $in: ["$transactionStatus", ["completed", "coupon_revealed"]] },
                  "$amount",
                  0
                ]
              }
            },
            orders: {
              $sum: {
                $cond: [
                  { $in: ["$transactionStatus", ["completed", "coupon_revealed"]] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]),
      User.aggregate([
        { $match: { lastLogin: { $gte: last7Start } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$lastLogin" } },
            activeUsers: { $sum: 1 }
          }
        }
      ])
    ]);

  const platformRevenue = revenueRows.reduce((sum, item) => sum + item.platformFee, 0);
  const couponStatusMap = couponStatusCounts.reduce((acc, item) => {
    acc[item._id || "unknown"] = item.total;
    return acc;
  }, {});
  const couponDayMap = dailyCouponActivity.reduce((acc, item) => {
    acc[item._id] = item;
    return acc;
  }, {});
  const transactionDayMap = dailyTransactionActivity.reduce((acc, item) => {
    acc[item._id] = item;
    return acc;
  }, {});
  const userDayMap = dailyUserActivity.reduce((acc, item) => {
    acc[item._id] = item;
    return acc;
  }, {});

  const trend = recentDays.map((day) => ({
    label: day.label,
    date: day.key,
    listedCoupons: couponDayMap[day.key]?.listed || 0,
    soldCoupons: couponDayMap[day.key]?.sold || 0,
    salesAmount: transactionDayMap[day.key]?.salesAmount || 0,
    orders: transactionDayMap[day.key]?.orders || 0,
    activeUsers: userDayMap[day.key]?.activeUsers || 0
  }));

  return sendResponse(res, 200, "Admin dashboard fetched", {
    metrics: {
      totalUsers,
      totalCoupons,
      totalListedCoupons: totalCoupons,
      activeCoupons,
      failedAiCoupons,
      suspiciousUsers,
      totalTransactions,
      soldCoupons,
      totalSalesAmount: completedSales[0]?.gross || 0,
      platformRevenue,
      pendingEscrow: pendingEscrow[0]?.total || 0,
      openDisputes,
      pendingWithdrawals,
      bannedUsers,
      dailyListedCoupons,
      dailyActiveUsers,
      expiredCoupons
    },
    charts: {
      revenue: revenueRows.map((item) => ({
        label: item.createdAt.toISOString().slice(0, 10),
        value: item.platformFee
      })),
      trend,
      couponStatus: [
        { name: "Available", value: couponStatusMap.available || 0 },
        { name: "Sold", value: couponStatusMap.sold || 0 },
        { name: "Expired", value: couponStatusMap.expired || 0 },
        { name: "AI Failed", value: couponStatusMap.ai_failed || 0 },
        { name: "Removed", value: couponStatusMap.removed || 0 }
      ]
    }
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  return sendResponse(res, 200, "Users fetched", { users });
});

const createUser = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  if (!email) {
    return sendResponse(res, 400, "Email is required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendResponse(res, 400, "User already exists");
  }

  const user = await User.create({
    name: String(req.body.name || "").trim() || email.split("@")[0],
    email,
    role: req.body.role === "super_admin" ? "super_admin" : "user",
    country: req.body.country || "India",
    currency: req.body.currency || "INR",
    isEmailVerified: true
  });

  return sendResponse(res, 201, "User created", { user });
});

const banUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return sendResponse(res, 404, "User not found");
  }

  const statusChanged = user.accountStatus !== "banned";
  user.accountStatus = "banned";
  user.bannedAt = new Date();
  await user.save();

  if (statusChanged) {
    await createAdminTrustHistoryEntry(user, "Account banned after admin review");
  }

  return sendResponse(res, 200, "User banned", { user });
});

const unbanUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return sendResponse(res, 404, "User not found");
  }

  const statusChanged = user.accountStatus !== "active";
  user.accountStatus = "active";
  user.bannedAt = null;
  await user.save();

  if (statusChanged) {
    await createAdminTrustHistoryEntry(user, "Account unbanned after admin review");
  }

  return sendResponse(res, 200, "User unbanned", { user });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return sendResponse(res, 404, "User not found");
  }

  await Promise.all([
    Coupon.updateMany(
      { $or: [{ sellerId: user._id }, { buyerId: user._id }] },
      { $set: { status: "removed" } }
    ),
    Transaction.deleteMany({ $or: [{ buyerId: user._id }, { sellerId: user._id }] }),
    Revenue.deleteMany({ $or: [{ buyerId: user._id }, { sellerId: user._id }] }),
    Dispute.deleteMany({ $or: [{ buyerId: user._id }, { sellerId: user._id }] }),
    Withdrawal.deleteMany({ userId: user._id }),
    FraudReport.deleteMany({ userId: user._id }),
    TrustHistory.deleteMany({ userId: user._id }),
    User.findByIdAndDelete(user._id)
  ]);

  return sendResponse(res, 200, "User deleted");
});

const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().populate("sellerId buyerId", "name email trustScore").sort({ createdAt: -1 });
  return sendResponse(res, 200, "Coupons fetched", { coupons });
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    return sendResponse(res, 404, "Coupon not found");
  }

  coupon.status = "removed";
  await coupon.save();
  await Revenue.deleteMany({ couponId: coupon._id });
  await Transaction.deleteMany({ couponId: coupon._id, paymentStatus: "created" });
  return sendResponse(res, 200, "Coupon removed", { coupon });
});

const getFailedCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({ status: "ai_failed" }).populate("sellerId", "name email").sort({ createdAt: -1 });
  return sendResponse(res, 200, "AI failed coupons fetched", { coupons });
});

const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find()
    .populate("buyerId sellerId couponId", "name email title")
    .sort({ createdAt: -1 });
  return sendResponse(res, 200, "Transactions fetched", { transactions });
});

const getPayments = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find()
    .populate("buyerId sellerId couponId", "name email title platformName")
    .sort({ createdAt: -1 });
  return sendResponse(res, 200, "Payments fetched", { payments: transactions });
});

const deletePayment = asyncHandler(async (req, res) => {
  const payment = await Transaction.findByIdAndDelete(req.params.id);
  if (!payment) {
    return sendResponse(res, 404, "Payment not found");
  }

  await Revenue.deleteMany({ transactionId: payment._id });

  return sendResponse(res, 200, "Payment deleted");
});

const getDisputes = asyncHandler(async (req, res) => {
  const disputes = await Dispute.find().populate("buyerId sellerId couponId", "name email title").sort({ createdAt: -1 });
  return sendResponse(res, 200, "Disputes fetched", { disputes });
});

const resolveDispute = asyncHandler(async (req, res) => {
  const dispute = await Dispute.findById(req.params.id);
  if (!dispute) {
    return sendResponse(res, 404, "Dispute not found");
  }

  const transaction = await Transaction.findById(dispute.transactionId);
  const coupon = await Coupon.findById(dispute.couponId);
  const { resolution, adminNote, deductTrustScore, markFake } = req.body;

  dispute.status = "resolved";
  dispute.resolution = resolution;
  dispute.adminNote = adminNote;
  await dispute.save();

  if (resolution === "refund_buyer") {
    await refundPayment({
      paymentId: transaction.gatewayPaymentId,
      amount: transaction.amount,
      notes: { disputeId: dispute._id.toString(), reason: "buyer_refund" }
    });
    transaction.paymentStatus = "refunded";
    transaction.escrowStatus = "refunded";
    transaction.transactionStatus = "refunded";
    await transaction.save();
    await reversePending(transaction.sellerId, transaction.sellerAmount, transaction.currency);
  }

  if (resolution === "release_seller") {
    await capturePayment({
      paymentId: transaction.gatewayPaymentId,
      amount: transaction.amount,
      currency: transaction.currency
    });
    transaction.paymentStatus = "captured";
    transaction.escrowStatus = "released";
    transaction.transactionStatus = "completed";
    transaction.releasedAt = new Date();
    await transaction.save();
    await releasePendingToAvailable(transaction.sellerId, transaction.sellerAmount, transaction.currency);
    await User.findByIdAndUpdate(transaction.buyerId, {
      $inc: { totalPurchases: transaction.amount }
    });
    await Revenue.create({
      transactionId: transaction._id,
      couponId: transaction.couponId,
      buyerId: transaction.buyerId,
      sellerId: transaction.sellerId,
      grossAmount: transaction.amount,
      platformFee: transaction.platformFee,
      sellerAmount: transaction.sellerAmount,
      currency: transaction.currency
    });
  }

  if (markFake) {
    coupon.status = "fake";
    await coupon.save();
    await applyTrustPenalty({
      userId: coupon.sellerId,
      penalty: 20,
      reason: "Fake coupon confirmed in dispute"
    });
  }

  if (deductTrustScore) {
    await applyTrustPenalty({
      userId: coupon.sellerId,
      penalty: Number(deductTrustScore),
      reason: adminNote || "Admin dispute resolution penalty"
    });
  }

  return sendResponse(res, 200, "Dispute resolved", { dispute, transaction, coupon });
});

const getWithdrawals = asyncHandler(async (req, res) => {
  const withdrawals = await Withdrawal.find().populate("userId", "name email").sort({ createdAt: -1 });
  return sendResponse(res, 200, "Withdrawals fetched", { withdrawals });
});

const getAdminNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ audience: "admin" }).sort({ createdAt: -1 }).limit(50);
  const unreadCount = notifications.filter((item) => !item.isRead).length;
  return sendResponse(res, 200, "Admin notifications fetched", { notifications, unreadCount });
});

const markAdminNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, audience: "admin" },
    { isRead: true },
    { new: true }
  );
  if (!notification) {
    return sendResponse(res, 404, "Notification not found");
  }
  return sendResponse(res, 200, "Notification marked as read", { notification });
});

const markAllAdminNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { audience: "admin", isRead: false },
    { $set: { isRead: true } }
  );

  return sendResponse(res, 200, "All admin notifications marked as read");
});

const approveWithdrawal = asyncHandler(async (req, res) => {
  const withdrawal = await Withdrawal.findByIdAndUpdate(
    req.params.id,
    { status: "approved", adminNote: req.body.adminNote },
    { new: true }
  );
  if (withdrawal) {
    await createNotification({
      userId: withdrawal.userId,
      type: "withdrawal_approved",
      title: "Withdrawal approved",
      message: `Your withdrawal request for ${withdrawal.amount} ${withdrawal.currency} was approved.`,
      link: "/withdraw",
      metadata: { withdrawalId: withdrawal._id }
    });
  }
  return sendResponse(res, 200, "Withdrawal approved", { withdrawal });
});

const rejectWithdrawal = asyncHandler(async (req, res) => {
  const withdrawal = await Withdrawal.findByIdAndUpdate(
    req.params.id,
    { status: "rejected", adminNote: req.body.adminNote },
    { new: true }
  );
  if (withdrawal) {
    await createNotification({
      userId: withdrawal.userId,
      type: "withdrawal_rejected",
      title: "Withdrawal rejected",
      message: `Your withdrawal request for ${withdrawal.amount} ${withdrawal.currency} was rejected.`,
      link: "/withdraw",
      metadata: { withdrawalId: withdrawal._id }
    });
  }
  return sendResponse(res, 200, "Withdrawal rejected", { withdrawal });
});

const deleteWithdrawal = asyncHandler(async (req, res) => {
  const withdrawal = await Withdrawal.findByIdAndDelete(req.params.id);
  if (!withdrawal) {
    return sendResponse(res, 404, "Withdrawal not found");
  }
  return sendResponse(res, 200, "Withdrawal deleted");
});

const getTrustHistory = asyncHandler(async (req, res) => {
  const history = await TrustHistory.find().populate("userId", "name email").sort({ createdAt: -1 });
  return sendResponse(res, 200, "Trust history fetched", { history });
});

const getFraudReports = asyncHandler(async (req, res) => {
  const reports = await FraudReport.find().populate("userId couponId", "name email title").sort({ createdAt: -1 });
  return sendResponse(res, 200, "Fraud reports fetched", { reports });
});

const getContactIssues = asyncHandler(async (req, res) => {
  const issues = await ContactIssue.find().populate("handledBy", "name email").sort({ createdAt: -1 });
  return sendResponse(res, 200, "Contact issues fetched", { issues });
});

const updateContactIssue = asyncHandler(async (req, res) => {
  const allowedStatuses = ["open", "under_review", "resolved", "closed"];
  const allowedPriorities = ["low", "medium", "high"];
  const updates = {};

  if (allowedStatuses.includes(req.body.status)) {
    updates.status = req.body.status;
  }

  if (allowedPriorities.includes(req.body.priority)) {
    updates.priority = req.body.priority;
  }

  if (req.body.adminNote !== undefined) {
    updates.adminNote = String(req.body.adminNote || "").trim();
  }

  if (updates.status && ["resolved", "closed"].includes(updates.status)) {
    updates.handledBy = req.user._id;
    updates.handledAt = new Date();
  }

  const issue = await ContactIssue.findByIdAndUpdate(req.params.id, updates, { new: true }).populate("handledBy", "name email");
  if (!issue) {
    return sendResponse(res, 404, "Contact issue not found");
  }

  return sendResponse(res, 200, "Contact issue updated", { issue });
});

const deleteContactIssue = asyncHandler(async (req, res) => {
  const issue = await ContactIssue.findByIdAndDelete(req.params.id);
  if (!issue) {
    return sendResponse(res, 404, "Contact issue not found");
  }

  return sendResponse(res, 200, "Contact issue deleted");
});

const getRevenue = asyncHandler(async (req, res) => {
  const revenue = await Revenue.find().sort({ createdAt: -1 });
  return sendResponse(res, 200, "Revenue fetched", { revenue });
});

const updateSettings = asyncHandler(async (req, res) => {
  const settings = await getSettings();
  ["commissionPercent", "minimumTrustScore", "aiMatchThreshold", "maxFreeListings", "withdrawalFee"].forEach((field) => {
    if (req.body[field] !== undefined) {
      settings[field] = req.body[field];
    }
  });
  await settings.save();
  return sendResponse(res, 200, "Settings updated", { settings });
});

module.exports = {
  getDashboard,
  getUsers,
  createUser,
  banUser,
  unbanUser,
  deleteUser,
  getCoupons,
  deleteCoupon,
  getFailedCoupons,
  getTransactions,
  getPayments,
  deletePayment,
  getDisputes,
  resolveDispute,
  getWithdrawals,
  getAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  approveWithdrawal,
  rejectWithdrawal,
  deleteWithdrawal,
  getTrustHistory,
  getFraudReports,
  getContactIssues,
  updateContactIssue,
  deleteContactIssue,
  getRevenue,
  updateSettings
};
