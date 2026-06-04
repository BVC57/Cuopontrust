"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Award,
  BadgeCheck,
  Bolt,
  ChevronDown,
  Coins,
  FilePlus2,
  Headphones,
  IndianRupee,
  Lock,
  Search,
  ShieldCheck,
  Star,
  Tag
} from "lucide-react";
import { getStoredUser } from "../lib/auth";

const brands = [
  { name: "Amazon", mark: "a", tone: "text-slate-950 bg-white" },
  { name: "Flipkart", mark: "f", tone: "text-[#2563eb] bg-[#eef4ff]" },
  { name: "Myntra", mark: "M", tone: "text-[#ec4899] bg-[#fff0f8]" },
  { name: "Zomato", mark: "Z", tone: "text-[#ef4444] bg-[#fff1f2]" },
  { name: "Swiggy", mark: "S", tone: "text-[#f97316] bg-[#fff7ed]" },
  { name: "Netflix", mark: "N", tone: "text-[#dc2626] bg-[#fff1f2]" },
  { name: "Spotify", mark: "S", tone: "text-[#16a34a] bg-[#effdf3]" },
  { name: "PlayStation", mark: "PS", tone: "text-[#2563eb] bg-[#eef4ff]" }
];

const featuredBrands = ["amazon", "Flipkart", "zomato", "swiggy"];

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

const savingTiles = [
  {
    title: "Verified Coupons",
    text: "All coupons are manually verified for authenticity",
    icon: ShieldCheck
  },
  {
    title: "Top Brands",
    text: "Access deals from 500+ popular Indian brands",
    icon: Tag
  },
  {
    title: "Instant Access",
    text: "Get coupon codes immediately after purchase",
    icon: Bolt
  },
  {
    title: "Secure Transactions",
    text: "Safe coin-based payment system",
    icon: Lock
  }
];

const trustTiles = [
  {
    title: "Google Sign-in",
    text: "Secure authentication with Google",
    icon: BadgeCheck
  },
  {
    title: "Verified Sellers",
    text: "All sellers go through verification",
    icon: ShieldCheck
  },
  {
    title: "24/7 Support",
    text: "Always here to help you",
    icon: Headphones
  }
];

const reviews = [
  {
    text: "Saved Rs 5,000 in 3 months using CouponX deals. The coupons are always authentic.",
    name: "Priya Sharma",
    city: "Mumbai • Buyer",
    badge: "PS"
  },
  {
    text: "Earned Rs 3,200 by selling unused Zomato and Amazon coupons. Great platform.",
    name: "Rahul Gupta",
    city: "Delhi • Seller",
    badge: "RG"
  },
  {
    text: "Trustworthy app with verified sellers. Never had issues with fake coupons.",
    name: "Anjali Patel",
    city: "Bangalore • Buyer",
    badge: "AP"
  }
];

const faqs = [
  "Is CouponX legitimate and safe to use?",
  "Can sellers really earn money from unused coupons?",
  "How do I know the coupons are authentic?",
  "What happens if a coupon doesn't work?",
  "How does the coin system work?",
  "Is there a minimum payout for sellers?"
];

const steps = [
  ["List Coupon", "Upload unused coupon details"],
  ["Set Price", "Choose competitive coin price"],
  ["Earn Coins", "Get paid when buyers purchase"]
];

const phoneCoupons = [
  ["amazon", "20% OFF", "Code: AMA120"],
  ["zomato", "20% OFF", "On food orders"],
  ["NETFLIX", "20% OFF", "On all plans"],
  ["Spotify", "3 MONTHS FREE", "Premium account"]
];

const floatingCoupons = [
  { name: "amazon", offer: "20% OFF", code: "Code: AMZ150", tone: "bg-[#fff6ea] border-[#f5e3c5] text-slate-900", position: "left-0 top-8 -rotate-12" },
  { name: "Myntra", offer: "50% OFF", code: "Code: MYN50", tone: "bg-[#fff0f3] border-[#f8dce5] text-[#ef476f]", position: "right-0 top-28 rotate-12" },
  { name: "swiggy", offer: "40% OFF", code: "Code: SWIG40", tone: "bg-[#fff4ea] border-[#ffe0c1] text-[#f97316]", position: "right-8 bottom-24 rotate-[8deg]" },
  { name: "Spotify", offer: "3 MONTHS FREE", code: "Code: SPOT3", tone: "bg-[#eefcf5] border-[#d7f5e4] text-[#10b981]", position: "right-2 bottom-0 -rotate-12" }
];

function SectionHeading({ title, subtitle }) {
  return (
    <div className="text-center">
      <h2 className="text-[2rem] font-black tracking-tight text-slate-950 sm:text-[2.2rem]">{title}</h2>
      {subtitle ? <p className="mt-2 text-sm text-slate-500">{subtitle}</p> : null}
    </div>
  );
}

function FeatureCard({ title, text, icon: Icon }) {
  return (
    <div className="lux-card shine-surface rounded-[24px] border border-emerald-50 bg-white p-6 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-[#16a34a] shadow-[0_10px_24px_rgba(34,197,94,0.16)]">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-lg font-black text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-7 text-slate-500">{text}</p>
    </div>
  );
}

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [monthlySold, setMonthlySold] = useState(50);
  const [activeFlow, setActiveFlow] = useState("buyers");

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const earnings = useMemo(() => monthlySold * 125, [monthlySold]);
  const gatedSellHref = user ? "/sell" : "/register";
  const gatedBuyHref = user ? "/marketplace" : "/login";

  return (
    <div className="bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.07),transparent_20%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.05),transparent_18%),linear-gradient(180deg,#ffffff_0%,#fbfffc_40%,#ffffff_100%)]">
      <section className="mx-auto max-w-7xl px-4 pb-4 pt-8 sm:px-6 lg:pt-10">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <div className="lux-card inline-flex items-center gap-2 rounded-full border border-amber-100 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
              <span className="text-amber-500">★</span>
              India&apos;s #1 Coupon Marketplace
            </div>
            <h1 className="mt-6 text-[3.15rem] font-black leading-[1.02] tracking-tight text-slate-950 sm:text-[4.2rem]">
              Buy Smart,
              <br />
              <span className="text-[#16a34a]">Sell Unused Coupons.</span>
              <br />
              Save More.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-500">
              Join millions of smart buyers and sellers on India&apos;s most trusted platform to save and earn money every day.
            </p>

            <div className="mt-8 rounded-[22px] border border-slate-100 bg-white p-3 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    suppressHydrationWarning
                    placeholder="Search for Amazon, Flipkart, Swiggy..."
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                  />
                </div>
                <button className="inline-flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  All Categories
                  <ChevronDown className="ml-2 h-4 w-4" />
                </button>
                <Link
                  href={gatedBuyHref}
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#16a34a] to-[#22c55e] px-6 py-3 text-sm font-bold text-white shadow-[0_10px_22px_rgba(34,197,94,0.18)]"
                >
                  Search
                </Link>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={gatedBuyHref} className="rounded-xl bg-gradient-to-r from-[#16a34a] to-[#22c55e] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_24px_rgba(34,197,94,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(34,197,94,0.26)]">
                Buy Coupons
              </Link>
              <Link href={gatedSellHref} className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_16px_30px_rgba(15,23,42,0.08)]">
                Sell Coupons
              </Link>
            </div>
          </div>

          <div className="relative min-h-[520px]">
            <div className="hero-phone absolute left-1/2 top-1/2 w-[285px] -translate-x-1/2 -translate-y-1/2 rounded-[42px] border-[8px] border-slate-950 bg-slate-950 p-2 shadow-[0_28px_70px_rgba(15,23,42,0.22)]">
              <div className="rounded-[34px] bg-white p-3">
                <div className="rounded-[28px] bg-gradient-to-br from-[#0f7a45] via-[#16a34a] to-[#22c55e] p-4 text-white">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span>9:41</span>
                    <span>CouponX</span>
                    <span>45</span>
                  </div>
                  <div className="mt-4 rounded-2xl bg-white/12 p-3">
                    <p className="text-xs font-semibold">Regular Brands</p>
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} className="aspect-square rounded-xl bg-white/20" />
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {phoneCoupons.map(([name, offer, code]) => (
                      <div key={name} className="lux-card rounded-2xl bg-white p-3 text-slate-900 shadow-[0_10px_20px_rgba(15,23,42,0.08)]">
                        <p className="text-lg font-black">{name}</p>
                        <p className="mt-2 text-sm font-black text-[#16a34a]">{offer}</p>
                        <p className="mt-2 text-[10px] font-semibold text-slate-400">{code}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {floatingCoupons.map((item) => (
              <div
                key={item.name}
                className={`floating-coupon absolute w-[150px] rounded-[24px] border p-5 shadow-[0_20px_40px_rgba(15,23,42,0.08)] ${item.tone} ${item.position}`}
              >
                <p className="text-2xl font-black">{item.name}</p>
                <p className="mt-3 text-3xl font-black text-slate-950">{item.offer}</p>
                <p className="mt-2 text-xs font-semibold text-slate-400">{item.code}</p>
              </div>
            ))}

            <div className="absolute left-14 top-6 h-4 w-4 rounded-full bg-violet-100" />
            <div className="absolute right-16 top-2 h-10 w-10 rounded-2xl bg-violet-100/70" />
            <div className="absolute left-8 bottom-20 h-8 w-8 rounded-2xl bg-emerald-100/80" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <div className="grid gap-4 rounded-[28px] border border-emerald-50 bg-white p-2 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:grid-cols-4">
          {[
            ["1M+", "Coupons Listed", "text-[#5b3df5]"],
            ["100K+", "Happy Users", "text-slate-950"],
            ["50+", "Categories", "text-slate-950"],
            ["4.9/5", "User Rating", "text-[#f7b731]"]
          ].map(([value, label, tone]) => (
            <div key={label} className="lux-card rounded-[22px] px-5 py-5 text-center">
              <p className={`text-3xl font-black ${tone}`}>{value}</p>
              <p className="mt-2 text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

            <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-slate-900">Popular Brands</p>
          <Link href={user ? "/marketplace" : "/login"} className="text-sm font-bold text-[#16a34a]">
            View All
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-4 gap-3 rounded-[28px] border border-emerald-50 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] sm:grid-cols-8">
          {brands.map((brand) => (
            <div key={brand.name} className="lux-card rounded-[22px] py-3 text-center">
              <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full text-xs font-black shadow-[0_10px_22px_rgba(15,23,42,0.08)] ${brand.tone}`}>
                {brand.mark}
              </div>
              <p className="mt-3 text-xs font-semibold text-slate-600">{brand.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-2 sm:px-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["Verified Coupons", "100% authentic & verified", ShieldCheck, "text-[#22c55e] bg-emerald-50"],
            ["Instant Access", "Get codes immediately", Bolt, "text-[#60a5fa] bg-sky-50"],
            ["Secure Transactions", "Safe & encrypted payments", Lock, "text-[#60a5fa] bg-sky-50"],
            ["24/7 Support", "Always here to help", Headphones, "text-[#818cf8] bg-violet-50"]
          ].map(([title, text, Icon, tone]) => (
            <div key={title} className="lux-card rounded-[24px] border border-emerald-50 bg-white px-5 py-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${tone}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="mt-4 text-sm font-black text-slate-900">{title}</p>
              <p className="mt-1 text-xs text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <SectionHeading title="The Smart Way to Save and Earn" />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="lux-card shine-surface rounded-[28px] bg-[linear-gradient(180deg,#fbfffc_0%,#f6fff8_100%)] p-6 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
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

          <div className="lux-card shine-surface rounded-[28px] bg-[linear-gradient(180deg,#fbfffc_0%,#f6fff8_100%)] p-6 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
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
          {savingTiles.map((item) => <FeatureCard key={item.title} {...item} />)}
        </div>

        <div className="mt-10">
          <p className="text-center text-sm font-bold text-[#6fbe4a]">Featured Brands</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-4">
            {featuredBrands.map((brand) => (
              <div key={brand} className="lux-card rounded-[18px] border border-emerald-50 bg-white px-6 py-4 text-center text-2xl font-black text-slate-800 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl rounded-[32px] bg-[linear-gradient(90deg,#f7fff8_0%,#ffffff_55%,#fbfffc_100%)] px-4 py-6 shadow-[0_20px_46px_rgba(15,23,42,0.05)] sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-4xl font-black tracking-tight text-slate-950">Turn Unused Coupons into Cash</p>
            <p className="mt-2 text-base text-slate-500">Start earning money from your unused deals today</p>
            <div className="mt-8 space-y-8">
              {[
                ["Verify Unused Coupons", "Only list your deals after verification", BadgeCheck],
                ["List in Minutes", "Simple process to upload and sell", FilePlus2],
                ["Earn Coins", "Get paid for every successful sale", Coins],
                ["Build Reputation", "Get rated by buyers and grow trust", Award]
              ].map(([title, text, Icon]) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="mt-1 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-[#16a34a]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900">{title}</p>
                    <p className="mt-1 text-sm leading-7 text-slate-500">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] bg-white p-8 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
            <p className="text-4xl font-black tracking-tight text-slate-950">Earnings Calculator</p>
            <p className="mt-10 text-2xl font-medium text-slate-900">Coupons sold per month:</p>
            <input
              type="range"
              min="1"
              max="100"
              value={monthlySold}
              onChange={(event) => setMonthlySold(Number(event.target.value))}
              className="mt-8 h-2 w-full cursor-pointer appearance-none rounded-full bg-emerald-100 accent-[#16a34a]"
            />
            <p className="mt-5 text-5xl font-black text-[#16a34a]">{monthlySold}</p>

            <div className="mt-14 rounded-[28px] bg-[#f5fff7] px-6 py-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
              <p className="text-2xl font-medium text-slate-500">Potential Monthly Earnings:</p>
              <div className="mt-4 flex items-center justify-center gap-2 text-[#16a34a]">
                <IndianRupee className="h-9 w-9" />
                <span className="text-6xl font-black">{earnings.toLocaleString("en-IN")}</span>
              </div>
              <p className="mt-3 text-xl text-slate-400">*Average coupon value: Rs 125</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <SectionHeading title="How CouponX Works" subtitle="Simple steps to start saving or earning" />
        <div className="mt-5 flex justify-center gap-3">
          <button
            onClick={() => setActiveFlow("buyers")}
            className={`rounded-full px-5 py-2 text-sm font-bold ${activeFlow === "buyers" ? "bg-[#16a34a] text-white" : "border border-emerald-200 text-[#16a34a]"}`}
          >
            For Buyers
          </button>
          <button
            onClick={() => setActiveFlow("sellers")}
            className={`rounded-full px-5 py-2 text-sm font-bold ${activeFlow === "sellers" ? "bg-[#16a34a] text-white" : "border border-emerald-200 text-[#16a34a]"}`}
          >
            For Sellers
          </button>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map(([title, text], index) => (
            <div key={title} className="lux-card relative rounded-[24px] px-4 py-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-200 bg-white text-xl font-black text-[#16a34a] shadow-[0_10px_22px_rgba(15,23,42,0.05)]">
                {index + 1}
              </div>
              <p className="mt-5 text-2xl font-black text-slate-900">{activeFlow === "buyers" ? ["Choose Coupon", "Buy Securely", "Redeem & Save"][index] : title}</p>
              <p className="mt-2 text-sm text-slate-500">{activeFlow === "buyers" ? ["Browse verified deals", "Protected checkout with seller trust", "Get instant coupon delivery"][index] : text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <SectionHeading title="Why Trust CouponX?" subtitle="Built with security and transparency in mind" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {trustTiles.map((item) => <FeatureCard key={item.title} {...item} />)}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <SectionHeading title="What Our Users Say" subtitle="Real experiences from real people" />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {reviews.map((review) => (
            <div key={review.name} className="lux-card shine-surface rounded-[24px] border border-emerald-50 bg-white p-6 shadow-[0_14px_32px_rgba(15,23,42,0.05)]">
              <div className="flex items-center gap-1 text-[#f7b731]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">{review.text}</p>
              <div className="mt-5 flex items-center justify-between">
                <div>
                  <p className="font-black text-slate-900">{review.name}</p>
                  <p className="text-sm text-slate-500">{review.city}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-sm font-black text-emerald-700">
                  {review.badge}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <SectionHeading title="Frequently Asked Questions" subtitle="Get answers to common questions" />
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {faqs.map((faq) => (
            <details key={faq} className="lux-card rounded-[18px] border border-emerald-50 bg-white px-5 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
              <summary className="cursor-pointer list-none text-sm font-bold text-slate-800">{faq}</summary>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                CouponX keeps the process simple with verified sellers, AI-based checks, secure payments, and dispute support.
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl overflow-hidden rounded-[28px] bg-gradient-to-r from-[#14b85f] via-[#11b981] to-[#1f9ed4] px-6 py-8 text-white shadow-[0_18px_42px_rgba(20,184,95,0.2)]">
        <div className="text-center">
          <p className="text-4xl font-black tracking-tight sm:text-5xl">Ready to Start Saving + Earning?</p>
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



