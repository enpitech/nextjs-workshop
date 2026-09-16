// Fires for notFound() calls and for URLs that match no route.
import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <h1 className="mb-2 text-2xl font-bold">Not found</h1>
      <p>
        No such talk. <Link className="underline" href="/">Back to the list</Link>
      </p>
    </main>
  );
}
