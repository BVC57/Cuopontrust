const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    platformName: { type: String, required: true, index: true },
    title: { type: String, required: true },
    categories: { type: [String], default: [], index: true },
    couponCodeEncrypted: { type: String, required: true },
    couponCodeHash: { type: String, required: true, unique: true, index: true },
    couponAmount: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    currency: { type: String, required: true },
    country: { type: String, required: true, index: true },
    expiryDate: { type: Date, required: true, index: true },
    terms: String,
    proofImagePath: { type: String, required: true },
    aiExtractedData: {
      platformName: String,
      couponCode: String,
      couponAmount: Number,
      currency: String,
      expiryDate: String,
      terms: String,
      confidenceScore: Number
    },
    aiMatchScore: { type: Number, default: 0 },
    aiVerificationStatus: {
      type: String,
      enum: ["pending", "matched", "mismatch", "failed"],
      default: "pending",
      index: true
    },
    screenshotTamperRisk: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low"
    },
    status: {
      type: String,
      enum: ["ai_checking", "available", "ai_failed", "sold", "expired", "fake", "removed"],
      default: "ai_checking",
      index: true
    },
    views: { type: Number, default: 0 },
    savedCount: { type: Number, default: 0 },
    adminNote: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
