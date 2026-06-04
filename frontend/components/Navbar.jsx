"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CircleUserRound, CreditCard, HandCoins, ListChecks, LogOut, Menu, Package, Settings, UserCircle2, X } from "lucide-react";
import { clearSession, getStoredUser, isAuthenticated } from "../lib/auth";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/marketplace", label: "Categories" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/about-us", label: "About Us" },
  { href: "/blog", label: "Blog" }
];

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      setUser(getStoredUser());
    } else {
      setUser(null);
    }
  }, []);

  const profileLinks = [
    { href: user?.role === "super_admin" ? "/admin/dashboard" : "/profile", label: "My Profile", icon: UserCircle2 },
    { href: "/orders", label: "My Orders", icon: Package },
    { href: "/listed-coupons", label: "Listed Coupons", icon: ListChecks },
    { href: "/payments", label: "Payments", icon: CreditCard },
    { href: "/withdraw", label: "Withdraw", icon: HandCoins },
    { href: "/settings", label: "Settings", icon: Settings }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-100/80 bg-white/90 backdrop-blur-xl">
      <div className="w-full px-4 py-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
          <Link href="/" className="justify-self-start shrink-0 text-2xl font-black tracking-tight text-slate-950">
            Coupon<span className="text-[#16a34a]">X</span>
          </Link>

          <nav className="hidden items-center justify-center gap-7 lg:flex">
            {navLinks.map((link, index) => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm font-semibold transition ${
                  index === 0 ? "text-[#16a34a]" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
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
              <div className="relative">
                <button
                  onClick={() => setProfileOpen((current) => !current)}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-[#16a34a]"
                >
                  <CircleUserRound className="h-5 w-5" />
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
                        window.location.href = "/login";
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
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-emerald-50"
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
              ) : profileLinks.map(({ href, label }) => (
                <Link key={href} href={href} className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-emerald-50" onClick={() => setOpen(false)}>
                  {label}
                </Link>
              ))}
              <Link href={user ? "/sell" : "/register"} className="rounded-2xl bg-[#16a34a] px-4 py-3 text-sm font-semibold text-white" onClick={() => setOpen(false)}>
                Sell Coupon
              </Link>
              {user ? (
                <button
                  onClick={() => {
                    clearSession();
                    window.location.href = "/login";
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
