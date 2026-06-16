"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Camera, Mail, Save } from "lucide-react";
import toast from "react-hot-toast";
import AccountShell from "../../components/AccountShell";
import ProtectedRoute from "../../components/ProtectedRoute";
import api, { extractError } from "../../lib/api";
import TrustScoreCard from "../../components/TrustScoreCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatMoney } from "../../lib/format";
import { getStoredToken, saveSession } from "../../lib/auth";

const initialForm = {
  name: "",
  country: "",
  currency: ""
};

const resolveAvatarUrl = (avatar) => {
  if (!avatar) return "";
  if (/^https?:\/\//i.test(avatar)) return avatar;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const origin = apiBase.replace(/\/api\/?$/, "");
  return `${origin}${avatar.startsWith("/") ? avatar : `/${avatar}`}`;
};

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.get("/users/profile"), api.get("/wallet")])
      .then(([profileResponse, walletResponse]) => {
        const profileUser = profileResponse.data.user;
        setUser(profileUser);
        setWallet(walletResponse.data.wallet);
        setForm({
          name: profileUser?.name || "",
          country: profileUser?.country || "India",
          currency: profileUser?.currency || "INR"
        });
        setAvatarPreview(resolveAvatarUrl(profileUser?.avatar));
      })
      .catch(() => null);
  }, []);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setAvatarFile(null);
      setAvatarPreview(resolveAvatarUrl(user?.avatar));
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("country", form.country);
      payload.append("currency", form.currency);
      if (avatarFile) {
        payload.append("avatar", avatarFile);
      }

      const { data } = await api.put("/users/profile", payload, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setUser(data.user);
      setForm({
        name: data.user?.name || "",
        country: data.user?.country || "India",
        currency: data.user?.currency || "INR"
      });
      setAvatarFile(null);
      setAvatarPreview(resolveAvatarUrl(data.user?.avatar));

      const token = getStoredToken();
      if (token) {
        saveSession({ token, user: data.user });
      }

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(extractError(error));
    } finally {
      setSaving(false);
    }
  };

  const isLowTrust = Number(user?.trustScore || 0) < 40;
  const adminEmail = "admin@couponx.com";
  const initials = useMemo(
    () =>
      String(user?.name || "U")
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    [user]
  );

  return (
    <ProtectedRoute>
      <AccountShell title="My Profile" subtitle="Edit your account details, upload your profile image, and review trust score.">
        {!user || !wallet ? (
          <LoadingSpinner label="Loading profile..." />
        ) : (
          <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
              <div className="space-y-4">
                <TrustScoreCard trustScore={user.trustScore} accountStatus={user.accountStatus} />
                {isLowTrust ? (
                  <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-600">Low trust alert</p>
                    <h3 className="mt-2 text-xl font-black text-slate-900">Contact admin for account review</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      Your trust score is below 40. Contact admin to review your account status and recovery options.
                    </p>
                    <div className="mt-4 space-y-3">
                      <a href={`mailto:${adminEmail}`} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-bold text-white">
                        <Mail className="h-4 w-4" />
                        Email Admin
                      </a>
                      <Link href="/contact-us" className="inline-flex w-full items-center justify-center rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-bold text-rose-600">
                        Contact Support
                      </Link>
                      <p className="text-xs font-semibold text-slate-500">Admin email: {adminEmail}</p>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="rounded-[30px] border border-emerald-100 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-emerald-100 bg-emerald-50 text-2xl font-black text-emerald-700">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt={user.name || "Profile"} className="h-full w-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">{user.name || "CouponX User"}</h2>
                    <p className="mt-2 text-sm text-slate-500">{user.email}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-xs text-slate-500">Name</span>
                      <input
                        value={form.name}
                        onChange={(event) => updateField("name", event.target.value)}
                        placeholder="Enter your name"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs text-slate-500">Profile image</span>
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                        <Camera className="h-4 w-4" />
                        {avatarFile ? avatarFile.name : "Upload profile image"}
                        <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                      </label>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs text-slate-500">Country</span>
                      <input
                        value={form.country}
                        onChange={(event) => updateField("country", event.target.value)}
                        placeholder="India"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs text-slate-500">Currency</span>
                      <input
                        value={form.currency}
                        onChange={(event) => updateField("currency", event.target.value.toUpperCase())}
                        placeholder="INR"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold uppercase text-slate-900 outline-none"
                      />
                    </label>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-70"
                    >
                      <Save className="h-4 w-4" />
                      {saving ? "Saving..." : "Save Profile"}
                    </button>
                  </div>
                </form>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Country</p>
                    <p className="mt-2 font-semibold text-slate-900">{user.country || "India"}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Currency</p>
                    <p className="mt-2 font-semibold text-slate-900">{user.currency || "INR"}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Total sales</p>
                    <p className="mt-2 font-semibold text-slate-900">{user.totalSales || 0}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Total purchases</p>
                    <p className="mt-2 font-semibold text-slate-900">{user.totalPurchases || 0}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Available to withdraw</p>
                    <p className="mt-2 font-semibold text-slate-900">{formatMoney(wallet.availableBalance, wallet.currency)}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Pending sales</p>
                    <p className="mt-2 font-semibold text-slate-900">{formatMoney(wallet.pendingBalance, wallet.currency)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </AccountShell>
    </ProtectedRoute>
  );
}
