"use client";

import { useEffect, useState } from "react";
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
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {loading ? <LoadingSpinner label="Loading orders..." /> : (
          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-semibold text-slate-900">My listed coupons</h2>
              <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {listed.map((coupon) => <CouponCard key={coupon._id} coupon={coupon} />)}
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-semibold text-slate-900">My purchased coupons</h2>
              <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {purchased.map((coupon) => <CouponCard key={coupon._id} coupon={coupon} />)}
              </div>
            </section>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
