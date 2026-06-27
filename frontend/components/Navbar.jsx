"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, CircleUserRound, CreditCard, HandCoins, ListChecks, LogOut, Menu, Package, Settings, UserCircle2, X } from "lucide-react";
import api from "../lib/api";
import { AUTH_EVENT, clearSession, getStoredUser, isAuthenticated } from "../lib/auth";
import useCurrentPath from "../hooks/useCurrentPath";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/sellers", label: "Search Sellers" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/about-us", label: "About Us" },
  { href: "/blog", label: "Blog" }
];

const isActiveLink = (pathname, href) => {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
};

const resolveAvatarUrl = (avatar) => {
  if (!avatar) return "";
  if (/^https?:\/\//i.test(avatar)) return avatar;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const origin = apiBase.replace(/\/api\/?$/, "");
  return `${origin}${avatar.startsWith("/") ? avatar : `/${avatar}`}`;
};

const formatUnreadCount = (count) => (count > 99 ? "99+" : String(count));

export default function Navbar() {
  const pathname = useCurrentPath();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileMenuRef = useRef(null);
  const notificationMenuRef = useRef(null);
  const hasUnreadNotifications = unreadCount > 0;
  const unreadBadgeLabel = formatUnreadCount(unreadCount);

  useEffect(() => {
    const syncUser = () => {
      if (isAuthenticated()) {
        setUser(getStoredUser());
      } else {
        setUser(null);
      }
    };

    syncUser();
    window.addEventListener(AUTH_EVENT, syncUser);
    window.addEventListener("storage", syncUser);
    return () => {
      window.removeEventListener(AUTH_EVENT, syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, [pathname]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return undefined;
    }

    let pollId;
    const loadNotifications = async () => {
      try {
        const { data } = await api.get("/users/notifications");
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } catch {
        // Keep the existing notification state if polling fails temporarily.
      }
    };

    loadNotifications();
    pollId = window.setInterval(loadNotifications, 15000);
    return () => window.clearInterval(pollId);
  }, [user]);

  const profileLinks = [
    { href: user?.role === "super_admin" ? "/admin/dashboard" : "/profile/details", label: "My Profile", icon: UserCircle2 },
    { href: "/orders", label: "My Orders", icon: Package },
    { href: "/listed-coupons", label: "Listed Coupons", icon: ListChecks },
    { href: "/payments", label: "Payments", icon: CreditCard },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/withdraw", label: "Withdraw", icon: HandCoins },
    { href: "/settings", label: "Settings", icon: Settings }
  ];

  const markNotificationRead = async (notification) => {
    try {
      if (!notification?.isRead) {
        await api.put(`/users/notifications/${notification._id}/read`);
      }
      setNotifications((current) => current.map((item) => (item._id === notification._id ? { ...item, isRead: true } : item)));
      setUnreadCount((current) => Math.max(0, current - (notification?.isRead ? 0 : 1)));
      if (notification?.link) {
        router.push(notification.link);
      }
    } catch {
      if (notification?.link) {
        router.push(notification.link);
      }
    } finally {
      setNotificationOpen(false);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.put("/users/notifications/read-all");
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-100/80 bg-white/90 backdrop-blur-xl">
      <div className="w-full px-4 py-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
          <Link href="/" className="justify-self-start shrink-0 text-2xl font-black tracking-tight text-slate-950">
            Coupon<span className="text-[#16a34a]">X</span>
          </Link>

          <nav className="hidden items-center justify-center gap-7 lg:flex">
            {navLinks.map((link) => {
              const active = isActiveLink(pathname, link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-sm font-semibold transition ${active ? "text-[#16a34a]" : "text-slate-500 hover:text-slate-900"}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center justify-end gap-3 lg:flex">
            {!user ? (
              <>
                <Link href="/login" className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700">
                  Log In
                </Link>
                <Link href="/register" className="rounded-2xl bg-gradient-to-r from-[#16a34a] to-[#22c55e] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(34,197,94,0.22)]">
                  Sign Up
                </Link>
              </>
            ) : null}

            <Link href={user ? "/sell" : "/register"} className="rounded-2xl bg-gradient-to-r from-[#16a34a] to-[#22c55e] px-7 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(34,197,94,0.22)]">
              Sell Coupon
            </Link>

            {user ? (
              <>
                <div ref={notificationMenuRef} className="relative">
                  <button
                    onClick={() => setNotificationOpen((current) => !current)}
                    className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-[#16a34a]"
                  >
                    <Bell className="h-5 w-5" />
                    {hasUnreadNotifications ? (
                      <span className="absolute -right-1.5 -top-1.5 inline-flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-[#22c55e] px-1.5 text-[10px] font-black leading-none text-white shadow-[0_0_0_3px_rgba(240,253,244,0.96)]">
                        {unreadBadgeLabel}
                      </span>
                    ) : null}
                  </button>
                  {notificationOpen ? (
                    <div className="absolute right-0 top-14 w-80 overflow-hidden rounded-[26px] border border-emerald-100 bg-white shadow-[0_22px_50px_rgba(15,23,42,0.12)]">
                      <div className="flex items-center justify-between gap-3 border-b border-emerald-100 px-4 py-4">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-black text-slate-900">Notifications</p>
                          {hasUnreadNotifications ? (
                            <span className="inline-flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-[#22c55e] px-1.5 text-[10px] font-black leading-none text-white">
                              {unreadBadgeLabel}
                            </span>
                          ) : null}
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
                      <div className="max-h-[360px] space-y-2 overflow-y-auto p-3">
                        {notifications.length ? notifications.map((item) => (
                          <button
                            key={item._id}
                            type="button"
                            onClick={() => markNotificationRead(item)}
                            className={`block w-full rounded-2xl px-4 py-3 text-left ${item.isRead ? "bg-slate-50" : "bg-emerald-50/70"}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                              {!item.isRead ? <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#22c55e]" /> : null}
                            </div>
                            <p className="mt-1 text-xs leading-6 text-slate-500">{item.message}</p>
                            <p className="mt-1 text-[11px] font-semibold text-slate-400">{new Date(item.createdAt).toLocaleString("en-IN")}</p>
                          </button>
                        )) : <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">No notifications yet.</p>}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div ref={profileMenuRef} className="relative">
                  <button
                    onClick={() => setProfileOpen((current) => !current)}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-[#16a34a]"
                  >
                    {user?.avatar ? (
                      <img src={resolveAvatarUrl(user.avatar)} alt={user.name || "Profile"} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <CircleUserRound className="h-5 w-5" />
                    )}
                  </button>
                  {profileOpen ? (
                    <div className="absolute right-0 top-14 w-72 overflow-hidden rounded-[26px] border border-emerald-100 bg-white shadow-[0_22px_50px_rgba(15,23,42,0.12)]">
                      <div className="bg-[linear-gradient(135deg,#f7fff8_0%,#ffffff_100%)] px-4 py-4">
                        <p className="text-sm font-black text-slate-900">{user.name || "CouponX User"}</p>
                        <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                      </div>
                      <div className="p-3">
                        {profileLinks.map(({ href, label, icon: Icon }) => (
                          <Link
                            key={href}
                            href={href}
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-emerald-50"
                          >
                            <Icon className="h-4 w-4 text-[#16a34a]" />
                            {label}
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-emerald-100 p-3">
                        <button
                          onClick={() => {
                            clearSession();
                            router.push("/login");
                          }}
                          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <Link href="/register" className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-[#16a34a]">
                <CircleUserRound className="h-5 w-5" />
              </Link>
            )}
          </div>

          <button
            onClick={() => setOpen((current) => !current)}
            className="justify-self-end inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open ? (
          <div className="mt-4 rounded-[28px] border border-emerald-100 bg-white p-4 shadow-soft lg:hidden">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`rounded-2xl px-4 py-3 text-sm font-medium hover:bg-emerald-50 ${isActiveLink(pathname, link.href) ? "text-[#16a34a]" : "text-slate-700"}`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {!user ? (
                <>
                  <Link href="/login" className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-emerald-50" onClick={() => setOpen(false)}>
                    Login
                  </Link>
                  <Link href="/register" className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-emerald-50" onClick={() => setOpen(false)}>
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  {profileLinks.map(({ href, label }) => (
                    <Link key={href} href={href} className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-emerald-50" onClick={() => setOpen(false)}>
                      {label}
                    </Link>
                  ))}
                </>
              )}
              <Link href={user ? "/sell" : "/register"} className="rounded-2xl bg-[#16a34a] px-4 py-3 text-sm font-semibold text-white" onClick={() => setOpen(false)}>
                Sell Coupon
              </Link>
              {user ? (
                <button
                  onClick={() => {
                    clearSession();
                    router.push("/login");
                  }}
                  className="rounded-2xl px-4 py-3 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  Logout
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}



