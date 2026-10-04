# Exercise 5: a title for every talk (4 min)

Open http://localhost:3000/exercises/5 and click a talk. Read the title of the browser tab.

## Setup

`[id]/page.tsx` shows one talk. It exports no metadata, so every talk uses the `metadata` of `app/layout.tsx`.

## Predict

1. What does the tab say on `/exercises/5/1`?
2. The title depends on the talk. Can a plain `metadata` object hold it?

## Run

Open two talks. Both tabs say "Talks".

## Fix

In `[id]/page.tsx`, export an async `generateMetadata`. It gets the same `params` as the page. Await `params`, read the talk with `getTalk()`, and return `{ title: talk.title }`. If the read fails, return a fallback title.

Reload. The tab shows the title of the talk.

Compare with `solution/[id]/page.tsx`. The solution runs at http://localhost:3000/exercises/5/solution.

## Why

`metadata` is a fixed object. `generateMetadata` is for metadata that depends on data. Both work only in a Server Component, because Next reads them on the server. The page and `generateMetadata` both call `getTalk()`, and the cache makes it one read. The page already has `loading.tsx`, so the title can stream in with the rest of the page.

Reset: `git checkout app/exercises/5`
