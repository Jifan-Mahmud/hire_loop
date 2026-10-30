
"use client";

import Link from "next/link";
import { Button } from "@heroui/react";
import {
 LogoFacebook,
  LogoGithub,
  LogoLinkedin,
} from "@gravity-ui/icons";

const productLinks = [
  {
    name: "Job discovery",
    href: "/jobs",
  },
  {
    name: "Worker AI",
    href: "/worker-ai",
  },
  {
    name: "Companies",
    href: "/companies",
  },
  {
    name: "Salary data",
    href: "/salary-data",
  },
];

const navigationLinks = [
  {
    name: "Help center",
    href: "/help",
  },
  {
    name: "Career library",
    href: "/career-library",
  },
  {
    name: "Contact",
    href: "/contact",
  },
];

const resourceLinks = [
  {
    name: "Brand Guideline",
    href: "/brand-guideline",
  },
  {
    name: "Newsroom",
    href: "/newsroom",
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-black text-white">

      {/* Background Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(255,255,255,0.05) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,0.05) 1px,
              transparent 1px
            )
          `,
          backgroundSize: "70px 70px",
          maskImage:
            "linear-gradient(to bottom, black, transparent 85%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black, transparent 85%)",
        }}
      />

      {/* Top curved glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full border border-white/[0.04] shadow-[0_0_100px_rgba(99,102,241,0.05)]" />

      <div className="relative mx-auto max-w-[1400px] px-6 py-16 sm:px-8 lg:px-10">

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">

          {/* BRAND */}
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-block text-2xl font-bold tracking-tight"
            >
              <span className="text-white">hire</span>
              <span className="text-blue-500">l</span>
              <span className="text-orange-500">oop</span>
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-7 text-gray-500">
              The AI-native career platform. Built for people
              who take their work seriously.
            </p>
          </div>

          {/* PRODUCT */}
          <div>
            <h3 className="text-sm font-medium text-indigo-400">
              Product
            </h3>

            <ul className="mt-6 space-y-4">
              {productLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-500 transition hover:text-white"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* NAVIGATION */}
          <div>
            <h3 className="text-sm font-medium text-indigo-400">
              Navigations
            </h3>

            <ul className="mt-6 space-y-4">
              {navigationLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-500 transition hover:text-white"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* RESOURCES */}
          <div>
            <h3 className="text-sm font-medium text-indigo-400">
              Resources
            </h3>

            <ul className="mt-6 space-y-4">
              {resourceLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-500 transition hover:text-white"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="mt-16 flex flex-col gap-8 border-t border-white/[0.06] pt-8 md:flex-row md:items-center md:justify-between">

          {/* Social / External Links */}
          <div className="flex items-center gap-3">

            {/* Website */}
            <Button
              isIconOnly
              as={Link}
              href="/"
              aria-label="Website"
              className="h-8 w-8 min-w-8 rounded-md bg-white/[0.06] text-gray-400 hover:bg-white/10 hover:text-white"
            >
              <LogoFacebook className="h-4 w-4" />
            </Button>

            {/* Contact */}
            <Button
              isIconOnly
              as={Link}
              href="/contact"
              aria-label="Contact"
              className="h-8 w-8 min-w-8 rounded-md bg-indigo-600 text-white hover:bg-indigo-500"
            >
              <LogoLinkedin className="h-4 w-4" />
            </Button>

            {/* About */}
            <Button
              isIconOnly
              as={Link}
              href="/about"
              aria-label="About"
              className="h-8 w-8 min-w-8 rounded-md bg-white/[0.06] text-gray-400 hover:bg-white/10 hover:text-white"
            >
              <LogoGithub className="h-4 w-4" />
            </Button>

          </div>

          {/* Copyright + Legal */}
          <div className="flex flex-col gap-3 text-sm text-gray-600 sm:flex-row sm:items-center sm:gap-6">

            <span>
              Copyright 2024 – Programming Hero
            </span>

            <Link
              href="/terms"
              className="transition hover:text-gray-400"
            >
              Terms & Policy
            </Link>

            <Link
              href="/privacy"
              className="transition hover:text-gray-400"
            >
              Privacy Guideline
            </Link>

          </div>

        </div>

      </div>
    </footer>
  );
}
