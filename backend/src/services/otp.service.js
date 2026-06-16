const OTP = require("../models/OTP");
const { sendEmail } = require("./email.service");

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildOtpTemplate = ({ email, otp, userName }) => {
  const displayName = userName || email.split("@")[0] || "User";
  const safeName = escapeHtml(displayName);
  const safeOtp = escapeHtml(otp);

  const text = `Hello ${displayName},

Welcome to CouponX!

To complete your login or registration, please use the verification code below:

━━━━━━━━━━━━━━━━━━━━━━
OTP: ${otp}
━━━━━━━━━━━━━━━━━━━━━━

This OTP is valid for the next 10 minutes.

For your security:
• Never share this OTP with anyone.
• CouponX will never ask for your OTP via email, phone, or chat.
• If you didn't request this code, please ignore this email.

Why verify your account?
✓ Secure account access
✓ Safe coupon purchases
✓ Faster transactions
✓ Protected earnings and withdrawals

Need help?
Contact our support team at support@couponx.com

Thank you,
The CouponX Team

Secure • Verified • Trusted`;

  const html = `
    <div style="margin:0;background:#f4f7fb;padding:28px 12px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;line-height:1.6">
      <div style="max-width:660px;margin:0 auto;border:1px solid #dbe7ef;border-radius:24px;background:#ffffff;overflow:hidden;box-shadow:0 18px 44px rgba(15,23,42,0.08)">
        <div style="padding:28px 30px;border-bottom:1px solid #e5edf3;background:#f8fffb">
          <p style="margin:0 0 8px;color:#16a34a;font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase">CouponX</p>
          <h1 style="margin:0;font-size:26px;line-height:1.25;color:#020617">Verify Your Account</h1>
          <p style="margin:14px 0 0;font-size:15px;color:#475569">Hello ${safeName}, welcome to CouponX!</p>
          <p style="margin:8px 0 0;font-size:15px;color:#475569">To complete your login or registration, please use the verification code below:</p>
        </div>

        <div style="padding:28px 30px">
          <div style="margin:0 auto 24px;max-width:380px;border:1px dashed #16a34a;border-radius:20px;background:#f0fdf4;padding:24px;text-align:center">
            <p style="margin:0 0 10px;font-size:13px;font-weight:800;color:#15803d;text-transform:uppercase;letter-spacing:.08em">OTP Code</p>
            <div style="display:inline-block;padding:12px 18px;border-radius:14px;background:#ffffff;color:#020617;font-size:34px;font-weight:900;letter-spacing:.22em">${safeOtp}</div>
            <p style="margin:14px 0 0;color:#475569;font-size:14px">This OTP is valid for the next <strong>10 minutes</strong>.</p>
          </div>

          <div style="border-radius:16px;background:#fff7ed;padding:18px;color:#7c2d12;font-size:14px">
            <p style="margin:0 0 8px;font-weight:800">For your security:</p>
            <ul style="margin:0 0 0 18px;padding:0">
              <li>Never share this OTP with anyone.</li>
              <li>CouponX will never ask for your OTP via email, phone, or chat.</li>
              <li>If you didn't request this code, please ignore this email.</li>
            </ul>
          </div>

          <div style="margin-top:20px;border-radius:16px;background:#f8fafc;padding:18px;color:#334155;font-size:14px">
            <p style="margin:0 0 8px;font-weight:800;color:#0f172a">Why verify your account?</p>
            <ul style="margin:0 0 0 18px;padding:0">
              <li>Secure account access</li>
              <li>Safe coupon purchases</li>
              <li>Faster transactions</li>
              <li>Protected earnings and withdrawals</li>
            </ul>
          </div>

          <p style="margin:22px 0 0;color:#334155;font-size:14px">Need help?</p>
          <p style="margin:4px 0 0;color:#334155;font-size:14px">Contact our support team at <a href="mailto:support@couponx.com" style="color:#16a34a;text-decoration:none;font-weight:700">support@couponx.com</a></p>
        </div>

        <div style="padding:22px 30px;border-top:1px solid #e5edf3;background:#f8fafc;color:#64748b;font-size:13px">
          <p style="margin:0 0 8px;font-weight:800;color:#0f172a">Thank you,<br/>The CouponX Team</p>
          <p style="margin:0">Secure • Verified • Trusted</p>
        </div>
      </div>
    </div>`;

  return { text, html };
};

const resolveDeliveryMessage = ({ emailSent, consoleFallback }) => {
  if (emailSent) {
    return "OTP sent to your email address.";
  }
  if (consoleFallback) {
    return "OTP generated successfully. Delivery fell back to console mode.";
  }
  return "OTP generated, but email delivery failed.";
};

const sendOtp = async (email, options = {}) => {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  const otpDeliveryMode = String(process.env.OTP_DELIVERY_MODE || "console").trim().toLowerCase();

  await OTP.findOneAndUpdate(
    { email },
    { otp, expiresAt, attempts: 0 },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  let emailSent = false;
  let consoleFallback = false;
  let provider = null;

  try {
    const template = buildOtpTemplate({ email, otp, userName: options.userName });
    const result = await sendEmail({
      to: email,
      subject: "Verify Your Account - Your OTP Code",
      text: template.text,
      html: template.html
    });
    emailSent = true;
    provider = result.provider;
  } catch (error) {
    console.error("OTP email send failed", error.message);
  }

  if (!emailSent && otpDeliveryMode === "console") {
    consoleFallback = true;
    console.log(`[CouponX OTP] ${email}: ${otp}`);
  }

  return {
    otp,
    emailSent,
    consoleFallback,
    provider,
    message: resolveDeliveryMessage({ emailSent, consoleFallback })
  };
};

const verifyOtp = async (email, otp) => {
  const record = await OTP.findOne({ email });

  if (!record) {
    return { valid: false, reason: "OTP not found" };
  }

  if (record.expiresAt < new Date()) {
    return { valid: false, reason: "OTP expired" };
  }

  if (record.otp !== otp) {
    record.attempts += 1;
    await record.save();
    return { valid: false, reason: "OTP invalid" };
  }

  await OTP.deleteOne({ _id: record._id });
  return { valid: true };
};

module.exports = { sendOtp, verifyOtp };
