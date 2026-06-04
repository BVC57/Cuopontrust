"use client";

import { useEffect, useState } from "react";
import AccountShell from "../../components/AccountShell";
import ProtectedRoute from "../../components/ProtectedRoute";
import api from "../../lib/api";
import TrustScoreCard from "../../components/TrustScoreCard";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get("/users/profile").then(({ data }) => setUser(data.user)).catch(() => null);
  }, []);

  return (
    <ProtectedRoute>
      <AccountShell title="My Profile" subtitle="View account details, trust score, and summary stats.">
        {!user ? (
          <LoadingSpinner label="Loading profile..." />
        ) : (
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
              </div>
            </div>
          </div>
        )}
      </AccountShell>
    </ProtectedRoute>
  );
}
