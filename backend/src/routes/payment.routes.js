const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const bannedMiddleware = require("../middleware/banned.middleware");
const {
  createOrderController,
  verifyAuthorized,
  revealCoupon,
  confirmWorked,
  reportNotWorking,
  webhookHandler
} = require("../controllers/payment.controller");

const router = express.Router();

router.post("/webhook", webhookHandler);
router.use(authMiddleware, bannedMiddleware);
router.post("/create-order", createOrderController);
router.post("/create-intent", createOrderController);
router.post("/verify-authorized", verifyAuthorized);
router.post("/reveal-coupon/:transactionId", revealCoupon);
router.post("/confirm-worked/:transactionId", confirmWorked);
router.post("/report-not-working/:transactionId", reportNotWorking);

module.exports = router;
