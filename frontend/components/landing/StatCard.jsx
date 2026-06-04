export default function StatCard({ value, label, accent }) {
  return (
    <div className="px-5 py-5 text-center">
      <p className={`text-3xl font-black ${accent || "text-[#16a34a]"}`}>{value}</p>
      <p className="mt-2 text-sm text-slate-500">{label}</p>
    </div>
  );
}
