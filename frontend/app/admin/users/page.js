"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, ShieldCheck, ShoppingBag, UserCheck, Users } from "lucide-react";
import toast from "react-hot-toast";
import AdminPageShell from "../../../components/AdminPageShell";
import LoadingSpinner from "../../../components/LoadingSpinner";
import {
  AdminDetailModal,
  AdminEmptyState,
  AdminGhostButton,
  AdminMetricCard,
  AdminPagination,
  AdminStatusChip,
  AdminSurface,
  AdminTableContainer,
  AdminToolbar,
  AdminUserIdentity,
  formatCompactNumber,
  formatCurrency,
  formatDateTime,
  paginateItems
} from "../../../components/admin/AdminUi";
import api, { extractError } from "../../../lib/api";

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/super-admin/users");
      setUsers(data.users || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const text = `${user.name || ""} ${user.email || ""}`.toLowerCase();
      const roleType = user.totalSales > 0 ? "seller" : "buyer";
      const normalizedStatus = String(user.accountStatus || "active").toLowerCase();
      const matchesSearch = !search || text.includes(search.toLowerCase());
      const matchesRole = roleFilter === "all" || roleType === roleFilter || user.role === roleFilter;
      const matchesStatus = statusFilter === "all" || normalizedStatus === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const metrics = useMemo(() => {
    const todayStart = startOfToday();
    const buyers = users.filter((user) => user.totalPurchases > 0 || user.totalSales === 0).length;
    const sellers = users.filter((user) => user.totalSales > 0).length;
    const verified = users.filter((user) => user.isEmailVerified).length;
    const dailyActiveUsers = users.filter((user) => user.lastLogin && new Date(user.lastLogin) >= todayStart).length;
    const bannedUsers = users.filter((user) => user.accountStatus === "banned").length;

    return [
      { label: "Total Users", value: formatCompactNumber(users.length), icon: Users, tone: "green" },
      { label: "Daily Active Users", value: formatCompactNumber(dailyActiveUsers), icon: UserCheck, tone: "blue" },
      { label: "Banned Users", value: formatCompactNumber(bannedUsers), icon: ShieldCheck, tone: "red" },
      { label: "Sellers", value: formatCompactNumber(sellers), icon: ShoppingBag, tone: "purple" },
      { label: "Buyers", value: formatCompactNumber(buyers), icon: Users, tone: "amber" },
      { label: "Verified Users", value: formatCompactNumber(verified), icon: ShieldCheck, tone: "green" }
    ];
  }, [users]);

  const paginatedUsers = useMemo(() => paginateItems(filteredUsers, page, pageSize), [filteredUsers, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, statusFilter]);

  const toggleBan = async (user) => {
    try {
      await api.put(`/super-admin/users/${user._id}/${user.accountStatus === "banned" ? "unban" : "ban"}`);
      toast.success(user.accountStatus === "banned" ? "User unbanned" : "User banned");
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

  return (
    <AdminPageShell title="Users" subtitle="Manage all buyers, sellers, trust score, and account access." breadcrumbs={["Dashboard", "Users", "All Users"]}>
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-6">
        {metrics.map((metric) => (
          <AdminMetricCard key={metric.label} {...metric} />
        ))}
      </div>

      {loading ? (
        <LoadingSpinner label="Loading users..." />
      ) : (
        <AdminSurface className="p-5">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900">All Users</h2>
              <p className="mt-1 text-sm text-slate-400">Manage user access, roles, trust score, and verification state.</p>
            </div>

            <AdminToolbar
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search users by name, email or phone..."
              filters={[
                {
                  key: "role",
                  value: roleFilter,
                  onChange: setRoleFilter,
                  options: [
                    { label: "All Roles", value: "all" },
                    { label: "Buyer", value: "buyer" },
                    { label: "Seller", value: "seller" },
                    { label: "Super Admin", value: "super_admin" }
                  ]
                },
                {
                  key: "status",
                  value: statusFilter,
                  onChange: setStatusFilter,
                  options: [
                    { label: "All Status", value: "all" },
                    { label: "Active", value: "active" },
                    { label: "Warning", value: "warning" },
                    { label: "Banned", value: "banned" }
                  ]
                }
              ]}
            />

            {filteredUsers.length ? (
              <>
                <AdminTableContainer>
                  <table className="min-w-[1080px] w-full">
                    <thead className="sticky top-0 z-10 bg-slate-50">
                      <tr>
                        {["User", "Role", "Trust Score", "Joined Date", "Last Active", "Status", "Total Spent", "Total Sales", "Actions"].map((label) => (
                          <th key={label} className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-slate-400">{label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.map((user, index) => {
                        const roleLabel = user.totalSales > 0 ? "seller" : "buyer";
                        return (
                          <tr key={user._id} className={index ? "border-t border-slate-100" : ""}>
                            <td className="px-5 py-4">
                              <AdminUserIdentity name={user.name || "Unnamed User"} email={user.email} accent={roleLabel === "seller" ? "from-green-600 to-emerald-500" : "from-emerald-500 to-green-500"} />
                            </td>
                            <td className="px-5 py-4">
                              <AdminStatusChip status={roleLabel} />
                            </td>
                            <td className="px-5 py-4">
                              <div className="inline-flex min-w-[72px] justify-center rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-700">
                                {formatCompactNumber(user.trustScore || 0)}
                              </div>
                            </td>
                            <td className="px-5 py-4 text-sm font-medium text-slate-600">{formatDateTime(user.createdAt)}</td>
                            <td className="px-5 py-4 text-sm font-medium text-slate-600">{formatDateTime(user.lastLogin)}</td>
                            <td className="px-5 py-4">
                              <AdminStatusChip status={user.accountStatus || "active"} />
                            </td>
                            <td className="px-5 py-4 text-sm font-bold text-slate-700">{formatCurrency(user.totalPurchases || 0)}</td>
                            <td className="px-5 py-4 text-sm font-bold text-slate-700">{formatCurrency(user.totalSales || 0)}</td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <AdminGhostButton className="h-10 w-10 p-0" onClick={() => setSelectedUser(user)}><Eye className="h-4 w-4" /></AdminGhostButton>
                                <AdminGhostButton onClick={() => toggleBan(user)} className="px-3">{user.accountStatus === "banned" ? "Unban" : "Ban"}</AdminGhostButton>
                                <button onClick={() => deleteUser(user._id)} className="rounded-2xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-500">Delete</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </AdminTableContainer>
                <AdminPagination
                  totalCount={filteredUsers.length}
                  page={page}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={(value) => {
                    setPageSize(value);
                    setPage(1);
                  }}
                />
              </>
            ) : (
              <AdminEmptyState title="No users found" description="No user records match the current filters. Try changing search, role, or status." />
            )}
          </div>
        </AdminSurface>
      )}

      <AdminDetailModal open={Boolean(selectedUser)} title="User Details" onClose={() => setSelectedUser(null)}>
        {selectedUser ? (
          <div className="space-y-4">
            <AdminUserIdentity name={selectedUser.name || "Unnamed User"} email={selectedUser.email} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Role</p><p className="mt-2 text-sm font-bold text-slate-900">{selectedUser.role || (selectedUser.totalSales > 0 ? "seller" : "buyer")}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Status</p><div className="mt-2"><AdminStatusChip status={selectedUser.accountStatus || "active"} /></div></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Trust Score</p><p className="mt-2 text-sm font-bold text-slate-900">{formatCompactNumber(selectedUser.trustScore || 0)}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Last Active</p><p className="mt-2 text-sm font-bold text-slate-900">{formatDateTime(selectedUser.lastLogin)}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Country</p><p className="mt-2 text-sm font-bold text-slate-900">{selectedUser.country || "India"}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Currency</p><p className="mt-2 text-sm font-bold text-slate-900">{selectedUser.currency || "INR"}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Total Sales</p><p className="mt-2 text-sm font-bold text-slate-900">{formatCurrency(selectedUser.totalSales || 0)}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Total Purchases</p><p className="mt-2 text-sm font-bold text-slate-900">{formatCurrency(selectedUser.totalPurchases || 0)}</p></div>
            </div>
          </div>
        ) : null}
      </AdminDetailModal>
    </AdminPageShell>
  );
}
