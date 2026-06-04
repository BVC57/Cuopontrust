"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["Dashboard", "/admin/dashboard"],
  ["Users", "/admin/users"],
  ["Coupons", "/admin/coupons"],
  ["AI Failed", "/admin/ai-failed"],
  ["Transactions", "/admin/transactions"],
  ["Payments", "/admin/payments"],
  ["Disputes", "/admin/disputes"],
  ["Withdrawals", "/admin/withdrawals"],
  ["Fraud Reports", "/admin/fraud-reports"],
  ["Revenue", "/admin/revenue"],
  ["Settings", "/admin/settings"]
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="rounded-[28px] border border-white/60 bg-white p-4 shadow-soft">
      <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Super Admin</p>
      <div className="mt-3 space-y-1">
        {links.map(([label, href]) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
