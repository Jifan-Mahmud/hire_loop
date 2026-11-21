"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Person,
  ChevronDown,
  TrashBin,
  CircleCheck,
  Ban,
  ShieldCheck,
  Briefcase,
  ArrowsRotateLeft,
} from "@gravity-ui/icons";
import AdminTopBar from "@/components/Admin/AdminTopBar";
import {
  getAdminUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from "@/lib/api/admin";
import Pagination from "@/components/Common/Pagination";
import StatusBadge from "@/components/Common/StatusBadge";
import { formatDate, getInitials } from "@/lib/utils/formatters";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRecruiters: 0,
    totalSeekers: 0,
    totalAdmins: 0,
    totalSuspended: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const showFeedback = (message, type = "success") => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Fetch users with or without full-table loading spinner
  const loadUsers = useCallback(
    async (showFullLoading = false) => {
      if (showFullLoading) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }

      try {
        const data = await getAdminUsers({
          search,
          role: roleFilter,
          status: statusFilter,
          page,
          limit: 10,
        });

        if (data?.users) {
          const apiUsers = data.users.map((u) => ({
            id: u._id || u.id,
            name: u.name || u.email.split("@")[0],
            email: u.email,
            role: u.role || "seeker",
            createdAt: formatDate(u.createdAt),
            status: u.status || "active",
            planId:
              u.planId ||
              (u.role === "admin"
                ? "admin-enterprise"
                : `${u.role || "seeker"}-free`),
            avatar: u.image || u.avatar || null,
            initials: getInitials(u.name, u.email),
          }));

          setUsers(apiUsers);
          setTotal(data.total || apiUsers.length);
          setTotalPages(data.totalPages || 1);
          if (data.stats) {
            setStats(data.stats);
          }
        }
      } catch (err) {
        console.error("Error loading users from database:", err);
        showFeedback("Failed to load users from database.", "error");
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [search, roleFilter, statusFilter, page]
  );

  // Initial mount & filter/page changes
  useEffect(() => {
    let ignore = false;

    async function initialFetch() {
      // Only show full loading spinner if user list is currently empty
      const isInitial = users.length === 0;
      await loadUsers(isInitial);
    }

    if (!ignore) {
      initialFetch();
    }

    return () => {
      ignore = true;
    };
  }, [loadUsers]); // users.length omitted to prevent infinite loops

  // Change user role (Seeker, Recruiter, Admin) - IN-PLACE UPDATE WITHOUT TABLE RELOAD
  const handleRoleChange = async (user, newRole) => {
    if (user.role === newRole) return;
    if (user.email === "admin@jifan.com" && newRole !== "admin") {
      alert("The primary system administrator cannot be demoted.");
      return;
    }

    const previousRole = user.role;

    // 1. In-place instant update for that user row only
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? {
              ...u,
              role: newRole,
              planId:
                newRole === "admin"
                  ? "admin-enterprise"
                  : `${newRole}-free`,
            }
          : u
      )
    );

    // 2. In-place update stats without reloading table
    setStats((prev) => {
      const next = { ...prev };
      if (previousRole === "seeker") next.totalSeekers = Math.max(0, (next.totalSeekers || 1) - 1);
      if (previousRole === "recruiter") next.totalRecruiters = Math.max(0, (next.totalRecruiters || 1) - 1);
      if (previousRole === "admin") next.totalAdmins = Math.max(0, (next.totalAdmins || 1) - 1);

      if (newRole === "seeker") next.totalSeekers = (next.totalSeekers || 0) + 1;
      if (newRole === "recruiter") next.totalRecruiters = (next.totalRecruiters || 0) + 1;
      if (newRole === "admin") next.totalAdmins = (next.totalAdmins || 0) + 1;
      return next;
    });

    setActionLoadingId(user.id);
    try {
      const res = await updateUserRole(user.id, newRole);
      if (res?.success) {
        showFeedback(`Role for ${user.name} updated to '${newRole.toUpperCase()}'.`);
        // If planId returned from server, sync it
        if (res.planId) {
          setUsers((prev) =>
            prev.map((u) => (u.id === user.id ? { ...u, planId: res.planId } : u))
          );
        }
      } else {
        // Rollback on failure
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, role: previousRole } : u))
        );
        alert(res?.error || "Failed to update user role.");
      }
    } catch (err) {
      console.error("Role update failed:", err);
      // Rollback on failure
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: previousRole } : u))
      );
      alert("Error updating user role.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle user status (Ban / Unban) - IN-PLACE UPDATE WITHOUT TABLE RELOAD
  const handleToggleStatus = async (user) => {
    const isCurrentlyActive = user.status === "active";
    const nextStatus = isCurrentlyActive ? "banned" : "active";

    if (user.email === "admin@jifan.com" && nextStatus === "banned") {
      alert("The primary system administrator cannot be banned.");
      return;
    }

    const confirmMsg = isCurrentlyActive
      ? `Are you sure you want to BAN ${user.name} (${user.email})?\n\n• Their active sessions will be terminated immediately.\n• They will be blocked from accessing any dashboard.`
      : `Activate account for ${user.name}? They will be able to log in and use their dashboard.`;

    if (!confirm(confirmMsg)) return;

    // 1. In-place instant update for that user row only
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
    );

    // 2. In-place update stats
    setStats((prev) => ({
      ...prev,
      totalSuspended:
        nextStatus === "banned"
          ? (prev.totalSuspended || 0) + 1
          : Math.max(0, (prev.totalSuspended || 1) - 1),
    }));

    setActionLoadingId(user.id);
    try {
      const res = await updateUserStatus(user.id, nextStatus);
      if (res?.success) {
        showFeedback(
          isCurrentlyActive
            ? `User ${user.name} has been BANNED. Active sessions revoked.`
            : `User ${user.name} has been ACTIVATED.`
        );
      } else {
        // Rollback on failure
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, status: isCurrentlyActive ? "active" : "banned" } : u
          )
        );
        alert(res?.error || "Failed to update user status.");
      }
    } catch (err) {
      console.error("Status update failed:", err);
      // Rollback on failure
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, status: isCurrentlyActive ? "active" : "banned" } : u
        )
      );
      alert("Error updating user status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete user - IN-PLACE UPDATE WITHOUT TABLE RELOAD
  const handleDelete = async (user) => {
    if (user.email === "admin@jifan.com") {
      alert("The primary system administrator cannot be deleted.");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to permanently delete user ${user.name} (${user.email})? This action cannot be undone.`
      )
    ) {
      return;
    }

    // 1. In-place remove user from list
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    setTotal((t) => Math.max(0, t - 1));

    // 2. In-place update stats
    setStats((prev) => {
      const next = { ...prev, totalUsers: Math.max(0, (prev.totalUsers || 1) - 1) };
      if (user.role === "seeker") next.totalSeekers = Math.max(0, (next.totalSeekers || 1) - 1);
      if (user.role === "recruiter") next.totalRecruiters = Math.max(0, (next.totalRecruiters || 1) - 1);
      if (user.role === "admin") next.totalAdmins = Math.max(0, (next.totalAdmins || 1) - 1);
      if (user.status === "banned" || user.status === "suspended") {
        next.totalSuspended = Math.max(0, (next.totalSuspended || 1) - 1);
      }
      return next;
    });

    setActionLoadingId(user.id);
    try {
      const res = await deleteUser(user.id);
      if (res?.success) {
        showFeedback(`User ${user.name} deleted successfully.`);
      } else {
        alert(res?.error || "Failed to delete user.");
        loadUsers(false);
      }
    } catch (err) {
      console.error("Delete user failed:", err);
      alert("Error deleting user.");
      loadUsers(false);
    } finally {
      setActionLoadingId(null);
    }
  };

  const getRoleBadge = (role) => {
    if (role === "admin") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-xs font-semibold text-purple-300">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          Admin
        </span>
      );
    }
    if (role === "recruiter") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-xs font-medium text-indigo-300">
          <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
          Recruiter
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-medium text-emerald-300">
        <Person className="w-3.5 h-3.5 text-emerald-400" />
        Seeker
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Top Bar */}
      <AdminTopBar
        placeholder="Search users by name or email..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        manageRoleText="Manage Platform Users"
      />

      {/* Floating feedback message */}
      {feedback && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl text-xs sm:text-sm font-medium border ${
            feedback.type === "error"
              ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <CircleCheck className="w-4 h-4 shrink-0" />
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-neutral-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header with Title and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            User Management & Access Control
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Real MongoDB users. Control roles (Seeker, Recruiter, Admin) and enforce account bans.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={() => loadUsers(false)}
            disabled={isRefreshing || loading}
            className="flex items-center gap-2 h-9 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-xs font-medium text-neutral-200 transition cursor-pointer disabled:opacity-50"
            title="Refresh Users"
          >
            <ArrowsRotateLeft
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Role Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRoleDropdown(!showRoleDropdown);
                setShowStatusDropdown(false);
              }}
              className="flex items-center gap-2 h-9 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-xs font-medium text-neutral-200 transition cursor-pointer"
            >
              <span>
                {roleFilter === "all"
                  ? "All Roles"
                  : roleFilter === "seeker"
                  ? "🎯 Seekers"
                  : roleFilter === "recruiter"
                  ? "💼 Recruiters"
                  : "🛡️ Admins"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl bg-[#14141c] border border-white/10 p-1.5 shadow-2xl z-50 text-xs">
                {[
                  { key: "all", label: "All Roles" },
                  { key: "seeker", label: "🎯 Job Seekers" },
                  { key: "recruiter", label: "💼 Recruiters" },
                  { key: "admin", label: "🛡️ Administrators" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      setRoleFilter(item.key);
                      setShowRoleDropdown(false);
                      setPage(1);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition cursor-pointer ${
                      roleFilter === item.key
                        ? "bg-purple-600/30 text-purple-300 font-semibold"
                        : "text-neutral-300 hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowStatusDropdown(!showStatusDropdown);
                setShowRoleDropdown(false);
              }}
              className="flex items-center gap-2 h-9 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-xs font-medium text-neutral-200 transition cursor-pointer"
            >
              <span>
                {statusFilter === "all"
                  ? "All Status"
                  : statusFilter === "active"
                  ? "🟢 Active"
                  : "🔴 Banned / Suspended"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {showStatusDropdown && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl bg-[#14141c] border border-white/10 p-1.5 shadow-2xl z-50 text-xs">
                {[
                  { key: "all", label: "All Status" },
                  { key: "active", label: "🟢 Active Only" },
                  { key: "banned", label: "🔴 Banned / Suspended" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      setStatusFilter(item.key);
                      setShowStatusDropdown(false);
                      setPage(1);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition cursor-pointer ${
                      statusFilter === item.key
                        ? "bg-purple-600/30 text-purple-300 font-semibold"
                        : "text-neutral-300 hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4 Real Live Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#121218]/90 p-5">
          <p className="text-xs text-neutral-400 font-medium">Total Registered Users</p>
          <p className="text-2xl sm:text-3xl font-bold text-white mt-1.5 tracking-tight">
            {stats.totalUsers}
          </p>
          <p className="text-xs font-mono text-neutral-400 mt-2">Active MongoDB accounts</p>
        </div>

        {/* Recruiters */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#121218]/90 p-5">
          <p className="text-xs text-neutral-400 font-medium">Active Recruiters</p>
          <p className="text-2xl sm:text-3xl font-bold text-indigo-400 mt-1.5 tracking-tight">
            {stats.totalRecruiters}
          </p>
          <p className="text-xs font-mono text-indigo-400/80 mt-2">Recruiter portal access</p>
        </div>

        {/* Seekers */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#121218]/90 p-5">
          <p className="text-xs text-neutral-400 font-medium">Job Seekers</p>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1.5 tracking-tight">
            {stats.totalSeekers}
          </p>
          <p className="text-xs font-mono text-emerald-400/80 mt-2">Seeker portal access</p>
        </div>

        {/* Suspended / Banned */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#121218]/90 p-5">
          <p className="text-xs text-neutral-400 font-medium">Suspended / Banned</p>
          <p className="text-2xl sm:text-3xl font-bold text-rose-400 mt-1.5 tracking-tight">
            {stats.totalSuspended}
          </p>
          <p className="text-xs font-mono text-rose-400/80 mt-2">Access blocked</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#121218]/90 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-wider text-neutral-400 font-mono bg-white/[0.02]">
                <th className="py-3.5 px-6">User Name</th>
                <th className="py-3.5 px-6">Email Address</th>
                <th className="py-3.5 px-6">Current Role</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Join Date</th>
                <th className="py-3.5 px-6 text-center">Change Role</th>
                <th className="py-3.5 px-6 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                      <span className="text-xs">Loading database users...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    <p className="text-sm font-semibold text-white">No users found</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Try clearing your search query or changing the filter.
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isPrimaryAdmin = user.email === "admin@jifan.com";
                  const isBanned = user.status === "banned" || user.status === "suspended";
                  const isBusy = actionLoadingId === user.id;

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-white/[0.02] transition ${
                        isBanned ? "bg-rose-950/10" : ""
                      }`}
                    >
                      {/* User Name + Avatar */}
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
                          <div className="min-w-0">
                            <span className="font-semibold text-white truncate block max-w-[170px]">
                              {user.name}
                            </span>
                            {isPrimaryAdmin && (
                              <span className="text-[10px] text-purple-400 font-mono block">
                                Primary System Admin
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-6 text-neutral-300 font-mono text-xs">
                        {user.email}
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-6">
                        {getRoleBadge(user.role)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-6">
                        <StatusBadge status={user.status} />
                      </td>

                      {/* Join Date */}
                      <td className="py-3.5 px-6 text-neutral-400 text-xs font-mono">
                        {user.createdAt}
                      </td>

                      {/* Change Role Selector */}
                      <td className="py-3.5 px-6 text-center">
                        {isPrimaryAdmin ? (
                          <span className="text-[11px] text-neutral-500 font-mono italic">
                            Protected Role
                          </span>
                        ) : (
                          <div className="inline-flex items-center gap-2">
                            <select
                              value={user.role}
                              disabled={isBusy}
                              onChange={(e) => handleRoleChange(user, e.target.value)}
                              className="bg-[#181822] text-xs text-white border border-white/10 rounded-lg px-2.5 py-1.5 hover:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer disabled:opacity-40"
                            >
                              <option value="seeker">🎯 Seeker</option>
                              <option value="recruiter">💼 Recruiter</option>
                              <option value="admin">🛡️ Admin</option>
                            </select>
                            {isBusy && (
                              <div className="w-3.5 h-3.5 rounded-full border border-purple-400 border-t-transparent animate-spin shrink-0" />
                            )}
                          </div>
                        )}
                      </td>

                      {/* Access Controls (Ban / Activate & Delete) */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 text-xs">
                          {/* Ban / Activate Toggle */}
                          {isPrimaryAdmin ? (
                            <span className="text-[11px] text-neutral-500 font-mono">
                              Protected
                            </span>
                          ) : (
                            <button
                              onClick={() => handleToggleStatus(user)}
                              disabled={isBusy}
                              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 text-xs ${
                                !isBanned
                                  ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                  : "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30"
                              } disabled:opacity-40`}
                            >
                              {!isBanned ? (
                                <>
                                  <Ban className="w-3.5 h-3.5 text-rose-400" />
                                  <span>Ban</span>
                                </>
                              ) : (
                                <>
                                  <CircleCheck className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Activate</span>
                                </>
                              )}
                            </button>
                          )}

                          {/* Delete */}
                          {!isPrimaryAdmin && (
                            <button
                              onClick={() => handleDelete(user)}
                              disabled={isBusy}
                              className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer disabled:opacity-40"
                              title="Permanently delete user"
                            >
                              <TrashBin className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={10}
            onPageChange={setPage}
            itemName="users"
          />
        </div>
      </div>
    </div>
  );
}
