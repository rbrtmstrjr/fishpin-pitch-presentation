"""Bring brand assets and pinned libraries into the FishPin deck.

Run from the deck root:  python scripts/import_assets.py

Reads (never writes) the brand kit, the YFC awarding photos and this repo's old
photo. Every output is overwritten, so re-running is safe. Needs internet once,
for the library and icon downloads from cdn.jsdelivr.net.
"""
from __future__ import annotations

import json
import re
import shutil
import sys
import urllib.request
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
KIT = Path.home() / "OneDrive" / "Documents" / "fishpin-brand"
AWARD = KIT / "16-yfc-awarding" / "final"
SHOTS = KIT / "09-screenshots" / "light"
FONTS = KIT / "04-typography" / "fonts"

VENDOR = {
    "vendor/reveal/reveal.js": "https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.js",
    "vendor/reveal/reveal.css": "https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.css",
    "vendor/reveal/notes.js": "https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/plugin/notes/notes.js",
    "vendor/gsap/gsap.min.js": "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js",
}
ICON_URL = "https://cdn.jsdelivr.net/npm/lucide-static@0.462.0/icons/{}.svg"
ICONS = [
    "award", "wallet", "wifi-off", "map", "map-pin", "route", "anchor", "scan-line", "siren",
    "plane", "check", "cloud-off", "waves", "users", "star", "rocket", "calendar", "megaphone",
    "printer", "arrow-right", "shield-check", "trending-up", "book-open", "house", "smartphone",
    "circle-alert",
]
COPY = {
    "brand/logo/fishpin-horizontal-dark.svg": KIT / "01-logo/logo-dark-background/fishpin-horizontal.svg",
    "brand/logo/fishpin-horizontal-light.svg": KIT / "01-logo/logo-light-background/fishpin-horizontal.svg",
    "brand/logo/fishpin-mark-dark.svg": KIT / "01-logo/logo-dark-background/fishpin-mark.svg",
    "brand/mascots/map.svg": KIT / "05-mascots/svg/map.svg",
    "brand/mascots/storm_bouya.svg": KIT / "05-mascots/svg/storm_bouya.svg",
    "brand/mascots/boat_side.svg": KIT / "05-mascots/svg/boat_side.svg",
    "brand/fonts/Poppins_400Regular.ttf": FONTS / "Poppins_400Regular.ttf",
    "brand/fonts/Poppins_500Medium.ttf": FONTS / "Poppins_500Medium.ttf",
    "brand/fonts/Poppins_600SemiBold.ttf": FONTS / "Poppins_600SemiBold.ttf",
    "brand/fonts/Poppins_700Bold.ttf": FONTS / "Poppins_700Bold.ttf",
    "brand/fonts/IBMPlexMono_500Medium.ttf": FONTS / "IBMPlexMono_500Medium.ttf",
    "brand/fonts/IBMPlexMono_600SemiBold.ttf": FONTS / "IBMPlexMono_600SemiBold.ttf",
    "brand/fonts/OFL-Poppins.txt": FONTS / "OFL-Poppins.txt",
    "brand/fonts/OFL-IBM-Plex-Mono.txt": FONTS / "OFL-IBM-Plex-Mono.txt",
}
CONTOUR_SRC = KIT / "07-textures/contour-lines/contour-lines-transparent-light-lines.svg"
CONTOUR_DST = "brand/texture/contour.svg"
CONTOUR_STROKE = "#7DC3FF"
HERO_SRC, HERO_DST, HERO_WIDTH = KIT / "13-website/hero-phones.png", "brand/hero-phones.png", 1100
SCREENS = {
    "screens/map-nautical.png": "03-map/04-map-nautical-idle.png",
    "screens/navigate.png": "05-navigate/03-navigate.png",
    "screens/trip.png": "04-trail-recording/04-recording-card.png",
    "screens/anchor-armed.png": "11-anchor-watch/06-anchor-armed.png",
    "screens/scan-result.png": "07-fish-guide-and-scan/17-scan-result.png",
    "screens/sos.png": "10-emergency-sos/01-sos-top.png",
}
SCREEN_WIDTH = 720
PHOTOS = {
    "photos/phone-splash.jpg": AWARD / "Maestro_Robert_YFC_Photo1.jpg",
    "photos/robert-and-fisherman.jpg": AWARD / "Maestro_Robert_YFC_Photo2.jpg",
    "photos/showing-the-app.jpg": AWARD / "Maestro_Robert_YFC_Photo3.jpg",
    "photos/robert-portrait.jpg": AWARD / "Maestro_Robert_YFC_Photo4.jpg",
    "photos/dusk-banca.jpg": ROOT / "assets/problem/3.jpg",
}
PHOTO_MAX = 1920


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "deck-asset-import"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        if resp.status != 200:
            raise RuntimeError(f"{url} returned HTTP {resp.status}")
        return resp.read()


def out(rel: str) -> Path:
    path = ASSETS / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


def source_ready(src: Path, dst: Path) -> bool:
    """True if src exists. If src is gone but dst was imported before, keep dst."""
    if src.exists():
        return True
    if dst.exists():
        print(f"keep  {dst.relative_to(ROOT)} (source gone: {src})")
        return False
    sys.exit(f"missing source: {src}")


def main() -> None:
    for rel, url in VENDOR.items():
        out(rel).write_bytes(fetch(url))
        print(f"fetch {rel}")

    icons = {}
    for name in ICONS:
        svg = fetch(ICON_URL.format(name)).decode("utf-8")
        svg = re.sub(r"<!--.*?-->", "", svg, flags=re.S)
        svg = re.sub(r"\s+", " ", svg).strip().replace("> <", "><")
        svg = re.sub(r'\s(?:width|height)="24"', "", svg)
        icons[name] = svg
    out("icons.js").write_text(
        "/* Lucide icons (lucide-static 0.462.0, ISC licence). Generated by scripts/import_assets.py */\n"
        "window.ICONS = " + json.dumps(icons, indent=0) + ";\n",
        encoding="utf-8",
    )
    print(f"write icons.js ({len(icons)} icons)")

    for rel, src in COPY.items():
        dst = out(rel)
        if source_ready(src, dst):
            shutil.copyfile(src, dst)
            print(f"copy  {rel}")

    svg = CONTOUR_SRC.read_text(encoding="utf-8")
    svg = re.sub(r'stroke="[^"]+"', f'stroke="{CONTOUR_STROKE}"', svg)
    svg = re.sub(r"stroke:\s*[^;\"]+", f"stroke:{CONTOUR_STROKE}", svg)
    if CONTOUR_STROKE not in svg:
        svg = svg.replace("<svg ", f'<svg stroke="{CONTOUR_STROKE}" fill="none" ', 1)
    out(CONTOUR_DST).write_text(svg, encoding="utf-8")
    print(f"write {CONTOUR_DST}")

    hero = Image.open(HERO_SRC)
    hero = hero.resize((HERO_WIDTH, round(hero.height * HERO_WIDTH / hero.width)), Image.LANCZOS)
    hero.save(out(HERO_DST), optimize=True)
    print(f"write {HERO_DST}")

    for rel, shot in SCREENS.items():
        img = Image.open(SHOTS / shot).convert("RGB")
        img = img.resize((SCREEN_WIDTH, round(img.height * SCREEN_WIDTH / img.width)), Image.LANCZOS)
        img.save(out(rel), optimize=True)
        print(f"write {rel}")

    for rel, src in PHOTOS.items():
        dst = out(rel)
        if not source_ready(src, dst):
            continue
        img = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
        img.thumbnail((PHOTO_MAX, PHOTO_MAX), Image.LANCZOS)
        img.save(dst, quality=82, optimize=True, progressive=True)
        print(f"write {rel}")


if __name__ == "__main__":
    main()
