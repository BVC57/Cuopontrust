import { formatDate } from "../../lib/format";

export function RewardHistoryTable({ items = [] }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-emerald-100 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="text-lg font-black text-slate-950">Reward History</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-5 py-3 font-bold">Source</th>
              <th className="px-5 py-3 font-bold">Coins</th>
              <th className="px-5 py-3 font-bold">Description</th>
              <th className="px-5 py-3 font-bold">Date</th>
            </tr>
          </thead>
          <tbody>
            {items.length ? items.map((item) => (
              <tr key={item._id} className="border-t border-slate-100">
                <td className="px-5 py-4 font-semibold text-slate-900">{item.source}</td>
                <td className={`px-5 py-4 font-black ${Number(item.coins || 0) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{Number(item.coins || 0) >= 0 ? `+${item.coins}` : item.coins}</td>
                <td className="px-5 py-4 text-slate-500">{item.description || item.event}</td>
                <td className="px-5 py-4 text-slate-500">{formatDate(item.createdAt)}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="px-5 py-8 text-center text-slate-500">No reward activity yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
