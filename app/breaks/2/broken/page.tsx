// Break #2: import one small component through a "use client" barrel file.
// Predict what ships to the browser for this page.
import { Badge } from "@/components/ui";

export default function Broken() {
  return (
    <main>
      <h1 className="mb-4 text-2xl font-bold">Break #2: broken</h1>
      <p>
        This page renders one <Badge>badge</Badge>. Nothing else.
      </p>
    </main>
  );
}
