export default function FeatureTile({ title, text }) {
  return (
    <div className="rounded-[20px] bg-white/70 p-5">
      <div className="h-11 w-11 rounded-full bg-emerald-50" />
      <p className="mt-4 text-lg font-black text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-7 text-slate-500">{text}</p>
    </div>
  );
}
