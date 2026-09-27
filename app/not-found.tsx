// Fires for notFound() calls and for URLs that match no route.
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="panel p-8 text-center sm:p-12">
      <p className="text-6xl font-bold tracking-tight text-line-strong">404</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Not found</h1>
      <p className="mt-2 text-muted">No such talk.</p>
      <Link
        href="/"
        className="btn-primary mt-6 inline-flex rounded-[0.625rem] border px-4 py-2 text-sm font-medium"
      >
        Back to the list
      </Link>
    </main>
  );
}
