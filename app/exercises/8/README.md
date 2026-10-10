# Exercise 8: build the organizer dashboard (about 63 min)

Open http://localhost:3000/exercises/8.

You build a dashboard for a small conference in eleven tasks. Each task uses one idea from Day 1, and its title gives the step. After each task, the dashboard works.

This exercise stands alone. You do not need another exercise or demo. Everything you use is in the Setup list.

Do the tasks in order. If time is short, skip Tasks 4, 6, 9, 10 and 11.

## Setup

These files are given. Do not change them.

- `lib/talks.ts`: `getTalks()`, `getTalk(id)` and `addVote(id)`.
- `lib/speakers.ts`: `getSpeakers()` and `getSpeaker(id)`.
- `lib/comments.ts`: `getComments(talkId)`.
- `lib/types.ts`: the types `Talk`, `Speaker` and `Comment`, and the list `CATEGORIES`.
- `stat-card.tsx`: one number in a box, for Task 3.
- `collapsible.tsx`: a panel that opens and closes, for Task 4.
- `badge.tsx`: a small colored label, for Task 5.
- `theme.css`: the light colors for an element with `data-theme="light"`, for Task 11.

`lib/talks.ts`, `lib/speakers.ts` and `lib/comments.ts` start with `import "server-only"`, so a Client Component cannot import them. The first read takes 800 ms. After that, the answer is cached. When you save a file, `next dev` reloads your code and clears this cache. So the first load after an edit is slow again.

You write all other files in `app/exercises/8/dashboard/`. Plain HTML is fine. Type `children` as `React.ReactNode`. It needs no import.

Run `npm run reset` before you start. The numbers below are for fresh data.

The target:

```
app/exercises/8/
  page.tsx               given: a link to every result
  stat-card.tsx          given: one number in a box
  collapsible.tsx        given: a panel that opens and closes
  badge.tsx              given: a small colored label
  theme.css              given: the light colors
  dashboard/
    layout.tsx           Task 1: the sidebar and a note field, around every dashboard page
    theme-provider.tsx   Task 11: the context that holds the theme
    theme-toggle.tsx     Task 11: the button that switches it
    sidebar-link.tsx     Task 2: a link that knows if it is the current page
    page.tsx             Task 3: the Overview with four numbers
    speaker-list.tsx     Task 4: the speakers
    talks/
      page.tsx           Task 5: the talks
      talk-table.tsx     Task 5: the category filter
      actions.ts         Task 6: the vote action
      vote-button.tsx    Task 6: the vote button
      [id]/
        page.tsx         Task 7: one talk (Task 9 adds its title)
        loading.tsx      Task 7: the placeholder
        error.tsx        Task 8: the box for a crash
        not-found.tsx    Task 8: the box for a missing talk
    api/talks/
      route.ts           Task 10: the talks as JSON
    votes/
      page.tsx           Stretch: an old URL that redirects
```

## Predict

Answer these before you write code. The answers are at the end.

1. Which files in the target get a URL?
2. Which files that you write start with `"use client"`? There are six.
3. Which file starts with `"use server"`?
4. The dashboard needs two kinds of boundary. Where do they go?

## Task 1: the layout (Steps 2 and 3, 5 min)

Every dashboard page gets the same sidebar from one layout.

1. Create `dashboard/page.tsx`. Return `<p>Overview</p>`. Open `/exercises/8/dashboard`. The 404 is now your page.
2. Create `dashboard/layout.tsx`. It gets `children`. Return a `<main>` with `<h1>Organizer dashboard</h1>`, an `<aside>`, and a `<section>` around `{children}`.
3. In the `<aside>`, add two `Link` components from `next/link`: Overview to `/exercises/8/dashboard`, and Talks to `/exercises/8/dashboard/talks`.
4. Under the links, add `<textarea placeholder="A note for the team" />`.

You see the title, the sidebar, and your line. Talks shows a 404 for now.

Why: a folder is a URL segment, and `page.tsx` makes it a route. A layout wraps every page below it and stays mounted when you navigate.

## Task 2: the active link (Step 4, 4 min)

The link to the current page is bold.

1. Create `dashboard/sidebar-link.tsx`. Line 1 is `"use client"`, because a hook needs the browser.
2. Export `SidebarLink` with the props `href`, `end?: boolean` and `children`. Call `usePathname()` from `next/navigation`.
3. Set `active` to `end ? pathname === href : pathname.startsWith(href)`.
4. Return a `<Link href={href}>` with `style={{ fontWeight: active ? "bold" : "normal" }}` around `{children}`.
5. In `layout.tsx`, use `<SidebarLink>` for both links. Give Overview the `end` prop, because every dashboard URL starts with its URL.
6. Wrap the two links in `<Suspense>` from `react`. `usePathname()` reads the URL. On a page with a dynamic segment, such as `talks/[id]` in Task 7, Next knows the URL only when the request comes. So Next needs a boundary around the links. Task 7 shows the error that you get without it.

You see Overview in bold on `/exercises/8/dashboard`.

Why: only the small link is a Client Component, and the layout stays on the server. The `end` prop is the same idea as in React Router `NavLink`.

## Task 3: the numbers (Steps 5 and 6, 4 min)

Show four numbers at the top: talks, votes, speakers and the top talk.

1. Open `dashboard/page.tsx`. Make the component `async`.
2. Import `getTalks` and `getSpeakers`. Read both in one call: `const [talks, speakers] = await Promise.all([getTalks(), getSpeakers()]);`
3. Add up `talk.votes` for the total. Find the talk with the most votes. If two talks tie, take the first.
4. Import `StatCard` from `../stat-card`. Render four cards: Talks, Votes, Speakers and Top talk.

You see 6, 52, 4 and "Caching is opt-in". With an empty cache, the load takes about 0.8 s, because the two reads run together. Two `await` lines in a row take about 1.6 s.

Why: a page is a Server Component by default. It awaits its data on the server, with no `useEffect` and no loading state.

## Task 4: the speakers panel (Step 5, 4 min)

Under the numbers, add a closed panel that opens to show the speakers.

1. Create `dashboard/speaker-list.tsx` with no directive (no `"use client"` line). Make it `async`. Read `getSpeakers()` and return a `<ul>` with the name and bio of each speaker.
2. In `dashboard/page.tsx`, import the given `Collapsible` from `../collapsible`. It starts with `"use client"` and shows `{open && children}`.
3. Under the cards, render `<Collapsible title="Speakers"><SpeakerList /></Collapsible>`.

You see a closed panel. A click shows four speakers.

Why: `Collapsible` has state, so it runs in the browser. `SpeakerList` reads data, so it runs on the server. Give a Server Component to a Client Component as `children`, not as an import.

## Task 5: the talks table (Step 5, 6 min)

Show all talks, with a filter by category.

1. Create `dashboard/talks/page.tsx` and make it `async`. Read `getTalks()` and return `<TalkTable talks={talks} />`.
2. Create `dashboard/talks/talk-table.tsx`. Line 1 is `"use client"`. It takes `{ talks }` of type `Talk[]` from `@/lib/types`.
3. Add `const [category, setCategory] = useState("all");`
4. Get the categories with `Array.from(new Set(talks.map((t) => t.category)))`.
5. Render a `<select value={category} onChange={(e) => setCategory(e.target.value)}>`. Give it `<option value="all">All</option>` and one option per category.
6. Import the given `Badge` from `../../badge`.
7. For each matching talk, render a `<Link>` to `/exercises/8/dashboard/talks/${t.id}` with the title, a `<Badge>` with the category, and `{t.votes} votes`.
8. Open `/exercises/8/dashboard/talks`. Type a note in the sidebar. Click Overview, then Talks.

You see six talks, and two for performance. The note is still there after the clicks.

Why: the page reads the data, and the table holds the state. The `talks` prop crosses the line (from server to browser) as JSON, so it must be plain data. The layout did not remount, so the note stayed. A plain `<a>` loads a new document, and the note is gone.

## Task 6: the vote button (Step 7, 7 min)

Vote for a talk from the table.

1. Create `dashboard/talks/actions.ts`. Line 1 is `"use server"`, so the browser can call every export.
2. Export `async function vote(_prev: { message: string }, formData: FormData)`. Read the id with `Number(formData.get("id"))`.
3. If the id is not an integer, or it is below 1, return `{ message: "No talk id in the form." }`.
4. Call `const talk = await addVote(id);`. Then call `updateTag("talks")` and `` updateTag(`talk-${id}`) `` from `next/cache`. The reads in `lib/talks.ts` are cached. These two lines mark the cached talks as old, so the next read gets the new count.
5. Return `` { message: `Thanks. ${talk.votes} votes now.` } ``.
6. Create `dashboard/talks/vote-button.tsx`. Line 1 is `"use client"`. It takes `{ id }`.
7. Call `useActionState(vote, { message: "" })` from `react`. It returns `[state, formAction, pending]`.
8. Return a `<form action={formAction}>` with `<input type="hidden" name="id" value={id} />`, a `<button disabled={pending}>`, and `{state.message}`. The button says "Vote", or "Voting…" while `pending` is true.
9. In `talk-table.tsx`, render `<VoteButton id={t.id} />` in each row.

Click Vote in the "Two graphs, one boundary" row. The button says "Voting…" for 2 to 3 s. The action waits for two calls to the data server, and then for a fresh read of the talks. Then you see "Thanks. 13 votes now." (one more than 12), and the count in the row goes up. The Votes box on the Overview shows the new total.

Why: a Server Action crosses the line as an ID, and its code stays on the server. It is a public POST endpoint, so it must test its own input. It returns an expected problem as state, and does not throw it.

Reset the vote counts with `npm run reset`.

## Task 7: one talk (Steps 3 and 6, 7 min)

A click on a title opens the talk, with its speaker and comments.

1. Create `dashboard/talks/[id]/page.tsx`. Above the component, write `type Props = { params: Promise<{ id: string }> };`. Type the props as `{ params }: Props`. Task 9 uses the same type.
2. Make the component `async`, and write `const { id } = await params;`.
3. Read the talk with `getTalk(Number(id))`.
4. Read the speaker and the comments in one call: `const [speaker, comments] = await Promise.all([getSpeaker(talk.speakerId), getComments(talk.id)]);`
5. Render the title, the category, `speaker.name`, the votes, and one `<li>` for each comment. Add a `<Link>` back to `/exercises/8/dashboard/talks`.
6. Open `/exercises/8/dashboard/talks/1`. You see "Two graphs, one boundary", its speaker and two comments. With an empty cache, the page appears after about 1.7 s. The dev badge at the bottom left shows "Blocking Route".
7. Create `dashboard/talks/[id]/loading.tsx`. Return a placeholder, for example `<p>Loading the talk…</p>`. Reload the page.

You see the placeholder at once, with the sidebar around it. The talk arrives about 1.7 s later, and "Blocking Route" is gone.

Now see why Task 2 needs its `<Suspense>`. In `layout.tsx`, remove the `<Suspense>` around the links. Reload `/exercises/8/dashboard/talks/1`. The dev badge shows "Blocking Route" again, with the message `Next.js encountered URL data usePathname() in a Client Component outside of Suspense`. Put the `<Suspense>` back.

Why: `params` comes from the request, so the page needs a boundary above it. `loading.tsx` wraps the page in `<Suspense>`, so the layout shows at once. The speaker read needs the talk, so it waits. The comments read runs next to it.

## Task 8: two kinds of trouble (Step 8, 6 min)

A wrong id and a crash must look different.

1. In `[id]/page.tsx`, add this test line right after `await params`. It makes the page crash on purpose for the URL `/talks/boom`.

   ```tsx
   if (id === "boom") throw new Error("Boom: a render error on the server");
   ```

2. Open `/exercises/8/dashboard/talks/boom`, then `/exercises/8/dashboard/talks/99`. Both show the same white page with no sidebar.
3. Create `[id]/error.tsx`. Line 1 is `"use client"`. It gets `{ error, retry }`. Type them as `{ error: Error & { digest?: string }; retry: () => void }`. Render `error.message` and a `<button onClick={() => retry()}>Try again</button>`.
4. Reload `/exercises/8/dashboard/talks/boom`. The sidebar stays, and your box replaces the page.
5. A missing talk is not a crash. Under the `boom` line, call `notFound()` from `next/navigation` when `Number(id)` is not an integer. If you put this test above the `boom` line, `/talks/boom` becomes a 404.
6. Change the read to `getTalk(Number(id)).catch(() => null)`. If the result is `null`, call `notFound()`.
7. Reload `/exercises/8/dashboard/talks/99`. You see "No such talk" from the root `app/not-found.tsx`, with no sidebar.
8. Create `[id]/not-found.tsx` with a message for the dashboard and a link back to Talks. Reload.

You see the sidebar and your message for `/talks/99` and `/talks/abc`. You see the sidebar and your error box for `/talks/boom`. With `curl -i`, the status is still `200`, because `loading.tsx` already sent the page.

Why: `error.tsx` is for what broke, and it is a Client Component for the retry button. `not-found.tsx` is for what is missing. The nearest `not-found.tsx` wins, and the layout stays in both cases.

## Task 9: the tab title (Step 9, 3 min)

Each browser tab says what it shows.

1. In `layout.tsx`, export `const metadata: Metadata = { title: "Dashboard" };`. Import the type `Metadata` from `next`.
2. In `talks/page.tsx`, export `metadata` with the title "Talks".
3. In `[id]/page.tsx`, export `async function generateMetadata({ params }: Props): Promise<Metadata>`. It uses the `Props` type from Task 7. Import the type `Metadata` from `next` in this file too. Await `params` and read the talk with `getTalk(Number(id)).catch(() => null)`.
4. Return `{ title: talk ? talk.title : "No such talk" }`.

You see "Dashboard" on the Overview tab, "Talks" on the table, and the talk title on `/exercises/8/dashboard/talks/1`.

Why: `metadata` is fixed, and `generateMetadata` depends on data. Both work only in a Server Component. A field in a page replaces the same field in its layout.

## Task 10: the export (Step 10, 5 min)

The finance team wants a program to download the talks.

1. Create `dashboard/api/talks/route.ts`. It is `route.ts`, not `page.tsx`.
2. Export `async function GET(request: NextRequest)`. Import the type from `next/server`.
3. Read the category with `request.nextUrl.searchParams.get("category")`.
4. If `category` is not `null` and not in `CATEGORIES` from `@/lib/types`, return a `400`. Write the test as `(CATEGORIES as readonly string[]).includes(category)`, because TypeScript needs the cast.

   ```ts
   return Response.json({ error: `Unknown category: ${category}` }, { status: 400 });
   ```

5. Read `getTalks()`. Return `Response.json(...)` with all talks, or with the talks of that category.
6. In `dashboard/page.tsx`, add `<a href="/exercises/8/dashboard/api/talks">Download the talks as JSON</a>`. Use a plain `<a>`, because the browser must load the JSON itself.
7. Open the three Route Handler links on `/exercises/8`.

You see `200` with all six talks, `200` with the one `ai` talk, and `400` with `{"error":"Unknown category: xyz"}`.

Why: a page answers a person with `not-found.tsx`. A Route Handler answers a program with a status code and an error body. A Server Component calls `getTalks()` directly, not this route.

## Task 11: the theme toggle (Step 5, 8 min)

A button in the sidebar switches the dashboard between dark and light. The choice survives a reload.

1. Create `dashboard/theme-provider.tsx`. Line 1 is `"use client"`, because context and state need the browser.
2. Write `type Theme = "light" | "dark";` and create the context: `const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({ theme: "dark", toggle: () => {} });`
3. Export `ThemeProvider`. It gets `children`. Add `const [theme, setTheme] = useState<Theme>("dark");`
4. Write `toggle`. It sets the other theme and saves it with `localStorage.setItem("exercise-8-theme", next)`.
5. Return `<ThemeContext value={{ theme, toggle }}>` around `<div data-theme={theme} className="rounded-2xl bg-paper p-6 text-ink">{children}</div>`.
6. Export `useTheme()`. It returns `useContext(ThemeContext)`.
7. Create `dashboard/theme-toggle.tsx`. Line 1 is `"use client"`. Call `useTheme()`, and return a `<button onClick={toggle}>`. It says "Light mode" when the theme is dark, and "Dark mode" when it is light.
8. In `layout.tsx`, add `import "../theme.css";`. Wrap everything that the layout returns in `<ThemeProvider>`. Put `<ThemeToggle />` in the `<aside>`, under the note.
9. Click the button. The dashboard turns light. Reload the page. It is dark again.
10. In `theme-provider.tsx`, load the choice on mount. The server has no `localStorage`, so read it in an effect, which runs only in the browser:

    ```tsx
    useEffect(() => {
      const saved = localStorage.getItem("exercise-8-theme");
      if (saved === "light" || saved === "dark") setTheme(saved);
    }, []);
    ```

11. Run `npm run lint`. The rule `react-hooks/set-state-in-effect` reports the `setTheme` line. Here the effect is on purpose, so add `// eslint-disable-next-line react-hooks/set-state-in-effect` above it.
12. Choose light and reload.

You see the dashboard light after the reload. For a moment, you first see it dark. The numbers, the speakers and the talks still load on the server, inside the provider.

Why: context needs a Client Component, so the provider is one. It renders `children` and does not import them. The layout stays a Server Component, and the pages arrive in `children` already rendered on the server. Only the provider, the toggle and what they import go to the browser. The first render must match the HTML from the server, so the saved choice comes in a second render, after mount. Save the choice in the click handler, not in an effect on `theme`. That effect also runs on mount, and it writes "dark" over the saved choice.

## Stretch

1. The old URL. Old bookmarks to Votes must still work. Create `dashboard/votes/page.tsx`, and call `redirect("/exercises/8/dashboard/talks")` from `next/navigation`. Open `/exercises/8/dashboard/votes`. You land on Talks. Code after `redirect()` never runs, because it throws.
2. The guard. In `talk-table.tsx`, add `import { getTalks } from "@/lib/talks";` and `console.log(getTalks);`. Run `npx next build`. One of the errors says `'server-only' cannot be imported from a Client Component module`. Remove both lines. You need the `console.log`, because the compiler drops an import that nothing uses.
3. The wrong method. Predict what `curl -i -X DELETE http://localhost:3000/exercises/8/dashboard/api/talks` sends. Then run it. The answer is at the end.

## Prove it (5 min)

Answer these when the dashboard works. The answers are at the end.

1. Open `/exercises/8/dashboard/talks`. Press Ctrl+U and search for "Two graphs". `TalkTable` is a Client Component. Why is the title in the HTML?
2. In DevTools, open the Network tab and type `_rsc` in the filter. Click Talks in the sidebar. What does the browser request? Which row starts with `I[`?
3. Which files in `dashboard/` are in the client graph (the code sent to the browser)? Is `stat-card.tsx`? Is `Badge`?
4. What does each boundary wait for: the `<Suspense>` in the layout, and `loading.tsx`?
5. `ThemeProvider` starts with `"use client"`, and every dashboard page is inside it. Why is `dashboard/page.tsx` still a Server Component?
6. Choose light and reload. Why do you see the dark dashboard for a moment?

## Answers

Predict:

1. Only `page.tsx` and `route.ts` get a URL: `dashboard/page.tsx`, `talks/page.tsx`, `talks/[id]/page.tsx`, `votes/page.tsx` and `api/talks/route.ts`. All other files are private.
2. `sidebar-link.tsx`, `talk-table.tsx`, `vote-button.tsx`, `error.tsx`, `theme-provider.tsx` and `theme-toggle.tsx`.
3. `actions.ts`.
4. The `<Suspense>` goes around the sidebar links in `layout.tsx`. The `loading.tsx` goes in `talks/[id]/`.

Prove it:

1. A Client Component also runs once on the server, so its HTML is in the response. Search engines and link previews read that HTML without JavaScript (Step 1).
2. A `Link` click requests an RSC payload (`text/x-component`), not a new HTML page. The row that starts with `I[` is the client reference to `talk-table.tsx`. The talks cross the line as a plain JSON row.
3. The six `"use client"` files, and everything they import. `Badge` is in it, because `talk-table.tsx` imports it. `stat-card.tsx` is not, because only `page.tsx` imports it. The code of `actions.ts` is not in it either. `vote-button.tsx` imports `vote`, but the browser gets only an ID for it.
4. The `<Suspense>` in the layout waits for `usePathname()`. The `loading.tsx` waits for `params` and the reads of the talk page.
5. The graph follows imports, not the tree on the screen. Next renders the page on the server and gives the result to the layout as `children`. The layout passes it to `ThemeProvider`, which never imports it. So the provider gets the page already rendered, in the payload.
6. The server cannot read `localStorage`, so it sends the dark HTML. The browser paints it, React hydrates, and only then the effect reads the saved choice and renders again. To remove the flash, the server must know the choice before it renders, for example from a cookie that the layout reads with `cookies()`. That read waits for the request, so it needs its own `<Suspense>`.

Stretch 3: `405 Method Not Allowed`. The file exports only `GET`, so Next answers every other method for you. You write no code for it.

## Why

Every task is one arrow on the Day 1 drawing. The folder is the router (Steps 2 and 3). Links and hooks need the browser, so they live in small client leaves (Steps 4 and 5). The server reads the data and passes plain values across the line (Steps 5 and 6). Writes cross as an ID (Step 7). Errors, titles and JSON get one file each (Steps 8, 9 and 10). A provider is a Client Component that wraps Server Components without importing them (Step 5).

Compare with `solution/dashboard/`. The solution runs at http://localhost:3000/exercises/8/solution.

Reset: delete `app/exercises/8/dashboard`, then run `npm run reset` for the vote counts. To forget the theme, run `localStorage.removeItem("exercise-8-theme")` in the DevTools console.
