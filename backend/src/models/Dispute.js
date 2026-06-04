const mongoose = require("mongoose");

const disputeSchema = new mongoose.Schema(
  {
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", required: true, index: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", required: true, index: true },
    reason: { type: String, required: true },
    comment: String,
    proofImagePath: String,
    status: { type: String, enum: ["open", "under_review", "resolved", "rejected"], default: "open", index: true },
    resolution: { type: String, enum: ["refund_buyer", "release_seller", "partial_refund", null], default: null },
    adminNote: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Dispute", disputeSchema);
