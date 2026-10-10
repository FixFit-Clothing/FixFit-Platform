import type { ReactNode } from "react";

type LegalPageProps = {
  title: string;
  summary: string;
  children: ReactNode;
};

export function LegalPage({ title, summary, children }: LegalPageProps) {
  return (
    <main className="legal-page">
      <article className="site-wrap legal-page-content">
        <header className="section-head legal-page-header">
          <p className="section-eyebrow">Legal</p>
          <h1 className="section-title">{title}</h1>
          <p className="legal-page-summary">{summary}</p>
        </header>
        <div className="legal-body">{children}</div>
      </article>
    </main>
  );
}
