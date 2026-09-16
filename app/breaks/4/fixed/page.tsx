// Break #4, fixed (fix 1): find the one real dependency, batch the rest with Promise.all.
// speaker needs talk. comments does not. Two round trips instead of three.
import { Suspense } from "react";
import { connection } from "next/server";
import { read } from "@/lib/db";
import { timed } from "@/lib/timing";
import type { Comment, Speaker, Talk } from "@/lib/types";
import { Detail } from "../detail";

export default function Fixed() {
  return (
    <main>
      <h1 className="mb-4 text-2xl font-bold">Break #4: fixed</h1>
      <Suspense fallback={<p>Loading…</p>}>
        <Batched />
      </Suspense>
    </main>
  );
}

async function Batched() {
  await connection();
  const { value, ms } = await timed(async () => {
    const [talk, comments] = await Promise.all([
      read<Talk>("/talks/4"),
      read<Comment[]>(`/comments?talkId=4`),
    ]);
    const speaker = await read<Speaker>(`/speakers/${talk.speakerId}`);
    return { talk, speaker, comments };
  });
  return <Detail {...value} ms={ms} />;
}
