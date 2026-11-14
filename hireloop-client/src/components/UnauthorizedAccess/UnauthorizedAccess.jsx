"use client";

import React from "react";
import Link from "next/link";
import { ShieldExclamation, Lock, ArrowLeft, House } from "@gravity-ui/icons";

export default function UnauthorizedAccess({
  user = null,
  role = null,
  pathname = "",
  requiredRole = "",
}) {
  const currentRole = role || user?.role || "unauthenticated";
  const userEmail = user?.email || "Not signed in";
  const targetPath = pathname || (typeof window !== "undefined" ? window.location.pathname : "/deshboard");

  const isSeekerBlocked = currentRole === "seeker";
  const isRecruiterBlocked = currentRole === "recruiter";
  const isUnauthenticated = !user || currentRole === "unauthenticated";

  const resolvedRequiredRole =
    requiredRole ||
    (targetPath.startsWith("/deshboard/recruiter")
      ? "recruiter"
      : targetPath.startsWith("/deshboard/seekers")
      ? "seeker"
      : "authorized");

  const getAuthorizedLink = () => {
    if (isSeekerBlocked) {
      return {
        href: "/deshboard/seekers",
        label: "Return to Seeker Dashboard",
      };
    }
    if (isRecruiterBlocked) {
      return {
        href: "/deshboard/recruiter",
        label: "Return to Recruiter Dashboard",
      };
    }
    return {
      href: `/signin?redirect=${encodeURIComponent(targetPath)}`,
      label: "Sign In to Continue",
    };
  };

  const authLink = getAuthorizedLink();

  return (
    <div className="min-h-[85vh] w-full flex items-center justify-center p-4 sm:p-6 bg-[#0d0d11]">
      <div className="relative w-full max-w-xl rounded-2xl border border-rose-500/30 bg-[#121218]/90 backdrop-blur-xl p-6 sm:p-10 shadow-2xl shadow-rose-950/20 text-center overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Shield Icon with Ping Effect */}
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-2xl bg-rose-500/20 opacity-75" />
          <ShieldExclamation className="relative h-10 w-10 text-rose-400" />
        </div>

        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1 text-xs font-mono font-medium text-rose-400 mb-4">
          <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
          HTTP 401 &bull; UNAUTHORIZED ACCESS
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
          401 - Access Denied
        </h1>

        {/* Dynamic Explanation */}
        <p className="text-sm sm:text-base text-neutral-300 leading-relaxed mb-6 max-w-md mx-auto">
          {isSeekerBlocked && (
            <>
              You are signed in as a <span className="font-semibold text-rose-300">Job Seeker</span>. You do not have recruiter privileges or clearance to access the <span className="text-white font-medium">Recruiter Workspace</span>.
            </>
          )}
          {isRecruiterBlocked && (
            <>
              You are signed in as a <span className="font-semibold text-rose-300">Recruiter</span>. You do not have permission to access the candidate <span className="text-white font-medium">Seeker Dashboard</span>.
            </>
          )}
          {isUnauthenticated && (
            <>
              Authentication required. You must be signed in with an authorized account to access this section of HireLoop.
            </>
          )}
        </p>

        {/* Security Audit Box */}
        <div className="text-left rounded-xl border border-neutral-800 bg-black/40 p-4 mb-6 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500 pb-1 border-b border-neutral-800/80">
            <span className="flex items-center gap-1.5 font-semibold text-neutral-400">
              <Lock className="w-3.5 h-3.5 text-rose-400" /> Security Audit
            </span>
            <span className="text-rose-400 font-bold">STATUS: 401 BLOCKED</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-neutral-400">Target Path:</span>
            <span className="text-neutral-200 font-semibold truncate max-w-[240px]">{targetPath}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-neutral-400">User Identity:</span>
            <span className="text-neutral-300 truncate max-w-[240px]">{userEmail}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-neutral-400">Current Role:</span>
            <span className="text-amber-400 font-semibold">{currentRole}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-neutral-400">Required Role:</span>
            <span className="text-emerald-400 font-semibold">{resolvedRequiredRole}</span>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={authLink.href}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 hover:brightness-110 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {authLink.label}
          </Link>

          {!isUnauthenticated ? (
            <Link
              href="/signin"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800/60 px-5 py-2.5 text-sm font-medium text-neutral-200 hover:bg-neutral-800 hover:text-white transition-all cursor-pointer"
            >
              Switch Account
            </Link>
          ) : (
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800/60 px-5 py-2.5 text-sm font-medium text-neutral-200 hover:bg-neutral-800 hover:text-white transition-all cursor-pointer"
            >
              <House className="w-4 h-4" />
              Return Home
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
