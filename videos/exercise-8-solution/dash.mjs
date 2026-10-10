// Textures for the Exercise 8 solution video: the dashboard browser window (dark and light),
// the code cards with line highlights, and the file rows. Copied from exercise-8/scene.mjs and
// changed to draw what the SOLUTION renders (its real texts and layout).
import { createCanvas } from "@napi-rs/canvas";
import { C, UI, MONO, rr, tex, clamp, lerp, smooth, span } from "../engine.mjs";
import { chrome, codeLine, fit } from "../widgets.mjs";

// ---------- data (db.seed.json) ----------
export const TALKS = [
  { id: 1, title: "Two graphs, one boundary", votes: 12, category: "architecture" },
  { id: 2, title: "Reading the RSC payload", votes: 8, category: "frontend" },
  { id: 3, title: "Caching is opt-in", votes: 15, category: "performance" },
  { id: 4, title: "The waterfall trap", votes: 5, category: "performance" },
  { id: 5, title: "Server Actions in production", votes: 9, category: "backend" },
  { id: 6, title: "Agents that know Next 16", votes: 3, category: "ai" },
];
const SPEAKERS = [
  ["Noa Levi", "Frontend lead. Migrated three apps from Pages Router to App Router."],
  ["Dan Cohen", "Platform engineer. Reads network tabs for fun."],
  ["Maya Peretz", "Works on caching layers and cache invalidation."],
  ["Omer Katz", "Builds forms and mutations for large teams."],
];
const CAT = { architecture: "#4c8dff", frontend: "#2ec4b6", performance: "#ffa04a", backend: "#b48cff", ai: "#ff6fb5" };

// ---------- palettes: dark is the default, light is theme.css (Task 11) ----------
const DARK = {
  paper: "#0f172d", page: "#141f3b", aside: "#0c1429", card: "#0e1730", rowA: "#111b35", rowB: "#0f1831",
  field: "#0a1123", btn: "#1b2747", text: "#e9eef8", muted: "#8d9abb", faint: "#56627f", line: "#26345a",
  accent: "#4c8dff", link: "#82aaff", rowTitle: "#e9eef8", body: "#c9d3ea", activeText: "#ffffff",
};
const LIGHT = {
  paper: "#faf9f7", page: "#ffffff", aside: "#ffffff", card: "#faf9f7", rowA: "#f5f5f4", rowB: "#ffffff",
  field: "#ffffff", btn: "#f5f5f4", text: "#1c1917", muted: "#78716c", faint: "#a8a29e", line: "#e7e5e4",
  accent: "#4f46e5", link: "#4f46e5", rowTitle: "#1c1917", body: "#44403c", activeText: "#1c1917",
};
function mixHex(a, b, k) {
  const h = (x, i) => parseInt(x.slice(1 + i * 2, 3 + i * 2), 16);
  return "#" + [0, 1, 2].map((i) => Math.round(lerp(h(a, i), h(b, i), k)).toString(16).padStart(2, "0")).join("");
}
let P = DARK;
let LK = 0;
function setLight(k) {
  LK = clamp(k ?? 0);
  P = LK <= 0 ? DARK : Object.fromEntries(Object.keys(DARK).map((n) => [n, mixHex(DARK[n], LIGHT[n], LK)]));
}

export const DW = 1280, DH = 800;
export const SEC = { x: 304, y: 176, w: 952, h: 600 };
export const BASE_URL = "localhost:3000/exercises/8/solution/dashboard";

function badge(g, x, y, text) {
  g.font = `600 16px ${UI}`;
  const w = g.measureText(text).width + 22;
  const col = LK > 0 ? mixHex(CAT[text], "#000000", 0.45 * LK) : CAT[text];
  rr(g, x, y - 13, w, 26, 13); g.fillStyle = CAT[text] + "30"; g.fill();
  g.fillStyle = col; g.textBaseline = "middle"; g.fillText(text, x + 11, y + 1);
  return w;
}

function button(g, x, y, w, text, { disabled = false } = {}) {
  rr(g, x, y - 20, w, 40, 10);
  g.fillStyle = disabled ? "#2a3553" : P.accent; g.fill();
  g.font = `600 19px ${UI}`; g.fillStyle = disabled ? C.muted : "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(text, x + w / 2, y + 1); g.textAlign = "left";
}

// one row of the talks table, centre line at y
export function rowY(i) { return 130 + i * 76; }
export const VOTE_X = 952 - 20 - 20 - 55; // centre of the Vote button, page-local

function drawPage(g, x0, y0, w, h, o) {
  g.save();
  g.translate(x0, y0);
  rr(g, 0, 0, w, h, 16); g.fillStyle = P.page; g.fill();
  g.save(); g.clip();
  g.textBaseline = "middle";
  if (o.page === "overview") {
    const stats = [["TALKS", "6"], ["VOTES", String(o.votesTotal ?? 52)], ["SPEAKERS", "4"], ["TOP TALK", "Caching is opt-in"]];
    const cw = (w - 28 * 2 - 18 * 3) / 4;
    stats.forEach(([k, v], i) => {
      const x = 28 + i * (cw + 18);
      const a = o.statsIn == null ? 1 : clamp(o.statsIn * 4 - i);
      g.globalAlpha = a;
      rr(g, x, 28 + (1 - a) * 14, cw, 118, 14); g.fillStyle = P.card; g.fill(); g.strokeStyle = P.line; g.lineWidth = 2; g.stroke();
      g.font = `700 15px ${UI}`; g.fillStyle = P.muted; g.fillText(k, x + 18, 58 + (1 - a) * 14);
      const long = v.length > 6;
      g.font = long ? `700 22px ${UI}` : `700 46px ${UI}`; g.fillStyle = P.text;
      g.fillText(fit(g, v, cw - 30), x + 18, 108 + (1 - a) * 14);
      g.globalAlpha = 1;
    });
    const open = clamp(o.speakersOpen ?? 0);
    const ph = 58 + open * (4 * 38 + 28);
    rr(g, 28, 176, w - 56, ph, 14); g.fillStyle = P.card; g.fill();
    g.strokeStyle = o.speakersHot ? C.client : P.line; g.lineWidth = o.speakersHot ? 4 : 2; g.stroke();
    g.font = `600 22px ${UI}`; g.fillStyle = P.text; g.fillText("Speakers", 52, 176 + 29);
    g.strokeStyle = P.muted; g.lineWidth = 3; g.lineCap = "round"; g.beginPath();
    const cx = w - 28 - 40, cy = 176 + 29;
    if (open > 0.5) { g.moveTo(cx - 8, cy + 4); g.lineTo(cx, cy - 4); g.lineTo(cx + 8, cy + 4); }
    else { g.moveTo(cx - 8, cy - 4); g.lineTo(cx, cy + 4); g.lineTo(cx + 8, cy - 4); }
    g.stroke();
    if (open > 0.05) {
      g.save(); rr(g, 28, 176, w - 56, ph, 14); g.clip();
      g.fillStyle = P.line; g.fillRect(28, 176 + 58, w - 56, 2);
      SPEAKERS.forEach(([n, b], i) => {
        const y = 176 + 58 + 36 + i * 38;
        const a = o.speakerHot != null ? (o.speakerHot === i ? 1 : 0.55) : 1;
        g.globalAlpha = clamp(open * 3 - i * 0.3) * a;
        g.font = `600 19px ${UI}`; g.fillStyle = P.text; g.fillText(n, 52, y);
        const nw = g.measureText(n + ": ").width;
        g.font = `400 19px ${UI}`; g.fillStyle = P.muted; g.fillText(": " + fit(g, b, w - 56 - 52 - nw - 30), 52 + g.measureText(n).width, y);
        g.globalAlpha = 1;
      });
      g.restore();
    }
    const ly = 176 + ph + 44;
    g.font = `500 21px ${UI}`; g.fillStyle = o.linkHot ? C.client : P.link;
    g.fillText("Download the talks as JSON", 28, ly);
    g.fillRect(28, ly + 15, g.measureText("Download the talks as JSON").width, 2);
  } else if (o.page === "talks") {
    g.font = `400 20px ${UI}`; g.fillStyle = P.text; g.fillText("Category", 28, 46);
    rr(g, 128, 24, 210, 44, 10); g.fillStyle = P.field; g.fill(); g.strokeStyle = o.filterHot ? C.client : P.line; g.lineWidth = o.filterHot ? 4 : 2; g.stroke();
    g.font = `500 20px ${UI}`; g.fillStyle = P.text; g.fillText(o.filter ?? "all", 146, 47);
    g.strokeStyle = P.muted; g.lineWidth = 3; g.lineCap = "round"; g.beginPath(); g.moveTo(308, 42); g.lineTo(316, 50); g.lineTo(324, 42); g.stroke();
    const rows = TALKS.filter((t) => !o.filter || o.filter === "all" || t.category === o.filter);
    rr(g, 20, 92, w - 40, rows.length * 76 + 4, 14); g.fillStyle = P.card; g.fill(); g.strokeStyle = P.line; g.lineWidth = 2; g.stroke();
    rows.forEach((t, i) => {
      const y = rowY(i) - 0;
      const a = o.rowIn == null ? 1 : clamp(o.rowIn * rows.length - i);
      g.globalAlpha = a;
      if (i > 0) { g.fillStyle = P.line; g.fillRect(20, y - 38, w - 40, 1.5); }
      g.font = `500 22px ${UI}`; g.fillStyle = P.rowTitle; g.fillText(fit(g, t.title, 330), 44, y - 12);
      badge(g, 44, y + 16, t.category);
      const votes = t.id === 1 && o.votes1 != null ? o.votes1 : t.votes;
      g.font = `400 19px ${UI}`; g.fillStyle = t.id === 1 && o.votesHot ? C.green : P.muted;
      g.fillText(`${votes} votes`, 470, y);
      const pending = t.id === 1 && o.pending;
      if (t.id === 1 && o.message) { g.font = `400 18px ${UI}`; g.fillStyle = C.green; g.textAlign = "right"; g.fillText(o.message, w - 40 - 134 - 14, y); g.textAlign = "left"; }
      button(g, w - 40 - 134, y, 124, pending ? "Voting…" : "Vote", { disabled: pending });
      if (t.id === 1 && o.press) { rr(g, w - 40 - 128, y - 24, 118, 48, 12); g.strokeStyle = `rgba(255,255,255,${o.press})`; g.lineWidth = 3; g.stroke(); }
      g.globalAlpha = 1;
    });
  } else if (o.page === "talk") {
    g.font = `500 20px ${UI}`; g.fillStyle = P.muted; g.fillText("← All talks", 28, 32);
    rr(g, 20, 66, w - 40, 150, 14); g.fillStyle = P.card; g.fill(); g.strokeStyle = P.line; g.lineWidth = 2; g.stroke();
    badge(g, 46, 96, "architecture");
    g.font = `700 32px ${UI}`; g.fillStyle = P.text; g.fillText("Two graphs, one boundary", 46, 142);
    g.font = `400 20px ${UI}`; g.fillStyle = P.muted; g.fillText("Noa Levi · 12 votes", 46, 186);
    g.font = `600 20px ${UI}`; g.fillStyle = P.text; g.fillText("Comments (2)", 22, 262);
    ["The drawing finally made the boundary click.", "Please show the payload row again."].forEach((s, i) => {
      rr(g, 20, 290 + i * 62, w - 40, 50, 12); g.fillStyle = P.card; g.fill(); g.strokeStyle = P.line; g.lineWidth = 2; g.stroke();
      g.font = `400 19px ${UI}`; g.fillStyle = P.muted; g.fillText(s, 42, 316 + i * 62);
    });
  } else if (o.page === "loading") {
    const bar = (x, y, ww, hh, r, i) => {
      rr(g, x, y, ww, hh, r);
      const k = 0.5 + 0.5 * Math.sin((o.t ?? 0) * 5 - i * 0.6);
      g.fillStyle = LK > 0 ? `rgba(120,113,108,${0.12 + 0.12 * k})` : `rgba(120,150,220,${0.12 + 0.14 * k})`; g.fill();
    };
    bar(22, 18, 80, 16, 6, 0);
    rr(g, 20, 56, w - 40, 160, 14); g.fillStyle = P.card; g.fill(); g.strokeStyle = P.line; g.lineWidth = 2; g.stroke();
    bar(44, 80, 80, 20, 10, 1); bar(44, 120, (w - 40) * 0.75 - 24, 34, 10, 2); bar(44, 168, 160, 16, 6, 3);
  } else if (o.page === "error") {
    rr(g, 20, 20, w - 40, 250, 14); g.fillStyle = P.card; g.fill(); g.strokeStyle = "rgba(255,93,108,0.55)"; g.lineWidth = 2.5; g.stroke();
    g.font = `700 15px ${UI}`; g.fillStyle = C.red; g.fillText("ERROR", 46, 56);
    g.font = `700 28px ${UI}`; g.fillStyle = P.text; g.fillText("Something broke", 46, 94);
    rr(g, 46, 120, w - 92, 56, 12); g.fillStyle = "rgba(255,93,108,0.14)"; g.fill();
    g.font = `400 21px ${MONO}`; g.fillStyle = LK > 0 ? "#b91c1c" : "#ff8d98"; g.fillText("Boom: a render error on the server", 66, 149);
    button(g, 46, 220, 140, "Try again");
  } else if (o.page === "notfound") {
    rr(g, 20, 20, w - 40, 250, 14); g.fillStyle = P.card; g.fill(); g.strokeStyle = "rgba(255,209,102,0.5)"; g.lineWidth = 2.5; g.stroke();
    g.font = `700 15px ${UI}`; g.fillStyle = LK > 0 ? "#b45309" : C.yellow; g.fillText("404", 46, 56);
    g.font = `700 28px ${UI}`; g.fillStyle = P.text; g.fillText("No such talk", 46, 94);
    g.font = `400 20px ${UI}`; g.fillStyle = P.muted; g.fillText("The dashboard has no talk with this id.", 46, 140);
    button(g, 46, 214, 210, "Back to the talks");
  }
  g.restore();
  g.restore();
}

function wrap(g, s, x, y, max, lh) {
  let line = "", yy = y;
  for (const w of s.split(" ")) {
    if (g.measureText(line + w).width > max && line) { g.fillText(line, x, yy); line = ""; yy += lh; }
    line += w + " ";
  }
  g.fillText(line, x, yy);
}

// The whole browser window: chrome, title, the sidebar from layout.tsx, and the page in {children}.
export function dashboard(key, o) {
  const [c, g] = tex(key, DW, DH);
  setLight(o.light);
  const top = chrome(g, DW, DH, { url: o.url ?? BASE_URL, tab: o.tab ?? "Dashboard" });
  if (LK > 0) {
    g.save(); rr(g, 0, 0, DW, DH, 26); g.clip(); g.fillStyle = P.paper; g.fillRect(0, top, DW, DH - top); g.restore();
    g.strokeStyle = C.line; g.lineWidth = 3; rr(g, 1.5, 1.5, DW - 3, DH - 3, 25); g.stroke();
  }
  g.textBaseline = "middle";
  g.font = `700 30px ${UI}`; g.fillStyle = P.text; g.fillText("Organizer dashboard", 28, top + 42);
  const ax = 24, ay = SEC.y, aw = 260, ah = SEC.h;
  rr(g, ax, ay, aw, ah, 16); g.fillStyle = P.aside; g.fill();
  if (LK > 0) { g.strokeStyle = P.line; g.lineWidth = 2; g.stroke(); }
  if (o.asideGlow) { g.save(); g.strokeStyle = C.green; g.globalAlpha = o.asideGlow; g.lineWidth = 6; g.shadowColor = C.green; g.shadowBlur = 20; rr(g, ax, ay, aw, ah, 16); g.stroke(); g.restore(); }
  [["Overview", "overview"], ["Talks", "talks"]].forEach(([s, id], i) => {
    const y = ay + 44 + i * 54;
    const act = o.active === id;
    if (act) { rr(g, ax + 12, y - 22, aw - 24, 44, 10); g.fillStyle = P.accent + "29"; g.fill(); g.fillStyle = P.accent; g.fillRect(ax + 12, y - 22, 5, 44); }
    g.font = `${act ? 700 : 400} 24px ${UI}`; g.fillStyle = act ? P.activeText : P.muted; g.fillText(s, ax + 34, y);
  });
  if (o.linksHot) { g.save(); g.globalAlpha = o.linksHot; g.strokeStyle = C.client; g.lineWidth = 4; g.shadowColor = C.client; g.shadowBlur = 16; rr(g, ax + 6, ay + 14, aw - 12, 118, 12); g.stroke(); g.restore(); }
  rr(g, ax + 16, ay + 150, aw - 32, 150, 10); g.fillStyle = P.field; g.fill(); g.strokeStyle = o.noteHot ? C.yellow : P.line; g.lineWidth = o.noteHot ? 4 : 2; g.stroke();
  g.font = `400 19px ${UI}`; g.textBaseline = "top";
  if (o.note) { g.fillStyle = P.text; wrap(g, o.note, ax + 30, ay + 164, aw - 60, 26); }
  else { g.fillStyle = P.faint; g.fillText("A note for the team", ax + 30, ay + 164); }
  g.textBaseline = "middle";
  const by = ay + 340;
  rr(g, ax + 16, by - 22, aw - 32, 44, 10); g.fillStyle = P.btn; g.fill();
  g.strokeStyle = o.toggleHot ? C.client : P.line; g.lineWidth = o.toggleHot ? 4 : 2;
  if (o.toggleHot) { g.save(); g.shadowColor = C.client; g.shadowBlur = 16; g.stroke(); g.restore(); } else g.stroke();
  g.font = `600 20px ${UI}`; g.fillStyle = P.text; g.textAlign = "center";
  g.fillText(LK > 0.5 ? "Dark mode" : "Light mode", ax + aw / 2, by + 1); g.textAlign = "left";
  if (o.page && o.page !== "none") drawPage(g, SEC.x, SEC.y, SEC.w, SEC.h, o);
  if (o.devBadge) {
    g.font = `600 19px ${UI}`;
    const tw = g.measureText(o.devBadge).width + 56;
    rr(g, 22, DH - 56, tw, 38, 19); g.fillStyle = "rgba(10,14,28,0.92)"; g.fill();
    g.strokeStyle = C.yellow; g.lineWidth = 2; g.stroke();
    g.fillStyle = C.yellow; g.beginPath(); g.arc(44, DH - 37, 7, 0, 7); g.fill();
    g.fillStyle = "#fff"; g.fillText(o.devBadge, 62, DH - 36);
  }
  return c;
}

export function pageTex(key, o) {
  const [c, g] = tex(key, SEC.w, SEC.h);
  setLight(o.light);
  drawPage(g, 0, 0, SEC.w, SEC.h, o);
  return c;
}

// ---------- code cards ----------
const scratch = createCanvas(10, 10).getContext("2d");
export function checkWidth(title, lines, size, w) {
  scratch.font = `400 ${size}px ${MONO}`;
  for (const ln of lines) {
    const lw = scratch.measureText(ln).width;
    if (lw > w - 60) console.warn(`WIDE (${title}): ${Math.round(lw)} > ${w - 60}: ${ln}`);
  }
}

// weights: Map<lineIndex, 0..1> for the highlight
export function codeCard2(key, { title, tag, tagColor = C.server, lines, w = 1120, size = 24, weights = new Map(), reveal = 999 }) {
  const lh = size * 1.55;
  const h = Math.round(96 + lines.length * lh + 30);
  const [c, g] = tex(key, w, h);
  rr(g, 0, 0, w, h, 22); g.fillStyle = "#0b1226"; g.fill();
  g.save(); g.clip();
  g.fillStyle = "#0f1830"; g.fillRect(0, 0, w, 70);
  g.fillStyle = tagColor; g.fillRect(0, 0, 8, h);
  g.font = `600 28px ${MONO}`; g.fillStyle = C.text; g.textBaseline = "middle";
  g.fillText(title, 34, 36);
  if (tag) {
    g.font = `600 21px ${MONO}`;
    const tw = g.measureText(tag).width + 30;
    rr(g, w - tw - 24, 17, tw, 38, 19); g.fillStyle = tagColor + "33"; g.fill();
    g.strokeStyle = tagColor; g.lineWidth = 2; g.stroke();
    g.fillStyle = tagColor; g.fillText(tag, w - tw - 9, 37);
  }
  lines.forEach((ln, i) => {
    const y = 96 + i * lh + lh / 2;
    const vis = clamp(reveal - i);
    if (vis <= 0) return;
    const k = weights.get(i) ?? 0;
    if (k > 0.01) { g.fillStyle = `rgba(255,209,102,${0.17 * k})`; g.fillRect(8, y - lh / 2, w, lh); g.fillStyle = `rgba(255,209,102,${0.95 * k})`; g.fillRect(8, y - lh / 2, 5, lh); }
    g.globalAlpha = vis;
    codeLine(g, ln, 34, y, size);
    g.globalAlpha = 1;
  });
  g.restore();
  g.strokeStyle = C.line; g.lineWidth = 3; rr(g, 1.5, 1.5, w - 3, h - 3, 21); g.stroke();
  return c;
}

// steps: [[t, [lines]], ...]. The highlight eases from the lines of one step to the next.
export function hlWeights(lt, steps) {
  let idx = -1;
  steps.forEach(([t], i) => { if (lt >= t) idx = i; });
  const m = new Map();
  if (idx < 0) return m;
  const cur = steps[idx][1], prev = idx > 0 ? steps[idx - 1][1] : [];
  const k = smooth(span(lt, steps[idx][0], steps[idx][0] + 0.3));
  for (const i of new Set([...cur, ...prev])) m.set(i, lerp(prev.includes(i) ? 1 : 0, cur.includes(i) ? 1 : 0, k));
  return m;
}

// ---------- file rows (the solution tree) ----------
// kind: "client" | "action" | undefined (no directive). glow 0..1 lights the row, dim 0..1 darkens it.
export function fileRow(key, { name, kind, glow = 0, dim = 0 }) {
  const w = 640, h = 64;
  const [c, g] = tex(key, w, h);
  const col = kind === "client" ? C.client : kind === "action" ? C.action : C.server;
  rr(g, 0, 0, w, h, 14);
  g.fillStyle = glow ? `rgba(14,22,48,1)` : "#0f1730"; g.fill();
  if (glow) { g.fillStyle = col + "26"; g.fill(); }
  g.strokeStyle = glow ? col : C.line; g.lineWidth = glow ? 4 : 2; g.stroke();
  g.save(); rr(g, 0, 0, w, h, 14); g.clip(); g.fillStyle = col; g.fillRect(0, 0, 8, h); g.restore();
  g.textBaseline = "middle";
  g.font = `500 27px ${MONO}`; g.fillStyle = C.text;
  g.fillText(name, 32, 33);
  const tag = kind === "client" ? "use client" : kind === "action" ? "use server" : "no directive";
  g.font = `600 18px ${MONO}`;
  const tw = g.measureText(tag).width + 24;
  rr(g, w - tw - 14, 16, tw, 32, 16); g.fillStyle = col + "33"; g.fill(); g.strokeStyle = col; g.lineWidth = 2; g.stroke();
  g.fillStyle = col; g.fillText(tag, w - tw - 2, 33);
  if (dim) { g.fillStyle = `rgba(6,10,21,${dim})`; rr(g, 0, 0, w, h, 14); g.fill(); }
  return c;
}

export function cursor(ctx, x, y, press) {
  ctx.save();
  if (press > 0 && press < 1) { ctx.strokeStyle = `rgba(255,255,255,${1 - press})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 10 + press * 34, 0, 7); ctx.stroke(); }
  ctx.translate(x, y);
  ctx.fillStyle = "#fff"; ctx.strokeStyle = "#000"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 34); ctx.lineTo(9, 26); ctx.lineTo(16, 40); ctx.lineTo(22, 37); ctx.lineTo(15, 23); ctx.lineTo(27, 23); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.restore();
}

// the client provider box with the server pages inside it as children
export function childrenBox(key, k) {
  const w = 1000, h = 330;
  const [c, g] = tex(key, w, h);
  rr(g, 0, 0, w, h, 22); g.fillStyle = "rgba(255,160,74,0.08)"; g.fill();
  g.strokeStyle = C.client; g.lineWidth = 4; g.stroke();
  g.textBaseline = "middle";
  g.font = `600 26px ${MONO}`; g.fillStyle = C.client; g.fillText('ThemeProvider · "use client"', 30, 38);
  g.font = `500 24px ${MONO}`; g.fillStyle = C.muted; g.fillText("{children}", w - 30 - g.measureText("{children}").width, 38);
  [["Overview", "dashboard/page.tsx"], ["Talks", "talks/page.tsx"], ["One talk", "[id]/page.tsx"]].forEach(([t, f], i) => {
    const a = clamp(span(k, i * 0.22, i * 0.22 + 0.5));
    const x = 30 + i * 322, y = 82 + (1 - a) * -50;
    g.globalAlpha = a;
    rr(g, x, y, 294, 150, 16); g.fillStyle = C.server + "30"; g.fill(); g.strokeStyle = C.server; g.lineWidth = 3; g.stroke();
    g.font = `700 32px ${UI}`; g.fillStyle = C.text; g.fillText(t, x + 22, y + 48);
    g.font = `400 21px ${MONO}`; g.fillStyle = C.muted; g.fillText(f, x + 22, y + 90);
    g.font = `600 19px ${UI}`; g.fillStyle = C.server; g.fillText("Server Component", x + 22, y + 124);
    g.globalAlpha = 1;
  });
  g.globalAlpha = smooth(span(k, 0.6, 1));
  g.font = `500 24px ${UI}`; g.fillStyle = C.text; g.textAlign = "center";
  g.fillText("The pages arrive already rendered. The provider does not import them.", w / 2, 280);
  g.textAlign = "left"; g.globalAlpha = 1;
  return c;
}

// two parallel reads (0.8 s each, together) vs one after the other (1.6 s)
export function bars(key, k) {
  const w = 980, h = 300;
  const [c, g] = tex(key, w, h);
  rr(g, 0, 0, w, h, 20); g.fillStyle = "#0b1226"; g.fill(); g.strokeStyle = C.line; g.lineWidth = 3; g.stroke();
  g.textBaseline = "middle";
  const x0 = 250, full = 640;
  const row = (y, name, from, len, color, a = 1) => {
    g.globalAlpha = a;
    g.font = `500 22px ${MONO}`; g.fillStyle = C.text; g.fillText(name, 30, y);
    rr(g, x0, y - 15, full, 30, 8); g.fillStyle = "#16203d"; g.fill();
    const p = clamp(k * 1.6 - from) / 1.6;
    const ww = Math.min(len / 1.6, p) * full;
    if (ww > 0) { rr(g, x0 + (from / 1.6) * full, y - 15, ww, 30, 8); g.fillStyle = color; g.fill(); }
    g.globalAlpha = 1;
  };
  g.font = `700 22px ${UI}`; g.fillStyle = C.green; g.fillText("Promise.all: together, about 0.8 s", 30, 34);
  row(78, "getTalks()", 0, 0.8, C.server);
  row(120, "getSpeakers()", 0, 0.8, C.server);
  g.font = `700 22px ${UI}`; g.fillStyle = C.red; g.globalAlpha = 0.85; g.fillText("Two awaits in a row: about 1.6 s", 30, 178); g.globalAlpha = 1;
  row(222, "getTalks()", 0, 0.8, "#55607e", 0.8);
  row(264, "getSpeakers()", 0.8, 0.8, "#55607e", 0.8);
  return c;
}
