"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Eye } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import AdminPageShell from "../../../components/AdminPageShell";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { AdminDetailModal, AdminEmptyState, AdminGhostButton, AdminMetricCard, AdminPagination, AdminStatusChip, AdminSurface, AdminToolbar, AdminUserIdentity, formatCompactNumber, formatCurrency, formatDateTime, paginateItems } from "../../../components/admin/AdminUi";
import api from "../../../lib/api";

const colors = ["#22c55e", "#f59e0b", "#8b5cf6", "#94a3b8"];

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setLoading(true);
    api.get("/super-admin/transactions").then(({ data }) => setTransactions(data.transactions || [])).catch(() => setTransactions([])).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => transactions.filter((row) => `${row._id} ${row.buyerId?.email || ""}`.toLowerCase().includes(search.toLowerCase())), [transactions, search]);
  const paginatedTransactions = useMemo(() => paginateItems(filtered, page, pageSize), [filtered, page, pageSize]);

  const metrics = useMemo(() => {
    const totalAmount = transactions.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    return [
      { label: "Total Transactions", value: formatCompactNumber(transactions.length), change: "+18.7%", tone: "purple" },
      { label: "Total Amount", value: formatCurrency(totalAmount), change: "+21.4%", tone: "green" },
      { label: "Successful Transactions", value: formatCompactNumber(transactions.filter((row) => row.transactionStatus === "completed").length), change: "+20.3%", tone: "green" },
      { label: "Refunded Transactions", value: formatCompactNumber(transactions.filter((row) => row.paymentStatus === "refunded").length), change: "-8.6%", tone: "amber" },
      { label: "Pending Transactions", value: formatCompactNumber(transactions.filter((row) => ["created", "authorized"].includes(row.paymentStatus)).length), change: "-5.2%", tone: "amber" }
    ];
  }, [transactions]);

  const analytics = useMemo(() => [
    { name: "Successful", value: transactions.filter((row) => row.transactionStatus === "completed").length },
    { name: "Refunded", value: transactions.filter((row) => row.paymentStatus === "refunded").length },
    { name: "Pending", value: transactions.filter((row) => ["created", "authorized"].includes(row.paymentStatus)).length },
    { name: "Failed", value: transactions.filter((row) => row.paymentStatus === "failed").length }
  ], [transactions]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  if (loading) {
    return (
      <AdminPageShell title="Transactions" subtitle="Monitor transaction lifecycle and payment movement." breadcrumbs={["Dashboard", "Transactions"]}>
        <LoadingSpinner label="Loading transactions..." />
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell title="Transactions" subtitle="Monitor transaction lifecycle and payment movement." breadcrumbs={["Dashboard", "Transactions"]}>
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-5">
        {metrics.map((metric) => <AdminMetricCard key={metric.label} {...metric} />)}
      </div>
      <AdminToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by transaction id, user, email..."
        filters={[
          { key: "type", value: "all", options: [{ value: "all", label: "All Types" }] },
          { key: "status", value: "all", options: [{ value: "all", label: "All Status" }] },
          { key: "method", value: "all", options: [{ value: "all", label: "All Payment Methods" }] }
        ]}
        extra={<AdminGhostButton>More Filters</AdminGhostButton>}
      />
      <div className="grid gap-5 xl:grid-cols-[1.65fr_0.75fr]">
        <AdminSurface className="p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900">All Transactions</h2>
              <p className="mt-1 text-sm text-slate-400">({formatCompactNumber(filtered.length)})</p>
            </div>
            <AdminGhostButton><Download className="h-4 w-4" />Export</AdminGhostButton>
          </div>
          {filtered.length ? (
            <div className="overflow-hidden rounded-[24px] border border-slate-100">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    {["Transaction ID", "User", "Type", "Amount", "Payment Method", "Status", "Date & Time", "Actions"].map((label) => (
                      <th key={label} className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-slate-400">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map((row, index) => (
                    <tr key={row._id} className={index ? "border-t border-slate-100" : ""}>
                      <td className="px-5 py-4 text-sm font-bold text-[#6f4cff]">{row._id.slice(-10).toUpperCase()}</td>
                      <td className="px-5 py-4"><AdminUserIdentity name={row.buyerId?.name || "Buyer"} email={row.buyerId?.email} /></td>
                      <td className="px-5 py-4"><AdminStatusChip status={row.paymentStatus === "refunded" ? "refunded" : "success"} /></td>
                      <td className={`px-5 py-4 text-sm font-bold ${row.paymentStatus === "refunded" ? "text-rose-500" : "text-slate-900"}`}>{row.paymentStatus === "refunded" ? "-" : ""}{formatCurrency(row.amount, row.currency)}</td>
                      <td className="px-5 py-4 text-sm font-semibold uppercase text-slate-600">{row.paymentGateway || "razorpay"}</td>
                      <td className="px-5 py-4"><AdminStatusChip status={row.paymentStatus === "captured" ? "success" : row.paymentStatus} /></td>
                      <td className="px-5 py-4 text-sm text-slate-600">{formatDateTime(row.createdAt)}</td>
                      <td className="px-5 py-4"><AdminGhostButton className="h-10 w-10 p-0" onClick={() => setSelectedTransaction(row)}><Eye className="h-4 w-4" /></AdminGhostButton></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <AdminEmptyState title="No transactions found" description="No transactions match the current search or filter selection." />
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
        <div className="space-y-5">
          <AdminSurface className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900">Transaction Analytics</h3>
              <button className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">This Week</button>
            </div>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={analytics} dataKey="value" innerRadius={68} outerRadius={100}>
                    {analytics.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </AdminSurface>
        </div>
      </div>
      <AdminDetailModal open={Boolean(selectedTransaction)} title="Transaction Details" onClose={() => setSelectedTransaction(null)}>
        {selectedTransaction ? (
          <div className="space-y-4">
            <AdminUserIdentity name={selectedTransaction.buyerId?.name || "Buyer"} email={selectedTransaction.buyerId?.email} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Transaction ID</p><p className="mt-2 text-sm font-bold text-slate-900">{selectedTransaction._id}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Amount</p><p className="mt-2 text-sm font-bold text-slate-900">{formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Payment Status</p><div className="mt-2"><AdminStatusChip status={selectedTransaction.paymentStatus === "captured" ? "success" : selectedTransaction.paymentStatus} /></div></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Transaction Status</p><div className="mt-2"><AdminStatusChip status={selectedTransaction.transactionStatus || "created"} /></div></div>
            </div>
          </div>
        ) : null}
      </AdminDetailModal>
    </AdminPageShell>
  );
}
