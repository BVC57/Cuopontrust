"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
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

export default function BlogForm({ initialData = null, blogId = null }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(
    initialData || initialForm
  );

  const updateField = (field, value) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "title" && (!current.slug || current.slug === slugify(current.title))) {
        next.slug = slugify(value);
      }
      return next;
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

      if (blogId) {
        await api.put(`/super-admin/blogs/${blogId}`, payload);
        toast.success("Blog updated");
      } else {
        await api.post("/super-admin/blogs", payload);
        toast.success("Blog created");
      }

      router.push("/admin/blogs");
      router.refresh();
    } catch (error) {
      toast.error(extractError(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.push("/admin/blogs")}
          className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600"
        >
          Back to Table
        </button>
      </div>

      <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.05)]">
        <div className="mb-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Blog Editor</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">{blogId ? "Edit blog post" : "Create blog post"}</h2>
          <p className="mt-2 text-sm text-slate-500">Save the form and you will return to the blog table page.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 xl:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-400">Title</span>
            <input value={form.title} onChange={(event) => updateField("title", event.target.value)} placeholder="Enter blog title" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none" />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-400">Slug</span>
            <input value={form.slug} onChange={(event) => updateField("slug", event.target.value)} placeholder="blog-url-slug" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none" />
          </label>

          <label className="block xl:col-span-2">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-400">Cover Image URL</span>
            <input value={form.coverImage} onChange={(event) => updateField("coverImage", event.target.value)} placeholder="https://example.com/image.jpg" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none" />
          </label>

          <label className="block xl:col-span-2">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-400">Excerpt</span>
            <textarea value={form.excerpt} onChange={(event) => updateField("excerpt", event.target.value)} rows={4} placeholder="Short summary for blog cards and SEO." className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none" />
          </label>

          <label className="block xl:col-span-2">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-400">Content</span>
            <textarea value={form.content} onChange={(event) => updateField("content", event.target.value)} rows={12} placeholder="Write the full blog content here." className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium leading-7 text-slate-900 outline-none" />
          </label>

          <label className="block xl:max-w-sm">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-400">Status</span>
            <select value={form.status} onChange={(event) => updateField("status", event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none">
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </label>

          <div className="xl:col-span-2">
            <button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#16a34a] to-[#22c55e] px-4 py-3 text-sm font-bold text-white shadow-[0_14px_28px_rgba(34,197,94,0.2)] disabled:opacity-70">
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {blogId ? "Update Blog" : "Publish Blog"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
