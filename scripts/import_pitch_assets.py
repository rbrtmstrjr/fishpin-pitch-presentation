"""Copy and prepare the FishPin Pitch 2026 visuals the static slides use.

Reads (never writes) fishpin-brand/15-video/public. Writes assets/pitch/:
  phone-*.png   the video's 1310x2708 phone mockups at half size (transparent around the phone)
  phone-anchor/guide/login/eta.png  bare app captures set into the phone frame the same way
                the video's <Framed> does (screen outline from video/src/pitch5/screen-shape.json)
  still-*.jpg   footage stills for photo slides (the hook one in black and white)
  award.png, play-icon.png (the handheld GPS is assets/pitch/gps-handheld.svg, drawn unbranded:
                no competitor logos on the slides)

Run: python scripts/import_pitch_assets.py   (needs Pillow and imageio-ffmpeg)
"""
import json
import subprocess
from pathlib import Path

import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageEnhance, ImageOps

ROOT = Path(__file__).resolve().parents[1]
PUB = Path.home() / "OneDrive" / "Documents" / "fishpin-brand" / "15-video" / "public"
OUT = ROOT / "assets" / "pitch"
SHAPE = json.loads((ROOT / "video" / "src" / "pitch5" / "screen-shape.json").read_text(encoding="utf-8"))
FF = imageio_ffmpeg.get_ffmpeg_exe()
HALF = (655, 1354)
OPEN = {"x": 49, "y": 42, "w": 1209}            # demo.tsx OPEN, mockup px
ISLAND = {"x": 469, "y": 87, "w": 372, "h": 107}  # demo.tsx ISLAND

MOCKUPS = ["chart", "map", "navigate", "score-90", "score-40", "sos", "trail"]
FRAMED = {  # name: (base mockup, capture, shift, fill)
    "anchor": ("sos.png", "pitch/shots/anchor.png", 46, "#FFFFFF"),
    "guide": ("sos.png", "pitch5/img/guide-grid.png", 46, "#EEF4FB"),
    "login": ("sos.png", "pitch5/img/login-sign-in.png", 0, "#EEF4FB"),
    "eta": ("navigate.png", "mockups/screen-navigate-eta-speed.png", 46, "#FFFFFF"),
}
STILLS = {  # name: (clip, second, black and white)
    "hook": ("pitch5/clips/1-dead-spot.mp4", 2.0, True),
    "beach": ("pitch5/clips/broll-bancas-beach.mp4", 2.0, False),
    "moored": ("pitch5/clips/broll-bancas-moored.mp4", 2.5, False),
    "lookout": ("pitch5/clips/9-ask-lookout.mp4", 2.0, False),
}


def save_half(im: Image.Image, name: str) -> None:
    im.resize(HALF, Image.LANCZOS).save(OUT / f"{name}.png", optimize=True)
    print(f"write assets/pitch/{name}.png")


def framed(base: str, capture: str, shift: int, fill: str) -> Image.Image:
    phone = Image.open(PUB / "mockups" / base).convert("RGBA")
    mask = Image.new("L", phone.size, 0)
    ImageDraw.Draw(mask).polygon([tuple(p) for p in SHAPE["points"]], fill=255)
    screen = Image.new("RGBA", phone.size, fill)
    shot = Image.open(PUB / capture).convert("RGBA")
    w = OPEN["w"]
    shot = shot.resize((w, round(w * 2400 / 1080)), Image.LANCZOS)
    screen.alpha_composite(shot, (OPEN["x"], OPEN["y"] + shift))
    phone.paste(screen, (0, 0), mask)
    i = ISLAND
    ImageDraw.Draw(phone).rounded_rectangle([i["x"], i["y"], i["x"] + i["w"], i["y"] + i["h"]], radius=i["h"] // 2, fill="#000000")
    return phone


def still(clip: str, second: float, bw: bool, name: str) -> None:
    raw = OUT / f".{name}.png"
    subprocess.run([FF, "-v", "error", "-y", "-ss", f"{second}", "-i", str(PUB / clip), "-frames:v", "1",
                    "-vf", "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080", str(raw)], check=True)
    im = Image.open(raw).convert("RGB")
    if bw:
        im = ImageEnhance.Contrast(ImageOps.grayscale(im).convert("RGB")).enhance(1.15)
    im.save(OUT / f"still-{name}.jpg", quality=84, optimize=True, progressive=True)
    raw.unlink()
    print(f"write assets/pitch/still-{name}.jpg")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for m in MOCKUPS:
        save_half(Image.open(PUB / "mockups" / f"{m}.png").convert("RGBA"), f"phone-{m}")
    for name, args in FRAMED.items():
        save_half(framed(*args), f"phone-{name}")
    for name, args in STILLS.items():
        still(*args, name)
    award = Image.open(PUB / "pitch5" / "img" / "fishpin_maestro_robert.png").convert("RGBA")
    award.resize((540, 675), Image.LANCZOS).save(OUT / "award.png", optimize=True)
    Image.open(PUB / "pitch" / "play-store-icon-512.png").resize((160, 160), Image.LANCZOS).save(OUT / "play-icon.png", optimize=True)
    print("write assets/pitch/award.png, play-icon.png")


if __name__ == "__main__":
    main()
