"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CircleUserRound, Menu, ShoppingCart, X } from "lucide-react";
import { clearSession, getStoredUser } from "../lib/auth";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/marketplace", label: "Categories" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#footer", label: "About Us" },
  { href: "/#reviews", label: "Blog" }
];

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-100/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="shrink-0 text-2xl font-black tracking-tight text-slate-950">
            Coupon<span className="text-[#16a34a]">X</span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
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

          <div className="hidden items-center gap-3 lg:ml-auto lg:flex">
            {!user ? (
              <Link href="/login" className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700">
                Log In
              </Link>
            ) : (
              <Link
                href="/orders"
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700"
              >
                <ShoppingCart className="h-4 w-4" />
                My Cart
              </Link>
            )}
            <Link href="/sell" className="rounded-2xl bg-gradient-to-r from-[#16a34a] to-[#22c55e] px-7 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(34,197,94,0.22)]">
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
                  <div className="absolute right-0 top-14 w-48 rounded-2xl border border-emerald-100 bg-white p-2 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
                    <Link
                      href={user.role === "super_admin" ? "/admin/dashboard" : "/profile"}
                      className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-emerald-50"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        clearSession();
                        window.location.href = "/login";
                      }}
                      className="block w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-emerald-50"
                    >
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-[#16a34a]">
                <CircleUserRound className="h-5 w-5" />
              </span>
            )}
          </div>

          <button
            onClick={() => setOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white lg:hidden"
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
              <Link href="/login" className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-emerald-50" onClick={() => setOpen(false)}>
                Login
              </Link>
              {user ? (
                <Link href="/orders" className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-emerald-50" onClick={() => setOpen(false)}>
                  My Cart
                </Link>
              ) : null}
              <Link href="/sell" className="rounded-2xl bg-[#16a34a] px-4 py-3 text-sm font-semibold text-white" onClick={() => setOpen(false)}>
                Sell Coupon
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
