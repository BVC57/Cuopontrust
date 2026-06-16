"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye } from "lucide-react";
import toast from "react-hot-toast";
import AdminPageShell from "../../../components/AdminPageShell";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { AdminDetailModal, AdminEmptyState, AdminGhostButton, AdminMetricCard, AdminPagination, AdminPrimaryButton, AdminStatusChip, AdminSurface, AdminToolbar, AdminUserIdentity, formatCompactNumber, formatCurrency, formatDateTime, paginateItems } from "../../../components/admin/AdminUi";
import api, { extractError } from "../../../lib/api";

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadDisputes = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/super-admin/disputes");
      setDisputes(data.disputes || []);
    } catch {
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDisputes();
  }, []);

  const selected = disputes.find((item) => item._id === selectedId) || null;
  const paginatedDisputes = useMemo(() => paginateItems(disputes, page, pageSize), [disputes, page, pageSize]);

  const metrics = useMemo(() => [
    { label: "Total Disputes", value: formatCompactNumber(disputes.length), change: "+18.7%", tone: "blue" },
    { label: "Open Disputes", value: formatCompactNumber(disputes.filter((item) => item.status === "open").length), change: "+12.3%", tone: "amber" },
    { label: "Under Review", value: formatCompactNumber(disputes.filter((item) => item.status === "under_review").length), change: "+9.6%", tone: "purple" },
    { label: "Resolved Disputes", value: formatCompactNumber(disputes.filter((item) => item.status === "resolved").length), change: "+15.1%", tone: "green" },
    { label: "Closed Disputes", value: formatCompactNumber(disputes.filter((item) => item.status === "rejected").length), change: "-5.4%", tone: "red" }
  ], [disputes]);

  const resolveDispute = async (resolution) => {
    if (!selected?._id) return;
    try {
      await api.put(`/super-admin/disputes/${selected._id}/resolve`, {
        resolution,
        adminNote,
        deductTrustScore: resolution === "refund_buyer" ? 5 : 0,
        markFake: false
      });
      toast.success("Dispute updated");
      setAdminNote("");
      loadDisputes();
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  useEffect(() => {
    setPage(1);
  }, [disputes.length]);

  if (loading) {
    return (
      <AdminPageShell title="Disputes" subtitle="Review disputes and take action on buyer complaints." breadcrumbs={["Dashboard", "Disputes"]}>
        <LoadingSpinner label="Loading disputes..." />
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell title="Disputes" subtitle="Review disputes and take action on buyer complaints." breadcrumbs={["Dashboard", "Disputes"]}>
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-5">
        {metrics.map((metric) => <AdminMetricCard key={metric.label} {...metric} />)}
      </div>
      <AdminToolbar
        searchValue=""
        onSearchChange={() => null}
        searchPlaceholder="Search by dispute ID, user, order ID, email..."
        filters={[
          { key: "status", value: "all", options: [{ value: "all", label: "All Status" }] },
          { key: "reason", value: "all", options: [{ value: "all", label: "All Reasons" }] },
          { key: "payment", value: "all", options: [{ value: "all", label: "All Payment Methods" }] }
        ]}
        extra={<AdminGhostButton>More Filters</AdminGhostButton>}
      />
      <AdminSurface className="p-5">
          <div className="mb-5">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">All Disputes</h2>
            <p className="mt-1 text-sm text-slate-400">({formatCompactNumber(disputes.length)})</p>
          </div>
          {disputes.length ? (
            <div className="overflow-hidden rounded-[24px] border border-slate-100">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    {["Dispute ID", "User", "Order ID", "Amount", "Reason", "Status", "Disputed On", "Actions"].map((label) => (
                      <th key={label} className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-slate-400">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedDisputes.map((row, index) => (
                    <tr key={row._id} className={index ? "border-t border-slate-100" : ""}>
                      <td className="px-5 py-4 text-sm font-bold text-[#16a34a]">{row._id.slice(-9).toUpperCase()}</td>
                      <td className="px-5 py-4"><AdminUserIdentity name={row.buyerId?.name || "Buyer"} email={row.buyerId?.email} /></td>
                      <td className="px-5 py-4 text-sm font-bold text-[#16a34a]">{row.transactionId?.slice?.(-9)?.toUpperCase?.() || row.transactionId || "-"}</td>
                      <td className="px-5 py-4 text-sm font-bold text-slate-900">{formatCurrency(row.couponId?.sellingPrice || 0)}</td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-700">{row.reason}</td>
                      <td className="px-5 py-4"><AdminStatusChip status={row.status} /></td>
                      <td className="px-5 py-4 text-sm text-slate-600">{formatDateTime(row.createdAt)}</td>
                      <td className="px-5 py-4">
                        <button onClick={() => setSelectedId(row._id)} className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-600"><Eye className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <AdminEmptyState title="No disputes found" description="There are no disputes to review right now." />
          )}
          {disputes.length ? (
            <div className="mt-4">
              <AdminPagination
                totalCount={disputes.length}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={(value) => {
                  setPageSize(value);
                  setPage(1);
                }}
              />
            </div>
          ) : null}
      </AdminSurface>
      <AdminDetailModal open={Boolean(selected)} title="Dispute Details" onClose={() => setSelectedId("")}>
        {selected ? (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <AdminUserIdentity name={selected.buyerId?.name || "Buyer"} email={selected.buyerId?.email} />
              <AdminStatusChip status={selected.status} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Dispute ID</p><p className="mt-2 text-sm font-bold text-[#16a34a]">{selected._id.slice(-9).toUpperCase()}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Disputed On</p><p className="mt-2 text-sm font-medium text-slate-700">{formatDateTime(selected.createdAt)}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Amount</p><p className="mt-2 text-sm font-bold text-slate-900">{formatCurrency(selected.couponId?.sellingPrice || 0)}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Reason</p><p className="mt-2 text-sm font-medium text-slate-700">{selected.reason}</p></div>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Description</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{selected.comment || "No detailed description provided by the user."}</p>
            </div>
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">Add Note</p>
              <textarea value={adminNote} onChange={(event) => setAdminNote(event.target.value)} rows={4} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Write an internal note..." />
            </div>
            <div className="grid gap-3">
              <AdminPrimaryButton onClick={() => resolveDispute("refund_buyer")}>Resolve Dispute</AdminPrimaryButton>
              <button onClick={() => resolveDispute("release_seller")} className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-600">Release to Seller</button>
            </div>
          </div>
        ) : null}
      </AdminDetailModal>
    </AdminPageShell>
  );
}
