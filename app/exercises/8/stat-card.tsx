// Exercise 8, given. It draws one number in a box. It has no logic and no directive,
// so it joins the graph of whichever file imports it.
export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="panel p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
      {/* A long value, such as a talk title, gets a smaller size so that it fits the box. */}
      <p
        className={`mt-2 font-bold tracking-tight tabular-nums ${String(value).length > 6 ? "text-base leading-snug" : "text-3xl"}`}
      >
        {value}
      </p>
    </div>
  );
}
