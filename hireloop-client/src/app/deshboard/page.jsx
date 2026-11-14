"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export default function DashboardIndexPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/signin?redirect=/deshboard");
      return;
    }

    if (session.user.role === "recruiter") {
      router.replace("/deshboard/recruiter");
    } else {
      router.replace("/deshboard/seekers");
    }
  }, [session, isPending, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d11] text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        <p className="text-xs text-neutral-400">Loading your dashboard...</p>
      </div>
    </div>
  );
}
