import type { Metadata } from "next";
import { Estimator } from "@/components/marketing/Estimator";

export const metadata: Metadata = {
  title: "Fix Estimator",
  description: "Build a FixFit garment-fix estimate and preview your visit.",
};

export default async function EstimatorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const value = (name: string) => {
    const parameter = query[name];
    return typeof parameter === "string" ? parameter : undefined;
  };

  return (
    <Estimator
      initialCategory={value("category")}
      initialGarment={value("garment")}
      initialIssue={value("issue")}
      initialTier={value("tier")}
    />
  );
}
