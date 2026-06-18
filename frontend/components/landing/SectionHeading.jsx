export default function SectionHeading({ title, subtitle }) {
  return (
    <div className="text-center">
      <h2 className="app-section-heading font-black text-slate-950">{title}</h2>
      {subtitle ? <p className="mt-2 text-sm text-slate-500">{subtitle}</p> : null}
    </div>
  );
}
