const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const bannedMiddleware = require("../middleware/banned.middleware");
const { couponUpload } = require("../middleware/upload.middleware");
const { sellCouponValidator } = require("../utils/validators");
const {
  listCoupons,
  getCouponById,
  sellCoupon,
  getMyListedCoupons,
  getMyPurchasedCoupons,
  deleteCoupon
} = require("../controllers/coupon.controller");

const router = express.Router();

router.get("/", listCoupons);
router.get("/my/listed", authMiddleware, getMyListedCoupons);
router.get("/my/purchased", authMiddleware, getMyPurchasedCoupons);
router.post("/sell", authMiddleware, bannedMiddleware, couponUpload, sellCouponValidator, sellCoupon);
router.delete("/:id", authMiddleware, bannedMiddleware, deleteCoupon);
router.get("/:id", getCouponById);

module.exports = router;
