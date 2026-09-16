# Exercise 2: the boundary refactor (15 min)

Open http://localhost:3000/exercises/2. It works. That is the problem.

## Setup

`page.tsx` is a Server Component. It reads a talk, its speaker and its comments, and hands everything to `<TalkDetail>`.

`talk-detail.tsx` has `"use client"` on line 1. It renders the whole view: title, badge, bio, comments, and one button that shows or hides the comments. It imports `Badge` and `Card` from the barrel file `@/components/ui`.

## Predict

1. Which files are in the client graph right now?
2. How many client-reference rows (`I[...]`) does the RSC payload of this route have?
3. Does the 622 KB emoji table ship for this page? Why?

## Run

```
npx next build
grep -o "static/chunks/[^\"]*\.js" .next/server/app/exercises/2.html | sort -u
```

Compare the list with `.next/server/app/exercises/2/solution.html`.

## Read

There is no error. Nothing in this exercise fails. The cost is in the chunk list and in the payload.

## Fix

Three moves, in this order:

1. Move the directive down to the leaf. Only the show/hide button needs state. Make a small `CommentsToggle` Client Component. Everything else stays in the server graph.
2. Pass the comments as `children` of `CommentsToggle`, already rendered. The toggle does not need to know what a comment is.
3. Import `Badge` and `Card` from their files, not from the barrel.

Make sure that the chunk list of the route matches `/exercises/2/solution`, and that the payload has one `I[` row for your toggle.

## Why

The directive is an entry point. Putting it on the view makes the view and every import the client graph. Putting it on the leaf keeps the data layer, the layout code and the barrel out of the browser.

Reset: `git checkout app/exercises/2`
