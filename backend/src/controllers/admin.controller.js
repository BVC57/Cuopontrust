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
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");
const { capturePayment, refundPayment } = require("../services/razorpay.service");
const { applyTrustPenalty } = require("../services/trustScore.service");
const { releasePendingToAvailable, reversePending } = require("../services/wallet.service");
const { createNotification } = require("../services/notification.service");

const getSettings = async () =>
  (await AdminSetting.findOne()) ||
  AdminSetting.create({
    commissionPercent: 10,
    minimumTrustScore: 60,
    aiMatchThreshold: 90,
    maxFreeListings: 10,
    withdrawalFee: 2
  });

const getDashboard = asyncHandler(async (req, res) => {
  const [totalUsers, totalCoupons, activeCoupons, failedAiCoupons, suspiciousUsers, totalTransactions, openDisputes, pendingWithdrawals, bannedUsers, revenueRows] =
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
      Revenue.find().sort({ createdAt: -1 }).limit(12)
    ]);

  const platformRevenue = revenueRows.reduce((sum, item) => sum + item.platformFee, 0);
  const pendingEscrow = await Transaction.aggregate([
    { $match: { escrowStatus: "holding" } },
    { $group: { _id: null, total: { $sum: "$sellerAmount" } } }
  ]);

  return sendResponse(res, 200, "Admin dashboard fetched", {
    metrics: {
      totalUsers,
      totalCoupons,
      activeCoupons,
      failedAiCoupons,
      suspiciousUsers,
      totalTransactions,
      platformRevenue,
      pendingEscrow: pendingEscrow[0]?.total || 0,
      openDisputes,
      pendingWithdrawals,
      bannedUsers
    },
    charts: {
      revenue: revenueRows.map((item) => ({
        label: item.createdAt.toISOString().slice(0, 10),
        value: item.platformFee
      }))
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
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { accountStatus: "banned", bannedAt: new Date() },
    { new: true }
  );
  return sendResponse(res, 200, "User banned", { user });
});

const unbanUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { accountStatus: "active" }, { new: true });
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
  approveWithdrawal,
  rejectWithdrawal,
  deleteWithdrawal,
  getTrustHistory,
  getFraudReports,
  getRevenue,
  updateSettings
};
