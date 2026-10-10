# Local neural voice for audio.mjs, used when narration.json says "engine": "kokoro".
# For each beat it writes out/<name>/<id>.wav and <id>.sent.json (sentence times in seconds).
# Each sentence is made on its own, so the sentence times are exact.
# Usage: python -I kokoro_tts.py <narration.json> <out dir> [force]
import json
import os
import re
import shutil
import sys
import tempfile

here = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(here, "pylib-kokoro"))

import espeakng_loader  # noqa: E402
import numpy as np  # noqa: E402
import soundfile as sf  # noqa: E402
from kokoro_onnx import Kokoro  # noqa: E402
from kokoro_onnx.config import EspeakConfig  # noqa: E402

cfg_path, out, force = sys.argv[1], sys.argv[2], len(sys.argv) > 3
cfg = json.load(open(cfg_path, encoding="utf-8"))
voice = cfg.get("kokoroVoice", "af_heart")
speed = float(cfg.get("kokoroSpeed", 1.0))

beats = [b for b in cfg["beats"] if force or not os.path.exists(os.path.join(out, b["id"] + ".wav"))]
if not beats:
    sys.exit(0)

# espeak-ng cannot open a data folder whose path has non-ASCII letters, so it runs from a copy in the temp folder
src = os.path.dirname(espeakng_loader.__file__)
dst = os.path.join(tempfile.gettempdir(), "espeakng-kokoro")
if not os.path.exists(os.path.join(dst, "espeak-ng-data", "phontab")):
    shutil.copytree(src, dst, dirs_exist_ok=True)
espeak = EspeakConfig(lib_path=os.path.join(dst, "espeak-ng.dll"), data_path=os.path.join(dst, "espeak-ng-data"))
k = Kokoro(os.path.join(here, "models", "kokoro-v1.0.onnx"), os.path.join(here, "models", "voices-v1.0.bin"), espeak_config=espeak)

PAUSE = 0.32  # seconds between two sentences


def trim(x, sr, thr=0.004):
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0:
        return x
    a = max(0, idx[0] - int(0.01 * sr))
    b = min(len(x), idx[-1] + int(0.06 * sr))
    return x[a:b]


for b in beats:
    sents = [s for s in re.split(r"(?<=[.?!])\s+", b["text"].strip()) if s]
    parts, times, t = [], [], 0.0
    sr = 24000
    for i, s in enumerate(sents):
        x, sr = k.create(s, voice=voice, speed=speed, lang="en-us")
        x = trim(np.asarray(x, dtype=np.float32), sr)
        d = len(x) / sr
        times.append({"text": s, "start": round(t, 3), "end": round(t + d, 3)})
        parts.append(x)
        t += d
        if i < len(sents) - 1:
            parts.append(np.zeros(int(PAUSE * sr), dtype=np.float32))
            t += PAUSE
    sf.write(os.path.join(out, b["id"] + ".wav"), np.concatenate(parts), sr, subtype="PCM_16")
    json.dump(times, open(os.path.join(out, b["id"] + ".sent.json"), "w", encoding="utf-8"), indent=1)
    print(b["id"], round(t, 2), "s", flush=True)
