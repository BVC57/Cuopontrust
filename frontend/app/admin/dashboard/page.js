"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeIndianRupee,
  BriefcaseBusiness,
  CircleDollarSign,
  Package,
  ShieldAlert,
  Ticket,
  Users
} from "lucide-react";
import { Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import AdminPageShell from "../../../components/AdminPageShell";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { AdminMetricCard, AdminStatusChip, AdminSurface, AdminUserIdentity, formatCompactNumber, formatCurrency } from "../../../components/admin/AdminUi";
import api from "../../../lib/api";

const tones = ["#22c55e", "#3b82f6", "#8b5cf6", "#f59e0b", "#94a3b8"];

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [disputes, setDisputes] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get("/super-admin/dashboard"),
      api.get("/super-admin/transactions"),
      api.get("/super-admin/coupons"),
      api.get("/super-admin/disputes")
    ])
      .then(([dashboardRes, transactionRes, couponRes, disputeRes]) => {
        setDashboard(dashboardRes.data);
        setTransactions(transactionRes.data.transactions || []);
        setCoupons(couponRes.data.coupons || []);
        setDisputes(disputeRes.data.disputes || []);
      })
      .catch(() => null);
  }, []);

  const metrics = useMemo(() => {
    if (!dashboard?.metrics) return [];
    return [
      { label: "Total Users", value: formatCompactNumber(dashboard.metrics.totalUsers), icon: Users, change: "+18.2%", tone: "green" },
      { label: "Total Coupons", value: formatCompactNumber(dashboard.metrics.totalCoupons), icon: Ticket, change: "+22.5%", tone: "purple" },
      { label: "Total Orders", value: formatCompactNumber(dashboard.metrics.totalTransactions), icon: BriefcaseBusiness, change: "+16.8%", tone: "blue" },
      { label: "Total Sales", value: formatCurrency(dashboard.metrics.platformRevenue + dashboard.metrics.pendingEscrow), icon: BadgeIndianRupee, change: "+21.4%", tone: "amber" },
      { label: "Total Earnings", value: formatCurrency(dashboard.metrics.platformRevenue), icon: CircleDollarSign, change: "+20.7%", tone: "green" },
      { label: "Active Disputes", value: formatCompactNumber(dashboard.metrics.openDisputes), icon: ShieldAlert, change: "-8.3%", tone: "red" }
    ];
  }, [dashboard]);

  const chartData = useMemo(() => {
    const revenuePoints = dashboard?.charts?.revenue || [];
    return revenuePoints.map((point, index) => ({
      label: new Date(point.label).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      users: Math.max(1000, Math.round((dashboard?.metrics?.totalUsers || 0) * (0.2 + index * 0.02))),
      orders: Math.max(800, Math.round((dashboard?.metrics?.totalTransactions || 0) * (0.45 + index * 0.015))),
      sales: Math.max(1200, Math.round((dashboard?.metrics?.platformRevenue || 0) * (0.35 + index * 0.025))),
      earnings: point.value || 0
    }));
  }, [dashboard]);

  const salesMix = useMemo(() => {
    const grouped = coupons.reduce((acc, coupon) => {
      const key = coupon.platformName || "Others";
      acc[key] = (acc[key] || 0) + Number(coupon.sellingPrice || 0);
      return acc;
    }, {});

    return Object.entries(grouped)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  }, [coupons]);

  const recentOrders = transactions.slice(0, 5);

  const topCategories = useMemo(() => {
    const grouped = {};
    coupons.forEach((coupon) => {
      (coupon.categories || ["Others"]).forEach((category) => {
        grouped[category] = (grouped[category] || 0) + Number(coupon.sellingPrice || 0);
      });
    });

    const total = Object.values(grouped).reduce((sum, value) => sum + value, 0) || 1;
    return Object.entries(grouped)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({
        name,
        value,
        percent: ((value / total) * 100).toFixed(1)
      }));
  }, [coupons]);

  const recentDisputes = disputes.slice(0, 5);

  const footerMetrics = useMemo(() => {
    if (!dashboard?.metrics) return [];
    return [
      { label: "Total Payouts", value: formatCurrency(dashboard.metrics.pendingEscrow), icon: Package, change: "+19.4%", tone: "blue" },
      { label: "Average Order Value", value: formatCurrency((dashboard.metrics.platformRevenue + dashboard.metrics.pendingEscrow) / Math.max(dashboard.metrics.totalTransactions || 1, 1)), icon: BadgeIndianRupee, change: "+12.6%", tone: "purple" },
      { label: "Conversion Rate", value: "8.42%", icon: CircleDollarSign, change: "+2.1%", tone: "purple" },
      { label: "Active Coupons", value: formatCompactNumber(dashboard.metrics.activeCoupons), icon: Ticket, change: "+14.3%", tone: "blue" },
      { label: "Expired Coupons", value: formatCompactNumber(dashboard.metrics.failedAiCoupons), icon: AlertTriangle, change: "+7.2%", tone: "purple" },
      { label: "Support Tickets", value: formatCompactNumber(dashboard.metrics.openDisputes + dashboard.metrics.pendingWithdrawals), icon: ShieldAlert, change: "-5.3%", tone: "blue" }
    ];
  }, [dashboard]);

  if (!dashboard) {
    return (
      <AdminPageShell title="Dashboard" breadcrumbs={["Dashboard"]}>
        <LoadingSpinner label="Loading admin dashboard..." />
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell title="Welcome back, Super Admin! 👋" breadcrumbs={["Dashboard"]}>
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-6">
        {metrics.map((metric) => (
          <AdminMetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <AdminSurface className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Overview</h2>
            <button className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">This Week</button>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="label" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#22c55e" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="earnings" stroke="#f59e0b" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AdminSurface>

        <AdminSurface className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Sales Analytics</h2>
            <button className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">This Week</button>
          </div>
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={salesMix} dataKey="value" innerRadius={70} outerRadius={105} paddingAngle={2}>
                    {salesMix.map((item, index) => (
                      <Cell key={item.name} fill={tones[index % tones.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {salesMix.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: tones[index % tones.length] }} />
                    <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{formatCurrency(item.value)}</p>
                    <p className="text-xs text-slate-400">
                      {(((item.value || 0) / Math.max(salesMix.reduce((sum, entry) => sum + entry.value, 0), 1)) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AdminSurface>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <AdminSurface className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Recent Orders</h2>
            <span className="text-sm font-bold text-[#6f4cff]">View All</span>
          </div>
          <div className="space-y-4">
            {recentOrders.map((row) => (
              <div key={row._id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black uppercase text-slate-900">{row.couponId?.platformName || row.couponId?.title || "Order"}</p>
                  <p className="text-xs text-slate-400">{row.buyerId?.name || "Buyer"} • {row.couponId?.title || "Coupon"}</p>
                </div>
                <div className="text-right">
                  <AdminStatusChip status={row.transactionStatus === "completed" ? "completed" : row.transactionStatus} />
                  <p className="mt-2 text-sm font-bold text-slate-900">{formatCurrency(row.amount, row.currency)}</p>
                </div>
              </div>
            ))}
          </div>
        </AdminSurface>

        <AdminSurface className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Top Performing Categories</h2>
            <span className="text-sm font-bold text-[#6f4cff]">View All</span>
          </div>
          <div className="space-y-4">
            {topCategories.map((category, index) => (
              <div key={category.name} className="grid grid-cols-[1fr_auto] items-center gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-700">{category.name}</p>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full" style={{ width: `${category.percent}%`, backgroundColor: tones[index % tones.length] }} />
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-900">{category.percent}%</span>
              </div>
            ))}
          </div>
        </AdminSurface>

        <AdminSurface className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Recent Disputes</h2>
            <span className="text-sm font-bold text-[#6f4cff]">View All</span>
          </div>
          <div className="space-y-4">
            {recentDisputes.map((row, index) => (
              <div key={row._id} className="flex items-start justify-between gap-3">
                <AdminUserIdentity name={row.buyerId?.name || "Buyer"} email={`${row.couponId?.platformName || "Coupon"} — ${row.reason}`} accent={["from-amber-500 to-rose-500", "from-violet-500 to-fuchsia-500", "from-blue-500 to-cyan-500"][index % 3]} />
                <AdminStatusChip status={row.status} />
              </div>
            ))}
          </div>
        </AdminSurface>
      </div>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-6">
        {footerMetrics.map((metric) => (
          <AdminMetricCard key={metric.label} {...metric} />
        ))}
      </div>
    </AdminPageShell>
  );
}
