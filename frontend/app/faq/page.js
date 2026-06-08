import InfoPageShell from "../../components/marketing/InfoPageShell";

const faqs = [
  ["How does CouponX verify coupons?", "CouponX checks the submitted coupon data, screenshot proof, duplicate risk, and listing completeness before approval. Admin review can still intervene when listings look suspicious."],
  ["What should buyers do if a coupon does not work?", "Buyers should raise a dispute with the order reference, issue details, and any supporting evidence. The transaction, coupon, and seller records are then reviewed together."],
  ["When do sellers receive payouts?", "Seller earnings move from pending to available after payment completion and platform checks. Withdrawals then go through admin approval before final payout release."],
  ["How does trust scoring affect accounts?", "Trust score reflects account behavior such as successful listings, disputes, fraud signals, and admin penalties. Lower trust can reduce buyer confidence and may affect listing review decisions."],
  ["What makes a listing suspicious?", "Expired-looking screenshots, mismatched coupon details, duplicate uploads, repeated disputes, or inconsistent listing patterns can all trigger additional review."],
  ["When is the coupon code revealed?", "Coupon codes are hidden before purchase. The code is only revealed after successful payment confirmation and is also sent to the buyer's registered email."],
  ["Can admins remove users or coupon data?", "Yes. Super admin tools can manage users, coupons, payments, withdrawals, and published blog content through the admin panel."],
  ["Do public pages require login?", "No. Visitors can browse the landing, marketplace, and information pages, but buying or selling requires login."]
];

export default function FaqPage() {
  return (
    <InfoPageShell
      eyebrow="FAQ"
      title="Answers to common buyer and seller questions."
      description="Understand how listing, verification, disputes, payments, and support work on CouponX."
    >
      <section className="grid gap-4">
        {faqs.map(([question, answer]) => (
          <details key={question} className="rounded-[18px] border border-emerald-100 bg-white px-5 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.03)]">
            <summary className="cursor-pointer list-none text-sm font-bold text-slate-800">{question}</summary>
            <p className="mt-3 text-sm leading-7 text-slate-500">{answer}</p>
          </details>
        ))}
      </section>
    </InfoPageShell>
  );
}
