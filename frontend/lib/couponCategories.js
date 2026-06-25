export const couponCategories = [
  {
    name: "Shopping",
    slug: "shopping",
    description: "Marketplace and retail deals across global shopping brands.",
    examples: ["Amazon", "Flipkart", "eBay", "Walmart"]
  },
  {
    name: "Food & Dining",
    slug: "food-dining",
    description: "Coupons for delivery apps, restaurant bookings, and dining rewards.",
    examples: ["Swiggy", "Zomato", "Uber Eats", "Dineout"]
  },
  {
    name: "Travel",
    slug: "travel",
    description: "General travel offers for bookings, stays, and trip planning.",
    examples: ["MakeMyTrip", "Booking.com", "Agoda", "Airbnb"]
  },
  {
    name: "Fashion",
    slug: "fashion",
    description: "Discounts on apparel, footwear, and lifestyle brands.",
    examples: ["Myntra", "Ajio", "Zara", "H&M"]
  },
  {
    name: "Electronics",
    slug: "electronics",
    description: "Savings on gadgets, appliances, and electronic stores.",
    examples: ["Croma", "Best Buy", "Reliance Digital"]
  },
  {
    name: "Grocery",
    slug: "grocery",
    description: "Offers for online grocery delivery and daily essentials.",
    examples: ["Blinkit", "Zepto", "BigBasket", "Instacart"]
  },
  {
    name: "Beauty",
    slug: "beauty",
    description: "Deals on beauty, skincare, and personal care products.",
    examples: ["Nykaa", "WOW", "Mamaearth"]
  },
  {
    name: "Healthcare",
    slug: "healthcare",
    description: "Coupons for medicine, diagnostics, and healthcare services.",
    examples: ["Apollo", "Tata 1mg", "PharmEasy"]
  },
  {
    name: "Entertainment",
    slug: "entertainment",
    description: "Streaming, OTT, and leisure membership discounts.",
    examples: ["Netflix", "Spotify", "Prime Video", "Disney+ Hotstar"]
  },
  {
    name: "Gaming",
    slug: "gaming",
    description: "Promotions for game stores, consoles, and memberships.",
    examples: ["Steam", "PlayStation", "Xbox", "Epic Games"]
  },
  {
    name: "Recharge",
    slug: "recharge",
    description: "Mobile recharge, telecom, and prepaid service offers.",
    examples: ["Jio", "Airtel", "Vi"]
  },
  {
    name: "Finance",
    slug: "finance",
    description: "Banking, wallet, cashback, and card-based coupon offers.",
    examples: ["Paytm", "PhonePe", "Google Pay", "HDFC"]
  },
  {
    name: "Education",
    slug: "education",
    description: "Student discounts, education offers, and learning benefits.",
    examples: ["GitHub Student", "Adobe Student"]
  },
  {
    name: "Software & SaaS",
    slug: "software-saas",
    description: "Coupons for software subscriptions and digital productivity tools.",
    examples: ["Adobe", "SaaS renewals", "AI tools"]
  },
  {
    name: "Gift Cards",
    slug: "gift-cards",
    description: "Unused gift card and prepaid voucher deals.",
    examples: ["Store gift cards", "Marketplace gift vouchers"]
  },
  {
    name: "Hotels",
    slug: "hotels",
    description: "Stay and accommodation savings across hotel brands.",
    examples: ["OYO", "Marriott", "Hilton"]
  },
  {
    name: "Flights",
    slug: "flights",
    description: "Airfare and airline booking coupons.",
    examples: ["IndiGo", "Air India", "Emirates"]
  },
  {
    name: "Automotive",
    slug: "automotive",
    description: "Vehicle service, accessories, and mobility-related offers.",
    examples: ["Ride-sharing", "auto care", "mobility perks"]
  },
  {
    name: "Home & Furniture",
    slug: "home-furniture",
    description: "Savings on home decor, furniture, and household upgrades.",
    examples: ["home stores", "furniture marketplaces"]
  },
  {
    name: "Sports",
    slug: "sports",
    description: "Deals on sportswear, equipment, and active lifestyle products.",
    examples: ["sports brands", "fitness gear"]
  },
  {
    name: "Pets",
    slug: "pets",
    description: "Coupons for pet care, food, and accessories.",
    examples: ["pet stores", "pet wellness services"]
  },
  {
    name: "Kids",
    slug: "kids",
    description: "Family, toys, learning, and kids-focused shopping offers.",
    examples: ["kids brands", "toy stores", "family deals"]
  },
  {
    name: "Events",
    slug: "events",
    description: "Event passes, exhibitions, and local experience discounts.",
    examples: ["trade shows", "event platforms", "local events"]
  },
  {
    name: "Subscription",
    slug: "subscription",
    description: "Renewal, membership, and recurring plan savings.",
    examples: ["Prime memberships", "retention discounts", "subscriptions"]
  },
  {
    name: "Local Deals",
    slug: "local-deals",
    description: "Hyperlocal offers from nearby merchants and service providers.",
    examples: ["city offers", "neighborhood merchants"]
  },
  {
    name: "Luxury Brands",
    slug: "luxury-brands",
    description: "Premium and aspirational brand discount opportunities.",
    examples: ["designer labels", "premium retail"]
  },
  {
    name: "International Offers",
    slug: "international-offers",
    description: "Cross-border and globally redeemable coupon opportunities.",
    examples: ["global retailers", "international travel", "worldwide offers"]
  }
];

export const popularCouponCategoryNames = [
  "Shopping",
  "Food & Dining",
  "Travel",
  "Fashion",
  "Electronics",
  "Grocery",
  "Entertainment",
  "Gaming"
];

export const popularCouponCategories = popularCouponCategoryNames
  .map((name) => couponCategories.find((category) => category.name === name))
  .filter(Boolean);

export const normalizeCouponCategory = (category) => {
  const value = String(category || "").trim();
  if (!value) return "";

  const aliasMap = {
    "e-commerce": "Shopping",
    ecommerce: "Shopping",
    shopping: "Shopping",
    "food delivery": "Food & Dining",
    "food & dining": "Food & Dining",
    food: "Food & Dining",
    grocery: "Grocery",
    fashion: "Fashion",
    electronics: "Electronics",
    travel: "Travel",
    flights: "Flights",
    hotels: "Hotels",
    streaming: "Entertainment",
    entertainment: "Entertainment",
    gaming: "Gaming",
    "recharge & telecom": "Recharge",
    recharge: "Recharge",
    finance: "Finance",
    "wallets & payments": "Finance",
    "credit card offers": "Finance",
    "debit card offers": "Finance",
    beauty: "Beauty",
    "beauty & personal care": "Beauty",
    healthcare: "Healthcare",
    education: "Education",
    "software & saas": "Software & SaaS",
    "gift cards": "Gift Cards",
    automotive: "Automotive",
    "home & furniture": "Home & Furniture",
    sports: "Sports",
    pets: "Pets",
    kids: "Kids",
    events: "Events",
    subscription: "Subscription",
    "local deals": "Local Deals",
    "luxury brands": "Luxury Brands",
    "international offers": "International Offers"
  };

  return aliasMap[value.toLowerCase()] || value;
};
