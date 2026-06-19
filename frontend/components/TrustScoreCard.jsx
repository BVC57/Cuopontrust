import StatusBadge from "./StatusBadge";

export default function TrustScoreCard({ trustScore = 100, accountStatus = "active" }) {
  const tone =
    trustScore >= 80 ? "from-emerald-500 to-teal-500" : trustScore >= 60 ? "from-amber-400 to-orange-400" : "from-rose-500 to-red-500";

  return (
    <div className={`rounded-[28px] bg-gradient-to-br ${tone} p-[1px] shadow-soft`}>
      <div className="rounded-[27px] bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Trust score</p>
            <p className="mt-2 text-4xl font-semibold text-slate-900">{trustScore}</p>
          </div>
          <StatusBadge status={accountStatus} />
        </div>
        <p className="mt-4 text-sm text-slate-600">
          Excellent sellers keep verification clean, avoid disputes, and maintain working coupons. If trust score falls below 40, the account is banned.
        </p>
      </div>
    </div>
  );
}
