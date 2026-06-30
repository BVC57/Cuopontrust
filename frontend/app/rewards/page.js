"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AccountShell from "../../components/AccountShell";
import ProtectedRoute from "../../components/ProtectedRoute";
import LoadingSpinner from "../../components/LoadingSpinner";
import api, { extractError } from "../../lib/api";
import { CoinBalanceCard } from "../../components/rewards/CoinBalanceCard";
import { WalletBalanceCard } from "../../components/rewards/WalletBalanceCard";
import { RewardSummaryCard } from "../../components/rewards/RewardSummaryCard";
import { DailySpinWheel } from "../../components/rewards/DailySpinWheel";
import { RewardHistoryTable } from "../../components/rewards/RewardHistoryTable";

export default function RewardsPage() {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [summaryRes, historyRes] = await Promise.all([api.get("/rewards/summary"), api.get("/rewards/history")]);
      setSummary(summaryRes.data);
      setHistory(historyRes.data.history || []);
    } catch (error) {
      toast.error(extractError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSpin = async () => {
    try {
      const { data } = await api.post("/rewards/spin", {});
      return data.reward || null;
    } catch (error) {
      toast.error(extractError(error));
      throw error;
    }
  };

  const handleSpinApplied = async (reward) => {
    toast.success(reward?.coins ? `You won ${reward.coins} coins` : reward?.label || "Spin completed");
    await load();
  };

  return (
    <ProtectedRoute>
      <AccountShell title="Rewards" subtitle="Track CouponX coins, spin daily, and review your recent reward activity.">
        {loading || !summary ? <LoadingSpinner label="Loading rewards..." /> : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <CoinBalanceCard coins={summary.user?.coinsBalance} lifetimeCoins={summary.user?.lifetimeCoinsEarned} level={summary.user?.rewardLevel} />
              <WalletBalanceCard balance={summary.user?.rewardWalletBalance} currency={summary.user?.currency || "INR"} />
              <RewardSummaryCard title="Active Missions" value={summary.missions?.filter((item) => ["active", "in_progress", "completed"].includes(item.status)).length || 0} caption="Track current hunts and claimable rewards." tone="amber" />
              <RewardSummaryCard title="Referrals" value={summary.referrals?.total || 0} caption="Friends invited into CouponX." tone="sky" />
            </div>
            <DailySpinWheel spinStatus={summary.spinStatus} onSpin={handleSpin} onRewardApplied={handleSpinApplied} lastReward={summary.spinStatus?.todaySpin} />
            <RewardHistoryTable items={history} />
          </div>
        )}
      </AccountShell>
    </ProtectedRoute>
  );
}
