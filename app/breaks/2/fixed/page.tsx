// Break #2, fixed: import the file, not the barrel.
import { Badge } from "@/components/ui/badge";

export default function Fixed() {
  return (
    <main>
      <h1 className="mb-4 text-2xl font-bold">Break #2: fixed</h1>
      <p>
        This page renders one <Badge>badge</Badge>. Nothing else.
      </p>
    </main>
  );
}
