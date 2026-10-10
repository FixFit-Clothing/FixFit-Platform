export type ServiceTier = "spot" | "quick" | "schedule";
export type IssueCategory = "alteration" | "replacement" | "enhancement";
export type GuideIssue = readonly [issue: string, options: readonly string[]];
export type GuideMap = Record<string, readonly GuideIssue[]>;

export const garmentTags: Record<string, readonly string[]> = {
  Blouse: ["Tight", "Loose", "Short", "Misplaced", "Gaping", "Uneven"],
  "Bodycon Dress": [
    "Tight",
    "Short",
    "Loose",
    "Uneven",
    "Broken",
    "Damaged",
    "Missing",
  ],
  "Dhoti Pants": ["Broken", "Uneven", "Tight", "Small", "Bulky", "Long"],
  Dress: ["Small", "Uneven", "Stuck", "Twisted", "Loose", "Tight"],
  Gharara: ["Tight", "Uneven", "Long", "Broken", "Short", "Missing"],
  Gown: ["Tight", "Loose", "Long", "Uneven", "Short"],
  Jacket: ["Tight", "Loose", "Long", "Uneven", "Short"],
  Jeans: ["Loose", "Stuck", "Low", "Twisted", "Small", "Broken"],
  Jumpsuit: ["Tight", "Uneven", "Small", "Broken", "Short", "Long"],
  Kaftan: ["Long", "Tight", "Loose", "Uneven", "Broken", "Short"],
  Kurti: ["Open", "Loose", "Small", "Uneven", "Twisted", "Tight"],
  Lehenga: ["Broken", "Uneven", "Long", "Tight", "Loose", "Short"],
  "Maxi Dress": ["Tight", "Uneven", "Small", "Broken", "Short", "Long"],
  "Office Wear": ["Broken", "Uneven", "Tight", "High", "Long", "Loose"],
  Palazzo: ["Small", "Uneven", "Short", "Broken", "Thick", "Loose"],
  "Pattu Pavadai": ["Broken", "Uneven", "Long", "Tight", "Loose", "Short"],
  Sharara: ["Loose", "Uneven", "Long", "Broken", "Small", "Tight"],
  Shirt: ["Uneven", "Small", "Tight", "Low", "Twisted", "Open"],
  Trouser: ["Tight", "Loose", "Short", "Long", "Uneven"],
};

export const garments = Object.keys(garmentTags);

export const tiers: Record<
  ServiceTier,
  { label: string; range: string; turnaround: string; from: number }
> = {
  spot: {
    label: "SpotFix",
    range: "₹199–₹299",
    turnaround: "Up to 30 minutes",
    from: 199,
  },
  quick: {
    label: "QuickFix",
    range: "₹350–₹599",
    turnaround: "2–3 hours",
    from: 350,
  },
  schedule: {
    label: "ScheduleFix",
    range: "₹599–₹999",
    turnaround: "Same/next day",
    from: 599,
  },
};

export function issueCategory(
  issue: string
): Exclude<IssueCategory, "alteration"> {
  return /\b(Missing|Damaged)\b|Old Lining/.test(issue)
    ? "replacement"
    : "enhancement";
}

export function allowsMultipleOptions(issue: string) {
  return /Design Change|Plain |Too Plain|Decorative/.test(issue);
}

const compressedGuides =
  "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";

export async function loadGuides(): Promise<GuideMap> {
  const bytes = Uint8Array.from(atob(compressedGuides), (character) =>
    character.charCodeAt(0)
  );
  const decompressed = new Blob([bytes])
    .stream()
    .pipeThrough(new DecompressionStream("gzip"));
  return JSON.parse(await new Response(decompressed).text()) as GuideMap;
}
