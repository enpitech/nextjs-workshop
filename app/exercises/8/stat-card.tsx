// Exercise 8, given. It draws one number in a box. It has no logic and no directive,
// so it joins the graph of whichever file imports it.
export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="panel p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums">{value}</p>
    </div>
  );
}
