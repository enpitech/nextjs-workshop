// Exercise 8, Task 7. The page awaits params, so it needs a boundary. This file is that boundary.
// Delete it, and the dev badge shows "Blocking Route", and `next build` fails.
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading talk" className="space-y-5">
      <div className="shimmer h-4 w-20 rounded" />
      <div className="panel p-6">
        <div className="shimmer h-5 w-20 rounded-full" />
        <div className="shimmer mt-4 h-8 w-3/4 rounded-lg" />
        <div className="shimmer mt-3 h-4 w-40 rounded" />
      </div>
    </div>
  );
}
