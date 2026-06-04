"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Mail, ShieldCheck, ArrowLeft, Send, ArrowRight, ShieldCheck as ShieldIcon } from "lucide-react";
import toast from "react-hot-toast";
import api, { extractError } from "../../lib/api";
import { saveSession } from "../../lib/auth";

const CouponXLogo = () => (
  <div className="flex items-center gap-2">
    <div className="relative h-8 w-8 flex-shrink-0">
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <rect width="200" height="200" rx="46" fill="white" />
        <rect width="200" height="200" rx="46" stroke="#16a34a" strokeWidth="8" />
        <path d="M109 46C103.7 46 98.6 48.1 94.8 51.9L49.9 96.8C42 104.7 42 117.3 49.9 125.2L74.8 150.1C82.7 158 95.3 158 103.2 150.1L148.1 105.2C151.9 101.4 154 96.3 154 91V57C154 50.9 149.1 46 143 46H109Z" fill="#16a34a"/>
        <circle cx="80" cy="110" r="10" fill="white"/>
        <path d="M136 102C136 113.6 126.6 123 115 123C103.4 123 94 113.6 94 102C94 90.4 103.4 81 115 81C123.3 81 130.4 85.9 133.7 93H121C119.5 90.5 117.5 89 115 89C107.8 89 102 94.8 102 102C102 109.2 107.8 115 115 115C118.8 115 122.1 112 123 108H115V102H136Z" fill="white"/>
      </svg>
    </div>
    <span className="text-xl font-black tracking-tight text-slate-900">
      Coupon<span className="text-[#16a34a]">X</span>
    </span>
  </div>
);

const GoogleIcon = () => (
  <svg className="mr-2 h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
    <path
      fill="#EA4335"
      d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.336 0 3.327 2.69 1.455 6.618l3.81 3.147z"
    />
    <path
      fill="#34A853"
      d="M16.04 15.345c-1.077.737-2.43 1.173-4.04 1.173a7.077 7.077 0 0 1-6.734-4.856L1.455 14.81C3.327 18.736 7.336 21.427 12 21.427c3.055 0 5.89-1.045 7.982-2.855l-3.94-3.227z"
    />
    <path
      fill="#4285F4"
      d="M23.49 12.273c0-.818-.082-1.609-.227-2.373H12v4.518h6.464a5.536 5.536 0 0 1-2.4 3.627l3.94 3.227c2.31-2.127 3.486-5.264 3.486-8.999z"
    />
    <path
      fill="#FBBC05"
      d="M5.266 14.236A7.014 7.014 0 0 1 4.91 12c0-.79.127-1.545.355-2.235L1.455 6.618A11.906 11.906 0 0 0 0 12c0 1.927.436 3.745 1.455 5.382l3.81-3.146z"
    />
  </svg>
);

export default function LoginPage() {
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState("");
  const [timer, setTimer] = useState(0);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  // Handle countdown timer
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const onSendOtp = async ({ email }) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      await api.post("/auth/send-otp", { email: normalizedEmail });
      setEmail(normalizedEmail);
      setOtpSent(true);
      setTimer(59);
      toast.success("OTP sent to your email");
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  const onVerifyOtp = async ({ otp }) => {
    try {
      const { data } = await api.post("/auth/verify-otp", { email, otp });
      saveSession({ token: data.token, user: data.user });
      toast.success("Login successful");
      window.location.href = data.user.role === "super_admin" ? "/admin/dashboard" : "/";
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    try {
      await api.post("/auth/send-otp", { email });
      setTimer(59);
      toast.success("OTP resent successfully!");
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  const handleGoogleSignIn = () => {
    toast.error("Google sign-in is not configured yet.", {
      icon: "⚙️"
    });
  };

  const formatTimer = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#eef7f2] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-[500px] bg-white rounded-[32px] border border-[#e1ede6] p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] flex flex-col transition-all duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between w-full pb-4 border-b border-slate-100">
          <Link href="/">
            <CouponXLogo />
          </Link>
          <span className="text-slate-500 font-semibold text-sm">
            Welcome back! 👋
          </span>
        </div>

        {/* Title & Subtitle */}
        <div className="text-center mt-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {!otpSent ? (
              <>
                <span className="text-[#16a34a]">Login</span> to your account
              </>
            ) : (
              <>
                <span className="text-[#16a34a]">Verify</span> your OTP
              </>
            )}
          </h2>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
            {!otpSent 
              ? "Enter your email and verify with OTP to continue"
              : `We sent a 6-digit OTP to your email ${email}`}
          </p>
        </div>

        {/* Illustration */}
        <div className="my-6 flex justify-center">
          <img
            src="/images/login_illustration.png"
            alt="Login Verification Security Graphic"
            className="h-40 sm:h-44 w-auto object-contain transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* Nested White Form Card */}
        <div className="bg-[#fafcfa] border border-[#e8f2ec] rounded-[24px] p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
          {!otpSent ? (
            <form onSubmit={handleSubmit(onSendOtp)} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  Email Address
                </span>
                <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-[16px] px-4 py-3.5 focus-within:border-[#16a34a] focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                  <Mail className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  <input
                    {...register("email", { required: true })}
                    type="email"
                    placeholder="Enter your email address"
                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none"
                    required
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white rounded-[16px] py-4 font-bold text-base shadow-[0_8px_20px_rgba(22,163,74,0.18)] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Sending OTP..." : "Send OTP"}
                <Send className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit(onVerifyOtp)} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  Enter 6-digit OTP
                </span>
                <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-[16px] px-4 py-3.5 focus-within:border-[#16a34a] focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                  <ShieldCheck className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  <input
                    {...register("otp", { required: true })}
                    type="text"
                    maxLength={6}
                    placeholder="Enter OTP code"
                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none text-center tracking-[0.2em]"
                    required
                  />
                </div>
              </label>

              {/* Resend Status / Countdown */}
              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-slate-500 font-semibold">
                  We sent a 6-digit OTP to your email
                </span>
                {timer > 0 ? (
                  <span className="text-[#16a34a] font-bold">
                    {formatTimer(timer)}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-[#16a34a] font-extrabold hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white rounded-[16px] py-4 font-bold text-base shadow-[0_8px_20px_rgba(22,163,74,0.18)] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Verifying..." : "Verify & Continue"}
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="w-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-[16px] py-3.5 font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Change email
              </button>
            </form>
          )}

          {/* OR Separator */}
          <div className="flex items-center my-5">
            <div className="flex-1 border-t border-slate-200"></div>
            <span className="text-[10px] text-slate-400 px-3 bg-white border border-slate-100 rounded-full py-1 font-bold">
              OR
            </span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          {/* Continue with Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-[16px] py-4 font-bold text-base transition-all flex items-center justify-center"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Security Alert Badge */}
          <div className="mt-5 flex items-center justify-between bg-[#f0f9f4] border border-[#e2f3e8] rounded-2xl px-4 py-3 text-[10px] font-bold text-emerald-800">
            <div className="flex items-center gap-2">
              <ShieldIcon className="h-4 w-4 text-[#16a34a] flex-shrink-0" />
              <span>Secure & trusted by 1M+ users</span>
            </div>
            <span className="text-[#16a34a]">100% Safe & Secure</span>
          </div>
        </div>

        {/* Footer Link */}
        <p className="mt-6 text-center text-xs text-slate-400 leading-relaxed font-semibold">
          By continuing, you agree to our{" "}
          <Link href="/terms-of-service" className="text-[#16a34a] hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy-policy" className="text-[#16a34a] hover:underline">
            Privacy Policy
          </Link>
        </p>

      </div>
    </div>
  );
}
