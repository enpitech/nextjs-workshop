# Half-Day 2: Recognize

The mode for today: you know the model. Today you learn to see a failure before it ships, in your own code and in code an AI agent wrote.

Before the first lesson: `npm run reset`, then `npm run dev`. Same two browser tabs as yesterday. Decide now whether you re-plant the bug for lesson 5 and lesson 8 (the step is in lesson 5).

---

## Lesson 1: Recap, and the action nobody explained (§2.0, 7 min)

### Explain

Yesterday ended with a drawing. Today starts with the room drawing it from memory. Then two facts the room states and you only listen to. Fact one: props cross as serialized data. Plain values, arrays, objects, `Date`, `Map`, `Set`, promises, JSX and Server Actions cross. Functions, class instances and unregistered symbols do not. Fact two: `"use client"` is an entry point. Everything imported from that file is in the client graph. A file with no directive belongs to whoever imports it.

Then the vote action from yesterday, line by line. `"use server"` makes the export callable from the browser. `addVote` writes to the backend. `updateTag` is the line nobody explained. Today that line is the whole topic.

The open question from yesterday: the vote wrote to the database. Which page shows the new number, and which one does not? Collect the guesses. Do not answer. The theme for the day: a write on the server does not change a cached copy. Every lesson until the waterfall is about who tells the copy that the data changed.

### Show

1. One volunteer at the board. Draw the server graph, the client graph, and the line. Place four files: `lib/talks.ts`, `components/talk-list.tsx`, `app/page.tsx`, `app/talks/actions.ts`.
2. Open `app/talks/actions.ts` in the editor. Read `vote` once more. Point at `updateTag("talks")` and say: "This is today."

### Ask

Which of the four files sits on the line itself?

Answer: `app/talks/actions.ts`. It runs on the server, and the browser holds an ID for it. The action is the one thing that crosses in both directions.

### Where it is

Notion 2.0a to 2.0d. File: `app/talks/actions.ts`.

---

## Lesson 2: Caching is opt-in, and the follow-along (§2.1a to 2.1f, 30 min)

### Explain

The flag is one line in `next.config.ts`: `cacheComponents: true`. It replaces three older experiments with one setting. With it on, nothing is cached unless you say so. The old route segment configs are gone: `dynamic`, `revalidate`, `fetchCache` and `dynamicParams` do not compile. Partial prerendering is the default: every route gets a static shell, and the rest streams in.

You say "cache this" with `"use cache"`. It marks an async function, a component, or a whole file. The return value is stored. The next call with the same arguments returns the stored value without running the code. This repo puts it on the data layer functions, not on pages, because pages read `params` and render forms.

One rule catches people. Everything a cached function needs must be an argument. The arguments become the cache key. A runtime read inside the cached scope, such as `cookies()`, is an error, because the key would not include it. Read the cookie outside and pass the value in.

The build is the teacher. A route that reads uncached or runtime data outside `<Suspense>` fails the build, and the error names three fixes with labels: `[stream]` wrap it in Suspense, `[cache]` cache the read, `[block]` opt out with `export const instant = false`. The follow-along makes the room read that error on their own laptop, then fix it twice, once per label.

Order in the room: five minutes of this explanation, then Steps 1 and 2 of the follow-along on every laptop, then the rest of the explanation against the errors on screen, then Steps 3 and 4.

### Show

Step 1, everyone. Open `lib/talks.ts` and `lib/speakers.ts`. In every function, delete all three cache lines: `"use cache";`, `cacheLife(...)`, `cacheTag(...)`. All three, not only the directive. If you delete only the directive, every route fails with a different message: `cacheLife() can only be called inside a "use cache" function`. Keep `npm run dev` running in another terminal, because the build reads the backend. Note: `lib/comments.ts` has the same three lines. The saved log was captured with only the two files edited. Leave it as it is to match the log.

Step 2, everyone. Predict how many routes fail. Then run:

```
npx next build --debug-prerender
```

Read the answer, seven routes:

```
Error occurred prerendering page "/"
Error occurred prerendering page "/breaks/1/fixed"
Error occurred prerendering page "/breaks/5/broken"
Error occurred prerendering page "/breaks/5/fixed"
Error occurred prerendering page "/exercises/1/solution"
Error occurred prerendering page "/exercises/2"
Error occurred prerendering page "/exercises/2/solution"
```

Each one has the same block:

```
Error: Route "/breaks/5/broken": Next.js encountered uncached or runtime data during prerendering.

Ways to fix this:
  - [stream] Provide a placeholder with `<Suspense fallback={...}>` around the data access
  - [cache] For uncached data (`fetch`, database calls): cache the access with `"use cache"` (does not apply to `connection()`)
  - [block] Set `export const instant = false` to allow a blocking route
```

The stack frame points at `read()` in `lib/api.ts`, then at the function that called it. Some routes did not fail. Ask why. `/talks/[id]` has `loading.tsx`, which is a Suspense boundary. `/breaks/1/broken`, `/breaks/4/*`, `/breaks/6/broken` and `/exercises/1` already run at request time. `/api/talks` went dynamic with no message.

Now teach against the output. Open `next.config.ts` for the flag. Open `lib/talks.ts` with the deleted lines in front of you and say what each line did. Show the cookie rule from `docs/errors/cookies-inside-use-cache.txt`: `Accessing Dynamic data sources inside a cache scope is not supported.` Show the four dead segment configs from `docs/errors/segment-config-under-flag.txt`.

Step 3, everyone. Two fixes, one per label. First `[cache]`: put the three lines back into `getTalks()` only. Build again. Seven failing routes become four, because `/`, `/breaks/1/fixed` and `/exercises/1/solution` read only the list. Then `[stream]`: in `app/breaks/5/broken/page.tsx`, move the `getTalk(2)` read into a child component and wrap it in `<Suspense fallback={<p>Loading…</p>}>`. Build again. Four become three, and `/breaks/5/broken` builds as `◐`.

Copy prompt, once. With the directives still deleted, open `http://localhost:3000` in the browser. The page renders, because dev does not block. Click the red issues badge at the bottom left. The overlay says Blocking Route and shows three cards: Stream, Cache, Block. Each has a Copy prompt button. Click the one on Cache. The clipboard now holds a prompt that tells an agent to apply that fix. Lesson 9 comes back to this. The screenshot is `docs/errors/blocking-route-dev-overlay.jpg`.

Step 4, everyone. Restore:

```
git checkout lib/talks.ts lib/speakers.ts app/breaks/5/broken/page.tsx
```

Build once more, zero failing routes. Read the legend at the bottom of the table: `○` static, `◐` partial prerender, `ƒ` dynamic. Break #3 from yesterday was the same story. There it showed as `ƒ` on every child route. Here it is a build error you can read.

Finish with the table from Notion 2.1f: which read gets which fix. Same data for every user: `"use cache"`. Per-request data such as cookies and params: `<Suspense>`. Per-user data that still wants a lifetime: `"use cache: private"`. `Date.now()` during prerender: Suspense plus `connection()`, or a Client Component. A route you are not ready to fix: `instant = false`.

### Ask

The error names `fetch`, `cookies` and `params`. Which of these does `[cache]` fix, and which does it not?

Answer: `[cache]` fixes `fetch` and database reads, because the data is the same for everyone. It cannot fix `cookies`, `headers` or `params`. Those differ per request, and the rule forbids them inside a cache. Those need `[stream]`.

Second question: Step 3 fixed `/` with `[cache]` and `/breaks/5/broken` with `[stream]`. Could you have swapped them?

Answer: `[stream]` works on both. `[cache]` also works on Break #5, and that is exactly the bug of Break #5: the data is cached, and nobody tells the cache about the write.

### Where it is

Notion 2.1a to 2.1f. Files: `next.config.ts`, `lib/talks.ts`, `lib/speakers.ts`, `lib/api.ts`, `app/breaks/5/broken/page.tsx`, `docs/build-logs/2.1e-directives-deleted.txt`, `docs/errors/blocking-prerender.txt`, `docs/errors/cookies-inside-use-cache.txt`, `docs/errors/segment-config-under-flag.txt`, `docs/errors/blocking-route-dev-overlay.jpg`.

---

## Lesson 3: Route Handlers, fetch, and who gets the data how (§2.1g to 2.1j, 12 min)

### Explain

The demo reads a local JSON backend. An AT&T team calls REST services through a gateway. Three questions come up in week one. Is a `fetch` in a Server Component cached? How does a Client Component get data? How do we expose our own endpoint for the mobile app?

The sixth route file, `route.ts`, answers the third one. One export per HTTP method. A Web `Request` comes in, a Web `Response` goes out. It is for callers outside the React tree: a mobile app, a webhook, a third party. A Server Component does not call its own Route Handler. It calls the data layer directly. Under the flag, a `GET` follows the page rules: it prerenders when it reads only cached data. Add a `POST` to the same file and the whole file turns dynamic. So the write lives in its own file.

The first question: `fetch` in a Server Component is not cached by default. It blocks the static shell like a database read, and the build says so with the same three labels. The rule for a REST backend: put the `fetch` inside a `"use cache"` function with `cacheLife` and `cacheTag`. That is what `lib/api.ts` and `lib/talks.ts` do together. The gateway token is read in that function, on the server. It never enters the client graph.

The Next 13 to 15 idiom still exists: `fetch(url, { next: { revalidate: 60, tags: [...] } })`. It is a separate cache layer. It does not remove the build error. It is what an agent trained on older versions writes.

The second question is a table. A Server Component calls the data layer. A Client Component on first render receives props or `children`. A Client Component that writes calls a Server Action. A Client Component that polls or searches as you type calls a Route Handler with SWR or React Query. The mobile app calls `route.ts`.

In a Route Handler, `revalidateTag(tag, profile)` is allowed and `updateTag` is not.

### Show

1. Open `app/api/talks/route.ts`. One `GET` export that calls `getTalks()`. The `"use cache"` is on `getTalks`, not on `GET`. Open `http://localhost:3000/api/talks` in the browser: the JSON list.
2. Put the flag-on build log on screen: `○ /api/talks` with a lifetime of `1m 1h`, and `ƒ /api/talks/vote`.
3. Open `app/api/talks/vote/route.ts`. `POST`, `addVote`, then `revalidateTag("talks", "max")` and a second `revalidateTag` for the tag `talk-<id>`, both with `"max"`. Point at the second argument. Read the comment: `updateTag` here throws, and the one-argument `revalidateTag` is a type error.
4. Open `lib/api.ts`. The `read()` helper is a plain `fetch`. Open `lib/talks.ts`: `getTalks` wraps that `fetch` in `"use cache"`. Say: "Your gateway token goes here, from an environment variable."
5. Call the endpoint from the terminal, so the room sees a write from outside the app:

   ```
   curl -X POST http://localhost:3000/api/talks/vote -H "content-type: application/json" -d "{\"id\":1}"
   ```

   The response is the talk with one more vote. The quoting above is for Git Bash or cmd. In PowerShell, write the body as `'{"id":1}'` with single quotes.

### Ask

The mobile app calls `GET /api/talks`. The web page calls `getTalks()`. Do they share a cache entry?

Answer: yes. Same function, same arguments, same tag. One `updateTag("talks")` refreshes both.

Second question: the mobile app votes through the POST. A web user has the talk page open. What do they see on their next navigation?

Answer: the stale count, served while the entry revalidates in the background. That is what `revalidateTag` with `"max"` means. Lesson 4 compares it with `updateTag`.

### Where it is

Notion 2.1h, 2.1i, 2.1j. Files: `app/api/talks/route.ts`, `app/api/talks/vote/route.ts`, `lib/api.ts`, `lib/talks.ts`.

---

## Lesson 4: Lifetime, tags, invalidation, and Break #5 (§2.2, 25 min)

### Explain

Order in the room: the break first, then the explanation.

`cacheLife` is three numbers. `stale` is how long the browser shows the cached value without asking the server. `revalidate` is how often the server refreshes the entry in the background, while readers get the old value. `expire` is how long an entry can stay unused before the next reader must wait for fresh data. Seven built-in profiles exist, from `seconds` to `max`. This repo uses `minutes` for talks and `hours` for speakers. The build prints the last two numbers per route.

A timer guesses when the data changed. A tag lets the write say so. `cacheTag` puts a label on the entry. A later write names the label, and every entry with that label expires. The tag is a string you choose. Nothing checks that a write names the right one. Keep that gap in mind. It comes back in lesson 8.

Two ways to name a tag from a write. `updateTag` runs in Server Actions only. It expires the entry now, and the user who made the write sees the new value on the response to that action. Use it for forms, votes, anything a user did and expects to see. `revalidateTag(tag, "max")` runs in Server Actions and Route Handlers. It marks the entry stale, and the next read gets the old value while a refresh runs. Use it for webhooks and background jobs, where a lag is fine. The second argument is required. The one-argument form is a type error.

`refresh()` runs in a Server Action and refreshes the client router without expiring anything. Handout only.

### Show

1. Open `app/breaks/5/broken/page.tsx`. It shows the vote count of talk 2 through `getTalk(2)`, which is cached with tag `talk-2`. Its button calls `voteStale`. Open `app/breaks/5/actions.ts`: `voteStale` writes and does nothing else.
2. Predict: click Vote twice. What does the page show? What does the database show?
3. Open `http://localhost:3000/breaks/5/broken`. Click Vote twice. The number on the page does not move. Click the link under the button, `localhost:3001/talks/2`. The database is two higher. No error anywhere. If you already voted here yesterday, the page number is whatever the cache last saw. Run `npm run reset` before this lesson for clean numbers: page 8, database 10 after two clicks.
4. Open `app/breaks/5/actions.ts` again. `voteFresh` is the same action plus one line: `updateTag` with the tag `talk-<id>`. Open `http://localhost:3000/breaks/5/fixed`. Click once. The page and the database agree.
5. Now the explanation. Open `lib/talks.ts`. Point at `cacheLife("minutes")` and `cacheTag("talks")` in `getTalks`, and at the `cacheTag` call with `talk-<id>` in `getTalk`: one entry per talk, one tag per entry. Open `lib/speakers.ts`: `cacheLife("hours")`.
6. Put the profile table from Notion 2.2a on screen for thirty seconds. Do not read it aloud.
7. Put the `updateTag` against `revalidateTag` table from Notion 2.2c on screen. Open `app/api/talks/vote/route.ts` next to `app/breaks/5/actions.ts`: the same write, one with `revalidateTag` because it is a Route Handler, one with `updateTag` because it is a Server Action.

### Ask

The action wrote the new count and returned it. Why did the page still render the old one?

Answer: the page did not read the action's return value. It called `getTalk(2)` again, and the cache answered.

Second question: a vote on talk 2 changes which entries?

Answer: the list, tagged `talks`, and the one talk, tagged `talk-2`. The write must name both.

### Where it is

Notion 2.2a to 2.2e. Files: `app/breaks/5/`, `lib/talks.ts`, `lib/speakers.ts`, `app/api/talks/vote/route.ts`. Reset the counts with `npm run reset`.

---

## Lesson 5: Server Actions with state, and the bug on one screen (§2.4b, 8 min)

Note: this lesson is taught before the waterfall in the Notion order (2.4b comes after 2.3). It sits here in the script because it needs the vote action from lesson 4 fresh in mind, and because the re-plant decision belongs before lesson 8. Move it back after lesson 7 if you prefer the Notion order.

### Explain

The plain form from yesterday had a button and nothing else. No pending state, no message, no way to show an error. `useActionState` adds all three. The action gets one more argument, the previous state, and returns the next state. The form gets three things: a `pending` flag for the button, `state.message` for the result, and a `formAction` that replays a submit made before hydration.

### Show

1. Open `app/talks/actions.ts`, the `voteWithState` function. Previous state in, `VoteState` out. It validates the id, writes, updates both tags, and returns a message with the new count.
2. Open `components/vote-form.tsx`. `"use client"`, `useActionState(action, initial)`, the button reads `pending`, the paragraph reads `state.message`.
3. Open `http://localhost:3000/talks/3`. Click "Vote for this talk". The button says "Voting…" and is disabled. Then a message: `Thanks. Caching is opt-in now has 16 votes.` The header also says 16. Both agree, because the action updates `talk-3`.

The re-plant, decide now. The Notion page and the agent transcript in lesson 8 describe a bug where the message and the header disagree. That bug was fixed in the repo on 2026-09-23. To show it, open `app/talks/actions.ts` and delete the second `updateTag` line, the one with the tag `talk-<id>`, from both `vote` and `voteWithState`. Then on `/talks/3`: the message says 17, the header still says 16. That is the planted bug, visible on one screen. Leave it planted until lesson 8 is done, then `git checkout app/talks/actions.ts`.

An aside, if the room asks about `/submit`: it is a second `useActionState` form. The action sends the title to a model that returns a category and a confidence number. Above 50 percent the action files the talk. Below it, the form asks you to pick. It is outside the workshop outline. `README.md` at the repo root explains it.

### Ask

With the bug planted: the message says 17, the header says 16. Both came from the same response. How?

Answer: the message is the action's return value. The header is `getTalk(3)`, and its cache entry `talk-3` was never updated. The action updated `talks` only. Remember this. Lesson 8 gives this exact report to an agent.

### Where it is

Notion 2.4b. Files: `app/talks/actions.ts`, `components/vote-form.tsx`, `app/talks/[id]/page.tsx`.

---

## Lesson 6: The waterfall, Break #4, and Exercise 3 (§2.3, 20 min)

### Explain

From "is it cached" to "is it slow". Sequential `await` is a concurrency bug, not a React bug. `await` means "do nothing until this returns". Three in a row is a queue. The runtime did what the code said.

Show the terminal first. Three reads, one at a time, each 800 ms, each one starting after the last one ended. Then find the one read that needs another read's result. Keep that one sequential. Start everything else at once with `Promise.all`. That is fix 1: two round trips instead of three. The page still waits for all of it before it shows anything.

Fix 2 removes that limit. Give each independent read its own async component and its own `<Suspense>` boundary. Two components that start rendering at the same time start their reads at the same time. The title is on screen after one read. The rest arrives when it is ready. The boundaries provide the concurrency, with no `Promise.all` at all.

### Show

1. Put the `npm run dev` terminal on screen. Open `http://localhost:3000/breaks/4/broken`. Watch the `[api]` lines:

   ```
   [api] GET /talks/4              200   818 ms
   [api] GET /speakers/1           200   812 ms   <- starts after the first one ends
   [api] GET /comments?talkId=4    200   809 ms   <- starts after the second one ends
   ```

   The page prints the sum at the bottom: about 2500 ms.
2. Open `app/breaks/4/broken/page.tsx`. Three `await` lines in a row. Ask which read needs another one. The speaker read needs `talk.speakerId`. The comments read does not. One dependency, two waits.
3. Open `app/breaks/4/fixed/page.tsx`. `Promise.all` for the talk and the comments, then the speaker. Open `http://localhost:3000/breaks/4/fixed`: about 1700 ms.
4. Exercise 3, twelve minutes. Everyone opens `app/exercises/3/README.md` and `http://localhost:3000/exercises/3`. Same page, about 2400 ms. Fix 1 first, target about 1600 ms. Fix 2 if there is time. Reset with `git checkout app/exercises/3`.
5. Open `app/exercises/3/solution/page.tsx`. Two boundaries at the top level, `TalkHeader` and `Comments`, and a third one inside the header for the speaker name. Open `http://localhost:3000/exercises/3/solution` and watch the sections arrive one by one.

### Ask

The reads are behind `"use cache"` on the real talk page. Does the waterfall exist there?

Answer: yes, on the first request for each talk and after every expiry. A cache hides a waterfall. It does not remove it. Open `app/talks/[id]/page.tsx` and point at the three sequential awaits: `getTalk`, then `getSpeaker`, then `getComments`. That is a waterfall behind a cache.

Second question: fix 2 has no `Promise.all`. Why is it still fast?

Answer: two components that start rendering at the same time start their reads at the same time. The boundaries are the concurrency.

### Where it is

Notion 2.3a to 2.3e. Files: `app/breaks/4/`, `app/exercises/3/`, `lib/api.ts`, `lib/timing.ts`.

---

## Lesson 7: Three sizes of loading (§2.4a, 5 min)

### Explain

One idea, three sizes: show something now, and the real thing when it arrives. The large size is `loading.tsx`, a fallback for a whole route segment under its layout. The middle size is `<Suspense fallback>` around one part of a page. The small size is `useOptimistic`, one value after a write, replaced by the real value when the action returns. The first two are server streaming: the boundary decides where the static shell ends. The third is client state: the browser shows a guess for a moment. The demo does not use it. `useActionState` from lesson 5 is enough for a vote.

### Show

Put the three-row table from Notion 2.4a on screen. Point at the two files the room already saw: `app/talks/[id]/loading.tsx` and `app/exercises/3/solution/page.tsx`.

### Ask

Yesterday we deleted `loading.tsx` and the route hung. Which size would have saved it without the file?

Answer: a `<Suspense>` inside the page around the slow part. The file is the large size. The primitive is the middle one.

### Where it is

Notion 2.4a.

---

## Lesson 8: Setup for AI agents, and one real debugging loop (§2.5 and §2.6, 33 min)

### Explain

An agent has two ways to learn about an app. It can read files, which every agent does. Or it can ask the running dev server, which only works when something answers. The Next DevTools MCP is the part that answers. It is a small process that finds your `next dev` and exposes it as tools: the current errors, the log file path, the route list, the metadata of a page, the source of a Server Action by its ID. It needs `npm run dev` running. With the server down, every tool fails and the agent falls back to reading files.

Three tools are misread most often. `get_routes` scans the filesystem and says nothing about `○`, `◐` or `ƒ`. `get_page_metadata` reads the running server, so a route nobody opened has not compiled yet. `get_logs` returns a path, not the log. An agent that says "the logs show nothing" after one call has read a file name.

There is no cache-inspection tool. Nothing lists entries, tags or ages. An agent asked about stale data has the same three moves a person has: read the code for `"use cache"` and `cacheTag`, read the action for `updateTag`, and compare what the page shows with what the database holds. Name that gap now, so nobody waits for a tool call that cannot come.

No agent runs in the room. The transcript is a real run from 2026-09-16 with Claude Code against this repo, 44 tool calls. The report went to the agent the way a user writes it: no file name, no word "cache", a symptom and two URLs. The room reads the transcript one call at a time, and says what the next call is before it shows.

### Show

1. Open `.mcp.json`. Six lines: run `next-devtools-mcp` with `npx`. `.cursor/mcp.json` is the same file for Cursor. Say: "It names a program. It holds no token. Not a secret."
2. Put the tool table from Notion 2.5c on screen for a moment. Handout material. Say the three misread tools out loud.
3. Open `docs/agent-runs/2.6-planted-bug.md`. Read the prompt at the top, word for word.
4. Predict with the room: which tool does the agent call first, and which file does it open first?
5. Read the first fifteen calls, one at a time, with the room predicting each one:

   ```
    1. ToolSearch            load the next-devtools tools
    2. nextjs_index          which dev servers are running, and their 9 tools
    3. get_routes            the 24 routes of the app
    4. get_errors            none
    5. get_project_metadata  project path, dev server URL
    6. get_page_metadata     the segments of /talks/3
    7. get_request_insights  "not enabled"
    8. Read app/talks/[id]/page.tsx
    9. Read app/talks/page.tsx
   10. Grep  use server|revalidate|use cache|cacheTag|cacheLife|updateTag
   11. Read app/actions.ts
   12. Read lib/db.ts
   13. Read app/breaks/5/actions.ts
   14. Grep  who imports vote
   15. Edit  app/actions.ts: + updateTag(`talk-${id}`)
   ```

   Seven calls against the running server, one grep for the cache words, four file reads, then the fix. Call 10 is the moment the agent knew: "still shows the old number" means cached, so it searched for every cache API in the repo. The transcript names `app/actions.ts` and `lib/db.ts`. Those files were renamed after the run. Today they are `app/talks/actions.ts` and `lib/talks.ts`.
6. The four review questions, on the fix the agent left. Does it fix the reported symptom? Yes, and the agent tested it. Does it fix the cause? Yes, the write now names the entry it changed. What else did it touch? `db.json`, because test votes wrote to the backend, and the agent said so. Is there a second copy of the same bug? Yes, `vote()` in the same file, and the agent did not fix it and did not mention it. The fourth question is always your job.
7. The stop rule. Scroll to calls 16 to 43. The fix was done at call 15. The rest is the agent trying to prove it through the page HTML: one page fetched eight times and grepped seven ways. The same kind of call three times with a small change each time is a loop. A person watching says stop at call 23 and asks one question: what are you trying to learn? The loop cost 28 of 44 turns and most of the money. The fix cost 15.

### Ask

Which of the four review questions did the agent answer on its own?

Answer: the first three, in its final message. The fourth is yours. An agent fixes the line you pointed it at.

Second question: call 36, `get_server_action_by_id`, is a good call in the wrong place. Why?

Answer: it maps an action ID to its source. That is the tool for "which function does this POST run". It came after the agent had already read the source, to confirm an ID it had taken from the HTML.

### Where it is

Notion 2.5a to 2.5e, 2.6a to 2.6d. Files: `.mcp.json`, `.cursor/mcp.json`, `docs/agent-runs/2.6-planted-bug.md`. If you re-planted the bug in lesson 5, restore now: `git checkout app/talks/actions.ts`.

---

## Lesson 9: Three scripted agent failures (§2.7, 42 min)

### Explain

A model learns Next.js from the code that existed when it was trained. Most of that code is Pages Router, or App Router from Next 13 to 15: `getServerSideProps`, `next/router`, `fetch` with a `next` option, `export const revalidate`, `unstable_cache`. Next 16 removed or replaced all of them. The model does not know that unless something it reads says so.

The repo says so in two places. `AGENTS.md` at the root begins with "This is NOT the Next.js you know" and points at the bundled docs. `next dev` writes that block and re-adds it if you delete it. And the code itself: every file is written the Next 16 way, and an agent that reads before it writes copies what it reads.

Each failure was run twice: with a current model and the guard files removed, and with an older model that was trained before Next 16. Failure 1, the Pages-era habits, did not happen with either model. Failure 2, the boundary, happened with the older model exactly as expected. Failure 3, an invented caching API, happened with the older model as a made-up option on a real function.

The protocol for every transcript, and for every agent task at work: prompt, predict, run, read, correct. Read the prompt and notice what it does not say. Write down the file you expect the agent to create and the API you expect it to reach for. Read the transcript one call at a time. Read the diff, then read what `next build` says about the diff. Say what you would tell the agent in one sentence. The prediction is the step that teaches.

Three defenses close the block. One: the managed block in `AGENTS.md`, plus your own lines under it saying that the flag is on, that reads go through the data layer with `"use cache"`, that writes call `updateTag` with every tag they change, and that the backend must be up for the build. Two: compare every cache API in a diff against the bundled docs in `node_modules/next/dist/docs/`. Three: `next build` is the fact-checker. An agent's diff is a claim. The build table is the evidence.

### Show

Failure 1, five minutes as a slide. Open `AGENTS.md` and read the first line. Open `app/breaks/6/broken/old-router-button.tsx`: `useRouter` from `next/router`. Open `http://localhost:3000/breaks/6/broken`. The overlay says `NextRouter was not mounted`. The other two Pages-era lines, `getServerSideProps` and `export const dynamic`, do not compile, and their texts are in `docs/errors/break-6-pages-era.txt`. Then the surprise from the runs: the older model read "never at build time" in the prompt and wrote a cached function with a page that builds as `○`, static. The opposite of the request, with no error anywhere. Ask: what would you have to run to see that it is wrong? Answer: `next build`, and read the symbol.

Failure 2, fourteen minutes, hands-on. The prompt asked for a "Sort by votes" toggle on the home page, kept inside `app/page.tsx`. Everyone opens `docs/agent-runs/2.7d-haiku-no-block.md` on their own laptop. Write the prediction: a toggle needs state, and the page is a Server Component, so where does the state go? Read the transcript down to the diff and mark the one line that is the boundary mistake before the build output is shown. The line is `"use client"` on `app/page.tsx`. The page now imports the data layer into the client graph, and the agent's summary says "complete and syntactically correct". It never ran the build. The build says `'server-only' cannot be imported from a Client Component module`. The guard from Day 1 did its job. Then open `docs/agent-runs/2.7d-fable-no-block.md`: the current model put the state in the URL with `searchParams` and a `Link`, and the page stayed on the server. Now everyone puts their Exercise 2 answer on screen next to the older model's diff. Same question, two answers: where is the directive?

Failure 3, ten minutes. The prompt asked to cache the talks read for 60 seconds and clear it when the vote action runs. Predict which Next 13 to 15 habit appears. Then open `docs/agent-runs/2.7e-haiku-no-block.md`. None of them appeared. The older model kept the Next 16 API it found in the file and invented an option: `cacheLife({ duration: 60 })`. `duration` does not exist. The three real fields are `stale`, `revalidate`, `expire`. The dev server shows the page with no error. The type check catches it: `'duration' does not exist in type '{ stale?: number; revalidate?: number; expire?: number }'`. The current model wrote `cacheLife({ stale: 60, revalidate: 60, expire: 60 })` and found the field names by reading the type declaration in `node_modules/next`. Its transcript is not in the repo, because that agent read a private planning file. Its diff is quoted in Notion 2.7e.

Defenses, three minutes. Open `AGENTS.md` again. Open `node_modules/next/dist/docs/` in the editor and show that it exists. Put the flag-on build log on screen one last time.

### Ask

Which is the stronger defense, the `AGENTS.md` block or a code base already written the right way?

Answer: the code base. The block tells the agent to read docs. The code shows it what to copy. Use both.

Second question: the block says "read the docs before writing any code". Which of the transcripts shows an agent doing that?

Answer: read them and count. A `Read` of a file under `node_modules/next/dist/docs/` is the proof. If that `Read` is missing, that is also an answer.

### Where it is

Notion 2.7a to 2.7f. Files: `AGENTS.md`, `app/breaks/6/`, `docs/errors/break-6-pages-era.txt`, `docs/agent-runs/2.7c-*.md`, `docs/agent-runs/2.7d-*.md`, `docs/agent-runs/2.7e-haiku-no-block.md`, `docs/agent-runs/2.7-haiku-build-checks.txt`.

---

## Lesson 10: Recap and close (§2.8, 20 min)

### Explain

Hand the model back to the room. Six kinds of code, three questions each: where it runs, when it re-runs, who caches it. The room fills the table. The answer key stays hidden until the last row.

Then one sentence each: what would you tell a teammate who missed these two days? Write three answers on the board as they are said. If the room is quiet, use the three that started the workshop. The app is two graphs with one line between them. Nothing is cached unless you say so, and a write must name the tag. Read the build table before you believe an agent.

Answer the doubters from Day 1. Four things transfer to any stack. The two-graph model: every app with a server and a browser has a line. The boundary rules: what crosses as data is the same in every RPC. A question mark on every `await`: sequential waits and a copy nobody told about a write are bugs in any language. Reviewing agent output: predict, run, read, correct.

Name what two half-days did not teach: routing at scale, named production failures, self-hosting, operating in production, migration, and the alternatives tour. Say each one by name so nobody leaves thinking it was covered.

### Show

1. Put the empty table from Notion 2.8a on screen. Fill it with the room. Then show the answer key below it.
2. Read back the three answers from Day 1, lesson 1: "the one thing you want to be able to do by tomorrow evening".
3. The close. What you keep: the Notion page and the repo, with every break, exercise, error text, build log and transcript. The one task this week: in your own app, add `import "server-only"` to the data layer and run `next build`. If it says nothing, draw the two graphs for one route and make sure the drawing is true.
4. The support window and the feedback request, as written in Notion 2.8e. Confirm those terms before the room. The build session wrote them, not you.

### Ask

Which row of the table did you fill last?

Answer: usually the Route Handler. It has the same rules as a page, and that is the lesson.

### Where it is

Notion 2.8a to 2.8e.

After the room leaves: `npm run reset`, `git checkout .`, and stop the dev server.
