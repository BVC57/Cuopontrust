import InfoPageShell from "../../components/marketing/InfoPageShell";

export default function RefundPolicyPage() {
  return (
    <InfoPageShell
      eyebrow="Refund Policy"
      title="Refunds depend on coupon validity and dispute findings."
      description="CouponX uses protected payment flows. If a coupon fails and the buyer provides valid evidence, the case can be reviewed for refund."
    >
      <section className="rounded-[24px] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
        <ul className="space-y-3 text-sm leading-7 text-slate-500">
          <li>- Refunds are available for valid failed-coupon disputes supported by evidence.</li>
          <li>- Refund decisions depend on AI verification, seller history, and dispute review.</li>
          <li>- Partial refunds may apply in specific admin-reviewed situations.</li>
          <li>- Completed and valid coupon redemptions are not refundable.</li>
        </ul>
      </section>
    </InfoPageShell>
  );
}
