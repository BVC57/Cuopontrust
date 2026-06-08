const Wallet = require("../models/Wallet");
const Withdrawal = require("../models/Withdrawal");
const Transaction = require("../models/Transaction");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");
const { ensureWallet, debitAvailable } = require("../services/wallet.service");
const { createNotification, createAdminNotification } = require("../services/notification.service");

const getWallet = asyncHandler(async (req, res) => {
  const wallet = await ensureWallet(req.user._id, req.user.currency);
  return sendResponse(res, 200, "Wallet fetched", { wallet });
});

const requestWithdrawal = asyncHandler(async (req, res) => {
  const wallet = await ensureWallet(req.user._id, req.user.currency);
  const amount = Number(req.body.amount);

  if (!amount || amount <= 0) {
    return sendResponse(res, 400, "Valid amount is required");
  }

  await debitAvailable(req.user._id, amount, req.user.currency);

  const withdrawal = await Withdrawal.create({
    userId: req.user._id,
    amount,
    currency: req.user.currency,
    bankDetails: req.body.bankDetails,
    upiId: req.body.upiId
  });

  await createNotification({
    userId: req.user._id,
    type: "withdrawal_requested",
    title: "Withdrawal requested",
    message: `Your withdrawal request for ${amount} ${req.user.currency} is pending review.`,
    link: "/withdraw",
    metadata: { withdrawalId: withdrawal._id }
  });

  await createAdminNotification({
    type: "withdrawal_requested",
    title: "New withdrawal request",
    message: `${req.user.email} requested ${amount} ${req.user.currency} withdrawal.`,
    link: "/admin/withdrawals",
    metadata: { withdrawalId: withdrawal._id, userId: req.user._id }
  });

  return sendResponse(res, 201, "Withdrawal request created", { withdrawal, wallet });
});

const getWalletHistory = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({
    $or: [{ buyerId: req.user._id }, { sellerId: req.user._id }]
  })
    .populate("couponId", "title platformName categories")
    .populate("buyerId", "name email")
    .populate("sellerId", "name email")
    .sort({ createdAt: -1 });
  const withdrawals = await Withdrawal.find({ userId: req.user._id }).sort({ createdAt: -1 });
  return sendResponse(res, 200, "Wallet history fetched", { transactions, withdrawals });
});

module.exports = {
  getWallet,
  requestWithdrawal,
  getWalletHistory
};
