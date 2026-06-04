"use client";

import { useEffect, useState } from "react";
import { Moon, SunMedium, UserCircle2, LogOut } from "lucide-react";
import { clearSession, getStoredUser } from "../lib/auth";
import AdminRoute from "./AdminRoute";
import AdminSidebar from "./AdminSidebar";

export default function AdminPageShell({ title, subtitle, children, actions = null }) {
  const [theme, setTheme] = useState("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedTheme = typeof window !== "undefined" ? window.localStorage.getItem("couponx_admin_theme") : null;
    if (storedTheme === "light" || storedTheme === "dark") {
      setTheme(storedTheme);
    }
    setUser(getStoredUser());
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("couponx_admin_theme", theme);
    }
  }, [theme]);

  const handleLogout = () => {
    clearSession();
    window.location.href = "/login";
  };

  return (
    <AdminRoute>
      <div className={`admin-shell admin-page-root ${theme === "dark" ? "admin-theme-dark" : "admin-theme-light"}`}>
        <div className="admin-shell-frame">
          <div className="admin-sidebar-column">
            <AdminSidebar />
          </div>

          <section className="admin-main-column">
            <div className="admin-panel admin-header-card relative px-5 py-5 sm:px-6">
              <div className="admin-header-glow" />
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] admin-muted">{title}</p>
                  <h1 className="mt-2 font-display text-3xl font-black admin-heading sm:text-4xl">{subtitle}</h1>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {actions}
                  <button
                    type="button"
                    onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
                    className="admin-theme-toggle"
                  >
                    {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    <span>{theme === "dark" ? "Light" : "Dark"} mode</span>
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setMenuOpen((prev) => !prev)}
                      className="admin-theme-toggle"
                    >
                      <UserCircle2 className="h-5 w-5" />
                      <span>{user?.name || "Profile"}</span>
                    </button>
                    {menuOpen ? (
                      <div className="absolute right-0 top-[calc(100%+10px)] z-30 min-w-[180px] rounded-2xl border border-white/10 bg-[var(--admin-panel-alt)] p-2 shadow-[0_20px_50px_rgba(2,6,23,0.24)]">
                        <a
                          href={user?.role === "super_admin" ? "/admin/dashboard" : "/profile"}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold admin-body hover:bg-white/5"
                        >
                          <UserCircle2 className="h-4 w-4" />
                          Profile
                        </a>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-rose-400 hover:bg-white/5"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
            <div className="admin-content-scroll">
              {children}
            </div>
          </section>
        </div>
      </div>
    </AdminRoute>
  );
}
