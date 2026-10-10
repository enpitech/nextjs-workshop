// Exercise 8, given, for Task 5. A small colored label. It has no logic and no directive,
// so it joins the graph of whichever file imports it.
// A known category gets its own color, the same as in videos/exercise-8.mp4. Other text gets the accent.
const colors: Record<string, string> = {
  architecture: "#4c8dff",
  frontend: "#2ec4b6",
  performance: "#ffa04a",
  backend: "#b48cff",
  ai: "#ff6fb5",
};

export function Badge({ children }: { children: React.ReactNode }) {
  const color = (typeof children === "string" && colors[children]) || "#8fb6ff";
  return (
    <span
      className="badge inline-flex items-center rounded-full px-2.5 py-0.5 align-middle text-xs font-semibold text-(color:--badge)"
      style={{ "--badge": color, backgroundColor: `${color}26` } as React.CSSProperties}
    >
      {children}
    </span>
  );
}
