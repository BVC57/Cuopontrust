"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  Tag, 
  Sparkles, 
  KeyRound, 
  Coins, 
  Calendar, 
  Globe, 
  CircleDollarSign, 
  FileText, 
  Upload, 
  ShieldCheck, 
  ShieldAlert, 
  Loader2, 
  Check, 
  X,
  ArrowRight,
  Info
} from "lucide-react";
import toast from "react-hot-toast";
import ProtectedRoute from "../../components/ProtectedRoute";
import SafetyPopup from "../../components/SafetyPopup";
import UploadBox from "../../components/UploadBox";
import api, { extractError } from "../../lib/api";
import { brandCatalog } from "../../lib/brandCatalog";

const defaultCategories = [
  "Electronics",
  "Food",
  "Fashion",
  "Travel",
  "Entertainment",
  "Gaming"
];

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
  const router = useRouter();
  const [popupOpen, setPopupOpen] = useState(true);
  const [file, setFile] = useState(null);
  
  // Controlled form states
  const [platformName, setPlatformName] = useState("");
  const [title, setTitle] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponAmount, setCouponAmount] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [country, setCountry] = useState("India");
  const [currency, setCurrency] = useState("INR");
  const [terms, setTerms] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [customCategory, setCustomCategory] = useState("");

  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  
  // Verification steps tracking state
  const [stepsList, setStepsList] = useState(
    aiSteps.map(name => ({ name, status: "pending", details: "" }))
  );

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]
    );
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please upload a coupon screenshot");
      return;
    }
    if (!selectedCategories.length && !customCategory.trim()) {
      toast.error("Please select at least one category");
      return;
    }

    setChecking(true);
    setResult(null);

    // Initialize checking steps structure
    setStepsList(
      aiSteps.map((name, i) => ({
        name,
        status: i === 0 ? "checking" : "pending",
        details: ""
      }))
    );

    // Create form data
    const formData = new FormData();
    formData.append("platformName", platformName);
    formData.append("title", title);
    formData.append("couponCode", couponCode);
    formData.append("couponAmount", couponAmount);
    formData.append("sellingPrice", sellingPrice);
    formData.append("expiryDate", expiryDate);
    formData.append("country", country);
    formData.append("currency", currency);
    formData.append("terms", terms);
    formData.append("categories", JSON.stringify(selectedCategories));
    formData.append("customCategory", customCategory.trim());
    formData.append("proofImage", file);

    let apiResolved = false;
    let apiSuccess = false;
    let apiData = null;
    let apiErrorMsg = "";

    // Launch API call in background
    const apiPromise = api.post("/coupons/sell", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
    .then((res) => {
      apiResolved = true;
      apiSuccess = true;
      apiData = res.data;
      return res.data;
    })
    .catch((err) => {
      apiResolved = true;
      apiSuccess = false;
      apiData = err?.response?.data || {};
      apiErrorMsg = extractError(err);
      throw err;
    });

    // Run animation steps
    let currentStep = 0;

    const runAnimation = async () => {
      while (currentStep < 8) {
        // Step checking duration
        const duration = currentStep === 0 || currentStep === 1 || currentStep === 7 ? 800 : 500;
        await new Promise((resolve) => setTimeout(resolve, duration));

        setStepsList((prev) => {
          const next = [...prev];
          const nextStep = next[currentStep + 1];

          if (currentStep === 0 || currentStep === 1) {
            // Upload & Data extraction always succeed to initiate scanning
            next[currentStep].status = "success";
            if (nextStep) {
              nextStep.status = "checking";
            }
          } else {
            // Steps 2-7 need actual API response
            if (apiResolved) {
              const aiResult = apiData?.aiResult || {};
              const checks = aiResult.checks || {};

              let stepPass = true;
              let stepDetails = "";

              if (currentStep === 2) {
                stepPass = !!checks.couponCodeMatch;
                stepDetails = stepPass ? "Codes match perfectly" : `Mismatch (Expected: ${couponCode}, Found: ${aiResult.extractedData?.couponCode || "None"})`;
              } else if (currentStep === 3) {
                stepPass = !!checks.expiryDateMatch;
                stepDetails = stepPass ? "Dates match perfectly" : `Mismatch (Expected: ${expiryDate}, Found: ${aiResult.extractedData?.expiryDate ? new Date(aiResult.extractedData.expiryDate).toLocaleDateString() : "None"})`;
              } else if (currentStep === 4) {
                stepPass = !!checks.amountMatch;
                stepDetails = stepPass ? "Amounts match perfectly" : `Mismatch (Expected: ${couponAmount}, Found: ${aiResult.extractedData?.couponAmount || "None"})`;
              } else if (currentStep === 5) {
                stepPass = !apiErrorMsg.includes("already listed");
                stepDetails = stepPass ? "No duplicate coupon code hash found" : "Duplicate code hash detected";
              } else if (currentStep === 6) {
                stepPass = !apiErrorMsg.includes("Expired coupons");
                stepDetails = stepPass ? "Coupon is active and valid" : "Coupon has expired";
              } else if (currentStep === 7) {
                stepPass = aiResult.screenshotTamperRisk !== "critical";
                stepDetails = `Tamper risk level: ${aiResult.screenshotTamperRisk?.toUpperCase() || "LOW"}`;
              }

              next[currentStep].status = stepPass ? "success" : "error";
              next[currentStep].details = stepDetails;
              if (nextStep) {
                nextStep.status = "checking";
              }
            } else {
              // Pause animation loop until API finishes
              return prev;
            }
          }
          return next;
        });

        if (currentStep < 2 || apiResolved) {
          currentStep++;
        } else {
          // Check API again in 200ms
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }

      // Step 8: Final results summary
      setStepsList((prev) => {
        const next = [...prev];
        next[8].status = apiSuccess ? "success" : "error";
        next[8].details = apiSuccess ? "Coupon listed successfully" : apiErrorMsg;
        return next;
      });

      if (apiSuccess) {
        setResult({ success: true, ...apiData });
        toast.success("Coupon listed successfully");
        setTimeout(() => {
          router.push("/listed-coupons");
        }, 1200);
      } else {
        setResult({ success: false, message: apiErrorMsg, data: apiData });
        toast.error(apiErrorMsg);
      }
      setChecking(false);
    };

    runAnimation();
  };

  return (
    <ProtectedRoute>
      <SafetyPopup open={popupOpen} onContinue={() => setPopupOpen(false)} />
      
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 font-sans">
        
        {/* Page Titles */}
        <div className="mb-8">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#16a34a]">
            Sell Coupon
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            List a coupon with AI verification
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-2xl">
            Upload your unused coupon screenshot. Our advanced AI scans it in real-time for validity, matching code, and security indicators before listing.
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          
          {/* Left Column: Form Fields */}
          <div className="rounded-[32px] border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.02)]">
            <form onSubmit={onSubmit} className="space-y-5">
              
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Platform Name */}
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Platform Name</span>
                  <div className="flex items-center gap-3 bg-[#fafcfa] border border-slate-200 rounded-[16px] px-4 py-3.5 focus-within:border-[#16a34a] focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                    <Tag className="h-5 w-5 text-slate-400 flex-shrink-0" />
                    <select
                      value={platformName}
                      onChange={(e) => setPlatformName(e.target.value)}
                      className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 outline-none"
                      required
                      disabled={checking}
                    >
                      <option value="">Select company</option>
                      {brandCatalog.map((brand) => (
                        <option key={brand.key} value={brand.label}>
                          {brand.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </label>

                {/* Coupon Title */}
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Coupon Title</span>
                  <div className="flex items-center gap-3 bg-[#fafcfa] border border-slate-200 rounded-[16px] px-4 py-3.5 focus-within:border-[#16a34a] focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                    <Sparkles className="h-5 w-5 text-slate-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Rs 150 OFF Food Delivery"
                      className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none"
                      required
                      disabled={checking}
                    />
                  </div>
                </label>

                {/* Coupon Code */}
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Coupon Code</span>
                  <div className="flex items-center gap-3 bg-[#fafcfa] border border-slate-200 rounded-[16px] px-4 py-3.5 focus-within:border-[#16a34a] focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                    <KeyRound className="h-5 w-5 text-slate-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter the actual code"
                      className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none"
                      required
                      disabled={checking}
                    />
                  </div>
                </label>

                {/* Coupon Amount */}
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Coupon Value Amount</span>
                  <div className="flex items-center gap-3 bg-[#fafcfa] border border-slate-200 rounded-[16px] px-4 py-3.5 focus-within:border-[#16a34a] focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                    <Coins className="h-5 w-5 text-slate-400 flex-shrink-0" />
                    <input
                      type="number"
                      value={couponAmount}
                      onChange={(e) => setCouponAmount(e.target.value)}
                      placeholder="e.g. 150"
                      className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none"
                      required
                      disabled={checking}
                    />
                  </div>
                </label>

                {/* Selling Price */}
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Selling Price</span>
                  <div className="flex items-center gap-3 bg-[#fafcfa] border border-slate-200 rounded-[16px] px-4 py-3.5 focus-within:border-[#16a34a] focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                    <Coins className="h-5 w-5 text-slate-400 flex-shrink-0" />
                    <input
                      type="number"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value)}
                      placeholder="Selling price (in coins)"
                      className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none"
                      required
                      disabled={checking}
                    />
                  </div>
                </label>

                {/* Expiry Date */}
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Expiry Date</span>
                  <div className="flex items-center gap-3 bg-[#fafcfa] border border-slate-200 rounded-[16px] px-4 py-3.5 focus-within:border-[#16a34a] focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                    <Calendar className="h-5 w-5 text-slate-400 flex-shrink-0" />
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 outline-none cursor-pointer"
                      required
                      disabled={checking}
                    />
                  </div>
                </label>

                {/* Country */}
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Country</span>
                  <div className="flex items-center gap-3 bg-[#fafcfa] border border-slate-200 rounded-[16px] px-4 py-3.5 focus-within:border-[#16a34a] focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                    <Globe className="h-5 w-5 text-slate-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g. India"
                      className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none"
                      required
                      disabled={checking}
                    />
                  </div>
                </label>

                {/* Currency */}
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Currency</span>
                  <div className="flex items-center gap-3 bg-[#fafcfa] border border-slate-200 rounded-[16px] px-4 py-3.5 focus-within:border-[#16a34a] focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                    <CircleDollarSign className="h-5 w-5 text-slate-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      placeholder="e.g. INR"
                      className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none"
                      required
                      disabled={checking}
                    />
                  </div>
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Categories</span>
                  <div className="flex flex-wrap gap-2">
                    {defaultCategories.map((category) => {
                      const active = selectedCategories.includes(category);
                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => toggleCategory(category)}
                          disabled={checking}
                          className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                            active
                              ? "bg-emerald-600 text-white shadow-[0_10px_22px_rgba(22,163,74,0.2)]"
                              : "border border-slate-200 bg-white text-slate-600"
                          }`}
                        >
                          {category}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Custom Category</span>
                  <div className="flex items-center gap-3 bg-[#fafcfa] border border-slate-200 rounded-[16px] px-4 py-3.5 focus-within:border-[#16a34a] focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                    <Tag className="h-5 w-5 text-slate-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Add custom category if not listed"
                      className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none"
                      disabled={checking}
                    />
                  </div>
                </label>
              </div>

              {/* Terms and Conditions */}
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Terms and Conditions</span>
                <div className="flex items-start gap-3 bg-[#fafcfa] border border-slate-200 rounded-[16px] px-4 py-3.5 focus-within:border-[#16a34a] focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                  <FileText className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <textarea
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    placeholder="Provide rules, minimum cart values, etc. (Photoshop mention flags risk checks!)"
                    className="min-h-[100px] flex-1 bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none resize-none"
                    disabled={checking}
                  />
                </div>
              </label>

              {/* Upload screenshot */}
              <div>
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Upload Coupon Screenshot</span>
                <UploadBox onChange={(e) => setFile(e.target.files?.[0] || null)} fileName={file?.name} />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={checking}
                className="w-full bg-[#16a34a] hover:bg-[#15803d] disabled:bg-slate-300 disabled:text-slate-500 text-white rounded-[16px] py-4 font-bold text-base shadow-[0_8px_20px_rgba(22,163,74,0.18)] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                {checking ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    AI Verification In Progress...
                  </>
                ) : (
                  <>
                    Submit & Start AI Verification
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: AI Verification Steps / Information Box */}
          <div className="flex flex-col gap-6">
            
            {/* AI Verification Loader Panel */}
            {checking || stepsList.some(s => s.status !== "pending") ? (
              <div className="rounded-[32px] border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
                  <div className="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center text-[#16a34a]">
                    <Loader2 className={`h-5 w-5 ${checking ? "animate-spin" : ""}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">AI Verification Progress</h3>
                    <p className="text-xs text-slate-400 font-semibold">Scanning coupon fields and security status</p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {stepsList.map((step, index) => {
                    const isPending = step.status === "pending";
                    const isChecking = step.status === "checking";
                    const isSuccess = step.status === "success";
                    const isError = step.status === "error";

                    return (
                      <div 
                        key={step.name} 
                        className={`flex items-start gap-4 rounded-[20px] border p-4 transition-all duration-300 ${
                          isChecking 
                            ? "bg-[#f4fbf7] border-[#e2f5eb] animate-pulse" 
                            : isSuccess 
                              ? "bg-[#fafcfa] border-[#ecf6f0]" 
                              : isError 
                                ? "bg-[#fffafa] border-[#fcecee]" 
                                : "bg-white border-slate-100 opacity-60"
                        }`}
                      >
                        {/* Status Icon */}
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                          isPending 
                            ? "bg-slate-100 text-slate-400" 
                            : isChecking 
                              ? "bg-emerald-100 text-[#16a34a]" 
                              : isSuccess 
                                ? "bg-emerald-500 text-white shadow-[0_4px_10px_rgba(16,185,129,0.2)]" 
                                : "bg-red-500 text-white shadow-[0_4px_10px_rgba(239,68,68,0.2)]"
                        }`}>
                          {isChecking ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : isSuccess ? (
                            <Check className="h-4.5 w-4.5" />
                          ) : isError ? (
                            <X className="h-4.5 w-4.5" />
                          ) : (
                            index + 1
                          )}
                        </div>

                        {/* Step details */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold ${
                            isChecking 
                              ? "text-slate-900" 
                              : isSuccess 
                                ? "text-slate-800" 
                                : isError 
                                  ? "text-red-800 font-extrabold" 
                                  : "text-slate-400"
                          }`}>
                            {step.name}
                          </p>
                          {step.details && (
                            <p className={`text-xs mt-1 font-semibold leading-relaxed ${
                              isError ? "text-red-500" : "text-slate-500"
                            }`}>
                              {step.details}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Static Result Display */}
            {result && !checking ? (
              <div className={`rounded-[32px] p-6 sm:p-8 border shadow-soft ${
                result.success 
                  ? "bg-[#f4fbf7] border-[#e2f5eb] text-emerald-900" 
                  : "bg-[#fffafa] border-[#fcecee] text-red-900"
              }`}>
                <div className="flex items-center gap-3">
                  {result.success ? (
                    <ShieldCheck className="h-7 w-7 text-[#16a34a] flex-shrink-0" />
                  ) : (
                    <ShieldAlert className="h-7 w-7 text-red-500 flex-shrink-0" />
                  )}
                  <h3 className="text-xl font-extrabold">
                    {result.success ? "Coupon Verified & Listed!" : "Listing Verification Failed"}
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed font-semibold opacity-90">
                  {result.success 
                    ? "Congratulations! Our AI successfully matched all parameters and security flags. Your coupon has been listed in the Marketplace." 
                    : result.message}
                </p>
              </div>
            ) : null}

            {/* Info Cards Panel */}
            <div className="rounded-[32px] border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                <Info className="h-5 w-5 text-[#16a34a] flex-shrink-0" />
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                  Verification Rules
                </h3>
              </div>
              <div className="space-y-4 text-xs font-semibold text-slate-500">
                <div className="flex gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#16a34a] mt-1.5 flex-shrink-0" />
                  <p>Screenshot proof must be a direct copy of the original coupon showing code, expiration date, and coupon amount clearly.</p>
                </div>
                <div className="flex gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#16a34a] mt-1.5 flex-shrink-0" />
                  <p>Our automated AI system scans and compares all user text inputs directly with values extracted from the image proof.</p>
                </div>
                <div className="flex gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#16a34a] mt-1.5 flex-shrink-0" />
                  <p>Edited, photo-manipulated, duplicate, or expired screenshot uploads will result in automated listing rejection and trust score penalties.</p>
                </div>
                <div className="flex gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#16a34a] mt-1.5 flex-shrink-0" />
                  <p>Keep your Trust Score above 60 to prevent seller dashboard lockouts or automatic account bans.</p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </ProtectedRoute>
  );
}
