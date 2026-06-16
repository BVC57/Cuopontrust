"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, CalendarDays, ChevronDown, LogOut, Moon, Search, Settings, SunMedium, UserCircle2 } from "lucide-react";
import { AUTH_EVENT, clearSession, getStoredUser } from "../lib/auth";
import api from "../lib/api";
import AdminRoute from "./AdminRoute";
import AdminSidebar from "./AdminSidebar";
import { AdminBreadcrumbs } from "./admin/AdminUi";

export default function AdminPageShell({
  title,
  subtitle,
  breadcrumbs = ["Dashboard", title],
  children,
  actions = null,
  searchPlaceholder = "Search anything...",
  dateLabel = "24 May 2025 - 30 May 2025"
}) {
  const router = useRouter();
  const [theme, setTheme] = useState("light");
  const [menuOpen, setMenuOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [selectedDateLabel, setSelectedDateLabel] = useState(dateLabel);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef(null);
  const dateRef = useRef(null);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);

  const quickPages = useMemo(() => [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Users", href: "/admin/users" },
    { label: "Coupons", href: "/admin/coupons" },
    { label: "Payments", href: "/admin/payments" },
    { label: "Transactions", href: "/admin/transactions" },
    { label: "Withdrawals", href: "/admin/withdrawals" },
    { label: "Disputes", href: "/admin/disputes" },
    { label: "Blogs", href: "/admin/blogs" },
    { label: "Contact Issues", href: "/admin/contact-issues" },
    { label: "Fraud Reports", href: "/admin/fraud-reports" },
    { label: "Revenue", href: "/admin/revenue" },
    { label: "Settings", href: "/admin/settings" }
  ], []);

  const filteredPages = useMemo(() => {
    const term = globalSearch.trim().toLowerCase();
    if (!term) return quickPages.slice(0, 5);
    return quickPages.filter((page) => page.label.toLowerCase().includes(term)).slice(0, 5);
  }, [globalSearch, quickPages]);
  const hasUnreadNotifications = unreadCount > 0;

  const dateOptions = ["24 May 2025 - 30 May 2025", "This Week", "Last 7 Days", "This Month"];

  useEffect(() => {
    const syncUser = () => setUser(getStoredUser());
    syncUser();
    window.addEventListener(AUTH_EVENT, syncUser);
    return () => window.removeEventListener(AUTH_EVENT, syncUser);
  }, []);

  useEffect(() => {
    let pollId;
    const loadNotifications = async () => {
      try {
        const { data } = await api.get("/super-admin/notifications");
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } catch {
        // Keep the current notification state if polling fails temporarily.
      }
    };
    loadNotifications();
    pollId = window.setInterval(loadNotifications, 15000);
    return () => window.clearInterval(pollId);
  }, []);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("couponx_admin_theme");
    if (storedTheme === "light" || storedTheme === "dark") {
      setTheme(storedTheme);
      return;
    }

    const documentTheme = document.documentElement.getAttribute("data-admin-theme");
    if (documentTheme === "light" || documentTheme === "dark") {
      setTheme(documentTheme);
      return;
    }

    document.documentElement.setAttribute("data-admin-theme", "light");
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("couponx_admin_theme", theme);
      document.documentElement.setAttribute("data-admin-theme", theme);
    }
  }, [theme]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
      if (dateRef.current && !dateRef.current.contains(event.target)) setDateOpen(false);
      if (notificationRef.current && !notificationRef.current.contains(event.target)) setNotificationOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setSearchFocused(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  const markNotificationRead = async (notification) => {
    try {
      if (!notification?.isRead) {
        await api.put(`/super-admin/notifications/${notification._id}/read`);
      }
      setNotifications((current) => current.map((item) => (item._id === notification._id ? { ...item, isRead: true } : item)));
      setUnreadCount((current) => Math.max(0, current - (notification?.isRead ? 0 : 1)));
      if (notification?.link) router.push(notification.link);
    } catch {
      if (notification?.link) router.push(notification.link);
    } finally {
      setNotificationOpen(false);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.put("/super-admin/notifications/read-all");
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const initials = String(user?.name || "SA").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <AdminRoute>
      <div className={`admin-shell admin-page-root ${theme === "dark" ? "admin-theme-dark" : "admin-theme-light"}`}>
        <div className="admin-shell-frame">
          <div className="admin-sidebar-column">
            <AdminSidebar />
          </div>

          <section className="admin-main-column">
            <div className="admin-topbar">
              <div className="flex w-full flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div ref={searchRef} className="relative hidden min-w-[360px] xl:block">
                    <div className="admin-input-surface flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_10px_22px_rgba(15,23,42,0.03)]">
                      <Search className="h-4 w-4 text-slate-400" />
                      <input
                        value={globalSearch}
                        onFocus={() => setSearchFocused(true)}
                        onChange={(event) => setGlobalSearch(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && filteredPages[0]) {
                            router.push(filteredPages[0].href);
                          }
                        }}
                        placeholder={searchPlaceholder}
                        className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                      />
                      <span className="rounded-xl bg-slate-100 px-2 py-1 text-xs font-bold text-slate-400">Ctrl K</span>
                    </div>
                    {(searchFocused || globalSearch) ? (
                      <div className="admin-content-surface absolute left-0 right-0 top-[calc(100%+10px)] z-[70] rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
                        {filteredPages.length ? filteredPages.map((page) => (
                          <Link key={page.href} href={page.href} onClick={() => { setGlobalSearch(""); setSearchFocused(false); }} className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                            {page.label}
                          </Link>
                        )) : <div className="rounded-xl px-3 py-2 text-sm font-medium text-slate-400">No matching admin page found.</div>}
                      </div>
                    ) : null}
                  </div>

                  {actions}

                  <div className="flex flex-wrap items-center gap-2">
                    <div ref={dateRef} className="relative">
                      <button type="button" onClick={() => setDateOpen((prev) => !prev)} className="admin-input-surface inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-[0_10px_22px_rgba(15,23,42,0.03)]">
                        <CalendarDays className="h-4 w-4 text-slate-400" />
                        <span>{selectedDateLabel}</span>
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </button>
                      {dateOpen ? (
                        <div className="admin-content-surface absolute right-0 top-[calc(100%+10px)] z-[70] min-w-[220px] rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
                          {dateOptions.map((option) => (
                            <button key={option} type="button" onClick={() => { setSelectedDateLabel(option); setDateOpen(false); }} className="block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50">
                              {option}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <button type="button" onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))} className="admin-input-surface inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-[0_10px_22px_rgba(15,23,42,0.03)]">
                      {theme === "dark" ? <SunMedium className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>

                    <div ref={notificationRef} className="relative">
                      <button type="button" onClick={() => setNotificationOpen((prev) => !prev)} className="admin-input-surface relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-[0_10px_22px_rgba(15,23,42,0.03)]">
                        <Bell className="h-5 w-5" />
                        {hasUnreadNotifications ? <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-[#22c55e] shadow-[0_0_0_3px_rgba(255,255,255,0.96)]" /> : null}
                      </button>
                      {notificationOpen ? (
                        <div className="admin-content-surface absolute right-0 top-[calc(100%+10px)] z-[70] min-w-[320px] max-w-[360px] rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
                          <div className="flex items-center justify-between gap-3 px-2 pb-2">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-black text-slate-900">Notifications</p>
                              {hasUnreadNotifications ? <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" /> : null}
                            </div>
                            <button
                              type="button"
                              onClick={markAllNotificationsRead}
                              disabled={!hasUnreadNotifications}
                              className="text-xs font-bold text-emerald-600 disabled:cursor-not-allowed disabled:text-slate-300"
                            >
                              Read all
                            </button>
                          </div>
                          <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                            {notifications.length ? notifications.map((item) => (
                              <button key={item._id} type="button" onClick={() => markNotificationRead(item)} className={`block w-full rounded-xl px-3 py-3 text-left hover:bg-slate-50 ${item.isRead ? "opacity-80" : "bg-violet-50/60"}`}>
                                <div className="flex items-start justify-between gap-3">
                                  <p className="text-sm font-bold text-slate-900">{item.title}</p>
                                  {!item.isRead ? <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#22c55e]" /> : null}
                                </div>
                                <p className="mt-1 text-xs leading-6 text-slate-500">{item.message}</p>
                                <p className="mt-1 text-[11px] font-semibold text-slate-400">{new Date(item.createdAt).toLocaleString("en-IN")}</p>
                              </button>
                            )) : <p className="rounded-xl px-3 py-3 text-sm text-slate-400">No notifications yet.</p>}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div ref={menuRef} className="relative">
                      <button type="button" onClick={() => setMenuOpen((prev) => !prev)} className="admin-input-surface inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-2 py-1.5 text-sm font-bold text-slate-900 shadow-[0_10px_22px_rgba(15,23,42,0.03)]">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#7c3aed] to-[#c084fc] text-white">{initials}</div>
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </button>
                      {menuOpen ? (
                        <div className="admin-content-surface absolute right-0 top-[calc(100%+10px)] z-[80] min-w-[210px] rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
                          <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-3">
                            <p className="text-sm font-black text-slate-900">{user?.name || "Super Admin"}</p>
                            <p className="mt-1 text-xs text-slate-500">{user?.email || "admin@couponx.com"}</p>
                          </div>
                          <Link href="/admin/dashboard" onClick={() => setMenuOpen(false)} className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                            <UserCircle2 className="h-4 w-4" />
                            Profile
                          </Link>
                          <Link href="/admin/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                            <Settings className="h-4 w-4" />
                            Settings
                          </Link>
                          <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-rose-500 hover:bg-rose-50">
                            <LogOut className="h-4 w-4" />
                            Logout
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="min-w-0">
                  <h1 className="text-[2.1rem] font-black tracking-tight text-slate-950">{title}</h1>
                  <div className="mt-2">
                    <AdminBreadcrumbs items={breadcrumbs} />
                  </div>
                  {subtitle ? <p className="mt-2 text-sm text-slate-500">{subtitle}</p> : null}
                </div>
              </div>
            </div>

            <div className="admin-content-scroll">
              <div className="admin-render-content space-y-6 pb-6">{children}</div>
            </div>
          </section>
        </div>
      </div>
    </AdminRoute>
  );
}
