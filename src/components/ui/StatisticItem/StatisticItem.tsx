import type { HTMLAttributes } from "react";

type StatisticItemProps = HTMLAttributes<HTMLDivElement> & {
  value: string;
  label: string;
  tone?: "light" | "dark";
};

export function StatisticItem({
  value,
  label,
  tone = "dark",
  className = "",
  ...props
}: StatisticItemProps) {
  return (
    <div className={`text-center ${className}`} {...props}>
      <p
        className={`mono text-3xl font-bold leading-none sm:text-4xl ${
          tone === "light" ? "text-primary" : "text-secondary"
        }`}
      >
        {value}
      </p>
      <p
        className={`mt-2 text-xs font-semibold uppercase tracking-wide ${
          tone === "light" ? "text-[#c4bdb5]" : "text-text-muted"
        }`}
      >
        {label}
      </p>
    </div>
  );
}
