export const brandCatalog = [
  { key: "amazon", label: "Amazon", logoPath: "/brands/amazon.svg" },
  { key: "flipkart", label: "Flipkart", logoPath: "/brands/flipkart.svg" },
  { key: "myntra", label: "Myntra", logoPath: "/brands/myntra.svg" },
  { key: "zomato", label: "Zomato", logoPath: "/brands/zomato.svg" },
  { key: "swiggy", label: "Swiggy", logoPath: "/brands/swiggy.svg" },
  { key: "netflix", label: "Netflix", logoPath: "/brands/netflix.svg" },
  { key: "spotify", label: "Spotify", logoPath: "/brands/spotify.svg" },
  { key: "playstation", label: "PlayStation", logoPath: "/brands/playstation.svg" }
];

export const resolveBrand = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  return brandCatalog.find((brand) => brand.key === normalized || brand.label.toLowerCase() === normalized) || null;
};
