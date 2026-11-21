"use client";

import React from "react";
import Link from "next/link";
import { Bookmark, ArrowRight } from "@gravity-ui/icons";
import EmptyState from "@/components/Common/EmptyState";

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
        <EmptyState
          icon={Bookmark}
          title="Saved Jobs Portfolio"
          description="Bookmark interesting positions while browsing to keep them organized here and apply when you are ready."
          actionLabel="Explore Open Positions"
          actionHref="/jobs"
        />
      </div>
    </div>
  );
}
