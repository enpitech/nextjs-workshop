// Exercise 5: the list is given. Work in [id]/page.tsx. See README.md.
import Link from "next/link";
import { getTalks } from "@/lib/talks";

export default async function Exercise5() {
  const talks = await getTalks();
  return (
    <main>
      <h1 className="mb-4 text-2xl font-bold">Exercise 5</h1>
      <p className="mb-4 text-sm text-muted">Open a talk and read the title of the browser tab.</p>
      <ul className="list-disc space-y-1 pl-5">
        {talks.map((t) => (
          <li key={t.id}>
            <Link className="underline" href={`/exercises/5/${t.id}`}>
              {t.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
