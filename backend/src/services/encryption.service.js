const crypto = require("crypto");
const { normalizeCouponCode } = require("../utils/textNormalize");

const getSecretKey = () => {
  const secret = process.env.COUPON_ENCRYPTION_SECRET || "";
  return crypto.createHash("sha256").update(secret).digest();
};

const encryptCouponCode = (plainText) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", getSecretKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
};

const decryptCouponCode = (encryptedValue) => {
  const [ivHex, contentHex] = encryptedValue.split(":");
  const decipher = crypto.createDecipheriv("aes-256-cbc", getSecretKey(), Buffer.from(ivHex, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(contentHex, "hex")),
    decipher.final()
  ]);
  return decrypted.toString("utf8");
};

const hashCouponCode = (couponCode) =>
  crypto.createHash("sha256").update(normalizeCouponCode(couponCode)).digest("hex");

module.exports = { encryptCouponCode, decryptCouponCode, hashCouponCode };
