"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AccountShell from "../../components/AccountShell";
import ProtectedRoute from "../../components/ProtectedRoute";
import LoadingSpinner from "../../components/LoadingSpinner";
import api, { extractError } from "../../lib/api";
import { CoinBalanceCard } from "../../components/rewards/CoinBalanceCard";
import { WalletBalanceCard } from "../../components/rewards/WalletBalanceCard";
import { ConvertCoinsModal } from "../../components/rewards/ConvertCoinsModal";
import { formatMoney } from "../../lib/format";

export default function RewardWalletPage() {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = async () => {
    try {
      const [summaryRes, walletRes] = await Promise.all([api.get("/rewards/summary"), api.get("/rewards/wallet/history")]);
      setSummary(summaryRes.data);
      setHistory(walletRes.data.history || []);
    } catch (error) {
      toast.error(extractError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <ProtectedRoute>
      <AccountShell title="Coupon Wallet" subtitle="Convert CouponX Coins into internal wallet credit and use it for coupon checkout.">
        {loading || !summary ? <LoadingSpinner label="Loading wallet..." /> : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <CoinBalanceCard coins={summary.user?.coinsBalance} lifetimeCoins={summary.user?.lifetimeCoinsEarned} level={summary.user?.rewardLevel} />
              <WalletBalanceCard balance={summary.user?.rewardWalletBalance} currency={summary.user?.currency || "INR"} />
            </div>
            <div className="rounded-[28px] border border-emerald-100 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
              <h3 className="text-2xl font-black text-slate-950">Convert Coins</h3>
              <p className="mt-2 text-sm leading-7 text-slate-500">{summary.settings?.coinConversionRateCoins} coins = {formatMoney(summary.settings?.coinConversionRateAmount, summary.user?.currency || "INR")}. Minimum conversion is {summary.settings?.minConversionCoins} coins.</p>
              <button type="button" onClick={() => setOpen(true)} className="mt-5 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white">Open Convert Modal</button>
            </div>
            <div className="rounded-[28px] border border-emerald-100 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
              <h3 className="text-xl font-black text-slate-950">Wallet History</h3>
              <div className="mt-4 space-y-3">
                {history.length ? history.map((item) => (
                  <div key={item._id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.description || item.source}</p>
                      <p className="mt-1 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString("en-IN")}</p>
                    </div>
                    <p className={`text-sm font-black ${item.type === "debit" ? "text-rose-600" : "text-emerald-600"}`}>{item.type === "debit" ? "-" : "+"}{formatMoney(item.amount, summary.user?.currency || "INR")}</p>
                  </div>
                )) : <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">No wallet activity yet.</div>}
              </div>
            </div>
            <ConvertCoinsModal open={open} onClose={() => setOpen(false)} settings={summary.settings} coinsBalance={summary.user?.coinsBalance || 0} onConverted={load} />
          </div>
        )}
      </AccountShell>
    </ProtectedRoute>
  );
}
