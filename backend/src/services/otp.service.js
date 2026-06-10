const OTP = require("../models/OTP");
const { sendEmail } = require("./email.service");

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtp = async (email, options = {}) => {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  const isNewUser = Boolean(options.isNewUser);

  await OTP.findOneAndUpdate(
    { email },
    { otp, expiresAt, attempts: 0 },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  let emailSent = true;

  try {
    await sendEmail({
      to: email,
      subject: "Your CouponX OTP Code",
      text: [
        "CouponX Login Verification",
        "",
        isNewUser ? "Thank you for joining CouponX." : "Use the OTP below to securely access your CouponX account.",
        `OTP: ${otp}`,
        "This OTP expires in 10 minutes.",
        "",
        "If you did not request this OTP, you can ignore this email."
      ].join("\n"),
      html: `
        <div style="margin:0;padding:24px;background:#f4fbf7;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
          <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #dff2e5;border-radius:28px;overflow:hidden;box-shadow:0 18px 40px rgba(15,23,42,0.06);">
            <div style="padding:28px 32px;background:linear-gradient(135deg,#f8fff9 0%,#ffffff 100%);border-bottom:1px solid #ecf5f0;">
              <div style="display:inline-flex;align-items:center;gap:12px;">
                <div style="width:48px;height:48px;border-radius:16px;background:#16a34a;color:#ffffff;font-weight:800;font-size:18px;line-height:48px;text-align:center;">CX</div>
                <div>
                  <div style="font-size:24px;font-weight:800;letter-spacing:-0.02em;color:#0f172a;">Coupon<span style="color:#16a34a;">X</span></div>
                  <div style="font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#16a34a;">Secure Login Verification</div>
                </div>
              </div>
              <h1 style="margin:22px 0 10px;font-size:32px;line-height:1.1;font-weight:800;color:#0f172a;">Your one-time verification code</h1>
              <p style="margin:0;font-size:15px;line-height:1.8;color:#475569;">
                ${isNewUser ? "Thank you for joining CouponX. " : ""}Use this OTP to continue to your account securely.
              </p>
            </div>

            <div style="padding:32px;">
              <div style="margin:0 auto 24px;max-width:360px;background:linear-gradient(135deg,#f6fff8 0%,#ffffff 100%);border:1px solid #dcfce7;border-radius:24px;padding:24px;text-align:center;">
                <div style="font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#16a34a;">Your OTP Code</div>
                <div style="margin-top:16px;font-size:40px;font-weight:800;letter-spacing:0.35em;color:#0f172a;">${otp}</div>
                <div style="margin-top:14px;display:inline-block;padding:8px 14px;border-radius:999px;background:#ecfdf3;color:#15803d;font-size:12px;font-weight:700;">
                  Valid for 10 minutes
                </div>
              </div>

              <div style="border:1px solid #ecf5f0;border-radius:22px;padding:18px 20px;background:#fcfffd;">
                <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#0f172a;">Why you are receiving this</p>
                <p style="margin:0;font-size:14px;line-height:1.8;color:#64748b;">
                  We received a login request for <strong>${email}</strong>. Enter the code above on the CouponX verification screen to continue.
                </p>
              </div>

              <p style="margin:24px 0 0;font-size:14px;line-height:1.8;color:#64748b;">
                If you did not request this OTP, you can safely ignore this message. No action will be taken without successful OTP verification.
              </p>
            </div>

            <div style="padding:20px 32px;background:#f8fafc;border-top:1px solid #ecf5f0;">
              <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#0f172a;">Thank you for choosing CouponX</p>
              <p style="margin:0;font-size:13px;line-height:1.7;color:#64748b;">
                India&apos;s trusted coupon marketplace for verified savings and secure seller payouts.
              </p>
            </div>
          </div>
        </div>`
    });
  } catch (error) {
   console.error("OTP email send failed:", {
    message: error.message,
    code: error.code,
    command: error.command,
    response: error.response,
    stack: error.stack
  });

  emailSent = false;
  emailError = error.message;
  }

  return { otp, emailSent,error: emailError };
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
