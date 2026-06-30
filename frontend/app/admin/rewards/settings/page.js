"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import AdminPageShell from "../../../../components/AdminPageShell";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import api, { extractError } from "../../../../lib/api";

export default function AdminRewardSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/super-admin/rewards/settings").then(({ data }) => setSettings(data.settings)).catch((error) => toast.error(extractError(error)));
  }, []);

  const spinRewards = useMemo(() => Array.isArray(settings?.spinRewards) ? settings.spinRewards.join(", ") : "", [settings]);
  const updateSetting = (field, value) => setSettings((current) => ({ ...current, [field]: value }));
  const updateRule = (field, value) => setSettings((current) => ({ ...current, rewardRules: { ...(current.rewardRules || {}), [field]: value } }));

  const save = async () => {
    try {
      setSaving(true);
      await api.put("/super-admin/rewards/settings", {
        coinConversionRateCoins: Number(settings.coinConversionRateCoins || 0),
        coinConversionRateAmount: Number(settings.coinConversionRateAmount || 0),
        minConversionCoins: Number(settings.minConversionCoins || 0),
        dailyEarningLimit: Number(settings.dailyEarningLimit || 0),
        monthlyEarningLimit: Number(settings.monthlyEarningLimit || 0),
        spinEnabled: Boolean(settings.spinEnabled),
        spinRewards: String(spinRewards).split(",").map((item) => Number(item.trim())).filter((item) => Number.isFinite(item) && item > 0),
        rewardRules: Object.fromEntries(Object.entries(settings.rewardRules || {}).map(([key, value]) => [key, Number(value || 0)]))
      });
      toast.success("Reward settings updated");
    } catch (error) {
      toast.error(extractError(error));
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <AdminPageShell title="Reward Settings" breadcrumbs={["Rewards", "Settings"]}><LoadingSpinner label="Loading reward settings..." /></AdminPageShell>;

  return (
    <AdminPageShell title="Reward Settings" subtitle="Manage conversions, reward rules, and spin setup." breadcrumbs={["Rewards", "Settings"]}>
      <div className="rounded-[28px] border border-emerald-100 bg-white p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <InputField label="Conversion Coins" value={settings.coinConversionRateCoins} onChange={(value) => updateSetting("coinConversionRateCoins", value)} />
          <InputField label="Conversion Amount" value={settings.coinConversionRateAmount} onChange={(value) => updateSetting("coinConversionRateAmount", value)} />
          <InputField label="Minimum Conversion" value={settings.minConversionCoins} onChange={(value) => updateSetting("minConversionCoins", value)} />
          <InputField label="Daily Limit" value={settings.dailyEarningLimit} onChange={(value) => updateSetting("dailyEarningLimit", value)} />
          <InputField label="Monthly Limit" value={settings.monthlyEarningLimit} onChange={(value) => updateSetting("monthlyEarningLimit", value)} />
          <InputField label="Spin Rewards CSV" value={spinRewards} onChange={(value) => updateSetting("spinRewards", value.split(",").map((item) => item.trim()))} />
          <InputField label="Register Reward" value={settings.rewardRules?.register} onChange={(value) => updateRule("register", value)} />
          <InputField label="Email Verify Reward" value={settings.rewardRules?.emailVerify} onChange={(value) => updateRule("emailVerify", value)} />
          <InputField label="Referral Verify Reward" value={settings.rewardRules?.referralVerified} onChange={(value) => updateRule("referralVerified", value)} />
          <InputField label="Referral Purchase Reward" value={settings.rewardRules?.referralFirstPurchase} onChange={(value) => updateRule("referralFirstPurchase", value)} />
          <InputField label="Profile Complete Reward" value={settings.rewardRules?.profileComplete} onChange={(value) => updateRule("profileComplete", value)} />
          <InputField label="Login Streak Bonus" value={settings.rewardRules?.loginStreakBonus} onChange={(value) => updateRule("loginStreakBonus", value)} />
        </div>
        <label className="mt-5 flex items-center gap-3 text-sm font-bold text-slate-700"><input type="checkbox" checked={Boolean(settings.spinEnabled)} onChange={(event) => updateSetting("spinEnabled", event.target.checked)} /> Spin enabled</label>
        <button onClick={save} disabled={saving} className="mt-5 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white disabled:opacity-60">{saving ? "Saving..." : "Save Settings"}</button>
      </div>
    </AdminPageShell>
  );
}

function InputField({ label, value, onChange }) {
  return <label className="block"><span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-slate-500">{label}</span><input value={value ?? ""} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none" /></label>;
}

