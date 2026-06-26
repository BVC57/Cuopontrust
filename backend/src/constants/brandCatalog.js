const brandCatalog = [
  { key: "amazon", label: "Amazon", aliases: ["amazon"], logoPath: "/brands/amazon.svg" },
  { key: "flipkart", label: "Flipkart", aliases: ["flipkart"], logoPath: "/brands/flipkart.svg" },
  { key: "myntra", label: "Myntra", aliases: ["myntra"], logoPath: "/brands/myntra.svg" },
  { key: "mcdonalds", label: "McDonalds", aliases: ["mcdonalds", "mcdonald", "mcdonalds india", "mcdonalds india", "mc donalds", "mc donalds india", "mcdonald's", "mcdonald's"], logoPath: "/brands/mcdonalds.svg" },
  { key: "zomato", label: "Zomato", aliases: ["zomato"], logoPath: "/brands/zomato.svg" },
  { key: "swiggy", label: "Swiggy", aliases: ["swiggy"], logoPath: "/brands/swiggy.svg" },
  { key: "netflix", label: "Netflix", aliases: ["netflix"], logoPath: "/brands/netflix.svg" },
  { key: "spotify", label: "Spotify", aliases: ["spotify"], logoPath: "/brands/spotify.svg" },
  { key: "playstation", label: "PlayStation", aliases: ["playstation", "play station", "ps"], logoPath: "/brands/playstation.svg" }
];

const normalizeBrandValue = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const collapseBrandValue = (value) => normalizeBrandValue(value).replace(/\s+/g, "");

const resolveBrand = (value) => {
  const normalized = normalizeBrandValue(value);
  const collapsed = collapseBrandValue(value);

  return (
    brandCatalog.find((brand) => {
      const candidates = [brand.key, brand.label, ...(brand.aliases || [])];
      return candidates.some((candidate) => {
        const normalizedCandidate = normalizeBrandValue(candidate);
        return normalizedCandidate === normalized || collapseBrandValue(candidate) === collapsed;
      });
    }) || null
  );
};

const detectBrandFromText = (value) => {
  const normalizedText = normalizeBrandValue(value);
  const collapsedText = collapseBrandValue(value);
  let bestMatch = null;

  for (const brand of brandCatalog) {
    const candidates = [brand.label, brand.key, ...(brand.aliases || [])];
    for (const candidate of candidates) {
      const normalizedCandidate = normalizeBrandValue(candidate);
      const collapsedCandidate = collapseBrandValue(candidate);
      const matched =
        (normalizedCandidate && normalizedText.includes(normalizedCandidate)) ||
        (collapsedCandidate && collapsedText.includes(collapsedCandidate));

      if (!matched) {
        continue;
      }

      const score = normalizedCandidate.length;
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { brand, score };
      }
    }
  }

  return bestMatch?.brand || null;
};

module.exports = {
  brandCatalog,
  resolveBrand,
  detectBrandFromText
};
