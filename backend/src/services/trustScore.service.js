const User = require("../models/User");
const TrustHistory = require("../models/TrustHistory");
const { createNotification } = require("./notification.service");

const applyTrustPenalty = async ({ userId, penalty, reason, email }) => {
  const user = await User.findById(userId);
  if (!user) {
    return null;
  }

  const oldScore = user.trustScore;
  user.trustScore = Math.max(0, user.trustScore - penalty);

  if (user.trustScore < 40) {
    user.accountStatus = "banned";
    user.bannedAt = new Date();
  } else if (user.trustScore < 80) {
    user.accountStatus = "warning";
  } else {
    user.accountStatus = "active";
  }

  await user.save();

  await TrustHistory.create({
    userId,
    oldScore,
    newScore: user.trustScore,
    change: -penalty,
    reason
  });

  if (email) {
    await createNotification({
      userId,
      type: "trust_score",
      title: "Trust score updated",
      message: `Your trust score changed from ${oldScore} to ${user.trustScore}. Reason: ${reason}`,
      email
    });
  }

  return user;
};

module.exports = { applyTrustPenalty };
