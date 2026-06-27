"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CircleUserRound, CreditCard, Globe2, Mail, PencilLine, ShieldCheck, Wallet } from "lucide-react";
import AccountShell from "../../../components/AccountShell";
import LoadingSpinner from "../../../components/LoadingSpinner";
import ProtectedRoute from "../../../components/ProtectedRoute";
import TrustScoreCard from "../../../components/TrustScoreCard";
import api, { resolveUploadUrl } from "../../../lib/api";
import { formatMoney } from "../../../lib/format";

const formatDate = (value) => {
  if (!value) return "Not available";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

function DetailCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[24px] border border-emerald-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fff9_100%)] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-900 break-words">{value}</p>
    </div>
  );
}

export default function ProfileDetailsPage() {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [trustSnapshot, setTrustSnapshot] = useState(null);

  useEffect(() => {
    Promise.all([api.get("/users/profile"), api.get("/wallet"), api.get("/users/trust-score")])
      .then(([profileResponse, walletResponse, trustResponse]) => {
        setUser(profileResponse.data.user);
        setWallet(walletResponse.data.wallet);
        setTrustSnapshot(trustResponse.data);
      })
      .catch(() => null);
  }, []);

  const avatarUrl = resolveUploadUrl(user?.avatar);
  const initials = useMemo(
    () =>
      String(user?.name || "U")
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    [user]
  );

  return (
    <ProtectedRoute>
      <AccountShell title="Profile Details" subtitle="Review your complete account details, trust standing, wallet summary, and account status.">
        {!user || !wallet ? (
          <LoadingSpinner label="Loading profile details..." />
        ) : (
          <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
              <div className="space-y-4">
                <TrustScoreCard trustScore={user.trustScore} accountStatus={user.accountStatus} />
                <div className="rounded-[28px] border border-emerald-100 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
                  <h3 className="text-base font-black text-slate-900">Identity</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">This page shows the complete account details linked to your current login.</p>
                  <div className="mt-5 flex flex-col items-center rounded-[24px] bg-emerald-50/70 px-4 py-5 text-center">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-emerald-100 bg-white text-2xl font-black text-emerald-700">
                      {avatarUrl ? <img src={avatarUrl} alt={user.name || "Profile"} className="h-full w-full object-cover" /> : initials}
                    </div>
                    <h2 className="mt-4 text-xl font-black text-slate-950">{user.name || "CouponX User"}</h2>
                    <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                    <span className="mt-3 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
                      {user.role === "super_admin" ? "Super Admin" : "User Account"}
                    </span>
                  </div>
                  <Link href="/profile" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white">
                    <PencilLine className="h-4 w-4" />
                    Edit Profile
                  </Link>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <DetailCard icon={Mail} label="Email" value={user.email || "Not available"} />
                  <DetailCard icon={Globe2} label="Country" value={user.country || "India"} />
                  <DetailCard icon={CreditCard} label="Currency" value={user.currency || "INR"} />
                  <DetailCard icon={ShieldCheck} label="Account Status" value={user.accountStatus || "active"} />
                  <DetailCard icon={CalendarDays} label="Joined On" value={formatDate(user.createdAt)} />
                  <DetailCard icon={CircleUserRound} label="Email Verified" value={user.isEmailVerified ? "Verified" : "Not verified"} />
                </div>

                <div className="rounded-[30px] border border-emerald-100 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900">Account Overview</h3>
                      <p className="mt-2 text-sm text-slate-500">Quick view of coupon activity and wallet balances related to this profile.</p>
                    </div>
                    <Wallet className="h-8 w-8 text-emerald-600" />
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <DetailCard icon={CircleUserRound} label="Total Sales" value={String(user.totalSales || 0)} />
                    <DetailCard icon={CircleUserRound} label="Total Purchases" value={String(user.totalPurchases || 0)} />
                    <DetailCard icon={Wallet} label="Available Balance" value={formatMoney(wallet.availableBalance, wallet.currency)} />
                    <DetailCard icon={Wallet} label="Pending Balance" value={formatMoney(wallet.pendingBalance, wallet.currency)} />
                  </div>
                </div>

                <div className="rounded-[30px] border border-emerald-100 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900">Recent Trust History</h3>
                      <p className="mt-2 text-sm text-slate-500">Latest trust score events connected to your profile.</p>
                    </div>
                    <Link href="/trust-score" className="text-sm font-bold text-emerald-700">View all</Link>
                  </div>

                  <div className="mt-5 space-y-3">
                    {trustSnapshot?.history?.length ? (
                      trustSnapshot.history.slice(0, 5).map((item) => (
                        <div key={item._id} className="rounded-2xl bg-slate-50 px-4 py-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{item.reason}</p>
                              <p className="mt-1 text-xs text-slate-500">{formatDate(item.createdAt)}</p>
                            </div>
                            <span className={`text-sm font-black ${item.change < 0 ? "text-rose-600" : item.change > 0 ? "text-emerald-600" : "text-slate-500"}`}>
                              {item.change > 0 ? `+${item.change}` : item.change}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">No trust history available yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </AccountShell>
    </ProtectedRoute>
  );
}
