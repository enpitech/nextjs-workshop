// Exercise 8, Tasks 3 and 4. The Overview. An async Server Component: it awaits its data.
import { getTalks } from "@/lib/talks";
import { getSpeakers } from "@/lib/speakers";
import { Collapsible } from "../../collapsible";
import { StatCard } from "../../stat-card";
import { SpeakerList } from "./speaker-list";

export default async function Overview() {
  // The two reads do not need each other, so they start together.
  const [talks, speakers] = await Promise.all([getTalks(), getSpeakers()]);

  const votes = talks.reduce((sum, t) => sum + t.votes, 0);
  const top = [...talks].sort((a, b) => b.votes - a.votes)[0];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Talks" value={talks.length} />
        <StatCard label="Votes" value={votes} />
        <StatCard label="Speakers" value={speakers.length} />
        <StatCard label="Top talk" value={top ? top.title : "none"} />
      </div>

      {/* Task 4: a Client Component (Collapsible) around a Server Component (SpeakerList).
          SpeakerList is passed as children, so it renders on the server first. */}
      <Collapsible title="Speakers">
        <SpeakerList />
      </Collapsible>

      {/* Task 10: a plain <a>. The browser must load the JSON itself, not ask for a page. */}
      <a className="underline" href="/exercises/8/solution/dashboard/api/talks">
        Download the talks as JSON
      </a>
    </div>
  );
}
