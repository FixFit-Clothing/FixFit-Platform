import type { HTMLAttributes } from "react";

type TrustCardProps = HTMLAttributes<HTMLElement> & {
  icon: string;
  title: string;
  description: string;
};

export function TrustCard({
  icon,
  title,
  description,
  className = "",
  ...props
}: TrustCardProps) {
  return (
    <article
      className={`rounded-xl border border-border-strong bg-surface p-6 text-center shadow-sm transition-normal hover:-translate-y-1 hover:border-border-accent hover:shadow-md ${className}`}
      {...props}
    >
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-glow text-2xl">
        <span aria-hidden="true">{icon}</span>
      </div>
      <h3 className="heading-sm mt-5">{title}</h3>
      <p className="body-sm mt-3">{description}</p>
    </article>
  );
}
