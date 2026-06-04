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
    </InfoPageShell>
  );
}
