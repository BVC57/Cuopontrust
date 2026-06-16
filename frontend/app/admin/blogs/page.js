"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import AdminPageShell from "../../../components/AdminPageShell";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { AdminEmptyState, AdminGhostButton, AdminSurface, AdminTableContainer, formatDate } from "../../../components/admin/AdminUi";
import api, { extractError } from "../../../lib/api";

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/super-admin/blogs", { params: { includeDrafts: true } });
      setBlogs(data.blogs || []);
    } catch {
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const sortedBlogs = useMemo(() => {
    return [...blogs].sort((left, right) => {
      const rightDate = new Date(right.publishedAt || right.createdAt || 0).getTime();
      const leftDate = new Date(left.publishedAt || left.createdAt || 0).getTime();
      return rightDate - leftDate;
    });
  }, [blogs]);

  const publishedCount = useMemo(() => blogs.filter((item) => item.status === "published").length, [blogs]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/super-admin/blogs/${id}`);
      toast.success("Blog deleted");
      loadBlogs();
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  return (
    <AdminPageShell
      title="Blogs"
      subtitle="Show only blog table data here. Use Add New to open the form page."
      breadcrumbs={["Dashboard", "Blogs"]}
    >
      <div className="flex justify-end">
        <Link
          href="/admin/blogs/new"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-[0_12px_24px_rgba(34,197,94,0.2)]"
        >
          <Plus className="h-4 w-4" />
          Add New
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Total Blogs", blogs.length],
          ["Published", publishedCount],
          ["Drafts", blogs.length - publishedCount]
        ].map(([label, value]) => (
          <AdminSurface key={label} className="p-5">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
          </AdminSurface>
        ))}
      </section>

      {loading ? (
        <LoadingSpinner label="Loading blogs..." />
      ) : sortedBlogs.length ? (
        <AdminSurface className="p-5">
          <div className="mb-5">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">All Blogs</h2>
            <p className="mt-1 text-sm text-slate-400">Newest posts are shown first.</p>
          </div>
          <AdminTableContainer>
            <table className="min-w-[980px] w-full">
              <thead className="sticky top-0 z-10 bg-slate-50">
                <tr>
                  {["Post", "Author", "Status", "Published", "Actions"].map((label) => (
                    <th key={label} className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-slate-400">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedBlogs.map((row, index) => (
                  <tr key={row._id} className={index ? "border-t border-slate-100" : ""}>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-bold text-slate-900">{row.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs leading-6 text-slate-400">{row.excerpt}</p>
                        <p className="mt-1 text-xs text-slate-400">/{row.slug}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-600">{row.authorName || "CouponX Team"}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${row.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        {row.status || "draft"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-600">{row.publishedAt ? formatDate(row.publishedAt) : "Draft"}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/admin/blogs/${row._id}/edit`} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Link>
                        <button onClick={() => handleDelete(row._id)} className="rounded-2xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-500">
                          <Trash2 className="mr-2 inline h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableContainer>
        </AdminSurface>
      ) : (
        <AdminEmptyState title="No blogs available" description="Use Add New to create your first blog post." />
      )}
    </AdminPageShell>
  );
}
