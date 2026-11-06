"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { authClient } from "@/lib/auth-client";

const navItems = [
  {
    name: "Browse Jobs",
    href: "/jobs",
  },
  {
    name: "Company",
    href: "/company",
  },
  {
    name: "Pricing",
    href: "/pricing",
  },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, isLoading } = useSession();
  const user = session?.user;
  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = "/signin";
          },
        },
      });
    } catch (err) {
      console.error("Sign out error:", err);
      window.location.href = "/signin";
    }
  };
  return (
    // absolute + inset-x-2 + top-2 => floats on top of the hero background
    <nav className="absolute inset-x-2 top-2 z-30 rounded-2xl  bg-white/5 text-white backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-5 sm:px-8">
        {/* ================= LOGO - LEFT ================= */}
        <Link href="/" className="text-3xl font-bold tracking-tight">
          <span className="text-white">hire</span>
          <span className="text-blue-500">l</span>
          <span className="text-orange-500">oop</span>
        </Link>

        {/* ================= DESKTOP MENU - RIGHT ================= */}
        <div className="hidden items-center gap-8 md:flex">
          {/* Navigation Links */}
          <div className="flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-[15px] text-white/90 transition hover:text-white"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Sign In */}
          {user ? (
            <>
              <div className="flex items-center gap-3">
                {/* User Profile */}
                <Link
                  href="/profile"
                  className="group flex items-center gap-2.5 rounded-full px-2 py-1.5 transition hover:bg-white/5"
                >
                  {/* Avatar */}
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-semibold text-white">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>

                  {/* Name */}
                  <span className="max-w-[120px] truncate text-sm font-medium text-white transition group-hover:text-indigo-300">
                    {user?.name}
                  </span>
                </Link>

                {/* Divider */}
                <div className="h-6 w-px bg-white/10" />

                {/* Sign Out */}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition hover:bg-red-500/10 hover:text-red-400"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="text-[15px] text-indigo-400 transition hover:text-indigo-300"
              >
                Sign In
              </Link>

              {/* Get Started (plain Link styled as a button: works on HeroUI v2 and v3) */}
              <Link
                href="/signup"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 text-sm font-medium text-white transition hover:opacity-90"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* ================= MOBILE MENU BUTTON ================= */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-white/10 md:hidden"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            // Close icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            // Hamburger icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {isMenuOpen && (
        <div className="border-t border-white/10 px-5 pb-6 md:hidden">
          <div className="flex flex-col pt-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="border-b border-white/10 py-4 text-white/90"
              >
                {item.name}
              </Link>
            ))}

            <Link
              href="/signin"
              onClick={() => setIsMenuOpen(false)}
              className="py-4 text-indigo-400"
            >
              Sign In
            </Link>

            <Link
              href="/signup"
              onClick={() => setIsMenuOpen(false)}
              className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 font-medium text-white"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
