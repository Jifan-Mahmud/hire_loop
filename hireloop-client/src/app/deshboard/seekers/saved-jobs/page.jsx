"use client";

import React from "react";
import Link from "next/link";
import { Bookmark, ArrowRight, Briefcase } from "@gravity-ui/icons";

export default function SeekerSavedJobsPage() {
  return (
    <div className="min-h-screen bg-[#0d0d11] text-white p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Saved Jobs
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Jobs you have bookmarked for quick review and future applications.
          </p>
        </div>

        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-xs sm:text-sm font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-600/20"
        >
          <span>Find Jobs</span>
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="mt-8">
        <div className="rounded-2xl bg-[#141418] border border-white/[0.08] p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-amber-400">
            <Bookmark className="size-6" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            Saved Jobs Portfolio
          </h3>
          <p className="text-sm text-neutral-400 max-w-md mx-auto mt-2 mb-6">
            Bookmark interesting positions while browsing to keep them organized here and apply when you are ready.
          </p>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs sm:text-sm hover:bg-neutral-200 transition-colors"
          >
            Explore Open Positions
          </Link>
        </div>
      </div>
    </div>
  );
}
