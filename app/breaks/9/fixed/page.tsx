// Break #9, fixed: the page is a Server Component again. Only Toggle is in the client graph.
// SecretCard is imported here, in the server graph, and reaches Toggle as `children`.
import { SecretCard } from "./secret-card";
import { Toggle } from "./toggle";

export default function Page() {
  return (
    <main className="grid gap-4">
      <h1 className="text-2xl font-bold">Break #9: fixed</h1>
      <Toggle>
        <SecretCard />
      </Toggle>
    </main>
  );
}
