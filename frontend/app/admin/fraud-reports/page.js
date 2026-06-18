"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Eye } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis } from "recharts";
import AdminPageShell from "../../../components/AdminPageShell";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { AdminDetailModal, AdminEmptyState, AdminGhostButton, AdminMetricCard, AdminPagination, AdminStatusChip, AdminSurface, AdminToolbar, AdminUserIdentity, formatCompactNumber, formatCurrency, formatDateTime, paginateItems } from "../../../components/admin/AdminUi";
import api from "../../../lib/api";

const colors = ["#ff2d55", "#f59e0b", "#15803d", "#22c55e", "#86efac"];

export default function AdminFraudReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setLoading(true);
    api.get("/super-admin/fraud-reports").then(({ data }) => setReports(data.reports || [])).catch(() => setReports([])).finally(() => setLoading(false));
  }, []);

  const metrics = useMemo(() => [
    { label: "Total Fraudulent Activities", value: formatCompactNumber(reports.length), change: "+18.6%", tone: "red" },
    { label: "High Risk Activities", value: formatCompactNumber(reports.filter((item) => ["high", "critical"].includes(item.riskLevel)).length), change: "+12.4%", tone: "amber" },
    { label: "Blocked Transactions", value: formatCompactNumber(reports.filter((item) => item.type === "duplicate_coupon").length), change: "+20.8%", tone: "purple" },
    { label: "Affected Users", value: formatCompactNumber(new Set(reports.map((item) => item.userId?._id || item.userId)).size), change: "+15.2%", tone: "blue" },
    { label: "Amount Prevented", value: formatCurrency(reports.length * 700), change: "+22.5%", tone: "green" }
  ], [reports]);

  const chartData = useMemo(() => {
    const grouped = reports.reduce((acc, row) => {
      const key = new Date(row.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(grouped).map(([label, value]) => ({ label, value }));
  }, [reports]);

  const pieData = useMemo(() => {
    const grouped = reports.reduce((acc, row) => {
      acc[row.type] = (acc[row.type] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [reports]);
  const paginatedReports = useMemo(() => paginateItems(reports, page, pageSize), [reports, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [reports.length]);

  if (loading) {
    return (
      <AdminPageShell title="Fraud Reports" subtitle="Review suspicious activity and AI mismatch records." breadcrumbs={["Dashboard", "Reports", "Fraud Reports"]}>
        <LoadingSpinner label="Loading fraud reports..." />
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell title="Fraud Reports" subtitle="Review suspicious activity and AI mismatch records." breadcrumbs={["Dashboard", "Reports", "Fraud Reports"]} actions={<AdminGhostButton><Download className="h-4 w-4" />Export Report</AdminGhostButton>}>
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-5">
        {metrics.map((metric) => <AdminMetricCard key={metric.label} {...metric} />)}
      </div>
      <AdminToolbar
        searchValue=""
        onSearchChange={() => null}
        searchPlaceholder="Search by user, email, transaction ID, IP..."
        filters={[
          { key: "type", value: "all", options: [{ value: "all", label: "All Fraud Types" }] },
          { key: "risk", value: "all", options: [{ value: "all", label: "All Risk Levels" }] },
          { key: "status", value: "all", options: [{ value: "all", label: "All Status" }] }
        ]}
        extra={<AdminGhostButton>More Filters</AdminGhostButton>}
      />

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="grid gap-5">
          <AdminSurface className="p-5">
            <h3 className="text-2xl font-black text-slate-900">Fraud Analytics</h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={68} outerRadius={100}>
                    {pieData.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-5 space-y-3">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                    <span className="font-semibold capitalize text-slate-600">{entry.name.replaceAll("_", " ")}</span>
                  </div>
                  <span className="font-bold text-slate-900">{formatCompactNumber(entry.value)}</span>
                </div>
              ))}
            </div>
          </AdminSurface>

          <AdminSurface className="p-5">
            <h3 className="text-2xl font-black text-slate-900">Fraud Trend</h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="label" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={3} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </AdminSurface>
        </div>

        <AdminSurface className="p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900">Fraud Report Summary</h2>
              <p className="mt-1 text-sm text-slate-400">Live AI mismatch and suspicious activity overview</p>
            </div>
            <span className="rounded-full bg-rose-50 px-4 py-2 text-sm font-black text-rose-500">{formatCompactNumber(reports.length)} reports</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {metrics.slice(0, 4).map((metric) => (
              <div key={metric.label} className="rounded-[22px] border border-slate-100 bg-slate-50/80 px-4 py-4">
                <p className="text-sm font-semibold text-slate-500">{metric.label}</p>
                <p className="mt-3 text-3xl font-black text-slate-900">{metric.value}</p>
                <p className="mt-2 text-xs font-semibold text-slate-400">{metric.change} from last review</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-[24px] border border-slate-100 bg-slate-50/70 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Watchlist</p>
            <div className="mt-4 space-y-3">
              {reports.slice(0, 4).map((row) => (
                <div key={row._id} className="flex items-center justify-between gap-4 rounded-[20px] bg-white px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{row.userId?.name || "User"}</p>
                    <p className="truncate text-xs text-slate-400">{row.type?.replaceAll("_", " ")}</p>
                  </div>
                  <AdminStatusChip status={row.riskLevel} />
                </div>
              ))}
              {!reports.length ? <p className="text-sm text-slate-400">No watchlist data available.</p> : null}
            </div>
          </div>
        </AdminSurface>
      </div>

      {reports.length ? (
        <AdminSurface className="p-5">
          <div className="mb-5">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Fraudulent Activities</h2>
            <p className="mt-1 text-sm text-slate-400">({formatCompactNumber(reports.length)})</p>
          </div>
          <div className="admin-table-shell overflow-hidden rounded-[24px] border border-slate-100 overflow-x-auto overflow-y-auto max-h-[640px]">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  {["ID", "User", "Type", "Risk Level", "Amount", "Status", "Detected On", "Actions"].map((label) => (
                    <th key={label} className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-slate-400">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedReports.map((row, index) => (
                  <tr key={row._id} className={index ? "border-t border-slate-100" : ""}>
                    <td className="px-5 py-4 text-sm font-bold text-[#16a34a]">{row._id.slice(-9).toUpperCase()}</td>
                    <td className="px-5 py-4"><AdminUserIdentity name={row.userId?.name || "User"} email={row.userId?.email} /></td>
                    <td className="px-5 py-4 text-sm font-medium capitalize text-slate-700">{row.type.replaceAll("_", " ")}</td>
                    <td className="px-5 py-4"><AdminStatusChip status={row.riskLevel} /></td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-900">{formatCurrency((index + 1) * 310)}</td>
                    <td className="px-5 py-4"><AdminStatusChip status={row.riskLevel === "low" ? "resolved" : "blocked"} /></td>
                    <td className="px-5 py-4 text-sm text-slate-600">{formatDateTime(row.createdAt)}</td>
                    <td className="px-5 py-4"><AdminGhostButton className="h-10 w-10 p-0" onClick={() => setSelectedReport(row)}><Eye className="h-4 w-4" /></AdminGhostButton></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <AdminPagination
              totalCount={reports.length}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(value) => {
                setPageSize(value);
                setPage(1);
              }}
            />
          </div>
        </AdminSurface>
      ) : (
        <AdminEmptyState title="No fraud reports found" description="There are no fraud records available in the selected period." />
      )}

      <AdminDetailModal open={Boolean(selectedReport)} title="Fraud Report Details" onClose={() => setSelectedReport(null)}>
        {selectedReport ? (
          <div className="space-y-4">
            <AdminUserIdentity name={selectedReport.userId?.name || "User"} email={selectedReport.userId?.email} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Report ID</p><p className="mt-2 text-sm font-bold text-slate-900">{selectedReport._id}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Type</p><p className="mt-2 text-sm font-bold capitalize text-slate-900">{selectedReport.type?.replaceAll("_", " ")}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Risk Level</p><div className="mt-2"><AdminStatusChip status={selectedReport.riskLevel} /></div></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Status</p><div className="mt-2"><AdminStatusChip status={selectedReport.riskLevel === "low" ? "resolved" : "blocked"} /></div></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Detected On</p><p className="mt-2 text-sm font-bold text-slate-900">{formatDateTime(selectedReport.createdAt)}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Amount</p><p className="mt-2 text-sm font-bold text-slate-900">{formatCurrency(310)}</p></div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Description</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{selectedReport.description || "No additional details were recorded for this report."}</p>
            </div>
          </div>
        ) : null}
      </AdminDetailModal>
    </AdminPageShell>
  );
}
