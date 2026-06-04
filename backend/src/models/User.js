const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    avatar: String,
    role: { type: String, enum: ["user", "super_admin"], default: "user", index: true },
    country: { type: String, default: "India" },
    currency: { type: String, default: "INR" },
    trustScore: { type: Number, default: 100 },
    accountStatus: { type: String, enum: ["active", "warning", "banned"], default: "active", index: true },
    suspiciousUploadCount: { type: Number, default: 0 },
    fakeCouponCount: { type: Number, default: 0 },
    duplicateCouponCount: { type: Number, default: 0 },
    expiredCouponCount: { type: Number, default: 0 },
    disputeCount: { type: Number, default: 0 },
    walletBalance: { type: Number, default: 0 },
    pendingBalance: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    totalPurchases: { type: Number, default: 0 },
    isEmailVerified: { type: Boolean, default: false },
    lastLogin: Date,
    bannedAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
