const Coupon = require("../models/Coupon");
const Transaction = require("../models/Transaction");
const Revenue = require("../models/Revenue");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");
const { createOrder, verifySignature, verifyWebhookSignature, capturePayment } = require("../services/razorpay.service");
const { creditPending, releasePendingToAvailable } = require("../services/wallet.service");
const { createNotification, createAdminNotification } = require("../services/notification.service");
const { revealCouponCodeForTransaction } = require("./coupon.controller");
const { sendEmail } = require("../services/email.service");

const getCommissionPercent = 10;
const buildRazorpayReceipt = (couponId) => `cp_${String(couponId).slice(-8)}_${Date.now().toString().slice(-10)}`;
const appendPaymentEvent = (transaction, { type, status, message, payload }) => {
  transaction.paymentEvents = transaction.paymentEvents || [];
  transaction.paymentEvents.push({
    type,
    status,
    message,
    payload,
    createdAt: new Date()
  });
};
const isBenignCaptureError = (error) => {
  const description = String(error?.error?.description || error?.description || error?.message || "").toLowerCase();
  return (
    description.includes("already captured") ||
    description.includes("already been captured") ||
    description.includes("cannot be captured") ||
    description.includes("status is captured")
  );
};

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

const deliverCouponEmailIfNeeded = async ({ buyerId, coupon, transaction }) => {
  if (!buyerId || !coupon || !transaction || transaction.couponEmailSentAt) {
    return transaction;
  }

  const buyer = await User.findById(buyerId).select("email");
  if (!buyer?.email) {
    return transaction;
  }

  await sendCouponDeliveryEmail({
    email: buyer.email,
    coupon,
    transaction
  });

  transaction.couponEmailSentAt = new Date();
  await transaction.save();
  return transaction;
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
    receipt: buildRazorpayReceipt(coupon._id),
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
    gatewayReference: order.receipt,
    gatewayPayload: {
      order
    }
  });
  appendPaymentEvent(transaction, {
    type: "order_created",
    status: "created",
    message: "Checkout order created.",
    payload: {
      orderId: order.id,
      receipt: order.receipt,
      amount: coupon.sellingPrice,
      currency: coupon.currency
    }
  });
  await transaction.save();

  await createAdminNotification({
    type: "coupon_purchase_started",
    title: "New purchase started",
    message: `${req.user.email} started checkout for ${coupon.title}.`,
    link: "/admin/payments",
    metadata: { transactionId: transaction._id, couponId: coupon._id }
  });

  return sendResponse(res, 201, "Razorpay order created", {
    transaction,
    order,
    razorpayKey: process.env.RAZORPAY_KEY_ID || "rzp_test_coupontrust"
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
    transaction.failedAt = new Date();
    appendPaymentEvent(transaction, {
      type: "verification_failed",
      status: "failed",
      message: "Razorpay signature verification failed.",
      payload: { razorpayOrderId, razorpayPaymentId }
    });
    await transaction.save();
    await createNotification({
      userId: transaction.buyerId,
      type: "payment_failed",
      title: "Payment failed",
      message: "Your payment verification failed. Please try again.",
      link: `/coupons/${transaction.couponId}`,
      metadata: { transactionId: transaction._id }
    });
    await createAdminNotification({
      type: "payment_failed",
      title: "Payment verification failed",
      message: `Payment verification failed for order ${transaction.gatewayOrderId}.`,
      link: "/admin/payments",
      metadata: { transactionId: transaction._id }
    });
    return sendResponse(res, 400, "Invalid Razorpay signature");
  }

  transaction.paymentStatus = "authorized";
  transaction.gatewayPaymentId = razorpayPaymentId;
  transaction.gatewaySignature = razorpaySignature;
  transaction.authorizedAt = new Date();
  transaction.gatewayPayload = {
    ...(transaction.gatewayPayload || {}),
    authorized: { razorpayOrderId, razorpayPaymentId, razorpaySignature }
  };
  appendPaymentEvent(transaction, {
    type: "payment_authorized",
    status: "authorized",
    message: "Payment authorized and moved to escrow.",
    payload: { razorpayOrderId, razorpayPaymentId }
  });
  await transaction.save();

  if (transaction.escrowStatus === "holding") {
    await creditPending(transaction.sellerId, transaction.sellerAmount, transaction.currency);
  }

  await createNotification({
    userId: transaction.sellerId,
    type: "payment_pending",
    title: "New payment in escrow",
    message: `${transaction.sellerAmount} ${transaction.currency} is now pending in escrow for your coupon sale.`,
    link: "/payments",
    metadata: { transactionId: transaction._id, escrowStatus: "holding" }
  });

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
    await deliverCouponEmailIfNeeded({
      buyerId: req.user._id,
      coupon: revealedCoupon,
      transaction
    });
    return sendResponse(res, 200, "Coupon already revealed", { transaction, revealedCoupon });
  }

  transaction.transactionStatus = "coupon_revealed";
  transaction.couponRevealedAt = new Date();
  await transaction.save();

  const coupon = await Coupon.findById(transaction.couponId._id);
  coupon.buyerId = req.user._id;
  await coupon.save();

  const revealedCoupon = await revealCouponCodeForTransaction(coupon._id);
  await createNotification({
    userId: req.user._id,
    type: "coupon_revealed",
    title: "Coupon code revealed",
    message: `Your ${coupon.platformName} coupon code is now available.`,
    link: "/orders",
    metadata: { couponId: coupon._id, transactionId: transaction._id }
  });
  await deliverCouponEmailIfNeeded({
    buyerId: req.user._id,
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
    try {
      await capturePayment({
        paymentId: transaction.gatewayPaymentId,
        amount: transaction.amount,
        currency: transaction.currency
      });
    } catch (error) {
      if (!isBenignCaptureError(error)) {
        throw error;
      }
    }
  }

  transaction.paymentStatus = "captured";
  if (!transaction.capturedAt) {
    transaction.capturedAt = new Date();
  }
  if (transaction.transactionStatus !== "completed") {
    transaction.escrowStatus = "released";
    transaction.transactionStatus = "completed";
    transaction.releasedAt = new Date();
    appendPaymentEvent(transaction, {
      type: "payment_captured",
      status: "captured",
      message: "Payment captured and seller payout released.",
      payload: {
        paymentId: transaction.gatewayPaymentId,
        amount: transaction.amount,
        currency: transaction.currency
      }
    });
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
      message: `Payment of ${transaction.sellerAmount} ${transaction.currency} has been released to your wallet.`,
      link: "/payments",
      metadata: { transactionId: transaction._id }
    });

    await createNotification({
      userId: transaction.buyerId,
      type: "payment_success",
      title: "Payment successful",
      message: `Your payment for ${coupon.title} was completed successfully.`,
      link: "/orders",
      metadata: { transactionId: transaction._id, couponId: coupon._id }
    });

    await createAdminNotification({
      type: "payment_success",
      title: "Payment captured successfully",
      message: `${coupon.title} purchase completed successfully.`,
      link: "/admin/payments",
      metadata: { transactionId: transaction._id, couponId: coupon._id }
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
    transaction.authorizedAt = transaction.authorizedAt || new Date();
    appendPaymentEvent(transaction, {
      type: "webhook_authorized",
      status: transaction.paymentStatus,
      message: "Webhook received for authorized payment.",
      payload: req.body?.payload || {}
    });
  } else if (event === "payment.captured") {
    transaction.paymentStatus = "captured";
    transaction.capturedAt = transaction.capturedAt || new Date();
    appendPaymentEvent(transaction, {
      type: "webhook_captured",
      status: "captured",
      message: "Webhook received for captured payment.",
      payload: req.body?.payload || {}
    });
  } else if (event === "payment.failed") {
    transaction.paymentStatus = "failed";
    transaction.transactionStatus = "cancelled";
    transaction.failedAt = new Date();
    appendPaymentEvent(transaction, {
      type: "webhook_failed",
      status: "failed",
      message: "Webhook received for failed payment.",
      payload: req.body?.payload || {}
    });
    await createNotification({
      userId: transaction.buyerId,
      type: "payment_failed",
      title: "Payment failed",
      message: "Your coupon payment failed. You can retry the checkout.",
      link: `/coupons/${transaction.couponId}`,
      metadata: { transactionId: transaction._id }
    });
    await createAdminNotification({
      type: "payment_failed",
      title: "Payment failed",
      message: `Payment failed for order ${transaction.gatewayOrderId}.`,
      link: "/admin/payments",
      metadata: { transactionId: transaction._id }
    });
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
