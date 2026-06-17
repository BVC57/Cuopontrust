import { Flame } from "lucide-react";

export default function PageHero({ eyebrow, title, description, children }) {
  return (
    <section className="rgb-panel relative overflow-hidden rounded-[34px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(248,255,251,0.98)_100%)] p-8 shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_left_top,rgba(34,197,94,0.2),transparent_18%),radial-gradient(circle_at_right_top,rgba(124,58,237,0.16),transparent_18%),linear-gradient(180deg,#ffffff_0%,#fafffb_100%)]" />
      <div className="pointer-events-none absolute -left-14 top-6 h-44 w-44 rounded-full bg-[rgba(34,197,94,0.16)] blur-3xl" />
      <div className="pointer-events-none absolute -right-10 top-0 h-40 w-40 rounded-full bg-[rgba(124,58,237,0.14)] blur-3xl" />
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-700 shadow-[0_12px_24px_rgba(15,23,42,0.05)]">
        <Flame className="h-3.5 w-3.5 text-orange-500" />
        {eyebrow}
      </div>
      <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">{description}</p>
      {children ? <div className="mt-8">{children}</div> : null}
    </section>
  );
}
