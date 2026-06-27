"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Eye, RotateCcw, Trash2 } from "lucide-react";
import AdminPageShell from "../../../components/AdminPageShell";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { AdminDetailModal, AdminEmptyState, AdminGhostButton, AdminMetricCard, AdminPagination, AdminStatusChip, AdminSurface, AdminToolbar, formatCompactNumber, formatDate, paginateItems } from "../../../components/admin/AdminUi";
import api from "../../../lib/api";
import { resolveBrand } from "../../../lib/brandCatalog";

const reasonLabel = (coupon) => coupon.failureReason || "Coupon failed AI verification";

export default function AdminAiFailedPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setLoading(true);
    api.get("/super-admin/coupons/ai-failed").then(({ data }) => setCoupons(data.coupons || [])).catch(() => setCoupons([])).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => coupons.filter((coupon) => `${coupon.title} ${coupon.platformName}`.toLowerCase().includes(search.toLowerCase())), [coupons, search]);
  const paginatedCoupons = useMemo(() => paginateItems(filtered, page, pageSize), [filtered, page, pageSize]);

  const metrics = useMemo(() => [
    { label: "Total Failed Coupons", value: formatCompactNumber(coupons.length), change: "+18.6%", tone: "red" },
    { label: "AI Rejection Rate", value: `${((coupons.length / Math.max(coupons.length + 20, 1)) * 100).toFixed(1)}%`, change: "-2.4%", tone: "purple" },
    { label: "Auto-Removed", value: formatCompactNumber(coupons.filter((coupon) => coupon.screenshotTamperRisk === "critical").length), change: "+22.5%", tone: "blue" },
    { label: "Needs Review", value: formatCompactNumber(coupons.filter((coupon) => coupon.screenshotTamperRisk !== "critical").length), change: "-5.3%", tone: "amber" },
    { label: "Fixed & Re-verified", value: formatCompactNumber(coupons.filter((coupon) => coupon.aiMatchScore > 80).length), change: "+12.8%", tone: "green" }
  ], [coupons]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  if (loading) {
    return (
      <AdminPageShell title="AI Failed Coupons" subtitle="Coupons that failed AI verification." breadcrumbs={["Dashboard", "Coupons", "AI Failed Coupons"]}>
        <LoadingSpinner label="Loading AI failed coupons..." />
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell title="AI Failed Coupons" subtitle="Coupons that failed AI verification." breadcrumbs={["Dashboard", "Coupons", "AI Failed Coupons"]}>
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-5">
        {metrics.map((metric) => <AdminMetricCard key={metric.label} {...metric} />)}
      </div>

      <AdminToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by code, title or brand..."
        filters={[
          { key: "category", value: "all", options: [{ value: "all", label: "All Categories" }] },
          { key: "brand", value: "all", options: [{ value: "all", label: "All Brands" }] },
          { key: "reason", value: "all", options: [{ value: "all", label: "All Failure Reasons" }] },
          { key: "status", value: "all", options: [{ value: "all", label: "All Status" }] }
        ]}
        extra={<AdminGhostButton>Export</AdminGhostButton>}
      />

      <AdminSurface className="p-5">
        <div className="mb-5">
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Failed Coupons</h2>
          <p className="mt-1 text-sm text-slate-400">({formatCompactNumber(filtered.length)})</p>
        </div>

        {filtered.length ? (
          <div className="admin-table-shell overflow-hidden rounded-[24px] border border-slate-100 overflow-x-auto overflow-y-auto max-h-[640px]">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  {["S.No", "Title", "Brand", "Category", "Failure Reason", "Seller", "Detected On", "Status", "Actions"].map((label) => (
                    <th key={label} className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-slate-400">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedCoupons.map((coupon, index) => {
                  const brand = resolveBrand(coupon.platformBrandKey || coupon.platformName);
                  return (
                    <tr key={coupon._id} className={index ? "border-t border-slate-100" : ""}>
                      <td className="px-5 py-4 text-sm font-bold text-slate-900">{(page - 1) * pageSize + index + 1}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
                            {brand?.logoPath ? <Image src={brand.logoPath} alt={coupon.platformName} width={34} height={34} className="h-8 w-8 object-contain" /> : <span className="text-sm font-black">{coupon.platformName?.[0]}</span>}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{coupon.title}</p>
                            <p className="text-xs text-slate-400">{coupon.code ? `Code: ${coupon.code}` : coupon.platformName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-600">{coupon.platformName}</td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-600">{coupon.categories?.[0] || "General"}</td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-slate-900">{reasonLabel(coupon)}</p>
                        <p className="text-xs text-slate-400">Risk: {coupon.screenshotTamperRisk}</p>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-600">
                        <p className="font-bold text-slate-900">{coupon.sellerName || "Unknown Seller"}</p>
                        <p className="text-xs text-slate-400">{coupon.sellerEmail || ""}</p>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-600">{formatDate(coupon.createdAt)}</td>
                      <td className="px-5 py-4"><AdminStatusChip status={coupon.screenshotTamperRisk === "critical" ? "auto_removed" : "needs_review"} /></td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <AdminGhostButton className="h-10 w-10 p-0" onClick={() => setSelectedCoupon(coupon)}><Eye className="h-4 w-4" /></AdminGhostButton>
                          <AdminGhostButton className="h-10 w-10 p-0"><RotateCcw className="h-4 w-4" /></AdminGhostButton>
                          <AdminGhostButton className="h-10 w-10 p-0"><Trash2 className="h-4 w-4" /></AdminGhostButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <AdminEmptyState title="No AI failed coupons found" description="There are no AI failed coupons for the current filters." />
        )}
        {filtered.length ? (
          <div className="mt-4">
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
          </div>
        ) : null}
      </AdminSurface>
      <AdminDetailModal open={Boolean(selectedCoupon)} title="Failed Coupon Details" onClose={() => setSelectedCoupon(null)}>
        {selectedCoupon ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50">
                {resolveBrand(selectedCoupon.platformBrandKey || selectedCoupon.platformName)?.logoPath ? (
                  <Image src={resolveBrand(selectedCoupon.platformBrandKey || selectedCoupon.platformName)?.logoPath} alt={selectedCoupon.platformName} width={42} height={42} className="h-10 w-10 object-contain" />
                ) : (
                  <span className="text-lg font-black text-slate-900">{selectedCoupon.platformName?.[0]}</span>
                )}
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{selectedCoupon.title}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">{selectedCoupon.platformName}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Code</p><p className="mt-2 text-sm font-bold text-slate-900">{selectedCoupon.code || "N/A"}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Category</p><p className="mt-2 text-sm font-bold text-slate-900">{selectedCoupon.categories?.join(", ") || "General"}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Failure Reason</p><p className="mt-2 text-sm font-bold text-slate-900">{reasonLabel(selectedCoupon)}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Seller</p><p className="mt-2 text-sm font-bold text-slate-900">{selectedCoupon.sellerName || "Unknown Seller"}</p><p className="mt-1 text-xs text-slate-400">{selectedCoupon.sellerEmail || ""}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Risk</p><p className="mt-2 text-sm font-bold capitalize text-slate-900">{selectedCoupon.screenshotTamperRisk || "unknown"}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Status</p><div className="mt-2"><AdminStatusChip status={selectedCoupon.screenshotTamperRisk === "critical" ? "auto_removed" : "needs_review"} /></div></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Detected On</p><p className="mt-2 text-sm font-bold text-slate-900">{formatDate(selectedCoupon.createdAt)}</p></div>
            </div>
          </div>
        ) : null}
      </AdminDetailModal>
    </AdminPageShell>
  );
}



