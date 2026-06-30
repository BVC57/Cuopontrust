export default function RewardLevelBadge({ level = "Bronze" }) {
  const tones = {
    Bronze: "bg-amber-100 text-amber-700 border-amber-200",
    Silver: "bg-slate-100 text-slate-700 border-slate-200",
    Gold: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Diamond: "bg-cyan-100 text-cyan-700 border-cyan-200"
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${tones[level] || tones.Bronze}`}>
      {level}
    </span>
  );
}
