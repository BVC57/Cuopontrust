const mongoose = require("mongoose");

const fraudFlagSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, required: true },
    score: { type: Number, default: 0 },
    reason: { type: String, default: "" },
    status: { type: String, enum: ["open", "reviewed", "dismissed"], default: "open" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model("FraudFlag", fraudFlagSchema);
