"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import api from "../../lib/api";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.get("/users/notifications").then(({ data }) => setNotifications(data.notifications || [])).catch(() => null);
  }, []);

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="rounded-[28px] border border-white/70 bg-white p-6 shadow-soft">
          <h1 className="text-2xl font-semibold text-slate-900">Notifications</h1>
          <div className="mt-6 space-y-3">
            {notifications.map((item) => (
              <div key={item._id} className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-600">{item.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
