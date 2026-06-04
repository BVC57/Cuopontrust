const Coupon = require("../models/Coupon");
const Transaction = require("../models/Transaction");
const Revenue = require("../models/Revenue");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");
const { createOrder, verifySignature, capturePayment } = require("../services/razorpay.service");
const { creditPending, releasePendingToAvailable } = require("../services/wallet.service");
const { createNotification } = require("../services/notification.service");
const { revealCouponCodeForTransaction } = require("./coupon.controller");

const getCommissionPercent = 10;

const createOrderController = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.body.couponId).populate("sellerId");
  if (!coupon || coupon.status !== "available") {
    return sendResponse(res, 404, "Coupon is not available");
  }

  if (String(coupon.sellerId._id) === String(req.user._id)) {
    return sendResponse(res, 400, "You cannot buy your own coupon");
  }

  const platformFee = Number(((coupon.sellingPrice * getCommissionPercent) / 100).toFixed(2));
  const sellerAmount = Number((coupon.sellingPrice - platformFee).toFixed(2));

  const order = await createOrder({
    amount: coupon.sellingPrice,
    currency: coupon.currency,
    receipt: `coupon_${coupon._id}_${Date.now()}`,
    notes: {
      couponId: coupon._id.toString(),
      buyerId: req.user._id.toString(),
      sellerId: coupon.sellerId._id.toString()
    }
  });

  const transaction = await Transaction.create({
    buyerId: req.user._id,
    sellerId: coupon.sellerId._id,
    couponId: coupon._id,
    amount: coupon.sellingPrice,
    platformFee,
    sellerAmount,
    currency: coupon.currency,
    gatewayOrderId: order.id,
    gatewayReference: order.receipt
  });

  return sendResponse(res, 201, "Razorpay order created", {
    transaction,
    order,
    razorpayKey: process.env.RAZORPAY_KEY_ID || ""
  });
});

const verifyAuthorized = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.body.transactionId);
  if (!transaction) {
    return sendResponse(res, 404, "Transaction not found");
  }

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return sendResponse(res, 400, "Razorpay verification payload is required");
  }

  if (transaction.gatewayOrderId !== razorpayOrderId) {
    return sendResponse(res, 400, "Order mismatch");
  }

  const isValid = verifySignature({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature
  });

  if (!isValid) {
    transaction.paymentStatus = "failed";
    await transaction.save();
    return sendResponse(res, 400, "Invalid Razorpay signature");
  }

  transaction.paymentStatus = "authorized";
  transaction.gatewayPaymentId = razorpayPaymentId;
  transaction.gatewaySignature = razorpaySignature;
  await transaction.save();

  await creditPending(transaction.sellerId, transaction.sellerAmount, transaction.currency);

  return sendResponse(res, 200, "Payment authorized", { transaction });
});

const revealCoupon = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.transactionId).populate("couponId");
  if (!transaction || String(transaction.buyerId) !== String(req.user._id)) {
    return sendResponse(res, 404, "Transaction not found");
  }

  if (transaction.paymentStatus !== "authorized") {
    return sendResponse(res, 400, "Payment not authorized");
  }

  transaction.transactionStatus = "coupon_revealed";
  transaction.couponRevealedAt = new Date();
  await transaction.save();

  const coupon = await Coupon.findById(transaction.couponId._id);
  coupon.buyerId = req.user._id;
  await coupon.save();

  const revealedCoupon = await revealCouponCodeForTransaction(coupon._id);
  return sendResponse(res, 200, "Coupon revealed", { transaction, revealedCoupon });
});

const confirmWorked = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.transactionId).populate("couponId");
  if (!transaction || String(transaction.buyerId) !== String(req.user._id)) {
    return sendResponse(res, 404, "Transaction not found");
  }

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

  const coupon = await Coupon.findById(transaction.couponId._id);
  coupon.status = "sold";
  await coupon.save();

  await releasePendingToAvailable(transaction.sellerId, transaction.sellerAmount, transaction.currency);

  await Revenue.create({
    transactionId: transaction._id,
    couponId: transaction.couponId._id,
    buyerId: transaction.buyerId,
    sellerId: transaction.sellerId,
    grossAmount: transaction.amount,
    platformFee: transaction.platformFee,
    sellerAmount: transaction.sellerAmount,
    currency: transaction.currency
  });

  await createNotification({
    userId: transaction.sellerId,
    type: "payment_released",
    title: "Coupon sale completed",
    message: `Payment of ${transaction.sellerAmount} ${transaction.currency} has been released to your wallet.`
  });

  await User.findByIdAndUpdate(transaction.buyerId, {
    $inc: { totalPurchases: transaction.amount }
  });

  return sendResponse(res, 200, "Payment captured and sale completed", { transaction });
});

const reportNotWorking = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.transactionId);
  if (!transaction || String(transaction.buyerId) !== String(req.user._id)) {
    return sendResponse(res, 404, "Transaction not found");
  }

  transaction.escrowStatus = "disputed";
  transaction.transactionStatus = "disputed";
  await transaction.save();

  return sendResponse(res, 200, "Transaction marked as disputed", { transaction });
});

const webhookHandler = asyncHandler(async (req, res) => sendResponse(res, 200, "Webhook received"));

module.exports = {
  createOrderController,
  verifyAuthorized,
  revealCoupon,
  confirmWorked,
  reportNotWorking,
  webhookHandler
};
