"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminPageShell from "../../../components/AdminPageShell";
import DataTable from "../../../components/DataTable";
import StatusBadge from "../../../components/StatusBadge";
import api, { extractError } from "../../../lib/api";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);

  const loadCoupons = () => {
    api.get("/super-admin/coupons").then(({ data }) => setCoupons(data.coupons || [])).catch(() => null);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

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
    <AdminPageShell title="Coupons" subtitle="Review listed inventory and AI status">
      <DataTable
        columns={[
          { key: "title", label: "Coupon", render: (row) => <div><p className="font-bold uppercase admin-heading">{row.title}</p><p className="text-xs admin-muted">{row.platformName}</p></div> },
          { key: "sellerId", label: "Seller", render: (row) => row.sellerId?.email || "Unknown" },
          { key: "country", label: "Country" },
          { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
          { key: "aiVerificationStatus", label: "AI", render: (row) => <StatusBadge status={row.aiVerificationStatus} /> },
          { key: "actions", label: "Actions", render: (row) => <button onClick={() => removeCoupon(row._id)} className="admin-danger-button">Delete</button> }
        ]}
        rows={coupons}
      />
    </AdminPageShell>
  );
}
