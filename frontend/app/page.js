import Link from "next/link";
import { Search } from "lucide-react";
import BrandChip from "../components/landing/BrandChip";
import FeatureTile from "../components/landing/FeatureTile";
import ReviewCard from "../components/landing/ReviewCard";
import SectionHeading from "../components/landing/SectionHeading";
import StatCard from "../components/landing/StatCard";

const brands = ["Amazon", "Flipkart", "Myntra", "Zomato", "Swiggy", "Netflix", "Spotify", "PlayStation"];

const buyerProblems = [
  "Expensive deals everywhere",
  "Fake or expired coupons",
  "Limited discount options"
];

const sellerProblems = [
  "Unused coupons going to waste",
  "No way to monetize deals",
  "Coupons expiring unused"
];

const buyerSolutions = [
  "Verified authentic coupons only",
  "Save up to 70% on 100+ brands",
  "Instant delivery and secure transactions"
];

const sellerSolutions = [
  "Turn unused coupons into cash",
  "Easy listing in just minutes",
  "Earn monthly from extra deals"
];

const faqs = [
  "Is CouponX legitimate and safe to use?",
  "Can sellers really earn money from unused coupons?",
  "How do I know the coupons are authentic?",
  "What happens if a coupon doesn't work?",
  "How does the coin system work?",
  "Is there a minimum payout for sellers?"
];

export default function HomePage() {
  return (
    <div className="bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.08),transparent_22%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent_18%),linear-gradient(180deg,#ffffff_0%,#f8fff9_32%,#ffffff_100%)]">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-4">
          <div>
            <div className="inline-flex rounded-full bg-amber-50 px-4 py-2 text-xs font-bold text-slate-700">
              India&apos;s #1 Coupon Marketplace
            </div>
            <h1 className="mt-6 text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
              Buy Smart,
              <br />
              <span className="text-[#16a34a]">Sell Unused Coupons.</span>
              <br />
              Save More.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-500">
              Join millions of smart buyers and sellers on India&apos;s most trusted platform to save and earn money every day.
            </p>

            <div className="mt-8 rounded-[22px] bg-white p-3 shadow-[0_12px_34px_rgba(15,23,42,0.06)]">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    placeholder="Search for Amazon, Flipkart, Swiggy..."
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                  />
                </div>
                <select className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none">
                  <option>All Categories</option>
                </select>
                <Link
                  href="/marketplace"
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#16a34a] to-[#22c55e] px-6 py-3 text-sm font-bold text-white"
                >
                  Search
                </Link>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/marketplace" className="rounded-xl bg-[#16a34a] px-5 py-3 text-sm font-bold text-white">
                Buy Coupons
              </Link>
              <Link href="/sell" className="rounded-xl border border-emerald-200 px-5 py-3 text-sm font-bold text-[#16a34a]">
                Sell Coupons
              </Link>
            </div>
          </div>

          <div className="relative min-h-[420px]">
            <div className="absolute left-1/2 top-1/2 w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-[38px] border-[8px] border-slate-950 bg-white p-4 shadow-[0_30px_70px_rgba(15,23,42,0.2)]">
              <div className="rounded-[28px] bg-gradient-to-br from-[#1f7a4f] to-[#22c55e] p-4 text-white">
                <div className="rounded-2xl bg-white/15 p-3">
                  <p className="text-xs font-semibold">Regular Brands</p>
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {[...Array(8)].map((_, index) => (
                      <div key={index} className="aspect-square rounded-xl bg-white/20" />
                    ))}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    ["amazon", "20% OFF"],
                    ["zomato", "20% OFF"],
                    ["NETFLIX", "20% OFF"],
                    ["Spotify", "3 MONTHS FREE"]
                  ].map(([name, offer]) => (
                    <div key={name} className="rounded-2xl bg-white p-3 text-slate-900">
                      <p className="text-lg font-black">{name}</p>
                      <p className="mt-2 text-sm font-bold text-[#16a34a]">{offer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute left-0 top-10 rotate-[-8deg] rounded-[22px] border border-[#f1e6d7] bg-[#fff5e9] p-5 shadow-[0_16px_40px_rgba(249,168,37,0.18)]">
              <p className="text-2xl font-black text-slate-900">amazon</p>
              <p className="mt-3 text-3xl font-black text-slate-950">20% OFF</p>
              <p className="mt-2 text-xs font-semibold text-slate-400">Code: AMZ150</p>
            </div>
            <div className="absolute right-2 top-28 rotate-[8deg] rounded-[22px] border border-[#f7d7df] bg-[#ffeef3] p-5 shadow-[0_16px_40px_rgba(244,114,182,0.14)]">
              <p className="text-2xl font-black text-[#ef476f]">Myntra</p>
              <p className="mt-3 text-3xl font-black text-slate-950">50% OFF</p>
              <p className="mt-2 text-xs font-semibold text-slate-400">Code: MYN50</p>
            </div>
            <div className="absolute right-10 bottom-10 rotate-[-8deg] rounded-[22px] border border-[#d8f2e8] bg-[#ecfbf4] p-5 shadow-[0_16px_40px_rgba(16,185,129,0.14)]">
              <p className="text-2xl font-black text-[#10b981]">Spotify</p>
              <p className="mt-3 text-2xl font-black text-slate-950">3 MONTHS FREE</p>
              <p className="mt-2 text-xs font-semibold text-slate-400">Code: SPOT3</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard value="1M+" label="Coupons Listed" />
          <StatCard value="100K+" label="Happy Users" />
          <StatCard value="50+" label="Categories" />
          <StatCard value="4.9/5" label="User Rating" accent="text-[#f7b731]" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-900">Popular Brands</p>
            <Link href="/marketplace" className="text-sm font-bold text-[#16a34a]">View All</Link>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {brands.map((brand) => (
              <BrandChip key={brand} label={brand} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-2 sm:px-6">
        <div className="grid gap-4 md:grid-cols-4">
          <FeatureTile title="Verified Coupons" text="100% authentic and verified" />
          <FeatureTile title="Instant Access" text="Get codes immediately" />
          <FeatureTile title="Secure Transactions" text="Safe and encrypted payments" />
          <FeatureTile title="24/7 Support" text="Always here to help" />
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <SectionHeading title="The Smart Way to Save and Earn" />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[24px] bg-[#f6fff8] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
            <p className="text-2xl font-black text-[#16a34a]">For Smart Buyers</p>
            <p className="mt-5 text-sm font-bold text-[#ef4444]">Problems You Face:</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              {buyerProblems.map((item) => <li key={item}>- {item}</li>)}
            </ul>
            <p className="mt-6 text-sm font-bold text-[#16a34a]">CouponX Solution:</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              {buyerSolutions.map((item) => <li key={item}>+ {item}</li>)}
            </ul>
          </div>

          <div className="rounded-[24px] bg-[#fbfffd] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
            <p className="text-2xl font-black text-[#7c3aed]">For Smart Sellers</p>
            <p className="mt-5 text-sm font-bold text-[#ef4444]">Problems You Face:</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              {sellerProblems.map((item) => <li key={item}>- {item}</li>)}
            </ul>
            <p className="mt-6 text-sm font-bold text-[#16a34a]">CouponX Solution:</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              {sellerSolutions.map((item) => <li key={item}>+ {item}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <SectionHeading title="Save More, Spend Less" subtitle="Join thousands of smart buyers who save money every day" />
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FeatureTile title="Verified Coupons" text="All coupons are manually verified for authenticity" />
          <FeatureTile title="Top Brands" text="Access deals from 500+ popular Indian brands" />
          <FeatureTile title="Instant Access" text="Get coupon codes immediately after purchase" />
          <FeatureTile title="Secure Transactions" text="Safe coin-based payment system" />
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl rounded-[28px] bg-[#f8fffa] px-4 py-6 shadow-[0_14px_36px_rgba(15,23,42,0.04)] sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-3xl font-black text-slate-950">Turn Unused Coupons into Cash</p>
            <p className="mt-2 text-sm text-slate-500">Start earning money from your unused deals today</p>
            <div className="mt-8 space-y-5">
              {[
                "Verify Unused Coupons",
                "List in Minutes",
                "Earn Coins",
                "Build Reputation"
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100" />
                  <div>
                    <p className="font-bold text-slate-900">{item}</p>
                    <p className="text-sm text-slate-500">Simple process to upload and grow safely</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] bg-white p-6">
            <p className="text-xl font-black text-slate-900">Earnings Calculator</p>
            <p className="mt-6 text-sm font-bold text-slate-900">Coupons sold per month:</p>
            <div className="mt-4 h-2 rounded-full bg-emerald-100">
              <div className="h-2 w-5/6 rounded-full bg-[#16a34a]" />
            </div>
            <p className="mt-3 text-lg font-black text-[#16a34a]">50</p>
            <div className="mt-12 rounded-[20px] bg-[#f6fff8] p-6 text-center">
              <p className="text-sm text-slate-500">Potential Monthly Earnings:</p>
              <p className="mt-3 text-3xl font-black text-[#16a34a]">Rs 6,250</p>
              <p className="mt-2 text-xs text-slate-400">*Average coupon value: Rs 125</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <SectionHeading title="How CouponX Works" subtitle="Simple steps to start saving or earning" />
        <div className="mt-5 flex justify-center gap-3">
          <button className="rounded-full bg-[#16a34a] px-5 py-2 text-sm font-bold text-white">For Buyers</button>
          <button className="rounded-full border border-emerald-200 px-5 py-2 text-sm font-bold text-[#16a34a]">For Sellers</button>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ["List Coupon", "Upload unused coupon details"],
            ["Set Price", "Choose competitive coin price"],
            ["Earn Coins", "Get paid when buyers purchase"]
          ].map(([title, text], index) => (
            <div key={title} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-emerald-300 bg-white text-lg font-black text-[#16a34a]">
                {index + 1}
              </div>
              <p className="mt-5 text-xl font-black text-slate-900">{title}</p>
              <p className="mt-2 text-sm text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <SectionHeading title="Why Trust CouponX?" subtitle="Built with security and transparency in mind" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <FeatureTile title="Google Sign-in" text="Secure authentication with Google" />
          <FeatureTile title="Verified Sellers" text="All sellers go through verification" />
          <FeatureTile title="24/7 Support" text="Always here to help you" />
        </div>
      </section>

      <section id="reviews" className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <SectionHeading title="What Our Users Say" subtitle="Real experiences from real people" />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <ReviewCard text='"Saved Rs 5,000 in 3 months using CouponX deals. The coupons are always authentic."' name="Priya Sharma" city="Mumbai - Buyer" />
          <ReviewCard text='"Earned Rs 3,200 by selling unused Zomato and Amazon coupons. Great platform!"' name="Rahul Gupta" city="Delhi - Seller" />
          <ReviewCard text='"Trustworthy app with verified sellers. Never had issues with fake coupons."' name="Anjali Patel" city="Bangalore - Buyer" />
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <SectionHeading title="Frequently Asked Questions" subtitle="Get answers to common questions" />
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {faqs.map((faq) => (
            <details key={faq} className="rounded-[18px] bg-white px-5 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.03)]">
              <summary className="cursor-pointer list-none text-sm font-bold text-slate-800">{faq}</summary>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                CouponX keeps the process simple with verified sellers, AI-based checks, and secure buyer flows.
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl overflow-hidden rounded-[28px] bg-gradient-to-r from-[#0ea85d] to-[#22c55e] px-6 py-8 text-white shadow-[0_18px_40px_rgba(34,197,94,0.2)]">
        <div className="text-center">
          <p className="text-4xl font-black">Ready to Start Saving + Earning?</p>
          <p className="mt-3 text-sm text-emerald-50">Join 1M+ users who trust CouponX for all their coupon needs</p>
          <div className="mt-6 inline-flex rounded-2xl bg-white px-6 py-3 text-sm font-black text-slate-900">
            Get it on Google Play
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm font-semibold text-emerald-50">
            <span>Easy to Use</span>
            <span>100% Secure</span>
            <span>Instant Access</span>
          </div>
        </div>
      </section>
    </div>
  );
}
