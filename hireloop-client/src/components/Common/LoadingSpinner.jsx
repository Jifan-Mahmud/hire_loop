"use client";

import React from "react";

export default function LoadingSpinner({
  size = "md",
  text = "Loading...",
  fullscreen = false,
  className = "",
}) {
  const sizeClasses = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3",
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`${sizeClasses[size] || sizeClasses.md} rounded-full border-purple-500 border-t-transparent animate-spin`}
      />
      {text && (
        <p className="text-xs text-neutral-400 font-medium tracking-wide">
          {text}
        </p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="min-h-screen bg-[#0d0d11] text-white flex items-center justify-center p-4">
        {spinner}
      </div>
    );
  }

  return spinner;
}
