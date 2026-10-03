import { ShieldCheck } from "lucide-react";
import { MarketingPlaceholderPage } from "@/components/marketing/MarketingPlaceholderPage";

export default function WhyTrustUsPage() {
  return (
    <MarketingPlaceholderPage
      eyebrow="Our promise"
      icon={ShieldCheck}
      title="Why trust us"
      description="Learn how FixFit approaches safety, quality, and care at every step of a garment fix."
    />
  );
}
