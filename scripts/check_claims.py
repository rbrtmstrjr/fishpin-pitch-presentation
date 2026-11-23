"""Claims guard for the FishPin national pitch deck (spec section 7).

Usage:  python scripts/check_claims.py FILE [FILE ...]
  *.html  checks the visible text (styles, scripts and comments removed, speaker
          notes kept) plus <img> sources (no competitor logos). Line numbers refer
          to the extracted text.
  other   checks the file as plain text, e.g. tools/qa/out/rendered.txt written by
          the browser QA after every number has been filled in.
Prints one line per problem (file:line: rule: text) and exits 1 if there is any.
"""
from __future__ import annotations

import html
import re
import sys
from dataclasses import dataclass
from pathlib import Path

I = re.IGNORECASE


@dataclass(frozen=True)
class Rule:
    name: str
    pattern: re.Pattern
    allow: re.Pattern | None = None     # the line is fine if it also matches this
    require: re.Pattern | None = None   # a hit only counts if the line also matches this
    strip: re.Pattern | None = None     # removed from the line before matching
    group_ok: str | None = None         # a hit is fine when group(1) equals this


ORGS = re.compile(
    r"BFAR|NAMRIA|\bLGUs?\b|Coast Guard|cooperative|\bco-ops?\b|Municipal Agriculture|Department of Agriculture", I)

RULES = [
    Rule("em-dash", re.compile("—")),
    Rule("sector-size", re.compile(r"(?<![\d.])(?<!PHP )(?<!PHP)(?<!₱)(\d+(?:\.\d+)?)\s*(?:million|M)\b[^.\n]{0,40}fisher", I), group_ok="1.1"),
    Rule("seventy-percent-unlabelled", re.compile(r"\b70\s*(?:%|percent|per cent)", I), allow=re.compile(r"assum", I)),
    Rule("university", re.compile(r"universit|college|campus|\bMinSU\b|Mindoro State", I)),
    Rule("free", re.compile(r"\bfree\b|\blibre\b|walang bayad", I),
         strip=re.compile(r"(?:\d*-?day )?free trial|free to try", I)),
    Rule("offline-absolute", re.compile(r"100\s*%\s*offline|fully offline|completely offline|entirely offline", I)),
    Rule("old-price", re.compile("(?:PHP|Php|₱)\\s*499(?![\\d,])")),
    Rule("partner-claim", re.compile(r"partner|endorse|katuwang|accredit|backed by|supported by|in cooperation with", I),
         require=ORGS),
    Rule("tagalog-app", re.compile(r"(?:Tagalog|Filipino)(?:-language)?\s+(?:app|interface|UI|screens)", I),
         allow=re.compile(r"\bplanned\b|\bnext\b|\btranslation\b", I)),
    Rule("ios-shipped", re.compile(r"\biOS\b|App Store|iPhone", I),
         allow=re.compile(r"\bplanned\b|\bDec(?:ember)? 2026\b|\bnext\b|\bbuild\b", I)),
    Rule("paywall-promise", re.compile(r"behind a paywall", I)),
    Rule("gemini", re.compile(r"Gemini(?! API)")),
]
LOGO = re.compile(r"<img\b[^>]*\bsrc=[\"'][^\"']*(?:navionics|fishbrain|garmin|c-?map)", I)
BLOCK_TAGS = re.compile(
    r"</?(?:p|div|li|ul|ol|dl|dt|dd|h[1-6]|section|aside|tr|td|th|table|thead|tbody|figure|figcaption|header|footer|br)\b[^>]*>", I)


def html_to_text(src: str) -> str:
    src = re.sub(r"(?is)<(style|script)\b.*?</\1>", " ", src)
    src = re.sub(r"(?s)<!--.*?-->", " ", src)
    src = BLOCK_TAGS.sub("\n", src)
    src = re.sub(r"<[^>]+>", " ", src)
    text = html.unescape(src)
    return "\n".join(re.sub(r"[ \t]+", " ", line).strip() for line in text.splitlines())


def check_text(text: str) -> list[tuple[int, str, str]]:
    hits = []
    for number, line in enumerate(text.splitlines(), 1):
        for rule in RULES:
            subject = rule.strip.sub("", line) if rule.strip else line
            for match in rule.pattern.finditer(subject):
                if rule.group_ok is not None and match.group(1) == rule.group_ok:
                    continue
                if rule.allow is not None and rule.allow.search(line):
                    continue
                if rule.require is not None and not rule.require.search(line):
                    continue
                hits.append((number, rule.name, line.strip()[:160]))
                break
    return hits


def check_html(src: str) -> list[tuple[int, str, str]]:
    hits = check_text(html_to_text(src))
    for match in LOGO.finditer(src):
        hits.append((src.count("\n", 0, match.start()) + 1, "competitor-logo", match.group(0)[:160]))
    return hits


def main(argv: list[str]) -> int:
    reconfigure = getattr(sys.stdout, "reconfigure", None)
    if reconfigure is not None:
        reconfigure(encoding="utf-8", errors="replace")
    if not argv:
        print(__doc__)
        return 2
    total = 0
    for name in argv:
        path = Path(name)
        src = path.read_text(encoding="utf-8")
        hits = check_html(src) if path.suffix.lower() == ".html" else check_text(src)
        for line, rule, text in hits:
            print(f"{name}:{line}: {rule}: {text}")
        total += len(hits)
    print(f"claims check: {total} problem(s)")
    return 1 if total else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
