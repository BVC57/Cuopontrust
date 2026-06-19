"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import AccountShell from "../../components/AccountShell";
import TrustScoreCard from "../../components/TrustScoreCard";
import api from "../../lib/api";

const formatHistoryDate = (value) =>
  new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

export default function TrustScorePage() {
  const [snapshot, setSnapshot] = useState(null);

  useEffect(() => {
    api.get("/users/trust-score").then(({ data }) => setSnapshot(data)).catch(() => null);
  }, []);

  return (
    <ProtectedRoute>
      <AccountShell title="Trust Score" subtitle="Review account reputation, recent trust activity, and know that accounts are banned when trust score falls below 40.">
        {snapshot ? (
          <div className="space-y-6">
            <TrustScoreCard trustScore={snapshot.trustScore} accountStatus={snapshot.accountStatus} />
            <div className="rounded-[28px] border border-rose-100 bg-rose-50 p-5 text-sm font-bold leading-7 text-rose-700 shadow-soft">
              If your trust score falls below 40, your account is banned until admin review.
            </div>
            <div className="rounded-[28px] border border-white/70 bg-white p-6 shadow-soft">
              <h2 className="text-xl font-semibold text-slate-900">Trust score history</h2>
              <p className="mt-2 text-sm text-slate-500">View every trust update, including admin ban and unban review decisions.</p>
              <div className="mt-6 max-h-[520px] space-y-3 overflow-y-auto pr-2">
                {snapshot.history.length ? (
                  snapshot.history.map((item) => (
                    <div key={item._id} className="rounded-2xl bg-slate-50 px-4 py-4 text-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">{item.reason}</p>
                          <p className="mt-1 text-xs text-slate-500">{formatHistoryDate(item.createdAt)}</p>
                        </div>
                        <span className={`shrink-0 font-semibold ${item.change < 0 ? "text-rose-600" : item.change > 0 ? "text-emerald-600" : "text-slate-500"}`}>
                          {item.change > 0 ? `+${item.change}` : item.change}
                        </span>
                      </div>
                      <p className="mt-2 text-xs font-medium text-slate-500">
                        Score: {item.oldScore} to {item.newScore}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">No trust score history available yet.</div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </AccountShell>
    </ProtectedRoute>
  );
}
