import {
  BeforeAfterCard,
  MarketingSectionHeading,
  ProofCard,
  StatisticItem,
} from "@/src/components/ui";

const pilotStats = [
  { value: "4.9★", label: "Pilot rating, first HSR Layout cohort" },
  { value: "47", label: "Orders completed to date" },
  { value: "100%", label: "On-time in the pilot batch" },
  { value: "12 min", label: "Average pickup time recorded" },
];

const beforeAfterCards = [
  {
    garment: "Broken Zip",
    timing: "Pickup 10:18 AM → Delivered 11:42 AM",
    turnaround: "1h 24m",
    fixCost: "₹299",
    variant: "zip" as const,
  },
  {
    garment: "Blouse Fitting",
    timing: "Pickup → delivery, same visit window",
    turnaround: "1h 48m",
    fixCost: "₹599",
    variant: "blouse" as const,
  },
];

const proofCards = [
  {
    icon: "▶️",
    description: "Video testimonial slot — real customer, on camera, coming soon.",
  },
  {
    icon: "💬",
    description: "Real WhatsApp booking screenshot — with customer consent.",
  },
  {
    icon: "🔁",
    description:
      "Repeat-customer % — published once we have 90+ days of order data.",
  },
];

export function RealResults() {
  return (
    <section id="real-results" className="section bg-surface">
      <div className="container">
        <MarketingSectionHeading
          eyebrow="Real Results"
          title="Other women are already trusting this."
        />

        <div className="mt-10 rounded-xl bg-secondary p-6 text-secondary-foreground shadow-lg sm:p-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pilotStats.map((stat) => (
              <StatisticItem
                key={stat.label}
                value={stat.value}
                label={stat.label}
                tone="light"
              />
            ))}
          </div>
        </div>

        <p className="body-sm mx-auto mt-6 max-w-3xl text-center">
          These are our real pilot-phase numbers — small by design, so we could
          get the process right before scaling. As order volume grows we&apos;ll
          publish live operating metrics (fixes completed, on-time %,
          repeat-customer rate) here instead of survey data.
        </p>

        <MarketingSectionHeading
          className="mt-16"
          eyebrow="Before → After"
          title="See the actual fix, not just the promise."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {beforeAfterCards.map((card) => (
            <BeforeAfterCard key={card.garment} {...card} />
          ))}
        </div>

        <p className="body-sm mx-auto mt-6 max-w-3xl text-center">
          Layout shown above uses illustrative timings from the pilot. We&apos;ll
          swap in real before/after photographs and confirmed timestamps as
          they&apos;re documented order-by-order.
        </p>

        <MarketingSectionHeading
          className="mt-16"
          eyebrow="More proof, coming online"
          title="Video & WhatsApp proof"
        />

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {proofCards.map((card) => (
            <ProofCard key={card.description} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}
