import type { Metadata } from "next";
import { AllFixes } from "@/components/marketing/AllFixes";

export const metadata: Metadata = {
  title: "All Fixes",
  description:
    "Explore every garment repair, alteration, and clothing emergency FixFit handles in HSR Layout.",
};

export default function AllFixesPage() {
  return <AllFixes />;
}
