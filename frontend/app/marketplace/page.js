"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, Search, SlidersHorizontal, Star, X } from "lucide-react";
import api from "../../lib/api";
import CouponCard from "../../components/CouponCard";
import LoadingSpinner from "../../components/LoadingSpinner";

const quickFilters = ["All", "Popular", "Latest", "Ending soon"];
const baseCategories = ["All Categories", "Electronics", "Food", "Fashion", "Travel", "Entertainment", "Gaming"];

const getSortValue = (filter) => {
  if (filter === "Popular") return "popular";
  if (filter === "Ending soon") return "ending_soon";
  return "latest";
};

export default function MarketplacePage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [quickFilter, setQuickFilter] = useState("All");
  const [minDiscount, setMinDiscount] = useState(10);
  const [maxPrice, setMaxPrice] = useState(10000);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      api.get("/coupons", {
        params: {
          search: search || undefined,
          category: selectedCategory !== "All Categories" ? selectedCategory : undefined,
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
    const dynamicCategories = coupons.flatMap((coupon) => coupon.categories || []);
    return [...new Set([...baseCategories, ...dynamicCategories])];
  }, [coupons]);

  const activeFilterText = selectedCategory === "All Categories" ? "All categories" : selectedCategory;

  const FiltersPanel = (
    <div className="rounded-[24px] border border-slate-200 bg-[#f7f8f9] p-5">
      <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </div>
        <button className="xl:hidden" onClick={() => setMobileFiltersOpen(false)}>
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-6 space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Categories</p>
          <div className="mt-3 space-y-2">
            {categories.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    active
                      ? "border-[#1d74f5] bg-[#1d74f5] text-white"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Discount</p>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={minDiscount}
            onChange={(event) => setMinDiscount(Number(event.target.value))}
            className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-[#1d74f5]"
          />
          <div className="mt-2 flex justify-between text-xs text-slate-500">
            <span>{minDiscount}%</span>
            <span>100%</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Price Range</p>
          <input
            type="range"
            min="100"
            max="10000"
            step="100"
            value={maxPrice}
            onChange={(event) => setMaxPrice(Number(event.target.value))}
            className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-[#1d74f5]"
          />
          <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            Rs 0 - Rs {maxPrice.toLocaleString("en-IN")}
          </div>
        </div>

        <button
          onClick={() => setMobileFiltersOpen(false)}
          className="w-full rounded-2xl bg-[#1d74f5] px-4 py-3 text-sm font-semibold text-white"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold text-[#002f34] sm:text-4xl">Fresh recommendations</h1>
      <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row">
          <aside className="hidden xl:block xl:w-[280px] xl:shrink-0">
            {FiltersPanel}
          </aside>

          {mobileFiltersOpen ? (
            <div className="fixed inset-0 z-40 bg-slate-950/30 xl:hidden">
              <div className="absolute left-0 top-0 h-full w-full max-w-sm overflow-y-auto bg-white p-4">
                {FiltersPanel}
              </div>
            </div>
          ) : null}

          <section className="min-w-0 flex-1">
            <div className="rounded-[24px] border border-slate-200 bg-[#f7f8f9] p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search coupons, brands or stores..."
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                  />
                </div>
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 xl:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </button>
                <div className="hidden xl:flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600">
                  {activeFilterText} • {coupons.length} results
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {quickFilters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setQuickFilter(filter)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                      quickFilter === filter ? "bg-[#1d74f5] text-white" : "border border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-3xl font-bold text-[#002f34]">Verified marketplace</h2>
                <p className="mt-2 text-sm text-slate-500">AI-approved coupons, protected checkout, and trust-backed sellers.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                Rated 4.9 by buyers
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              <span>Category: {activeFilterText}</span>
              <span>•</span>
              <span>Min discount: {minDiscount}%</span>
              <span>•</span>
              <span>Max price: Rs {maxPrice.toLocaleString("en-IN")}</span>
            </div>

            <div className="mt-6">
              {loading ? (
                <LoadingSpinner label="Loading coupons..." />
              ) : coupons.length ? (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {coupons.map((coupon) => (
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
        </div>
      </div>
    </div>
  );
}

