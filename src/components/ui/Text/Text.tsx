import type { HTMLAttributes } from "react";

export function Text({
  className = "",
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={className} {...props} />;
}