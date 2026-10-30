"use client";

import {
  ArrowUpRight,
  Bookmark,
  ChartColumn,
  ChartLine,
  Check,
  FileText,
  Magnifier,
  Star,
} from "@gravity-ui/icons";
import { motion, MotionConfig } from "motion/react";

const features = [
  {
    icon: Magnifier,
    title: "Smart Search",
    description: "Find your ideal job with advanced filters.",
  },
  {
    icon: ChartLine,
    title: "Salary Insights",
    description: "Get real salary data to negotiate confidently.",
  },
  {
    icon: ChartColumn,
    title: "Top Companies",
    description: "Apply to vetted companies that are hiring.",
  },
  {
    icon: Bookmark,
    title: "Saved Jobs",
    description: "Manage apps & favorites on your dashboard.",
  },
  {
    icon: Check,
    title: "One-Click Apply",
    description: "Simplify your job applications for an easier process!",
  },
  {
    icon: FileText,
    title: "Resume Builder",
    description: "Create professional resumes with modern templates.",
  },
  {
    icon: Star,
    title: "Skill-Based Matching",
    description: "Discover jobs that match your skills and experience.",
  },
  {
    icon: ArrowUpRight,
    title: "Career Growth Resources",
    description: "Boost your career with quick interview tips.",
  },
];

/* ---------- Animation variants ---------- */
const ease = [0.22, 1, 0.36, 1];

const headingContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

const gridContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

const itemVariant = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

const iconVariant = {
  hidden: { opacity: 0, scale: 0.6, rotate: -12 },
  show: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 260, damping: 18 },
  },
};

export default function FeaturesSection() {
  return (
    // reducedMotion="user": skips animations for people who turned them off in their OS
    <MotionConfig reducedMotion="user">
      <section className="dark relative w-full bg-[#141414] py-16 sm:py-24 2xl:py-32">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 2xl:max-w-[1600px]">
          {/* Heading */}
          <motion.div
            variants={headingContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.5 }}
            className="text-center"
          >
            <motion.p
              variants={fadeUp}
              className="inline-flex items-center gap-3 font-mono text-sm uppercase tracking-widest text-white/70 2xl:text-lg"
            >
              <span className="h-2 w-2 bg-indigo-500" />
              Features Job
              <span className="h-2 w-2 bg-indigo-500" />
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="mx-auto mt-4 max-w-md text-4xl font-medium leading-tight text-white sm:text-5xl 2xl:max-w-2xl 2xl:text-7xl"
            >
              Everything you need to succeed
            </motion.h2>
          </motion.div>

          {/* Features grid (items appear one by one as you scroll) */}
          <motion.div
            variants={gridContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4 2xl:mt-24 2xl:gap-y-16"
          >
            {features.map(({ icon: Icon, title, description }) => (
              <motion.div
                key={title}
                variants={itemVariant}
                whileHover="hover"
                className="group flex items-start gap-4 2xl:gap-6"
              >
                {/* Icon box: pops in, then lifts and tilts on hover */}
                <motion.div
                  variants={iconVariant}
                  whileHover={{ y: -4, rotate: 4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-b from-black to-[#141414] shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset] transition-colors group-hover:border-purple-400/40 sm:h-16 sm:w-16 2xl:h-24 2xl:w-24 2xl:rounded-2xl"
                >
                  <Icon
                    width={26}
                    height={26}
                    className="text-purple-300 2xl:h-10 2xl:w-10"
                  />
                </motion.div>

                {/* Text */}
                <div>
                  <h3 className="text-base font-medium text-white 2xl:text-2xl">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/50 transition-colors group-hover:text-white/70 2xl:mt-3 2xl:text-xl">
                    {description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  );
}