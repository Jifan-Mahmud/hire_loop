"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LockFill,
  ShieldExclamation,
  Ban,
  ArrowRight,
  House,
  Person,
} from "@gravity-ui/icons";
import { useLiveUser } from "@/context/LiveUserContext";
import { authClient } from "@/lib/auth-client";

export default function ForbiddenView({
  requiredRole = "Administrator",
  attemptedPath = "",
  customMessage = "",
  isBanned = false,
}) {
  const router = useRouter();
  const { user, role } = useLiveUser();

  // Determine allowed dashboard for this user
  const userRole = role || user?.role || "seeker";
  const userDashboard =
    userRole === "admin"
      ? "/deshboard/admin"
      : userRole === "recruiter"
      ? "/deshboard/recruiter"
      : "/deshboard/seekers";

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
    } catch (e) {
      console.error(e);
    }
    router.replace("/signin");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 select-none">
      <div className="relative w-full max-w-2xl rounded-3xl border border-rose-500/20 bg-[#0d0d14]/90 p-6 sm:p-10 text-center shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Ambient Neon Background Glows */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-rose-600/10 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-purple-600/10 blur-[100px] pointer-events-none" />

        {/* 403 Typography & Glowing Icon */}
        <div className="relative flex flex-col items-center justify-center">
          <div className="relative mb-2">
            <div className="text-7xl sm:text-9xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-rose-300 via-rose-500 to-rose-950 opacity-90 select-none">
              403
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-16 sm:size-20 rounded-2xl bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-900/40 backdrop-blur-md">
                {isBanned ? (
                  <Ban className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400 animate-pulse" />
                ) : (
                  <LockFill className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400" />
                )}
              </div>
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono font-medium tracking-wide mb-4">
            <ShieldExclamation className="w-3.5 h-3.5 text-rose-400" />
            <span>HTTP 403 • ACCESS FORBIDDEN</span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {isBanned
              ? "Account Suspended / Access Denied"
              : "Access Forbidden / প্রবেশাধিকার সংরক্ষিত"}
          </h1>

          {/* Subtitle / Explanation */}
          <p className="mt-3 text-xs sm:text-sm text-neutral-300 max-w-lg leading-relaxed">
            {customMessage ? (
              customMessage
            ) : isBanned ? (
              <>
                Your account <span className="text-rose-300 font-mono">({user?.email})</span> has been suspended by a system administrator. Access to protected resources and actions has been revoked.
              </>
            ) : (
              <>
                You do not have the required role or security clearance to view this resource.
                This area is strictly restricted to{" "}
                <span className="text-rose-300 font-semibold">{requiredRole}</span> accounts only.
              </>
            )}
          </p>
        </div>

        {/* Security & Context Diagnostics Box */}
        <div className="mt-6 rounded-2xl bg-white/[0.02] border border-white/10 p-4 sm:p-5 text-left text-xs space-y-2.5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold border-b border-white/[0.06] pb-2">
            Authorization Diagnostics
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-neutral-300">
            <div>
              <span className="text-neutral-500 block text-[11px]">Logged-in User</span>
              <span className="font-mono text-white truncate block">
                {user?.email || "Not Authenticated"}
              </span>
            </div>

            <div>
              <span className="text-neutral-500 block text-[11px]">Your Active Role</span>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold bg-neutral-800 text-purple-300 border border-purple-500/20 capitalize">
                {userRole}
              </span>
            </div>

            <div>
              <span className="text-neutral-500 block text-[11px]">Required Clearance</span>
              <span className="font-semibold text-rose-300">
                {requiredRole}
              </span>
            </div>

            {attemptedPath && (
              <div>
                <span className="text-neutral-500 block text-[11px]">Requested Route</span>
                <span className="font-mono text-neutral-400 truncate block">
                  {attemptedPath}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          {!isBanned && user && (
            <Link
              href={userDashboard}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-purple-600/20"
            >
              <span>Go to My Dashboard ({userRole})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-semibold transition-colors border border-white/10"
          >
            <House className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <button
            onClick={handleSignOut}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            <Person className="w-4 h-4" />
            <span>Switch Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
