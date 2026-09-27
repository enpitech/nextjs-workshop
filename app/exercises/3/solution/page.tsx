// Exercise 3, solution (fix 2): stream each independent section on its own.
// The title arrives after one read. The speaker and the comments arrive when they are ready,
// each behind its own boundary. Nothing waits for something it does not need.
import { Suspense } from "react";
import { connection } from "next/server";
import { read } from "@/lib/api";
import type { Comment, Speaker, Talk } from "@/lib/types";

export default function Solution3() {
  return (
    <main>
      <h1 className="mb-4 text-2xl font-bold">Exercise 3: solution</h1>
      <Suspense fallback={<p>Loading talk…</p>}>
        <TalkHeader />
      </Suspense>
      <Suspense fallback={<p className="text-sm text-gray-500">Loading comments…</p>}>
        <Comments />
      </Suspense>
    </main>
  );
}

async function TalkHeader() {
  await connection();
  const talk = await read<Talk>("/talks/4");
  return (
    <div>
      <h2 className="text-xl font-semibold">{talk.title}</h2>
      <Suspense fallback={<p className="text-sm text-gray-500">Loading speaker…</p>}>
        <SpeakerName id={talk.speakerId} />
      </Suspense>
    </div>
  );
}

async function SpeakerName({ id }: { id: number }) {
  const speaker = await read<Speaker>(`/speakers/${id}`);
  return <p className="text-sm text-gray-500">{speaker.name}</p>;
}

async function Comments() {
  await connection();
  const comments = await read<Comment[]>(`/comments?talkId=4`);
  return (
    <ul className="my-2 list-disc pl-5">
      {comments.map((c) => (
        <li key={c.id}>{c.text}</li>
      ))}
    </ul>
  );
}
