"use client";

import Link from "next/link";
import { Bell, CircleUserRound, CreditCard, Flame, HandCoins, ListChecks, Package, Settings } from "lucide-react";
import useCurrentPath from "../hooks/useCurrentPath";

const accountLinks = [
  { href: "/profile", label: "My Profile", icon: CircleUserRound },
  { href: "/orders", label: "My Orders", icon: Package },
  { href: "/listed-coupons", label: "Listed Coupons", icon: ListChecks },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/withdraw", label: "Withdraw", icon: HandCoins },
  { href: "/settings", label: "Settings", icon: Settings }
];

export default function AccountShell({ title, subtitle, children, aside }) {
  const pathname = useCurrentPath();

  return (
    <div className="rgb-shell mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <section className="space-y-6">
        <div className="rgb-panel overflow-hidden rounded-[34px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(248,255,251,0.98)_100%)] p-4 shadow-[0_22px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          <div className="relative rounded-[28px] bg-[radial-gradient(circle_at_left_top,rgba(34,197,94,0.2),transparent_18%),radial-gradient(circle_at_right_top,rgba(124,58,237,0.14),transparent_18%),linear-gradient(180deg,#ffffff_0%,#fafffb_100%)] px-6 py-7">
            <div className="pointer-events-none absolute -left-14 top-6 h-44 w-44 rounded-full bg-[rgba(34,197,94,0.16)] blur-3xl" />
            <div className="pointer-events-none absolute -right-10 top-0 h-40 w-40 rounded-full bg-[rgba(124,58,237,0.14)] blur-3xl" />
            <div className="relative px-1 pt-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-700 shadow-[0_12px_24px_rgba(15,23,42,0.05)]">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
                {title}
              </div>
              <h1 className="app-main-heading mt-5 font-black text-slate-950">{title}</h1>
              {subtitle ? <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">{subtitle}</p> : null}
            </div>
          </div>
        </div>

        <div className="rgb-panel rounded-[28px] border border-emerald-100 bg-white p-3 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
          <div className="flex flex-wrap gap-2">
            {accountLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white shadow-[0_12px_24px_rgba(34,197,94,0.18)]"
                      : "text-slate-600 hover:bg-emerald-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        {aside ? <div className="grid gap-6 xl:grid-cols-[1fr_320px]">{children}{aside}</div> : children}
      </section>
    </div>
  );
}
