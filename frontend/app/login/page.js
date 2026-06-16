"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, ArrowRight, Mail, Send, ShieldCheck } from "lucide-react";
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

export default function LoginPage() {
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState("");
  const [timer, setTimer] = useState(0);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = window.setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => window.clearInterval(interval);
  }, [timer]);

  const onSendOtp = async ({ email: submittedEmail }) => {
    try {
      const normalizedEmail = submittedEmail.trim().toLowerCase();
      const { data } = await api.post("/auth/send-otp", { email: normalizedEmail, intent: "login" });
      setEmail(normalizedEmail);
      setOtpDigits(["", "", "", "", "", ""]);
      setOtpSent(true);
      setTimer(59);
      toast.success(data?.message || "OTP sent to your email");
      if (data?.devOtp) {
        toast(`Dev OTP: ${data.devOtp}`, { duration: 5000, icon: "🔐" });
      }
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  const onVerifyOtp = async () => {
    try {
      const otp = otpDigits.join("");
      if (otp.length !== 6) {
        toast.error("Enter the full 6-digit OTP");
        return;
      }

      const { data } = await api.post("/auth/verify-otp", { email, otp, intent: "login" });
      const meResponse = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${data.token}` }
      });
      saveSession({ token: data.token, user: meResponse.data.user || data.user });
      toast.success("Login successful");
      window.location.href = (meResponse.data.user || data.user).role === "super_admin" ? "/admin/dashboard" : "/";
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    try {
      const { data } = await api.post("/auth/send-otp", { email, intent: "login" });
      setTimer(59);
      toast.success(data?.message || "OTP resent successfully");
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  const handleOtpChange = (index, value) => {
    const nextValue = value.replace(/\D/g, "").slice(-1);
    const nextDigits = [...otpDigits];
    nextDigits[index] = nextValue;
    setOtpDigits(nextDigits);
    if (nextValue && index < 5) {
      document.getElementById(`login-otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      document.getElementById(`login-otp-${index - 1}`)?.focus();
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

  const formatTimer = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#eef7f2] p-4 sm:p-6">
      <div className="w-full max-w-[500px] rounded-[32px] border border-[#e1ede6] bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.03)] sm:p-10">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <Link href="/">
            <CouponXLogo />
          </Link>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-500">Welcome back!</p>
            <Link href="/register" className="mt-1 inline-block text-xs font-bold text-[#16a34a] hover:underline">
              No account? Register
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
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
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
            {!otpSent ? "Enter your email and continue with OTP verification." : `We sent a 6-digit OTP to ${email}.`}
          </p>
        </div>

        <div className="my-6 flex justify-center">
          <img src="/images/login_illustration.png" alt="Login illustration" className="h-40 w-auto object-contain sm:h-44" />
        </div>

        <div className="rounded-[24px] border border-[#e8f2ec] bg-[#fafcfa] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.01)] sm:p-6">
          {!otpSent ? (
            <form onSubmit={handleSubmit(onSendOtp)} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-600">Email Address</span>
                <div className="flex items-center gap-3 rounded-[16px] border border-slate-200 bg-white px-4 py-3.5 transition-all focus-within:border-[#16a34a] focus-within:ring-2 focus-within:ring-emerald-500/20">
                  <Mail className="h-5 w-5 flex-shrink-0 text-slate-400" />
                  <input
                    {...register("email", { required: true })}
                    type="email"
                    placeholder="Enter your email address"
                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                    required
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-[#16a34a] py-4 text-base font-bold text-white shadow-[0_8px_20px_rgba(22,163,74,0.18)] transition-all hover:bg-[#15803d]"
              >
                {isSubmitting ? "Sending OTP..." : "Send OTP"}
                <Send className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-600">Enter 6-digit OTP</span>
                <div className="rounded-[16px] border border-slate-200 bg-white px-4 py-3.5 transition-all focus-within:border-[#16a34a] focus-within:ring-2 focus-within:ring-emerald-500/20">
                  <div className="grid grid-cols-6 gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        id={`login-otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(event) => handleOtpChange(index, event.target.value)}
                        onKeyDown={(event) => handleOtpKeyDown(index, event)}
                        className="h-12 rounded-xl border border-slate-200 bg-[#fafcfa] text-center text-lg font-black text-slate-900 outline-none transition focus:border-[#16a34a] focus:bg-white"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-1 text-xs">
                <span className="font-semibold text-slate-500">OTP sent to your email address</span>
                {timer > 0 ? (
                  <span className="font-bold text-[#16a34a]">{formatTimer(timer)}</span>
                ) : (
                  <button type="button" onClick={handleResendOtp} className="font-extrabold text-[#16a34a] hover:underline">
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={onVerifyOtp}
                className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-[#16a34a] py-4 text-base font-bold text-white shadow-[0_8px_20px_rgba(22,163,74,0.18)] transition-all hover:bg-[#15803d]"
              >
                Verify & Continue
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtpDigits(["", "", "", "", "", ""]);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-[16px] border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Change email
              </button>
            </div>
          )}

          <div className="my-5 flex items-center">
            <div className="flex-1 border-t border-slate-200" />
            <span className="rounded-full border border-slate-100 bg-white px-3 py-1 text-[10px] font-bold text-slate-400">OR</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-[#e2f3e8] bg-[#f0f9f4] px-4 py-3 text-[10px] font-bold text-emerald-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 flex-shrink-0 text-[#16a34a]" />
              <span>Secure OTP login for your CouponX account</span>
            </div>
            <span className="text-[#16a34a]">100% Safe</span>
          </div>

          <p className="mt-5 text-center text-sm font-semibold text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#16a34a] hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
