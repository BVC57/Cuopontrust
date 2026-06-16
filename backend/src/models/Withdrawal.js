const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    method: { type: String, enum: ["upi", "bank"], default: "upi", index: true },
    bankDetails: String,
    bankName: String,
    accountHolderName: String,
    accountNumber: String,
    ifscCode: String,
    upiId: String,
    status: { type: String, enum: ["pending", "approved", "rejected", "paid"], default: "pending", index: true },
    adminNote: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Withdrawal", withdrawalSchema);
