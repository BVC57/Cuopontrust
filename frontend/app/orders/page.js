"use client";

import { useEffect, useState } from "react";
import AccountShell from "../../components/AccountShell";
import ProtectedRoute from "../../components/ProtectedRoute";
import api from "../../lib/api";
import CouponCard from "../../components/CouponCard";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function OrdersPage() {
  const [listed, setListed] = useState([]);
  const [purchased, setPurchased] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/coupons/my/listed"), api.get("/coupons/my/purchased")])
      .then(([listedRes, purchasedRes]) => {
        setListed(listedRes.data.coupons || []);
        setPurchased(purchasedRes.data.coupons || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute>
      <AccountShell title="My Orders" subtitle="Track purchased coupons and review your account activity.">
        {loading ? <LoadingSpinner label="Loading orders..." /> : (
          <div className="space-y-8">
            <section className="rounded-[30px] border border-emerald-100 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
              <h2 className="text-2xl font-black text-slate-900">Purchased coupons</h2>
              <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {purchased.map((coupon) => <CouponCard key={coupon._id} coupon={coupon} />)}
              </div>
            </section>
            <section className="rounded-[30px] border border-emerald-100 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
              <h2 className="text-2xl font-black text-slate-900">Recently listed coupons</h2>
              <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {listed.map((coupon) => <CouponCard key={coupon._id} coupon={coupon} />)}
              </div>
            </section>
          </div>
        )}
      </AccountShell>
    </ProtectedRoute>
  );
}
