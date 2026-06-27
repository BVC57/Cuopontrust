"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Star } from "lucide-react";
import { useParams } from "next/navigation";
import api, { resolveUploadUrl } from "../../../lib/api";
import LoadingSpinner from "../../../components/LoadingSpinner";
import CouponCard from "../../../components/CouponCard";

export default function SellerProfilePage() {
  const params = useParams();
  const [seller, setSeller] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) {
      return;
    }

    let active = true;
    setLoading(true);

    api
      .get(`/users/public/sellers/${params.id}`)
      .then(({ data }) => {
        if (active) {
          setSeller(data.seller || null);
          setCoupons(data.coupons || []);
        }
      })
      .catch(() => {
        if (active) {
          setSeller(null);
          setCoupons([]);
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
  }, [params?.id]);

  if (loading) {
    return <LoadingSpinner label="Loading seller profile..." />;
  }

  if (!seller) {
    return <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-slate-500">Seller profile not found.</div>;
  }

  const avatarUrl = resolveUploadUrl(seller.avatar);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img src={avatarUrl} alt={seller.name} className="h-20 w-20 rounded-[24px] object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-emerald-50 text-2xl font-black text-emerald-700">
                {String(seller.name || "S")
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-4xl font-black tracking-tight text-slate-950">{seller.name}</h1>
                {seller.isVerifiedSeller ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified Seller
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-slate-500">{seller.emailHint || "Email protected"}</p>
              <p className="mt-1 text-sm text-slate-500">Member since {new Date(seller.memberSince).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
            </div>
          </div>

          <Link href="/sellers" className="text-sm font-black text-emerald-700">
            Back to seller search
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            ["Trust Score", seller.trustScore],
            ["Active Coupons", seller.activeCouponsCount],
            ["Sold Coupons", seller.soldCouponsCount],
            ["Positive Feedback", seller.successfulCouponFeedbackCount]
          ].map(([label, value]) => (
            <div key={label} className="rounded-[22px] bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:p-8">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-500" />
          <h2 className="text-2xl font-black text-slate-950">Live listings from this seller</h2>
        </div>

        {coupons.length ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {coupons.map((coupon) => (
              <CouponCard key={coupon._id} coupon={coupon} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">This seller has no active listings right now.</p>
        )}
      </div>
    </div>
  );
}

