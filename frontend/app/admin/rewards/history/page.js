"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminPageShell from "../../../../components/AdminPageShell";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import api, { extractError } from "../../../../lib/api";
import { formatDate, formatMoney } from "../../../../lib/format";

export default function AdminRewardHistoryPage() {
  const [rewardHistory, setRewardHistory] = useState([]);
  const [walletHistory, setWalletHistory] = useState([]);
  const [missionHistory, setMissionHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/super-admin/rewards/history"), api.get("/super-admin/rewards/wallet-history"), api.get("/super-admin/rewards/mission-history")])
      .then(([rewardRes, walletRes, missionRes]) => {
        setRewardHistory(rewardRes.data.history || []);
        setWalletHistory(walletRes.data.history || []);
        setMissionHistory(missionRes.data.history || []);
      })
      .catch((error) => toast.error(extractError(error)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminPageShell title="Reward History" breadcrumbs={["Rewards", "History"]}><LoadingSpinner label="Loading reward history..." /></AdminPageShell>;

  return (
    <AdminPageShell title="Reward History" subtitle="Separate history tables for reward, wallet, and mission progress." breadcrumbs={["Rewards", "History"]}>
      <Table title="Reward Transactions" rows={rewardHistory} columns={[
        { label: "User", render: (row) => `${row.userId?.name || "User"} (${row.userId?.email || "-"})` },
        { label: "Type", render: (row) => row.type },
        { label: "Source", render: (row) => row.source },
        { label: "Coins", render: (row) => row.coins },
        { label: "Status", render: (row) => row.status },
        { label: "Date", render: (row) => formatDate(row.createdAt) }
      ]} />
      <Table title="Wallet Transactions" rows={walletHistory} columns={[
        { label: "User", render: (row) => `${row.userId?.name || "User"} (${row.userId?.email || "-"})` },
        { label: "Type", render: (row) => row.type },
        { label: "Amount", render: (row) => formatMoney(row.amount || 0) },
        { label: "Balance After", render: (row) => formatMoney(row.balanceAfter || 0) },
        { label: "Source", render: (row) => row.source || "-" },
        { label: "Date", render: (row) => formatDate(row.createdAt) }
      ]} />
      <Table title="Mission History" rows={missionHistory} columns={[
        { label: "User", render: (row) => `${row.userId?.name || "User"} (${row.userId?.email || "-"})` },
        { label: "Mission", render: (row) => row.missionId?.title || "Mission" },
        { label: "Progress", render: (row) => `${row.progress} / ${row.targetCount}` },
        { label: "Reward", render: (row) => `${row.missionId?.rewardCoins || 0} coins` },
        { label: "Status", render: (row) => row.status },
        { label: "Date", render: (row) => formatDate(row.updatedAt || row.createdAt) }
      ]} />
    </AdminPageShell>
  );
}

function Table({ title, rows, columns }) {
  return <div className="rounded-[28px] border border-emerald-100 bg-white p-6"><h2 className="text-2xl font-black text-slate-950">{title}</h2><div className="mt-5 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead><tr className="border-b border-slate-200 text-slate-500">{columns.map((column) => <th key={column.label} className="px-3 py-3 font-bold">{column.label}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row) => <tr key={row._id} className="border-b border-slate-100">{columns.map((column) => <td key={column.label} className="px-3 py-3 text-slate-700">{column.render(row)}</td>)}</tr>) : <tr><td colSpan={columns.length} className="px-3 py-6 text-center text-slate-400">No records found.</td></tr>}</tbody></table></div></div>;
}
