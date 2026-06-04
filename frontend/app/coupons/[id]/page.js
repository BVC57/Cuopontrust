"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import api, { extractError } from "../../../lib/api";
import { getStoredUser } from "../../../lib/auth";
import { formatDate, formatMoney } from "../../../lib/format";
import { openRazorpayCheckout } from "../../../lib/razorpay";
import StatusBadge from "../../../components/StatusBadge";
import LoadingSpinner from "../../../components/LoadingSpinner";

export default function CouponDetailsPage() {
  const params = useParams();
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/coupons/${params.id}`).then(({ data }) => {
      setCoupon(data.coupon);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [params.id]);

  const handleBuy = async () => {
    try {
      const { data } = await api.post("/payments/create-order", { couponId: coupon._id });
      await openRazorpayCheckout({
        order: data.order,
        user: getStoredUser(),
        onSuccess: async (response) => {
          await api.post("/payments/verify-authorized", {
            transactionId: data.transaction._id,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          });
          const revealed = await api.post(`/payments/reveal-coupon/${data.transaction._id}`);
          toast.success("Payment authorized and coupon revealed");
          alert(`Coupon code: ${revealed.data.revealedCoupon.couponCode}`);
        }
      });
    } catch (error) {
      toast.error(extractError(error));
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
              <h1 className="mt-3 text-3xl font-semibold text-slate-900">{coupon.title}</h1>
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
        </section>
        <aside className="rounded-[32px] border border-white/70 bg-white p-8 shadow-soft">
          <p className="text-sm text-slate-500">Seller trust score</p>
          <p className="mt-2 text-4xl font-semibold text-slate-900">{coupon.sellerId?.trustScore || 100}</p>
          <p className="mt-4 text-sm text-slate-600">Razorpay authorizes payment first. Capture only happens after buyer confirmation or admin resolution.</p>
          <button onClick={handleBuy} className="mt-8 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
            Buy now
          </button>
        </aside>
      </div>
    </div>
  );
}
