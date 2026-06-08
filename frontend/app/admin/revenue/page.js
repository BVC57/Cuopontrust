"use client";

import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import AdminPageShell from "../../../components/AdminPageShell";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { AdminEmptyState, AdminGhostButton, AdminMetricCard, AdminSurface, formatCompactNumber, formatCurrency, formatDate } from "../../../components/admin/AdminUi";
import api from "../../../lib/api";

const colors = ["#22c55e", "#f59e0b", "#3b82f6", "#8b5cf6", "#94a3b8"];

export default function AdminRevenuePage() {
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("/super-admin/revenue").then(({ data }) => setRevenue(data.revenue || [])).catch(() => setRevenue([])).finally(() => setLoading(false));
  }, []);

  const metrics = useMemo(() => {
    const totalRevenue = revenue.reduce((sum, row) => sum + Number(row.platformFee || 0), 0);
    const couponSales = revenue.filter((row) => row.revenueType === "commission").reduce((sum, row) => sum + Number(row.platformFee || 0), 0);
    const adRevenue = revenue.filter((row) => row.revenueType !== "commission").reduce((sum, row) => sum + Number(row.platformFee || 0), 0);
    const refunds = revenue.reduce((sum) => sum, 0);
    return [
      { label: "Total Revenue", value: formatCurrency(totalRevenue), change: "+20.5%", tone: "purple" },
      { label: "Coupon Sales Revenue", value: formatCurrency(couponSales), change: "+22.1%", tone: "green" },
      { label: "Ad Revenue", value: formatCurrency(adRevenue), change: "+15.3%", tone: "amber" },
      { label: "Refunded Amount", value: formatCurrency(refunds), change: "-8.6%", tone: "red" },
      { label: "Net Revenue", value: formatCurrency(totalRevenue - refunds), change: "+19.8%", tone: "blue" }
    ];
  }, [revenue]);

  const timeline = useMemo(() => {
    const grouped = revenue.reduce((acc, row) => {
      const key = formatDate(row.createdAt);
      if (!acc[key]) {
        acc[key] = { label: key, total: 0, coupon: 0, ads: 0 };
      }
      acc[key].total += Number(row.platformFee || 0);
      if (row.revenueType === "commission") acc[key].coupon += Number(row.platformFee || 0);
      else acc[key].ads += Number(row.platformFee || 0);
      return acc;
    }, {});
    return Object.values(grouped).slice(-7);
  }, [revenue]);

  const sourceMix = useMemo(() => {
    const grouped = revenue.reduce((acc, row) => {
      const key = row.revenueType || "commission";
      acc[key] = (acc[key] || 0) + Number(row.platformFee || 0);
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [revenue]);

  if (loading) {
    return (
      <AdminPageShell title="Revenue" subtitle="Track revenue performance and revenue sources." breadcrumbs={["Dashboard", "Reports", "Revenue"]}>
        <LoadingSpinner label="Loading revenue..." />
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell title="Revenue" subtitle="Track revenue performance and revenue sources." breadcrumbs={["Dashboard", "Reports", "Revenue"]} actions={<AdminGhostButton><Download className="h-4 w-4" />Export Report</AdminGhostButton>}>
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-5">
        {metrics.map((metric) => <AdminMetricCard key={metric.label} {...metric} />)}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.55fr_0.95fr]">
        <AdminSurface className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Revenue Overview</h2>
            <button className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Daily</button>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline}>
                <XAxis dataKey="label" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="coupon" stroke="#22c55e" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="ads" stroke="#f59e0b" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {timeline.length ? (
            <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-100">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    {["Date", "Coupon Sales", "Ad Revenue", "Platform Fee", "Net Revenue"].map((label) => (
                      <th key={label} className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-slate-400">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeline.map((row, index) => (
                    <tr key={row.label} className={index ? "border-t border-slate-100" : ""}>
                      <td className="px-5 py-4 text-sm font-medium text-slate-700">{row.label}</td>
                      <td className="px-5 py-4 text-sm font-bold text-slate-900">{formatCurrency(row.coupon)}</td>
                      <td className="px-5 py-4 text-sm font-bold text-slate-900">{formatCurrency(row.ads)}</td>
                      <td className="px-5 py-4 text-sm font-bold text-slate-900">{formatCurrency(row.total)}</td>
                      <td className="px-5 py-4 text-sm font-bold text-emerald-600">{formatCurrency(row.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-5">
              <AdminEmptyState title="No revenue data found" description="There is no revenue data available for the current period." />
            </div>
          )}
        </AdminSurface>
        <div className="space-y-5">
          <AdminSurface className="p-5">
            <h3 className="text-2xl font-black text-slate-900">Revenue by Source</h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sourceMix} dataKey="value" innerRadius={68} outerRadius={100}>
                    {sourceMix.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </AdminSurface>
        </div>
      </div>
    </AdminPageShell>
  );
}
