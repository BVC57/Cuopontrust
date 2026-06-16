"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import AdminPageShell from "../../../components/AdminPageShell";
import { AdminGhostButton, AdminPrimaryButton, AdminSurface } from "../../../components/admin/AdminUi";
import api, { extractError } from "../../../lib/api";

const sections = ["General Settings", "Email Settings", "Payment Settings", "Security Settings", "Notification Settings"];

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState("General Settings");
  const [form, setForm] = useState({
    siteName: "CouponX",
    siteTagline: "Save More, Shop More!",
    siteUrl: "https://www.couponx.com",
    adminEmail: "superadmin@couponx.com",
    businessName: "CouponX Private Limited",
    businessEmail: "support@couponx.com",
    businessPhone: "+91 98765 43210",
    businessAddress: "123, Business Street, Sector 62, Noida, Uttar Pradesh - 201301, India",
    country: "India",
    city: "Noida",
    state: "Uttar Pradesh",
    zipCode: "201301",
    commissionPercent: 10,
    minimumTrustScore: 40,
    aiMatchThreshold: 90,
    maxFreeListings: 10,
    withdrawalFee: 2,
    allowRegistration: true,
    enableRecaptcha: true
  });

  useEffect(() => {
    api.get("/super-admin/dashboard").then(() => null).catch(() => null);
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    try {
      await api.put("/super-admin/settings", {
        commissionPercent: Number(form.commissionPercent),
        minimumTrustScore: Number(form.minimumTrustScore),
        aiMatchThreshold: Number(form.aiMatchThreshold),
        maxFreeListings: Number(form.maxFreeListings),
        withdrawalFee: Number(form.withdrawalFee)
      });
      toast.success("Settings updated");
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  return (
    <AdminPageShell title="Settings" subtitle="Manage platform rules, business details, and admin preferences." breadcrumbs={["Dashboard", "Settings", "General Settings"]} actions={<AdminPrimaryButton type="submit" form="admin-settings-form">Save Changes</AdminPrimaryButton>}>
      <form id="admin-settings-form" onSubmit={submit} className="grid gap-5 xl:grid-cols-[0.55fr_1.45fr]">
        <div className="space-y-5">
          <AdminSurface className="p-4">
            <div className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section}
                  type="button"
                  onClick={() => setActiveSection(section)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold ${activeSection === section ? "bg-[#eefbf3] text-[#16a34a]" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  <span className={`h-2 w-2 rounded-full ${activeSection === section ? "bg-[#16a34a]" : "bg-slate-300"}`} />
                  {section}
                </button>
              ))}
            </div>
          </AdminSurface>
          <AdminSurface className="p-5">
            <h3 className="text-2xl font-black text-slate-900">Need Help?</h3>
            <p className="mt-3 text-sm leading-7 text-slate-500">If you need help with settings, please check the documentation or contact support.</p>
            <AdminGhostButton className="mt-5">Contact Support</AdminGhostButton>
          </AdminSurface>
        </div>

        <div className="space-y-5">
          <div className="grid gap-5 xl:grid-cols-2">
            <AdminSurface className="p-5">
              <h3 className="text-2xl font-black text-slate-900">Site Information</h3>
              <p className="mt-1 text-sm text-slate-400">Update your site details and preferences.</p>
              <div className="mt-5 grid gap-4">
                {[
                  ["Site Name", "siteName"],
                  ["Site Tagline", "siteTagline"],
                  ["Site URL", "siteUrl"],
                  ["Admin Email", "adminEmail"]
                ].map(([label, key]) => (
                  <label key={key} className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-600">{label}</span>
                    <input value={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                  </label>
                ))}
              </div>
            </AdminSurface>

            <AdminSurface className="p-5">
              <h3 className="text-2xl font-black text-slate-900">Business Information</h3>
              <p className="mt-1 text-sm text-slate-400">Update your business details.</p>
              <div className="mt-5 grid gap-4">
                {[
                  ["Business Name", "businessName"],
                  ["Business Email", "businessEmail"],
                  ["Business Phone", "businessPhone"],
                  ["Business Address", "businessAddress"]
                ].map(([label, key]) => (
                  <label key={key} className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-600">{label}</span>
                    {key === "businessAddress" ? (
                      <textarea value={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} rows={4} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                    ) : (
                      <input value={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                    )}
                  </label>
                ))}
              </div>
            </AdminSurface>
          </div>

          <AdminSurface className="p-5">
            <h3 className="text-2xl font-black text-slate-900">Platform Thresholds</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                ["Commission Percent", "commissionPercent"],
                ["Minimum Trust Score", "minimumTrustScore"],
                ["AI Match Threshold", "aiMatchThreshold"],
                ["Max Free Listings", "maxFreeListings"],
                ["Withdrawal Fee", "withdrawalFee"]
              ].map(([label, key]) => (
                <label key={key} className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-600">{label}</span>
                  <input value={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: Number(event.target.value) }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                </label>
              ))}
            </div>
          </AdminSurface>

          <div className="grid gap-5 xl:grid-cols-[1fr_1fr_0.8fr]">
            <AdminSurface className="p-5">
              <h3 className="text-2xl font-black text-slate-900">SEO Settings</h3>
              <div className="mt-5 grid gap-4">
                <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" defaultValue="CouponX - Best Coupon & Deals Platform" />
                <textarea className="w-full rounded-2xl border border-slate-200 px-4 py-3" rows={4} defaultValue="CouponX helps you find the best coupon codes and deals across 1000+ stores." />
                <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" defaultValue="coupons, deals, offers, promo codes, shopping" />
              </div>
            </AdminSurface>
            <AdminSurface className="p-5">
              <h3 className="text-2xl font-black text-slate-900">Social Media Links</h3>
              <div className="mt-5 grid gap-4">
                {["Facebook", "Twitter", "Instagram", "LinkedIn", "YouTube"].map((name) => (
                  <input key={name} className="w-full rounded-2xl border border-slate-200 px-4 py-3" defaultValue={`https://${name.toLowerCase()}.com/couponx`} />
                ))}
              </div>
            </AdminSurface>
            <AdminSurface className="p-5">
              <h3 className="text-2xl font-black text-slate-900">Other Settings</h3>
              <div className="mt-5 space-y-4">
                {[
                  ["Allow User Registration", "allowRegistration"],
                  ["Enable reCAPTCHA", "enableRecaptcha"]
                ].map(([label, key]) => (
                  <label key={key} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <span className="text-sm font-semibold text-slate-700">{label}</span>
                    <input type="checkbox" checked={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.checked }))} className="h-5 w-5 accent-[#16a34a]" />
                  </label>
                ))}
              </div>
            </AdminSurface>
          </div>
        </div>
      </form>
    </AdminPageShell>
  );
}
