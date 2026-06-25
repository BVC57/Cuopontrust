import Link from "next/link";
import Image from "next/image";
import {
  Armchair,
  BookOpen,
  Car,
  Cpu,
  Gamepad2,
  Gift,
  Globe2,
  HeartPulse,
  Hotel,
  Landmark,
  MapPinned,
  Plane,
  Popcorn,
  Receipt,
  Rocket,
  ShoppingBag,
  Sparkles,
  Sprout,
  Star,
  Tag,
  Ticket,
  Trophy,
  Tv,
  UtensilsCrossed
} from "lucide-react";
import { brandCatalog } from "../../lib/brandCatalog";
import { couponCategories, popularCouponCategories } from "../../lib/couponCategories";

const categoryIcons = {
  Shopping: ShoppingBag,
  "Food & Dining": UtensilsCrossed,
  Travel: Plane,
  Fashion: Sparkles,
  Electronics: Cpu,
  Grocery: Sprout,
  Beauty: Sparkles,
  Healthcare: HeartPulse,
  Entertainment: Tv,
  Gaming: Gamepad2,
  Recharge: Rocket,
  Finance: Landmark,
  Education: BookOpen,
  "Software & SaaS": Cpu,
  "Gift Cards": Gift,
  Hotels: Hotel,
  Flights: Plane,
  Automotive: Car,
  "Home & Furniture": Armchair,
  Sports: Trophy,
  Pets: HeartPulse,
  Kids: Popcorn,
  Events: Ticket,
  Subscription: Receipt,
  "Local Deals": MapPinned,
  "Luxury Brands": Star,
  "International Offers": Globe2
};

export default function CategoriesPage() {
  return (
    <div className="bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.15),transparent_24%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_22%),linear-gradient(180deg,#f6fff8_0%,#ffffff_40%,#fbfffd_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[40px] border border-white/80 bg-white/80 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-6">
          <div className="relative rounded-[34px] bg-[radial-gradient(circle_at_left_top,rgba(34,197,94,0.22),transparent_18%),radial-gradient(circle_at_right_top,rgba(14,165,233,0.14),transparent_20%),linear-gradient(180deg,#ffffff_0%,#f9fffb_100%)] px-5 py-8 sm:px-8 sm:py-10">
            <div className="pointer-events-none absolute -left-16 top-12 h-48 w-48 rounded-full bg-emerald-200/40 blur-3xl" />
            <div className="pointer-events-none absolute -right-12 top-6 h-48 w-48 rounded-full bg-sky-200/40 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-slate-700 shadow-[0_12px_24px_rgba(15,23,42,0.05)]">
                  <Tag className="h-4 w-4 text-[#16a34a]" />
                  Brands + Categories Hub
                </div>
                <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                  Explore Every Brand and Category in One Place
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-500">
                  This page brings together all major CouponX categories from your document and a full brand showcase, with direct links into the marketplace filters.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:w-[360px]">
                <div className="rounded-[26px] border border-emerald-100 bg-white p-5 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                  <p className="text-3xl font-black text-[#16a34a]">{couponCategories.length}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">Total Categories</p>
                </div>
                <div className="rounded-[26px] border border-sky-100 bg-white p-5 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                  <p className="text-3xl font-black text-sky-600">{brandCatalog.length}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">Featured Brands</p>
                </div>
                <div className="rounded-[26px] border border-amber-100 bg-white p-5 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                  <p className="text-3xl font-black text-amber-500">{popularCouponCategories.length}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">Popular Picks</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[34px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-600">Brand Gallery</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">All Popular Brands</h2>
              <p className="mt-2 text-sm leading-7 text-slate-500">Tap any brand card to continue shopping on the marketplace.</p>
            </div>
            <Link href="/marketplace" className="inline-flex rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-sm font-black text-[#16a34a] shadow-[0_12px_24px_rgba(15,23,42,0.05)]">
              Open Marketplace
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {brandCatalog.map((brand) => (
              <Link
                key={brand.key}
                href="/marketplace"
                className="group rounded-[24px] border border-slate-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4 text-center shadow-[0_12px_26px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_18px_34px_rgba(34,197,94,0.10)]"
              >
                <div className="flex h-24 items-center justify-center rounded-[18px] bg-white">
                  <Image
                    src={brand.logoPath}
                    alt={brand.label}
                    width={110}
                    height={54}
                    className="h-12 w-[80%] object-contain transition duration-300 group-hover:scale-110"
                  />
                </div>
                <p className="mt-3 text-xs font-bold text-slate-600">{brand.label}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-600">Category Directory</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">All Coupon Categories</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
                Designed for fast browsing: bigger cards, clearer hierarchy, and direct category links into the marketplace.
              </p>
            </div>
            <Link href="/" className="inline-flex rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-[0_12px_24px_rgba(15,23,42,0.05)]">
              Back to Home
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {couponCategories.map((category, index) => {
              const Icon = categoryIcons[category.name] || Tag;
              return (
                <Link
                  key={category.slug}
                  href={`/marketplace?category=${encodeURIComponent(category.name)}`}
                  className="group overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_34px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_22px_42px_rgba(34,197,94,0.12)]"
                >
                  <div className="bg-[linear-gradient(135deg,#f6fff8_0%,#f9fbff_100%)] p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#16a34a] shadow-[0_10px_24px_rgba(34,197,94,0.14)]">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="mt-5 text-2xl font-black text-slate-950">{category.name}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-500">{category.description}</p>
                  </div>
                  <div className="border-t border-slate-100 px-6 py-5">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">Examples</p>
                    <p className="mt-2 text-sm font-semibold leading-7 text-slate-700">{category.examples.join(" | ")}</p>
                    <div className="mt-4 inline-flex items-center rounded-full bg-emerald-50 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-emerald-700">
                      Browse this category
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
