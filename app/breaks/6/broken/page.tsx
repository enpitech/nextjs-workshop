// Break #6: a Pages Router habit in an app/ file. The button below imports
// useRouter from `next/router`, the old module. It compiles. It throws when it renders.
// The page renders it at request time so that `next build` passes (see Break #1).
import { Suspense } from "react";
import { connection } from "next/server";
import { OldRouterButton } from "./old-router-button";

export default function Broken() {
  return (
    <main>
      <h1 className="mb-4 text-2xl font-bold">Break #6: broken</h1>
      <Suspense fallback={<p>Loading…</p>}>
        <AtRequestTime />
      </Suspense>
    </main>
  );
}

async function AtRequestTime() {
  await connection();
  return <OldRouterButton />;
}
