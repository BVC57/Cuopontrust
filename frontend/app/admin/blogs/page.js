"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import AdminPageShell from "../../../components/AdminPageShell";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { AdminEmptyState, AdminGhostButton, AdminSurface } from "../../../components/admin/AdminUi";
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
    <AdminPageShell title="Blogs" subtitle="Review public blog content and manage existing posts." breadcrumbs={["Dashboard", "Blogs"]}>
      {loading ? (
        <LoadingSpinner label="Loading blogs..." />
      ) : blogs.length ? (
        <AdminSurface className="p-5">
          <div className="overflow-hidden rounded-[24px] border border-slate-100">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  {["Post", "Author", "Status", "Published", "Actions"].map((label) => (
                    <th key={label} className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-slate-400">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {blogs.map((row, index) => (
                  <tr key={row._id} className={index ? "border-t border-slate-100" : ""}>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-bold text-slate-900">{row.title}</p>
                        <p className="mt-1 text-xs text-slate-400">/{row.slug}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-600">{row.authorName || "CouponX Team"}</td>
                    <td className="px-5 py-4 text-sm font-semibold capitalize text-slate-700">{row.status || "draft"}</td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-600">{row.publishedAt ? new Date(row.publishedAt).toLocaleDateString("en-IN") : "Draft"}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <AdminGhostButton><Pencil className="h-4 w-4" />Edit</AdminGhostButton>
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
          </div>
        </AdminSurface>
      ) : (
        <AdminEmptyState title="No blogs available" description="There are no blog posts to show right now." />
      )}
    </AdminPageShell>
  );
}
