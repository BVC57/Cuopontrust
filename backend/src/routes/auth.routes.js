const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const { emailValidator, otpValidator } = require("../utils/validators");
const {
  sendOtpController,
  verifyOtpController,
  meController,
  logoutController
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/send-otp", [emailValidator], sendOtpController);
router.post("/verify-otp", [emailValidator, otpValidator], verifyOtpController);
router.get("/me", authMiddleware, meController);
router.post("/logout", authMiddleware, logoutController);

module.exports = router;
