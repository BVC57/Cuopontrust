const mongoose = require("mongoose");

const platformWithdrawalSchema = new mongoose.Schema(
  {
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "INR" },
    method: { type: String, enum: ["upi", "bank"], required: true, index: true },
    bankName: String,
    accountHolderName: String,
    accountNumber: String,
    ifscCode: String,
    upiId: String,
    status: { type: String, enum: ["pending", "paid", "failed", "rejected"], default: "pending", index: true },
    payoutId: { type: String, index: true },
    payoutStatus: String,
    payoutReference: String,
    fundAccountId: String,
    contactId: String,
    adminNote: String,
    failureReason: String,
    processedAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlatformWithdrawal", platformWithdrawalSchema);
