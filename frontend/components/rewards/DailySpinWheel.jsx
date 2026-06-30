import { useMemo, useRef, useState } from "react";

const SEGMENT_COLORS = ["#0f766e", "#22c55e", "#f59e0b", "#f97316", "#ec4899"];
const DEFAULT_COINS = [5, 10, 15, 20, 25];

function buildSegments(rewardCoins) {
  const values = [...DEFAULT_COINS];
  const normalizedReward = Number(rewardCoins || 0);

  if (normalizedReward > 0 && !values.includes(normalizedReward)) {
    values[values.length - 1] = normalizedReward;
    values.sort((left, right) => left - right);
  }

  return values.map((coins, index) => ({
    coins,
    label: `${coins} Coins`,
    color: SEGMENT_COLORS[index % SEGMENT_COLORS.length]
  }));
}

function findSegmentIndex(segments, rewardCoins) {
  const rewardValue = Number(rewardCoins || 0);
  const exactIndex = segments.findIndex((segment) => segment.coins === rewardValue);
  return exactIndex >= 0 ? exactIndex : Math.floor(Math.random() * segments.length);
}

export function DailySpinWheel({ spinStatus, onSpin, onRewardApplied, lastReward }) {
  const [segments, setSegments] = useState(() => buildSegments(lastReward?.coins));
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonReward, setWonReward] = useState(lastReward || null);
  const [flashReward, setFlashReward] = useState(null);
  const wheelRef = useRef(null);

  const nextSpinLabel = useMemo(() => {
    if (!spinStatus?.nextSpinAt) return "Ready now";
    return new Date(spinStatus.nextSpinAt).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  }, [spinStatus]);

  const gradient = useMemo(() => {
    const slice = 360 / segments.length;
    const stops = segments.map((segment, index) => {
      const start = Math.round(index * slice);
      const end = Math.round((index + 1) * slice);
      return `${segment.color} ${start}deg ${end}deg`;
    });

    return `conic-gradient(from -90deg, ${stops.join(", ")})`;
  }, [segments]);

  const handleSpin = async () => {
    if (spinning || !spinStatus?.canSpin) return;

    try {
      setSpinning(true);
      setFlashReward(null);
      const reward = await onSpin();
      const nextSegments = buildSegments(reward?.coins);
      const targetIndex = findSegmentIndex(nextSegments, reward?.coins);
      const step = 360 / nextSegments.length;
      const stopAngle = 360 - (targetIndex * step + step / 2);

      setSegments(nextSegments);
      setWonReward(reward || null);

      requestAnimationFrame(() => {
        setRotation((current) => current + 360 * 6 + stopAngle);
      });

      window.clearTimeout(wheelRef.current);
      wheelRef.current = window.setTimeout(async () => {
        setFlashReward(reward || null);
        setSpinning(false);
        if (onRewardApplied) {
          await onRewardApplied(reward || null);
        }
      }, 4300);
    } catch (error) {
      setSpinning(false);
      throw error;
    }
  };

  return (
    <div className="rounded-[34px] border border-emerald-100 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.14),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.12),transparent_28%),linear-gradient(180deg,#ffffff_0%,#f8fffb_100%)] p-6 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
      <div className="grid gap-8 lg:grid-cols-[300px_1fr] lg:items-center">
        <div className="mx-auto flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute left-1/2 top-[-6px] z-20 h-0 w-0 -translate-x-1/2 border-l-[16px] border-r-[16px] border-t-[26px] border-l-transparent border-r-transparent border-t-slate-950 drop-shadow-[0_8px_14px_rgba(15,23,42,0.18)]" />
            <div className="relative flex h-[260px] w-[260px] items-center justify-center rounded-full border-[10px] border-white bg-white shadow-[0_20px_40px_rgba(15,23,42,0.12)]">
              <div
                className="relative h-[220px] w-[220px] rounded-full border-[8px] border-[#fee2e2] shadow-[inset_0_0_0_5px_rgba(255,255,255,0.4)]"
                style={{
                  backgroundImage: gradient,
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning ? "transform 4.2s cubic-bezier(0.18, 0.88, 0.2, 1)" : "none"
                }}
              >
                {segments.map((segment, index) => {
                  const angle = (360 / segments.length) * index;
                  return (
                    <div
                      key={segment.label}
                      className="absolute left-1/2 top-1/2 w-[86px] -translate-x-1/2 -translate-y-1/2 text-center"
                      style={{ transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-78px)` }}
                    >
                      <div className="rounded-full bg-white/92 px-2 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-slate-900 shadow-[0_8px_16px_rgba(15,23,42,0.14)]">
                        {segment.coins}
                      </div>
                    </div>
                  );
                })}
                <div className="absolute left-1/2 top-1/2 h-[74px] w-[74px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[6px] border-[#fde68a] bg-[radial-gradient(circle_at_30%_30%,#fde68a,#f59e0b_72%)] shadow-[0_12px_26px_rgba(245,158,11,0.35)]" />
              </div>
            </div>
          </div>
          <div className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${flashReward ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-500"}`}>
            {flashReward ? `${flashReward.coins || 0} Coins Added` : spinning ? "Spinning for reward" : wonReward?.rewardLabel || "Spin to win coins"}
          </div>
        </div>

        <div>
          <h3 className="text-3xl font-black tracking-tight text-slate-950">Daily Spin Wheel</h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">Spin once per day and land on one of five coin rewards. The wheel rotates multiple times and stops on the server-selected reward, then the coins are added to your CouponX balance.</p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
            <span className="rounded-full border border-emerald-100 bg-white px-4 py-2">Today: {lastReward?.rewardLabel || flashReward?.rewardLabel || "Not spun yet"}</span>
            <span className="rounded-full border border-emerald-100 bg-white px-4 py-2">Next spin: {nextSpinLabel}</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {segments.map((segment) => (
              <span key={segment.label} className="rounded-full border border-white bg-white/90 px-4 py-2 text-sm font-black text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
                {segment.label}
              </span>
            ))}
          </div>
          <button
            type="button"
            disabled={!spinStatus?.canSpin || spinning}
            onClick={handleSpin}
            className={`mt-7 rounded-[20px] border px-6 py-4 text-sm font-black transition ${spinStatus?.canSpin ? "border-emerald-500 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white shadow-[0_16px_30px_rgba(34,197,94,0.22)]" : "border-slate-200 bg-slate-100 text-slate-400"}`}
          >
            {spinning ? "Spinning..." : spinStatus?.canSpin ? "Spin Now" : "Already Used Today"}
          </button>
        </div>
      </div>
    </div>
  );
}
