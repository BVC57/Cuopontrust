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
    couponRevealedAt: Date,
    releasedAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
