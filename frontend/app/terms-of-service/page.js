import InfoPageShell from "../../components/marketing/InfoPageShell";

export default function TermsOfServicePage() {
  return (
    <InfoPageShell
      eyebrow="Terms of Service"
      title="Rules for using CouponX fairly and safely."
      description="By using CouponX, you agree to submit valid coupons, avoid deceptive listings, and follow the platform rules for payments, disputes, and withdrawals."
    >
      <section className="rounded-[24px] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
        <ul className="space-y-3 text-sm leading-7 text-slate-500">
          <li>- Sellers must upload authentic, unused, non-manipulated coupons.</li>
          <li>- Buyers must use dispute tools honestly and provide evidence when reporting issues.</li>
          <li>- CouponX may suspend or ban accounts that repeatedly fail verification or abuse the platform.</li>
          <li>- Final resolution on disputes, account moderation, and suspicious activity rests with the platform.</li>
        </ul>
      </section>
    </InfoPageShell>
  );
}
