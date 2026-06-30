const RewardSetting = require("../models/RewardSetting");
const RewardTransaction = require("../models/RewardTransaction");
const WalletTransaction = require("../models/WalletTransaction");
const SpinHistory = require("../models/SpinHistory");
const Mission = require("../models/Mission");
const UserMission = require("../models/UserMission");
const Referral = require("../models/Referral");
const AuditLog = require("../models/AuditLog");
const FraudFlag = require("../models/FraudFlag");
const User = require("../models/User");
const { createNotification, createAdminNotification } = require("./notification.service");

const DAY_MS = 24 * 60 * 60 * 1000;

const DEFAULT_MISSIONS = [
  {
    slug: "first-coupon-purchase",
    title: "First Coupon Purchase",
    description: "Buy your first coupon successfully.",
    missionType: "one-time",
    triggerEvent: "COUPON_PURCHASED",
    targetCount: 1,
    rewardCoins: 50
  },
  {
    slug: "buy-five-coupons",
    title: "Buy 5 Coupons",
    description: "Complete five successful coupon purchases.",
    missionType: "purchase",
    triggerEvent: "COUPON_PURCHASED",
    targetCount: 5,
    rewardCoins: 100
  },
  {
    slug: "first-coupon-sale",
    title: "First Coupon Sale",
    description: "Sell your first coupon successfully.",
    missionType: "seller",
    triggerEvent: "COUPON_SOLD",
    targetCount: 1,
    rewardCoins: 75
  },
  {
    slug: "invite-friend",
    title: "Invite Friend",
    description: "Invite a friend who registers and verifies their account.",
    missionType: "referral",
    triggerEvent: "REFERRAL_VERIFIED",
    targetCount: 1,
    rewardCoins: 100
  },
  {
    slug: "write-review",
    title: "Write Review",
    description: "Write a valid review after a coupon purchase.",
    missionType: "review",
    triggerEvent: "REVIEW_WRITTEN",
    targetCount: 1,
    rewardCoins: 20
  }
];

const formatParts = (value = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(value);

  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}`;
};

const startOfIstDay = (value = new Date()) => new Date(`${formatParts(value)}T00:00:00+05:30`);
const endOfIstDay = (value = new Date()) => new Date(startOfIstDay(value).getTime() + DAY_MS);
const startOfMonth = (value = new Date()) => {
  const date = new Date(value);
  date.setDate(1);
  return startOfIstDay(date);
};

const rewardLevelForCoins = (coins = 0) => {
  if (coins >= 5000) return "Diamond";
  if (coins >= 2500) return "Gold";
  if (coins >= 1000) return "Silver";
  return "Bronze";
};

const createAuditLog = async ({ userId = null, action, description, metadata = {} }) =>
  AuditLog.create({ userId, action, description, metadata });

const getRewardSettings = async () => {
  let settings = await RewardSetting.findOne({ singletonKey: "default" });
  if (!settings) {
    settings = await RewardSetting.create({ singletonKey: "default" });
  }
  return settings;
};

const ensureDefaultMissions = async () => {
  await Promise.all(
    DEFAULT_MISSIONS.map((mission) =>
      Mission.findOneAndUpdate({ slug: mission.slug }, { $setOnInsert: mission }, { upsert: true, new: true })
    )
  );
};

const ensureReferralCode = async (user) => {
  if (user.referralCode) {
    return user.referralCode;
  }

  let code = "";
  let exists = true;
  while (exists) {
    code = `CX${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    exists = Boolean(await User.findOne({ referralCode: code }).select("_id"));
  }

  user.referralCode = code;
  await user.save();
  return code;
};

const ensureUserMissionDocs = async (userId) => {
  await ensureDefaultMissions();
  const missions = await Mission.find({ isActive: true }).select("_id targetCount");
  await Promise.all(
    missions.map((mission) =>
      UserMission.findOneAndUpdate(
        { userId, missionId: mission._id },
        { $setOnInsert: { userId, missionId: mission._id, targetCount: mission.targetCount, status: "active" } },
        { upsert: true, new: true }
      )
    )
  );
};

const getCreditTotals = async (userId) => {
  const [today, month] = await Promise.all([
    RewardTransaction.aggregate([
      { $match: { userId, type: { $in: ["credit", "claim", "spin", "manual"] }, status: "completed", createdAt: { $gte: startOfIstDay(), $lt: endOfIstDay() } } },
      { $group: { _id: null, total: { $sum: "$coins" } } }
    ]),
    RewardTransaction.aggregate([
      { $match: { userId, type: { $in: ["credit", "claim", "spin", "manual"] }, status: "completed", createdAt: { $gte: startOfMonth() } } },
      { $group: { _id: null, total: { $sum: "$coins" } } }
    ])
  ]);

  return {
    today: today[0]?.total || 0,
    month: month[0]?.total || 0
  };
};

const addFraudFlag = async ({ userId, type, score, reason, metadata = {} }) => {
  const flag = await FraudFlag.create({ userId, type, score, reason, metadata });
  await User.findByIdAndUpdate(userId, { $inc: { fraudScore: Number(score || 0) } });
  return flag;
};

const creditRewardWallet = async ({ userId, amount, source, referenceId, description, metadata = {} }) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  user.rewardWalletBalance = Number(user.rewardWalletBalance || 0) + Number(amount || 0);
  await user.save();

  const walletTransaction = await WalletTransaction.create({
    userId,
    type: "credit",
    amount: Number(amount || 0),
    balanceAfter: user.rewardWalletBalance,
    source,
    referenceId: String(referenceId || ""),
    description,
    metadata
  });

  return { user, walletTransaction };
};

const debitRewardWallet = async ({ userId, amount, source, referenceId, description, metadata = {} }) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  if (Number(user.rewardWalletBalance || 0) < Number(amount || 0)) {
    throw new Error("Insufficient CouponX wallet balance");
  }

  user.rewardWalletBalance = Number(user.rewardWalletBalance || 0) - Number(amount || 0);
  await user.save();

  const walletTransaction = await WalletTransaction.create({
    userId,
    type: "debit",
    amount: Number(amount || 0),
    balanceAfter: user.rewardWalletBalance,
    source,
    referenceId: String(referenceId || ""),
    description,
    metadata
  });

  return { user, walletTransaction };
};

const refundRewardWallet = async ({ userId, amount, source, referenceId, description, metadata = {} }) => {
  const existingRefund = await WalletTransaction.findOne({ userId, type: "refund", source, referenceId: String(referenceId || "") });
  if (existingRefund) {
    return existingRefund;
  }

  const result = await creditRewardWallet({ userId, amount, source: source || "checkout_refund", referenceId, description, metadata });
  const refundTx = await WalletTransaction.findByIdAndUpdate(
    result.walletTransaction._id,
    { type: "refund" },
    { new: true }
  );
  return refundTx;
};

const awardCoins = async ({ userId, event, source, referenceId, coins, description, metadata = {}, type = "credit", allowDuplicate = false, amountValue = 0 }) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  if (user.accountStatus !== "active" || user.isRewardBlocked) {
    return { skipped: true, reason: "reward_blocked" };
  }

  const reference = String(referenceId || "");
  if (!allowDuplicate && reference) {
    const existing = await RewardTransaction.findOne({ userId, source, referenceId: reference, status: "completed" });
    if (existing) {
      return { duplicate: true, transaction: existing };
    }
  }

  const settings = await getRewardSettings();
  const totals = await getCreditTotals(user._id);
  const dailyRemaining = Math.max(0, Number(settings.dailyEarningLimit || 0) - totals.today);
  const monthlyRemaining = Math.max(0, Number(settings.monthlyEarningLimit || 0) - totals.month);
  const allowedCoins = type === "debit" || type === "conversion" ? Number(coins || 0) : Math.min(Number(coins || 0), dailyRemaining, monthlyRemaining);

  if (allowedCoins <= 0) {
    await createAuditLog({ userId, action: "reward_limit_reached", description: `Skipped ${event} reward because the earning limit was reached.`, metadata: { source, referenceId } });
    return { skipped: true, reason: "limit_reached" };
  }

  if (type === "debit" || type === "conversion") {
    if (Number(user.coinsBalance || 0) < allowedCoins) {
      throw new Error("Insufficient coins balance");
    }
    user.coinsBalance = Number(user.coinsBalance || 0) - allowedCoins;
  } else {
    user.coinsBalance = Number(user.coinsBalance || 0) + allowedCoins;
    user.lifetimeCoinsEarned = Number(user.lifetimeCoinsEarned || 0) + allowedCoins;
  }

  user.rewardLevel = rewardLevelForCoins(user.lifetimeCoinsEarned);
  await ensureReferralCode(user);
  await user.save();

  const rewardTransaction = await RewardTransaction.create({
    userId,
    type,
    source,
    event,
    coins: allowedCoins,
    amountValue,
    status: "completed",
    referenceId: reference,
    description,
    metadata
  });

  if (type !== "debit" && allowedCoins > 0) {
    await createNotification({
      userId,
      type: "coins_earned",
      title: "CouponX Coins added",
      message: `${allowedCoins} coins were added to your rewards balance.`,
      link: "/rewards",
      metadata: { rewardTransactionId: rewardTransaction._id, event, source }
    });
  }

  await createAuditLog({ userId, action: `reward_${source}`, description, metadata: { event, referenceId, coins: allowedCoins } });
  return { transaction: rewardTransaction, user };
};

const updateMissionProgress = async ({ userId, event, referenceId, metadata = {} }) => {
  await ensureUserMissionDocs(userId);
  const missions = await Mission.find({
    isActive: true,
    triggerEvent: event,
    $or: [{ startDate: { $exists: false } }, { startDate: null }, { startDate: { $lte: new Date() } }],
    $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: new Date() } }]
  });

  const updates = [];
  const reference = String(referenceId || "");

  for (const mission of missions) {
    const userMission = await UserMission.findOne({ userId, missionId: mission._id });
    if (!userMission || ["reward_claimed", "expired"].includes(userMission.status)) {
      continue;
    }

    const usedReferences = Array.isArray(userMission.metadata?.referenceIds) ? userMission.metadata.referenceIds : [];
    if (reference && usedReferences.includes(reference)) {
      continue;
    }

    if (reference) {
      usedReferences.push(reference);
    }

    userMission.progress = Math.min(Number(userMission.targetCount || 1), Number(userMission.progress || 0) + 1);
    userMission.status = userMission.progress >= Number(userMission.targetCount || 1) ? "completed" : "in_progress";
    userMission.completedAt = userMission.status === "completed" ? (userMission.completedAt || new Date()) : null;
    userMission.metadata = { ...(userMission.metadata || {}), referenceIds: usedReferences, lastEvent: event, lastMetadata: metadata };
    userMission.markModified("metadata");
    await userMission.save();

    if (userMission.status === "completed") {
      await createNotification({
        userId,
        type: "mission_completed",
        title: "Mission completed",
        message: `${mission.title} is ready to claim.`,
        link: "/missions",
        metadata: { missionId: mission._id, userMissionId: userMission._id }
      });
    }

    updates.push(userMission);
  }

  return updates;
};

const processReferralReward = async ({ user, event, referenceId, metadata = {} }) => {
  if (!user?.referredBy) {
    return null;
  }

  const settings = await getRewardSettings();
  const referral = await Referral.findOneAndUpdate(
    { referredUserId: user._id },
    { $setOnInsert: { referrerId: user.referredBy, referredUserId: user._id, status: "registered", metadata } },
    { upsert: true, new: true }
  );

  if (event === "EMAIL_VERIFIED" && !referral.verificationRewardedAt) {
    const result = await awardCoins({
      userId: user.referredBy,
      event: "REFERRAL_VERIFIED",
      source: "referral_verified",
      referenceId: user._id,
      coins: Number(settings.rewardRules?.referralVerified || 0),
      description: `Referral verified: ${user.email}`,
      metadata: { referredUserId: user._id }
    });
    referral.status = "verified";
    referral.verificationRewardedAt = new Date();
    await referral.save();
    return result;
  }

  if (event === "COUPON_PURCHASED" && !referral.firstPurchaseRewardedAt) {
    const result = await awardCoins({
      userId: user.referredBy,
      event: "REFERRAL_FIRST_PURCHASE",
      source: "referral_first_purchase",
      referenceId: referenceId || user._id,
      coins: Number(settings.rewardRules?.referralFirstPurchase || 0),
      description: `Referral first purchase reward: ${user.email}`,
      metadata: { referredUserId: user._id }
    });
    referral.status = "first_purchase";
    referral.firstPurchaseRewardedAt = new Date();
    await referral.save();
    return result;
  }

  return null;
};

const processRewardEvent = async ({ userId, event, referenceId, metadata = {}, overrideCoins = null, source = null, description = null }) => {
  const settings = await getRewardSettings();
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  let awarded = null;
  if (event === "DAILY_LOGIN") {
    const todayKey = formatParts(new Date());
    const lastKey = user.lastRewardLoginDate ? formatParts(user.lastRewardLoginDate) : "";
    if (todayKey !== lastKey) {
      const yesterdayKey = formatParts(new Date(Date.now() - DAY_MS));
      user.loginStreak = lastKey === yesterdayKey ? Number(user.loginStreak || 0) + 1 : 1;
      user.lastRewardLoginDate = new Date();
      user.lastLoginRewardAt = new Date();
      await user.save();

      awarded = await awardCoins({
        userId,
        event,
        source: source || "daily_login",
        referenceId: todayKey,
        coins: Number(settings.rewardRules?.dailyLogin || 0),
        description: description || "Daily login reward",
        metadata: { streak: user.loginStreak, ...metadata }
      });

      const streakBonus = Math.max(0, Math.min(7, Number(user.loginStreak || 0) - 1)) * Number(settings.rewardRules?.loginStreakBonus || 0);
      if (streakBonus > 0) {
        await awardCoins({
          userId,
          event: "LOGIN_STREAK",
          source: "login_streak",
          referenceId: `${todayKey}-${user.loginStreak}`,
          coins: streakBonus,
          description: `Login streak bonus for day ${user.loginStreak}`,
          metadata: { streak: user.loginStreak },
          allowDuplicate: false
        });
      }
    }
  } else {
    const ruleMap = {
      USER_REGISTERED: settings.rewardRules?.registration,
      EMAIL_VERIFIED: settings.rewardRules?.emailVerification,
      PROFILE_COMPLETED: settings.rewardRules?.completeProfile,
      UPLOAD_PROFILE_PICTURE: settings.rewardRules?.uploadProfilePicture,
      COUPON_PURCHASED: settings.rewardRules?.couponPurchased,
      COUPON_SOLD: settings.rewardRules?.couponSold,
      REVIEW_WRITTEN: settings.rewardRules?.reviewWritten,
      ADMIN_MANUAL_REWARD: settings.rewardRules?.manualReward
    };

    const coins = overrideCoins != null ? Number(overrideCoins || 0) : Number(ruleMap[event] || 0);
    if (coins > 0) {
      awarded = await awardCoins({
        userId,
        event,
        source: source || event.toLowerCase(),
        referenceId,
        coins,
        description: description || `${event} reward`,
        metadata,
        type: event === "SPIN_COMPLETED" ? "spin" : "credit"
      });
    }
  }

  const missionUpdates = await updateMissionProgress({ userId, event, referenceId, metadata });
  await processReferralReward({ user, event, referenceId, metadata });
  return { awarded, missionUpdates };
};

const claimMissionReward = async ({ userId, missionId }) => {
  const userMission = await UserMission.findOne({ userId, missionId }).populate("missionId");
  if (!userMission) throw new Error("Mission not found");
  if (userMission.status === "reward_claimed") throw new Error("Mission reward already claimed");
  if (userMission.status !== "completed") throw new Error("Mission is not completed yet");

  const result = await awardCoins({
    userId,
    event: "MISSION_CLAIMED",
    source: "mission_claim",
    referenceId: userMission._id,
    coins: Number(userMission.missionId?.rewardCoins || 0),
    description: `Claimed mission reward: ${userMission.missionId?.title || "Mission"}`,
    metadata: { missionId }
  });

  userMission.status = "reward_claimed";
  userMission.claimedAt = new Date();
  userMission.rewardTransactionId = result.transaction?._id || null;
  await userMission.save();

  await createNotification({
    userId,
    type: "mission_reward_claimed",
    title: "Mission reward claimed",
    message: `${userMission.missionId?.rewardCoins || 0} coins were credited to your account.`,
    link: "/missions",
    metadata: { missionId, rewardTransactionId: result.transaction?._id }
  });

  return { userMission, result };
};

const convertCoinsToWallet = async ({ userId, coins }) => {
  const settings = await getRewardSettings();
  const requestedCoins = Number(coins || 0);
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  if (requestedCoins < Number(settings.minConversionCoins || 0)) {
    throw new Error(`Minimum conversion is ${settings.minConversionCoins} coins`);
  }
  if (requestedCoins > Number(user.coinsBalance || 0)) {
    throw new Error("Insufficient coins balance");
  }

  const amountValue = Number(((requestedCoins / Number(settings.coinConversionRateCoins || 100)) * Number(settings.coinConversionRateAmount || 50)).toFixed(2));
  const debitResult = await awardCoins({
    userId,
    event: "COINS_CONVERTED",
    source: "coin_to_wallet",
    referenceId: `${userId}-${Date.now()}`,
    coins: requestedCoins,
    description: `Converted ${requestedCoins} coins to CouponX wallet`,
    amountValue,
    type: "conversion",
    allowDuplicate: true
  });

  const walletResult = await creditRewardWallet({
    userId,
    amount: amountValue,
    source: "coin_conversion",
    referenceId: debitResult.transaction?._id || `${userId}-${Date.now()}`,
    description: `Wallet credit from ${requestedCoins} coins`,
    metadata: { coins: requestedCoins }
  });

  await createNotification({
    userId,
    type: "coins_converted_to_wallet",
    title: "Coins converted to wallet",
    message: `${requestedCoins} coins were converted to Rs ${amountValue}.`,
    link: "/wallet",
    metadata: { coins: requestedCoins, amountValue }
  });

  return { debitResult, walletResult, amountValue, settings };
};

const selectSpinReward = (spinRewards = []) => {
  const total = spinRewards.reduce((sum, reward) => sum + Number(reward.probability || 0), 0) || 1;
  let point = Math.random() * total;

  for (const reward of spinRewards) {
    point -= Number(reward.probability || 0);
    if (point <= 0) {
      return reward;
    }
  }

  return spinRewards[spinRewards.length - 1] || { label: "Better Luck Tomorrow", coins: 0, isNoReward: true };
};

const getSpinStatus = async (userId) => {
  const spin = await SpinHistory.findOne({ userId, spinDate: { $gte: startOfIstDay(), $lt: endOfIstDay() }, status: "completed" }).sort({ createdAt: -1 });
  return {
    canSpin: !spin,
    nextSpinAt: endOfIstDay(),
    todaySpin: spin
  };
};

const performSpin = async ({ userId, ipAddress = "", deviceId = "", idempotencyKey = "" }) => {
  const settings = await getRewardSettings();
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  if (user.accountStatus !== "active") throw new Error("Only active users can spin");
  if (user.isRewardBlocked) throw new Error("Rewards are blocked for this account");
  if (!settings.spinEnabled) throw new Error("Spin wheel is currently disabled");

  const spinStatus = await getSpinStatus(userId);
  if (!spinStatus.canSpin) {
    return { alreadySpun: true, ...spinStatus };
  }

  const sameIpSpinsToday = await SpinHistory.countDocuments({ ipAddress, spinDate: { $gte: startOfIstDay(), $lt: endOfIstDay() } });
  if (ipAddress && sameIpSpinsToday >= 10) {
    await addFraudFlag({ userId, type: "spin_ip_abuse", score: 10, reason: "High daily spin volume from the same IP", metadata: { ipAddress } });
  }

  const reward = selectSpinReward(settings.spinRewards || []);
  const spin = await SpinHistory.create({
    userId,
    spinDate: new Date(),
    rewardCoins: Number(reward.coins || 0),
    rewardLabel: reward.label,
    probabilityRuleId: String(reward._id || reward.label || "reward"),
    deviceId,
    ipAddress,
    idempotencyKey,
    status: "completed"
  });

  user.lastSpinDate = new Date();
  await user.save();

  let rewardResult = null;
  if (Number(reward.coins || 0) > 0) {
    rewardResult = await processRewardEvent({
      userId,
      event: "SPIN_COMPLETED",
      referenceId: spin._id,
      overrideCoins: Number(reward.coins || 0),
      source: "daily_spin",
      description: `Daily spin reward: ${reward.label}`,
      metadata: { rewardLabel: reward.label, deviceId, ipAddress }
    });
  }

  await createNotification({
    userId,
    type: "spin_completed",
    title: "Daily spin completed",
    message: Number(reward.coins || 0) > 0 ? `You won ${reward.coins} coins.` : reward.label,
    link: "/rewards",
    metadata: { spinHistoryId: spin._id, rewardCoins: reward.coins }
  });

  return { spin, reward, rewardResult, nextSpinAt: endOfIstDay() };
};

const getRewardsSummary = async (userId) => {
  await ensureUserMissionDocs(userId);
  const [user, settings, spinStatus, rewardTransactions, walletTransactions, myMissions, referralStats] = await Promise.all([
    User.findById(userId),
    getRewardSettings(),
    getSpinStatus(userId),
    RewardTransaction.find({ userId }).sort({ createdAt: -1 }).limit(10),
    WalletTransaction.find({ userId }).sort({ createdAt: -1 }).limit(10),
    UserMission.find({ userId }).populate("missionId").sort({ updatedAt: -1 }).limit(20),
    Referral.find({ referrerId: userId })
  ]);

  return {
    user,
    settings,
    spinStatus,
    rewardTransactions,
    walletTransactions,
    missions: myMissions,
    referrals: {
      code: user?.referralCode || "",
      total: referralStats.length,
      verified: referralStats.filter((item) => ["verified", "first_purchase"].includes(item.status)).length,
      firstPurchase: referralStats.filter((item) => item.status === "first_purchase").length,
      items: referralStats
    }
  };
};

const getRewardAnalytics = async () => {
  const [rewardTotals, walletTotals, activeUsers, missionCompletions, fraudCases, spinUsage] = await Promise.all([
    RewardTransaction.aggregate([{ $match: { status: "completed" } }, { $group: { _id: null, totalCoins: { $sum: "$coins" } } }]),
    WalletTransaction.aggregate([{ $match: { type: "credit" } }, { $group: { _id: null, totalWallet: { $sum: "$amount" } } }]),
    User.countDocuments({ coinsBalance: { $gt: 0 } }),
    UserMission.countDocuments({ status: { $in: ["completed", "reward_claimed"] } }),
    FraudFlag.countDocuments({ status: "open" }),
    SpinHistory.countDocuments({ createdAt: { $gte: startOfMonth() } })
  ]);

  return {
    totalCoinsIssued: rewardTotals[0]?.totalCoins || 0,
    totalWalletConverted: walletTotals[0]?.totalWallet || 0,
    activeRewardUsers: activeUsers,
    missionCompletions,
    fraudCases,
    spinUsage
  };
};

module.exports = {
  addFraudFlag,
  awardCoins,
  claimMissionReward,
  convertCoinsToWallet,
  createAuditLog,
  debitRewardWallet,
  ensureDefaultMissions,
  ensureReferralCode,
  ensureUserMissionDocs,
  endOfIstDay,
  getRewardAnalytics,
  getRewardSettings,
  getRewardsSummary,
  getSpinStatus,
  processRewardEvent,
  performSpin,
  refundRewardWallet,
  rewardLevelForCoins,
  startOfIstDay
};
