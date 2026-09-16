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
    <main>
      <h1 className="mb-2 text-2xl font-bold">Something broke</h1>
      <p className="mb-3 text-sm text-gray-500">{error.message}</p>
      <button className="rounded border px-3 py-1" onClick={() => retry()}>
        Try again
      </button>
    </main>
  );
}
