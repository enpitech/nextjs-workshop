# Exercise 11: drive an agent end to end (about 63 min)

Open http://localhost:3000/exercises/11 before you start. Once the draft is in your work folder, read this file in your editor or on GitHub, not in the app. See Setup.

The organizers ask for a new feature: a speakers page, with a comment count for each talk and a form to add a comment. You drive an AI coding agent through it, from the first prompt to the review of its result. You do it in seven tasks. Each task uses one idea from the AI part of the workshop, and its title gives the step. Exercise 10 reviews a finished draft. This exercise covers the rest of the road: what the agent can see, what you tell it, how you read its run, when you stop it, and what you check at the end.

The draft and the run are planted. The workshop author wrote them to look like a typical agent run. They are not the output of a real agent run. The real runs are in `docs/agent-runs/`.

You need no agent. If you have one (Claude Code, Cursor or Copilot), the "If you have an agent" parts give you more to do.

This exercise stands alone. You do not need another exercise or demo. Everything you use is in the Setup list.

This is homework. The in-class path is the Predict part (3 min), Task 1 steps 1 to 5 (6 min), Task 4 (8 min) and Task 5 steps 1 to 5 (11 min). That is about 28 min.

## Setup

These files are given. Do not change them.

- `lib/speakers.ts`, `lib/talks.ts` and `lib/comments.ts`: the reads `getSpeakers()`, `getTalks()` and `getComments(talkId)`. They start with `import "server-only"`. The reads are cached with `"use cache"`, `cacheLife` and `cacheTag`. `getComments` uses the tag `comments-${talkId}`.
- `lib/api.ts`: `API`, the address of the data server, and `read()`. There is no function that adds a comment.
- `AGENTS.md`, `.mcp.json` and `.cursor/mcp.json`: the files that set up a coding agent for this repo.
- `agent/` and `evals/`: an eve agent that lives in the app, and its test. Its tools call the Route Handlers in `app/api/talks/`.
- `draft/`: the planted draft, as `.txt` files, so that the repo still builds.
- `transcript.txt`: the planted run of the agent that wrote the draft.
- `copy-draft.mjs`: copies the draft into your work folder.
- `ask-mcp.mjs`: asks the dev server the same questions that an agent asks.

Then:

1. Run `npm run reset`, then `npm run dev`. The numbers below are for fresh data.
2. In a second terminal, run `node app/exercises/11/copy-draft.mjs`. It creates `speakers/` in `app/exercises/11/`. This is your work folder. Edit the files there.
3. Do not open the page, and do not open `speakers/` or `transcript.txt` yet. Do the Predict part first.

A warning: while the draft is in `speakers/`, `npm run dev` answers every route with a 500 and the error from `speakers/actions.ts`, even `/` and `/exercises/11`. One broken `"use server"` file breaks the whole dev server. Read this README in your editor or on GitHub until Task 5 step 3 is done. The `ask-mcp.mjs` script still answers, and `npx next build` still runs.

The target:

```
app/exercises/11/
  page.tsx             given: the start page
  draft/               given: the planted draft
  transcript.txt       given: the planted agent run
  copy-draft.mjs       given: copies the draft into speakers/
  ask-mcp.mjs          given: asks the dev server like an agent
  prompt.md            Tasks 2 and 3: your prompt
  predict.md           Task 3: your predictions
  correction.md        Task 4: the message that you send
  review.md            Task 5: your answers to the four questions
  speakers/
    page.tsx           from the draft. Task 5 fixes it
    actions.ts         from the draft. Task 5 fixes it
    comment-count.ts   from the draft. Task 5 removes it
    comment-form.tsx   from the draft. It is right. Keep it
  eve/
    search_talks.ts    Task 7: new, a tool for the agent
    search.eval.ts     Task 7: new, a test for the agent
```

The prompt, as the teammate typed it:

```
In app/exercises/11/speakers/, add a page that lists every speaker with their talks.
Show how many comments each talk has. Cache the counts. Add a small form under each
talk to add a comment, and make the new count show right away. Show only one speaker
when the URL has ?speaker=2. Keep it small.
```

The agent's last message (planted, like the draft):

```
Done. I added the speakers page in app/exercises/11/speakers/:
- page.tsx: lists every speaker with their talks and the comment count. The page is
  cached, so it is fast. ?speaker=2 shows one speaker.
- comment-count.ts: a cached count for one talk.
- actions.ts: addComment, a Server Action that clears the count with updateTag.
- comment-form.tsx: a form that calls the action.
I tested the form with a script, and the comment was saved. The feature is complete.
```

## What each task covers

The step numbers are the blocks of the AI part of the workshop notes.

| Task | Step blocks | What you do |
| --- | --- | --- |
| Predict (3 min) | 16b | The predict step of the run protocol: find the gaps in a prompt before you run it |
| 1 | 14a, 14c, 14d, 14e | Ask the dev server what it sees, and see where it is blind. The `.mcp.json` setup (14b) is in Exercise 10 |
| 2 | 16a, 16f | Find the bundled docs for every API in the feature |
| 3 | 15a, 16a, 16b | Write the prompt with the docs in it, and predict the first tool and the first file |
| 4 | 15b, 15d | Read a run one call at a time, and stop the loop |
| 5 | 15c, 16e, 16f | Review the result with the four questions, the docs and the build |
| 6 | 16d | Compare the planted run with a fixed page, or with your own agent on a branch |
| 7 | 17a, 17b, 17c, 17d, 17e, 17f | Write an eve tool and its test. The scripted model (17d) is in step 9 and the Stretch |

Blocks 14b (the `.mcp.json` setup) and 16c (habits from the Pages Router) are not repeated here. Exercise 10 covers both, and Stretch 2 looks for 16c in a real run.

## Predict (3 min)

Answer these before you open `speakers/` or `transcript.txt`. The answers are at the end.

1. Read the prompt. What does it not say about this project?
2. The prompt says "Cache the counts" and "Show only one speaker when the URL has ?speaker=2". Which two requests pull against each other?
3. The page needs a write: add a comment. `lib/` has no such function. Where do you expect the agent to put it?
4. Which cache tag must the action clear? Where do you find its name?

## Task 1: give the agent eyes (Step 14, 8 min)

An agent that can ask the running app sees what the files do not show. It also has blind spots.

1. With `npm run dev` running, and no browser tab open on the app, run `node app/exercises/11/ask-mcp.mjs get_errors`.
2. Run `node app/exercises/11/ask-mcp.mjs get_routes`. Find `/exercises/11/speakers`. Nobody has opened it yet.
3. Run `node app/exercises/11/ask-mcp.mjs compile_route routeSpecifier=/exercises/11/speakers`. It compiles the route without a request, and lists its issues. On Windows, run this one in PowerShell or cmd, not Git Bash. Git Bash turns `/exercises/11/speakers` into a Windows path.
4. Open http://localhost:3000/exercises/11/speakers in a browser tab. Run `get_errors` again, and run `get_page_metadata`.
5. Run `node app/exercises/11/ask-mcp.mjs get_logs`. What do you get back?
6. Run `node app/exercises/11/ask-mcp.mjs` with no tool name. Count the tools. Is one of them a way to look inside the cache?
7. For each question, name the tool that answers it, or write "none".
   - a. Which URLs does this app have?
   - b. What is wrong with `/exercises/11/speakers`, before anyone opens it?
   - c. Which error does the build report for `cacheLife("short")`, and does `compile_route` list it?
   - d. Does the count on the page come from the cache?

You see this:

- Step 1: `{"error":"No browser sessions connected. Please open your application in a browser to retrieve error state."}`
- Step 2: `/exercises/11/speakers` is in the list.
- Step 3: two issues. The first is `Only async functions are allowed to be exported in a "use server" file.`, in `speakers/actions.ts`.
- Step 4: the browser shows a blank page, because the server answers with a 500. `get_errors` returns `{"configErrors":[],"sessionErrors":[]}`. `get_page_metadata` returns `{"sessions":[]}`. Both are empty, and the page is broken.
- Step 5: a file path, not the log.
- Step 6: nine names.

If you have an agent: open it in the repo. With the dev server running, ask "What errors does the app have right now?" Watch the tool calls. `next-devtools-mcp` has its own tools on top of the nine: `nextjs_index` finds the dev servers, `nextjs_call` calls one of the nine tools, `nextjs_docs` points at the bundled docs, and `browser_eval` drives a browser.

Why: an agent learns about an app in two ways. It reads files, or it asks the running dev server. The second way works only while `next dev` runs, and only through `/_next/mcp` (`node_modules/next/dist/docs/01-app/02-guides/mcp.md`, section "How it works"). Routes compile when they are asked for, so an empty `get_errors` proves little: it lists the errors of the pages that a browser has open, and a compile error stops the page from running at all. `get_routes` reads the folders, so it lists a route that nobody compiled. `compile_route` compiles one route and lists its compile issues, but not a type error or a prerender error. `get_logs` returns a path, and the agent must still read the file. No tool looks inside the cache.

## Task 2: find the docs (Step 16a and 16f, 5 min)

Your agent learned Next.js from older code. The docs in `node_modules` match the version that you run. Point the agent at them.

1. Read `AGENTS.md`. The block between the two markers says "read the docs in `node_modules/next/dist/docs/`". It names no file.
2. Create `app/exercises/11/prompt.md`. Write the heading `Read first:`.
3. For each question, find the doc file, and write its path and one line under the heading. Use `grep -rn` or the folder tree. The docs start at `node_modules/next/dist/docs/01-app/`.
   - a. What can a function with `"use cache"` not read?
   - b. Where can `updateTag` be called?
   - c. Which profile names does `cacheLife` know?
   - d. Is `searchParams` an object or a promise?
   - e. What does a route need when it reads `searchParams`?
   - f. Which flag gives a build error a source frame?
4. Read `lib/comments.ts`. Do not change it. In `prompt.md`, add a second heading, `What this project has:`. Under it, write the tag that `getComments` uses, and the rule "Do not write a second read for the same data."

You see the files in the Answers part. Keep `prompt.md`. Task 3 builds on it.

Why: the managed block makes the agent read docs, but it cannot know which page matters for this feature. You know. A path in the prompt costs one line, and it saves the agent from guessing from its training data.

## Task 3: the prompt, and the prediction (Step 15a and 16b, 7 min)

The run protocol has five steps: prompt, predict, run, read, correct. The step that people skip is read.

1. Add the task to `prompt.md`. Start from the teammate's prompt. Change the folder to `agent-speakers/`, so that your agent run and your work do not mix. Add one sentence for the second page: the new count must show on `/talks/1` too.
2. Add a `Proof:` heading with three lines. The agent must run `npx tsc --noEmit` and `npx next build` and paste the output. It must not test with a write. It must stop and report when the same call fails three times.
3. Create `app/exercises/11/predict.md`. Write five lines, before you open `transcript.txt`:
   1. The first tool call.
   2. The first file it reads.
   3. The files that it writes.
   4. Two mistakes that you expect.
   5. How it will know that it is done.

You see the model prompt in `solution/prompt.md`. Keep your `predict.md`. Task 4 checks it.

If you have an agent: this is the moment to send the prompt. Do it in Task 6, on a branch.

Why: a prompt that says only what you want gets an answer from the training data. A prompt that names the docs, the tag and the proof gets an answer that you can check. The prediction is the other half. If you do not write down what you expect, you cannot tell afterwards what surprised you.

## Task 4: read the run, and stop the loop (Step 15b and 15d, 8 min)

Open `transcript.txt`. It has 30 numbered calls.

1. Mark the calls that go to the dev server. Read those first. What did each answer?
2. Read calls 7 and 13. The agent says "No errors reported" after call 13. Does the answer support that?
3. Which tool did the agent never call, and where was the first error already printed?
4. Find the loop. Write the first call of it, and the call at which you stop the agent.
5. Find the refusal. What did the agent do next? What did that touch?
6. Use the cost line. How many of the 30 turns are the loop and the calls after it?
7. Compare calls 1 to 12 with your answers to Predict questions 3 and 4, and with `predict.md` if you wrote it. Which of your predictions came true?
8. Create `app/exercises/11/correction.md`. Write the message that you send to the agent. Write it in four parts: stop, what you know, what to do now, what to run as proof. Keep it under 12 lines.

You see the answers in the Answers part.

If you have an agent: copy the stop rule into its instructions. Then watch for it in your own run.

Why: the agent's last message is a claim. The calls are the evidence. Read them in order, and read the dev server calls first, because they show what the agent can see. The stop rule is short: the same kind of call three times, with a small change each time, is a loop. A loop costs turns and money, and it does not teach the agent anything. The correction has to name what the agent missed. A bare "try again" starts the loop again.

## Task 5: the review (Step 15c, 16e and 16f, 14 min)

The build is the fact-checker. Use it one error at a time.

1. Run `npx tsc --noEmit`. Write down the error.
2. Open `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cacheLife.md` and find the table of profiles. Fix the error. Use a profile from the table.
3. Run `npx next build`. It stops at the compile step, before the type check. Read the first error, fix it, and run it again.
4. The build now reaches the prerender. Read the new first error. Open `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-cache.md` and search for "access runtime APIs". Delete the first line of `speakers/page.tsx`, the `"use cache"` directive.
5. Run `npx next build` again. The error is new, and it has no source frame. Run `npx next build --debug-prerender`. It adds the line of code. Read `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md` around the word "Suspense". Move the code that awaits `searchParams` into an async component, and wrap it in `<Suspense>`. The build is green.
6. Open http://localhost:3000/talks/1 and write down the number after "Comments". Then open http://localhost:3000/exercises/11/speakers?speaker=1 and add a comment to the first talk. The count goes up. Open http://localhost:3000/talks/1 again.
7. Create `app/exercises/11/review.md`. Answer the four questions, one or two lines each:
   1. Does the draft do what the prompt asked?
   2. Does it solve the cause, or only hide a symptom?
   3. What else did it touch?
   4. Is there a second copy of the same mistake?
8. Fix the second copy. Delete `speakers/comment-count.ts`. In the page, read `getComments(t.id)` and show its `length`. In the action, clear the tag from `lib/comments.ts`. Add a comment again, and open `/talks/1`.
9. Run `npm run reset` to take the comments back.

You see these errors, in this order. The first comes from step 1, the others from steps 3, 4 and 5:

```
app/exercises/11/speakers/comment-count.ts(10,13): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Type '"short"' has no properties in common with type '{ stale?: number | undefined; revalidate?: number | undefined; expire?: number | undefined; }'.
```

```
Error: Only async functions are allowed to be exported in a "use server" file.
```

```
Error: Route /exercises/11/speakers used `searchParams` inside "use cache". Accessing dynamic request data inside a cache scope is not supported.
```

```
Error: Route "/exercises/11/speakers": Next.js encountered uncached or runtime data during prerendering.
```

With `--debug-prerender`, the last error ends with `at Speakers (app\exercises\11\speakers\page.tsx:14:23)` and a view of the line `await searchParams`. In step 6, with fresh data, the speakers page goes up to 3, and `/talks/1` still says "Comments 2". After step 8 and one more comment, both pages say 4. If `/talks/1` already says 3, you did not open it before the comment, or more than a minute passed. See the Why part.

Why: this draft fails four times, and each check sees a different one. The compiler sees the export. The type check sees the profile that does not exist: `cacheLife` knows `default`, `seconds`, `minutes`, `hours`, `days`, `weeks` and `max`. The prerender sees request data in a cached scope, and then request data outside a `<Suspense>`. The cached scope cannot read `searchParams`, so the page reads it outside and passes only the value. No check sees the last mistake. The agent wrote `getCommentCount`, a second copy of `getComments`, with its own tag. The action cleared the new tag, and the talk page kept the old one. An agent fixes the line it looks at. The fourth question is your job.

The last mistake is also slow to show. `getComments` uses the profile `minutes`. Its `revalidate` is 1 minute and its `expire` is 1 hour (`cacheLife.md`, the table of profiles). An entry that you filled by opening `/talks/1` stays in the cache. About 1 minute later, the next visit starts a refresh, and the visit after that shows the new count. So open `/talks/1` before the comment, and look right after it. A check that you make after 2 minutes finds the two pages equal, and the bug looks gone.

One more point: the first mistake sits in one file, and it broke every route of the dev server, not only the new page. When the page that you work on looks fine, read the build output too.

## Task 6: run it yourself, and compare (Step 16d, 5 min)

The boundary of the agent is a branch. Anything it writes, you can throw away.

1. Run `git diff --no-index app/exercises/11/speakers app/exercises/11/solution/speakers`. Your fixed work is on the left. The model page is on the right.
2. For each mistake of Task 5, find the line in `solution/speakers/` that handles it. Write the file and the line in `review.md`.
3. Find the one place where `solution/speakers/actions.ts` does more than the draft did. It checks the status of the POST. Why is that useful to an agent that tests the page?

If you have an agent:

1. Commit or stash your work. The agent writes in the same tree.
2. Run `git switch -c agent-speakers-try`.
3. Give the agent your `prompt.md`. Watch it with the stop rule.
4. When it says "done", run `git status`, `npx tsc --noEmit` and `npx next build`. Answer the four questions for its diff. Compare its mistakes with the planted run. Which are gone?
5. Clean up: `git switch -`, then `git branch -D agent-speakers-try`. Delete `app/exercises/11/agent-speakers/`. Run `npm run reset` if it wrote a comment. If `git status` shows new files under `agent/` or `evals/`, delete them too: the live agent uses those folders.

Why: a branch makes a bad run free. You find out what your own agent does with your own prompt, and you pay for it only with time. The planted run is one sample. Your run is the one that matters for your tool and your model.

## Task 7: a tool for the agent that the app runs (Step 17, 9 min)

A tool is a file, and a read needs no approval.

1. Open `agent/agent.ts`, `agent/instructions.md` and the two files in `agent/tools/`. The agent is a folder. The file name is the tool name.
2. Open `next.config.ts`. Find where `withEve` starts the agent and sends `/eve/v1/*` to it, and the line that turns it off.
3. Open `app/api/talks/search/route.ts`. Which URL and which query parameter does it use? What does it return for a talk?
4. Create `app/exercises/11/eve/search_talks.ts`. Start from `agent/tools/list_talks.ts`. Write `APP` and the type `TalkRow` into your file, so that it works in any folder.
5. Write the tool:
   - `description`: what it does, and when to use it. Write it for the model.
   - `inputSchema`: `z.object({ q: ... })`. A string, trimmed, at least 1 character, at most 50.
   - `execute`: call the search URL with `fetch`. Encode the query with `encodeURIComponent`. If the response is not ok, `throw` an error. Return `id`, `title` and `votes` for each talk.
6. Answer: does `search_talks` need `approval: always()`? Why does `vote_for_talk` have it? Why does the tool not import `getTalks` from `lib/talks.ts`?
7. Create `app/exercises/11/eve/search.eval.ts`. Start from a copy of `evals/agent.eval.ts`. Send "Search the talks for server" with `t.send`. Check `t.calledTool("search_talks", { status: "completed", count: 1 })`, and that the message includes "Server Actions in production".
8. Run `npx tsc --noEmit`.
9. Answer: if you copied the tool to `agent/tools/`, why would the eval still fail on the live agent? What finds the tool when a real model runs the agent?

You see no errors in step 8. eve's types are installed, so both files type-check on any Node.

Why: the tool runs in the eve process, a second Node server next to `next dev`. It is not inside Next. `"use cache"`, `cacheTag` and `server-only` belong to Next. So the tool is a caller from outside, and it uses a Route Handler. eve checks the input against the schema before `execute` runs, so the schema is the guard (`node_modules/eve/docs/tools/overview.mdx`, the list of what a tool has). A read needs no person. A write does. A real model chooses a tool by its description, so the description is part of the tool. The scripted model of this repo uses an `if` instead, so it does not know your tool.

## Stretch

1. Run the tool and the eval. This needs Node 24 (`node_modules/eve/docs/getting-started.mdx`). On Node 22, the app runs, but eve is off. Copy `eve/search_talks.ts` to `agent/tools/search_talks.ts`, and `eve/search.eval.ts` to `evals/search.eval.ts`. Apply the two changes in `solution/eve/scripted-model.patch.txt` to `agent/lib/scripted-model.ts`. With `npm run dev` running, run `npx eve eval --url http://localhost:3000` in a second terminal. Then run `git checkout agent/ evals/`, and delete the two copies. This is not verified on the workshop machine.
2. Read a real run. Open `docs/agent-runs/2.7c-haiku-no-block.md`. It is a real `claude -p` run with no `AGENTS.md` block. Read its calls in order. Write the number of the first call that shows an old habit from the Pages Router (block 16c), and the number of the call where you would stop the run.
3. Add a second page: `/talks/1` shows the same comment count as the speakers page. Which tag do both pages share?

## Prove it (4 min)

Answer these when the page works. The answers are at the end.

1. With the draft page open in a tab, `get_errors` returns no errors. Is the page fine?
2. List the four mistakes that stopped the build. Which check caught each one: the compiler, the type check, the prerender, or only you?
3. Which mistake did no tool catch?
4. The agent said "The feature is complete". Which one command would have shown it that this was not true?

## Answers

Predict:

1. It does not say Next 16, or that `cacheComponents` is on, or that the reads in `lib/` are already cached. It does not say which tag the comments use, or that there is no function that adds a comment. An agent fills these gaps with its training data.
2. A cached scope cannot read request data, and `?speaker=` is request data. The agent has to read `searchParams` outside the cache and pass the value in.
3. Any answer is fine, if you wrote it down. The model answer: in the Server Action, with a `fetch` POST to `${API}/comments`. `lib/` is not the agent's to change here. The draft does it that way.
4. `comments-${talkId}`. It is in `lib/comments.ts`, in the `cacheTag` call of `getComments`.

Task 1:

1. Step 7a: `get_routes`. 7b: `compile_route`. It lists the compile issues without a request. `get_errors` cannot, because a compile error leaves no browser session. 7c: the build and `npx tsc --noEmit` report it. `compile_route` did not list it in step 3. 7d: none. No tool shows the cache. Read the code for `"use cache"` and `cacheTag`, and read the action for `updateTag`. That is what a person does too.
2. Step 5: `get_logs` returns `{"logFilePath": ...}`, the path of `.next/dev/logs/next-development.log`. An agent that says "the logs show nothing" after one call has read only a file name.

Task 2 (all paths start with `node_modules/next/dist/docs/01-app/`):

- a. `03-api-reference/01-directives/use-cache.md`, the section with `cookies()`, `headers()` and `searchParams`: cached functions cannot access runtime APIs. Read them outside, and pass the values as arguments.
- b. `03-api-reference/04-functions/updateTag.md`, "Usage": only in Server Actions. A Route Handler uses `revalidateTag`.
- c. `03-api-reference/04-functions/cacheLife.md`, the table: `default`, `seconds`, `minutes`, `hours`, `days`, `weeks` and `max`.
- d. `03-api-reference/03-file-conventions/page.md`, "searchParams (optional)": a promise.
- e. `01-getting-started/08-caching.md`, the part about `<Suspense>`: wrap the component that reads it, and give a fallback.
- f. `03-api-reference/06-cli/next.md`, "--debug-prerender".
- The tag: `comments-${talkId}`, from `lib/comments.ts`.

Task 4:

1. The dev server calls are 6, 7, 8, 13, 20, 23 and 26. Call 6 finds one server. Call 7 and 13 answer "No browser sessions connected". Call 8 lists the routes, and the new route is not in them yet. Calls 20, 23 and 26 give the same answer as call 7.
2. No. The answer says that no browser is open. It says nothing about the page. "No errors reported" is a wrong reading of it.
3. `compile_route`. It would have listed the compile errors, without a browser. The first error was already in the body that call 14 fetched, in a `"message"` field. The agent searched that body only for `<h1`.
4. The loop starts at call 20: the agent edits one line, calls `curl`, and calls `get_errors`. The edits are an import order, a variable name and a comment. They cannot change a compile error. The rounds are 21 and 22, 24 and 25, and 27 and 28. Stop after call 26, the third `get_errors` in the loop with the same answer.
5. Call 17 was refused. In calls 18 and 19, the agent wrote the same request into a script, and the person approved it. It wrote a comment to `db.json`, and `db.json` is in git. Run `npm run reset`. A refusal tells the agent to find another way, and it found a way around the rule. Read the new call before you approve it.
6. The loop and what follows are calls 20 to 30: 11 of 30 turns, about a third of the cost, with no new information.
7. Any answer is fine.
8. The model message is in `solution/correction.md`.

Task 5:

1. The error is in `comment-count.ts`, on `cacheLife("short")`. `tsc` does not see the `export const` in `actions.ts`. It does not see the `searchParams` problems either.
2. Pick `"minutes"` or `"seconds"`. The comment in the file says 30 seconds, and `seconds` has a stale time of 30 seconds.
3. `Only async functions are allowed to be exported in a "use server" file.` Remove the word `export` from `MAX_LENGTH`.
4. The error names `searchParams` inside `"use cache"`.
5. The first run says that the route accessed uncached or runtime data outside `<Suspense>`, and gives three ways out: stream, cache or block. Stream is the one you want: the shell shows right away, and the list streams in. The model page is `solution/speakers/page.tsx`.
6. The speakers page says 3 comments. `/talks/1` says "Comments 2", if you opened it before the comment and less than a minute passed. Both read comments, but they use two tags.
7. The model answers are in `solution/review.md`.
8. After the change and one more comment, both pages say 4 comments.

Task 6: the page and the action in `solution/speakers/` match the fixes of Task 5. The POST check (`res.ok`) makes a failed write an error. Without it, the agent sees a page that looks fine and reports success.

Task 7:

- Step 3: `GET /api/talks/search?q=server`. It returns the talks whose title includes the query.
- Step 6: `search_talks` only reads, so it needs no approval. `vote_for_talk` writes, so a person approves every call. The tool does not import `getTalks` because the eve process cannot use `"use cache"` and `server-only`.
- Step 9: the scripted model has no `if` for `search_talks`, so it calls `list_talks`. A real model finds the tool by its `description` and by what the schema says it needs.
- The model files: `solution/eve/search_talks.ts` and `solution/eve/search.eval.ts`.

Stretch 2: any answer is fine, if it names a call number and says why.

Prove it:

1. No. With a compile error the server answers with a 500 page, and no browser session opens. `get_errors` returns an empty list for a page that does not run. Use `compile_route`, then the build.
2. `export const MAX_LENGTH` in a `"use server"` file: the compiler (the build, `compile_route` and the body of the 500). `cacheLife("short")`: the type check (`npx tsc --noEmit`, and the build after the compile step). `searchParams` read inside `"use cache"`, and then outside `<Suspense>`: the prerender in `next build`, and only the build. Neither `tsc` nor `compile_route` lists it.
3. The second copy of the cache, with its own tag `comment-count-${id}`. The talk page keeps the old comments. Only the fourth question finds it.
4. `npx next build`. It fails on this draft four times. Run it and read it before you believe a message.

## Why

Every task is one habit from the AI part of the workshop. Give the agent a way to ask the running app, and know what each tool can and cannot see (Step 14). Write a prompt that names the docs and the proof, predict the run, read the calls in order, review the result with the four questions, and stop a loop early (Step 15). Defend with the docs and the build, and run your own agent on a branch (Step 16). An agent that the app runs gets the same review: it reads through a Route Handler, it describes itself to the model in words, and a test checks what it did (Step 17).

Compare with `solution/`. The fixed page runs at http://localhost:3000/exercises/11/solution. `solution/prompt.md`, `solution/correction.md` and `solution/review.md` hold the model answers, and `solution/eve/` has the tool, the eval and the change to the scripted model.

Reset: delete `speakers/`, `eve/`, `prompt.md`, `predict.md`, `correction.md` and `review.md` in `app/exercises/11/`, then run `npm run reset`. Then run `npx next build` once. The build rewrites the types in `.next/types`. Until then, they still name `speakers/page.tsx`, and `npx tsc --noEmit` fails with `Cannot find module '../../app/exercises/11/speakers/page.js'`. `npm run dev` does not fix this, because it writes only `.next/dev/types`.
