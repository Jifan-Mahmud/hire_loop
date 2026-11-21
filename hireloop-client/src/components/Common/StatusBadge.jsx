"use client";

import React from "react";

export default function StatusBadge({
  status = "active",
  showDot = true,
  className = "",
}) {
  const norm = String(status || "").toLowerCase().trim();

  // Color mapping based on common domain statuses
  const getStyle = () => {
    switch (norm) {
      // Positive / Active states
      case "active":
      case "approved":
      case "offered":
      case "accepted":
      case "success":
        return {
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/20",
          text: "text-emerald-400",
          dot: "bg-emerald-400",
          pulse: true,
        };

      // Warning / Pending states
      case "pending":
      case "under_review":
      case "reviewing":
        return {
          bg: "bg-amber-500/10",
          border: "border-amber-500/25",
          text: "text-amber-300",
          dot: "bg-amber-400",
          pulse: true,
        };

      // Blue / Progress states
      case "shortlisted":
        return {
          bg: "bg-blue-500/10",
          border: "border-blue-500/25",
          text: "text-blue-400",
          dot: "bg-blue-400",
          pulse: false,
        };

      // Negative / Danger states
      case "banned":
      case "suspended":
      case "rejected":
      case "failed":
        return {
          bg: "bg-rose-500/15",
          border: "border-rose-500/30",
          text: "text-rose-400",
          dot: "bg-rose-400",
          pulse: false,
        };

      // Neutral / Inactive states
      case "closed":
      case "inactive":
        return {
          bg: "bg-neutral-800/80",
          border: "border-white/10",
          text: "text-neutral-400",
          dot: "bg-neutral-500",
          pulse: false,
        };

      // Default purple badge
      default:
        return {
          bg: "bg-purple-500/10",
          border: "border-purple-500/25",
          text: "text-purple-300",
          dot: "bg-purple-400",
          pulse: false,
        };
    }
  };

  const style = getStyle();
  const label = norm.replace("_", " ");

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize select-none ${style.bg} ${style.border} ${style.text} ${className}`}
    >
      {showDot && (
        <span
          className={`size-1.5 rounded-full shrink-0 ${style.dot} ${
            style.pulse ? "animate-pulse" : ""
          }`}
        />
      )}
      <span>{label}</span>
    </span>
  );
}
