"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import AdminPageShell from "../../../components/AdminPageShell";
import api from "../../../lib/api";

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    api.get("/super-admin/dashboard").then(({ data }) => setDashboard(data)).catch(() => null);
  }, []);

  return (
    <AdminPageShell title="Dashboard" subtitle="Marketplace health, revenue, and risk">
      {dashboard ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Object.entries(dashboard.metrics).map(([key, value]) => (
              <div key={key} className="rounded-[28px] border border-white/60 bg-white p-5 shadow-soft">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{key.replace(/([A-Z])/g, " $1")}</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-[28px] border border-white/60 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-900">Revenue chart</h2>
            <div className="mt-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboard.charts.revenue}>
                  <defs>
                    <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#4f46e5" fill="url(#revenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : null}
    </AdminPageShell>
  );
}
