"use client";

import Link from "next/link";
import { Card } from "@heroui/react";
import { ArrowRight, Briefcase, Clock, MapPin } from "@gravity-ui/icons";
import { motion, MotionConfig } from "motion/react";

const jobs = [
  {
    id: 1,
    title: "Frontend Developer",
    description:
      "Showcase your commitment to diversity and inclusion by highlighting initiatives.",
    location: "New York, USA",
    mode: "Hybrid",
    salary: "€25-€40/hour",
  },
  {
    id: 2,
    title: "Product Designer",
    description:
      "Showcase your commitment to diversity and inclusion by highlighting initiatives.",
    location: "Berlin, Germany",
    mode: "Remote",
    salary: "€30-€45/hour",
  },
  {
    id: 3,
    title: "Backend Engineer",
    description:
      "Showcase your commitment to diversity and inclusion by highlighting initiatives.",
    location: "London, UK",
    mode: "Hybrid",
    salary: "€35-€55/hour",
  },
  {
    id: 4,
    title: "Full Stack Developer",
    description:
      "Showcase your commitment to diversity and inclusion by highlighting initiatives.",
    location: "Toronto, Canada",
    mode: "On-site",
    salary: "€28-€42/hour",
  },
  {
    id: 5,
    title: "DevOps Engineer",
    description:
      "Showcase your commitment to diversity and inclusion by highlighting initiatives.",
    location: "Amsterdam, NL",
    mode: "Remote",
    salary: "€32-€50/hour",
  },
  {
    id: 6,
    title: "AI Engineer",
    description:
      "Showcase your commitment to diversity and inclusion by highlighting initiatives.",
    location: "San Francisco, USA",
    mode: "Hybrid",
    salary: "€40-€65/hour",
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
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease },
  },
};

function Tag({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 py-1 pl-1.5 pr-3 text-xs text-white/70 2xl:text-sm">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-purple-300">
        <Icon width={11} height={11} />
      </span>
      {children}
    </span>
  );
}

export default function JobsSection() {
  return (
    // reducedMotion="user": skips animations for people who turned them off in their OS
    <MotionConfig reducedMotion="user">
      <section className="dark relative w-full bg-black py-16 sm:py-24 2xl:py-32">
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
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-white/60 2xl:text-base"
            >
              <span className="h-1.5 w-1.5 bg-indigo-500" />
              Smart job discovery
              <span className="h-1.5 w-1.5 bg-indigo-500" />
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="mx-auto mt-4 max-w-xl text-3xl font-semibold leading-tight text-white sm:text-4xl 2xl:max-w-3xl 2xl:text-6xl"
            >
              The roles you&apos;d never find by searching
            </motion.h2>
          </motion.div>

          {/* Cards (appear one by one as you scroll) */}
          <motion.div
            variants={gridContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="mt-10 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3 2xl:mt-20 2xl:gap-6"
          >
            {jobs.map((job) => (
              <motion.div
                key={job.id}
                variants={cardVariant}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
              >
                <Card className="group h-full rounded-2xl border border-white/10 bg-[#161616] shadow-none transition-colors hover:border-indigo-500/40 hover:bg-[#1b1b1b]">
                  <Card.Content className="gap-5 p-5 sm:p-6 2xl:gap-7 2xl:p-8">
                    <div>
                      <h3 className="text-lg font-medium text-white 2xl:text-3xl">
                        {job.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/50 2xl:mt-3 2xl:text-lg">
                        {job.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Tag icon={MapPin}>{job.location}</Tag>
                      <Tag icon={Briefcase}>{job.mode}</Tag>
                      <Tag icon={Clock}>{job.salary}</Tag>
                    </div>

                    <Link
                      href={`/jobs/${job.id}`}
                      className="inline-flex w-fit items-center gap-2 text-sm font-medium text-white transition-colors group-hover:text-indigo-300 2xl:text-lg"
                    >
                      Apply Now
                      <ArrowRight
                        width={14}
                        height={14}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </Link>
                  </Card.Content>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* View all */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 0.6, ease }}
            className="mt-10 flex justify-center 2xl:mt-16"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
              <Link
                href="/jobs"
                className="block rounded-xl bg-white px-6 py-2.5 text-sm font-medium text-black transition-colors hover:bg-white/90 2xl:px-10 2xl:py-4 2xl:text-lg"
              >
                View all job open
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  );
}