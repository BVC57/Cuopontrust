"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import AdminPageShell from "../../../components/AdminPageShell";
import api, { extractError } from "../../../lib/api";

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    commissionPercent: 10,
    minimumTrustScore: 60,
    aiMatchThreshold: 90,
    maxFreeListings: 10,
    withdrawalFee: 2
  });

  const submit = async (event) => {
    event.preventDefault();
    try {
      await api.put("/super-admin/settings", form);
      toast.success("Settings updated");
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  return (
    <AdminPageShell title="Settings" subtitle="Marketplace rules and thresholds">
      <form onSubmit={submit} className="grid gap-4 rounded-[28px] border border-white/60 bg-white p-6 shadow-soft md:grid-cols-2">
        {Object.entries(form).map(([key, value]) => (
          <label key={key} className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">{key}</span>
            <input
              value={value}
              onChange={(event) => setForm((current) => ({ ...current, [key]: Number(event.target.value) }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            />
          </label>
        ))}
        <button className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white md:col-span-2">
          Save settings
        </button>
      </form>
    </AdminPageShell>
  );
}
