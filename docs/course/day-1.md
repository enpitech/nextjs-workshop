# Half-Day 1: Operate

The mode for today: you read code, and you predict what the runtime does. Every lesson starts with a question and ends with proof on screen.

Before the first lesson: `npm run reset`, then `npm run dev`. Open `http://localhost:3000` in Chrome. Open the repo in the editor.

---

## Lesson 1: Why a server runtime at all (§1.1 and §1.2, 25 min)

### Explain

Two groups sit in every Next.js room. The first group was burned: a cache served old data, a build failed on a line they did not write, a component refused `useState`. The second group doubts the whole idea. Their app is a SPA behind a login. It works. A server sounds like cost with no benefit.

Both groups are right about something. Today gives the first group the model they were missing. The second group gets a real answer in the next five minutes.

A server runtime gives you seven things, and each one has a price. Search engines and link previews can read your pages. The browser downloads less JavaScript. The page can stream: shell first, slow parts later. You deploy one app, with no separate API for page data. The server does work once instead of every device doing it. Secrets and data access have a clear home. Caching is one directive. The price is a Node server to run, a line through your code base, boundaries to place, and a cache model to learn. Everything with a price is what this workshop teaches.

The decision rule is one sentence. If people outside your company must see a page before they log in, you need a server runtime. If every page is behind a login, a SPA with an API is enough, and Next.js is optional.

The rule is for new apps. Nobody rewrites a working app because of a table.

### Show

Nothing in the app yet. Put the table from Notion block 1.1b on screen and read it row by row, cost next to benefit.

Then run the poll from 1.2b. Three volunteers, one minute each: name the app you work on, say whether a stranger sees any page before login, and apply the rule out loud.

### Ask

Your app has a public marketing site and a logged-in dashboard. One app or two?

Answer: either. The public part uses the server runtime. The dashboard can be mostly Client Components behind one layout. The rule decides the runtime. It does not decide the number of repos.

Close with one more question and write the answers on the board: what is the one thing you want to be able to do by tomorrow evening? Read them back at the end of Day 2.

### Where it is

Notion 1.1a, 1.1b and 1.2a to 1.2c. No files.

---

## Lesson 2: The folder is the router (§1.3a to 1.3c, 12 min)

### Explain

Four things at the root of the repo matter. `app/` holds the routes. `public/` holds files served as they are. `proxy.ts` runs on the server before every request that matches its list. `next.config.ts` holds one flag, and that flag is the topic of tomorrow.

One rule makes the folder predictable. A folder is a URL segment. A `page.tsx` inside it makes that URL a route. Nothing else creates a route. A folder without `page.tsx` is only part of the path to another route.

Five special files can sit in a route folder. `page.tsx` renders when the URL matches. `layout.tsx` wraps every route under it and stays mounted when you navigate. `loading.tsx` shows at once while the page waits for data. `error.tsx` catches a render error. `not-found.tsx` renders when nothing matches or when code calls `notFound()`. A sixth file, `route.ts`, is an HTTP endpoint instead of a page. Tomorrow covers it.

One sentence on the bundler: since Next 16, `next dev` and `next build` run on Turbopack. Any answer online that edits a webpack configuration is for the old bundler.

### Show

1. In the editor, open the repo root. Point at `app/`, `public/`, `proxy.ts`, `next.config.ts`. Open `next.config.ts` and show the one line: `cacheComponents: true`. Say: "Tomorrow."
2. Open `app/` and read the folders as URLs, out loud: `app/page.tsx` is `/`. `app/talks/[id]/page.tsx` is `/talks/1`, `/talks/2` and so on. `app/breaks/1/broken/page.tsx` is `/breaks/1/broken`. `app/api/talks/route.ts` is `GET /api/talks`.
3. Point at `app/breaks/1/vote-list.tsx`. Ask the room what URL it is. Answer: none. It has no `page.tsx` name, so it is private to the folder.
4. Open `app/talks/[id]/`. Show the four files: `page.tsx`, `loading.tsx`, `error.tsx`, and `app/not-found.tsx` one level up.
5. Open `app/layout.tsx`. Point at the `metadata` export: that object becomes the `<title>` and `<meta>` tags. There is no `<Head>` component in the App Router.
6. Predict, then open, four URLs in the browser:
   - `http://localhost:3000/talks/1`. For a moment you see gray placeholder blocks. That is `loading.tsx`. Then the talk arrives.
   - `http://localhost:3000/talks/999`. The "Not found" page. The code called `notFound()` because the talk does not exist.
   - `http://localhost:3000/talks/boom`. "Something broke" with the message `Boom: a render error on the server (1.2f)` and a Try again button. That is `error.tsx`.
   - `http://localhost:3000/nothing-here`. The same "Not found" page. No route matched.

### Ask

`notFound()` is called inside `app/talks/[id]/page.tsx`. Which `not-found.tsx` renders?

Answer: the nearest one up the tree. The demo has only `app/not-found.tsx`, so that one.

### Where it is

Notion 1.3a, 1.3b, 1.3c. Files: `next.config.ts`, `app/layout.tsx`, `app/talks/[id]/page.tsx`, `app/not-found.tsx`.

---

## Lesson 3: Delete loading.tsx and watch the route hang (§1.3d to 1.3f, 12 min)

### Explain

`loading.tsx` looks like a nicety. It is not. It is a boundary, and without it the whole route waits for its slowest read.

Under the file is a React primitive: `<Suspense>`. It takes a fallback and children. When a child is still waiting for data, React sends the fallback first and the child later, in the same response. `loading.tsx` is that primitive wrapped around the whole page of one segment. You can also write it by hand around one slow part of a page. The talk page has three reads of 800 ms each, so the difference is easy to see.

`error.tsx` is different from the other route files in one way: it must be a Client Component. Predict why before you look. The server failed while rendering. Something must hold the state "there is an error", show a message, and offer a button. State and a click handler live in the browser. So the file starts with `"use client"`, and Next passes it the error and a `retry` function.

### Show

1. In the editor, open `app/talks/[id]/loading.tsx`. It is one component with gray placeholder blocks.
2. Predict with the room: delete this file. What does the browser show for about 2.6 seconds?
3. Delete the file. In the browser, open `http://localhost:3000/talks/4`, a talk nobody opened yet, so nothing is cached. The old page stays on screen. Nothing changes for 2.6 seconds. Then the whole page appears at once. That is the hang.
4. Restore the file: `git checkout "app/talks/[id]/loading.tsx"`. Open `http://localhost:3000/talks/5`. The placeholders show at once. The page streams in.
5. Put the measured numbers on screen from Notion 1.3d: time to first byte 0.038 s with the file, 2.631 s without it.
6. Open `app/breaks/3/fixed/layout.tsx`. Point at the `<Suspense fallback={...}>` around `<ThemeBanner />`. Same primitive, by hand, around one slow part.
7. Open `app/talks/[id]/error.tsx`. Point at line 1, `"use client"`, and at the `retry` prop. Open `http://localhost:3000/talks/boom` and click Try again. The page throws again, because the route always throws for that id. The point is the button works.

### Ask

`loading.tsx` wraps the page. Does it wrap the layout?

Answer: no. The layout renders outside the boundary. That is why the nav was on screen the whole time during the hang. Only the page area waited.

Second question: the error happened on the server. Why is there still a nav and a message, and not a blank tab?

Answer: the boundary is a Client Component below the layout. The layout rendered. The page did not. The boundary took the page's place.

### Where it is

Notion 1.3d, 1.3e, 1.3f. Files: `app/talks/[id]/loading.tsx`, `app/talks/[id]/error.tsx`, `app/breaks/3/fixed/layout.tsx`. The `retry` prop is stable since Next 16.3.0. The older name is `reset`.

---

## Lesson 4: Navigation for React Router people (§1.3g, 5 min)

### Explain

Most of the room knows React Router. Every habit has a Next.js name, and each name lives in one of two places: the server or the browser.

`<Link to>` becomes `<Link href>` from `next/link`. It prefetches on hover and swaps the page without a full load. `useNavigate()` becomes `useRouter().push()` from `next/navigation`, in the browser. `useLocation()` becomes `usePathname()` and `useSearchParams()`, in the browser. A loader becomes an async Server Component that awaits its data. `<Navigate to>` becomes `redirect()` from `next/navigation`, on the server, and it ends the render. A query string becomes the `searchParams` prop of the page, a promise, on the server.

One trap from building this demo: the nav uses `usePathname()` to mark the active link. The pathname is per request, like `params`. When the nav sits in the root layout with no boundary, it stops `/talks/[id]` from prerendering, and the build says so. The fix is one `<Suspense>` around `<Nav />`.

The import `next/router` is the Pages Router. In `app/` it throws at runtime. Break #6 shows the text.

### Show

1. Open `components/nav.tsx`. Point at `"use client"` on line 1 and `usePathname()` in the body. Click between Talks, Breaks and Exercises in the browser. The active pill follows.
2. Open `app/layout.tsx`. Point at `<Suspense><Nav /></Suspense>`. Read the error from `docs/errors/usepathname-outside-suspense.txt` if the room wants to see what happens without it.
3. Open `app/talks/page.tsx`. Four lines: `redirect("/")`. Open `http://localhost:3000/talks`. You land on `/`.
4. Open `proxy.ts`. Open `http://localhost:3000/admin`. You land on `/`. Same result, different mechanism: the proxy answered before any page ran. Lesson 10 comes back to this file.

### Ask

`redirect()` is called in a Server Component. Where does the code after it run?

Answer: nowhere. `redirect()` throws a special error that Next turns into a 307. The function never returns.

### Where it is

Notion 1.3g and the table in it. Files: `components/nav.tsx`, `app/layout.tsx`, `app/talks/page.tsx`, `proxy.ts`, `docs/errors/usepathname-outside-suspense.txt`.

The "App router vs Pages router" toggle at the end of Notion §1.3 is a handout. Do not read it in the room. Point at it for the people who migrated.

---

## Lesson 5: Two graphs, one line (§1.4a to 1.5c, 20 min)

### Explain

First, remove the wrong picture. The common picture is "some components run on the server, some run in the browser". It is wrong in both directions. A Client Component also renders on the server: on the first load its HTML is in the response before any JavaScript runs. A Server Component never reaches the browser as code: the browser gets its output, not its function.

So "where does it render" is the wrong question. The right question is "which module graph is it in". A module graph is a file and everything it imports.

The app is two module graphs. The server graph starts at `layout.tsx` and `page.tsx`. It runs only on the server, and it can import the database, the file system and secrets. The client graph starts at every file with `"use client"`. It ships to the browser, and it also runs once on the server to make the first HTML. Between the graphs there is one line. Everything that crosses it is serialized: turned into text the other side can read.

This is the model for both days. Every boundary bug in the workshop is a wrong answer to one question: on which side of the line is this file?

Two rules follow. One: `"use client"` does not mean "this file is a Client Component". It means "the client graph starts here". Every module imported from that file is in the client graph, with or without a directive of its own. Two: a file with no directive is not a Server Component by itself. It belongs to whichever graph imports it. The same file can be in the server graph on one route and in the client graph on another.

Now the expensive part. A Client Component imports a component that was written as a Server Component. Nothing happens at build time. No error. The imported component is now in the client graph. If it only renders JSX, it works and ships. If it reads the database, the database code and its connection string ship too. Nothing warns you. The guard is one import at the top of the data layer: `import "server-only"`. With it, the same wrong import is a build error.

A Server Component cannot hold state, and now you can say why: state means an event in the browser re-runs the component. The component's code is not in the browser. Nothing can re-run it.

### Show

1. Draw the two graphs on the board, with the demo's files on it:

   ```
   server graph                          line          client graph
   app/layout.tsx, app/page.tsx --+                    components/nav.tsx ("use client")
   lib/talks.ts ("server-only")   +-- talks (JSON) --> components/talk-list.tsx ("use client")
   lib/api.ts                                          useState, onClick, next/link
   ```

2. Open `app/page.tsx`. It is async. It awaits `getTalks()` and hands the array to `<TalkList talks={talks} />`. That prop is the line.
3. Open `components/talk-list.tsx`. Line 1 is `"use client"`. It has `useState` for the category filter. It imports `next/link`, so `next/link` is in the client graph because of this import.
4. In the browser on `/`, press Ctrl+U for the page source. Search for the title of the first talk, "Two graphs, one boundary". It is in the HTML. The Client Component ran on the server for the first render.
5. Open `lib/talks.ts`. Line 3 is `import "server-only"`. Say: "This line is the guard. Without it, the mistake is silent."
6. Prove the guard, in the editor, without saving to the repo for long: open `components/talk-list.tsx`, add `import { getTalks } from "@/lib/talks";` at the top, and watch the dev overlay. If the overlay stays quiet, run `npx next build` in a second terminal. The error reads: `'server-only' cannot be imported from a Client Component module`. Remove the line. The full build output is in `docs/errors/server-only-import-error.txt`. One of the seven errors there says "but you are using it in the Pages Router". That sentence is wrong. Ignore it and read the line above it.
7. Show `useState` in a server file, from the saved text `docs/errors/usestate-in-server-component.txt`: `You're importing a module that depends on useState into a React Server Component module.` Do not type it live. The text is enough.
8. Hydration, three minutes. Read `docs/errors/hydration-mismatch.txt`. The browser's first render of a Client Component must match the server HTML. `Date.now()`, `window`, and locale formatting each give a different value on each side. The fix is always the same: read browser-only values in `useEffect` or in an event handler.

### Ask

This file has no directive. Server or client?

Answer: it depends on which file imports it. Find the importer before you answer.

Second question: what is the first sign that your data layer is in the client bundle?

Answer: without the guard, there is no sign until a runtime failure or a leaked secret. With the guard, the build fails.

### Where it is

Notion 1.4a, 1.4b, 1.5a, 1.5b, 1.5c (the sections "1.4 Server Components foundations" and "1.5 Two-graph mental model"). Files: `app/page.tsx`, `components/talk-list.tsx`, `lib/talks.ts`, `lib/api.ts`, `docs/errors/server-only-import-error.txt`, `docs/errors/hydration-mismatch.txt`, `docs/errors/date-now-in-client-component.txt`.

---

## Lesson 6: Follow-along, read the payload in the network tab (§1.6a, 15 min)

### Explain

Everything that crosses the line is text. You can read that text. It is called the RSC payload, and the browser requests it every time you click a `Link`. Every participant does this on their own laptop. Lead from the front.

### Show

1. Everyone: `npm run dev` is running. Open `http://localhost:3000` in Chrome. Open DevTools with F12. Select the Network tab. Type `_rsc` in the filter box.
2. Predict: you will click a talk title. That is a `Link`. Does the browser request a new HTML page, or something else?
3. Click the first talk title. One request appears: `/talks/1?_rsc=...`. Its type is `text/x-component`. No HTML page was requested. If a request appeared before the click, that was the prefetch on hover.
4. Click the request, then Response. Each line is one row with a number in front.
5. Go back to `/`. Press Ctrl+U. Search for `self.__next_f.push`. The same rows are inlined in the HTML for the first load.
6. Find two kinds of rows. One starts with `I[`: a client reference. It holds a module path such as `components/talk-list.tsx`, a list of chunk files, and the export name `TalkList`. The server did not send the component. It sent an address. The other row is the `talks` prop as plain JSON: `[{"id":1,"title":"Two graphs, one boundary","speakerId":1,"votes":12,"category":"architecture"}, ...]`. That row is the line from lesson 5, made visible.
7. If the room cannot find the rows, put `docs/payloads/home-rsc-rows.txt` on screen. Row numbers and chunk names change on every build. The saved rows say `"track"`, the live data says `"category"`. The shape is the same.

### Ask

Where are the talk titles in this payload, in the component row or in the props row?

Answer: in the props row. The component is an address. The data crossed as JSON. Lesson 7 lists what else can cross.

### Where it is

Notion 1.6a (section "1.6 Reading an RSC payload in the network tab"). File: `docs/payloads/home-rsc-rows.txt`.

---

## Lesson 7: What crosses, and Break #1 (§1.7a to 1.7c, 25 min)

### Explain

A prop from a Server Component to a Client Component becomes a row in the payload. Only values that React can write as text cross. The list is React's, not Next's.

These cross: strings, numbers, booleans, `null`, `undefined`, plain objects and arrays, `Date`, `Map`, `Set`, typed arrays, promises, JSX that was already rendered, and Server Functions as a callable reference.

These do not: functions, class instances such as a `dayjs` object, objects with a null prototype, unregistered symbols, and a React Context object.

The most common failure is a function. A Server Component defines an `onClick`-style handler and passes it down. A function is code. Code does not serialize. The error tells you the fix in its second sentence: move the interactive part across the line, not the function.

There is one kind of function that crosses: a Server Action, marked with `"use server"`. It does not cross as code. It crosses as an ID, and the browser calls it with a POST. Exercise 1 has both answers, because they are two different features.

### Show

1. Put the two-column table from Notion 1.7a on screen. Read three rows: `Date` crosses, a `dayjs` object does not, JSX crosses already rendered.
2. Open `app/breaks/1/broken/page.tsx`. Point at `function onVote(id)` inside the async `Talks` component, and at `<VoteList talks={talks} onVote={onVote} />`. Open `app/breaks/1/vote-list.tsx`: `"use client"`, and it calls `onVote` on click.
3. Predict: which side of the line is `onVote` on? What can the payload hold in its place?
4. Open `http://localhost:3000/breaks/1/broken`. The dev overlay shows:

   ```
   Error: Event handlers cannot be passed to Client Component props.
     <... talks={[...]} onVote={function onVote}>
                               ^^^^^^^^^^^^^^^^^
   If you need interactivity, consider converting part of this to a Client Component.
   ```

5. Open `app/breaks/1/fixed/page.tsx` and `app/breaks/1/fixed/vote-panel.tsx`. The handler moved into a Client Component that wraps the list. The Server Component passes only data. Open `http://localhost:3000/breaks/1/fixed` and click a `+1` button. "Last vote" updates.
6. Ask why `next build` does not catch the broken route. Answer: the broken component awaits `connection()`, so it renders at request time only, and the prerender never reaches the bad prop. That line is there so the build passes. It is not a pattern for real code.
7. Exercise 1, five minutes. Everyone opens `http://localhost:3000/exercises/1` and `app/exercises/1/README.md`. Same break. Two correct fixes: wrap the list in a Client Component, or make `onVote` a Server Action with `"use server"` and call the vote action inside it. Compare with `app/exercises/1/solution/page.tsx`. Reset with `git checkout app/exercises/1`.

### Ask

A `Date` crosses. A `dayjs` object does not. Why?

Answer: `Date` is a built-in that React knows how to write. A `dayjs` object is a class instance. The rule is about what React can serialize, not about what is useful.

### Where it is

Notion 1.7a, 1.7b, 1.7c (section "1.7 The use directives"). Files: `app/breaks/1/broken/page.tsx`, `app/breaks/1/fixed/page.tsx`, `app/breaks/1/fixed/vote-panel.tsx`, `app/breaks/1/vote-list.tsx`, `app/exercises/1/`, `docs/errors/break-1-function-prop.txt`.

---

## Lesson 8: children, the barrel trap, and Exercise 2 (§1.7d to 1.7f, 37 min)

### Explain

A Client Component can import a Server Component, and that import converts it. To render one without converting it, pass it in as `children`. The Server Component renders on the server first. Its output crosses as JSX, which is on the list. The Client Component receives `children` and never sees the code. `children` is content. It is not a callback.

The second trap is the barrel file. A barrel is an `index.ts` that re-exports many components. Put `"use client"` on it, and the barrel becomes one client entry that imports everything it re-exports. The bundler cannot drop what the entry imports. A page that renders one badge ships the whole barrel, including a 622 KB table that plays the role of a charting library. No error. The cost is only visible in the bundle analyzer, because Next 16 removed the per-route size columns from the build table.

Exercise 2 puts both ideas in one file. The route works. That is the problem.

### Show

1. Open `components/collapsible.tsx`. `"use client"`, `useState`, and it renders `{open && children}`. Open `components/speaker-bio.tsx`: no directive, async, reads `getSpeaker()` from the server-only data layer. Open `app/talks/[id]/page.tsx` and find `<Collapsible title=...><SpeakerBio id={speaker.id} /></Collapsible>`.
2. Open `http://localhost:3000/talks/1`. Click "About Noa Levi". The bio appears at once. Ask: was the bio fetched before the click or after? Answer: before. It arrived in the payload, already rendered.
3. Open `components/ui/index.ts`. Line 1 is `"use client"`. It re-exports `Badge`, `Card`, `EmojiPicker`. Open `components/ui/emoji-picker.tsx` and show that it imports `emoji-table.ts`. Do not open the table file. It is 622 KB.
4. Open `app/breaks/2/broken/page.tsx`: it imports only `Badge` from the barrel and renders one badge. Predict: what ships to the browser?
5. Put the two treemaps on screen: `docs/build-logs/break-2-broken-treemap.jpg` and `docs/build-logs/break-2-fixed-treemap.jpg`. Broken: 404 KB compressed, and `components/ui/` is a 130 KB box, almost all of it the emoji table. Fixed: 274 KB, and no `components/ui/` box. If there is time, run it live: `npx next build`, then `npx next experimental-analyze`, and pick the route in the selector at the top left.
6. Open `app/breaks/2/fixed/page.tsx`. One line changed: import from `@/components/ui/badge`, not from the barrel.
7. Exercise 2, fifteen minutes. Everyone opens `app/exercises/2/README.md` and `app/exercises/2/talk-detail.tsx`. The whole view has `"use client"`, and it imports from the barrel. One button needs state. Three moves: put the directive on a small `CommentsToggle` leaf, pass the comments as rendered `children`, import `Badge` and `Card` from their own files. Compare with `app/exercises/2/solution/`. Keep your answer. It goes on screen tomorrow next to an AI agent's answer to the same question.

### Ask

The barrel has no directive, and `emoji-picker.tsx` has one. What ships now?

Answer: only what the page imports. Without the directive the barrel is a plain module, and the bundler follows the one import.

### Where it is

Notion 1.7d, 1.7e, 1.7f. Files: `components/collapsible.tsx`, `components/speaker-bio.tsx`, `components/ui/index.ts`, `app/breaks/2/`, `app/exercises/2/`, `docs/build-logs/break-2-chunks.txt` and the two treemap images.

---

## Lesson 9: "use client" against "use server", and the vote action (§1.7g, 10 min)

### Explain

The two directives look like a pair. They do different things. `"use client"` marks the start of the client graph, on a file. `"use server"` marks a function the browser can call, on a file or on one async function. What crosses for the first is the module, as a client reference. What crosses for the second is an ID. The code stays on the server.

The security difference matters. A `"use client"` file ships to every browser. A `"use server"` function is a public POST endpoint. Anyone can call it with any input. Validate inside it.

The vote action is six lines. Connect it to a plain HTML form. There is no `onSubmit`, no `fetch`, and no API route. The form works before any JavaScript loads, because it is a real form with a real POST.

### Show

1. Open `app/talks/actions.ts`. Read the `vote` function line by line: `"use server"` at the top of the file, `addVote(id)` writes to the backend, then two `updateTag` calls. Say: "Nobody explains `updateTag` today. Tomorrow it is the main topic."
2. Open `app/breaks/5/broken/page.tsx`. That is the plain form: `<form action={voteStale}>`, a hidden `id` input, one button. Same shape as the six-line action, connected to a form. The talk page has a richer version, and Day 2 lesson 5 upgrades it.
3. In the browser, open `http://localhost:3000/breaks/5/broken` with the Network tab open. Click Vote. Read the request:

   ```
   POST /breaks/5/broken               same URL as the page
   Accept: text/x-component            the response is a payload, not HTML
   next-action: <44-hex-character id>  which function to run
   body: FormData                      id=2
   ```

   The function never crossed. Its ID did. The server looked up the ID and ran the code. The saved capture is in `docs/payloads/vote-action-post.txt`.
4. Do not look at the vote count yet. The count on this page is the topic of Break #5 tomorrow. Run `npm run reset` after the room leaves.

### Ask

The form works before the JavaScript loads. Why?

Answer: it is a real HTML form with a real POST. React upgrades it after hydration. Tomorrow adds pending state to it.

### Where it is

Notion 1.7g. Files: `app/talks/actions.ts`, `app/breaks/5/broken/page.tsx`, `app/breaks/5/actions.ts`, `docs/payloads/vote-action-post.txt`.

---

## Lesson 10: Runtime reads and the dynamic cascade (§1.8a to 1.8d, 21 min)

### Explain

Five values exist only after a request arrives: `cookies()`, `headers()`, `draftMode()`, `params` and `searchParams`. In Next 16 all five are promises, and you must await them. Next 15 accepted the old synchronous form with a warning. Next 16 removed it. A codemod does the edit.

The `await` is the point. Every one of these is a runtime read, and the build treats a runtime read as the line between static and dynamic. One such read in a layout makes every route under that layout dynamic. The pages did nothing wrong. They pay for one line above them.

The build table prints a symbol per route. `○` is static: rendered once at build time and served as a file. `●` is static with one copy per value from `generateStaticParams`. Not in this repo. `ƒ` is dynamic: rendered on the server on every request. `◐` is partial prerender: a static shell served at once, with holes that stream at request time. Only with the flag on.

Then `proxy.ts`. It was `middleware.ts` before Next 16. It runs on the Node runtime before every request that matches its list. Two ways to break it: set a runtime, which throws at startup, or delete the matcher, which makes every request match, including `/`, and `/` redirects to `/` until the browser gives up. Same shape as the cascade: one server-side line, and every route pays.

### Show

1. Open `app/talks/[id]/page.tsx`. First line of the body: `const { id } = await params;`. Show the type: `params: Promise<{ id: string }>`.
2. Open `app/breaks/3/broken/layout.tsx`. One line at the top reads a cookie to pick a theme. Under it are two pages, `a` and `b`, one line of static text each. Predict: what does `next build` say about the two pages?
3. Put `docs/build-logs/build-flag-on.txt` on screen. Find the four Break #3 routes:

   ```
   ├ ƒ /breaks/3/broken/a
   ├ ƒ /breaks/3/broken/b
   ├ ◐ /breaks/3/fixed/a
   ├ ◐ /breaks/3/fixed/b
   ```

   Both broken pages are `ƒ`. The reason is not in the pages.
4. Open `app/breaks/3/fixed/layout.tsx`. The read moved into `ThemeBanner`, wrapped in `<Suspense>`. The pages under it are in the static shell again. Open `http://localhost:3000/breaks/3/fixed/a`, click "dark", and watch the banner change. The cookie read still works. It just has a boundary.
5. Ask why the broken layout builds at all. Point at `export const instant = false`. That line opts the segment out of the check and allows a blocking route. Delete it, and the build fails with the `[stream] [cache] [block]` error. Tomorrow's follow-along does exactly that.
6. Put `docs/build-logs/build-flag-off.txt` next to the flag-on log. Same code, flag off: all four Break #3 routes are `ƒ`. The Suspense fix gives streaming only. With the flag on, the same boundary also marks where the static shell ends, and the route becomes `◐`. Tomorrow explains why. One honesty note: the flag-off log came from a copy with the cache lines removed, because `"use cache"` does not compile with the flag off.
7. Open `proxy.ts`. Read the `proxy` function and the `matcher`. Open `http://localhost:3000/admin`: it lands on `/`. Then in the editor, comment out the `config` export, save, and open `http://localhost:3000/`. The browser stops with "too many redirects". Restore the file. If you would rather not do it live, the runtime error is in `docs/errors/proxy-runtime-export.txt`.

### Ask

Why did `params` and `cookies()` become promises?

Answer: so the part of the page that does not need the request can render before the request arrives. A promise is a read you can defer. The boundary from lesson 3 is where you defer it.

Second question: in the flag-off log, `/` is `○`. The talks came from the database. When does the list change?

Answer: never, until the next build. Static means fixed at build time. That is the stale read of the old model. Break #5 tomorrow is the stale read of the new model.

### Where it is

Notion 1.8a, 1.8b, 1.8c, 1.8d (section "1.8 Async request APIs and the dynamic cascade"). Files: `app/talks/[id]/page.tsx`, `app/breaks/3/`, `proxy.ts`, `docs/build-logs/build-flag-on.txt`, `docs/build-logs/build-flag-off.txt`, `docs/errors/proxy-runtime-export.txt`.

---

## Lesson 11: The five names (§1.9, 5 min)

### Explain

The room arrived with five names from blog posts and interviews: CSR, SSR, SSG, ISR, PPR. The build table prints none of them. It prints symbols. Map each name to a symbol now, so nobody leaves with two vocabularies.

CSR: the server sends a shell, the browser renders the content. That is the React SPA you already know, and in Next it is a Client Component that reads after mount. SSR: the server renders the full HTML on every request. That is `ƒ`, and Break #3's broken layout is the example. SSG: rendered once at build time. That is `○`. ISR: a static page that renders again after a timer or after a tag. That is `○` with a lifetime, and tomorrow's caching lessons are all about it. PPR: a static shell served at once, holes streamed later. That is `◐`, and Break #3's fixed layout is the example.

The five names are not five modes you pick. With the flag on, every route is a static shell plus holes. The names only describe how much of the page is shell. A page can be three of them at once. That is why the build prints a symbol and stops there.

### Show

Put the table from Notion 1.9a on screen. Point at the flag-on build log again for `○`, `ƒ`, `◐`. No `●` in either log, because no route uses `generateStaticParams`.

### Ask

A page has `"use cache"` on its data read and one `<Suspense>` around a cookie read. Which of the five names is it?

Answer: three at once. SSG for the cached part, ISR when that cache expires, PPR for the shell and the hole. The build prints `◐`.

### Where it is

Notion 1.9a, 1.9b. Files: the two build logs.

---

## Lesson 12: Close Day 1 (5 min)

### Explain

Every block today was one arrow on the same drawing. Put it back up.

```
server graph                          line             client graph
app/layout.tsx, app/page.tsx ---+                      components/talk-list.tsx ("use client")
lib/talks.ts, "server-only"     +-- talks (JSON) ----> useState, onClick
proxy.ts (before the request)      next-action: <id> <-- <form action={vote}>
```

Lesson 2 and 3: the files on the left, and where a boundary goes. Lesson 5 and 6: the two graphs and the payload that crosses. Lesson 7 to 9: what may cross and what may not. Lesson 10: a runtime read on the left, and what it does to every route below it.

Tomorrow: what happens to the left side of the drawing when data changes, and an AI agent that gets this app wrong in three known ways. One question to think about until then: the vote action wrote to the database. Which page shows the new number, and which one does not?

### Show

The exit check. A file goes on screen. The room says server, client, or both, before any hint. One person says why in one sentence. Three files, three rounds.

1. `lib/talks.ts`. Answer: server. It has `import "server-only"` on line 3.
2. `app/talks/[id]/error.tsx`. Answer: both. It has `"use client"`, so it ships to the browser, and it also renders on the server for the first HTML.
3. `components/ui/badge.tsx`. Answer: it depends. No directive. On `/exercises/2` it is imported by `talk-detail.tsx`, a client file. On `/exercises/2/solution` the page imports it directly, so it stays on the server. A room that says "server" without asking who imports it has not yet understood lesson 5.

### Ask

Point at the drawing. Where did Break #1, #2 and #3 happen?

Answer: #1 on the arrow, a function tried to cross. #2 at the start of the client graph, a barrel became the entry. #3 on the left side, above the routes, one read in a layout.

### Where it is

Notion "Half-Day 1 close and exit check", Close a to d.

After the room leaves: `npm run reset`, and `git checkout .` if anything was edited live.
