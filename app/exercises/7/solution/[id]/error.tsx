"use client";
// Exercise 7, solution. error.tsx must be a Client Component: it holds the state and the button.
// retry() is stable since 16.3. It fetches and renders the segment again. reset() only clears the error state.
// In production, error.message of a server error is replaced by a generic text. error.digest links to the server log.

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
      {error.digest && <p className="mt-2 text-xs text-muted">Error id: {error.digest}</p>}
      <button className="btn-primary mt-4" onClick={() => retry()}>
        Try again
      </button>
    </div>
  );
}
