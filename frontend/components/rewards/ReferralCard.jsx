"use client";

import { useMemo } from "react";
import toast from "react-hot-toast";

export function ReferralCard({ referralCode, referralLink, appReferralLink, totals, referrals = [] }) {
  const stats = useMemo(() => ({
    total: totals?.total ?? referrals.length,
    verified: totals?.verified ?? referrals.filter((item) => ["verified", "first_purchase"].includes(item.status)).length,
    firstPurchase: totals?.firstPurchase ?? referrals.filter((item) => item.status === "first_purchase").length
  }), [totals, referrals]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink || "");
      toast.success("Referral link copied");
    } catch {
      toast.error("Unable to copy referral link");
    }
  };

  const shareLink = async () => {
    const shareText = [
      "Join CouponX with my referral code.",
      `Referral Code: ${referralCode || ""}`,
      appReferralLink ? `App Link: ${appReferralLink}` : "",
      referralLink ? `Web Link: ${referralLink}` : ""
    ].filter(Boolean).join("\n");

    if (navigator.share) {
      try {
        await navigator.share({ title: "CouponX Referral", text: shareText, url: referralLink || undefined });
        return;
      } catch {}
    }

    await copyLink();
  };

  return (
    <div className="rounded-[28px] border border-emerald-100 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Referral Program</p>
      <h3 className="mt-3 text-2xl font-black text-slate-950">Invite Friends</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">Share your code. You earn when referred users verify and complete their first purchase.</p>
      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Referral Code</p>
        <p className="mt-2 text-2xl font-black text-slate-950">{referralCode || "-"}</p>
        <p className="mt-3 break-all text-sm text-slate-500">{referralLink}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={shareLink} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-black text-white">Share Link</button>
          <button type="button" onClick={copyLink} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-black text-slate-700">Copy Link</button>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-emerald-50 p-4"><p className="text-xs text-emerald-700">Total</p><p className="mt-2 text-2xl font-black text-slate-950">{stats.total}</p></div>
        <div className="rounded-2xl bg-sky-50 p-4"><p className="text-xs text-sky-700">Verified</p><p className="mt-2 text-2xl font-black text-slate-950">{stats.verified}</p></div>
        <div className="rounded-2xl bg-amber-50 p-4"><p className="text-xs text-amber-700">First Purchase</p><p className="mt-2 text-2xl font-black text-slate-950">{stats.firstPurchase}</p></div>
      </div>
    </div>
  );
}
