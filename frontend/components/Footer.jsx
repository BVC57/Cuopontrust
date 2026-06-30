import Link from "next/link";
import { ArrowUpRight, Download, Mail, MapPin, Phone, Smartphone } from "lucide-react";
import { marketingContent } from "../lib/marketingContent";

const appDownloadUrl = "https://expo.dev/accounts/bvc57/projects/couponx-mobile/builds/e0de8813-e448-4633-a18f-7c77410d3cc7";

export default function Footer() {
  return (
    <footer id="footer" className="mt-16 border-t border-emerald-100/70 bg-[linear-gradient(180deg,#ffffff_0%,#f8fff9_100%)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr_1.05fr]">
        <div>
          <p className="text-2xl font-black text-slate-950">
            Coupon<span className="text-[#16a34a]">X</span>
          </p>
          <p className="mt-4 max-w-sm text-sm leading-7 text-slate-500">
            {marketingContent.aboutDescription}
          </p>
          <div className="mt-5 flex items-center gap-3 text-xs font-semibold text-slate-400">
            <span>{marketingContent.footerTagline}</span>
            <span className="h-1 w-1 rounded-full bg-emerald-300" />
            <span>{marketingContent.secondaryTagline}</span>
          </div>
          <div className="mt-6 space-y-3 rounded-[24px] border border-emerald-100 bg-white/90 p-4 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Direct Contact</p>
            <a
              href="tel:9898394548"
              className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-emerald-100"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-emerald-600 shadow-[0_10px_18px_rgba(34,197,94,0.14)]">
                <Phone className="h-4 w-4" />
              </span>
              <span>+91 9898394548</span>
            </a>
            <a
              href="mailto:chauhanbhadresh57@gmail.com"
              className="flex items-center gap-3 rounded-2xl bg-sky-50 px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-sky-100"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sky-600 shadow-[0_10px_18px_rgba(14,165,233,0.12)]">
                <Mail className="h-4 w-4" />
              </span>
              <span className="break-all">chauhanbhadresh57@gmail.com</span>
            </a>
          </div>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">Quick Links</p>
          <div className="mt-4 space-y-3 text-sm text-slate-500">
            <Link href="/how-it-works" className="block">How It Works</Link>
            <Link href="/marketplace" className="block">For Buyers</Link>
            <Link href="/sell" className="block">For Sellers</Link>
            <Link href="/marketplace" className="block">Marketplace</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">Legal</p>
          <div className="mt-4 space-y-3 text-sm text-slate-500">
            <Link href="/privacy-policy" className="block">Privacy Policy</Link>
            <Link href="/terms-of-service" className="block">Terms of Service</Link>
            <Link href="/refund-policy" className="block">Refund Policy</Link>
            <Link href="/contact-us" className="block">Contact Us</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">Support</p>
          <div className="mt-4 space-y-3 text-sm text-slate-500">
            <Link href="/help-support" className="block">Help & Support</Link>
            <Link href="/faq" className="block">FAQ</Link>
            <Link href="/contact-us" className="block">Report an issue</Link>
            <Link href="/withdraw" className="block">Withdraw</Link>
          </div>
        </div>
        <div className="space-y-4 lg:justify-self-end">
          <div className="rounded-[24px] border border-emerald-100 bg-white/90 p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Company Address</p>
            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-amber-50 px-4 py-4 text-sm font-bold text-slate-900">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-amber-600 shadow-[0_10px_18px_rgba(245,158,11,0.14)]">
                <MapPin className="h-4 w-4" />
              </span>
              <span className="leading-6">
                Vallbhipur, Bhavnagar, 364310
              </span>
            </div>
          </div>

          <a
            href={appDownloadUrl}
            target="_blank"
            rel="noreferrer"
            className="group block overflow-hidden rounded-[28px] border border-emerald-100 bg-[linear-gradient(135deg,#0f172a_0%,#111827_46%,#16a34a_140%)] p-5 text-white shadow-[0_18px_38px_rgba(15,23,42,0.16)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(15,23,42,0.22)]"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 text-emerald-300 ring-1 ring-white/10">
                <Smartphone className="h-6 w-6" />
              </span>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition group-hover:bg-white group-hover:text-slate-900">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-emerald-200">Download App</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight">Get CouponX on Android</h3>
            <p className="mt-3 text-sm leading-6 text-emerald-50/90">
              Tap to open the app download page and install CouponX on your phone.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-slate-900">
              <Download className="h-3.5 w-3.5" />
              Download Now
            </div>
          </a>
        </div>
      </div>
      <div className="border-t border-emerald-100/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-slate-400 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 CouponX. Built for Indian shoppers and sellers.</p>
          <p>{marketingContent.trustBadges.join(". ")}.</p>
        </div>
      </div>
    </footer>
  );
}
