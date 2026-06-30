"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminPageShell from "../../../../components/AdminPageShell";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import api, { extractError } from "../../../../lib/api";
import { formatDate } from "../../../../lib/format";

export default function AdminRewardReferralsPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/super-admin/rewards/referral-history").then(({ data }) => setHistory(data.history || [])).catch((error) => toast.error(extractError(error))).finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminPageShell title="Referral History" breadcrumbs={["Rewards", "Referrals"]}><LoadingSpinner label="Loading referral history..." /></AdminPageShell>;

  return (
    <AdminPageShell title="Referral History" subtitle="View all referred users, their referrers, codes, and conversion state." breadcrumbs={["Rewards", "Referrals"]}>
      <div className="rounded-[28px] border border-emerald-100 bg-white p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm"><thead><tr className="border-b border-slate-200 text-slate-500"><th className="px-3 py-3 font-bold">Referrer</th><th className="px-3 py-3 font-bold">Code</th><th className="px-3 py-3 font-bold">Joined User</th><th className="px-3 py-3 font-bold">Status</th><th className="px-3 py-3 font-bold">Date</th></tr></thead><tbody>{history.length ? history.map((row) => <tr key={row._id} className="border-b border-slate-100"><td className="px-3 py-3 text-slate-700">{row.referrerId?.name || "User"}<div className="text-xs text-slate-500">{row.referrerId?.email || "-"}</div></td><td className="px-3 py-3 text-slate-700">{row.referrerId?.referralCode || "-"}</td><td className="px-3 py-3 text-slate-700">{row.referredUserId?.name || "User"}<div className="text-xs text-slate-500">{row.referredUserId?.email || "-"}</div></td><td className="px-3 py-3 text-slate-700">{row.status}</td><td className="px-3 py-3 text-slate-700">{formatDate(row.createdAt)}</td></tr>) : <tr><td colSpan={5} className="px-3 py-6 text-center text-slate-400">No referral records found.</td></tr>}</tbody></table>
        </div>
      </div>
    </AdminPageShell>
  );
}
