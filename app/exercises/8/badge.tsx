// Exercise 8, given, for Task 5. A small colored label. It has no logic and no directive,
// so it joins the graph of whichever file imports it.
export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-accent-soft px-2.5 py-0.5 align-middle text-xs font-medium text-accent-strong">
      {children}
    </span>
  );
}
