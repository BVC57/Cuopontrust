"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import api, { extractError } from "../../../lib/api";
import { getStoredUser, isAuthenticated } from "../../../lib/auth";
import { formatDate, formatMoney } from "../../../lib/format";
import { openRazorpayCheckout } from "../../../lib/razorpay";
import StatusBadge from "../../../components/StatusBadge";
import LoadingSpinner from "../../../components/LoadingSpinner";

export default function CouponDetailsPage() {
  const params = useParams();
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [buying, setBuying] = useState(false);
  const [revealedCoupon, setRevealedCoupon] = useState(null);

  useEffect(() => {
    setLoggedIn(isAuthenticated());
    api.get(`/coupons/${params.id}`).then(({ data }) => {
      setCoupon(data.coupon);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [params.id]);

  const handleBuy = async () => {
    if (!loggedIn) {
      window.location.href = "/login";
      return;
    }

    try {
      setBuying(true);
      const { data } = await api.post("/payments/create-order", { couponId: coupon._id });
      await openRazorpayCheckout({
        order: data.order,
        key: data.razorpayKey,
        user: getStoredUser(),
        onSuccess: async (response) => {
          await api.post("/payments/verify-authorized", {
            transactionId: data.transaction._id,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          });
          await api.post(`/payments/confirm-worked/${data.transaction._id}`);
          const revealed = await api.post(`/payments/reveal-coupon/${data.transaction._id}`);
          setRevealedCoupon(revealed.data.revealedCoupon);
          toast.success("Payment confirmed. Coupon details have been emailed to you.");
        }
      });
    } catch (error) {
      toast.error(extractError(error));
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-5xl px-4 py-10"><LoadingSpinner label="Loading coupon..." /></div>;
  }

  if (!coupon) {
    return <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-slate-500">Coupon not found.</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[32px] border border-white/70 bg-white p-8 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-secondary">{coupon.platformName}</p>
              <h1 className="mt-3 text-3xl font-semibold uppercase text-slate-900">{coupon.title}</h1>
            </div>
            <StatusBadge status={coupon.status} />
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-xs text-slate-500">Coupon value</p>
              <p className="mt-2 text-2xl font-semibold">{formatMoney(coupon.couponAmount, coupon.currency)}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-xs text-slate-500">Selling price</p>
              <p className="mt-2 text-2xl font-semibold text-brand-primary">{formatMoney(coupon.sellingPrice, coupon.currency)}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-xs text-slate-500">Country</p>
              <p className="mt-2 text-lg font-semibold">{coupon.country}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-xs text-slate-500">Expiry</p>
              <p className="mt-2 text-lg font-semibold">{formatDate(coupon.expiryDate)}</p>
            </div>
          </div>
          <div className="mt-8">
            <p className="text-sm font-medium text-slate-900">Terms and conditions</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{coupon.terms || "No terms added."}</p>
          </div>
          {(coupon.categories || []).length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {coupon.categories.map((category) => (
                <span key={category} className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
                  {category}
                </span>
              ))}
            </div>
          ) : null}
          {revealedCoupon ? (
            <div className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Redeem details</p>
              <p className="mt-3 text-2xl font-black text-slate-900">{revealedCoupon.couponCode}</p>
              <p className="mt-2 text-sm text-slate-600">The redeem code is also sent to your registered email address.</p>
            </div>
          ) : null}
        </section>
        <aside className="rounded-[32px] border border-white/70 bg-white p-8 shadow-soft">
          <p className="text-sm text-slate-500">Seller trust score</p>
          <p className="mt-2 text-4xl font-semibold text-slate-900">{coupon.sellerId?.trustScore || 100}</p>
          <p className="mt-4 text-sm text-slate-600">Razorpay payment is verified, captured, and then the redeem code is unlocked for your account and email.</p>
          <button onClick={handleBuy} disabled={buying} className="mt-8 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">
            {loggedIn ? (buying ? "Processing payment..." : "Buy now") : "Login to buy"}
          </button>
        </aside>
      </div>
    </div>
  );
}
