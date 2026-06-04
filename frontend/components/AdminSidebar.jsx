"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  BadgeDollarSign,
  BarChart3,
  CreditCard,
  FileWarning,
  Gauge,
  ReceiptText,
  Settings,
  ShieldAlert,
  Ticket,
  Users,
  Wallet
} from "lucide-react";

const links = [
  { label: "Dashboard", href: "/admin/dashboard", icon: Gauge },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Coupons", href: "/admin/coupons", icon: Ticket },
  { label: "AI Failed", href: "/admin/ai-failed", icon: AlertTriangle },
  { label: "Transactions", href: "/admin/transactions", icon: ReceiptText },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Disputes", href: "/admin/disputes", icon: ShieldAlert },
  { label: "Withdrawals", href: "/admin/withdrawals", icon: Wallet },
  { label: "Fraud Reports", href: "/admin/fraud-reports", icon: FileWarning },
  { label: "Revenue", href: "/admin/revenue", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings }
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-panel admin-sidebar p-4">
      <div className="px-3 py-2">
        <p className="text-xs font-black uppercase tracking-[0.28em] admin-muted">CouponX</p>
        <h2 className="mt-2 font-display text-base font-black uppercase tracking-[0.2em] admin-heading">Admin Dashboard</h2>
      </div>

      <div className="mt-5 space-y-1.5">
        {links.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`admin-nav-link ${active ? "admin-nav-link-active" : ""}`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
