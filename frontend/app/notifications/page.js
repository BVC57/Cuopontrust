"use client";

import { useEffect, useState } from "react";
import AccountShell from "../../components/AccountShell";
import ProtectedRoute from "../../components/ProtectedRoute";
import api from "../../lib/api";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.get("/users/notifications").then(({ data }) => setNotifications(data.notifications || [])).catch(() => setNotifications([]));
  }, []);

  return (
    <ProtectedRoute>
      <AccountShell title="Notifications" subtitle="Track coupon, payment, and withdrawal updates from your account.">
        <div className="rounded-[30px] border border-emerald-100 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
          <div className="mt-6 space-y-3">
            {notifications.length ? notifications.map((item) => (
              <div key={item._id} className={`rounded-2xl px-4 py-4 ${item.isRead ? "bg-slate-50" : "bg-emerald-50/70"}`}>
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                <p className="mt-2 text-xs font-semibold text-slate-400">{new Date(item.createdAt).toLocaleString("en-IN")}</p>
              </div>
            )) : (
              <div className="rounded-2xl border border-dashed border-emerald-100 px-4 py-10 text-center">
                <p className="text-lg font-black text-slate-900">No notifications yet</p>
                <p className="mt-2 text-sm text-slate-500">Coupon listing, purchase, payment, and withdrawal updates will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </AccountShell>
    </ProtectedRoute>
  );
}
