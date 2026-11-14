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

  // Strict role check:
  // 1. Not signed in
  // 2. Seeker trying to access recruiter dashboard
  // 3. Recruiter trying to access seeker dashboard
  const isUnauthorized =
    !isPending &&
    (!user ||
      (user?.role === "seeker" && pathname.startsWith("/deshboard/recruiter")) ||
      (user?.role === "recruiter" && pathname.startsWith("/deshboard/seekers")));

  useEffect(() => {
    if (isPending) return;

    // 1. Not signed in: redirect to signin
    if (!user) {
      router.replace(`/signin?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // 2. Seeker attempting to access recruiter portal: redirect to seeker dashboard
    if (user.role === "seeker" && pathname.startsWith("/deshboard/recruiter")) {
      router.replace("/deshboard/seekers");
      return;
    }

    // 3. Recruiter attempting to access seeker portal: redirect to recruiter dashboard
    if (user.role === "recruiter" && pathname.startsWith("/deshboard/seekers")) {
      router.replace("/deshboard/recruiter");
      return;
    }
  }, [user, isPending, pathname, router]);

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
