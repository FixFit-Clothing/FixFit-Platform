import type { HTMLAttributes } from "react";

export function Heading({
  className = "",
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={className} {...props} />;
}