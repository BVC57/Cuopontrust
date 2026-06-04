const mongoose = require("mongoose");

const trustHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    oldScore: { type: Number, required: true },
    newScore: { type: Number, required: true },
    change: { type: Number, required: true },
    reason: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrustHistory", trustHistorySchema);
