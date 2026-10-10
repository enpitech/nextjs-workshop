# Exercise 11, Task 5: the four questions

1. Does the draft do what the prompt asked? No. `npx tsc --noEmit` fails with one error. `npx next build` fails four times in a row, each time with a different error, so the page never ran. "The feature is complete" was a claim. The agent also never opened the page, and `get_errors` cannot see it.
2. Does it solve the cause, or only hide a symptom? It hides one. The agent wrote `"use cache"` on the whole page to make the counts fast. But `lib/comments.ts` already caches `getComments`. The agent never read that file. The build fails because the page reads `searchParams` inside the cached scope.
3. What else did it touch? In the transcript, a test script posted a comment to `db.json`, and `db.json` is in git. Run `npm run reset`. The draft itself adds only new files.
4. Is there a second copy of the same mistake? Yes. `comment-count.ts` is a second copy of `getComments`: it reads the same data with its own tag, `comment-count-${id}`. The action clears only that tag. The talk page reads `getComments`, tag `comments-${id}`, so it keeps the old comment list after a new comment. No tool and no build prints an error for this.
