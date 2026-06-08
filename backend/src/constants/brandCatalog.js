const brandCatalog = [
  { key: "amazon", label: "Amazon", aliases: ["amazon"], logoPath: "/brands/amazon.svg" },
  { key: "flipkart", label: "Flipkart", aliases: ["flipkart"], logoPath: "/brands/flipkart.svg" },
  { key: "myntra", label: "Myntra", aliases: ["myntra"], logoPath: "/brands/myntra.svg" },
  { key: "zomato", label: "Zomato", aliases: ["zomato"], logoPath: "/brands/zomato.svg" },
  { key: "swiggy", label: "Swiggy", aliases: ["swiggy"], logoPath: "/brands/swiggy.svg" },
  { key: "netflix", label: "Netflix", aliases: ["netflix"], logoPath: "/brands/netflix.svg" },
  { key: "spotify", label: "Spotify", aliases: ["spotify"], logoPath: "/brands/spotify.svg" },
  { key: "playstation", label: "PlayStation", aliases: ["playstation", "ps"], logoPath: "/brands/playstation.svg" }
];

const normalizeBrandValue = (value) => String(value || "").trim().toLowerCase();

const resolveBrand = (value) => {
  const normalized = normalizeBrandValue(value);
  return (
    brandCatalog.find((brand) => normalized === brand.key || normalized === normalizeBrandValue(brand.label) || brand.aliases.includes(normalized)) ||
    null
  );
};

module.exports = {
  brandCatalog,
  resolveBrand
};
