"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  CreditCard,
  Gauge,
  MessageSquare,
  ReceiptText,
  ShieldAlert,
  Sparkles,
  Ticket,
  Users,
  Wallet
} from "lucide-react";
import useCurrentPath from "../hooks/useCurrentPath";

const sections = [
  { type: "link", label: "Dashboard", href: "/admin/dashboard", icon: Gauge },
  { type: "link", label: "Users", href: "/admin/users", icon: Users },
  { type: "group", label: "Coupons", icon: Ticket, children: [
      { label: "All Coupons", href: "/admin/coupons" },
      { label: "AI Failed Coupons", href: "/admin/ai-failed" }
    ] },
  { type: "link", label: "Transactions", href: "/admin/transactions", icon: ReceiptText },
  { type: "link", label: "Payments", href: "/admin/payments", icon: CreditCard },
  { type: "link", label: "Withdrawals", href: "/admin/withdrawals", icon: Wallet },
  { type: "group", label: "Referral&Rewards", icon: Sparkles, children: [
      { label: "Overview", href: "/admin/rewards" },
      { label: "Settings", href: "/admin/rewards/settings" },
      { label: "Missions", href: "/admin/rewards/missions" },
      { label: "Referrals", href: "/admin/rewards/referrals" },
      { label: "History", href: "/admin/rewards/history" },
      { label: "Fraud Flags", href: "/admin/rewards/fraud" }
    ] },
  { type: "link", label: "Disputes", href: "/admin/disputes", icon: ShieldAlert },
  { type: "link", label: "Blogs", href: "/admin/blogs", icon: BookOpen },
  { type: "link", label: "Contact Issues", href: "/admin/contact-issues", icon: MessageSquare },
  { type: "group", label: "Reports", icon: BarChart3, children: [
      { label: "Fraud Reports", href: "/admin/fraud-reports" },
      { label: "Revenue", href: "/admin/revenue" }
    ] }
];

const isPathActive = (pathname, href) => pathname === href || pathname.startsWith(`${href}/`);

export default function AdminSidebar() {
  const pathname = useCurrentPath();
  const [openGroups, setOpenGroups] = useState({});
  const isLightTheme = typeof document !== "undefined" && document.documentElement.getAttribute("data-admin-theme") === "light";

  useEffect(() => {
    const nextGroups = {};
    sections.forEach((section) => {
      if (section.type === "group") nextGroups[section.label] = section.children.some((child) => isPathActive(pathname, child.href));
    });
    setOpenGroups((current) => ({ ...nextGroups, ...current }));
  }, [pathname]);

  return (
    <aside className="admin-panel admin-sidebar flex h-full flex-col p-4">
      <div className="px-3 py-2"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#16a34a] to-[#10b981] text-white shadow-[0_12px_28px_rgba(34,197,94,0.28)]"><svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6"><path d="M109 46C103.7 46 98.6 48.1 94.8 51.9L49.9 96.8C42 104.7 42 117.3 49.9 125.2L74.8 150.1C82.7 158 95.3 158 103.2 150.1L148.1 105.2C151.9 101.4 154 96.3 154 91V57C154 50.9 149.1 46 143 46H109Z" fill="white"/><circle cx="80" cy="110" r="10" fill="#16a34a"/><path d="M136 102C136 113.6 126.6 123 115 123C103.4 123 94 113.6 94 102C94 90.4 103.4 81 115 81C123.3 81 130.4 85.9 133.7 93H121C119.5 90.5 117.5 89 115 89C107.8 89 102 94.8 102 102C102 109.2 107.8 115 115 115C118.8 115 122.1 112 123 108H115V102H136Z" fill="#16a34a"/></svg></div><span className={`text-[2rem] font-black tracking-tight ${isLightTheme ? "text-slate-950" : "text-white"}`}>Coupon<span className="text-[#21c35e]">X</span></span></div></div>
      <div className="mt-6 flex-1 space-y-1.5 overflow-y-auto pr-1">{sections.map((section) => {
        if (section.type === "link") {
          const active = isPathActive(pathname, section.href);
          const Icon = section.icon;
          return <Link key={section.href} href={section.href} className={`admin-nav-link ${active ? "admin-nav-link-active" : ""}`}><Icon className="h-4 w-4" /><span>{section.label}</span></Link>;
        }
        const Icon = section.icon;
        const active = section.children.some((child) => isPathActive(pathname, child.href));
        const open = openGroups[section.label];
        return <div key={section.label} className="space-y-2"><button type="button" onClick={() => setOpenGroups((current) => ({ ...current, [section.label]: !current[section.label] }))} className={`admin-nav-link w-full justify-between ${active ? "admin-nav-link-active" : ""}`}><span className="flex items-center gap-3"><Icon className="h-4 w-4" /><span>{section.label}</span></span><ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} /></button>{open ? <div className="rounded-[18px] bg-white/5 p-2">{section.children.map((child) => { const childActive = isPathActive(pathname, child.href); return <Link key={child.href} href={child.href} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${childActive ? "bg-white/10 text-slate-950 admin-subnav-active" : "text-slate-500 hover:bg-white/5 hover:text-slate-950 admin-subnav-idle"}`}><span className={`h-2 w-2 rounded-full ${childActive ? "bg-[#21c35e]" : "bg-slate-500"}`} />{child.label}</Link>; })}</div> : null}</div>;
      })}</div>
    </aside>
  );
}
