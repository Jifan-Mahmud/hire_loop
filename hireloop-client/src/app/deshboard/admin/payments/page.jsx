"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Calendar,
  Person,
  LayoutSideContent,
  SlidersVertical,
  ArrowRight,
} from "@gravity-ui/icons";
import AdminTopBar from "@/components/Admin/AdminTopBar";

export default function AdminPaymentsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  const statCards = [
    {
      title: "Total Revenue",
      value: "$1,284,500",
      change: "+12.4%",
      icon: CreditCard,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      title: "Monthly Revenue",
      value: "$94,210",
      change: "+8.1%",
      icon: Calendar,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Active Pro Users",
      value: "12,408",
      change: "+2.3%",
      icon: Person,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Active Enterprise Users",
      value: "842",
      change: "+15.7%",
      icon: LayoutSideContent,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  const transactions = [
    {
      id: "TXN-98203448",
      email: "jordan.daniels@enterprise.co",
      plan: "Enterprise",
      amount: "$4,500.00",
      date: "May 19, 2026 • Just now",
      status: "SUCCESS",
      initials: "JD",
    },
    {
      id: "TXN-77342023",
      email: "sarah.k@techflow.io",
      plan: "Pro",
      amount: "$299.00",
      date: "May 18, 2026 • 1 day ago",
      status: "SUCCESS",
      initials: "SK",
    },
    {
      id: "TXN-55524445",
      email: "marcus.lee@gmail.com",
      plan: "Starter",
      amount: "$49.00",
      date: "May 17, 2026 • 2 days ago",
      status: "PENDING",
      initials: "ML",
    },
    {
      id: "TXN-093465712",
      email: "e.lopez@globalfoundries.com",
      plan: "Enterprise",
      amount: "$12,000.00",
      date: "May 10, 2026 • 9 days ago",
      status: "FAILED",
      initials: "EL",
    },
  ];

  const revenueBars = [
    { day: "MON", height: "45%" },
    { day: "TUE", height: "60%" },
    { day: "WED", height: "35%" },
    { day: "THU", height: "80%" },
    { day: "FRI", height: "95%" },
    { day: "SAT", height: "70%" },
    { day: "SUN", height: "50%" },
  ];

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ? true : t.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Top Bar */}
      <AdminTopBar
        placeholder="Search transactions, users, or IDs..."
        searchValue={search}
        onSearchChange={setSearch}
        manageRoleText="Admin View"
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Payments &amp; Subscriptions
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Comprehensive overview of platform revenue and active subscriptions.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.title}
              className="rounded-2xl border border-white/[0.08] bg-[#121218]/90 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl ${c.bg} ${c.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {c.change}
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-medium">{c.title}</p>
              <p className="text-2xl font-bold text-white mt-1 tracking-tight">
                {c.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent Transactions Table matching Image 5 */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#121218]/90 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 sm:p-6 border-b border-white/[0.08]">
          <h2 className="text-base font-bold text-white">Recent Transactions</h2>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() =>
                setStatusFilter(
                  statusFilter === "all"
                    ? "success"
                    : statusFilter === "success"
                    ? "pending"
                    : "all"
                )
              }
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-xs font-medium text-neutral-300 transition"
            >
              <SlidersVertical className="w-3 h-3 text-neutral-400" />
              <span className="capitalize">{statusFilter === "all" ? "Filter" : statusFilter}</span>
            </button>

            <button
              onClick={() => alert("Exporting transactions as CSV...")}
              className="flex items-center justify-center h-8 px-3 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-semibold shadow-sm transition"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-wider text-neutral-400 font-mono bg-white/[0.02]">
                <th className="py-3.5 px-6">USER EMAIL</th>
                <th className="py-3.5 px-6">PLAN</th>
                <th className="py-3.5 px-6">AMOUNT</th>
                <th className="py-3.5 px-6">DATE</th>
                <th className="py-3.5 px-6">TRANSACTION ID</th>
                <th className="py-3.5 px-6 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-white/[0.02] transition">
                  {/* Email + Monogram */}
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="size-7 rounded-full bg-neutral-800 flex items-center justify-center text-[11px] font-bold text-neutral-300 border border-white/5">
                        {t.initials}
                      </div>
                      <span className="font-medium text-white truncate max-w-[200px]">
                        {t.email}
                      </span>
                    </div>
                  </td>

                  {/* Plan Badge */}
                  <td className="py-3.5 px-6">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-xs text-neutral-300 font-medium">
                      {t.plan}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-6 font-semibold text-white font-mono">
                    {t.amount}
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-6 text-neutral-400 text-xs">{t.date}</td>

                  {/* Transaction ID */}
                  <td className="py-3.5 px-6 font-mono text-xs text-neutral-400">
                    {t.id}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-6 text-right">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium ${
                        t.status === "SUCCESS"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : t.status === "PENDING"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-rose-500/10 text-rose-400"
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          t.status === "SUCCESS"
                            ? "bg-emerald-400"
                            : t.status === "PENDING"
                            ? "bg-amber-400"
                            : "bg-rose-400"
                        }`}
                      />
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination matching Image 5 */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-white/[0.08] text-xs text-neutral-400">
          <span>Showing 1 to 10 of 24,510 transactions</span>

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
            <button
              onClick={() => setPage(page + 1)}
              className="p-1 rounded-md text-neutral-400 hover:text-white"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Grid matching Image 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Trend (Last 7 Days) */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#121218]/90 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">Revenue Trend (Last 7 Days)</h2>
            <span className="text-xs font-mono text-neutral-400">USD ($)</span>
          </div>

          <div className="h-44 w-full flex items-end justify-between gap-3 pt-4 px-2">
            {revenueBars.map((b) => (
              <div key={b.day} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="relative w-full max-w-[40px] flex items-end justify-center h-32">
                  <div
                    style={{ height: b.height }}
                    className="w-full rounded-t-lg bg-neutral-700/80 group-hover:bg-purple-600 transition-all duration-300"
                  />
                </div>
                <span className="text-[10px] text-neutral-500 font-mono mt-2">{b.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#121218]/90 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-5">Plan Distribution</h2>

            <div className="space-y-4">
              {/* Enterprise */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-300 font-medium">Enterprise</span>
                  <span className="text-white font-mono font-bold">35%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-800 overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: "35%" }} />
                </div>
              </div>

              {/* Professional */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-300 font-medium">Professional</span>
                  <span className="text-white font-mono font-bold">52%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-800 overflow-hidden">
                  <div className="h-full bg-neutral-400 rounded-full" style={{ width: "52%" }} />
                </div>
              </div>

              {/* Starter */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-300 font-medium">Starter</span>
                  <span className="text-white font-mono font-bold">13%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-800 overflow-hidden">
                  <div className="h-full bg-neutral-600 rounded-full" style={{ width: "13%" }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-white/[0.08] mt-4">
            <button
              onClick={() => alert("Generating full plan subscription analytics...")}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium transition cursor-pointer"
            >
              View detailed report &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
