import RewardLevelBadge from "./RewardLevelBadge";

export function CoinBalanceCard({ coins = 0, lifetimeCoins = 0, level = "Bronze" }) {
  return (
    <div className="rounded-[28px] border border-emerald-100 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.16),transparent_30%),linear-gradient(180deg,#ffffff_0%,#f8fffb_100%)] p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">CouponX Coins</p>
          <p className="mt-3 text-4xl font-black text-slate-950">{Number(coins || 0).toLocaleString("en-IN")}</p>
          <p className="mt-2 text-sm text-slate-500">Lifetime earned {Number(lifetimeCoins || 0).toLocaleString("en-IN")}</p>
        </div>
        <RewardLevelBadge level={level} />
      </div>
    </div>
  );
}
