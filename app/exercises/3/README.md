# Exercise 3: fix the waterfall (12 min)

Open http://localhost:3000/exercises/3.

## Setup

`page.tsx` reads a talk, then its speaker, then its comments. Each read is uncached and takes 800 ms. The page prints the server time for the three reads.

## Predict

1. Which read needs the result of another read?
2. What is the shortest possible server time with the reads you have?

## Run

Open the route. Read the number at the bottom. Then look at the request lines `json-server` prints in the terminal: three requests, one after the other.

## Read

There is no error. The number is the symptom:

```
Server time for the three reads: 2400 ms
```

## Fix

Fix 1: batch. Put the reads that do not depend on each other in one `Promise.all`. Keep the one real dependency sequential. Target: about 1600 ms.

Fix 2: stream. Give each independent section its own `<Suspense>` boundary and its own async component. The title shows after 800 ms. The rest arrives when it is ready. Compare with `solution/page.tsx`.

## Why

Sequential `await` is a concurrency bug, not a React bug. The runtime does what the code says: wait, then wait, then wait. `Promise.all` says "start all". A boundary says "show what you have".

Reset: `git checkout app/exercises/3`
