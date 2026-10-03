"use client";
// Exercise 0, solution. error.tsx must be a Client Component: it holds the state and the button.
// In this solution it fires for real errors only. Remove the .catch in page.tsx and open /99 to see it.

export default function SpeakerError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div className="panel border-danger/20 p-6 sm:p-8">
      <h2 className="text-xl font-bold">Could not load the speaker</h2>
      <pre className="mt-3 overflow-x-auto rounded-xl bg-danger-soft px-4 py-3 font-mono text-sm text-danger">
        {error.message}
      </pre>
      <button className="btn-primary mt-4" onClick={() => retry()}>
        Try again
      </button>
    </div>
  );
}
