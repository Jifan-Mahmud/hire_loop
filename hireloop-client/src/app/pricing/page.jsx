import PricingSection from "@/components/PricingSection";

export const metadata = {
  title: "Pricing Plans | HireLoop",
  description: "Explore flexible plans for Job Seekers and Recruiters on HireLoop. Start free with $0/forever.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-black text-white pt-20">
      <PricingSection />
    </main>
  );
}
