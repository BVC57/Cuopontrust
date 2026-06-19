"use client";

import { useState } from "react";
import { ShieldCheck, Check, ArrowRight, ShieldAlert, X } from "lucide-react";

export default function SafetyPopup({ open, onContinue, onClose }) {
  const [agreed, setAgreed] = useState(false);

  if (!open) {
    return null;
  }

  const rules = [
    { text: "Upload only original and valid coupons.", type: "info" },
    { text: "Screenshot proof is compulsory.", type: "info" },
    { text: "Coupon code, expiry date and amount must match the screenshot.", type: "critical" },
    { text: "Fake coupons reduce your trust score.", type: "warning" },
    { text: "If your trust score falls below 40, your account will be banned.", type: "critical" },
    { text: "Duplicate, expired, and edited screenshots are not allowed.", type: "critical" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl origin-center scale-[0.92] rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-300 sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close popup"
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
        >
          <X className="h-4.5 w-4.5" />
        </button>
        
        {/* Header Icon & Title */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 pr-14">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-[#16a34a]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#16a34a]">
              Coupon Safety Rules
            </p>
            <h3 className="mt-1 text-[2rem] font-black leading-tight text-slate-900">
              Review before you list a coupon
            </h3>
          </div>
        </div>

        {/* Rules List */}
        <div className="mt-5 space-y-2.5">
          {rules.map((rule, index) => {
            const isCritical = rule.type === "critical";
            const isWarning = rule.type === "warning";
            return (
              <div 
                key={index} 
                className={`flex items-start gap-3 rounded-2xl border px-4 py-3 transition-all duration-300 ${
                  isCritical 
                    ? "bg-[#fffafb] border-[#fcecee] text-slate-800" 
                    : isWarning 
                      ? "bg-[#fffefa] border-[#fbf2e2] text-slate-800" 
                      : "bg-[#fcfdfc] border-[#ecf5f0] text-slate-800"
                }`}
              >
                <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isCritical 
                    ? "bg-red-100 text-red-600" 
                    : isWarning 
                      ? "bg-amber-100 text-amber-600" 
                      : "bg-emerald-100 text-emerald-600"
                }`}>
                  {isCritical ? (
                    <ShieldAlert className="h-3.5 w-3.5" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                </div>
                <p className="text-xs font-bold leading-6">
                  {rule.text}
                </p>
              </div>
            );
          })}
        </div>

        {/* Checkbox agreement */}
        <label className="mt-5 flex cursor-pointer items-start gap-3 select-none group">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4.5 w-4.5 rounded border-slate-300 text-[#16a34a] focus:ring-emerald-500/20 focus:ring-offset-0 accent-[#16a34a] transition-all cursor-pointer flex-shrink-0"
          />
          <span className="text-xs font-semibold leading-6 text-slate-500 transition-all group-hover:text-slate-700">
            I have read and agree to all the safety rules. I understand that listing invalid, expired, or manipulated coupons will decrease my trust score, and if my trust score falls below 40, my account will be banned.
          </span>
        </label>

        {/* Submit Action Button */}
        <button
          onClick={onContinue}
          disabled={!agreed}
          className={`mt-5 flex w-full items-center justify-center gap-2 rounded-[16px] py-3.5 text-base font-bold transition-all ${
            agreed 
              ? "bg-[#16a34a] hover:bg-[#15803d] text-white shadow-[0_8px_20px_rgba(22,163,74,0.18)] active:scale-[0.99] cursor-pointer" 
              : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
          }`}
        >
          I Understand & Continue
          <ArrowRight className="h-4.5 w-4.5" />
        </button>

      </div>
    </div>
  );
}
