const mongoose = require("mongoose");

const spinHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    spinDate: { type: Date, required: true, index: true },
    rewardCoins: { type: Number, default: 0 },
    rewardLabel: { type: String, default: "" },
    probabilityRuleId: { type: String, default: "" },
    deviceId: { type: String, default: "" },
    ipAddress: { type: String, default: "" },
    status: { type: String, enum: ["completed", "blocked"], default: "completed" },
    idempotencyKey: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SpinHistory", spinHistorySchema);
