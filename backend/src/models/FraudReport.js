const mongoose = require("mongoose");

const fraudReportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", default: null, index: true },
    type: {
      type: String,
      enum: ["ai_mismatch", "duplicate_coupon", "expired_coupon", "fake_coupon", "manipulated_screenshot", "suspicious_value"],
      required: true,
      index: true
    },
    riskLevel: { type: String, enum: ["low", "medium", "high", "critical"], required: true },
    description: { type: String, required: true },
    aiData: mongoose.Schema.Types.Mixed,
    userInputData: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

module.exports = mongoose.model("FraudReport", fraudReportSchema);
