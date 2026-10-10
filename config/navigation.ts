export type NavItem = {
  href: string;
  label: string;
};

/**
 * Shared marketing navigation.
 * Links used by the public site navigation.
 */
export const primaryNav: NavItem[] = [
  // The home page does not expose a `#home` anchor. Use the canonical route so
  // repeated clicks cannot accumulate a fragment in the URL.
  { href: "/", label: "Home" },
  { href: "/estimator", label: "Estimator" },
  { href: "/all-fixes", label: "All Fixes" },
  { href: "/real-results", label: "Real Results" },
  { href: "/why-trust-us", label: "Why Trust Us" },
  { href: "/faq", label: "FAQ" },
];

export const serviceLinks: NavItem[] = [
  { href: "/#services", label: "SpotFix" },
  { href: "/#services", label: "QuickFix" },
  { href: "/#services", label: "ScheduleFix" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/all-fixes", label: "All Fixes" },
];

export const companyLinks: NavItem[] = [
  { href: "/real-results", label: "Real Results" },
  { href: "/why-trust-us", label: "Why Trust Us" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/faq", label: "FAQ" },
];

export const legalLinks: NavItem[] = [
  { href: "/#privacy", label: "Privacy Policy" },
  { href: "/#terms", label: "Terms of Service" },
  { href: "/#refund", label: "Refund Policy" },
];

/** Diagnose / booking — no dedicated route yet. */
export const diagnoseHref = "/#diagnose";
export const pricingHref = "/#pricing";
export const resultsHref = "/real-results";
