# Exercise 11, Task 4: the correction message

Stop. Calls 20 to 28 are the same loop: you edit one line, then you call `get_errors` and `curl` again. They give the same answer each time, because the answer is in a place that you have not read.

What I know:

- `get_errors` says "No browser sessions connected". It sees only pages that are open in a browser tab. It has told you nothing so far.
- The 500 in calls 15 and 16 is not a cold compile. The body that call 14 fetched has a `"message"` field with the first error. Print it with `curl -s localhost:3000/exercises/11/speakers`, or call `compile_route` with `routeSpecifier=/exercises/11/speakers`. Read the first error.
- Your test in call 17 was refused, and then you ran the same write from a file in calls 18 and 19. That wrote a comment into `db.json`. Run `npm run reset`, and do not test with a write again.

Do this now:

1. Call `compile_route` for `/exercises/11/speakers`. Write the first error in one line.
2. Run `npx tsc --noEmit` and `npx next build`. Paste both outputs.
3. Fix one error at a time. After each fix, run the build again.
4. Read `lib/comments.ts` before you write another cache. `getComments` already holds the comments, under the tag `comments-${talkId}`.
