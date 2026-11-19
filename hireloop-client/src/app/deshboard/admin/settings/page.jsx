"use client";

import React, { useState } from "react";
import {
  Gear,
  ShieldCheck,
  CircleCheck,
  Lock,
  FloppyDisk,
} from "@gravity-ui/icons";
import AdminTopBar from "@/components/Admin/AdminTopBar";
import { useSession } from "@/lib/auth-client";
import SessionTokenVerifier from "@/components/Security/SessionTokenVerifier";

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const user = session?.user;

  const [platformName, setPlatformName] = useState("HireLoop");
  const [customEmail, setCustomEmail] = useState("");
  const adminEmail = customEmail || user?.email || "";
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [autoApproveCompanies, setAutoApproveCompanies] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto space-y-6">
      {/* Top Bar */}
      <AdminTopBar
        placeholder="Search settings, keys, or logs..."
        manageRoleText="Admin View"
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          System &amp; Console Settings
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Manage platform parameters, administrative credentials, and security configurations.
        </p>
      </div>

      {/* Live Token Verification Showcase (No JWT) */}
      <SessionTokenVerifier />

      {savedSuccess && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs sm:text-sm flex items-center gap-2">
          <CircleCheck className="w-4 h-4 shrink-0" />
          <span>Admin configuration successfully updated!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Platform Config */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#121218]/90 p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Gear className="w-4 h-4 text-purple-400" />
            <span>Platform Identity</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-400 mb-1.5 font-medium">
                Platform Name
              </label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs text-neutral-400 mb-1.5 font-medium">
                Super Admin Email
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Access Controls & Security */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#121218]/90 p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>System Access Controls</span>
          </h2>

          <div className="space-y-3">
            {/* Allow Registration */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div>
                <p className="text-sm font-semibold text-white">Public User Registration</p>
                <p className="text-xs text-neutral-400">Allow candidate job seekers and recruiters to create new accounts.</p>
              </div>
              <input
                type="checkbox"
                checked={allowRegistration}
                onChange={(e) => setAllowRegistration(e.target.checked)}
                className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
              />
            </div>

            {/* Auto-approve Companies */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div>
                <p className="text-sm font-semibold text-white">Auto-approve Verified Companies</p>
                <p className="text-xs text-neutral-400">Instantly grant job posting clearance without manual admin review.</p>
              </div>
              <input
                type="checkbox"
                checked={autoApproveCompanies}
                onChange={(e) => setAutoApproveCompanies(e.target.checked)}
                className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
              />
            </div>

            {/* Maintenance Mode */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div>
                <p className="text-sm font-semibold text-rose-300">Maintenance Mode</p>
                <p className="text-xs text-neutral-400">Display maintenance screen to public users; admin access remains active.</p>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Integration Status Box */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#121218]/90 p-6 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-400" />
            <span>Core Integrations &amp; Infrastructure</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-neutral-400 block mb-1">Database Provider</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-400" />
                MongoDB Atlas (Connected)
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-neutral-400 block mb-1">Payment Gateway</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-400" />
                Stripe Dynamic API
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-neutral-400 block mb-1">Media Storage</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-400" />
                ImgBB Cloud CDN
              </span>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 transition cursor-pointer"
          >
            <FloppyDisk className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
