"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminPageShell from "../../../components/AdminPageShell";
import LoadingSpinner from "../../../components/LoadingSpinner";
import api, { extractError } from "../../../lib/api";
import { formatMoney } from "../../../lib/format";

export default function AdminRewardsPage() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    api.get("/super-admin/rewards/analytics")
      .then(({ data }) => setAnalytics(data.analytics))
      .catch((error) => toast.error(extractError(error)));
  }, []);

  if (!analytics) {
    return <AdminPageShell title="Rewards" breadcrumbs={["Rewards"]}><LoadingSpinner label="Loading reward overview..." /></AdminPageShell>;
  }

  const cards = [
    { label: "Total Coins Issued", value: analytics.totalCoinsIssued, tone: "text-emerald-700", href: "/admin/rewards/history" },
    { label: "Wallet Converted", value: formatMoney(analytics.totalWalletConverted), tone: "text-sky-700", href: "/admin/rewards/history" },
    { label: "Mission Completions", value: analytics.missionCompletions, tone: "text-amber-700", href: "/admin/rewards/missions" },
    { label: "Fraud Cases", value: analytics.fraudCases, tone: "text-rose-700", href: "/admin/rewards/fraud" }
  ];

  const links = [
    { label: "Reward Settings", href: "/admin/rewards/settings", description: "Conversion rates, daily limits, spin settings, reward rules." },
    { label: "Mission Manager", href: "/admin/rewards/missions", description: "Create, edit, enable, and review mission progress." },
    { label: "Referral Analytics", href: "/admin/rewards/referrals", description: "See all referral users, statuses, codes, and join history." },
    { label: "Reward Histories", href: "/admin/rewards/history", description: "Separate tables for reward, wallet, and mission transactions." },
    { label: "Fraud Flags", href: "/admin/rewards/fraud", description: "Review reward abuse and flagged accounts." },
    { label: "Withdrawals", href: "/admin/withdrawals", description: "Review payout requests in the dedicated withdrawals panel." }
  ];

  return (
    <AdminPageShell title="Reward Overview" subtitle="Manage the full reward ecosystem from dedicated admin pages." breadcrumbs={["Rewards", "Overview"]}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="rounded-[28px] border border-emerald-100 bg-white p-5">
            <p className={`text-xs font-black uppercase tracking-[0.16em] ${card.tone}`}>{card.label}</p>
            <p className="mt-3 text-3xl font-black text-slate-950">{card.value}</p>
          </Link>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {links.map((item) => (
          <Link key={item.href} href={item.href} className="rounded-[28px] border border-emerald-100 bg-white p-5">
            <h3 className="text-xl font-black text-slate-950">{item.label}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
          </Link>
        ))}
      </div>
    </AdminPageShell>
  );
}
