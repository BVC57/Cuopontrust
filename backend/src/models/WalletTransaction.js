const mongoose = require("mongoose");

const walletTransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["credit", "debit", "refund"], required: true },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, default: 0 },
    source: { type: String, default: "" },
    referenceId: { type: String, default: "", index: true },
    description: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

walletTransactionSchema.index({ userId: 1, source: 1, referenceId: 1 });

module.exports = mongoose.model("WalletTransaction", walletTransactionSchema);
