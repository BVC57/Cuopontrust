import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { formatMoney } from "../lib/format";

export default function CouponCard({ coupon }) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-violet-100 bg-white shadow-[0_12px_30px_rgba(31,41,55,0.05)] transition hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(91,61,245,0.14)]">
      <div className="border-b border-violet-50 bg-gradient-to-br from-[#fff7f4] via-white to-[#f6f4ff] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xl font-black capitalize tracking-tight text-slate-900">{coupon.platformName}</p>
            <p className="mt-3 text-3xl font-black text-slate-950">
              {Math.max(10, Math.round((coupon.couponAmount / Math.max(coupon.sellingPrice, 1)) * 10))}% OFF
            </p>
            <p className="mt-2 text-xs font-semibold text-slate-400">Code: {coupon.couponCode || "SAVE20"}</p>
          </div>
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-violet-100 bg-white text-slate-400">
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <p className="line-clamp-1 text-sm font-medium text-slate-500">{coupon.title}</p>
        <p className="mt-3 text-lg font-black text-[#ff6b57]">{formatMoney(coupon.sellingPrice, coupon.currency)}</p>
        <p className="mt-1 text-xs font-medium text-slate-400">On {coupon.platformName} purchases</p>

        <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
          <span>{coupon.country}</span>
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-[#f7b731] text-[#f7b731]" />
            <span>{coupon.sellerId?.trustScore || 4.8}</span>
          </div>
        </div>

        <Link
          href={`/coupons/${coupon._id}`}
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#5b3df5] to-[#7149ff] px-4 py-2.5 text-sm font-bold text-white"
        >
          Buy Now
        </Link>
      </div>
    </div>
  );
}
