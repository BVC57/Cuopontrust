"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import api from "../../lib/api";
import { formatMoney } from "../../lib/format";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function WalletPage() {
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    api.get("/wallet").then(({ data }) => setWallet(data.wallet)).catch(() => setWallet({ availableBalance: 0, pendingBalance: 0, totalEarned: 0 }));
  }, []);

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {!wallet ? (
          <LoadingSpinner label="Loading wallet..." />
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {[
              ["Available", wallet.availableBalance],
              ["Pending", wallet.pendingBalance],
              ["Earned", wallet.totalEarned]
            ].map(([label, value]) => (
              <div key={label} className="rounded-[28px] border border-white/70 bg-white p-6 shadow-soft">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{formatMoney(value, wallet.currency)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
