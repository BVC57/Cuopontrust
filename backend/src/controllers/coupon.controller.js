const { validationResult } = require("express-validator");
const Coupon = require("../models/Coupon");
const FraudReport = require("../models/FraudReport");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");
const { verifyCouponWithAI } = require("../services/aiCoupon.service");
const { encryptCouponCode, hashCouponCode, decryptCouponCode } = require("../services/encryption.service");
const { applyTrustPenalty } = require("../services/trustScore.service");
const { createFraudReport } = require("../services/fraud.service");
const { createNotification } = require("../services/notification.service");

const normalizeCategory = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const parseCategories = (input, customCategory) => {
  let parsed = [];

  if (Array.isArray(input)) {
    parsed = input;
  } else if (typeof input === "string" && input.trim()) {
    try {
      const jsonParsed = JSON.parse(input);
      parsed = Array.isArray(jsonParsed) ? jsonParsed : [input];
    } catch {
      parsed = input.split(",");
    }
  }

  if (customCategory) {
    parsed.push(customCategory);
  }

  return [...new Set(parsed.map(normalizeCategory).filter(Boolean))];
};

const calculateDiscountPercent = (coupon) => {
  const couponAmount = Number(coupon.couponAmount || 0);
  const sellingPrice = Number(coupon.sellingPrice || 0);
  if (!couponAmount || !sellingPrice) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(((couponAmount - sellingPrice) / couponAmount) * 100)));
};

const listCoupons = asyncHandler(async (req, res) => {
  const filters = { status: "available", aiVerificationStatus: "matched" };
  if (req.query.country) {
    filters.country = req.query.country;
  }
  if (req.query.platformName) {
    filters.platformName = new RegExp(req.query.platformName, "i");
  }

  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, "i");
    filters.$or = [
      { platformName: searchRegex },
      { title: searchRegex },
      { categories: searchRegex }
    ];
  }

  if (req.query.category && req.query.category !== "All Categories") {
    filters.categories = normalizeCategory(req.query.category);
  }

  let query = Coupon.find(filters)
    .populate("sellerId", "name trustScore country")
    .sort({ createdAt: -1 });

  const sort = req.query.sort || "latest";
  if (sort === "popular") {
    query = query.sort({ views: -1, createdAt: -1 });
  } else if (sort === "ending_soon") {
    query = query.sort({ expiryDate: 1, createdAt: -1 });
  }

  let coupons = await query;

  const minPrice = Number(req.query.minPrice || 0);
  const maxPrice = Number(req.query.maxPrice || 0);
  const minDiscount = Number(req.query.minDiscount || 0);

  coupons = coupons.filter((coupon) => {
    const withinMinPrice = !minPrice || Number(coupon.sellingPrice) >= minPrice;
    const withinMaxPrice = !maxPrice || Number(coupon.sellingPrice) <= maxPrice;
    const discountPass = !minDiscount || calculateDiscountPercent(coupon) >= minDiscount;
    return withinMinPrice && withinMaxPrice && discountPass;
  });

  return sendResponse(res, 200, "Coupons fetched", { coupons });
});

const getCouponById = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id).populate("sellerId", "name trustScore country");
  if (!coupon) {
    return sendResponse(res, 404, "Coupon not found");
  }
  coupon.views += 1;
  await coupon.save();
  return sendResponse(res, 200, "Coupon fetched", { coupon });
});

const sellCoupon = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, 422, "Validation failed", { errors: errors.array() });
  }

  if (!req.file) {
    return sendResponse(res, 400, "Coupon screenshot is required");
  }

  const expiry = new Date(req.body.expiryDate);
  if (expiry < new Date(new Date().toDateString())) {
    req.user.expiredCouponCount += 1;
    await req.user.save();
    await applyTrustPenalty({
      userId: req.user._id,
      penalty: 10,
      reason: "Expired coupon upload",
      email: req.user.email
    });
    await createFraudReport({
      userId: req.user._id,
      type: "expired_coupon",
      riskLevel: "medium",
      description: "User attempted to upload an expired coupon",
      userInputData: req.body
    });
    return sendResponse(res, 400, "Expired coupons are not allowed");
  }

  const couponCodeHash = hashCouponCode(req.body.couponCode);
  const existingCoupon = await Coupon.findOne({ couponCodeHash });
  if (existingCoupon) {
    req.user.duplicateCouponCount += 1;
    await req.user.save();
    await applyTrustPenalty({
      userId: req.user._id,
      penalty: 15,
      reason: "Duplicate coupon upload",
      email: req.user.email
    });
    await createFraudReport({
      userId: req.user._id,
      couponId: existingCoupon._id,
      type: "duplicate_coupon",
      riskLevel: "high",
      description: "Duplicate coupon hash detected",
      userInputData: req.body
    });
    return sendResponse(res, 400, "This coupon is already listed or used");
  }

  const coupon = await Coupon.create({
    sellerId: req.user._id,
    platformName: req.body.platformName,
    title: req.body.title,
    categories: parseCategories(req.body.categories, req.body.customCategory),
    couponCodeEncrypted: encryptCouponCode(req.body.couponCode),
    couponCodeHash,
    couponAmount: Number(req.body.couponAmount),
    sellingPrice: Number(req.body.sellingPrice),
    currency: req.body.currency,
    country: req.body.country,
    expiryDate: expiry,
    terms: req.body.terms,
    proofImagePath: `/uploads/coupons/${req.file.filename}`
  });

  const aiResult = await verifyCouponWithAI({
    imagePath: req.file.path,
    userInput: req.body
  });

  coupon.aiExtractedData = aiResult.extractedData;
  coupon.aiMatchScore = aiResult.matchScore;
  coupon.aiVerificationStatus = aiResult.status;
  coupon.screenshotTamperRisk = aiResult.screenshotTamperRisk;
  coupon.status = aiResult.status === "matched" ? "available" : "ai_failed";
  await coupon.save();

  if (aiResult.status !== "matched") {
    req.user.suspiciousUploadCount += 1;
    await req.user.save();
    await createFraudReport({
      userId: req.user._id,
      couponId: coupon._id,
      type: aiResult.screenshotTamperRisk === "critical" ? "manipulated_screenshot" : "ai_mismatch",
      riskLevel: aiResult.screenshotTamperRisk,
      description: "Coupon failed AI verification",
      aiData: aiResult,
      userInputData: req.body
    });

    const mismatchCount = await FraudReport.countDocuments({
      userId: req.user._id,
      type: "ai_mismatch",
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    if (mismatchCount >= 3) {
      await applyTrustPenalty({
        userId: req.user._id,
        penalty: 10,
        reason: "Three AI mismatches in 30 days",
        email: req.user.email
      });
    }

    if (aiResult.screenshotTamperRisk === "critical") {
      await applyTrustPenalty({
        userId: req.user._id,
        penalty: 25,
        reason: "Manipulated screenshot detected",
        email: req.user.email
      });
    }

    return sendResponse(res, 400, "Coupon details do not match uploaded screenshot", {
      coupon,
      aiResult
    });
  }

  await createNotification({
    userId: req.user._id,
    type: "coupon_verified",
    title: "Coupon listed successfully",
    message: "Your coupon has been successfully verified and listed.",
    email: req.user.email
  });

  return sendResponse(res, 201, "Coupon verified and listed", { coupon, aiResult });
});

const getMyListedCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({ sellerId: req.user._id }).sort({ createdAt: -1 });
  return sendResponse(res, 200, "Listed coupons fetched", { coupons });
});

const getMyPurchasedCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({ buyerId: req.user._id }).sort({ createdAt: -1 });
  return sendResponse(res, 200, "Purchased coupons fetched", { coupons });
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOne({ _id: req.params.id, sellerId: req.user._id });
  if (!coupon) {
    return sendResponse(res, 404, "Coupon not found");
  }
  if (coupon.status === "sold") {
    return sendResponse(res, 400, "Sold coupons cannot be deleted");
  }
  coupon.status = "removed";
  await coupon.save();
  return sendResponse(res, 200, "Coupon removed");
});

const revealCouponCodeForTransaction = async (couponId) => {
  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    return null;
  }
  return {
    couponId: coupon._id,
    title: coupon.title,
    couponCode: decryptCouponCode(coupon.couponCodeEncrypted),
    platformName: coupon.platformName,
    categories: coupon.categories || [],
    expiryDate: coupon.expiryDate,
    terms: coupon.terms
  };
};

module.exports = {
  listCoupons,
  getCouponById,
  sellCoupon,
  getMyListedCoupons,
  getMyPurchasedCoupons,
  deleteCoupon,
  revealCouponCodeForTransaction
};
