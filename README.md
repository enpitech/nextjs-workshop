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

## Layout

- `app/` holds the routes.
- `app/breaks/N/broken` and `app/breaks/N/fixed` hold the runtime breaks.
- `app/exercises/N/` holds the exercises. Each one has a `README.md` and a `solution` route.
- `db.json` is the backend data. `db.seed.json` is the copy that `npm run reset` restores.
- `docs/build-logs/` holds saved `next build` output for comparison.
- `docs/agent-runs/` holds real transcripts of agent runs against this repo.
