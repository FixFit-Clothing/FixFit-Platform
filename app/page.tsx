import { Hero } from "@/components/home/Hero";
import { CorePromise } from "@/components/home/CorePromise";
import { CustomerTestimonials } from "@/components/home/CustomerTestimonials";
import { FixFitGuarantee } from "@/components/home/FixFitGuarantee";
import { HowItWorks } from "@/components/home/HowItWorks";
import { RealResults } from "@/components/home/RealResults";
import { TrustBanner } from "@/components/home/TrustBanner";
import { WhereWeOperate } from "@/components/home/WhereWeOperate";
import { WhyTrustUs } from "@/components/home/WhyTrustUs";

export default function Home() {
  return (
    <main>
      <Hero />
      <CorePromise />
      <FixFitGuarantee />
      <TrustBanner />
      <WhyTrustUs />
      <RealResults />
      <HowItWorks />
      <WhereWeOperate />
      <CustomerTestimonials />
    </main>
  );
}
