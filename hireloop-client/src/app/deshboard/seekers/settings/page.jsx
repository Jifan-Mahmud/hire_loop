"use client";

import React, { useState } from "react";
import { Person, Envelope, Lock, Gear, CircleCheck } from "@gravity-ui/icons";
import { useSession } from "@/lib/auth-client";
import SessionTokenVerifier from "@/components/Security/SessionTokenVerifier";

export default function SeekerSettingsPage() {
  const { data: session } = useSession();
  const user = session?.user;

  const [name, setName] = useState(user?.name || "");
  const [headline, setHeadline] = useState("Software Engineer | Passionate Builder");
  const [bio, setBio] = useState(
    "Experienced software developer looking for high-impact opportunities in modern engineering teams."
  );
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const plan = user?.plan || "free";
  const tierName =
    plan === "premium"
      ? "Premium Tier"
      : plan === "pro"
      ? "Professional Tier"
      : "Free Tier";

  return (
    <div className="min-h-screen bg-[#0d0d11] text-white p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="pb-6 border-b border-white/[0.08]">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Seeker Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Manage your personal details, career headline, and account preferences.
        </p>
      </div>

      <div className="mt-8 max-w-3xl space-y-6">
        {/* Plan card summary */}
        <div className="rounded-2xl bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-500/20 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-300">
              Active Membership
            </span>
            <h3 className="text-xl font-bold text-white mt-1">{tierName}</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Enjoy your membership features and job application benefits.
            </p>
          </div>
          <a
            href="/pricing"
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-purple-600/30"
          >
            Upgrade or Manage Plan
          </a>
        </div>

        {/* Token-Based User Verification Showcase (No JWT) */}
        <SessionTokenVerifier />

        {/* Profile edit form */}
        <form
          onSubmit={handleSave}
          className="rounded-2xl bg-[#141418] border border-white/[0.08] p-6 sm:p-8 space-y-5"
        >
          <h2 className="text-lg font-semibold text-white">General Information</h2>

          {saved && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
              <CircleCheck className="size-4 shrink-0 text-emerald-400" />
              <span>Your profile details have been saved successfully!</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-2">
              Full Name
            </label>
            <div className="relative">
              <Person className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 size-4" />
              <input
                type="text"
                value={name || user?.name || ""}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-2">
              Email Address (Account ID)
            </label>
            <div className="relative">
              <Envelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 size-4" />
              <input
                type="email"
                disabled
                value={user?.email || "alex.rivera@example.com"}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.02] border border-white/5 text-sm text-neutral-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-2">
              Professional Headline
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Senior Frontend Developer | React & Next.js"
              className="w-full h-11 px-4 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-2">
              Bio / Summary
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell hiring teams about your background and achievements..."
              className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div className="pt-4 border-t border-white/[0.08] flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-purple-600/30"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
