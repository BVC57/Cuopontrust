const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const bannedMiddleware = require("../middleware/banned.middleware");
const {
  getWallet,
  requestWithdrawal,
  getWalletHistory
} = require("../controllers/wallet.controller");

const router = express.Router();

router.use(authMiddleware);
router.get("/", getWallet);
router.post("/withdraw", bannedMiddleware, requestWithdrawal);
router.get("/history", getWalletHistory);

module.exports = router;
