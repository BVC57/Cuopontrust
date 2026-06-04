"use client";

import { useEffect, useState } from "react";
import AdminPageShell from "../../../components/AdminPageShell";
import DataTable from "../../../components/DataTable";
import api from "../../../lib/api";

export default function AdminFraudReportsPage() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    api.get("/super-admin/fraud-reports").then(({ data }) => setReports(data.reports || [])).catch(() => null);
  }, []);

  return (
    <AdminPageShell title="Fraud Reports" subtitle="Suspicious activity and AI mismatch records">
      <DataTable
        columns={[
          { key: "type", label: "Type" },
          { key: "riskLevel", label: "Risk" },
          { key: "description", label: "Description" }
        ]}
        rows={reports}
      />
    </AdminPageShell>
  );
}
