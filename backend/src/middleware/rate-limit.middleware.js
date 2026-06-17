const rateLimit = require("express-rate-limit");

const AUTH_WINDOW_MS = Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000);
const AUTH_SEND_OTP_LIMIT = Number(process.env.AUTH_SEND_OTP_LIMIT || 5);
const AUTH_VERIFY_OTP_LIMIT = Number(process.env.AUTH_VERIFY_OTP_LIMIT || 10);
const API_WINDOW_MS = Number(process.env.API_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const API_REQUEST_LIMIT = Number(process.env.API_RATE_LIMIT || 500);

const getClientIp = (req) => req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";

const getNormalizedEmail = (req) => String(req.body?.email || "").trim().toLowerCase();

const buildAuthKey = (req, action) => {
  const intent = req.body?.intent === "register" ? "register" : "login";
  const email = getNormalizedEmail(req);
  const ip = getClientIp(req);

  return [action, intent, email || "anonymous", ip].join(":");
};

const createLimiter = ({ windowMs, limit, keyGenerator, message }) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    handler: (req, res) =>
      res.status(429).json({
        success: false,
        message
      })
  });

const apiLimiter = createLimiter({
  windowMs: API_WINDOW_MS,
  limit: API_REQUEST_LIMIT,
  keyGenerator: (req) => getClientIp(req),
  message: "Too many requests. Please try again later."
});

const sendOtpLimiter = createLimiter({
  windowMs: AUTH_WINDOW_MS,
  limit: AUTH_SEND_OTP_LIMIT,
  keyGenerator: (req) => buildAuthKey(req, "send-otp"),
  message: "Too many OTP requests for this account. Please wait a few minutes and try again."
});

const verifyOtpLimiter = createLimiter({
  windowMs: AUTH_WINDOW_MS,
  limit: AUTH_VERIFY_OTP_LIMIT,
  keyGenerator: (req) => buildAuthKey(req, "verify-otp"),
  message: "Too many OTP verification attempts for this account. Please request a new OTP and try again."
});

module.exports = {
  apiLimiter,
  sendOtpLimiter,
  verifyOtpLimiter
};
