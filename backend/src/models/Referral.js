const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema(
  {
    referrerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    referredUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    status: { type: String, enum: ["registered", "verified", "first_purchase"], default: "registered" },
    verificationRewardedAt: Date,
    firstPurchaseRewardedAt: Date,
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Referral", referralSchema);
