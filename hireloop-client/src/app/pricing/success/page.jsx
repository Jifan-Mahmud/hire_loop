import Link from "next/link";
import { CircleCheck, ArrowRight, Sparkles } from "@gravity-ui/icons";
import { stripe } from "@/lib/stripe";

export const metadata = {
  title: "Subscription Confirmed | HireLoop",
  description: "Thank you for upgrading your HireLoop subscription.",
};

const PLAN_INFO = {
  'seeker-pro': {
    name: 'Pro Plan',
    role: 'Job Seeker',
    badge: '30 Applications / month',
    features: [
      'Apply to up to 30 jobs per month',
      'Unlimited saved jobs',
      'Application tracking',
      'Salary insights',
    ],
  },
  'seeker-premium': {
    name: 'Premium Plan',
    role: 'Job Seeker',
    badge: 'Unlimited Applications',
    features: [
      'Unlimited applications',
      'Profile boost to recruiters',
      'Early access to new jobs',
      'Priority support',
    ],
  },
  'recruiter-growth': {
    name: 'Growth Plan',
    role: 'Recruiter',
    badge: 'Up to 10 Active Jobs',
    features: [
      'Up to 10 active job posts',
      'Applicant tracking system (ATS)',
      'Basic analytics',
      'Email support',
    ],
  },
  'recruiter-enterprise': {
    name: 'Enterprise Plan',
    role: 'Recruiter',
    badge: 'Up to 50 Active Jobs',
    features: [
      'Up to 50 active job posts',
      'Advanced analytics dashboard',
      'Featured job listings',
      'Team collaboration',
    ],
  },
};

export default async function PricingSuccessPage({ searchParams }) {
  const params = await searchParams;
  const sessionId = params?.session_id;

  let planId = "seeker-pro";

  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      planId = session.metadata?.planId || "seeker-pro";
      const userEmail = session.metadata?.userEmail || session.customer_details?.email;

      if (userEmail) {
        // Activate plan in backend database
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        await fetch(`${apiUrl}/api/users/upgrade-plan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail,
            planId: planId,
            sessionId: session.id,
          }),
        }).catch((err) => console.warn('Upgrade API call note:', err.message));
      }
    } catch (err) {
      console.warn("Stripe session retrieve note:", err.message);
    }
  }

  const currentPlan = PLAN_INFO[planId] || PLAN_INFO['seeker-pro'];

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/15 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-emerald-600/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="relative z-10 max-w-lg w-full bg-[#121215] border border-white/10 rounded-3xl p-8 sm:p-10 text-center shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 text-emerald-400 shadow-inner">
          <CircleCheck width={34} height={34} />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300 mb-3">
          <Sparkles width={13} height={13} className="text-purple-400" />
          <span>Payment Successful • {currentPlan.name} Activated</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Welcome to {currentPlan.name}!
        </h1>

        <p className="mt-3 text-sm text-neutral-300 leading-relaxed">
          Your payment was processed successfully. All included features and quotas for your account have been unlocked immediately!
        </p>

        {/* Unlocked Features Box */}
        <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-5 text-left space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block mb-1">
            Active Features & Quotas
          </span>
          {currentPlan.features.map((feat, idx) => (
            <div key={idx} className="flex items-center gap-2.5 text-xs text-neutral-200">
              <CircleCheck width={14} height={14} className="text-emerald-400 shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-3">
          <Link
            href={currentPlan.role === "Job Seeker" ? "/jobs" : "/deshboard/recruiter"}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-xl shadow-purple-600/30 transition-all"
          >
            <span>{currentPlan.role === "Job Seeker" ? "Start Applying for Jobs" : "Go to Recruiter Dashboard"}</span>
            <ArrowRight width={16} height={16} />
          </Link>

          <Link
            href="/jobs"
            className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl font-medium text-xs sm:text-sm text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            Browse All Jobs
          </Link>
        </div>
      </div>
    </main>
  );
}
