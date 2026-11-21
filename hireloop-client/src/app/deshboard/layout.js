"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useLiveUser } from "@/context/LiveUserContext";
import DeshboardSideBar from "@/components/DashboardSideBar/DashboardSideBar";

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
  const isUnauthenticated = !user;

  const isUnauthorized =
    !isPending &&
    (isUnauthenticated ||
      isBanned ||
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

    // 2. Account Banned: do not redirect, layout renders the Banned screen
    if (isBanned) {
      return;
    }

    // 3. Non-admin trying to access admin dashboard
    if (isNonAdminInAdminArea) {
      if (role === "recruiter") {
        router.replace("/deshboard/recruiter");
      } else {
        router.replace("/deshboard/seekers");
      }
      return;
    }

    // 4. Seeker attempting to access recruiter portal: redirect to seeker dashboard
    if (isSeeker && pathname.startsWith("/deshboard/recruiter")) {
      router.replace("/deshboard/seekers");
      return;
    }

    // 5. Recruiter attempting to access seeker portal: redirect to recruiter dashboard
    if (isRecruiter && pathname.startsWith("/deshboard/seekers")) {
      router.replace("/deshboard/recruiter");
      return;
    }
  }, [
    user,
    isPending,
    isBanned,
    pathname,
    router,
    isAdmin,
    isSeeker,
    isRecruiter,
    isNonAdminInAdminArea,
    role,
  ]);

  // Handle Account Banned / Suspended Screen
  if (!isPending && isBanned) {
    return (
      <div className="flex min-h-screen bg-[#0d0d11] items-center justify-center p-4 text-white">
        <div className="max-w-md w-full rounded-2xl bg-[#14141c] border border-rose-500/30 p-6 sm:p-8 text-center space-y-4 shadow-2xl">
          <div className="size-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center text-3xl">
            🚫
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Account Suspended
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Your account <span className="text-rose-300 font-mono font-medium">({user?.email})</span> has been banned or suspended by a system administrator. Access to the platform dashboard has been revoked.
          </p>
          <div className="pt-2">
            <button
              onClick={async () => {
                await authClient.signOut();
                router.replace("/signin");
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg transition cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Prevent flashing or loading unauthorized content
  if (isPending || isUnauthorized) {
    return (
      <div className="flex min-h-screen bg-[#0d0d11] items-center justify-center text-white mt-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          <p className="text-xs text-neutral-400 font-medium">Verifying platform access permissions...</p>
        </div>
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
