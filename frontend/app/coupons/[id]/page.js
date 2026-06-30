"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Copy,
  CreditCard,
  Heart,
  LockKeyhole,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  ShieldCheck,
  Share2,
  ShoppingCart,
  Sparkles,
  Star,
  Truck,
  Users
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api, { extractError, resolveUploadUrl } from "../../../lib/api";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { getStoredUser, isAuthenticated } from "../../../lib/auth";
import { formatDate, formatMoney } from "../../../lib/format";
import { resolveBrand } from "../../../lib/brandCatalog";
import { openRazorpayCheckout } from "../../../lib/razorpay";

const parseTerms = (value = "") =>
  String(value || "")
    .split(/\r?\n|\u2022|(?<=\.)\s+/)
    .map((item) => item.trim())
    .filter(Boolean);

const toTitleCase = (value = "") =>
  String(value || "")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const buildRedeemSteps = (platformName) => [
  'Click on the "Unlock & Buy" button above.',
  "Complete the payment to reveal the coupon code.",
  `Copy the coupon code and visit ${platformName}.`,
  "Add eligible products to your cart.",
  "Apply the coupon code at checkout.",
  "Complete your prepaid payment to get the discount."
];

const buildSupportData = (platformName) => ({
  email: `support@${String(platformName || "couponx").toLowerCase().replace(/\s+/g, "")}.in`,
  phone: "1800-3000-9000"
});

const brandThemes = {
  amazon: { accent: "#f59e0b", accentSoft: "#fff7e6", accentBorder: "#f8dfb0", accentText: "#b45309", buttonStart: "#f59e0b", buttonEnd: "#fbbf24", glow: "rgba(245,158,11,0.18)" },
  flipkart: { accent: "#2563eb", accentSoft: "#eff6ff", accentBorder: "#bfdbfe", accentText: "#1d4ed8", buttonStart: "#2563eb", buttonEnd: "#3b82f6", glow: "rgba(37,99,235,0.18)" },
  myntra: { accent: "#ec4899", accentSoft: "#fdf2f8", accentBorder: "#fbcfe8", accentText: "#db2777", buttonStart: "#ec4899", buttonEnd: "#f43f5e", glow: "rgba(236,72,153,0.18)" },
  mcdonalds: { accent: "#db0007", accentSoft: "#fff7ed", accentBorder: "#fdba74", accentText: "#b45309", buttonStart: "#db0007", buttonEnd: "#f59e0b", glow: "rgba(219,0,7,0.16)" },
  zomato: { accent: "#ef4444", accentSoft: "#fff1f2", accentBorder: "#fecdd3", accentText: "#dc2626", buttonStart: "#ef4444", buttonEnd: "#f97316", glow: "rgba(239,68,68,0.18)" },
  swiggy: { accent: "#f97316", accentSoft: "#fff7ed", accentBorder: "#fed7aa", accentText: "#ea580c", buttonStart: "#f97316", buttonEnd: "#fb923c", glow: "rgba(249,115,22,0.18)" },
  netflix: { accent: "#e11d48", accentSoft: "#fff1f2", accentBorder: "#fecdd3", accentText: "#be123c", buttonStart: "#e11d48", buttonEnd: "#fb7185", glow: "rgba(225,29,72,0.18)" },
  spotify: { accent: "#16a34a", accentSoft: "#f0fdf4", accentBorder: "#bbf7d0", accentText: "#15803d", buttonStart: "#16a34a", buttonEnd: "#22c55e", glow: "rgba(22,163,74,0.18)" },
  playstation: { accent: "#4338ca", accentSoft: "#eef2ff", accentBorder: "#c7d2fe", accentText: "#3730a3", buttonStart: "#4338ca", buttonEnd: "#6366f1", glow: "rgba(67,56,202,0.18)" },
  default: { accent: "#16a34a", accentSoft: "#f0fdf4", accentBorder: "#bbf7d0", accentText: "#15803d", buttonStart: "#16a34a", buttonEnd: "#22c55e", glow: "rgba(22,163,74,0.18)" }
};

export default function CouponDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [buying, setBuying] = useState(false);
  const [revealedCoupon, setRevealedCoupon] = useState(null);
  const [ownedCoupon, setOwnedCoupon] = useState(false);
  const [purchaseTransactionId, setPurchaseTransactionId] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [heroImageFailed, setHeroImageFailed] = useState(false);
  const [rewardSummary, setRewardSummary] = useState(null);

  useEffect(() => {
    const loadCoupon = async () => {
      try {
        const loggedInNow = isAuthenticated();
        setLoggedIn(loggedInNow);
        setHeroImageFailed(false);

        const { data } = await api.get(`/coupons/${params.id}`);
        setCoupon(data.coupon);

        if (loggedInNow) {
          const [purchasedResponse, rewardResponse] = await Promise.all([api.get("/coupons/my/purchased"), api.get("/rewards/summary").catch(() => null)]);
          setRewardSummary(rewardResponse?.data || null);
          const purchasedCoupon = (purchasedResponse.data.coupons || []).find((item) => item._id === data.coupon._id);

          if (purchasedCoupon) {
            setOwnedCoupon(true);
            setPurchaseTransactionId(purchasedCoupon.transactionId || "");
            setFeedbackStatus(purchasedCoupon.buyerFeedbackStatus || "pending");
            if (purchasedCoupon.revealedCouponCode) {
              setRevealedCoupon({
                couponCode: purchasedCoupon.revealedCouponCode,
                title: purchasedCoupon.title,
                platformName: purchasedCoupon.platformName,
                expiryDate: purchasedCoupon.expiryDate,
                terms: purchasedCoupon.terms
              });
            }
          }
        }
      } catch {
        setCoupon(null);
      } finally {
        setLoading(false);
      }
    };

    loadCoupon();
  }, [params.id]);

  const copyCouponCode = async () => {
    if (!revealedCoupon?.couponCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(revealedCoupon.couponCode);
      toast.success("Coupon code copied");
    } catch {
      toast.error("Unable to copy coupon code");
    }
  };

  const handleBuy = async () => {
    if (!loggedIn) {
      router.push("/login");
      return;
    }

    try {
      setBuying(true);
      const walletAmount = Number(rewardSummary?.user?.rewardWalletBalance || 0);
      const { data } = await api.post("/payments/create-order", { couponId: coupon._id, useRewardWallet: walletAmount > 0, walletAmount });

      if (!data.paymentRequired) {
        const revealed = await api.post(`/payments/reveal-coupon/${data.transaction._id}`);
        setOwnedCoupon(true);
        setPurchaseTransactionId(revealed.data.transaction?._id || data.transaction._id);
        setFeedbackStatus(revealed.data.transaction?.buyerFeedbackStatus || "pending");
        setCoupon((current) => (current ? { ...current, status: "sold" } : current));
        setRevealedCoupon(revealed.data.revealedCoupon);
        toast.success("Coupon unlocked using your CouponX wallet.");
        return;
      }

      await openRazorpayCheckout({
        order: data.order,
        key: data.razorpayKey,
        user: getStoredUser(),
        onSuccess: async (response) => {
          await api.post("/payments/verify-authorized", {
            transactionId: data.transaction._id,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          });

          const revealed = await api.post(`/payments/reveal-coupon/${data.transaction._id}`);
          setOwnedCoupon(true);
          setPurchaseTransactionId(revealed.data.transaction?._id || data.transaction._id);
          setFeedbackStatus(revealed.data.transaction?.buyerFeedbackStatus || "pending");
          setCoupon((current) => (current ? { ...current, status: "sold" } : current));
          setRevealedCoupon(revealed.data.revealedCoupon);
          toast.success("Coupon unlocked. Please tell us whether it worked after you try it.");
        }
      });
    } catch (error) {
      toast.error(extractError(error));
    } finally {
      setBuying(false);
    }
  };

  const submitCouponFeedback = async (worked) => {
    if (!purchaseTransactionId) {
      toast.error("Transaction not found for this purchase");
      return;
    }

    try {
      setFeedbackSubmitting(true);
      const endpoint = worked ? "confirm-worked" : "report-not-working";
      const { data } = await api.post(`/payments/${endpoint}/${purchaseTransactionId}`);
      const nextStatus = data.transaction?.buyerFeedbackStatus || (worked ? "worked" : "not_working");
      setFeedbackStatus(nextStatus);
      toast.success(worked ? "Thanks. Seller payout has been released." : "Issue reported. Seller review is now pending.");
    } catch (error) {
      toast.error(extractError(error));
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const brand = useMemo(
    () => (coupon ? (coupon.platformBrandKey ? resolveBrand(coupon.platformBrandKey) : resolveBrand(coupon.platformName)) : null),
    [coupon]
  );
  const brandTheme = useMemo(() => brandThemes[brand?.key] || brandThemes.default, [brand]);

  const logoPath = coupon?.platformLogoPath || brand?.logoPath || "";
  const isSold = coupon?.status === "sold";
  const termsList = parseTerms(coupon?.terms);
  const support = buildSupportData(coupon?.platformName);
  const offerType = coupon?.couponAmount > coupon?.sellingPrice ? "Special Discount" : "Coupon Offer";
  const validDaysLeft = coupon?.expiryDate
    ? Math.max(0, Math.ceil((new Date(coupon.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;
  const usageCount = coupon?.views || coupon?.savedCount || 60;
  const savingsPercent = coupon?.couponAmount
    ? Math.max(
        0,
        Math.round(((Number(coupon.couponAmount) - Number(coupon.sellingPrice || 0)) / Number(coupon.couponAmount)) * 100)
      )
    : 0;
  const redeemSteps = buildRedeemSteps(coupon?.platformName || "the store");
  const heroImageUrl = !heroImageFailed ? resolveUploadUrl(coupon?.coverImagePath) : "";
  const sellerName = coupon?.sellerId?.name || "Unknown Seller";
  const sellerProfileHref = coupon?.sellerId?._id ? `/sellers/${coupon.sellerId._id}` : "/sellers";
  const shouldShowFeedbackBanner = ownedCoupon && revealedCoupon?.couponCode && purchaseTransactionId;

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <LoadingSpinner label="Loading coupon..." />
      </div>
    );
  }

  if (!coupon) {
    return <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-slate-500">Coupon not found.</div>;
  }

  const overviewItems = [
    [CalendarDays, "Valid Till", formatDate(coupon.expiryDate), `${validDaysLeft} Days Left`],
    [ShoppingCart, "Min. Purchase", "No minimum spend", ""],
    [CreditCard, "Payment Mode", "Prepaid Orders Only", ""],
    [Truck, "Shipping", "Free Shipping", ""],
    [Sparkles, "Offer Type", offerType, ""],
    [Users, "Users", "All Users", ""],
    [CheckCircle2, "Usage", "One-time use only", ""]
  ];

  const featureItems = [
    ["100% Verified", "All offers are manually verified by our team.", "bg-emerald-50", "text-emerald-600"],
    ["Best Savings", "We ensure you get the best discount possible.", "bg-rose-50", "text-rose-500"],
    ["Secure & Safe", "Your data and payment are 100% secure.", "bg-emerald-50", "text-emerald-600"]
  ];

  return (
    <div className="mx-auto max-w-[1380px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-400">
        <span>Home</span>
        <span>&gt;</span>
        <span>{coupon.categories?.[0] || "Coupons"}</span>
        <span>&gt;</span>
        <span>{coupon.platformName}</span>
        <span>&gt;</span>
        <span className="text-slate-500">{toTitleCase(coupon.title)}</span>
      </div>

      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(248,255,251,0.98)_100%)] p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] sm:p-8">
          <div className="pointer-events-none absolute -left-20 top-8 h-48 w-48 rounded-full bg-[rgba(34,197,94,0.14)] blur-3xl" />
          <div className="pointer-events-none absolute -right-14 top-0 h-48 w-48 rounded-full bg-[rgba(124,58,237,0.12)] blur-3xl" />
          {heroImageUrl ? (
            <div className="relative mb-6 overflow-hidden rounded-[26px] border border-slate-200 bg-slate-100 shadow-[0_16px_30px_rgba(15,23,42,0.06)]">
              <img
                src={heroImageUrl}
                alt={`${coupon.title} preview`}
                className="h-[220px] w-full bg-slate-50 p-3 object-contain sm:h-[320px] lg:h-[360px]"
                onError={() => setHeroImageFailed(true)}
              />
            </div>
          ) : logoPath ? (
            <div className="relative mb-6 flex h-[220px] items-center justify-center overflow-hidden rounded-[26px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.14),transparent_28%),linear-gradient(180deg,#ffffff_0%,#f8fffb_100%)] shadow-[0_16px_30px_rgba(15,23,42,0.06)] sm:h-[320px] lg:h-[360px]">
              <Image src={logoPath} alt={coupon.platformName} width={240} height={92} className="h-auto w-auto max-h-20 max-w-[70%] object-contain sm:max-h-24" />
            </div>
          ) : null}
          <div className="grid gap-6 lg:grid-cols-[132px_minmax(0,1fr)_170px] lg:items-start">
            <div className="flex h-[126px] w-[126px] items-center justify-center rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_26px_rgba(15,23,42,0.05)]">
              {logoPath ? (
                <Image src={logoPath} alt={coupon.platformName} width={92} height={54} className="h-auto w-auto max-h-14 object-contain" />
              ) : (
                <p className="px-3 text-center text-xl font-black uppercase text-slate-900">{coupon.platformName}</p>
              )}
            </div>

            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.08em] sm:text-sm" style={{ backgroundColor: brandTheme.accentSoft, color: brandTheme.accentText }}>
                <ShieldCheck className="h-4 w-4" />
                Verified
              </span>

              <h1 className="app-main-heading mt-4 uppercase text-slate-950">
                {coupon.title}
              </h1>
              <p className="mt-2 text-xl font-medium text-slate-500 sm:text-[30px] sm:leading-[1.2]">On {coupon.platformName} purchases</p>              <div className="mt-4 flex flex-wrap items-center gap-3">
                {(coupon.categories || []).slice(0, 1).map((category) => (
                  <span key={category} className="rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-[0.08em] sm:text-sm" style={{ backgroundColor: brandTheme.accentSoft, color: brandTheme.accentText }}>
                    {category}
                  </span>
                ))}
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-slate-600 sm:text-sm">
                  <MapPin className="h-4 w-4" />
                  {coupon.country}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-500">
                <span>Sold by {sellerName}</span>
                <Link href={sellerProfileHref} className="text-emerald-700 hover:text-emerald-800">
                  View seller profile
                </Link>
              </div>
            </div>

            <div className="flex flex-col items-start gap-5 lg:items-end">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-[0_8px_18px_rgba(15,23,42,0.04)]"
                >
                  <Heart className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-[0_8px_18px_rgba(15,23,42,0.04)]"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>

              <div className="text-left lg:text-right">
                <div className="inline-flex items-center gap-2 text-amber-500">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="text-2xl font-black text-slate-900">4.8</span>
                  <span className="text-xl font-semibold text-slate-500">({usageCount})</span>
                </div>
                <p className="mt-1 text-base font-medium text-slate-500">{usageCount} people used today</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:p-7">
              <p className="text-base font-black uppercase tracking-[0.08em] text-slate-500">Offer Price</p>
              <div className="mt-4 flex flex-wrap items-center gap-5">
                <p className="text-5xl font-black leading-none sm:text-[58px]" style={{ color: brandTheme.accent }}>
                  {formatMoney(coupon.sellingPrice, coupon.currency)}
                </p>
                <p className="text-3xl font-bold text-slate-400 line-through sm:text-[40px]">
                  {formatMoney(coupon.couponAmount, coupon.currency)}
                </p>
                {rewardSummary?.user?.rewardWalletBalance ? (
                  <span className="rounded-full border px-4 py-2 text-sm font-black" style={{ borderColor: brandTheme.accentBorder, backgroundColor: brandTheme.accentSoft, color: brandTheme.accentText }}>
                    Wallet auto-apply: {formatMoney(Math.min(Number(rewardSummary.user.rewardWalletBalance || 0), Number(coupon.sellingPrice || 0)), coupon.currency)}
                  </span>
                ) : null}
                {savingsPercent > 0 ? (
                  <span className="rounded-full border px-4 py-2 text-lg font-black" style={{ borderColor: brandTheme.accentBorder, backgroundColor: brandTheme.accentSoft, color: brandTheme.accentText }}>
                    {savingsPercent}% OFF
                  </span>
                ) : null}
              </div>

              <div className="mt-6 border-t border-dashed border-slate-300 pt-6">
                <p className="text-base font-black uppercase tracking-[0.08em] text-slate-500">Coupon Code</p>
                <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
                  <div className="flex min-h-[62px] items-center rounded-[18px] border bg-white px-5 text-lg font-bold text-slate-600" style={{ borderColor: brandTheme.accentBorder }}>
                    {revealedCoupon?.couponCode ? (
                      <span className="inline-flex items-center gap-3">
                        <Copy className="h-5 w-5" style={{ color: brandTheme.accent }} />
                        {revealedCoupon.couponCode}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-3">
                        <LockKeyhole className="h-5 w-5 text-slate-400" />
                        Code hidden until payment
                      </span>
                    )}
                  </div>

                  {revealedCoupon?.couponCode ? (
                    <button
                      type="button"
                      onClick={copyCouponCode}
                      className="inline-flex min-h-[62px] items-center justify-center gap-3 rounded-[18px] px-5 text-lg font-black text-white" style={{ backgroundImage: `linear-gradient(90deg, ${brandTheme.buttonStart} 0%, ${brandTheme.buttonEnd} 100%)`, boxShadow: `0 16px 28px ${brandTheme.glow}` }}
                    >
                      <Copy className="h-5 w-5" />
                      Copy Code
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={ownedCoupon || isSold ? undefined : handleBuy}
                      disabled={buying || ownedCoupon || isSold}
                      className={`inline-flex min-h-[62px] items-center justify-center gap-3 rounded-[18px] px-5 text-lg font-black ${
                        ownedCoupon || isSold
                          ? "bg-slate-200 text-slate-600"
                          : "bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white"
                      }`} style={ownedCoupon || isSold ? undefined : { backgroundImage: `linear-gradient(90deg, ${brandTheme.buttonStart} 0%, ${brandTheme.buttonEnd} 100%)`, boxShadow: `0 16px 28px ${brandTheme.glow}` }}
                    >
                      <LockKeyhole className="h-5 w-5" />
                      {ownedCoupon ? "Already Purchased" : isSold ? "Sold" : buying ? "Processing..." : "Unlock & Buy"}
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-6 grid gap-3 rounded-[20px] p-4 sm:grid-cols-2 xl:grid-cols-4" style={{ backgroundColor: brandTheme.accentSoft }}>
                {[
                  [ShieldCheck, "Secure Payment"],
                  [Sparkles, "Instant Delivery"],
                  [CheckCircle2, "100% Working"],
                  [PackageCheck, "Best Price"]
                ].map(([Icon, label]) => (
                  <div key={label} className="flex items-center gap-2 rounded-2xl bg-white/80 px-3 py-3 text-sm font-bold text-slate-600">
                    <Icon className="h-4 w-4" style={{ color: brandTheme.accent }} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:p-7">
              <h2 className="text-3xl font-black text-slate-950">About This Offer</h2>
              <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
                Get {coupon.title} products at just {formatMoney(coupon.sellingPrice, coupon.currency)} on {coupon.platformName}. This
                exclusive offer is valid on selected products and categories. Shop now and save more on your favorite products.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {featureItems.map(([title, description, bgClass, textClass]) => (
                  <div key={title} className="rounded-[22px] bg-slate-50 p-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${bgClass} ${textClass}`}>
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-lg font-black text-slate-900">{title}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-500">{description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:p-7">
              <h2 className="text-3xl font-black text-slate-950">How to Redeem</h2>
              <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_230px]">
                <ol className="space-y-4">
                  {redeemSteps.map((step, index) => (
                    <li key={step} className="flex items-start gap-3 text-base leading-8 text-slate-600 sm:text-lg">
                      <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-black text-white" style={{ backgroundColor: brandTheme.accent }}>
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>

                <div className="flex items-center justify-center rounded-[26px] bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.14),transparent_30%),linear-gradient(180deg,#fbfffc_0%,#f1fff6_100%)] p-6">
                  <ShoppingCart className="h-28 w-28" style={{ color: brandTheme.accentBorder }} />
                </div>
              </div>
            </section>

            <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:p-7">
              <h2 className="text-3xl font-black text-slate-950">Terms & Conditions</h2>
              <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_230px]">
                <ul className="space-y-4 text-base leading-8 text-slate-600 sm:text-lg">
                  {(termsList.length
                    ? termsList
                    : [
                        `Offer is valid until ${formatDate(coupon.expiryDate)}.`,
                        "No minimum purchase required.",
                        `Offer valid on selected ${coupon.platformName} products.`,
                        "Only prepaid orders are eligible.",
                        "Free shipping on eligible orders.",
                        "Coupon can be used only once per user."
                      ]).map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-3 h-2 w-2 rounded-full bg-slate-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-center rounded-[26px] bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_28%),linear-gradient(180deg,#fbfdff_0%,#f4f8ff_100%)] p-6">
                  <ShieldCheck className="h-28 w-28 text-sky-200" />
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <aside className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:p-7">
              <div className="space-y-5">
                {overviewItems.map(([Icon, label, value, extra], index) => (
                  <div key={label} className={index ? "border-t border-slate-100 pt-5" : ""}>
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: brandTheme.accentSoft, color: brandTheme.accent }}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">{label}</p>
                        <p className="mt-1 text-xl font-black text-slate-900">{value}</p>
                        {extra ? (
                          <span className="mt-2 inline-flex rounded-full px-3 py-1 text-xs font-black sm:text-sm" style={{ backgroundColor: brandTheme.accentSoft, color: brandTheme.accentText }}>
                            {extra}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <a
                href="#"
                className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-[18px] border px-5 py-4 text-lg font-black sm:text-xl" style={{ borderColor: brandTheme.accentBorder, color: brandTheme.accentText }}
              >
                Visit {coupon.platformName}
                <ArrowUpRight className="h-5 w-5" />
              </a>
            </aside>

            <aside className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:p-7">
              <h2 className="text-3xl font-black text-slate-950">Need Help?</h2>
              <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
                If you face any issues while applying the coupon or with your order, our support team is available.
              </p>

              <button type="button" className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-[18px] px-5 py-4 text-lg font-black sm:text-xl" style={{ backgroundColor: brandTheme.accentSoft, color: brandTheme.accentText }}>
                <ShieldCheck className="h-5 w-5" />
                Contact Support
              </button>

              <div className="mt-6 space-y-6">
                <div className="border-t border-slate-100 pt-6">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: brandTheme.accentSoft, color: brandTheme.accent }}>
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-lg font-black text-slate-900 sm:text-xl">{support.email}</p>
                      <p className="mt-1 text-sm text-slate-500">Send us an email</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-lg font-black text-slate-900 sm:text-xl">{support.phone}</p>
                      <p className="mt-1 text-sm text-slate-500">Mon - Sun | 24x7</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <button type="button" className="inline-flex items-center gap-3 text-base font-black text-slate-700 sm:text-lg">
                    View All Help Topics
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {shouldShowFeedbackBanner ? (
          <section className="flex flex-col gap-4 rounded-[30px] border border-slate-200 bg-[linear-gradient(90deg,#f5fff7_0%,#ffffff_45%,#fff8f8_100%)] p-5 shadow-[0_18px_40px_rgba(15,23,42,0.04)] lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-2xl font-black text-slate-950 sm:text-3xl">Did this offer work for you?</p>
              <p className="mt-2 text-base text-slate-500 sm:text-lg">
                {feedbackStatus === "pending"
                  ? "Help others by sharing your experience. Your response also updates the seller record."
                  : feedbackStatus === "worked"
                    ? "Thanks for confirming this coupon worked for you."
                    : "You reported that this coupon did not work. Seller review and trust checks are in progress."}
              </p>
            </div>

            {feedbackStatus === "pending" ? (
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => submitCouponFeedback(true)} disabled={feedbackSubmitting} className="rounded-[18px] px-6 py-4 text-base font-black text-white sm:text-lg" style={{ backgroundImage: `linear-gradient(90deg, ${brandTheme.buttonStart} 0%, ${brandTheme.buttonEnd} 100%)` }}>
                  {feedbackSubmitting ? "Saving..." : "Yes, It Worked!"}
                </button>
                <button type="button" onClick={() => submitCouponFeedback(false)} disabled={feedbackSubmitting} className="rounded-[18px] border border-rose-300 bg-white px-6 py-4 text-base font-black text-rose-500 sm:text-lg">
                  No, It Didn&apos;t
                </button>
              </div>
            ) : (
              <div className={`rounded-[18px] px-5 py-3 text-sm font-black ${feedbackStatus === "worked" ? "" : "bg-rose-50 text-rose-600"}`} style={feedbackStatus === "worked" ? { backgroundColor: brandTheme.accentSoft, color: brandTheme.accentText } : undefined}>
                {feedbackStatus === "worked" ? "Marked as working" : "Reported as not working"}
              </div>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}






