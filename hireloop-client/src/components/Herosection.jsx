"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@heroui/react";
import {
  Briefcase,
  ChartColumn,
  Magnifier,
  MapPin,
  Star,
} from "@gravity-ui/icons";
import { animate, motion, MotionConfig, useInView } from "motion/react";
import { useRef } from "react";

const stats = [
  { icon: Briefcase, to: 50, suffix: "K", label: "Active Jobs" },
  { icon: ChartColumn, to: 12, suffix: "K", label: "Companies" },
  { icon: Magnifier, to: 2, suffix: "M", label: "Job Seekers" },
  { icon: Star, to: 97, suffix: "%", label: "Satisfaction Rate" },
];

const trending = ["Product Designer", "AI Engineering", "Dev-ops Engineer"];

/* ---------- Animation variants ---------- */
const ease = [0.22, 1, 0.36, 1]; // smooth "ease-out-expo" feel

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

const fadeDown = {
  hidden: { opacity: 0, y: -16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

const chipsContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const chip = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease } },
};

/* ---------- Count-up number (starts when scrolled into view) ---------- */
function CountUp({ to, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.8,
      ease: "easeOut",
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to]);

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}

export default function HeroSection() {
  return (
    // reducedMotion="user": animations are skipped for people who turned them off in their OS
    <MotionConfig reducedMotion="user">
      <section className="dark relative isolate min-h-screen w-full overflow-hidden bg-black">
        {/* Globe background: outer div = position + mask, inner div = animated image */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 bottom-0 -z-10 opacity-90 translate-y-24 sm:translate-y-100 2xl:translate-y-100 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]"
        >
          <motion.div
            initial={{ opacity: 0, scale: 1.12 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.8, ease }}
            className="absolute inset-0 bg-[url('/assets/globe.png')] bg-[length:900px_auto] bg-bottom bg-no-repeat sm:bg-[length:1400px_auto] 2xl:bg-[length:1800px_auto]"
          />
        </div>

        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-between px-4 pb-10 pt-28 sm:px-6 sm:pb-16 sm:pt-32 2xl:max-w-[1600px] 2xl:pb-24 2xl:pt-40">
          {/* ============ TOP: badge, heading, search ============ */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center text-center"
          >
            {/* Badge */}
            <motion.div
              variants={fadeDown}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur 2xl:px-6 2xl:py-3"
            >
              <Briefcase width={16} height={16} className="text-orange-400" />
              <span className="font-mono text-xs text-white 2xl:text-base">
                <span className="font-semibold">50,000+</span>{" "}
                <span className="uppercase tracking-wide text-white/50">
                  new jobs this month
                </span>
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={fadeUp}
              className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl 2xl:mt-8 2xl:text-8xl"
            >
              Find Your Dream Job Today
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              className="mt-4 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base 2xl:mt-6 2xl:max-w-3xl 2xl:text-xl"
            >
              HireLoop connects top talent with world-class companies. Browse
              thousands of curated opportunities and land your next role —
              faster.
            </motion.p>

            {/* Search bar (works without JS: submits to /jobs?q=...&location=...) */}
            <motion.form
              variants={fadeUp}
              action="/jobs"
              method="get"
              className="mt-8 flex w-full max-w-2xl flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur transition-colors focus-within:border-indigo-500/60 sm:flex-row sm:items-center 2xl:mt-12 2xl:max-w-4xl 2xl:p-3"
            >
              <label className="flex flex-1 items-center gap-3 px-3 py-2">
                <Magnifier width={18} height={18} className="text-white/70" />
                <input
                  type="text"
                  name="q"
                  placeholder="Job title, skill or company"
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none 2xl:text-lg"
                />
              </label>

              <div className="hidden h-6 w-px bg-white/10 sm:block" />

              <label className="flex flex-1 items-center gap-3 px-3 py-2">
                <MapPin width={18} height={18} className="text-white/70" />
                <input
                  type="text"
                  name="location"
                  placeholder="Location or Remote"
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none 2xl:text-lg"
                />
              </label>

              <motion.button
                type="submit"
                aria-label="Search jobs"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className="flex h-10 w-full items-center justify-center rounded-xl bg-indigo-500 text-white transition-colors hover:bg-indigo-400 sm:w-11 2xl:h-14 2xl:w-14"
              >
                <Magnifier width={18} height={18} />
              </motion.button>
            </motion.form>

            {/* Trending (chips pop in one by one) */}
            <motion.div
              variants={chipsContainer}
              className="mt-5 flex flex-wrap items-center justify-center gap-2 2xl:mt-8 2xl:gap-3"
            >
              <motion.span
                variants={chip}
                className="text-xs text-white/50 2xl:text-base"
              >
                Trending Position
              </motion.span>
              {trending.map((item) => (
                <motion.div
                  key={item}
                  variants={chip}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={`/jobs?q=${encodeURIComponent(item)}`}
                    className="block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 transition-colors hover:bg-white/10 2xl:px-5 2xl:py-2 2xl:text-base"
                  >
                    {item}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* ============ BOTTOM: tagline + stats ============ */}
          <div className="mt-24">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8, ease }}
              className="mx-auto mb-10 max-w-xl text-center text-2xl font-medium leading-snug text-white/70 sm:mb-16 sm:text-3xl md:text-4xl 2xl:mb-24 2xl:max-w-3xl 2xl:text-6xl"
            >
              Assisting over{" "}
              <span className="text-white">15,000 job seekers</span> find their
              dream positions.
            </motion.h2>

            <motion.div
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.12 } },
              }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 2xl:gap-6"
            >
              {stats.map(({ icon: Icon, to, suffix, label }) => (
                <motion.div
                  key={label}
                  variants={fadeUp}
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card className="rounded-2xl border border-white/10 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-none transition-colors hover:border-indigo-500/40">
                    <Card.Content className="gap-8 p-4 sm:gap-10 sm:p-5 2xl:gap-14 2xl:p-8">
                      <Icon
                        width={18}
                        height={18}
                        className="text-white/80 2xl:h-6 2xl:w-6"
                      />
                      <div>
                        <p className="text-4xl font-medium text-white sm:text-5xl 2xl:text-7xl">
                          <CountUp to={to} suffix={suffix} />
                        </p>
                        <p className="mt-2 text-xs text-white/60 sm:text-sm 2xl:text-lg">
                          {label}
                        </p>
                      </div>
                    </Card.Content>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}