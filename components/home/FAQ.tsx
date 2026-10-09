import { Accordion, type AccordionItem } from "@/src/components/ui";

const faqItems: AccordionItem[] = [
  {
    question: "Why trust a stranger with my garment?",
    answer:
      "Named, ID-verified executive. You see her ID before she touches anything.",
  },
  {
    question: "What if the fix comes back wrong?",
    answer: "We redo it, free — the FixFit guarantee.",
  },
  {
    question: "Is it always a female executive?",
    answer: "Always — a Day 1 design decision, not a marketing line.",
  },
  {
    question: "What areas do you cover?",
    answer: "All 7 sectors of HSR Layout, Bengaluru. Koramangala next.",
  },
  {
    question: "How do I pay?",
    answer: "On delivery, after inspection — UPI or cash.",
  },
];

export function FAQ() {
  return (
    <section className="section-sm">
      <div className="container">
        <div className="text-center">
          <p className="label mb-3">FAQ</p>
          <h1 className="display-md">Frequently Asked Questions</h1>
        </div>

        <Accordion className="mx-auto mt-10 max-w-[680px]" items={faqItems} />
      </div>
    </section>
  );
}
