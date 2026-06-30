"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AccountShell from "../../components/AccountShell";
import ProtectedRoute from "../../components/ProtectedRoute";
import LoadingSpinner from "../../components/LoadingSpinner";
import api, { extractError } from "../../lib/api";
import { ReferralCard } from "../../components/rewards/ReferralCard";

export default function ReferralsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/referrals/my")
      .then((response) => setData(response.data))
      .catch((error) => toast.error(extractError(error)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute>
      <AccountShell title="Referrals" subtitle="Share your CouponX referral code and track signups, verifications, and first purchases.">
        {loading || !data ? <LoadingSpinner label="Loading referrals..." /> : (
          <div className="space-y-6">
            <ReferralCard referralCode={data.referralCode} referralLink={data.referralLink} appReferralLink={data.appReferralLink} totals={data.totals} referrals={data.referrals || []} />
            <div className="rounded-[28px] border border-emerald-100 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
              <h3 className="text-xl font-black text-slate-950">Referral Activity</h3>
              <div className="mt-4 space-y-3">
                {(data.referrals || []).length ? data.referrals.map((item) => (
                  <div key={item._id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.referredUserId?.name || item.referredUserId?.email || "New user"}</p>
                      <p className="mt-1 text-xs text-slate-500">Joined {new Date(item.createdAt).toLocaleDateString("en-IN")}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{item.status}</span>
                  </div>
                )) : <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">No referrals yet.</div>}
              </div>
            </div>
          </div>
        )}
      </AccountShell>
    </ProtectedRoute>
  );
}
