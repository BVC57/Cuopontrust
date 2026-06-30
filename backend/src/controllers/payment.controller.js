const Coupon = require("../models/Coupon");
const Transaction = require("../models/Transaction");
const Revenue = require("../models/Revenue");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");
const { createOrder, verifySignature, verifyWebhookSignature, capturePayment } = require("../services/razorpay.service");
const { creditPending, releasePendingToAvailable } = require("../services/wallet.service");
const { createNotification, createAdminNotification } = require("../services/notification.service");
const { applyTrustPenalty } = require("../services/trustScore.service");
const { revealCouponCodeForTransaction } = require("./coupon.controller");
const { sendEmail } = require("../services/email.service");
const { debitRewardWallet, processRewardEvent, refundRewardWallet } = require("../services/reward.service");

const getCommissionPercent = 10;
const NON_WORKING_REPORT_THRESHOLD = 3;
const NON_WORKING_TRUST_PENALTY = 10;
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

const formatEmailDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A";

const formatEmailAmount = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildCouponPurchaseEmailTemplate = ({ buyer, coupon, transaction }) => {
  const values = {
    buyerName: buyer?.name || buyer?.email?.split("@")[0] || "Customer",
    brandName: coupon.platformName || "CouponX Partner",
    offerTitle: coupon.title || "Coupon offer",
    couponValue: formatEmailAmount(coupon.couponAmount),
    purchaseAmount: formatEmailAmount(transaction.amount || coupon.sellingPrice),
    orderId: transaction.gatewayOrderId || transaction.gatewayReference || transaction._id,
    purchaseDate: formatEmailDate(transaction.capturedAt || transaction.updatedAt || transaction.createdAt),
    couponCode: coupon.couponCode || "N/A",
    expiryDate: formatEmailDate(coupon.expiryDate)
  };

  const text = `Hello ${values.buyerName},

Great news! Your coupon purchase has been completed successfully.

Purchase Details
Store: ${values.brandName}
Offer: ${values.offerTitle}
Coupon Value: Rs ${values.couponValue}
Purchase Price: Rs ${values.purchaseAmount}
Order ID: ${values.orderId}
Purchase Date: ${values.purchaseDate}

Your Coupon Code
${values.couponCode}

Valid Until: ${values.expiryDate}

How to Redeem
1. Visit the merchant website.
2. Add eligible products to your cart.
3. Proceed to checkout.
4. Apply the coupon code above.
5. Complete your purchase and enjoy your savings.

Important Notes:
- Coupon codes are visible only after successful payment.
- Please verify offer terms before use.
- Some coupons may have minimum order requirements.
- Coupons cannot be refunded after successful redemption.

Thank you for shopping with CouponX.
`;

  const safe = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, escapeHtml(value)]));
  const html = `<!DOCTYPE html>
<html>
  <body style="margin:0;background:#f4f7fb;padding:24px;font-family:Arial,sans-serif;">
    <div style="max-width:680px;margin:0 auto;border:1px solid #dbe7ef;border-radius:24px;background:#ffffff;overflow:hidden;">
      <div style="padding:28px 30px;border-bottom:1px solid #e5edf3;background:#f8fffb;">
        <p style="margin:0 0 8px;color:#16a34a;font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase">CouponX</p>
        <p style="margin:0;font-size:26px;line-height:34px;font-weight:800;color:#020617">Coupon Purchased Successfully</p>
        <p style="margin:14px 0 0;font-size:15px;line-height:24px;color:#475569">Hello ${safe.buyerName}, your coupon purchase has been completed successfully.</p>
      </div>
      <div style="padding:26px 30px;">
        <p><strong>Store:</strong> ${safe.brandName}</p>
        <p><strong>Offer:</strong> ${safe.offerTitle}</p>
        <p><strong>Coupon Value:</strong> Rs ${safe.couponValue}</p>
        <p><strong>Purchase Price:</strong> Rs ${safe.purchaseAmount}</p>
        <p><strong>Order ID:</strong> ${safe.orderId}</p>
      </div>
      <div style="margin:0 30px 24px;padding:22px;border:1px dashed #16a34a;border-radius:18px;background:#f0fdf4;text-align:center;">
        <p style="margin:0 0 10px;font-size:13px;font-weight:800;color:#15803d;text-transform:uppercase;letter-spacing:.08em">Your Coupon Code</p>
        <div style="display:inline-block;padding:12px 18px;border-radius:14px;background:#ffffff;color:#020617;font-size:24px;line-height:32px;font-weight:900;letter-spacing:.08em;word-break:break-all;box-sizing:border-box">${safe.couponCode}</div>
        <p style="margin:12px 0 0;color:#475569;font-size:14px;line-height:22px">Valid Until: <strong>${safe.expiryDate}</strong></p>
      </div>
    </div>
  </body>
</html>`;

  return { subject: "Coupon Purchased Successfully", text, html };
};

const sendCouponDeliveryEmail = async ({ email, buyer, coupon, transaction }) => {
  if (!email || !coupon) return;
  const template = buildCouponPurchaseEmailTemplate({ buyer, coupon, transaction });
  await sendEmail({ to: email, subject: template.subject, text: template.text, html: template.html });
};

const deliverCouponEmailIfNeeded = async ({ buyerId, coupon, transaction }) => {
  if (!buyerId || !coupon || !transaction || transaction.couponEmailSentAt) return transaction;
  const buyer = await User.findById(buyerId).select("name email");
  if (!buyer?.email) return transaction;

  await sendCouponDeliveryEmail({ email: buyer.email, buyer, coupon, transaction });
  transaction.couponEmailSentAt = new Date();
  await transaction.save();
  return transaction;
};

const refundWalletUsageIfNeeded = async (transaction) => {
  if (!transaction?.walletUsedAmount || transaction.walletRefundedAt) {
    return;
  }

  await refundRewardWallet({
    userId: transaction.buyerId,
    amount: transaction.walletUsedAmount,
    source: "checkout_refund",
    referenceId: transaction._id,
    description: "Refunded CouponX wallet usage after payment failure",
    metadata: { transactionId: transaction._id }
  });

  transaction.walletRefundedAt = new Date();
  await transaction.save();
};

const createOrderController = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.body.couponId).populate("sellerId");
  if (!coupon || coupon.status !== "available") {
    return sendResponse(res, 404, "Coupon is not available");
  }

  if (String(coupon.sellerId._id) === String(req.user._id)) {
    return sendResponse(res, 400, "You cannot buy your own coupon");
  }

  const walletRequested = req.body.useRewardWallet ? Number(req.body.walletAmount || coupon.sellingPrice) : 0;
  const maxWalletUsable = Math.min(Number(req.user.rewardWalletBalance || 0), Number(coupon.sellingPrice || 0));
  const walletUsedAmount = Math.max(0, Math.min(walletRequested, maxWalletUsable));
  const onlinePaidAmount = Number((Number(coupon.sellingPrice || 0) - walletUsedAmount).toFixed(2));
  const platformFee = Number(((coupon.sellingPrice * getCommissionPercent) / 100).toFixed(2));
  const sellerAmount = Number((coupon.sellingPrice - platformFee).toFixed(2));

  let walletTransaction = null;
  if (walletUsedAmount > 0) {
    const walletResult = await debitRewardWallet({
      userId: req.user._id,
      amount: walletUsedAmount,
      source: "coupon_checkout",
      referenceId: `${coupon._id}-${Date.now()}`,
      description: `Applied CouponX wallet to ${coupon.title}`,
      metadata: { couponId: coupon._id }
    });
    walletTransaction = walletResult.walletTransaction;
  }

  if (onlinePaidAmount <= 0) {
    const transaction = await Transaction.create({
      buyerId: req.user._id,
      sellerId: coupon.sellerId._id,
      couponId: coupon._id,
      amount: coupon.sellingPrice,
      platformFee,
      sellerAmount,
      currency: coupon.currency,
      walletUsedAmount,
      onlinePaidAmount: 0,
      paymentGateway: "internal_wallet",
      paymentStatus: "captured",
      capturedAt: new Date(),
      gatewayReference: `wallet_${Date.now()}`
    });

    appendPaymentEvent(transaction, {
      type: "wallet_checkout_captured",
      status: "captured",
      message: "Coupon purchased fully with CouponX wallet.",
      payload: { walletUsedAmount }
    });
    await transaction.save();
    await creditPending(transaction.sellerId, transaction.sellerAmount, transaction.currency);

    return sendResponse(res, 201, "Wallet-only checkout created", {
      transaction,
      paymentRequired: false,
      walletUsedAmount,
      walletTransaction
    });
  }

  const order = await createOrder({
    amount: onlinePaidAmount,
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
    walletUsedAmount,
    onlinePaidAmount,
    gatewayOrderId: order.id,
    gatewayReference: order.receipt,
    gatewayPayload: { order }
  });

  appendPaymentEvent(transaction, {
    type: "order_created",
    status: "created",
    message: "Checkout order created.",
    payload: { orderId: order.id, receipt: order.receipt, amount: onlinePaidAmount, currency: coupon.currency, walletUsedAmount }
  });
  await transaction.save();

  return sendResponse(res, 201, "Razorpay order created", {
    transaction,
    order,
    paymentRequired: true,
    walletUsedAmount,
    walletTransaction,
    razorpayKey: process.env.RAZORPAY_KEY_ID || "rzp_test_coupontrust"
  });
});

const verifyAuthorized = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.body.transactionId);
  if (!transaction) return sendResponse(res, 404, "Transaction not found");
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

  const isValid = verifySignature({ orderId: razorpayOrderId, paymentId: razorpayPaymentId, signature: razorpaySignature });
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
    await refundWalletUsageIfNeeded(transaction);
    await createNotification({
      userId: transaction.buyerId,
      type: "payment_failed",
      title: "Payment failed",
      message: "Your payment verification failed. Please try again.",
      link: "/coupons/" + transaction.couponId,
      metadata: { transactionId: transaction._id }
    });
    await createAdminNotification({
      type: "payment_failed",
      title: "Payment verification failed",
      message: "Payment verification failed for order " + transaction.gatewayOrderId + ".",
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
    message: transaction.sellerAmount + " " + transaction.currency + " is now pending in escrow for your coupon sale.",
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

  if (!["authorized", "captured"].includes(transaction.paymentStatus)) {
    return sendResponse(res, 400, "Payment must be authorized before coupon reveal");
  }

  if (transaction.couponRevealedAt) {
    const revealedCoupon = await revealCouponCodeForTransaction(transaction.couponId._id);
    await deliverCouponEmailIfNeeded({ buyerId: req.user._id, coupon: revealedCoupon, transaction });
    return sendResponse(res, 200, "Coupon already revealed", { transaction, revealedCoupon });
  }

  transaction.transactionStatus = "coupon_revealed";
  transaction.couponRevealedAt = new Date();
  await transaction.save();

  const coupon = await Coupon.findById(transaction.couponId._id);
  coupon.buyerId = req.user._id;
  coupon.status = "sold";
  await coupon.save();

  const revealedCoupon = await revealCouponCodeForTransaction(coupon._id);
  await createNotification({
    userId: req.user._id,
    type: "coupon_revealed",
    title: "Coupon code revealed",
    message: "Your " + coupon.platformName + " coupon code is now available. Please confirm whether it worked after trying it.",
    link: "/orders",
    metadata: { couponId: coupon._id, transactionId: transaction._id }
  });
  await deliverCouponEmailIfNeeded({ buyerId: req.user._id, coupon: revealedCoupon, transaction });

  return sendResponse(res, 200, "Coupon revealed", { transaction, revealedCoupon });
});

const confirmWorked = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.transactionId).populate("couponId");
  if (!transaction || String(transaction.buyerId) !== String(req.user._id)) {
    return sendResponse(res, 404, "Transaction not found");
  }
  if (transaction.buyerFeedbackStatus === "not_working") {
    return sendResponse(res, 400, "This coupon has already been reported as not working", { transaction });
  }

  if (transaction.paymentStatus !== "captured" && transaction.paymentGateway !== "internal_wallet") {
    try {
      await capturePayment({ paymentId: transaction.gatewayPaymentId, amount: transaction.onlinePaidAmount || transaction.amount, currency: transaction.currency });
    } catch (error) {
      if (!isBenignCaptureError(error)) throw error;
    }
  }

  transaction.paymentStatus = "captured";
  transaction.buyerFeedbackStatus = "worked";
  transaction.buyerFeedbackAt = new Date();
  transaction.buyerFeedbackNote = String(req.body?.feedbackNote || "").trim();
  transaction.capturedAt = transaction.capturedAt || new Date();

  if (transaction.transactionStatus !== "completed") {
    transaction.escrowStatus = "released";
    transaction.transactionStatus = "completed";
    transaction.releasedAt = new Date();
    appendPaymentEvent(transaction, {
      type: "payment_captured",
      status: "captured",
      message: "Buyer confirmed the coupon worked. Payment captured and seller payout released.",
      payload: { paymentId: transaction.gatewayPaymentId, amount: transaction.amount, currency: transaction.currency }
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
      message: "Buyer confirmed the coupon worked. Payment of " + transaction.sellerAmount + " " + transaction.currency + " has been released to your wallet.",
      link: "/payments",
      metadata: { transactionId: transaction._id }
    });

    await createNotification({
      userId: transaction.buyerId,
      type: "payment_success",
      title: "Coupon confirmed working",
      message: "Thanks for confirming " + coupon.title + " worked successfully.",
      link: "/orders",
      metadata: { transactionId: transaction._id, couponId: coupon._id }
    });

    await createAdminNotification({
      type: "payment_success",
      title: "Coupon confirmed working",
      message: coupon.title + " was marked as working by the buyer.",
      link: "/admin/payments",
      metadata: { transactionId: transaction._id, couponId: coupon._id }
    });

    await User.findByIdAndUpdate(transaction.buyerId, { $inc: { totalPurchases: transaction.amount } });
    await User.findByIdAndUpdate(transaction.sellerId, { $inc: { totalSales: transaction.sellerAmount, successfulCouponFeedbackCount: 1 } });
    await processRewardEvent({ userId: transaction.buyerId, event: "COUPON_PURCHASED", referenceId: transaction._id, description: "Coupon purchase reward" });
    await processRewardEvent({ userId: transaction.sellerId, event: "COUPON_SOLD", referenceId: transaction._id, description: "Coupon sold reward" });
  } else {
    await transaction.save();
  }

  return sendResponse(res, 200, "Coupon marked as working and seller payout released", { transaction });
});

const reportNotWorking = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.transactionId).populate("couponId");
  if (!transaction || String(transaction.buyerId) !== String(req.user._id)) {
    return sendResponse(res, 404, "Transaction not found");
  }
  if (transaction.buyerFeedbackStatus === "worked") {
    return sendResponse(res, 400, "This coupon has already been confirmed as working", { transaction });
  }

  if (transaction.buyerFeedbackStatus !== "not_working") {
    transaction.buyerFeedbackStatus = "not_working";
    transaction.buyerFeedbackAt = new Date();
    transaction.buyerFeedbackNote = String(req.body?.feedbackNote || "").trim();
    transaction.escrowStatus = "disputed";
    transaction.transactionStatus = "disputed";
    appendPaymentEvent(transaction, {
      type: "buyer_reported_not_working",
      status: "disputed",
      message: "Buyer reported that the coupon did not work.",
      payload: { note: transaction.buyerFeedbackNote }
    });
    await transaction.save();

    const seller = await User.findByIdAndUpdate(
      transaction.sellerId,
      { $inc: { nonWorkingCouponReportCount: 1, disputeCount: 1 } },
      { new: true }
    );

    if (
      seller &&
      seller.nonWorkingCouponReportCount >= NON_WORKING_REPORT_THRESHOLD &&
      seller.nonWorkingCouponReportCount % NON_WORKING_REPORT_THRESHOLD === 0 &&
      !transaction.sellerTrustPenaltyApplied
    ) {
      await applyTrustPenalty({
        userId: seller._id,
        penalty: NON_WORKING_TRUST_PENALTY,
        reason: seller.nonWorkingCouponReportCount + " buyer reports for non-working coupons",
        email: seller.email
      });
      transaction.sellerTrustPenaltyApplied = true;
      await transaction.save();
    }

    const couponTitle = transaction.couponId?.title || "Coupon";
    await createNotification({
      userId: transaction.sellerId,
      type: "coupon_reported_not_working",
      title: "Coupon reported as not working",
      message: "A buyer reported that " + couponTitle + " did not work. Multiple reports can reduce your trust score.",
      link: "/payments",
      metadata: { transactionId: transaction._id, couponId: transaction.couponId?._id }
    });

    await createNotification({
      userId: transaction.buyerId,
      type: "coupon_reported_not_working",
      title: "Issue reported successfully",
      message: "Your feedback for " + couponTitle + " has been saved. Seller review and trust checks are now pending.",
      link: "/orders",
      metadata: { transactionId: transaction._id, couponId: transaction.couponId?._id }
    });

    await createAdminNotification({
      type: "coupon_reported_not_working",
      title: "Coupon reported not working",
      message: couponTitle + " was reported as not working by a buyer.",
      link: "/admin/disputes",
      metadata: { transactionId: transaction._id, couponId: transaction.couponId?._id, sellerId: transaction.sellerId }
    });
  }

  return sendResponse(res, 200, "Transaction marked as not working", { transaction });
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

  if (!orderId) return sendResponse(res, 200, "Webhook ignored");

  const transaction = await Transaction.findOne({ gatewayOrderId: orderId });
  if (!transaction) return sendResponse(res, 200, "Transaction not found for webhook");

  if (paymentId) transaction.gatewayPaymentId = paymentId;

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
      link: "/coupons/" + transaction.couponId,
      metadata: { transactionId: transaction._id }
    });
    await createAdminNotification({
      type: "payment_failed",
      title: "Payment failed",
      message: "Payment failed for order " + transaction.gatewayOrderId + ".",
      link: "/admin/payments",
      metadata: { transactionId: transaction._id }
    });
    await refundWalletUsageIfNeeded(transaction);
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
