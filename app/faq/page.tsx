import { CircleHelp } from "lucide-react";
import { MarketingPlaceholderPage } from "@/components/marketing/MarketingPlaceholderPage";

export default function FaqPage() {
  return (
    <MarketingPlaceholderPage
      eyebrow="Support"
      icon={CircleHelp}
      title="Frequently asked questions"
      description="Answers about booking, turnaround times, garment care, and how FixFit works will appear here."
    />
  );
}
