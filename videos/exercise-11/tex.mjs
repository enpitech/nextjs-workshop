// Textures for the Exercise 11 video: the demo app in a browser window (the speakers page of the
// draft and of the solution, /talks/1, a blank 500), the planted transcript, Markdown cards,
// the build pipeline, and small tables. Texts and numbers come from app/exercises/11/,
// db.seed.json and docs/errors/exercise-11-*.txt.
import { C, UI, MONO, rr, tex, clamp, smooth, span } from "../engine.mjs";
import { chrome, codeLine, fit } from "../widgets.mjs";

// ---------- data (db.seed.json) ----------
export const COMMENTS1 = ["The drawing finally made the boundary click.", "Please show the payload row again."];
const NOA_TALKS = [
  { id: 1, title: "Two graphs, one boundary" },
  { id: 4, title: "The waterfall trap" },
];
const NAV = ["Talks", "Search", "Breaks", "Exercises", "SPA", "Submit", "Agent"];

export const BW = 1280, BH = 800;
const ACC = "#4c8dff";

function button(g, x, y, w, h, text, { hot = 0, primary = false } = {}) {
  rr(g, x, y, w, h, 10);
  g.fillStyle = primary ? ACC : "#16203d"; g.fill();
  g.strokeStyle = hot ? C.yellow : C.line; g.lineWidth = hot ? 3 : 2; g.stroke();
  g.font = `600 19px ${UI}`; g.fillStyle = C.text; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(text, x + w / 2, y + h / 2 + 1); g.textAlign = "left";
}
function input(g, x, y, w, h, value, placeholder, { hot = 0, t = 0 } = {}) {
  rr(g, x, y, w, h, 10); g.fillStyle = "#0a1123"; g.fill();
  g.strokeStyle = hot ? C.yellow : C.line; g.lineWidth = hot ? 3 : 2; g.stroke();
  g.font = `400 19px ${UI}`; g.textBaseline = "middle";
  if (value) {
    g.fillStyle = C.text; g.fillText(value, x + 14, y + h / 2 + 1);
    if (hot && Math.floor(t * 2.4) % 2 === 0) { g.fillRect(x + 16 + g.measureText(value).width, y + 10, 2, h - 20); }
  } else if (placeholder) { g.fillStyle = "#56627f"; g.fillText(placeholder, x + 14, y + h / 2 + 1); }
}

// The demo app: nav bar plus one page. o.page: "speakersDraft" | "speakersSol" | "blank" | "talk".
export function browser(key, o) {
  const [c, g] = tex(key, BW, BH);
  const top = chrome(g, BW, BH, { url: o.url, tab: o.tab ?? "Talks", accent: o.accent ?? ACC });
  g.save();
  rr(g, 0, 0, BW, BH, 26); g.clip();
  g.fillStyle = "#0b1226"; g.fillRect(0, top, BW, BH - top);
  if (o.page !== "blank") {
    // nav (components/nav.tsx)
    g.fillStyle = "#0d1430"; g.fillRect(0, top, BW, 62);
    g.fillStyle = C.line; g.fillRect(0, top + 62, BW, 2);
    rr(g, 48, top + 17, 28, 28, 7); g.fillStyle = ACC; g.fill();
    g.font = `600 22px ${UI}`; g.fillStyle = C.text; g.textBaseline = "middle"; g.fillText("Talks", 88, top + 32);
    g.font = `400 18px ${UI}`;
    let x = 470;
    for (const l of NAV) {
      const act = l === (o.nav ?? "Exercises");
      const w = g.measureText(l).width + 24;
      if (act) { rr(g, x, top + 16, w, 32, 8); g.fillStyle = "rgba(76,141,255,0.18)"; g.fill(); }
      g.fillStyle = act ? C.text : C.muted; g.fillText(l, x + 12, top + 33);
      x += w + 6;
    }
  }
  const x0 = 120, y0 = top + 100;
  g.textBaseline = "middle";
  if (o.page === "speakersDraft") {
    // app/exercises/11/draft/speakers/page.tsx.txt: "<title> (<n> comments)" and the form under it
    g.font = `700 36px ${UI}`; g.fillStyle = C.text; g.fillText("Speakers", x0, y0);
    g.font = `600 26px ${UI}`; g.fillText("Noa Levi", x0, y0 + 64);
    NOA_TALKS.forEach((t, i) => {
      const y = y0 + 124 + i * 128;
      const n = o.counts?.[t.id] ?? (t.id === 1 ? 2 : 1);
      g.font = `400 22px ${UI}`; g.fillStyle = C.text;
      const head = `${t.title} (`;
      g.fillText(head, x0, y);
      const hw = g.measureText(head).width;
      g.font = `700 22px ${UI}`; g.fillStyle = t.id === 1 && o.countHot ? o.countHot : C.text;
      g.fillText(String(n), x0 + hw, y);
      const nw = g.measureText(String(n)).width;
      g.font = `400 22px ${UI}`; g.fillStyle = C.text; g.fillText(" comments)", x0 + hw + nw, y);
      input(g, x0, y + 26, 800, 46, t.id === 1 ? o.typed : "", "", { hot: t.id === 1 && o.typeHot, t: o.t });
      button(g, x0 + 816, y + 26, 160, 46, "Add comment", { hot: t.id === 1 ? o.pressHot : 0 });
    });
  } else if (o.page === "speakersSol") {
    // app/exercises/11/solution/speakers/: the shell, then <SpeakerList> inside <Suspense>
    g.font = `700 36px ${UI}`; g.fillStyle = C.text; g.fillText("Speakers", x0, y0);
    const li = clamp(o.listIn ?? 1);
    if (li < 1) {
      g.globalAlpha = 1 - li;
      g.font = `400 20px ${UI}`; g.fillStyle = C.muted; g.fillText("Loading speakers...", x0, y0 + 60);
      g.globalAlpha = 1;
    }
    if (li > 0) {
      g.globalAlpha = li;
      g.font = `400 18px ${UI}`; g.fillStyle = C.muted; g.fillText("Show all speakers", x0, y0 + 52);
      g.fillRect(x0, y0 + 64, g.measureText("Show all speakers").width, 1.5);
      g.font = `600 26px ${UI}`; g.fillStyle = C.text; g.fillText("Noa Levi", x0, y0 + 108);
      rr(g, x0, y0 + 136, 1040, 290, 16); g.fillStyle = "#0f172d"; g.fill(); g.strokeStyle = C.line; g.lineWidth = 2; g.stroke();
      NOA_TALKS.forEach((t, i) => {
        const y = y0 + 176 + i * 140;
        if (i) { g.fillStyle = C.line; g.fillRect(x0, y - 36, 1040, 2); }
        const n = o.counts?.[t.id] ?? (t.id === 1 ? 2 : 1);
        g.font = `600 22px ${UI}`; g.fillStyle = C.text; g.fillText(t.title, x0 + 28, y);
        g.font = `400 20px ${UI}`; g.fillStyle = t.id === 1 && o.countHot ? o.countHot : C.muted; g.textAlign = "right";
        g.fillText(`${n} comments`, x0 + 1012, y); g.textAlign = "left";
        input(g, x0 + 28, y + 30, 800, 44, t.id === 1 ? o.typed : "", "Add a comment", { hot: t.id === 1 && o.typeHot, t: o.t });
        button(g, x0 + 842, y + 30, 170, 44, "Add comment", { hot: t.id === 1 ? o.pressHot : 0 });
      });
      g.globalAlpha = 1;
    }
  } else if (o.page === "talk") {
    // app/talks/[id]/page.tsx with talk 1
    g.font = `400 19px ${UI}`; g.fillStyle = C.muted; g.fillText("← All talks", x0, y0 - 20);
    rr(g, x0, y0 + 10, 1040, 160, 16); g.fillStyle = "#0f172d"; g.fill(); g.strokeStyle = C.line; g.lineWidth = 2; g.stroke();
    rr(g, x0 + 28, y0 + 34, 132, 28, 14); g.fillStyle = "rgba(76,141,255,0.2)"; g.fill();
    g.font = `600 16px ${UI}`; g.fillStyle = ACC; g.fillText("architecture", x0 + 42, y0 + 49);
    g.font = `700 32px ${UI}`; g.fillStyle = C.text; g.fillText("Two graphs, one boundary", x0 + 28, y0 + 96);
    g.font = `400 19px ${UI}`; g.fillStyle = C.muted; g.fillText("Noa Levi · 12 votes", x0 + 28, y0 + 140);
    const yc = y0 + 220;
    g.font = `700 15px ${UI}`; g.fillStyle = C.muted; g.fillText("C O M M E N T S", x0, yc);
    const cw = g.measureText("C O M M E N T S").width;
    const n = o.comments ?? 2;
    rr(g, x0 + cw + 14, yc - 15, 40, 30, 15); g.fillStyle = o.countHot ? o.countHot : C.line; g.fill();
    g.font = `700 18px ${UI}`; g.fillStyle = o.countHot ? "#0b1226" : C.text; g.textAlign = "center"; g.fillText(String(n), x0 + cw + 34, yc + 1); g.textAlign = "left";
    g.fillStyle = C.line; g.fillRect(x0 + cw + 68, yc, 1040 - cw - 68, 2);
    const list = [...COMMENTS1, ...(o.extra ?? [])].slice(0, n);
    list.forEach((s, i) => {
      const y = yc + 34 + i * 62;
      rr(g, x0, y, 1040, 50, 12); g.fillStyle = "#0f172d"; g.fill(); g.strokeStyle = C.line; g.lineWidth = 2; g.stroke();
      g.font = `400 19px ${UI}`; g.fillStyle = C.muted; g.fillText(s, x0 + 22, y + 26);
    });
  }
  g.restore();
  g.strokeStyle = C.line; g.lineWidth = 3; rr(g, 1.5, 1.5, BW - 3, BH - 3, 25); g.stroke();
  return c;
}

// ---------- the planted transcript ----------
// [number, kind, detail, result] from app/exercises/11/transcript.txt (shortened, same facts)
export const CALLS = [
  [1, "Read", "AGENTS.md", '"read node_modules/next/dist/docs/"'],
  [2, "Read", "lib/speakers.ts", 'getSpeakers(), "use cache"'],
  [3, "Read", "lib/talks.ts", "getTalks(), getTalk(id), addVote(id)"],
  [4, "Grep", '"comment" in lib/', "lib/comments.ts, lib/types.ts"],
  [5, "Read", "use-cache.md", "lines 1 to 60 only"],
  [6, "dev server", "nextjs_index", "one server, port 3000"],
  [7, "dev server", "get_errors", "No browser sessions connected"],
  [8, "dev server", "get_routes", "the new route is not in it yet"],
  [9, "Write", "speakers/comment-count.ts", ""],
  [10, "Write", "speakers/actions.ts", ""],
  [11, "Write", "speakers/comment-form.tsx", ""],
  [12, "Write", "speakers/page.tsx", ""],
  [13, "dev server", "get_errors", "No browser sessions connected"],
  [14, "Bash", 'curl …/speakers | grep -i "<h1"', "(no output)"],
  [15, "Bash", "curl -w %{http_code} …/speakers", "500"],
  [16, "Bash", "curl -w %{http_code} …/speakers", "500"],
  [17, "Bash", "node -e \"fetch(…3001/comments…)\"", "Permission denied"],
  [18, "Write", "scratch-post.mjs", "posts a comment, talkId 1"],
  [19, "Bash", "node scratch-post.mjs", 'approved. {"talkId":1,"text":"test"…}'],
  [20, "dev server", "get_errors", "No browser sessions connected"],
  [21, "Edit", "page.tsx: reorder two imports", ""],
  [22, "Bash", "curl -w %{http_code} …/speakers", "500"],
  [23, "dev server", "get_errors", "No browser sessions connected"],
  [24, "Edit", "page.tsx: rename a variable", ""],
  [25, "Bash", "curl -w %{http_code} …/speakers", "500"],
  [26, "dev server", "get_errors", "No browser sessions connected"],
  [27, "Edit", "page.tsx: add a comment line", ""],
  [28, "Bash", "curl -w %{http_code} …/speakers", "500"],
  [29, "Bash", "rm scratch-post.mjs", ""],
  [30, "Bash", 'curl …/talks/1 | grep -c "Comments"', "1"],
];
export const TW = 1180, TH = 790, TROW = 50, THEAD = 70;
const KIND = { "dev server": C.server, Read: "#2ec4b6", Grep: "#2ec4b6", Write: C.client, Edit: C.client, Bash: "#9aa6c4" };

// o.top: the first visible row (0-based, fractional), o.colors: Map(callNumber -> color), o.dimOthers,
// o.loop (0..1) the bracket over 20-28, o.stop (0..1) the stop line after 26.
export function transcript(key, o) {
  const [c, g] = tex(key, TW, TH);
  rr(g, 0, 0, TW, TH, 22); g.fillStyle = "#0a1022"; g.fill();
  g.save(); g.clip();
  g.fillStyle = "#0f1830"; g.fillRect(0, 0, TW, THEAD);
  g.fillStyle = C.yellow; g.fillRect(0, 0, 8, TH);
  g.font = `600 27px ${MONO}`; g.fillStyle = C.text; g.textBaseline = "middle"; g.fillText("transcript.txt", 34, 36);
  g.font = `600 20px ${UI}`;
  const tag = "PLANTED · 30 calls";
  const tw = g.measureText(tag).width + 30;
  rr(g, TW - tw - 22, 17, tw, 38, 19); g.fillStyle = "rgba(255,209,102,0.15)"; g.fill(); g.strokeStyle = C.yellow; g.lineWidth = 2; g.stroke();
  g.fillStyle = C.yellow; g.fillText(tag, TW - tw - 7, 37);
  g.save();
  g.beginPath(); g.rect(0, THEAD, TW, TH - THEAD); g.clip();
  const yOf = (n) => THEAD + 10 + (n - 1 - (o.top ?? 0)) * TROW + TROW / 2;
  for (const [n, kind, detail, result] of CALLS) {
    const y = yOf(n);
    if (y < THEAD - TROW || y > TH + TROW) continue;
    const col = o.colors?.get(n);
    const dim = o.dimOthers && !col ? 0.4 : 1;
    if (col) { g.fillStyle = col + "26"; g.fillRect(8, y - TROW / 2 + 2, TW, TROW - 4); g.fillStyle = col; g.fillRect(8, y - TROW / 2 + 2, 6, TROW - 4); }
    g.globalAlpha = dim;
    g.font = `600 23px ${MONO}`; g.fillStyle = C.muted; g.textAlign = "right"; g.fillText(String(n), 66, y); g.textAlign = "left";
    const kc = KIND[kind];
    g.font = `600 17px ${UI}`;
    rr(g, 82, y - 15, 118, 30, 15); g.fillStyle = kc + "2a"; g.fill(); g.strokeStyle = kc; g.lineWidth = 1.6; g.stroke();
    g.fillStyle = kc; g.textAlign = "center"; g.fillText(kind, 141, y + 1); g.textAlign = "left";
    g.font = `400 24px ${MONO}`; g.fillStyle = C.text;
    const d = fit(g, detail, result ? 470 : 900);
    g.fillText(d, 220, y);
    if (result) {
      const rx = 220 + Math.max(g.measureText(d).width + 24, 0);
      g.font = `400 22px ${UI}`;
      g.fillStyle = result === "500" || result === "Permission denied" ? C.red : C.muted;
      g.fillText("→ " + fit(g, result, TW - rx - 70), rx, y);
    }
    g.globalAlpha = 1;
  }
  if (o.loop > 0) {
    const a = yOf(20) - TROW / 2 + 4, b = yOf(28) + TROW / 2 - 4;
    g.globalAlpha = o.loop;
    g.strokeStyle = C.red; g.lineWidth = 5; g.beginPath();
    g.moveTo(TW - 40, a); g.lineTo(TW - 24, a); g.lineTo(TW - 24, b); g.lineTo(TW - 40, b); g.stroke();
    g.save(); g.translate(TW - 34, (a + b) / 2); g.rotate(-Math.PI / 2);
    g.font = `700 18px ${UI}`; g.fillStyle = C.red; g.textAlign = "center"; g.fillText("THE LOOP", 0, -14); g.restore();
    g.globalAlpha = 1;
  }
  if (o.stop > 0) {
    const y = yOf(26) + TROW / 2;
    g.globalAlpha = o.stop;
    g.strokeStyle = C.red; g.lineWidth = 4; g.setLineDash([14, 10]);
    g.beginPath(); g.moveTo(20, y); g.lineTo(TW - 70, y); g.stroke(); g.setLineDash([]);
    g.font = `800 18px ${UI}`;
    rr(g, 520, y - 16, 210, 32, 16); g.fillStyle = C.red; g.fill();
    g.fillStyle = "#fff"; g.textAlign = "center"; g.fillText("STOP AFTER 26", 625, y + 1); g.textAlign = "left";
    g.globalAlpha = 1;
  }
  g.restore();
  g.restore();
  g.strokeStyle = C.line; g.lineWidth = 3; rr(g, 1.5, 1.5, TW - 3, TH - 3, 21); g.stroke();
  return c;
}

// ---------- Markdown cards ----------
// lines: strings or { t, c } (c: color of the plain text). "# " a heading, "- " a bullet, "1. " a number.
// Text in backticks is code. weights: Map(line -> 0..1) for the highlight. reveal: lines shown.
function inline(g, s, x, y, size, color, bold) {
  const parts = s.split("`");
  let cx = x;
  parts.forEach((p, i) => {
    if (!p) return;
    if (i % 2) { g.font = `400 ${Math.round(size * 0.92)}px ${MONO}`; g.fillStyle = "#9ee6a8"; }
    else { g.font = `${bold ? 700 : 400} ${size}px ${UI}`; g.fillStyle = color; }
    g.fillText(p, cx, y);
    cx += g.measureText(p).width;
  });
  return cx;
}
export function mdCard(key, { title, tag, tagColor = C.server, lines, w = 1120, size = 24, weights = new Map(), reveal = 999, accent }) {
  const lh = size * 1.6;
  const h = Math.round(96 + lines.length * lh + 26);
  const [c, g] = tex(key, w, h);
  rr(g, 0, 0, w, h, 22); g.fillStyle = "#0b1226"; g.fill();
  g.save(); g.clip();
  g.fillStyle = "#0f1830"; g.fillRect(0, 0, w, 70);
  g.fillStyle = accent ?? tagColor; g.fillRect(0, 0, 8, h);
  g.font = `600 28px ${MONO}`; g.fillStyle = C.text; g.textBaseline = "middle";
  g.fillText(title, 34, 36);
  if (tag) {
    g.font = `600 20px ${UI}`;
    const tw = g.measureText(tag).width + 30;
    rr(g, w - tw - 24, 17, tw, 38, 19); g.fillStyle = tagColor + "33"; g.fill();
    g.strokeStyle = tagColor; g.lineWidth = 2; g.stroke();
    g.fillStyle = tagColor; g.fillText(tag, w - tw - 9, 37);
  }
  lines.forEach((ln, i) => {
    const y = 96 + i * lh + lh / 2;
    const vis = clamp(reveal - i);
    if (vis <= 0) return;
    const L = typeof ln === "string" ? { t: ln } : ln;
    const k = weights.get(i) ?? 0;
    if (k > 0.01) { g.fillStyle = `rgba(255,209,102,${0.17 * k})`; g.fillRect(8, y - lh / 2, w, lh); g.fillStyle = `rgba(255,209,102,${0.95 * k})`; g.fillRect(8, y - lh / 2, 5, lh); }
    g.globalAlpha = vis;
    let s = L.t, x = 34, bold = false, color = L.c ?? C.text;
    if (s.startsWith("# ")) { s = s.slice(2); bold = true; color = L.c ?? C.yellow; }
    else if (s.startsWith("- ")) { s = s.slice(2); g.fillStyle = C.muted; g.beginPath(); g.arc(46, y, 4, 0, 7); g.fill(); x = 62; }
    else if (/^\d\. /.test(s)) { g.font = `600 ${size}px ${UI}`; g.fillStyle = C.muted; g.fillText(s.slice(0, 2), 38, y); s = s.slice(3); x = 72; }
    else if (s.startsWith("  ")) { x = 62; }
    inline(g, s, x, y, size, color, bold);
    g.globalAlpha = 1;
  });
  g.restore();
  g.strokeStyle = C.line; g.lineWidth = 3; rr(g, 1.5, 1.5, w - 3, h - 3, 21); g.stroke();
  return c;
}

// ---------- the build pipeline ----------
// states: one of "idle" | "run" | "fail" | "pass" for compile, type check, prerender
export function pipeline(key, { states, t = 0, title = "npx next build" }) {
  const w = 1140, h = 210;
  const [c, g] = tex(key, w, h);
  rr(g, 0, 0, w, h, 22); g.fillStyle = "#0b1226"; g.fill(); g.strokeStyle = C.line; g.lineWidth = 3; g.stroke();
  g.textBaseline = "middle";
  g.font = `600 22px ${MONO}`; g.fillStyle = C.muted; g.fillText(title, 30, 34);
  const names = ["compile", "type check", "prerender"];
  const bw = 300, gap = 60, x0 = 40, y = 70, bh = 110;
  names.forEach((n, i) => {
    const st = states[i] ?? "idle";
    const col = st === "fail" ? C.red : st === "pass" ? C.green : st === "run" ? C.yellow : C.line;
    const x = x0 + i * (bw + gap);
    rr(g, x, y, bw, bh, 18);
    g.fillStyle = st === "idle" ? "#0f172d" : col + "22"; g.fill();
    g.strokeStyle = col; g.lineWidth = st === "run" ? 3 + 2 * (0.5 + 0.5 * Math.sin(t * 8)) : 3; g.stroke();
    g.font = `700 30px ${UI}`; g.fillStyle = st === "idle" ? C.muted : C.text; g.textAlign = "center";
    g.fillText(n, x + bw / 2, y + 42);
    g.font = `600 20px ${UI}`; g.fillStyle = col;
    g.fillText(st === "fail" ? "✕ stops here" : st === "pass" ? "✓ passed" : st === "run" ? "running…" : "", x + bw / 2, y + 80);
    g.textAlign = "left";
    if (i < 2) {
      const ax = x + bw + 10, ay = y + bh / 2;
      g.strokeStyle = C.muted; g.lineWidth = 3; g.beginPath(); g.moveTo(ax, ay); g.lineTo(ax + 40, ay); g.lineTo(ax + 30, ay - 8); g.moveTo(ax + 40, ay); g.lineTo(ax + 30, ay + 8); g.stroke();
    }
  });
  return c;
}

// ---------- tables ----------
// rows: arrays of cells. widths: column widths. weights: Map(row -> 0..1). rowColors: Map(row -> color).
export function table(key, { title, head, rows, widths, size = 22, weights = new Map(), rowColors = new Map(), reveal = 999, accent = C.server, mono = [0] }) {
  const w = widths.reduce((a, b) => a + b, 0) + 60;
  const rh = size * 2;
  const h = Math.round(80 + rh * (rows.length + 1) + 24);
  const [c, g] = tex(key, w, h);
  rr(g, 0, 0, w, h, 22); g.fillStyle = "#0b1226"; g.fill();
  g.save(); g.clip();
  g.fillStyle = "#0f1830"; g.fillRect(0, 0, w, 70);
  g.fillStyle = accent; g.fillRect(0, 0, 8, h);
  g.font = `600 26px ${MONO}`; g.fillStyle = C.text; g.textBaseline = "middle"; g.fillText(title, 34, 36);
  const drawRow = (cells, y, bold, color) => {
    let x = 34;
    cells.forEach((cell, j) => {
      g.font = `${bold ? 700 : 400} ${size}px ${mono.includes(j) && !bold ? MONO : UI}`;
      g.fillStyle = bold ? C.muted : color ?? C.text;
      g.fillText(fit(g, cell, widths[j] - 16), x, y);
      x += widths[j];
    });
  };
  drawRow(head, 80 + rh / 2, true);
  g.fillStyle = C.line; g.fillRect(20, 80 + rh, w - 40, 2);
  rows.forEach((r, i) => {
    const y = 80 + rh * (i + 1) + rh / 2;
    const vis = clamp(reveal - i);
    if (vis <= 0) return;
    const k = weights.get(i) ?? 0;
    const rc = rowColors.get(i);
    if (k > 0.01) { g.fillStyle = (rc ?? "#ffd166") + Math.round(0x2c * k).toString(16).padStart(2, "0"); g.fillRect(8, y - rh / 2, w, rh); g.fillStyle = rc ?? C.yellow; g.globalAlpha = k; g.fillRect(8, y - rh / 2, 5, rh); g.globalAlpha = 1; }
    g.globalAlpha = vis;
    drawRow(r, y, false, k > 0.5 && rc ? rc : null);
    g.globalAlpha = 1;
  });
  g.restore();
  g.strokeStyle = C.line; g.lineWidth = 3; rr(g, 1.5, 1.5, w - 3, h - 3, 21); g.stroke();
  return c;
}

// ---------- rows for a folder tree ----------
export function pathRow(key, { name, glow = 0, color = C.server, dim = 0, w = 900, note = "" }) {
  const h = 60;
  const [c, g] = tex(key, w, h);
  rr(g, 0, 0, w, h, 14);
  g.fillStyle = "#0f1730"; g.fill();
  if (glow) { g.fillStyle = color + "26"; g.fill(); }
  g.strokeStyle = glow ? color : C.line; g.lineWidth = glow ? 4 : 2; g.stroke();
  g.save(); rr(g, 0, 0, w, h, 14); g.clip(); g.fillStyle = color; g.fillRect(0, 0, 8, h); g.restore();
  g.textBaseline = "middle";
  g.font = `500 24px ${MONO}`; g.fillStyle = C.text;
  g.fillText(fit(g, name, w - 60 - (note ? g.measureText(note).width + 40 : 0)), 28, 31);
  if (note) { g.font = `600 19px ${UI}`; g.fillStyle = color; g.textAlign = "right"; g.fillText(note, w - 20, 31); g.textAlign = "left"; }
  if (dim) { g.fillStyle = `rgba(6,10,21,${dim})`; rr(g, 0, 0, w, h, 14); g.fill(); }
  return c;
}

// ---------- a face for a 3D node box ----------
export function nodeFace(key, { title, sub, color, big, w = 512, h = 256 }) {
  const [c, g] = tex(key, w, h);
  g.fillStyle = color + "2e"; g.fillRect(0, 0, w, h);
  g.textAlign = "center"; g.textBaseline = "middle";
  if (big != null) {
    g.font = `800 96px ${UI}`; g.fillStyle = "#fff"; g.fillText(String(big), w / 2, h / 2 - 22);
    g.font = `600 30px ${MONO}`; g.fillStyle = "rgba(255,255,255,0.9)"; g.fillText(title, w / 2, h - 46);
  } else {
    g.font = `700 40px ${UI}`; g.fillStyle = "#fff"; g.fillText(title, w / 2, sub ? h / 2 - 24 : h / 2);
    if (sub) { g.font = `500 28px ${MONO}`; g.fillStyle = "rgba(255,255,255,0.85)"; g.fillText(sub, w / 2, h / 2 + 30); }
  }
  g.textAlign = "left";
  return [c];
}

export { codeLine, smooth, span };
