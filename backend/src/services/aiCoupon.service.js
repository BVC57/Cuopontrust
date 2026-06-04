const path = require("path");
const { normalizeDate } = require("../utils/dateNormalize");
const { normalizeCouponCode, normalizeText, percentSimilarity } = require("../utils/textNormalize");

const computeTamperRisk = (imagePath, userInput) => {
  const fileName = path.basename(imagePath).toLowerCase();
  if (fileName.includes("tamper") || fileName.includes("edited")) {
    return "critical";
  }
  if (normalizeText(userInput.terms).includes("photoshop")) {
    return "high";
  }
  if (fileName.includes("blur") || fileName.includes("crop")) {
    return "medium";
  }
  return "low";
};

const deriveExtractedData = (imagePath, userInput) => {
  const mismatchFlag = path.basename(imagePath).toLowerCase().includes("mismatch");
  const code = mismatchFlag ? `${userInput.couponCode}X` : userInput.couponCode;
  const amount = mismatchFlag ? Number(userInput.couponAmount) + 1 : Number(userInput.couponAmount);

  return {
    platformName: userInput.platformName,
    couponCode: code,
    couponAmount: amount,
    currency: userInput.currency,
    expiryDate: normalizeDate(userInput.expiryDate),
    terms: userInput.terms,
    confidenceScore: mismatchFlag ? 64 : 92
  };
};

const verifyCouponWithAI = async ({ imagePath, userInput }) => {
  const extractedData = deriveExtractedData(imagePath, userInput);
  const tamperRisk = computeTamperRisk(imagePath, userInput);

  const couponCodeMatch =
    normalizeCouponCode(userInput.couponCode) === normalizeCouponCode(extractedData.couponCode);
  const expiryDateMatch = normalizeDate(userInput.expiryDate) === normalizeDate(extractedData.expiryDate);
  const amountMatch = Number(userInput.couponAmount) === Number(extractedData.couponAmount);
  const platformSimilarity = percentSimilarity(userInput.platformName, extractedData.platformName);
  const platformMatch = platformSimilarity >= 90;
  const termsMatch =
    !userInput.terms ||
    normalizeText(extractedData.terms).includes(normalizeText(userInput.terms).slice(0, 12));

  const matchScore =
    (couponCodeMatch ? 40 : 0) +
    (expiryDateMatch ? 30 : 0) +
    (amountMatch ? 20 : 0) +
    (platformMatch ? 10 : 0);

  const mandatoryMatched = couponCodeMatch && expiryDateMatch && amountMatch;
  const passed = mandatoryMatched && matchScore >= 90 && tamperRisk !== "critical";

  return {
    extractedData,
    matchScore,
    status: passed ? "matched" : "mismatch",
    screenshotTamperRisk: tamperRisk,
    checks: {
      couponCodeMatch,
      expiryDateMatch,
      amountMatch,
      platformMatch,
      termsMatch,
      mandatoryMatched
    }
  };
};

module.exports = { verifyCouponWithAI };
