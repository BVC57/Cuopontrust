const mongoose = require("mongoose");

const rewardTransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["credit", "debit", "conversion", "claim", "spin", "manual"], default: "credit" },
    source: { type: String, required: true, index: true },
    event: { type: String, default: "" },
    coins: { type: Number, default: 0 },
    amountValue: { type: Number, default: 0 },
    status: { type: String, enum: ["completed", "pending", "reversed", "blocked"], default: "completed" },
    referenceId: { type: String, default: "", index: true },
    description: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    expiresAt: Date
  },
  { timestamps: true }
);

rewardTransactionSchema.index({ userId: 1, source: 1, referenceId: 1 });

module.exports = mongoose.model("RewardTransaction", rewardTransactionSchema);
