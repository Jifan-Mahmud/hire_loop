"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardStats from "@/components/DashboardSideBar/DashboardStats";
import { useSession } from "@/lib/auth-client";
import { Briefcase, Check, FileText, Person } from "@gravity-ui/icons";

const RecruiterPage = () => {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user;

  useEffect(() => {
    if (!isPending && user && user.role !== "recruiter") {
      router.replace("/deshboard/seekers");
    }
  }, [user, isPending, router]);

  if (isPending || !user || user.role !== "recruiter") {
    return (
      <div className="p-8 text-neutral-400 flex items-center gap-2">
        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <span>Loading recruiter dashboard...</span>
      </div>
    );
  }

  const defaultStats = [
    { icon: FileText, label: "Total Job Posts", value: 48 },
    { icon: Person, label: "Total Applicants", value: 1284 },
    { icon: Briefcase, label: "Active Jobs", value: 18 },
    { icon: Check, label: "Jobs Closed", value: 32 },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <h2 className="text-3xl sm:text-4xl font-bold text-white">
        Welcome back, {user?.name}
      </h2>
      <DashboardStats defaultStats={defaultStats} />
    </div>
  );
};

export default RecruiterPage;
