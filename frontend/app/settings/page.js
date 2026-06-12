"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AccountShell from "../../components/AccountShell";
import ProtectedRoute from "../../components/ProtectedRoute";
import api, { extractError } from "../../lib/api";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/users/profile")
      .then(({ data }) => {
        setUser(data.user);
        setForm({
          name: data.user.name || "",
          country: data.user.country || "India",
          currency: data.user.currency || "INR",
          notificationPreferences: {
            orderUpdates: data.user.notificationPreferences?.orderUpdates ?? true,
            paymentAlerts: data.user.notificationPreferences?.paymentAlerts ?? true,
            listingUpdates: data.user.notificationPreferences?.listingUpdates ?? true,
            marketingEmails: data.user.notificationPreferences?.marketingEmails ?? false
          }
        });
      })
      .catch(() => {
        const fallback = { email: "", name: "", country: "India", currency: "INR", notificationPreferences: {} };
        setUser(fallback);
        setForm({
          name: "",
          country: "India",
          currency: "INR",
          notificationPreferences: {
            orderUpdates: true,
            paymentAlerts: true,
            listingUpdates: true,
            marketingEmails: false
          }
        });
      });
  }, []);

  const updateNotificationField = (field) => {
    setForm((current) => ({
      ...current,
      notificationPreferences: {
        ...current.notificationPreferences,
        [field]: !current.notificationPreferences[field]
      }
    }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const { data } = await api.put("/users/profile", form);
      setUser(data.user);
      toast.success("Settings updated");
    } catch (error) {
      toast.error(extractError(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <AccountShell title="Settings" subtitle="Review your account preferences and marketplace defaults.">
        {!user || !form ? (
          <LoadingSpinner label="Loading settings..." />
        ) : (
          <div className="space-y-6">
            <section className="rounded-[30px] border border-emerald-100 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
              <h2 className="text-2xl font-black text-slate-900">Account settings</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Full name</p>
                  <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="mt-2 w-full bg-transparent font-semibold text-slate-900 outline-none" />
                </label>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="mt-2 font-semibold text-slate-900">{user.email}</p>
                </div>
                <label className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Default country</p>
                  <input value={form.country} onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))} className="mt-2 w-full bg-transparent font-semibold text-slate-900 outline-none" />
                </label>
                <label className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Default currency</p>
                  <input value={form.currency} onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value }))} className="mt-2 w-full bg-transparent font-semibold text-slate-900 outline-none" />
                </label>
              </div>
            </section>

            <section className="rounded-[30px] border border-emerald-100 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
              <h2 className="text-2xl font-black text-slate-900">Notification settings</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  ["orderUpdates", "Order updates"],
                  ["paymentAlerts", "Payment alerts"],
                  ["listingUpdates", "Listing updates"],
                  ["marketingEmails", "Marketing emails"]
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updateNotificationField(key)}
                    className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 text-left"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{label}</p>
                      <p className="mt-1 text-xs text-slate-500">Control account-related notifications from this page.</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${form.notificationPreferences[key] ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                      {form.notificationPreferences[key] ? "On" : "Off"}
                    </span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={saveSettings}
                disabled={saving}
                className="mt-6 rounded-2xl bg-gradient-to-r from-[#16a34a] to-[#22c55e] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_24px_rgba(34,197,94,0.18)] disabled:opacity-70"
              >
                {saving ? "Saving..." : "Save settings"}
              </button>
            </section>
          </div>
        )}
      </AccountShell>
    </ProtectedRoute>
  );
}
