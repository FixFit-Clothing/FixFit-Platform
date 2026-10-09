"use client";

import { useState } from "react";
import type { HTMLAttributes } from "react";

type BeforeAfterCardProps = HTMLAttributes<HTMLElement> & {
  garment: string;
  timing: string;
  turnaround: string;
  fixCost: string;
  variant: "zip" | "blouse";
};

function GarmentIllustration({ variant }: { variant: "zip" | "blouse" }) {
  if (variant === "blouse") {
    return (
      <svg viewBox="0 0 180 130" className="h-full w-full" aria-hidden="true">
        <path
          d="M49 27c16 14 66 14 82 0l22 23-20 18-10-10v51H57V58L47 68 27 50l22-23Z"
          fill="#FFF7ED"
          stroke="#8B4513"
          strokeWidth="3"
        />
        <path d="M73 33c6 9 28 9 34 0" fill="none" stroke="#F97316" strokeWidth="3" />
        <path d="M58 77h64" stroke="#E7DFD3" strokeWidth="3" strokeDasharray="6 6" />
        <path d="M90 40v69" stroke="#C2560D" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 180 130" className="h-full w-full" aria-hidden="true">
      <path
        d="M54 20h72l17 30-17 59H54L37 50 54 20Z"
        fill="#FFF7ED"
        stroke="#8B4513"
        strokeWidth="3"
      />
      <path d="M72 20c8 12 28 12 36 0" fill="none" stroke="#F97316" strokeWidth="3" />
      <path d="M90 24v80" stroke="#1C1917" strokeWidth="3" />
      <path d="M82 45h16M82 61h16M82 77h16" stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function VisualPanel({
  label,
  variant,
  active,
}: {
  label: "Before" | "After";
  variant: "zip" | "blouse";
  active: boolean;
}) {
  return (
    <div
      className={`relative min-h-48 overflow-hidden rounded-xl border p-4 transition-normal ${
        active
          ? "border-border-accent bg-background shadow-sm"
          : "border-border bg-surface-muted/50"
      }`}
    >
      <span className="label absolute left-4 top-4 rounded-full bg-surface px-3 py-1 shadow-sm">
        {label}
      </span>
      <div
        className={`mx-auto mt-8 h-28 max-w-44 transition-normal ${
          active ? "scale-105 opacity-100" : "scale-95 opacity-60"
        }`}
      >
        <GarmentIllustration variant={variant} />
      </div>
      <p className="caption mt-3 text-center">Illustrative — photo coming soon</p>
    </div>
  );
}

export function BeforeAfterCard({
  garment,
  timing,
  turnaround,
  fixCost,
  variant,
  className = "",
  ...props
}: BeforeAfterCardProps) {
  const [showAfter, setShowAfter] = useState(false);

  return (
    <article
      className={`rounded-lg border border-border-strong bg-surface p-5 shadow-sm transition-normal hover:-translate-y-1 hover:shadow-md sm:p-6 ${className}`}
      onPointerEnter={() => setShowAfter(true)}
      onPointerLeave={() => setShowAfter(false)}
      onFocus={() => setShowAfter(true)}
      onBlur={() => setShowAfter(false)}
      onClick={() => setShowAfter((current) => !current)}
      tabIndex={0}
      role="button"
      aria-pressed={showAfter}
      aria-label={`${garment} before and after reveal`}
      {...props}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <VisualPanel label="Before" variant={variant} active={!showAfter} />
        <VisualPanel label="After" variant={variant} active={showAfter} />
      </div>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="caption font-semibold uppercase tracking-wide text-primary">
            Hover / tap ↔
          </p>
          <h3 className="heading-md mt-2">{garment}</h3>
          <p className="body-sm mt-1">{timing}</p>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-right">
          <div>
            <dt className="caption">Turnaround</dt>
            <dd className="mono mt-1 font-bold text-secondary">{turnaround}</dd>
          </div>
          <div>
            <dt className="caption">Fix cost</dt>
            <dd className="mono mt-1 font-bold text-secondary">{fixCost}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
