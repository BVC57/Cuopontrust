"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeIndianRupee,
  Ban,
  BriefcaseBusiness,
  Clock3,
  ShieldAlert,
  Ticket,
  TrendingUp,
  UserCheck,
  Users
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import AdminPageShell from "../../../components/AdminPageShell";
import LoadingSpinner from "../../../components/LoadingSpinner";
import {
  AdminMetricCard,
  AdminStatusChip,
  AdminSurface,
  formatCompactNumber,
  formatCurrency
} from "../../../components/admin/AdminUi";
import api from "../../../lib/api";

const tones = ["#16a34a", "#22c55e", "#f97316", "#15803d", "#e11d48"];

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [users, setUsers] = useState([]);
  const [disputes, setDisputes] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get("/super-admin/dashboard"),
      api.get("/super-admin/transactions"),
      api.get("/super-admin/coupons"),
      api.get("/super-admin/users"),
      api.get("/super-admin/disputes")
    ])
      .then(([dashboardRes, transactionRes, couponRes, userRes, disputeRes]) => {
        setDashboard(dashboardRes.data);
        setTransactions(transactionRes.data.transactions || []);
        setCoupons(couponRes.data.coupons || []);
        setUsers(userRes.data.users || []);
        setDisputes(disputeRes.data.disputes || []);
      })
      .catch(() => null);
  }, []);

  const metrics = useMemo(() => {
    if (!dashboard?.metrics) return [];
    const data = dashboard.metrics;
    return [
      { label: "All Listed Coupons", value: formatCompactNumber(data.totalListedCoupons), icon: Ticket, tone: "green" },
      { label: "Sold Coupons", value: formatCompactNumber(data.soldCoupons), icon: BriefcaseBusiness, tone: "blue" },
      { label: "Daily Listed Coupons", value: formatCompactNumber(data.dailyListedCoupons), icon: Clock3, tone: "amber" },
      { label: "Expired Coupons", value: formatCompactNumber(data.expiredCoupons), icon: AlertTriangle, tone: "red" },
      { label: "Daily Active Users", value: formatCompactNumber(data.dailyActiveUsers), icon: UserCheck, tone: "green" },
      { label: "Banned Users", value: formatCompactNumber(data.bannedUsers), icon: Ban, tone: "red" },
      { label: "Gross Sales", value: formatCurrency(data.totalSalesAmount), icon: BadgeIndianRupee, tone: "purple" },
      { label: "Platform Revenue", value: formatCurrency(data.platformRevenue), icon: TrendingUp, tone: "blue" }
    ];
  }, [dashboard]);

  const trendData = dashboard?.charts?.trend || [];
  const statusMix = useMemo(
    () => (dashboard?.charts?.couponStatus || []).filter((item) => item.value > 0),
    [dashboard]
  );

  const recentOrders = useMemo(() => transactions.slice(0, 6), [transactions]);
  const recentDisputes = useMemo(() => disputes.slice(0, 5), [disputes]);

  const sellerLeaderboard = useMemo(() => {
    return [...users]
      .sort((left, right) => (right.totalSales || 0) - (left.totalSales || 0))
      .slice(0, 5);
  }, [users]);

  const couponHealth = useMemo(() => {
    const available = coupons.filter((coupon) => coupon.status === "available").length;
    const sold = coupons.filter((coupon) => coupon.status === "sold").length;
    const expired = coupons.filter((coupon) => coupon.status === "expired").length;
    const failed = coupons.filter((coupon) => coupon.status === "ai_failed").length;

    return [
      { label: "Available", value: available, status: "active" },
      { label: "Sold", value: sold, status: "sold" },
      { label: "Expired", value: expired, status: "expired" },
      { label: "AI Failed", value: failed, status: "failed" }
    ];
  }, [coupons]);

  if (!dashboard) {
    return (
      <AdminPageShell title="Dashboard" breadcrumbs={["Dashboard"]}>
        <LoadingSpinner label="Loading admin dashboard..." />
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title="Super Admin Dashboard"
      subtitle="Track coupon inventory, sales flow, user activity, and marketplace health from one place."
      breadcrumbs={["Dashboard"]}
    >
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {metrics.map((metric) => (
          <AdminMetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <AdminSurface className="p-5">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900">Coupon and User Trend</h2>
              <p className="text-sm text-slate-500">Daily listed coupons, sold coupons, active users, and sales amount.</p>
            </div>
          </div>
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="salesAmount" name="Sales Amount" stroke="#16a34a" fill="url(#salesFill)" strokeWidth={3} />
                <Bar dataKey="listedCoupons" name="Listed" fill="#22c55e" radius={[8, 8, 0, 0]} />
                <Bar dataKey="soldCoupons" name="Sold" fill="#f97316" radius={[8, 8, 0, 0]} />
                <Bar dataKey="activeUsers" name="Active Users" fill="#15803d" radius={[8, 8, 0, 0]} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AdminSurface>

        <AdminSurface className="p-5">
          <div className="mb-5">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Coupon Status Mix</h2>
            <p className="text-sm text-slate-500">Live view of available, sold, expired, and failed coupons.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusMix} dataKey="value" innerRadius={58} outerRadius={98} paddingAngle={4}>
                    {statusMix.map((item, index) => (
                      <Cell key={item.name} fill={tones[index % tones.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {statusMix.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: tones[index % tones.length] }} />
                    <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{formatCompactNumber(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </AdminSurface>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <AdminSurface className="p-5">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900">Sales and Orders Snapshot</h2>
              <p className="text-sm text-slate-500">Completed order volume against daily order count.</p>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" name="Orders" fill="#22c55e" radius={[8, 8, 0, 0]} />
                <Bar dataKey="salesAmount" name="Sales Amount" fill="#16a34a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminSurface>

        <AdminSurface className="p-5">
          <div className="mb-5">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Marketplace Health</h2>
            <p className="text-sm text-slate-500">Quick signals for coupon quality and support load.</p>
          </div>
          <div className="space-y-4">
            {couponHealth.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
                <div>
                  <p className="text-sm font-bold text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">Coupon status bucket</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-slate-900">{formatCompactNumber(item.value)}</p>
                  <AdminStatusChip status={item.status} />
                </div>
              </div>
            ))}
            <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">Open disputes</p>
                  <p className="text-xs text-slate-500">Cases that still need admin action</p>
                </div>
                <p className="text-xl font-black text-slate-900">{formatCompactNumber(dashboard.metrics.openDisputes)}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">Pending withdrawals</p>
                  <p className="text-xs text-slate-500">Payout requests waiting for review</p>
                </div>
                <p className="text-xl font-black text-slate-900">{formatCompactNumber(dashboard.metrics.pendingWithdrawals)}</p>
              </div>
            </div>
          </div>
        </AdminSurface>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <AdminSurface className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Recent Orders</h2>
            <span className="text-sm font-semibold text-slate-500">{formatCompactNumber(recentOrders.length)} shown</span>
          </div>
          <div className="space-y-4">
            {recentOrders.map((row) => (
              <div key={row._id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black uppercase text-slate-900">{row.couponId?.title || "Order"}</p>
                  <p className="truncate text-xs text-slate-500">{row.buyerId?.name || "Buyer"} | {row.sellerId?.name || "Seller"}</p>
                </div>
                <div className="text-right">
                  <AdminStatusChip status={row.transactionStatus} />
                  <p className="mt-2 text-sm font-bold text-slate-900">{formatCurrency(row.amount, row.currency)}</p>
                </div>
              </div>
            ))}
          </div>
        </AdminSurface>

        <AdminSurface className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Top Sellers</h2>
            <span className="text-sm font-semibold text-slate-500">By total sales</span>
          </div>
          <div className="space-y-4">
            {sellerLeaderboard.map((user) => (
              <div key={user._id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">{user.name || "Unnamed User"}</p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">{formatCurrency(user.totalSales)}</p>
                  <p className="text-xs text-slate-500">Trust {formatCompactNumber(user.trustScore || 0)}</p>
                </div>
              </div>
            ))}
          </div>
        </AdminSurface>

        <AdminSurface className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Recent Disputes</h2>
            <span className="text-sm font-semibold text-slate-500">Latest cases</span>
          </div>
          <div className="space-y-4">
            {recentDisputes.map((row) => (
              <div key={row._id} className="rounded-2xl bg-slate-50 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{row.couponId?.title || "Coupon dispute"}</p>
                    <p className="truncate text-xs text-slate-500">{row.buyerId?.name || "Buyer"} | {row.reason}</p>
                  </div>
                  <AdminStatusChip status={row.status || "open"} />
                </div>
              </div>
            ))}
          </div>
        </AdminSurface>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="Total Users" value={formatCompactNumber(dashboard.metrics.totalUsers)} icon={Users} tone="green" />
        <AdminMetricCard label="Active Coupons" value={formatCompactNumber(dashboard.metrics.activeCoupons)} icon={Ticket} tone="blue" />
        <AdminMetricCard label="Escrow Holding" value={formatCurrency(dashboard.metrics.pendingEscrow)} icon={ShieldAlert} tone="amber" />
        <AdminMetricCard label="AI Failed Coupons" value={formatCompactNumber(dashboard.metrics.failedAiCoupons)} icon={AlertTriangle} tone="red" />
      </div>
    </AdminPageShell>
  );
}
