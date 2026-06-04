import AdminRoute from "./AdminRoute";
import AdminSidebar from "./AdminSidebar";

export default function AdminPageShell({ title, subtitle, children }) {
  return (
    <AdminRoute>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <AdminSidebar />
        <section className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-secondary">{title}</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">{subtitle}</h1>
          </div>
          {children}
        </section>
      </div>
    </AdminRoute>
  );
}
