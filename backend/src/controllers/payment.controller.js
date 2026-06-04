const Coupon = require("../models/Coupon");
const Transaction = require("../models/Transaction");
const Revenue = require("../models/Revenue");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");
const { createOrder, verifySignature, verifyWebhookSignature, capturePayment } = require("../services/razorpay.service");
const { creditPending, releasePendingToAvailable } = require("../services/wallet.service");
const { createNotification } = require("../services/notification.service");
const { revealCouponCodeForTransaction } = require("./coupon.controller");
const { sendEmail } = require("../services/email.service");

const getCommissionPercent = 10;

const sendCouponDeliveryEmail = async ({ email, coupon, transaction }) => {
  if (!email || !coupon) {
    return;
  }

  const categoryLine = (coupon.categories || []).length ? `<p><strong>Categories:</strong> ${coupon.categories.join(", ")}</p>` : "";
  await sendEmail({
    to: email,
    subject: `Your CouponX coupon is ready: ${coupon.platformName}`,
    text: `Your payment is confirmed.\n\nTitle: ${coupon.title}\nPlatform: ${coupon.platformName}\nRedeem code: ${coupon.couponCode}\nExpiry: ${new Date(coupon.expiryDate).toLocaleDateString("en-IN")}\nTerms: ${coupon.terms || "No terms provided"}\nTransaction: ${transaction._id}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
        <h2>Your CouponX purchase is confirmed</h2>
        <p>Your coupon is now ready to use.</p>
        <p><strong>Title:</strong> ${coupon.title}</p>
        <p><strong>Platform:</strong> ${coupon.platformName}</p>
        ${categoryLine}
        <p><strong>Redeem code:</strong> ${coupon.couponCode}</p>
        <p><strong>Expiry:</strong> ${new Date(coupon.expiryDate).toLocaleDateString("en-IN")}</p>
        <p><strong>Terms:</strong> ${coupon.terms || "No terms provided"}</p>
        <p><strong>Transaction ID:</strong> ${transaction._id}</p>
      </div>
    `
  });
};

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

  if (["authorized", "captured"].includes(transaction.paymentStatus)) {
    return sendResponse(res, 200, "Payment already verified", { transaction });
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

  if (transaction.escrowStatus === "holding") {
    await creditPending(transaction.sellerId, transaction.sellerAmount, transaction.currency);
  }

  return sendResponse(res, 200, "Payment authorized", { transaction });
});

const revealCoupon = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.transactionId).populate("couponId");
  if (!transaction || String(transaction.buyerId) !== String(req.user._id)) {
    return sendResponse(res, 404, "Transaction not found");
  }

  if (transaction.paymentStatus !== "captured") {
    return sendResponse(res, 400, "Payment must be captured before coupon reveal");
  }

  if (transaction.couponRevealedAt) {
    const revealedCoupon = await revealCouponCodeForTransaction(transaction.couponId._id);
    return sendResponse(res, 200, "Coupon already revealed", { transaction, revealedCoupon });
  }

  transaction.transactionStatus = "coupon_revealed";
  transaction.couponRevealedAt = new Date();
  await transaction.save();

  const coupon = await Coupon.findById(transaction.couponId._id);
  coupon.buyerId = req.user._id;
  await coupon.save();

  const revealedCoupon = await revealCouponCodeForTransaction(coupon._id);
  const buyer = await User.findById(req.user._id);
  await sendCouponDeliveryEmail({
    email: buyer?.email,
    coupon: revealedCoupon,
    transaction
  });

  return sendResponse(res, 200, "Coupon revealed", { transaction, revealedCoupon });
});

const confirmWorked = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.transactionId).populate("couponId");
  if (!transaction || String(transaction.buyerId) !== String(req.user._id)) {
    return sendResponse(res, 404, "Transaction not found");
  }

  if (transaction.paymentStatus === "captured" && transaction.transactionStatus === "completed") {
    return sendResponse(res, 200, "Payment already captured and completed", { transaction });
  }

  if (transaction.paymentStatus !== "captured") {
    await capturePayment({
      paymentId: transaction.gatewayPaymentId,
      amount: transaction.amount,
      currency: transaction.currency
    });
  }

  transaction.paymentStatus = "captured";
  if (transaction.transactionStatus !== "completed") {
    transaction.escrowStatus = "released";
    transaction.transactionStatus = "completed";
    transaction.releasedAt = new Date();
    await transaction.save();

    const coupon = await Coupon.findById(transaction.couponId._id);
    coupon.status = "sold";
    coupon.buyerId = req.user._id;
    await coupon.save();

    await releasePendingToAvailable(transaction.sellerId, transaction.sellerAmount, transaction.currency);

    const revenueExists = await Revenue.findOne({ transactionId: transaction._id });
    if (!revenueExists) {
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
    }

    await createNotification({
      userId: transaction.sellerId,
      type: "payment_released",
      title: "Coupon sale completed",
      message: `Payment of ${transaction.sellerAmount} ${transaction.currency} has been released to your wallet.`
    });

    await User.findByIdAndUpdate(transaction.buyerId, {
      $inc: { totalPurchases: transaction.amount }
    });
  } else {
    await transaction.save();
  }

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

const webhookHandler = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const rawBody = req.rawBody || JSON.stringify(req.body || {});

  if (!verifyWebhookSignature({ payload: rawBody, signature })) {
    return sendResponse(res, 400, "Invalid webhook signature");
  }

  const event = req.body?.event;
  const paymentEntity = req.body?.payload?.payment?.entity;
  const orderEntity = req.body?.payload?.order?.entity;
  const orderId = paymentEntity?.order_id || orderEntity?.id;
  const paymentId = paymentEntity?.id;

  if (!orderId) {
    return sendResponse(res, 200, "Webhook ignored");
  }

  const transaction = await Transaction.findOne({ gatewayOrderId: orderId });
  if (!transaction) {
    return sendResponse(res, 200, "Transaction not found for webhook");
  }

  if (paymentId) {
    transaction.gatewayPaymentId = paymentId;
  }

  if (event === "payment.authorized") {
    transaction.paymentStatus = transaction.paymentStatus === "captured" ? "captured" : "authorized";
  } else if (event === "payment.captured") {
    transaction.paymentStatus = "captured";
  } else if (event === "payment.failed") {
    transaction.paymentStatus = "failed";
    transaction.transactionStatus = "cancelled";
  }

  await transaction.save();

  return sendResponse(res, 200, "Webhook received", { ok: true });
});

module.exports = {
  createOrderController,
  verifyAuthorized,
  revealCoupon,
  confirmWorked,
  reportNotWorking,
  webhookHandler
};
