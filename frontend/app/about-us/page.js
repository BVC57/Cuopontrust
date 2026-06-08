import InfoPageShell from "../../components/marketing/InfoPageShell";

const pillars = [
  {
    title: "Trust-first marketplace",
    text: "CouponX is built around verification, safe checkout, and traceable transactions so buyers and sellers can operate with less risk."
  },
  {
    title: "Useful deals, not wasted deals",
    text: "Unused offers lose value every day. The platform converts that waste into savings for buyers and earnings for sellers."
  },
  {
    title: "Operational clarity",
    text: "From listing review to payout release, every major step is structured to be auditable and understandable."
  }
];

const values = [
  ["Verified listings", "Coupons move through review before becoming visible in the marketplace."],
  ["Protected payments", "Orders, verification, capture, and transaction history are linked through Razorpay-backed flows."],
  ["Seller accountability", "Trust scoring and review signals help buyers understand who they are purchasing from."],
  ["Support coverage", "Disputes, fraud reports, and withdrawals are handled with explicit admin controls."]
];

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
        {pillars.map(({ title, text }) => (
          <div key={title} className="rounded-[24px] border border-emerald-100 bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <h2 className="text-2xl font-black text-slate-950">{title}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-500">{text}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-emerald-100 bg-white p-7 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#16a34a]">Why buyers and sellers use CouponX</p>
          <h2 className="mt-4 text-3xl font-black text-slate-950">A coupon platform that treats trust, payout accuracy, and user protection as core product requirements.</h2>
          <p className="mt-5 text-sm leading-8 text-slate-500">
            CouponX is designed for practical marketplace use. Buyers want real discounts without fake codes. Sellers want a direct path
            to turn unused offers into money. The product is structured around those two needs with verification, secure payments,
            release controls, and admin oversight built into the operating flow.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {values.map(([title, text]) => (
              <div key={title} className="rounded-[22px] bg-[#f8fff9] p-5">
                <p className="text-lg font-black text-slate-900">{title}</p>
                <p className="mt-2 text-sm leading-7 text-slate-500">{text} Chauhan bhadresh</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {[
            ["1M+", "Coupons listed across active buyer demand"],
            ["100K+", "Users browsing and redeeming deals"],
            ["50+", "Categories with real listing coverage"],
            ["4.9/5", "User-rated experience benchmark"]
          ].map(([value, text]) => (
            <div key={value} className="rounded-[26px] border border-emerald-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fff9_100%)] p-6 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
              <p className="text-4xl font-black text-[#16a34a]">{value}</p>
              <p className="mt-3 text-sm leading-7 text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          ["For buyers", "Search for verified offers, compare value, complete checkout, and receive redeem codes only after successful payment confirmation."],
          ["For sellers", "List deals, pass verification, publish approved coupons, and track earnings until withdrawals are processed."],
          ["For partners", "Use CouponX as a trust-driven marketplace layer for savings campaigns, user acquisition, or offer recovery strategies."]
        ].map(([title, text]) => (
          <div key={title} className="rounded-[24px] border border-emerald-100 bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <h3 className="text-2xl font-black text-slate-950">{title}</h3>
            <p className="mt-4 text-sm leading-7 text-slate-500">{text}</p>
          </div>
        ))}
      </section>
    </InfoPageShell>
  );
}
