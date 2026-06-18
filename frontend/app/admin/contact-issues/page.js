"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, Inbox, MessageSquareWarning, Trash2 } from "lucide-react";
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
  AdminToolbar,
  formatCompactNumber,
  formatDateTime,
  paginateItems
} from "../../../components/admin/AdminUi";
import api, { extractError } from "../../../lib/api";

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "open", label: "Open" },
  { value: "under_review", label: "Under Review" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" }
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" }
];

export default function AdminContactIssuesPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [draft, setDraft] = useState({ status: "open", priority: "medium", adminNote: "" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadIssues = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/super-admin/contact-issues");
      setIssues(data.issues || []);
    } catch {
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const filtered = useMemo(() => {
    const needle = search.toLowerCase();
    return issues.filter((issue) => {
      const matchesSearch = `${issue.fullName || ""} ${issue.email || ""} ${issue.topic || ""} ${issue.message || ""}`.toLowerCase().includes(needle);
      const matchesStatus = statusFilter === "all" || issue.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [issues, search, statusFilter]);

  const paginatedIssues = useMemo(() => paginateItems(filtered, page, pageSize), [filtered, page, pageSize]);

  const metrics = useMemo(() => {
    const open = issues.filter((issue) => issue.status === "open").length;
    const reviewing = issues.filter((issue) => issue.status === "under_review").length;
    const resolved = issues.filter((issue) => issue.status === "resolved").length;
    return [
      { label: "Total Issues", value: formatCompactNumber(issues.length), tone: "blue", icon: Inbox },
      { label: "Open", value: formatCompactNumber(open), tone: "red", icon: MessageSquareWarning },
      { label: "Under Review", value: formatCompactNumber(reviewing), tone: "amber", icon: MessageSquareWarning },
      { label: "Resolved", value: formatCompactNumber(resolved), tone: "green", icon: Inbox }
    ];
  }, [issues]);

  const openIssue = (issue) => {
    setSelectedIssue(issue);
    setDraft({
      status: issue.status || "open",
      priority: issue.priority || "medium",
      adminNote: issue.adminNote || ""
    });
  };

  const updateIssue = async () => {
    if (!selectedIssue) return;
    try {
      const { data } = await api.put(`/super-admin/contact-issues/${selectedIssue._id}`, draft);
      toast.success("Issue updated");
      setIssues((current) => current.map((issue) => (issue._id === selectedIssue._id ? data.issue : issue)));
      setSelectedIssue(data.issue);
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  const deleteIssue = async (issue) => {
    try {
      await api.delete(`/super-admin/contact-issues/${issue._id}`);
      toast.success("Issue deleted");
      setIssues((current) => current.filter((item) => item._id !== issue._id));
      if (selectedIssue?._id === issue._id) {
        setSelectedIssue(null);
      }
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  if (loading) {
    return (
      <AdminPageShell title="Contact Issues" subtitle="Handle user-submitted support queries from the contact page." breadcrumbs={["Dashboard", "Support", "Contact Issues"]}>
        <LoadingSpinner label="Loading contact issues..." />
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell title="Contact Issues" subtitle="Handle user-submitted support queries from the contact page." breadcrumbs={["Dashboard", "Support", "Contact Issues"]}>
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {metrics.map((metric) => <AdminMetricCard key={metric.label} {...metric} />)}
      </div>

      <AdminToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, topic, or message..."
        filters={[{ key: "status", value: statusFilter, onChange: setStatusFilter, options: statusOptions }]}
      />

      {filtered.length ? (
        <AdminSurface className="p-5">
          <div className="mb-5">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">All Contact Issues</h2>
            <p className="mt-1 text-sm font-semibold text-slate-400">({formatCompactNumber(filtered.length)})</p>
          </div>
          <div className="admin-table-shell overflow-hidden rounded-[24px] border border-slate-100 overflow-x-auto overflow-y-auto max-h-[640px]">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  {["User", "Topic", "Priority", "Status", "Submitted", "Actions"].map((label) => (
                    <th key={label} className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-slate-400">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedIssues.map((issue, index) => (
                  <tr key={issue._id} className={index ? "border-t border-slate-100" : ""}>
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-slate-900">{issue.fullName}</p>
                      <p className="mt-1 text-xs text-slate-400">{issue.email}</p>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-600">{issue.topic}</td>
                    <td className="px-5 py-4"><AdminStatusChip status={issue.priority} /></td>
                    <td className="px-5 py-4"><AdminStatusChip status={issue.status} /></td>
                    <td className="px-5 py-4 text-sm text-slate-600">{formatDateTime(issue.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <AdminGhostButton className="h-10 w-10 p-0" onClick={() => openIssue(issue)}><Eye className="h-4 w-4" /></AdminGhostButton>
                        <button type="button" onClick={() => deleteIssue(issue)} className="rounded-2xl bg-rose-50 p-3 text-rose-500"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AdminPagination
            totalCount={filtered.length}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(value) => {
              setPageSize(value);
              setPage(1);
            }}
          />
        </AdminSurface>
      ) : (
        <AdminEmptyState title="No contact issues found" description="New contact form submissions will appear here for admin review." />
      )}

      <AdminDetailModal open={Boolean(selectedIssue)} title="Contact Issue Details" onClose={() => setSelectedIssue(null)}>
        {selectedIssue ? (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Name</p><p className="mt-2 text-sm font-bold text-slate-900">{selectedIssue.fullName}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Email</p><p className="mt-2 text-sm font-bold text-slate-900">{selectedIssue.email}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Topic</p><p className="mt-2 text-sm font-bold text-slate-900">{selectedIssue.topic}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Submitted</p><p className="mt-2 text-sm font-bold text-slate-900">{formatDateTime(selectedIssue.createdAt)}</p></div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Message</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{selectedIssue.message}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Status</span>
                <select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none">
                  {statusOptions.filter((option) => option.value !== "all").map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Priority</span>
                <select value={draft.priority} onChange={(event) => setDraft((current) => ({ ...current, priority: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none">
                  {priorityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Admin note</span>
              <textarea value={draft.adminNote} onChange={(event) => setDraft((current) => ({ ...current, adminNote: event.target.value }))} rows={4} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none" placeholder="Add handling notes or resolution details." />
            </label>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={updateIssue} className="rounded-2xl bg-gradient-to-r from-[#16a34a] to-[#22c55e] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_24px_rgba(34,197,94,0.18)]">Update issue</button>
              <AdminGhostButton onClick={() => deleteIssue(selectedIssue)}><Trash2 className="h-4 w-4" />Delete</AdminGhostButton>
            </div>
          </div>
        ) : null}
      </AdminDetailModal>
    </AdminPageShell>
  );
}
