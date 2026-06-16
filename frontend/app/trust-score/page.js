"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import AccountShell from "../../components/AccountShell";
import TrustScoreCard from "../../components/TrustScoreCard";
import api from "../../lib/api";

export default function TrustScorePage() {
  const [snapshot, setSnapshot] = useState(null);

  useEffect(() => {
    api.get("/users/trust-score").then(({ data }) => setSnapshot(data)).catch(() => null);
  }, []);

  return (
    <ProtectedRoute>
      <AccountShell title="Trust Score" subtitle="Review account reputation, recent trust activity, and status changes.">
        {snapshot ? (
          <div className="space-y-6">
            <TrustScoreCard trustScore={snapshot.trustScore} accountStatus={snapshot.accountStatus} />
            <div className="rounded-[28px] border border-white/70 bg-white p-6 shadow-soft">
              <h2 className="text-xl font-semibold text-slate-900">Recent trust history</h2>
              <div className="mt-6 space-y-3">
                {snapshot.history.map((item) => (
                  <div key={item._id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                    <span>{item.reason}</span>
                    <span className="font-semibold text-rose-600">{item.change}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </AccountShell>
    </ProtectedRoute>
  );
}
