"use client";

export default function UploadBox({ onChange, fileName }) {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <span className="text-sm font-medium text-slate-700">Upload coupon screenshot</span>
      <span className="mt-2 text-xs text-slate-500">PNG, JPG, WEBP up to 5MB</span>
      <input type="file" accept="image/*" className="hidden" onChange={onChange} />
      {fileName ? <span className="mt-4 rounded-full bg-white px-3 py-1 text-xs text-slate-600">{fileName}</span> : null}
    </label>
  );
}
