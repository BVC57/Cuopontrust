"use client";

import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import AdminPageShell from "../../../components/AdminPageShell";
import LoadingSpinner from "../../../components/LoadingSpinner";
import api from "../../../lib/api";

const tones = ["#6f4cff", "#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#14b8a6"];

const labels = {
  totalUsers: "Total Users",
  totalCoupons: "Total Coupons",
  activeCoupons: "Active Coupons",
  failedAiCoupons: "Pending Approvals",
  suspiciousUsers: "Open Disputes",
  totalTransactions: "Total Orders",
  platformRevenue: "Total Revenue",
  pendingEscrow: "Pending Escrow",
  openDisputes: "Open Disputes",
  pendingWithdrawals: "Pending Withdrawals",
  bannedUsers: "Banned Users"
};

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    api.get("/super-admin/dashboard").then(({ data }) => setDashboard(data)).catch(() => null);
  }, []);

  const salesMix = useMemo(() => {
    if (!dashboard?.metrics) return [];
    return [
      { name: "Active", value: dashboard.metrics.activeCoupons || 0 },
      { name: "AI Failed", value: dashboard.metrics.failedAiCoupons || 0 },
      { name: "Disputes", value: dashboard.metrics.openDisputes || 0 },
      { name: "Withdrawals", value: dashboard.metrics.pendingWithdrawals || 0 }
    ];
  }, [dashboard]);

  if (!dashboard) {
    return (
      <AdminPageShell title="Dashboard" subtitle="Marketplace health, revenue, and risk">
        <LoadingSpinner label="Loading admin dashboard..." />
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell title="Dashboard" subtitle="Marketplace health, revenue, and risk">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Object.entries(dashboard.metrics).map(([key, value], index) => (
          <div key={key} className="admin-metric-card">
            <p className="text-xs font-black uppercase tracking-[0.18em] admin-muted">{labels[key] || key}</p>
            <p className="mt-4 text-3xl font-black admin-heading">
              {key.toLowerCase().includes("revenue") || key.toLowerCase().includes("escrow") ? `₹${Number(value || 0).toLocaleString("en-IN")}` : Number(value || 0).toLocaleString("en-IN")}
            </p>
            <p className="mt-3 text-xs font-bold" style={{ color: tones[index % tones.length] }}>
              Live marketplace data
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr_0.9fr]">
        <div className="admin-panel p-6">
          <h2 className="font-display text-xl font-black admin-heading">Revenue Growth</h2>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboard.charts.revenue}>
                <defs>
                  <linearGradient id="revenue-dark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6f4cff" stopOpacity={0.55} />
                    <stop offset="95%" stopColor="#6f4cff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#93a4c4" />
                <YAxis stroke="#93a4c4" />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="url(#revenue-dark)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-panel p-6">
          <h2 className="font-display text-xl font-black admin-heading">Coupon Activity</h2>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboard.charts.revenue}>
                <defs>
                  <linearGradient id="coupon-bars" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#93a4c4" />
                <YAxis stroke="#93a4c4" />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#coupon-bars)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-panel p-6">
          <h2 className="font-display text-xl font-black admin-heading">Sales Mix</h2>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={salesMix} dataKey="value" nameKey="name" innerRadius={65} outerRadius={95} paddingAngle={3}>
                  {salesMix.map((entry, index) => (
                    <Cell key={entry.name} fill={tones[index % tones.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {salesMix.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tones[index % tones.length] }} />
                  <span className="admin-body">{item.name}</span>
                </div>
                <span className="admin-muted">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminPageShell>
  );
}
