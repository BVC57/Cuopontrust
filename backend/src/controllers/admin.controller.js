const User = require("../models/User");
const Coupon = require("../models/Coupon");
const Transaction = require("../models/Transaction");
const Dispute = require("../models/Dispute");
const Withdrawal = require("../models/Withdrawal");
const FraudReport = require("../models/FraudReport");
const TrustHistory = require("../models/TrustHistory");
const Revenue = require("../models/Revenue");
const AdminSetting = require("../models/AdminSetting");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");
const { capturePayment, refundPayment } = require("../services/razorpay.service");
const { applyTrustPenalty } = require("../services/trustScore.service");
const { releasePendingToAvailable, reversePending } = require("../services/wallet.service");

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

const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().populate("sellerId buyerId", "name email trustScore").sort({ createdAt: -1 });
  return sendResponse(res, 200, "Coupons fetched", { coupons });
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
  const transactions = await Transaction.find().sort({ createdAt: -1 });
  return sendResponse(res, 200, "Payments fetched", { payments: transactions });
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

const approveWithdrawal = asyncHandler(async (req, res) => {
  const withdrawal = await Withdrawal.findByIdAndUpdate(
    req.params.id,
    { status: "approved", adminNote: req.body.adminNote },
    { new: true }
  );
  return sendResponse(res, 200, "Withdrawal approved", { withdrawal });
});

const rejectWithdrawal = asyncHandler(async (req, res) => {
  const withdrawal = await Withdrawal.findByIdAndUpdate(
    req.params.id,
    { status: "rejected", adminNote: req.body.adminNote },
    { new: true }
  );
  return sendResponse(res, 200, "Withdrawal rejected", { withdrawal });
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
  banUser,
  unbanUser,
  getCoupons,
  getFailedCoupons,
  getTransactions,
  getPayments,
  getDisputes,
  resolveDispute,
  getWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  getTrustHistory,
  getFraudReports,
  getRevenue,
  updateSettings
};
