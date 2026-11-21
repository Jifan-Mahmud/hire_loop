"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ForbiddenView from "@/components/Common/ForbiddenView";
import LoadingSpinner from "@/components/Common/LoadingSpinner";

function ForbiddenContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "";
  const requiredRole = searchParams.get("required") || "Authorized Personnel";
  const attemptedPath = searchParams.get("path") || "";
  const reason = searchParams.get("reason") || "";
  const isBanned = searchParams.get("banned") === "true";

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center py-12 px-4">
      <ForbiddenView
        requiredRole={requiredRole}
        attemptedPath={attemptedPath}
        customMessage={reason}
        isBanned={isBanned}
      />
    </div>
  );
}

export default function ForbiddenPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullscreen text="Checking clearance..." />}>
      <ForbiddenContent />
    </Suspense>
  );
}
