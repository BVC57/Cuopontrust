"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Filter,
  Home,
  Search,
  Shirt,
  Smartphone,
  UtensilsCrossed,
  Plane,
  Sparkles,
  Ticket,
  Tag,
  X
} from "lucide-react";
import api from "../../lib/api";
import CouponCard from "../../components/CouponCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import PageHero from "../../components/PageHero";
import { marketingContent } from "../../lib/marketingContent";

const topTabs = ["All", "Coupons", "Deals", "Exclusive"];
const categoryIcons = {
  Fashion: Shirt,
  Electronics: Smartphone,
  Food: UtensilsCrossed,
  Travel: Plane
};

const normalizeCategory = (category) => {
  const value = String(category || "").trim();
  if (!value) return "";
  if (value.toLowerCase() === "food & dining") return "Food";
  return value;
};

const getSortValue = (value) => {
  if (value === "Popular") return "popular";
  if (value === "Ending Soon") return "ending_soon";
  return "latest";
};

const countByTab = (tab, coupons) => {
  if (tab === "All") return coupons.length;
  if (tab === "Coupons") return coupons.filter((coupon) => !String(coupon.title || "").toLowerCase().includes("deal")).length;
  if (tab === "Deals") return coupons.filter((coupon) => String(coupon.title || "").toLowerCase().includes("deal") || String(coupon.title || "").toLowerCase().includes("off")).length;
  if (tab === "Exclusive") return coupons.filter((coupon) => Number(coupon.couponAmount) - Number(coupon.sellingPrice) >= 100).length;
  return coupons.length;
};

export default function MarketplacePage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStore, setSelectedStore] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [sortBy, setSortBy] = useState("Popular");
  const [validity, setValidity] = useState("All Time");

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      api.get("/coupons", {
        params: {
          search: search || undefined,
          category: selectedCategory !== "All" ? selectedCategory : undefined,
          platformName: selectedStore || undefined,
          sort: getSortValue(sortBy)
        }
      })
        .then(({ data }) => setCoupons(data.coupons || []))
        .catch(() => setCoupons([]))
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedStore, sortBy]);

  const categories = useMemo(() => {
    const mapped = coupons.flatMap((coupon) => (coupon.categories || []).map(normalizeCategory));
    const base = ["Fashion", "Electronics", "Food", "Travel"];
    return ["All", ...new Set([...base, ...mapped.filter(Boolean)])];
  }, [coupons]);

  const stores = useMemo(() => {
    return [...new Set(coupons.map((coupon) => coupon.platformName).filter(Boolean))].slice(0, 6);
  }, [coupons]);

  const filteredCoupons = useMemo(() => {
    const now = new Date();
    return coupons.filter((coupon) => {
      if (activeTab === "Exclusive" && !(Number(coupon.couponAmount) - Number(coupon.sellingPrice) >= 100)) {
        return false;
      }
      if (activeTab === "Deals" && !String(coupon.title || "").toLowerCase().match(/deal|off|discount|flat|buy/)) {
        return false;
      }
      if (activeTab === "Coupons" && String(coupon.title || "").toLowerCase().includes("deal")) {
        return false;
      }

      if (validity === "All Time" || !coupon.expiryDate) {
        return true;
      }

      const expiry = new Date(coupon.expiryDate);
      const dayDiff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (validity === "Today") return dayDiff <= 1;
      if (validity === "This Week") return dayDiff <= 7;
      return dayDiff <= 31;
    });
  }, [coupons, activeTab, validity]);

  const counts = useMemo(() => {
    const categoryCounts = {};
    categories.forEach((category) => {
      categoryCounts[category] = category === "All"
        ? coupons.length
        : coupons.filter((coupon) => (coupon.categories || []).map(normalizeCategory).includes(category)).length;
    });

    const storeCounts = {};
    stores.forEach((store) => {
      storeCounts[store] = coupons.filter((coupon) => coupon.platformName === store).length;
    });

    return { categoryCounts, storeCounts };
  }, [categories, stores, coupons]);

  const FiltersPanel = (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_34px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between">
        <p className="text-2xl font-black text-slate-950">Filters</p>
        <button
          type="button"
          onClick={() => {
            setSelectedCategory("All");
            setSelectedStore("");
            setValidity("All Time");
          }}
          className="text-sm font-bold text-[#16a34a]"
        >
          Clear All
        </button>
      </div>

      <div className="mt-6 border-t border-slate-100 pt-5">
        <div className="flex items-center justify-between">
          <p className="text-lg font-black text-slate-900">Categories</p>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>
        <div className="mt-4 space-y-3">
          {categories.slice(1, 6).map((category) => {
            const Icon = categoryIcons[category] || Tag;
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm font-semibold ${
                  active ? "bg-emerald-50 text-emerald-700" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  {category}
                </span>
                <span className="text-slate-400">{counts.categoryCounts[category] || 0}</span>
              </button>
            );
          })}
          <button type="button" onClick={() => setSelectedCategory("All")} className="pt-2 text-sm font-bold text-[#16a34a]">
            View All Categories
          </button>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-100 pt-5">
        <div className="flex items-center justify-between">
          <p className="text-lg font-black text-slate-900">Store</p>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>
        <div className="mt-4 rounded-2xl border border-slate-200 px-3 py-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Search className="h-4 w-4" />
            <input
              value={selectedStore}
              onChange={(event) => setSelectedStore(event.target.value)}
              placeholder="Search for store"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {stores.map((store) => {
            const active = selectedStore === store;
            return (
              <button
                key={store}
                type="button"
                onClick={() => setSelectedStore(active ? "" : store)}
                className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm font-semibold ${
                  active ? "bg-emerald-50 text-emerald-700" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{store}</span>
                <span className="text-slate-400">{counts.storeCounts[store] || 0}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 border-t border-slate-100 pt-5">
        <div className="flex items-center justify-between">
          <p className="text-lg font-black text-slate-900">Offer Validity</p>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>
        <div className="mt-4 space-y-3">
          {["All Time", "Today", "This Week", "This Month"].map((option) => (
            <label key={option} className="flex cursor-pointer items-center justify-between rounded-2xl px-3 py-2.5 hover:bg-slate-50">
              <span className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <input
                  type="radio"
                  name="validity"
                  checked={validity === option}
                  onChange={() => setValidity(option)}
                  className="h-4 w-4 accent-[#16a34a]"
                />
                {option}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <PageHero
        eyebrow="India's first coupon buy & sell platform"
        title="All Coupons & Offers"
        description={marketingContent.heroSubheading}
      >
        <div className="flex flex-wrap items-center gap-3">
          {marketingContent.trustBadges.map((badge) => (
            <span key={badge} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
              {badge}
            </span>
          ))}
        </div>
      </PageHero>

      <div className="mt-8 grid gap-6 xl:grid-cols-[270px_minmax(0,1fr)]">
        <aside className="hidden xl:block">{FiltersPanel}</aside>

        {mobileFiltersOpen ? (
          <div className="fixed inset-0 z-40 bg-slate-950/35 xl:hidden">
            <div className="absolute left-0 top-0 h-full w-full max-w-sm overflow-y-auto bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xl font-black text-slate-950">Filters</p>
                <button type="button" onClick={() => setMobileFiltersOpen(false)} className="rounded-full border border-slate-200 p-2">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {FiltersPanel}
            </div>
          </div>
        ) : null}

        <section className="min-w-0">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_34px_rgba(15,23,42,0.04)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search for stores, categories or offers..."
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 xl:hidden"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </button>
                <div className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                  Sort by:{" "}
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="bg-transparent font-black outline-none"
                  >
                    <option>Popular</option>
                    <option>Latest</option>
                    <option>Ending Soon</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-slate-400">
              <Home className="h-4 w-4" />
              <span>Home</span>
              <span>&gt;</span>
              <span>All Coupons &amp; Offers</span>
            </div>

            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-950">Browse filtered savings</h2>
                <p className="mt-2 max-w-3xl text-base text-slate-500">Search, sort, and refine the best live offers across brands and categories.</p>
              </div>
              <p className="text-sm font-semibold text-slate-500">
                Showing 1-{filteredCoupons.length} of {coupons.length || filteredCoupons.length} offers
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {topTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-black ${
                    activeTab === tab
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {tab === "All" ? <GridIcon /> : tab === "Coupons" ? <Ticket className="h-4 w-4" /> : tab === "Deals" ? <Tag className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                  {tab} ({countByTab(tab, coupons)})
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            {loading ? (
              <LoadingSpinner label="Loading coupons..." />
            ) : filteredCoupons.length ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredCoupons.map((coupon) => (
                  <CouponCard key={coupon._id} coupon={coupon} />
                ))}
              </div>
            ) : (
              <div className="rounded-[24px] border border-slate-200 bg-white px-6 py-16 text-center shadow-[0_18px_34px_rgba(15,23,42,0.04)]">
                <p className="text-3xl font-black text-slate-950">No coupons found</p>
                <p className="mt-3 text-sm text-slate-500">Try changing your store, category, or validity filters.</p>
              </div>
            )}
          </div>

          <div className="mt-6 grid gap-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_34px_rgba(15,23,42,0.04)] md:grid-cols-2 xl:grid-cols-4">
            {[
              ["100% Verified", "All coupons are manually verified", "bg-emerald-50 text-emerald-600"],
              ["Best Savings", "Get the best deals & exclusive offers", "bg-rose-50 text-rose-500"],
              ["Secure & Safe", "Your data and payments are 100% secure", "bg-sky-50 text-sky-600"],
              ["24/7 Support", "We’re here to help you anytime", "bg-violet-50 text-violet-600"]
            ].map(([title, description, tone]) => (
              <div key={title} className="flex items-start gap-4 rounded-[18px] bg-slate-50 p-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${tone}`}>
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-black text-slate-900">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function GridIcon() {
  return (
    <span className="inline-grid grid-cols-2 gap-0.5">
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
    </span>
  );
}
