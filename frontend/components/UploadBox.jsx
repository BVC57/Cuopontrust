"use client";

import { ImagePlus, RefreshCcw } from "lucide-react";

export default function UploadBox({ onChange, fileName, previewUrl }) {
  return (
    <label className="block cursor-pointer overflow-hidden rounded-[24px] border border-dashed border-slate-300 bg-slate-50">
      <input type="file" accept="image/*" className="hidden" onChange={onChange} />
      {previewUrl ? (
        <div className="space-y-4 p-4">
          <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white">
            <img src={previewUrl} alt={fileName || "Uploaded coupon screenshot"} className="h-56 w-full object-contain bg-slate-100" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] bg-white px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-800">{fileName}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">Image selected. Tap to change screenshot.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700">
              <RefreshCcw className="h-3.5 w-3.5" />
              Change image
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
            <ImagePlus className="h-6 w-6" />
          </div>
          <span className="mt-4 text-sm font-medium text-slate-700">Upload coupon screenshot</span>
          <span className="mt-2 text-xs text-slate-500">PNG, JPG, WEBP up to 5MB</span>
          {fileName ? <span className="mt-4 rounded-full bg-white px-3 py-1 text-xs text-slate-600">{fileName}</span> : null}
        </div>
      )}
    </label>
  );
}
