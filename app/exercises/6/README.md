# Exercise 6: a Route Handler with status codes (5 min)

Open http://localhost:3000/exercises/6. Click the three links with the Network tab open.

## Setup

`api/speakers/[id]/route.ts` answers `GET /exercises/6/api/speakers/<id>`. It reads one speaker with `getSpeaker()` and returns it as JSON.

## Predict

What does each URL send now? The table gives the target.

| URL | Now | Target |
| --- | --- | --- |
| `.../speakers/1` | ? | `200` and the speaker |
| `.../speakers/99` | ? | `404` and `{"error":"No speaker 99"}` |
| `.../speakers/abc` | ? | `400` and `{"error":"Not a speaker id: abc"}` |

## Run

Open the three links, or use `curl -i`.

## Read

`/1` sends `200`. `/99` and `/abc` send `500` with an empty body. The terminal shows the error from `read()` in `lib/api.ts`: `GET /speakers/99 failed with 404`. A program that calls this URL cannot tell what went wrong.

## Fix

1. Convert `id` with `Number(id)`. If the result is not an integer, return `Response.json({ error: ... }, { status: 400 })`.
2. Read with `getSpeaker(speakerId).catch(() => null)`. If the result is `null`, return a `404` with an error body.

Stretch: predict what `curl -i -X DELETE http://localhost:3000/exercises/6/api/speakers/1` sends. Then run it.

Compare with `solution/api/speakers/[id]/route.ts`. The solution runs at http://localhost:3000/exercises/6/solution.

## Why

A page answers a person, so it renders `not-found.tsx`. A Route Handler answers a program, so it sends a status code and a body that says what was wrong. A method that the file does not export gets `405 Method Not Allowed`. The handler sits under `api/`, because a folder has one owner: `page.tsx` or `route.ts`, not both.

Reset: `git checkout app/exercises/6`
