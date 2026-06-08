"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Filter, Search, ShieldCheck, ShoppingBag, Sparkles, Star, Truck, X } from "lucide-react";
import api from "../../lib/api";
import CouponCard from "../../components/CouponCard";
import LoadingSpinner from "../../components/LoadingSpinner";

const quickFilters = ["All", "Top Rated", "Most Used", "Ending Soon"];
const searchPills = ["Amazon Offers", "Myntra Coupons", "Zomato Deals", "Flipkart Offers", "Swiggy Offers", "Ajio Coupons", "Nykaa Offers", "FirstCry Offers"];
const baseCategories = [
  "All Coupons",
  "Fashion",
  "Electronics",
  "Food & Dining",
  "Travel",
  "Beauty & Health",
  "Home & Kitchen",
  "Grocery",
  "Sports & Fitness",
  "Books & Education",
  "Gaming",
  "Entertainment",
  "Automotive"
];

const categoryIcons = {
  "All Coupons": "🎟️",
  Fashion: "👗",
  Electronics: "📱",
  "Food & Dining": "🍽️",
  Travel: "✈️",
  "Beauty & Health": "💄",
  "Home & Kitchen": "🏠",
  Grocery: "🛒",
  "Sports & Fitness": "🏅",
  "Books & Education": "📚",
  Gaming: "🎮",
  Entertainment: "🎬",
  Automotive: "🚗"
};

const normalizeCategory = (category) => {
  if (category === "Food") return "Food & Dining";
  return category;
};

const getSortValue = (filter) => {
  if (filter === "Top Rated" || filter === "Most Used") return "popular";
  if (filter === "Ending Soon") return "ending_soon";
  return "latest";
};

export default function MarketplacePage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Coupons");
  const [quickFilter, setQuickFilter] = useState("All");
  const [minDiscount, setMinDiscount] = useState(10);
  const [maxPrice, setMaxPrice] = useState(10000);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      api.get("/coupons", {
        params: {
          search: search || undefined,
          category: selectedCategory !== "All Coupons" ? selectedCategory : undefined,
          sort: getSortValue(quickFilter),
          minDiscount,
          maxPrice
        }
      })
        .then(({ data }) => setCoupons(data.coupons || []))
        .catch(() => setCoupons([]))
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [search, selectedCategory, quickFilter, minDiscount, maxPrice]);

  const categories = useMemo(() => {
    const mapped = coupons.flatMap((coupon) => (coupon.categories || []).map(normalizeCategory));
    return [...new Set([...baseCategories, ...mapped])];
  }, [coupons]);

  const categoryCounts = useMemo(() => {
    const counts = {};
    categories.forEach((category) => {
      if (category === "All Coupons") {
        counts[category] = coupons.length;
      } else {
        counts[category] = coupons.filter((coupon) =>
          (coupon.categories || []).map(normalizeCategory).includes(category)
        ).length;
      }
    });
    return counts;
  }, [categories, coupons]);

  const featuredCoupons = coupons.slice(0, 5);
  const bestDeals = coupons.slice(5, 10).length ? coupons.slice(5, 10) : coupons.slice(0, 5);

  const FiltersPanel = (
    <div className="rounded-[30px] border border-emerald-100 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
      <p className="text-lg font-black text-slate-900">Categories</p>
      <div className="mt-4 space-y-2">
        {categories.map((category) => {
          const active = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setMobileFiltersOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                active ? "bg-emerald-50 text-[#16a34a]" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-3">
                <span>{categoryIcons[category] || "•"}</span>
                {category}
              </span>
              <span className="text-xs">{categoryCounts[category] || 0}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-[26px] bg-[linear-gradient(180deg,#f6fff8_0%,#ffffff_100%)] p-5">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-[#16a34a]">
          <ShoppingBag className="h-5 w-5" />
        </div>
        <p className="mt-4 text-lg font-black text-slate-900">Sell Unused Coupons</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">Turn your unused coupons into real cash</p>
        <a href="/sell" className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-[#16a34a] px-4 py-3 text-sm font-bold text-white">
          Start Selling
        </a>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden xl:block">
          {FiltersPanel}
        </aside>

        {mobileFiltersOpen ? (
          <div className="fixed inset-0 z-40 bg-slate-950/30 xl:hidden">
            <div className="absolute left-0 top-0 h-full w-full max-w-sm overflow-y-auto bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-lg font-black text-slate-900">Filters</p>
                <button onClick={() => setMobileFiltersOpen(false)} className="rounded-full border border-slate-200 p-2">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {FiltersPanel}
            </div>
          </div>
        ) : null}

        <section className="min-w-0 space-y-6">
          <div className="rounded-[32px] border border-emerald-100 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
            <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[30px] bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.14),transparent_26%),linear-gradient(135deg,#fbfffc_0%,#f4fff7_50%,#ffffff_100%)] p-6">
                <p className="text-2xl font-black text-slate-900">India&apos;s Most Trusted</p>
                <h1 className="mt-1 text-5xl font-black leading-[1.05] text-[#16a34a]">Coupon Marketplace</h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                  Buy verified coupons from trusted sellers and save up to 70% on 1000+ brands across every category.
                </p>
                <div className="mt-6 flex flex-wrap gap-5 text-sm font-semibold text-slate-600">
                  <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#16a34a]" />Verified Coupons</span>
                  <span className="inline-flex items-center gap-2"><Star className="h-4 w-4 text-[#16a34a]" />Secure Payments</span>
                  <span className="inline-flex items-center gap-2"><Truck className="h-4 w-4 text-[#16a34a]" />Instant Delivery</span>
                  <span className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#16a34a]" />24/7 Support</span>
                </div>
              </div>

              <div className="rounded-[30px] bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.16),transparent_28%),linear-gradient(135deg,#f8fff9_0%,#ecfff1_100%)] p-6">
                <div className="flex h-full items-center justify-center">
                  <div className="relative h-[220px] w-full max-w-[420px]">
                    <div className="absolute left-10 top-8 rounded-[24px] bg-[#ffe0eb] px-5 py-6 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
                      <p className="text-sm font-black text-slate-900">50% OFF</p>
                      <p className="mt-1 text-xl font-black text-[#ef476f]">Myntra</p>
                    </div>
                    <div className="absolute right-10 top-0 rounded-[24px] bg-[#fff7e8] px-5 py-6 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
                      <p className="text-sm font-black text-slate-900">20% OFF</p>
                      <p className="mt-1 text-xl font-black text-[#b45309]">amazon</p>
                    </div>
                    <div className="absolute left-1/2 top-10 flex h-[150px] w-[140px] -translate-x-1/2 items-center justify-center rounded-[30px] bg-[linear-gradient(180deg,#23c45e_0%,#149a46_100%)] shadow-[0_24px_50px_rgba(34,197,94,0.28)]">
                      <ShoppingBag className="h-16 w-16 text-white" />
                    </div>
                    <div className="absolute right-14 bottom-10 rounded-[24px] bg-[#e8fff0] px-5 py-6 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
                      <p className="text-sm font-black text-slate-900">40% OFF</p>
                      <p className="mt-1 text-xl font-black text-[#16a34a]">zomato</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search coupons, brands or stores..."
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                />
              </div>
              <button onClick={() => setMobileFiltersOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 xl:hidden">
                <Filter className="h-4 w-4" />
                Filters
              </button>
            </div>
          </div>

          <section className="rounded-[30px] border border-emerald-100 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
            <p className="text-sm font-black text-slate-900">Popular Searches</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {searchPills.map((item) => (
                <button key={item} onClick={() => setSearch(item.replace(/ Offers| Coupons| Deals/g, ""))} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">
                  {item}
                </button>
              ))}
              <button className="ml-auto hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 lg:inline-flex">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </section>

          <section className="rounded-[30px] border border-emerald-100 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between">
              <p className="text-2xl font-black text-slate-900">Top Categories</p>
              <button className="text-sm font-bold text-[#16a34a]">View All</button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
              {categories.slice(1, 7).map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="flex items-center gap-3 rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-left"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-lg">
                    {categoryIcons[category] || "•"}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">{category}</p>
                    <p className="text-xs text-slate-400">{categoryCounts[category] || 0} Coupons</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[30px] border border-emerald-100 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-2xl font-black text-slate-900">Featured Coupons</p>
                <p className="mt-1 text-sm text-slate-500">Showing secure, verified deals with hidden codes until payment.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickFilters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setQuickFilter(filter)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      quickFilter === filter ? "bg-[#16a34a] text-white" : "border border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              {loading ? (
                <LoadingSpinner label="Loading featured coupons..." />
              ) : featuredCoupons.length ? (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                  {featuredCoupons.map((coupon) => (
                    <CouponCard key={coupon._id} coupon={coupon} />
                  ))}
                </div>
              ) : (
                <div className="rounded-[24px] border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
                  No coupons match the selected filters.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[30px] border border-emerald-100 bg-[linear-gradient(180deg,#f7fff8_0%,#ffffff_100%)] p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-2xl font-black text-slate-900">Best Deals of the Day</p>
                <p className="mt-1 text-sm text-slate-500">Trending deals selected from today&apos;s best marketplace offers.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white px-4 py-3 text-center shadow-[0_10px_25px_rgba(15,23,42,0.05)]">
                  <p className="text-xs font-black text-slate-400">Offer ends in:</p>
                  <p className="mt-1 text-sm font-black text-slate-900">12h 45m 30s</p>
                </div>
                <button className="rounded-2xl bg-[#16a34a] px-5 py-3 text-sm font-bold text-white">View All Deals</button>
              </div>
            </div>

            <div className="mt-6">
              {loading ? (
                <LoadingSpinner label="Loading best deals..." />
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                  {bestDeals.map((coupon) => (
                    <CouponCard key={`best-${coupon._id}`} coupon={coupon} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}
