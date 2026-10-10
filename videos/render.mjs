// Renders one exercise video: 1920x1080, 60 fps, frames piped to ffmpeg with the soundtrack.
// Usage:
//   node render.mjs exercise-8                 full MP4 (run audio.mjs first)
//   node render.mjs exercise-8 --stills 5,20   PNG stills at those seconds
import { createCanvas } from "@napi-rs/canvas";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { W, H, background, vignette, hud, smooth, clamp } from "./engine.mjs";

const require = createRequire(import.meta.url);
const ffmpeg = require("ffmpeg-static");
const here = path.dirname(fileURLToPath(import.meta.url));
const name = process.argv[2] ?? "exercise-8";
const stillsArg = process.argv.indexOf("--stills");
const out = path.join(here, "out", name);
const tl = JSON.parse(fs.readFileSync(path.join(out, "timeline.json"), "utf8"));
const mod = await import(`./${name}/scene.mjs`);

const FPS = 60;
const XF = 0.35; // crossfade half-width in seconds

// scene windows: each beat owns the time from the middle of the gap before it to the middle of the gap after it
const bounds = [0];
for (let i = 1; i < tl.beats.length; i++) bounds.push((tl.beats[i - 1].end + tl.beats[i].start) / 2);
bounds.push(tl.duration);
const windows = tl.beats.map((b, i) => ({ id: b.id, from: bounds[i], to: bounds[i + 1], sp: b.start - bounds[i], se: b.end - bounds[i] }));

const canvas = createCanvas(W, H);
const ctx = canvas.getContext("2d");
const layer = createCanvas(W, H);
const lctx = layer.getContext("2d");

function frame(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  background(ctx, t);
  windows.forEach((w, i) => {
    if (t < w.from - XF || t > w.to + XF) return;
    const fadeIn = i === 0 ? 1 : smooth((t - (w.from - XF)) / (2 * XF));
    const fadeOut = i === windows.length - 1 ? 1 : 1 - smooth((t - (w.to - XF)) / (2 * XF));
    const a = Math.min(fadeIn, fadeOut);
    if (a <= 0.001) return;
    lctx.setTransform(1, 0, 0, 1, 0, 0);
    lctx.globalAlpha = 1;
    lctx.clearRect(0, 0, W, H);
    mod.scenes[w.id](lctx, { lt: t - w.from, len: w.to - w.from, sp: w.sp, se: w.se, t });
    ctx.globalAlpha = a;
    ctx.drawImage(layer, 0, 0);
    ctx.globalAlpha = 1;
  });
  vignette(ctx);
  hud(ctx, t, tl, { chip: mod.chip, steps: mod.steps, chunked: !!mod.chunked });
  const end = clamp((t - (tl.duration - 0.8)) / 0.8);
  if (end > 0) { ctx.fillStyle = `rgba(3,5,10,${end})`; ctx.fillRect(0, 0, W, H); }
}

if (stillsArg > 0) {
  const dir = path.join(out, "stills");
  fs.mkdirSync(dir, { recursive: true });
  for (const s of process.argv[stillsArg + 1].split(",").map(Number)) {
    frame(s);
    const f = path.join(dir, `t${String(s).padStart(5, "0")}.png`);
    fs.writeFileSync(f, canvas.toBuffer("image/png"));
    console.log(f);
  }
  process.exit(0);
}

const frames = Math.round(tl.duration * FPS);
const mp4 = path.join(out, `${name}.mp4`);
const ff = spawn(ffmpeg, [
  "-y", "-v", "error",
  "-f", "rawvideo", "-pix_fmt", "rgba", "-s", `${W}x${H}`, "-r", String(FPS), "-i", "-",
  "-i", path.join(out, "audio.wav"),
  "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", String(FPS),
  "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", mp4,
], { stdio: ["pipe", "inherit", "inherit"] });

const t0 = Date.now();
for (let f = 0; f < frames; f++) {
  frame(f / FPS);
  if (!ff.stdin.write(canvas.data())) await new Promise((r) => ff.stdin.once("drain", r));
  if (f % 300 === 0) console.log(`frame ${f}/${frames}  ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}
ff.stdin.end();
await new Promise((r) => ff.on("close", r));
console.log("wrote", mp4, `in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
