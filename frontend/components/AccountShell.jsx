"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CircleUserRound, CreditCard, HandCoins, ListChecks, Package, Settings } from "lucide-react";

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
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <section className="space-y-6">
        <div className="px-1 pt-1">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#16a34a]">{title}</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm leading-7 text-slate-500">{subtitle}</p> : null}
        </div>

        <div className="rounded-[28px] border border-emerald-100 bg-white p-3 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
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
