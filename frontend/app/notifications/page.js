"use client";

import { useEffect, useState } from "react";
import AccountShell from "../../components/AccountShell";
import ProtectedRoute from "../../components/ProtectedRoute";
import api from "../../lib/api";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter((item) => !item.isRead).length;

  useEffect(() => {
    api.get("/users/notifications").then(({ data }) => setNotifications(data.notifications || [])).catch(() => setNotifications([]));
  }, []);

  const markNotificationRead = async (notification) => {
    try {
      if (!notification?.isRead) {
        await api.put(`/users/notifications/${notification._id}/read`);
      }
      setNotifications((current) => current.map((item) => (item._id === notification._id ? { ...item, isRead: true } : item)));
    } catch {}
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.put("/users/notifications/read-all");
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    } catch {}
  };

  return (
    <ProtectedRoute>
      <AccountShell title="Notifications" subtitle="Track coupon, payment, and withdrawal updates from your account.">
        <div className="rounded-[30px] border border-emerald-100 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <p className="text-sm font-black text-slate-900">All notifications</p>
              {unreadCount ? <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" /> : null}
            </div>
            <button
              type="button"
              onClick={markAllNotificationsRead}
              disabled={!unreadCount}
              className="rounded-full border border-emerald-200 px-4 py-2 text-xs font-bold text-emerald-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
            >
              Read all
            </button>
          </div>
          <div className="mt-6 space-y-3">
            {notifications.length ? notifications.map((item) => (
              <button
                key={item._id}
                type="button"
                onClick={() => markNotificationRead(item)}
                className={`block w-full rounded-2xl px-4 py-4 text-left ${item.isRead ? "bg-slate-50" : "bg-emerald-50/70"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  {!item.isRead ? <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#22c55e]" /> : null}
                </div>
                <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                <p className="mt-2 text-xs font-semibold text-slate-400">{new Date(item.createdAt).toLocaleString("en-IN")}</p>
              </button>
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
