const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", required: true, index: true },
    amount: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    sellerAmount: { type: Number, required: true },
    currency: { type: String, required: true },
    paymentGateway: { type: String, default: "razorpay" },
    gatewayOrderId: { type: String, index: true },
    gatewayPaymentId: { type: String, index: true },
    gatewaySignature: String,
    gatewayReference: String,
    paymentStatus: {
      type: String,
      enum: ["created", "authorized", "captured", "refunded", "cancelled", "failed"],
      default: "created"
    },
    paymentEvents: {
      type: [
        {
          type: { type: String, required: true },
          status: String,
          message: String,
          payload: mongoose.Schema.Types.Mixed,
          createdAt: { type: Date, default: Date.now }
        }
      ],
      default: []
    },
    gatewayPayload: { type: mongoose.Schema.Types.Mixed, default: {} },
    escrowStatus: {
      type: String,
      enum: ["holding", "released", "refunded", "disputed"],
      default: "holding"
    },
    transactionStatus: {
      type: String,
      enum: ["created", "coupon_revealed", "completed", "disputed", "refunded", "cancelled"],
      default: "created"
    },
    authorizedAt: Date,
    capturedAt: Date,
    failedAt: Date,
    refundedAt: Date,
    couponRevealedAt: Date,
    releasedAt: Date,
    couponEmailSentAt: Date,
    buyerFeedbackStatus: {
      type: String,
      enum: ["pending", "worked", "not_working"],
      default: "pending"
    },
    buyerFeedbackAt: Date,
    buyerFeedbackNote: { type: String, default: "" },
    sellerTrustPenaltyApplied: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
