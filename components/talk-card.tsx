// No directive. Imported by the talk page, so it renders on the server.
// The card at the top of a talk page. The vote form comes in as `children`,
// so the page decides what goes under the line.
import type { Talk } from "@/lib/types";

export function TalkCard({
  talk,
  speakerName,
  children,
}: {
  talk: Talk;
  speakerName: string;
  children: React.ReactNode;
}) {
  return (
    <header className="panel p-7 sm:p-9">
      <span className="inline-flex items-center rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent-strong">
        {talk.category}
      </span>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{talk.title}</h1>
      <p className="mt-3 flex flex-wrap items-center gap-x-2 text-sm text-muted">
        <span className="font-medium text-ink">{speakerName}</span>
        <span aria-hidden="true">·</span>
        <span className="tabular-nums">{talk.votes} votes</span>
      </p>
      <div className="mt-6 border-t border-line pt-6">{children}</div>
    </header>
  );
}
