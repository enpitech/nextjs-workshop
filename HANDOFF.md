# Handoff: Next.js workshop content and demo app

Written 2026-09-16 after a grilling session with Rotem. Every decision below is confirmed by Rotem. Do not re-ask them. Start at "Next steps".

## The task

Fill the Notion page "2 half days - NextJS" with real teaching content, and build the demo app that the content points at. Rotem teaches the workshop in Hebrew for AT&T Israel. Participants read the same Notion page. Everything is built before the workshop. Nothing is generated live in the room.

Notion page: https://app.notion.com/p/3db322d6b3a980528a09eb46806b7885
Child page (do not touch): "Participant questionnaire" https://app.notion.com/p/3dc322d6b3a981889555e4431301dfe2, with an inline "Questionnaire responses" database.
Related read-only page: "Workshop: Next.js for React Developers" (the 8 half-day syllabus) https://app.notion.com/p/365322d6b3a980679375c462cb764cb9

## Facts found

- The local folder `nextjs-workshop` holds only `.git`. Remote `origin` is https://github.com/enpitech/nextjs-workshop.git and has no branches and no commits. Rotem will make the repo public.
- No handout, instructor guide, or `REVIEW.md` exists in Notion. The outline references them, but they do not exist.
- The Notion page is a lesson plan: section toggles (heading 2 with `{toggle="true"}`), sub-blocks as heading 3 with letters (1.2a, 1.4a′, 2.1g″), Story lines, timings, cut lines, and a "Links between blocks" table at the bottom. The only filled sample of finished content is the "App router vs Pages router" toggle inside "Next 16 Project Layout".
- Versions on npm on 2026-09-16: `next` latest 16.3.5, `json-server` 0.17.4 (stable line) and 1.0.0-beta.15 (npm "latest"). Local Node v22.17.0, npm 9.6.6.
- Notion editing: use `notion-update-page` with `update_content` (search and replace) or `insert_content`. Never `replace_content` on the main page, because the `<page>` child block and the inline `<database>` are deleted if omitted. Read `notion://docs/enhanced-markdown-spec` before the first edit. Children of toggle headings must be tab-indented or they fall out of the toggle.

## Decisions (all confirmed)

Content format
- Each sub-block becomes a screen-ready teaching block in simple English: a short explanation (3 to 8 lines), one inline demo-agnostic code sample, the verbatim error or output, the question Rotem asks the room, and one pointer line "In the demo: `path/to/file`" that links to the file on GitHub.
- Breaks and Exercises use a fixed shape: Setup, Predict, Run, Read (error text verbatim), Fix (diff), Why (two sentences).
- Density target: the existing "App router vs Pages router" toggle. Polish it, do not expand it.
- One Notion page for both audiences. Instructor meta (Story, timings, cut lines, "Revised 2026-09-16" notes, letter mappings) goes into one collapsed callout at the top of each section. Participant content sits as plain blocks beneath it. Dead blocks (the "§1.3 dissolved" section, 2.4c cut) move into one "Changelog" toggle at the bottom of the page.
- The "Installation" section becomes the pre-workshop checklist on the main page: clone, `npm install`, `npm run dev`, open two URLs, a "you are ready" description. No child page.
- Language: simple English for the reference. Rotem speaks Hebrew in the room.
- Write to Notion after each section's repo part is built and verified. Keep a local copy of every edit in the scratchpad.

Demo app
- Built in this folder, one branch `main`, everything finished. No branch switching in the room. One commit per section, pushed to `origin main` as work goes.
- Scaffold: `create-next-app@latest` (Next 16.3.5), TypeScript, Tailwind (layout only), ESLint, `app/` directory, no `src/`, alias `@/*`, no UI library.
- `cacheComponents: true` in `next.config.ts`. It must be on, because `"use cache"` does not compile without it.
- Backend: `json-server@0.17.4` on port 3001 with `--delay 800`, file `db.json` with collections `talks` (id, title, speakerId, track, votes), `speakers` (id, name, bio), `comments` (id, talkId, text). A reset script restores the seed data after votes.
- One `npm run dev` starts Next and json-server together through `concurrently`.
- Runtime breaks (#1 function across the boundary, #4 waterfall, #5 stale read, #6 Pages-era patterns) are sibling routes `/breaks/N/broken` and `/breaks/N/fixed`. The broken route is forced dynamic so `next build` passes and the error shows only when opened. Break #2 (barrel file) is one route plus the `npx next experimental-analyze` output.
- Flag-off evidence for Break #3 (dynamic cascade) and the `○ ● ƒ ◐` legend (1.6a″) comes from a saved build log in `docs/build-logs/`, captured once with the flag off. "Same code, different flag" (1.6a′ to 2.1e) is saved log against live build.
- Exercises 1 to 3 live in `app/exercises/N/` with a `README.md` per exercise and a visible `solution` sibling route. Participants edit in place and reset with `git checkout .`.
- Also on `main`: the six-line vote Server Action (1.5f), `proxy.ts` with a redirect and a matcher, `import 'server-only'` in the data layer, `app/api/talks/route.ts`, `.mcp.json` and `.cursor/mcp.json` for the Next DevTools MCP.
- Planted bug for §2.6: after a vote, the count updates on the talks list but not on the talk page, because the list is tagged `talks`, the talk page is tagged `talk-<id>`, and the vote action calls only `updateTag('talks')`. User report text: "After I vote, the number goes up on the list, but the talk page still shows the old number."

Agent material (§2.5 to §2.7)
- No agent runs in the room. Run Claude Code headless from this machine (`claude -p`) against the repo, once for the planted bug and once for each of the three §2.7 failure prompts. Commit the real transcripts to `docs/agent-runs/`. If a run does not fail the way the outline expects, say so and adjust the prompt or drop that failure. Never fabricate a transcript.
- 2.7d becomes "read the transcript, find the boundary mistake, compare to your Exercise 2 answer".

Hands-on that stays
- 1.4b: read the RSC payload in the network tab.
- 2.1e′: delete `"use cache"` from two named files, run `next build --debug-prerender`, read the errors, restore.
- Exercises 1, 2, 3.
- 2.7d as transcript reading.

Verification rule
- Every version claim in the outline is verified against nextjs.org and the real build output before it goes into Notion. Claims to check include: `error.tsx` prop `retry` since 16.3.0, `revalidateTag` requires a second argument, `next experimental-analyze` from 16.1, `--debug-prerender` labels `[stream]` `[cache]` `[block]`, the managed block `next dev` writes into `AGENTS.md` on 16.3, `proxy.ts` throws when `runtime` is set, `dynamic` / `revalidate` / `fetchCache` / `dynamicParams` error under the flag. A claim that fails is flagged in its section, not copied.

Work order
1. Scaffold the app, json-server, `db.json`, `concurrently`, first commit and push.
2. §1.4 and §1.5 (two-graph model, boundary, Breaks #1 and #2, Exercises 1 and 2, the vote action).
3. §2.1 and §2.2 (flag, `"use cache"`, tags, Break #5, the planted bug).
4. The rest in outline order: §1.1, §1.2, §1.6, HD1 close, §2.0, §2.3, §2.4, §2.5 to §2.7, §2.8.
5. The "Links between blocks" table stays true: any block you change must keep its partner block consistent.

## Next steps

1. Read the Notion page once (fetch by URL above) to see the current text before editing.
2. Run `npx create-next-app@latest . ` in this folder with the scaffold options above. Add `json-server@0.17.4`, `concurrently`, `db.json`, scripts `dev`, `api`, `reset`.
3. Commit, push to `origin main`.
4. Start §1.4.
