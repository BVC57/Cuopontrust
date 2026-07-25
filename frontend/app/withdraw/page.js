"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ArrowRight, BadgeIndianRupee, Banknote, Building2, CalendarDays, CheckCircle, Clock3, CreditCard, Info, Landmark, ShieldCheck } from "lucide-react";
import AccountShell from "../../components/AccountShell";
import ProtectedRoute from "../../components/ProtectedRoute";
import api, { extractError } from "../../lib/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatDate, formatMoney } from "../../lib/format";

const bankOptions = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Punjab National Bank",
  "Kotak Mahindra Bank",
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank of India",
  "Other Bank"
];

const quickAmounts = [500, 1000, 2000, 5000, 10000];

export default function WithdrawPage() {
  const [wallet, setWallet] = useState(null);
  const [history, setHistory] = useState(null);
  const [method, setMethod] = useState("upi");
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  
  // UPI Verification state
  const [verifyingUpi, setVerifyingUpi] = useState(false);
  const [upiVerified, setUpiVerified] = useState(false);
  const [upiName, setUpiName] = useState("");
  const [upiBank, setUpiBank] = useState("");
  const [upiMobile, setUpiMobile] = useState("");
  const [upiError, setUpiError] = useState("");

  const [bankName, setBankName] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const verifyUpi = async (silent = false) => {
    if (!upiId) {
      if (!silent) toast.error("Please enter a UPI ID first");
      return;
    }
    
    setVerifyingUpi(true);
    setUpiVerified(false);
    setUpiName("");
    setUpiBank("");
    setUpiMobile("");
    setUpiError("");
    
    try {
      const response = await api.post("/wallet/verify-upi", { upiId });
      setUpiVerified(true);
      setUpiName(response.data.name || "Verified User");
      setUpiBank(response.data.bank || "");
      setUpiMobile(response.data.mobile || "");
      if (!silent) toast.success("UPI ID Verified successfully");
    } catch (error) {
      const errorMsg = extractError(error);
      setUpiError(errorMsg);
      if (!silent) toast.error(errorMsg);
      setUpiVerified(false);
    } finally {
      setVerifyingUpi(false);
    }
  };

  useEffect(() => {
    // Auto verify UPI ID if it contains '@' and user has stopped typing for 800ms
    if (upiId && upiId.includes("@") && upiId.split("@")[1].length >= 3) {
      const timeout = setTimeout(() => {
        if (!upiVerified && !verifyingUpi) {
          verifyUpi(true);
        }
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [upiId]);
  const availableBalance = Number(wallet?.availableBalance || 0);
  const withdrawalAmount = Number(amount || 0);
  const canUseQuickAmount = (value) => value <= availableBalance;

  const loadData = () => {
    Promise.all([api.get("/wallet"), api.get("/wallet/history")])
      .then(([walletRes, historyRes]) => {
        setWallet(walletRes.data.wallet);
        setHistory(historyRes.data);
      })
      .catch(() => {
        setWallet({ availableBalance: 0, pendingBalance: 0, totalEarned: 0, currency: "INR" });
        setHistory({ withdrawals: [] });
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      if (withdrawalAmount > availableBalance) {
        toast.error("Amount cannot be more than your available balance");
        return;
      }

      setSubmitting(true);
      await api.post("/wallet/withdraw", {
        method,
        amount: withdrawalAmount,
        upiId: method === "upi" ? upiId.trim() : "",
        bankName: method === "bank" ? bankName.trim() : "",
        accountHolderName: method === "bank" ? accountHolderName.trim() : "",
        accountNumber: method === "bank" ? accountNumber.trim() : "",
        ifscCode: method === "bank" ? ifscCode.trim().toUpperCase() : ""
      });
      toast.success("Withdrawal request submitted");
      setAmount("");
      setUpiId("");
      setBankName("");
      setAccountHolderName("");
      setAccountNumber("");
      setIfscCode("");
      loadData();
    } catch (error) {
      toast.error(extractError(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <AccountShell title="Withdraw" subtitle="Request payouts from your available seller balance.">
        {!wallet || !history ? (
          <LoadingSpinner label="Loading withdrawal details..." />
        ) : (
          <div className="space-y-8">
            <section className="rounded-[30px] border border-emerald-100 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
              <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
                <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Available Balance</p>
                    <p className="mt-3 text-4xl font-black text-[#16a34a]">{formatMoney(wallet.availableBalance, wallet.currency)}</p>
                    <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
                      Minimum withdraw amount: {formatMoney(100, wallet.currency)}
                      <Info className="h-4 w-4" />
                    </p>
                  </div>
                  <div className="flex h-28 w-28 items-center justify-center rounded-[28px] bg-emerald-50 text-[#16a34a]">
                    <Banknote className="h-14 w-14" />
                  </div>
                </div>
                <div className="rounded-[24px] bg-amber-50 p-5">
                  <p className="flex items-center gap-2 text-sm font-black text-amber-900">
                    <Info className="h-4 w-4 text-amber-500" />
                    Important Notes
                  </p>
                  <ul className="mt-4 space-y-2 text-sm font-semibold leading-6 text-slate-600">
                    <li>Withdrawals are processed after admin review.</li>
                    <li>Only one clear payout method should be submitted.</li>
                    <li>Ensure your UPI or bank details are correct.</li>
                    <li>No withdrawal charges are shown at request time.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="grid gap-6 md:grid-cols-3">
              {[
                ["Pending Balance", wallet.pendingBalance],
                ["Total Earned", wallet.totalEarned],
                ["Requested Withdrawals", (history.withdrawals || []).reduce((sum, item) => sum + Number(item.amount || 0), 0)]
              ].map(([label, value]) => (
                <div key={label} className="rounded-[26px] border border-emerald-100 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-3 text-2xl font-black text-slate-900">{formatMoney(value, wallet.currency)}</p>
                </div>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.55fr_0.75fr]">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900">1. Select Withdrawal Method</h2>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {[
                      { key: "upi", title: "UPI", description: "Instant transfer to your UPI ID", badge: "Instant", icon: BadgeIndianRupee },
                      { key: "bank", title: "Bank Account", description: "Transfer to your bank account", badge: "1-2 Business Days", icon: Landmark }
                    ].map((item) => {
                      const Icon = item.icon;
                      const active = method === item.key;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setMethod(item.key)}
                          className={`flex min-h-[142px] items-center gap-4 rounded-[24px] border p-5 text-left transition ${active ? "border-[#16a34a] bg-emerald-50/40 shadow-[0_14px_30px_rgba(22,163,74,0.08)]" : "border-slate-200 bg-white hover:border-emerald-200"}`}
                        >
                          <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${active ? "border-[#16a34a] bg-[#16a34a]" : "border-slate-300 bg-white"}`}>
                            {active ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
                          </span>
                          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#16a34a] shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
                            <Icon className="h-7 w-7" />
                          </span>
                          <span>
                            <span className="block text-base font-black text-slate-900">{item.title}</span>
                            <span className="mt-2 block text-sm font-semibold leading-6 text-slate-500">{item.description}</span>
                            <span className="mt-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-[#16a34a]">{item.badge}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <form onSubmit={onSubmit} className="rounded-[30px] border border-emerald-100 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
                  <h2 className="text-xl font-black text-slate-900">2. Enter {method === "upi" ? "UPI" : "Bank"} Details</h2>

                  <div className="mt-6 space-y-5">
                    {method === "upi" ? (
                      <label className="block">
                        <span className="mb-2 block text-sm font-black text-slate-700">UPI ID</span>
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={upiId}
                            onChange={(event) => {
                              setUpiId(event.target.value);
                              setUpiVerified(false);
                              setUpiName("");
                              setUpiError("");
                            }}
                            className={`flex-1 rounded-2xl border bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-900 outline-none transition focus:bg-white focus:ring-4 ${upiError ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200 focus:border-[#16a34a] focus:ring-emerald-500/10"}`}
                            placeholder="Enter your UPI ID (e.g. name@paytm)"
                            required={method === "upi"}
                          />
                          <button
                            type="button"
                            onClick={() => verifyUpi(false)}
                            disabled={!upiId || verifyingUpi || upiVerified}
                            className={`rounded-2xl px-6 py-4 text-sm font-black transition ${
                              upiVerified
                                ? "bg-emerald-100 text-[#16a34a]"
                                : verifyingUpi
                                ? "bg-slate-100 text-slate-400"
                                : "bg-slate-900 text-white hover:bg-slate-800"
                            }`}
                          >
                            {upiVerified ? "Verified" : verifyingUpi ? "Verifying..." : "Verify"}
                          </button>
                        </div>
                        {upiError && (
                          <div className="mt-2 text-sm font-semibold text-red-500">
                            {upiError}
                          </div>
                        )}
                        {upiVerified && upiName && (
                          <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 shadow-sm">
                            <div className="flex items-center gap-2 text-emerald-800">
                              <CheckCircle className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                              <span className="text-sm font-black uppercase tracking-wider text-emerald-700">NPCI Verified Account</span>
                            </div>
                            <div className="mt-3 grid gap-2 sm:grid-cols-3 text-xs font-semibold text-slate-700">
                              <div className="rounded-xl bg-white/80 p-2.5 border border-emerald-100">
                                <span className="block text-[10px] font-extrabold uppercase text-slate-400">Account Holder</span>
                                <span className="mt-1 block font-black text-slate-900">{upiName}</span>
                              </div>
                              <div className="rounded-xl bg-white/80 p-2.5 border border-emerald-100">
                                <span className="block text-[10px] font-extrabold uppercase text-slate-400">Linked Bank</span>
                                <span className="mt-1 block font-black text-emerald-800">{upiBank || "NPCI Bank"}</span>
                              </div>
                              <div className="rounded-xl bg-white/80 p-2.5 border border-emerald-100">
                                <span className="block text-[10px] font-extrabold uppercase text-slate-400">Linked Mobile</span>
                                <span className="mt-1 block font-black text-slate-900">{upiMobile || "+91 98*** **571"}</span>
                              </div>
                            </div>
                          </div>
                        )}
                        {!upiVerified && (
                          <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
                            <Info className="h-4 w-4" />
                            Money will be sent to this UPI ID after approval. Please verify it first.
                          </p>
                        )}
                      </label>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="block">
                          <span className="mb-2 block text-sm font-black text-slate-700">Bank Name</span>
                          <select
                            value={bankName}
                            onChange={(event) => setBankName(event.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#16a34a] focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                            required={method === "bank"}
                          >
                            <option value="">Select bank name</option>
                            {bankOptions.map((name) => <option key={name} value={name}>{name}</option>)}
                          </select>
                        </label>
                        <label className="block">
                          <span className="mb-2 block text-sm font-black text-slate-700">Account Holder Name</span>
                          <input
                            type="text"
                            value={accountHolderName}
                            onChange={(event) => setAccountHolderName(event.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#16a34a] focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                            placeholder="Enter account holder name"
                            required={method === "bank"}
                          />
                        </label>
                        <label className="block">
                          <span className="mb-2 block text-sm font-black text-slate-700">Account Number</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={accountNumber}
                            onChange={(event) => setAccountNumber(event.target.value.replace(/\D/g, ""))}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#16a34a] focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                            placeholder="Enter account number"
                            required={method === "bank"}
                          />
                        </label>
                        <label className="block">
                          <span className="mb-2 block text-sm font-black text-slate-700">IFSC Code</span>
                          <input
                            type="text"
                            value={ifscCode}
                            onChange={(event) => setIfscCode(event.target.value.toUpperCase())}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold uppercase text-slate-900 outline-none transition focus:border-[#16a34a] focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                            placeholder="Enter IFSC code"
                            required={method === "bank"}
                          />
                        </label>
                      </div>
                    )}

                    <label className="block">
                      <span className="mb-2 block text-sm font-black text-slate-700">Withdraw Amount</span>
                      <div className="flex overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 focus-within:border-[#16a34a] focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/10">
                        <span className="flex w-14 items-center justify-center border-r border-slate-200 text-lg font-black text-slate-500">₹</span>
                        <input
                          type="number"
                          min="1"
                          max={availableBalance || undefined}
                          value={amount}
                          onChange={(event) => setAmount(event.target.value)}
                          className="min-w-0 flex-1 bg-transparent px-4 py-4 text-sm font-semibold text-slate-900 outline-none"
                          placeholder="Enter amount"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setAmount(String(availableBalance))}
                          className="m-2 rounded-xl bg-white px-4 text-xs font-black text-slate-600 shadow-sm"
                        >
                          Max ({formatMoney(availableBalance, wallet.currency)})
                        </button>
                      </div>
                    </label>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                      {quickAmounts.map((value) => (
                        <button
                          key={value}
                          type="button"
                          disabled={!canUseQuickAmount(value)}
                          onClick={() => setAmount(String(value))}
                          className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-black text-[#16a34a] disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-50 disabled:text-slate-300"
                        >
                          ₹{value.toLocaleString("en-IN")}
                        </button>
                      ))}
                    </div>

                    <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-black text-slate-500">You Will Receive</p>
                        <p className="mt-3 text-3xl font-black text-[#16a34a]">{formatMoney(withdrawalAmount, wallet.currency)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-500">Processing Fee</p>
                        <p className="mt-3 text-sm font-black text-slate-900">{formatMoney(0, wallet.currency)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-500">Total Deduction</p>
                        <p className="mt-3 text-sm font-black text-slate-900">{formatMoney(withdrawalAmount, wallet.currency)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-bold text-slate-600">
                      <ShieldCheck className="h-4 w-4 flex-shrink-0 text-[#16a34a]" />
                      Your money is safe with us. We protect payout requests with admin review.
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || (method === "upi" && !upiVerified)}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#16a34a] to-[#22c55e] px-5 py-4 text-base font-black text-white shadow-[0_12px_24px_rgba(34,197,94,0.18)] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {submitting ? "Submitting..." : (method === "upi" && !upiVerified) ? "Verify UPI ID First" : "Withdraw Now"}
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                </form>
              </div>

              <aside className="rounded-[30px] border border-emerald-100 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.05)] xl:sticky xl:top-24 xl:self-start">
                <h2 className="text-xl font-black text-slate-900">Withdrawal Information</h2>
                <div className="mt-6 divide-y divide-slate-100">
                  {[
                    [BadgeIndianRupee, "Minimum Amount", formatMoney(100, wallet.currency)],
                    [Clock3, "Processing Time", method === "upi" ? "Instant after approval" : "1-2 business days"],
                    [CalendarDays, "Available Days", "All days"],
                    [CreditCard, "Withdrawal Limit", "Available balance"],
                    [Building2, "Selected Method", method === "upi" ? "UPI" : "Bank Account"]
                  ].map(([Icon, label, value]) => (
                    <div key={label} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-[#16a34a]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block text-sm font-black text-slate-700">{label}</span>
                        <span className="mt-1 block text-sm font-semibold leading-6 text-slate-500">{value}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </aside>
            </section>

            <section className="rounded-[30px] border border-emerald-100 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
              <h2 className="text-2xl font-black text-slate-900">Withdrawal history</h2>
              {(history.withdrawals || []).length ? (
                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="text-left text-slate-400">
                      <tr>
                        <th className="pb-3 font-semibold">Amount</th>
                        <th className="pb-3 font-semibold">Method</th>
                        <th className="pb-3 font-semibold">UPI / Bank</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(history.withdrawals || []).map((item) => (
                        <tr key={item._id}>
                          <td className="py-4 text-slate-900">{formatMoney(item.amount, item.currency || "INR")}</td>
                          <td className="py-4 capitalize text-slate-700">{item.method || (item.upiId ? "upi" : "bank")}</td>
                          <td className="py-4 text-slate-700">{item.upiId || item.bankDetails || "-"}</td>
                          <td className="py-4 capitalize text-slate-500">{item.status}</td>
                          <td className="py-4 text-slate-500">{formatDate(item.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-6 rounded-3xl border border-dashed border-emerald-200 px-6 py-10 text-center">
                  <p className="text-xl font-black text-slate-900">No withdrawal requests yet</p>
                  <p className="mt-2 text-sm text-slate-500">Withdrawal requests created by this user will appear here.</p>
                </div>
              )}
            </section>
          </div>
        )}
      </AccountShell>
    </ProtectedRoute>
  );
}
