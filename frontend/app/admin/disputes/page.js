"use client";

import { useEffect, useState } from "react";
import AdminPageShell from "../../../components/AdminPageShell";
import DataTable from "../../../components/DataTable";
import api from "../../../lib/api";

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState([]);

  useEffect(() => {
    api.get("/super-admin/disputes").then(({ data }) => setDisputes(data.disputes || [])).catch(() => null);
  }, []);

  return (
    <AdminPageShell title="Disputes" subtitle="Review unresolved buyer reports">
      <DataTable
        columns={[
          { key: "reason", label: "Reason" },
          { key: "status", label: "Status" },
          { key: "resolution", label: "Resolution" },
          { key: "adminNote", label: "Admin note" }
        ]}
        rows={disputes}
      />
    </AdminPageShell>
  );
}
