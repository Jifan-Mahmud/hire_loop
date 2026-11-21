"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLiveUser } from "@/context/LiveUserContext";
import LoadingSpinner from "@/components/Common/LoadingSpinner";

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

  return <LoadingSpinner text="Loading your dashboard..." fullscreen />;
}
