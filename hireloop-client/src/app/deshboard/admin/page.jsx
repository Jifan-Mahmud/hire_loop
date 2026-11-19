"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Person,
  Briefcase,
  LayoutSideContent,
  CreditCard,
  Calendar,
  ChevronDown,
} from "@gravity-ui/icons";
import AdminTopBar from "@/components/Admin/AdminTopBar";
import { getAdminStats } from "@/lib/api/admin";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [timeRange, setTimeRange] = useState("Last 30 Days");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (err) {
        console.error("Error loading admin stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  // Format numbers with commas
  const formatNum = (num, fallback) => {
    if (num !== undefined && num !== null && num > 0) {
      return Number(num).toLocaleString();
    }
    return fallback;
  };

  const statCards = [
    {
      title: "Total Users",
      value: formatNum(stats?.totalUsers, "124,892"),
      change: "+12%",
      isPositive: true,
      icon: Person,
      iconColor: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Total Recruiters",
      value: formatNum(stats?.totalRecruiters, "12,405"),
      change: "+6%",
      isPositive: true,
      icon: Person,
      iconColor: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Total Companies",
      value: formatNum(stats?.totalCompanies, "4,281"),
      change: "0%",
      isNeutral: true,
      icon: LayoutSideContent,
      iconColor: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Jobs Posted",
      value: formatNum(stats?.totalJobs, "8,920"),
      change: "+24%",
      isPositive: true,
      icon: Briefcase,
      iconColor: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Platform Revenue",
      value: stats?.totalRevenueFormatted || "$245,800",
      change: "+18.5%",
      isPositive: true,
      icon: CreditCard,
      iconColor: "text-pink-400",
      bgColor: "bg-pink-500/10",
    },
  ];

  // Showcase transactions matching Image 2
  const transactions = [
    {
      id: "#TXN-98234L",
      user: "Marcus K.",
      company: "TechCorp Inc.",
      plan: "Enterprise Monthly",
      amount: "$1,299.00",
      date: "Oct 24, 2026, 14:20",
      status: "Success",
    },
    {
      id: "#TXN-88214M",
      user: "Sarah K.",
      company: "Creative Studio",
      plan: "Professional Annual",
      amount: "$499.00",
      date: "Oct 24, 2026, 11:05",
      status: "Success",
    },
    {
      id: "#TXN-11327Q",
      user: "j.doe@freelance.org",
      company: "Independent",
      plan: "Starter Monthly",
      amount: "$49.00",
      date: "Oct 23, 2026, 19:45",
      status: "Pending",
    },
    {
      id: "#TXN-66201A",
      user: "admin@retailglobal.net",
      company: "Retail Global",
      plan: "Enterprise Monthly",
      amount: "$1,299.00",
      date: "Oct 23, 2026, 09:12",
      status: "Failed",
    },
  ];

  const categories = [
    { name: "Engineering", height: "82%", count: stats?.categoryCounts?.engineering || 42 },
    { name: "Design", height: "54%", count: stats?.categoryCounts?.design || 28 },
    { name: "Marketing", height: "40%", count: stats?.categoryCounts?.marketing || 19 },
    { name: "Sales", height: "68%", count: stats?.categoryCounts?.sales || 34 },
    { name: "Operations", height: "30%", count: stats?.categoryCounts?.operations || 15 },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Top Bar */}
      <AdminTopBar
        placeholder="Global search..."
        searchValue={search}
        onSearchChange={setSearch}
        manageRoleText="Admin View"
      />

      {/* Header section with Date filter and Export Report */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Real-time platform performance and growth metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Time range selector */}
          <div className="relative">
            <button
              onClick={() =>
                setTimeRange(timeRange === "Last 30 Days" ? "Last 7 Days" : "Last 30 Days")
              }
              className="flex items-center gap-2 h-9 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-xs font-medium text-neutral-300 transition"
            >
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <span>{timeRange}</span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>
          </div>

          {/* Export Report Button */}
          <button
            onClick={() => alert("Generating Platform Analytics Export...")}
            className="flex items-center justify-center h-9 px-4 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            Export Report
          </button>
        </div>
      </div>

      {/* 5 Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="rounded-2xl border border-white/[0.08] bg-[#121218]/90 p-4 transition hover:border-white/20 relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl ${card.bgColor} ${card.iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full ${
                    card.isNeutral
                      ? "bg-neutral-800 text-neutral-400"
                      : "bg-emerald-500/10 text-emerald-400"
                  }`}
                >
                  {card.change}
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-medium">{card.title}</p>
              <p className="text-xl sm:text-2xl font-bold text-white mt-1 tracking-tight">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Middle Section: 2 Charts Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Job Posts by Category */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#121218]/90 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-white">Job Posts by Category</h2>
            <div className="flex items-center gap-1.5 text-xs text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-neutral-400" />
              <span>Active Listings</span>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="h-56 w-full flex items-end justify-between gap-4 pt-4 px-2">
            {categories.map((cat) => (
              <div key={cat.name} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="relative w-full max-w-[56px] flex items-end justify-center h-44">
                  {/* Tooltip on hover */}
                  <span className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-800 text-white text-[10px] py-0.5 px-1.5 rounded font-mono pointer-events-none">
                    {cat.count} jobs
                  </span>
                  {/* Bar */}
                  <div
                    style={{ height: cat.height }}
                    className="w-full rounded-t-lg bg-neutral-700/80 group-hover:bg-purple-600 transition-all duration-300"
                  />
                </div>
                <span className="text-[11px] text-neutral-400 mt-3 truncate max-w-[70px] text-center">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* New Users (30d) Wave Line Chart */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#121218]/90 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-white">New Users (30d)</h2>
            <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
              +2,410
            </span>
          </div>

          <div className="relative h-60 w-full pt-4">
            {/* Peak Growth Callout */}
            <div className="absolute top-10 right-14 z-10">
              <div className="px-2 py-0.5 rounded-full bg-white text-black text-[10px] font-bold shadow-lg">
                Peak Growth
              </div>
            </div>

            {/* Smooth SVG Area Curve */}
            <svg
              className="w-full h-44 overflow-visible"
              viewBox="0 0 500 150"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="userGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Shaded Area */}
              <path
                d="M 0 120 Q 80 110, 140 70 T 260 85 T 380 40 T 500 80 L 500 150 L 0 150 Z"
                fill="url(#userGrowthGrad)"
              />
              {/* Curve Line */}
              <path
                d="M 0 120 Q 80 110, 140 70 T 260 85 T 380 40 T 500 80"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Highlight Dot at Peak */}
              <circle cx="380" cy="40" r="4" fill="#ffffff" stroke="#8b5cf6" strokeWidth="2" />
            </svg>

            {/* Time labels */}
            <div className="flex justify-between text-[11px] text-neutral-500 font-mono mt-3 px-1">
              <span>Day 1</span>
              <span>Day 15</span>
              <span>Day 30</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Subscription Transactions Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#121218]/90 overflow-hidden">
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/[0.08]">
          <h2 className="text-base font-bold text-white">Recent Subscription Transactions</h2>
          <Link
            href="/deshboard/admin/payments"
            className="text-xs text-purple-400 hover:text-purple-300 font-medium transition"
          >
            View All Activity
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-wider text-neutral-400 font-mono bg-white/[0.02]">
                <th className="py-3 px-6">USER/RECRUITER</th>
                <th className="py-3 px-6">PLAN TYPE</th>
                <th className="py-3 px-6">TRANSACTION ID</th>
                <th className="py-3 px-6">AMOUNT</th>
                <th className="py-3 px-6">DATE</th>
                <th className="py-3 px-6">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/[0.02] transition">
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-semibold text-neutral-300 shrink-0">
                        {tx.user.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">{tx.user}</p>
                        <p className="text-[11px] text-neutral-400 truncate">{tx.company}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-6">
                    <span className="inline-block px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs text-neutral-300 font-medium">
                      {tx.plan}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 font-mono text-xs text-neutral-400">{tx.id}</td>
                  <td className="py-3.5 px-6 font-semibold text-white">{tx.amount}</td>
                  <td className="py-3.5 px-6 text-neutral-400 text-xs">{tx.date}</td>
                  <td className="py-3.5 px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        tx.status === "Success"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : tx.status === "Pending"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-rose-500/10 text-rose-400"
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          tx.status === "Success"
                            ? "bg-emerald-400"
                            : tx.status === "Pending"
                            ? "bg-amber-400"
                            : "bg-rose-400"
                        }`}
                      />
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 py-4 border-t border-white/[0.08]">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            className="px-2.5 py-1 rounded-lg border border-white/10 text-xs text-neutral-400 hover:text-white hover:bg-white/5"
          >
            &lt;
          </button>
          {[1, 2, 3].map((num) => (
            <button
              key={num}
              onClick={() => setPage(num)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                page === num
                  ? "bg-white text-black font-bold"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => setPage(Math.min(3, page + 1))}
            className="px-2.5 py-1 rounded-lg border border-white/10 text-xs text-neutral-400 hover:text-white hover:bg-white/5"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
