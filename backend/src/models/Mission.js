const mongoose = require("mongoose");

const missionSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    missionType: { type: String, default: "one-time" },
    triggerEvent: { type: String, required: true, index: true },
    targetCount: { type: Number, default: 1 },
    rewardCoins: { type: Number, default: 0 },
    startDate: Date,
    endDate: Date,
    isActive: { type: Boolean, default: true },
    isRepeatable: { type: Boolean, default: false },
    repeatFrequency: { type: String, default: "none" },
    rules: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Mission", missionSchema);
