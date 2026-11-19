"use client";

import React, { useState } from "react";
import {
  Magnifier,
  Bell,
  CircleQuestion,
  ChevronDown,
  ShieldCheck,
  Check,
} from "@gravity-ui/icons";
import { useSession } from "@/lib/auth-client";

export default function AdminTopBar({
  placeholder = "Global search...",
  searchValue = "",
  onSearchChange = () => {},
  manageRoleText = "Admin View",
}) {
  const { data: session } = useSession();
  const user = session?.user;
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-white/[0.08] mb-6">
      {/* Search Input */}
      <div className="relative w-full sm:w-80 md:w-96">
        <Magnifier className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/40 transition"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3 self-end sm:self-auto">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-neutral-300 hover:text-white hover:bg-white/[0.08] transition"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-[#14141c] border border-white/10 p-3 shadow-xl z-50 text-xs text-neutral-300 space-y-2">
              <div className="font-semibold text-white pb-1.5 border-b border-white/10 flex items-center justify-between">
                <span>System Alerts</span>
                <span className="text-[10px] text-emerald-400 font-mono">ALL SYSTEMS OK</span>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.03]">
                <p className="font-medium text-white">42 New Signups today</p>
                <p className="text-[10px] text-neutral-400">Steady user growth across tech sectors</p>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.03]">
                <p className="font-medium text-white">14 Company Registrations Pending</p>
                <p className="text-[10px] text-neutral-400">Requires verification approval</p>
              </div>
            </div>
          )}
        </div>

        {/* Help / Docs */}
        <button
          onClick={() => alert("HireLoop Admin Documentation: Manage users, companies, listings, and subscriptions.")}
          className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-neutral-300 hover:text-white hover:bg-white/[0.08] transition"
          title="Help & Documentation"
        >
          <CircleQuestion className="w-4 h-4" />
        </button>

        {/* Manage Roles / Admin View Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-xs sm:text-sm font-medium text-white transition cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>{manageRoleText}</span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#14141c] border border-white/10 p-1.5 shadow-xl z-50 text-xs">
              <div className="px-3 py-2 text-[11px] text-neutral-400 border-b border-white/10">
                Active Console Role:
                <p className="text-white font-semibold">Super Administrator</p>
              </div>
              <button
                onClick={() => setShowRoleMenu(false)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-neutral-200 hover:bg-white/10"
              >
                <span>System Admin</span>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              </button>
              <button
                onClick={() => {
                  setShowRoleMenu(false);
                  window.location.href = "/deshboard/recruiter";
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-neutral-400 hover:text-white hover:bg-white/10"
              >
                <span>Preview Recruiter View</span>
              </button>
              <button
                onClick={() => {
                  setShowRoleMenu(false);
                  window.location.href = "/deshboard/seekers";
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-neutral-400 hover:text-white hover:bg-white/10"
              >
                <span>Preview Seeker View</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
