# Exercise 9: make the talk board fast (about 50 min)

Open http://localhost:3000/exercises/9.

You get a talk board that works, but the build refuses it. In seven tasks you make it fast and keep it correct. Each task uses one idea from Steps 11 and 12, and its title gives the step. After each task, run the check that the task names.

This exercise is homework. Do it in class only if time allows. If time is short, skip Tasks 6 and 7.

This exercise stands alone. You do not need another exercise or demo. Everything you use is in the Setup list.

## Setup

These files are given. Do not change them.

- `backend.ts`: `fetchTalks()`, `fetchSpeakers()`, `fetchSpeaker(id)` and `saveVote(id)`. They are plain calls to the data server, with no cache. Each read takes 800 ms.
- `lib/api.ts`: the `read()` helper that `backend.ts` uses. It calls `fetch`.
- `lib/types.ts`: the types `Talk` and `Speaker`.

You write all other files in `app/exercises/9/board/`.

Keep `npm run dev` running in another terminal. It starts the data server on port 3001, and `next build` needs it. A build works while `next dev` runs.

Run `npm run reset` before you start. The numbers below are for fresh data: "Two graphs, one boundary" has 12 votes, and the speakers are Noa Levi (id 1), Dan Cohen (2), Maya Peretz (3) and Omer Katz (4).

In `next dev`, a cached read stays cached between requests. When you save a code file, `next dev` clears that cache, so the first load after an edit is slow again.

The target:

```
app/exercises/9/
  page.tsx               given: a link to every result
  backend.ts             given: the plain calls to the data server
  board/
    page.tsx             Task 1: the board (Tasks 2, 3 and 5 change it)
    greeting.tsx         Task 2: "Signed in as ...", from a cookie
    data.ts              Task 3: the cached reads (Tasks 4 and 5 add to it)
    actions.ts           Task 5: the vote
    api/
      talks/
        route.ts         Task 6: the talks as JSON, for the mobile app
      revalidate/
        route.ts         Task 7: the webhook for the program committee
```

## Predict

Answer these before you write code. The answers are at the end.

1. The board in Task 1 reads a cookie and two lists at the top of the page, with no `<Suspense>` and no cache. What does `next build` say?
2. The error gives three fixes: `[stream]`, `[cache]` and `[block]`. Which one fits the cookie, and which one fits the two lists?
3. At the end, which symbol does `next build` print for each of your three URLs: the board, `api/talks` and `api/revalidate`?
4. A user votes. Do you call `updateTag` or `revalidateTag`? And in the webhook?

## Task 1: the starting board (Step 11, 6 min)

Somebody wrote this board before the flag was on. Read what the build says about it.

1. Create `board/page.tsx` with this code:

   ```tsx
   import { cookies } from "next/headers";
   import { fetchSpeaker, fetchSpeakers, fetchTalks } from "../backend";

   export default async function Board() {
     const id = (await cookies()).get("speaker")?.value;
     const me = id ? await fetchSpeaker(Number(id)) : null;
     const [talks, speakers] = await Promise.all([fetchTalks(), fetchSpeakers()]);

     return (
       <main className="space-y-6">
         <h1 className="text-2xl font-bold">Talk board</h1>
         <p>Signed in as {me ? me.name : "a guest"}.</p>
         <ul className="panel divide-y divide-line">
           {talks.map((t) => (
             <li key={t.id} className="flex justify-between px-5 py-3">
               <span>
                 {t.title}, by {speakers.find((s) => s.id === t.speakerId)?.name ?? "unknown"}
               </span>
               <span className="tabular-nums">{t.votes} votes</span>
             </li>
           ))}
         </ul>
       </main>
     );
   }
   ```

2. Open `/exercises/9/board`. The page works. Dev does not block. But the `npm run dev` terminal prints `Error: Route "/exercises/9/board": Next.js encountered uncached data during prerendering.`, and the dev badge at the bottom left of the page turns red with an Issue count.
3. Run `npx next build`. It stops with this error:

   ```
   Error: Route "/exercises/9/board": Next.js encountered uncached or runtime data during prerendering.
   `fetch(...)`, `cookies()`, `headers()`, `params`, `searchParams`, or `connection()` accessed outside of `<Suspense>` prevents the route from being prerendered, blocking the page load and leading to a slower user experience.
   Ways to fix this:
     - [stream] Provide a placeholder with `<Suspense fallback={...}>` around the data access
     - [cache] For uncached data (`fetch`, database calls): cache the access with `"use cache"` (does not apply to `connection()`)
     - [block] Set `export const instant = false` to allow a blocking route
   ```

4. Run `npx next build --debug-prerender`. Now the error points at your line: `> 5 |   const id = (await cookies()).get("speaker")?.value;`

Why: with the flag on, the build tries to render every route before any request comes. A runtime read (`cookies()`) or an uncached read (`fetch`) outside `<Suspense>` stops it. The build names the first one it meets. The dev terminal named the `fetch`, so both problems are real.

## Task 2: stream the cookie (Step 11, 5 min)

Only the greeting depends on the user. Give it its own boundary.

1. Create `board/greeting.tsx`. Export `async function Greeting()`.
2. Move the cookie read into it: `const id = (await cookies()).get("speaker")?.value;`
3. If there is no `id`, return `<p>Signed in as a guest.</p>`.
4. Else read `const me = await fetchSpeaker(Number(id));` and return `<p>Signed in as {me.name}.</p>`.
5. In `page.tsx`, remove the cookie lines and the `fetchSpeaker` import. Render `<Suspense fallback={<p>Checking who you are…</p>}><Greeting /></Suspense>` in place of the old `<p>`. Import `Suspense` from `react`.
6. Run `npx next build --debug-prerender`.

The build still fails, with the same error. But the frame now points at `fetch` in `lib/api.ts`, called from `fetchTalks` in your page. The cookie is fixed. The lists are not.

Why: `[stream]` fixes the cookie. The value differs per request, so it can only stream in. `[cache]` can never fix a cookie. The `fetchSpeaker` read inside `Greeting` is fine: it is inside the boundary, too.

## Task 3: cache the lists (Steps 11 and 12, 7 min)

The talks and the speakers are the same for every user. Cache them.

1. Create `board/data.ts`. Import `cacheLife` from `next/cache`, and `fetchTalks` and `fetchSpeakers` from `../backend`.
2. Write `getTalks()`:

   ```ts
   export async function getTalks() {
     "use cache";
     cacheLife("hours");
     return fetchTalks();
   }
   ```

3. Write `getSpeakers()` the same way, with `cacheLife("days")`. Speakers change less often than votes.
4. In `page.tsx`, read `Promise.all([getTalks(), getSpeakers()])` from `./data` in place of the two `fetch` calls.
5. Run `npx next build`. It is green. Find your row:

   ```
   ◐ /exercises/9/board                                    1h      1d
   ```

6. Reload `/exercises/9/board` a few times.

The first load after a save takes about 1 s. The next loads are fast, because the data server is not called.

Why: `"use cache"` stores the return value. The build puts it in the static shell, and the greeting streams into the hole. That is `◐`. `hours` means revalidate after 1 hour and expire after 1 day. `days` means 1 day and 1 week. The row shows 1h 1d, the shorter of the two. `fetch` is not cached by default under the flag. You opt in.

## Task 4: the cookie rule (Step 11, 5 min)

Cache the speaker in the greeting too. Try the short way first. It is wrong on purpose.

1. In the browser, open DevTools, go to the Console, and run `document.cookie = "speaker=2; path=/"`. Reload. You see "Signed in as Dan Cohen." after a short wait. Reload again: the wait is the same, about 1 s, because `fetchSpeaker` is not cached.
2. In `data.ts`, add this function. Import `cookies` from `next/headers` and `fetchSpeaker` from `../backend`.

   ```ts
   export async function getMe() {
     "use cache";
     cacheLife("days");
     const id = (await cookies()).get("speaker")?.value;
     return id ? fetchSpeaker(Number(id)) : null;
   }
   ```

3. Change `Greeting` to `const me = await getMe();` and `return <p>Signed in as {me ? me.name : "a guest"}.</p>;`. Remove its own cookie read, so `getMe()` is really called.
4. Reload the board, then run `npx next build`. Both print:

   ```
   Error: Route /exercises/9/board used `cookies()` inside "use cache". Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use `cookies()` outside of the cached function and pass the required dynamic data in as an argument.
   ```

5. Do what the message says. Delete `getMe()`. Write `getSpeaker(id: number)` with `"use cache"`, `cacheLife("days")` and `return fetchSpeaker(id);`.
6. Put the cookie read back in `Greeting`, and call `getSpeaker(Number(id))`. Remove the `cookies` import from `data.ts`.

The build is green again. The first load as Dan Cohen takes about 1 s. The next one is fast.

Why: the arguments are the cache key. A cookie read inside the cache is not in the key, so every user would get the first user's name. The `<Suspense>` around `Greeting` does not help here. The rule is about the cache, not the boundary.

## Task 5: tags and the vote (Step 12, 8 min)

Add a Vote button. A voter must see the new count at once.

1. In `data.ts`, import `cacheTag` too. Add `cacheTag("talks")` to `getTalks()`. Add `cacheTag("speakers")` to `getSpeakers()` and `getSpeaker()`.
2. Create `board/actions.ts`. Line 1 is `"use server"`. Import `saveVote` from `../backend`.
3. Export `async function vote(formData: FormData)`. Read `const id = Number(formData.get("id"));`. If it is not an integer, or it is below 1, return. Else `await saveVote(id);`.
4. In `page.tsx`, import `vote`. In each row, put the count in a form with a button:

   ```tsx
   <form action={vote} className="flex items-center gap-3">
     <input type="hidden" name="id" value={t.id} />
     <span className="tabular-nums">{t.votes} votes</span>
     <button className="rounded-[0.625rem] border border-line-strong px-3 py-1 text-sm">Vote</button>
   </form>
   ```

5. Click Vote on "Two graphs, one boundary". The count stays at 12. Open http://localhost:3001/talks/1: the database says 13.
6. In `actions.ts`, import `updateTag` from `next/cache`. After `saveVote`, call `updateTag("talks")`.
7. Click Vote again.

After about 2.5 s, the count shows 14 (your two votes). The `npm run dev` terminal shows `[api] GET /talks` after the `PATCH`, and no `GET /speakers`.

Why: the cache is a copy. A write to the database does not touch the copy. `updateTag("talks")` expires every entry with that tag now, so the page reads fresh data for the user who voted. The speakers have another tag, so they stay cached. The form needs no `"use client"`: a Server Action works in a plain `<form>`.

Reset the vote counts with `npm run reset`. It changes only the database. The board keeps its cached counts until you save a code file, or until you call the webhook from Task 7 with `?tag=talks`.

## Task 6: the JSON for the mobile app (Step 12, 4 min)

The mobile app needs the talks as JSON.

1. Create `board/api/talks/route.ts`. Import `getTalks` from `../../data`.
2. Export `async function GET()` that returns `Response.json(await getTalks())`. Do not read the request.
3. Run `npx next build`. Find the row:

   ```
   ○ /exercises/9/board/api/talks                          1h      1d
   ```

4. Vote on the board. Then open the link on `/exercises/9`.

The JSON shows the new count too.

Why: a `GET` handler follows the page rules under the flag. It reads only cached data, so the build renders it once: `○`. `"use cache"` cannot go in the body of `GET`, so it stays on `getTalks()`. The page and the handler call the same function with the same arguments, so they share one cache entry, and one `updateTag("talks")` refreshes both.

## Task 7: the webhook (Step 12, 7 min)

The program committee edits the database directly. Their tool then calls a URL to say which data changed.

1. Create `board/api/revalidate/route.ts`. Export `async function POST(request: NextRequest)`. Import the type from `next/server`.
2. Read `const tag = request.nextUrl.searchParams.get("tag");`.
3. If `tag` is not `"talks"` or `"speakers"`, return a `400`:

   ```ts
   return Response.json({ error: `Unknown tag: ${tag}` }, { status: 400 });
   ```

4. Else call `revalidateTag(tag, "max")` from `next/cache`, and return `Response.json({ revalidated: tag })`.
5. Load the board. In `db.json`, change the name "Noa Levi" to "Noa Levi-Cohen" and save. The data server picks up the change. Reload the board: it still says "Noa Levi".
6. Call the webhook. In PowerShell, type `curl.exe` instead of `curl`.

   ```
   curl -X POST "http://localhost:3000/exercises/9/board/api/revalidate?tag=speakers"
   ```

7. Reload the board once. Wait a second, and reload again.

The webhook answers `{"revalidated":"speakers"}`. The first reload still says "Noa Levi", and it is fast. The terminal shows `[api] GET /speakers`. The second reload says "Noa Levi-Cohen". With `?tag=votes`, the webhook answers `400` and `{"error":"Unknown tag: votes"}`.

Why: `revalidateTag` with `"max"` marks the entry stale. The next reader gets the old value at once, while a fresh read runs in the background. That is fine for a webhook: nobody waits for their own write. A real webhook also checks a secret.

Run `npm run reset` to get the old name back. It changes only the database, so call the webhook once more with `?tag=speakers`, and once with `?tag=talks` for the vote counts.

## Stretch

1. `refresh()` is not a tag. In `actions.ts`, replace `updateTag("talks")` with `refresh()` from `next/cache`. Vote. Predict the count, then look. The answer is at the end.
2. The wrong function in the webhook. Replace `revalidateTag(tag, "max")` with `updateTag(tag)`. Call the webhook. Predict the status code, then read the terminal. The answer is at the end.
3. The proxy, if you covered Step 13. The board used to live at `/exercises/9/scoreboard`. In the root `proxy.ts`, add this branch at the top of `proxy()`, and add `"/exercises/9/scoreboard"` to the `matcher` list:

   ```ts
   if (request.nextUrl.pathname === "/exercises/9/scoreboard") {
     return NextResponse.redirect(new URL("/exercises/9/board", request.url));
   }
   ```

   Open `/exercises/9/scoreboard`. You land on the board. Now remove the path from the `matcher` only, and open it again. What do you see? Reset with `git checkout proxy.ts`.

## Prove it (5 min)

Answer these when the board works. The answers are at the end.

1. Run `npx next build`. Which symbol does each of your three URLs get, and why?
2. Task 2 used `[stream]` and Task 3 used `[cache]`. Could you swap them?
3. A vote calls `updateTag("talks")`. Does the board read the speakers again? How can you tell?
4. Why is `/exercises/9/board/api/revalidate` never `○`?

## Answers

Predict:

1. The build fails: `Route "/exercises/9/board": Next.js encountered uncached or runtime data during prerendering`, with the three fixes. A plain build stops at this first failing route.
2. `[stream]` for the cookie, because it differs per request. `[cache]` for the two lists, because they are the same for everyone. `[block]` would make the whole route wait on every request.
3. `◐` for the board, `○` for `api/talks` (both with `1h 1d`), and `ƒ` for `api/revalidate`.
4. `updateTag` in the Server Action: the voter must see the vote. `revalidateTag(tag, "max")` in the webhook: `updateTag` works only in a Server Action.

Prove it:

1. The board is `◐`: the cached lists are in the static shell, and the greeting streams in per request. `api/talks` is `○`: it reads only cached data and never reads the request. `api/revalidate` is `ƒ`: a `POST` handler runs on every request.
2. `[stream]` works for both: wrap the lists in `<Suspense>` and they stream on every request, with no cache. `[cache]` does not work for the cookie. Task 4 showed the error.
3. No. After a vote, the terminal shows `[api] GET /talks` and no `GET /speakers`. Only entries with the tag `talks` expired.
4. It exports `POST`. A write runs on every request, so there is nothing to render at build time. A `GET` that reads `request.nextUrl.searchParams` would be `ƒ` too.

Stretch 1: the count does not change. The database goes up, but the page shows the old count. `refresh()` asks the router to render the page again, and the render calls `getTalks()`, which answers from the cache. No tag was expired.

Stretch 2: `500`. The terminal says `Error: updateTag can only be called from within a Server Action. To invalidate cache tags in Route Handlers or other contexts, use revalidateTag instead.`

Stretch 3: a `404`, with no error in dev or in the terminal. The proxy runs only on paths in the `matcher`. The page does not exist at the old URL, so nothing handles it.

## Why

Steps 11 and 12 in one page. The flag makes the build check every route (Step 11). A runtime read gets a boundary, and data that is the same for everyone gets `"use cache"` with a lifetime (Task 2, Task 3, `cacheLife`). Everything a cached function needs is an argument (Task 4). A timer guesses when data changed, and a tag lets the write say so (Step 12). The user who writes gets `updateTag`. Everyone else gets `revalidateTag` (Tasks 5 and 7). A `GET` handler that reads only cached data is prerendered like a page (Task 6).

Docs, in `node_modules/next/dist/docs/01-app/`: `01-getting-started/08-caching.md`, `01-getting-started/09-revalidating.md`, `01-getting-started/15-route-handlers.md` (With Cache Components), and in `03-api-reference/04-functions/`: `cacheLife.md`, `revalidateTag.md`, `updateTag.md`, `refresh.md`.

Compare with `solution/board/`. The solution runs at http://localhost:3000/exercises/9/solution.

Reset: delete `app/exercises/9/board`, run `npm run reset`, then start `npm run dev` once before the next build. Until `next dev` runs again, `next build` fails with `Cannot find module '../../../app/exercises/9/board/page.js'` in `.next/dev/types/validator.ts`.
