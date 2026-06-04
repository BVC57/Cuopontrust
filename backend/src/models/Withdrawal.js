const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    bankDetails: String,
    upiId: String,
    status: { type: String, enum: ["pending", "approved", "rejected", "paid"], default: "pending", index: true },
    adminNote: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Withdrawal", withdrawalSchema);
