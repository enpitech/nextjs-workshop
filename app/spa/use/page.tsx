// /spa/use: a Server Component starts the read and passes the promise down.
// Follows "Using React's use within a Context Provider" in the single-page applications guide.
import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { getTalks } from "@/lib/talks";
import { TalkCount, TalkTitles } from "./talk-readers";
import { TalksProvider } from "./talks-provider";

export default function Page() {
  const talksPromise = getTalks(); // do NOT await

  return (
    <main>
      <PageHeader eyebrow="Your SPA inside Next.js" title="A promise in a provider, read with use()">
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
          Open the Network tab and reload. The talks come with the page, and there is no fetch from
          the browser. Two Client Components below the provider read the same promise.
        </p>
      </PageHeader>
      <TalksProvider talksPromise={talksPromise}>
        <section className="panel grid gap-3 p-5">
          <Suspense fallback={<p className="text-sm">Loading…</p>}>
            <TalkCount />
          </Suspense>
          <Suspense fallback={<p className="text-sm">Loading…</p>}>
            <TalkTitles />
          </Suspense>
        </section>
      </TalksProvider>
    </main>
  );
}
