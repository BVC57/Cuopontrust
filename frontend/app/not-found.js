"use client";

import Link from "next/link";
import { Compass, SearchX } from "lucide-react";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-[70vh] items-center bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.16),transparent_24%),radial-gradient(circle_at_top_right,rgba(124,58,237,0.14),transparent_22%),linear-gradient(180deg,#f3fff6_0%,#f9fffb_22%,#ffffff_46%,#fbfffc_100%)] px-4 py-12 sm:px-6 lg:px-8">
      <section className="mx-auto grid w-full max-w-6xl gap-8 overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="p-8 sm:p-10 lg:p-14">
          <div className="inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
            Error 404
          </div>
          <h1 className="mt-6 max-w-xl text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
            This page could not be found.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
            The link may be broken, the page may have moved, or the address is incorrect. Use the buttons below to continue browsing CouponX.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#16a34a] to-[#22c55e] px-5 py-3 text-sm font-bold text-white shadow-[0_14px_28px_rgba(34,197,94,0.2)]">
              <Compass className="h-4 w-4" />
              Go Home
            </Link>
            <Link href="/marketplace" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700">
              Browse Coupons
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.2),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.18),transparent_28%),linear-gradient(135deg,#f8fafc_0%,#eefcf3_100%)] p-8 sm:p-10 lg:p-14">
          <div className="mx-auto flex h-full min-h-[280px] max-w-md flex-col justify-between rounded-[32px] border border-white/70 bg-white/70 p-6 backdrop-blur">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950 text-white">
              <SearchX className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Suggested next steps</p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
                <li>Check the URL for typing mistakes.</li>
                <li>Return to the homepage and navigate from there.</li>
                <li>Use the marketplace to continue browsing live coupon listings.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
