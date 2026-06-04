"use client";

import { useEffect, useState } from "react";
import AdminPageShell from "../../../components/AdminPageShell";
import DataTable from "../../../components/DataTable";
import api from "../../../lib/api";

export default function AdminAiFailedPage() {
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    api.get("/super-admin/coupons/ai-failed").then(({ data }) => setCoupons(data.coupons || [])).catch(() => null);
  }, []);

  return (
    <AdminPageShell title="AI Failed" subtitle="Failed OCR and mismatch review queue">
      <DataTable
        columns={[
          { key: "title", label: "Title" },
          { key: "platformName", label: "Platform" },
          { key: "aiMatchScore", label: "Score" },
          { key: "screenshotTamperRisk", label: "Tamper risk" }
        ]}
        rows={coupons}
      />
    </AdminPageShell>
  );
}
