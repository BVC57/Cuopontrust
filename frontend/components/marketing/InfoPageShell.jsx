import Link from "next/link";

export default function InfoPageShell({ eyebrow, title, description, children, ctaHref = "/marketplace", ctaLabel = "Explore marketplace" }) {
  return (
    <div className="bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.08),transparent_22%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent_18%),linear-gradient(180deg,#ffffff_0%,#f8fff9_32%,#ffffff_100%)]">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="relative overflow-hidden rounded-[34px] bg-white/90 px-6 py-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm lg:px-10 lg:py-10">
          <div className="absolute -right-10 top-4 h-40 w-40 rounded-full bg-emerald-100/50 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-lime-100/60 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_260px] lg:items-end">
            <div className="max-w-3xl">
              <div className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-[#16a34a]">
                {eyebrow}
              </div>
              <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">{title}</h1>
              <p className="mt-5 text-base leading-8 text-slate-500">{description}</p>
              <div className="mt-6">
                <Link
                  href={ctaHref}
                  className="inline-flex rounded-xl bg-gradient-to-r from-[#16a34a] to-[#22c55e] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_24px_rgba(34,197,94,0.18)]"
                >
                  {ctaLabel}
                </Link>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                ["Trusted", "Verified buyers and sellers"],
                ["Fast Support", "Clear dispute and help flows"],
                ["Secure", "Protected payment experience"]
              ].map(([label, text]) => (
                <div key={label} className="rounded-[22px] bg-[#f8fff9] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                  <p className="text-sm font-black text-slate-950">{label}</p>
                  <p className="mt-2 text-xs leading-6 text-slate-500">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 space-y-8">{children}</div>
      </section>
    </div>
  );
}
