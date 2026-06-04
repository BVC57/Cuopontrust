const Wallet = require("../models/Wallet");
const User = require("../models/User");

const ensureWallet = async (userId, currency = "INR") => {
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = await Wallet.create({ userId, currency });
  }
  return wallet;
};

const creditPending = async (userId, amount, currency) => {
  const wallet = await ensureWallet(userId, currency);
  wallet.pendingBalance += amount;
  await wallet.save();
  await User.findByIdAndUpdate(userId, {
    $inc: { pendingBalance: amount }
  });
  return wallet;
};

const releasePendingToAvailable = async (userId, amount, currency) => {
  const wallet = await ensureWallet(userId, currency);
  wallet.pendingBalance = Math.max(0, wallet.pendingBalance - amount);
  wallet.availableBalance += amount;
  wallet.totalEarned += amount;
  await wallet.save();

  await User.findByIdAndUpdate(userId, {
    $inc: { walletBalance: amount, pendingBalance: -amount, totalSales: amount }
  });

  return wallet;
};

const reversePending = async (userId, amount, currency) => {
  const wallet = await ensureWallet(userId, currency);
  wallet.pendingBalance = Math.max(0, wallet.pendingBalance - amount);
  await wallet.save();

  await User.findByIdAndUpdate(userId, {
    $inc: { pendingBalance: -amount }
  });

  return wallet;
};

const debitAvailable = async (userId, amount, currency) => {
  const wallet = await ensureWallet(userId, currency);
  if (wallet.availableBalance < amount) {
    throw new Error("Insufficient wallet balance");
  }
  wallet.availableBalance -= amount;
  wallet.totalWithdrawn += amount;
  await wallet.save();
  return wallet;
};

module.exports = {
  ensureWallet,
  creditPending,
  releasePendingToAvailable,
  reversePending,
  debitAvailable
};
