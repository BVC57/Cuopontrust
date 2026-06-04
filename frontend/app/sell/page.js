"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import ProtectedRoute from "../../components/ProtectedRoute";
import SafetyPopup from "../../components/SafetyPopup";
import UploadBox from "../../components/UploadBox";
import api, { extractError } from "../../lib/api";

const aiSteps = [
  "Uploading screenshot",
  "Extracting coupon data",
  "Matching coupon code",
  "Matching expiry date",
  "Matching amount",
  "Checking duplicate coupon",
  "Checking expired coupon",
  "Checking screenshot tampering",
  "Final verification result"
];

export default function SellPage() {
  const [popupOpen, setPopupOpen] = useState(true);
  const [file, setFile] = useState(null);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async (values) => {
    if (!file) {
      toast.error("Upload a coupon screenshot");
      return;
    }
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.append(key, value));
    formData.append("proofImage", file);

    try {
      setChecking(true);
      setResult(null);
      const { data } = await api.post("/coupons/sell", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResult({ success: true, ...data });
      toast.success("Coupon listed successfully");
    } catch (error) {
      setResult({ success: false, message: extractError(error), data: error?.response?.data });
      toast.error(extractError(error));
    } finally {
      setChecking(false);
    }
  };

  return (
    <ProtectedRoute>
      <SafetyPopup open={popupOpen} onContinue={() => setPopupOpen(false)} />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="rounded-[32px] border border-white/70 bg-white p-8 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-secondary">Sell coupon</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">List a coupon with AI verification</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-4 md:grid-cols-2">
            <input {...register("platformName", { required: true })} placeholder="Platform name" className="rounded-2xl border border-slate-200 px-4 py-3" />
            <input {...register("title", { required: true })} placeholder="Coupon title" className="rounded-2xl border border-slate-200 px-4 py-3" />
            <input {...register("couponCode", { required: true })} placeholder="Coupon code" className="rounded-2xl border border-slate-200 px-4 py-3" />
            <input {...register("couponAmount", { required: true })} placeholder="Coupon amount" type="number" className="rounded-2xl border border-slate-200 px-4 py-3" />
            <input {...register("sellingPrice", { required: true })} placeholder="Selling price" type="number" className="rounded-2xl border border-slate-200 px-4 py-3" />
            <input {...register("expiryDate", { required: true })} type="date" className="rounded-2xl border border-slate-200 px-4 py-3" />
            <input {...register("country", { required: true })} placeholder="Country" className="rounded-2xl border border-slate-200 px-4 py-3" />
            <input {...register("currency", { required: true })} placeholder="Currency" className="rounded-2xl border border-slate-200 px-4 py-3" />
            <textarea {...register("terms")} placeholder="Terms and conditions" className="min-h-32 rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2" />
            <div className="md:col-span-2">
              <UploadBox onChange={(event) => setFile(event.target.files?.[0] || null)} fileName={file?.name} />
            </div>
            <button disabled={isSubmitting || checking} className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white md:col-span-2">
              {checking ? "Running AI verification..." : "Submit coupon"}
            </button>
          </form>

          {checking ? (
            <div className="mt-8 rounded-[28px] bg-slate-50 p-6">
              <p className="text-sm font-medium text-slate-900">AI verification progress</p>
              <div className="mt-4 grid gap-3">
                {aiSteps.map((step, index) => (
                  <div key={step} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-slate-600">
                    <div className="h-7 w-7 rounded-full bg-slate-900/5 text-center leading-7 text-xs font-semibold text-slate-700">{index + 1}</div>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {result ? (
            <div className={`mt-8 rounded-[28px] p-6 ${result.success ? "bg-emerald-50" : "bg-rose-50"}`}>
              <p className="text-lg font-semibold text-slate-900">{result.success ? "Coupon verified and listed" : "Verification failed"}</p>
              <p className="mt-2 text-sm text-slate-600">{result.message}</p>
            </div>
          ) : null}
        </div>
      </div>
    </ProtectedRoute>
  );
}
