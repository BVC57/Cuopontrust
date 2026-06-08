import InfoPageShell from "../../components/marketing/InfoPageShell";

const buyerSteps = [
  ["Browse verified coupons", "Use marketplace filters to find active deals by brand, category, and price."],
  ["Pay securely", "Checkout is processed through Razorpay with transaction tracking and payment verification."],
  ["Receive redeem code", "After successful payment, the coupon code is unlocked and emailed to your registered account."]
];

const sellerSteps = [
  ["List your coupon", "Submit coupon details, choose categories, and upload proof screenshot for verification."],
  ["Pass AI review", "CouponX checks screenshot consistency, expiry, code match, and duplicate risk before publishing."],
  ["Get paid", "When a buyer completes payment, seller earnings move through pending to available balance."]
];

const systemFlows = [
  ["Verification layer", "Seller input, screenshots, and review rules reduce invalid, duplicate, and suspicious listings before exposure."],
  ["Payment control", "Orders are created, verified, captured, and stored with transaction status so the admin team can audit or resolve issues."],
  ["Payout tracking", "Seller proceeds move through pending and available states before withdrawal review is completed."],
  ["Support escalation", "Disputes and fraud reports can be reviewed with linked user, coupon, and transaction context."]
];

export default function HowItWorksPage() {
  return (
    <InfoPageShell
      eyebrow="How CouponX Works"
      title="A clear flow for buyers and sellers."
      description="CouponX keeps the marketplace simple: verified listings, protected checkout, redeem-code delivery, and managed seller payouts."
      ctaHref="/marketplace"
      ctaLabel="Explore marketplace"
    >
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[24px] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <h2 className="text-2xl font-black text-slate-950">Buyer Journey</h2>
          <div className="mt-6 space-y-4">
            {buyerSteps.map(([title, text], index) => (
              <div key={title} className="rounded-[20px] bg-[#f8fff9] p-5">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#16a34a]">Step {index + 1}</p>
                <p className="mt-2 text-lg font-black text-slate-900">{title}</p>
                <p className="mt-2 text-sm leading-7 text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <h2 className="text-2xl font-black text-slate-950">Seller Journey</h2>
          <div className="mt-6 space-y-4">
            {sellerSteps.map(([title, text], index) => (
              <div key={title} className="rounded-[20px] bg-[#f8fff9] p-5">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#16a34a]">Step {index + 1}</p>
                <p className="mt-2 text-lg font-black text-slate-900">{title}</p>
                <p className="mt-2 text-sm leading-7 text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          ["Verification", "Screenshots and form input are compared before a listing becomes visible."],
          ["Payments", "Orders are tracked, verified, and linked to transaction history for both sides."],
          ["Support", "Disputes, withdrawals, trust scoring, and admin review are built into the workflow."]
        ].map(([title, text]) => (
          <div key={title} className="rounded-[24px] border border-emerald-100 bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <h3 className="text-xl font-black text-slate-950">{title}</h3>
            <p className="mt-4 text-sm leading-7 text-slate-500">{text}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[28px] border border-emerald-100 bg-white p-7 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#16a34a]">Marketplace operating flow</p>
          <h2 className="mt-4 text-3xl font-black text-slate-950">What happens behind the scenes after a user lists or buys a coupon.</h2>
          <p className="mt-4 text-sm leading-8 text-slate-500">
            The product flow is more than a simple listing board. CouponX validates listings, stores payment states, and connects user,
            coupon, and transaction records so disputes, withdrawals, and trust decisions can be handled properly.
          </p>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {systemFlows.map(([title, text]) => (
            <div key={title} className="rounded-[22px] bg-[#f8fff9] p-5">
              <h3 className="text-lg font-black text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </InfoPageShell>
  );
}
