"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import AdminPageShell from "../../../components/AdminPageShell";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { AdminEmptyState, AdminGhostButton, AdminSurface } from "../../../components/admin/AdminUi";
import api, { extractError } from "../../../lib/api";

const initialForm = {
  title: "",
  slug: "",
  excerpt: "",
  coverImage: "",
  content: "",
  status: "published"
};

const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

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

  const publishedCount = useMemo(
    () => blogs.filter((item) => item.status === "published").length,
    [blogs]
  );

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const updateField = (field, value) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "title" && (!current.slug || current.slug === slugify(current.title))) {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  const handleEdit = (blog) => {
    setEditingId(blog._id);
    setForm({
      title: blog.title || "",
      slug: blog.slug || "",
      excerpt: blog.excerpt || "",
      coverImage: blog.coverImage || "",
      content: blog.content || "",
      status: blog.status || "draft"
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...form,
        slug: slugify(form.slug || form.title)
      };

      if (!payload.title || !payload.excerpt || !payload.content) {
        toast.error("Title, excerpt, and content are required");
        return;
      }

      if (editingId) {
        await api.put(`/super-admin/blogs/${editingId}`, payload);
        toast.success("Blog updated");
      } else {
        await api.post("/super-admin/blogs", payload);
        toast.success("Blog created");
      }

      resetForm();
      loadBlogs();
    } catch (error) {
      toast.error(extractError(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/super-admin/blogs/${id}`);
      toast.success("Blog deleted");
      if (editingId === id) {
        resetForm();
      }
      loadBlogs();
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  return (
    <AdminPageShell
      title="Blogs"
      subtitle="Create, publish, and manage website blog posts from one place."
      breadcrumbs={["Dashboard", "Blogs"]}
      actions={(
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-[0_12px_24px_rgba(34,197,94,0.2)]"
          >
            <Plus className="h-4 w-4" />
            New Blog
          </button>
        </div>
      )}
    >
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <AdminSurface className="p-5">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Blog Editor</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">{editingId ? "Edit blog post" : "Create blog post"}</h2>
              <p className="mt-2 text-sm text-slate-500">Add the content here and publish it directly to the website blog page.</p>
            </div>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600"
              >
                Cancel
              </button>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-400">Title</span>
              <input
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="Enter blog title"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-400">Slug</span>
              <input
                value={form.slug}
                onChange={(event) => updateField("slug", event.target.value)}
                placeholder="blog-url-slug"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-400">Cover Image URL</span>
              <input
                value={form.coverImage}
                onChange={(event) => updateField("coverImage", event.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-400">Excerpt</span>
              <textarea
                value={form.excerpt}
                onChange={(event) => updateField("excerpt", event.target.value)}
                rows={4}
                placeholder="Short summary for blog cards and SEO."
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-400">Content</span>
              <textarea
                value={form.content}
                onChange={(event) => updateField("content", event.target.value)}
                rows={12}
                placeholder="Write the full blog content here."
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium leading-7 text-slate-900 outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-400">Status</span>
              <select
                value={form.status}
                onChange={(event) => updateField("status", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#16a34a] to-[#22c55e] px-4 py-3 text-sm font-bold text-white shadow-[0_14px_28px_rgba(34,197,94,0.2)] disabled:opacity-70"
            >
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {editingId ? "Update Blog" : "Publish Blog"}
            </button>
          </form>
        </AdminSurface>

        <div className="space-y-6">
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
                        <td className="px-5 py-4 text-sm font-medium text-slate-600">{row.publishedAt ? new Date(row.publishedAt).toLocaleDateString("en-IN") : "Draft"}</td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            <AdminGhostButton onClick={() => handleEdit(row)}><Pencil className="h-4 w-4" />Edit</AdminGhostButton>
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
            <AdminEmptyState title="No blogs available" description="Create your first blog post from the editor on this page." />
          )}
        </div>
      </div>
    </AdminPageShell>
  );
}
