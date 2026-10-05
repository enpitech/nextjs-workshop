// /spa/query: the server fetches first, TanStack Query takes over in the browser.
// Follows "Provide initial data from a Server Component" in the TanStack Query guide.
import { Suspense } from "react";
import { connection } from "next/server";
import {
  defaultShouldDehydrateQuery,
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { getTalks } from "@/lib/talks";
import { talksCache } from "./talks-cache";
import { TalksView } from "./talks-view";

export default function Page() {
  return (
    <main>
      <PageHeader eyebrow="Your SPA inside Next.js" title="TanStack Query, first data from the server">
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
          Open the Network tab and reload. The talks are already in the page, and there is no
          request to <code>/api/talks</code>. Then click the button below the list.
        </p>
      </PageHeader>
      <Suspense fallback={<p>Loading…</p>}>
        <TalksData />
      </Suspense>
    </main>
  );
}

async function TalksData() {
  // dehydrate() reads the clock. With cacheComponents that is allowed only at request time.
  await connection();
  const queryClient = new QueryClient();

  // Not awaited, so rendering is not blocked. The server calls the data layer, not /api/talks.
  void queryClient.prefetchQuery({
    ...talksCache.options(),
    queryFn: () => getTalks(),
  });

  return (
    <HydrationBoundary
      state={dehydrate(queryClient, {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      })}
    >
      <TalksView />
    </HydrationBoundary>
  );
}
