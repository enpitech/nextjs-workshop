"use client";
// Exercise 8, Task 8. error.tsx must be a Client Component: it holds the retry button.
// The prop is `retry` since Next 16.3. Open /exercises/8/solution/dashboard/talks/boom.
// The sidebar stays on screen. This box takes the place of the page.

export default function TalkError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div className="panel border-danger/20 p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-danger">Error</p>
      <h2 className="mt-1 text-xl font-bold">Something broke</h2>
      <pre className="mt-3 overflow-x-auto rounded-xl bg-danger-soft px-4 py-3 font-mono text-sm text-danger">
        {error.message}
      </pre>
      <button className="btn-primary mt-4" onClick={() => retry()}>
        Try again
      </button>
    </div>
  );
}
