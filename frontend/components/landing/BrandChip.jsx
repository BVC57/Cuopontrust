export default function BrandChip({ label }) {
  return (
    <div className="px-3 py-4 text-center">
      <div className="mx-auto h-10 w-10 rounded-full bg-emerald-50/80" />
      <p className="mt-3 text-xs font-semibold text-slate-600">{label}</p>
    </div>
  );
}
