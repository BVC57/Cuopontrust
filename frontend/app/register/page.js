"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Mail, User, ShieldCheck, ArrowRight, ArrowLeft, ShieldAlert } from "lucide-react";
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

const steps = [
  { id: 1, label: "Account" },
  { id: 2, label: "Verify Email" },
  { id: 3, label: "Verify OTP" },
  { id: 4, label: "Complete" }
];

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

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

  const handleSendOtp = async () => {
    if (!email) {
      toast.error("Please enter your email address first.");
      return;
    }
    if (!username) {
      toast.error("Please choose a username first.");
      return;
    }

    setIsSendingOtp(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      await api.post("/auth/send-otp", { email: normalizedEmail });
      setOtpSent(true);
      setTimer(59);
      toast.success("OTP sent to your email");
    } catch (error) {
      toast.error(extractError(error));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !username || !otp) {
      toast.error("Please fill in all the fields.");
      return;
    }

    setIsVerifying(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      // 1. Verify OTP & authenticate
      const { data } = await api.post("/auth/verify-otp", { email: normalizedEmail, otp });
      saveSession({ token: data.token, user: data.user });

      // 2. Set username (which maps to 'name' in database schema)
      try {
        const profileResponse = await api.put("/user/profile", { name: username.trim() });
        saveSession({ token: data.token, user: profileResponse.data.user });
      } catch (profileError) {
        console.error("Profile username update failed:", profileError);
      }

      toast.success("Account created successfully!");
      
      // 3. Redirect based on role
      window.location.href = data.user.role === "super_admin" ? "/admin/dashboard" : "/";
    } catch (error) {
      toast.error(extractError(error));
      setIsVerifying(false);
    }
  };

  const handleGoogleSignIn = () => {
    toast.error("Google sign-up is not configured yet.", {
      icon: "⚙️"
    });
  };

  const formatTimer = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // Determine active step index
  let currentStep = 1;
  if (isVerifying) {
    currentStep = 4;
  } else if (otpSent) {
    currentStep = 3;
  } else if (isSendingOtp) {
    currentStep = 2;
  } else {
    currentStep = 1;
  }

  return (
    <div className="min-h-screen bg-[#edf0f9] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-[500px] bg-white rounded-[32px] border border-[#e2e7f3] p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] flex flex-col transition-all duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between w-full pb-4 border-b border-slate-100">
          <Link href="/">
            <CouponXLogo />
          </Link>
          <div className="text-xs sm:text-sm font-semibold text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-[#16a34a] hover:underline font-bold ml-1">
              Login
            </Link>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="text-center mt-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            <span className="text-[#16a34a]">Create</span> your account
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Join millions of smart buyers and sellers
          </p>
        </div>

        {/* Dynamic Horizontal Progress Steps */}
        <div className="flex items-center justify-between w-full max-w-sm mx-auto mt-6 mb-8 px-2 pb-8">
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;
            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-initial">
                <div className="flex flex-col items-center relative">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted || isActive 
                      ? "bg-[#16a34a] text-white shadow-[0_4px_10px_rgba(22,163,74,0.2)]" 
                      : "bg-white border-2 border-slate-200 text-slate-400"
                  }`}>
                    {step.id}
                  </div>
                  <span className={`text-[10px] mt-1 font-bold whitespace-nowrap absolute top-9 ${
                    isActive ? "text-slate-900 font-extrabold" : "text-slate-400"
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-[2px] flex-1 mx-2 transition-all ${
                    isCompleted ? "bg-[#16a34a]" : "bg-slate-200"
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Nested White Form Card */}
        <div className="bg-[#fafcfa] border border-[#e8f2ec] rounded-[24px] p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Email Address */}
            <label className="block">
              <span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                Email Address
              </span>
              <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-[16px] px-4 py-3.5 focus-within:border-[#16a34a] focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                <Mail className="h-5 w-5 text-slate-400 flex-shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none"
                  disabled={otpSent}
                  required
                />
              </div>
            </label>

            {/* Username */}
            <label className="block">
              <span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                Username
              </span>
              <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-[16px] px-4 py-3.5 focus-within:border-[#16a34a] focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                <User className="h-5 w-5 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a unique username"
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none"
                  disabled={otpSent}
                  required
                />
              </div>
            </label>

            {/* Verify Email with OTP */}
            <label className="block">
              <span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                Verify Email with OTP
              </span>
              <div className="flex items-center bg-white border border-slate-200 rounded-[16px] pl-4 pr-2 py-2 focus-within:border-[#16a34a] focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none tracking-widest"
                  disabled={!otpSent}
                  required={otpSent}
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp || (timer > 0)}
                  className="bg-[#16a34a]/10 hover:bg-[#16a34a]/20 disabled:bg-slate-100 disabled:text-slate-400 text-[#16a34a] px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0"
                >
                  {isSendingOtp ? "Sending..." : timer > 0 ? `Resend (${timer}s)` : "Send OTP"}
                </button>
              </div>
            </label>

            {/* Timer countdown details */}
            {otpSent && (
              <div className="flex items-center justify-between text-xs px-1 text-slate-500 font-semibold">
                <span>We sent a 6-digit OTP to your email</span>
                {timer > 0 && (
                  <span className="text-[#16a34a] font-bold">
                    {formatTimer(timer)}
                  </span>
                )}
              </div>
            )}

            {/* Main Submit Button */}
            <button
              type="submit"
              disabled={isVerifying || !otpSent}
              className="w-full bg-[#16a34a] hover:bg-[#15803d] disabled:bg-slate-300 disabled:text-slate-500 text-white rounded-[16px] py-4 font-bold text-base shadow-[0_8px_20px_rgba(22,163,74,0.18)] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              {isVerifying ? "Verifying..." : "Verify & Continue"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

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
          <div className="mt-5 flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-[10px] font-bold text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#16a34a] flex-shrink-0" />
              <span>Your data is 100% secure with us</span>
            </div>
            <span className="text-slate-400">We never share your information</span>
          </div>
        </div>

      </div>
    </div>
  );
}
