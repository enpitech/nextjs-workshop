# Course script: Next.js 16 in two half days

This folder is the spoken version of the Notion page "2 half days - NextJS". The Notion page is the reference that participants read. This script is the order in which you teach it, with the demo app open next to it.

Each lesson has the same shape.

1. Explain. What you say before any code is on screen, in plain words. Three to eight sentences.
2. Show. The exact route, file, click and expected output in the demo app.
3. Ask. One question for the room, with the answer.
4. Where it is. The Notion block letters and the files, so you can jump between the two.

Read the lesson, say the Explain part, then switch to the browser or the editor and do the Show part. Come back to Notion only for a table or an error text that is easier to read there.

## Files

| File | Covers |
| --- | --- |
| `day-1.md` | Half-Day 1: framework choice, project layout, the two graphs, the boundary, the dynamic cascade, the five names, the close. |
| `day-2.md` | Half-Day 2: caching, invalidation, the waterfall, loading granularity, Server Actions with state, AI agents, the three failures, eve (an agent inside the app), the close. |

## Before the room

Run these once, on the teaching laptop, before you open the first lesson.

```
npm run reset
npm run dev
```

Open two browser tabs: `http://localhost:3000` and `http://localhost:3001/talks`. Open the repo in the editor. Open the Notion page on the second screen.

For Day 2 lesson 10 (eve), the teaching laptop must run Node 24. Check with `node -v`. On Node 22 the app works, but `/agent` says that eve is off.

## Things that changed since the Notion page was written

The demo app moved on after the Notion page was verified on 2026-09-16. The script below uses the code as it is today (2026-09-23). Decide each item before the room.

1. File names. The data layer is now `lib/api.ts`, `lib/talks.ts`, `lib/speakers.ts` and `lib/comments.ts`. The vote action is `app/talks/actions.ts`. The Notion page still says `lib/db.ts` and `app/actions.ts` in many blocks, in GitHub links, and in captured error texts. Either update Notion or revert the rename. This script uses the new names.
2. The planted bug is fixed. `app/talks/actions.ts` now calls `updateTag` for both `talks` and `talk-<id>` in both actions. The demo at the end of lesson 2.4 ("the message says 17, the header says 15") and the report in lesson 2.6 do not reproduce until you re-plant it. Lesson 2.4 has the re-plant step.
3. The seed data uses `category`, not `track`. The home page groups talks by category and has a category filter. The Installation text in Notion says "track filter", and the saved payload rows in `docs/payloads/home-rsc-rows.txt` show `"track":"core"`. The shape of the payload is the same. The field name is not.
4. The home page waits one second on purpose. `app/page.tsx` has a `setTimeout` of 1000 ms before it reads the talks. The Notion page does not mention it. Keep it or delete it, but know it is there when the room asks why `/` is slow. On 2026-09-30 it also made `next build` fail on `/` ("uncached or runtime data during prerendering"), because the `<Suspense>` around it is commented out.
5. `/submit` and the Jev model are not in the Notion outline. The script gives them one short aside in lesson 2.4. Nothing else depends on them.
6. The working tree is not committed. Fifty-two files differ from the last commit. Commit before the room so that `git checkout .` in the exercises resets to the code you taught from.
7. One reorder. The script teaches 2.4b (`useActionState` and the planted bug) as Day 2 lesson 5, before the waterfall (2.3), because the re-plant decision belongs before the agent transcript. The Notion order is 2.3, then 2.4. Move the lesson back if you prefer the Notion order.
8. eve was added on 2026-09-30, as Notion 2.8 and Day 2 lesson 10. The close moved to Notion 2.9 and lesson 11. eve needs Node 24 on the teaching laptop. The room can stay on Node 22.
