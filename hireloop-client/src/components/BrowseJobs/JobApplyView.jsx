"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Calendar,
  Check,
  CircleCheck,
  CircleExclamation,
  Envelope,
  FileText,
  Globe,
  Link as LinkIcon,
  Lock,
  MapPin,
  Person,
  TriangleExclamation,
} from "@gravity-ui/icons";
import { useSession, authClient } from "@/lib/auth-client";
import { submitApplication, checkApplicationStatus } from "@/lib/api/applications";

export default function JobApplyView({
  initialJob = null,
  initialJobId = null,
  activeJobs = [],
}) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const [selectedJob, setSelectedJob] = useState(
    initialJob || (activeJobs.length > 0 ? activeJobs.find((j) => j._id === initialJobId) || activeJobs[0] : null)
  );

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
    resumeUrl: "",
    coverLetter: "",
    portfolioUrl: "",
    githubUrl: "",
    linkedinUrl: "",
    experience: "1-3 years",
    expectedSalary: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingApplied, setCheckingApplied] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  // Check if candidate already applied for the selected job
  useEffect(() => {
    let isMounted = true;
    async function checkStatus() {
      if (selectedJob?._id && user?.email && user?.role !== "recruiter") {
        setCheckingApplied(true);
        try {
          const res = await checkApplicationStatus(selectedJob._id, user.email);
          if (isMounted) {
            setHasApplied(Boolean(res?.hasApplied));
            setSubmittedData(res?.application || null);
          }
        } catch (e) {
          console.error("Error checking applied status:", e);
        } finally {
          if (isMounted) setCheckingApplied(false);
        }
      } else {
        if (isMounted) {
          setHasApplied(false);
          setSubmittedData(null);
        }
      }
    }
    checkStatus();
    return () => {
      isMounted = false;
    };
  }, [selectedJob?._id, user?.email, user?.role]);

  // Handle switching to a different job and dynamically update URL
  const handleRoleSwitch = (newJobId) => {
    const targetJob = activeJobs.find((item) => item._id === newJobId);
    if (!targetJob) return;

    setSelectedJob(targetJob);
    setErrorMessage("");
    setHasApplied(false);
    setSubmittedData(null);

    // Update browser URL query param so jobId is updated live
    router.replace(`/jobs/apply?jobId=${targetJob._id}`, { scroll: false });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage("");
  };

  const handleSignOutAndSwitch = async () => {
    try {
      await authClient.signOut();
      const redirectPath = selectedJob?._id
        ? `/jobs/apply?jobId=${selectedJob._id}`
        : "/jobs/apply";
      window.location.href = `/signin?redirect=${encodeURIComponent(redirectPath)}`;
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!selectedJob) {
      setErrorMessage("Please select a job position to apply for.");
      return;
    }

    const applicantName = (formData.name !== "" ? formData.name : (user?.name || "")).trim();

    if (!applicantName) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!formData.phone.trim()) {
      setErrorMessage("Please enter your phone number.");
      return;
    }

    if (!formData.resumeUrl.trim()) {
      setErrorMessage("Please provide a link to your resume (Google Drive, Dropbox, PDF URL, or Portfolio).");
      return;
    }

    if (!formData.coverLetter.trim() || formData.coverLetter.trim().length < 25) {
      setErrorMessage("Please write a cover letter with at least 25 characters.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        jobId: selectedJob._id,
        jobTitle: selectedJob.title,
        companyId: selectedJob.companyId,
        companyName: selectedJob.companyName,
        companyLogo: selectedJob.companyLogo || "",
        recruiterEmail: selectedJob.recruiterEmail || "",
        applicantId: user.id || user._id,
        applicantName: applicantName,
        applicantEmail: user.email,
        applicantRole: user.role || "seeker",
        phone: formData.phone.trim(),
        location: formData.location.trim(),
        resumeUrl: formData.resumeUrl.trim(),
        coverLetter: formData.coverLetter.trim(),
        portfolioUrl: formData.portfolioUrl.trim(),
        githubUrl: formData.githubUrl.trim(),
        linkedinUrl: formData.linkedinUrl.trim(),
        experience: formData.experience,
        expectedSalary: formData.expectedSalary.trim(),
      };

      const result = await submitApplication(payload);

      if (!result.success) {
        setErrorMessage(result.error || "Failed to submit application.");
        return;
      }

      setSubmittedData({
        ...payload,
        appliedAt: new Date().toISOString(),
      });
      setHasApplied(true);
    } catch (err) {
      console.error("Submission error:", err);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatSalary = (min, max, currency = "USD") => {
    if (!min && !max) return "Competitive Salary";
    const curr = currency === "USD" ? "$" : `${currency} `;
    if (min && max) {
      return `${curr}${(min / 1000).toFixed(0)}k - ${curr}${(max / 1000).toFixed(0)}k / yr`;
    }
    if (min) return `From ${curr}${(min / 1000).toFixed(0)}k / yr`;
    return `Up to ${curr}${(max / 1000).toFixed(0)}k / yr`;
  };

  const currentRedirectTarget = selectedJob?._id
    ? `/jobs/apply?jobId=${selectedJob._id}`
    : "/jobs/apply";

  // ==========================================
  // CASE 1: LOADING SESSION
  // ==========================================
  if (isPending) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center pt-24">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-neutral-400">Verifying your account session...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // CASE 2: NOT LOGGED IN
  // ==========================================
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white pt-32 pb-20 px-4">
        <div className="max-w-xl mx-auto">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft width={16} height={16} />
            <span>Back to all jobs</span>
          </Link>

          <div className="rounded-3xl border border-white/10 bg-[#121212] p-8 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-purple-600/20 blur-[60px] pointer-events-none rounded-full" />

            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-6 text-purple-400">
              <Lock width={28} height={28} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Authentication Required
            </h1>
            <p className="mt-3 text-sm text-neutral-400 leading-relaxed max-w-md mx-auto">
              You must be signed in with a <strong>Job Seeker</strong> account to apply for positions on HireLoop.
            </p>

            {selectedJob && (
              <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 text-left flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 p-2 flex items-center justify-center overflow-hidden shrink-0">
                  {selectedJob.companyLogo ? (
                    <img
                      src={selectedJob.companyLogo}
                      alt={selectedJob.companyName}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Briefcase width={20} height={20} className="text-purple-400" />
                  )}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-purple-300">{selectedJob.companyName}</p>
                  <h4 className="text-base font-bold text-white truncate">{selectedJob.title}</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {selectedJob.isRemote ? "Remote" : selectedJob.location || "On-site"} • {formatSalary(selectedJob.salaryMin, selectedJob.salaryMax, selectedJob.currency)}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/signin?redirect=${encodeURIComponent(currentRedirectTarget)}`}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
              >
                <span>Sign in to Apply</span>
                <ArrowRight width={16} height={16} />
              </Link>

              <Link
                href={`/signup?redirect=${encodeURIComponent(currentRedirectTarget)}`}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-colors flex items-center justify-center"
              >
                <span>Create Job Seeker Account</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // CASE 3: LOGGED IN AS RECRUITER (RESTRICTED)
  // ==========================================
  if (user?.role === "recruiter") {
    return (
      <div className="min-h-screen bg-black text-white pt-32 pb-20 px-4">
        <div className="max-w-xl mx-auto">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft width={16} height={16} />
            <span>Back to all jobs</span>
          </Link>

          <div className="rounded-3xl border border-amber-500/20 bg-[#121212] p-8 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-amber-500/10 blur-[60px] pointer-events-none rounded-full" />

            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-6 text-amber-400">
              <TriangleExclamation width={28} height={28} />
            </div>

            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-300 mb-3">
              Role Restriction
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Only Job Seekers Can Apply
            </h1>

            <p className="mt-3 text-sm text-neutral-300 leading-relaxed max-w-md mx-auto">
              You are currently logged in with a <strong>Recruiter account</strong> (
              <span className="text-amber-300 font-medium">{user.email}</span>
              ). Recruiters can post jobs and hire talent, but cannot submit job applications.
            </p>

            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleSignOutAndSwitch}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-all shadow-lg shadow-amber-500/20"
              >
                Sign In as Job Seeker
              </button>

              <Link
                href="/deshboard/recruiter"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-colors text-center"
              >
                Go to Recruiter Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // CASE 4: ALREADY APPLIED OR JUST SUBMITTED
  // ==========================================
  if (hasApplied) {
    return (
      <div className="min-h-screen bg-black text-white pt-32 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft width={16} height={16} />
            <span>Back to all jobs</span>
          </Link>

          <div className="rounded-3xl border border-emerald-500/30 bg-[#121212] p-8 sm:p-10 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-36 bg-emerald-500/15 blur-[70px] pointer-events-none rounded-full" />

            <div className="w-18 h-18 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 text-emerald-400">
              <CircleCheck width={36} height={36} />
            </div>

            <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-300 mb-3">
              Application Status: Pending Review
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Application Successfully Submitted!
            </h1>

            <p className="mt-3 text-sm text-neutral-300 leading-relaxed max-w-lg mx-auto">
              Your application for <strong>{selectedJob?.title}</strong> at{" "}
              <strong>{selectedJob?.companyName}</strong> has been received by the hiring team.
            </p>

            {/* Application Summary Box */}
            <div className="mt-8 rounded-2xl bg-white/5 border border-white/10 p-5 text-left space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-neutral-400">Applicant:</span>
                <span className="font-semibold text-white">{submittedData?.applicantName || user.name}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-neutral-400">Contact Email:</span>
                <span className="font-semibold text-white">{submittedData?.applicantEmail || user.email}</span>
              </div>
              {submittedData?.resumeUrl && (
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-neutral-400">Resume Link:</span>
                  <a
                    href={submittedData.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 underline font-medium truncate max-w-[250px]"
                  >
                    View Submitted Resume
                  </a>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Submission Date:</span>
                <span className="text-neutral-300">
                  {submittedData?.appliedAt
                    ? new Date(submittedData.appliedAt).toLocaleDateString()
                    : "Today"}
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/jobs"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-600/30"
              >
                Browse More Jobs
              </Link>
              {selectedJob?._id && (
                <Link
                  href={`/jobs/${selectedJob._id}`}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-colors"
                >
                  View Job Details
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // CASE 5: APPLICATION FORM FOR JOB SEEKER
  // ==========================================
  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Back */}
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-6 transition-colors group"
        >
          <ArrowLeft width={16} height={16} className="transition-transform group-hover:-translate-x-1" />
          <span>Back to Browse Jobs</span>
        </Link>

        {/* Header / Intro */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-medium text-purple-300 mb-3">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span>Job Seeker Application</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Apply for Position
          </h1>
          <p className="mt-2 text-sm sm:text-base text-neutral-400">
            Submit your resume and details directly to the hiring team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* =========================================
              LEFT COLUMN: Selected Job Preview Card
             ========================================= */}
          <div className="lg:col-span-1 space-y-6">
            {selectedJob ? (
              <div className="rounded-3xl border border-white/15 bg-[#121212] p-6 shadow-xl sticky top-28">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-4">
                  Applying For
                </span>

                <div className="flex items-start gap-3.5 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 p-2 flex items-center justify-center overflow-hidden shrink-0">
                    {selectedJob.companyLogo ? (
                      <img
                        src={selectedJob.companyLogo}
                        alt={selectedJob.companyName}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Briefcase width={24} height={24} className="text-purple-400" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-purple-300 block">
                      {selectedJob.companyName}
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5 leading-snug">
                      {selectedJob.title}
                    </h3>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-neutral-300 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Compensation:</span>
                    <span className="font-semibold text-emerald-300">
                      {formatSalary(selectedJob.salaryMin, selectedJob.salaryMax, selectedJob.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Work Model:</span>
                    <span className="capitalize">{selectedJob.isRemote ? "Remote" : selectedJob.location || "On-site"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Employment:</span>
                    <span className="capitalize">{selectedJob.type || "Full-time"}</span>
                  </div>
                  {selectedJob.deadline && (
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Deadline:</span>
                      <span className="text-neutral-300">{selectedJob.deadline}</span>
                    </div>
                  )}
                </div>

                {/* Job Switcher if other jobs available */}
                {activeJobs.length > 1 && (
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <label className="block text-xs font-medium text-neutral-400 mb-2">
                      Switch Role:
                    </label>
                    <select
                      value={selectedJob._id}
                      onChange={(e) => handleRoleSwitch(e.target.value)}
                      className="w-full text-xs rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      {activeJobs.map((j) => (
                        <option key={j._id} value={j._id} className="bg-neutral-900 text-white">
                          {j.companyName} — {j.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-3xl border border-white/15 bg-[#121212] p-6 text-center text-neutral-400">
                <Briefcase width={32} height={32} className="mx-auto mb-3 text-neutral-500" />
                <p className="text-sm">No job selected.</p>
                <Link
                  href="/jobs"
                  className="mt-3 inline-block text-xs text-purple-400 hover:text-purple-300 underline"
                >
                  Choose a job to apply
                </Link>
              </div>
            )}
          </div>

          {/* =========================================
              RIGHT COLUMN: Application Form
             ========================================= */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-white/15 bg-[#121212] p-6 sm:p-8 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-1">
                Candidate Information
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mb-6">
                Fill in your details, resume link, and why you are the best fit for this role.
              </p>

              {errorMessage && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                  <CircleExclamation width={18} height={18} className="shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-2">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Person className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name !== "" ? formData.name : (user?.name || "")}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, name: e.target.value }));
                          setErrorMessage("");
                        }}
                        placeholder="e.g. John Doe"
                        required
                        className="w-full h-11 rounded-xl bg-white/5 border border-white/10 pl-10 pr-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-2">
                      Email Address <span className="text-neutral-500">(from session)</span>
                    </label>
                    <div className="relative">
                      <Envelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
                      <input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="w-full h-11 rounded-xl bg-white/[0.02] border border-white/10 pl-10 pr-3.5 text-sm text-neutral-400 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Phone & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-2">
                      Phone Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +1 (555) 019-2834"
                      required
                      className="w-full h-11 rounded-xl bg-white/5 border border-white/10 px-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-2">
                      Current City / Country
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g. San Francisco, CA or Remote"
                        className="w-full h-11 rounded-xl bg-white/5 border border-white/10 pl-10 pr-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Resume URL */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-neutral-300">
                      Resume / CV Link <span className="text-red-400">*</span>
                    </label>
                    <span className="text-[11px] text-neutral-500">
                      Google Drive, Dropbox, PDF URL, or Portfolio link
                    </span>
                  </div>
                  <div className="relative">
                    <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
                    <input
                      type="url"
                      name="resumeUrl"
                      value={formData.resumeUrl}
                      onChange={handleChange}
                      placeholder="https://drive.google.com/file/d/... or https://..."
                      required
                      className="w-full h-11 rounded-xl bg-white/5 border border-white/10 pl-10 pr-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-neutral-500">
                    Make sure link permissions are set to &quot;Anyone with the link can view&quot;.
                  </p>
                </div>

                {/* Experience & Expected Salary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-2">
                      Years of Relevant Experience
                    </label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className="w-full h-11 rounded-xl bg-neutral-900 border border-white/10 px-3.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      <option value="< 1 year">Less than 1 year</option>
                      <option value="1-3 years">1 - 3 years</option>
                      <option value="3-5 years">3 - 5 years</option>
                      <option value="5-8 years">5 - 8 years</option>
                      <option value="8+ years">8+ years</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-2">
                      Expected Annual Salary (USD)
                    </label>
                    <input
                      type="text"
                      name="expectedSalary"
                      value={formData.expectedSalary}
                      onChange={handleChange}
                      placeholder="e.g. $140,000"
                      className="w-full h-11 rounded-xl bg-white/5 border border-white/10 px-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Portfolio / LinkedIn / GitHub Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-2">
                      LinkedIn Profile URL
                    </label>
                    <input
                      type="url"
                      name="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full h-11 rounded-xl bg-white/5 border border-white/10 px-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-2">
                      GitHub or Portfolio Website
                    </label>
                    <input
                      type="url"
                      name="githubUrl"
                      value={formData.githubUrl}
                      onChange={handleChange}
                      placeholder="https://github.com/username"
                      className="w-full h-11 rounded-xl bg-white/5 border border-white/10 px-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Cover Letter */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-neutral-300">
                      Cover Letter / Statement of Interest <span className="text-red-400">*</span>
                    </label>
                    <span className="text-[11px] text-neutral-500">Min 25 chars</span>
                  </div>
                  <textarea
                    name="coverLetter"
                    rows={5}
                    value={formData.coverLetter}
                    onChange={handleChange}
                    placeholder="Describe your background, what excites you about this role, and key contributions you can deliver..."
                    required
                    className="w-full rounded-2xl bg-white/5 border border-white/10 p-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors leading-relaxed"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t border-white/10">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500 text-white font-semibold text-sm transition-all shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Job Application</span>
                        <ArrowRight width={16} height={16} />
                      </>
                    )}
                  </button>
                  <p className="text-center text-[11px] text-neutral-500 mt-3">
                    By submitting, your profile and resume will be securely transmitted to {selectedJob?.companyName || "the recruiter"}.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
