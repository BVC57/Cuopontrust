"use client";

import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { useEffect, useMemo, useState } from "react";
import {
  Award,
  BadgeCheck,
  Bolt,
  CheckCircle2,
  ClipboardList,
  Coins,
  FilePlus2,
  Flame,
  Gift,
  Headphones,
  IndianRupee,
  Lock,
  PartyPopper,
  Send,
  Shield,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
  Tag,
  TrendingUp,
  Trophy,
  UserPlus,
  Users,
  XCircle,
  Wallet
} from "lucide-react";
import { getStoredUser } from "../lib/auth";
import { brandCatalog } from "../lib/brandCatalog";
import { marketingContent } from "../lib/marketingContent";
import { popularCouponCategories } from "../lib/couponCategories";

const featuredBrands = ["amazon", "Flipkart", "zomato", "swiggy"];

const buyerProblems = [
  "Expensive deals everywhere",
  "Fake or expired coupons",
  "Limited discount options",
  "Unreliable sellers"
];

const sellerProblems = [
  "Unused coupons going to waste",
  "No way to monetize deals",
  "Coupons expiring unused",
  "No trusted platform to sell"
];

const buyerSolutions = [
  "Verified authentic coupons only",
  "Save up to 70% on 100+ brands",
  "Instant delivery and secure transactions",
  "Trusted sellers and real savings"
];

const sellerSolutions = [
  "Turn unused coupons into cash",
  "Easy listing in just minutes",
  "Earn monthly from extra deals",
  "Secure payments and withdrawals"
];

const smartHighlights = [
  {
    title: "100% Verified",
    text: "All coupons verified for your safety",
    icon: ShieldCheck,
    tone: "text-[#22c55e] bg-emerald-50"
  },
  {
    title: "Secure & Safe",
    text: "Secure payments and buyer protection",
    icon: Shield,
    tone: "text-[#60a5fa] bg-sky-50"
  },
  {
    title: "24/7 Support",
    text: "We're here to help whenever you need us",
    icon: Headphones,
    tone: "text-[#8b5cf6] bg-emerald-50"
  },
  {
    title: "Trusted Community",
    text: "Thousands of happy buyers & sellers",
    icon: Users,
    tone: "text-[#f59e0b] bg-amber-50"
  }
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

const heroStats = [
  { label: "Registered Users", value: "50,000+", tone: "from-[#f5edff] to-[#ffffff]", accent: "text-[#7c3aed]", icon: Users },
  { label: "Coupons Listed", value: "100,000+", tone: "from-[#edfdf2] to-[#ffffff]", accent: "text-[#16a34a]", icon: Tag },
  { label: "Popular Brands", value: "500+", tone: "from-[#eef4ff] to-[#ffffff]", accent: "text-[#2563eb]", icon: BadgeCheck },
  { label: "User Savings", value: "Rs 1 Cr+", tone: "from-[#fff6e9] to-[#ffffff]", accent: "text-[#ea580c]", icon: IndianRupee }
];

const heroFeatures = [
  { title: "AI-Powered", subtitle: "Verification", icon: ShieldCheck, tone: "bg-[#eefcf5] text-[#16a34a]" },
  { title: "Trust Score", subtitle: "System", icon: BadgeCheck, tone: "bg-[#f4f3ff] text-[#5b3df5]" },
  { title: "Secure Escrow", subtitle: "Payments", icon: Lock, tone: "bg-[#eff6ff] text-[#2563eb]" },
  { title: "Dispute Support", subtitle: "& Protection", icon: Headphones, tone: "bg-[#fff1f2] text-[#ec4899]" },
  { title: "Fast Payouts", subtitle: "For Sellers", icon: Wallet, tone: "bg-[#fff7ed] text-[#ea580c]" }
];


const rewardsOverview = [
  { label: "My Coins", value: "2,450", note: "= Rs 245.00", icon: Coins, tone: "from-amber-50 to-white text-amber-500" },
  { label: "Wallet Balance", value: "Rs 245.00", note: "Withdraw", icon: Wallet, tone: "from-emerald-50 to-white text-emerald-600" },
  { label: "Total Earned", value: "Rs 1,245.00", note: "View history", icon: Gift, tone: "from-emerald-50 to-white text-emerald-600" }
];

const rewardsMissions = [
  ["Login Daily", "+ 10 Coins", "Claim", CheckCircle2, "text-emerald-600 bg-emerald-50"],
  ["Apply a Coupon", "+ 20 Coins", "0/1", Tag, "text-rose-500 bg-rose-50"],
  ["Buy a Coupon", "+ 40 Coins", "0/1", ShoppingCart, "text-amber-500 bg-amber-50"],
  ["Share with Friends", "+ 20 Coins", "0/1", Send, "text-blue-500 bg-blue-50"]
];

const rewardsActivity = [
  ["You earned 50 Coins", "New referral joined", "2h ago", "+50", UserPlus],
  ["You earned 70 Coins", "Referral user bought a coupon", "5h ago", "+70", ShoppingCart],
  ["You earned 20 Coins", "Daily spin reward", "1d ago", "+20", PartyPopper]
];

const rewardsEarnSteps = [
  ["Invite Friends", "Earn 50 Coins for every referral", Users],
  ["Referral Buys Coupon", "Earn 70 Coins when they buy", ShoppingCart],
  ["Daily Spin", "Spin daily to win coupons and coins", PartyPopper],
  ["Complete Missions", "Finish tasks and earn coins", ClipboardList]
];
const homePageStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "CouponX",
      alternateName: "CouponX India",
      url: "https://couponx.in",
      description: marketingContent.heroSubheading,
      inLanguage: "en-IN"
    },
    {
      "@type": "Organization",
      name: "CouponX",
      url: "https://couponx.in",
      description: marketingContent.shortDescription,
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          telephone: "+91-9898394548",
          email: "chauhanbhadresh57@gmail.com",
          areaServed: "IN",
          availableLanguage: ["English", "Hindi", "Gujarati"]
        }
      ],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Vallbhipur",
        addressRegion: "Bhavnagar",
        postalCode: "364310",
        addressCountry: "IN"
      }
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((question) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: {
          "@type": "Answer",
          text: "CouponX helps buyers and sellers with verified coupon listings, secure payments, trust scoring, and dispute support."
        }
      }))
    }
  ]
};

function SectionHeading({ title, subtitle, align = "center" }) {
  const isLeft = align === "left";

  return (
    <div className={isLeft ? "text-left" : "text-center"}>
      <h2 className="app-section-heading font-black text-slate-950">{title}</h2>
      {subtitle ? (
        <p className={isLeft ? "mt-2 max-w-2xl text-sm text-slate-500" : "mt-2 text-sm text-slate-500"}>{subtitle}</p>
      ) : null}
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
  const gatedBuyHref = "/marketplace";

  return (
    <div className="bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.18),transparent_26%),radial-gradient(circle_at_top_right,rgba(124,58,237,0.16),transparent_24%),radial-gradient(circle_at_center_top,rgba(251,191,36,0.12),transparent_18%),linear-gradient(180deg,#f1fff5_0%,#f8fffb_16%,#ffffff_46%,#fbfffc_100%)]">
      <Script
        id="couponx-home-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homePageStructuredData) }}
      />
      <section className="mx-auto max-w-7xl px-4 pb-6 pt-8 sm:px-6 lg:pt-10">
        <div className="overflow-hidden rounded-[38px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.86)_0%,rgba(248,255,251,0.98)_100%)] p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-6">
          <div className="relative rounded-[32px] bg-[radial-gradient(circle_at_left_top,rgba(34,197,94,0.24),transparent_18%),radial-gradient(circle_at_right_top,rgba(124,58,237,0.2),transparent_18%),radial-gradient(circle_at_center_bottom,rgba(59,130,246,0.12),transparent_24%),linear-gradient(180deg,#ffffff_0%,#fafffb_100%)] px-4 py-8 sm:px-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),transparent)]" />
            <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[rgba(34,197,94,0.2)] blur-3xl" />
            <div className="pointer-events-none absolute left-10 top-1/2 h-56 w-56 rounded-full bg-[rgba(52,211,153,0.12)] blur-3xl" />
            <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-[rgba(124,58,237,0.22)] blur-3xl" />
            <div className="pointer-events-none absolute right-12 top-1/3 h-56 w-56 rounded-full bg-[rgba(168,85,247,0.12)] blur-3xl" />
            <div className="pointer-events-none absolute left-1/3 top-4 h-44 w-44 rounded-full bg-[rgba(251,191,36,0.12)] blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-1/2 h-52 w-80 -translate-x-1/2 rounded-full bg-[rgba(59,130,246,0.08)] blur-3xl" />
            <div className="pointer-events-none absolute left-2 top-8 hidden lg:block">
              <div className="relative h-[190px] w-[180px]">
                <div className="absolute left-8 top-14 h-[88px] w-[106px] rounded-b-[26px] rounded-t-[14px] bg-[#22c55e] shadow-[0_18px_28px_rgba(34,197,94,0.22)]" />
                <div className="absolute left-14 top-4 h-[52px] w-[92px] rounded-[18px] border-[8px] border-[#15803d] border-b-0" />
                <div className="absolute left-3 top-10 rotate-[-18deg] rounded-[16px] bg-[#facc15] px-3 py-4 text-sm font-black text-white shadow-[0_12px_26px_rgba(250,204,21,0.28)]">COUPON</div>
                <div className="absolute left-14 top-14 rotate-[12deg] rounded-[18px] bg-[#fb923c] px-4 py-5 text-sm font-black text-white shadow-[0_14px_28px_rgba(251,146,60,0.25)]">OFF</div>
                <div className="absolute left-24 top-18 rotate-[10deg] rounded-[18px] bg-[#7c3aed] px-4 py-6 text-sm font-black text-white shadow-[0_16px_30px_rgba(124,58,237,0.3)]">COUPON</div>
                <div className="absolute left-0 top-6 h-8 w-8 rounded-full bg-[#fde68a] shadow-[0_10px_18px_rgba(251,191,36,0.24)]" />
                <div className="absolute left-28 top-0 h-8 w-8 rounded-full bg-[#fde68a] shadow-[0_10px_18px_rgba(251,191,36,0.24)]" />
              </div>
            </div>

            <div className="pointer-events-none absolute right-2 top-4 hidden lg:block">
              <div className="relative h-[210px] w-[220px]">
                <div className="absolute right-10 top-8 h-[130px] w-[120px] rounded-[26px] bg-[linear-gradient(180deg,#7c3aed_0%,#5b21b6_100%)] shadow-[0_22px_36px_rgba(91,33,182,0.28)]" />
                <div className="absolute right-0 top-16 h-[84px] w-[96px] rounded-[22px] bg-[linear-gradient(180deg,#8b5cf6_0%,#6d28d9_100%)] shadow-[0_18px_30px_rgba(109,40,217,0.24)]" />
                <div className="absolute right-28 top-18 h-[102px] w-[22px] rounded-full bg-[#4ade80]" />
                <div className="absolute right-56 top-34 rotate-[-42deg] rounded-[14px] bg-[#fb7185] px-2 py-3 text-xs font-black text-white">COUPON</div>
                <div className="absolute right-18 top-0 h-10 w-10 rounded-full bg-[#fcd34d] shadow-[0_10px_18px_rgba(251,191,36,0.24)]" />
                <div className="absolute right-52 top-42 h-10 w-10 rounded-full bg-[#fcd34d] shadow-[0_10px_18px_rgba(251,191,36,0.24)]" />
              </div>
            </div>

            <div className="mx-auto max-w-4xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-slate-700 shadow-[0_12px_24px_rgba(15,23,42,0.05)]">
                <Bolt className="h-4 w-4 text-orange-500" />
                India&apos;s 1st Coupon Buy &amp; Sell Platform
              </div>

              <h1 className="app-main-heading mt-5 font-black text-slate-950">
                Trusted by Thousands,
                <br />
                Loved for Real <span className="bg-[linear-gradient(90deg,#5b3df5_0%,#7c5cff_100%)] bg-clip-text text-transparent">Savings</span>
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-500">
                Join our growing community of smart buyers and trusted sellers who are saving more and earning more every day.
              </p>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                {[
                  ["100% Verified", "Authentic Coupons", ShieldCheck, "bg-[#eefcf5] text-[#16a34a]"],
                  ["Secure Payments", "Safe & Protected", Lock, "bg-[#f1efff] text-[#5b3df5]"],
                  ["Trusted Community", "Real Buyers & Sellers", BadgeCheck, "bg-[#fff7ed] text-[#f97316]"],
                  ["24/7 Support", "We're Here For You", Headphones, "bg-[#fff1f7] text-[#ec4899]"]
                ].map(([title, subtitle, Icon, tone]) => (
                  <div key={title} className="inline-flex items-center gap-3 rounded-full border border-white bg-white px-4 py-3 text-left shadow-[0_12px_24px_rgba(15,23,42,0.05)]">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${tone}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{title}</p>
                      <p className="text-xs font-medium text-slate-500">{subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Link href={gatedBuyHref} className="inline-flex rounded-2xl bg-gradient-to-r from-[#16a34a] to-[#22c55e] px-6 py-3.5 text-sm font-bold text-white shadow-[0_14px_28px_rgba(34,197,94,0.2)] transition hover:-translate-y-0.5">
                  Buy Coupons
                </Link>
                <Link href="/sell" className="inline-flex rounded-2xl border border-emerald-200 bg-white px-6 py-3.5 text-sm font-bold text-[#16a34a] shadow-[0_12px_24px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5">
                  Sell Coupons
                </Link>
              </div>
            </div>

            <div className="mt-9 grid gap-4 lg:grid-cols-4">
              {heroStats.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className={`rounded-[28px] border border-white bg-gradient-to-br ${item.tone} p-6 shadow-[0_16px_30px_rgba(15,23,42,0.06)]`}>
                    <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 ${item.accent} shadow-[0_10px_22px_rgba(15,23,42,0.06)]`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <p className={`mt-5 text-4xl font-black ${item.accent}`}>{item.value}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-600">{item.label}</p>
                    <div className="mt-6 h-6 w-full rounded-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.15)_0%,transparent_62%)]" />
                  </div>
                );
              })}
            </div>

            <div className="mt-5 rounded-[30px] border border-white bg-white p-5 shadow-[0_16px_30px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-[#16a34a]">
                    <Star className="h-4 w-4" />
                  </div>
                  <p className="text-xl font-black text-slate-900">Popular Brands</p>
                </div>
                <Link href="/categories" className="text-sm font-black text-[#16a34a]">
                  View All Brands
                </Link>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                {brandCatalog.map((brand) => (
                  <div
                    key={brand.key}
                    className="group rounded-[22px] border border-slate-100 bg-white px-3 py-4 text-center shadow-[0_10px_22px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(15,23,42,0.08)]"
                  >
                    <div className="mx-auto flex h-24 w-full items-center justify-center rounded-[18px] bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] transition duration-300 group-hover:scale-[1.06]">
                      <Image
                        src={brand.logoPath}
                        alt={brand.label}
                        width={110}
                        height={54}
                        className="h-12 w-[80%] object-contain transition duration-300 group-hover:scale-110"
                      />
                    </div>
                    <p className="mt-3 text-xs font-bold text-slate-600">{brand.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {heroFeatures.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="inline-flex items-center gap-3 rounded-full bg-white px-4 py-3 shadow-[0_10px_22px_rgba(15,23,42,0.05)]">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${item.tone}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black text-slate-900">{item.title}</p>
                      <p className="text-xs font-medium text-slate-500">{item.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
           

      <section className="mx-auto max-w-7xl px-4 py-2 sm:px-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["Verified Coupons", "100% authentic & verified", ShieldCheck, "text-[#22c55e] bg-emerald-50"],
            ["Instant Access", "Get codes immediately", Bolt, "text-[#60a5fa] bg-sky-50"],
            ["Secure Transactions", "Safe & encrypted payments", Lock, "text-[#60a5fa] bg-sky-50"],
            ["24/7 Support", "Always here to help", Headphones, "text-[#818cf8] bg-emerald-50"]
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
        <div className="relative overflow-hidden rounded-[38px] border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.08),transparent_24%),radial-gradient(circle_at_top_right,rgba(139,92,246,0.08),transparent_22%),linear-gradient(180deg,#ffffff_0%,#fbfffd_100%)] px-5 py-10 shadow-[0_24px_70px_rgba(15,23,42,0.06)] sm:px-8 lg:px-10">
          <div className="pointer-events-none absolute -left-16 top-10 h-48 w-48 rounded-full bg-[rgba(34,197,94,0.12)] blur-3xl" />
          <div className="pointer-events-none absolute -right-16 top-10 h-48 w-48 rounded-full bg-[rgba(124,58,237,0.12)] blur-3xl" />

          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-[linear-gradient(180deg,#f5fff8_0%,#ffffff_100%)] px-4 py-2 text-sm font-black text-[#16a34a] shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
              <Star className="h-4 w-4 fill-[#fbbf24] text-[#fbbf24]" />
              Smart Savings, Real Earnings
            </div>

            <h2 className="app-main-heading mt-6 font-black text-slate-950">
              The Smart Way to <span className="relative inline-block text-[#16a34a]">Save
                <span className="absolute left-0 right-0 top-[92%] h-3 rounded-full bg-[linear-gradient(90deg,rgba(34,197,94,0.2),rgba(34,197,94,0.45),rgba(34,197,94,0.18))]" />
              </span>{" "}
              and <span className="relative inline-block bg-[linear-gradient(90deg,#7c3aed_0%,#8b5cf6_100%)] bg-clip-text text-transparent">Earn
                <span className="absolute left-0 right-0 top-[92%] h-3 rounded-full bg-[linear-gradient(90deg,rgba(139,92,246,0.18),rgba(124,58,237,0.42),rgba(139,92,246,0.18))]" />
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-500 sm:text-lg">
              Whether you&apos;re looking to save on your favorite brands or turn unused coupons into real money, CouponX makes it simple, secure, and rewarding.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[34px] border border-emerald-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfffc_100%)] p-5 shadow-[0_18px_40px_rgba(34,197,94,0.08)] sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className="flex h-32 w-32 items-center justify-center rounded-[32px] bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.22),transparent_40%),linear-gradient(180deg,#f2fff6_0%,#ffffff_100%)] shadow-[0_18px_32px_rgba(34,197,94,0.12)]">
                  <div className="flex h-20 w-20 items-center justify-center rounded-[26px] bg-[linear-gradient(180deg,#4ade80_0%,#16a34a_100%)] text-white shadow-[0_18px_28px_rgba(34,197,94,0.24)]">
                    <ShoppingBag className="h-10 w-10" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="inline-flex rounded-full bg-[linear-gradient(180deg,#edfdf2_0%,#ffffff_100%)] px-4 py-2 text-sm font-black text-[#15803d]">
                    For Smart Buyers
                  </div>
                  <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-950 sm:text-[2.35rem] sm:leading-[1.08]">
                    Save More,
                    <br />
                    Spend Smarter
                  </h3>
                  <div className="mt-4 h-1 w-16 rounded-full bg-[linear-gradient(90deg,#86efac_0%,#22c55e_100%)]" />
                </div>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] lg:items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <XCircle className="h-6 w-6 text-[#ef4444]" />
                    <p className="text-xl font-black text-[#ef4444]">Problems You Face</p>
                  </div>
                  <ul className="mt-6 space-y-4">
                    {buyerProblems.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-lg text-slate-700">
                        <span className="mt-1 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-rose-50 text-[#ef4444]">
                          <XCircle className="h-4 w-4" />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="hidden h-full bg-[linear-gradient(180deg,transparent_0%,rgba(203,213,225,0.9)_8%,rgba(203,213,225,0.9)_92%,transparent_100%)] lg:block" />

                <div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-[#16a34a]" />
                    <p className="text-xl font-black text-[#16a34a]">CouponX Solution</p>
                  </div>
                  <ul className="mt-6 space-y-4">
                    {buyerSolutions.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-lg text-slate-700">
                        <span className="mt-1 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-emerald-50 text-[#16a34a]">
                          <CheckCircle2 className="h-4 w-4" />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 flex flex-col items-center justify-between gap-5 rounded-[28px] bg-[linear-gradient(90deg,#effdf5_0%,#f8fff9_60%,#edfdf2_100%)] px-6 py-6 sm:flex-row">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-[linear-gradient(180deg,#22c55e_0%,#15803d_100%)] text-white shadow-[0_16px_28px_rgba(34,197,94,0.2)]">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <p className="text-xl font-black leading-8 text-slate-900">
                    Verified deals. Real savings.
                    <br />
                    Better shopping experience.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rotate-[-18deg] rounded-[18px] bg-[linear-gradient(180deg,#86efac_0%,#22c55e_100%)] px-5 py-4 text-white shadow-[0_14px_24px_rgba(34,197,94,0.18)]">
                    <Tag className="h-8 w-8" />
                  </div>
                  <div className="rotate-[10deg] rounded-[18px] bg-[linear-gradient(180deg,#dcfce7_0%,#fefce8_100%)] px-5 py-4 text-[#16a34a] shadow-[0_14px_24px_rgba(34,197,94,0.1)]">
                    <BadgeCheck className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[34px] border border-emerald-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fcfbff_100%)] p-5 shadow-[0_18px_40px_rgba(124,58,237,0.08)] sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className="flex h-32 w-32 items-center justify-center rounded-[32px] bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.22),transparent_40%),linear-gradient(180deg,#faf5ff_0%,#ffffff_100%)] shadow-[0_18px_32px_rgba(124,58,237,0.12)]">
                  <div className="flex h-20 w-20 items-center justify-center rounded-[26px] bg-[linear-gradient(180deg,#8b5cf6_0%,#6d28d9_100%)] text-white shadow-[0_18px_28px_rgba(124,58,237,0.24)]">
                    <Wallet className="h-10 w-10" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="inline-flex rounded-full bg-[linear-gradient(180deg,#f5f3ff_0%,#ffffff_100%)] px-4 py-2 text-sm font-black text-[#6d28d9]">
                    For Smart Sellers
                  </div>
                  <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-950 sm:text-[2.35rem] sm:leading-[1.08]">
                    Turn Unused Coupons
                    <br />
                    Into Real Cash
                  </h3>
                  <div className="mt-4 h-1 w-16 rounded-full bg-[linear-gradient(90deg,#a78bfa_0%,#7c3aed_100%)]" />
                </div>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] lg:items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <XCircle className="h-6 w-6 text-[#ef4444]" />
                    <p className="text-xl font-black text-[#ef4444]">Problems You Face</p>
                  </div>
                  <ul className="mt-6 space-y-4">
                    {sellerProblems.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-lg text-slate-700">
                        <span className="mt-1 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-rose-50 text-[#ef4444]">
                          <XCircle className="h-4 w-4" />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="hidden h-full bg-[linear-gradient(180deg,transparent_0%,rgba(221,214,254,0.95)_8%,rgba(221,214,254,0.95)_92%,transparent_100%)] lg:block" />

                <div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-[#7c3aed]" />
                    <p className="text-xl font-black text-[#7c3aed]">CouponX Solution</p>
                  </div>
                  <ul className="mt-6 space-y-4">
                    {sellerSolutions.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-lg text-slate-700">
                        <span className="mt-1 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-emerald-50 text-[#7c3aed]">
                          <CheckCircle2 className="h-4 w-4" />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 flex flex-col items-center justify-between gap-5 rounded-[28px] bg-[linear-gradient(90deg,#f6f3ff_0%,#fbf9ff_60%,#f5f3ff_100%)] px-6 py-6 sm:flex-row">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-[linear-gradient(180deg,#7c3aed_0%,#5b21b6_100%)] text-white shadow-[0_16px_28px_rgba(124,58,237,0.2)]">
                    <TrendingUp className="h-8 w-8" />
                  </div>
                  <p className="text-xl font-black leading-8 text-slate-900">
                    List once. Earn more.
                    <br />
                    Make every coupon count.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[#7c3aed]">
                  <div className="rounded-full bg-white p-4 shadow-[0_14px_24px_rgba(124,58,237,0.12)]">
                    <Coins className="h-8 w-8" />
                  </div>
                  <div className="rounded-full bg-[linear-gradient(180deg,#c4b5fd_0%,#8b5cf6_100%)] p-4 text-white shadow-[0_14px_24px_rgba(124,58,237,0.18)]">
                    <Wallet className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 rounded-[30px] border border-white/80 bg-white/90 p-4 shadow-[0_18px_36px_rgba(15,23,42,0.05)] md:grid-cols-2 xl:grid-cols-4 xl:divide-x xl:divide-slate-100">
            {smartHighlights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-start gap-4 rounded-[22px] px-4 py-4 xl:px-6">
                  <div className={`flex h-14 w-14 flex-none items-center justify-center rounded-full ${item.tone}`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-2xl font-black tracking-tight text-slate-950">{item.title}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-500">{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <SectionHeading title={marketingContent.whyTrustTitle} subtitle={marketingContent.shortDescription} />
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
      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#022c22_0%,#064e3b_55%,#022c22_100%)] p-4 shadow-[0_30px_80px_rgba(15,23,42,0.16)] sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div className="px-2 py-2 text-white sm:px-4">
              <p className="text-sm font-semibold text-white/85">Welcome back</p>
              <h2 className="mt-2 max-w-xl text-4xl font-black tracking-tight sm:text-5xl sm:leading-[1.04]">
                Earn <span className="text-[#fde047]">Coins.</span> Get Rewards!
              </h2>
              <p className="mt-4 max-w-lg text-base leading-7 text-white/78">
                Use coupons, invite friends, finish missions, and convert every reward into real wallet value.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/rewards" className="inline-flex items-center gap-2 rounded-2xl bg-[#22c55e] px-5 py-3 text-sm font-black text-white shadow-[0_16px_30px_rgba(34,197,94,0.25)] transition hover:-translate-y-0.5">
                  <Gift className="h-4 w-4" />
                  Open Rewards
                </Link>
                <Link href="/referrals" className="inline-flex items-center gap-2 rounded-2xl border border-white/18 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/16">
                  <UserPlus className="h-4 w-4" />
                  Invite Friends
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {rewardsOverview.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className={`rounded-[22px] border border-white/80 bg-gradient-to-br ${item.tone} p-4 shadow-[0_18px_36px_rgba(15,23,42,0.12)]`}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_12px_24px_rgba(15,23,42,0.08)]">
                        <Icon className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-600">{item.label}</p>
                        <p className="mt-1 text-2xl font-black tracking-tight text-slate-950">{item.value}</p>
                        <p className="mt-1 text-xs font-black text-emerald-600">{item.note}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_300px]">
            <div className="overflow-hidden rounded-[26px] border border-emerald-400/45 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.42),transparent_36%),linear-gradient(90deg,rgba(2,44,34,0.9)_0%,rgba(6,78,59,0.9)_100%)] p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] sm:p-6">
              <div className="grid gap-6 lg:grid-cols-[0.82fr_1fr_0.78fr] lg:items-center">
                <div>
                  <h3 className="text-2xl font-black">Collect Coins &amp; Get Real Money</h3>
                  <div className="mt-5 space-y-3 text-sm font-bold text-white/90">
                    <div className="flex items-center gap-3"><Coins className="h-8 w-8 rounded-full bg-amber-400 p-1.5 text-white" />Earn Coins</div>
                    <div className="flex items-center gap-3"><Tag className="h-8 w-8 rounded-full bg-orange-500 p-1.5 text-white" />Use Coupons</div>
                    <div className="flex items-center gap-3"><IndianRupee className="h-8 w-8 rounded-full bg-emerald-500 p-1.5 text-white" />Get Money</div>
                  </div>
                </div>

                <div className="relative mx-auto h-[220px] w-full max-w-[420px]">
                  <div className="absolute left-1/2 top-8 h-24 w-52 -translate-x-1/2 rotate-[-8deg] rounded-[26px] bg-[linear-gradient(180deg,#6ee7b7,#059669)] shadow-[0_22px_45px_rgba(0,0,0,0.28)]" />
                  <div className="absolute left-1/2 top-20 h-28 w-64 -translate-x-1/2 rounded-b-[36px] rounded-t-[18px] bg-[linear-gradient(180deg,#34d399,#047857)] shadow-[0_28px_50px_rgba(0,0,0,0.34)]" />
                  {[0, 1, 2, 3, 4, 5, 6].map((coin) => (
                    <div key={coin} className="absolute h-12 w-12 rounded-full border-4 border-amber-200 bg-[radial-gradient(circle_at_35%_28%,#fde68a,#f59e0b_72%)] text-center text-xl font-black leading-10 text-white shadow-[0_10px_18px_rgba(245,158,11,0.28)]" style={{ left: `${88 + coin * 30}px`, top: `${74 + (coin % 3) * 18}px` }}>
                      $
                    </div>
                  ))}
                  <div className="absolute right-2 top-48 hidden rotate-[-8deg] rounded-[22px] bg-white px-8 py-5 text-center text-2xl font-black text-[#064e3b] shadow-[0_20px_36px_rgba(0,0,0,0.18)] sm:block">
                    More Coins<br />More Rewards!
                  </div>
                </div>

                <div className="rounded-[22px] border border-white/15 bg-white p-5 text-slate-950 shadow-[0_18px_34px_rgba(0,0,0,0.18)]">
                  <p className="text-3xl font-black text-[#22c55e]">500 Coins = Rs 50</p>
                  <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">Redeem your coins and transfer value to your wallet or bank.</p>
                  <div className="mt-5 flex items-center justify-between text-emerald-500">
                    <Coins className="h-14 w-14 rounded-full bg-amber-100 p-2 text-amber-500" />
                    <TrendingUp className="h-10 w-10" />
                    <IndianRupee className="h-14 w-14 rounded-2xl bg-emerald-100 p-3 text-emerald-600" />
                  </div>
                  <Link href="/wallet" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#22c55e] px-4 py-3 text-sm font-black text-white shadow-[0_14px_28px_rgba(34,197,94,0.2)]">
                    <Gift className="h-4 w-4" />
                    Redeem Now
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[24px] border border-orange-100 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.06)]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Flame className="h-9 w-9 rounded-full bg-orange-50 p-1.5 text-orange-500" />
                    <div>
                      <p className="text-lg font-black text-slate-950">Daily Streak</p>
                      <p className="text-xs font-semibold text-slate-500">Keep it up!</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-slate-700">7 Days</span>
                </div>
                <div className="mt-5 grid grid-cols-7 gap-2 text-center text-xs font-black text-slate-500">
                  {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                    <div key={`${day}-${index}`}>
                      <p>{day}</p>
                      <div className={`mt-2 flex h-7 w-7 items-center justify-center rounded-full text-white ${index === 6 ? "bg-amber-400" : "bg-orange-400"}`}>
                        {index === 6 ? <Star className="h-4 w-4 fill-white" /> : <CheckCircle2 className="h-4 w-4" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#065f46,#10b981)] p-5 text-white shadow-[0_18px_36px_rgba(6,95,70,0.22)]">
                <div className="absolute right-4 top-5 text-amber-300 opacity-90"><Trophy className="h-24 w-24" /></div>
                <p className="max-w-[190px] text-xl font-black leading-tight">Complete missions, Earn more coins!</p>
                <Link href="/missions" className="mt-6 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-black text-[#047857]">Explore Missions</Link>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_0.95fr_0.95fr]">
            <div className="rounded-[26px] border border-emerald-100 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-4">
                <Users className="h-12 w-12 rounded-2xl bg-emerald-100 p-2.5 text-emerald-600" />
                <div>
                  <p className="text-xl font-black text-slate-950">Referral Rewards</p>
                  <p className="text-sm text-slate-500">Invite friends and earn coins</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-[18px] border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-3"><UserPlus className="h-10 w-10 rounded-full bg-emerald-100 p-2 text-emerald-600" /><div><p className="font-black text-slate-950">Every Referral</p><p className="text-xs text-slate-500">Earn</p></div></div>
                  <p className="font-black text-emerald-600">50 Coins</p>
                </div>
                <div className="flex items-center justify-between rounded-[18px] border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-3"><ShoppingCart className="h-10 w-10 rounded-full bg-emerald-100 p-2 text-emerald-600" /><div><p className="font-black text-slate-950">Referral User Buys Coupon</p><p className="text-xs text-slate-500">Earn</p></div></div>
                  <p className="font-black text-emerald-600">70 Coins</p>
                </div>
              </div>
              <Link href="/referrals" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white">
                <Send className="h-4 w-4" />
                Invite Friends
              </Link>
            </div>

            <div className="rounded-[26px] border border-blue-100 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-4">
                <PartyPopper className="h-12 w-12 rounded-2xl bg-blue-100 p-2.5 text-blue-600" />
                <div>
                  <p className="text-xl font-black text-slate-950">Daily Spin</p>
                  <p className="text-sm text-slate-500">Spin daily and win coupons</p>
                </div>
              </div>
              <div className="relative mx-auto mt-5 h-64 w-64 rounded-full border-[10px] border-amber-200 bg-[conic-gradient(from_-90deg,#7c3aed_0deg_60deg,#22c55e_60deg_120deg,#f59e0b_120deg_180deg,#0ea5e9_180deg_240deg,#ef4444_240deg_300deg,#14b8a6_300deg_360deg)] shadow-[0_18px_34px_rgba(15,23,42,0.12)]">
                <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-amber-200 bg-amber-400 text-xl font-black text-white shadow-[0_12px_24px_rgba(245,158,11,0.28)]">SPIN</div>
                <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-700">Coupon</div>
                <div className="absolute right-5 top-1/2 rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-700">100</div>
                <div className="absolute bottom-5 left-9 rounded-full bg-white px-3 py-1 text-xs font-black text-rose-600">Bonus</div>
              </div>
              <Link href="/rewards" className="mt-5 inline-flex w-full justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white">Spin Now</Link>
            </div>

            <div className="rounded-[26px] border border-emerald-100 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-4">
                <ClipboardList className="h-12 w-12 rounded-2xl bg-emerald-100 p-2.5 text-emerald-600" />
                <div>
                  <p className="text-xl font-black text-slate-950">Missions</p>
                  <p className="text-sm text-slate-500">Complete missions and earn coins</p>
                </div>
              </div>
              <div className="mt-5 divide-y divide-slate-100 rounded-[18px] border border-slate-100">
                {rewardsMissions.map(([title, coins, status, Icon, tone]) => (
                  <div key={title} className="flex items-center justify-between gap-3 p-3">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-9 w-9 rounded-full p-2 ${tone}`} />
                      <div><p className="text-sm font-black text-slate-950">{title}</p><p className="text-xs font-black text-emerald-600">{coins}</p></div>
                    </div>
                    <span className={`rounded-lg px-3 py-1 text-xs font-black ${status === "Claim" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}>{status}</span>
                  </div>
                ))}
              </div>
              <Link href="/missions" className="mt-5 inline-flex w-full justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white">View All Missions</Link>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.9fr]">
            <div className="rounded-[26px] border border-slate-100 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.06)]">
              <p className="text-xl font-black text-slate-950">How to Earn More Coins</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-4">
                {rewardsEarnSteps.map(([title, text, Icon]) => (
                  <div key={title} className="text-center">
                    <Icon className="mx-auto h-14 w-14 rounded-full bg-emerald-100 p-3 text-emerald-600" />
                    <p className="mt-3 text-sm font-black text-slate-950">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[26px] border border-slate-100 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.06)]">
              <p className="text-xl font-black text-slate-950">Recent Activity</p>
              <div className="mt-4 divide-y divide-slate-100">
                {rewardsActivity.map(([title, text, time, coins, Icon]) => (
                  <div key={title} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-3">
                      <Icon className="h-10 w-10 rounded-full bg-emerald-100 p-2 text-emerald-600" />
                      <div><p className="text-sm font-black text-slate-950">{title}</p><p className="text-xs text-slate-500">{text}</p></div>
                    </div>
                    <div className="text-right"><p className="text-xs text-slate-500">{time}</p><p className="font-black text-emerald-600">{coins}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 rounded-[22px] border border-white/80 bg-white/95 p-4 shadow-[0_18px_36px_rgba(15,23,42,0.06)] md:grid-cols-[1fr_auto_auto_auto] md:items-center">
            <div className="flex items-center gap-4">
              <Gift className="h-12 w-12 rounded-2xl bg-emerald-100 p-2.5 text-emerald-600" />
              <div>
                <p className="text-lg font-black text-emerald-600">The more you earn, the more you save!</p>
                <p className="text-sm text-slate-500">Keep earning coins and enjoy amazing rewards.</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 px-6 py-3 text-sm font-black text-slate-950">2,450 Coins</div>
            <div className="rounded-xl border border-emerald-100 px-6 py-3 text-sm font-black text-emerald-600">Rs 245.00 Value</div>
            <Link href="/wallet" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-black text-white">
              <Gift className="h-4 w-4" />
              Redeem Now
            </Link>
          </div>
        </div>
      </section>
      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-4">
          <SectionHeading title="Most Popular Categories" subtitle="Browse the categories people explore most on CouponX." />
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {popularCouponCategories.map((category, index) => (
            <Link
              key={category.slug}
              href={`/marketplace?category=${encodeURIComponent(category.name)}`}
              className="group overflow-hidden rounded-[30px] border border-emerald-100/70 bg-white shadow-[0_18px_34px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1.5 hover:border-emerald-200 hover:shadow-[0_24px_42px_rgba(22,163,74,0.12)]"
            >
              <div className="bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.16),transparent_36%),linear-gradient(135deg,#f7fff9_0%,#ffffff_72%)] p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#16a34a] shadow-[0_12px_24px_rgba(34,197,94,0.16)] transition duration-300 group-hover:scale-110">
                    <Tag className="h-6 w-6" />
                  </div>
                  <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-emerald-700">
                    Top {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="mt-5 text-[1.75rem] font-black leading-tight tracking-[-0.03em] text-slate-950">{category.name}</h3>
                <p className="mt-3 min-h-[84px] text-sm leading-7 text-slate-500">{category.description}</p>
              </div>

              <div className="border-t border-emerald-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfffc_100%)] px-6 py-5">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Featured Brands</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {category.examples.slice(0, 3).map((example) => (
                    <span
                      key={example}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-700"
                    >
                      {example}
                    </span>
                  ))}
                </div>

                <div className="mt-5 inline-flex items-center text-sm font-black text-[#16a34a]">
                  Explore category
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link href="/categories" className="inline-flex rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-sm font-black text-[#16a34a] shadow-[0_12px_24px_rgba(15,23,42,0.05)]">
            View All Categories
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl rounded-[32px] bg-[linear-gradient(90deg,#f7fff8_0%,#ffffff_55%,#fbfffc_100%)] px-4 py-6 shadow-[0_20px_46px_rgba(15,23,42,0.05)] sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-4xl font-black tracking-tight text-slate-950">{marketingContent.sellerHeadline}</p>
            <p className="mt-2 max-w-xl text-base text-slate-500">{marketingContent.sellerDescription}</p>
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
        <SectionHeading title={marketingContent.whyTrustTitle} subtitle="Built for secure buyer and seller transactions with verification, trust scoring, and dispute support." />
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
          <p className="text-4xl font-black tracking-tight sm:text-5xl">{marketingContent.footerTagline}</p>
          <p className="mt-3 max-w-3xl text-sm text-emerald-50">{marketingContent.mission}</p>
          <a
            href="https://expo.dev/accounts/bvc57/projects/couponx-mobile/builds/baeb8787-f15b-45f9-a1e3-d6d7e5768615"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex rounded-2xl bg-white px-6 py-3 text-sm font-black text-slate-900 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-slate-100"
          >
            Get it on Google Play
          </a>
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
