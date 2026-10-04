// Exercise 5, solution. generateMetadata gets the same params as the page.
// getTalk() is cached, so the page and the metadata share one read.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTalk } from "@/lib/talks";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const talk = await getTalk(Number(id)).catch(() => null);
  return { title: talk ? talk.title : "No such talk" };
}

export default async function TalkTitle({ params }: Props) {
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
