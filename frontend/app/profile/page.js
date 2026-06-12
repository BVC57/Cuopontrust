"use client";

import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import toast from "react-hot-toast";
import AccountShell from "../../components/AccountShell";
import ProtectedRoute from "../../components/ProtectedRoute";
import api from "../../lib/api";
import TrustScoreCard from "../../components/TrustScoreCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatDate, formatMoney } from "../../lib/format";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [purchased, setPurchased] = useState([]);

  useEffect(() => {
    Promise.all([api.get("/users/profile"), api.get("/wallet"), api.get("/coupons/my/purchased")])
      .then(([profileResponse, walletResponse, purchasedResponse]) => {
        setUser(profileResponse.data.user);
        setWallet(walletResponse.data.wallet);
        setPurchased(purchasedResponse.data.coupons || []);
      })
      .catch(() => null);
  }, []);

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Coupon code copied");
    } catch {
      toast.error("Unable to copy coupon code");
    }
  };

  return (
    <ProtectedRoute>
      <AccountShell title="My Profile" subtitle="View account details, trust score, and summary stats.">
        {!user || !wallet ? (
          <LoadingSpinner label="Loading profile..." />
        ) : (
          <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
            <TrustScoreCard trustScore={user.trustScore} accountStatus={user.accountStatus} />
            <div className="rounded-[30px] border border-emerald-100 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
              <h2 className="text-2xl font-black text-slate-900">{user.name || "CouponX User"}</h2>
              <p className="mt-2 text-sm text-slate-500">{user.email}</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Country</p>
                  <p className="mt-2 font-semibold text-slate-900">{user.country || "India"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Currency</p>
                  <p className="mt-2 font-semibold text-slate-900">{user.currency || "INR"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Total sales</p>
                  <p className="mt-2 font-semibold text-slate-900">{user.totalSales || 0}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Total purchases</p>
                  <p className="mt-2 font-semibold text-slate-900">{user.totalPurchases || 0}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Available to withdraw</p>
                  <p className="mt-2 font-semibold text-slate-900">{formatMoney(wallet.availableBalance, wallet.currency)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Pending sales</p>
                  <p className="mt-2 font-semibold text-slate-900">{formatMoney(wallet.pendingBalance, wallet.currency)}</p>
                </div>
              </div>
            </div>
          </div>
            <section className="rounded-[30px] border border-emerald-100 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
              <h2 className="text-2xl font-black text-slate-900">Purchased coupon codes</h2>
              {purchased.length ? (
                <div className="mt-6 space-y-4">
                  {purchased.map((coupon) => (
                    <div key={coupon._id} className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-5 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-lg font-black text-slate-900">{coupon.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{coupon.platformName} | Expires {formatDate(coupon.expiryDate)}</p>
                        <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm font-black tracking-[0.14em] text-emerald-700">{coupon.revealedCouponCode || "Code available after reveal"}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyCode(coupon.revealedCouponCode)}
                        disabled={!coupon.revealedCouponCode}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:bg-slate-300"
                      >
                        <Copy className="h-4 w-4" />
                        Copy code
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-3xl border border-dashed border-emerald-200 px-6 py-10 text-center">
                  <p className="text-xl font-black text-slate-900">No purchased coupons yet</p>
                  <p className="mt-2 text-sm text-slate-500">Coupons you buy will appear here with direct copy access.</p>
                </div>
              )}
            </section>
          </div>
        )}
      </AccountShell>
    </ProtectedRoute>
  );
}
