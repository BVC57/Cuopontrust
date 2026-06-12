"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import InfoPageShell from "../../components/marketing/InfoPageShell";
import LoadingSpinner from "../../components/LoadingSpinner";
import api from "../../lib/api";

const formatDate = (value) => {
  if (!value) {
    return "Draft";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const cardAccent = (index) =>
  [
    "from-emerald-50 via-white to-emerald-100/60",
    "from-sky-50 via-white to-emerald-50",
    "from-violet-50 via-white to-emerald-50"
  ][index % 3];

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/blogs")
      .then(({ data }) => setBlogs(data.blogs || []))
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <InfoPageShell
      eyebrow="CouponX Blog"
      title="Tips, trust guides, and marketplace updates."
      description="Read practical articles for buyers and sellers, platform updates, and trust-first coupon marketplace insights."
      ctaHref="/marketplace"
      ctaLabel="Explore marketplace"
    >
      {loading ? (
        <LoadingSpinner label="Loading blog posts..." />
      ) : blogs.length ? (
        <section className="grid gap-6 lg:grid-cols-2">
          {blogs.map((post, index) => (
            <article
              key={post._id}
              className="rounded-[30px] border border-emerald-100 bg-white p-7 shadow-[0_18px_40px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_54px_rgba(22,163,74,0.12)]"
            >
              <div className={`rounded-[24px] bg-gradient-to-br ${cardAccent(index)} p-6`}>
                {post.coverImage ? (
                  <div
                    className="h-44 rounded-[20px] bg-cover bg-center shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
                    style={{ backgroundImage: `url(${post.coverImage})` }}
                  />
                ) : (
                  <div className="flex h-44 items-end rounded-[20px] bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.22),transparent_28%),linear-gradient(135deg,#ffffff_0%,#f3fff5_100%)] p-5 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#16a34a]">CouponX Insights</p>
                      <p className="mt-2 text-2xl font-black leading-tight text-slate-950">{post.title}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-[#16a34a]">
                  {post.status || "Published"}
                </span>
                <span className="text-xs font-medium text-slate-400">{formatDate(post.publishedAt)}</span>
                <span className="text-xs font-medium text-slate-400">By {post.authorName || "CouponX Admin"}</span>
              </div>
              <h2 className="mt-5 text-3xl font-black leading-tight text-slate-950">{post.title}</h2>
              <p className="mt-4 line-clamp-4 text-sm leading-7 text-slate-500">{post.excerpt}</p>
              <div className="mt-6 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{post.authorName || "CouponX Admin"}</p>
                  <p className="text-xs text-slate-400">Marketplace editorial team</p>
                </div>
                <Link
                  href={`/blog/${post.slug}`}
                  className="rounded-2xl bg-gradient-to-r from-[#16a34a] to-[#22c55e] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(34,197,94,0.2)]"
                >
                  Read article
                </Link>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-[30px] border border-emerald-100 bg-white p-10 text-center shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#16a34a]">No posts yet</p>
          <h2 className="mt-4 text-3xl font-black text-slate-950">The blog is ready. Content will appear here once the admin publishes it.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-500">
            Use the super admin panel to add announcements, marketplace guides, and coupon-saving tips.
          </p>
        </section>
      )}
    </InfoPageShell>
  );
}
