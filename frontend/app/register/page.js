"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Mail, ShieldCheck, User, Users } from "lucide-react";
import toast from "react-hot-toast";
import api, { extractError } from "../../lib/api";
import { saveSession } from "../../lib/auth";

const CouponXLogo = () => (
  <div className="flex items-center gap-2">
    <div className="relative h-8 w-8 flex-shrink-0">
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <rect width="200" height="200" rx="46" fill="white" />
        <rect width="200" height="200" rx="46" stroke="#16a34a" strokeWidth="8" />
        <path d="M109 46C103.7 46 98.6 48.1 94.8 51.9L49.9 96.8C42 104.7 42 117.3 49.9 125.2L74.8 150.1C82.7 158 95.3 158 103.2 150.1L148.1 105.2C151.9 101.4 154 96.3 154 91V57C154 50.9 149.1 46 143 46H109Z" fill="#16a34a" />
        <circle cx="80" cy="110" r="10" fill="white" />
        <path d="M136 102C136 113.6 126.6 123 115 123C103.4 123 94 113.6 94 102C94 90.4 103.4 81 115 81C123.3 81 130.4 85.9 133.7 93H121C119.5 90.5 117.5 89 115 89C107.8 89 102 94.8 102 102C102 109.2 107.8 115 115 115C118.8 115 122.1 112 123 108H115V102H136Z" fill="white" />
      </svg>
    </div>
    <span className="text-xl font-black tracking-tight text-slate-900">
      Coupon<span className="text-[#16a34a]">X</span>
    </span>
  </div>
);

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const queryReferralCode = useMemo(() => String(searchParams.get("ref") || searchParams.get("referralCode") || "").trim().toUpperCase(), [searchParams]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (queryReferralCode) {
      setReferralCode(queryReferralCode);
    }
  }, [queryReferralCode]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = window.setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => window.clearInterval(interval);
  }, [timer]);

  const normalizedReferralCode = referralCode.trim().toUpperCase();

  const handleSendOtp = async () => {
    if (!username.trim()) {
      toast.error("Enter your username first.");
      return;
    }
    if (!email.trim()) {
      toast.error("Enter your email address first.");
      return;
    }

    setIsSendingOtp(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { data } = await api.post("/auth/send-otp", { email: normalizedEmail, intent: "register", referralCode: normalizedReferralCode });
      setEmail(normalizedEmail);
      setOtpSent(true);
      setOtpDigits(["", "", "", "", "", ""]);
      setTimer(59);
      toast.success(data?.message || "OTP sent to your email");
      if (data?.devOtp) {
        toast(`Dev OTP: ${data.devOtp}`, { duration: 5000, icon: "OTP" });
      }
    } catch (error) {
      toast.error(extractError(error));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const nextValue = value.replace(/\D/g, "").slice(-1);
    const nextDigits = [...otpDigits];
    nextDigits[index] = nextValue;
    setOtpDigits(nextDigits);
    if (nextValue && index < 5) {
      document.getElementById(`register-otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      document.getElementById(`register-otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const nextDigits = ["", "", "", "", "", ""];
    pasted.split("").forEach((char, index) => {
      nextDigits[index] = char;
    });
    setOtpDigits(nextDigits);
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    const otp = otpDigits.join("");

    if (!email.trim() || !username.trim() || otp.length !== 6) {
      toast.error("Enter email, username, and full OTP.");
      return;
    }

    setIsVerifying(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { data } = await api.post("/auth/verify-otp", { email: normalizedEmail, otp, intent: "register", referralCode: normalizedReferralCode });
      saveSession({ token: data.token, user: data.user });

      try {
        const profileResponse = await api.put("/users/profile", { name: username.trim() });
        saveSession({ token: data.token, user: profileResponse.data.user });
      } catch {
      }

      const meResponse = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${data.token}` }
      });
      saveSession({ token: data.token, user: meResponse.data.user || data.user });

      toast.success("Email verified and account created");
      window.location.href = (meResponse.data.user || data.user).role === "super_admin" ? "/admin/dashboard" : "/";
    } catch (error) {
      toast.error(extractError(error));
      setIsVerifying(false);
    }
  };

  const formatTimer = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#edf0f9] p-4 sm:p-6">
      <div className="w-full max-w-[500px] rounded-[32px] border border-[#e2e7f3] bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.03)] sm:p-10">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <Link href="/">
            <CouponXLogo />
          </Link>
          <div className="text-xs font-semibold text-slate-500 sm:text-sm">
            Already have an account? <Link href="/login" className="ml-1 font-bold text-[#16a34a] hover:underline">Login</Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl"><span className="text-[#16a34a]">Create</span> your account</h2>
          <p className="mt-2 text-sm text-slate-500">Join millions of smart buyers and sellers.</p>
        </div>

        <div className="rounded-[24px] border border-[#e8f2ec] bg-[#fafcfa] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.01)] sm:mt-8 sm:p-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-600">Username</span>
              <div className="flex items-center gap-3 rounded-[16px] border border-slate-200 bg-white px-4 py-3.5 transition-all focus-within:border-[#16a34a] focus-within:ring-2 focus-within:ring-emerald-500/20">
                <User className="h-5 w-5 flex-shrink-0 text-slate-400" />
                <input suppressHydrationWarning type="text" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Choose a unique username" className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400" disabled={otpSent} required />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-600">Email Address</span>
              <div className="flex items-center gap-3 rounded-[16px] border border-slate-200 bg-white px-4 py-2.5 transition-all focus-within:border-[#16a34a] focus-within:ring-2 focus-within:ring-emerald-500/20">
                <Mail className="h-5 w-5 flex-shrink-0 text-slate-400" />
                <input suppressHydrationWarning type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email address" className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400" disabled={otpSent} required />
                <button type="button" onClick={handleSendOtp} disabled={isSendingOtp || timer > 0} className="rounded-xl bg-[#16a34a]/10 px-4 py-2 text-xs font-bold text-[#16a34a] transition-all hover:bg-[#16a34a]/20 disabled:bg-slate-100 disabled:text-slate-400">
                  {isSendingOtp ? "Sending..." : timer > 0 ? `Resend (${timer}s)` : "Send OTP"}
                </button>
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-600">Referral Code</span>
              <div className="flex items-center gap-3 rounded-[16px] border border-slate-200 bg-white px-4 py-3.5 transition-all focus-within:border-[#16a34a] focus-within:ring-2 focus-within:ring-emerald-500/20">
                <Users className="h-5 w-5 flex-shrink-0 text-slate-400" />
                <input suppressHydrationWarning type="text" value={referralCode} onChange={(event) => setReferralCode(event.target.value.toUpperCase())} placeholder="Enter referral code if you have one" className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400" disabled={otpSent && Boolean(queryReferralCode)} />
              </div>
              {queryReferralCode ? <p className="mt-2 text-xs font-bold text-emerald-700">Referral code auto-added from shared link.</p> : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-600">Verify Email with OTP</span>
              <div className="rounded-[16px] border border-slate-200 bg-white px-4 py-3.5 transition-all focus-within:border-[#16a34a] focus-within:ring-2 focus-within:ring-emerald-500/20">
                <div className="grid grid-cols-6 gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, index) => (
                    <input key={index} id={`register-otp-${index}`} suppressHydrationWarning type="text" inputMode="numeric" maxLength={1} value={digit} onChange={(event) => handleOtpChange(index, event.target.value)} onKeyDown={(event) => handleOtpKeyDown(index, event)} disabled={!otpSent} className="h-12 rounded-xl border border-slate-200 bg-[#fafcfa] text-center text-lg font-black text-slate-900 outline-none transition focus:border-[#16a34a] focus:bg-white disabled:opacity-50" />
                  ))}
                </div>
              </div>
            </label>

            {otpSent ? <div className="flex items-center justify-between px-1 text-xs font-semibold text-slate-500"><span>OTP sent to your email address</span><span className="font-bold text-[#16a34a]">{formatTimer(timer)}</span></div> : null}

            <button type="submit" disabled={isVerifying || !otpSent} className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-[#16a34a] py-4 text-base font-bold text-white shadow-[0_8px_20px_rgba(22,163,74,0.18)] transition-all hover:bg-[#15803d] disabled:bg-slate-300 disabled:text-slate-500">
              {isVerifying ? "Verifying..." : "Verify & Continue"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-[10px] font-bold text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 flex-shrink-0 text-[#16a34a]" />
              <span>Your email is verified through OTP</span>
            </div>
            <span className="text-slate-400">Secure signup</span>
          </div>
        </div>
      </div>
    </div>
  );
}
