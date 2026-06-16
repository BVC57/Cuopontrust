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
router.get("/:id", getCouponById);
router.use(authMiddleware);
router.post("/sell", bannedMiddleware, couponUpload, sellCouponValidator, sellCoupon);
router.get("/my/listed", getMyListedCoupons);
router.get("/my/purchased", getMyPurchasedCoupons);
router.delete("/:id", bannedMiddleware, deleteCoupon);

module.exports = router;
