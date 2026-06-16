const fs = require("fs/promises");
const path = require("path");
const { validationResult } = require("express-validator");
const Coupon = require("../models/Coupon");
const FraudReport = require("../models/FraudReport");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");
const { verifyCouponWithAI } = require("../services/aiCoupon.service");
const { encryptCouponCode, hashCouponCode, decryptCouponCode } = require("../services/encryption.service");
const { applyTrustPenalty } = require("../services/trustScore.service");
const { createFraudReport } = require("../services/fraud.service");
const { createNotification, createAdminNotification } = require("../services/notification.service");
const { resolveBrand } = require("../constants/brandCatalog");

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

const removeUploadedFile = async (filePath) => {
  if (!filePath) {
    return;
  }
  try {
    await fs.unlink(filePath);
  } catch {
    // ignore cleanup failures
  }
};

const verificationStageTemplate = [
  { id: "upload", title: "Uploading screenshot", detail: "Screenshot uploaded to secure verification" },
  { id: "expired", title: "Checking expiry window", detail: "Validating that the coupon is not already expired" },
  { id: "duplicate", title: "Checking duplicate coupon", detail: "Looking for existing coupon code matches" },
  { id: "extract", title: "Extracting coupon data", detail: "Reading code, amount, and validity details" },
  { id: "code", title: "Matching coupon code", detail: "Code is visible in the screenshot" },
  { id: "expiry", title: "Matching expiry date", detail: "Expiry date matched with the screenshot" },
  { id: "amount", title: "Matching amount", detail: "Coupon amount matched with the screenshot" }
];

const resolveAiFailureStepId = (aiResult) => {
  if (!aiResult?.checks?.ocrReadable) return "extract";
  if (!aiResult?.checks?.couponCodeMatch) return "code";
  if (!aiResult?.checks?.expiryDateMatch) return "expiry";
  if (!aiResult?.checks?.amountMatch) return "amount";
  return null;
};

const buildVerificationStageDetail = ({ stage, status, failureDetail = "", aiResult = null } = {}) => {
  if (status === "error" && failureDetail) {
    return failureDetail;
  }

  if (stage.id === "expired") {
    return status === "success"
      ? `Expiry accepted: ${aiResult?.checks?.selectedExpiryDate || aiResult?.extractedData?.expiryDate || "selected date is valid"}`
      : stage.detail;
  }

  if (stage.id === "duplicate") {
    return status === "success"
      ? "No duplicate coupon found for this coupon code"
      : stage.detail;
  }

  if (aiResult?.checks && stage.id === "extract") {
    return aiResult.checks.ocrReadable
      ? `Screenshot readable with ${Number(aiResult.extractedData?.confidenceScore || 0)}% OCR confidence`
      : failureDetail || "Screenshot text could not be read clearly";
  }

  if (aiResult?.checks && stage.id === "code") {
    return aiResult.checks.couponCodeMatch
      ? `Coupon code matched (${Number(aiResult.checks.couponCodeSimilarity || 0)}% confidence)`
      : failureDetail || "Coupon code is not clearly visible in the screenshot";
  }

  if (aiResult?.checks && stage.id === "expiry") {
    return aiResult.checks.expiryDateMatch
      ? `Expiry matched: ${aiResult.extractedData?.expiryDate || aiResult.checks.selectedExpiryDate || "detected"}`
      : failureDetail || "Expiry date does not match the screenshot";
  }

  if (aiResult?.checks && stage.id === "amount") {
    return aiResult.checks.amountMatch
      ? `Amount matched: ${aiResult.extractedData?.currency || ""} ${aiResult.extractedData?.couponAmount || ""}`.trim()
      : failureDetail || "Coupon amount does not match the screenshot";
  }

  return stage.detail;
};

const buildVerificationStages = ({ failedStepId = null, failureDetail = "", aiResult = null } = {}) => {
  const failedIndex = failedStepId ? verificationStageTemplate.findIndex((stage) => stage.id === failedStepId) : -1;

  return verificationStageTemplate.map((stage, index) => {
    let status = "success";
    if (failedIndex >= 0) {
      if (index < failedIndex) status = "success";
      else if (index === failedIndex) status = "error";
      else status = "pending";
    }

    return {
      id: stage.id,
      title: stage.title,
      detail: buildVerificationStageDetail({ stage, status, failureDetail, aiResult }),
      status
    };
  });
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
    await removeUploadedFile(req.file.path);
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
    return sendResponse(res, 400, "Expired coupons are not allowed", {
      verificationStages: buildVerificationStages({
        failedStepId: "expired",
        failureDetail: "Expired coupons are not allowed"
      })
    });
  }

  const couponCodeHash = hashCouponCode(req.body.couponCode);
  const existingCoupon = await Coupon.findOne({ couponCodeHash });
  if (existingCoupon) {
    req.user.duplicateCouponCount += 1;
    await req.user.save();
    await removeUploadedFile(req.file.path);
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
    return sendResponse(res, 400, "This coupon is already listed or used", {
      verificationStages: buildVerificationStages({
        failedStepId: "duplicate",
        failureDetail: "This coupon is already listed or used"
      })
    });
  }

  const aiResult = await verifyCouponWithAI({
    imagePath: req.file.path,
    userInput: req.body
  });

  if (aiResult.status !== "matched") {
    req.user.suspiciousUploadCount += 1;
    await req.user.save();
    await removeUploadedFile(req.file.path);
    await createFraudReport({
      userId: req.user._id,
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

    const failureDetail = aiResult.failureReasons?.[0] || "Coupon details do not match uploaded screenshot";
    return sendResponse(res, 400, failureDetail, {
      aiResult,
      verificationStages: buildVerificationStages({
        failedStepId: resolveAiFailureStepId(aiResult),
        failureDetail,
        aiResult
      })
    });
  }

  const coupon = await Coupon.create({
    sellerId: req.user._id,
    platformName: req.body.platformName,
    platformBrandKey: resolveBrand(req.body.platformName)?.key || "",
    platformLogoPath: resolveBrand(req.body.platformName)?.logoPath || "",
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
    proofImagePath: `/uploads/coupons/${req.file.filename}`,
    aiExtractedData: aiResult.extractedData,
    aiMatchScore: aiResult.matchScore,
    aiVerificationStatus: aiResult.status,
    screenshotTamperRisk: aiResult.screenshotTamperRisk,
    aiChecks: aiResult.checks || {},
    aiFailureReasons: aiResult.failureReasons || [],
    status: "available"
  });

  await createNotification({
    userId: req.user._id,
    type: "coupon_verified",
    title: "Coupon listed successfully",
    message: "Your coupon has been successfully verified and listed.",
    email: req.user.email,
    link: "/listed-coupons",
    metadata: { couponId: coupon._id }
  });

  await createAdminNotification({
    type: "coupon_listed",
    title: "New coupon listed",
    message: `${req.user.email} listed ${coupon.title} on ${coupon.platformName}.`,
    link: "/admin/coupons",
    metadata: { couponId: coupon._id, sellerId: req.user._id }
  });

  return sendResponse(res, 201, "Coupon verified and listed", {
    coupon,
    aiResult,
    verificationStages: buildVerificationStages({ aiResult })
  });
});

const getMyListedCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({ sellerId: req.user._id }).sort({ createdAt: -1 });
  return sendResponse(res, 200, "Listed coupons fetched", { coupons });
});

const getMyPurchasedCoupons = asyncHandler(async (req, res) => {
  const purchasedTransactions = await Transaction.find({
    buyerId: req.user._id,
    paymentStatus: "captured",
    transactionStatus: { $in: ["completed", "coupon_revealed"] }
  })
    .populate("couponId")
    .sort({ createdAt: -1 });

  const coupons = purchasedTransactions
    .map((transaction) => {
      if (!transaction.couponId) {
        return null;
      }

      const coupon = transaction.couponId.toObject ? transaction.couponId.toObject() : transaction.couponId;
      return {
        ...coupon,
        purchaseStatus: transaction.paymentStatus,
        transactionStatus: transaction.transactionStatus,
        purchasedAt: transaction.createdAt,
        revealedCouponCode:
          transaction.couponRevealedAt || transaction.transactionStatus === "coupon_revealed"
            ? decryptCouponCode(coupon.couponCodeEncrypted)
            : undefined
      };
    })
    .filter(Boolean);

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

  const proofFilePath = coupon.proofImagePath
    ? path.join(process.cwd(), String(coupon.proofImagePath).replace(/^\/+/, ""))
    : "";

  await removeUploadedFile(proofFilePath);
  await Coupon.deleteOne({ _id: coupon._id });

  return sendResponse(res, 200, "Coupon deleted permanently");
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
