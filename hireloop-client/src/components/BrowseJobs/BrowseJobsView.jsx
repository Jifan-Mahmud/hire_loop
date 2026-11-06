"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Briefcase,
  Calendar,
  CircleCheck,
  Clock,
  Eye,
  Globe,
  Magnifier,
  MapPin,
  SlidersVertical,
  Xmark,
  ArrowUpRightFromSquare,
  Building,
  TriangleExclamation,
} from "@gravity-ui/icons";
import { useSession, authClient } from "@/lib/auth-client";
import { getCandidateApplications } from "@/lib/api/applications";

const CATEGORIES = [
  { id: "all", label: "All Categories" },
  { id: "engineering", label: "Engineering" },
  { id: "design", label: "Design" },
  { id: "product", label: "Product" },
  { id: "marketing", label: "Marketing" },
  { id: "data-analytics", label: "Data & AI" },
  { id: "operations", label: "Operations" },
];

const JOB_TYPES = [
  { id: "all", label: "All Types" },
  { id: "full-time", label: "Full-time" },
  { id: "part-time", label: "Part-time" },
  { id: "contract", label: "Contract" },
  { id: "internship", label: "Internship" },
];

export default function BrowseJobsView({ initialJobs = [] }) {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const [jobs] = useState(initialJobs);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [remoteFilter, setRemoteFilter] = useState("all"); // 'all' | 'remote' | 'onsite'
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'salary-high'
  const [selectedJob, setSelectedJob] = useState(null);
  const [recruiterWarning, setRecruiterWarning] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState({});

  // Sync candidate's already submitted applications
  useEffect(() => {
    let isMounted = true;
    async function fetchApplied() {
      if (user?.email && user?.role !== "recruiter") {
        try {
          const apps = await getCandidateApplications(user.email);
          if (isMounted && Array.isArray(apps)) {
            const map = {};
            apps.forEach((app) => {
              if (app.jobId) map[app.jobId] = true;
            });
            setAppliedJobs(map);
          }
        } catch (e) {
          console.error("Error fetching applied jobs:", e);
        }
      } else {
        if (isMounted) setAppliedJobs({});
      }
    }
    fetchApplied();
    return () => {
      isMounted = false;
    };
  }, [user?.email, user?.role]);

  // Filter & Sort Logic
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    // 1. Text Search (title, companyName, location, category)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (j) =>
          (j.title && j.title.toLowerCase().includes(q)) ||
          (j.companyName && j.companyName.toLowerCase().includes(q)) ||
          (j.location && j.location.toLowerCase().includes(q)) ||
          (j.category && j.category.toLowerCase().includes(q)) ||
          (j.requirements && j.requirements.toLowerCase().includes(q))
      );
    }

    // 2. Category Filter
    if (selectedCategory !== "all") {
      result = result.filter(
        (j) => j.category && j.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // 3. Job Type Filter
    if (selectedType !== "all") {
      result = result.filter(
        (j) => j.type && j.type.toLowerCase() === selectedType.toLowerCase()
      );
    }

    // 4. Remote / Location Filter
    if (remoteFilter === "remote") {
      result = result.filter((j) => j.isRemote);
    } else if (remoteFilter === "onsite") {
      result = result.filter((j) => !j.isRemote);
    }

    // 5. Sorting
    if (sortBy === "salary-high") {
      result.sort((a, b) => (b.salaryMax || 0) - (a.salaryMax || 0));
    } else {
      // newest
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return result;
  }, [jobs, searchQuery, selectedCategory, selectedType, remoteFilter, sortBy]);

  // Format Salary Display
  const formatSalary = (min, max, currency = "USD") => {
    if (!min && !max) return "Competitive Salary";
    const currSymbol = currency === "USD" ? "$" : `${currency} `;
    if (min && max) {
      return `${currSymbol}${(min / 1000).toFixed(0)}k - ${currSymbol}${(max / 1000).toFixed(0)}k / yr`;
    }
    if (min) return `From ${currSymbol}${(min / 1000).toFixed(0)}k / yr`;
    return `Up to ${currSymbol}${(max / 1000).toFixed(0)}k / yr`;
  };

  const handleApply = (job) => {
    if (!job) return;
    const jobId = job._id || job;

    // 1. Not signed in: redirect to signin with callback to /jobs/apply?jobId=...
    if (!user) {
      const redirectUrl = `/jobs/apply?jobId=${jobId}`;
      router.push(`/signin?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }

    // 2. Logged in as recruiter: restricted from applying
    if (user.role === "recruiter") {
      setRecruiterWarning(true);
      return;
    }

    // 3. Logged in as Job Seeker: navigate to application form
    router.push(`/jobs/apply?jobId=${jobId}`);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedType("all");
    setRemoteFilter("all");
    setSortBy("newest");
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      {/* =========================================================
          HERO BANNER SECTION
         ========================================================= */}
      <section className="relative overflow-hidden pt-32 pb-14 border-b border-white/10 bg-gradient-to-b from-purple-950/20 via-black to-black">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-purple-600/10 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-20 right-10 w-[300px] h-[300px] bg-blue-600/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-300 mb-5 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span>30+ Active Positions from 12 Leading Tech Companies</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Find Your Next{" "}
            <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent">
              High-Impact Role
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Discover verified career openings across engineering, design, AI, and product
            from global leaders including Google, Apple, Meta, Amazon, and Airbnb.
          </p>

          {/* Search Box */}
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="relative flex items-center rounded-2xl bg-neutral-900/90 border border-white/15 p-2 shadow-2xl backdrop-blur-md focus-within:border-purple-500/60 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all">
              <div className="pl-3.5 text-neutral-400 flex items-center justify-center">
                <Magnifier width={20} height={20} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by job title, company (e.g. Google, Apple), skill, or location..."
                className="w-full bg-transparent px-3.5 py-2.5 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors mr-1"
                >
                  <Xmark width={16} height={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FILTER CONTROLS & CONTENT AREA
         ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-[1.02]"
                    : "bg-neutral-900/80 hover:bg-white/10 text-neutral-300 border border-white/10"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Work Mode Toggle */}
            <div className="inline-flex rounded-xl bg-neutral-900 border border-white/10 p-1 text-xs">
              <button
                onClick={() => setRemoteFilter("all")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  remoteFilter === "all" ? "bg-white/15 text-white shadow" : "text-neutral-400 hover:text-white"
                }`}
              >
                All Modes
              </button>
              <button
                onClick={() => setRemoteFilter("remote")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  remoteFilter === "remote" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow" : "text-neutral-400 hover:text-white"
                }`}
              >
                Remote Only
              </button>
              <button
                onClick={() => setRemoteFilter("onsite")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  remoteFilter === "onsite" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow" : "text-neutral-400 hover:text-white"
                }`}
              >
                On-site / Hybrid
              </button>
            </div>

            {/* Job Type Dropdown */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-xs text-neutral-300 focus:outline-none focus:border-purple-500/50"
            >
              {JOB_TYPES.map((t) => (
                <option key={t.id} value={t.id} className="bg-neutral-900 text-white">
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Results Count & Sort */}
          <div className="flex items-center gap-3 text-xs text-neutral-400">
            <span>
              Showing <strong className="text-white font-semibold">{filteredJobs.length}</strong> opportunities
            </span>
            <span className="text-white/20">|</span>
            <div className="flex items-center gap-1.5">
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-purple-300 font-medium focus:outline-none cursor-pointer"
              >
                <option value="newest" className="bg-neutral-900 text-white">
                  Newest First
                </option>
                <option value="salary-high" className="bg-neutral-900 text-white">
                  Highest Salary
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* =========================================================
            JOBS CARD GRID (কার্ড আকারে প্রদর্শন)
           ========================================================= */}
        {filteredJobs.length === 0 ? (
          <div className="py-20 text-center rounded-3xl border border-dashed border-white/15 bg-neutral-900/40 my-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 mb-4">
              <Briefcase width={28} height={28} />
            </div>
            <h3 className="text-xl font-bold text-white">No jobs match your search</h3>
            <p className="text-neutral-400 text-sm max-w-md mx-auto mt-1 mb-6">
              We couldn&apos;t find any positions matching your selected filters. Try broadening your keywords.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all border border-white/10"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => {
              const isApplied = !!appliedJobs[job._id];

              return (
                <div
                  key={job._id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#121212] p-5 sm:p-6 transition-all duration-300 hover:border-purple-500/40 hover:bg-[#161616] hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10"
                >
                  <div>
                    {/* Top Company Info Bar */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 p-1.5 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-purple-500/30 transition-colors">
                          {job.companyLogo ? (
                            <img
                              src={job.companyLogo}
                              alt={job.companyName || "Company logo"}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <Briefcase width={20} height={20} className="text-purple-400" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-sm text-white group-hover:text-purple-300 transition-colors">
                              {job.companyName || "Technology Partner"}
                            </span>
                            <CircleCheck width={14} height={14} className="text-blue-400 shrink-0" />
                          </div>
                          <p className="text-xs text-neutral-400 mt-0.5 capitalize">
                            {job.category || "General Tech"}
                          </p>
                        </div>
                      </div>

                      {/* Work Mode Badge */}
                      {job.isRemote ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20 shrink-0">
                          <Globe width={11} height={11} />
                          <span>Remote</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/5 text-neutral-300 border border-white/10 shrink-0 truncate max-w-[130px]">
                          <MapPin width={11} height={11} className="shrink-0" />
                          <span className="truncate">{job.location?.split(",")[0] || "On-site"}</span>
                        </span>
                      )}
                    </div>

                    {/* Job Title */}
                    <h3 className="mt-4 text-base sm:text-lg font-bold text-white tracking-tight leading-snug group-hover:text-purple-200 transition-colors">
                      {job.title}
                    </h3>

                    {/* Responsibilities Snippet */}
                    <p className="mt-2 text-xs sm:text-sm text-neutral-400 line-clamp-2 leading-relaxed">
                      {job.responsibilities || job.requirements || "Exciting role to scale modern infrastructure and build impactful products."}
                    </p>

                    {/* Tags Row */}
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      {job.type && (
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-white/5 text-neutral-300 border border-white/10 capitalize">
                          {job.type}
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Card Bottom / Actions */}
                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1 text-neutral-400 truncate max-w-[130px]">
                      <Clock width={13} height={13} className="shrink-0" />
                      <span className="truncate">{job.deadline ? `Due: ${job.deadline}` : "Actively Hiring"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-medium text-xs transition-colors"
                      >
                        Details
                      </button>
                      {appliedJobs[job._id] ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-medium text-xs">
                          <span>Applied ✓</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApply(job)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs transition-all shadow-md shadow-purple-600/20 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <span>Apply</span>
                          <ArrowRight width={12} height={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* =========================================================
          INTERACTIVE JOB DETAIL MODAL
         ========================================================= */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl border border-white/15 bg-neutral-900 p-6 sm:p-8 text-white shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/15 text-neutral-400 hover:text-white transition-colors"
            >
              <Xmark width={18} height={18} />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-4 pr-10">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 p-2 flex items-center justify-center overflow-hidden shrink-0">
                {selectedJob.companyLogo ? (
                  <img
                    src={selectedJob.companyLogo}
                    alt={selectedJob.companyName}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Briefcase width={28} height={28} className="text-purple-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-purple-300">
                    {selectedJob.companyName}
                  </span>
                  <CircleCheck width={15} height={15} className="text-blue-400" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 leading-snug">
                  {selectedJob.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    {formatSalary(selectedJob.salaryMin, selectedJob.salaryMax, selectedJob.currency)}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs bg-white/10 text-neutral-300 capitalize">
                    {selectedJob.type || "Full-time"}
                  </span>
                  {selectedJob.isRemote ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      Remote
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs bg-white/10 text-neutral-300">
                      {selectedJob.location || "On-site"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-white/10" />

            {/* Modal Body Content */}
            <div className="space-y-6 text-sm">
              {/* Responsibilities */}
              <div>
                <h4 className="font-semibold text-white uppercase tracking-wider text-xs text-neutral-400 mb-2">
                  Role Overview & Responsibilities
                </h4>
                <p className="text-neutral-300 leading-relaxed whitespace-pre-line">
                  {selectedJob.responsibilities || "Build and architect scalable systems, coordinate with cross-functional teams, and solve critical high-impact challenges."}
                </p>
              </div>

              {/* Requirements */}
              <div>
                <h4 className="font-semibold text-white uppercase tracking-wider text-xs text-neutral-400 mb-2">
                  Requirements & Experience
                </h4>
                <p className="text-neutral-300 leading-relaxed whitespace-pre-line">
                  {selectedJob.requirements || "Strong hands-on experience in modern technology stacks, problem-solving capabilities, and excellent team communication."}
                </p>
              </div>

              {/* Benefits */}
              {selectedJob.benefits && (
                <div>
                  <h4 className="font-semibold text-white uppercase tracking-wider text-xs text-neutral-400 mb-2">
                    Benefits & Perks
                  </h4>
                  <p className="text-neutral-300 leading-relaxed whitespace-pre-line">
                    {selectedJob.benefits}
                  </p>
                </div>
              )}

              {/* Timeline Info */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <Calendar width={14} height={14} />
                  <span>
                    Deadline: <strong>{selectedJob.deadline || "Open until filled"}</strong>
                  </span>
                </span>
                <span className="text-purple-300">Verified Listing</span>
              </div>
            </div>

            {/* Modal Footer / Action Button */}
            <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between gap-4">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors"
              >
                Close
              </button>

              {appliedJobs[selectedJob._id] ? (
                <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 text-sm font-semibold">
                  <CircleCheck width={16} height={16} />
                  <span>Already Applied ✓</span>
                </div>
              ) : (
                <button
                  onClick={() => handleApply(selectedJob)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Apply for this Role</span>
                  <ArrowRight width={16} height={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          RECRUITER ROLE RESTRICTION WARNING MODAL
         ========================================================= */}
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
                    const redirectTarget = selectedJob?._id
                      ? `/jobs/apply?jobId=${selectedJob._id}`
                      : "/jobs/apply";
                    window.location.href = `/signin?redirect=${encodeURIComponent(redirectTarget)}`;
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
