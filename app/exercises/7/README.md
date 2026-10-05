# Exercise 7: catch the errors (3 min)

Open http://localhost:3000/exercises/7. The page has three links. One works. Two fail in a bad way.

## Setup

`[id]/page.tsx` shows one speaker. It reads `getSpeaker()` from `lib/speakers.ts`. `[id]/loading.tsx` is given, because the page awaits `params` (Exercise 0). There is no `error.tsx` and no `not-found.tsx` in the folder. The app has one `app/not-found.tsx`, and it says "No such talk".

## Predict

1. `/exercises/7/boom` throws. What does the browser show when no `error.tsx` is above the page?
2. `/exercises/7/99` has no speaker. `getSpeaker(99)` fails. Is that an error, or a 404?
3. You add `notFound()` to the page, and no `not-found.tsx`. Which text do you see?

## Run

1. Open `/exercises/7/1`. The speaker shows.
2. Open `/exercises/7/boom`, then `/exercises/7/99`. Both show the same white page, and the nav is gone:

   ```
   This page couldn't load
   A server error occurred. Reload to try again.
   [Reload]
   ERROR 873773604
   ```

   The number is the error digest, and it is different for each error. In `next dev`, the overlay also shows the message and the line. In `next start`, the browser shows only this page. The message is in the terminal, next to the same digest. Real captured output: `docs/errors/exercise-7-server-errors.txt`.

## Read

The message of the first error is `Boom: a render error on the server`. The message of the second error:

```
GET /speakers/99 failed with 404
```

It comes from `read()` in `lib/api.ts`. The speaker does not exist, and the data layer throws. Both errors end in the same page, so a reader cannot tell a bug from a missing speaker.

## Fix

1. Create `[id]/error.tsx`. Line 1 must be `"use client"`. The component gets `{ error, retry }`. Render `error.message` and a button with `onClick={() => retry()}`. Reload `/exercises/7/boom`. The nav stays, and your box takes the place of the speaker. In `next dev` the box shows `Boom: a render error on the server`. In `next start` it shows a generic text (`Minified React error #441 ...`), because a server error loses its message on the way to the browser. Only `error.digest` is left, and it matches the line in the terminal.
2. A missing speaker is not an error. In the page, write `getSpeaker(Number(id)).catch(() => null)`, and call `notFound()` from `next/navigation` when the result is `null`. Reload `/exercises/7/99`. You see "Not found / No such talk." from `app/not-found.tsx`. That text is wrong for a speaker.
3. Create `[id]/not-found.tsx` with "No such speaker". Reload. The nearest `not-found.tsx` wins.

Compare with `solution/[id]/`. The solution runs at http://localhost:3000/exercises/7/solution.

## Why

`error.tsx` is an error boundary for its segment and everything below it. It must be a Client Component, because it holds state and the retry button. The layout above it stays on screen. `notFound()` is for the case that is expected: the thing is not there. It renders the nearest `not-found.tsx`, so a file closer to the page gives a better message than the one at the root. Two files, two jobs: `error.tsx` for what broke, `not-found.tsx` for what is missing.

Reset: delete `error.tsx` and `not-found.tsx` in `app/exercises/7/[id]/`, then `git checkout app/exercises/7`
