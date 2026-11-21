"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLiveUser } from "@/context/LiveUserContext";

export default function DashboardIndexPage() {
  const router = useRouter();
  const { user, role, isPending, isBanned } = useLiveUser();

  useEffect(() => {
    if (isPending) return;

    if (!user) {
      router.replace("/signin?redirect=/deshboard");
      return;
    }

    if (isBanned) return;

    if (role === "admin") {
      router.replace("/deshboard/admin");
    } else if (role === "recruiter") {
      router.replace("/deshboard/recruiter");
    } else {
      router.replace("/deshboard/seekers");
    }
  }, [user, role, isPending, isBanned, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d11] text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        <p className="text-xs text-neutral-400">Loading your dashboard...</p>
      </div>
    </div>
  );
}
