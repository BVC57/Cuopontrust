"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import AdminPageShell from "../../../components/AdminPageShell";
import DataTable from "../../../components/DataTable";
import StatusBadge from "../../../components/StatusBadge";
import api, { extractError } from "../../../lib/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", role: "user", country: "India", currency: "INR" });

  const loadUsers = () => {
    api.get("/super-admin/users").then(({ data }) => setUsers(data.users || [])).catch(() => null);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const updateUser = async (id, action) => {
    try {
      await api.put(`/super-admin/users/${id}/${action}`);
      toast.success(action === "ban" ? "User banned" : "User unbanned");
      loadUsers();
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  const deleteUser = async (id) => {
    try {
      await api.delete(`/super-admin/users/${id}`);
      toast.success("User deleted");
      loadUsers();
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  const createUser = async (event) => {
    event.preventDefault();
    try {
      await api.post("/super-admin/users", form);
      toast.success("User created");
      setForm({ name: "", email: "", role: "user", country: "India", currency: "INR" });
      loadUsers();
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  return (
    <AdminPageShell title="Users" subtitle="Manage account reputation and access">
      <div className="admin-panel p-5">
        <form onSubmit={createUser} className="grid gap-3 md:grid-cols-5">
          <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Name" className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm admin-body outline-none" />
          <input value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="Email" className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm admin-body outline-none" />
          <select value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))} className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm admin-body outline-none">
            <option value="user">User</option>
            <option value="super_admin">Super Admin</option>
          </select>
          <input value={form.country} onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))} placeholder="Country" className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm admin-body outline-none" />
          <button type="submit" className="admin-action-button justify-center">
            <Plus className="h-4 w-4" />
            Add User
          </button>
        </form>
      </div>

      <DataTable
        columns={[
          { key: "name", label: "Name", render: (row) => <div><p className="font-bold admin-heading">{row.name || "Unnamed"}</p><p className="text-xs admin-muted">{row.email}</p></div> },
          { key: "role", label: "Role" },
          { key: "trustScore", label: "Trust" },
          { key: "accountStatus", label: "Status", render: (row) => <StatusBadge status={row.accountStatus} /> },
          {
            key: "actions",
            label: "Actions",
            render: (row) => (
              <div className="flex flex-wrap gap-2">
                {row.accountStatus === "banned" ? (
                  <button onClick={() => updateUser(row._id, "unban")} className="admin-secondary-button">Unban</button>
                ) : (
                  <button onClick={() => updateUser(row._id, "ban")} className="admin-secondary-button">Ban</button>
                )}
                <button onClick={() => deleteUser(row._id)} className="admin-danger-button">Delete</button>
              </div>
            )
          }
        ]}
        rows={users}
      />
    </AdminPageShell>
  );
}
