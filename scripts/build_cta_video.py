"""Build the closing slide's looping background from the national AVP's call-to-action shot.

The AVP (fishpin-brand/17-yfc-national-avp, edit list 15-video/src/avpnat/edl.json) ends its story on
avpnat/clips/20261122-162004.mp4 from 12 s: a lone banca on open sea, under the call to action
"Sama-sama nating itaas ang antas ng pangingisda sa Pilipinas." This takes the same steady 12 to
18.5 s and turns it into a seamless loop: the clip's last second cross-dissolves into its first, and
the file starts just after that, so its end runs straight into its first frame.

The AVP's golden grade (CSS: sepia(.24) saturate(1.28) contrast(1.06) brightness(1.04)) is baked into
the file through scripts/golden.cube, a 3D LUT of that filter captured from Chrome (the AVP renders in
Chrome too), so the slide does not filter a 1080p video on every frame.

Output: assets/video/cta-sea.mp4  (1080p H.264, 5.5 s per loop)
        assets/video/cta-sea.jpg  the loop's first frame, the poster in still mode and while loading

Run: python scripts/build_cta_video.py   (needs: pip install imageio-ffmpeg)
"""
import subprocess
import sys
from pathlib import Path

import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
SRC = Path.home() / "OneDrive" / "Documents" / "fishpin-brand" / "15-video" / "public" / "avpnat" / "clips" / "20261122-162004.mp4"
OUT = ROOT / "assets" / "video"
FF = imageio_ffmpeg.get_ffmpeg_exe()

START, END = 12.0, 18.5  # the AVP's shot (edl.json: from 12, steady after the opening pan)
XFADE = 1.0              # seconds of cross-dissolve that close the loop

LUT = "scripts/golden.cube"  # the AVP grade as Chrome draws it (scripts/make_golden_lut.mjs)


def main() -> None:
    if not SRC.exists():
        sys.exit(f"missing AVP clip: {SRC}")
    length = END - START
    # [body] is the shot after its first XFADE seconds; [head] is those first seconds, dissolved in at the end
    # fps comes last in each branch: xfade needs a constant frame rate, and setpts clears it
    graph = (
        f"[0:v]scale=1920:1080:flags=lanczos,format=yuv420p,split[a][b];"
        f"[a]trim=start={XFADE}:duration={length - XFADE},setpts=PTS-STARTPTS,settb=AVTB,fps=30[body];"
        f"[b]trim=start=0:duration={XFADE},setpts=PTS-STARTPTS,settb=AVTB,fps=30[head];"
        f"[body][head]xfade=transition=fade:duration={XFADE}:offset={length - 2 * XFADE},format=gbrp,lut3d=file={LUT}:interp=tetrahedral,format=yuv420p[loop]"
    )
    OUT.mkdir(parents=True, exist_ok=True)
    mp4 = OUT / "cta-sea.mp4"
    proc = subprocess.run([FF, "-hide_banner", "-y", "-ss", f"{START}", "-t", f"{length + 0.2}", "-i", str(SRC),
                           "-filter_complex", graph, "-map", "[loop]", "-an",
                           # sea ripples are costly to encode; cap the rate so the deck stays light
                           "-c:v", "libx264", "-crf", "24", "-maxrate", "4.5M", "-bufsize", "9M", "-preset", "slow",
                           "-profile:v", "high", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(mp4)],
                          capture_output=True, text=True, cwd=ROOT)
    if proc.returncode != 0:
        sys.exit(proc.stderr[-2000:])
    subprocess.run([FF, "-v", "error", "-y", "-i", str(mp4), "-frames:v", "1", "-q:v", "3", str(OUT / "cta-sea.jpg")], check=True)
    print(f"loop length {length - XFADE:.2f} s")
    for name in ("cta-sea.mp4", "cta-sea.jpg"):
        print(f"wrote assets/video/{name} ({(OUT / name).stat().st_size / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
