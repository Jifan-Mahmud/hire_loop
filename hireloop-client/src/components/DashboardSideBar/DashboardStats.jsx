"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, MotionConfig, useInView } from "motion/react";


/* ---------- Default data (pass your own with the `stats` prop) ---------- */


/* ---------- Component ---------- */
// Usage: <DashboardStats />  or  <DashboardStats stats={[{ icon, label, value }]} />
export default function DashboardStats({ defaultStats }) {
    

/* ---------- Animation variants ---------- */
const ease = [0.22, 1, 0.36, 1];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease } },
};

/* ---------- Count-up number (1,284 style, starts when visible) ---------- */
function CountUp({ to }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to]);

  return <span ref={ref}>{value.toLocaleString("en-US")}</span>;
}
  return (
    // reducedMotion="user": skips animations for people who turned them off in their OS
    <MotionConfig reducedMotion="user">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="dark grid grid-cols-1 md:grid-cols-2 sm:grid-cols-4 xl:grid-cols-4 gap-4 p-5"
      >
        {defaultStats.map(({ icon: Icon, label, value }) => (
          <motion.div
            key={label}
            variants={cardVariant}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="group rounded-2xl border border-white/10 bg-gradient-to-b from-[#1d1d1d] to-[#171717] p-5 transition-colors hover:border-white/20 "
          >
            {/* Icon box */}
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white/90 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
              <Icon className="size-5" />
            </div>

            {/* Label + value */}
            <p className="mt-8 text-sm text-white/60">{label}</p>
            <p className="mt-2 text-2xl font-medium text-white">
              <CountUp to={value} />
            </p>
          </motion.div>
        ))}
      </motion.div>
    </MotionConfig>
  );
}