"use client";

import { useEffect, useState } from "react";
import AccountShell from "../../components/AccountShell";
import ProtectedRoute from "../../components/ProtectedRoute";
import api from "../../lib/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatDate, formatMoney } from "../../lib/format";

export default function PaymentsPage() {
  const [history, setHistory] = useState(null);

  useEffect(() => {
    api.get("/wallet/history")
      .then(({ data }) => setHistory(data))
      .catch(() => setHistory({ transactions: [], withdrawals: [] }));
  }, []);

  return (
    <ProtectedRoute>
      <AccountShell title="Payments" subtitle="Review transaction activity, releases, and withdrawal requests.">
        {!history ? (
          <LoadingSpinner label="Loading payments..." />
        ) : (
          <div className="space-y-8">
            <section className="rounded-[30px] border border-emerald-100 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
              <h2 className="text-2xl font-black text-slate-900">Transactions</h2>
              {(history.transactions || []).length ? (
                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="text-left text-slate-400">
                      <tr>
                        <th className="pb-3 font-semibold">Coupon</th>
                        <th className="pb-3 font-semibold">Type</th>
                        <th className="pb-3 font-semibold">Amount</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(history.transactions || []).map((item) => (
                        <tr key={item._id}>
                          <td className="py-4">
                            <p className="font-semibold uppercase text-slate-800">{item.couponId?.title || item.couponId?.platformName || "Coupon payment"}</p>
                            <p className="text-xs text-slate-400">{item.couponId?.platformName || "Marketplace order"}</p>
                          </td>
                          <td className="py-4 font-semibold capitalize text-slate-700">{item.transactionStatus || "payment"}</td>
                          <td className="py-4 text-slate-900">{formatMoney(item.amount || item.sellerAmount, item.currency || "INR")}</td>
                          <td className="py-4 capitalize text-slate-500">{item.paymentStatus || item.transactionStatus || "completed"}</td>
                          <td className="py-4 text-slate-500">{formatDate(item.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-6 rounded-3xl border border-dashed border-emerald-200 px-6 py-10 text-center">
                  <p className="text-xl font-black text-slate-900">No transactions yet</p>
                  <p className="mt-2 text-sm text-slate-500">Only transactions linked to this logged-in user account will appear here.</p>
                </div>
              )}
            </section>

            <section className="rounded-[30px] border border-emerald-100 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
              <h2 className="text-2xl font-black text-slate-900">Withdrawals</h2>
              {(history.withdrawals || []).length ? (
                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="text-left text-slate-400">
                      <tr>
                        <th className="pb-3 font-semibold">Amount</th>
                        <th className="pb-3 font-semibold">Method</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(history.withdrawals || []).map((item) => (
                        <tr key={item._id}>
                          <td className="py-4 text-slate-900">{formatMoney(item.amount, item.currency || "INR")}</td>
                          <td className="py-4 text-slate-700">{item.method || "Bank transfer"}</td>
                          <td className="py-4 capitalize text-slate-500">{item.status || "pending"}</td>
                          <td className="py-4 text-slate-500">{formatDate(item.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-6 rounded-3xl border border-dashed border-emerald-200 px-6 py-10 text-center">
                  <p className="text-xl font-black text-slate-900">No withdrawals yet</p>
                  <p className="mt-2 text-sm text-slate-500">Only withdrawal requests created from this account will appear here.</p>
                </div>
              )}
            </section>
          </div>
        )}
      </AccountShell>
    </ProtectedRoute>
  );
}
