"use client";

import { useEffect, useState } from "react";
import AdminPageShell from "../../../components/AdminPageShell";
import DataTable from "../../../components/DataTable";
import StatusBadge from "../../../components/StatusBadge";
import api from "../../../lib/api";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    api.get("/super-admin/transactions").then(({ data }) => setTransactions(data.transactions || [])).catch(() => null);
  }, []);

  return (
    <AdminPageShell title="Transactions" subtitle="Escrow state across all orders">
      <DataTable
        columns={[
          { key: "_id", label: "Transaction" },
          { key: "amount", label: "Amount" },
          { key: "paymentStatus", label: "Payment", render: (row) => <StatusBadge status={row.paymentStatus} /> },
          { key: "escrowStatus", label: "Escrow", render: (row) => <StatusBadge status={row.escrowStatus} /> }
        ]}
        rows={transactions}
      />
    </AdminPageShell>
  );
}
