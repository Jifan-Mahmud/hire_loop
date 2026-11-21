"use client";

import React from "react";
import ForbiddenView from "@/components/Common/ForbiddenView";

export default function GlobalForbidden() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center py-12 px-4">
      <ForbiddenView
        requiredRole="Elevated Privileges"
        customMessage="You do not have authorization to view this resource (HTTP 403 Forbidden)."
      />
    </div>
  );
}
