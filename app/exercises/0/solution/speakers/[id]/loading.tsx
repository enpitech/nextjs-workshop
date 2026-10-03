// Exercise 0, solution. The page awaits params, so it needs a boundary. This file is that boundary.
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading speaker" className="panel p-6 sm:p-8">
      <div className="shimmer h-7 w-1/2 rounded-lg" />
      <div className="shimmer mt-3 h-4 w-3/4 rounded" />
      <div className="shimmer mt-6 h-4 w-1/3 rounded" />
    </div>
  );
}
