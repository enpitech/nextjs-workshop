// Exercise 5: the browser tab says "Talks" on every talk. Give each talk its own title. See README.md.
import { notFound } from "next/navigation";
import { getTalk } from "@/lib/talks";

export default async function TalkTitle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const talk = await getTalk(Number(id)).catch(() => null);
  if (!talk) notFound();

  return (
    <main>
      <h1 className="mb-2 text-2xl font-bold">{talk.title}</h1>
      <p className="text-sm text-muted">{talk.votes} votes</p>
    </main>
  );
}
