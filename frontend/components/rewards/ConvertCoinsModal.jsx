import { useState } from "react";
import toast from "react-hot-toast";
import api, { extractError } from "../../lib/api";

export function ConvertCoinsModal({ open, onClose, settings, coinsBalance, onConverted }) {
  const [coins, setCoins] = useState(settings?.minConversionCoins || 500);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const submit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      await api.post("/rewards/convert-to-wallet", { coins: Number(coins) });
      toast.success("Coins converted to wallet");
      onConverted?.();
      onClose?.();
    } catch (error) {
      toast.error(extractError(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-[30px] border border-emerald-100 bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.18)]">
        <h3 className="text-2xl font-black text-slate-950">Convert Coins</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">Minimum conversion is {settings?.minConversionCoins || 500} coins. Available coins: {coinsBalance}.</p>
        <label className="mt-5 block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Coins</span>
          <input value={coins} onChange={(event) => setCoins(event.target.value)} type="number" min={settings?.minConversionCoins || 500} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none" />
        </label>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white">{saving ? "Converting..." : "Convert"}</button>
        </div>
      </form>
    </div>
  );
}
