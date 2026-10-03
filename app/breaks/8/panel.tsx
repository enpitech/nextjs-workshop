// Break #8: imported by both layouts, with no directive. It has no graph of its own.
// It joins the graph of the file that imports it.
import { GraphBadge } from "./graph-badge";

export function Panel() {
  return (
    <aside className="panel p-5">
      <h2 className="mb-2 font-medium">Panel, imported by the layout</h2>
      <GraphBadge file="panel.tsx" />
    </aside>
  );
}
