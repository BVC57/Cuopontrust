"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function RouteChrome({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isAdminPage = pathname?.startsWith("/admin");

  if (isAuthPage || isAdminPage) {
    return <main>{children}</main>;
  }

  return (
    <div className="min-h-screen bg-brand-mist">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
