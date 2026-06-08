"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Heart, Star } from "lucide-react";
import { isAuthenticated } from "../lib/auth";
import { formatMoney } from "../lib/format";
import { resolveBrand } from "../lib/brandCatalog";

export default function CouponCard({ coupon }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const brand = coupon.platformBrandKey ? resolveBrand(coupon.platformBrandKey) : resolveBrand(coupon.platformName);
  const logoPath = coupon.platformLogoPath || brand?.logoPath || "";
  const highlightedTitle = String(coupon.title || "").trim().toUpperCase() || `${coupon.platformName} OFFER`;

  useEffect(() => {
    setLoggedIn(isAuthenticated());
  }, []);

  const cta = loggedIn ? `/coupons/${coupon._id}` : "/login";

  return (
    <div className="overflow-hidden rounded-[26px] border border-emerald-100 bg-white shadow-[0_16px_42px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(34,197,94,0.12)]">
      <div className="border-b border-emerald-50 bg-gradient-to-br from-[#ffffff] via-[#fbfffc] to-[#f1fff6] p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            {logoPath ? (
              <div className="flex h-11 items-center">
                <Image src={logoPath} alt={coupon.platformName} width={124} height={34} className="h-8 w-auto object-contain" />
              </div>
            ) : (
              <p className="text-2xl font-black uppercase tracking-tight text-slate-900">{coupon.platformName}</p>
            )}
            <p className="mt-4 max-w-[11rem] text-4xl font-black uppercase leading-[1.02] tracking-tight text-slate-950">
              {highlightedTitle}
            </p>
            <p className={`mt-3 rounded-full px-3 py-1 text-[11px] font-bold ${coupon.revealedCouponCode ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
              {coupon.revealedCouponCode ? `Code: ${coupon.revealedCouponCode}` : "Code hidden until payment"}
            </p>
          </div>
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100 bg-white text-slate-400">
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-5">
        <p className="line-clamp-2 text-sm font-bold uppercase tracking-[0.08em] text-slate-500">
          {coupon.platformName} OFFER
        </p>
        <div className="mt-4 flex items-end gap-3">
          <p className="text-2xl font-black text-[#16a34a]">{formatMoney(coupon.sellingPrice, coupon.currency)}</p>
          <p className="text-sm font-semibold text-slate-400 line-through">{formatMoney(coupon.couponAmount, coupon.currency)}</p>
        </div>
        <p className="mt-2 text-xs font-medium text-slate-400">On {coupon.platformName} purchases</p>
        {(coupon.categories || []).length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {coupon.categories.slice(0, 2).map((category) => (
              <span key={category} className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                {category}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
          <span>{coupon.country}</span>
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-[#f7b731] text-[#f7b731]" />
            <span>{coupon.sellerId?.trustScore || 4.8}</span>
          </div>
        </div>
        {coupon.purchaseStatus ? (
          <div className="mt-3 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">
            Payment {coupon.purchaseStatus}
          </div>
        ) : null}

        <Link
          href={cta}
          className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#16a34a] to-[#22c55e] px-4 py-3 text-sm font-bold text-white shadow-[0_14px_28px_rgba(34,197,94,0.2)]"
        >
          {coupon.revealedCouponCode ? "View Coupon" : loggedIn ? "Buy Now" : "Login to Buy"}
        </Link>
      </div>
    </div>
  );
}
