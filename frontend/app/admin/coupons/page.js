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
  AdminStatusChip,
  AdminSurface,
  AdminToolbar,
  formatCompactNumber,
  formatDate
} from "../../../components/admin/AdminUi";
import api, { extractError } from "../../../lib/api";
import { resolveBrand } from "../../../lib/brandCatalog";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedCoupon, setSelectedCoupon] = useState(null);

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

  const metrics = useMemo(
    () => [
      { label: "Total Coupons", value: formatCompactNumber(coupons.length), change: "+18.5%", tone: "green" },
      { label: "Active Coupons", value: formatCompactNumber(coupons.filter((coupon) => coupon.status === "available").length), change: "+15.3%", tone: "blue" },
      { label: "Pending Coupons", value: formatCompactNumber(coupons.filter((coupon) => coupon.status === "ai_checking").length), change: "+5.7%", tone: "amber" },
      { label: "Rejected Coupons", value: formatCompactNumber(coupons.filter((coupon) => coupon.status === "removed" || coupon.status === "fake").length), change: "-3.2%", tone: "red" },
      { label: "Expired Coupons", value: formatCompactNumber(coupons.filter((coupon) => coupon.status === "expired").length), change: "+8.1%", tone: "purple" }
    ],
    [coupons]
  );

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
    <AdminPageShell title="Coupons" subtitle="Manage all marketplace coupon inventory." breadcrumbs={["Dashboard", "Coupons", "All Coupons"]}>
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
            searchPlaceholder="Search by code, title or brand..."
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
                  { value: "ai_checking", label: "Pending" },
                  { value: "expired", label: "Expired" },
                  { value: "removed", label: "Rejected" }
                ]
              }
            ]}
            extra={<AdminGhostButton><Settings2 className="h-4 w-4" />More Filters</AdminGhostButton>}
          />

          <AdminSurface className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-900">All Coupons</h2>
                <p className="mt-1 text-sm text-slate-400">({formatCompactNumber(filteredCoupons.length)})</p>
              </div>
              <div className="flex items-center gap-2">
                <AdminGhostButton>Export</AdminGhostButton>
                <AdminGhostButton className="h-11 w-11 p-0"><Settings2 className="h-4 w-4" /></AdminGhostButton>
              </div>
            </div>

            {filteredCoupons.length ? (
              <div className="overflow-hidden rounded-[24px] border border-slate-100">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      {["S.No", "Title", "Code", "Brand", "Category", "Discount", "Status", "Expiry Date", "Added On", "Actions"].map((label) => (
                        <th key={label} className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-slate-400">{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCoupons.map((coupon, index) => {
                      return (
                        <tr key={coupon._id} className={index ? "border-t border-slate-100" : ""}>
                          <td className="px-5 py-4 text-sm font-bold text-slate-600">{index + 1}</td>
                          <td className="px-5 py-4 text-sm font-bold text-slate-900">{coupon.title}</td>
                          <td className="px-5 py-4"><span className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-600">Hidden</span></td>
                          <td className="px-5 py-4 text-sm font-medium text-slate-600">{coupon.platformName}</td>
                          <td className="px-5 py-4 text-sm font-medium text-slate-600">{coupon.categories?.[0] || "General"}</td>
                          <td className="px-5 py-4 text-sm font-bold text-emerald-600">{Math.round(((coupon.couponAmount - coupon.sellingPrice) / Math.max(coupon.couponAmount, 1)) * 100)}% OFF</td>
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <AdminEmptyState title="No coupons found" description="No coupon data is available for the current search and filter selection." />
            )}
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
                  <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Coupon Amount</p><p className="mt-2 text-sm font-bold text-slate-900">{selectedCoupon.couponAmount}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Selling Price</p><p className="mt-2 text-sm font-bold text-slate-900">{selectedCoupon.sellingPrice}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Status</p><div className="mt-2"><AdminStatusChip status={selectedCoupon.status === "available" ? "active" : selectedCoupon.status} /></div></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Expiry Date</p><p className="mt-2 text-sm font-bold text-slate-900">{formatDate(selectedCoupon.expiryDate)}</p></div>
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
