"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, ShieldCheck, Star, Users } from "lucide-react";
import api, { resolveUploadUrl } from "../../lib/api";
import LoadingSpinner from "../../components/LoadingSpinner";

function SellerAvatar({ seller }) {
  const avatarUrl = resolveUploadUrl(seller?.avatar);
  const initials = String(seller?.name || "S")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (avatarUrl) {
    return <img src={avatarUrl} alt={seller?.name || "Seller"} className="h-16 w-16 rounded-2xl object-cover" />;
  }

  return <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-lg font-black text-emerald-700">{initials}</div>;
}

export default function SellersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let active = true;
    setLoading(true);

    api
      .get("/users/public/sellers", {
        params: {
          search: debouncedSearch || undefined
        }
      })
      .then(({ data }) => {
        if (active) {
          setSellers(data.sellers || []);
        }
      })
      .catch(() => {
        if (active) {
          setSellers([]);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [debouncedSearch]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-600">Seller Directory</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Search original seller profiles</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-500">
              Confirm who listed a coupon, review trust score, and open the seller profile before you buy.
            </p>
          </div>
          <Link href="/marketplace" className="text-sm font-black text-emerald-700">
            Back to marketplace
          </Link>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by seller name or email"
            className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none"
          />
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <LoadingSpinner label="Loading sellers..." />
        ) : sellers.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sellers.map((seller) => (
              <Link
                key={seller._id}
                href={`/sellers/${seller._id}`}
                className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_18px_34px_rgba(15,23,42,0.04)] transition hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <SellerAvatar seller={seller} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-xl font-black text-slate-950">{seller.name}</p>
                      {seller.isVerifiedSeller ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Verified Seller
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{seller.emailHint || "Email protected"}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                      <span className="rounded-full bg-slate-100 px-3 py-1">Trust {seller.trustScore}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">{seller.activeCouponsCount} active coupons</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">{seller.soldCouponsCount} sold</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-[26px] border border-slate-200 bg-white px-6 py-14 text-center shadow-[0_18px_34px_rgba(15,23,42,0.04)]">
            <Users className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-4 text-2xl font-black text-slate-950">No seller profiles found</p>
            <p className="mt-2 text-sm text-slate-500">Try a different seller name or email.</p>
          </div>
        )}
      </div>
    </div>
  );
}
