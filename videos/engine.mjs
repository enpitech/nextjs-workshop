// A tiny 3D engine for a 2D canvas: camera, projection, textured quads, shaded boxes,
// a shared background, and the 2D HUD (chip, captions, progress). Every function is pure
// in time: the renderer passes t in seconds, so frames are deterministic.
import { createCanvas, GlobalFonts } from "@napi-rs/canvas";

export const W = 1920;
export const H = 1080;

const F = "C:/Windows/Fonts/";
for (const f of ["segoeuil.ttf", "segoeui.ttf", "seguisb.ttf", "segoeuib.ttf", "seguibl.ttf"]) GlobalFonts.registerFromPath(F + f, "Segoe UI");
GlobalFonts.registerFromPath(F + "CascadiaCode.ttf", "Cascadia Code");
GlobalFonts.registerFromPath(F + "seguisym.ttf", "Segoe UI Symbol");

export const UI = '"Segoe UI", "Segoe UI Symbol"';
export const MONO = '"Cascadia Code", "Segoe UI Symbol"';

export const C = {
  bg0: "#060a15",
  bg1: "#0d1530",
  panel: "#0f172d",
  panel2: "#141f3b",
  line: "#26345a",
  text: "#e9eef8",
  muted: "#8d9abb",
  server: "#4c8dff",
  client: "#ffa04a",
  action: "#b48cff",
  green: "#3ddc97",
  red: "#ff5d6c",
  yellow: "#ffd166",
};

// ---------- easing ----------
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
export const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
export const easeInOut = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const back = (x) => { x = clamp(x); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
// 0 -> 1 between a and b (in local seconds)
export const span = (t, a, b) => clamp((t - a) / (b - a));
export const lerp3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

// ---------- vectors ----------
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const scale = (a, s) => [a[0] * s, a[1] * s, a[2] * s];

export function camera(pos, target, fov = 50) {
  const f = norm(sub(target, pos));
  const r = norm(cross([0, 1, 0], f));
  const u = cross(f, r);
  const fl = H / 2 / Math.tan((fov * Math.PI) / 360);
  return { pos, f, r, u, fl };
}

export function project(cam, p) {
  const d = sub(p, cam.pos);
  const z = dot(d, cam.f);
  if (z < 0.1) return null;
  const s = cam.fl / z;
  return { x: W / 2 + dot(d, cam.r) * s, y: H / 2 - dot(d, cam.u) * s, z, s };
}

// rotate local point by [rx, ry, rz] (applied z, then x, then y)
export function rotate(p, rot) {
  let [x, y, z] = p;
  const [rx = 0, ry = 0, rz = 0] = rot || [];
  if (rz) { const c = Math.cos(rz), s = Math.sin(rz); [x, y] = [x * c - y * s, x * s + y * c]; }
  if (rx) { const c = Math.cos(rx), s = Math.sin(rx); [y, z] = [y * c - z * s, y * s + z * c]; }
  if (ry) { const c = Math.cos(ry), s = Math.sin(ry); [x, z] = [x * c + z * s, -x * s + z * c]; }
  return [x, y, z];
}

// ---------- textures ----------
const pool = new Map();
export function tex(key, w, h) {
  let c = pool.get(key);
  if (!c || c.width !== w || c.height !== h) { c = createCanvas(w, h); pool.set(key, c); }
  const g = c.getContext("2d");
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, w, h);
  return [c, g];
}

export function rr(g, x, y, w, h, r) {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
}

// Draw one triangle of an image with an affine map (source s*, destination d*).
function tri(ctx, img, s0, s1, s2, d0, d1, d2, cell) {
  const cx = (d0.x + d1.x + d2.x) / 3, cy = (d0.y + d1.y + d2.y) / 3;
  const ex = (p) => { const dx = p.x - cx, dy = p.y - cy, l = Math.hypot(dx, dy) || 1; return [p.x + (dx / l) * 0.9, p.y + (dy / l) * 0.9]; };
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(...ex(d0)); ctx.lineTo(...ex(d1)); ctx.lineTo(...ex(d2));
  ctx.closePath();
  ctx.clip();
  const den = (s1[0] - s0[0]) * (s2[1] - s0[1]) - (s2[0] - s0[0]) * (s1[1] - s0[1]);
  const a = ((d1.x - d0.x) * (s2[1] - s0[1]) - (d2.x - d0.x) * (s1[1] - s0[1])) / den;
  const b = ((d1.y - d0.y) * (s2[1] - s0[1]) - (d2.y - d0.y) * (s1[1] - s0[1])) / den;
  const c = ((d2.x - d0.x) * (s1[0] - s0[0]) - (d1.x - d0.x) * (s2[0] - s0[0])) / den;
  const d = ((d2.y - d0.y) * (s1[0] - s0[0]) - (d1.y - d0.y) * (s2[0] - s0[0])) / den;
  ctx.transform(a, b, c, d, d0.x - a * s0[0] - c * s0[1], d0.y - b * s0[0] - d * s0[1]);
  const [x, y, w, h] = cell;
  ctx.drawImage(img, x, y, w, h, x, y, w, h);
  ctx.restore();
}

// A flat rectangle in 3D: center pos, size w x h (world units), rotation, optional texture.
// Returns a drawable for the scene list.
export function quad({ pos, w, h, rot, img, alpha = 1, grid = 8, glow = null, glowA = 1, border = null, shade = true }) {
  const corner = (u, v) => add(pos, rotate([(u - 0.5) * w, (0.5 - v) * h, 0], rot));
  const n = rotate([0, 0, -1], rot);
  return {
    depthAt: (cam) => dot(sub(pos, cam.pos), cam.f),
    draw(ctx, cam) {
      if (alpha <= 0.002) return;
      const gx = img ? grid : 1, gy = img ? Math.max(1, Math.round(grid * Math.min(1, h / w) * 1.2)) : 1;
      const P = [];
      for (let j = 0; j <= gy; j++) for (let i = 0; i <= gx; i++) {
        const p = project(cam, corner(i / gx, j / gy));
        if (!p) return;
        P.push(p);
      }
      const at = (i, j) => P[j * (gx + 1) + i];
      const outline = () => {
        ctx.beginPath();
        ctx.moveTo(at(0, 0).x, at(0, 0).y); ctx.lineTo(at(gx, 0).x, at(gx, 0).y);
        ctx.lineTo(at(gx, gy).x, at(gx, gy).y); ctx.lineTo(at(0, gy).x, at(0, gy).y); ctx.closePath();
      };
      ctx.save();
      ctx.globalAlpha = alpha;
      if (glow) {
        ctx.save();
        ctx.globalAlpha = alpha * glowA;
        ctx.shadowColor = glow; ctx.shadowBlur = 60; ctx.fillStyle = glow;
        outline(); ctx.fill();
        ctx.restore();
      }
      if (img) {
        const iw = img.width, ih = img.height;
        for (let j = 0; j < gy; j++) for (let i = 0; i < gx; i++) {
          const u0 = (i / gx) * iw, u1 = ((i + 1) / gx) * iw, v0 = (j / gy) * ih, v1 = ((j + 1) / gy) * ih;
          const cell = [Math.max(0, u0 - 2), Math.max(0, v0 - 2), Math.min(iw, u1 + 2) - Math.max(0, u0 - 2), Math.min(ih, v1 + 2) - Math.max(0, v0 - 2)];
          tri(ctx, img, [u0, v0], [u1, v0], [u1, v1], at(i, j), at(i + 1, j), at(i + 1, j + 1), cell);
          tri(ctx, img, [u0, v0], [u1, v1], [u0, v1], at(i, j), at(i + 1, j + 1), at(i, j + 1), cell);
        }
      }
      if (shade) {
        // darken surfaces that turn away from the camera
        const facing = Math.abs(dot(n, norm(sub(cam.pos, pos))));
        const k = clamp(0.55 - facing * 0.6, 0, 0.5);
        if (k > 0.01) { ctx.fillStyle = `rgba(0,0,8,${k})`; outline(); ctx.fill(); }
      }
      if (border) { ctx.strokeStyle = border; ctx.lineWidth = 2; outline(); ctx.stroke(); }
      ctx.restore();
    },
    screenAt(cam, u, v) { return project(cam, corner(u, v)); },
  };
}

function shadeColor(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgb(${Math.round(r * k)},${Math.round(g * k)},${Math.round(b * k)})`;
}

// A shaded box. Each visible face becomes its own drawable so boxes sort with everything else.
const LIGHT = norm([-0.4, 0.8, -0.6]);
export function box({ pos, size, rot, color, alpha = 1, front = null, glow = null }) {
  const [sx, sy, sz] = size.map((s) => s / 2);
  const faces = [
    { n: [0, 0, -1], c: [0, 0, -sz], u: [sx, 0, 0], v: [0, sy, 0], front: true },
    { n: [0, 0, 1], c: [0, 0, sz], u: [-sx, 0, 0], v: [0, sy, 0] },
    { n: [1, 0, 0], c: [sx, 0, 0], u: [0, 0, sz], v: [0, sy, 0] },
    { n: [-1, 0, 0], c: [-sx, 0, 0], u: [0, 0, -sz], v: [0, sy, 0] },
    { n: [0, 1, 0], c: [0, sy, 0], u: [sx, 0, 0], v: [0, 0, sz] },
    { n: [0, -1, 0], c: [0, -sy, 0], u: [sx, 0, 0], v: [0, 0, -sz] },
  ];
  return faces.map((f) => {
    const wc = add(pos, rotate(f.c, rot));
    const wn = rotate(f.n, rot);
    const pt = (a, b) => add(pos, rotate(add(f.c, add(scale(f.u, a), scale(f.v, b))), rot));
    return {
      depthAt: (cam) => dot(sub(wc, cam.pos), cam.f) + 0.001,
      draw(ctx, cam) {
        if (alpha <= 0.002) return;
        if (dot(wn, sub(cam.pos, wc)) <= 0) return;
        const ps = [pt(-1, 1), pt(1, 1), pt(1, -1), pt(-1, -1)].map((p) => project(cam, p));
        if (ps.some((p) => !p)) return;
        const lit = 0.45 + 0.6 * Math.max(0, dot(wn, LIGHT));
        ctx.save();
        ctx.globalAlpha = alpha;
        if (glow && f.front) { ctx.shadowColor = glow; ctx.shadowBlur = 40; }
        ctx.beginPath();
        ps.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.closePath();
        ctx.fillStyle = shadeColor(color, lit);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(255,255,255,0.18)"; ctx.lineWidth = 1.2; ctx.stroke();
        if (f.front && front) {
          // affine-map the label texture onto the front face
          const [img] = front;
          const [p0, p1, , p3] = ps;
          ctx.setTransform((p1.x - p0.x) / img.width, (p1.y - p0.y) / img.width, (p3.x - p0.x) / img.height, (p3.y - p0.y) / img.height, p0.x, p0.y);
          ctx.drawImage(img, 0, 0);
        }
        ctx.restore();
      },
    };
  });
}

// A glowing 3D line (for arcs, the boundary, packet trails).
export function line3({ a, b, color, width = 3, alpha = 1, dash = null }) {
  return {
    depthAt: (cam) => dot(sub(scale(add(a, b), 0.5), cam.pos), cam.f),
    draw(ctx, cam) {
      const p = project(cam, a), q = project(cam, b);
      if (!p || !q || alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.shadowColor = color; ctx.shadowBlur = 18;
      if (dash) ctx.setLineDash(dash);
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
      ctx.restore();
    },
  };
}

// A screen-facing label pinned to a 3D point.
export function label3({ at, text, color = C.text, bg = "rgba(10,16,34,0.85)", size = 26, alpha = 1, mono = false, dy = 0 }) {
  return {
    depthAt: (cam) => dot(sub(at, cam.pos), cam.f) - 50,
    draw(ctx, cam) {
      const p = project(cam, at);
      if (!p || alpha <= 0.01) return;
      pill(ctx, p.x, p.y + dy, text, { color, bg, size, alpha, mono });
    },
  };
}

export function pill(ctx, x, y, text, { color = C.text, bg = "rgba(10,16,34,0.85)", size = 26, alpha = 1, mono = false, border = color, align = "center" } = {}) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `600 ${size}px ${mono ? MONO : UI}`;
  const w = ctx.measureText(text).width + size * 1.1;
  const h = size * 1.7;
  const x0 = align === "center" ? x - w / 2 : align === "left" ? x : x - w;
  rr(ctx, x0, y - h / 2, w, h, h / 2);
  ctx.fillStyle = bg; ctx.fill();
  ctx.strokeStyle = border; ctx.globalAlpha = alpha * 0.8; ctx.lineWidth = 2; ctx.stroke();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color; ctx.textBaseline = "middle"; ctx.textAlign = "left";
  ctx.fillText(text, x0 + size * 0.55, y + 1);
  ctx.restore();
}

export function render(ctx, cam, items) {
  const list = items.flat().filter(Boolean).map((d) => ({ d, z: d.depthAt(cam) }));
  list.sort((a, b) => b.z - a.z);
  for (const { d } of list) d.draw(ctx, cam);
}

// ---------- background ----------
let seed = 99;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const dust = Array.from({ length: 160 }, () => [rnd() * 80 - 40, rnd() * 30 - 8, rnd() * 80 - 10, rnd()]);

export function background(ctx, t, tint = C.server) {
  const g = ctx.createRadialGradient(W * 0.5, H * 0.35, 50, W * 0.5, H * 0.5, W * 0.75);
  g.addColorStop(0, C.bg1); g.addColorStop(1, C.bg0);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // a slow drifting camera for the floor and the dust
  const cam = camera([Math.sin(t * 0.07) * 3, 4.5, -18 + Math.sin(t * 0.05) * 2], [0, 1.5, 20], 55);
  ctx.save();
  ctx.lineWidth = 1.2;
  const off = (t * 1.2) % 4;
  for (let i = -15; i <= 15; i++) {
    const a = project(cam, [i * 4, -3, 0]), b = project(cam, [i * 4, -3, 90]);
    if (a && b) { ctx.strokeStyle = "rgba(90,130,255,0.10)"; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
  }
  for (let j = 0; j < 23; j++) {
    const z = j * 4 - off + 2;
    const a = project(cam, [-60, -3, z]), b = project(cam, [60, -3, z]);
    if (a && b) { ctx.strokeStyle = `rgba(90,130,255,${0.13 * (1 - j / 23)})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
  }
  for (const [x, y, z, k] of dust) {
    const p = project(cam, [x, y + Math.sin(t * 0.5 + k * 9) * 0.6, ((z - t * 0.8) % 90 + 90) % 90]);
    if (!p) continue;
    ctx.fillStyle = k > 0.8 ? tint : "rgba(180,200,255,1)";
    ctx.globalAlpha = 0.15 + 0.35 * k;
    ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.6, p.s * 0.06), 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

export function vignette(ctx) {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, W * 0.72);
  g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

// ---------- HUD ----------
// chunked captions: a long caption shows in parts of at most two lines. The voice's sentence
// times (timeline.json, beats[].sentences) say how far the speech is, so a part changes with the voice.
const chunkCache = new Map();
function wrapWords(ctx, words, maxW) {
  const lines = [[]];
  let lw = 0;
  for (const w of words) {
    const ww = ctx.measureText(w + " ").width;
    if (lw + ww > maxW && lines.at(-1).length) { lines.push([]); lw = 0; }
    lines.at(-1).push(w); lw += ww;
  }
  return lines;
}
function captionChunks(ctx, beat, maxW) {
  if (chunkCache.has(beat.id)) return chunkCache.get(beat.id);
  const sents = beat.caption.split(/(?<=[.?!]["”]?)\s+(?=\S)/);
  const chunks = [];
  let cur = "";
  for (const s of sents) {
    const next = cur ? cur + " " + s : s;
    if (cur && wrapWords(ctx, next.split(" "), maxW).length > 2) { chunks.push(cur); cur = s; } else cur = next;
  }
  if (cur) chunks.push(cur);
  let at = 0;
  const out = chunks.map((text) => { const c = { text, from: at, to: at + text.length + 1 }; at += text.length + 1; return c; });
  chunkCache.set(beat.id, out);
  return out;
}
// the share of the beat that the voice has spoken at time t, from 0 to 1
function spoken(beat, t) {
  const ss = beat.sentences;
  if (!ss?.length) return clamp((t - beat.start) / (beat.end - beat.start));
  const rel = t - beat.start;
  const total = ss.reduce((a, s) => a + s.text.length + 1, 0);
  let acc = 0;
  for (const s of ss) {
    if (rel < s.start) return acc / total;
    if (rel <= s.end) return (acc + ((rel - s.start) / Math.max(0.01, s.end - s.start)) * (s.text.length + 1)) / total;
    acc += s.text.length + 1;
  }
  return 1;
}

export function hud(ctx, t, tl, { chip, steps, chunked = false }) {
  const beat = tl.beats.find((b) => t >= b.start - 0.3 && t <= b.end + 0.6);
  // top-left chip
  ctx.save();
  ctx.globalAlpha = smooth(span(t, 0.4, 1.2));
  ctx.font = `600 24px ${UI}`;
  ctx.fillStyle = C.text;
  rr(ctx, 48, 40, 18, 18, 4); ctx.fillStyle = C.server; ctx.fill();
  ctx.fillStyle = C.text; ctx.textBaseline = "middle";
  ctx.fillText(chip, 78, 50);
  // top-right: the tasks this part covers
  const id = beat?.id;
  if (id && steps[id]) {
    const a = smooth(span(t, beat.start - 0.3, beat.start + 0.2)) * (1 - smooth(span(t, beat.end + 0.2, beat.end + 0.6)));
    // a step is a string, or { text, color }
    const st = typeof steps[id] === "string" ? { text: steps[id] } : steps[id];
    pill(ctx, W - 48, 50, st.text, { align: "right", size: 22, alpha: a, color: st.color ?? C.text, border: st.color ?? C.line });
  }
  ctx.restore();

  if (beat && chunked) {
    const a = smooth(span(t, beat.start - 0.25, beat.start + 0.1)) * (1 - smooth(span(t, beat.end + 0.15, beat.end + 0.5)));
    ctx.save();
    ctx.font = `500 32px ${UI}`;
    const maxW = 1400;
    const chunks = captionChunks(ctx, beat, maxW);
    const pos = spoken(beat, t) * beat.caption.length;
    let k = chunks.findIndex((c) => pos < c.to - 1);
    if (k < 0) k = chunks.length - 1;
    const ch = chunks[k];
    // a short fade when the part changes
    const fade = k === 0 ? 1 : smooth(clamp((pos - (ch.from - 1)) / 6));
    ctx.globalAlpha = a * fade;
    const lines = wrapWords(ctx, ch.text.split(" "), maxW);
    const lh = 46;
    const boxH = lines.length * lh + 28;
    const y0 = H - 70 - boxH;
    const widest = Math.max(...lines.map((l) => ctx.measureText(l.join(" ")).width));
    rr(ctx, W / 2 - widest / 2 - 30, y0, widest + 60, boxH, 18);
    ctx.fillStyle = "rgba(6,10,22,0.78)"; ctx.fill();
    let acc = ch.from;
    ctx.textBaseline = "top";
    lines.forEach((l, i) => {
      let x = W / 2 - ctx.measureText(l.join(" ")).width / 2;
      for (const w of l) {
        ctx.fillStyle = pos > acc ? C.text : "rgba(233,238,248,0.45)";
        ctx.fillText(w, x, y0 + 14 + i * lh);
        x += ctx.measureText(w + " ").width;
        acc += w.length + 1;
      }
    });
    ctx.restore();
  }

  // captions with a soft word-by-word highlight
  if (beat && !chunked) {
    const a = smooth(span(t, beat.start - 0.25, beat.start + 0.1)) * (1 - smooth(span(t, beat.end + 0.15, beat.end + 0.5)));
    const words = beat.caption.split(" ");
    const total = words.reduce((s, w) => s + w.length + 1, 0);
    const prog = clamp((t - beat.start) / (beat.end - beat.start)) * total;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.font = `500 32px ${UI}`;
    const maxW = 1400;
    const lines = [[]];
    let lw = 0;
    for (const w of words) {
      const ww = ctx.measureText(w + " ").width;
      if (lw + ww > maxW && lines.at(-1).length) { lines.push([]); lw = 0; }
      lines.at(-1).push(w); lw += ww;
    }
    const lh = 46;
    const boxH = lines.length * lh + 28;
    const y0 = H - 70 - boxH;
    const widest = Math.max(...lines.map((l) => ctx.measureText(l.join(" ")).width));
    rr(ctx, W / 2 - widest / 2 - 30, y0, widest + 60, boxH, 18);
    ctx.fillStyle = "rgba(6,10,22,0.72)"; ctx.fill();
    let acc = 0;
    ctx.textBaseline = "top";
    lines.forEach((l, i) => {
      let x = W / 2 - ctx.measureText(l.join(" ")).width / 2;
      for (const w of l) {
        const lit = prog > acc;
        ctx.fillStyle = lit ? C.text : "rgba(233,238,248,0.45)";
        ctx.fillText(w, x, y0 + 14 + i * lh);
        x += ctx.measureText(w + " ").width;
        acc += w.length + 1;
      }
    });
    ctx.restore();
  }

  // progress bar
  ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.fillRect(0, H - 6, W, 6);
  const pg = ctx.createLinearGradient(0, 0, W, 0);
  pg.addColorStop(0, C.server); pg.addColorStop(1, C.action);
  ctx.fillStyle = pg; ctx.fillRect(0, H - 6, (W * t) / tl.duration, 6);
}
