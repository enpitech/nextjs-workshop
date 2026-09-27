// Exercise 3: this is Break #4. Fix the waterfall in place. See README.md.
import { Suspense } from "react";
import { connection } from "next/server";
import { read } from "@/lib/api";
import { timed } from "@/lib/timing";
import type { Comment, Speaker, Talk } from "@/lib/types";
import { Detail } from "@/app/breaks/4/detail";

export default function Exercise3() {
  return (
    <main>
      <h1 className="mb-4 text-2xl font-bold">Exercise 3</h1>
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
    const speaker = await read<Speaker>(`/speakers/${talk.speakerId}`);
    const comments = await read<Comment[]>(`/comments?talkId=4`);
    return { talk, speaker, comments };
  });
  return <Detail {...value} ms={ms} />;
}
