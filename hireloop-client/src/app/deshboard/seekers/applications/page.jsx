"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  FileText,
  Calendar,
  ArrowRight,
  Briefcase,
} from "@gravity-ui/icons";
import { useSession } from "@/lib/auth-client";
import { getCandidateApplications } from "@/lib/api/applications";
import Pagination from "@/components/Common/Pagination";
import StatusBadge from "@/components/Common/StatusBadge";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import EmptyState from "@/components/Common/EmptyState";
import { formatDate } from "@/lib/utils/formatters";

export default function SeekerApplicationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  const rawPage = parseInt(searchParams.get("page") || "1", 10);
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const pageSize = 5;

  const updatePage = useCallback(
    (newPage) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newPage > 1) {
        params.set("page", String(newPage));
      } else {
        params.delete("page");
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const totalPages = Math.ceil(applications.length / pageSize) || 1;
  const safePage = Math.min(Math.max(1, page), totalPages);
  const paginatedApps = applications.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => {
    async function loadApps() {
      if (!user?.email) {
        setLoading(false);
        return;
      }
      try {
        const data = await getCandidateApplications(user.email);
        setApplications(data || []);
      } catch (err) {
        console.error("Error fetching applications:", err);
      } finally {
        setLoading(false);
      }
    }
    loadApps();
  }, [user?.email]);

  return (
    <div className="min-h-screen bg-[#0d0d11] text-white p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            My Applications
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Track and monitor the status of all your submitted job applications.
          </p>
        </div>

        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-xs sm:text-sm font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-600/20"
        >
          <span>Browse More Jobs</span>
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {/* Applications list */}
      <div className="mt-8 space-y-4">
        {loading ? (
          <div className="py-16">
            <LoadingSpinner text="Loading your applications..." />
          </div>
        ) : applications.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No applications yet"
            description="You haven't submitted any job applications yet. Explore openings and apply directly."
            actionLabel="Browse Open Jobs"
            actionHref="/jobs"
          />
        ) : (
          <>
            {paginatedApps.map((app) => (
              <div
                key={app._id}
                className="rounded-2xl bg-[#141418] border border-white/[0.08] p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-white/20 transition-all"
              >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {app.jobTitle || "Software Engineer"}
                  </h3>
                  <StatusBadge status={app.status || "pending"} />
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="size-3.5 text-neutral-500" />
                    <span>{app.companyName || "Company"}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-neutral-500" />
                    <span>Applied: {formatDate(app.appliedAt, { month: "short", day: "numeric", year: "numeric" })}</span>
                  </span>
                  {app.resumeUrl && (
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 underline font-medium"
                    >
                      View Submitted Resume
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/jobs/${app.jobId}`}
                  className="px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 text-xs sm:text-sm font-medium text-neutral-200 hover:text-white transition-all text-center"
                >
                  View Job Details
                </Link>
              </div>
            </div>
            ))}

            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              totalItems={applications.length}
              pageSize={pageSize}
              onPageChange={updatePage}
              itemName="applications"
            />
          </>
        )}
      </div>
    </div>
  );
}
