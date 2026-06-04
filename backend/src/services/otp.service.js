const OTP = require("../models/OTP");
const { sendEmail } = require("./email.service");

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtp = async (email) => {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await OTP.findOneAndUpdate(
    { email },
    { otp, expiresAt, attempts: 0 },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await sendEmail({
    to: email,
    subject: "Your CouponTrust OTP",
    text: `Your login OTP is ${otp}. It expires in 10 minutes.`,
    html: `<p>Your login OTP is <strong>${otp}</strong>. It expires in 10 minutes.</p>`
  });

  return otp;
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
