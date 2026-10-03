// A section label with a rule line after it. No directive: it joins whichever graph imports it.
export function SectionHeading({ title, count }: { title: string; count?: number }) {
  return (
    <h2 className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
      {title}
      {count !== undefined && (
        <span className="rounded-full bg-line px-2 py-0.5 text-[11px] font-semibold text-ink tabular-nums">
          {count}
        </span>
      )}
      <span className="h-px flex-1 bg-line" />
    </h2>
  );
}
