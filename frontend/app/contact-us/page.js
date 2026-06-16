"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import InfoPageShell from "../../components/marketing/InfoPageShell";
import api, { extractError } from "../../lib/api";
import { HighlightGrid, SectionCards } from "../../components/marketing/InfoContentBlocks";
import { websiteInfoContent } from "../../lib/info-page-content";

const topics = ["Coupon issue", "Payment support", "Seller payout", "Account verification", "Partnership inquiry", "Other"];

export default function ContactUsPage() {
  const content = websiteInfoContent.contact;
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    topic: "Coupon issue",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      await api.post("/contact/issues", form);
      toast.success("Your issue was submitted to admin support");
      setForm({ fullName: "", email: "", topic: "Coupon issue", message: "" });
    } catch (error) {
      toast.error(extractError(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <InfoPageShell
      eyebrow="Contact Us"
      title="Need help with a coupon, payment, or seller issue?"
      description="Reach the CouponX team for account support, marketplace questions, policy clarifications, or business inquiries."
      ctaHref="/help-support"
      ctaLabel="Open support page"
    >
      <HighlightGrid items={content.highlights} />

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[24px] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <h2 className="text-2xl font-black text-slate-950">Support channels</h2>
          <div className="mt-5 space-y-3 text-sm text-slate-500">
            <p>Email: support@couponx.local</p>
            <p>Business: partnerships@couponx.local</p>
            <p>Hours: Monday to Saturday, 9 AM to 7 PM IST</p>
          </div>
          <div className="mt-8 rounded-[20px] bg-[#f8fff9] p-5">
            <p className="text-sm font-black text-slate-950">Need faster resolution?</p>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              Include your order ID, coupon code status, and screenshots when reporting a failed purchase or payout problem.
            </p>
          </div>
        </div>
        <div className="rounded-[24px] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <h2 className="text-2xl font-black text-slate-950">Send us your query</h2>
          <form onSubmit={onSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <label className="text-sm font-semibold text-slate-700">Full name</label>
              <input
                value={form.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-emerald-100 bg-[#f8fff9] px-4 py-3 text-sm outline-none transition focus:border-[#16a34a] focus:ring-4 focus:ring-emerald-500/10"
                placeholder="Your name"
                required
              />
            </div>
            <div className="sm:col-span-1">
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-emerald-100 bg-[#f8fff9] px-4 py-3 text-sm outline-none transition focus:border-[#16a34a] focus:ring-4 focus:ring-emerald-500/10"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Topic</label>
              <select
                value={form.topic}
                onChange={(event) => updateField("topic", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-emerald-100 bg-[#f8fff9] px-4 py-3 text-sm outline-none transition focus:border-[#16a34a] focus:ring-4 focus:ring-emerald-500/10"
              >
                {topics.map((topic) => <option key={topic}>{topic}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Message</label>
              <textarea
                value={form.message}
                onChange={(event) => updateField("message", event.target.value)}
                rows={5}
                className="mt-2 w-full rounded-2xl border border-emerald-100 bg-[#f8fff9] px-4 py-3 text-sm outline-none transition focus:border-[#16a34a] focus:ring-4 focus:ring-emerald-500/10"
                placeholder="Describe the issue clearly so support can help faster."
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-gradient-to-r from-[#16a34a] to-[#22c55e] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_24px_rgba(34,197,94,0.18)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Sending..." : "Send message"}
            </button>
            <Link href="/faq" className="rounded-xl border border-emerald-200 px-5 py-3 text-sm font-bold text-[#16a34a]">
              Read FAQ
            </Link>
          </form>
        </div>
      </section>

      <SectionCards sections={content.sections} />
    </InfoPageShell>
  );
}
