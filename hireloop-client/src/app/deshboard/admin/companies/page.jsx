"use client";

import React, { useState, useEffect } from "react";
import {
  Folder,
  CircleCheck,
  Ban,
  Magnifier,
  Plus,
  SlidersVertical,
} from "@gravity-ui/icons";
import AdminTopBar from "@/components/Admin/AdminTopBar";
import { getAdminCompanies, updateCompanyStatus } from "@/lib/api/admin";
import Pagination from "@/components/Common/Pagination";

// Showcase companies matching Image 4
const defaultCompanies = [
  {
    id: "c-1",
    name: "Nexus Labs",
    code: "NL",
    recruiterEmail: "sarah.j@nexuslabs.io",
    industry: "Quantum Computing",
    status: "pending",
    dateSubmitted: "Oct 12, 2026",
  },
  {
    id: "c-2",
    name: "Aether Ventures",
    code: "AV",
    recruiterEmail: "hiring@aetherv.co",
    industry: "Venture Capital",
    status: "approved",
    dateSubmitted: "Oct 10, 2026",
  },
  {
    id: "c-3",
    name: "Flux Tech",
    code: "FT",
    recruiterEmail: "admin@fluxtech.net",
    industry: "E-commerce",
    status: "rejected",
    dateSubmitted: "Oct 08, 2026",
  },
  {
    id: "c-4",
    name: "Orbital Systems",
    code: "OS",
    recruiterEmail: "ops@orbital.space",
    industry: "Aerospace",
    status: "pending",
    dateSubmitted: "Oct 14, 2026",
  },
  {
    id: "c-5",
    name: "Solaris Robotics",
    code: "SR",
    recruiterEmail: "hr@solaris-robotics.com",
    industry: "Robotics",
    status: "approved",
    dateSubmitted: "Oct 05, 2026",
  },
];

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState(defaultCompanies);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // New company form state
  const [newCompany, setNewCompany] = useState({
    name: "",
    recruiterEmail: "",
    industry: "",
    location: "Remote / Global",
  });

  useEffect(() => {
    let ignore = false;
    async function fetchCompanies() {
      try {
        const data = await getAdminCompanies({ search });
        if (!ignore && Array.isArray(data) && data.length > 0) {
          const mapped = data.map((c) => ({
            id: c._id || c.id,
            name: c.name,
            code: (c.name || "CO").slice(0, 2).toUpperCase(),
            recruiterEmail: c.recruiterEmail || c.email || "recruiter@example.com",
            industry: c.industry || "Technology",
            status: c.status || "pending",
            dateSubmitted: c.createdAt
              ? new Date(c.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })
              : "Oct 15, 2026",
          }));
          setCompanies(mapped);
        }
      } catch (err) {
        console.error("Error loading companies:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchCompanies();
    return () => {
      ignore = true;
    };
  }, [search]);

  // Handle Approve or Reject
  const handleUpdateStatus = async (companyId, newStatus) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === companyId ? { ...c, status: newStatus } : c))
    );
    try {
      await updateCompanyStatus(companyId, newStatus);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle register new company
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!newCompany.name || !newCompany.recruiterEmail) return;

    const created = {
      id: `c-${Date.now()}`,
      name: newCompany.name,
      code: newCompany.name.slice(0, 2).toUpperCase(),
      recruiterEmail: newCompany.recruiterEmail,
      industry: newCompany.industry || "Technology",
      status: "approved",
      dateSubmitted: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    };

    setCompanies([created, ...companies]);
    setShowRegisterModal(false);
    setNewCompany({ name: "", recruiterEmail: "", industry: "", location: "Remote / Global" });
  };

  const filtered = companies.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.recruiterEmail.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" ? true : c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const safePage = Math.min(Math.max(1, page), totalPages);
  const paginatedCompanies = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Top Bar */}
      <AdminTopBar
        placeholder="Search companies, recruiters, or industries..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        manageRoleText="Admin View"
      />

      {/* Header section with Filter & Register New buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Company Registrations
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Review and manage corporate entity access requests for the HireLoop ecosystem.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status filter toggle */}
          <div className="flex items-center rounded-xl bg-white/[0.04] border border-white/10 p-1 text-xs">
            {["all", "pending", "approved", "rejected"].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-lg capitalize font-medium transition ${
                  statusFilter === st
                    ? "bg-purple-600 text-white font-semibold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Register New Button */}
          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register New</span>
          </button>
        </div>
      </div>

      {/* Companies Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#121218]/90 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-wider text-neutral-400 font-mono bg-white/[0.02]">
                <th className="py-3.5 px-6">Company Name</th>
                <th className="py-3.5 px-6">Recruiter Email</th>
                <th className="py-3.5 px-6">Industry</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Date Submitted</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {paginatedCompanies.map((comp) => (
                <tr key={comp.id} className="hover:bg-white/[0.02] transition">
                  {/* Company Name */}
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-300 shrink-0 border border-white/5">
                        {comp.code}
                      </div>
                      <span className="font-medium text-white truncate max-w-[180px]">
                        {comp.name}
                      </span>
                    </div>
                  </td>

                  {/* Recruiter Email */}
                  <td className="py-3.5 px-6 text-neutral-300 font-mono text-xs">
                    {comp.recruiterEmail}
                  </td>

                  {/* Industry */}
                  <td className="py-3.5 px-6">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-neutral-300 font-medium">
                      {comp.industry}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        comp.status === "approved"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : comp.status === "pending"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-rose-500/10 text-rose-400"
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          comp.status === "approved"
                            ? "bg-emerald-400"
                            : comp.status === "pending"
                            ? "bg-amber-400"
                            : "bg-rose-400"
                        }`}
                      />
                      <span className="capitalize">{comp.status}</span>
                    </span>
                  </td>

                  {/* Date Submitted */}
                  <td className="py-3.5 px-6 text-neutral-400 text-xs font-mono">
                    {comp.dateSubmitted}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 text-xs">
                      {comp.status !== "approved" && (
                        <button
                          onClick={() => handleUpdateStatus(comp.id, "approved")}
                          className="px-2.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-medium transition cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      {comp.status !== "rejected" && (
                        <button
                          onClick={() => handleUpdateStatus(comp.id, "rejected")}
                          className="px-2.5 py-1 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 font-medium transition cursor-pointer"
                        >
                          Reject
                        </button>
                      )}
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
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setPage}
            itemName="companies"
          />
        </div>
      </div>

      {/* Bottom 3 Stat Cards matching Image 4 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* PENDING REVIEW */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#121218]/90 p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
              PENDING REVIEW
            </span>
            <span className="text-xs font-mono text-emerald-400">+12% vs last week</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white mt-2 tracking-tight">
            14
          </p>
        </div>

        {/* APPROVED PARTNERS */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#121218]/90 p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
              APPROVED PARTNERS
            </span>
            <span className="text-xs font-mono text-emerald-400">+5% vs last week</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white mt-2 tracking-tight">
            892
          </p>
        </div>

        {/* TOTAL REJECTIONS */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#121218]/90 p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
              TOTAL REJECTIONS
            </span>
            <span className="text-xs font-mono text-neutral-400">Stable</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white mt-2 tracking-tight">
            42
          </p>
        </div>
      </div>

      {/* Modal: Register New Company */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#14141c] p-6 shadow-2xl text-white space-y-4">
            <h2 className="text-lg font-bold">Register New Corporate Entity</h2>
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  placeholder="e.g. Acme Innovations"
                  className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Recruiter Email</label>
                <input
                  type="email"
                  required
                  value={newCompany.recruiterEmail}
                  onChange={(e) =>
                    setNewCompany({ ...newCompany, recruiterEmail: e.target.value })
                  }
                  placeholder="hiring@acme.com"
                  className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Industry</label>
                <input
                  type="text"
                  value={newCompany.industry}
                  onChange={(e) =>
                    setNewCompany({ ...newCompany, industry: e.target.value })
                  }
                  placeholder="Artificial Intelligence / SaaS"
                  className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-white/10 text-neutral-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-500"
                >
                  Confirm &amp; Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
