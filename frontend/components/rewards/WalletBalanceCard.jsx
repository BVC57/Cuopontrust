import { formatMoney } from "../../lib/format";

export function WalletBalanceCard({ balance = 0, currency = "INR" }) {
  return (
    <div className="rounded-[28px] border border-sky-100 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_26%),linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-700">Coupon Wallet</p>
      <p className="mt-3 text-4xl font-black text-slate-950">{formatMoney(balance, currency)}</p>
      <p className="mt-2 text-sm text-slate-500">Usable only for coupon purchases inside CouponX.</p>
    </div>
  );
}
