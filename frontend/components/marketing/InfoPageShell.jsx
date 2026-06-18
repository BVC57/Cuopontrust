import Link from "next/link";
import { Flame } from "lucide-react";

export default function InfoPageShell({ eyebrow, title, description, children, ctaHref = "/marketplace", ctaLabel = "Explore marketplace" }) {
  return (
    <div className="bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.16),transparent_24%),radial-gradient(circle_at_top_right,rgba(124,58,237,0.14),transparent_22%),radial-gradient(circle_at_center_top,rgba(251,191,36,0.08),transparent_18%),linear-gradient(180deg,#f3fff6_0%,#f9fffb_22%,#ffffff_46%,#fbfffc_100%)]">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="overflow-hidden rounded-[38px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(248,255,251,0.98)_100%)] p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-6">
          <div className="relative rounded-[32px] bg-[radial-gradient(circle_at_left_top,rgba(34,197,94,0.22),transparent_18%),radial-gradient(circle_at_right_top,rgba(124,58,237,0.18),transparent_18%),radial-gradient(circle_at_center_bottom,rgba(59,130,246,0.1),transparent_24%),linear-gradient(180deg,#ffffff_0%,#fafffb_100%)] px-6 py-8 lg:px-10 lg:py-10">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),transparent)]" />
            <div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-[rgba(34,197,94,0.18)] blur-3xl" />
            <div className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-[rgba(124,58,237,0.18)] blur-3xl" />
            <div className="pointer-events-none absolute left-1/3 top-2 h-32 w-32 rounded-full bg-[rgba(251,191,36,0.08)] blur-3xl" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_260px] lg:items-end">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-700 shadow-[0_12px_24px_rgba(15,23,42,0.05)]">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  {eyebrow}
                </div>
                <h1 className="app-main-heading mt-6 font-black text-slate-950">{title}</h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-slate-500">{description}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={ctaHref}
                    className="inline-flex rounded-2xl bg-gradient-to-r from-[#16a34a] to-[#22c55e] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_24px_rgba(34,197,94,0.18)]"
                  >
                    {ctaLabel}
                  </Link>
                  <Link
                    href="/sell"
                    className="inline-flex rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-sm font-bold text-[#16a34a] shadow-[0_10px_22px_rgba(15,23,42,0.05)]"
                  >
                    Sell Coupons
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {[
                  ["Trusted", "Verified buyers and sellers"],
                  ["Fast Support", "Clear dispute and help flows"],
                  ["Secure", "Protected payment experience"]
                ].map(([label, text]) => (
                  <div key={label} className="rounded-[22px] border border-white bg-white/90 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                    <p className="text-sm font-black text-slate-950">{label}</p>
                    <p className="mt-2 text-xs leading-6 text-slate-500">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 space-y-8">{children}</div>
      </section>
    </div>
  );
}
