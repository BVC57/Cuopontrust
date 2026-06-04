"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminPageShell from "../../../components/AdminPageShell";
import DataTable from "../../../components/DataTable";
import StatusBadge from "../../../components/StatusBadge";
import api, { extractError } from "../../../lib/api";

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState([]);

  const loadWithdrawals = () => {
    api.get("/super-admin/withdrawals").then(({ data }) => setWithdrawals(data.withdrawals || [])).catch(() => null);
  };

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const updateWithdrawal = async (id, action) => {
    try {
      await api.put(`/super-admin/withdrawals/${id}/${action}`, { adminNote: `Admin ${action}` });
      toast.success(action === "approve" ? "Withdrawal approved" : "Withdrawal rejected");
      loadWithdrawals();
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  const deleteWithdrawal = async (id) => {
    try {
      await api.delete(`/super-admin/withdrawals/${id}`);
      toast.success("Withdrawal deleted");
      loadWithdrawals();
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  return (
    <AdminPageShell title="Withdrawals" subtitle="Seller withdrawal queue">
      <DataTable
        columns={[
          { key: "userId", label: "User", render: (row) => <div><p className="font-bold admin-heading">{row.userId?.name || "User"}</p><p className="text-xs admin-muted">{row.userId?.email}</p></div> },
          { key: "amount", label: "Amount" },
          { key: "currency", label: "Currency" },
          { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
          { key: "upiId", label: "UPI", render: (row) => row.upiId || row.bankDetails || "-" },
          {
            key: "actions",
            label: "Actions",
            render: (row) => (
              <div className="flex flex-wrap gap-2">
                <button onClick={() => updateWithdrawal(row._id, "approve")} className="admin-action-button">Approve</button>
                <button onClick={() => updateWithdrawal(row._id, "reject")} className="admin-secondary-button">Reject</button>
                <button onClick={() => deleteWithdrawal(row._id)} className="admin-danger-button">Delete</button>
              </div>
            )
          }
        ]}
        rows={withdrawals}
      />
    </AdminPageShell>
  );
}
