"use client";

import { useEffect, useState } from "react";
import AdminPageShell from "../../../components/AdminPageShell";
import DataTable from "../../../components/DataTable";
import api from "../../../lib/api";

export default function AdminRevenuePage() {
  const [revenue, setRevenue] = useState([]);

  useEffect(() => {
    api.get("/super-admin/revenue").then(({ data }) => setRevenue(data.revenue || [])).catch(() => null);
  }, []);

  return (
    <AdminPageShell title="Revenue" subtitle="Platform earnings from marketplace activity">
      <DataTable
        columns={[
          { key: "grossAmount", label: "Gross" },
          { key: "platformFee", label: "Platform fee" },
          { key: "sellerAmount", label: "Seller amount" },
          { key: "revenueType", label: "Type" }
        ]}
        rows={revenue}
      />
    </AdminPageShell>
  );
}
