// One talk as a link row: title on the left, vote count on the right.
import Link from "next/link";
import type { Talk } from "@/lib/types";
import { VoteIcon } from "./vote-icon";

export function TalkRow({ talk }: { talk: Talk }) {
  return (
    <li>
      <Link
        href={`/talks/${talk.id}`}
        className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-accent-soft/60"
      >
        <span className="font-medium text-ink group-hover:text-accent-strong">{talk.title}</span>
        <span className="flex shrink-0 items-center gap-1.5 text-sm text-muted tabular-nums">
          <VoteIcon className="size-4 fill-current text-faint group-hover:text-accent" />
          {talk.votes}
        </span>
      </Link>
    </li>
  );
}
