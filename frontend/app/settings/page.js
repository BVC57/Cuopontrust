"use client";

import { useEffect, useState } from "react";
import AccountShell from "../../components/AccountShell";
import ProtectedRoute from "../../components/ProtectedRoute";
import api from "../../lib/api";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function SettingsPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get("/users/profile")
      .then(({ data }) => setUser(data.user))
      .catch(() => setUser({ email: "", country: "India", currency: "INR" }));
  }, []);

  return (
    <ProtectedRoute>
      <AccountShell title="Settings" subtitle="Review your account preferences and marketplace defaults.">
        {!user ? (
          <LoadingSpinner label="Loading settings..." />
        ) : (
          <div className="space-y-6">
            <section className="rounded-[30px] border border-emerald-100 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
              <h2 className="text-2xl font-black text-slate-900">Account preferences</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="mt-2 font-semibold text-slate-900">{user.email}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Default country</p>
                  <p className="mt-2 font-semibold text-slate-900">{user.country || "India"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Default currency</p>
                  <p className="mt-2 font-semibold text-slate-900">{user.currency || "INR"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Authentication</p>
                  <p className="mt-2 font-semibold text-slate-900">OTP-based login enabled</p>
                </div>
              </div>
            </section>

            <section className="rounded-[30px] border border-emerald-100 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
              <h2 className="text-2xl font-black text-slate-900">Security guidance</h2>
              <ul className="mt-6 space-y-3 text-sm leading-7 text-slate-500">
                <li>- Keep access to your email protected because OTP login depends on it.</li>
                <li>- Review listed coupons regularly and remove expired or used deals.</li>
                <li>- Use wallet history and payment records to reconcile earnings.</li>
              </ul>
            </section>
          </div>
        )}
      </AccountShell>
    </ProtectedRoute>
  );
}
