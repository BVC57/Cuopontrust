import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { marketingContent } from "../lib/marketingContent";

export default function Footer() {
  return (
    <footer id="footer" className="mt-16 border-t border-emerald-100/70 bg-[linear-gradient(180deg,#ffffff_0%,#f8fff9_100%)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1.1fr]">
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
        <div className="lg:justify-self-end">
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
