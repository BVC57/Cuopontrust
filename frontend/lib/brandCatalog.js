export const brandCatalog = [
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

export const resolveBrand = (value) => {
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
