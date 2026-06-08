const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");
const {
  getDashboard,
  getUsers,
  createUser,
  banUser,
  unbanUser,
  deleteUser,
  getCoupons,
  deleteCoupon,
  getFailedCoupons,
  getTransactions,
  getPayments,
  deletePayment,
  getDisputes,
  resolveDispute,
  getWithdrawals,
  getAdminNotifications,
  markAdminNotificationRead,
  approveWithdrawal,
  rejectWithdrawal,
  deleteWithdrawal,
  getTrustHistory,
  getFraudReports,
  getRevenue,
  updateSettings
} = require("../controllers/admin.controller");
const { listBlogs, createBlog, updateBlog, deleteBlog } = require("../controllers/blog.controller");

const router = express.Router();

router.use(authMiddleware, adminMiddleware);
router.get("/dashboard", getDashboard);
router.get("/users", getUsers);
router.post("/users", createUser);
router.put("/users/:id/ban", banUser);
router.put("/users/:id/unban", unbanUser);
router.delete("/users/:id", deleteUser);
router.get("/coupons", getCoupons);
router.delete("/coupons/:id", deleteCoupon);
router.get("/coupons/ai-failed", getFailedCoupons);
router.get("/transactions", getTransactions);
router.get("/payments", getPayments);
router.delete("/payments/:id", deletePayment);
router.get("/disputes", getDisputes);
router.put("/disputes/:id/resolve", resolveDispute);
router.get("/notifications", getAdminNotifications);
router.put("/notifications/:id/read", markAdminNotificationRead);
router.get("/withdrawals", getWithdrawals);
router.put("/withdrawals/:id/approve", approveWithdrawal);
router.put("/withdrawals/:id/reject", rejectWithdrawal);
router.delete("/withdrawals/:id", deleteWithdrawal);
router.get("/trust-history", getTrustHistory);
router.get("/fraud-reports", getFraudReports);
router.get("/revenue", getRevenue);
router.put("/settings", updateSettings);
router.get("/blogs", listBlogs);
router.post("/blogs", createBlog);
router.put("/blogs/:id", updateBlog);
router.delete("/blogs/:id", deleteBlog);

module.exports = router;
