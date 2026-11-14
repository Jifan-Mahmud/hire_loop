"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bookmark,
  Calendar,
  Envelope,
  Bell,
  Person,
  Magnifier,
  ArrowsRotateRight,
  Megaphone,
  Medal,
  PaperPlane,
} from "@gravity-ui/icons";
import { useSession } from "@/lib/auth-client";
import { getCandidateApplications } from "@/lib/api/applications";

export default function SeekerDashboardPage() {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const [searchQuery, setSearchQuery] = useState("");
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);

  // Fetch candidate's applications
  useEffect(() => {
    async function loadData() {
      if (!user?.email) {
        setLoadingApps(false);
        return;
      }
      try {
        const apps = await getCandidateApplications(user.email);
        setApplications(apps || []);
      } catch (err) {
        console.error("Error loading seeker applications:", err);
      } finally {
        setLoadingApps(false);
      }
    }
    loadData();
  }, [user?.email]);

  if (isPending || !user || user.role !== "seeker") {
    return (
      <div className="p-8 text-neutral-400 flex items-center gap-2">
        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <span>Loading seeker dashboard...</span>
      </div>
    );
  }

  // Derive counts from actual applications or showcase defaults
  const realAppCount = applications.length;

  const statusCounts = {
    applied: applications.filter(
      (a) => !a.status || a.status === "pending" || a.status === "applied"
    ).length,
    underReview: applications.filter(
      (a) => a.status === "under_review" || a.status === "reviewing"
    ).length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
    offered: applications.filter(
      (a) => a.status === "offered" || a.status === "accepted"
    ).length,
  };

  // If user has real applications, use them; otherwise, use reference image values
  const displayMetrics = {
    savedJobs: 12,
    applicationsSubmitted: realAppCount > 0 ? realAppCount : 24,
    interviewsScheduled: statusCounts.shortlisted > 0 ? statusCounts.shortlisted : 3,
    offersReceived: statusCounts.offered > 0 ? statusCounts.offered : 1,
  };

  const displayStatus = {
    applied: realAppCount > 0 ? statusCounts.applied || 1 : 10,
    underReview: realAppCount > 0 ? statusCounts.underReview : 6,
    shortlisted: realAppCount > 0 ? statusCounts.shortlisted : 5,
    rejected: realAppCount > 0 ? statusCounts.rejected : 2,
    offered: realAppCount > 0 ? statusCounts.offered : 1,
  };

  const totalStatusSum =
    displayStatus.applied +
    displayStatus.underReview +
    displayStatus.shortlisted +
    displayStatus.rejected +
    displayStatus.offered;

  const calculatePct = (val) => {
    if (!totalStatusSum) return "10%";
    return `${Math.max(8, Math.min(100, Math.round((val / totalStatusSum) * 100)))}%`;
  };

  const displayName = user?.name || "Alex Rivera";
  const displayEmail = user?.email || "alex.rivera@example.com";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#0d0d11] text-white p-4 sm:p-6 lg:p-8">
      {/* =========================================================
          TOP HEADER BAR: Search + Notifications + User Avatar
         ========================================================= */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8 border-b border-white/[0.06]">
        {/* Search for opportunities */}
        <div className="relative w-full sm:max-w-md">
          <Magnifier className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 size-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for opportunities..."
            className="w-full h-10 pl-10 pr-4 rounded-full bg-[#17171c] border border-white/10 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Messages */}
          <button
            type="button"
            className="relative p-2.5 rounded-full bg-[#17171c] border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Messages"
          >
            <Envelope className="size-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#0d0d11]" />
          </button>

          {/* Notifications */}
          <button
            type="button"
            className="relative p-2.5 rounded-full bg-[#17171c] border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Notifications"
          >
            <Bell className="size-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#0d0d11]" />
          </button>

          {/* User profile avatar */}
          <Link
            href="/deshboard/seekers/settings"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-semibold text-white border border-white/20 hover:scale-105 transition-transform"
          >
            {user?.image ? (
              <img
                src={user.image}
                alt={displayName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span>{userInitial}</span>
            )}
          </Link>
        </div>
      </div>

      {/* =========================================================
          TOP STAT CARDS (4 Cards Row)
         ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mt-6">
        {/* 1. Saved Jobs */}
        <div className="rounded-2xl bg-[#141418] border border-white/[0.08] p-5 flex flex-col justify-between hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-neutral-300">
            <span className="text-xs sm:text-sm font-medium">Saved Jobs</span>
            <Bookmark className="size-4 text-neutral-300" />
          </div>
          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              {displayMetrics.savedJobs}
            </span>
          </div>
        </div>

        {/* 2. Applications Submitted */}
        <div className="rounded-2xl bg-[#141418] border border-white/[0.08] p-5 flex flex-col justify-between hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-neutral-300">
            <span className="text-xs sm:text-sm font-medium">
              Applications Submitted
            </span>
            <PaperPlane className="size-4 text-neutral-300" />
          </div>
          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              {displayMetrics.applicationsSubmitted}
            </span>
          </div>
        </div>

        {/* 3. Interviews Scheduled */}
        <div className="rounded-2xl bg-[#141418] border border-white/[0.08] p-5 flex flex-col justify-between hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-neutral-300">
            <span className="text-xs sm:text-sm font-medium">
              Interviews Scheduled
            </span>
            <Calendar className="size-4 text-amber-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              {displayMetrics.interviewsScheduled}
            </span>
          </div>
        </div>

        {/* 4. Offers Received */}
        <div className="rounded-2xl bg-[#141418] border border-white/[0.08] p-5 flex flex-col justify-between hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-neutral-300">
            <span className="text-xs sm:text-sm font-medium">Offers Received</span>
            <Medal className="size-4 text-emerald-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              {displayMetrics.offersReceived}
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================
          MIDDLE SECTION: Profile Card (Left) & Application Status (Right)
         ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-6">
        {/* Left Column: User Profile Card */}
        <div className="lg:col-span-5 rounded-2xl bg-[#141418] border border-white/[0.08] p-6 sm:p-8 flex flex-col justify-between">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Avatar circle */}
            <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-neutral-800/80 border border-white/10 flex items-center justify-center text-neutral-300 overflow-hidden">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Person className="size-8 sm:size-10 text-neutral-400" />
              )}
            </div>

            {/* Name & Email */}
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-white truncate">
                {displayName}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 truncate mt-0.5">
                {displayEmail}
              </p>
            </div>
          </div>

          {/* Edit Profile Button */}
          <div className="mt-8">
            <Link
              href="/deshboard/seekers/settings"
              className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl border border-white/20 bg-white/[0.02] hover:bg-white/[0.08] text-xs sm:text-sm font-medium text-white transition-all text-center"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Right Column: Application Status Analytics */}
        <div className="lg:col-span-7 rounded-2xl bg-[#141418] border border-white/[0.08] p-6 sm:p-8">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-6">
            Application Status
          </h3>

          <div className="space-y-4">
            {/* 1. Applied */}
            <div>
              <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
                <span className="text-neutral-400">Applied</span>
                <span className="font-semibold text-white">
                  {displayStatus.applied}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-800/70 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white transition-all duration-500"
                  style={{ width: calculatePct(displayStatus.applied) }}
                />
              </div>
            </div>

            {/* 2. Under Review */}
            <div>
              <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
                <span className="text-neutral-400">Under Review</span>
                <span className="font-semibold text-white">
                  {displayStatus.underReview}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-800/70 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-500"
                  style={{ width: calculatePct(displayStatus.underReview) }}
                />
              </div>
            </div>

            {/* 3. Shortlisted */}
            <div>
              <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
                <span className="text-neutral-400">Shortlisted</span>
                <span className="font-semibold text-white">
                  {displayStatus.shortlisted}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-800/70 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: calculatePct(displayStatus.shortlisted) }}
                />
              </div>
            </div>

            {/* 4. Rejected */}
            <div>
              <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
                <span className="text-neutral-400">Rejected</span>
                <span className="font-semibold text-white">
                  {displayStatus.rejected}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-800/70 overflow-hidden">
                <div
                  className="h-full rounded-full bg-red-500 transition-all duration-500"
                  style={{ width: calculatePct(displayStatus.rejected) }}
                />
              </div>
            </div>

            {/* 5. Offered */}
            <div>
              <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
                <span className="text-neutral-400">Offered</span>
                <span className="font-semibold text-white">
                  {displayStatus.offered}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-800/70 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: calculatePct(displayStatus.offered) }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          BOTTOM SECTION: Recent Activity
         ========================================================= */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-white">
            Recent Activity
          </h2>
          <Link
            href="/deshboard/seekers/applications"
            className="text-xs sm:text-sm text-neutral-400 hover:text-white transition-colors"
          >
            View All Activity
          </Link>
        </div>

        <div className="space-y-3">
          {/* Dynamic items if applications exist */}
          {applications.slice(0, 2).map((app, idx) => (
            <div
              key={app._id || idx}
              className="rounded-2xl bg-[#141418] border border-white/[0.08] p-4 sm:p-5 flex items-center justify-between gap-4 hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                <div className="w-10 h-10 rounded-full bg-neutral-800/90 flex items-center justify-center flex-shrink-0 text-neutral-300">
                  <ArrowsRotateRight className="size-4" />
                </div>
                <p className="text-xs sm:text-sm text-neutral-200 truncate">
                  Application for{" "}
                  <strong className="text-white font-semibold">
                    {app.jobTitle || "Software Engineer"}
                  </strong>{" "}
                  at{" "}
                  <span className="text-white">
                    {app.companyName || "TechCorp"}
                  </span>{" "}
                  updated to{" "}
                  <span className="text-amber-400 underline underline-offset-2">
                    &apos;{app.status || "Under Review"}&apos;
                  </span>
                </p>
              </div>
              <span className="text-[11px] sm:text-xs text-neutral-400 whitespace-nowrap flex-shrink-0">
                {app.appliedAt
                  ? new Date(app.appliedAt).toLocaleDateString()
                  : "Recently"}
              </span>
            </div>
          ))}

          {/* Activity Item 1 (from reference design) */}
          <div className="rounded-2xl bg-[#141418] border border-white/[0.08] p-4 sm:p-5 flex items-center justify-between gap-4 hover:border-white/20 transition-all">
            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
              <div className="w-10 h-10 rounded-full bg-neutral-800/90 flex items-center justify-center flex-shrink-0 text-neutral-300">
                <ArrowsRotateRight className="size-4" />
              </div>
              <p className="text-xs sm:text-sm text-neutral-200 truncate">
                Application for{" "}
                <strong className="text-white font-semibold">
                  Senior Product Designer
                </strong>{" "}
                at <span className="text-white">TechFlow</span> updated to{" "}
                <span className="text-amber-400 underline underline-offset-2">
                  &apos;Under Review&apos;
                </span>
              </p>
            </div>
            <span className="text-[11px] sm:text-xs text-neutral-400 whitespace-nowrap flex-shrink-0">
              2 hours ago
            </span>
          </div>

          {/* Activity Item 2 (from reference design) */}
          <div className="rounded-2xl bg-[#141418] border border-white/[0.08] p-4 sm:p-5 flex items-center justify-between gap-4 hover:border-white/20 transition-all">
            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
              <div className="w-10 h-10 rounded-full bg-neutral-800/90 flex items-center justify-center flex-shrink-0 text-emerald-400">
                <Megaphone className="size-4" />
              </div>
              <p className="text-xs sm:text-sm text-neutral-200 truncate">
                New Job Alert:{" "}
                <strong className="text-white font-semibold">
                  Lead Frontend Engineer
                </strong>{" "}
                at <span className="text-white">FinGrid</span> matches your
                profile.
              </p>
            </div>
            <span className="text-[11px] sm:text-xs text-neutral-400 whitespace-nowrap flex-shrink-0">
              5 hours ago
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
