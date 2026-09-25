import { Heading } from "../Heading/Heading";
import { Text } from "../Text/Text";

import type { SectionTitleProps } from "./types";

export function SectionTitle({
  title,
  description,
  className = "",
}: SectionTitleProps) {
  return (
    <div className={className}>
      <Heading>{title}</Heading>

      {description && <Text>{description}</Text>}
    </div>
  );
}