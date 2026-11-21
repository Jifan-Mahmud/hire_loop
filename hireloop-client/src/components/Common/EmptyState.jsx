"use client";

import React from "react";
import Link from "next/link";
import { Folder } from "@gravity-ui/icons";

export default function EmptyState({
  icon: Icon = Folder,
  title = "No data available",
  description = "There are no items to display at this moment.",
  actionLabel = "",
  onAction = null,
  actionHref = "",
  className = "",
}) {
  return (
    <div
      className={`rounded-3xl border border-dashed border-white/15 bg-neutral-900/40 p-8 sm:p-12 text-center my-6 ${className}`}
    >
      <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 mb-4 shadow-inner">
        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400" />
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
        {title}
      </h3>

      {description && (
        <p className="text-neutral-400 text-xs sm:text-sm max-w-md mx-auto mt-2 leading-relaxed">
          {description}
        </p>
      )}

      {(actionLabel && (actionHref || onAction)) && (
        <div className="mt-6 flex justify-center">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-purple-600/20"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-semibold transition-all border border-white/10 cursor-pointer"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
