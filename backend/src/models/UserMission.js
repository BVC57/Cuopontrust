const mongoose = require("mongoose");

const userMissionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    missionId: { type: mongoose.Schema.Types.ObjectId, ref: "Mission", required: true, index: true },
    progress: { type: Number, default: 0 },
    targetCount: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["locked", "active", "in_progress", "completed", "reward_claimed", "expired"],
      default: "active"
    },
    completedAt: Date,
    claimedAt: Date,
    rewardTransactionId: { type: mongoose.Schema.Types.ObjectId, ref: "RewardTransaction", default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

userMissionSchema.index({ userId: 1, missionId: 1 }, { unique: true });

module.exports = mongoose.model("UserMission", userMissionSchema);
