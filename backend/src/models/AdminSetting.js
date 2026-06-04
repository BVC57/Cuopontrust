const mongoose = require("mongoose");

const adminSettingSchema = new mongoose.Schema(
  {
    commissionPercent: { type: Number, default: 10 },
    minimumTrustScore: { type: Number, default: 60 },
    aiMatchThreshold: { type: Number, default: 90 },
    maxFreeListings: { type: Number, default: 10 },
    withdrawalFee: { type: Number, default: 2 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminSetting", adminSettingSchema);
