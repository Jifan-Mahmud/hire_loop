"use client";

import Link from "next/link";
import { motion, MotionConfig } from "motion/react";

const ease = [0.22, 1, 0.36, 1];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

export default function CTASection() {
  return (
    // reducedMotion="user": skips animations for people who turned them off in their OS
    <MotionConfig reducedMotion="user">
      <section className="dark relative isolate w-full overflow-hidden bg-black py-28 sm:py-40 2xl:py-56">
        {/* Background: outer div = mask, inner div = image that fades + settles in */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]"
        >
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.6, ease }}
            className="absolute inset-0 bg-[url('/assets/cta-bg.png')] bg-[length:1000px_auto] bg-top bg-no-repeat sm:bg-[length:1600px_auto] 2xl:bg-[length:2400px_auto]"
          />
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 text-center sm:px-6 2xl:max-w-5xl"
        >
          <motion.h2
            variants={fadeUp}
            className="text-3xl font-medium leading-tight text-white sm:text-5xl 2xl:text-7xl"
          >
            Your next role is already looking for you
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mt-4 max-w-md text-sm text-white/60 sm:max-w-none sm:text-base 2xl:mt-8 2xl:text-2xl"
          >
            Build a profile in three minutes. The matches start arriving
            tomorrow morning.
          </motion.p>

          <motion.div
            variants={container}
            className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:mt-10 sm:w-auto sm:flex-row 2xl:mt-16 2xl:gap-5"
          >
            <motion.div
              variants={fadeUp}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="w-full sm:w-auto"
            >
              <Link
                href="/register"
                className="flex h-11 w-full items-center justify-center rounded-lg bg-white px-5 text-sm font-medium text-black transition-colors hover:bg-white/90 sm:w-auto 2xl:h-16 2xl:px-8 2xl:text-xl"
              >
                Create a free account
              </Link>
            </motion.div>
            <motion.div
              variants={fadeUp}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="w-full sm:w-auto"
            >
              <Link
                href="#pricing"
                className="flex h-11 w-full items-center justify-center rounded-lg border border-white/10 bg-black/40 px-5 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/10 sm:w-auto 2xl:h-16 2xl:px-8 2xl:text-xl"
              >
                View pricing
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
    </MotionConfig>
  );
}