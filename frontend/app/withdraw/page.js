"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AccountShell from "../../components/AccountShell";
import ProtectedRoute from "../../components/ProtectedRoute";
import api, { extractError } from "../../lib/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatDate, formatMoney } from "../../lib/format";

export default function WithdrawPage() {
  const [wallet, setWallet] = useState(null);
  const [history, setHistory] = useState(null);
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [bankDetails, setBankDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      setSubmitting(true);
      await api.post("/wallet/withdraw", {
        amount: Number(amount),
        upiId,
        bankDetails
      });
      toast.success("Withdrawal request submitted");
      setAmount("");
      setUpiId("");
      setBankDetails("");
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
            <section className="grid gap-6 md:grid-cols-3">
              {[
                ["Available Balance", wallet.availableBalance],
                ["Pending Balance", wallet.pendingBalance],
                ["Total Earned", wallet.totalEarned]
              ].map(([label, value]) => (
                <div key={label} className="rounded-[30px] border border-emerald-100 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-3 text-3xl font-black text-slate-900">{formatMoney(value, wallet.currency)}</p>
                </div>
              ))}
            </section>

            <section className="rounded-[30px] border border-emerald-100 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
              <h2 className="text-2xl font-black text-slate-900">Request withdrawal</h2>
              <form onSubmit={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Amount</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                    placeholder="Enter amount"
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">UPI ID</span>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(event) => setUpiId(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                    placeholder="name@upi"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Bank details</span>
                  <textarea
                    value={bankDetails}
                    onChange={(event) => setBankDetails(event.target.value)}
                    rows={4}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                    placeholder="Optional bank account details"
                  />
                </label>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-2xl bg-gradient-to-r from-[#16a34a] to-[#22c55e] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_24px_rgba(34,197,94,0.18)] md:col-span-2"
                >
                  {submitting ? "Submitting..." : "Request Withdraw"}
                </button>
              </form>
            </section>

            <section className="rounded-[30px] border border-emerald-100 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
              <h2 className="text-2xl font-black text-slate-900">Withdrawal history</h2>
              {(history.withdrawals || []).length ? (
                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="text-left text-slate-400">
                      <tr>
                        <th className="pb-3 font-semibold">Amount</th>
                        <th className="pb-3 font-semibold">UPI / Bank</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(history.withdrawals || []).map((item) => (
                        <tr key={item._id}>
                          <td className="py-4 text-slate-900">{formatMoney(item.amount, item.currency || "INR")}</td>
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
