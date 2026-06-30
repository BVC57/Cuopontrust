"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminPageShell from "../../../../components/AdminPageShell";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import api, { extractError } from "../../../../lib/api";

const defaultMission = { slug: "", title: "", description: "", triggerEvent: "", targetCount: 1, rewardCoins: 10, isActive: true, isRepeatable: false };

export default function AdminRewardMissionsPage() {
  const [missions, setMissions] = useState([]);
  const [form, setForm] = useState(defaultMission);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get("/super-admin/missions");
      setMissions(data.missions || []);
    } catch (error) {
      toast.error(extractError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createMission = async () => {
    try {
      setSaving(true);
      await api.post("/super-admin/missions", { ...form, targetCount: Number(form.targetCount || 1), rewardCoins: Number(form.rewardCoins || 0) });
      toast.success("Mission created");
      setForm(defaultMission);
      await load();
    } catch (error) {
      toast.error(extractError(error));
    } finally {
      setSaving(false);
    }
  };

  const toggleMission = async (mission) => {
    try {
      await api.put(`/super-admin/missions/${mission._id}`, { isActive: !mission.isActive });
      toast.success(`Mission ${mission.isActive ? "disabled" : "enabled"}`);
      await load();
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  if (loading) return <AdminPageShell title="Reward Missions" breadcrumbs={["Rewards", "Missions"]}><LoadingSpinner label="Loading missions..." /></AdminPageShell>;

  return (
    <AdminPageShell title="Reward Missions" subtitle="Create and manage mission entries separately from other reward tools." breadcrumbs={["Rewards", "Missions"]}>
      <div className="rounded-[28px] border border-emerald-100 bg-white p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InputField label="Slug" value={form.slug} onChange={(value) => setForm((current) => ({ ...current, slug: value }))} />
          <InputField label="Title" value={form.title} onChange={(value) => setForm((current) => ({ ...current, title: value }))} />
          <InputField label="Trigger Event" value={form.triggerEvent} onChange={(value) => setForm((current) => ({ ...current, triggerEvent: value }))} />
          <InputField label="Reward Coins" value={form.rewardCoins} onChange={(value) => setForm((current) => ({ ...current, rewardCoins: value }))} />
          <InputField label="Target Count" value={form.targetCount} onChange={(value) => setForm((current) => ({ ...current, targetCount: value }))} />
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} /> Active</label>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700"><input type="checkbox" checked={form.isRepeatable} onChange={(event) => setForm((current) => ({ ...current, isRepeatable: event.target.checked }))} /> Repeatable</label>
        </div>
        <label className="mt-4 block"><span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-slate-500">Description</span><textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={3} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none" /></label>
        <button onClick={createMission} disabled={saving} className="mt-5 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white disabled:opacity-60">{saving ? "Creating..." : "Create Mission"}</button>
      </div>
      <div className="rounded-[28px] border border-emerald-100 bg-white p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm"><thead><tr className="border-b border-slate-200 text-slate-500"><th className="px-3 py-3 font-bold">Mission</th><th className="px-3 py-3 font-bold">Trigger</th><th className="px-3 py-3 font-bold">Reward</th><th className="px-3 py-3 font-bold">Status</th><th className="px-3 py-3 font-bold">Action</th></tr></thead><tbody>{missions.map((mission) => <tr key={mission._id} className="border-b border-slate-100"><td className="px-3 py-3"><p className="font-bold text-slate-900">{mission.title}</p><p className="text-xs text-slate-500">{mission.slug}</p></td><td className="px-3 py-3 text-slate-600">{mission.triggerEvent}</td><td className="px-3 py-3 text-slate-600">{mission.rewardCoins} coins</td><td className="px-3 py-3 text-slate-600">{mission.isActive ? "Active" : "Inactive"}</td><td className="px-3 py-3"><button onClick={() => toggleMission(mission)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700">{mission.isActive ? "Disable" : "Enable"}</button></td></tr>)}</tbody></table>
        </div>
      </div>
    </AdminPageShell>
  );
}

function InputField({ label, value, onChange }) { return <label className="block"><span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-slate-500">{label}</span><input value={value ?? ""} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none" /></label>; }
