"use client";

import { useEffect, useState } from "react";
import AdminPageShell from "../../../components/AdminPageShell";
import DataTable from "../../../components/DataTable";
import api from "../../../lib/api";

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState([]);

  useEffect(() => {
    api.get("/super-admin/withdrawals").then(({ data }) => setWithdrawals(data.withdrawals || [])).catch(() => null);
  }, []);

  return (
    <AdminPageShell title="Withdrawals" subtitle="Seller withdrawal queue">
      <DataTable
        columns={[
          { key: "amount", label: "Amount" },
          { key: "currency", label: "Currency" },
          { key: "status", label: "Status" },
          { key: "upiId", label: "UPI" }
        ]}
        rows={withdrawals}
      />
    </AdminPageShell>
  );
}
