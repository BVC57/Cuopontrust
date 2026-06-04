import InfoPageShell from "../../components/marketing/InfoPageShell";

export default function AboutUsPage() {
  return (
    <InfoPageShell
      eyebrow="About CouponX"
      title="Built for buyers who want savings and sellers who hate wasting coupons."
      description="CouponX exists to make unused coupons useful again. Buyers get verified discounts, sellers get a clean way to earn, and both sides benefit from transparent trust signals."
      ctaHref="/contact-us"
      ctaLabel="Contact our team"
    >
      <section className="grid gap-6 lg:grid-cols-3">
        {[
          ["Our mission", "Create the most trusted coupon marketplace in India with secure buying and fair seller earnings."],
          ["What we verify", "We use seller verification, AI checks, and buyer protection flows to reduce fake or expired listings."],
          ["Why it matters", "Millions of coupons expire unused every month. CouponX turns that waste into savings and earnings."]
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
