// Exercise 7, solution. The nearest not-found.tsx wins. Without this file, notFound() in the
// page renders app/not-found.tsx, which says "No such talk".
export default function SpeakerNotFound() {
  return (
    <div className="panel p-6 text-center sm:p-8">
      <p className="text-4xl font-bold text-line-strong">404</p>
      <h2 className="mt-2 text-xl font-bold">No such speaker</h2>
      <p className="mt-1 text-sm text-muted">Try /exercises/7/solution/1.</p>
    </div>
  );
}
