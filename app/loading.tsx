export default function Loading() {
  return (
    <main
      className="container section-sm"
      aria-label="Loading page"
      aria-busy="true"
    >
      <div className="h-12 w-12 animate-pulse rounded-lg bg-surface-muted" />
      <div className="mt-6 h-3 w-32 animate-pulse rounded bg-surface-muted" />
      <div className="mt-3 h-10 w-64 max-w-full animate-pulse rounded bg-surface-muted" />
      <div className="mt-4 h-5 w-full max-w-xl animate-pulse rounded bg-surface-muted" />
      <div className="mt-2 h-5 w-4/5 max-w-lg animate-pulse rounded bg-surface-muted" />
    </main>
  );
}
