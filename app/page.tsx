import { Hero } from "@/components/home/Hero";
import { CorePromise } from "@/components/home/CorePromise";
import { FixFitGuarantee } from "@/components/home/FixFitGuarantee";
import { HowItWorks } from "@/components/home/HowItWorks";
import { TrustBanner } from "@/components/home/TrustBanner";

export default function Home() {
  return (
    <main>
      <Hero />
      <CorePromise />
      <FixFitGuarantee />
      <TrustBanner />
      <HowItWorks />
    </main>
  );
}
