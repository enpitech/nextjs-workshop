# Exercise 0: build the speakers section (20 min)

Open http://localhost:3000/exercises/0. The page has four links. Each link shows the "Not found" page, because the routes do not exist yet. You make them real.

The "Not found" page says "No such talk". That text comes from `app/not-found.tsx`, the only not-found file in the app. In the stretch part, you add a closer one.

## Setup

`lib/speakers.ts` has two reads: `getSpeakers()` and `getSpeaker(id)`. `lib/talks.ts` has `getTalks()`. The app has no speaker pages. You build them under `app/exercises/0/speakers/`.

The target:

```
app/exercises/0/
  page.tsx                 given: the four links
  speakers/
    layout.tsx             the speaker list and a note field, around every speaker page
    page.tsx               /exercises/0/speakers
    speaker-card.tsx       no URL: the name, the bio and the talks of one speaker
    [id]/
      page.tsx             /exercises/0/speakers/1, /2, /3, /4
      loading.tsx          the placeholder while the page waits
```

## Predict

1. You create `speakers/layout.tsx` and no `speakers/page.tsx`. What does `/exercises/0/speakers` show?
2. Which URL does `speakers/speaker-card.tsx` get?
3. You type in the note field, then click another speaker. Does the text stay?

## Build

1. Create `speakers/page.tsx`. Return one line: "Pick a speaker on the left." Open `/exercises/0/speakers`. The 404 is now your page.
2. Create `speakers/layout.tsx`. It receives `children`. Await `getSpeakers()`. Render a plain `<input placeholder="Type a note">`, then one ``<Link href={`/exercises/0/speakers/${s.id}`}>`` for each speaker, then `{children}`.
3. Create `speakers/[id]/page.tsx`. `params` is a promise: `const { id } = await params`. The value is a string. Convert it with `Number(id)`. Read `getSpeaker` and `getTalks`, and keep the talks where `talk.speakerId` is the speaker's id.
4. Open `/exercises/0/speakers/1`. The page renders, but the dev badge at the bottom left shows issues. Open it and find "Blocking Route". Then create `speakers/[id]/loading.tsx` with any placeholder. Reload. The "Blocking Route" issue is gone.
5. Move the JSX of one speaker into `speakers/speaker-card.tsx` and import it in the page.

## Run

1. Type a note in the field. Click another speaker. The page on the right changes. The note stays.
2. Change one `<Link>` in the layout to a plain `<a>`. Type a note and click that speaker. The note is gone. Change it back.
3. Open `/exercises/0/speakers/speaker-card`. You get a 404.

## Read

The issue from build step 4:

```
Blocking Route
Next.js encountered runtime data during prerendering.
This prevents the route from being prerendered, blocking navigation and leading to a slower user experience.
> 13 |   const { id } = await params;
```

`params` is known only at request time. Without a boundary, the whole route waits for it. `loading.tsx` is the boundary. `next build` fails with the same message: `docs/errors/exercise-0-params-without-suspense.txt`.

## Stretch (8 min)

1. Open `/exercises/0/speakers/99`. `getSpeaker(99)` throws `GET /speakers/99 failed with 404`, and the dev overlay shows it. Create `speakers/[id]/error.tsx`. Line 1 must be `"use client"`. Render `error.message` and a button that calls `retry()`. Reload. The sidebar stays, and your error box takes the place of the page.
2. A missing speaker is not an error. In the page, write `getSpeaker(speakerId).catch(() => null)`, and call `notFound()` when the result is `null`. Reload. You see "No such talk" from `app/not-found.tsx`. That text is wrong for a speaker.
3. Create `speakers/[id]/not-found.tsx` with "No such speaker". Reload. The nearest not-found file wins.
4. Open `/exercises/0/speakers/abc`. `Number("abc")` is `NaN`. Call `notFound()` when the number is not an integer.

Compare with `solution/speakers/`. The solution runs at http://localhost:3000/exercises/0/solution.

## Why

The folder is the router. A folder is a URL segment, `page.tsx` makes it a route, and any other file in the folder has no URL. A layout wraps every page below it and stays mounted when you navigate with `<Link>`, so its state survives the click. A plain `<a>` loads a new document, and the layout mounts again. `[id]` makes one folder serve many URLs, and `params` is a promise because the value comes from the request. The special files nest: the nearest `loading`, `error` or `not-found` file up the tree handles its part of the route.

Reset: delete the folder `app/exercises/0/speakers`.
