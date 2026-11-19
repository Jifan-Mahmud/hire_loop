"use client";

import React, { useState, useEffect } from "react";
import {
  Person,
  ChevronDown,
  ArrowRight,
  TrashBin,
  CircleCheck,
  Ban,
  Magnifier,
} from "@gravity-ui/icons";
import AdminTopBar from "@/components/Admin/AdminTopBar";
import {
  getAdminUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from "@/lib/api/admin";

// Default seed users matching Image 1
const defaultUsers = [
  {
    id: "u-1",
    name: "Jordan Davis",
    email: "jordan.davis@example.com",
    role: "seeker",
    createdAt: "Oct 12, 2026",
    status: "active",
    initials: "JD",
  },
  {
    id: "u-2",
    name: "Elena Rodriguez",
    email: "elena.r@talentflow.io",
    role: "recruiter",
    createdAt: "Sep 28, 2026",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop",
  },
  {
    id: "u-3",
    name: "Marcus Webb",
    email: "m.webb@outlook.com",
    role: "seeker",
    createdAt: "Aug 05, 2026",
    status: "suspended",
    initials: "MW",
  },
  {
    id: "u-4",
    name: "Tom Hiddleston",
    email: "t.hiddles@loki-tech.com",
    role: "recruiter",
    createdAt: "Nov 01, 2026",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
  },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState(defaultUsers);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let ignore = false;
    async function fetchUsers() {
      try {
        const data = await getAdminUsers({
          search,
          role: roleFilter,
          page,
          limit: 10,
        });

        if (!ignore && data?.users && data.users.length > 0) {
          const apiUsers = data.users.map((u) => ({
            id: u._id || u.id,
            name: u.name || u.email.split("@")[0],
            email: u.email,
            role: u.role || "seeker",
            createdAt: u.createdAt
              ? new Date(u.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })
              : "Oct 15, 2026",
            status: u.status || "active",
            initials: (u.name || u.email).slice(0, 2).toUpperCase(),
          }));
          setUsers(apiUsers);
        }
      } catch (err) {
        console.error("Error loading users:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchUsers();
    return () => {
      ignore = true;
    };
  }, [search, roleFilter, page]);

  // Handle role switch (Seeker <-> Recruiter)
  const handleToggleRole = async (user) => {
    const newRole = user.role === "seeker" ? "recruiter" : "seeker";
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
    );
    try {
      await updateUserRole(user.id, newRole);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle status toggle (active <-> suspended)
  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "active" ? "suspended" : "active";
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
    );
    try {
      await updateUserStatus(user.id, newStatus);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle delete user
  const handleDelete = async (userId) => {
    if (!confirm("Are you sure you want to permanently delete this user?")) return;
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    try {
      await deleteUser(userId);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter local users by search and role
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole =
      roleFilter === "all" ? true : u.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Top Bar */}
      <AdminTopBar
        placeholder="Search by email..."
        searchValue={search}
        onSearchChange={setSearch}
        manageRoleText="Manage Roles"
      />

      {/* Header with Title and Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            User Management
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Review, filter, and manage platform access for all users.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Role Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 h-9 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-xs font-medium text-neutral-200 transition"
            >
              <span>
                {roleFilter === "all"
                  ? "All Roles"
                  : roleFilter === "seeker"
                  ? "Seekers"
                  : "Recruiters"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-36 rounded-xl bg-[#14141c] border border-white/10 p-1.5 shadow-xl z-50 text-xs">
                {["all", "seeker", "recruiter"].map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setRoleFilter(r);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg capitalize ${
                      roleFilter === r
                        ? "bg-purple-600/30 text-purple-300 font-semibold"
                        : "text-neutral-300 hover:bg-white/10"
                    }`}
                  >
                    {r === "all" ? "All Roles" : `${r}s`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export List Button */}
          <button
            onClick={() => alert("Exporting user records as CSV...")}
            className="flex items-center justify-center h-9 px-4 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            Export List
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active Users */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#121218]/90 p-5">
          <p className="text-xs text-neutral-400 font-medium">Total Active Users</p>
          <p className="text-2xl sm:text-3xl font-bold text-white mt-1.5 tracking-tight">
            12,842
          </p>
          <p className="text-xs font-mono text-emerald-400 mt-2">+12% vs last month</p>
        </div>

        {/* Recruiter Growth */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#121218]/90 p-5">
          <p className="text-xs text-neutral-400 font-medium">Recruiter Growth</p>
          <p className="text-2xl sm:text-3xl font-bold text-white mt-1.5 tracking-tight">
            843
          </p>
          <p className="text-xs font-mono text-emerald-400 mt-2">High demand</p>
        </div>

        {/* Suspended Accounts */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#121218]/90 p-5">
          <p className="text-xs text-neutral-400 font-medium">Suspended Accounts</p>
          <p className="text-2xl sm:text-3xl font-bold text-white mt-1.5 tracking-tight">
            124
          </p>
          <p className="text-xs font-mono text-neutral-400 mt-2">0.8% of total</p>
        </div>

        {/* New Signups (24h) */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#121218]/90 p-5">
          <p className="text-xs text-neutral-400 font-medium">New Signups (24h)</p>
          <p className="text-2xl sm:text-3xl font-bold text-white mt-1.5 tracking-tight">
            42
          </p>
          <p className="text-xs font-mono text-amber-400 mt-2">Steady activity</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#121218]/90 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-wider text-neutral-400 font-mono bg-white/[0.02]">
                <th className="py-3.5 px-6">User Name</th>
                <th className="py-3.5 px-6">Email Address</th>
                <th className="py-3.5 px-6">Role</th>
                <th className="py-3.5 px-6">Join Date</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition">
                  {/* User Name */}
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="size-8 rounded-full object-cover border border-white/10 shrink-0"
                        />
                      ) : (
                        <div className="size-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-semibold text-neutral-300 shrink-0 border border-white/5">
                          {user.initials}
                        </div>
                      )}
                      <span className="font-medium text-white truncate max-w-[160px]">
                        {user.name}
                      </span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-3.5 px-6 text-neutral-300 font-mono text-xs">
                    {user.email}
                  </td>

                  {/* Role */}
                  <td className="py-3.5 px-6">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-xs font-medium text-neutral-200 capitalize">
                      <Person className="w-3 h-3 text-neutral-400" />
                      {user.role}
                    </span>
                  </td>

                  {/* Join Date */}
                  <td className="py-3.5 px-6 text-neutral-400 text-xs font-mono">
                    {user.createdAt}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-rose-500/10 text-rose-400"
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          user.status === "active" ? "bg-emerald-400" : "bg-rose-400"
                        }`}
                      />
                      <span className="capitalize">{user.status}</span>
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-6 text-right">
                    <div className="flex items-center justify-end gap-3 text-xs">
                      {/* Toggle role */}
                      <button
                        onClick={() => handleToggleRole(user)}
                        className="text-neutral-400 hover:text-white transition font-medium cursor-pointer"
                      >
                        {user.role === "seeker" ? "Make Recruiter" : "Make Seeker"}
                      </button>

                      {/* Suspend or Activate */}
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`transition font-medium cursor-pointer ${
                          user.status === "active"
                            ? "text-rose-400/80 hover:text-rose-300"
                            : "text-emerald-400 hover:text-emerald-300"
                        }`}
                      >
                        {user.status === "active" ? "Suspend" : "Activate"}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-neutral-500 hover:text-rose-400 transition cursor-pointer"
                        title="Delete user"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination bar matching Image 1 */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-white/[0.08] text-xs text-neutral-400">
          <span>
            Showing 1 to {filteredUsers.length} of 12,842 users
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              className="p-1 rounded-md text-neutral-400 hover:text-white"
            >
              &lt;
            </button>
            <button className="size-6 rounded bg-white text-black font-bold flex items-center justify-center text-xs">
              1
            </button>
            <button className="size-6 rounded text-neutral-400 hover:text-white flex items-center justify-center text-xs">
              2
            </button>
            <button className="size-6 rounded text-neutral-400 hover:text-white flex items-center justify-center text-xs">
              3
            </button>
            <span className="text-neutral-600 px-1">&hellip;</span>
            <button className="size-6 rounded text-neutral-400 hover:text-white flex items-center justify-center text-xs">
              1285
            </button>
            <button
              onClick={() => setPage(page + 1)}
              className="p-1 rounded-md text-neutral-400 hover:text-white"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
