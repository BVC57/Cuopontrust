import Link from "next/link";

export default function Footer() {
  return (
    <footer id="footer" className="mt-16 border-t border-emerald-100/70 bg-[linear-gradient(180deg,#ffffff_0%,#f8fff9_100%)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
        <div>
          <p className="text-2xl font-black text-slate-950">
            Coupon<span className="text-[#16a34a]">X</span>
          </p>
          <p className="mt-4 max-w-sm text-sm leading-7 text-slate-500">
            India&apos;s trusted coupon marketplace where buyers save more and sellers turn unused deals into earnings.
          </p>
          <div className="mt-5 flex items-center gap-3 text-xs font-semibold text-slate-400">
            <span>Easy to Use</span>
            <span className="h-1 w-1 rounded-full bg-emerald-300" />
            <span>100% Secure</span>
            <span className="h-1 w-1 rounded-full bg-emerald-300" />
            <span>Instant Access</span>
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
      </div>
      <div className="border-t border-emerald-100/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-slate-400 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 CouponX. Built for Indian shoppers and sellers.</p>
          <p>Verified deals. Protected payments. Transparent support.</p>
        </div>
      </div>
    </footer>
  );
}

