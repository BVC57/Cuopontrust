"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Eye, Settings2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import AdminPageShell from "../../../components/AdminPageShell";
import LoadingSpinner from "../../../components/LoadingSpinner";
import {
  AdminDetailModal,
  AdminEmptyState,
  AdminGhostButton,
  AdminMetricCard,
  AdminPagination,
  AdminStatusChip,
  AdminSurface,
  AdminTableContainer,
  AdminToolbar,
  formatCompactNumber,
  formatCurrency,
  formatDate,
  paginateItems
} from "../../../components/admin/AdminUi";
import api, { extractError } from "../../../lib/api";
import { resolveBrand } from "../../../lib/brandCatalog";

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/super-admin/coupons");
      setCoupons(data.coupons || []);
    } catch {
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) => {
      const text = `${coupon.title} ${coupon.platformName} ${(coupon.categories || []).join(" ")}`.toLowerCase();
      const matchesSearch = !search || text.includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || coupon.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || (coupon.categories || []).includes(categoryFilter);
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [coupons, search, statusFilter, categoryFilter]);

  const categories = useMemo(() => ["all", ...new Set(coupons.flatMap((coupon) => coupon.categories || []))], [coupons]);

  const metrics = useMemo(() => {
    const todayStart = startOfToday();
    const soldCoupons = coupons.filter((coupon) => coupon.status === "sold");
    const totalSoldAmount = soldCoupons.reduce((sum, coupon) => sum + Number(coupon.sellingPrice || 0), 0);
    const dailyListed = coupons.filter((coupon) => coupon.createdAt && new Date(coupon.createdAt) >= todayStart).length;
    const expired = coupons.filter((coupon) => coupon.status === "expired" || (coupon.expiryDate && new Date(coupon.expiryDate) < new Date())).length;

    return [
      { label: "All Listed Coupons", value: formatCompactNumber(coupons.length), tone: "green" },
      { label: "Sold Coupons", value: formatCompactNumber(soldCoupons.length), tone: "blue" },
      { label: "Total Sold Amount", value: formatCurrency(totalSoldAmount), tone: "purple" },
      { label: "Daily Listed Coupons", value: formatCompactNumber(dailyListed), tone: "amber" },
      { label: "Expired Coupons", value: formatCompactNumber(expired), tone: "red" }
    ];
  }, [coupons]);

  const paginatedCoupons = useMemo(() => paginateItems(filteredCoupons, page, pageSize), [filteredCoupons, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, categoryFilter]);

  const removeCoupon = async (id) => {
    try {
      await api.delete(`/super-admin/coupons/${id}`);
      toast.success("Coupon removed");
      loadCoupons();
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  return (
    <AdminPageShell title="Coupons" subtitle="Review all listed coupons, sold volume, new listings, and expiry risk." breadcrumbs={["Dashboard", "Coupons", "All Coupons"]}>
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-5">
        {metrics.map((metric) => (
          <AdminMetricCard key={metric.label} {...metric} />
        ))}
      </div>

      {loading ? (
        <LoadingSpinner label="Loading coupons..." />
      ) : (
        <>
          <AdminToolbar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by title, brand or category..."
            filters={[
              {
                key: "category",
                value: categoryFilter,
                onChange: setCategoryFilter,
                options: categories.map((category) => ({ value: category, label: category === "all" ? "All Categories" : category }))
              },
              {
                key: "status",
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { value: "all", label: "All Status" },
                  { value: "available", label: "Active" },
                  { value: "sold", label: "Sold" },
                  { value: "ai_checking", label: "Pending" },
                  { value: "expired", label: "Expired" },
                  { value: "removed", label: "Removed" }
                ]
              }
            ]}
            extra={<AdminGhostButton><Settings2 className="h-4 w-4" />More Filters</AdminGhostButton>}
          />

          <AdminSurface className="p-5">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-900">All Listed Coupons</h2>
                <p className="mt-1 text-sm text-slate-400">Showing {formatCompactNumber(filteredCoupons.length)} coupon records.</p>
              </div>
              <div className="flex items-center gap-2">
                <AdminGhostButton>Export</AdminGhostButton>
                <AdminGhostButton className="h-11 w-11 p-0"><Settings2 className="h-4 w-4" /></AdminGhostButton>
              </div>
            </div>

            {filteredCoupons.length ? (
              <AdminTableContainer>
                <table className="min-w-[1280px] w-full">
                  <thead className="sticky top-0 z-10 bg-slate-50">
                    <tr>
                      {["S.No", "Title", "Brand", "Seller", "Trust Score", "Category", "Sell Price", "Status", "Expiry Date", "Added On", "Actions"].map((label) => (
                        <th key={label} className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-slate-400">{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCoupons.map((coupon, index) => (
                      <tr key={coupon._id} className={index ? "border-t border-slate-100" : ""}>
                        <td className="px-5 py-4 text-sm font-bold text-slate-600">{(page - 1) * pageSize + index + 1}</td>
                        <td className="px-5 py-4 text-sm font-bold text-slate-900">{coupon.title}</td>
                        <td className="px-5 py-4 text-sm font-medium text-slate-600">{coupon.platformName}</td>
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{coupon.sellerId?.name || "Unknown seller"}</p>
                            <p className="text-xs text-slate-400">{coupon.sellerId?.email || "-"}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="inline-flex min-w-[72px] justify-center rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-700">
                            {formatCompactNumber(coupon.sellerId?.trustScore || 0)}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-slate-600">{coupon.categories?.[0] || "General"}</td>
                        <td className="px-5 py-4 text-sm font-bold text-slate-700">{formatCurrency(coupon.sellingPrice, coupon.currency)}</td>
                        <td className="px-5 py-4"><AdminStatusChip status={coupon.status === "available" ? "active" : coupon.status} /></td>
                        <td className="px-5 py-4 text-sm font-medium text-slate-600">{formatDate(coupon.expiryDate)}</td>
                        <td className="px-5 py-4 text-sm font-medium text-slate-600">{formatDate(coupon.createdAt)}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <AdminGhostButton className="h-10 w-10 p-0" onClick={() => setSelectedCoupon(coupon)}><Eye className="h-4 w-4" /></AdminGhostButton>
                            <button onClick={() => removeCoupon(coupon._id)} className="rounded-2xl bg-rose-50 p-3 text-rose-500"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </AdminTableContainer>
            ) : (
              <AdminEmptyState title="No coupons found" description="No coupon data is available for the current search and filter selection." />
            )}

            {filteredCoupons.length ? (
              <div className="mt-4">
                <AdminPagination
                  totalCount={filteredCoupons.length}
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

          <AdminDetailModal open={Boolean(selectedCoupon)} title="Coupon Details" onClose={() => setSelectedCoupon(null)}>
            {selectedCoupon ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50">
                    {resolveBrand(selectedCoupon.platformBrandKey || selectedCoupon.platformName)?.logoPath ? (
                      <Image
                        src={resolveBrand(selectedCoupon.platformBrandKey || selectedCoupon.platformName)?.logoPath}
                        alt={selectedCoupon.platformName}
                        width={42}
                        height={42}
                        className="h-10 w-10 object-contain"
                      />
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
                  <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Brand</p><p className="mt-2 text-sm font-bold text-slate-900">{selectedCoupon.platformName}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Categories</p><p className="mt-2 text-sm font-bold text-slate-900">{(selectedCoupon.categories || []).join(", ") || "General"}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Coupon Amount</p><p className="mt-2 text-sm font-bold text-slate-900">{formatCurrency(selectedCoupon.couponAmount, selectedCoupon.currency)}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Selling Price</p><p className="mt-2 text-sm font-bold text-slate-900">{formatCurrency(selectedCoupon.sellingPrice, selectedCoupon.currency)}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Seller</p><p className="mt-2 text-sm font-bold text-slate-900">{selectedCoupon.sellerId?.name || "Unknown seller"} | Trust {formatCompactNumber(selectedCoupon.sellerId?.trustScore || 0)}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Status</p><div className="mt-2"><AdminStatusChip status={selectedCoupon.status === "available" ? "active" : selectedCoupon.status} /></div></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Expiry Date</p><p className="mt-2 text-sm font-bold text-slate-900">{formatDate(selectedCoupon.expiryDate)}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Added On</p><p className="mt-2 text-sm font-bold text-slate-900">{formatDate(selectedCoupon.createdAt)}</p></div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">AI Match Score</p><p className="mt-2 text-sm font-bold text-slate-900">{selectedCoupon.aiMatchScore || 0}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">OCR Confidence</p><p className="mt-2 text-sm font-bold text-slate-900">{selectedCoupon.aiExtractedData?.confidenceScore ?? "-"}</p></div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">AI Failure Reasons</p>
                  <div className="mt-3 space-y-2">
                    {(selectedCoupon.aiFailureReasons || []).length ? (
                      selectedCoupon.aiFailureReasons.map((item) => (
                        <p key={item} className="text-sm font-semibold text-rose-500">{item}</p>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No AI mismatch reasons recorded.</p>
                    )}
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Visible Screenshot Text</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{selectedCoupon.aiExtractedData?.visibleTextSnippet || "No OCR text stored."}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Terms</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{selectedCoupon.terms || "No terms added."}</p>
                </div>
              </div>
            ) : null}
          </AdminDetailModal>
        </>
      )}
    </AdminPageShell>
  );
}
