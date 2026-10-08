# Exercise 10, Task 6: the rules for AGENTS.md

The managed block in `AGENTS.md` says "read the docs". It does not know this project. The lines below say what it does not know. In your own project, paste them into `AGENTS.md` under the line `<!-- END:nextjs-agent-rules -->`. `next dev` rewrites only the part between the two markers, so your lines stay.

This file has a different name on purpose, so that no agent reads it as its rules.

## This project

- Next.js 16.3 with `cacheComponents: true`. Read the guide in `node_modules/next/dist/docs/` before you write code.
- App Router only. Import hooks from `next/navigation`, never from `next/router`. No `getServerSideProps` or `getStaticProps`.
- The flag is on, so route segment config does not compile: no `export const dynamic`, `revalidate`, `fetchCache` or `dynamicParams`.
- Reads go through `lib/talks.ts`, `lib/speakers.ts` and `lib/comments.ts`. They are already cached with `"use cache"`, `cacheLife` and `cacheTag`. Do not wrap them in a second cache.
- `cacheLife` takes a profile name, such as `"minutes"`, or an object with `stale`, `revalidate` and `expire`. It has no other fields.
- A write is a Server Action that calls `updateTag` for every tag it changes. Read the tags in `lib/*.ts`. A Route Handler uses `revalidateTag(tag, "max")`. `revalidateTag` takes two arguments.
- `"use client"` goes on the smallest leaf that needs state or a browser API. Never on a page that reads data. `lib/*` starts with `import "server-only"`. Do not remove it.
- The data server runs on port 3001. `npm run dev` starts it. `next build` needs it.
- Before you say "done", run `npx tsc --noEmit` and `npx next build`, and paste what they print.
- Code in `agent/` runs in the eve process, not in Next. It calls the app over HTTP and never imports `lib/*`. A tool that writes has `approval: always()`.
