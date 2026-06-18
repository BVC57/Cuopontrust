"use client";

import { CalendarDays, ChevronDown, Search, X } from "lucide-react";

const cn = (...parts) => parts.filter(Boolean).join(" ");

export const formatCurrency = (value = 0, currency = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0
    }).format(Number(value || 0));
  } catch {
    return `Rs ${Number(value || 0).toLocaleString("en-IN")}`;
  }
};

export const formatCompactNumber = (value = 0) => Number(value || 0).toLocaleString("en-IN");

export const paginateItems = (items = [], page = 1, pageSize = 10) => {
  const safePage = Math.max(1, Number(page || 1));
  const safePageSize = Math.max(1, Number(pageSize || 10));
  const startIndex = (safePage - 1) * safePageSize;
  return items.slice(startIndex, startIndex + safePageSize);
};

export const getPaginationWindow = (page = 1, totalPages = 1) => {
  const pageSet = new Set([1, totalPages, page - 1, page, page + 1]);
  return [...pageSet].filter((value) => value >= 1 && value <= totalPages).sort((left, right) => left - right);
};

export const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

export const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return `${date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  })} ${date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  })}`;
};

export function AdminBreadcrumbs({ items = [] }) {
  if (!items.length) return null;
  return (
    <div className="admin-breadcrumbs flex items-center gap-2 overflow-x-auto whitespace-nowrap text-sm text-slate-400">
      {items.map((item, index) => (
        <div key={`${item}-${index}`} className="flex flex-none items-center gap-2">
          <span>{item}</span>
          {index < items.length - 1 ? <span>&rsaquo;</span> : null}
        </div>
      ))}
    </div>
  );
}

export function AdminSurface({ className = "", children }) {
  return (
    <div className={cn("admin-content-surface rounded-[28px] border border-slate-100 bg-white shadow-[0_18px_44px_rgba(15,23,42,0.05)]", className)}>
      {children}
    </div>
  );
}

export function AdminMetricCard({ icon: Icon, label, value, change, tone = "green" }) {
  const tones = {
    green: "from-emerald-50 to-white text-emerald-600",
    blue: "from-emerald-50 to-white text-emerald-600",
    purple: "from-green-50 to-white text-green-700",
    amber: "from-amber-50 to-white text-amber-600",
    red: "from-rose-50 to-white text-rose-600"
  };
  const changeTone = change?.startsWith("-") ? "text-rose-500" : "text-emerald-500";

  return (
    <AdminSurface className="p-5">
      <div className="flex items-start gap-4">
        <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br", tones[tone] || tones.green)}>
          {Icon ? <Icon className="h-6 w-6" /> : null}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-4xl font-black tracking-tight text-slate-900">{value}</p>
          {change ? <p className={cn("mt-2 text-sm font-semibold", changeTone)}>{change} from last week</p> : null}
        </div>
      </div>
    </AdminSurface>
  );
}

export function AdminStatusChip({ status }) {
  const normalized = String(status || "").toLowerCase();
  const styles = {
    active: "bg-emerald-50 text-emerald-600",
    success: "bg-emerald-50 text-emerald-600",
    approved: "bg-emerald-50 text-emerald-600",
    completed: "bg-emerald-50 text-emerald-600",
    resolved: "bg-emerald-50 text-emerald-600",
    sold: "bg-emerald-50 text-emerald-600",
    open: "bg-rose-50 text-rose-500",
    blocked: "bg-rose-50 text-rose-500",
    failed: "bg-rose-50 text-rose-500",
    rejected: "bg-rose-50 text-rose-500",
    suspended: "bg-rose-50 text-rose-500",
    refunded: "bg-emerald-50 text-emerald-600",
    pending: "bg-amber-50 text-amber-600",
    under_review: "bg-amber-50 text-amber-600",
    created: "bg-slate-100 text-slate-500",
    warning: "bg-amber-50 text-amber-600",
    auto_removed: "bg-fuchsia-50 text-fuchsia-600",
    needs_review: "bg-orange-50 text-orange-600",
    expired: "bg-rose-50 text-rose-500",
    buyer: "bg-emerald-50 text-emerald-600",
    seller: "bg-emerald-50 text-emerald-600",
    banned: "bg-rose-50 text-rose-500",
    high: "bg-rose-50 text-rose-500",
    critical: "bg-rose-50 text-rose-500",
    medium: "bg-amber-50 text-amber-600",
    low: "bg-emerald-50 text-emerald-600"
  };

  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize", styles[normalized] || "bg-slate-100 text-slate-500")}>
      {normalized.replaceAll("_", " ")}
    </span>
  );
}

export function AdminUserIdentity({ name, email, accent = "from-emerald-500 to-teal-500" }) {
  const initials = String(name || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <div className={cn("flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br text-sm font-black text-white", accent)}>{initials}</div>
      <div>
        <p className="text-sm font-bold text-slate-900">{name || "Unknown User"}</p>
        {email ? <p className="text-xs text-slate-400">{email}</p> : null}
      </div>
    </div>
  );
}

export function AdminToolbar({ searchValue, onSearchChange, searchPlaceholder = "Search...", filters = [], action = null, extra = null }) {
  return (
    <AdminSurface className="p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-center">
        <div className="admin-input-surface flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder={searchPlaceholder}
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>
        {filters.map((filter) => (
          <div key={filter.key} className={cn("admin-input-surface relative flex min-w-[190px] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600", filter.className)}>
            {filter.icon === "calendar" ? <CalendarDays className="h-4 w-4 text-slate-400" /> : null}
            {filter.options ? (
              <select value={filter.value} onChange={(event) => filter.onChange?.(event.target.value)} className="admin-select-field w-full bg-transparent pr-6 font-medium outline-none">
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <span className="font-medium">{filter.label}</span>
            )}
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        ))}
        {extra}
        {action}
      </div>
    </AdminSurface>
  );
}

export function AdminPrimaryButton({ className = "", children, ...props }) {
  return (
    <button
      {...props}
      className={cn("inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#16a34a] to-[#22c55e] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_24px_rgba(34,197,94,0.22)]", className)}
    >
      {children}
    </button>
  );
}

export function AdminGhostButton({ className = "", children, ...props }) {
  return (
    <button {...props} className={cn("admin-input-surface inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700", className)}>
      {children}
    </button>
  );
}

export function AdminPanelTitle({ title, count, action }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-slate-900">{title}</h2>
        {count !== undefined ? <p className="mt-1 text-sm font-semibold text-slate-400">({formatCompactNumber(count)})</p> : null}
      </div>
      {action}
    </div>
  );
}

export function AdminTableShell({ title, count, children, side = null, footer = null }) {
  return (
    <div className={cn("grid gap-5", side ? "xl:grid-cols-[1.65fr_0.75fr]" : "")}>
      <AdminSurface className="p-5">
        <AdminPanelTitle title={title} count={count} />
        <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-100">{children}</div>
        {footer ? <div className="mt-4">{footer}</div> : null}
      </AdminSurface>
      {side}
    </div>
  );
}

export function AdminTableContainer({ children, className = "", maxHeight = "max-h-[580px]" }) {
  return (
    <div className={cn("admin-table-shell overflow-x-auto overflow-y-auto rounded-[24px] border border-slate-100", maxHeight, className)}>
      {children}
    </div>
  );
}

export function AdminEmptyState({ title = "No data available", description = "There is no data to show for the selected view yet." }) {
  return (
    <AdminSurface className="p-8">
      <div className="rounded-[24px] border border-dashed border-slate-200 px-6 py-10 text-center">
        <p className="text-xl font-black tracking-tight text-slate-900">{title}</p>
        <p className="mt-2 text-sm leading-7 text-slate-500">{description}</p>
      </div>
    </AdminSurface>
  );
}

export function AdminPagination({ totalCount = 0, page = 1, pageSize = 10, onPageChange, onPageSizeChange, pageSizeOptions = [10, 20, 50] }) {
  const totalPages = Math.max(1, Math.ceil(Number(totalCount || 0) / Math.max(1, Number(pageSize || 10))));
  const visiblePages = getPaginationWindow(page, totalPages);
  const start = totalCount ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(totalCount, page * pageSize);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm text-slate-400 lg:flex-row lg:items-center lg:justify-between">
      <p>
        Showing {start} to {end} of {formatCompactNumber(totalCount)} records
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => onPageChange?.(Math.max(1, page - 1))} disabled={page <= 1} className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50">
          Prev
        </button>
        {visiblePages.map((pageNumber) => (
          <button key={pageNumber} type="button" onClick={() => onPageChange?.(pageNumber)} className={`h-10 min-w-[40px] rounded-xl border px-3 font-bold ${pageNumber === page ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-200 bg-white text-slate-600"}`}>
            {pageNumber}
          </button>
        ))}
        <button type="button" onClick={() => onPageChange?.(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50">
          Next
        </button>
        <div className="admin-pagination-size inline-flex items-center gap-3 rounded-[22px] border border-slate-200 bg-white px-3 py-2 shadow-[0_10px_22px_rgba(15,23,42,0.03)]">
          <div className="relative min-w-[110px]">
            <select value={pageSize} onChange={(event) => onPageSizeChange?.(Number(event.target.value))} className="admin-select-field admin-pagination-select rounded-[18px] border-0 bg-slate-100/80 px-4 py-3 pr-10 text-base font-black text-slate-800 outline-none">
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </div>
          <span className="text-sm font-bold text-slate-600">items per page</span>
        </div>
      </div>
    </div>
  );
}

export function AdminDetailModal({ open, title, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.24)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h3 className="text-2xl font-black text-slate-900">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-6 py-6">{children}</div>
      </div>
    </div>
  );
}
