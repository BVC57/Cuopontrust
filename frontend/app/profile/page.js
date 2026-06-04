"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import api from "../../lib/api";
import TrustScoreCard from "../../components/TrustScoreCard";

export default function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get("/users/profile").then(({ data }) => setUser(data.user)).catch(() => null);
  }, []);

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {user ? (
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <TrustScoreCard trustScore={user.trustScore} accountStatus={user.accountStatus} />
            <div className="rounded-[28px] border border-white/70 bg-white p-6 shadow-soft">
              <h1 className="text-2xl font-semibold text-slate-900">{user.name}</h1>
              <p className="mt-2 text-sm text-slate-500">{user.email}</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Country</p>
                  <p className="mt-2 font-semibold text-slate-900">{user.country}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Currency</p>
                  <p className="mt-2 font-semibold text-slate-900">{user.currency}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Total sales</p>
                  <p className="mt-2 font-semibold text-slate-900">{user.totalSales}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Total purchases</p>
                  <p className="mt-2 font-semibold text-slate-900">{user.totalPurchases}</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </ProtectedRoute>
  );
}
