const path = require("path");
const { recognize } = require("tesseract.js");
const { normalizeDate } = require("../utils/dateNormalize");
const { normalizeCouponCode, normalizeText, percentSimilarity } = require("../utils/textNormalize");

const OCR_TEXT_LIMIT = 260;

const compactText = (value = "") => normalizeText(value).replace(/\s+/g, " ").trim();
const collapseAlphaNumeric = (value = "") => String(value).toLowerCase().replace(/[^a-z0-9]/g, "");
const buildSnippet = (value = "") => compactText(value).slice(0, OCR_TEXT_LIMIT);
const normalizeLooseText = (value = "") => compactText(value).toLowerCase();

const OCR_EQUIVALENT_GROUPS = [
  ["0", "o", "q", "d"],
  ["1", "i", "l", "|"],
  ["2", "z"],
  ["5", "s"],
  ["6", "g"],
  ["8", "b"]
];

const getEquivalentChars = (char) => {
  for (const group of OCR_EQUIVALENT_GROUPS) {
    if (group.includes(char)) {
      return group;
    }
  }
  return [char];
};

const buildCodeVariants = (value = "") => {
  const normalized = collapseAlphaNumeric(normalizeCouponCode(value));
  if (!normalized) {
    return [];
  }

  let variants = new Set([normalized]);
  for (let index = 0; index < normalized.length; index += 1) {
    const alternatives = getEquivalentChars(normalized[index]);
    const next = new Set();
    for (const current of variants) {
      for (const alt of alternatives) {
        next.add(`${current.slice(0, index)}${alt}${current.slice(index + 1)}`);
      }
    }
    variants = next;
    if (variants.size > 128) {
      variants = new Set(Array.from(variants).slice(0, 128));
    }
  }

  return Array.from(variants);
};

const buildAmountCandidates = (amount) => {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) {
    return [];
  }

  const normalized = numericAmount.toFixed(2);
  const compact = normalized.replace(/\.00$/, "");
  const integerAmount = String(Math.round(numericAmount));

  return [...new Set([
    compact,
    integerAmount,
    normalized,
    `${compact}/-`,
    `${integerAmount}/-`,
    `rs${compact}`,
    `rs${integerAmount}`,
    `rs.${compact}`,
    `rs.${integerAmount}`,
    `rs ${compact}`,
    `rs ${integerAmount}`,
    `inr${compact}`,
    `inr${integerAmount}`,
    `₹${compact}`,
    `₹${integerAmount}`
  ])];
};

const CODE_ONLY_OFFER_PATTERNS = [
  "buy one get one",
  "buy 1 get 1",
  "buy1get1",
  "bogo",
  "1+1",
  "free item",
  "free coupon",
  "freebie",
  "free offer"
];

const isCodeOnlyOffer = (userInput = {}) => {
  const searchable = normalizeLooseText(
    [
      userInput.title,
      userInput.terms,
      userInput.customCategory,
      userInput.platformName,
      Array.isArray(userInput.categories) ? userInput.categories.join(" ") : userInput.categories
    ]
      .filter(Boolean)
      .join(" ")
  );

  return CODE_ONLY_OFFER_PATTERNS.some((pattern) => searchable.includes(pattern));
};

const buildVerificationPolicy = (userInput = {}, detectedExpiryDates = [], amountMatchedValue = "") => {
  const codeOnlyOffer = isCodeOnlyOffer(userInput);

  return {
    codeOnlyOffer,
    requiresCodeMatch: true,
    requiresExpiryMatch: !codeOnlyOffer || detectedExpiryDates.length > 0,
    requiresAmountMatch: !codeOnlyOffer || Boolean(amountMatchedValue)
  };
};

const detectDatesFromText = (text) => {
  const raw = String(text || "");
  const patterns = [
    /\b\d{4}-\d{2}-\d{2}\b/g,
    /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g,
    /\b\d{1,2}[.]\d{1,2}[.]\d{2,4}\b/g,
    /\b\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4}\b/g,
    /\b[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{2,4}\b/g
  ];

  const detectedDates = [];

  for (const pattern of patterns) {
    const matches = raw.match(pattern) || [];
    for (const candidate of matches) {
      const normalized = normalizeDate(candidate);
      if (normalized) {
        detectedDates.push(normalized);
      }
    }
  }

  return [...new Set(detectedDates)];
};

const buildPlatformCheck = (platformName, visibleText) => {
  const source = compactText(platformName);
  const target = compactText(visibleText);
  const similarity = percentSimilarity(source, target);
  const tokenMatch = source.split(/\s+/).filter(Boolean).every((token) => target.includes(token));

  return {
    similarity,
    matched: similarity >= 88 || tokenMatch
  };
};

const extractVisibleText = async (imagePath) => {
  try {
    const result = await recognize(imagePath, "eng", {
      logger: () => null
    });

    const text = result?.data?.text || "";
    const confidence = Number(result?.data?.confidence || 0);

    return {
      text,
      confidence,
      readable: compactText(text).length >= 8
    };
  } catch (error) {
    return {
      text: "",
      confidence: 0,
      readable: false,
      error: error?.message || "OCR failed"
    };
  }
};

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

const scoreCouponCodeMatch = (ocrText, expectedCode) => {
  const denseText = collapseAlphaNumeric(ocrText);
  const expected = collapseAlphaNumeric(normalizeCouponCode(expectedCode));

  if (!denseText || !expected) {
    return { matched: false, similarity: 0, extractedCode: "", mode: "missing" };
  }

  if (denseText.includes(expected)) {
    return { matched: true, similarity: 100, extractedCode: expectedCode, mode: "exact" };
  }

  const variants = buildCodeVariants(expected);
  if (variants.some((variant) => denseText.includes(variant))) {
    return { matched: true, similarity: 96, extractedCode: expectedCode, mode: "variant" };
  }

  let bestWindow = "";
  let bestSimilarity = 0;

  if (denseText.length >= expected.length) {
    for (let index = 0; index <= denseText.length - expected.length; index += 1) {
      const window = denseText.slice(index, index + expected.length);
      const similarity = percentSimilarity(expected, window);
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestWindow = window;
      }
    }
  } else {
    bestWindow = denseText;
    bestSimilarity = percentSimilarity(expected, denseText);
  }

  return {
    matched: bestSimilarity >= 85,
    similarity: bestSimilarity,
    extractedCode: bestWindow,
    mode: "fuzzy"
  };
};

const verifyCouponWithAI = async ({ imagePath, userInput }) => {
  const ocrResult = await extractVisibleText(imagePath);
  const visibleText = compactText(ocrResult.text);
  const collapsedVisibleText = collapseAlphaNumeric(visibleText);
  const normalizedCode = normalizeCouponCode(userInput.couponCode);
  const normalizedInputExpiryDate = normalizeDate(userInput.expiryDate);
  const detectedExpiryDates = detectDatesFromText(ocrResult.text);
  const extractedExpiryDate = detectedExpiryDates.includes(normalizedInputExpiryDate)
    ? normalizedInputExpiryDate
    : detectedExpiryDates[0] || null;
  const couponCodeCheck = scoreCouponCodeMatch(ocrResult.text, userInput.couponCode);
  const amountMatchedValue = buildAmountCandidates(userInput.couponAmount).find((candidate) =>
    collapsedVisibleText.includes(collapseAlphaNumeric(candidate))
  );
  const verificationPolicy = buildVerificationPolicy(userInput, detectedExpiryDates, amountMatchedValue);

  let tamperRisk = computeTamperRisk(imagePath, userInput);
  if (!ocrResult.readable) {
    tamperRisk = "high";
  } else if (ocrResult.confidence < 35 && tamperRisk !== "critical") {
    tamperRisk = "medium";
  }

  const couponCodeMatchedInImage = Boolean(normalizedCode) && couponCodeCheck.matched;
  const expiryDateMatchedInImage = Boolean(normalizedInputExpiryDate) && detectedExpiryDates.includes(normalizedInputExpiryDate);
  const amountMatchedInImage = Boolean(amountMatchedValue);
  const couponCodeMatch = verificationPolicy.requiresCodeMatch ? couponCodeMatchedInImage : true;
  const expiryDateMatch = verificationPolicy.requiresExpiryMatch ? expiryDateMatchedInImage : true;
  const amountMatch = verificationPolicy.requiresAmountMatch ? amountMatchedInImage : true;
  const ocrReadable = ocrResult.readable;

  const extractedData = {
    platformName: userInput.platformName,
    couponCode: couponCodeMatchedInImage ? userInput.couponCode : couponCodeCheck.extractedCode,
    couponAmount: amountMatchedInImage ? Number(userInput.couponAmount) : null,
    currency: amountMatchedInImage ? userInput.currency : "",
    expiryDate: extractedExpiryDate,
    detectedExpiryDates,
    terms: userInput.terms,
    confidenceScore: Math.round(ocrResult.confidence),
    visibleTextSnippet: buildSnippet(ocrResult.text),
    verificationPolicy
  };

  const failureReasons = [];
  if (!ocrReadable) {
    failureReasons.push("Screenshot text could not be read clearly. Upload a sharper image.");
  }
  if (verificationPolicy.requiresCodeMatch && !couponCodeMatchedInImage) {
    failureReasons.push(`Coupon code is not clearly visible in the uploaded screenshot. Expected ${userInput.couponCode}.`);
  }
  if (verificationPolicy.requiresExpiryMatch && !expiryDateMatchedInImage) {
    failureReasons.push("Expiry date does not match the uploaded screenshot.");
  }
  if (verificationPolicy.requiresAmountMatch && !amountMatchedInImage) {
    failureReasons.push("Coupon amount does not match the uploaded screenshot.");
  }

  const weightedChecks = [
    { required: true, matched: ocrReadable, weight: 10 },
    { required: verificationPolicy.requiresCodeMatch, matched: couponCodeMatchedInImage, weight: 40 },
    { required: verificationPolicy.requiresExpiryMatch, matched: expiryDateMatchedInImage, weight: 20 },
    { required: verificationPolicy.requiresAmountMatch, matched: amountMatchedInImage, weight: 20 }
  ];

  const possibleScore = weightedChecks.reduce((sum, check) => sum + (check.required ? check.weight : 0), 0);
  const earnedScore = weightedChecks.reduce(
    (sum, check) => sum + (check.required && check.matched ? check.weight : 0),
    0
  );
  const matchScore = possibleScore > 0 ? Math.round((earnedScore / possibleScore) * 100) : 0;

  const passed =
    ocrReadable &&
    couponCodeMatch &&
    expiryDateMatch &&
    amountMatch &&
    matchScore >= 90 &&
    tamperRisk !== "critical";

  return {
    extractedData,
    matchScore,
    status: passed ? "matched" : "mismatch",
    screenshotTamperRisk: tamperRisk,
    failureReasons,
    checks: {
      ocrReadable,
      couponCodeMatch,
      couponCodeMatchedInImage,
      expiryDateMatch,
      expiryDateMatchedInImage,
      selectedExpiryDate: normalizedInputExpiryDate,
      normalizedInputExpiryDate,
      detectedExpiryDates,
      amountMatch,
      amountMatchedInImage,
      requiresCodeMatch: verificationPolicy.requiresCodeMatch,
      requiresExpiryMatch: verificationPolicy.requiresExpiryMatch,
      requiresAmountMatch: verificationPolicy.requiresAmountMatch,
      codeOnlyOffer: verificationPolicy.codeOnlyOffer,
      couponCodeSimilarity: couponCodeCheck.similarity,
      couponCodeMatchMode: couponCodeCheck.mode
    }
  };
};

module.exports = { verifyCouponWithAI };
