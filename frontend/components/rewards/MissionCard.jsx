export function MissionCard({ mission, onClaim, claiming }) {
  const base = mission.missionId || mission;
  const progress = Math.min(Number(mission.progress || 0), Number(mission.targetCount || base.targetCount || 1));
  const target = Number(mission.targetCount || base.targetCount || 1);
  const completed = mission.status === "completed";
  const claimed = mission.status === "reward_claimed";

  return (
    <article className="rounded-[28px] border border-emerald-100 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{base.missionType || "Mission"}</p>
          <h3 className="mt-2 text-xl font-black text-slate-950">{base.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">{base.description}</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{base.rewardCoins} Coins</span>
      </div>
      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
          <span>Progress</span>
          <span>{progress} / {target}</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-gradient-to-r from-[#16a34a] to-[#22c55e]" style={{ width: `${Math.min(100, Math.round((progress / target) * 100))}%` }} />
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-500">Status: {mission.status}</span>
        <button
          type="button"
          disabled={!completed || claimed || claiming}
          onClick={() => onClaim?.(base._id)}
          className={`rounded-2xl px-4 py-3 text-sm font-black ${completed && !claimed ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"}`}
        >
          {claimed ? "Claimed" : claiming ? "Claiming..." : "Claim Reward"}
        </button>
      </div>
    </article>
  );
}
