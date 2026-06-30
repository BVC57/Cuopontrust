const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const bannedMiddleware = require("../middleware/banned.middleware");
const {
  convertCoinsController,
  getRewardsHistoryController,
  getRewardsSummaryController,
  getSpinSettingsController,
  getWalletBalanceController,
  getWalletHistoryController,
  rewardEventController,
  spinController,
  spinStatusController
} = require("../controllers/reward.controller");

const router = express.Router();

router.use(authMiddleware);
router.get("/summary", getRewardsSummaryController);
router.get("/history", getRewardsHistoryController);
router.post("/convert-to-wallet", bannedMiddleware, convertCoinsController);
router.post("/spin", bannedMiddleware, spinController);
router.get("/spin/status", spinStatusController);
router.post("/event", rewardEventController);
router.get("/wallet/balance", getWalletBalanceController);
router.get("/wallet/history", getWalletHistoryController);
router.get("/spin/settings", getSpinSettingsController);

module.exports = router;
