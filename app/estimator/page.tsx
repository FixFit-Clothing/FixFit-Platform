import { Calculator } from "lucide-react";
import { MarketingPlaceholderPage } from "@/components/marketing/MarketingPlaceholderPage";

export default function EstimatorPage() {
  return (
    <MarketingPlaceholderPage
      eyebrow="Plan your fix"
      icon={Calculator}
      title="Fix estimator"
      description="Tell us about your garment and the repair you need. This page will guide you through the details needed to prepare your estimate."
    />
  );
}
