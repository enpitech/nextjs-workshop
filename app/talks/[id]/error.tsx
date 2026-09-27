"use client";
// error.tsx must be a Client Component: it holds the boundary state and the
// retry button. Since 16.3 the prop is `retry`, not `reset`. Open /talks/boom.

export default function TalkError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="panel border-danger/20 p-8 sm:p-10">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-danger">Error</p>
      <h1 className="text-3xl font-bold tracking-tight">Something broke</h1>
      <pre className="mt-4 overflow-x-auto rounded-xl bg-danger-soft px-4 py-3 font-mono text-sm text-danger">
        {error.message}
      </pre>
      <button className="btn-primary mt-6" onClick={() => retry()}>
        Try again
      </button>
    </main>
  );
}
