"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import AccountShell from "../../components/AccountShell";
import api from "../../lib/api";
import StatusBadge from "../../components/StatusBadge";

export default function DisputesPage() {
  const [disputes, setDisputes] = useState([]);

  useEffect(() => {
    api.get("/disputes/my").then(({ data }) => setDisputes(data.disputes || [])).catch(() => null);
  }, []);

  return (
    <ProtectedRoute>
      <AccountShell title="My Disputes" subtitle="Track support cases, comments, and dispute resolution progress in one place.">
        <div className="rounded-[28px] border border-white/70 bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-semibold text-slate-900">My disputes</h2>
          <div className="mt-6 space-y-3">
            {disputes.map((item) => (
              <div key={item._id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.reason}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.comment || "No comment added"}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </div>
      </AccountShell>
    </ProtectedRoute>
  );
}
