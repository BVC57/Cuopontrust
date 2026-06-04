const normalizeText = (value = "") => value.toString().trim().toLowerCase();

const normalizeCouponCode = (value = "") =>
  normalizeText(value).replace(/[\s-]+/g, "");

const percentSimilarity = (left = "", right = "") => {
  const a = normalizeText(left);
  const b = normalizeText(right);

  if (!a && !b) {
    return 100;
  }

  const longer = a.length > b.length ? a : b;
  const shorter = longer === a ? b : a;

  if (!longer.length) {
    return 100;
  }

  let matches = 0;
  for (const char of shorter) {
    if (longer.includes(char)) {
      matches += 1;
    }
  }

  return Math.round((matches / longer.length) * 100);
};

module.exports = { normalizeText, normalizeCouponCode, percentSimilarity };
