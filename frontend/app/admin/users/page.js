"use client";

import { useEffect, useState } from "react";
import AdminPageShell from "../../../components/AdminPageShell";
import DataTable from "../../../components/DataTable";
import StatusBadge from "../../../components/StatusBadge";
import api from "../../../lib/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get("/super-admin/users").then(({ data }) => setUsers(data.users || [])).catch(() => null);
  }, []);

  return (
    <AdminPageShell title="Users" subtitle="Manage account reputation and access">
      <DataTable
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "trustScore", label: "Trust" },
          { key: "accountStatus", label: "Status", render: (row) => <StatusBadge status={row.accountStatus} /> }
        ]}
        rows={users}
      />
    </AdminPageShell>
  );
}
