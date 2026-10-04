// Route-segment Suspense boundary. Delete this file and the route hangs
// until the whole page has rendered (§6a).
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading talk" className="space-y-6">
      <div className="shimmer h-4 w-20 rounded" />
      <div className="panel p-7 sm:p-9">
        <div className="shimmer h-5 w-20 rounded-full" />
        <div className="shimmer mt-4 h-9 w-3/4 rounded-lg" />
        <div className="shimmer mt-4 h-4 w-40 rounded" />
        <div className="mt-6 border-t border-line pt-6">
          <div className="shimmer h-9 w-40 rounded-lg" />
        </div>
      </div>
      <div className="shimmer h-12 rounded-2xl" />
      <p className="text-center text-sm text-muted">Loading talk…</p>
    </div>
  );
}
