"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Calendar,
  CircleCheck,
  Globe,
  MapPin,
  TriangleExclamation,
} from "@gravity-ui/icons";
import { useSession, authClient } from "@/lib/auth-client";
import { checkApplicationStatus } from "@/lib/api/applications";

export default function JobDetailView({ job }) {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const [applied, setApplied] = useState(false);
  const [recruiterWarning, setRecruiterWarning] = useState(false);

  // Check if candidate already applied
  useEffect(() => {
    async function check() {
      if (job?._id && user?.email && user?.role !== "recruiter") {
        const res = await checkApplicationStatus(job._id, user.email);
        if (res?.hasApplied) {
          setApplied(true);
        }
      }
    }
    check();
  }, [job?._id, user?.email, user?.role]);

  const handleApplyClick = () => {
    if (!job?._id) return;

    // 1. Not signed in: redirect to signin with return URL
    if (!user) {
      const redirectUrl = `/jobs/apply?jobId=${job._id}`;
      router.push(`/signin?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }

    // 2. Logged in as Recruiter: restrict
    if (user.role === "recruiter") {
      setRecruiterWarning(true);
      return;
    }

    // 3. Logged in as Seeker: proceed to apply page
    router.push(`/jobs/apply?jobId=${job._id}`);
  };

  const formatSalary = (min, max, currency = "USD") => {
    if (!min && !max) return "Competitive Salary";
    const currSymbol = currency === "USD" ? "$" : `${currency} `;
    if (min && max) {
      return `${currSymbol}${(min / 1000).toFixed(0)}k - ${currSymbol}${(max / 1000).toFixed(0)}k / year`;
    }
    if (min) return `From ${currSymbol}${(min / 1000).toFixed(0)}k / year`;
    return `Up to ${currSymbol}${(max / 1000).toFixed(0)}k / year`;
  };

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft width={16} height={16} className="transition-transform group-hover:-translate-x-1" />
          <span>Back to all jobs</span>
        </Link>

        {/* Job Header Card */}
        <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#121212] backdrop-blur-md shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 p-2 flex items-center justify-center overflow-hidden shrink-0">
                {job.companyLogo ? (
                  <img
                    src={job.companyLogo}
                    alt={job.companyName}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Briefcase width={28} height={28} className="text-purple-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-purple-300 text-sm">
                    {job.companyName}
                  </span>
                  <CircleCheck width={15} height={15} className="text-blue-400" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  {job.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/20">
                    {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white/5 text-neutral-300 border border-white/10 capitalize">
                    {job.type || "Full-time"}
                  </span>
                  {job.isRemote ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      <Globe width={12} height={12} />
                      <span>Remote</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 text-neutral-300 border border-white/10">
                      <MapPin width={12} height={12} />
                      <span>{job.location || "On-site"}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {applied ? (
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 font-semibold text-sm">
                <CircleCheck width={16} height={16} />
                <span>Application Submitted!</span>
              </div>
            ) : (
              <button
                onClick={handleApplyClick}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-purple-600/30 transition-all hover:scale-[1.02] shrink-0"
              >
                <span>Apply for this Position</span>
                <ArrowRight width={16} height={16} />
              </button>
            )}
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="mt-8 space-y-8 p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#121212]">
          {job.responsibilities && (
            <div>
              <h2 className="text-lg font-bold text-white mb-3">
                Key Responsibilities
              </h2>
              <p className="text-neutral-300 text-sm leading-relaxed whitespace-pre-line">
                {job.responsibilities}
              </p>
            </div>
          )}

          {job.requirements && (
            <div>
              <h2 className="text-lg font-bold text-white mb-3">
                Requirements & Skills
              </h2>
              <p className="text-neutral-300 text-sm leading-relaxed whitespace-pre-line">
                {job.requirements}
              </p>
            </div>
          )}

          {job.benefits && (
            <div>
              <h2 className="text-lg font-bold text-white mb-3">
                Benefits & Perks
              </h2>
              <p className="text-neutral-300 text-sm leading-relaxed whitespace-pre-line">
                {job.benefits}
              </p>
            </div>
          )}

          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Calendar width={14} height={14} />
              <span>
                Application Deadline: <strong>{job.deadline || "Open until filled"}</strong>
              </span>
            </span>
            <span className="text-purple-300">Verified Employer Listing</span>
          </div>
        </div>
      </div>

      {/* Recruiter Restriction Warning Modal */}
      {recruiterWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl border border-amber-500/20 bg-[#121212] p-6 sm:p-8 text-center text-white shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-5 text-amber-400">
              <TriangleExclamation width={26} height={26} />
            </div>

            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-300 mb-2">
              Role Restriction
            </span>

            <h3 className="text-xl font-bold text-white">
              Only Job Seekers Can Apply
            </h3>

            <p className="mt-3 text-xs sm:text-sm text-neutral-300 leading-relaxed">
              You are signed in as a Recruiter (
              <span className="text-amber-300 font-medium">{user?.email}</span>
              ). Recruiter accounts cannot submit applications. Please switch to a Job Seeker account to apply for jobs.
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
              <button
                onClick={async () => {
                  try {
                    await authClient.signOut();
                    window.location.href = `/signin?redirect=${encodeURIComponent(`/jobs/apply?jobId=${job._id}`)}`;
                  } catch (e) {
                    console.error("Sign out error:", e);
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs sm:text-sm transition-colors"
              >
                Switch to Job Seeker Account
              </button>
              <button
                onClick={() => setRecruiterWarning(false)}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs sm:text-sm transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
