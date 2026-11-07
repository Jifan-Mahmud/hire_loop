"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Check,
  ChevronDown,
  CircleCheck,
  CircleQuestion,
  Person,
  Rocket,
  Sparkles,
  Star,
  Xmark,
} from "@gravity-ui/icons";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import { useSession } from "@/lib/auth-client";

// ==========================================
// PLANS DATA DEFINITIONS
// ==========================================
const JOB_SEEKER_PLANS = [
  {
    id: "seeker-free",
    name: "Free",
    price: "$0",
    period: "/forever",
    badge: "Free Forever",
    tagline: "Ideal for exploring verified positions and starting your job search.",
    features: [
      { text: "Browse & save up to 10 jobs", included: true },
      { text: "Apply to up to 3 jobs per month", included: true, highlight: true },
      { text: "Basic candidate profile", included: true },
      { text: "Real-time email alerts", included: true },
    ],
    ctaText: "Get Started Free",
    isFree: true,
    popular: false,
  },
  {
    id: "seeker-pro",
    name: "Pro",
    price: "$19",
    period: "/month",
    badge: "Most Popular",
    tagline: "For active job seekers accelerating their interview pipeline.",
    features: [
      { text: "Apply to up to 30 jobs per month", included: true, highlight: true },
      { text: "Unlimited saved jobs", included: true },
      { text: "Application tracking & status history", included: true },
      { text: "Verified salary insights & benchmarks", included: true },
      { text: "Real-time email & SMS job alerts", included: true },
    ],
    ctaText: "Choose Pro",
    isFree: false,
    popular: true,
  },
  {
    id: "seeker-premium",
    name: "Premium",
    price: "$39",
    period: "/month",
    badge: "Top Priority",
    tagline: "Maximum visibility and priority placement to premier hiring teams.",
    features: [
      { text: "Everything in Pro included", included: true },
      { text: "Unlimited job applications", included: true, highlight: true },
      { text: "Profile boost directly to recruiters", included: true },
      { text: "Early access to newly posted jobs (24h head-start)", included: true },
      { text: "Dedicated priority support & review", included: true },
    ],
    ctaText: "Choose Premium",
    isFree: false,
    popular: false,
  },
];

const RECRUITER_PLANS = [
  {
    id: "recruiter-free",
    name: "Free",
    price: "$0",
    period: "/forever",
    badge: "Starter",
    tagline: "Great for a company's first year of hiring and early-stage startups.",
    features: [
      { text: "Up to 3 active job posts", included: true, highlight: true },
      { text: "Basic applicant management", included: true },
      { text: "Standard listing visibility", included: true },
      { text: "Email notifications for new applicants", included: true },
    ],
    ctaText: "Start Hiring Free",
    isFree: true,
    popular: false,
  },
  {
    id: "recruiter-growth",
    name: "Growth",
    price: "$49",
    period: "/month",
    badge: "Growing Teams",
    tagline: "Scale your recruiting pipeline with deeper analytics and tracking.",
    features: [
      { text: "Up to 10 active job posts", included: true, highlight: true },
      { text: "Applicant tracking system (ATS)", included: true },
      { text: "Basic hiring & view analytics", included: true },
      { text: "Standard email support (24h response)", included: true },
      { text: "Custom applicant qualification filters", included: true },
    ],
    ctaText: "Choose Growth",
    isFree: false,
    popular: true,
  },
  {
    id: "recruiter-enterprise",
    name: "Enterprise",
    price: "$149",
    period: "/month",
    badge: "Full Scale",
    tagline: "Comprehensive talent acquisition suite for high-volume hiring teams.",
    features: [
      { text: "Up to 50 active job posts", included: true, highlight: true },
      { text: "Advanced analytics dashboard & metrics", included: true },
      { text: "Featured job listings (top search ranking)", included: true },
      { text: "Team collaboration & multi-recruiter seats", included: true },
      { text: "Custom employer branding & company page", included: true },
      { text: "Dedicated priority support & account manager", included: true },
    ],
    ctaText: "Choose Enterprise",
    isFree: false,
    popular: false,
  },
];

// ==========================================
// FAQ ACCORDION DATA
// ==========================================
const FAQS = [
  {
    id: "cancellation",
    question: "How does plan cancellation work?",
    answer:
      "You can cancel your subscription at any time with a single click from your account dashboard. Once cancelled, you will retain complete access to all paid features until the conclusion of your current billing cycle, after which your account automatically reverts to the Free Plan without any penalties or unexpected charges.",
  },
  {
    id: "refunds",
    question: "What is your refund policy?",
    answer:
      "We provide a 14-day hassle-free money-back guarantee for all newly upgraded subscriptions. If HireLoop does not fulfill your expectations or hiring goals, simply reach out to our support team within 14 days of upgrade and we will issue a full, prompt refund to your original payment method.",
  },
  {
    id: "payment-methods",
    question: "What payment methods do you accept?",
    answer:
      "We accept all major global credit and debit cards, including Visa, MasterCard, and American Express, as well as digital wallets such as Apple Pay and Google Pay. All payment transactions are encrypted with bank-grade 256-bit SSL security.",
  },
  {
    id: "plan-switching",
    question: "Can I switch between plans or upgrade later?",
    answer:
      "Yes, you can easily upgrade, downgrade, or switch between plans at any time. When upgrading, your increased application limits or active job posting quotas take effect immediately. Any unused balance from your previous plan is automatically prorated towards your new billing cycle.",
  },
  {
    id: "free-plan-duration",
    question: "Is the Free Plan truly free forever?",
    answer:
      "Yes! Both the Job Seeker Free Plan ($0/forever) and the Recruiter Free Plan ($0/forever) are genuinely 100% free with no time limits and no credit card required. You can use HireLoop's free features indefinitely as long as you stay within the plan's quota.",
  },
];

export default function PricingSection() {
  const [audience, setAudience] = useState("seeker"); // 'seeker' | 'recruiter'
  const [openFaq, setOpenFaq] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPaidPlan, setSelectedPaidPlan] = useState(null);

  const { data: session } = useSession();
  const user = session?.user;

  const currentPlans = audience === "seeker" ? JOB_SEEKER_PLANS : RECRUITER_PLANS;

  const toggleFaq = (id) => {
    setOpenFaq((prev) => (prev === id ? null : id));
  };

  const handlePaidPlanClick = (plan) => {
    setSelectedPaidPlan(plan);
    setModalOpen(true);
  };

  return (
    <MotionConfig reducedMotion="user">
      <section
        id="pricing"
        className="dark relative w-full bg-black py-20 sm:py-28 overflow-hidden text-white"
      >
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[750px] h-[400px] bg-purple-600/10 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-10 right-10 w-[350px] h-[350px] bg-blue-600/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* =========================================================
              SECTION HEADER
             ========================================================= */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300 mb-5 shadow-inner">
              <Sparkles width={14} height={14} className="text-purple-400" />
              <span>Transparent, Predictable Plans</span>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Simple Pricing for{" "}
              <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent">
                Every Career Stage
              </span>
            </h2>

            <p className="mt-4 text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              Whether you are an ambitious job seeker aiming for your next high-impact role or a company hiring top tech talent, we have a plan tailored for you.
            </p>

            {/* =========================================================
                AUDIENCE TOGGLE: JOB SEEKER vs RECRUITER
               ========================================================= */}
            <div className="mt-10 inline-flex items-center rounded-2xl border border-white/10 bg-[#141414] p-1.5 shadow-2xl backdrop-blur-md">
              <button
                type="button"
                onClick={() => setAudience("seeker")}
                className={`relative flex items-center gap-2 rounded-xl px-5 sm:px-7 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                  audience === "seeker"
                    ? "text-white shadow-lg"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {audience === "seeker" && (
                  <motion.span
                    layoutId="audience-pill"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 shadow-purple-600/30"
                  />
                )}
                <Person width={16} height={16} className="relative z-10" />
                <span className="relative z-10">For Job Seekers</span>
              </button>

              <button
                type="button"
                onClick={() => setAudience("recruiter")}
                className={`relative flex items-center gap-2 rounded-xl px-5 sm:px-7 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                  audience === "recruiter"
                    ? "text-white shadow-lg"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {audience === "recruiter" && (
                  <motion.span
                    layoutId="audience-pill"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 shadow-purple-600/30"
                  />
                )}
                <Briefcase width={16} height={16} className="relative z-10" />
                <span className="relative z-10">For Recruiters & Companies</span>
              </button>
            </div>
          </div>

          {/* =========================================================
              PRICING CARDS GRID
             ========================================================= */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {currentPlans.map((plan) => {
              const isHighlight = plan.popular;

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col justify-between rounded-3xl p-6 sm:p-8 transition-all duration-300 ${
                    isHighlight
                      ? "border-2 border-purple-500/80 bg-gradient-to-b from-[#1c182a] via-[#141220] to-[#0d0d12] shadow-2xl shadow-purple-900/30 lg:-translate-y-2"
                      : "border border-white/10 bg-[#121212] hover:border-white/20 hover:bg-[#151515]"
                  }`}
                >
                  {/* Popular Badge */}
                  {isHighlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30 uppercase tracking-wider">
                        <Sparkles width={12} height={12} />
                        <span>{plan.badge}</span>
                      </span>
                    </div>
                  )}

                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white">
                          {plan.name}
                        </h3>
                        {!isHighlight && (
                          <span className="text-[11px] font-semibold text-neutral-400">
                            {plan.badge}
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="flex items-baseline justify-end gap-1">
                          <span className="text-3xl sm:text-4xl font-extrabold text-white">
                            {plan.price}
                          </span>
                          <span className="text-xs text-neutral-400 font-medium">
                            {plan.period}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tagline */}
                    <p className="mt-4 text-xs sm:text-sm text-neutral-400 leading-relaxed min-h-[40px]">
                      {plan.tagline}
                    </p>

                    {/* Features List */}
                    <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-2">
                        Included Features
                      </span>

                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              feature.highlight
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                : "bg-white/10 text-neutral-300"
                            }`}
                          >
                            <Check width={12} height={12} />
                          </div>
                          <span
                            className={
                              feature.highlight
                                ? "text-white font-semibold"
                                : "text-neutral-300"
                            }
                          >
                            {feature.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="mt-8 pt-6 border-t border-white/10">
                    {plan.isFree ? (
                      <Link
                        href={
                          audience === "seeker"
                            ? user
                              ? "/jobs"
                              : "/signup?role=seeker"
                            : user?.role === "recruiter"
                            ? "/deshboard/recruiter"
                            : "/signup?role=recruiter"
                        }
                        className={`w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
                          isHighlight
                            ? "bg-white text-black hover:bg-neutral-200 shadow-xl"
                            : "bg-white/10 hover:bg-white/15 text-white"
                        }`}
                      >
                        <span>{plan.ctaText}</span>
                        <ArrowRight width={14} height={14} />
                      </Link>
                    ) : (
                      <form action="/api/checkout_sessions" method="POST" className="w-full">
                        <input type="hidden" name="planId" value={plan.id} />
                        <input type="hidden" name="userEmail" value={user?.email || ""} />
                        <section>
                          <button
                            type="submit"
                            role="link"
                            className={`w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
                              isHighlight
                                ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-xl shadow-purple-600/30 hover:scale-[1.01] active:scale-[0.99]"
                                : "bg-white/10 hover:bg-white/15 text-white"
                            }`}
                          >
                            <span>{plan.ctaText}</span>
                            <ArrowRight width={14} height={14} />
                          </button>
                        </section>
                      </form>
                    )}

                    <p className="text-center text-[11px] text-neutral-500 mt-2.5">
                      {plan.isFree ? "No credit card needed" : "Cancel anytime guarantee"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* =========================================================
              FAQ ACCORDION SECTION
             ========================================================= */}
          <div className="mt-24 max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-neutral-300 mb-3">
                <CircleQuestion width={14} height={14} className="text-purple-400" />
                <span>Frequently Asked Questions</span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
                Everything You Need to Know
              </h3>
              <p className="mt-2 text-sm text-neutral-400">
                Got questions about subscriptions, billing, cancellation, or our Free Plan?
              </p>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq) => {
                const isOpen = openFaq === faq.id;

                return (
                  <div
                    key={faq.id}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isOpen
                        ? "border-purple-500/40 bg-[#161616] shadow-xl shadow-purple-500/5"
                        : "border-white/10 bg-[#121212] hover:border-white/20"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full flex items-center justify-between p-5 sm:p-6 text-left transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span className="text-sm sm:text-base font-semibold text-white pr-4">
                        {faq.question}
                      </span>
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 ${
                          isOpen
                            ? "bg-purple-600 text-white rotate-180"
                            : "bg-white/10 text-neutral-400"
                        }`}
                      >
                        <ChevronDown width={14} height={14} />
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-white/5">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* =========================================================
            PAID PLAN IN-PROGRESS / INFO MODAL
            (As per user instruction: no payment gateway integration for now)
           ========================================================= */}
        <AnimatePresence>
          {modalOpen && selectedPaidPlan && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-md rounded-3xl border border-purple-500/30 bg-[#141414] p-6 sm:p-8 text-center text-white shadow-2xl overflow-hidden"
              >
                {/* Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-purple-600/20 blur-[60px] pointer-events-none rounded-full" />

                {/* Close Button */}
                <button
                  onClick={() => setModalOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/15 text-neutral-400 hover:text-white transition-colors"
                >
                  <Xmark width={16} height={16} />
                </button>

                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-5 text-purple-400 shadow-inner">
                  <Rocket width={26} height={26} />
                </div>

                <span className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300 mb-2">
                  {selectedPaidPlan.name} Plan • {selectedPaidPlan.price}
                  {selectedPaidPlan.period}
                </span>

                <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  Online Checkout Coming Soon
                </h3>

                <p className="mt-3 text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  We are currently integrating automated billing and payment processing. In the meantime, you can explore and enjoy all features of our <strong>Free Plan ($0/forever)</strong> at zero cost!
                </p>

                <div className="mt-6 pt-5 border-t border-white/10 flex flex-col gap-2.5">
                  <Link
                    href={audience === "seeker" ? "/jobs" : "/deshboard/recruiter"}
                    onClick={() => setModalOpen(false)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-purple-600/30"
                  >
                    Continue with Free Plan
                  </Link>

                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-300 hover:text-white font-medium text-xs sm:text-sm transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </section>
    </MotionConfig>
  );
}
