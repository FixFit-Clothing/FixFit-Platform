import { tiers, type ServiceTier } from "@/lib/estimator-data";

export type PricedGarment = {
  tier: ServiceTier;
  rush: boolean;
};

export type EstimateSummary = {
  bookingFee: number;
  rushFee: number;
  rushCount: number;
  sharedTier: ServiceTier;
  turnaround: string;
  workFrom: number;
  payNow: number;
};

const tierRank: Record<ServiceTier, number> = {
  spot: 1,
  quick: 2,
  schedule: 3,
};

export function calculateEstimate(
  items: readonly PricedGarment[]
): EstimateSummary {
  const sharedTier = items.reduce<ServiceTier>(
    (slowest, item) =>
      tierRank[item.tier] > tierRank[slowest] ? item.tier : slowest,
    "spot"
  );
  const rushCount = items.filter(
    (item) => item.rush && tierRank[item.tier] < tierRank[sharedTier]
  ).length;
  const bookingFee = 99;
  const rushFee = rushCount * 99;

  return {
    bookingFee,
    rushFee,
    rushCount,
    sharedTier,
    turnaround: tiers[sharedTier].turnaround,
    workFrom: items.reduce((total, item) => total + tiers[item.tier].from, 0),
    payNow: bookingFee + rushFee,
  };
}
