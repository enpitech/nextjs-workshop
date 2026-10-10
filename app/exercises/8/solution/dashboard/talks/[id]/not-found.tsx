// Exercise 8, Task 8. notFound() renders the nearest not-found.tsx up the tree.
// This one is closer than app/not-found.tsx, so it wins, and the text fits the dashboard.
import Link from "next/link";

export default function TalkNotFound() {
  return (
    <div className="panel border-warning/40 p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-warning">404</p>
      <h2 className="mt-1 text-xl font-bold">No such talk</h2>
      <p className="mt-2 text-sm text-muted">The dashboard has no talk with this id.</p>
      <Link
        href="/exercises/8/solution/dashboard/talks"
        className="btn-primary mt-4 inline-flex rounded-[0.625rem] border px-3.5 py-1.5 text-sm font-medium"
      >
        Back to the talks
      </Link>
    </div>
  );
}
