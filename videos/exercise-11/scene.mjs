// Exercise 11: drive an agent end to end. One scene per narration beat.
// Each task shows what you do (YOUR TURN) and what the answer is (SOLUTION).
// Code and texts come from app/exercises/11/ (draft/, solution/, transcript.txt, README.md),
// lib/comments.ts, the bundled docs and the recorded outputs in docs/errors/exercise-11-*.txt.
// Cues: every change is timed to a phrase of the narration text, so a change of the narration moves it too.
import fs from "node:fs";
import {
  C, UI, MONO, W, H, camera, project as project3, quad, box, line3, label3, pill, render,
  clamp, lerp, lerp3, smooth, easeOut, easeInOut, back, span,
} from "../engine.mjs";
import { terminal, cubeFace } from "../widgets.mjs";
import { codeCard2, hlWeights, checkWidth, cursor } from "../exercise-8-solution/dash.mjs";
import {
  browser, BW, BH, transcript, TW, TH, TROW, THEAD, mdCard, pipeline, table, pathRow, nodeFace,
} from "./tex.mjs";

export const chip = "Next.js 16 · Exercise 11";
export const chunked = true;
const Y = C.yellow, G = C.green, B = C.server, O = C.client, V = C.action, R = C.red;
export const steps = {
  intro: "The agent capstone",
  setup: { text: "Setup", color: Y },
  claim: "The prompt and the claim",
  predict: { text: "Predict · 3 min", color: Y },
  t1do: { text: "Task 1 · give the agent eyes", color: Y },
  t1see: { text: "Task 1 · what you see", color: G },
  t2: { text: "Task 2 · find the docs", color: Y },
  t3: { text: "Task 3 · the prompt and the prediction", color: Y },
  t4read: { text: "Task 4 · read the run", color: Y },
  t4stop: { text: "Task 4 · stop the loop", color: Y },
  t5tsc: { text: "Task 5 · the review: tsc", color: Y },
  t5build: { text: "Task 5 · the review: the build", color: Y },
  t5suspense: { text: "Task 5 · the review: Suspense", color: Y },
  t5copy: { text: "Task 5 · the bug that no tool sees", color: Y },
  t6: { text: "Task 5 questions · Task 6 compare", color: Y },
  t7: { text: "Task 7 · a tool for the app's agent", color: Y },
  close: { text: "Prove it", color: G },
};

// ---------- cues ----------
const NARR = JSON.parse(fs.readFileSync(new URL("./narration.json", import.meta.url), "utf8"));
const TEXT = Object.fromEntries(NARR.beats.map((b) => [b.id, b.text]));
let TL = null;
try { TL = JSON.parse(fs.readFileSync(new URL("../out/exercise-11/timeline.json", import.meta.url), "utf8")); } catch { /* audio.mjs makes it */ }
function cuer(id, s) {
  const text = TEXT[id];
  const sents = TL?.beats.find((b) => b.id === id)?.sentences ?? [];
  const before = [];
  let acc = 0;
  for (const ch of text) { before.push(acc); acc += 1 + (/[.:?]/.test(ch) ? 5 : ch === "," ? 2 : 0); }
  return (phrase, end = false) => {
    for (const st of sents) {
      const k = st.text.indexOf(phrase);
      if (k < 0) continue;
      const j = k + (end ? phrase.length : 0);
      return s.sp + st.start + (j / st.text.length) * (st.end - st.start);
    }
    const i = text.indexOf(phrase);
    if (i < 0) throw new Error(`cue "${phrase}" not in ${id}`);
    const j = i + (end ? phrase.length : 0);
    const a = j >= text.length ? acc : before[j];
    return s.sp + (a / acc) * (s.se - s.sp);
  };
}
function keys(lt, ks) {
  if (lt <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) if (lt <= ks[i][0]) return lerp(ks[i - 1][1], ks[i][1], span(lt, ks[i - 1][0], ks[i][0]));
  return ks.at(-1)[1];
}
const fade = (lt, from, to = 999) => smooth(span(lt, from, from + 0.35)) * (1 - smooth(span(lt, to - 0.3, to)));

// ---------- layout ----------
const CAM_Y = 1.2;
const cam16 = (lt, len) => camera([lerp(-0.4, 0.4, clamp(lt / len)), CAM_Y, -16], [0, CAM_Y, 0], 50);
const K = 0.0111; // world units per texture pixel
const LX = -12.55, TOP = 5.6; // the left column: left edge and top
const RX = 6.7; // the right column: center
const LABEL_X = 1442, LABEL_Y = 232;

// a card in the left column (left aligned) or the right column (centered)
function leftCard(items, lt, img, from, to = 999, { top = TOP, k = K, glow = null } = {}) {
  const a = fade(lt, from, to);
  if (a <= 0.003) return null;
  const ww = img.width * k, hh = img.height * k;
  const q = quad({ pos: [LX + ww / 2, top - hh / 2 + (1 - easeOut(span(lt, from, from + 0.5))) * -0.5, 0], w: ww, h: hh, rot: [0, 0.12, 0], img, alpha: a, grid: 5, glow, glowA: 0.18 });
  items.push(q);
  return q;
}
function rightCard(items, lt, img, from, to = 999, { top = 5.0, k = K, cx = RX, glow = null, glowA = 0.18 } = {}) {
  const a = fade(lt, from, to);
  if (a <= 0.003) return null;
  const ww = img.width * k, hh = img.height * k;
  const q = quad({ pos: [cx, top - hh / 2 + (1 - easeOut(span(lt, from, from + 0.5))) * -0.5, 0], w: ww, h: hh, rot: [0, -0.13, 0], img, alpha: a, grid: 6, glow, glowA });
  items.push(q);
  return q;
}
// the browser window in the right column
function browserItem(items, lt, img, from, to = 999, { glow = B, w = 11.4, top = 4.9 } = {}) {
  const a = fade(lt, from, to);
  if (a <= 0.003) return null;
  const h = (w * BH) / BW;
  const q = quad({ pos: [RX, top - h / 2, 0], w, h, rot: [0, -0.13, 0], img, alpha: a, glow, glowA: 0.2, grid: 8 });
  items.push(q);
  return q;
}

// pills above the right column; list: [from, to, text, color, mono]
function labels(ctx, lt, list, x = LABEL_X, y = LABEL_Y) {
  for (const [from, to, text, color, mono] of list) {
    const a = fade(lt, from, to);
    if (a > 0.01) pill(ctx, x, y, text, { size: 26, color, alpha: a, mono: !!mono });
  }
}
// the YOUR TURN / SOLUTION tag at the top center; list: [from, to, kind]
const MODES = { do: ["YOUR TURN", Y], sol: ["SOLUTION", G], see: ["WHAT YOU SEE", G], claim: ["THE STARTING POINT", O], prove: ["PROVE IT", G], intro: ["FROM ZERO TO DONE", B] };
function mode(ctx, lt, list) {
  for (const [from, to, kind] of list) {
    const a = fade(lt, from, to);
    if (a < 0.01) continue;
    const [text, color] = MODES[kind];
    pill(ctx, W / 2, 50, text, { size: 24, color, alpha: a, bg: color + "22" });
  }
}

// terminal typing: starts[i] is the time when entry i begins. Commands type, outputs appear at once.
function termChars(entries, lt, starts) {
  let chars = 0;
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    const t0 = starts[i];
    if (t0 == null || lt < t0) break;
    if (e.cmd != null) {
      const len = e.cmd.length + 2;
      const dur = Math.min(1.0, len / 38);
      const p = clamp((lt - t0) / dur);
      chars += p * len;
      if (p < 1) break;
    } else chars += 12;
  }
  return chars;
}
// starts for a block: the command at t, then its outputs one after the other
function block(entries, t, gap = 0.18) {
  const out = [];
  let tt = t;
  for (const e of entries) {
    out.push(tt);
    tt += e.cmd != null ? Math.min(1.0, (e.cmd.length + 2) / 38) + 0.25 : gap;
  }
  return out;
}

// a 3D node: a box with a label face
function node(items, { pos, w = 3.4, h = 1.7, d = 0.9, face, color, alpha = 1, glow = null, rot = [0.05, 0, 0] }) {
  if (alpha <= 0.003) return;
  items.push(box({ pos, size: [w, h, d], rot, color, alpha, front: face, glow }));
}
// a packet that flies from a to b while k goes from 0 to 1
function packet(items, a, b, k, color, lift = 1.2) {
  if (k <= 0 || k >= 1) return;
  const e = easeInOut(k);
  const p = lerp3(a, b, e);
  p[1] += Math.sin(Math.PI * e) * lift;
  items.push(box({ pos: p, size: [0.55, 0.55, 0.55], rot: [e * 2, e * 4, 0], color, glow: color }));
  for (let i = 1; i <= 5; i++) {
    const kk = clamp(e - i * 0.035);
    const q = lerp3(a, b, kk); q[1] += Math.sin(Math.PI * kk) * lift;
    const q2 = lerp3(a, b, clamp(kk + 0.035)); q2[1] += Math.sin(Math.PI * clamp(kk + 0.035)) * lift;
    items.push(line3({ a: q, b: q2, color, width: 6 - i, alpha: 0.6 - i * 0.1 }));
  }
}

// ---------- texts on the cards (copied or shortened from the exercise files) ----------
const PROMPT_LINES = [
  "In `app/exercises/11/speakers/`, add a page that lists every speaker",
  "with their talks. Show how many comments each talk has.",
  "Cache the counts. Add a small form under each talk to add a comment,",
  "and make the new count show right away. Show only one speaker",
  "when the URL has `?speaker=2`. Keep it small.",
];
const CLAIM_LINES = [
  "Done. I added the speakers page in `app/exercises/11/speakers/`:",
  "- `page.tsx`: every speaker with their talks and the comment count.",
  "  The page is cached, so it is fast. `?speaker=2` shows one speaker.",
  "- `comment-count.ts`: a cached count for one talk.",
  "- `actions.ts`: `addComment`, a Server Action that clears the count.",
  "- `comment-form.tsx`: a form that calls the action.",
  "I tested the form with a script, and the comment was saved.",
  { t: "The feature is complete.", c: C.text },
];
const COMMENTS_TS = [
  'import "server-only";',
  'import { cacheLife, cacheTag } from "next/cache";',
  "…",
  "export async function getComments(talkId: number): Promise<Comment[]> {",
  '  "use cache";',
  '  cacheLife("minutes");',
  "  cacheTag(`comments-${talkId}`);",
  "  return read<Comment[]>(`/comments?talkId=${talkId}`);",
  "}",
];
const COUNT_TS = (fixed) => [
  "// The number of comments under one talk. Cached for 30 seconds.",
  "export async function getCommentCount(talkId: number): Promise<number> {",
  '  "use cache";',
  fixed ? '  cacheLife("seconds");' : '  cacheLife("short");',
  "  cacheTag(`comment-count-${talkId}`);",
  "  const res = await fetch(`${API}/comments?talkId=${talkId}`);",
  "  …",
];
const ACTIONS_TS = (fixed) => [
  '"use server";',
  'import { updateTag } from "next/cache";',
  'import { API } from "@/lib/api";',
  "",
  fixed ? "const MAX_LENGTH = 280;" : "export const MAX_LENGTH = 280;",
  "",
  "export async function addComment(formData: FormData) {",
];
const DRAFT_PAGE = (fixed) => [
  fixed ? '// "use cache" deleted' : '"use cache";',
  'import { getSpeakers } from "@/lib/speakers";',
  "…",
  "export default async function Speakers({ searchParams }: …) {",
  "  const { speaker } = await searchParams;",
  "  const [speakers, talks] = await Promise.all([getSpeakers(), getTalks()]);",
];
const SOL_PAGE = [
  "export default function SpeakersPage({ searchParams }: …) {",
  "  return (",
  "    <main>",
  '      <h1 className="mb-4 text-2xl font-bold">Speakers</h1>',
  '      <Suspense fallback={<p …>Loading speakers...</p>}>',
  "        <SpeakerList searchParams={searchParams} />",
  "      </Suspense>",
  "    </main>",
];
const SOL_LIST = [
  "export async function SpeakerList({ searchParams }: …) {",
  "  const { speaker } = await searchParams;",
  "  const [speakers, talks] = await Promise.all([getSpeakers(), getTalks()]);",
  "  …",
];
const SOL_ACTION = [
  "const res = await fetch(`${API}/comments`, {",
  '  method: "POST",',
  "  …",
  "});",
  "if (!res.ok) throw new Error(`POST /comments failed with ${res.status}`);",
  "",
  "updateTag(`comments-${talkId}`);",
];
const TOOL_TS = [
  'import { defineTool } from "eve/tools";',
  'import { z } from "zod";',
  'const APP = "http://localhost:3000";',
  "export default defineTool({",
  "  description:",
  '    "Search the conference talks by a word in the title. …",',
  "  inputSchema: z.object({ q: z.string().trim().min(1).max(50) }),",
  "  // A read, so no approval. Only a write waits for a person.",
  "  async execute({ q }) {",
  "    const res = await fetch(`${APP}/api/talks/search?q=${encodeURIComponent(q)}`);",
  "    if (!res.ok) throw new Error(`GET /api/talks/search failed with ${res.status}`);",
  "    const talks: TalkRow[] = await res.json();",
  "    return talks.map(({ id, title, votes }) => ({ id, title, votes }));",
  "  },",
  "});",
];
const EVAL_TS = [
  'import { defineEval } from "eve/evals";',
  "export default defineEval({",
  '  description: "A topic question calls search_talks once, …",',
  "  async test(t) {",
  '    const turn = await t.send("Search the talks for server");',
  '    t.calledTool("search_talks", { status: "completed", count: 1 });',
  '    t.check(turn.message, includes("Server Actions in production"));',
  "  },",
  "});",
];
for (const [k, lines, size, w] of [
  ["comments.ts", COMMENTS_TS, 23, 1160], ["count", COUNT_TS(false), 23, 1160], ["actions", ACTIONS_TS(false), 24, 1120],
  ["draftPage", DRAFT_PAGE(false), 22, 1160], ["solPage", SOL_PAGE, 22, 1160], ["solList", SOL_LIST, 22, 1160],
  ["solAction", SOL_ACTION, 22, 1180], ["tool", TOOL_TS, 21, 1180], ["eval", EVAL_TS, 21, 1180],
]) checkWidth(k, lines, size, w);

// ---------- scenes ----------
const TASKS = [
  { n: "P", label: "Predict", color: Y }, { n: 1, label: "Eyes", color: B }, { n: 2, label: "Docs", color: B },
  { n: 3, label: "Prompt", color: V }, { n: 4, label: "Read", color: O }, { n: 5, label: "Review", color: R },
  { n: 6, label: "Compare", color: G }, { n: 7, label: "Tool", color: V },
];

function intro(ctx, s) {
  const { lt, len } = s;
  const A = cuer("intro", s);
  const cDrive = A("You drive"), cOrg = A("The organizers want"), cDraft = A("The draft and the agent run"), cNo = A("You need no agent");
  const cam = cam16(lt, len);
  const items = [];
  TASKS.forEach((tk, i) => {
    const a = back(span(lt, cDrive + i * 0.12, cDrive + 0.7 + i * 0.12));
    const sz = 1.35 * clamp(a);
    if (sz < 0.01) return;
    const p = [-11.6 + i * 1.62, -1.2 + Math.sin(lt * 1.4 + i) * 0.08, 0];
    items.push(box({ pos: p, size: [sz, sz, sz], rot: [0.25, 0.35 + Math.sin(lt * 0.7 + i) * 0.25, 0], color: tk.color, front: cubeFace("ic" + i, { n: tk.n, label: tk.label, color: tk.color }) }));
  });
  const enter = easeOut(span(lt, cOrg - 0.3, cOrg + 1.0));
  if (enter > 0) {
    const img = browser("b-intro", { page: "speakersSol", url: "localhost:3000/exercises/11/solution/speakers?speaker=1", tab: "Talks" });
    const w = 11.4, h = (w * BH) / BW;
    items.push(quad({ pos: [lerp(14, RX, enter), 1.3, lerp(10, 0, enter)], w, h, rot: [0, lerp(-0.9, -0.13, enter), 0], img, alpha: enter, glow: B, glowA: 0.22, grid: 8 }));
  }
  render(ctx, cam, items);
  const a = smooth(span(lt, 0.2, 1.0));
  const slide = (d) => (1 - easeOut(span(lt, 0.2 + d, 1.0 + d))) * -60;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.textBaseline = "alphabetic";
  pill(ctx, 110 + slide(0), 200, "EXERCISE 11 · THE AGENT CAPSTONE", { align: "left", color: B, size: 24 });
  ctx.font = `800 84px ${UI}`; ctx.fillStyle = C.text;
  ctx.fillText("Drive an agent", 104 + slide(0.1), 320);
  ctx.fillText("end to end", 104 + slide(0.2), 415);
  ctx.font = `400 32px ${UI}`; ctx.fillStyle = C.muted;
  ctx.fillText("Predict, then 7 tasks  ·  about 63 min", 110 + slide(0.3), 478);
  ctx.restore();
  pill(ctx, 110, 560, "You need no agent. If you have one, you can do more.", { align: "left", size: 25, color: G, alpha: fade(lt, cNo) });
  labels(ctx, lt, [
    [cOrg, cDraft, "the goal: a speakers page with comments", B],
    [cDraft, 999, "the draft and the run: planted, not a real run", Y],
  ]);
  mode(ctx, lt, [[0.4, 999, "intro"]]);
}

function setup(ctx, s) {
  const { lt, len } = s;
  const A = cuer("setup", s);
  const cReset = A("Run N P M run reset"), cDev = A("then N P M run dev"), cSecond = A("In a second terminal"), cCreates = A("It creates the speakers"),
    cNotYet = A("Do not open it yet"), cWhile = A("While the draft is there"), cRead = A("So read the read me");
  const cam = cam16(lt, len);
  const items = [];
  const t1 = [
    { cmd: "npm run reset" }, { out: "db.json restored from db.seed.json", color: G },
    { cmd: "npm run dev" }, { out: "▲ Next.js 16.3.5 (Turbopack)   - Local: http://localhost:3000", color: C.muted },
  ];
  const st1 = [...block(t1.slice(0, 2), cReset), ...block(t1.slice(2), cDev)];
  leftCard(items, lt, terminal("t-setup1", { title: "Terminal 1", entries: t1, chars: termChars(t1, lt, st1), w: 1120, size: 23, t: lt, cursor: lt < cSecond }), 0.2);
  const t2 = [
    { cmd: "node app/exercises/11/copy-draft.mjs" },
    { out: "app/exercises/11/speakers/actions.ts", color: C.text }, { out: "app/exercises/11/speakers/comment-count.ts", color: C.text },
    { out: "app/exercises/11/speakers/comment-form.tsx", color: C.text }, { out: "app/exercises/11/speakers/page.tsx", color: C.text },
  ];
  leftCard(items, lt, terminal("t-setup2", { title: "Terminal 2", entries: t2, chars: termChars(t2, lt, block(t2, cSecond + 0.3, 0.12)), w: 1120, size: 23, t: lt, cursor: lt >= cSecond }), cSecond - 0.3, 999, { top: 2.3 });
  // the right column: the folder, then the broken server
  const rows = [
    ["page.tsx", "the start page"], ["README.md", "the tasks"], ["draft/", "the planted draft (.txt)"], ["transcript.txt", "the planted run"],
    ["copy-draft.mjs", ""], ["ask-mcp.mjs", ""], ["solution/", "compare at the end"], ["speakers/", "your work folder"],
  ];
  const treeA = 1 - smooth(span(lt, cWhile - 0.3, cWhile + 0.1));
  if (treeA > 0.01) {
    rows.forEach(([name, note], i) => {
      const isNew = i === 7;
      const a = (isNew ? easeOut(span(lt, cCreates, cCreates + 0.5)) : easeOut(span(lt, 0.4 + i * 0.1, 0.9 + i * 0.1))) * treeA;
      if (a <= 0.01) return;
      const locked = isNew && lt > cNotYet;
      const img = pathRow(`pr-setup${i}${locked ? "l" : ""}`, { name, note: locked ? "do not open it yet" : note, glow: isNew ? 1 : 0, color: isNew ? (locked ? Y : G) : B, w: 860 });
      items.push(quad({ pos: [RX + (1 - a) * 2, 4.5 - i * 0.82, 0], w: 860 * K, h: 60 * K, rot: [0, -0.1, 0], img, alpha: a, grid: 3, glow: isNew ? (locked ? Y : G) : null, glowA: 0.25 }));
    });
  }
  const bq = browserItem(items, lt, browser("b-blank", { page: "blank", url: "localhost:3000/exercises/11", tab: "localhost:3000" }), cWhile - 0.1, 999, { glow: R });
  render(ctx, cam, items);
  if (bq) {
    ["/  →  500", "/exercises/11  →  500", "/exercises/11/speakers  →  500"].forEach((t, i) => {
      const a = fade(lt, cWhile + 0.4 + i * 0.35);
      pill(ctx, LABEL_X, 420 + i * 80, t, { size: 30, color: R, alpha: a, mono: true });
    });
    pill(ctx, LABEL_X, 700, "README.md: read it in your editor", { size: 28, color: G, alpha: fade(lt, cRead) });
  }
  labels(ctx, lt, [
    [0.4, cCreates, "app/exercises/11/", B, true],
    [cCreates, cWhile, "speakers/ is new: edit the files there", G],
    [cWhile, 999, "one broken \"use server\" file breaks every route", R],
  ]);
  mode(ctx, lt, [[0.3, 999, "do"]]);
}

function claim(ctx, s) {
  const { lt, len } = s;
  const A = cuer("claim", s);
  const cList = A("List the speakers"), cCache = A("Cache the comment counts"), cForm = A("Add a form"), cOne = A("Show one speaker"),
    cMade = A("The agent made thirty"), cDone = A("The feature is complete"), cJob = A("Your job is");
  const cam = cam16(lt, len);
  const items = [];
  const w1 = hlWeights(lt, [[cList, [0, 1]], [cCache, [2]], [cForm, [2, 3]], [cOne, [3, 4]], [cMade, []]]);
  leftCard(items, lt, mdCard("md-prompt", { title: "The prompt", tag: "a teammate typed it", tagColor: B, lines: PROMPT_LINES, w: 1160, size: 25, weights: w1, reveal: span(lt, 0.2, 1.2) * 6 }), 0.2, 999, { top: 3.9 });
  const w2 = hlWeights(lt, [[cDone, [7]]]);
  const done = lt > cJob;
  const lines = done ? [...CLAIM_LINES.slice(0, 7), { t: "The feature is complete.   ← a claim, not proof", c: C.red }] : CLAIM_LINES;
  rightCard(items, lt, mdCard("md-claim", { title: "The agent's last message", tag: "after 30 calls", tagColor: O, lines, w: 1160, size: 23, weights: w2, reveal: span(lt, cMade, cMade + 1.4) * 9 }), cMade - 0.2, 999, { k: 0.0098, top: 4.2, glow: done ? R : O });
  render(ctx, cam, items);
  labels(ctx, lt, [[cMade, 999, "turns: 30 · tokens in: 412k · cost: $1.46", C.muted]]);
  pill(ctx, LABEL_X, 790, "Your job: check the claim", { size: 30, color: Y, alpha: fade(lt, cJob) });
  mode(ctx, lt, [[0.3, 999, "claim"]]);
}

function predict(ctx, s) {
  const { lt, len } = s;
  const A = cuer("predict", s);
  const q1 = A("What does the prompt not say"), a1 = A("It does not say"), q2 = A("Which two requests"), a2 = A("Cache the counts, and"),
    why = A("because a cached scope"), q3 = A("Which tag must"), a3 = A("Comments dash talk");
  const cam = cam16(lt, len);
  const items = [];
  const lines = [
    "# 1. What does the prompt not say about this project?",
    { t: "Next 16, `cacheComponents: true`, and that the reads in `lib/` are cached.", c: G },
    "# 2. Which two requests pull against each other?",
    { t: "\"Cache the counts\" and `?speaker=`. A cache cannot read the request.", c: G },
    "# 3. Which tag must the action clear? Where is its name?",
    { t: "`comments-${talkId}`, in the `cacheTag` call of `lib/comments.ts`.", c: G },
  ];
  const reveal = keys(lt, [[q1 - 0.2, 0], [q1 + 0.3, 1], [a1, 1], [a1 + 0.5, 2], [q2, 2], [q2 + 0.4, 3], [a2, 3], [a2 + 0.5, 4], [q3, 4], [q3 + 0.4, 5], [a3, 5], [a3 + 0.5, 6]]);
  const wts = hlWeights(lt, [[q1, [0]], [a1, [1]], [q2, [2]], [a2, [3]], [q3, [4]], [a3, [5]]]);
  leftCard(items, lt, mdCard("md-predict", { title: "Predict", tag: "before you open speakers/", tagColor: Y, lines, w: 1160, size: 24, weights: wts, reveal }), 0.2, 999, { top: 4.6 });
  // right: one picture per question
  rightCard(items, lt, mdCard("md-unknown", {
    title: "What the agent does not know", tagColor: R, lines: [
      "- Next.js 16 and the App Router only", "- `cacheComponents: true`", "- the reads in `lib/` are cached already",
      "- the cache tag of the comments", "- no function in `lib/` adds a comment",
    ], w: 1000, size: 25, reveal: span(lt, a1, a1 + 2.0) * 6,
  }), a1 - 0.2, q2, { top: 4.4, glow: R, glowA: 0.12 });
  const meet = easeInOut(span(lt, q2 + 0.4, why));
  const ca = fade(lt, q2, q3);
  if (ca > 0.01) {
    const shake = lt > why ? Math.sin(lt * 40) * 0.05 * (1 - span(lt, why, why + 0.5)) : 0;
    node(items, { pos: [lerp(2.4, 4.6, meet) + shake, 1.6, 0], w: 3.6, h: 1.8, face: nodeFace("nf-cache", { title: '"use cache"', sub: "cache the counts", color: V }), color: V, alpha: ca, glow: V });
    node(items, { pos: [lerp(11.0, 8.8, meet) - shake, 1.6, 0], w: 3.6, h: 1.8, face: nodeFace("nf-sp", { title: "searchParams", sub: "?speaker=2", color: B }), color: B, alpha: ca, glow: B });
  }
  rightCard(items, lt, codeCard2("cc-comments", { title: "lib/comments.ts", tag: "given", tagColor: B, lines: COMMENTS_TS, w: 1160, size: 23, weights: hlWeights(lt, [[q3 + 0.3, [3]], [a3, [6]]]), reveal: span(lt, q3, q3 + 0.8) * 10 }), q3 - 0.1, 999, { k: 0.0096, top: 4.6 });
  render(ctx, cam, items);
  if (ca > 0.01) {
    pill(ctx, 1442, 720, "a cached scope cannot read the request", { size: 28, color: R, alpha: fade(lt, why, q3) });
    pill(ctx, 1442, 330, "they pull against each other", { size: 26, color: Y, alpha: fade(lt, a2 + 0.3, q3) });
  }
  mode(ctx, lt, [[0.2, a1, "do"], [a1, q2, "sol"], [q2, a2, "do"], [a2, q3, "sol"], [q3, a3, "do"], [a3, 999, "sol"]]);
}

// the dev server picture for Task 1: agent, next dev with /_next/mcp, and the browser tab
function devPicture(items, lt, a, { calls = [], tabOpen = 0, compileHot = 0 }) {
  const AG = [3.0, 3.4, 0], DEV = [10.2, 3.4, 0], TAB = [10.2, -0.4, 0];
  node(items, { pos: AG, face: nodeFace("nf-agent", { title: "an agent", sub: "ask-mcp.mjs", color: O }), color: O, alpha: a });
  node(items, { pos: DEV, face: nodeFace("nf-dev", { title: "next dev", sub: "/_next/mcp", color: compileHot > 0.5 ? R : B }), color: compileHot > 0.5 ? R : B, alpha: a, glow: compileHot > 0.5 ? R : null });
  node(items, { pos: TAB, face: nodeFace("nf-tab" + (tabOpen > 0.5 ? "o" : ""), { title: "browser tab", sub: tabOpen > 0.5 ? "open: HTTP 500" : "none open", color: tabOpen > 0.5 ? R : "#55607e" }), color: tabOpen > 0.5 ? R : "#55607e", alpha: a * (0.55 + 0.45 * tabOpen) });
  items.push(line3({ a: [4.7, 3.4, 0], b: [8.5, 3.4, 0], color: "#9fb6ff", width: 2, alpha: a * 0.6, dash: [8, 8] }));
  items.push(line3({ a: [10.2, 2.55, 0], b: [10.2, 0.45, 0], color: "#9fb6ff", width: 2, alpha: a * 0.4, dash: [8, 8] }));
  for (const [t0, color] of calls) {
    packet(items, [4.7, 3.4, 0], [8.5, 3.4, 0], span(lt, t0, t0 + 0.7), O);
    packet(items, [8.5, 3.4, 0], [4.7, 3.4, 0], span(lt, t0 + 0.8, t0 + 1.5), color);
  }
}

function t1do(ctx, s) {
  const { lt, len } = s;
  const A = cuer("t1do", s);
  const cEyes = A("Give the agent eyes"), cRun = A("With the dev server running"), cErr = A("Get errors says"), cRoutes = A("Get routes lists"),
    cNobody = A("but nobody opened it"), cComp = A("Compile route builds"), cFirst = A("and finds the first error");
  const cam = cam16(lt, len);
  const items = [];
  const P = "node app/exercises/11/ask-mcp.mjs";
  const e = [
    { cmd: `${P} get_errors` }, { out: '{"error":"No browser sessions connected. Please open your applicat…"}', color: Y },
    { cmd: `${P} get_routes` }, { out: '    "/exercises/11/solution/speakers",', color: C.muted }, { out: '    "/exercises/11/speakers",', color: G },
    { cmd: `${P} compile_route routeSpecifier=/exercises/11/speakers` },
    { out: "error  [project]/app/exercises/11/speakers/actions.ts", color: R },
    { out: 'Only async functions are allowed to be exported in a "use server" file.', color: R },
  ];
  const st = [...block(e.slice(0, 2), cErr - 1.3), ...block(e.slice(2, 5), cRoutes - 1.2), ...block(e.slice(5), cComp - 0.6, 0.3)];
  leftCard(items, lt, terminal("t-t1do", { title: "PowerShell · repo root · npm run dev runs in the other terminal", entries: e, chars: termChars(e, lt, st), w: 1170, size: 20, t: lt }), cRun - 0.4, 999, { top: 4.6 });
  devPicture(items, lt, fade(lt, cEyes), { calls: [[cErr - 0.9, Y], [cRoutes - 0.7, G], [cComp - 0.1, R]], compileHot: span(lt, cFirst - 0.2, cFirst) });
  render(ctx, cam, items);
  labels(ctx, lt, [
    [cEyes, cErr, "the agent asks the running app", B],
    [cErr, cRoutes, "get_errors sees only pages open in a tab", Y],
    [cRoutes, cComp, "get_routes reads the folders", G],
    [cComp, 999, "compile_route compiles without a request", R],
  ]);
  pill(ctx, 1442, 760, "On Windows, run compile_route in PowerShell or cmd, not Git Bash", { size: 21, color: C.muted, alpha: fade(lt, cComp + 0.5) });
  mode(ctx, lt, [[0.2, 999, "do"]]);
}

function t1see(ctx, s) {
  const { lt, len } = s;
  const A = cuer("t1see", s);
  const cOpen = A("Now open the page"), cBlank = A("It is blank"), cErr = A("Get errors returns"), cBroken = A("The page is broken"),
    cLogs = A("Get logs returns"), cNine = A("There are nine tools"), cNone = A("None of them looks");
  const cam = cam16(lt, len);
  const items = [];
  const P = "node app/exercises/11/ask-mcp.mjs";
  const e = [
    { cmd: `${P} get_errors` }, { out: '{"configErrors":[],"sessionErrors":[]}', color: Y },
    { cmd: `${P} get_page_metadata` }, { out: '{"sessions":[]}', color: Y },
    { cmd: `${P} get_logs` }, { out: '{"logFilePath":"…\\\\.next\\\\dev\\\\logs\\\\next-development.log"}', color: C.muted },
  ];
  const st = [...block(e.slice(0, 2), cErr - 1.0), ...block(e.slice(2, 4), cErr + 0.6), ...block(e.slice(4), cLogs - 0.9)];
  leftCard(items, lt, terminal("t-t1see", { title: "PowerShell · a browser tab is open now", entries: e, chars: termChars(e, lt, st), w: 1170, size: 21, t: lt }), cErr - 1.3, 999, { top: 4.6 });
  const b = browser("b-500", { page: "blank", url: "localhost:3000/exercises/11/speakers", tab: "localhost:3000" });
  browserItem(items, lt, b, cOpen - 0.2, cNine, { glow: R });
  const TOOLS = [
    ["get_project_metadata", "the project and the dev server URL"], ["get_errors", "errors of pages open in a tab"],
    ["get_page_metadata", "pages open in a tab"], ["get_logs", "the path of the log file"], ["get_server_action_by_id", "the file of a Server Action"],
    ["get_routes", "the routes, read from the folders"], ["get_request_insights", "needs experimental.requestInsights"],
    ["get_compilation_issues", "compile issues of the project"], ["compile_route", "compiles one route, no request"],
    ["look inside the cache?", "none of the nine"],
  ];
  const all = lt > cNine + 0.3 && lt < cNone ? [0, 1, 2, 3, 4, 5, 6, 7, 8] : [];
  const wts = hlWeights(lt, [[cNine - 0.1, all.length ? all : [0, 1, 2, 3, 4, 5, 6, 7, 8]], [cNone, [9]]]);
  rightCard(items, lt, table("tb-tools", {
    title: "the 9 tools of /_next/mcp", head: ["tool", "what it sees"], rows: TOOLS, widths: [400, 560], size: 23,
    weights: wts, rowColors: new Map([[9, R]]), reveal: span(lt, cNine, cNine + 1.0) * 11, mono: [0],
  }), cNine - 0.2, 999, { top: 4.8, k: 0.0108 });
  render(ctx, cam, items);
  labels(ctx, lt, [
    [cBlank, cNine, "HTTP 500 · a blank page", R],
    [cNine, 999, "no tool shows the cache: read the code", R],
  ]);
  pill(ctx, LABEL_X, 520, "empty lists for a broken page", { size: 30, color: Y, alpha: fade(lt, cBroken, cNine) });
  mode(ctx, lt, [[0.2, 999, "see"]]);
}

const DOCS = [
  ["03-api-reference/01-directives/use-cache.md", "a"],
  ["03-api-reference/04-functions/updateTag.md", "b"],
  ["03-api-reference/04-functions/cacheLife.md", "c"],
  ["03-api-reference/03-file-conventions/page.md", "d"],
  ["01-getting-started/08-caching.md", "e"],
  ["03-api-reference/06-cli/next.md", "f"],
];
function t2(ctx, s) {
  const { lt, len } = s;
  const A = cuer("t2", s);
  const cFind = A("Find the docs"), cMatch = A("The docs in node modules"), cCreate = A("Create prompt dot M D"), cAdd = A("Add one doc"),
    d = [A("use cache,"), A("update Tag,"), A("cache Life,"), A("page, the"), A("the caching guide"), A("the C L I page")], cTag = A("Then add the tag");
  const cam = cam16(lt, len);
  const items = [];
  const lines = [
    "# Read first:",
    "- `use-cache.md`: a cached function cannot read `searchParams`.",
    "- `updateTag.md`: only in Server Actions.",
    "- `cacheLife.md`: `default` `seconds` `minutes` `hours` `days` `weeks` `max`",
    "- `page.md`: `searchParams` is a promise.",
    "- `08-caching.md`: wrap the reader in `<Suspense>`, with a fallback.",
    "- `next.md`: `--debug-prerender` gives the error a source frame.",
    "# What this project has:",
    "- `getComments` caches under the tag `comments-${talkId}`.",
    "- Do not write a second read for the same data.",
  ];
  const reveal = keys(lt, [[cCreate, 0], [cCreate + 0.4, 1], ...d.flatMap((t, i) => [[t, 1 + i], [t + 0.4, 2 + i]]), [cTag, 7], [cTag + 1.2, 10]]);
  const wts = hlWeights(lt, [...d.map((t, i) => [t, [1 + i]]), [cTag, [8]]]);
  leftCard(items, lt, mdCard("md-t2", { title: "app/exercises/11/prompt.md", tag: "model answers", tagColor: G, lines, w: 1160, size: 23, weights: wts, reveal }), cCreate - 0.3, 999, { top: 4.8 });
  rightCard(items, lt, mdCard("md-agents", {
    title: "AGENTS.md", tag: "given", tagColor: B, lines: [
      "# This is NOT the Next.js you know",
      "Read the relevant guide in `node_modules/next/dist/docs/`",
      "before writing any code.",
      { t: "It names no file. You know which page matters.", c: Y },
    ], w: 1080, size: 24, reveal: span(lt, cMatch, cMatch + 1.5) * 5,
  }), cMatch - 0.2, cAdd, { top: 4.0 });
  const treeA = fade(lt, cAdd - 0.2);
  if (treeA > 0.01) {
    const hdr = pathRow("pr-docs-h", { name: "node_modules/next/dist/docs/01-app/", color: C.muted, w: 1000 });
    items.push(quad({ pos: [RX, 4.6, 0], w: 1000 * 0.0105, h: 60 * 0.0105, rot: [0, -0.1, 0], img: hdr, alpha: treeA, grid: 3 }));
    DOCS.forEach(([p, q], i) => {
      const lit = lt > d[i] - 0.1;
      const img = pathRow(`pr-docs${i}${lit ? "l" : ""}`, { name: "  " + p, note: `question ${q}`, glow: lit ? 1 : 0, color: lit ? G : B, dim: lit ? 0 : 0.35, w: 1000 });
      const a = treeA * easeOut(span(lt, cAdd + i * 0.08, cAdd + 0.5 + i * 0.08));
      items.push(quad({ pos: [RX + 0.3, 3.75 - i * 0.78, 0], w: 1000 * 0.0105, h: 60 * 0.0105, rot: [0, -0.1, 0], img, alpha: a, grid: 3, glow: lit ? G : null, glowA: 0.2 }));
    });
  }
  render(ctx, cam, items);
  labels(ctx, lt, [
    [cFind, cAdd, "your agent learned older Next.js", Y],
    [cAdd, cTag, "the docs that match the version you run", G],
    [cTag, 999, "and the tag, from lib/comments.ts", G],
  ]);
  mode(ctx, lt, [[0.2, cAdd, "do"], [cAdd, 999, "sol"]]);
}

function protocolStrip(ctx, lt, a, lit, skip = -1) {
  const names = ["prompt", "predict", "run", "read", "correct"];
  ctx.save();
  ctx.globalAlpha = a;
  names.forEach((n, i) => {
    const x = 1090 + i * 175;
    const on = lit.includes(i);
    pill(ctx, x, 300, n, { size: 26, color: on ? Y : C.muted, border: on ? Y : C.line, alpha: a });
    if (i < 4) { ctx.fillStyle = C.muted; ctx.font = `600 26px ${UI}`; ctx.textBaseline = "middle"; ctx.fillText("→", x + 66, 300); }
    if (i === skip) pill(ctx, x, 360, "the step people skip", { size: 20, color: O, alpha: a });
  });
  ctx.restore();
}

function t3(ctx, s) {
  const { lt, len } = s;
  const A = cuer("t3", s);
  const cWrite = A("Write the prompt"), cFolder = A("Use a new folder"), cTalk = A("Say that the new count"), cProof = A("Then add the proof"),
    cTsc = A("Run T S C"), cNoWrite = A("Do not test"), cStop = A("Stop after three"), cLast = A("Last, write five");
  const cam = cam16(lt, len);
  const items = [];
  const lines = [
    { t: "Read first: … (the docs from Task 2)", c: C.muted },
    { t: "What this project has: … (the tag from Task 2)", c: C.muted },
    "# The task:",
    "In `app/exercises/11/agent-speakers/`, list every speaker with their talks,",
    "the comment counts and a form. After a comment is added, the new count",
    "shows right away, here and on the talk page at `/talks/1`.",
    "# Proof, before you say \"done\":",
    "1. Run `npx tsc --noEmit` and `npx next build`. Paste what they print.",
    "2. Do not write to the data server to test.",
    "3. If the same call fails three times, stop and tell me what you learned.",
  ];
  const wts = hlWeights(lt, [[cFolder, [3]], [cTalk, [4, 5]], [cProof, [6]], [cTsc, [7]], [cNoWrite, [8]], [cStop, [9]], [cLast, []]]);
  leftCard(items, lt, mdCard("md-t3", { title: "prompt.md", tag: "model: solution/prompt.md", tagColor: G, lines, w: 1160, size: 23, weights: wts, reveal: keys(lt, [[cWrite, 0], [cWrite + 0.8, 3], [cFolder, 3], [cFolder + 0.4, 4], [cTalk, 4], [cTalk + 0.6, 6], [cProof, 6], [cProof + 0.3, 7], [cTsc, 7], [cTsc + 0.3, 8], [cNoWrite, 8], [cNoWrite + 0.3, 9], [cStop, 9], [cStop + 0.3, 10]]) }), cWrite - 0.3, 999, { top: 4.9 });
  const pl = [
    "1. The first tool call:", "2. The first file it reads:", "3. The files that it writes:", "4. Two mistakes that you expect:", "5. How it will know that it is done:",
  ];
  rightCard(items, lt, mdCard("md-predictmd", { title: "app/exercises/11/predict.md", tag: "before you read the run", tagColor: Y, lines: pl, w: 1080, size: 25, reveal: span(lt, cLast + 0.2, cLast + 2.6) * 6 }), cLast - 0.1, 999, { top: 3.4, k: 0.0102 });
  render(ctx, cam, items);
  protocolStrip(ctx, lt, fade(lt, cWrite), lt < cLast ? [0] : [0, 1], 3);
  pill(ctx, 1442, 470, "agent-speakers/: your run and your work do not mix", { size: 24, color: B, alpha: fade(lt, cFolder, cLast - 0.3) });
  pill(ctx, 1442, 550, "the proof turns \"done\" into something you can check", { size: 24, color: G, alpha: fade(lt, cProof, cLast - 0.3) });
  mode(ctx, lt, [[0.2, cFolder, "do"], [cFolder, cLast, "sol"], [cLast, 999, "do"]]);
}

// the transcript in the right column. Returns its quad, for the row positions.
const TK = 11.6 / TW;
function transcriptItem(items, lt, o, from, to = 999) {
  const a = fade(lt, from, to);
  if (a <= 0.003) return null;
  const img = transcript("tr-" + (o.key ?? "x"), o);
  const q = quad({ pos: [RX, 1.25, 0], w: TW * TK, h: TH * TK, rot: [0, -0.13, 0], img, alpha: a, grid: 8, glow: Y, glowA: 0.12 });
  items.push(q);
  return q;
}
const rowV = (n, top) => (THEAD + 10 + (n - 1 - top) * TROW + TROW / 2) / TH;

function t4read(ctx, s) {
  const { lt, len } = s;
  const A = cuer("t4read", s);
  const cRead = A("Read the run"), cDev = A("Read the dev server calls first"), c13 = A("After call thirteen"), cBut = A("But the answer was"),
    cNothing = A("That says nothing"), cNever = A("The agent never called"), c14 = A("The first error was already");
  const cam = cam16(lt, len);
  const items = [];
  const colors = new Map();
  if (lt > cDev) for (const n of [6, 7, 8, 13, 20, 23, 26]) colors.set(n, B);
  if (lt > c13) colors.set(13, Y);
  if (lt > c14) colors.set(14, R);
  const tq = transcriptItem(items, lt, { key: "read", top: 0, colors, dimOthers: lt > cDev }, 0.1);
  const lines = [
    "- 6 `nextjs_index`: one server, port 3000",
    "- 7 `get_errors`: No browser sessions connected",
    "- 8 `get_routes`: the new route is not in the list yet",
    "- 13 `get_errors`: No browser sessions connected",
    "- 20, 23, 26 `get_errors`: the same answer",
    { t: "Never called: `compile_route`, the tool that works without a tab.", c: R },
    { t: "Call 14 fetched the page. The error was in its `\"message\"` field.", c: R },
  ];
  const reveal = keys(lt, [[cDev, 0], [cDev + 1.6, 5], [cNever, 5], [cNever + 0.4, 6], [c14, 6], [c14 + 0.4, 7]]);
  leftCard(items, lt, mdCard("md-devcalls", { title: "The dev server calls", tag: "read them first", tagColor: B, lines, w: 1160, size: 24, weights: hlWeights(lt, [[c13, [3]], [cNever, [5]], [c14, [6]]]), reveal }), cDev - 0.2, 999, { top: 4.6 });
  render(ctx, cam, items);
  if (tq) {
    const p13 = tq.screenAt(cam, 0.62, rowV(13, 0));
    if (p13) {
      pill(ctx, p13.x, p13.y - 52, 'Agent: "No errors reported."', { size: 24, color: R, alpha: fade(lt, c13 + 0.3, cNever) });
      pill(ctx, p13.x - 60, p13.y + 56, "it means: no tab is open", { size: 22, color: Y, alpha: fade(lt, cNothing, cNever) });
    }
    const p14 = tq.screenAt(cam, 0.55, rowV(14, 0));
    if (p14) pill(ctx, p14.x, p14.y + 50, "the body held the first error", { size: 22, color: R, alpha: fade(lt, c14 + 0.3) });
  }
  labels(ctx, lt, [[cRead, cDev, "the last message is a claim. The calls are the evidence.", Y]], LABEL_X, 205);
  mode(ctx, lt, [[0.2, c13, "do"], [c13, 999, "sol"]]);
}

// the loop: three steps that turn, with a round counter
function loopRing(items, lt, a, round) {
  const names = [["edit one line", O], ["curl → 500", R], ["get_errors", B]];
  const c = [-6.2, 1.9, 0];
  const turn = lt * 0.9;
  names.forEach(([n, col], i) => {
    const ang = turn + (i / 3) * Math.PI * 2;
    const p = [c[0] + Math.cos(ang) * 3.4, c[1] + Math.sin(ang) * 2.2, Math.sin(ang) * 1.2];
    node(items, { pos: p, w: 3.4, h: 1.5, d: 0.8, face: nodeFace("nf-loop" + i, { title: n, color: col }), color: col, alpha: a, rot: [0.05, 0, 0] });
  });
  items.push(label3({ at: [c[0], c[1] - 0.15, 0], text: `round ${round}`, color: R, size: 34, alpha: a }));
}

function t4stop(ctx, s) {
  const { lt, len } = s;
  const A = cuer("t4stop", s);
  const cFind = A("Now find the loop"), cFrom = A("From call twenty"), cNever = A("The answer never changes"), cStop = A("Stop it after"),
    c17 = A("Call seventeen was refused"), cScript = A("so the agent wrote a script"), cDb = A("and it saved a comment"),
    cCorr = A("Then write a correction"), p1 = A("stop, what you know"), p2 = A("what you know"), p3 = A("what to do"), p4 = A("and the proof");
  const cam = cam16(lt, len);
  const items = [];
  const top = keys(lt, [[cFind, 0], [cFind + 1.4, 16]]);
  const colors = new Map();
  if (lt > cFrom) for (let n = 20; n <= 28; n++) colors.set(n, R);
  if (lt > c17) colors.set(17, O);
  if (lt > cScript) { colors.set(18, O); colors.set(19, O); }
  const tq = transcriptItem(items, lt, { key: "stop", top, colors, dimOthers: lt > cFrom, loop: span(lt, cFrom, cFrom + 0.6), stop: span(lt, cStop, cStop + 0.4) }, 0.1, cCorr + 0.2);
  // left: the loop, then the correction
  const ringA = fade(lt, cFrom - 0.2, cCorr);
  if (ringA > 0.01) loopRing(items, lt, ringA, lt < cNever ? 1 : lt < cStop ? 2 : 3);
  const corr = [
    "# Stop.",
    "Calls 20 to 28 are one loop. The answer is in a place you did not read.",
    "# What I know:",
    "- `get_errors` sees only pages that are open in a browser tab.",
    "- The body of call 14 has the first error, in a `\"message\"` field.",
    "- Calls 18 and 19 wrote a comment to `db.json`. Run `npm run reset`.",
    "# Do this now:",
    "- Call `compile_route` for `/exercises/11/speakers`. Fix one error at a time.",
    "- Read `lib/comments.ts` before you write another cache.",
    "# Proof:",
    "- Run `npx tsc --noEmit` and `npx next build`. Paste both outputs.",
  ];
  const cr = keys(lt, [[cCorr, 0], [p1, 0], [p1 + 0.4, 2], [p2, 2], [p2 + 0.6, 6], [p3 - 0.1, 6], [p3 + 0.4, 9], [p4 - 0.3, 9], [p4 + 0.1, 11]]);
  const cw = hlWeights(lt, [[p1, [0]], [p2, [2]], [p3, [6]], [p4, [9]]]);
  leftCard(items, lt, mdCard("md-corr", { title: "app/exercises/11/correction.md", tag: "under 12 lines", tagColor: G, lines: corr, w: 1170, size: 22, weights: cw, reveal: cr }), cCorr - 0.2, 999, { top: 5.0 });
  const cmA = fade(lt, cCorr + 0.2);
  if (cmA > 0.01) rightCard(items, lt, mdCard("md-stoprule", {
    title: "The stop rule", tag: "copy it into your agent", tagColor: R, lines: [
      "The same kind of call three times, with a small change each time, is a loop.",
      "A loop costs turns and money, and it teaches the agent nothing.",
      "A bare \"try again\" starts the loop again.",
      { t: "Calls 20 to 30: 11 of 30 turns, about a third of the cost.", c: Y },
    ], w: 1140, size: 23, reveal: span(lt, cCorr + 0.2, cCorr + 2) * 5,
  }), cCorr + 0.2, 999, { top: 3.4, k: 0.0098 });
  render(ctx, cam, items);
  if (tq) {
    pill(ctx, 110, 770, "call 17 refused → calls 18 and 19 ran the same write from a file", { align: "left", size: 23, color: O, alpha: fade(lt, cScript, cCorr) });
    pill(ctx, 110, 830, "db.json is in git: run npm run reset", { align: "left", size: 23, color: O, alpha: fade(lt, cDb, cCorr), mono: false });
  }
  labels(ctx, lt, [[cFrom, cCorr, "edit · curl · get_errors · same answer", R]], LABEL_X, 205);
  mode(ctx, lt, [[0.2, cFrom, "do"], [cFrom, cCorr, "sol"], [cCorr, p1, "do"], [p1, 999, "sol"]]);
}

// the scoreboard: which check caught which mistake. n rows shown.
function scoreboard(key, n, hot = -1, k = 999) {
  const rows = [
    ["type check", '`cacheLife("short")`'.replace(/`/g, "")],
    ["compiler", "export const MAX_LENGTH"],
    ["prerender", 'searchParams inside "use cache"'],
    ["prerender", "searchParams outside <Suspense>"],
  ];
  return table(key, {
    title: "caught so far", head: ["check", "mistake"], rows, widths: [230, 560], size: 24, reveal: Math.min(n, k),
    weights: new Map(hot >= 0 ? [[hot, 1]] : []), rowColors: new Map([[hot, R]]), mono: [1], accent: G,
  });
}

function t5tsc(ctx, s) {
  const { lt, len } = s;
  const A = cuer("t5tsc", s);
  const cFact = A("The build is the fact checker"), cRun = A("First, run T S C"), cOne = A("It finds one error"), cShort = A("Cache Life short"),
    cTable = A("The table in"), cWants = A("The file wants"), cUse = A("so use seconds");
  const cam = cam16(lt, len);
  const items = [];
  const e = [
    { cmd: "npx tsc --noEmit" },
    { out: "app/exercises/11/speakers/comment-count.ts(10,13): error TS2769:", color: R },
    { out: "  No overload matches this call.", color: R },
    { out: "    Type '\"short\"' has no properties in common with type '{ stale?…", color: C.muted },
  ];
  leftCard(items, lt, terminal("t-tsc", { entries: e, chars: termChars(e, lt, block(e, cRun - 0.1, 0.12)), w: 1170, size: 21, t: lt }), cRun - 0.4, 999, { top: 5.0 });
  const fixed = lt > cUse + 0.2;
  leftCard(items, lt, codeCard2("cc-count" + (fixed ? "f" : ""), { title: "speakers/comment-count.ts", tag: "draft", tagColor: O, lines: COUNT_TS(fixed), w: 1160, size: 23, weights: hlWeights(lt, [[cShort, [3]], [cWants, [0]], [cUse, [3]]]), reveal: span(lt, cOne, cOne + 0.8) * 8 }), cOne - 0.1, 999, { top: 1.75, glow: fixed ? G : null });
  rightCard(items, lt, pipeline("pl-tsc", { title: "npx tsc --noEmit · the type check alone", states: ["idle", lt < cOne ? (lt > cRun ? "run" : "idle") : "fail", "idle"], t: lt }), cFact - 0.2, cTable - 0.1, { top: 4.6, k: 0.0098 });
  const prof = [
    ["default", "5 minutes", "15 minutes", "never"], ["seconds", "30 seconds", "1 second", "1 minute"], ["minutes", "5 minutes", "1 minute", "1 hour"],
    ["hours", "5 minutes", "1 hour", "1 day"], ["days", "5 minutes", "1 day", "1 week"], ["weeks", "5 minutes", "1 week", "30 days"], ["max", "5 minutes", "30 days", "1 year"],
  ];
  rightCard(items, lt, table("tb-cachelife", { title: "cacheLife.md · the profiles", head: ["profile", "stale", "revalidate", "expire"], rows: prof, widths: [200, 230, 230, 200], size: 24, weights: hlWeights(lt, [[cTable + 0.6, [0, 1, 2, 3, 4, 5, 6]], [cWants, [1]]]), rowColors: new Map([[1, G]]), reveal: span(lt, cTable, cTable + 1) * 8 }), cTable - 0.2, 999, { top: 4.7, k: 0.0112 });
  render(ctx, cam, items);
  labels(ctx, lt, [
    [cFact, cShort, "one error at a time", Y],
    [cShort, cWants, "\"short\" is not a profile", R],
    [cWants, 999, "cacheLife(\"seconds\"): stale 30 seconds", G, true],
  ]);
  mode(ctx, lt, [[0.2, cWants, "do"], [cWants, 999, "sol"]]);
}

function t5build(ctx, s) {
  const { lt, len } = s;
  const A = cuer("t5build", s);
  const cRun = A("Now run the build"), cComp = A("The compiler stops"), cUse = A("A use server file"), cRemove = A("Remove the word export"),
    cAgain = A("Build again"), cPre = A("Now the prerender stops"), cReads = A("The page reads"), cDel = A("Delete the use cache line");
  const cam = cam16(lt, len);
  const items = [];
  const e1 = [
    { cmd: "npx next build" }, { out: "./app/exercises/11/speakers/actions.ts:7:1", color: R },
    { out: 'Error: Only async functions are allowed to be exported in a "use server" file.', color: R },
  ];
  const e2 = [
    { cmd: "npx next build" }, { out: "✓ Compiled successfully   ·   Finished TypeScript", color: G },
    { out: "Error: Route /exercises/11/speakers used `searchParams` inside \"use cache\".", color: R },
    { out: "    at n (app\\exercises\\11\\speakers\\page.tsx:15:23)", color: C.muted },
  ];
  leftCard(items, lt, terminal("t-b1", { entries: e1, chars: termChars(e1, lt, block(e1, cRun, 0.25).map((t, i) => (i ? Math.max(t, cComp - 0.1) : t))), w: 1170, size: 21, t: lt }), cRun - 0.3, cAgain, { top: 5.0 });
  leftCard(items, lt, terminal("t-b2", { entries: e2, chars: termChars(e2, lt, block(e2, cAgain, 0.3).map((t, i) => (i >= 2 ? Math.max(t, cPre - 0.1) : t))), w: 1170, size: 21, t: lt }), cAgain, 999, { top: 5.0 });
  const fixedA = lt > cRemove + 0.4;
  leftCard(items, lt, codeCard2("cc-actions" + (fixedA ? "f" : ""), { title: "speakers/actions.ts", tag: '"use server"', tagColor: V, lines: ACTIONS_TS(fixedA), w: 1120, size: 24, weights: hlWeights(lt, [[cUse, [0]], [cUse + 1.6, [4, 6]], [cRemove, [4]]]), reveal: span(lt, cUse, cUse + 0.8) * 8 }), cUse - 0.1, cReads, { top: 1.9, glow: fixedA ? G : null });
  const fixedP = lt > cDel + 0.8;
  leftCard(items, lt, codeCard2("cc-dpage" + (fixedP ? "f" : ""), { title: "speakers/page.tsx", tag: "draft", tagColor: O, lines: DRAFT_PAGE(fixedP), w: 1160, size: 22, weights: hlWeights(lt, [[cReads, [0, 4]], [cDel, [0]]]), reveal: span(lt, cReads, cReads + 0.8) * 7 }), cReads - 0.1, 999, { top: 2.0, glow: fixedP ? G : null });
  const states = [
    lt < cRun ? "idle" : lt < cComp ? "run" : lt < cAgain ? "fail" : "pass",
    lt < cAgain + 0.3 ? "idle" : lt < cAgain + 0.9 ? "run" : "pass",
    lt < cAgain + 0.9 ? "idle" : lt < cPre ? "run" : "fail",
  ];
  rightCard(items, lt, pipeline("pl-build", { states, t: lt }), 0.1, 999, { top: 4.8, k: 0.0098 });
  const n = lt < cComp ? 1 : lt < cPre ? 2 : 3;
  rightCard(items, lt, scoreboard("sb-build", n, lt > cPre ? 2 : lt > cComp ? 1 : 0), 0.3, 999, { top: 2.0, k: 0.0112 });
  render(ctx, cam, items);
  labels(ctx, lt, [
    [cRun, cRemove, "the compiler: exports in a \"use server\" file", V],
    [cRemove, cAgain, "remove export: MAX_LENGTH stays private", G],
    [cAgain, cDel, "the prerender: request data in a cache", R],
    [cDel, 999, "read searchParams outside the cache", G],
  ], LABEL_X, 205);
  mode(ctx, lt, [[0.2, cRemove, "do"], [cRemove, cAgain, "sol"], [cAgain, cDel, "do"], [cDel, 999, "sol"]]);
}

function t5suspense(ctx, s) {
  const { lt, len } = s;
  const A = cuer("t5suspense", s);
  const cAgain = A("Build again"), cNew = A("The new error says"), cNoLine = A("and it has no line number"), cDebug = A("Add the debug prerender"),
    cPoints = A("Now it points"), cMove = A("Move that code"), cWrap = A("and wrap it in Suspense"), cShell = A("The shell shows"),
    cStream = A("the list streams in"), cGreen = A("The build is green");
  const cam = cam16(lt, len);
  const items = [];
  const e = [
    { cmd: "npx next build" },
    { out: 'Error: Route "/exercises/11/speakers": Next.js encountered uncached', color: R },
    { out: "or runtime data during prerendering.      at div (<anonymous>)", color: R },
    { cmd: "npx next build --debug-prerender" },
    { out: "    at Speakers (app\\exercises\\11\\speakers\\page.tsx:14:23)", color: Y },
    { out: ">  14 |   const { speaker } = await searchParams;", color: Y },
  ];
  const st = [...block(e.slice(0, 3), cAgain, 0.2).map((t, i) => (i ? Math.max(t, cNew - 0.2) : t)), ...block(e.slice(3), cDebug, 0.3).map((t, i) => (i ? Math.max(t, cPoints - 0.1) : t))];
  leftCard(items, lt, terminal("t-susp", { entries: e, chars: termChars(e, lt, st), w: 1170, size: 21, t: lt }), cAgain - 0.3, 999, { top: 5.0 });
  leftCard(items, lt, codeCard2("cc-sollist", { title: "speakers/speaker-list.tsx", tag: "async component", tagColor: B, lines: SOL_LIST, w: 1160, size: 22, weights: hlWeights(lt, [[cMove, [0, 1]]]), reveal: span(lt, cMove, cMove + 0.6) * 5 }), cMove - 0.1, cWrap, { top: 1.3 });
  leftCard(items, lt, codeCard2("cc-solpage", { title: "speakers/page.tsx", tag: "the shell", tagColor: B, lines: SOL_PAGE, w: 1160, size: 22, weights: hlWeights(lt, [[cWrap, [4, 5, 6]], [cShell, [3]], [cStream, [5]]]), reveal: span(lt, cWrap, cWrap + 0.8) * 9 }), cWrap - 0.1, 999, { top: 1.3, glow: lt > cGreen ? G : null });
  const green = lt > cGreen - 0.2;
  const states = [lt < cAgain + 0.4 ? "run" : "pass", lt < cAgain + 0.7 ? "idle" : "pass", lt < cNew - 0.2 ? "run" : green ? "pass" : "fail"];
  rightCard(items, lt, pipeline("pl-susp", { states, t: lt }), 0.1, 999, { top: 4.8, k: 0.0098, glow: green ? G : null });
  rightCard(items, lt, scoreboard("sb-susp", lt > cNew ? 4 : 3, lt > cNew ? 3 : -1), 0.2, cShell - 0.4, { top: 2.0, k: 0.0112 });
  const listIn = span(lt, cStream, cStream + 0.6);
  const b = browser("b-stream", { page: "speakersSol", url: "localhost:3000/exercises/11/speakers?speaker=1", listIn, t: lt });
  browserItem(items, lt, b, cShell - 0.4, 999, { w: 9.6, top: 2.25, glow: green ? G : B });
  render(ctx, cam, items);
  labels(ctx, lt, [
    [cNew, cDebug, "no source frame", R],
    [cDebug, cMove, "--debug-prerender adds the line", Y, true],
    [cMove, cGreen, "stream: the shell now, the list later", G],
    [cGreen, 999, "✓ the build is green", G],
  ], LABEL_X, 205);
  mode(ctx, lt, [[0.2, cMove, "do"], [cMove, 999, "sol"]]);
}

function t5copy(ctx, s) {
  const { lt, len } = s;
  const A = cuer("t5copy", s);
  const cLeft = A("but one bug is left"), cOpen1 = A("Open talk one"), cTwo = A("It says two comments"), cOnSpk = A("On the speakers page"),
    cUp = A("The count goes up"), cOpen2 = A("Open talk one again"), cStill = A("It still says two"), cCopy = A("The agent wrote a second copy"),
    cOwn = A("with its own tag"), cDel = A("Delete comment count"), cRead = A("Read get Comments"), cClear = A("and clear the comments tag"),
    cBoth = A("Now both pages say four");
  const cam = cam16(lt, len);
  const items = [];
  // the right column: the pages in the browser
  const typed = "Great talk!".slice(0, Math.floor(span(lt, cOnSpk + 0.4, cOnSpk + 1.4) * 11));
  const press = cUp - 0.4;
  let b;
  if (lt < cOpen1) b = browser("b-copy0", { page: "speakersDraft", url: "localhost:3000/exercises/11/speakers?speaker=1" });
  else if (lt < cOnSpk) b = browser("b-copy1", { page: "talk", nav: "Talks", url: "localhost:3000/talks/1", comments: 2, countHot: lt > cTwo ? Y : null });
  else if (lt < cOpen2) b = browser("b-copy2", { page: "speakersDraft", url: "localhost:3000/exercises/11/speakers?speaker=1", typed: lt < press ? typed : "", typeHot: lt < press, pressHot: lt > press - 0.2 && lt < press + 0.3 ? 1 : 0, counts: { 1: lt > cUp ? 3 : 2 }, countHot: lt > cUp ? G : null, t: lt });
  else if (lt < cBoth) b = browser("b-copy3", { page: "talk", nav: "Talks", url: "localhost:3000/talks/1", comments: 2, countHot: lt > cStill ? R : null });
  else b = browser("b-copy4", { page: "talk", nav: "Talks", url: "localhost:3000/talks/1", comments: 4, extra: ["Great talk!", "The count is right now."], countHot: G });
  const bq = browserItem(items, lt, b, 0.1, 999, { glow: lt > cStill && lt < cBoth ? R : lt > cBoth ? G : B });
  // the left column: two caches with two tags
  const SP = [-10.0, 3.4, 0], TP = [-10.0, -0.4, 0], CC = [-3.6, 3.4, 0], CM = [-3.6, -0.4, 0], ACT = [-6.8, 5.5, 0];
  const la = fade(lt, cLeft);
  const drop = easeInOut(span(lt, cDel, cDel + 0.9));
  const rerouted = lt > cRead;
  const ccVal = lt > cUp ? 3 : 2;
  const cmVal = lt > cBoth - 0.3 ? 4 : 2;
  node(items, { pos: SP, face: nodeFace("nf-sp-page", { title: "speakers page", sub: "?speaker=1", color: O }), color: O, alpha: la, glow: lt > cBoth ? G : null });
  node(items, { pos: TP, face: nodeFace("nf-talk-page", { title: "talk page", sub: "/talks/1", color: B }), color: B, alpha: la, glow: lt > cStill && lt < cBoth ? R : lt > cBoth ? G : null });
  node(items, { pos: [CC[0], CC[1] - drop * 6, CC[2] + drop * 2], w: 3.6, face: nodeFace("nf-cc" + ccVal, { title: "comment-count-1", big: ccVal, color: O }), color: O, alpha: la * (1 - drop), glow: lt > cUp && lt < cOpen2 ? G : null, rot: [0.05 + drop * 1.2, drop * 0.8, 0] });
  node(items, { pos: CM, w: 3.6, face: nodeFace("nf-cm" + cmVal, { title: "comments-1", big: cmVal, color: B }), color: B, alpha: la, glow: lt > cStill && lt < cBoth ? R : lt > cBoth ? G : null });
  node(items, { pos: ACT, w: 3.2, h: 1.3, face: nodeFace("nf-act", { title: "addComment", sub: "the action", color: V }), color: V, alpha: fade(lt, cOnSpk - 0.3) });
  const lineA = la * 0.8;
  if (!rerouted) items.push(line3({ a: [-8.3, 3.4, 0], b: [-5.4, 3.4, 0], color: O, width: 3, alpha: lineA * (1 - drop) }));
  else items.push(line3({ a: [-8.3, 3.0, 0], b: [-5.4, 0.0, 0], color: G, width: 4, alpha: lineA * span(lt, cRead, cRead + 0.4) }));
  items.push(line3({ a: [-8.3, -0.4, 0], b: [-5.4, -0.4, 0], color: B, width: 3, alpha: lineA }));
  // the action clears a tag
  packet(items, [-6.8, 4.8, 0], [-4.4, 4.2, 0], span(lt, cUp - 0.9, cUp - 0.1), V, 0.6);
  packet(items, [-6.8, 4.8, 0], [-4.4, 0.4, 0], span(lt, cClear, cClear + 0.9), G, 0.8);
  render(ctx, cam, items);
  // labels
  const at = (p, dy = 0) => { const q = project3(cam, p); return q ? [q.x, q.y + dy] : null; };
  const lbl = (p, text, color, from, to, mono = true) => { const q = at(p, -82); if (q) pill(ctx, q[0], q[1], text, { size: 22, color, alpha: fade(lt, from, to), mono }); };
  lbl(CC, "draft: comment-count.ts", O, cLeft, cDel);
  lbl(CM, "lib/comments.ts · getComments", B, cLeft, 999);
  lbl(ACT, "updateTag(`comment-count-${talkId}`)", R, cOnSpk, cDel);
  lbl(ACT, "updateTag(`comments-${talkId}`)", G, cClear, 999);
  if (lt > cOwn && lt < cDel) {
    const q = at([-3.6, 1.5, 0]);
    if (q) pill(ctx, q[0], q[1], "two tags for one set of comments", { size: 24, color: R, alpha: fade(lt, cOwn, cDel) });
  }
  pill(ctx, 110, 760, "const comments = await getComments(t.id);  →  {comments.length}", { align: "left", size: 22, color: G, alpha: fade(lt, cRead), mono: true });
  labels(ctx, lt, [
    [cLeft, cOpen1, "the build is green", G],
    [cOpen1, cOnSpk, "/talks/1 · Comments 2", Y, true],
    [cOnSpk, cOpen2, "speakers page · 2 → 3", G],
    [cOpen2, cBoth, "/talks/1 · still 2", R, true],
    [cBoth, 999, "both pages · 4 comments", G],
  ], LABEL_X, 205);
  if (bq) pill(ctx, LABEL_X, 815, "no tool and no build reports this", { size: 24, color: R, alpha: fade(lt, cStill + 0.3, cDel) });
  mode(ctx, lt, [[0.2, cCopy, "do"], [cCopy, 999, "sol"]]);
}

function t6(ctx, s) {
  const { lt, len } = s;
  const A = cuer("t6", s);
  const cRev = A("Write the review"), q = [A("Does it do what"), A("Does it fix the cause"), A("What else did it touch"), A("Is there a second copy")],
    cTask6 = A("Task six"), cCmp = A("Compare your files"), cAlso = A("The solution also checks"), cThrows = A("so a failed write throws"), cAgent = A("If you have an agent");
  const cam = cam16(lt, len);
  const items = [];
  const lines = [
    "# 1. Does it do what the prompt asked?",
    { t: "No. The build fails four times. \"Complete\" was a claim.", c: G },
    "# 2. Does it fix the cause, or only hide a symptom?",
    { t: "It hides one: `\"use cache\"` on the whole page, for speed.", c: G },
    "# 3. What else did it touch?",
    { t: "`db.json`, through the test script. Run `npm run reset`.", c: G },
    "# 4. Is there a second copy of the same mistake?",
    { t: "Yes: `comment-count.ts` copies `getComments`, with its own tag.", c: G },
  ];
  const reveal = keys(lt, [[q[0], 0], [q[0] + 0.3, 1], [q[0] + 1.5, 1], [q[0] + 1.9, 2], [q[1], 2], [q[1] + 0.3, 3], [q[1] + 1.8, 3], [q[1] + 2.2, 4], [q[2], 4], [q[2] + 0.3, 5], [q[2] + 1.3, 5], [q[2] + 1.7, 6], [q[3], 6], [q[3] + 0.3, 7], [q[3] + 1.6, 7], [q[3] + 2.0, 8]]);
  leftCard(items, lt, mdCard("md-review", { title: "app/exercises/11/review.md", tag: "the four questions", tagColor: Y, lines, w: 1160, size: 24, weights: hlWeights(lt, q.map((t, i) => [t, [i * 2]]).concat([[cTask6, []]])), reveal }), cRev - 0.2, 999, { top: 4.7 });
  const d = [
    { cmd: "git diff --no-index app/exercises/11/speakers app/exercises/11/solution/speakers" },
    { out: "-  await fetch(`${API}/comments`, {", color: R },
    { out: "+  const res = await fetch(`${API}/comments`, {", color: G },
    { out: "+  if (!res.ok) throw new Error(`POST /comments failed with ${res.status}`);", color: G },
  ];
  rightCard(items, lt, terminal("t-diff", { entries: d, chars: termChars(d, lt, block(d, cCmp - 0.2, 0.25)), w: 1180, size: 20, t: lt }), cTask6 - 0.2, cAgent, { top: 4.8, k: 0.0096 });
  rightCard(items, lt, codeCard2("cc-solaction", { title: "solution/speakers/actions.ts", tag: '"use server"', tagColor: V, lines: SOL_ACTION, w: 1180, size: 22, weights: hlWeights(lt, [[cAlso, [4]], [cThrows + 0.8, [6]]]), reveal: span(lt, cAlso, cAlso + 0.8) * 8 }), cAlso - 0.2, cAgent, { top: 2.3, k: 0.0096 });
  const g = [
    { cmd: "git switch -c agent-speakers-try" }, { out: "Switched to a new branch 'agent-speakers-try'", color: C.muted },
    { out: "… give the agent your prompt.md, and watch it with the stop rule …", color: Y },
    { cmd: "git switch -" }, { cmd: "git branch -D agent-speakers-try" },
  ];
  rightCard(items, lt, terminal("t-branch", { entries: g, chars: termChars(g, lt, block(g, cAgent + 0.2, 0.35)), w: 1100, size: 22, t: lt }), cAgent - 0.1, 999, { top: 4.0, k: 0.0102, glow: G });
  render(ctx, cam, items);
  labels(ctx, lt, [
    [cTask6, cAlso, "your fixed work vs the model", B],
    [cAlso, cAgent, "a failed write is an error, not a silent pass", G],
    [cAgent, 999, "a branch makes a bad run free", G],
  ], LABEL_X, 205);
  mode(ctx, lt, [[0.2, cTask6, "sol"], [cTask6, cAgent, "sol"], [cAgent, 999, "do"]]);
}

function t7(ctx, s) {
  const { lt, len } = s;
  const A = cuer("t7", s);
  const cGive = A("Give the agent inside"), cFile = A("A tool is a file"), cCalls = A("Search talks calls"), cOut = A("because eve runs outside"),
    cDesc = A("The description tells"), cSchema = A("The schema checks"), cRead = A("A read needs no approval"), cWrite = A("Only a write waits"), cEval = A("The eval checks");
  const cam = cam16(lt, len);
  const items = [];
  leftCard(items, lt, codeCard2("cc-tool", { title: "app/exercises/11/eve/search_talks.ts", tag: "a tool is a file", tagColor: V, lines: TOOL_TS, w: 1180, size: 21, weights: hlWeights(lt, [[cFile, [3]], [cCalls, [9]], [cOut, [2]], [cDesc, [4, 5]], [cSchema, [6]], [cRead, [7]], [cEval, []]]), reveal: span(lt, cGive, cGive + 1.2) * 16 }), cGive - 0.2, 999, { top: 5.2 });
  // the right column: eve next to next dev
  const da = fade(lt, cGive, cEval);
  if (da > 0.01) {
    const EVE = [3.4, 3.4, 0], NEXT = [10.0, 3.4, 0], LIB = [10.0, -0.3, 0];
    node(items, { pos: EVE, face: nodeFace("nf-eve", { title: "eve process", sub: "agent/tools/", color: V }), color: V, alpha: da, glow: lt > cFile && lt < cCalls ? V : null });
    node(items, { pos: NEXT, face: nodeFace("nf-next", { title: "next dev", sub: "/api/talks/search", color: B }), color: B, alpha: da });
    node(items, { pos: LIB, face: nodeFace("nf-lib", { title: "lib/talks.ts", sub: '"use cache"', color: "#55607e" }), color: "#55607e", alpha: da * 0.8 });
    items.push(line3({ a: [5.2, 3.4, 0], b: [8.2, 3.4, 0], color: G, width: 3, alpha: da * span(lt, cCalls, cCalls + 0.4) }));
    items.push(line3({ a: [10.0, 2.5, 0], b: [10.0, 0.6, 0], color: B, width: 3, alpha: da * 0.7 }));
    items.push(line3({ a: [4.6, 2.5, 0], b: [8.6, 0.3, 0], color: R, width: 3, alpha: da * span(lt, cOut, cOut + 0.4), dash: [10, 10] }));
    packet(items, [5.2, 3.4, 0], [8.2, 3.4, 0], span(lt, cCalls + 0.2, cCalls + 1.0), G, 0.7);
    packet(items, [8.2, 3.4, 0], [5.2, 3.4, 0], span(lt, cCalls + 1.1, cCalls + 1.8), B, 0.7);
  }
  rightCard(items, lt, codeCard2("cc-eval", { title: "app/exercises/11/eve/search.eval.ts", tag: "the test", tagColor: G, lines: EVAL_TS, w: 1180, size: 21, weights: hlWeights(lt, [[cEval + 0.2, [5]], [cEval + 1.6, [6]]]), reveal: span(lt, cEval, cEval + 0.8) * 10 }), cEval - 0.1, 999, { top: 4.6, k: 0.0096, glow: G });
  render(ctx, cam, items);
  if (da > 0.01) {
    const q = project3(cam, [6.6, 1.6, 0]);
    if (q) pill(ctx, q.x, q.y, "✕ no \"use cache\" outside Next", { size: 22, color: R, alpha: fade(lt, cOut + 0.3, cEval) });
    pill(ctx, 1150, 720, "search_talks · a read · no approval", { size: 24, color: G, alpha: fade(lt, cRead, cEval), mono: true });
    pill(ctx, 1640, 720, "vote_for_talk · approval: always()", { size: 24, color: Y, alpha: fade(lt, cWrite, cEval), mono: true });
  }
  labels(ctx, lt, [
    [cGive, cDesc, "the tool calls a Route Handler, like any caller", B],
    [cDesc, cSchema, "a real model picks a tool by its description", V],
    [cSchema, cRead, "eve checks the input before execute runs", G],
    [cEval, 999, "the test: one call, and the right talk", G],
  ], LABEL_X, 205);
  mode(ctx, lt, [[0.2, cFile, "do"], [cFile, 999, "sol"]]);
}

function close(ctx, s) {
  const { lt, len } = s;
  const A = cuer("close", s);
  const cFour = A("Four mistakes"), cComp = A("The compiler caught"), cType = A("The type check caught"), cPre = A("The prerender caught"),
    cFifth = A("A fifth mistake"), cCopy = A("the second copy"), cSaid = A("The agent said"), cOne = A("One command"), cCmd = A("N P X next build"), cReset = A("To start again");
  const cam = cam16(lt, len);
  const items = [];
  const rows = [
    ["compiler", 'export const MAX_LENGTH in a "use server" file'],
    ["type check", 'cacheLife("short")'],
    ["prerender", 'searchParams inside "use cache"'],
    ["prerender", "searchParams outside <Suspense>"],
    ["only you", "a second copy of getComments, with its own tag"],
  ];
  const reveal = keys(lt, [[cComp, 0], [cComp + 0.3, 1], [cType, 1], [cType + 0.3, 2], [cPre, 2], [cPre + 0.3, 3], [cPre + 1.4, 3], [cPre + 1.7, 4], [cFifth, 4], [cCopy - 0.2, 4], [cCopy + 0.2, 5]]);
  leftCard(items, lt, table("tb-close", { title: "Which check caught which mistake?", head: ["check", "mistake"], rows, widths: [230, 820], size: 25, reveal, weights: hlWeights(lt, [[cComp, [0]], [cType, [1]], [cPre, [2, 3]], [cCopy, [4]], [cSaid, []]]), rowColors: new Map([[4, R]]), mono: [1], accent: G }), cFour - 0.3, 999, { top: 4.6 });
  const e = [{ cmd: "npx next build" }, { out: 'Error: Only async functions are allowed to be exported in a "use server" file.', color: R }];
  rightCard(items, lt, mdCard("md-said", { title: "The agent's last message", tagColor: O, lines: [{ t: "\"The feature is complete.\"", c: lt > cOne ? R : C.text }], w: 1000, size: 30 }), cSaid - 0.2, cReset, { top: 4.6, k: 0.0105, glow: lt > cOne ? R : O });
  rightCard(items, lt, terminal("t-close", { title: "the one command", entries: e, chars: termChars(e, lt, block(e, cCmd - 0.3, 0.4)), w: 1180, size: 22, t: lt }), cOne - 0.2, cReset, { top: 2.3, k: 0.0096, glow: G });
  const r = [
    "1. Delete `speakers/`, `eve/`, and your four `.md` files in `app/exercises/11/`.",
    "2. Run `npm run reset`.",
    "3. Run `npx next build` once, so that `.next/types` forgets `speakers/`.",
  ];
  rightCard(items, lt, mdCard("md-reset", { title: "Start again", tagColor: B, lines: r, w: 1180, size: 23, reveal: span(lt, cReset, cReset + 1.6) * 4 }), cReset - 0.1, 999, { top: 4.6, k: 0.0096 });
  render(ctx, cam, items);
  pill(ctx, 110, 820 - 60, "Compare with solution/  ·  localhost:3000/exercises/11/solution", { align: "left", size: 24, color: G, alpha: fade(lt, cReset + 1.0), mono: true });
  mode(ctx, lt, [[0.2, 999, "prove"]]);
}

export const scenes = { intro, setup, claim, predict, t1do, t1see, t2, t3, t4read, t4stop, t5tsc, t5build, t5suspense, t5copy, t6, t7, close };
