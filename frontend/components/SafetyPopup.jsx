"use client";

export default function SafetyPopup({ open, onContinue }) {
  if (!open) {
    return null;
  }

  const rules = [
    "Upload only original and valid coupons.",
    "Screenshot proof is compulsory.",
    "Coupon code, expiry date and amount must match the screenshot.",
    "Fake coupons reduce your trust score.",
    "Trust score below 60 will ban your account.",
    "Duplicate, expired, and edited screenshots are not allowed."
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
      <div className="w-full max-w-xl rounded-[28px] bg-white p-8 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-secondary">Coupon Safety Rules</p>
        <h3 className="mt-3 text-2xl font-semibold text-slate-900">Review before you list a coupon</h3>
        <div className="mt-6 space-y-3 text-sm text-slate-600">
          {rules.map((rule) => (
            <p key={rule} className="rounded-2xl bg-slate-50 px-4 py-3">
              {rule}
            </p>
          ))}
        </div>
        <button
          onClick={onContinue}
          className="mt-8 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
        >
          I Understand & Continue
        </button>
      </div>
    </div>
  );
}
