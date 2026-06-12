"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Eye, Wallet } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import toast from "react-hot-toast";
import AdminPageShell from "../../../components/AdminPageShell";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { AdminDetailModal, AdminEmptyState, AdminGhostButton, AdminMetricCard, AdminPagination, AdminStatusChip, AdminSurface, AdminToolbar, AdminUserIdentity, formatCompactNumber, formatCurrency, formatDateTime, paginateItems } from "../../../components/admin/AdminUi";
import api, { extractError } from "../../../lib/api";

const pieTones = ["#22c55e", "#f59e0b", "#ef4444", "#3b82f6"];

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/super-admin/payments");
      setPayments(data.payments || []);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const filtered = useMemo(
    () => payments.filter((row) => `${row.gatewayOrderId} ${row.buyerId?.email || ""} ${row.sellerId?.email || ""}`.toLowerCase().includes(search.toLowerCase())),
    [payments, search]
  );
  const paginatedPayments = useMemo(() => paginateItems(filtered, page, pageSize), [filtered, page, pageSize]);

  const metricRows = useMemo(() => {
    const totalAmount = payments.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const successAmount = payments.filter((row) => row.paymentStatus === "captured").reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const pendingAmount = payments.filter((row) => ["created", "authorized"].includes(row.paymentStatus)).reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const failedAmount = payments.filter((row) => row.paymentStatus === "failed").reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const refundedAmount = payments.filter((row) => row.paymentStatus === "refunded").reduce((sum, row) => sum + Number(row.amount || 0), 0);

    return [
      { label: "Total Payments", value: formatCurrency(totalAmount), change: "+20.5%", tone: "green", icon: Wallet },
      { label: "Successful Payments", value: formatCurrency(successAmount), change: "+21.3%", tone: "purple", icon: Wallet },
      { label: "Pending Payments", value: formatCurrency(pendingAmount), change: "-6.4%", tone: "amber", icon: Wallet },
      { label: "Failed Payments", value: formatCurrency(failedAmount), change: "-8.7%", tone: "red", icon: Wallet },
      { label: "Refunded Amount", value: formatCurrency(refundedAmount), change: "+12.6%", tone: "blue", icon: Wallet }
    ];
  }, [payments]);

  const analytics = useMemo(() => {
    return [
      { name: "Success", value: payments.filter((row) => row.paymentStatus === "captured").reduce((sum, row) => sum + Number(row.amount || 0), 0) },
      { name: "Pending", value: payments.filter((row) => ["created", "authorized"].includes(row.paymentStatus)).reduce((sum, row) => sum + Number(row.amount || 0), 0) },
      { name: "Failed", value: payments.filter((row) => row.paymentStatus === "failed").reduce((sum, row) => sum + Number(row.amount || 0), 0) },
      { name: "Refunded", value: payments.filter((row) => row.paymentStatus === "refunded").reduce((sum, row) => sum + Number(row.amount || 0), 0) }
    ];
  }, [payments]);

  const paymentMethods = useMemo(() => {
    const grouped = payments.reduce((acc, row) => {
      const key = row.paymentGateway || "razorpay";
      acc[key] = (acc[key] || 0) + Number(row.amount || 0);
      return acc;
    }, {});
    const total = Object.values(grouped).reduce((sum, value) => sum + value, 0) || 1;
    return Object.entries(grouped).map(([name, value]) => ({ name, value, percent: ((value / total) * 100).toFixed(1) }));
  }, [payments]);

  const failedPayments = payments.filter((row) => row.paymentStatus === "failed").slice(0, 3);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const deletePayment = async (id) => {
    try {
      await api.delete(`/super-admin/payments/${id}`);
      toast.success("Payment deleted");
      loadPayments();
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  if (loading) {
    return (
      <AdminPageShell title="Payments" subtitle="Track successful, pending, failed, and refunded payments." breadcrumbs={["Dashboard", "Payments"]}>
        <LoadingSpinner label="Loading payments..." />
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell title="Payments" subtitle="Track successful, pending, failed, and refunded payments." breadcrumbs={["Dashboard", "Payments"]}>
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-5">
        {metricRows.map((metric) => <AdminMetricCard key={metric.label} {...metric} />)}
      </div>

      <AdminToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by transaction ID, user, email..."
        filters={[
          { key: "method", value: "all", options: [{ value: "all", label: "All Payment Methods" }] },
          { key: "status", value: "all", options: [{ value: "all", label: "All Status" }] },
          { key: "date", value: "all", options: [{ value: "all", label: "Select Date" }], icon: "calendar" }
        ]}
        extra={<AdminGhostButton>More Filters</AdminGhostButton>}
        action={<AdminGhostButton><Download className="h-4 w-4" />Export</AdminGhostButton>}
      />

      <div className="grid gap-5 xl:grid-cols-[1.65fr_0.75fr]">
        <AdminSurface className="p-5">
          <div className="mb-5">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">All Payments</h2>
            <p className="mt-1 text-sm text-slate-400">({formatCompactNumber(filtered.length)})</p>
          </div>
          {filtered.length ? (
            <div className="overflow-hidden rounded-[24px] border border-slate-100">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    {["Transaction ID", "User", "Amount", "Payment Method", "Status", "Date & Time", "Order ID", "Actions"].map((label) => (
                      <th key={label} className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-slate-400">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedPayments.map((row, index) => (
                    <tr key={row._id} className={index ? "border-t border-slate-100" : ""}>
                      <td className="px-5 py-4 text-sm font-bold text-[#6f4cff]">{row.gatewayPaymentId || row.gatewayOrderId || row._id.slice(-8)}</td>
                      <td className="px-5 py-4"><AdminUserIdentity name={row.buyerId?.name || "Buyer"} email={row.buyerId?.email} /></td>
                      <td className="px-5 py-4 text-sm font-bold text-slate-900">{formatCurrency(row.amount, row.currency)}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-600 uppercase">{row.paymentGateway || "razorpay"}</td>
                      <td className="px-5 py-4"><AdminStatusChip status={row.paymentStatus === "captured" ? "success" : row.paymentStatus} /></td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-600">{formatDateTime(row.createdAt)}</td>
                      <td className="px-5 py-4 text-sm font-bold text-[#6f4cff]">{row.gatewayOrderId || row._id.slice(-8)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <AdminGhostButton className="h-10 w-10 p-0" onClick={() => setSelectedPayment(row)}><Eye className="h-4 w-4" /></AdminGhostButton>
                          <button onClick={() => deletePayment(row._id)} className="rounded-2xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-500">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <AdminEmptyState title="No payments found" description="No payment data is available for the current search or filter selection." />
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
              <h3 className="text-2xl font-black text-slate-900">Payment Analytics</h3>
              <button className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">This Week</button>
            </div>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={analytics} dataKey="value" innerRadius={68} outerRadius={100}>
                    {analytics.map((entry, index) => <Cell key={entry.name} fill={pieTones[index % pieTones.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {analytics.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: pieTones[index % pieTones.length] }} />
                    <span className="font-semibold text-slate-600">{entry.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{formatCurrency(entry.value)}</span>
                </div>
              ))}
            </div>
          </AdminSurface>

          <AdminSurface className="p-5">
            <h3 className="text-2xl font-black text-slate-900">Payment Methods Overview</h3>
            <div className="mt-5 space-y-4">
              {paymentMethods.map((method, index) => (
                <div key={method.name}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold capitalize text-slate-700">{method.name}</span>
                    <span className="font-bold text-slate-900">{formatCurrency(method.value)} ({method.percent}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full" style={{ width: `${method.percent}%`, backgroundColor: pieTones[index % pieTones.length] }} />
                  </div>
                </div>
              ))}
            </div>
          </AdminSurface>

          <AdminSurface className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900">Recent Failed Payments</h3>
              <span className="text-sm font-bold text-[#6f4cff]">View All</span>
            </div>
            <div className="space-y-4">
              {failedPayments.length ? failedPayments.map((row) => (
                <div key={row._id} className="flex items-center justify-between gap-3">
                  <AdminUserIdentity name={row.buyerId?.name || "Buyer"} email={row.buyerId?.email} />
                  <div className="text-right">
                    <p className="text-sm font-bold text-rose-500">{formatCurrency(row.amount, row.currency)}</p>
                    <p className="text-xs text-slate-400">{formatDateTime(row.createdAt)}</p>
                  </div>
                </div>
              )) : <p className="text-sm text-slate-400">No failed payments in the selected range.</p>}
            </div>
          </AdminSurface>
        </div>
      </div>
      <AdminDetailModal open={Boolean(selectedPayment)} title="Payment Details" onClose={() => setSelectedPayment(null)}>
        {selectedPayment ? (
          <div className="space-y-4">
            <AdminUserIdentity name={selectedPayment.buyerId?.name || "Buyer"} email={selectedPayment.buyerId?.email} />
            <AdminUserIdentity name={selectedPayment.sellerId?.name || "Seller"} email={selectedPayment.sellerId?.email} accent="from-blue-500 to-cyan-500" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Transaction ID</p><p className="mt-2 text-sm font-bold text-slate-900">{selectedPayment.gatewayPaymentId || selectedPayment._id}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Order ID</p><p className="mt-2 text-sm font-bold text-slate-900">{selectedPayment.gatewayOrderId || "-"}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Amount</p><p className="mt-2 text-sm font-bold text-slate-900">{formatCurrency(selectedPayment.amount, selectedPayment.currency)}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Status</p><div className="mt-2"><AdminStatusChip status={selectedPayment.paymentStatus === "captured" ? "success" : selectedPayment.paymentStatus} /></div></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Gateway</p><p className="mt-2 text-sm font-bold text-slate-900">{selectedPayment.paymentGateway || "razorpay"}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Created</p><p className="mt-2 text-sm font-bold text-slate-900">{formatDateTime(selectedPayment.createdAt)}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Seller Amount</p><p className="mt-2 text-sm font-bold text-slate-900">{formatCurrency(selectedPayment.sellerAmount, selectedPayment.currency)}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Platform Fee</p><p className="mt-2 text-sm font-bold text-slate-900">{formatCurrency(selectedPayment.platformFee, selectedPayment.currency)}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Escrow</p><div className="mt-2"><AdminStatusChip status={selectedPayment.escrowStatus || "holding"} /></div></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Coupon</p><p className="mt-2 text-sm font-bold text-slate-900">{selectedPayment.couponId?.title || "-"}</p></div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Payment Record Timeline</p>
              <div className="mt-4 space-y-3">
                {(selectedPayment.paymentEvents || []).length ? (
                  selectedPayment.paymentEvents.slice().reverse().map((event, index) => (
                    <div key={`${event.type}-${index}`} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{event.message || event.type}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-400">{event.type.replaceAll("_", " ")}</p>
                      </div>
                      <div className="text-right">
                        <div><AdminStatusChip status={event.status || selectedPayment.paymentStatus} /></div>
                        <p className="mt-1 text-xs text-slate-400">{formatDateTime(event.createdAt)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No event history stored for this payment yet.</p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </AdminDetailModal>
    </AdminPageShell>
  );
}
