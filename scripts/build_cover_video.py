"""Build the cover's looping background video and its poster from the raw clip.

Source: Tatay's profile close-up, 4K 60p, 6 s (the shot that opens the AVP).
Output: assets/video/cover-tatay.mp4  1080p H.264, half speed, played forward then
        backward so the loop has no visible jump (about 24 s per loop).
        assets/video/cover-tatay.jpg  the loop's first frame, used as the poster in
        still mode (print, ?static=1, reduced motion) and while the video loads.

Run: python scripts/build_cover_video.py   (needs: pip install imageio-ffmpeg)
"""
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
RAW = Path.home() / "OneDrive" / "Pictures" / "Raw videos" / "New video clip" / "20261122_165710.mp4"
OUT = ROOT / "assets" / "video"
FF = imageio_ffmpeg.get_ffmpeg_exe()


def run(*args: str) -> str:
    proc = subprocess.run([FF, "-hide_banner", "-y", *args], capture_output=True, text=True)
    if proc.returncode != 0:
        sys.exit(proc.stderr[-2000:])
    return proc.stderr


def main() -> None:
    if not RAW.exists():
        sys.exit(f"missing raw clip: {RAW}")
    OUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        fwd = Path(tmp) / "fwd.mp4"
        # 1. 4K 60p -> 1080p, half speed (every source frame kept, 29.97 fps), near-lossless
        run("-i", str(RAW), "-an",
            "-vf", "scale=1920:1080:flags=lanczos,setpts=2.0*PTS,fps=30000/1001",
            "-c:v", "libx264", "-crf", "10", "-preset", "medium", "-pix_fmt", "yuv420p", str(fwd))
        frames = int(re.findall(r"frame=\s*(\d+)", run("-i", str(fwd), "-map", "0:v", "-f", "null", "-"))[-1])
        # 2. ping-pong: frames 0..N-1 then N-2..1, so the loop point repeats no frame
        run("-i", str(fwd), "-an", "-filter_complex",
            f"[0:v]split[a][b];[b]reverse,trim=start_frame=1:end_frame={frames - 1},setpts=PTS-STARTPTS[r];"
            "[a][r]concat=n=2:v=1:a=0[v]",
            "-map", "[v]", "-c:v", "libx264", "-crf", "23", "-preset", "slow", "-profile:v", "high",
            "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(OUT / "cover-tatay.mp4"))
    run("-i", str(OUT / "cover-tatay.mp4"), "-frames:v", "1", "-q:v", "3", str(OUT / "cover-tatay.jpg"))
    for name in ("cover-tatay.mp4", "cover-tatay.jpg"):
        print(f"wrote assets/video/{name} ({(OUT / name).stat().st_size / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
