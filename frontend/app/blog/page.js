import InfoPageShell from "../../components/marketing/InfoPageShell";

const posts = [
  ["How to avoid expired coupon scams", "Learn the signs of suspicious listings and how CouponX helps protect buyers."],
  ["Ways sellers can monetize extra coupons", "Best practices for listing, pricing, and building seller trust."],
  ["What makes a coupon marketplace trustworthy", "Verification, fast support, and secure payouts are the baseline."]
];

export default function BlogPage() {
  return (
    <InfoPageShell
      eyebrow="CouponX Blog"
      title="Tips, trust guides, and smart ways to save more."
      description="Read practical articles for buyers and sellers using coupon marketplaces every day."
    >
      <section className="grid gap-6 lg:grid-cols-3">
        {posts.map(([title, text]) => (
          <article key={title} className="rounded-[24px] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#16a34a]">Guide</p>
            <h2 className="mt-4 text-2xl font-black text-slate-950">{title}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-500">{text}</p>
          </article>
        ))}
      </section>
    </InfoPageShell>
  );
}
