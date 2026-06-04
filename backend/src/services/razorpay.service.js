const crypto = require("crypto");
const { getRazorpay } = require("../config/razorpay");

const useMockGateway = () =>
  !process.env.RAZORPAY_KEY_ID ||
  !process.env.RAZORPAY_KEY_SECRET ||
  process.env.RAZORPAY_KEY_ID === "rzp_test_coupontrust";

const createOrder = async ({ amount, currency, receipt, notes }) => {
  const client = getRazorpay();

  if (!client || useMockGateway()) {
    return {
      id: `order_mock_${Date.now()}`,
      amount: Math.round(amount * 100),
      currency: currency.toUpperCase(),
      receipt,
      status: "created",
      notes
    };
  }

  return client.orders.create({
    amount: Math.round(amount * 100),
    currency: currency.toUpperCase(),
    receipt,
    notes
  });
};

const verifySignature = ({ orderId, paymentId, signature }) => {
  if (useMockGateway()) {
    return true;
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return expectedSignature === signature;
};

const verifyWebhookSignature = ({ payload, signature }) => {
  if (useMockGateway()) {
    return true;
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET)
    .update(payload)
    .digest("hex");

  return expectedSignature === signature;
};

const capturePayment = async ({ paymentId, amount, currency }) => {
  const client = getRazorpay();

  if (!client || useMockGateway()) {
    return {
      id: paymentId,
      amount: Math.round(amount * 100),
      currency: currency.toUpperCase(),
      status: "captured"
    };
  }

  return client.payments.capture(paymentId, Math.round(amount * 100), currency.toUpperCase());
};

const refundPayment = async ({ paymentId, amount, notes }) => {
  const client = getRazorpay();

  if (!client || useMockGateway()) {
    return {
      id: `refund_mock_${Date.now()}`,
      payment_id: paymentId,
      amount: Math.round(amount * 100),
      status: "processed",
      notes
    };
  }

  return client.payments.refund(paymentId, {
    amount: Math.round(amount * 100),
    notes
  });
};

module.exports = {
  createOrder,
  verifySignature,
  verifyWebhookSignature,
  capturePayment,
  refundPayment
};
