// Exercise 11, Task 5. The page itself reads no request data, so it prerenders as a shell.
// searchParams is a promise. The component that awaits it sits inside <Suspense>, so the
// shell shows right away and the list streams in.
import { Suspense } from "react";
import { SpeakerList } from "./speaker-list";

export default function SpeakersPage({
  searchParams,
}: {
  searchParams: Promise<{ speaker?: string }>;
}) {
  return (
    <main>
      <h1 className="mb-4 text-2xl font-bold">Speakers</h1>
      <Suspense fallback={<p className="text-sm text-muted">Loading speakers...</p>}>
        <SpeakerList searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
