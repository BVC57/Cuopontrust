"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminPageShell from "../../../components/AdminPageShell";
import { AdminGhostButton, AdminPrimaryButton, AdminSurface } from "../../../components/admin/AdminUi";
import api, { extractError } from "../../../lib/api";

const sections = [
  "General Settings",
  "Email Settings",
  "Payment Settings",
  "Security Settings",
  "Notification Settings"
];

const defaultForm = {
  siteName: "CouponX",
  siteTagline: "Save More, Shop More!",
  siteUrl: "https://www.couponx.com",
  adminEmail: "superadmin@couponx.com",
  businessName: "CouponX Private Limited",
  businessEmail: "support@couponx.com",
  businessPhone: "+91 98765 43210",
  businessAddress: "123, Business Street, Sector 62, Noida, Uttar Pradesh - 201301, India",
  supportEmail: "help@couponx.com",
  supportPhone: "+91 98765 00000",
  emailProvider: "smtp",
  smtpHost: "smtp.gmail.com",
  smtpPort: 587,
  smtpUsername: "",
  smtpPassword: "",
  smtpFromName: "CouponX",
  smtpFromEmail: "noreply@couponx.com",
  enableEmailNotifications: true,
  enableOrderEmails: true,
  enableMarketingEmails: false,
  paymentGateway: "razorpay",
  currencyCode: "INR",
  razorpayKeyId: "",
  razorpayKeySecret: "",
  taxPercent: 18,
  minimumWithdrawalAmount: 100,
  autoReleasePayouts: false,
  commissionPercent: 10,
  minimumTrustScore: 40,
  aiMatchThreshold: 90,
  maxFreeListings: 10,
  withdrawalFee: 2,
  allowRegistration: true,
  enableRecaptcha: true,
  requireEmailVerification: true,
  passwordMinLength: 8,
  maxLoginAttempts: 5,
  sessionTimeoutMinutes: 120,
  adminNewUserAlerts: true,
  adminCouponAlerts: true,
  adminDisputeAlerts: true,
  adminWithdrawalAlerts: true,
  sendPushNotifications: false,
  sendEmailSummaries: true,
  summaryFrequency: "daily"
};

const numericFields = new Set([
  "smtpPort",
  "taxPercent",
  "minimumWithdrawalAmount",
  "commissionPercent",
  "minimumTrustScore",
  "aiMatchThreshold",
  "maxFreeListings",
  "withdrawalFee",
  "passwordMinLength",
  "maxLoginAttempts",
  "sessionTimeoutMinutes"
]);

const sectionDescriptions = {
  "General Settings": "Update your business profile, support contact details, and core platform identity.",
  "Email Settings": "Configure your mail provider, SMTP delivery, and outgoing email preferences.",
  "Payment Settings": "Control commission, payout rules, and payment gateway configuration.",
  "Security Settings": "Manage registration, verification, trust, and session security rules.",
  "Notification Settings": "Decide which admin alerts, summaries, and push notifications are sent."
};

function TextField({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-600">{label}</span>
      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={onChange}
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#16a34a]"
      />
    </label>
  );
}

function TextAreaField({ label, value, onChange, rows = 4 }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-600">{label}</span>
      <textarea
        value={value ?? ""}
        onChange={onChange}
        rows={rows}
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#16a34a]"
      />
    </label>
  );
}

function ToggleField({ label, checked, onChange, description }) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
      <span>
        <span className="block text-sm font-semibold text-slate-700">{label}</span>
        {description ? <span className="mt-1 block text-xs text-slate-400">{description}</span> : null}
      </span>
      <input type="checkbox" checked={Boolean(checked)} onChange={onChange} className="mt-1 h-5 w-5 accent-[#16a34a]" />
    </label>
  );
}

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState("General Settings");
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await api.get("/super-admin/settings");
        setForm((current) => ({ ...current, ...(response?.data?.data?.settings || {}) }));
      } catch (error) {
        toast.error(extractError(error));
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleChange = (key) => (event) => {
    const rawValue = event.target.value;
    updateField(key, numericFields.has(key) ? (rawValue === "" ? "" : Number(rawValue)) : rawValue);
  };

  const handleToggle = (key) => (event) => {
    updateField(key, event.target.checked);
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await api.put("/super-admin/settings", form);
      setForm((current) => ({ ...current, ...(response?.data?.data?.settings || {}) }));
      toast.success("Settings updated");
    } catch (error) {
      toast.error(extractError(error));
    } finally {
      setSaving(false);
    }
  };

  const renderGeneralSection = () => (
    <div className="grid gap-5 xl:grid-cols-2">
      <AdminSurface className="p-5">
        <h3 className="text-2xl font-black text-slate-900">Site Information</h3>
        <p className="mt-1 text-sm text-slate-400">Branding and public platform details used across the marketplace.</p>
        <div className="mt-5 grid gap-4">
          <TextField label="Site Name" value={form.siteName} onChange={handleChange("siteName")} />
          <TextField label="Site Tagline" value={form.siteTagline} onChange={handleChange("siteTagline")} />
          <TextField label="Site URL" value={form.siteUrl} onChange={handleChange("siteUrl")} type="url" />
          <TextField label="Admin Email" value={form.adminEmail} onChange={handleChange("adminEmail")} type="email" />
        </div>
      </AdminSurface>

      <AdminSurface className="p-5">
        <h3 className="text-2xl font-black text-slate-900">Business Information</h3>
        <p className="mt-1 text-sm text-slate-400">Operational contact details shown to users and used internally.</p>
        <div className="mt-5 grid gap-4">
          <TextField label="Business Name" value={form.businessName} onChange={handleChange("businessName")} />
          <TextField label="Business Email" value={form.businessEmail} onChange={handleChange("businessEmail")} type="email" />
          <TextField label="Business Phone" value={form.businessPhone} onChange={handleChange("businessPhone")} />
          <TextAreaField label="Business Address" value={form.businessAddress} onChange={handleChange("businessAddress")} />
          <TextField label="Support Email" value={form.supportEmail} onChange={handleChange("supportEmail")} type="email" />
          <TextField label="Support Phone" value={form.supportPhone} onChange={handleChange("supportPhone")} />
        </div>
      </AdminSurface>
    </div>
  );

  const renderEmailSection = () => (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <AdminSurface className="p-5">
        <h3 className="text-2xl font-black text-slate-900">SMTP Configuration</h3>
        <p className="mt-1 text-sm text-slate-400">Set your outbound email provider and sender identity.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <TextField label="Email Provider" value={form.emailProvider} onChange={handleChange("emailProvider")} />
          <TextField label="SMTP Port" value={form.smtpPort} onChange={handleChange("smtpPort")} type="number" />
          <TextField label="SMTP Host" value={form.smtpHost} onChange={handleChange("smtpHost")} />
          <TextField label="SMTP Username" value={form.smtpUsername} onChange={handleChange("smtpUsername")} />
          <TextField label="SMTP Password" value={form.smtpPassword} onChange={handleChange("smtpPassword")} type="password" />
          <TextField label="From Name" value={form.smtpFromName} onChange={handleChange("smtpFromName")} />
          <div className="md:col-span-2">
            <TextField label="From Email" value={form.smtpFromEmail} onChange={handleChange("smtpFromEmail")} type="email" />
          </div>
        </div>
      </AdminSurface>

      <AdminSurface className="p-5">
        <h3 className="text-2xl font-black text-slate-900">Email Preferences</h3>
        <p className="mt-1 text-sm text-slate-400">Choose which automatic email flows stay active.</p>
        <div className="mt-5 space-y-4">
          <ToggleField label="Enable Email Notifications" checked={form.enableEmailNotifications} onChange={handleToggle("enableEmailNotifications")} description="Master switch for system-generated emails." />
          <ToggleField label="Send Order Emails" checked={form.enableOrderEmails} onChange={handleToggle("enableOrderEmails")} description="Purchase, payout, and transaction updates." />
          <ToggleField label="Send Marketing Emails" checked={form.enableMarketingEmails} onChange={handleToggle("enableMarketingEmails")} description="Promotions and engagement campaigns for users." />
        </div>
      </AdminSurface>
    </div>
  );

  const renderPaymentSection = () => (
    <div className="grid gap-5 xl:grid-cols-2">
      <AdminSurface className="p-5">
        <h3 className="text-2xl font-black text-slate-900">Gateway Settings</h3>
        <p className="mt-1 text-sm text-slate-400">Configure payment provider and payout credentials.</p>
        <div className="mt-5 grid gap-4">
          <TextField label="Payment Gateway" value={form.paymentGateway} onChange={handleChange("paymentGateway")} />
          <TextField label="Currency Code" value={form.currencyCode} onChange={handleChange("currencyCode")} />
          <TextField label="Razorpay Key ID" value={form.razorpayKeyId} onChange={handleChange("razorpayKeyId")} />
          <TextField label="Razorpay Key Secret" value={form.razorpayKeySecret} onChange={handleChange("razorpayKeySecret")} type="password" />
        </div>
      </AdminSurface>

      <AdminSurface className="p-5">
        <h3 className="text-2xl font-black text-slate-900">Charges and Payouts</h3>
        <p className="mt-1 text-sm text-slate-400">Set marketplace commissions, taxes, and withdrawal rules.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <TextField label="Commission Percent" value={form.commissionPercent} onChange={handleChange("commissionPercent")} type="number" />
          <TextField label="Withdrawal Fee" value={form.withdrawalFee} onChange={handleChange("withdrawalFee")} type="number" />
          <TextField label="Tax Percent" value={form.taxPercent} onChange={handleChange("taxPercent")} type="number" />
          <TextField label="Minimum Withdrawal" value={form.minimumWithdrawalAmount} onChange={handleChange("minimumWithdrawalAmount")} type="number" />
        </div>
        <div className="mt-4">
          <ToggleField label="Auto Release Payouts" checked={form.autoReleasePayouts} onChange={handleToggle("autoReleasePayouts")} description="Automatically release eligible payouts without manual approval." />
        </div>
      </AdminSurface>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <AdminSurface className="p-5">
        <h3 className="text-2xl font-black text-slate-900">Trust and Access Rules</h3>
        <p className="mt-1 text-sm text-slate-400">Control registration, verification, and trust thresholds.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <TextField label="Minimum Trust Score" value={form.minimumTrustScore} onChange={handleChange("minimumTrustScore")} type="number" />
          <TextField label="AI Match Threshold" value={form.aiMatchThreshold} onChange={handleChange("aiMatchThreshold")} type="number" />
          <TextField label="Max Free Listings" value={form.maxFreeListings} onChange={handleChange("maxFreeListings")} type="number" />
          <TextField label="Password Min Length" value={form.passwordMinLength} onChange={handleChange("passwordMinLength")} type="number" />
          <TextField label="Max Login Attempts" value={form.maxLoginAttempts} onChange={handleChange("maxLoginAttempts")} type="number" />
          <TextField label="Session Timeout (Minutes)" value={form.sessionTimeoutMinutes} onChange={handleChange("sessionTimeoutMinutes")} type="number" />
        </div>
      </AdminSurface>

      <AdminSurface className="p-5">
        <h3 className="text-2xl font-black text-slate-900">Protection Toggles</h3>
        <p className="mt-1 text-sm text-slate-400">Enable or disable user access and validation protections.</p>
        <div className="mt-5 space-y-4">
          <ToggleField label="Allow User Registration" checked={form.allowRegistration} onChange={handleToggle("allowRegistration")} description="Allow new users to create accounts." />
          <ToggleField label="Enable reCAPTCHA" checked={form.enableRecaptcha} onChange={handleToggle("enableRecaptcha")} description="Protect signup and login forms from abuse." />
          <ToggleField label="Require Email Verification" checked={form.requireEmailVerification} onChange={handleToggle("requireEmailVerification")} description="New accounts must verify email before full access." />
        </div>
      </AdminSurface>
    </div>
  );

  const renderNotificationSection = () => (
    <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
      <AdminSurface className="p-5">
        <h3 className="text-2xl font-black text-slate-900">Admin Alerts</h3>
        <p className="mt-1 text-sm text-slate-400">Choose which operational events should notify administrators.</p>
        <div className="mt-5 space-y-4">
          <ToggleField label="New User Alerts" checked={form.adminNewUserAlerts} onChange={handleToggle("adminNewUserAlerts")} description="Notify admins when a new account is created." />
          <ToggleField label="Coupon Alerts" checked={form.adminCouponAlerts} onChange={handleToggle("adminCouponAlerts")} description="Notify admins for coupon submissions and AI failures." />
          <ToggleField label="Dispute Alerts" checked={form.adminDisputeAlerts} onChange={handleToggle("adminDisputeAlerts")} description="Notify admins when disputes are opened or updated." />
          <ToggleField label="Withdrawal Alerts" checked={form.adminWithdrawalAlerts} onChange={handleToggle("adminWithdrawalAlerts")} description="Notify admins for seller payout requests." />
        </div>
      </AdminSurface>

      <AdminSurface className="p-5">
        <h3 className="text-2xl font-black text-slate-900">Delivery Preferences</h3>
        <p className="mt-1 text-sm text-slate-400">Define how admin summaries and secondary channels behave.</p>
        <div className="mt-5 grid gap-4">
          <ToggleField label="Send Push Notifications" checked={form.sendPushNotifications} onChange={handleToggle("sendPushNotifications")} description="Use push alerts for urgent admin updates." />
          <ToggleField label="Send Email Summaries" checked={form.sendEmailSummaries} onChange={handleToggle("sendEmailSummaries")} description="Receive summary digests for platform activity." />
          <TextField label="Summary Frequency" value={form.summaryFrequency} onChange={handleChange("summaryFrequency")} placeholder="daily / weekly" />
        </div>
      </AdminSurface>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case "Email Settings":
        return renderEmailSection();
      case "Payment Settings":
        return renderPaymentSection();
      case "Security Settings":
        return renderSecuritySection();
      case "Notification Settings":
        return renderNotificationSection();
      default:
        return renderGeneralSection();
    }
  };

  return (
    <AdminPageShell
      title="Settings"
      subtitle="Manage platform rules, business details, and admin preferences."
      breadcrumbs={["Dashboard", "Settings", activeSection]}
    >
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
            <p className="mt-3 text-sm leading-7 text-slate-500">Each settings section saves to the live admin configuration. Update values and use Save Changes to persist them.</p>
            <AdminGhostButton type="button" className="mt-5">Admin Guide</AdminGhostButton>
          </AdminSurface>
        </div>

        <div className="space-y-5">
          <AdminSurface className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-900">{activeSection}</h3>
                <p className="mt-1 text-sm text-slate-400">{sectionDescriptions[activeSection]}</p>
              </div>
              <AdminPrimaryButton type="submit" form="admin-settings-form" className="sm:self-start" disabled={loading || saving}>
                {saving ? "Saving..." : "Save Changes"}
              </AdminPrimaryButton>
            </div>
          </AdminSurface>

          {loading ? (
            <AdminSurface className="p-6 text-sm text-slate-500">Loading settings...</AdminSurface>
          ) : (
            renderSection()
          )}
        </div>
      </form>
    </AdminPageShell>
  );
}
