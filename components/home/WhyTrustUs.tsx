import Link from "next/link";

import { ExecutiveAvatar } from "@/components/home/ExecutiveAvatar";
import {
  MarketingSectionHeading,
  StatisticItem,
  TrustCard,
} from "@/src/components/ui";

const executiveStats = [
  { value: "4.9★", label: "Rating" },
  { value: "47", label: "Orders" },
  { value: "100%", label: "On Time" },
];

const verificationSteps = [
  "Verify her ID",
  "Garment photographed",
  "Garment collected",
  "Fix supervised",
  "10-point QC",
  "You inspect first",
];

const trustCards = [
  {
    icon: "🛡️",
    title: "FixFit Guarantee",
    description: "Redo it free. Fabric damage covered. No arguments.",
  },
  {
    icon: "🪪",
    title: "Digital Verification",
    description: "Unique ID code, verifiable on WhatsApp before you open the door.",
  },
  {
    icon: "📸",
    title: "Garment Photos",
    description: "Front/back photos at pickup record starting condition.",
  },
  {
    icon: "🎓",
    title: "Fashion Graduates",
    description: "Real fit and fabric expertise, not generic delivery staff.",
  },
  {
    icon: "🔒",
    title: "Background Checks",
    description: "Police-verified, 3-week field training before dispatch.",
  },
  {
    icon: "📞",
    title: "Direct Founder Line",
    description: "Arbaz is reachable directly — no support tickets.",
  },
];

function VerificationStep({ step, label }: { step: number; label: string }) {
  return (
    <li className="relative text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full border border-primary bg-surface font-serif text-2xl font-bold leading-none text-primary shadow-sm">
        {step}
      </span>
      <p className="mt-3 text-sm font-semibold leading-snug text-secondary">
        {label}
      </p>
    </li>
  );
}

export function WhyTrustUs() {
  return (
    <section id="why-trust-us" className="section">
      <div className="container">
        <MarketingSectionHeading
          eyebrow="Why Trust Us"
          title="A woman you know. Not a stranger you hope."
        />

        <div className="mt-10 overflow-hidden rounded-xl bg-secondary p-6 text-secondary-foreground shadow-lg sm:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative flex size-24 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary-glow">
                <ExecutiveAvatar size={80} label="Priya Sharma avatar" />
                <span className="absolute -right-1 bottom-2 size-5 rounded-full border-2 border-secondary bg-primary" />
              </div>

              <div>
                <p className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  🪪 On duty · Sectors 2–6
                </p>
                <h3 className="mt-4 font-serif text-3xl font-semibold leading-tight text-secondary-foreground">
                  Priya Sharma — Style Executive
                </h3>
                <p className="mt-2 text-sm text-[#c4bdb5]">
                  ID: FX-BLR-001 · Background Verified · Fashion Graduate
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 lg:min-w-80">
              {executiveStats.map((stat) => (
                <StatisticItem
                  key={stat.label}
                  value={stat.value}
                  label={stat.label}
                  tone="light"
                />
              ))}
            </div>
          </div>
        </div>

        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {verificationSteps.map((step, index) => (
            <VerificationStep key={step} step={index + 1} label={step} />
          ))}
        </ol>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {trustCards.map((card) => (
            <TrustCard key={card.title} {...card} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            className="inline-flex items-center justify-center rounded-md bg-secondary px-5 py-3 text-sm font-semibold text-secondary-foreground shadow-sm transition-fast hover:bg-text-secondary"
            href="/real-results"
          >
            See real orders & ratings →
          </Link>
        </div>
      </div>
    </section>
  );
}
