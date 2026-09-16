// Route-segment Suspense boundary. Delete this file and the route hangs
// until the whole page has rendered (1.2d).
export default function Loading() {
  return <p className="text-gray-500">Loading talk…</p>;
}
