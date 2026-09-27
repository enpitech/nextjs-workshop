// Break #4: the waterfall. Three reads, one after the other. Each one takes 800 ms.
// The reads are uncached on purpose, so the timing is visible on every request.
import { Suspense } from "react";
import { connection } from "next/server";
import { read } from "@/lib/api";
import { timed } from "@/lib/timing";
import type { Comment, Speaker, Talk } from "@/lib/types";
import { Detail } from "../detail";

export default function Broken() {
  return (
    <main>
      <h1 className="mb-4 text-2xl font-bold">Break #4: broken</h1>
      <Suspense fallback={<p>Loading…</p>}>
        <Sequential />
      </Suspense>
    </main>
  );
}

async function Sequential() {
  await connection();
  const { value, ms } = await timed(async () => {
    const talk = await read<Talk>("/talks/4");
    const speaker = await read<Speaker>(`/speakers/${talk.speakerId}`); // needs talk
    const comments = await read<Comment[]>(`/comments?talkId=4`); // does not need talk
    return { talk, speaker, comments };
  });
  return <Detail {...value} ms={ms} />;
}
