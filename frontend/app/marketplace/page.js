"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  ChevronDown,
  Filter,
  Headphones,
  Home,
  Lock,
  Search,
  ShieldCheck,
  Star,
  Shirt,
  Smartphone,
  Users,
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
import { brandCatalog } from "../../lib/brandCatalog";

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

const sanitizeCoupons = (items) =>
  Array.isArray(items)
    ? items.filter((item) => item && typeof item === "object" && item._id)
    : [];

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
        .then(({ data }) => setCoupons(sanitizeCoupons(data.coupons)))
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

  const renderFiltersPanel = () => (
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
      <section className="pb-6 pt-2">
        <div className="overflow-hidden rounded-[38px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.86)_0%,rgba(248,255,251,0.98)_100%)] p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-6">
          <div className="relative rounded-[32px] bg-[radial-gradient(circle_at_left_top,rgba(34,197,94,0.24),transparent_18%),radial-gradient(circle_at_right_top,rgba(59,130,246,0.18),transparent_18%),radial-gradient(circle_at_center_bottom,rgba(14,165,233,0.1),transparent_24%),linear-gradient(180deg,#ffffff_0%,#fafffb_100%)] px-4 py-8 sm:px-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),transparent)]" />
            <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[rgba(34,197,94,0.2)] blur-3xl" />
            <div className="pointer-events-none absolute left-10 top-1/2 h-56 w-56 rounded-full bg-[rgba(52,211,153,0.12)] blur-3xl" />
            <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-[rgba(59,130,246,0.2)] blur-3xl" />
            <div className="pointer-events-none absolute right-12 top-1/3 h-56 w-56 rounded-full bg-[rgba(96,165,250,0.12)] blur-3xl" />
            <div className="pointer-events-none absolute left-1/3 top-4 h-44 w-44 rounded-full bg-[rgba(110,231,183,0.12)] blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-1/2 h-52 w-80 -translate-x-1/2 rounded-full bg-[rgba(14,165,233,0.08)] blur-3xl" />

            <div className="pointer-events-none absolute left-2 top-8 hidden lg:block">
              <div className="relative h-[190px] w-[180px]">
                <div className="absolute left-8 top-14 h-[88px] w-[106px] rounded-b-[26px] rounded-t-[14px] bg-[#22c55e] shadow-[0_18px_28px_rgba(34,197,94,0.22)]" />
                <div className="absolute left-14 top-4 h-[52px] w-[92px] rounded-[18px] border-[8px] border-[#15803d] border-b-0" />
                <div className="absolute left-3 top-10 rotate-[-18deg] rounded-[16px] bg-[#facc15] px-3 py-4 text-sm font-black text-white shadow-[0_12px_26px_rgba(250,204,21,0.28)]">COUPON</div>
                <div className="absolute left-14 top-14 rotate-[12deg] rounded-[18px] bg-[#fb923c] px-4 py-5 text-sm font-black text-white shadow-[0_14px_28px_rgba(251,146,60,0.25)]">OFF</div>
                <div className="absolute left-24 top-18 rotate-[10deg] rounded-[18px] bg-[#0ea5e9] px-4 py-6 text-sm font-black text-white shadow-[0_16px_30px_rgba(14,165,233,0.24)]">SAVE</div>
                <div className="absolute left-0 top-6 h-8 w-8 rounded-full bg-[#fde68a] shadow-[0_10px_18px_rgba(251,191,36,0.24)]" />
                <div className="absolute left-28 top-0 h-8 w-8 rounded-full bg-[#bfdbfe] shadow-[0_10px_18px_rgba(59,130,246,0.2)]" />
              </div>
            </div>

            <div className="pointer-events-none absolute right-2 top-4 hidden lg:block">
              <div className="relative h-[210px] w-[220px]">
                <div className="absolute right-10 top-8 h-[130px] w-[120px] rounded-[26px] bg-[linear-gradient(180deg,#2563eb_0%,#1d4ed8_100%)] shadow-[0_22px_36px_rgba(37,99,235,0.24)]" />
                <div className="absolute right-0 top-16 h-[84px] w-[96px] rounded-[22px] bg-[linear-gradient(180deg,#38bdf8_0%,#0ea5e9_100%)] shadow-[0_18px_30px_rgba(14,165,233,0.2)]" />
                <div className="absolute right-28 top-18 h-[102px] w-[22px] rounded-full bg-[#4ade80]" />
                <div className="absolute right-56 top-34 rotate-[-42deg] rounded-[14px] bg-[#fb7185] px-2 py-3 text-xs font-black text-white">DEAL</div>
                <div className="absolute right-18 top-0 h-10 w-10 rounded-full bg-[#fcd34d] shadow-[0_10px_18px_rgba(251,191,36,0.24)]" />
                <div className="absolute right-52 top-42 h-10 w-10 rounded-full bg-[#86efac] shadow-[0_10px_18px_rgba(34,197,94,0.2)]" />
              </div>
            </div>

            <div className="mx-auto max-w-4xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-slate-700 shadow-[0_12px_24px_rgba(15,23,42,0.05)]">
                <span className="text-orange-500">🔥</span>
                India&apos;s 1st Coupon Buy &amp; Sell Platform
              </div>

              <h1 className="app-main-heading mt-5 font-black text-slate-950">
                Trusted Marketplace for
                <br />
                Real Coupon <span className="bg-[linear-gradient(90deg,#0ea5e9_0%,#2563eb_100%)] bg-clip-text text-transparent">Savings</span>
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-500">
                Browse verified deals, compare real discounts, and unlock secure coupon offers from trusted sellers across top brands.
              </p>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                {[
                  ["100% Verified", "Authentic Coupons", ShieldCheck, "bg-[#eefcf5] text-[#16a34a]"],
                  ["Secure Payments", "Safe & Protected", Lock, "bg-[#eff6ff] text-[#2563eb]"],
                  ["Trusted Community", "Real Buyers & Sellers", BadgeCheck, "bg-[#ecfeff] text-[#0891b2]"],
                  ["24/7 Support", "We're Here For You", Headphones, "bg-[#eff6ff] text-[#0ea5e9]"]
                ].map(([title, subtitle, Icon, tone]) => (
                  <div key={title} className="inline-flex items-center gap-3 rounded-full border border-white bg-white px-4 py-3 text-left shadow-[0_12px_24px_rgba(15,23,42,0.05)]">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${tone}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{title}</p>
                      <p className="text-xs font-medium text-slate-500">{subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            

            <div className="mt-5 rounded-[30px] border border-white bg-white p-5 shadow-[0_16px_30px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-[#16a34a]">
                    <Star className="h-4 w-4" />
                  </div>
                  <p className="text-xl font-black text-slate-900">Popular Brands</p>
                </div>
                <Link href="/marketplace" className="text-sm font-black text-[#16a34a]">
                  View All Brands
                </Link>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                {brandCatalog.map((brand) => (
                  <div
                    key={brand.key}
                    className="group rounded-[22px] border border-slate-100 bg-white px-3 py-4 text-center shadow-[0_10px_22px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(15,23,42,0.08)]"
                  >
                    <div className="mx-auto flex h-24 w-full items-center justify-center rounded-[18px] bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] transition duration-300 group-hover:scale-[1.06]">
                      <Image
                        src={brand.logoPath}
                        alt={brand.label}
                        width={110}
                        height={54}
                        className="h-12 w-[80%] object-contain transition duration-300 group-hover:scale-110"
                      />
                    </div>
                    <p className="mt-3 text-xs font-bold text-slate-600">{brand.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-[270px_minmax(0,1fr)]">
        <aside className="hidden xl:block">{renderFiltersPanel()}</aside>

        {mobileFiltersOpen ? (
          <div className="fixed inset-0 z-40 bg-slate-950/35 xl:hidden">
            <div className="absolute left-0 top-0 h-full w-full max-w-sm overflow-y-auto bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xl font-black text-slate-950">Filters</p>
                <button type="button" onClick={() => setMobileFiltersOpen(false)} className="rounded-full border border-slate-200 p-2">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {renderFiltersPanel()}
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
