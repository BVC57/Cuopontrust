import InfoPageShell from "../../components/marketing/InfoPageShell";

export default function PrivacyPolicyPage() {
  return (
    <InfoPageShell
      eyebrow="Privacy Policy"
      title="We keep personal data limited, useful, and protected."
      description="CouponX collects only the information needed to operate the marketplace, verify accounts, process transactions, and handle disputes."
    >
      <section className="rounded-[24px] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
        <div className="space-y-6 text-sm leading-7 text-slate-500">
          <p>We may collect your email, profile data, transaction history, support conversations, and listing-related media for marketplace operations.</p>
          <p>We use this data for OTP login, fraud prevention, dispute handling, and service quality improvements.</p>
          <p>We do not sell your personal data. Access is limited to platform operations, security review, and customer support.</p>
        </div>
      </section>
    </InfoPageShell>
  );
}
