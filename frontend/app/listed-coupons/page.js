"use client";

import { useEffect, useState } from "react";
import AccountShell from "../../components/AccountShell";
import ProtectedRoute from "../../components/ProtectedRoute";
import api from "../../lib/api";
import CouponCard from "../../components/CouponCard";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function ListedCouponsPage() {
  const [listed, setListed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/coupons/my/listed")
      .then(({ data }) => {
        setListed(data.coupons || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute>
      <AccountShell title="Listed Coupons" subtitle="Manage coupons you have submitted for buyers.">
        {loading ? (
          <LoadingSpinner label="Loading listed coupons..." />
        ) : (
          <div className="rounded-[30px] border border-emerald-100 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
            {listed.length ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {listed.map((coupon) => <CouponCard key={coupon._id} coupon={coupon} />)}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-emerald-200 px-6 py-12 text-center">
                <p className="text-2xl font-black text-slate-900">No listed coupons yet</p>
                <p className="mt-2 text-sm text-slate-500">Coupons you list from this account will appear here only for this logged-in user.</p>
              </div>
            )}
          </div>
        )}
      </AccountShell>
    </ProtectedRoute>
  );
}
