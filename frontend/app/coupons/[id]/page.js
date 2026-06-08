"use client";

import { useEffect, useState } from "react";
import { ArrowRight, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api, { extractError } from "../../../lib/api";
import { getStoredUser, isAuthenticated } from "../../../lib/auth";
import { formatDate, formatMoney } from "../../../lib/format";
import { openRazorpayCheckout } from "../../../lib/razorpay";
import StatusBadge from "../../../components/StatusBadge";
import LoadingSpinner from "../../../components/LoadingSpinner";

export default function CouponDetailsPage() {
  const params = useParams();
  const router = useRouter();
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
      router.push("/login");
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
          try {
            await api.post(`/payments/confirm-worked/${data.transaction._id}`);
          } catch (error) {
            const message = String(error?.response?.data?.message || error?.message || "").toLowerCase();
            if (!message.includes("already captured") && !message.includes("already been captured")) {
              throw error;
            }
          }
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

          <div className="mt-8 rounded-[26px] border border-indigo-100 bg-[linear-gradient(135deg,#eef2ff_0%,#f8fafc_100%)] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Redeem code</p>
                <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                  {revealedCoupon?.couponCode || "Hidden until payment"}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {revealedCoupon ? "This code is now unlocked for your account and email." : "Complete payment to unlock and copy the coupon code."}
                </p>
              </div>
              <div className={`rounded-2xl px-4 py-2 text-xs font-black shadow-sm ${revealedCoupon ? "bg-emerald-100 text-emerald-700" : "bg-white text-[#2563eb]"}`}>
                {revealedCoupon ? "Unlocked" : "Locked"}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-sm font-medium text-slate-900">Terms and conditions</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{coupon.terms || "No terms added."}</p>
          </div>

          <div className="mt-6 overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <div className="px-5 py-5">
              <div className="mt-5">
                <p className="text-2xl font-semibold tracking-tight text-slate-950">Details</p>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
                  <li>Expires on {formatDate(coupon.expiryDate)}</li>
                  <li>Valid in {coupon.country || "India"}.</li>
                  <li>{coupon.title} on {coupon.platformName} purchases.</li>
                  <li>{coupon.terms || "Terms are available after checkout confirmation."}</li>
                </ul>
              </div>
            </div>
          </div>

          

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

          <div className="mt-8 overflow-hidden rounded-[28px] border border-emerald-100 bg-[linear-gradient(135deg,#f7fff8_0%,#ffffff_45%,#ecfdf3_100%)] p-4 shadow-[0_20px_50px_rgba(34,197,94,0.08)]">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Secure checkout</p>
                <p className="mt-2 text-sm font-medium text-slate-600">Instant unlock after verified payment.</p>
              </div>
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>

            <button
              onClick={handleBuy}
              disabled={buying}
              className="group relative w-full overflow-hidden rounded-[22px] bg-[linear-gradient(135deg,#16a34a_0%,#22c55e_48%,#0f172a_120%)] px-5 py-4 text-left text-white shadow-[0_18px_34px_rgba(34,197,94,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_40px_rgba(34,197,94,0.34)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_34%),linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)]" />
              <span className="relative flex items-center justify-between gap-4">
                <span className="flex items-center gap-3">
                  <span className="rounded-2xl bg-white/14 p-2.5 backdrop-blur-sm">
                    {loggedIn ? <Sparkles className="h-5 w-5" /> : <LockKeyhole className="h-5 w-5" />}
                  </span>
                  <span>
                    <span className="block text-base font-black tracking-tight">
                      {loggedIn ? (buying ? "Processing payment..." : "Buy now") : "Login to buy"}
                    </span>
                    <span className="mt-0.5 block text-xs font-medium text-emerald-50/90">
                      {loggedIn ? `Pay ${formatMoney(coupon.sellingPrice, coupon.currency)} with Razorpay` : "Sign in to continue checkout"}
                    </span>
                  </span>
                </span>
                <span className="rounded-2xl bg-white/14 p-2.5 backdrop-blur-sm transition group-hover:translate-x-0.5">
                  <ArrowRight className="h-5 w-5" />
                </span>
              </span>
            </button>

            <div className="mt-4 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
              <div className="flex items-center gap-2 rounded-2xl bg-white/80 px-3 py-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Verified payment capture</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white/80 px-3 py-2">
                <LockKeyhole className="h-4 w-4 text-emerald-600" />
                <span>Redeem code emailed instantly</span>
              </div>
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}
