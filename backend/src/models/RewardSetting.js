const mongoose = require("mongoose");

const rewardSettingSchema = new mongoose.Schema(
  {
    singletonKey: { type: String, default: "default", unique: true },
    coinConversionRateCoins: { type: Number, default: 100 },
    coinConversionRateAmount: { type: Number, default: 50 },
    minConversionCoins: { type: Number, default: 500 },
    dailyEarningLimit: { type: Number, default: 500 },
    monthlyEarningLimit: { type: Number, default: 10000 },
    rewardRules: {
      registration: { type: Number, default: 100 },
      emailVerification: { type: Number, default: 25 },
      completeProfile: { type: Number, default: 30 },
      uploadProfilePicture: { type: Number, default: 20 },
      dailyLogin: { type: Number, default: 10 },
      loginStreakBonus: { type: Number, default: 2 },
      couponPurchased: { type: Number, default: 25 },
      couponSold: { type: Number, default: 35 },
      referralVerified: { type: Number, default: 100 },
      referralFirstPurchase: { type: Number, default: 125 },
      reviewWritten: { type: Number, default: 20 },
      manualReward: { type: Number, default: 0 }
    },
    spinEnabled: { type: Boolean, default: true },
    spinRewards: {
      type: [
        {
          label: String,
          coins: { type: Number, default: 0 },
          probability: { type: Number, default: 0 },
          isNoReward: { type: Boolean, default: false }
        }
      ],
      default: [
        { label: "5 Coins", coins: 5, probability: 30 },
        { label: "10 Coins", coins: 10, probability: 25 },
        { label: "20 Coins", coins: 20, probability: 15 },
        { label: "50 Coins", coins: 50, probability: 10 },
        { label: "75 Coins", coins: 75, probability: 5 },
        { label: "100 Coins", coins: 100, probability: 2 },
        { label: "Better Luck Tomorrow", coins: 0, probability: 13, isNoReward: true }
      ]
    },
    walletRules: {
      allowFullWalletUsage: { type: Boolean, default: true },
      maxWalletUsagePercent: { type: Number, default: 100 }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("RewardSetting", rewardSettingSchema);
