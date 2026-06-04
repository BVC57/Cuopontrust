"use client";

import { useEffect, useState } from "react";
import AdminPageShell from "../../../components/AdminPageShell";
import DataTable from "../../../components/DataTable";
import StatusBadge from "../../../components/StatusBadge";
import api from "../../../lib/api";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    api.get("/super-admin/coupons").then(({ data }) => setCoupons(data.coupons || [])).catch(() => null);
  }, []);

  return (
    <AdminPageShell title="Coupons" subtitle="Review listed inventory and AI status">
      <DataTable
        columns={[
          { key: "title", label: "Title" },
          { key: "platformName", label: "Platform" },
          { key: "country", label: "Country" },
          { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
          { key: "aiVerificationStatus", label: "AI", render: (row) => <StatusBadge status={row.aiVerificationStatus} /> }
        ]}
        rows={coupons}
      />
    </AdminPageShell>
  );
}
