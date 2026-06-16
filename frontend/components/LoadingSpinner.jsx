import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="flex min-h-[220px] w-full flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 shadow-[0_12px_28px_rgba(34,197,94,0.14)]">
        <Loader2 className="h-8 w-8 animate-spin text-[#16a34a]" />
      </div>
      <span className="text-sm font-medium text-slate-500">{label}</span>
    </div>
  );
}
