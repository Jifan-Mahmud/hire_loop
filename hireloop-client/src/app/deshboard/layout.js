"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import DeshboardSideBar from "@/components/DashboardSideBar/DashboardSideBar";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const isAdmin = user?.role === "admin";
  const isSeeker = !isAdmin && user?.role === "seeker";
  const isRecruiter = !isAdmin && user?.role === "recruiter";

  // Strict role checks:
  const isNonAdminInAdminArea = !isAdmin && pathname.startsWith("/deshboard/admin");
  const isSeekerInRecruiterArea = isSeeker && pathname.startsWith("/deshboard/recruiter");
  const isRecruiterInSeekerArea = isRecruiter && pathname.startsWith("/deshboard/seekers");
  const isUnauthenticated = !user;

  const isUnauthorized =
    !isPending &&
    (isUnauthenticated ||
      isNonAdminInAdminArea ||
      isSeekerInRecruiterArea ||
      isRecruiterInSeekerArea);

  useEffect(() => {
    if (isPending) return;

    // 1. Not signed in: redirect to signin
    if (!user) {
      router.replace(`/signin?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // 2. Non-admin trying to access admin dashboard
    if (isNonAdminInAdminArea) {
      if (user.role === "recruiter") {
        router.replace("/deshboard/recruiter");
      } else {
        router.replace("/deshboard/seekers");
      }
      return;
    }

    // 3. Seeker attempting to access recruiter portal: redirect to seeker dashboard
    if (isSeeker && pathname.startsWith("/deshboard/recruiter")) {
      router.replace("/deshboard/seekers");
      return;
    }

    // 4. Recruiter attempting to access seeker portal: redirect to recruiter dashboard
    if (isRecruiter && pathname.startsWith("/deshboard/seekers")) {
      router.replace("/deshboard/recruiter");
      return;
    }
  }, [
    user,
    isPending,
    pathname,
    router,
    isAdmin,
    isSeeker,
    isRecruiter,
    isNonAdminInAdminArea,
  ]);

  // Prevent flashing or loading even a single millisecond of unauthorized content
  if (isPending || isUnauthorized) {
    return (
      <div className="flex min-h-screen bg-[#0d0d11] items-center justify-center text-white mt-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          <p className="text-xs text-neutral-400 font-medium">Verifying access permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex dark min-h-screen bg-[#0d0d11] text-white mt-20">
      <DeshboardSideBar />
      <div className="flex-1 w-full min-w-0">{children}</div>
    </div>
  );
}
