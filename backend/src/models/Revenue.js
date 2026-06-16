const mongoose = require("mongoose");

const revenueSchema = new mongoose.Schema(
  {
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", index: true },
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", index: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    grossAmount: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    sellerAmount: { type: Number, required: true },
    currency: { type: String, required: true },
    revenueType: {
      type: String,
      enum: ["commission", "featured_listing", "subscription", "withdrawal_fee", "sponsored_coupon"],
      default: "commission"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Revenue", revenueSchema);
