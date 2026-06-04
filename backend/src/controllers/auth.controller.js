const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const OTP = require("../models/OTP");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");
const { sendOtp, verifyOtp } = require("../services/otp.service");

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

const sendOtpController = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, 422, "Validation failed", { errors: errors.array() });
  }

  await sendOtp(req.body.email.toLowerCase());
  return sendResponse(res, 200, "OTP sent successfully");
});

const verifyOtpController = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, 422, "Validation failed", { errors: errors.array() });
  }

  const email = req.body.email.toLowerCase();
  const result = await verifyOtp(email, req.body.otp);

  if (!result.valid) {
    return sendResponse(res, 400, result.reason);
  }

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      email,
      name: email.split("@")[0],
      isEmailVerified: true,
      lastLogin: new Date()
    });
  } else {
    user.isEmailVerified = true;
    user.lastLogin = new Date();
    await user.save();
  }

  return sendResponse(res, 200, "OTP verified successfully", {
    token: signToken(user),
    user
  });
});

const meController = asyncHandler(async (req, res) => {
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
