# Exercise 1: fix Break #1 yourself (5 min)

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

Decide where the handler belongs. Two answers are correct:

1. The handler only needs browser state. Move it into a Client Component that wraps `<VoteList>`.
2. The handler must write to the server. Make it a Server Action with `"use server"`. Then it crosses the line as a callable reference.

Edit `page.tsx` in place. Compare with `solution/page.tsx` when you are done.

## Why

A function is code. Code does not serialize. The output of a Server Component crosses as data only. A Server Action is the one exception: it crosses as an ID, and the browser calls it with a POST.

Reset: `git checkout app/exercises/1`
