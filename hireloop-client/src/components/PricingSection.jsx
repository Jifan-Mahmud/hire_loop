"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChartColumn, Person, Plus, Star } from "@gravity-ui/icons";
import { AnimatePresence, motion, MotionConfig } from "motion/react";

const YEARLY_DISCOUNT = 0.25; // 25% off

const plans = [
  {
    id: "starter",
    name: "Starter",
    icon: Person,
    price: 0,
    intro: "Start building your insights hub:",
    features: [
      "Daily AI match brief (top 5)",
      "Verified salary bands",
      "Company insight dashboards",
      "1-click apply, unlimited",
    ],
    highlighted: false,
  },
  {
    id: "growth",
    name: "Growth",
    icon: ChartColumn,
    price: 17,
    intro: "Start building your insights hub:",
    features: [
      "Daily AI match brief (top 5)",
      "Verified salary bands",
      "Company insight dashboards",
      "1-click apply, unlimited",
    ],
    highlighted: true,
  },
  {
    id: "premium",
    name: "Premium",
    icon: Star,
    price: 99,
    intro: "Start building your insights hub:",
    features: [
      "Everything in Pro",
      "Multi-profile career portfolios",
      "Shared talent rooms",
      "Recruiter view (read-only)",
    ],
    highlighted: false,
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
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

// Card appears, then its feature rows appear one by one (children inherit the "show" state)
const cardVariant = {
  hidden: { opacity: 0, y: 50, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease,
      staggerChildren: 0.08,
      delayChildren: 0.35,
    },
  },
};

const featureRow = {
  hidden: { opacity: 0, x: -14 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease } },
};

export default function PricingSection() {
  const [yearly, setYearly] = useState(false);

  const getPrice = (price) =>
    yearly ? Math.round(price * (1 - YEARLY_DISCOUNT)) : price;

  return (
    // reducedMotion="user": skips animations for people who turned them off in their OS
    <MotionConfig reducedMotion="user">
      <section
        id="pricing"
        className="dark relative w-full bg-black py-16 sm:py-24 2xl:py-32"
      >
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
              Pricing
              <span className="h-1.5 w-1.5 bg-indigo-500" />
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="mx-auto mt-4 max-w-md text-3xl font-semibold leading-tight text-white sm:text-4xl 2xl:max-w-2xl 2xl:text-6xl"
            >
              Pay for the leverage, not the listings
            </motion.h2>

            {/* Monthly / Yearly toggle (white pill slides between the two) */}
            <motion.div
              variants={fadeUp}
              role="tablist"
              aria-label="Billing period"
              className="mx-auto mt-8 inline-flex items-center rounded-full border border-white/10 bg-[#161616] p-1 2xl:mt-12"
            >
              <button
                type="button"
                role="tab"
                aria-selected={!yearly}
                onClick={() => setYearly(false)}
                className={`relative rounded-full px-5 py-1.5 text-sm transition-colors 2xl:px-8 2xl:py-2.5 2xl:text-lg ${
                  !yearly ? "font-medium text-black" : "text-white/70 hover:text-white"
                }`}
              >
                {!yearly && (
                  <motion.span
                    layoutId="billing-pill"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-white"
                  />
                )}
                <span className="relative z-10">Monthly</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={yearly}
                onClick={() => setYearly(true)}
                className={`relative flex items-center gap-2 rounded-full px-5 py-1.5 text-sm transition-colors 2xl:px-8 2xl:py-2.5 2xl:text-lg ${
                  yearly ? "font-medium text-black" : "text-white/70 hover:text-white"
                }`}
              >
                {yearly && (
                  <motion.span
                    layoutId="billing-pill"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-white"
                  />
                )}
                <span className="relative z-10">Yearly</span>
                <motion.span
                  animate={{ scale: yearly ? [1, 1.25, 1] : 1 }}
                  transition={{ duration: 0.4 }}
                  className="relative z-10 rounded-full bg-fuchsia-600 px-2 py-0.5 text-[10px] font-semibold text-white 2xl:text-sm"
                >
                  25%
                </motion.span>
              </button>
            </motion.div>
          </motion.div>

          {/* Plans */}
          <motion.div
            variants={gridContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-10 grid grid-cols-1 gap-4 sm:mt-14 lg:grid-cols-3 2xl:mt-20 2xl:gap-6"
          >
            {plans.map((plan) => {
              const Icon = plan.icon;
              const price = getPrice(plan.price);
              return (
                <motion.div
                  key={plan.id}
                  variants={cardVariant}
                  whileHover={{ y: -8 }}
                  className={`flex flex-col rounded-2xl border p-5 transition-colors sm:p-6 2xl:p-8 ${
                    plan.highlighted
                      ? "border-white/15 bg-[#1c1c1c] hover:border-indigo-400/50"
                      : "border-white/10 bg-black hover:border-white/25"
                  }`}
                >
                  {/* Plan name + price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-fuchsia-300 2xl:h-12 2xl:w-12">
                        <Icon width={16} height={16} className="2xl:h-6 2xl:w-6" />
                      </span>
                      <span className="text-base text-white/90 2xl:text-2xl">
                        {plan.name}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      {/* Price flips smoothly when you switch Monthly / Yearly */}
                      <span className="relative inline-flex overflow-hidden text-3xl font-semibold text-white sm:text-4xl 2xl:text-6xl">
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.span
                            key={price}
                            initial={{ y: 22, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -22, opacity: 0 }}
                            transition={{ duration: 0.22 }}
                            className="inline-block"
                          >
                            ${price}
                          </motion.span>
                        </AnimatePresence>
                      </span>
                      <span className="text-xs text-white/50 2xl:text-lg">
                        /month
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <p className="mt-8 text-sm text-white/80 2xl:mt-12 2xl:text-xl">
                    {plan.intro}
                  </p>
                  <ul className="mt-4 flex flex-1 flex-col gap-3 2xl:mt-6 2xl:gap-5">
                    {plan.features.map((feature) => (
                      <motion.li
                        key={feature}
                        variants={featureRow}
                        className="flex items-center gap-3 text-sm text-white/50 2xl:text-xl"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-white/10 text-white/70 2xl:h-7 2xl:w-7">
                          <Plus width={12} height={12} />
                        </span>
                        {feature}
                      </motion.li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="mt-10 2xl:mt-16"
                  >
                    <Link
                      href={`/register?plan=${plan.id}&billing=${yearly ? "yearly" : "monthly"}`}
                      className={`group flex h-11 items-center justify-between rounded-lg px-4 text-sm font-medium transition-colors 2xl:h-16 2xl:px-6 2xl:text-xl ${
                        plan.highlighted
                          ? "bg-white text-black hover:bg-white/90"
                          : "bg-[#2a2a2a] text-white hover:bg-[#333]"
                      }`}
                    >
                      Choose This Plan
                      <ArrowRight
                        width={14}
                        height={14}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </Link>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  );
}