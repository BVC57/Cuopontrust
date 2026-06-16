"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import InfoPageShell from "../../../components/marketing/InfoPageShell";
import LoadingSpinner from "../../../components/LoadingSpinner";
import api from "../../../lib/api";

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

export default function BlogDetailPage() {
  const params = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.slug) {
      return;
    }

    api
      .get(`/blogs/${params.slug}`)
      .then(({ data }) => setBlog(data.blog))
      .catch(() => setBlog(null))
      .finally(() => setLoading(false));
  }, [params?.slug]);

  return (
    <InfoPageShell
      eyebrow="Blog Article"
      title={blog?.title || "CouponX Blog"}
      description={blog?.excerpt || "Marketplace updates, buyer guidance, and seller best practices."}
      ctaHref="/blog"
      ctaLabel="Back to blog"
    >
      {loading ? (
        <LoadingSpinner label="Loading article..." />
      ) : blog ? (
        <article className="rounded-[32px] border border-emerald-100 bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:p-10">
          {blog.coverImage ? (
            <div
              className="mb-8 h-64 rounded-[28px] bg-cover bg-center shadow-[0_16px_34px_rgba(15,23,42,0.08)] sm:h-80"
              style={{ backgroundImage: `url(${blog.coverImage})` }}
            />
          ) : (
            <div className="mb-8 rounded-[28px] bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.18),transparent_25%),linear-gradient(135deg,#fbfffc_0%,#f1fff4_100%)] p-8 shadow-[0_16px_34px_rgba(15,23,42,0.05)]">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#16a34a]">CouponX Editorial</p>
              <h2 className="mt-4 text-4xl font-black text-slate-950">{blog.title}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">{blog.excerpt}</p>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-[#16a34a]">
              {blog.status}
            </span>
            <span className="text-sm text-slate-400">{formatDate(blog.publishedAt || blog.createdAt)}</span>
            <span className="text-sm text-slate-400">By {blog.authorName || "CouponX Admin"}</span>
          </div>
          <div className="mt-8 whitespace-pre-line break-words text-base leading-8 text-slate-600">{blog.content}</div>
        </article>
      ) : (
        <section className="rounded-[30px] border border-emerald-100 bg-white p-10 text-center shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <h2 className="text-3xl font-black text-slate-950">Article not found</h2>
          <p className="mt-4 text-sm leading-7 text-slate-500">This blog may be unpublished, removed, or the link is invalid.</p>
        </section>
      )}
    </InfoPageShell>
  );
}
