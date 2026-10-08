// Exercise 8, Task 4. A Server Component with its own read. No directive.
// The Overview page passes it as `children` into <Collapsible>, so it stays in the server graph.
import { getSpeakers } from "@/lib/speakers";

export async function SpeakerList() {
  const speakers = await getSpeakers();
  return (
    <ul className="space-y-2">
      {speakers.map((s) => (
        <li key={s.id}>
          <span className="font-medium text-ink">{s.name}</span>: {s.bio}
        </li>
      ))}
    </ul>
  );
}
