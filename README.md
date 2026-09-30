# Next.js workshop demo app

The demo app for the two half-day Next.js 16 workshop. The teaching notes live in Notion. This repo holds the code the notes point at.

## Before the workshop

1. Install Node 22 or newer.
2. Clone this repo and open a terminal in the folder.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open http://localhost:3000 and http://localhost:3001/talks in a browser.

You are ready when the first page shows the app and the second page shows a JSON list of talks.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Starts Next.js on port 3000 and the JSON backend on port 3001 together. |
| `npm run api` | Starts only the JSON backend (`json-server`, 800 ms delay on every request). |
| `npm run reset` | Restores `db.json` from `db.seed.json` after you voted. |
| `npm run build` | Runs `next build`. The backend must be up: run `npm run dev` or `npm run api` in another terminal first, because the build prerenders the cached reads. |

## The Jev demo

Open http://localhost:3000/submit to add a talk.

Jev is a model from TypeSafe AI. It answers typed questions about a state and returns a value
and a confidence number, not text. The Server Action behind the form sends the talk title to
Jev and gets back a category and a confidence. The categories are eighteen technology topics,
from `frontend` to `blockchain`. Above 50% confidence the action files the talk by itself.
Below it, the form asks you to pick the category and shows the three categories Jev rated
highest. The docs call this confidence routing: https://docs.typesafe.ai/patterns/confidence-routing

The threshold is 50% because the answer is split over eighteen options. With three options a
higher bar made sense.

An API key is optional.

| Key | What the page does |
| --- | --- |
| No `TYPESAFE_API_KEY` | The action treats the confidence as zero and asks you to pick the category. |
| `TYPESAFE_API_KEY` is set | The action calls Jev and routes on the confidence it returns. |

To run the live path, copy `.env.example` to `.env.local` and paste a key from
https://console.typesafe.ai. The file `.env.local` is ignored by git.

Three files hold the demo.

- `lib/jev.ts` makes the call. `import "server-only"` keeps the key and the SDK out of the
  client graph.
- `app/submit/actions.ts` holds the Server Action and the confidence rule.
- `app/submit/submit-form.tsx` is the client form. It never imports `lib/jev.ts`. Jev's answer
  reaches the browser as plain data in the action state.

The question that picks the category is written as `satisfies Record<Category, string>`. The
answer is typed as the `Category` union, so it goes into a `Talk` with no cast and no parsing
step. Add a category to `CATEGORIES` in `lib/types.ts` and `lib/jev.ts` stops compiling.

The first page groups the talks under a heading for each category. The filter above the list
picks one category or shows them all.

## The eve demo

Open http://localhost:3000/agent to talk to an agent about the talks.

eve is Vercel's framework for backend AI agents: https://eve.dev. An agent is a folder of
files. eve runs the loop, calls the tools, and keeps each conversation on the server.

eve needs Node 24. On Node 22 the rest of the app works, and `/agent` says that eve is off.
`next.config.ts` wraps the configuration with `withEve` only on Node 24.

The model is scripted. `agent/lib/scripted-model.ts` uses eve's `mockModel`, so every run gives
the same answer and no API key is needed. eve still runs the real loop, the real tools and
the real approval step. To use a real model, set `model` in `agent/agent.ts` to a model string,
for example `"anthropic/claude-opus-5.5"`, and put `AI_GATEWAY_API_KEY` in `.env.local`.

| File | What it does |
| --- | --- |
| `agent/instructions.md` | The system prompt. The scripted model ignores it. A real model reads it. |
| `agent/agent.ts` | The model and `defaultTools: false`, so the agent has no shell, file or web tools. |
| `agent/tools/list_talks.ts` | A read. It calls `GET /api/talks`. |
| `agent/tools/vote_for_talk.ts` | A write. `approval: always()` parks the turn until a person clicks Approve. It calls `POST /api/talks/vote`. |
| `app/agent/agent-chat.tsx` | The chat. `useEveAgent` from `eve/react`. The session id stays in the URL, so a reload continues the conversation. |
| `evals/agent.eval.ts` | A test for the agent. It checks that a vote waits for approval. |

The tools run in the eve process, not in Next. They reach the app over HTTP through the
Route Handlers, like any outside caller.

To run the eval, start the app on Node 24 with `npm run dev`, and run this in a second
terminal:

```bash
npx eve eval --url http://localhost:3000
```

The saved outputs are in `docs/eve/`: one run that passes, and one run with
`approval: always()` removed, which fails.

## Layout

- `app/` holds the routes.
- `app/breaks/N/broken` and `app/breaks/N/fixed` hold the runtime breaks.
- `app/exercises/N/` holds the exercises. Each one has a `README.md` and a `solution` route.
- `db.json` is the backend data. `db.seed.json` is the copy that `npm run reset` restores.
- `app/submit/` holds the Jev demo.
- `agent/` holds the eve agent, `evals/` its test, and `app/agent/` its chat page.
- `docs/build-logs/` holds saved `next build` output for comparison.
- `docs/agent-runs/` holds real transcripts of agent runs against this repo.
