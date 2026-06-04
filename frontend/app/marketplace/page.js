"use client";

import { useEffect, useState } from "react";
import { Filter, Search, SlidersHorizontal, Star } from "lucide-react";
import api from "../../lib/api";
import CouponCard from "../../components/CouponCard";
import LoadingSpinner from "../../components/LoadingSpinner";

const quickFilters = ["All", "Popular", "Latest", "Ending soon"];
const categories = ["All Categories", "Electronics", "Food", "Fashion", "Travel", "Entertainment", "Gaming"];

export default function MarketplacePage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/coupons")
      .then(({ data }) => {
        setCoupons(data.coupons || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6">
      <h1 className="text-4xl font-bold text-[#002f34]">Fresh recommendations</h1>
      <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row">
          <aside className="xl:w-[280px] xl:shrink-0">
            <div className="rounded-[24px] border border-slate-200 bg-[#f7f8f9] p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Filter className="h-4 w-4" />
                Filters
              </div>
              <div className="mt-6 space-y-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Categories</p>
                  <div className="mt-3 space-y-2">
                    {categories.map((category) => (
                      <div key={category} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                        {category}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Discount</p>
                  <div className="mt-3 h-2 rounded-full bg-slate-200">
                    <div className="h-2 w-2/3 rounded-full bg-[#1d74f5]" />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-slate-500">
                    <span>10%</span>
                    <span>100%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Price Range</p>
                  <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">Rs 0 - Rs 10,000</div>
                </div>
                <button className="w-full rounded-2xl bg-[#1d74f5] px-4 py-3 text-sm font-semibold text-white">
                  Apply Filters
                </button>
              </div>
            </div>
          </aside>

          <section className="min-w-0 flex-1">
            <div className="rounded-[24px] border border-slate-200 bg-[#f7f8f9] p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input placeholder="Search coupons, brands or stores..." className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
                </div>
                <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {quickFilters.map((filter, index) => (
                  <button
                    key={filter}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold ${index === 0 ? "bg-[#1d74f5] text-white" : "border border-slate-200 bg-white text-slate-600"}`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-[#002f34]">Verified marketplace</h2>
                <p className="mt-2 text-sm text-slate-500">AI-approved coupons, protected checkout, and trust-backed sellers.</p>
              </div>
              <div className="hidden items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 lg:flex">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                Rated 4.9 by buyers
              </div>
            </div>

            <div className="mt-6">
              {loading ? (
                <LoadingSpinner label="Loading coupons..." />
              ) : (
                <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
                  {coupons.map((coupon) => (
                    <CouponCard key={coupon._id} coupon={coupon} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
