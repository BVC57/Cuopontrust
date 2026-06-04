export default function StatusBadge({ status = "active" }) {
  const tones = {
    active: "bg-emerald-100 text-emerald-700",
    available: "bg-emerald-100 text-emerald-700",
    matched: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    banned: "bg-rose-100 text-rose-700",
    ai_failed: "bg-rose-100 text-rose-700",
    sold: "bg-slate-200 text-slate-700",
    disputed: "bg-amber-100 text-amber-700",
    open: "bg-sky-100 text-sky-700",
    pending: "bg-indigo-100 text-indigo-700"
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${tones[status] || "bg-slate-100 text-slate-700"}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
