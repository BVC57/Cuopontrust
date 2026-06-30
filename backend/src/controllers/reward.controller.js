const RewardTransaction = require("../models/RewardTransaction");
const WalletTransaction = require("../models/WalletTransaction");
const Mission = require("../models/Mission");
const UserMission = require("../models/UserMission");
const FraudFlag = require("../models/FraudFlag");
const Referral = require("../models/Referral");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");
const {
  addFraudFlag,
  awardCoins,
  claimMissionReward,
  convertCoinsToWallet,
  ensureDefaultMissions,
  ensureReferralCode,
  getRewardAnalytics,
  getRewardSettings,
  getRewardsSummary,
  getSpinStatus,
  processRewardEvent,
  performSpin
} = require("../services/reward.service");

const getRewardsSummaryController = asyncHandler(async (req, res) => {
  await ensureReferralCode(req.user);
  const summary = await getRewardsSummary(req.user._id);
  return sendResponse(res, 200, "Rewards summary fetched", summary);
});

const getRewardsHistoryController = asyncHandler(async (req, res) => {
  const history = await RewardTransaction.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(100);
  return sendResponse(res, 200, "Reward history fetched", { history });
});

const convertCoinsController = asyncHandler(async (req, res) => {
  const result = await convertCoinsToWallet({ userId: req.user._id, coins: req.body.coins });
  return sendResponse(res, 200, "Coins converted to wallet", result);
});

const spinController = asyncHandler(async (req, res) => {
  const result = await performSpin({
    userId: req.user._id,
    ipAddress: req.ip,
    deviceId: String(req.headers["x-device-id"] || req.body.deviceId || ""),
    idempotencyKey: String(req.headers["idempotency-key"] || req.body.idempotencyKey || "")
  });
  return sendResponse(res, 200, result.alreadySpun ? "Spin already used for today" : "Spin completed", result);
});

const spinStatusController = asyncHandler(async (req, res) => {
  const status = await getSpinStatus(req.user._id);
  return sendResponse(res, 200, "Spin status fetched", status);
});

const getMissionsController = asyncHandler(async (req, res) => {
  await ensureDefaultMissions();
  const missions = await Mission.find({ isActive: true }).sort({ createdAt: -1 });
  return sendResponse(res, 200, "Missions fetched", { missions });
});

const getMyMissionsController = asyncHandler(async (req, res) => {
  const summary = await getRewardsSummary(req.user._id);
  return sendResponse(res, 200, "My missions fetched", { missions: summary.missions });
});

const claimMissionController = asyncHandler(async (req, res) => {
  const result = await claimMissionReward({ userId: req.user._id, missionId: req.params.missionId });
  return sendResponse(res, 200, "Mission reward claimed", result);
});

const rewardEventController = asyncHandler(async (req, res) => {
  const result = await processRewardEvent({
    userId: req.user._id,
    event: String(req.body.event || "").trim(),
    referenceId: req.body.referenceId,
    metadata: req.body.metadata || {},
    overrideCoins: req.body.overrideCoins,
    source: req.body.source,
    description: req.body.description
  });
  return sendResponse(res, 200, "Reward event processed", result);
});

const getWalletBalanceController = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, "Reward wallet balance fetched", {
    balance: Number(req.user.rewardWalletBalance || 0),
    coinsBalance: Number(req.user.coinsBalance || 0)
  });
});

const getWalletHistoryController = asyncHandler(async (req, res) => {
  const history = await WalletTransaction.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(100);
  return sendResponse(res, 200, "Reward wallet history fetched", { history });
});

const getMyReferralsController = asyncHandler(async (req, res) => {
  await ensureReferralCode(req.user);
  const referrals = await Referral.find({ referrerId: req.user._id }).populate("referredUserId", "name email createdAt").sort({ createdAt: -1 });
  const verifiedCount = referrals.filter((item) => ["verified", "first_purchase"].includes(item.status)).length;
  const firstPurchaseCount = referrals.filter((item) => item.status === "first_purchase").length;
  const clientBase = (process.env.CLIENT_URL || "http://localhost:3000").replace(/\/$/, "");
  const referralLink = `${clientBase}/register?ref=${req.user.referralCode}`;
  const appReferralLink = `couponxmobile://register?ref=${req.user.referralCode}`;

  return sendResponse(res, 200, "Referrals fetched", {
    referralCode: req.user.referralCode,
    referralLink,
    appReferralLink,
    totals: {
      total: referrals.length,
      verified: verifiedCount,
      firstPurchase: firstPurchaseCount
    },
    referrals
  });
});

const getRewardSettingsController = asyncHandler(async (req, res) => {
  const settings = await getRewardSettings();
  return sendResponse(res, 200, "Reward settings fetched", { settings });
});

const updateRewardSettingsController = asyncHandler(async (req, res) => {
  const settings = await getRewardSettings();
  const fields = [
    "coinConversionRateCoins",
    "coinConversionRateAmount",
    "minConversionCoins",
    "dailyEarningLimit",
    "monthlyEarningLimit",
    "rewardRules",
    "walletRules",
    "spinEnabled",
    "spinRewards"
  ];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      settings[field] = req.body[field];
    }
  });
  await settings.save();
  return sendResponse(res, 200, "Reward settings updated", { settings });
});

const getSpinSettingsController = asyncHandler(async (req, res) => {
  const settings = await getRewardSettings();
  return sendResponse(res, 200, "Spin settings fetched", { spinEnabled: settings.spinEnabled, spinRewards: settings.spinRewards });
});

const updateSpinSettingsController = asyncHandler(async (req, res) => {
  const settings = await getRewardSettings();
  if (req.body.spinEnabled !== undefined) settings.spinEnabled = Boolean(req.body.spinEnabled);
  if (req.body.spinRewards !== undefined) settings.spinRewards = req.body.spinRewards;
  await settings.save();
  return sendResponse(res, 200, "Spin settings updated", { settings });
});

const getAdminMissionsController = asyncHandler(async (req, res) => {
  const missions = await Mission.find().sort({ createdAt: -1 });
  return sendResponse(res, 200, "Admin missions fetched", { missions });
});

const createAdminMissionController = asyncHandler(async (req, res) => {
  const mission = await Mission.create({ ...req.body, createdBy: req.user._id });
  return sendResponse(res, 201, "Mission created", { mission });
});

const updateAdminMissionController = asyncHandler(async (req, res) => {
  const mission = await Mission.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!mission) return sendResponse(res, 404, "Mission not found");
  return sendResponse(res, 200, "Mission updated", { mission });
});

const deleteAdminMissionController = asyncHandler(async (req, res) => {
  const mission = await Mission.findByIdAndDelete(req.params.id);
  if (!mission) return sendResponse(res, 404, "Mission not found");
  await UserMission.deleteMany({ missionId: mission._id });
  return sendResponse(res, 200, "Mission deleted");
});

const getRewardAnalyticsController = asyncHandler(async (req, res) => {
  const analytics = await getRewardAnalytics();
  return sendResponse(res, 200, "Reward analytics fetched", { analytics });
});

const getFraudFlagsController = asyncHandler(async (req, res) => {
  const flags = await FraudFlag.find().populate("userId", "name email fraudScore accountStatus isRewardBlocked").sort({ createdAt: -1 });
  return sendResponse(res, 200, "Reward fraud flags fetched", { flags });
});

const getAdminRewardTransactionsController = asyncHandler(async (req, res) => {
  const history = await RewardTransaction.find()
    .populate("userId", "name email referralCode coinsBalance rewardWalletBalance")
    .sort({ createdAt: -1 })
    .limit(300);
  return sendResponse(res, 200, "Admin reward transactions fetched", { history });
});

const getAdminWalletTransactionsController = asyncHandler(async (req, res) => {
  const history = await WalletTransaction.find()
    .populate("userId", "name email rewardWalletBalance")
    .sort({ createdAt: -1 })
    .limit(300);
  return sendResponse(res, 200, "Admin wallet transactions fetched", { history });
});

const getAdminMissionHistoryController = asyncHandler(async (req, res) => {
  const history = await UserMission.find()
    .populate("userId", "name email")
    .populate("missionId", "title slug triggerEvent rewardCoins targetCount")
    .sort({ updatedAt: -1, createdAt: -1 })
    .limit(300);
  return sendResponse(res, 200, "Admin mission history fetched", { history });
});

const getAdminReferralHistoryController = asyncHandler(async (req, res) => {
  const history = await Referral.find()
    .populate("referrerId", "name email referralCode")
    .populate("referredUserId", "name email createdAt")
    .sort({ createdAt: -1 })
    .limit(300);
  return sendResponse(res, 200, "Admin referral history fetched", { history });
});

const createManualRewardController = asyncHandler(async (req, res) => {
  const result = await awardCoins({
    userId: req.body.userId,
    event: "ADMIN_MANUAL_REWARD",
    source: "admin_manual",
    referenceId: req.body.referenceId || `${req.body.userId}-${Date.now()}`,
    coins: Number(req.body.coins || 0),
    description: String(req.body.description || "Admin manual reward"),
    metadata: { adminId: req.user._id },
    type: "manual",
    allowDuplicate: true
  });

  return sendResponse(res, 200, "Manual reward created", result);
});

const flagRewardUserController = asyncHandler(async (req, res) => {
  const flag = await addFraudFlag({
    userId: req.params.userId,
    type: String(req.body.type || "manual_review"),
    score: Number(req.body.score || 0),
    reason: String(req.body.reason || "Manual reward review"),
    metadata: req.body.metadata || {}
  });
  return sendResponse(res, 201, "Reward user flagged", { flag });
});

module.exports = {
  claimMissionController,
  convertCoinsController,
  createAdminMissionController,
  createManualRewardController,
  deleteAdminMissionController,
  flagRewardUserController,
  getAdminMissionHistoryController,
  getAdminMissionsController,
  getAdminReferralHistoryController,
  getAdminRewardTransactionsController,
  getAdminWalletTransactionsController,
  getFraudFlagsController,
  getMissionsController,
  getMyMissionsController,
  getMyReferralsController,
  getRewardAnalyticsController,
  getRewardSettingsController,
  getRewardsHistoryController,
  getRewardsSummaryController,
  getSpinSettingsController,
  getWalletBalanceController,
  getWalletHistoryController,
  rewardEventController,
  spinController,
  spinStatusController,
  updateAdminMissionController,
  updateRewardSettingsController,
  updateSpinSettingsController
};
