const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");
const {
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
  getRewardAnalyticsController,
  getRewardSettingsController,
  getSpinSettingsController,
  updateAdminMissionController,
  updateRewardSettingsController,
  updateSpinSettingsController
} = require("../controllers/reward.controller");

const router = express.Router();

router.use(authMiddleware, adminMiddleware);
router.get("/rewards/settings", getRewardSettingsController);
router.put("/rewards/settings", updateRewardSettingsController);
router.get("/spin/settings", getSpinSettingsController);
router.put("/spin/settings", updateSpinSettingsController);
router.get("/missions", getAdminMissionsController);
router.post("/missions", createAdminMissionController);
router.put("/missions/:id", updateAdminMissionController);
router.delete("/missions/:id", deleteAdminMissionController);
router.get("/rewards/analytics", getRewardAnalyticsController);
router.get("/rewards/fraud-flags", getFraudFlagsController);
router.get("/rewards/history", getAdminRewardTransactionsController);
router.get("/rewards/wallet-history", getAdminWalletTransactionsController);
router.get("/rewards/mission-history", getAdminMissionHistoryController);
router.get("/rewards/referral-history", getAdminReferralHistoryController);
router.post("/rewards/manual", createManualRewardController);
router.post("/rewards/flags/:userId", flagRewardUserController);

module.exports = router;
