# Your SPA inside Next.js (12 min)

Open http://localhost:3000/spa. Two routes, one idea: keep your React code and TanStack Query, and add a server to one route at a time. This is path 2 of "an existing app".

`layout.tsx` wraps only `/spa/*` in a `QueryClientProvider` (`providers.tsx`). The root layout is untouched. The layout is still a Server Component: the provider is the only client file, and the pages arrive as `children` (Break #8).

## /spa/query: first data from a Server Component

Files: `query/talks-cache.ts` (the cache contract), `query/page.tsx` (server), `query/talks-view.tsx` (client).

- The contract holds the query key, a `queryFn` that fetches `/api/talks`, and `staleTime: 30_000`.
- The page prefetches with `queryFn: () => getTalks()`. It calls the data layer, not HTTP. It dehydrates the pending query and passes it to `<HydrationBoundary>`.
- The Client Component calls `useSuspenseQuery(talksCache.options())`. Same key, so it finds the data already in the cache.
- `await connection()` comes first, because `dehydrate()` reads the clock. The query sits behind `<Suspense>`, as the guide requires with `cacheComponents`.

Network tab: reload with "Fetch/XHR" on. The talks arrive in the same response as the page, streamed after the first HTML. There is no request to `/api/talks`. Click "Refetch from /api/talks": one `GET /api/talks` appears, and the text under the button changes from `Browser requests to /api/talks so far: 0` to `... so far: 1`. The button ignores `staleTime`. A window refocus after 30 seconds also sends one `GET /api/talks`, but the counter counts only the button.

The route is dynamic (`connection()`), so the first visitor after a start waits for the data (about 0.9 s with the 800 ms backend delay). Later requests are fast, because `getTalks()` is cached. `next build` shows the route as partially prerendered (the shell is static, the talks stream).

## /spa/use: a promise in a provider

Files: `use/page.tsx` (server), `use/talks-provider.tsx` (client), `use/talk-readers.tsx` (client).

- The page calls `getTalks()` and does not await it. It passes the promise to `<TalksProvider>`.
- The provider puts the promise in context. `useTalks()` returns it.
- Two Client Components, each in its own `<Suspense>`, call `use(useTalks())`.

Network tab: no fetch from the browser. The data travels inside the page response. Here `getTalks()` is cached, so the fallback does not show. With a slow read it would.

## Docs

- `01-app/02-guides/client-side-data-fetching/tanstack-query.md`: "Set up the provider", "Provide initial data from a Server Component", "Cache server-provided data with Cache Components".
- `01-app/02-guides/single-page-applications.md`: "Using React's `use` within a Context Provider".

Option for cached data: the guide's "Build a prerenderable hydration state" builds the dehydrated state by hand, so the page can stay static. This demo uses `connection()` instead, because it is shorter.
