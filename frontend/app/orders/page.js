"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Copy, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import AccountShell from "../../components/AccountShell";
import ProtectedRoute from "../../components/ProtectedRoute";
import api from "../../lib/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatDate, formatMoney } from "../../lib/format";

const feedbackThemes = {
  pending: {
    card: "border-amber-200 bg-amber-50/70",
    text: "text-amber-700",
    label: "Please confirm if this coupon worked for you."
  },
  worked: {
    card: "border-emerald-200 bg-emerald-50",
    text: "text-emerald-700",
    label: "You marked this coupon as working."
  },
  not_working: {
    card: "border-rose-200 bg-rose-50",
    text: "text-rose-600",
    label: "You reported this coupon as not working."
  }
};

export default function OrdersPage() {
  const [purchased, setPurchased] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState("");

  useEffect(() => {
    api.get("/coupons/my/purchased")
      .then((purchasedRes) => {
        setPurchased(purchasedRes.data.coupons || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const copyCode = async (code) => {
    if (!code) {
      toast.error("Coupon code is not available yet");
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      toast.success("Coupon code copied");
    } catch {
      toast.error("Unable to copy coupon code");
    }
  };

  const submitFeedback = async (transactionId, worked) => {
    if (!transactionId) {
      toast.error("Transaction not found for this coupon");
      return;
    }

    try {
      setSubmittingId(transactionId);
      const endpoint = worked ? "confirm-worked" : "report-not-working";
      const { data } = await api.post(`/payments/${endpoint}/${transactionId}`);
      const nextStatus = data.transaction?.buyerFeedbackStatus || (worked ? "worked" : "not_working");

      setPurchased((current) => current.map((item) => (
        item.transactionId === transactionId
          ? { ...item, buyerFeedbackStatus: nextStatus, transactionStatus: data.transaction?.transactionStatus || item.transactionStatus }
          : item
      )));

      toast.success(worked ? "Feedback saved. Seller payout released." : "Issue reported. Seller review is pending.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to save feedback");
    } finally {
      setSubmittingId("");
    }
  };

  return (
    <ProtectedRoute>
      <AccountShell title="My Orders" subtitle="Track purchased coupons and review your account activity.">
        {loading ? <LoadingSpinner label="Loading orders..." /> : (
          <section className="rounded-[30px] border border-emerald-100 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
            <h2 className="text-2xl font-black text-slate-900">Purchased coupons</h2>
            {purchased.length ? (
              <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {purchased.map((coupon) => {
                  const feedbackStatus = coupon.buyerFeedbackStatus || "pending";
                  const feedbackTheme = feedbackThemes[feedbackStatus] || feedbackThemes.pending;
                  const isSubmitting = submittingId === coupon.transactionId;

                  return (
                    <article key={coupon._id} className="flex h-full flex-col rounded-[30px] border border-emerald-100 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.10),transparent_28%),linear-gradient(180deg,#ffffff_0%,#fbfffc_100%)] p-5 shadow-[0_18px_34px_rgba(15,23,42,0.05)]">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700">
                            Verified
                          </span>
                          <h3 className="mt-4 text-3xl font-black uppercase leading-tight text-slate-950">{coupon.title}</h3>
                          <p className="mt-2 text-sm font-medium leading-6 text-slate-500">On {coupon.platformName} purchases</p>
                        </div>
                        <div className="rounded-[22px] bg-white px-4 py-3 text-right shadow-[0_12px_24px_rgba(15,23,42,0.05)]">
                          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-emerald-700">Paid</p>
                          <p className="mt-1 text-xl font-black text-emerald-600">{formatMoney(coupon.sellingPrice, coupon.currency)}</p>
                        </div>
                      </div>

                      <div className="mt-5 rounded-[22px] border border-dashed border-emerald-200 bg-white/90 p-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Coupon Code</p>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <p className="line-clamp-2 text-base font-black text-slate-900">{coupon.revealedCouponCode || "Code hidden until reveal"}</p>
                          <button
                            type="button"
                            onClick={() => copyCode(coupon.revealedCouponCode)}
                            disabled={!coupon.revealedCouponCode}
                            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border ${coupon.revealedCouponCode ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-400"}`}
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-5">
                        <Link
                          href={`/coupons/${coupon._id}`}
                          className="inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-[#16a34a] to-[#22c55e] px-4 text-sm font-black text-white shadow-[0_14px_24px_rgba(15,23,42,0.08)]"
                        >
                          View Coupon
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        
                      </div>

                      <div className={`mt-5 rounded-[24px] border p-4 ${feedbackTheme.card}`}>
                        <p className="text-lg font-black text-slate-950">Did this Cuopon work for you?</p>
                        <p className={`mt-2 text-sm font-semibold ${feedbackTheme.text}`}>{feedbackTheme.label}</p>

                        {feedbackStatus === "pending" ? (
                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <button
                              type="button"
                              onClick={() => submitFeedback(coupon.transactionId, true)}
                              disabled={isSubmitting}
                              className="rounded-[18px] bg-gradient-to-r from-[#16a34a] to-[#22c55e] px-4 py-3 text-sm font-black text-white"
                            >
                              {isSubmitting ? "Saving..." : "Yes, It Worked!"}
                            </button>
                            <button
                              type="button"
                              onClick={() => submitFeedback(coupon.transactionId, false)}
                              disabled={isSubmitting}
                              className="rounded-[18px] border border-rose-300 bg-white px-4 py-3 text-sm font-black text-rose-500"
                            >
                              No, It Didn&apos;t
                            </button>
                          </div>
                        ) : (
                          <div className={`mt-4 inline-flex rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.12em] ${feedbackTheme.text} ${feedbackStatus === "worked" ? "bg-emerald-100" : "bg-rose-100"}`}>
                            {feedbackStatus === "worked" ? "Marked as working" : "Reported as not working"}
                          </div>
                        )}
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-5 text-xs font-semibold text-slate-500">
                        <span>Valid Till {formatDate(coupon.expiryDate)}</span>
                        <span>Bought {formatDate(coupon.purchasedAt)}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="mt-6 rounded-3xl border border-dashed border-emerald-200 px-6 py-10 text-center">
                <p className="text-xl font-black text-slate-900">No purchased coupons</p>
                <p className="mt-2 text-sm text-slate-500">Only coupons purchased by this account will be shown here.</p>
              </div>
            )}
          </section>
        )}
      </AccountShell>
    </ProtectedRoute>
  );
}
