export function RewardSummaryCard({ title, value, caption, tone = "emerald" }) {
  const tones = {
    emerald: "border-emerald-100 bg-emerald-50/60 text-emerald-700",
    amber: "border-amber-100 bg-amber-50/60 text-amber-700",
    sky: "border-sky-100 bg-sky-50/60 text-sky-700",
    rose: "border-rose-100 bg-rose-50/60 text-rose-700"
  };

  return (
    <div className={`rounded-[24px] border p-4 ${tones[tone] || tones.emerald}`}>
      <p className="text-[11px] font-black uppercase tracking-[0.16em]">{title}</p>
      <p className="mt-3 text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{caption}</p>
    </div>
  );
}
