import { Scissors } from "lucide-react";
import { MarketingPlaceholderPage } from "@/components/marketing/MarketingPlaceholderPage";

export default function AllFixesPage() {
  return (
    <MarketingPlaceholderPage
      eyebrow="Services"
      icon={Scissors}
      title="All fixes"
      description="Explore every repair, alteration, and clothing emergency FixFit can help solve."
    />
  );
}
