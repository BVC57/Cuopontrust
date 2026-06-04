const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");
const {
  getDashboard,
  getUsers,
  banUser,
  unbanUser,
  getCoupons,
  getFailedCoupons,
  getTransactions,
  getPayments,
  getDisputes,
  resolveDispute,
  getWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  getTrustHistory,
  getFraudReports,
  getRevenue,
  updateSettings
} = require("../controllers/admin.controller");

const router = express.Router();

router.use(authMiddleware, adminMiddleware);
router.get("/dashboard", getDashboard);
router.get("/users", getUsers);
router.put("/users/:id/ban", banUser);
router.put("/users/:id/unban", unbanUser);
router.get("/coupons", getCoupons);
router.get("/coupons/ai-failed", getFailedCoupons);
router.get("/transactions", getTransactions);
router.get("/payments", getPayments);
router.get("/disputes", getDisputes);
router.put("/disputes/:id/resolve", resolveDispute);
router.get("/withdrawals", getWithdrawals);
router.put("/withdrawals/:id/approve", approveWithdrawal);
router.put("/withdrawals/:id/reject", rejectWithdrawal);
router.get("/trust-history", getTrustHistory);
router.get("/fraud-reports", getFraudReports);
router.get("/revenue", getRevenue);
router.put("/settings", updateSettings);

module.exports = router;
