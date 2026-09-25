export type NavItem = {
  href: string;
  label: string;
};

/**
 * Shared marketing navigation.
 * Hash targets are placeholders until those homepage sections/pages exist.
 */
export const primaryNav: NavItem[] = [
  { href: "/#home", label: "Home" },
  { href: "/#estimator", label: "Estimator" },
  { href: "/#allfixes", label: "All Fixes" },
  { href: "/#results", label: "Real Results" },
  { href: "/#trust", label: "Why Trust Us" },
  { href: "/#faq", label: "FAQ" },
];

export const serviceLinks: NavItem[] = [
  { href: "/#services", label: "SpotFix" },
  { href: "/#services", label: "QuickFix" },
  { href: "/#services", label: "ScheduleFix" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#allfixes", label: "All Fixes" },
];

export const companyLinks: NavItem[] = [
  { href: "/#results", label: "Real Results" },
  { href: "/#trust", label: "Why Trust Us" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#faq", label: "FAQ" },
];

export const legalLinks: NavItem[] = [
  { href: "/#privacy", label: "Privacy Policy" },
  { href: "/#terms", label: "Terms of Service" },
  { href: "/#refund", label: "Refund Policy" },
];

/** Diagnose / booking — no dedicated route yet. */
export const diagnoseHref = "/#diagnose";
export const pricingHref = "/#pricing";
export const resultsHref = "/#results";
