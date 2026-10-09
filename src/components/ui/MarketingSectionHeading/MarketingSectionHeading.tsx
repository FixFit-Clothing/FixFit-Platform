import type { HTMLAttributes } from "react";

type MarketingSectionHeadingProps = HTMLAttributes<HTMLDivElement> & {
  eyebrow: string;
  title: string;
  align?: "left" | "center";
};

export function MarketingSectionHeading({
  eyebrow,
  title,
  align = "center",
  className = "",
  ...props
}: MarketingSectionHeadingProps) {
  return (
    <div
      className={`${align === "center" ? "text-center" : "text-left"} ${className}`}
      {...props}
    >
      <p className="label mb-3">{eyebrow}</p>
      <h2 className="display-md">{title}</h2>
    </div>
  );
}
