# Exercise 1: fix Break #1 yourself (3 min)

Open http://localhost:3000/exercises/1. The route throws.

## Setup

`page.tsx` is a Server Component. It defines `onVote` and passes it to `<VoteList>`, a Client Component.

## Predict

Before you run it: which side of the line is `onVote` on? What does the error say?

## Run

Open the route. Read the error in the overlay.

## Read

```
Error: Event handlers cannot be passed to Client Component props.
  <... talks={[...]} onVote={function onVote}>
                            ^^^^^^^^^^^^^^^^^
If you need interactivity, consider converting part of this to a Client Component.
```

## Fix

Decide where the handler belongs. This handler needs browser state only, so move it into a Client Component that wraps `<VoteList>`.

Edit `page.tsx` in place. Compare with `app/breaks/1/fixed/` when you are done.

## Why

A function is code. Code does not serialize. The output of a Server Component crosses as data only. The Client Component owns the behavior.

## Later, in §7a

A handler that writes to the server has a second fix: make it a Server Action with `"use server"`. A Server Action is the one function that crosses the line. It crosses as an ID, and the browser calls it with a POST. §7a teaches `"use server"` and then comes back to this exercise. `solution/page.tsx` is that second fix. Open it in §7a.

Reset: `git checkout app/exercises/1`
