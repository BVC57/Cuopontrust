"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, ShieldAlert } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { AUTH_EVENT, clearSession, getStoredUser, isAuthenticated, isTrustLockedUser } from "../lib/auth";

function TrustLockedPage() {
  const handleLogout = () => {
    clearSession();
    window.location.href = "/login";
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 py-10">
      <section className="w-full max-w-lg rounded-[28px] border border-rose-100 bg-white p-6 text-center shadow-[0_22px_60px_rgba(15,23,42,0.08)] sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="app-main-heading mt-6 font-black text-slate-950">Account banned</h1>
        <p className="mx-auto mt-4 max-w-md text-sm font-semibold leading-7 text-slate-600">
          Your account is banned. When a trust score falls below 40, account access is blocked until admin reviews the case.
        </p>
        <div className="mt-7 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          Access is limited because your trust score is below 40 and the account is banned.
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-7 inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </section>
    </main>
  );
}

export default function RouteChrome({ children }) {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isAdminPage = pathname?.startsWith("/admin");

  useEffect(() => {
    const syncUser = () => {
      setUser(isAuthenticated() ? getStoredUser() : null);
    };

    syncUser();
    window.addEventListener(AUTH_EVENT, syncUser);
    window.addEventListener("storage", syncUser);
    return () => {
      window.removeEventListener(AUTH_EVENT, syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, [pathname]);

  if (!isAdminPage && isTrustLockedUser(user)) {
    return <TrustLockedPage />;
  }

  if (isAuthPage || isAdminPage) {
    return <main className="rgb-shell">{children}</main>;
  }

  return (
    <div className="rgb-shell min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.16),transparent_24%),radial-gradient(circle_at_top_right,rgba(124,58,237,0.14),transparent_22%),radial-gradient(circle_at_center_top,rgba(251,191,36,0.08),transparent_18%),linear-gradient(180deg,#f3fff6_0%,#f9fffb_18%,#ffffff_48%,#fbfffc_100%)]">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
