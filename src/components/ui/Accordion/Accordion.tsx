"use client";

import { useId, useState } from "react";

export type AccordionItem = {
  question: string;
  answer: string;
};

type AccordionProps = {
  items: AccordionItem[];
  className?: string;
};

export function Accordion({ items, className = "" }: AccordionProps) {
  const baseId = useId();
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, index) => {
        const isOpen = openItems[index] ?? false;
        const buttonId = `${baseId}-button-${index}`;
        const panelId = `${baseId}-panel-${index}`;

        return (
          <article
            className="rounded-md border border-border-strong bg-surface p-4 shadow-sm"
            key={item.question}
          >
            <button
              aria-controls={panelId}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 text-left text-sm font-semibold leading-snug text-secondary transition-fast hover:text-primary focus-visible:rounded-sm"
              id={buttonId}
              type="button"
              onClick={() =>
                setOpenItems((current) => ({
                  ...current,
                  [index]: !isOpen,
                }))
              }
            >
              <span>{item.question}</span>
              <span
                aria-hidden="true"
                className="shrink-0 text-xl font-semibold leading-none text-primary"
              >
                {isOpen ? "−" : "+"}
              </span>
            </button>
            <div
              aria-labelledby={buttonId}
              hidden={!isOpen}
              id={panelId}
              role="region"
            >
              <p className="mt-2 text-[13px] leading-[1.6] text-text-muted">
                {item.answer}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
