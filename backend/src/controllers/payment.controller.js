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
    .replace(/"/g, "&quot;")
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

━━━━━━━━━━━━━━━━━━━━━━
Purchase Details
━━━━━━━━━━━━━━━━━━━━━━

Store: ${values.brandName}
Offer: ${values.offerTitle}
Coupon Value: ₹${values.couponValue}
Purchase Price: ₹${values.purchaseAmount}
Order ID: ${values.orderId}
Purchase Date: ${values.purchaseDate}

━━━━━━━━━━━━━━━━━━━━━━
Your Coupon Code
━━━━━━━━━━━━━━━━━━━━━━

${values.couponCode}

Valid Until: ${values.expiryDate}

━━━━━━━━━━━━━━━━━━━━━━
How to Redeem
━━━━━━━━━━━━━━━━━━━━━━

1. Visit the merchant website.
2. Add eligible products to your cart.
3. Proceed to checkout.
4. Apply the coupon code above.
5. Complete your purchase and enjoy your savings.

Important Notes:
• Coupon codes are visible only after successful payment.
• Please verify offer terms before use.
• Some coupons may have minimum order requirements.
• Coupons cannot be refunded after successful redemption.

Thank you for shopping with CouponX.

We appreciate your trust in our marketplace and look forward to helping you save more.

Best Regards,
CouponX Team

Secure Marketplace for Verified Coupons
support@couponx.com`;

  const safe = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, escapeHtml(value)]));

  const html = `
    <div style="margin:0;background:#f4f7fb;padding:28px 12px;font-family:Arial,sans-serif;color:#0f172a;line-height:1.6">
      <div style="max-width:680px;margin:0 auto;border:1px solid #dbe7ef;border-radius:24px;background:#ffffff;overflow:hidden;box-shadow:0 18px 44px rgba(15,23,42,0.08)">
        <div style="padding:28px 30px;border-bottom:1px solid #e5edf3;background:#f8fffb">
          <p style="margin:0 0 8px;color:#16a34a;font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase">CouponX</p>
          <h1 style="margin:0;font-size:26px;line-height:1.25;color:#020617">Coupon Purchased Successfully 🎉</h1>
          <p style="margin:14px 0 0;font-size:15px;color:#475569">Hello ${safe.buyerName}, great news! Your coupon purchase has been completed successfully.</p>
        </div>

        <div style="padding:26px 30px">
          <h2 style="margin:0 0 16px;font-size:18px;color:#020617">Purchase Details</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:9px 0;color:#64748b">Store</td><td style="padding:9px 0;text-align:right;font-weight:700">${safe.brandName}</td></tr>
            <tr><td style="padding:9px 0;color:#64748b">Offer</td><td style="padding:9px 0;text-align:right;font-weight:700">${safe.offerTitle}</td></tr>
            <tr><td style="padding:9px 0;color:#64748b">Coupon Value</td><td style="padding:9px 0;text-align:right;font-weight:700">₹${safe.couponValue}</td></tr>
            <tr><td style="padding:9px 0;color:#64748b">Purchase Price</td><td style="padding:9px 0;text-align:right;font-weight:700">₹${safe.purchaseAmount}</td></tr>
            <tr><td style="padding:9px 0;color:#64748b">Order ID</td><td style="padding:9px 0;text-align:right;font-weight:700">${safe.orderId}</td></tr>
            <tr><td style="padding:9px 0;color:#64748b">Purchase Date</td><td style="padding:9px 0;text-align:right;font-weight:700">${safe.purchaseDate}</td></tr>
          </table>
        </div>

        <div style="margin:0 30px;padding:22px;border:1px dashed #16a34a;border-radius:18px;background:#f0fdf4;text-align:center">
          <p style="margin:0 0 10px;font-size:13px;font-weight:800;color:#15803d;text-transform:uppercase;letter-spacing:.08em">Your Coupon Code</p>
          <div style="display:inline-block;padding:12px 18px;border-radius:14px;background:#ffffff;color:#020617;font-size:24px;font-weight:900;letter-spacing:.08em">${safe.couponCode}</div>
          <p style="margin:12px 0 0;color:#475569;font-size:14px">Valid Until: <strong>${safe.expiryDate}</strong></p>
        </div>

        <div style="padding:26px 30px">
          <h2 style="margin:0 0 14px;font-size:18px;color:#020617">How to Redeem</h2>
          <ol style="margin:0 0 22px 20px;padding:0;color:#334155;font-size:14px">
            <li>Visit the merchant website.</li>
            <li>Add eligible products to your cart.</li>
            <li>Proceed to checkout.</li>
            <li>Apply the coupon code above.</li>
            <li>Complete your purchase and enjoy your savings.</li>
          </ol>

          <div style="border-radius:16px;background:#fff7ed;padding:18px;color:#7c2d12;font-size:14px">
            <p style="margin:0 0 8px;font-weight:800">Important Notes:</p>
            <ul style="margin:0 0 0 18px;padding:0">
              <li>Coupon codes are visible only after successful payment.</li>
              <li>Please verify offer terms before use.</li>
              <li>Some coupons may have minimum order requirements.</li>
              <li>Coupons cannot be refunded after successful redemption.</li>
            </ul>
          </div>

          <p style="margin:24px 0 0;color:#334155;font-size:14px">Thank you for shopping with CouponX.</p>
          <p style="margin:8px 0 0;color:#334155;font-size:14px">We appreciate your trust in our marketplace and look forward to helping you save more.</p>
        </div>

        <div style="padding:22px 30px;border-top:1px solid #e5edf3;background:#f8fafc;color:#64748b;font-size:13px">
          <p style="margin:0 0 4px;font-weight:800;color:#0f172a">Best Regards,<br/>CouponX Team</p>
          <p style="margin:10px 0 0">Secure Marketplace for Verified Coupons</p>
          <p style="margin:6px 0 0"><a href="mailto:support@couponx.com" style="color:#16a34a;text-decoration:none;font-weight:700">support@couponx.com</a></p>
        </div>
      </div>
    </div>
  `;

  return { subject: "Coupon Purchased Successfully 🎉", text, html };
};

const sendCouponDeliveryEmail = async ({ email, buyer, coupon, transaction }) => {
  if (!email || !coupon) {
    return;
  }

  const template = buildCouponPurchaseEmailTemplate({ buyer, coupon, transaction });
  await sendEmail({
    to: email,
    subject: template.subject,
    text: template.text,
    html: template.html
  });
};

const deliverCouponEmailIfNeeded = async ({ buyerId, coupon, transaction }) => {
  if (!buyerId || !coupon || !transaction || transaction.couponEmailSentAt) {
    return transaction;
  }

  const buyer = await User.findById(buyerId).select("name email");
  if (!buyer?.email) {
    return transaction;
  }

  await sendCouponDeliveryEmail({
    email: buyer.email,
    buyer,
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
