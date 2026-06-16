export default function ReviewCard({ text, name, city }) {
  return (
    <div className="rounded-[20px] bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
      <p className="text-[#f7b731]">★★★★★</p>
      <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
      <div className="mt-5">
        <p className="font-bold text-slate-900">{name}</p>
        <p className="text-sm text-slate-500">{city}</p>
      </div>
    </div>
  );
}
