import type { LucideIcon } from "lucide-react";

type MarketingPlaceholderPageProps = {
  eyebrow: string;
  icon: LucideIcon;
  title: string;
  description: string;
};

export function MarketingPlaceholderPage({
  eyebrow,
  icon: Icon,
  title,
  description,
}: MarketingPlaceholderPageProps) {
  return (
    <main className="container section-sm">
      <div className="max-w-2xl">
        <div className="mb-6 flex size-12 items-center justify-center rounded-lg bg-primary-glow text-primary">
          <Icon aria-hidden="true" className="size-6" />
        </div>
        <p className="mb-3 font-mono text-xs font-medium uppercase tracking-wide text-primary">
          {eyebrow}
        </p>
        <h1 className="heading-xl mb-4">{title}</h1>
        <p className="max-w-xl text-base text-text-muted">{description}</p>
      </div>

      <div className="mt-10 border-t border-border-strong pt-6">
        <p className="text-sm text-text-muted">
          This page is connected to the site navigation and ready for its full
          content.
        </p>
      </div>
    </main>
  );
}
