# Exercise 10: review an agent's draft (about 50 min)

Open http://localhost:3000/exercises/10.

A teammate asked an AI coding agent for a small feature. The agent wrote four files and said "done". You review the draft and fix it in seven tasks. Each task uses one idea from the AI part of Half-Day 2, and its title gives the step. At the end, the feature works, and you have rules that stop the same mistakes next time.

The draft is planted. The workshop author wrote it to look like a typical agent draft, with the failures from Step 16. It is not the output of a real agent run. The real runs are in `docs/agent-runs/`.

You need no agent. If you have one (Claude Code, Cursor or Copilot), the "If you have an agent" parts give you more to do.

This exercise stands alone. You do not need another exercise or demo. Everything you use is in the Setup list.

This is homework. Do it in class only if time allows. If time is short, do the Predict part and Tasks 2 to 5.

## Setup

These files are given. Do not change them.

- `lib/talks.ts`: `getTalks()`, `getTalk(id)` and `addVote(id)`. It starts with `import "server-only"`. The reads are cached with `cacheLife("minutes")`, under the tags `talks` and `talk-${id}`.
- `lib/types.ts`: the type `Talk`.
- `AGENTS.md`, `.mcp.json` and `.cursor/mcp.json`: the files that set up a coding agent for this repo.
- `agent/` and `evals/`: an eve agent that lives in the app, and its test. Its two tools call `GET /api/talks` and `POST /api/talks/vote`, the Route Handlers in `app/api/talks/`.
- `draft/`: the planted draft, as `.txt` files, so that the repo still builds.
- `copy-draft.mjs`: copies the draft into your work folders.
- `ask-mcp.mjs`: asks the dev server the same questions that an agent asks.

Then:

1. Run `npm run reset`, then `npm run dev`. The numbers below are for fresh data.
2. In a second terminal, run `node app/exercises/10/copy-draft.mjs`. It creates `top/` and `eve/` in `app/exercises/10/`. These are your work folders. Edit the files there.
3. Do not open the page yet. Do the Predict part first.

The target:

```
app/exercises/10/
  page.tsx             given: the start page
  draft/               given: the planted draft
  copy-draft.mjs       given: copies the draft into top/ and eve/
  ask-mcp.mjs          given: asks the dev server like an agent
  mcp.json             Task 1: the agent setup, from memory
  review.md            Task 2: your answers to the four questions
  top/
    page.tsx           from the draft. Tasks 3 to 5 fix it
    actions.ts         from the draft. Task 4 fixes it
    vote-button.tsx    from the draft. It is right. Keep it
    top-list.tsx       Task 5: new, the toggle
  agents-rules.md      Task 6: the rules for AGENTS.md
  eve/
    get_talk.ts        from the draft. Task 7 fixes it
    cancel.eval.ts     Task 7: new, a test for the agent
```

The prompt, as the teammate typed it:

```
In app/exercises/10/top/, add a page that lists the talks with the most votes,
top 3 first, with a button that shows all talks. Cache the list for 60 seconds.
Add a Vote button on each row, and make the new count show right away.
Also give the chat agent a tool, get_talk, that returns one talk and its vote count.
Keep it small.
```

The agent's last message (planted, like the draft):

```
Done. I added the top talks page in app/exercises/10/top/:
- page.tsx: a client component that loads the talks, sorts them by votes and
  shows the top 3, with a toggle for all talks. The list is cached for
  60 seconds with cacheLife.
- actions.ts: a vote Server Action that clears the cache, so the new count
  shows right away.
- vote-button.tsx: a form that calls the action.
I also wrote the get_talk tool in app/exercises/10/eve/. It reuses the cached
getTalk() from lib/talks.ts.
I tested the Vote button on talk 1, and the count went up. The feature is complete.
```

The tool is in `eve/`, not in `agent/tools/`, so that the live agent does not change. Task 7 says how to run it.

## Predict

Answer these before you open any file in `top/` or `eve/`. The answers are at the end.

1. Read the prompt. What does it not say about this project?
2. Read the agent's message. Write two lines: the file that you expect to be wrong, and the API in it.
3. The message says "a client component that loads the talks". Which file does that page import, and what is the first code line of that file?
4. The message says that the tool "reuses the cached getTalk()". Where does an eve tool run?

## Task 1: give the agent eyes (Step 14, 6 min)

An agent that can ask the running app sees what the files do not show.

1. Without opening `.mcp.json`, write `app/exercises/10/mcp.json`: the file that tells Claude Code to start `next-devtools-mcp` with `npx`. Then compare it with `.mcp.json` at the repo root. Which file does Cursor read?
2. With `npm run dev` running, run `node app/exercises/10/ask-mcp.mjs`. It sends the request that `next-devtools-mcp` sends: a JSON-RPC `POST` to `/_next/mcp`. You see nine tool names.
3. Run `node app/exercises/10/ask-mcp.mjs get_routes`. Find `/exercises/10/top`. Nobody has opened it yet.
4. Run `node app/exercises/10/ask-mcp.mjs compile_route routeSpecifier=/exercises/10/top`. It compiles the route without a request, and lists its issues. On Windows, run this one in PowerShell or cmd, not Git Bash. Git Bash turns `/exercises/10/top` into a Windows path, and the tool answers `"notFound":true`.
5. Run `node app/exercises/10/ask-mcp.mjs get_logs`. What do you get back?
6. For each question, name the tool that answers it, or write "none".
   - a. Which URLs does this app have?
   - b. What error does the page show in the browser right now?
   - c. Which function runs when the browser posts this action ID?
   - d. Does `/exercises/10/top` get its list from the cache?

You see nine names in step 2, and `/exercises/10/top` in step 3. Step 4 gives five issues, all in `top/page.tsx`. The first is ``Route segment config "revalidate" is not compatible with `nextConfig.cacheComponents`. Please remove it.`` Step 5 gives a file path, not the log.

If you have an agent: open it in the repo. With the dev server running, ask "What errors does the app have right now?" Watch the tool calls. `next-devtools-mcp` 0.4.0 has four tools of its own: `nextjs_index` finds the dev servers, `nextjs_call` calls one of the nine tools, `nextjs_docs` points at the bundled docs, and `browser_eval` drives a browser.

Why: an agent learns about an app in two ways. It reads files, or it asks the running dev server. The second way works only while `next dev` runs, and only through `/_next/mcp`. `get_routes` reads the folders, so it lists a route that nobody compiled. `get_logs` returns a path, and the agent must still read the file. No tool looks inside the cache.

## Task 2: the four questions (Step 15, 6 min)

Review the draft before you fix anything.

1. Run `npx tsc --noEmit`. Write down the errors.
2. Open http://localhost:3000/exercises/10/top. Write down the first error in the overlay. If other pages, such as `/exercises/10`, show the same error, that is the draft too. Tasks 3 to 5 fix it.
3. Run a search for `cacheTag` in `lib/talks.ts`. Count the tags. Count the tags that `top/actions.ts` clears.
4. Create `app/exercises/10/review.md`. Answer the four questions, one or two lines each:
   1. Does the draft do what the prompt asked?
   2. Does it solve the cause, or only hide a symptom?
   3. What else did it touch?
   4. Is there a second copy of the same mistake?

You see two type errors, one in `top/actions.ts` and one in `top/page.tsx`. The overlay shows this build error, at `top/page.tsx` line 12:

```
Route segment config "revalidate" is not compatible with `nextConfig.cacheComponents`. Please remove it.
```

Task 3 fixes it.

If you have an agent: give it the same prompt, with one change: write `agent-top/` instead of `top/`, and `agent-eve/` instead of `eve/`. Then your work and its work do not mix. Watch it work. The stop rule: if it makes the same kind of call three times with a small change each time, stop it. Ask one question: what are you trying to learn? When it says "done", run `git status`, then answer the four questions for its diff too. Delete its folders at the end, and run `npm run reset` if it voted. If `git status` shows new files under `agent/` or `evals/`, delete them too: the live agent uses those folders.

Why: the message is a claim. The type check and the overlay are the evidence. The fourth question is your job, because an agent fixes the line it looks at.

## Task 3: the old habits (Step 16, 4 min)

Two lines come from the Pages Router and from Next 13 to 15. The model learned them from older code.

1. In `top/page.tsx`, find `import { useRouter } from "next/router"` and `export const revalidate = 60`.
2. Open `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-router.md` and search for "Migrating from". Open `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/02-route-segment-config/index.md` and read the version table.
3. Delete `export const revalidate = 60;` and its comment.
4. Delete the `useRouter` import and the `const router` line. Replace the Back button with `<Link href="/exercises/10">Back</Link>`. Import `Link` from `next/link`.

The overlay now shows a new first error:

```
The "use client" directive must be placed before other expressions. Move it to the top of the file to resolve this issue.
```

It is misleading: `"use client"` is on line 1. The draft also has an inline `"use cache"` in a client file, and Task 4 removes it. Then this error goes away.

Here is what the two lines do in `app/` with `cacheComponents: true`:

```
import { useRouter } from "next/router"    compiles, then throws when it renders:
  Error: NextRouter was not mounted. https://nextjs.org/docs/messages/next-router-not-mounted

export const revalidate = 60               does not compile:
  Error: Route segment config "revalidate" is not compatible with `nextConfig.cacheComponents`. Please remove it.
```

Why: in the App Router, `useRouter` comes from `next/navigation`, and a link needs no hook at all. With the flag on, a route has no `revalidate`. The cache lives on the function, with `"use cache"` and `cacheLife`.

## Task 4: the invented cache API (Step 16, 6 min)

An option that looks right, but does not exist.

1. Look at the two type errors from Task 2. One points at `cacheLife({ duration: 60 })` in `top/page.tsx`. The other points at `revalidateTag("talks")` in `top/actions.ts`.
2. Open `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cacheLife.md`. Find the fields of the object, and the table of profiles. What does the profile `"minutes"` do? Which profile does `getTalks()` in `lib/talks.ts` use?
3. In `top/page.tsx`, delete the `"use cache"` line and the `cacheLife` line from `getTopTalks`, and delete the `cacheLife` import. `getTalks()` is already cached. Task 5 removes `getTopTalks` for good.
4. Open `updateTag.md` and `revalidateTag.md` in the same folder. In `revalidateTag.md`, find "No second argument".
5. In `top/actions.ts`, import `updateTag` instead of `revalidateTag`. After `addVote(id)`, call `updateTag("talks")` and `` updateTag(`talk-${id}`) ``.
6. Before `addVote(id)`, add the input check that every Server Action needs: if `id` is not an integer, or it is below 1, `return`.
7. Run `npx tsc --noEmit`.

You see no errors. The overlay now shows a new first error, in `lib/talks.ts`, with an import trace from your page:

```
It is not allowed to define inline "use cache" annotated functions in Client Components.
```

`compile_route` also lists `'server-only' cannot be imported from a Client Component module`. Task 5 fixes both.

Why: these are two kinds of mistake. `duration` is invented. `cacheLife` has `stale`, `revalidate` and `expire`, and nothing else. `revalidateTag` with one argument is an old form. The docs call it deprecated, and here it is a type error. In a Server Action, `updateTag` makes the next read wait for fresh data, so the person who voted sees the new count. And the draft cleared one tag of two. `next dev` does not run the type check. `next build` does.

## Task 5: the boundary (Step 16, 8 min)

The directive goes on the leaf, not on the page.

1. Read the overlay again. The page starts with `"use client"`, and it imports `getTalks` from `lib/talks.ts`. The `"use cache"` functions in that file cannot run in a Client Component, and the file starts with `import "server-only"`.
2. Create `top/top-list.tsx`. Line 1 is `"use client"`. Export `TopList`. It takes `{ talks }` of type `Talk[]` from `@/lib/types`.
3. Move the toggle into it: `const [showAll, setShowAll] = useState(false);`, the button, and the list with `<VoteButton id={t.id} />` in each row.
4. In `top/page.tsx`, delete `"use client"`, `useState`, `useEffect` and `getTopTalks`. Make the component `async`.
5. Read with `const talks = await getTalks();`. Sort a copy: `[...talks].sort((a, b) => b.votes - a.votes)`.
6. Return the `<h1>`, `<TopList talks={sorted} />` and the Back link.
7. Keep `top/vote-button.tsx` as it is.
8. Reload http://localhost:3000/exercises/10/top. Click "Show all talks". Click Vote in the "Two graphs, one boundary" row.

You see "Caching is opt-in" with 15 votes, "Two graphs, one boundary" with 12, and "Server Actions in production" with 9. The button shows all six talks. After the vote, the row says 13.

Run `npm run reset` to take the vote back.

Why: a page that reads data stays on the server. Only the toggle needs the browser. The `talks` prop crosses the line as JSON. `vote-button.tsx` was right: it has no directive, and it joins the client graph because `top-list.tsx` imports it. Next refused the agent's mistake: the overlay and `compile_route` flag the `"use cache"` functions and `import "server-only"` in `lib/talks.ts`, because both belong to the server. So the data layer did not go to the browser.

## Task 6: the rules (Step 16, 5 min)

Tell the next agent what the managed block does not know.

1. Read `AGENTS.md`. `next dev` writes the block between the two markers. It tells the agent to read the docs in `node_modules/next/dist/docs/`. It says nothing about this project.
2. Create `app/exercises/10/agents-rules.md`. Write one rule for each mistake that you fixed in Tasks 3 to 5. Write each one as an order: "Do this", or "Never do that".
3. Add one rule that makes the agent show proof: the commands it must run, and paste, before it says "done".

In your own project, these lines go in `AGENTS.md`, under the line `<!-- END:nextjs-agent-rules -->`. `next dev` keeps every line outside the two markers. In this repo, leave `AGENTS.md` as it is.

If you have an agent: run the prompt from Task 2 again into `agent-top2/`, with your rules pasted above it. Compare the two runs with the four questions. Which mistakes are gone?

Why: there are three defenses. Rules tell the agent what to do. The docs in `node_modules` match the version you run, so you check every cache API against them. And the build is the fact-checker: an agent's message is a claim, and the build output is the evidence.

## Task 7: an agent that the app runs (Step 17, 8 min)

A tool is a file, and a write waits for a person.

1. Open `eve/get_talk.ts`. Compare it with `agent/tools/list_talks.ts`. Find two differences that matter: where each one gets its data, and what each `inputSchema` allows.
2. Fix the data. Delete the `lib/talks.ts` import. Call `GET /api/talks` with `fetch`, like `list_talks` does, and find the talk with the id. If there is none, `throw` an error.
3. `agent/lib/app.ts` holds `APP` and the type `TalkRow`. Write both into your file, so that it works in any folder.
4. Fix the schema: `z.object({ id: z.number().int().min(1) })`.
5. Answer: does `get_talk` need `approval: always()`? Why does `vote_for_talk` have it?
6. Create `eve/cancel.eval.ts`. Start from a copy of `evals/agent.eval.ts`. Keep only the vote: send "Vote for talk 2" with `t.send`, and check that the call is `pending`. Call `requireInputRequest` with `toolName: "vote_for_talk"` and `optionIds: ["approve", "cancel"]`.
7. Answer with `optionId: "cancel"`, not `"approve"`. Check `t.calledTool("vote_for_talk", { status: "rejected", count: 1 })`, and that the message includes "Nothing changed".
8. Run `npx tsc --noEmit`.

You see no errors. eve's types are installed, so both files type-check on any Node.

The chat on `/agent` uses a scripted model. It picks only `list_talks` and `vote_for_talk`, so it never calls `get_talk`. A real model finds the new tool by its file name. `agent/agent.ts` says how to switch to one.

Why: the tool runs in the eve process, a second Node server next to `next dev`. It is not inside Next. `"use cache"`, `cacheTag` and `server-only` belong to Next. So the tool is a caller from outside, and it uses a Route Handler. The handler still reads through the cached `getTalks()`. eve checks the input against the schema before `execute` runs, so the schema is the guard. A read needs no person. A write does. `agent.eval.ts` tests Approve, and your eval tests Cancel. The type check passed on the draft tool, so only a person could catch its mistake.

## Stretch

1. Run the tool and the eval. This needs Node 24. On Node 22, the app runs, but eve is off. Copy `eve/get_talk.ts` to `agent/tools/get_talk.ts`, and `eve/cancel.eval.ts` to `evals/cancel.eval.ts`. With `npm run dev` running, run `npx eve eval --url http://localhost:3000` in a second terminal. Both evals pass. Then delete the two copies, and run `npm run reset`, because `agent.eval.ts` votes for real.
2. The stop rule on a real run. Open `docs/agent-runs/2.6-planted-bug.md`. It is a real `claude -p` run. The agent fixed the bug at tool call 15. Read the calls after it. At which call do you stop the agent, and what do you ask? The answer is at the end.

## Prove it (4 min)

Answer these when the page works. The answers are at the end.

1. `get_errors` returns no errors. Is the app fine?
2. List the mistakes in the draft. Which check caught each one: the type check, the overlay, the docs, or only you?
3. Which two mistakes did no tool catch?
4. The agent said "The feature is complete". Which one command would have shown it that this was not true?

## Answers

Predict:

1. It does not say Next 16, or that `cacheComponents` is on, or that the reads are already cached. An agent fills these gaps with its training data, and most of that is older Next.
2. Any answer is fine, if you wrote it down before you read the files. Compare it with Task 2.
3. `lib/talks.ts`. Its first code line is `import "server-only"`. A Client Component cannot import it.
4. In the eve process, a second Node server next to `next dev`. Not inside Next.

Task 1:

1. Step 1: Claude Code reads `.mcp.json`. Cursor reads `.cursor/mcp.json`. Both hold the same lines. Compare with `solution/mcp.json`. The file names a program to run. It holds no secret.
2. Step 5: `get_logs` returns `{"logFilePath": ...}`, the path of `.next/dev/logs/next-development.log`. An agent that says "the logs show nothing" after one call has read only a file name.
3. Step 6: a. `get_routes`. b. `get_errors`. c. `get_server_action_by_id`. d. None. No tool shows the cache. Read the code for `"use cache"` and `cacheTag`, and read the action for `updateTag`. That is what a person does too.

Task 2, the four questions:

1. No. The type check fails with two errors, and the page does not compile. "The feature is complete" was a claim.
2. It hides a symptom. It never read `lib/talks.ts`, where `getTalks()` is already cached with `cacheLife("minutes")`. That profile refreshes after 1 minute. So the draft wraps a cached read in a second cache, with an option that does not exist.
3. The message says it voted on talk 1. A vote writes to `db.json`, and `db.json` is in git. After a real run, `git status` shows it. Run `npm run reset`.
4. Yes. `lib/talks.ts` caches the list under `talks` and each talk under `talk-${id}`. The action clears only `talks`, so a page that reads `getTalk(id)` keeps the old count.

Task 7: `get_talk` only reads, so it needs no approval. `vote_for_talk` writes, so a person approves every call, and the eval for Cancel proves that nothing happens without one.

Stretch 2: the run loops from call 20: one page, fetched again and again, and searched in a new way each time. Stop at call 23, after three calls of the same kind. Ask: what are you trying to learn? The answer, the vote count on the page, takes one request and one look. Everything after the fix, calls 16 to 43, cost 28 of the 44 turns.

Prove it:

1. No. It only says that the dev server has no error right now. A route that nobody opened has not compiled. Open it, or call `compile_route`.
2. `cacheLife({ duration })` and `revalidateTag` with one argument: the type check. `"use client"` on a page that imports `lib/talks.ts`: the overlay, because its `"use cache"` functions cannot run in a Client Component, and `server-only` blocks it too. `export const revalidate`: the overlay, `compile_route` and the build. `next/router`: the docs. On this draft, the build and `compile_route` also flag it ("You have a Server Component that imports next/router"), because Next rejected the `"use client"` line and read the page as a Server Component. The one missing tag in the action, and the eve tool that imports `lib/talks.ts`: only you.
3. The missing `talk-${id}` tag, and the eve tool that imports `lib/talks.ts`. Both type-check, and nothing fails on the page that you test.
4. `npx tsc --noEmit`, or `npx next build`, which fails on this draft at compile time, before its type check. Run it and read it before you believe a message.

## Why

Every task is one habit from the AI part of the workshop. Give the agent a way to ask the running app, and know what each tool can and cannot see (Step 14). Review every draft with the four questions, and stop a loop early (Step 15). Expect three failures from older training data: Pages Router habits, the directive on the wrong file, and invented cache options. Defend with rules, the docs, and the build (Step 16). An agent that the app runs gets the same review: it reads through a Route Handler, a person approves every write, and a test checks what it did (Step 17).

Compare with `solution/`. The fixed page runs at http://localhost:3000/exercises/10/solution. `solution/agents-rules.md` has the rules, `solution/mcp.json` the setup, and `solution/eve/` the tool and the eval.

Reset: delete `top/`, `eve/`, `mcp.json`, `review.md` and `agents-rules.md` in `app/exercises/10/`, then run `npm run reset`. Then start `npm run dev` once before the next build or type check. Until then, the generated types in `.next/` still name `top/page.tsx`, and `npx tsc --noEmit` fails with `Cannot find module '../../../app/exercises/10/top/page.js'`.
