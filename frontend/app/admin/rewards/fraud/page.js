"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminPageShell from "../../../../components/AdminPageShell";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import api, { extractError } from "../../../../lib/api";
import { formatDate } from "../../../../lib/format";

export default function AdminRewardFraudPage() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/super-admin/rewards/fraud-flags").then(({ data }) => setFlags(data.flags || [])).catch((error) => toast.error(extractError(error))).finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminPageShell title="Reward Fraud" breadcrumbs={["Rewards", "Fraud"]}><LoadingSpinner label="Loading fraud flags..." /></AdminPageShell>;

  return (
    <AdminPageShell title="Reward Fraud Flags" subtitle="Review all reward-abuse flags in a dedicated panel." breadcrumbs={["Rewards", "Fraud"]}>
      <div className="rounded-[28px] border border-emerald-100 bg-white p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm"><thead><tr className="border-b border-slate-200 text-slate-500"><th className="px-3 py-3 font-bold">User</th><th className="px-3 py-3 font-bold">Type</th><th className="px-3 py-3 font-bold">Reason</th><th className="px-3 py-3 font-bold">Score</th><th className="px-3 py-3 font-bold">Date</th></tr></thead><tbody>{flags.length ? flags.map((row) => <tr key={row._id} className="border-b border-slate-100"><td className="px-3 py-3 text-slate-700">{row.userId?.name || "User"}<div className="text-xs text-slate-500">{row.userId?.email || "-"}</div></td><td className="px-3 py-3 text-slate-700">{row.type}</td><td className="px-3 py-3 text-slate-700">{row.reason}</td><td className="px-3 py-3 text-slate-700">{row.score}</td><td className="px-3 py-3 text-slate-700">{formatDate(row.createdAt)}</td></tr>) : <tr><td colSpan={5} className="px-3 py-6 text-center text-slate-400">No fraud flags found.</td></tr>}</tbody></table>
        </div>
      </div>
    </AdminPageShell>
  );
}
