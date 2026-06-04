"use client";

import { useEffect, useState } from "react";
import AdminPageShell from "../../../components/AdminPageShell";
import DataTable from "../../../components/DataTable";
import api from "../../../lib/api";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    api.get("/super-admin/payments").then(({ data }) => setPayments(data.payments || [])).catch(() => null);
  }, []);

  return (
    <AdminPageShell title="Payments" subtitle="Razorpay authorization and capture lifecycle">
      <DataTable
        columns={[
          { key: "gatewayOrderId", label: "Razorpay order" },
          { key: "gatewayPaymentId", label: "Payment id" },
          { key: "amount", label: "Amount" },
          { key: "currency", label: "Currency" },
          { key: "paymentStatus", label: "Status" }
        ]}
        rows={payments}
      />
    </AdminPageShell>
  );
}
