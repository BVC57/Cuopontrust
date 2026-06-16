"use client";

import { useEffect, useMemo, useState } from "react";
import AccountShell from "../../components/AccountShell";
import ProtectedRoute from "../../components/ProtectedRoute";
import api from "../../lib/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatDate, formatMoney } from "../../lib/format";
import { getStoredUser } from "../../lib/auth";

export default function PaymentsPage() {
  const [history, setHistory] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [viewerId, setViewerId] = useState(null);

  useEffect(() => {
    setViewerId(getStoredUser()?._id || null);
    Promise.all([api.get("/wallet/history"), api.get("/wallet")])
      .then(([historyResponse, walletResponse]) => {
        setHistory(historyResponse.data);
        setWallet(walletResponse.data.wallet);
      })
      .catch(() => {
        setHistory({ transactions: [], withdrawals: [] });
        setWallet({ availableBalance: 0, pendingBalance: 0, totalEarned: 0, currency: "INR" });
      });
  }, []);

  const getTransactionMeta = (item) => {
    const sellerId = item?.sellerId?._id;
    const buyerId = item?.buyerId?._id;

    if (viewerId && sellerId === viewerId) {
      return {
        role: "Sale credit",
        amount: item.sellerAmount ?? item.amount,
        amountClass: "text-emerald-700"
      };
    }

    if (viewerId && buyerId === viewerId) {
      return {
        role: "Purchase",
        amount: item.amount,
        amountClass: "text-rose-600"
      };
    }

    return {
      role: "Payment",
      amount: item.amount,
      amountClass: "text-slate-900"
    };
  };

  const transactionTotals = useMemo(() => {
    const totals = { totalPurchased: 0, totalSold: 0 };

    (history?.transactions || []).forEach((item) => {
      const meta = getTransactionMeta(item);

      if (meta.role === "Purchase") {
        totals.totalPurchased += Number(meta.amount || 0);
      }

      if (meta.role === "Sale credit") {
        totals.totalSold += Number(meta.amount || 0);
      }
    });

    return totals;
  }, [history, viewerId]);

  return (
    <ProtectedRoute>
      <AccountShell title="Payments" subtitle="Review transaction activity, releases, and withdrawal requests.">
        {!history || !wallet ? (
          <LoadingSpinner label="Loading payments..." />
        ) : (
          <div className="space-y-8">
            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
              {[
                ["Available Balance", wallet.availableBalance],
                ["Pending Balance", wallet.pendingBalance],
                ["Total Earned", wallet.totalEarned],
                ["Total Bought", transactionTotals.totalPurchased],
                ["Total Sold", transactionTotals.totalSold]
              ].map(([label, value]) => (
                <div key={label} className="rounded-[30px] border border-emerald-100 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-3 text-3xl font-black text-slate-900">{formatMoney(value, wallet.currency)}</p>
                </div>
              ))}
            </section>
            <section className="rounded-[30px] border border-emerald-100 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
              <h2 className="text-2xl font-black text-slate-900">Transactions</h2>
              {(history.transactions || []).length ? (
                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="text-left text-slate-400">
                        <tr>
                          <th className="pb-3 font-semibold">Coupon</th>
                          <th className="pb-3 font-semibold">Role</th>
                          <th className="pb-3 font-semibold">Amount</th>
                          <th className="pb-3 font-semibold">Status</th>
                          <th className="pb-3 font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(history.transactions || []).map((item) => {
                        const meta = getTransactionMeta(item);
                        return (
                          <tr key={item._id}>
                            <td className="py-4">
                              <p className="font-semibold uppercase text-slate-800">{item.couponId?.title || item.couponId?.platformName || "Coupon payment"}</p>
                              <p className="text-xs text-slate-400">{item.couponId?.platformName || "Marketplace order"}</p>
                            </td>
                            <td className="py-4 font-semibold text-slate-700">{meta.role}</td>
                            <td className={`py-4 font-semibold ${meta.amountClass}`}>
                              {meta.role === "Sale credit" ? "+" : meta.role === "Purchase" ? "-" : ""}
                              {formatMoney(meta.amount, item.currency || "INR")}
                            </td>
                            <td className="py-4 capitalize text-slate-500">{item.paymentStatus || item.transactionStatus || "completed"}</td>
                            <td className="py-4 text-slate-500">{formatDate(item.createdAt)}</td>
                          </tr>
                        );
                      })}
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
