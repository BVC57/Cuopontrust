import InfoPageShell from "../../components/marketing/InfoPageShell";

export default function HelpSupportPage() {
  return (
    <InfoPageShell
      eyebrow="Help & Support"
      title="Get answers for accounts, coupons, disputes, and payouts."
      description="Support resources for buyers and sellers using CouponX daily."
      ctaHref="/faq"
      ctaLabel="Open FAQ"
    >
      <section className="grid gap-6 lg:grid-cols-3">
        {[
          ["Buyer help", "Help with failed coupons, payment holds, and dispute submissions."],
          ["Seller help", "Help with uploads, trust score changes, and withdrawal status."],
          ["Account help", "Help with OTP login, profile issues, and account access."]
        ].map(([title, text]) => (
          <div key={title} className="rounded-[24px] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <h2 className="text-2xl font-black text-slate-950">{title}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-500">{text}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-emerald-100 bg-white p-7 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#16a34a]">Support workflow</p>
          <h2 className="mt-4 text-3xl font-black text-slate-950">How issues are handled once a request reaches the team.</h2>
          <div className="mt-6 space-y-4">
            {[
              ["1. Triage", "Requests are classified as coupon issue, payment issue, payout issue, verification issue, or account issue."],
              ["2. Record review", "Support checks linked coupon, order, seller, buyer, and payment records before taking action."],
              ["3. Escalation", "Sensitive cases can move to dispute or admin review with a full audit trail."],
              ["4. Resolution", "Users receive the final action, next steps, and any required follow-up details."]
            ].map(([title, text]) => (
              <div key={title} className="rounded-[22px] bg-[#f8fff9] p-5">
                <p className="text-lg font-black text-slate-900">{title}</p>
                <p className="mt-2 text-sm leading-7 text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {[
            ["Best for payment issues", "Include Razorpay payment reference, order ID, and the exact time of payment."],
            ["Best for coupon issues", "Include the coupon title, expected benefit, redeem attempt result, and screenshot proof."],
            ["Best for seller issues", "Include listing ID, verification stage, and withdrawal request details if payout is delayed."]
          ].map(([title, text]) => (
            <div key={title} className="rounded-[24px] border border-emerald-100 bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
              <h3 className="text-xl font-black text-slate-950">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </InfoPageShell>
  );
}
