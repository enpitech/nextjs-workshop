// Exercise 8, Tasks 7, 8 and 9. One talk. `params` is a promise, and the value is a string.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTalk } from "@/lib/talks";
import { getSpeaker } from "@/lib/speakers";
import { getComments } from "@/lib/comments";
import { Badge } from "../../../../badge";

type Props = { params: Promise<{ id: string }> };

// Task 9: the title depends on the data, so a fixed `metadata` object is not enough.
// getTalk() is cached, so the page and this function share one read.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const talk = await getTalk(Number(id)).catch(() => null);
  return { title: talk ? talk.title : "No such talk" };
}

export default async function TalkPage({ params }: Props) {
  const { id } = await params;
  // A test hook for error.tsx (Task 8). The URL /talks/boom makes the render crash on purpose.
  if (id === "boom") throw new Error("Boom: a render error on the server");

  // Task 8: a missing talk is expected. It is not an error, so it is a 404.
  const talkId = Number(id);
  if (!Number.isInteger(talkId)) notFound();
  const talk = await getTalk(talkId).catch(() => null);
  if (!talk) notFound();

  // Task 7: the speaker needs the talk, but the comments do not. Those two reads start together.
  const [speaker, comments] = await Promise.all([getSpeaker(talk.speakerId), getComments(talk.id)]);

  return (
    <article className="space-y-5">
      <Link
        href="/exercises/8/solution/dashboard/talks"
        className="text-sm text-muted hover:text-accent-strong"
      >
        ← All talks
      </Link>
      <header className="panel p-6">
        <Badge>{talk.category}</Badge>
        <h2 className="mt-3 text-2xl font-bold tracking-tight">{talk.title}</h2>
        <p className="mt-2 text-sm text-muted">
          {speaker.name} · <span className="tabular-nums">{talk.votes} votes</span>
        </p>
      </header>
      <section>
        <h3 className="mb-2 text-sm font-semibold">Comments ({comments.length})</h3>
        {comments.length === 0 ? (
          <p className="text-sm text-muted">No comments yet.</p>
        ) : (
          <ul className="space-y-2 text-sm text-muted">
            {comments.map((c) => (
              <li key={c.id} className="panel px-4 py-3">
                {c.text}
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}
