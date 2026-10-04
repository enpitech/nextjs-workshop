# Exercise 4: write the vote action (7 min)

Open http://localhost:3000/exercises/4. The route throws.

## Setup

`page.tsx` is a Server Component. It lists the talks and passes `upvote` from `actions.ts` to `<VoteButton>`, a Client Component with a plain `<form action={action}>`.

## Predict

1. `upvote` is a function, and `VoteButton` is a Client Component. What does Break #1 say about that?
2. Which one line makes this function cross the line?

## Run

Open the route. Read the error in the overlay.

## Read

```
Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server". Or maybe you meant to call this function rather than return it.
  <... id={1} action={function upvote}>
                     ^^^^^^^^^^^^^^^^^
```

The full text is in `docs/errors/exercise-4-function-without-use-server.txt`.

## Fix

1. Add `"use server";` as line 1 of `actions.ts`. Remove the `connection()` line in `page.tsx`. Click Vote. The count goes up.
2. Add a pending state and a message with `useActionState` (§7b):
   - In `actions.ts`, give `upvote` a first argument, the previous state. Return ``{ message: `${talk.votes} votes now.` }``. Use the talk that `addVote()` returns.
   - In `vote-button.tsx`, call `useActionState(action, { message: "" })`. Give the form `formAction`. Disable the button and show "Voting…" while `pending` is true. Show `state.message` after the button. Change the type of the `action` prop to match the new signature.

Compare with `solution/`. The solution runs at http://localhost:3000/exercises/4/solution.

## Why

A Server Action is the one function that crosses the line. It crosses as an ID, and the code stays on the server. `updateTag("talks")` makes the next read of `getTalks()` fresh, so the count on the page changes. `useActionState` gives the form a pending flag and the value that the action returns.

Reset: `git checkout app/exercises/4`, then `npm run reset` for the vote counts.
