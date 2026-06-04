export default function Footer() {
  return (
    <footer id="footer" className="mt-16 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
        <div>
          <p className="text-2xl font-black text-slate-950">
            Coupon<span className="text-[#16a34a]">X</span>
          </p>
          <p className="mt-4 max-w-sm text-sm leading-7 text-slate-500">
            India&apos;s trusted coupon marketplace where buyers save more and sellers turn unused deals into earnings.
          </p>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">Quick Links</p>
          <div className="mt-4 space-y-3 text-sm text-slate-500">
            <p>How It Works</p>
            <p>For Buyers</p>
            <p>For Sellers</p>
            <p>Categories</p>
          </div>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">Legal</p>
          <div className="mt-4 space-y-3 text-sm text-slate-500">
            <p>Privacy Policy</p>
            <p>Terms of Service</p>
            <p>Refund Policy</p>
            <p>Contact Us</p>
          </div>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">Support</p>
          <div className="mt-4 space-y-3 text-sm text-slate-500">
            <p>Help & Support</p>
            <p>FAQ</p>
            <p>Report an issue</p>
            <p>Seller wallet</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
