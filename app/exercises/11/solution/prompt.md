# Exercise 11, Task 3: a prompt that gives the agent what it does not know

Read AGENTS.md first. Then read the docs below in `node_modules/next/dist/docs/01-app/` before you write any code.

Read first:

- `03-api-reference/01-directives/use-cache.md`: what a cached scope can and cannot read.
- `03-api-reference/04-functions/cacheTag.md`, `cacheLife.md` and `updateTag.md`: the tags, the profiles, and where each call is allowed.
- `03-api-reference/03-file-conventions/page.md`: `searchParams` is a promise.
- `01-getting-started/08-caching.md`: what a route needs when it reads request data (`<Suspense>`).

What this project has:

- Next.js 16.3 with `cacheComponents: true`. App Router only.
- `lib/speakers.ts`, `lib/talks.ts` and `lib/comments.ts` are cached already. Comments are cached by `getComments(talkId)` under the tag `comments-${talkId}`. Do not write a second cache or a second read for the same data.
- There is no function that adds a comment. Write the POST to `${API}/comments` inside the Server Action. `API` comes from `lib/api.ts`.
- Do not edit anything in `lib/`, `agent/` or `db.json`.

The task:

In `app/exercises/11/agent-speakers/`, add a page that lists every speaker with their talks. Show how many comments each talk has. Add a small form under each talk to add a comment. After a comment is added, the new count shows right away, here and on the talk page at `/talks/1`. Show only one speaker when the URL has `?speaker=2`. Keep it small.

Proof, before you say "done":

1. Run `npx tsc --noEmit` and `npx next build`. Paste what they print.
2. Name the tag that the action clears, and the file where that tag is set.
3. Do not write to the data server to test. Use `compile_route` for a page that is not open in a browser. `get_errors` sees only pages that are open in a tab.
4. If the same call fails three times, stop and tell me what you learned.
