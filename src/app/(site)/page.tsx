import IntroSequence from "@/components/IntroSequence";
import SectionDivider from "@/components/SectionDivider";
import WhySection from "@/components/WhySection";
import HowItWorks from "@/components/HowItWorks";
import ActivationSection from "@/components/ActivationSection";
import FinalCTA from "@/components/FinalCTA";

export default function Home() {
  return (
    <>
      <IntroSequence />
      <SectionDivider label="WHY REALNPC" />
      <WhySection />
      <SectionDivider label="HOW IT WORKS" />
      <HowItWorks />
      <SectionDivider label="AFTER ACTIVATION" />
      <ActivationSection />
      <FinalCTA />
    </>
  );
}
