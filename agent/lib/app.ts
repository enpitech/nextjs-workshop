// The agent runs in its own process, not inside Next. It reaches the app the way any
// outside caller does: over HTTP, through the Route Handlers in app/api/talks.
export const APP = "http://localhost:3000";

export type TalkRow = { id: number; title: string; category: string; votes: number };
