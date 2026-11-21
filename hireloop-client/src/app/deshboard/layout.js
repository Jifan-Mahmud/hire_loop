"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLiveUser } from "@/context/LiveUserContext";
import DeshboardSideBar from "@/components/DashboardSideBar/DashboardSideBar";
import ForbiddenView from "@/components/Common/ForbiddenView";
import LoadingSpinner from "@/components/Common/LoadingSpinner";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, isBanned, isPending } = useLiveUser();

  const isAdmin = role === "admin";
  const isSeeker = !isAdmin && role === "seeker";
  const isRecruiter = !isAdmin && role === "recruiter";

  // Strict role boundaries
  const isNonAdminInAdminArea = !isAdmin && pathname.startsWith("/deshboard/admin");
  const isSeekerInRecruiterArea = isSeeker && pathname.startsWith("/deshboard/recruiter");
  const isRecruiterInSeekerArea = isRecruiter && pathname.startsWith("/deshboard/seekers");

  useEffect(() => {
    if (isPending) return;

    // 1. Not signed in: redirect to signin
    if (!user) {
      router.replace(`/signin?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, isPending, pathname, router]);

  // Loading spinner while checking live session
  if (isPending) {
    return (
      <div className="flex min-h-screen bg-[#0d0d11] items-center justify-center text-white mt-20">
        <LoadingSpinner text="Verifying platform access permissions..." />
      </div>
    );
  }

  // 1. Account Banned / Suspended (HTTP 403 Forbidden)
  if (isBanned) {
    return (
      <div className="min-h-screen bg-[#0d0d11] flex items-center justify-center p-4">
        <ForbiddenView isBanned={true} attemptedPath={pathname} />
      </div>
    );
  }

  // 2. Non-Admin attempting to access Admin Dashboard (HTTP 403 Forbidden)
  if (isNonAdminInAdminArea) {
    return (
      <div className="flex dark min-h-screen bg-[#0d0d11] text-white mt-20">
        <DeshboardSideBar effectiveUser={user} />
        <main className="flex-1 w-full min-w-0 flex items-center justify-center p-4">
          <ForbiddenView
            requiredRole="System Administrator"
            attemptedPath={pathname}
          />
        </main>
      </div>
    );
  }

  // 3. Seeker attempting to access Recruiter Portal (HTTP 403 Forbidden)
  if (isSeekerInRecruiterArea) {
    return (
      <div className="flex dark min-h-screen bg-[#0d0d11] text-white mt-20">
        <DeshboardSideBar effectiveUser={user} />
        <main className="flex-1 w-full min-w-0 flex items-center justify-center p-4">
          <ForbiddenView
            requiredRole="Recruiter"
            attemptedPath={pathname}
          />
        </main>
      </div>
    );
  }

  // 4. Recruiter attempting to access Seeker Portal (HTTP 403 Forbidden)
  if (isRecruiterInSeekerArea) {
    return (
      <div className="flex dark min-h-screen bg-[#0d0d11] text-white mt-20">
        <DeshboardSideBar effectiveUser={user} />
        <main className="flex-1 w-full min-w-0 flex items-center justify-center p-4">
          <ForbiddenView
            requiredRole="Job Seeker"
            attemptedPath={pathname}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="flex dark min-h-screen bg-[#0d0d11] text-white mt-20">
      <DeshboardSideBar effectiveUser={user} />
      <div className="flex-1 w-full min-w-0">{children}</div>
    </div>
  );
}
