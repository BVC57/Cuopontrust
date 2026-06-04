export default function PageHero({ eyebrow, title, description, children }) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white p-8 shadow-soft">
      <div className="absolute inset-0 -z-10 bg-mesh" />
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-secondary">{eyebrow}</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-base text-slate-600">{description}</p>
      {children ? <div className="mt-8">{children}</div> : null}
    </section>
  );
}
