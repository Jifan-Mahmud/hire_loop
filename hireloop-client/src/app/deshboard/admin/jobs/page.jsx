"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Eye,
  TrashBin,
  Plus,
  ChevronDown,
  ChartLine,
  Clock,
  Envelope,
} from "@gravity-ui/icons";
import AdminTopBar from "@/components/Admin/AdminTopBar";
import { getAdminJobs, updateJobStatus, deleteJob } from "@/lib/api/admin";
import Pagination from "@/components/Common/Pagination";
import StatusBadge from "@/components/Common/StatusBadge";
import { formatDate, formatSalary } from "@/lib/utils/formatters";

// Default showcase jobs matching Image 3
const defaultJobs = [
  {
    id: "j-1",
    title: "Senior Product Designer",
    ref: "Ref: HL-99210",
    company: "Nexus Lab",
    code: "N",
    category: "Design",
    type: "Full-time",
    datePosted: "Oct 24, 2026",
    status: "active",
    salary: "$120,000 - $150,000",
    location: "San Francisco, CA",
  },
  {
    id: "j-2",
    title: "Full-stack Engineer",
    ref: "Ref: HL-88231",
    company: "Quantum",
    code: "Q",
    category: "Engineering",
    type: "Contract",
    datePosted: "Oct 22, 2026",
    status: "active",
    salary: "$90 - $110/hr",
    location: "Remote",
  },
  {
    id: "j-3",
    title: "Marketing Director",
    ref: "Ref: HL-10522",
    company: "Vanguard",
    code: "V",
    category: "Marketing",
    type: "Full-time",
    datePosted: "Oct 15, 2026",
    status: "closed",
    salary: "$130,000 - $160,000",
    location: "New York, NY",
  },
  {
    id: "j-4",
    title: "Backend Architect",
    ref: "Ref: HL-99032",
    company: "CloudScale",
    code: "C",
    category: "Engineering",
    type: "Remote",
    datePosted: "Oct 20, 2026",
    status: "active",
    salary: "$160,000 - $190,000",
    location: "Austin, TX (Remote)",
  },
  {
    id: "j-5",
    title: "UX Research Lead",
    ref: "Ref: HL-44112",
    company: "Humanize",
    code: "H",
    category: "Design",
    type: "Hybrid",
    datePosted: "Oct 19, 2026",
    status: "active",
    salary: "$115,000 - $140,000",
    location: "Seattle, WA",
  },
];

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState(defaultJobs);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'active' | 'closed'
  const [previewJob, setPreviewJob] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    let ignore = false;
    async function fetchJobs() {
      try {
        const data = await getAdminJobs({ search });
        if (!ignore && Array.isArray(data) && data.length > 0) {
          const mapped = data.map((j) => ({
            id: j._id || j.id,
            title: j.title,
            ref: `Ref: HL-${(j._id || "99210").slice(-5).toUpperCase()}`,
            company: j.companyName || "HireLoop Partner",
            code: (j.companyName || "HL").slice(0, 1).toUpperCase(),
            category: j.category
              ? j.category.charAt(0).toUpperCase() + j.category.slice(1)
              : "Engineering",
            type: j.type
              ? j.type.charAt(0).toUpperCase() + j.type.slice(1)
              : "Full-time",
            datePosted: formatDate(j.createdAt),
            status: j.status === "closed" ? "closed" : "active",
            salary: formatSalary(j.salaryMin, j.salaryMax, j.currency),
            location: j.location || "Remote",
          }));
          setJobs(mapped);
        }
      } catch (err) {
        console.error("Error loading jobs:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchJobs();
    return () => {
      ignore = true;
    };
  }, [search]);

  // Toggle job status
  const handleToggleStatus = async (job) => {
    const newStatus = job.status === "active" ? "closed" : "active";
    setJobs((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, status: newStatus } : j))
    );
    try {
      await updateJobStatus(job.id, newStatus);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete job
  const handleDeleteJob = async (jobId) => {
    if (!confirm("Are you sure you want to remove this job post?")) return;
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    try {
      await deleteJob(jobId);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      activeTab === "all"
        ? statusFilter === "all"
          ? true
          : j.status === statusFilter
        : j.status === activeTab;
    const matchesCategory =
      categoryFilter === "all"
        ? true
        : j.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalPages = Math.ceil(filteredJobs.length / pageSize) || 1;
  const safePage = Math.min(Math.max(1, page), totalPages);
  const paginatedJobs = filteredJobs.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Top Bar */}
      <AdminTopBar
        placeholder="Search transactions, users, or IDs..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        manageRoleText="Admin View"
      />

      {/* Header section with Create Job Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Manage Jobs
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Oversee all active listings and historical job posts across the platform.
          </p>
        </div>

        <Link
          href="/deshboard/recruiter/jobs/new"
          className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-semibold shadow-sm transition self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Job</span>
        </Link>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-neutral-300 focus:outline-none focus:border-purple-500"
          >
            <option value="all" className="bg-[#14141c]">All Statuses</option>
            <option value="active" className="bg-[#14141c]">Active</option>
            <option value="closed" className="bg-[#14141c]">Closed</option>
          </select>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-neutral-300 focus:outline-none focus:border-purple-500"
          >
            <option value="all" className="bg-[#14141c]">All Categories</option>
            <option value="design" className="bg-[#14141c]">Design</option>
            <option value="engineering" className="bg-[#14141c]">Engineering</option>
            <option value="marketing" className="bg-[#14141c]">Marketing</option>
            <option value="sales" className="bg-[#14141c]">Sales</option>
          </select>
        </div>

        {/* Toggle Pills matching Image 3 */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab(activeTab === "active" ? "all" : "active")}
            className={`px-3 py-1.5 rounded-xl border transition ${
              activeTab === "active"
                ? "bg-white/15 border-white/20 text-white font-semibold"
                : "bg-white/[0.04] border-white/10 text-neutral-400 hover:text-white"
            }`}
          >
            Active (128)
          </button>
          <button
            onClick={() => setActiveTab(activeTab === "closed" ? "all" : "closed")}
            className={`px-3 py-1.5 rounded-xl border transition ${
              activeTab === "closed"
                ? "bg-white/15 border-white/20 text-white font-semibold"
                : "bg-white/[0.04] border-white/10 text-neutral-400 hover:text-white"
            }`}
          >
            Closed (45)
          </button>
        </div>
      </div>

      {/* Jobs Table matching Image 3 */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#121218]/90 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-wider text-neutral-400 font-mono bg-white/[0.02]">
                <th className="py-3.5 px-6">Title</th>
                <th className="py-3.5 px-6">Company</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Type</th>
                <th className="py-3.5 px-6">Date Posted</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {paginatedJobs.map((job) => (
                <tr key={job.id} className="hover:bg-white/[0.02] transition">
                  {/* Title + Ref */}
                  <td className="py-3.5 px-6">
                    <div>
                      <p className="font-semibold text-white truncate max-w-[200px]">
                        {job.title}
                      </p>
                      <p className="text-[11px] text-neutral-500 font-mono">{job.ref}</p>
                    </div>
                  </td>

                  {/* Company with Monogram */}
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-2.5">
                      <div className="size-6 rounded bg-neutral-800 flex items-center justify-center text-[11px] font-bold text-neutral-300 border border-white/5">
                        {job.code}
                      </div>
                      <span className="text-neutral-200 font-medium truncate max-w-[140px]">
                        {job.company}
                      </span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-6 text-neutral-300">{job.category}</td>

                  {/* Type */}
                  <td className="py-3.5 px-6 text-neutral-400">{job.type}</td>

                  {/* Date Posted */}
                  <td className="py-3.5 px-6 text-neutral-400 font-mono text-xs">
                    {job.datePosted}
                  </td>

                  {/* Status Pill */}
                  <td className="py-3.5 px-6">
                    <StatusBadge status={job.status} />
                  </td>

                  {/* Actions (Eye, Trash) */}
                  <td className="py-3.5 px-6 text-right">
                    <div className="flex items-center justify-end gap-3 text-neutral-400">
                      <button
                        onClick={() => setPreviewJob(job)}
                        className="hover:text-white transition cursor-pointer p-1"
                        title="View Job Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="hover:text-rose-400 transition cursor-pointer p-1"
                        title="Delete / Close Job"
                      >
                        <TrashBin className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="px-4">
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            totalItems={filteredJobs.length}
            pageSize={pageSize}
            onPageChange={setPage}
            itemName="jobs"
          />
        </div>
      </div>

      {/* Bottom 3 Stat Cards matching Image 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Engagement Rate */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#121218]/90 p-5">
          <div className="flex items-center gap-2 text-neutral-400 text-xs font-medium">
            <ChartLine className="w-4 h-4 text-emerald-400" />
            <span>Engagement Rate</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white mt-2 tracking-tight">
            82.4%
          </p>
          <p className="text-xs font-mono text-emerald-400 mt-2">+5.2% from last month</p>
        </div>

        {/* Avg. Time to Fill */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#121218]/90 p-5">
          <div className="flex items-center gap-2 text-neutral-400 text-xs font-medium">
            <Clock className="w-4 h-4 text-purple-400" />
            <span>Avg. Time to Fill</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white mt-2 tracking-tight">
            14 Days
          </p>
          <p className="text-xs font-mono text-neutral-400 mt-2">Stable performance</p>
        </div>

        {/* Total Applications */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#121218]/90 p-5">
          <div className="flex items-center gap-2 text-neutral-400 text-xs font-medium">
            <Envelope className="w-4 h-4 text-blue-400" />
            <span>Total Applications</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white mt-2 tracking-tight">
            12,840
          </p>
          <p className="text-xs font-mono text-amber-400 mt-2">-2.1% across tech sectors</p>
        </div>
      </div>

      {/* Preview Modal */}
      {previewJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#14141c] p-6 text-white space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">{previewJob.title}</h2>
                <p className="text-xs text-neutral-400">{previewJob.company} &bull; {previewJob.location}</p>
              </div>
              <button
                onClick={() => setPreviewJob(null)}
                className="text-neutral-400 hover:text-white"
              >
                &times;
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs bg-white/5 p-4 rounded-xl">
              <div>
                <span className="text-neutral-400 block">Category</span>
                <span className="font-semibold text-white">{previewJob.category}</span>
              </div>
              <div>
                <span className="text-neutral-400 block">Type</span>
                <span className="font-semibold text-white">{previewJob.type}</span>
              </div>
              <div>
                <span className="text-neutral-400 block">Salary</span>
                <span className="font-semibold text-white">{previewJob.salary}</span>
              </div>
              <div>
                <span className="text-neutral-400 block">Status</span>
                <span className="font-semibold text-emerald-400 uppercase">{previewJob.status}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => handleToggleStatus(previewJob)}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500"
              >
                Toggle Status ({previewJob.status === "active" ? "Close Job" : "Re-open"})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
