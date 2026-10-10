// Exercise 8, the solution walk-through. One scene per narration beat.
// Code on the cards is copied from app/exercises/8/solution/dashboard/ (elided with "…").
// Facts and numbers come from app/exercises/8/README.md and db.seed.json.
// Cues: every highlight and every change in the browser window is timed to a phrase of the narration
// text, as a fraction of the spoken time, so a change of the narration moves the animation with it.
import fs from "node:fs";
import {
  C, UI, MONO, W, H, camera, quad, pill, render, tex, rr,
  clamp, lerp, smooth, easeOut, easeInOut, span,
} from "../engine.mjs";
import { terminal, termLength } from "../widgets.mjs";
import {
  dashboard, pageTex, codeCard2, hlWeights, checkWidth, fileRow, cursor, childrenBox, bars,
  DW, DH, SEC, rowY, BASE_URL,
} from "./dash.mjs";

export const chip = "Next.js 16 · Exercise 8 solution";
export const steps = {
  intro: "The solution",
  layout: "Tasks 1–2",
  overview: "Tasks 3–4",
  table: "Task 5",
  vote: "Task 6",
  one: "Task 7",
  errors: "Task 8",
  title: "Task 9",
  json: "Task 10",
  provider: "Task 11",
  reload: "Task 11",
  close: "Wrap-up",
};

// ---------- cues ----------
const NARR = JSON.parse(fs.readFileSync(new URL("./narration.json", import.meta.url), "utf8"));
const TEXT = Object.fromEntries(NARR.beats.map((b) => [b.id, b.text]));
// The sentence times come from the voice service (timeline.json). Inside a sentence, a phrase sits at its share of the characters.
let TL = null;
try { TL = JSON.parse(fs.readFileSync(new URL("../out/exercise-8-solution/timeline.json", import.meta.url), "utf8")); } catch { /* the timeline is made by audio.mjs */ }
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
// piecewise linear value over time
function keys(lt, ks) {
  if (lt <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) if (lt <= ks[i][0]) return lerp(ks[i - 1][1], ks[i][1], span(lt, ks[i - 1][0], ks[i][0]));
  return ks.at(-1)[1];
}

// ---------- the code cards (lines copied from the solution files) ----------
const B = C.server, O = C.client, V = C.action;
const SPEC = {
  layout: {
    title: "layout.tsx", tag: "Server Component", tagColor: B, w: 1120, size: 24,
    lines: [
      '<aside className="panel h-fit space-y-4 p-3">',
      "  <Suspense>",
      '    <nav className="space-y-1">',
      "      <SidebarLink href={base} end>…</SidebarLink>",
      "      <SidebarLink href={`${base}/talks`}>Talks</SidebarLink>",
      "    </nav>",
      "  </Suspense>",
      '  <textarea placeholder="A note for the team" … />',
      "  <ThemeToggle />",
    ],
  },
  sidebarLink: {
    title: "sidebar-link.tsx", tag: '"use client"', tagColor: O, w: 1120, size: 24,
    lines: [
      '"use client";',
      'import { usePathname } from "next/navigation";',
      "…",
      "const pathname = usePathname();",
      "const active = end ? pathname === href : pathname.startsWith(href);",
      "return (",
      "  <Link",
      "    href={href}",
      '    aria-current={active ? "page" : undefined}',
      '    className={ … + (active ? "… font-bold …" : "text-muted …")}',
    ],
  },
  overview: {
    title: "dashboard/page.tsx", tag: "Server Component", tagColor: B, w: 1160, size: 24,
    lines: [
      "export default async function Overview() {",
      "  const [talks, speakers] = await Promise.all([getTalks(), getSpeakers()]);",
      "  …",
      '  <StatCard label="Talks" value={talks.length} />',
      '  <StatCard label="Votes" value={votes} />',
      '  <StatCard label="Speakers" value={speakers.length} />',
      '  <StatCard label="Top talk" value={top ? top.title : "none"} />',
      "  …",
      '  <Collapsible title="Speakers">',
      "    <SpeakerList />",
      "  </Collapsible>",
    ],
  },
  collapsible: {
    title: "collapsible.tsx", tag: '"use client"', tagColor: O, w: 1120, size: 24,
    lines: [
      '"use client";',
      "export function Collapsible({ title, children }: …) {",
      "  const [open, setOpen] = useState(false);",
      "  …",
      "  onClick={() => setOpen(!open)}",
      "  …",
      "  {open && (",
      '    <div className="fade-in …">',
      "      {children}",
      "    </div>",
      "  )}",
    ],
  },
  speakerList: {
    title: "speaker-list.tsx", tag: "Server Component", tagColor: B, w: 1120, size: 24,
    lines: [
      "export async function SpeakerList() {",
      "  const speakers = await getSpeakers();",
      "  return (",
      '    <ul className="space-y-2">',
      "      {speakers.map((s) => (",
      "        <li key={s.id}>",
      '          <span className="font-medium text-ink">{s.name}</span>: {s.bio}',
      "        </li>",
    ],
  },
  talksPage: {
    title: "talks/page.tsx", tag: "Server Component", tagColor: B, w: 1120, size: 26,
    lines: [
      'import { getTalks } from "@/lib/talks";',
      'import { TalkTable } from "./talk-table";',
      "…",
      "export default async function TalksPage() {",
      "  const talks = await getTalks();",
      "  return <TalkTable talks={talks} />;",
      "}",
    ],
  },
  talkTable: {
    title: "talk-table.tsx", tag: '"use client"', tagColor: O, w: 1160, size: 24,
    lines: [
      '"use client";',
      "export function TalkTable({ talks }: { talks: Talk[] }) {",
      '  const [category, setCategory] = useState("all");',
      "  const categories = Array.from(new Set(talks.map((t) => t.category)));",
      '  const shown = category === "all" ? talks : talks.filter(…);',
      "  <select value={category} onChange={(e) => setCategory(e.target.value)}>",
      "  <Badge>{t.category}</Badge>",
      "  <VoteButton id={t.id} />",
    ],
  },
  actions: {
    title: "talks/actions.ts", tag: '"use server"', tagColor: V, w: 1160, size: 24,
    lines: [
      '"use server";',
      'import { updateTag } from "next/cache";',
      "…",
      "export async function vote(_prev: VoteState, formData: FormData): … {",
      '  const id = Number(formData.get("id"));',
      "  if (!Number.isInteger(id) || id < 1) return { message: … };",
      "  const talk = await addVote(id);",
      '  updateTag("talks");',
      "  updateTag(`talk-${id}`);",
      "  return { message: `Thanks. ${talk.votes} votes now.` };",
      "}",
    ],
  },
  voteButton: {
    title: "vote-button.tsx", tag: '"use client"', tagColor: O, w: 1160, size: 24,
    lines: [
      '"use client";',
      'import { vote } from "./actions";',
      "…",
      'const [state, formAction, pending] = useActionState(vote, { message: "" });',
      '<form action={formAction} className="…">',
      '  <input type="hidden" name="id" value={id} />',
      "  {state.message && <span …>{state.message}</span>}",
      '  <button className="btn-primary" disabled={pending}>',
      '    {pending ? "Voting…" : "Vote"}',
      "  </button>",
    ],
  },
  talkPage: {
    title: "talks/[id]/page.tsx", tag: "Server Component", tagColor: B, w: 1160, size: 23,
    lines: [
      "type Props = { params: Promise<{ id: string }> };",
      "export default async function TalkPage({ params }: Props) {",
      "  const { id } = await params;",
      "  …",
      "  const talk = await getTalk(talkId).catch(() => null);",
      "  const [speaker, comments] = await Promise.all([getSpeaker(…), getComments(…)]);",
    ],
  },
  loading: {
    title: "talks/[id]/loading.tsx", tag: "Server Component", tagColor: B, w: 1160, size: 24,
    lines: [
      "export default function Loading() {",
      "  return (",
      '    <div aria-busy="true" aria-label="Loading talk" className="space-y-5">',
      '      <div className="shimmer h-4 w-20 rounded" />',
      '      <div className="panel p-6">',
      '        <div className="shimmer h-5 w-20 rounded-full" />',
      '        <div className="shimmer mt-4 h-8 w-3/4 rounded-lg" />',
    ],
  },
  crash: {
    title: "talks/[id]/page.tsx", tag: "Server Component", tagColor: B, w: 1160, size: 24,
    lines: [
      'if (id === "boom") throw new Error("Boom: a render error on the server");',
      "const talkId = Number(id);",
      "if (!Number.isInteger(talkId)) notFound();",
      "const talk = await getTalk(talkId).catch(() => null);",
      "if (!talk) notFound();",
    ],
  },
  error: {
    title: "talks/[id]/error.tsx", tag: '"use client"', tagColor: O, w: 1160, size: 24,
    lines: [
      '"use client";',
      "export default function TalkError({ error, retry }: …) {",
      "  …",
      '  <h2 className="mt-1 text-xl font-bold">Something broke</h2>',
      '  <pre className="…">',
      "    {error.message}",
      "  </pre>",
      '  <button className="btn-primary mt-4" onClick={() => retry()}>',
    ],
  },
  notFound: {
    title: "talks/[id]/not-found.tsx", tag: "Server Component", tagColor: B, w: 1160, size: 24,
    lines: [
      "export default function TalkNotFound() {",
      "  …",
      '  <h2 className="mt-1 text-xl font-bold">No such talk</h2>',
      '  <p className="…">The dashboard has no talk with this id.</p>',
      "  <Link",
      '    href="/exercises/8/solution/dashboard/talks"',
      "    …",
      "    Back to the talks",
    ],
  },
  metaLayout: {
    title: "layout.tsx", tag: "Server Component", tagColor: B, w: 1180, size: 24,
    lines: ['import type { Metadata } from "next";', 'export const metadata: Metadata = { title: "Dashboard" };'],
  },
  metaTalks: {
    title: "talks/page.tsx", tag: "Server Component", tagColor: B, w: 1180, size: 24,
    lines: ['export const metadata: Metadata = { title: "Talks" };'],
  },
  metaTalk: {
    title: "talks/[id]/page.tsx", tag: "Server Component", tagColor: B, w: 1180, size: 24,
    lines: [
      "export async function generateMetadata({ params }: Props): Promise<Metadata> {",
      "  const { id } = await params;",
      "  const talk = await getTalk(Number(id)).catch(() => null);",
      '  return { title: talk ? talk.title : "No such talk" };',
      "}",
    ],
  },
  route: {
    title: "api/talks/route.ts", tag: "Route Handler", tagColor: B, w: 1160, size: 24,
    lines: [
      "export async function GET(request: NextRequest) {",
      '  const category = request.nextUrl.searchParams.get("category");',
      "  if (category !== null && !(CATEGORIES as …).includes(category)) {",
      "    return Response.json({ error: `Unknown …` }, { status: 400 });",
      "  }",
      "  const talks = await getTalks();",
      "  return Response.json(category ? talks.filter(…) : talks);",
      "}",
    ],
  },
  provider: {
    title: "theme-provider.tsx", tag: '"use client"', tagColor: O, w: 1160, size: 24,
    lines: [
      '"use client";',
      "export function ThemeProvider({ children }: { children: React.ReactNode }) {",
      '  const [theme, setTheme] = useState<Theme>("dark");',
      "  …",
      "  <ThemeContext value={{ theme, toggle }}>",
      '    <div data-theme={theme} className="…">',
      "      {children}",
      "    </div>",
      "  </ThemeContext>",
    ],
  },
  toggle: {
    title: "theme-toggle.tsx", tag: '"use client"', tagColor: O, w: 1160, size: 24,
    lines: [
      '"use client";',
      'import { useTheme } from "./theme-provider";',
      "…",
      "const { theme, toggle } = useTheme();",
      '<button onClick={toggle} className="w-full">',
      '  {theme === "dark" ? "Light mode" : "Dark mode"}',
      "</button>",
    ],
  },
  effect: {
    title: "theme-provider.tsx", tag: '"use client"', tagColor: O, w: 1160, size: 24,
    lines: [
      'const [theme, setTheme] = useState<Theme>("dark");',
      "useEffect(() => {",
      '  const saved = localStorage.getItem("exercise-8-theme");',
      "  // eslint-disable-next-line react-hooks/set-state-in-effect",
      '  if (saved === "light" || saved === "dark") setTheme(saved);',
      "}, []);",
      "const toggle = () => {",
      '  const next = theme === "dark" ? "light" : "dark";',
      "  setTheme(next);",
      '  localStorage.setItem("exercise-8-theme", next);',
      "};",
    ],
  },
};
for (const [k, v] of Object.entries(SPEC)) checkWidth(k, v.lines, v.size, v.w);

// ---------- layout of the scenes ----------
const CAM_Y = 1.2;
const cam16 = (lt, len) => camera([lerp(-0.4, 0.4, clamp(lt / len)), CAM_Y, -16], [0, CAM_Y, 0], 50);
const K = 0.0111; // world units per code-card pixel
const CODE_X = -12.55, CODE_TOP = 5.6;
const DASH = { pos: [6.7, 1.3, 0], w: 11.4, h: (11.4 * DH) / DW, rot: [0, -0.13, 0] };
const LABEL_X = 1442, LABEL_Y = 232;

function dashItem(items, img, { a = 1, glow = B, glowA = 0.2 } = {}) {
  items.push(quad({ pos: DASH.pos, w: DASH.w, h: DASH.h, rot: DASH.rot, img, alpha: a, glow, glowA, grid: 8 }));
}
const dashPt = (cam, px, py) => quad({ pos: DASH.pos, w: DASH.w, h: DASH.h, rot: DASH.rot }).screenAt(cam, px / DW, py / DH);
function pointer(ctx, cam, lt, px, py, arrive, press) {
  if (lt < arrive - 1.0 || lt > press + 0.3) return;
  const p = dashPt(cam, px, py);
  if (!p) return;
  const e = 1 - easeOut(span(lt, arrive - 1.0, arrive));
  cursor(ctx, p.x + e * 150, p.y + e * 90, span(lt, press, press + 0.3));
}

// A stack of code cards. Each seg: { spec, from, to, hl: [[t, [lines]]...], top?, k? }. Cards fade, they do not overlap in time.
function codeStack(items, lt, segs) {
  segs.forEach((sg, i) => {
    const a = smooth(span(lt, sg.from, sg.from + 0.35)) * (1 - smooth(span(lt, sg.to - 0.3, sg.to)));
    if (a <= 0.003) return;
    const sp = SPEC[sg.spec];
    const img = codeCard2(`cc-${sg.spec}-${i}`, {
      ...sp, weights: hlWeights(lt, sg.hl ?? []), reveal: span(lt, sg.from, sg.from + 0.8) * (sp.lines.length + 1),
    });
    const k = sg.k ?? K;
    const ww = img.width * k, hh = img.height * k;
    const top = sg.top ?? CODE_TOP;
    items.push(quad({ pos: [CODE_X + ww / 2, top - hh / 2 + (1 - easeOut(span(lt, sg.from, sg.from + 0.5))) * -0.5, 0], w: ww, h: hh, rot: [0, 0.12, 0], img, alpha: a, grid: 5 }));
  });
}

// a pill above the browser window; items: [from, to, text, color, mono]
function labels(ctx, lt, list, x = LABEL_X, y = LABEL_Y) {
  for (const [from, to, text, color, mono] of list) {
    const a = smooth(span(lt, from, from + 0.3)) * (1 - smooth(span(lt, to - 0.25, to)));
    if (a > 0.01) pill(ctx, x, y, text, { size: 26, color, alpha: a, mono: !!mono });
  }
}

// ---------- the solution tree ----------
const TREE = [
  ["layout.tsx"], ["page.tsx"], ["sidebar-link.tsx", "client"], ["speaker-list.tsx"],
  ["theme-provider.tsx", "client"], ["theme-toggle.tsx", "client"], ["api/talks/route.ts"],
  ["talks/page.tsx"], ["talks/talk-table.tsx", "client"], ["talks/actions.ts", "action"], ["talks/vote-button.tsx", "client"],
  ["talks/[id]/page.tsx"], ["talks/[id]/loading.tsx"], ["talks/[id]/error.tsx", "client"], ["talks/[id]/not-found.tsx"],
];
function treeItems(items, { appear, glow, dim }) {
  const cols = [[3.5, TREE.slice(0, 7)], [9.75, TREE.slice(7)]];
  let n = 0;
  cols.forEach(([cx, rows]) => rows.forEach(([name, kind], r) => {
    const i = n++;
    const a = appear(i);
    if (a <= 0.003) return;
    const img = fileRow(`tr${i}`, { name, kind, glow: glow(i, kind) ? 1 : 0, dim: dim(i, kind) });
    const pos = [cx + (1 - easeOut(a)) * 2, 4.9 - r * 0.92, 0];
    items.push(quad({ pos, w: 6.1, h: 0.61, rot: [0, -0.07, 0], img, alpha: a, grid: 3, glow: glow(i, kind) ? (kind === "client" ? O : kind === "action" ? V : B) : null, glowA: 0.25 }));
  }));
}

// ---------- scenes ----------
function intro(ctx, s) {
  const { lt, len } = s;
  const A = cuer("intro", s);
  const cBlue = A("Blue files"), cOr = A("Orange files"), cPu = A("The purple file"), cUrl = A("It runs at");
  const cam = cam16(lt, len);
  const items = [];
  const focus = lt < cBlue ? null : lt < cOr ? "server" : lt < cPu ? "client" : "action";
  const kindOf = (k) => (k === "client" ? "client" : k === "action" ? "action" : "server");
  treeItems(items, {
    appear: (i) => easeOut(span(lt, 0.3 + i * 0.1, 0.9 + i * 0.1)),
    glow: (i, k) => focus != null && kindOf(k) === focus,
    dim: (i, k) => (focus != null && kindOf(k) !== focus ? 0.6 : 0),
  });
  render(ctx, cam, items);
  // title block
  const a = smooth(span(lt, 0.2, 1.0));
  const slide = (d) => (1 - easeOut(span(lt, 0.2 + d, 1.0 + d))) * -60;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.textBaseline = "alphabetic";
  pill(ctx, 110 + slide(0), 230, "EXERCISE 8 · THE SOLUTION", { align: "left", color: C.server, size: 24 });
  ctx.font = `800 84px ${UI}`; ctx.fillStyle = C.text;
  ctx.fillText("The solution,", 104 + slide(0.1), 350);
  ctx.fillText("file by file", 104 + slide(0.2), 445);
  ctx.restore();
  const ua = smooth(span(lt, cUrl - 0.2, cUrl + 0.4));
  pill(ctx, 110, 530, "localhost:3000/exercises/8/solution", { align: "left", size: 26, color: C.green, alpha: ua, mono: true });
  pill(ctx, 110, 620, "no directive = Server Component", { align: "left", size: 25, color: B, alpha: smooth(span(lt, cBlue, cBlue + 0.4)) });
  pill(ctx, 110, 690, '"use client"', { align: "left", size: 25, color: O, alpha: smooth(span(lt, cOr, cOr + 0.4)), mono: true });
  pill(ctx, 110, 760, '"use server"', { align: "left", size: 25, color: V, alpha: smooth(span(lt, cPu, cPu + 0.4)), mono: true });
}

function layoutScene(ctx, s) {
  const { lt, len } = s;
  const A = cuer("layout", s);
  const cNote = A("The layout stays mounted"), cClick = A("so the note keeps"), cLink = A("The sidebar link is a client"),
    cPath = A("because use Pathname"), cEnd = A("The end prop"), cSusp = A("Suspense wraps");
  const cam = cam16(lt, len);
  const items = [];
  codeStack(items, lt, [
    { spec: "layout", from: 0.3, to: cLink, hl: [[0.8, [0]], [cNote + 0.4, [7]], [cClick + 0.6, [3, 4]]] },
    { spec: "sidebarLink", from: cLink, to: cSusp, hl: [[cLink + 0.2, [0]], [cPath, [3]], [cEnd, [4]]] },
    { spec: "layout", from: cSusp, to: 99, hl: [[cSusp, [1, 6]]] },
  ]);
  const typed = Math.floor(span(lt, cNote + 0.5, cClick) * 29);
  const note = "Bring snacks for the speakers".slice(0, typed);
  const clicked = lt > cClick + 0.9;
  const dash = dashboard("d-layout", {
    page: clicked ? "talks" : "overview", active: clicked ? "talks" : "overview",
    url: clicked ? `${BASE_URL}/talks` : BASE_URL, tab: clicked ? "Talks" : "Dashboard",
    note, noteHot: lt > cClick + 1.0 && lt < cLink, linksHot: smooth(span(lt, cSusp, cSusp + 0.4)),
    statsIn: 1, speakersOpen: 0, rowIn: 1,
  });
  dashItem(items, dash, { glow: lt < cLink ? B : O });
  render(ctx, cam, items);
  pointer(ctx, cam, lt, 154, 274, cClick + 0.5, cClick + 0.8);
  labels(ctx, lt, [
    [0.5, cLink, "layout.tsx · stays mounted", B],
    [cLink, cEnd, '"use client" · usePathname', O],
    [cEnd, cSusp, "end: Overview is not bold on /talks", O],
    [cSusp, 99, "Suspense around the links", C.yellow],
  ]);
}

function overviewScene(ctx, s) {
  const { lt, len } = s;
  const A = cuer("overview", s);
  const cAsync = A("The Overview is"), cAll = A("Promise dot all"), cAfter = A("Collapsible is a client") - 0.5,
    cColl = A("Collapsible is a client"), cSpk = A("Speaker list has no"), cChild = A("it arrives as children");
  const cam = cam16(lt, len);
  const items = [];
  codeStack(items, lt, [
    { spec: "overview", from: 0.3, to: cColl, hl: [[cAsync, [0]], [cAll, [1]], [cAll + 3.0, [3, 4, 5, 6]]] },
    { spec: "collapsible", from: cColl, to: cSpk, hl: [[cColl, [0]], [cColl + 0.9, [2]], [cSpk - 0.9, [8]]] },
    { spec: "speakerList", from: cSpk, to: 99, hl: [[cSpk, [0]], [cChild - 0.7, [1]], [cChild, [6]]] },
  ]);
  const showBars = span(lt, cAll - 0.2, cAll + 0.2) * (1 - span(lt, cAfter - 0.3, cAfter));
  const speakersOpen = easeOut(span(lt, cColl + 1.3, cColl + 1.9));
  const dash = dashboard("d-overview", {
    page: "overview", active: "overview", statsIn: span(lt, cAsync, cAsync + 1.4),
    speakersOpen, speakersHot: lt > cColl && lt < cColl + 1.3 ? 1 : 0, speakerHot: lt > cChild - 0.2 ? 0 : null, linkHot: false,
  });
  dashItem(items, dash, { a: 1 - showBars, glow: lt < cColl ? B : O });
  if (showBars > 0.01) {
    const b = bars("bars", span(lt, cAll + 0.3, cAll + 3.2));
    const bw = 11.4;
    items.push(quad({ pos: [6.7, 1.3, 0], w: bw, h: (bw * b.height) / b.width, rot: DASH.rot, img: b, alpha: showBars, grid: 4, glow: B, glowA: 0.2 }));
  }
  render(ctx, cam, items);
  pointer(ctx, cam, lt, 780, 381, cColl + 1.2, cColl + 1.3);
  labels(ctx, lt, [
    [0.5, cAll - 0.1, "page.tsx · Server Component", B],
    [cAll - 0.1, cAfter, "together 0.8 s · one after the other 1.6 s", C.green],
    [cAfter, cSpk, 'Collapsible · "use client"', O],
    [cSpk, 99, "SpeakerList · no directive, passed as children", B],
  ]);
}

function tableScene(ctx, s) {
  const { lt, len } = s;
  const A = cuer("table", s);
  const cRead = A("The talks page reads"), cTbl = A("The talk table"), cState = A("so it holds the filter"),
    cProp = A("The talks prop"), cChoose = A("Choose performance");
  const cam = cam16(lt, len);
  const items = [];
  codeStack(items, lt, [
    { spec: "talksPage", from: 0.3, to: cTbl, hl: [[cRead, [3, 4]], [cRead + 1.4, [5]]] },
    { spec: "talkTable", from: cTbl, to: 99, hl: [[cTbl, [0]], [cState - 0.2, [2]], [cProp, [1]], [cChoose, [5]], [cChoose + 0.8, [4]]] },
  ]);
  const filtered = lt > cChoose + 0.8;
  const dash = dashboard("d-table", {
    page: "talks", active: "talks", url: `${BASE_URL}/talks`, tab: "Talks", note: "Bring snacks for the speakers",
    rowIn: span(lt, cRead, cRead + 1.8), filter: filtered ? "performance" : "all", filterHot: lt > cChoose - 0.1 && lt < cChoose + 0.8,
  });
  dashItem(items, dash, { glow: lt < cTbl ? B : O });
  render(ctx, cam, items);
  labels(ctx, lt, [
    [0.5, cTbl, "talks/page.tsx · reads on the server", B],
    [cTbl, cProp, 'talk-table.tsx · "use client" · useState', O],
    [cProp, cChoose, "talks: plain data crosses as JSON", C.green],
    [cChoose, 99, filtered ? "performance: two talks stay" : "the filter is browser state", O],
  ]);
}

function voteScene(ctx, s) {
  const { lt, len } = s;
  const A = cuer("vote", s);
  const cSrv = A("The vote action says"), cId = A("It checks the I D"), cAdd = A("adds the vote"), cTag = A("Two update Tag"),
    cBtn = A("The button says Voting"), cThen = A("Then it says");
  const cam = cam16(lt, len);
  const items = [];
  codeStack(items, lt, [
    { spec: "actions", from: 0.3, to: cBtn, hl: [[cSrv, [0]], [cId, [4, 5]], [cAdd, [6]], [cTag, [7, 8]], [cTag + 2.0, [9]]] },
    { spec: "voteButton", from: cBtn, to: 99, hl: [[cBtn, [8]], [cThen, [6]]] },
  ]);
  const press = cBtn + 0.3;
  const pending = lt > press && lt < cThen + 0.3;
  const done = lt >= cThen + 0.3;
  const dash = dashboard("d-vote", {
    page: "talks", active: "talks", url: `${BASE_URL}/talks`, tab: "Talks", note: "Bring snacks for the speakers", rowIn: 1,
    pending, press: lt > press - 0.1 && lt < press + 0.3 ? 1 - span(lt, press - 0.1, press + 0.3) : 0,
    votes1: done ? 13 : 12, votesHot: done, message: done ? "Thanks. 13 votes now." : null,
  });
  dashItem(items, dash, { glow: lt < cBtn ? V : O });
  render(ctx, cam, items);
  pointer(ctx, cam, lt, 1147, 306, press - 0.1, press);
  labels(ctx, lt, [
    [0.5, cTag, "the browser gets only an ID", V],
    [cTag, cBtn, "updateTag: the cached reads are old", C.yellow, false],
    [cBtn, cThen + 0.3, "Voting… 2 to 3 s", O],
    [cThen + 0.3, 99, "Thanks. 13 votes now.", C.green],
  ]);
}

function oneScene(ctx, s) {
  const { lt, len } = s;
  const A = cuer("one", s);
  const cAw = A("The page awaits"), cWo = A("Without one"), cLd = A("Loading dot T S X"), cArr = A("The talk arrives");
  const cam = cam16(lt, len);
  const items = [];
  codeStack(items, lt, [
    { spec: "talkPage", from: 0.3, to: cLd, hl: [[cAw, [0, 2]], [cWo, [2]]] },
    { spec: "loading", from: cLd, to: 99, hl: [[cLd, [0]], [cLd + 1.0, [2]], [cArr, [4, 5, 6]]] },
  ]);
  const arrived = lt > cArr + 1.7;
  const dash = dashboard("d-one", {
    page: lt < cLd ? "blank" : arrived ? "talk" : "loading", active: "talks",
    url: `${BASE_URL}/talks/1`, tab: arrived ? "Two graphs, one boundary" : "Dashboard", note: "Bring snacks for the speakers",
    devBadge: lt < cLd ? "Blocking Route" : null, t: lt,
  });
  dashItem(items, dash, { glow: lt < cLd ? C.yellow : B });
  render(ctx, cam, items);
  const timer = clamp((lt - cArr) / 1.7);
  labels(ctx, lt, [
    [0.5, cLd, 'no boundary: "Blocking Route"', C.yellow],
    [cLd, cArr, "loading.tsx · a placeholder at once", B],
  ]);
  if (lt > cArr) pill(ctx, LABEL_X, LABEL_Y, `${(timer * 1.7).toFixed(1)} s${arrived ? " · the talk is here" : ""}`, { size: 26, color: arrived ? C.green : C.muted, alpha: smooth(span(lt, cArr, cArr + 0.3)) });
}

function errorsScene(ctx, s) {
  const { lt, len } = s;
  const A = cuer("errors", s);
  const cDiff = A("A crash and a missing"), cMiss = A("and a missing talk"), cBoom = A("Boom shows"), cRetry = A("with a retry button"),
    c99 = A("Ninety nine"), cSide = A("The sidebar stays"), cStat = A("The status is still");
  const cam = cam16(lt, len);
  const items = [];
  codeStack(items, lt, [
    { spec: "crash", from: 0.3, to: cBoom, hl: [[cDiff, [0]], [cMiss, [1, 2, 3, 4]]] },
    { spec: "error", from: cBoom, to: c99, hl: [[cBoom, [0]], [cBoom + 0.7, [5]], [cRetry, [7]]] },
    { spec: "notFound", from: c99, to: 99, hl: [[c99, [2]], [c99 + 0.9, [3]], [cSide, [5]]] },
  ]);
  const page = lt < cBoom ? "talk" : lt < c99 ? "error" : "notfound";
  const dash = dashboard("d-err", {
    page, active: "talks", note: "Bring snacks for the speakers",
    url: `${BASE_URL}/talks/${page === "talk" ? 1 : page === "error" ? "boom" : 99}`,
    tab: page === "talk" ? "Two graphs, one boundary" : page === "error" ? "Dashboard" : "No such talk",
    asideGlow: smooth(span(lt, cSide, cSide + 0.4)) * (0.6 + 0.4 * Math.sin(lt * 6)),
  });
  dashItem(items, dash, { glow: page === "error" ? C.red : page === "notfound" ? C.yellow : B });
  render(ctx, cam, items);
  labels(ctx, lt, [
    [0.5, cBoom, "a crash is not a missing talk", C.muted],
    [cBoom, c99, '/talks/boom · error.tsx · "use client"', C.red, true],
    [c99, cSide, "/talks/99 · not-found.tsx", C.yellow, true],
    [cSide, cStat, "the sidebar stays in both", C.green],
    [cStat, 99, "curl -i … → still 200", C.green, true],
  ]);
  pill(ctx, LABEL_X, 815, "loading.tsx already sent the page", { size: 24, color: C.muted, alpha: smooth(span(lt, cStat + 0.4, cStat + 0.8)) });
}

function titleScene(ctx, s) {
  const { lt, len } = s;
  const A = cuer("title", s);
  const cLay = A("The layout exports"), cTalks = A("The talks page exports"), cGen = A("The talk page uses"), cData = A("because its title");
  const cam = cam16(lt, len);
  const items = [];
  const k = 0.0105;
  // three small cards, one under the other
  codeStack(items, lt, [
    { spec: "metaLayout", from: cLay - 0.3, to: 99, hl: [[cLay, [1]]], top: CODE_TOP + 0.2, k },
    { spec: "metaTalks", from: cTalks - 0.3, to: 99, hl: [[cTalks, [0]]], top: 3.3, k },
    { spec: "metaTalk", from: cGen - 0.3, to: 99, hl: [[cGen, [0]], [cData, [3]]], top: 1.2, k },
  ]);
  const phase = lt < cTalks ? 0 : lt < cGen ? 1 : 2;
  const dash = dashboard("d-title", {
    page: phase === 0 ? "overview" : phase === 1 ? "talks" : "talk", active: phase === 0 ? "overview" : "talks",
    url: phase === 0 ? BASE_URL : phase === 1 ? `${BASE_URL}/talks` : `${BASE_URL}/talks/1`,
    tab: ["Dashboard", "Talks", "Two graphs, one boundary"][phase], note: "Bring snacks for the speakers",
    statsIn: 1, rowIn: 1, speakersOpen: 0,
  });
  dashItem(items, dash, { glow: B });
  render(ctx, cam, items);
  labels(ctx, lt, [
    [0.4, cTalks, 'tab: "Dashboard"', B],
    [cTalks, cGen, 'tab: "Talks"', B],
    [cGen, cData, 'tab: "Two graphs, one boundary"', B],
    [cData, 99, "the title depends on the data", C.green],
  ]);
}

function jsonScene(ctx, s) {
  const { lt, len } = s;
  const A = cuer("json", s);
  const cProg = A("A Route Handler"), cCat = A("It reads the category"), cUnk = A("An unknown category"), cElse = A("Anything else");
  const cam = cam16(lt, len);
  const items = [];
  codeStack(items, lt, [{ spec: "route", from: 0.3, to: 99, hl: [[cProg, [0]], [cCat, [1]], [cUnk, [2, 3]], [cElse, [5, 6]]] }]);
  const entries = [
    { cmd: 'curl -i "…/api/talks?category=xyz"' },
    { out: '400  {"error":"Unknown category: xyz"}', color: C.red },
    { cmd: "curl -i …/api/talks" },
    { out: '200  [{"id":1,"title":"Two graphs, one boundary",…}]', color: C.green },
    { cmd: 'curl -i "…/api/talks?category=ai"' },
    { out: '200  [{"id":6,"title":"Agents that know Next 16",…}]', color: C.green },
  ];
  const L = entries.map((e) => (e.cmd != null ? e.cmd.length + 2 : 12));
  const cum = L.reduce((a, v) => (a.push((a.at(-1) ?? 0) + v), a), []);
  const chars = keys(lt, [
    [cUnk - 0.7, 0], [cUnk + 0.9, cum[0]], [cUnk + 1.3, cum[1]],
    [cElse - 1.0, cum[1]], [cElse - 0.1, cum[2]], [cElse + 0.3, cum[3]], [cElse + 0.9, cum[3]], [cElse + 1.6, cum[4]], [cElse + 1.9, cum[5]],
  ]);
  const term = terminal("t-json", { title: "route.ts · export async function GET", entries, chars, w: 1100, size: 27, t: lt });
  const tw = 1100 * K, th = (term.height / term.width) * tw;
  const tin = easeOut(span(lt, 0.5, 1.3));
  items.push(quad({ pos: [6.7, 3.0 - (1 - tin) * 1.0, 0], w: tw, h: th, rot: [0, -0.1, 0], img: term, alpha: tin, grid: 5, glow: C.green, glowA: 0.16 }));
  render(ctx, cam, items);
  labels(ctx, lt, [
    [0.5, cCat, "route.ts answers a program, not a person", C.green],
    [cCat, cUnk, "?category=… from the URL", B, true],
  ]);
  const a400 = smooth(span(lt, cUnk + 1.2, cUnk + 1.5)), a200 = smooth(span(lt, cElse + 0.3, cElse + 0.6));
  pill(ctx, 1160, 700, "400 · error body", { size: 30, color: C.red, alpha: a400 });
  pill(ctx, 1560, 700, "200 · JSON", { size: 30, color: C.green, alpha: a200 });
}

function providerScene(ctx, s) {
  const { lt, len } = s;
  const A = cuer("provider", s);
  const cProv = A("The theme provider is"), cChild = A("It renders children"), cNot = A("but it does not import"), cSrv = A("so the pages stay"),
    cTog = A("The toggle is"), cClick = A("A click turns");
  const cam = cam16(lt, len);
  const items = [];
  codeStack(items, lt, [
    { spec: "provider", from: 0.3, to: cTog, hl: [[cProv, [0]], [cChild, [6]], [cNot - 0.1, [1]], [cSrv, [6]]] },
    { spec: "toggle", from: cTog, to: 99, hl: [[cTog, [0]], [cTog + 1.0, [3]], [cClick, [4, 5]]] },
  ]);
  // the right side: first the client box with the server pages inside it, then the dashboard
  const boxA = easeOut(span(lt, cChild - 0.6, cChild)) * (1 - smooth(span(lt, cTog - 0.4, cTog)));
  if (boxA > 0.01) {
    const dg = childrenBox("c-children", span(lt, cChild, cSrv + 0.8));
    const bw = 11.4;
    items.push(quad({ pos: [6.7, 1.9, 0], w: bw, h: (bw * dg.height) / dg.width, rot: DASH.rot, img: dg, alpha: boxA, grid: 4, glow: O, glowA: 0.15 }));
  }
  const dA = 1 - boxA;
  const light = smooth(span(lt, cClick + 0.5, cClick + 1.1));
  const dash = dashboard("d-prov", {
    page: "overview", active: "overview", statsIn: 1, speakersOpen: 1, note: "Bring snacks for the speakers",
    light, toggleHot: lt > cTog + 0.6 && lt < cClick + 0.5,
  });
  dashItem(items, dash, { a: dA, glow: O });
  render(ctx, cam, items);
  pointer(ctx, cam, lt, 154, 516, cClick + 0.2, cClick + 0.5);
  labels(ctx, lt, [
    [0.5, cChild, 'ThemeProvider · "use client"', O],
    [cChild, cTog, "children = server pages, already rendered", B],
    [cTog, cClick, 'ThemeToggle · "use client"', O],
    [cClick, 99, 'data-theme="light"', C.yellow, true],
  ]);
}

function reloadScene(ctx, s) {
  const { lt, len } = s;
  const A = cuer("reload", s);
  const cRel = A("Now reload"), cRead = A("The server cannot read"), cFirst = A("so the first render is dark"), cEff = A("After mount, the effect"),
    cLight = A("and the page turns light"), cSave = A("The click handler saves");
  const cam = cam16(lt, len);
  const items = [];
  codeStack(items, lt, [{ spec: "effect", from: 0.3, to: 99, hl: [[cRel, [2]], [cFirst, [0]], [cEff, [1, 2, 3, 4]], [cLight, [4]], [cSave, [6, 7, 8, 9]]] }]);
  // the page is saved as light. A reload paints dark first, then the effect makes it light.
  const dropT = cRel + 0.5;
  const flip = cLight - 1.0;
  const light = lt < dropT ? 1 : lt < flip ? 0 : smooth(span(lt, flip, flip + 0.2));
  const dash = dashboard("d-reload", { page: "overview", active: "overview", statsIn: 1, speakersOpen: 1, note: "Bring snacks for the speakers", light });
  dashItem(items, dash, { glow: light > 0.5 ? C.yellow : B });
  render(ctx, cam, items);
  labels(ctx, lt, [
    [0.4, dropT, "saved choice: light", C.yellow],
    [dropT, flip, "first paint: dark (the server HTML)", C.red],
    [flip, cSave, "after mount: the effect loads light", C.green],
    [cSave, 99, "click handler: localStorage.setItem", O, true],
  ]);
  const ra = smooth(span(lt, cRel - 0.1, cRel + 0.2)) * (1 - smooth(span(lt, dropT + 0.2, dropT + 0.6)));
  pill(ctx, 1770, LABEL_Y, "⟳ reload", { size: 24, color: C.text, alpha: ra });
}

function closeScene(ctx, s) {
  const { lt, len } = s;
  const A = cuer("close", s);
  const names = ["sidebar link", "talk table", "vote button", "error,", "theme provider", "theme toggle"];
  const cs = names.map((n) => A(n));
  const cBadge = A("Badge is in"), cStat = A("Stat card is not"), cReset = A("To start again");
  const lit = cs.filter((c) => lt >= c - 0.1).length;
  const clientRows = TREE.map((t, i) => [t, i]).filter(([t]) => t[1] === "client").map(([, i]) => i);
  // the order of the narration is the order of the files in the tree
  const order = [2, 8, 10, 13, 4, 5];
  const litSet = new Set(order.slice(0, lit));
  const cam = cam16(lt, len);
  const items = [];
  treeItems(items, {
    appear: (i) => easeOut(span(lt, 0.0 + i * 0.03, 0.5 + i * 0.03)),
    glow: (i) => litSet.has(i),
    dim: (i) => (litSet.has(i) ? 0 : lit > 0 ? 0.55 : 0),
  });
  render(ctx, cam, items);
  // the count
  ctx.save();
  ctx.textBaseline = "alphabetic";
  ctx.font = `800 170px ${UI}`; ctx.fillStyle = lit === 6 ? C.client : C.text;
  ctx.fillText(String(lit), 110, 330);
  ctx.font = `600 36px ${UI}`; ctx.fillStyle = C.text;
  ctx.fillText('"use client" files', 250, 285);
  ctx.fillStyle = C.muted; ctx.font = `400 28px ${UI}`;
  ctx.fillText("in the client graph", 250, 325);
  ctx.restore();
  pill(ctx, 110, 420, "Badge · imported by talk-table → in the graph", { align: "left", size: 25, color: C.green, alpha: smooth(span(lt, cBadge, cBadge + 0.4)) });
  pill(ctx, 110, 490, "StatCard · only page.tsx imports it → not in", { align: "left", size: 25, color: C.muted, alpha: smooth(span(lt, cStat, cStat + 0.4)) });
  // the reset command
  const entries = [{ cmd: "npm run reset" }, { out: "db.json restored from db.seed.json", color: C.green }];
  const typed = span(lt, cReset + 0.1, cReset + 0.9) * termLength(entries);
  const term = terminal("t-reset2", { entries, chars: typed, w: 760, size: 26, t: lt });
  const ta = smooth(span(lt, cReset - 0.1, cReset + 0.3));
  ctx.save(); ctx.globalAlpha = ta; ctx.drawImage(term, 110, 570 + (1 - ta) * 20); ctx.restore();
}

export const scenes = {
  intro, layout: layoutScene, overview: overviewScene, table: tableScene, vote: voteScene, one: oneScene,
  errors: errorsScene, title: titleScene, json: jsonScene, provider: providerScene, reload: reloadScene, close: closeScene,
};
