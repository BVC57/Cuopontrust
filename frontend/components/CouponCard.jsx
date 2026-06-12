"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Copy, ExternalLink, Heart, LockKeyhole, ShieldCheck, Star, Users } from "lucide-react";
import { isAuthenticated } from "../lib/auth";
import { formatDate, formatMoney } from "../lib/format";
import { resolveBrand } from "../lib/brandCatalog";

const themeByBrand = {
  amazon: {
    shell: "border-emerald-100 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.10),transparent_28%),linear-gradient(180deg,#ffffff_0%,#fbfffc_100%)]",
    tag: "bg-emerald-50 text-emerald-700",
    code: "border-emerald-200 text-emerald-700",
    button: "bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white"
  },
  flipkart: {
    shell: "border-sky-100 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_28%),linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]",
    tag: "bg-sky-50 text-sky-700",
    code: "border-sky-200 text-sky-700",
    button: "bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white"
  },
  myntra: {
    shell: "border-rose-100 bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.10),transparent_28%),linear-gradient(180deg,#ffffff_0%,#fff8fb_100%)]",
    tag: "bg-rose-50 text-rose-700",
    code: "border-orange-200 text-rose-700",
    button: "bg-gradient-to-r from-[#f43f5e] to-[#fb7185] text-white"
  },
  nykaa: {
    shell: "border-fuchsia-100 bg-[radial-gradient(circle_at_top_left,rgba(217,70,239,0.10),transparent_28%),linear-gradient(180deg,#ffffff_0%,#fffaff_100%)]",
    tag: "bg-fuchsia-50 text-fuchsia-700",
    code: "border-fuchsia-200 text-fuchsia-700",
    button: "bg-gradient-to-r from-[#c026d3] to-[#e879f9] text-white"
  },
  boat: {
    shell: "border-orange-100 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.10),transparent_28%),linear-gradient(180deg,#ffffff_0%,#fffaf5_100%)]",
    tag: "bg-orange-50 text-orange-700",
    code: "border-orange-200 text-orange-700",
    button: "bg-gradient-to-r from-[#ea580c] to-[#fb923c] text-white"
  }
};

const fallbackTheme = {
  shell: "border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcff_100%)]",
  tag: "bg-emerald-50 text-emerald-700",
  code: "border-slate-200 text-slate-700",
  button: "bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white"
};

const normalizeCategory = (value = "") =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();

export default function CouponCard({ coupon }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const brand = coupon.platformBrandKey ? resolveBrand(coupon.platformBrandKey) : resolveBrand(coupon.platformName);
  const logoPath = coupon.platformLogoPath || brand?.logoPath || "";

  useEffect(() => {
    setLoggedIn(isAuthenticated());
  }, []);

  const theme = useMemo(
    () => themeByBrand[brand?.key] || fallbackTheme,
    [brand?.key]
  );

  const isSold = coupon.status === "sold";
  const isPurchasedByViewer = Boolean(coupon.revealedCouponCode || coupon.purchaseStatus || coupon.buyerOwned);
  const cta = loggedIn ? `/coupons/${coupon._id}` : "/login";
  const title = String(coupon.title || "").trim().toUpperCase() || `${coupon.platformName} OFFER`;
  const subtitle = coupon.description || `On ${coupon.platformName} purchases`;
  const codeLabel = coupon.revealedCouponCode || "Code hidden until payment";
  const primaryActionLabel = isPurchasedByViewer ? "View Coupon" : isSold ? "Sold" : coupon.revealedCouponCode ? "Copy Code" : "Unlock & Buy";
  const categoryLabels = (coupon.categories || []).slice(0, 2).map(normalizeCategory);
  const usageLabel = coupon.views ? `Used ${coupon.views} times` : coupon.savedCount ? `Saved ${coupon.savedCount} times` : "Verified deal";
  const expiryLabel = coupon.expiryDate ? formatDate(coupon.expiryDate) : "Limited time";

  return (
    <div className={`group flex h-full min-h-[352px] flex-col rounded-[24px] border p-4 shadow-[0_18px_34px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_24px_44px_rgba(15,23,42,0.10)] ${theme.shell}`}>
      <div className="flex items-center justify-between">
        <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] ${theme.tag}`}>
          Verified
        </span>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-400 transition hover:text-slate-700"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 flex flex-1 flex-col">
        <div className="flex min-h-[58px] items-center justify-center">
          {logoPath ? (
            <Image src={logoPath} alt={coupon.platformName} width={140} height={40} className="h-10 w-auto object-contain" />
          ) : (
            <p className="text-2xl font-black uppercase tracking-tight text-slate-900">{coupon.platformName}</p>
          )}
        </div>

        <div className="mt-6 text-center">
          <h3 className="line-clamp-2 text-[1.05rem] font-black uppercase leading-tight text-slate-950 sm:text-[1.85rem]">
            {title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-slate-500">{subtitle}</p>
        </div>

        {categoryLabels.length ? (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {categoryLabels.map((category) => (
              <span key={category} className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] ${theme.tag}`}>
                {category}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-5 flex items-end justify-center gap-3">
          <p className="text-[2rem] font-black leading-none text-[#16a34a]">{formatMoney(coupon.sellingPrice, coupon.currency)}</p>
          <p className="pb-1 text-lg font-bold text-slate-400 line-through">{formatMoney(coupon.couponAmount, coupon.currency)}</p>
        </div>

        <div className={`mt-5 flex min-h-[52px] items-center justify-between rounded-[16px] border border-dashed bg-white/90 px-4 ${theme.code}`}>
          <span className="flex items-center gap-2 text-sm font-bold">
            {coupon.revealedCouponCode ? <Copy className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}
            <span className="line-clamp-2">{codeLabel}</span>
          </span>
          <span className="text-slate-400">
            {coupon.revealedCouponCode ? <Copy className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}
          </span>
        </div>

        <div className="mt-4">
          {isSold && !isPurchasedByViewer ? (
            <span className="inline-flex w-full items-center justify-center rounded-[16px] bg-slate-200 px-4 py-3 text-sm font-black text-slate-600">
              Sold
            </span>
          ) : (
            <Link
              href={cta}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-[16px] px-4 py-3 text-sm font-black shadow-[0_14px_24px_rgba(15,23,42,0.08)] ${theme.button}`}
            >
              {primaryActionLabel}
              {coupon.revealedCouponCode ? <Copy className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
            </Link>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between pt-5 text-xs font-semibold text-slate-500">
          <span>Valid Till {expiryLabel}</span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {usageLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
