"use client";
// Break #10, fixed: an error boundary for this segment. It catches errors from the page and
// everything below it, also the ones that happen in the browser after a click.
// retry() renders the page again. The Client Component mounts fresh, so the click is undone.

export default function ViewerError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="panel border-danger/20 p-8 sm:p-10">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-danger">Error</p>
      <h1 className="text-3xl font-bold tracking-tight">This part broke</h1>
      <pre className="mt-4 overflow-x-auto rounded-xl bg-danger-soft px-4 py-3 font-mono text-sm text-danger">
        {error.message}
      </pre>
      <button className="btn-primary mt-6" onClick={() => retry()}>
        Try again
      </button>
    </main>
  );
}
