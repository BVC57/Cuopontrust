"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminPageShell from "../../../components/AdminPageShell";
import DataTable from "../../../components/DataTable";
import StatusBadge from "../../../components/StatusBadge";
import api, { extractError } from "../../../lib/api";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);

  const loadPayments = () => {
    api.get("/super-admin/payments").then(({ data }) => setPayments(data.payments || [])).catch(() => null);
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const deletePayment = async (id) => {
    try {
      await api.delete(`/super-admin/payments/${id}`);
      toast.success("Payment deleted");
      loadPayments();
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  return (
    <AdminPageShell title="Payments" subtitle="Razorpay authorization and capture lifecycle">
      <DataTable
        columns={[
          { key: "couponId", label: "Coupon", render: (row) => <div><p className="font-bold uppercase admin-heading">{row.couponId?.title || "Payment"}</p><p className="text-xs admin-muted">{row.gatewayOrderId}</p></div> },
          { key: "buyerId", label: "Buyer", render: (row) => row.buyerId?.email || "-" },
          { key: "sellerId", label: "Seller", render: (row) => row.sellerId?.email || "-" },
          { key: "amount", label: "Amount" },
          { key: "paymentStatus", label: "Payment", render: (row) => <StatusBadge status={row.paymentStatus} /> },
          { key: "transactionStatus", label: "Order", render: (row) => <StatusBadge status={row.transactionStatus} /> },
          { key: "actions", label: "Actions", render: (row) => <button onClick={() => deletePayment(row._id)} className="admin-danger-button">Delete</button> }
        ]}
        rows={payments}
      />
    </AdminPageShell>
  );
}
