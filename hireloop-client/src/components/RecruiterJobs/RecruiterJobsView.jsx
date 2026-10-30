"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Briefcase,
  Calendar,
  CircleCheck,
  CircleXmark,
  Eye,
  Globe,
  LayoutHeaderCellsLarge,
  LayoutList,
  Magnifier,
  MapPin,
  Plus,
  TrashBin,
} from "@gravity-ui/icons";
import { deleteJob, updateJobStatus } from "@/lib/api/jobs";

export default function RecruiterJobsView({ initialJobs = [], companyId = "company-default-id" }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'cards'
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Filtered jobs based on search & filters
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        (job.title && job.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (job.category && job.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (job.location && job.location.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ||
        (job.status || "active").toLowerCase() === statusFilter.toLowerCase();

      const matchesType =
        typeFilter === "all" ||
        (job.type || "").toLowerCase() === typeFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [jobs, searchQuery, statusFilter, typeFilter]);

  // Stats calculation
  const totalCount = jobs.length;
  const activeCount = jobs.filter((j) => (j.status || "active") === "active").length;
  const remoteCount = jobs.filter((j) => j.isRemote).length;
  const closedCount = jobs.filter((j) => j.status === "closed").length;

  // Handle Delete
  const handleDelete = async (jobId, title) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${title}"?`);
    if (!confirmed) return;

    setDeletingId(jobId);
    try {
      const res = await deleteJob(jobId);
      if (res && !res.error) {
        setJobs((prev) => prev.filter((j) => j._id !== jobId));
        if (selectedJob?._id === jobId) setSelectedJob(null);
      } else {
        alert(res?.error || "Failed to delete job.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting job.");
    } finally {
      setDeletingId(null);
    }
  };

  // Handle Status Toggle (active <-> closed)
  const handleToggleStatus = async (job) => {
    const nextStatus = job.status === "closed" ? "active" : "closed";
    setUpdatingId(job._id);
    try {
      const res = await updateJobStatus(job._id, nextStatus);
      if (res && !res.error) {
        setJobs((prev) =>
          prev.map((j) => (j._id === job._id ? { ...j, status: nextStatus } : j))
        );
        if (selectedJob?._id === job._id) {
          setSelectedJob((prev) => ({ ...prev, status: nextStatus }));
        }
      } else {
        alert("Failed to update status.");
      }
    } catch (err) {
      console.error("Status update error:", err);
      alert("Error updating status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatSalary = (job) => {
    if (job.salaryMin && job.salaryMax) {
      return `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} ${job.currency || "USD"}`;
    }
    if (job.salaryMin) {
      return `From ${job.salaryMin.toLocaleString()} ${job.currency || "USD"}`;
    }
    return "Negotiable";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Manage Posted Jobs
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Track, review, and manage all employment openings for your company.
          </p>
        </div>

        <Link
          href="/deshboard/recruiter/jobs/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto text-sm"
        >
          <Plus width={18} height={18} />
          <span>Post New Job</span>
        </Link>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Briefcase width={20} height={20} />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-medium">Total Jobs</p>
            <p className="text-xl font-bold text-white mt-0.5">{totalCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CircleCheck width={20} height={20} />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-medium">Active Posts</p>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">{activeCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Globe width={20} height={20} />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-medium">Remote Roles</p>
            <p className="text-xl font-bold text-white mt-0.5">{remoteCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-neutral-500/10 border border-white/10 flex items-center justify-center text-neutral-400">
            <CircleXmark width={20} height={20} />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-medium">Closed</p>
            <p className="text-xl font-bold text-neutral-300 mt-0.5">{closedCount}</p>
          </div>
        </div>
      </div>

      {/* Filter and View Switcher Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-neutral-900/40 border border-white/10">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
            <Magnifier width={16} height={16} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by job title, category, or location..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-950/80 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-neutral-950/80 border border-white/10 rounded-xl text-neutral-200 focus:outline-none focus:border-purple-500 transition-colors"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-neutral-950/80 border border-white/10 rounded-xl text-neutral-200 focus:outline-none focus:border-purple-500 transition-colors"
          >
            <option value="all">All Types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>

          {/* View Toggle Buttons */}
          <div className="flex items-center border border-white/10 rounded-xl bg-neutral-950/80 p-0.5">
            <button
              onClick={() => setViewMode("table")}
              title="Table View"
              className={`p-1.5 rounded-lg text-sm transition-all ${
                viewMode === "table"
                  ? "bg-purple-600 text-white shadow"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <LayoutList width={18} height={18} />
            </button>
            <button
              onClick={() => setViewMode("cards")}
              title="Cards Grid View"
              className={`p-1.5 rounded-lg text-sm transition-all ${
                viewMode === "cards"
                  ? "bg-purple-600 text-white shadow"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <LayoutHeaderCellsLarge width={18} height={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Data Presentation (Empty State or List) */}
      {filteredJobs.length === 0 ? (
        <div className="py-16 px-4 text-center rounded-3xl border border-dashed border-white/10 bg-neutral-900/30">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 mb-4">
            <Briefcase width={28} height={28} />
          </div>
          <h3 className="text-lg font-semibold text-white">No jobs found</h3>
          <p className="text-sm text-neutral-400 max-w-md mx-auto mt-1 mb-6">
            {jobs.length === 0
              ? "You haven't posted any jobs yet. Start building your team by posting a new job opportunity."
              : "No jobs match your selected search or filter criteria. Try clearing filters."}
          </p>
          {jobs.length === 0 ? (
            <Link
              href="/deshboard/recruiter/jobs/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-all"
            >
              <Plus width={18} height={18} />
              <span>Post Your First Job</span>
            </Link>
          ) : (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setTypeFilter("all");
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm text-white transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : viewMode === "table" ? (
        /* ================= TABLE VIEW ================= */
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-neutral-900/50 backdrop-blur-sm shadow-xl">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-neutral-950/70 text-neutral-400 font-medium text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4">Job Title & Category</th>
                <th className="py-3.5 px-4">Type & Location</th>
                <th className="py-3.5 px-4">Salary</th>
                <th className="py-3.5 px-4">Deadline</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-neutral-200">
              {filteredJobs.map((job) => {
                const isActive = (job.status || "active") === "active";
                return (
                  <tr
                    key={job._id}
                    className="hover:bg-white/[0.03] transition-colors group"
                  >
                    {/* Title & Category */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                        {job.title}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {job.category && (
                          <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 capitalize">
                            {job.category}
                          </span>
                        )}
                        {job.isRemote && (
                          <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                            Remote
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Type & Location */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="capitalize text-neutral-300 font-medium">
                        {job.type || "Full-time"}
                      </div>
                      <div className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                        <MapPin width={12} height={12} className="text-neutral-500" />
                        <span>{job.isRemote ? "Anywhere" : job.location || "Not specified"}</span>
                      </div>
                    </td>

                    {/* Salary */}
                    <td className="py-4 px-4 whitespace-nowrap font-medium text-neutral-200">
                      {formatSalary(job)}
                    </td>

                    {/* Deadline */}
                    <td className="py-4 px-4 whitespace-nowrap text-xs text-neutral-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar width={13} height={13} className="text-neutral-500" />
                        <span>{formatDate(job.deadline)}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(job)}
                        disabled={updatingId === job._id}
                        title="Click to toggle status"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all border ${
                          isActive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? "bg-emerald-400 animate-pulse" : "bg-neutral-500"
                          }`}
                        />
                        <span className="capitalize">{job.status || "active"}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {/* View Details */}
                        <button
                          onClick={() => setSelectedJob(job)}
                          title="View Details"
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <Eye width={16} height={16} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(job._id, job.title)}
                          disabled={deletingId === job._id}
                          title="Delete Job"
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        >
                          <TrashBin width={16} height={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* ================= CARDS VIEW ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => {
            const isActive = (job.status || "active") === "active";
            return (
              <div
                key={job._id}
                className="group relative flex flex-col justify-between p-5 rounded-2xl bg-neutral-900/60 border border-white/10 hover:border-purple-500/40 hover:bg-neutral-900/80 transition-all duration-300 shadow-lg hover:shadow-purple-500/5"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 capitalize">
                      {job.category || "General"}
                    </span>

                    <button
                      onClick={() => handleToggleStatus(job)}
                      disabled={updatingId === job._id}
                      title="Click to toggle status"
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all border ${
                        isActive
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-neutral-800 text-neutral-400 border-neutral-700"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isActive ? "bg-emerald-400 animate-pulse" : "bg-neutral-500"
                        }`}
                      />
                      <span className="capitalize">{job.status || "active"}</span>
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white mt-3 group-hover:text-purple-300 transition-colors line-clamp-1">
                    {job.title}
                  </h3>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 mt-2.5">
                    <span className="inline-flex items-center gap-1 text-xs text-neutral-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg capitalize">
                      <Briefcase width={12} height={12} className="text-purple-400" />
                      {job.type || "Full-time"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-neutral-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                      <MapPin width={12} height={12} className="text-purple-400" />
                      {job.isRemote ? "Remote" : job.location || "On-site"}
                    </span>
                  </div>

                  {/* Responsibilities summary */}
                  {job.responsibilities && (
                    <p className="text-xs text-neutral-400 mt-3 line-clamp-2 leading-relaxed">
                      {job.responsibilities}
                    </p>
                  )}
                </div>

                {/* Card Footer */}
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-neutral-500 uppercase tracking-wider font-medium">
                      Salary
                    </p>
                    <p className="text-sm font-semibold text-neutral-200 mt-0.5">
                      {formatSalary(job)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(job._id, job.title)}
                      disabled={deletingId === job._id}
                      className="p-1.5 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <TrashBin width={15} height={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= JOB DETAILS MODAL ================= */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-neutral-900 border border-white/15 p-6 md:p-8 shadow-2xl text-white">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20 capitalize mb-2">
                  {selectedJob.category || "General"}
                </span>
                <h2 className="text-2xl font-bold text-white">{selectedJob.title}</h2>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-400 flex-wrap">
                  <span className="capitalize">{selectedJob.type}</span>
                  <span>•</span>
                  <span>{selectedJob.isRemote ? "Remote" : selectedJob.location || "On-site"}</span>
                  <span>•</span>
                  <span>Deadline: {formatDate(selectedJob.deadline)}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedJob(null)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <CircleXmark width={20} height={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="py-5 space-y-5 text-sm">
              {/* Quick Details Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div>
                  <p className="text-xs text-neutral-500">Status</p>
                  <p className="font-medium text-emerald-400 capitalize mt-0.5">
                    {selectedJob.status || "active"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Salary</p>
                  <p className="font-medium text-white mt-0.5">{formatSalary(selectedJob)}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Workplace</p>
                  <p className="font-medium text-white mt-0.5">
                    {selectedJob.isRemote ? "Remote Role" : "On-site"}
                  </p>
                </div>
              </div>

              {/* Responsibilities */}
              {selectedJob.responsibilities && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-400 mb-1.5">
                    Responsibilities
                  </h4>
                  <div className="p-4 rounded-xl bg-neutral-950/60 border border-white/5 text-neutral-300 leading-relaxed whitespace-pre-line">
                    {selectedJob.responsibilities}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {selectedJob.requirements && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-400 mb-1.5">
                    Requirements
                  </h4>
                  <div className="p-4 rounded-xl bg-neutral-950/60 border border-white/5 text-neutral-300 leading-relaxed whitespace-pre-line">
                    {selectedJob.requirements}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {selectedJob.benefits && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-400 mb-1.5">
                    Benefits & Perks
                  </h4>
                  <div className="p-4 rounded-xl bg-neutral-950/60 border border-white/5 text-neutral-300 leading-relaxed whitespace-pre-line">
                    {selectedJob.benefits}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-neutral-500">
                Posted on {formatDate(selectedJob.createdAt)}
              </span>
              <button
                onClick={() => setSelectedJob(null)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
