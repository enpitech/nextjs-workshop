// Break #8: the page body. A Server Component that reads the server-only data layer.
import { getTalks } from "@/lib/talks";
import { GraphBadge } from "./graph-badge";
import { ThemeToggle } from "./theme-toggle";

export async function Talks({ title }: { title: string }) {
  const talks = await getTalks();
  return (
    <section className="panel grid gap-3 p-5">
      <h1 className="text-2xl font-bold">{title}</h1>
      <GraphBadge file="page.tsx" />
      <ThemeToggle />
      <ul className="list-disc pl-5 text-sm">
        {talks.map((t) => (
          <li key={t.id}>{t.title}</li>
        ))}
      </ul>
    </section>
  );
}
