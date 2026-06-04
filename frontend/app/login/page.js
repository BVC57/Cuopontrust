"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { ArrowLeft, Mail, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import api, { extractError } from "../../lib/api";
import { saveSession } from "../../lib/auth";

const trustPoints = [
  "OTP login only, no passwords to remember",
  "Verified buyer and seller access",
  "Secure coupon marketplace with protected payouts"
];

export default function LoginPage() {
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState("");
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSendOtp = async ({ email }) => {
    try {
      await api.post("/auth/send-otp", { email });
      setEmail(email);
      setOtpSent(true);
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.16),transparent_22%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_18%),linear-gradient(180deg,#fafffb_0%,#f3fbf5_45%,#ffffff_100%)]">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 sm:px-6">
        <div className="grid w-full gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="hidden rounded-[32px] bg-gradient-to-br from-[#0f7a45] via-[#16a34a] to-[#22c55e] p-8 text-white shadow-[0_30px_80px_rgba(22,163,74,0.24)] lg:flex lg:flex-col lg:justify-between">
            <div>
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-50">
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>
              <p className="mt-10 text-2xl font-black tracking-tight">
                Coupon<span className="text-emerald-100">X</span>
              </p>
              <h1 className="mt-8 max-w-md text-5xl font-black leading-[1.05]">
                Sign in and start saving smarter.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-8 text-emerald-50/90">
                Access verified coupons, secure buying flows, and seller earnings with a fast OTP-only login.
              </p>
            </div>

            <div className="space-y-4">
              {trustPoints.map((item, index) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur">
                  {index === 0 ? <Mail className="mt-0.5 h-5 w-5 text-white" /> : index === 1 ? <ShieldCheck className="mt-0.5 h-5 w-5 text-white" /> : <Sparkles className="mt-0.5 h-5 w-5 text-white" />}
                  <p className="text-sm font-medium text-white/95">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex items-center justify-center">
            <div className="w-full max-w-xl rounded-[32px] border border-emerald-100 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-10">
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 lg:hidden">
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>

              <div className="mt-4 lg:mt-0">
                <div className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-[#16a34a]">
                  Email OTP Login
                </div>
                <h2 className="mt-6 text-4xl font-black tracking-tight text-slate-950">
                  {otpSent ? "Enter the OTP" : "Welcome back"}
                </h2>
                <p className="mt-4 text-base leading-8 text-slate-500">
                  {otpSent
                    ? `We sent a 6-digit OTP to ${email}. Enter it below to continue.`
                    : "Enter your email to receive a one-time password and access your buyer-seller dashboard."}
                </p>
              </div>

              {!otpSent ? (
                <form onSubmit={handleSubmit(onSendOtp)} className="mt-8 space-y-5">
                  <label className="block">
                    <span className="mb-3 block text-sm font-bold text-slate-700">Email address</span>
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <Mail className="h-5 w-5 text-slate-400" />
                      <input
                        {...register("email", { required: true })}
                        type="email"
                        placeholder="you@example.com"
                        className="min-w-0 flex-1 bg-transparent text-base outline-none"
                      />
                    </div>
                  </label>

                  <button
                    disabled={isSubmitting}
                    className="w-full rounded-2xl bg-gradient-to-r from-[#16a34a] to-[#22c55e] px-4 py-4 text-base font-bold text-white shadow-[0_14px_30px_rgba(34,197,94,0.22)]"
                  >
                    {isSubmitting ? "Sending OTP..." : "Send OTP"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSubmit(onVerifyOtp)} className="mt-8 space-y-5">
                  <label className="block">
                    <span className="mb-3 block text-sm font-bold text-slate-700">One-time password</span>
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <ShieldCheck className="h-5 w-5 text-slate-400" />
                      <input
                        {...register("otp", { required: true })}
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        className="min-w-0 flex-1 bg-transparent text-base tracking-[0.3em] outline-none"
                      />
                    </div>
                  </label>

                  <button
                    disabled={isSubmitting}
                    className="w-full rounded-2xl bg-gradient-to-r from-[#16a34a] to-[#22c55e] px-4 py-4 text-base font-bold text-white shadow-[0_14px_30px_rgba(34,197,94,0.22)]"
                  >
                    {isSubmitting ? "Verifying..." : "Verify OTP"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-base font-bold text-slate-700"
                  >
                    Change email
                  </button>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
