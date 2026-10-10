# Exercise videos

Each video is a 1920x1080, 60 fps MP4 for one exercise. A JavaScript renderer draws every frame on a canvas with a small 3D engine. A female neural voice reads the narration, and a synthesized lofi loop plays under it.

This folder is separate from the Next.js app. It has its own `package.json`, and the app does not import it.

## Files

- `engine.mjs`: the camera, the 3D projection, textured planes, shaded boxes, the background and the captions.
- `widgets.mjs`: browser windows, code cards and terminals, drawn into textures.
- `audio.mjs`: makes one voice clip per narration line, the music, and the mix. It also writes `timeline.json`, so the scenes start on the narration.
- `kokoro_tts.py`: the local voice. `audio.mjs` uses it when `narration.json` has `"engine": "kokoro"`. See "The local voice".
- `render.mjs`: draws the frames and pipes them to ffmpeg.
- `exercise-8/narration.json`: the narration text, the captions and the voice.
- `exercise-8/scene.mjs`: one scene per narration line.
- `exercise-8-solution/`: the second video, a walk through the solution of Exercise 8 (see below).

## Make a video

You need Node.js and Python. The voice uses the `edge-tts` package, which sends the narration text to the Microsoft Edge read-aloud service. So you need a network connection.

1. Run `npm install` in this folder.
2. Run `python -m pip install --target pylib edge-tts`.
3. Run `node audio.mjs exercise-8`. It writes `out/exercise-8/audio.wav` and `out/exercise-8/timeline.json`.
4. Run `node render.mjs exercise-8`. It writes `out/exercise-8/exercise-8.mp4`. This takes about ten minutes.

To check the layout without a full render, run `node render.mjs exercise-8 --stills 5,20,40`. It writes PNG frames at those seconds to `out/exercise-8/stills/`.

If you change the narration, run step 3 with `FORCE_TTS=1`, so that the voice clips are made again.

The renderer uses the Segoe UI and Cascadia Code fonts from `C:/Windows/Fonts`. On another system, change the paths at the top of `engine.mjs`.

## Exercise 8 solution video

`exercise-8-solution/` is a second video, about 2.9 minutes, that walks through `app/exercises/8/solution/dashboard/` task by task. Each beat shows a code card with lines copied from the solution, a highlight that follows the narration, and the result in the dashboard browser window. The card color tells the kind of file: blue for no directive, orange for `"use client"`, purple for `"use server"`.

- `exercise-8-solution/narration.json`: 12 beats (intro, Tasks 1-2, 3-4, 5, 6, 7, 8, 9, 10, 11 twice, the wrap-up).
- `exercise-8-solution/scene.mjs`: the scenes and the code cards. A highlight or a change in the browser window is timed with a phrase of the narration text, so a change of the narration moves it too.
- `exercise-8-solution/dash.mjs`: the textures. The browser window (dark and light, from `theme.css`), the file rows and the code card.

To build it:

1. `FORCE_TTS=1 node audio.mjs exercise-8-solution`. It writes `out/exercise-8-solution/audio.wav` and `timeline.json`. The timeline also has the sentence times of each beat, which `scene.mjs` reads.
2. `node render.mjs exercise-8-solution --stills 20,60,100` to check the layout, then `node render.mjs exercise-8-solution` for the MP4. It takes about 7 minutes.
3. Copy `out/exercise-8-solution/exercise-8-solution.mp4` to `videos/exercise-8-solution.mp4`.

`scene.mjs` prints `WIDE` for a code line that is too long for its card. Cut the line or use `…`.

## Exercise 11 video

`exercise-11/` is one video, about 5.7 minutes, from the setup to the last check of Exercise 11. Each task shows what you do and then the answer. The tag at the top center says which: YOUR TURN (yellow) or SOLUTION (green). The texts on the cards come from `app/exercises/11/` (`README.md`, `draft/`, `solution/`, `transcript.txt`) and from the recorded outputs in `docs/errors/exercise-11-*.txt`.

- `exercise-11/narration.json`: 17 beats (intro, setup, the claim, Predict, Task 1 twice, Tasks 2 and 3, Task 4 twice, Task 5 four times, Tasks 6 and 7, Prove it).
- `exercise-11/scene.mjs`: the scenes. It reuses `codeCard2`, `hlWeights` and `checkWidth` from `exercise-8-solution/dash.mjs`.
- `exercise-11/tex.mjs`: the textures. The demo app in a browser, the transcript, Markdown cards, the build pipeline and the tables.

The captions of this video show at most two lines at a time, in step with the voice (`export const chunked = true` in `scene.mjs`). The Exercise 8 videos keep the full caption.

To build it:

1. `FORCE_TTS=1 node audio.mjs exercise-11`. It writes `out/exercise-11/audio.wav` and `timeline.json`.
2. `node render.mjs exercise-11 --stills 30,120,250` to check the layout, then `node render.mjs exercise-11` for the MP4. It takes about 15 minutes.
3. Copy `out/exercise-11/exercise-11.mp4` to `videos/exercise-11.mp4`.

## The local voice

On 2026-10-10 the Microsoft Edge read-aloud service refused every request with HTTP 403, also with the newest `edge-tts` (7.2.8). So the Exercise 11 video uses Kokoro, a neural voice that runs on this computer. The voice is `af_heart`, a female American voice. It is not the Ava voice of the Exercise 8 videos.

To set it up:

1. Run `python -m pip install --target pylib-kokoro kokoro-onnx soundfile`.
2. Download `kokoro-v1.0.onnx` and `voices-v1.0.bin` from the `model-files-v1.0` release of `thewh1teagle/kokoro-onnx` on GitHub into `models/`. The two files are about 350 MB. Git ignores `models/` and `pylib-kokoro/`.

`kokoro_tts.py` makes each sentence on its own, so the sentence times in `timeline.json` are exact. espeak-ng cannot open a folder whose path has non-ASCII letters, so the script copies its data to the temp folder first.

To go back to Ava, remove `"engine": "kokoro"` from `narration.json`. In the voice text, write words letter by letter where the voice reads them wrong: `N P M`, `N P X`, `T S C`, and `ay sink` for "async".
