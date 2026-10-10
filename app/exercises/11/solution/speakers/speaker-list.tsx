// Exercise 11, Task 5. No directive and no cache code of its own.
// getSpeakers(), getTalks() and getComments() are already cached in lib/, so this file only
// reads them. The one request value, ?speaker=, is read here, outside every cached function.
import Link from "next/link";
import { getComments } from "@/lib/comments";
import { getSpeakers } from "@/lib/speakers";
import { getTalks } from "@/lib/talks";
import type { Talk } from "@/lib/types";
import { CommentForm } from "./comment-form";

export async function SpeakerList({
  searchParams,
}: {
  searchParams: Promise<{ speaker?: string }>;
}) {
  const { speaker } = await searchParams;
  const [speakers, talks] = await Promise.all([getSpeakers(), getTalks()]);
  const shown = speaker ? speakers.filter((s) => s.id === Number(speaker)) : speakers;

  return (
    <div className="space-y-6">
      {speaker && (
        <Link href="/exercises/11/solution/speakers" className="text-sm underline">
          Show all speakers
        </Link>
      )}
      {shown.map((s) => (
        <section key={s.id}>
          <h2 className="mb-2 text-lg font-semibold">{s.name}</h2>
          <ul className="panel divide-y divide-line">
            {talks
              .filter((t) => t.speakerId === s.id)
              .map((t) => (
                <TalkRow key={t.id} talk={t} />
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

// The count comes from getComments(), which lib/comments.ts caches under the tag
// `comments-${talkId}`. The talk page reads the same entry, so one tag clears both pages.
async function TalkRow({ talk }: { talk: Talk }) {
  const comments = await getComments(talk.id);
  return (
    <li className="space-y-2 px-5 py-3.5">
      <p className="flex flex-wrap items-center justify-between gap-x-4">
        <span className="font-medium">{talk.title}</span>
        <span className="text-sm tabular-nums text-muted">{comments.length} comments</span>
      </p>
      <CommentForm talkId={talk.id} />
    </li>
  );
}
