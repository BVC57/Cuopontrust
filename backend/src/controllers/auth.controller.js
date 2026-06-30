const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const OTP = require("../models/OTP");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");
const { sendOtp, verifyOtp } = require("../services/otp.service");
const { createAdminNotification } = require("../services/notification.service");
const { ensureReferralCode, processRewardEvent } = require("../services/reward.service");

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

const sendOtpController = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return sendResponse(res, 422, "Validation failed", {
      errors: errors.array()
    });
  }

  const email = req.body.email.toLowerCase();
  const intent = req.body.intent === "register" ? "register" : "login";

  const existingUser = await User.findOne({ email });
  if (intent === "login" && !existingUser) {
    return sendResponse(res, 404, "User not registered. Please register first.");
  }

  const result = await sendOtp(email, { userName: existingUser?.name });
  return sendResponse(res, 200, result.message, {
    emailSent: result.emailSent,
    consoleFallback: result.consoleFallback,
    provider: result.provider,
    devOtp: process.env.NODE_ENV === "production" ? undefined : result.otp
  });
});

const verifyOtpController = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, 422, "Validation failed", { errors: errors.array() });
  }

  const email = req.body.email.toLowerCase();
  const intent = req.body.intent === "register" ? "register" : "login";
  const result = await verifyOtp(email, req.body.otp);

  if (!result.valid) {
    return sendResponse(res, 400, result.reason);
  }

  let user = await User.findOne({ email });
  if (intent === "login" && !user) {
    return sendResponse(res, 404, "User not registered. Please register first.");
  }

  const isNewUser = !user;
  if (!user) {
    user = await User.create({
      email,
      name: email.split("@")[0],
      isEmailVerified: true,
      lastLogin: new Date()
    });

    const referralCode = String(req.body.referralCode || req.body.ref || "").trim().toUpperCase();
    if (referralCode) {
      const referrer = await User.findOne({ referralCode }).select("_id email");
      if (referrer && String(referrer._id) !== String(user._id)) {
        user.referredBy = referrer._id;
        await user.save();
      }
    }
  } else {
    user.isEmailVerified = true;
    user.lastLogin = new Date();
    await user.save();
  }

  await ensureReferralCode(user);

  if (isNewUser) {
    await createAdminNotification({
      type: "new_user_joined",
      title: "New user joined",
      message: `${user.email} created a new account.`,
      link: "/admin/users",
      metadata: { userId: user._id, email: user.email }
    });

    await processRewardEvent({ userId: user._id, event: "USER_REGISTERED", referenceId: user._id, description: "Registration reward" });
    await processRewardEvent({ userId: user._id, event: "EMAIL_VERIFIED", referenceId: `${user._id}-email`, description: "Email verification reward" });
  } else {
    await processRewardEvent({ userId: user._id, event: "DAILY_LOGIN", referenceId: `${user._id}-login`, description: "Daily login reward" });
  }

  return sendResponse(res, 200, "OTP verified successfully", {
    token: signToken(user),
    user
  });
});

const meController = asyncHandler(async (req, res) => {
  await ensureReferralCode(req.user);
  return sendResponse(res, 200, "Authenticated user", { user: req.user });
});

const logoutController = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, "Logout successful");
});

module.exports = {
  sendOtpController,
  verifyOtpController,
  meController,
  logoutController
};
