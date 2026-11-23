"""Build the cover's looping background video and its poster from Robert's raw footage.

Four shots, about 3 s each, every one framed so its subject sits on the right (the title lives
on the navy fade at left):
  1. Tatay's profile, tight, eyes on the sea      New video clip/20261122_165710  (60p, half speed)
  2. a banca heading out to sea                   New video clip/20261122_163055  (60p, half speed)
  3. the fisherman standing at the stern at sea   last_clip                       (30p, real time)
  4. over his shoulder: FishPin navigating        overhead_shot                   (30p, real time)
They cross-dissolve into each other, and the last shot dissolves back into the face. The file
starts just after that last dissolve, so its end runs straight into its first frame and the
loop has no visible jump.

Output: assets/video/cover-tatay.mp4  (1080p H.264, 12 s per loop)
        assets/video/cover-tatay.jpg  the loop's first frame, used as the poster in still mode
                                      (print, ?static=1, reduced motion) and while the video loads.

Run: python scripts/build_cover_video.py   (needs: pip install imageio-ffmpeg)
"""
import subprocess
import sys
from pathlib import Path

import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
RAW = Path.home() / "OneDrive" / "Pictures" / "Raw videos"
OUT = ROOT / "assets" / "video"
FF = imageio_ffmpeg.get_ffmpeg_exe()

XFADE = 0.6  # seconds of cross-dissolve, in output time
# file, source start/end (s), slow-down factor, crop (zoom, left, top as fractions of the 4K frame)
FACE = dict(src="New video clip/20261122_165710.mp4", start=0.0, end=1.8, slow=2.0, crop=(1.0, 0.0, 0.0))
SHOTS = [
    dict(src="New video clip/20261122_163055.mp4", start=6.2, end=8.0, slow=2.0, crop=(1.15, 0.064, 0.09)),
    dict(src="last_clip.mp4", start=0.3, end=3.9, slow=1.0, crop=(1.3, 0.0, 0.13)),
    dict(src="overhead_shot.mp4", start=0.0, end=3.6, slow=1.0, crop=(1.25, 0.028, 0.15)),
]


def main() -> None:
    head = XFADE / FACE["slow"]  # source seconds of the face that sit inside the closing dissolve
    # play order: the face after its first `head` s, the other shots, then the face's first
    # `head` s, which the closing dissolve consumes entirely
    segs = [dict(FACE, start=FACE["start"] + head)] + SHOTS + [dict(FACE, end=FACE["start"] + head)]
    args, graph, lengths = [], [], []
    for i, s in enumerate(segs):
        src = RAW / s["src"]
        if not src.exists():
            sys.exit(f"missing raw clip: {src}")
        args += ["-ss", f"{s['start']:.3f}", "-t", f"{s['end'] - s['start'] + 0.3:.3f}", "-i", str(src)]
        length = (s["end"] - s["start"]) * s["slow"]
        zoom, left, top = s["crop"]
        # fps comes last: xfade needs a constant frame rate, and setpts clears it
        graph.append(f"[{i}:v]crop=w=iw/{zoom}:h=ih/{zoom}:x=iw*{left}:y=ih*{top},"
                     f"scale=1920:1080:flags=lanczos,setpts={s['slow']}*(PTS-STARTPTS),"
                     f"trim=duration={length:.4f},settb=AVTB,fps=30000/1001,format=yuv420p[s{i}]")
        lengths.append(length)
    prev, total = "s0", lengths[0]
    for i in range(1, len(segs)):
        offset = total - XFADE
        graph.append(f"[{prev}][s{i}]xfade=transition=fade:duration={XFADE}:offset={offset:.4f}[x{i}]")
        prev, total = f"x{i}", offset + lengths[i]
    OUT.mkdir(parents=True, exist_ok=True)
    proc = subprocess.run([FF, "-hide_banner", "-y", *args, "-filter_complex", ";".join(graph),
                           # sea ripples are costly to encode; cap the rate so the deck stays light
                           "-map", f"[{prev}]", "-an", "-c:v", "libx264", "-crf", "24", "-maxrate", "4.5M",
                           "-bufsize", "9M", "-preset", "slow", "-profile:v", "high", "-pix_fmt", "yuv420p",
                           "-movflags", "+faststart", str(OUT / "cover-tatay.mp4")], capture_output=True, text=True)
    if proc.returncode != 0:
        sys.exit(proc.stderr[-2000:])
    subprocess.run([FF, "-v", "error", "-y", "-i", str(OUT / "cover-tatay.mp4"), "-frames:v", "1", "-q:v", "3",
                    str(OUT / "cover-tatay.jpg")], check=True)
    print(f"loop length {total:.2f} s")
    for name in ("cover-tatay.mp4", "cover-tatay.jpg"):
        print(f"wrote assets/video/{name} ({(OUT / name).stat().st_size / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
