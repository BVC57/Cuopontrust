import InfoPageShell from "../../components/marketing/InfoPageShell";

const faqs = [
  "How does CouponX verify coupons?",
  "What should buyers do if a coupon does not work?",
  "When do sellers receive payouts?",
  "How does trust scoring affect accounts?",
  "What makes a listing suspicious?"
];

export default function FaqPage() {
  return (
    <InfoPageShell
      eyebrow="FAQ"
      title="Answers to common buyer and seller questions."
      description="Understand how listing, verification, disputes, payments, and support work on CouponX."
    >
      <section className="grid gap-4">
        {faqs.map((faq) => (
          <details key={faq} className="rounded-[18px] bg-white px-5 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.03)]">
            <summary className="cursor-pointer list-none text-sm font-bold text-slate-800">{faq}</summary>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              CouponX combines upload validation, AI checks, protected payments, and support workflows to keep the marketplace reliable.
            </p>
          </details>
        ))}
      </section>
    </InfoPageShell>
  );
}
