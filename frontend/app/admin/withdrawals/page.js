"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Download, Eye, XCircle } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import toast from "react-hot-toast";
import AdminPageShell from "../../../components/AdminPageShell";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { AdminDetailModal, AdminEmptyState, AdminGhostButton, AdminMetricCard, AdminPagination, AdminStatusChip, AdminSurface, AdminToolbar, AdminUserIdentity, formatCompactNumber, formatCurrency, formatDateTime, paginateItems } from "../../../components/admin/AdminUi";
import api, { extractError } from "../../../lib/api";

const colors = ["#22c55e", "#f59e0b", "#ef4444", "#16a34a", "#94a3b8"];
const downloadCsv = (filename, rows) => {
  const escapeCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const content = rows.map((row) => row.map(escapeCell).join(",")).join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [bankFilter, setBankFilter] = useState("all");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadWithdrawals = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/super-admin/withdrawals");
      setWithdrawals(data.withdrawals || []);
    } catch {
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const methodOptions = useMemo(() => [
    { value: "all", label: "All Payment Methods" },
    { value: "bank", label: "Bank Transfer" },
    { value: "upi", label: "UPI" }
  ], []);
  const bankOptions = useMemo(() => {
    const bankNames = [...new Set(withdrawals.map((row) => String(row.bankName || "").trim()).filter(Boolean))];
    return [{ value: "all", label: "All Banks" }, ...bankNames.map((name) => ({ value: name, label: name }))];
  }, [withdrawals]);

  const filtered = useMemo(
    () =>
      withdrawals.filter((row) => {
        const searchHaystack = `${row.userId?.email || ""} ${row.userId?.name || ""} ${row.upiId || ""} ${row.bankName || ""} ${row.bankDetails || ""} ${row.ifscCode || ""}`.toLowerCase();
        const method = row.method === "bank" || row.bankDetails ? "bank" : "upi";
        const statusMatch = statusFilter === "all" || row.status === statusFilter;
        const methodMatch = methodFilter === "all" || method === methodFilter;
        const bankMatch = bankFilter === "all" || String(row.bankName || "").trim() === bankFilter;
        return searchHaystack.includes(search.toLowerCase()) && statusMatch && methodMatch && bankMatch;
      }),
    [withdrawals, search, statusFilter, methodFilter, bankFilter]
  );
  const paginatedWithdrawals = useMemo(() => paginateItems(filtered, page, pageSize), [filtered, page, pageSize]);

  const metrics = useMemo(() => {
    const total = withdrawals.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const pending = withdrawals.filter((row) => row.status === "pending").reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const approved = withdrawals.filter((row) => row.status === "approved").reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const rejected = withdrawals.filter((row) => row.status === "rejected").reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const fees = total * 0.025;
    return [
      { label: "Total Withdrawals", value: formatCurrency(total), change: "+20.5%", tone: "purple" },
      { label: "Pending", value: formatCurrency(pending), change: "+12.4%", tone: "amber" },
      { label: "Approved", value: formatCurrency(approved), change: "+18.7%", tone: "green" },
      { label: "Rejected", value: formatCurrency(rejected), change: "-6.3%", tone: "red" },
      { label: "Fees Deducted", value: formatCurrency(fees), change: "+8.9%", tone: "blue" }
    ];
  }, [withdrawals]);

  const analytics = useMemo(() => {
    const total = withdrawals.reduce((sum, row) => sum + Number(row.amount || 0), 0) || 1;
    const entries = ["approved", "pending", "rejected", "paid"].map((status) => ({
      name: status,
      value: withdrawals.filter((row) => row.status === status).reduce((sum, row) => sum + Number(row.amount || 0), 0)
    }));
    return { entries, total };
  }, [withdrawals]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, methodFilter, bankFilter]);

  const byMethod = useMemo(() => {
    const grouped = withdrawals.reduce((acc, row) => {
      const key = row.method === "bank" || row.bankDetails ? "Bank Transfer" : row.upiId ? "UPI" : "Others";
      acc[key] = (acc[key] || 0) + Number(row.amount || 0);
      return acc;
    }, {});
    const total = Object.values(grouped).reduce((sum, value) => sum + value, 0) || 1;
    return Object.entries(grouped).map(([name, value]) => ({ name, value, percent: ((value / total) * 100).toFixed(1) }));
  }, [withdrawals]);

  const updateWithdrawal = async (id, action) => {
    try {
      await api.put(`/super-admin/withdrawals/${id}/${action}`, { adminNote: `Admin ${action}` });
      toast.success(action === "approve" ? "Withdrawal approved" : "Withdrawal rejected");
      loadWithdrawals();
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  const exportWithdrawals = () => {
    downloadCsv("admin-withdrawals.csv", [
      ["Withdrawal ID", "User", "User Email", "Amount", "Currency", "Method", "Bank Name", "UPI ID", "IFSC", "Status", "Requested On"],
      ...filtered.map((row) => [
        row._id,
        row.userId?.name || "User",
        row.userId?.email || "",
        row.amount || 0,
        row.currency || "INR",
        row.method === "bank" || row.bankDetails ? "Bank Transfer" : "UPI",
        row.bankName || "",
        row.upiId || "",
        row.ifscCode || "",
        row.status,
        formatDateTime(row.createdAt)
      ])
    ]);
  };

  if (loading) {
    return (
      <AdminPageShell title="Withdrawals" subtitle="Review all seller withdrawals and payout states." breadcrumbs={["Dashboard", "Withdrawals", "All Withdrawals"]}>
        <LoadingSpinner label="Loading withdrawals..." />
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell title="Withdrawals" subtitle="Review all seller withdrawals and payout states." breadcrumbs={["Dashboard", "Withdrawals", "All Withdrawals"]}>
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-5">
        {metrics.map((metric) => <AdminMetricCard key={metric.label} {...metric} />)}
      </div>
      <AdminToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by user, email, ID, or UTR..."
        filters={[
          { key: "status", value: statusFilter, onChange: setStatusFilter, options: [{ value: "all", label: "All Status" }, { value: "pending", label: "Pending" }, { value: "approved", label: "Approved" }, { value: "rejected", label: "Rejected" }] },
          { key: "method", value: methodFilter, onChange: setMethodFilter, options: methodOptions },
          { key: "bank", value: bankFilter, onChange: setBankFilter, options: bankOptions }
        ]}
        extra={<AdminGhostButton onClick={() => { setStatusFilter("all"); setMethodFilter("all"); setBankFilter("all"); setSearch(""); }}>Reset Filters</AdminGhostButton>}
        action={<AdminGhostButton onClick={exportWithdrawals}><Download className="h-4 w-4" />Export</AdminGhostButton>}
      />
      <div className="grid gap-4 xl:grid-cols-2">
        <AdminSurface className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900">Withdrawal Summary</h3>
            <button className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">This Week</button>
          </div>
          <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-center">
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={analytics.entries} dataKey="value" innerRadius={68} outerRadius={100}>
                    {analytics.entries.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {analytics.entries.map((entry, index) => (
                <div key={entry.name} className="rounded-[22px] border border-slate-100 bg-slate-50/80 px-4 py-4">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                    <span className="text-sm font-semibold capitalize text-slate-600">{entry.name}</span>
                  </div>
                  <p className="mt-3 text-2xl font-black text-slate-900">{formatCurrency(entry.value)}</p>
                </div>
              ))}
            </div>
          </div>
        </AdminSurface>
        <AdminSurface className="p-5">
          <h3 className="text-2xl font-black text-slate-900">Top Payment Methods</h3>
          <div className="mt-5 space-y-4">
            {byMethod.map((method, index) => (
              <div key={method.name}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">{method.name}</span>
                  <span className="font-bold text-slate-900">{formatCurrency(method.value)} ({method.percent}%)</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full" style={{ width: `${method.percent}%`, backgroundColor: colors[index % colors.length] }} />
                </div>
              </div>
            ))}
          </div>
        </AdminSurface>
      </div>

      <AdminSurface className="p-5">
          <div className="mb-5">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">All Withdrawals</h2>
            <p className="mt-1 text-sm text-slate-400">({formatCompactNumber(filtered.length)})</p>
          </div>
          {filtered.length ? (
            <div className="admin-table-shell overflow-hidden rounded-[24px] border border-slate-100 overflow-x-auto overflow-y-auto max-h-[640px]">
              <table className="min-w-[1380px] w-full">
                <thead className="sticky top-0 z-10 bg-slate-50">
                  <tr>
                    {["User", "Amount", "Method", "Bank / UPI", "Status", "Requested On", "Actions"].map((label) => (
                      <th key={label} className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-slate-400">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedWithdrawals.map((row, index) => (
                    <tr key={row._id} className={index ? "border-t border-slate-100" : ""}>
                      <td className="px-5 py-4"><AdminUserIdentity name={row.userId?.name || "User"} email={row.userId?.email} /></td>
                      <td className="px-5 py-4 text-sm font-bold text-slate-900">{formatCurrency(row.amount, row.currency)}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-600">{row.method === "bank" || row.bankDetails ? "Bank Transfer" : "UPI"}</td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-600">{row.upiId || row.bankName || row.bankDetails || "-"}</td>
                      <td className="px-5 py-4"><AdminStatusChip status={row.status} /></td>
                      <td className="px-5 py-4 text-sm text-slate-600">{formatDateTime(row.createdAt)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <AdminGhostButton className="h-10 w-10 p-0" onClick={() => setSelectedWithdrawal(row)}><Eye className="h-4 w-4" /></AdminGhostButton>
                          <button onClick={() => updateWithdrawal(row._id, "approve")} className="rounded-2xl bg-emerald-50 p-3 text-emerald-600"><CheckCircle2 className="h-4 w-4" /></button>
                          <button onClick={() => updateWithdrawal(row._id, "reject")} className="rounded-2xl bg-rose-50 p-3 text-rose-500"><XCircle className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <AdminEmptyState title="No withdrawals found" description="No withdrawal requests are available for the selected filters." />
          )}
          {filtered.length ? (
            <AdminPagination
              totalCount={filtered.length}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(value) => {
                setPageSize(value);
                setPage(1);
              }}
            />
          ) : null}
      </AdminSurface>
      <AdminDetailModal open={Boolean(selectedWithdrawal)} title="Withdrawal Details" onClose={() => setSelectedWithdrawal(null)}>
        {selectedWithdrawal ? (
          <div className="space-y-4">
            <AdminUserIdentity name={selectedWithdrawal.userId?.name || "User"} email={selectedWithdrawal.userId?.email} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Withdrawal ID</p><p className="mt-2 text-sm font-bold text-slate-900">{selectedWithdrawal._id}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Status</p><div className="mt-2"><AdminStatusChip status={selectedWithdrawal.status} /></div></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Amount</p><p className="mt-2 text-sm font-bold text-slate-900">{formatCurrency(selectedWithdrawal.amount, selectedWithdrawal.currency)}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Method</p><p className="mt-2 text-sm font-bold text-slate-900">{selectedWithdrawal.method === "bank" || selectedWithdrawal.bankDetails ? "Bank Transfer" : "UPI"}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Bank / UPI Details</p><p className="mt-2 text-sm font-bold text-slate-900 break-all">{selectedWithdrawal.upiId || selectedWithdrawal.bankDetails || "-"}</p></div>
              {selectedWithdrawal.method === "bank" ? (
                <>
                  <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Bank Name</p><p className="mt-2 text-sm font-bold text-slate-900">{selectedWithdrawal.bankName || "-"}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">IFSC</p><p className="mt-2 text-sm font-bold text-slate-900">{selectedWithdrawal.ifscCode || "-"}</p></div>
                </>
              ) : null}
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Requested On</p><p className="mt-2 text-sm font-bold text-slate-900">{formatDateTime(selectedWithdrawal.createdAt)}</p></div>
            </div>
          </div>
        ) : null}
      </AdminDetailModal>
    </AdminPageShell>
  );
}
