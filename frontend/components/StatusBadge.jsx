export default function StatusBadge({ status = "active" }) {
  const tones = {
    active: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
    available: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
    matched: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
    warning: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
    banned: "bg-rose-500/15 text-rose-400 border border-rose-500/20",
    ai_failed: "bg-rose-500/15 text-rose-400 border border-rose-500/20",
    sold: "bg-slate-500/15 text-slate-300 border border-slate-500/20",
    disputed: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
    open: "bg-sky-500/15 text-sky-400 border border-sky-500/20",
    pending: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20",
    completed: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
    captured: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
    authorized: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20",
    refunded: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
    failed: "bg-rose-500/15 text-rose-400 border border-rose-500/20",
    rejected: "bg-rose-500/15 text-rose-400 border border-rose-500/20",
    approved: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${tones[status] || "bg-slate-500/15 text-slate-300 border border-slate-500/20"}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
