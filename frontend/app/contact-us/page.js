import InfoPageShell from "../../components/marketing/InfoPageShell";
import Link from "next/link";

export default function ContactUsPage() {
  return (
    <InfoPageShell
      eyebrow="Contact Us"
      title="Need help with a coupon, payment, or seller issue?"
      description="Reach the CouponX team for account support, marketplace questions, policy clarifications, or business inquiries."
      ctaHref="/help-support"
      ctaLabel="Open support page"
    >
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
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <label className="text-sm font-semibold text-slate-700">Full name</label>
              <input className="mt-2 w-full rounded-2xl border border-emerald-100 bg-[#f8fff9] px-4 py-3 text-sm outline-none" placeholder="Your name" />
            </div>
            <div className="sm:col-span-1">
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <input className="mt-2 w-full rounded-2xl border border-emerald-100 bg-[#f8fff9] px-4 py-3 text-sm outline-none" placeholder="you@example.com" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Topic</label>
              <select className="mt-2 w-full rounded-2xl border border-emerald-100 bg-[#f8fff9] px-4 py-3 text-sm outline-none">
                <option>Coupon issue</option>
                <option>Payment support</option>
                <option>Seller payout</option>
                <option>Account verification</option>
                <option>Partnership inquiry</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Message</label>
              <textarea
                rows={5}
                className="mt-2 w-full rounded-2xl border border-emerald-100 bg-[#f8fff9] px-4 py-3 text-sm outline-none"
                placeholder="Describe the issue clearly so support can help faster."
              />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="rounded-xl bg-gradient-to-r from-[#16a34a] to-[#22c55e] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_24px_rgba(34,197,94,0.18)]">
              Send message
            </button>
            <Link href="/faq" className="rounded-xl border border-emerald-200 px-5 py-3 text-sm font-bold text-[#16a34a]">
              Read FAQ
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          ["Coupon did not work", "Report invalid or expired code issues with proof and order details."],
          ["Withdrawal pending", "Get help with seller payout delays, wallet reconciliation, or bank details."],
          ["Verification review", "Ask about seller KYC, trust score impact, or restricted listings."]
        ].map(([title, text]) => (
          <div key={title} className="rounded-[24px] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <h2 className="text-xl font-black text-slate-950">{title}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-500">{text}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          ["Response time", "Most support requests are reviewed within the same business day when order context and screenshots are included."],
          ["What to include", "Add your registered email, order ID, payment reference, coupon title, and a short description of the issue."],
          ["Escalation path", "Complex coupon disputes, payout holds, and policy questions can be escalated to admin review when needed."]
        ].map(([title, text]) => (
          <div key={title} className="rounded-[24px] border border-emerald-100 bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <h2 className="text-xl font-black text-slate-950">{title}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-500">{text}</p>
          </div>
        ))}
      </section>
    </InfoPageShell>
  );
}
