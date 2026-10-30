import CTASection from "@/components/CTASection";
import FeaturesSection from "@/components/FeaturesSection";
import HeroSection from "@/components/Herosection";
import JobsSection from "@/components/JobsSection";
import PricingSection from "@/components/PricingSection";
import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-zinc-50 font-sans dark:bg-black">
      <HeroSection></HeroSection>
      <JobsSection></JobsSection>
      <FeaturesSection></FeaturesSection>
      <PricingSection></PricingSection>
      <CTASection></CTASection>
    </div>
  );
}
