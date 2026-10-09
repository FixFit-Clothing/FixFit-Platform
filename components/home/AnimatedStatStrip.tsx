"use client";

import { useEffect, useRef, useState } from "react";

type Stat = {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
};

const stats: Stat[] = [
  { value: 3, label: "Service Tiers" },
  { value: 100, label: "Verified Female Executives", suffix: "%" },
  { value: 99, label: "Starting Price", prefix: "₹" },
  { value: 7, label: "HSR Layout Sectors Covered" },
];

const duration = 1100;

function easeOutCubic(progress: number) {
  return 1 - Math.pow(1 - progress, 3);
}

function formatStat(stat: Stat, value: number) {
  return `${stat.prefix ?? ""}${Math.round(value)}${stat.suffix ?? ""}`;
}

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => setReducedMotion(media.matches);
    update();

    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}

export function AnimatedStatStrip() {
  const stripRef = useRef<HTMLElement>(null);
  const frameRef = useRef<number | null>(null);
  const hasAnimatedRef = useRef(false);
  const reducedMotion = useReducedMotion();
  const [values, setValues] = useState(() => stats.map(() => 0));

  useEffect(() => {
    if (reducedMotion) {
      hasAnimatedRef.current = true;
      return;
    }

    const node = stripRef.current;
    if (!node) return;

    const startAnimation = () => {
      if (hasAnimatedRef.current) return;

      hasAnimatedRef.current = true;
      const startedAt = performance.now();

      const tick = (now: number) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        const easedProgress = easeOutCubic(progress);

        setValues(stats.map((stat) => stat.value * easedProgress));

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(tick);
        } else {
          setValues(stats.map((stat) => stat.value));
          frameRef.current = null;
        }
      };

      frameRef.current = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          startAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [reducedMotion]);

  const displayValues = reducedMotion ? stats.map((stat) => stat.value) : values;

  return (
    <section
      ref={stripRef}
      className="home-section-tight pt-0"
      aria-label="FixFit statistics"
    >
      <div className="site-wrap">
        <div className="grid gap-4 rounded-xl border border-border-strong bg-surface p-5 shadow-md sm:grid-cols-2 lg:grid-cols-4 lg:p-7">
          {stats.map((stat, index) => (
            <div
              className="text-center lg:border-l lg:border-border-strong lg:first:border-l-0"
              key={stat.label}
            >
              <p className="mono text-3xl font-bold leading-none text-primary sm:text-4xl">
                {formatStat(stat, displayValues[index] ?? stat.value)}
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
