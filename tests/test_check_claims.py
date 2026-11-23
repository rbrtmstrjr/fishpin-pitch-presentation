import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import check_claims as cc  # noqa: E402


def rules(text: str) -> list[str]:
    return [rule for _, rule, _ in cc.check_text(text)]


@pytest.mark.parametrize("text", [
    "One app · still navigating with no signal.",
    "1.1 million municipal fishermen",
    "TAM PHP 659M (1.1M fishermen x PHP 599)",
    "SAM PHP 461M · 70% smartphone ownership (assumption)",
    "Assuming 70 percent own a smartphone, 461 million is within reach.",
    "PHP 599 once, after a 7-day free trial",
    "A free trial at sea before paying once",
    "Free to try, then Lifetime",
    "1,000 printed Tagalog guides and SOS cards",
    "Filipino-language interface · planned",
    "iOS release · planned Dec 2026",
    "Test iPhone for the iOS build",
    "Google Gemini API: AI fish scan",
    "Twelve cooperative sessions, one a month",
    "BS Information Technology",
    "PHP 4,990 is not the old price",
    "Google Play is our store partner",
])
def test_clean_lines_pass(text):
    assert rules(text) == []


@pytest.mark.parametrize("text, rule", [
    ("Built in 2026 — by a fisherman", "em-dash"),
    ("1.2 million municipal fishermen", "sector-size"),
    ("2 million registered fishermen", "sector-size"),
    ("70% own a smartphone", "seventy-percent-unlabelled"),
    ("BS IT, Mindoro State University", "university"),
    ("I finished college in 2020", "university"),
    ("FishPin is free for fishermen", "free"),
    ("Libre ang app", "free"),
    ("Works 100% offline", "offline-absolute"),
    ("Fully offline at sea", "offline-absolute"),
    ("Only PHP 499 once", "old-price"),
    ("Endorsed by BFAR", "partner-claim"),
    ("Our partner, the Coast Guard", "partner-claim"),
    ("A Tagalog app for fishermen", "tagalog-app"),
    ("Now available on iOS", "ios-shipped"),
    ("No safety feature behind a paywall", "paywall-promise"),
    ("AI fish ID by Gemini", "gemini"),
])
def test_violations_are_caught(text, rule):
    assert rule in rules(text)


def test_html_ignores_css_and_scripts_but_reads_notes():
    src = """<style>.bar{width:70%}</style><script>const x = '—';</script>
    <section><h2>Pay once</h2><aside class="notes">It is free for everyone.</aside></section>"""
    assert [r for _, r, _ in cc.check_html(src)] == ["free"]


def test_html_flags_competitor_logo_images():
    src = '<img src="assets/slide13/navionics.png" alt="">'
    assert "competitor-logo" in [r for _, r, _ in cc.check_html(src)]


def test_html_with_empty_bindings_keeps_trial_wording_clean():
    src = '<p class="price-sub">one-time &middot; after a <span data-k="trialDays" data-f="int"></span>-day free trial</p>'
    assert cc.check_html(src) == []


def test_main_exit_codes(tmp_path, capsys):
    good = tmp_path / "good.txt"
    good.write_text("Sea charts that work with no signal.", encoding="utf-8")
    bad = tmp_path / "bad.txt"
    bad.write_text("Totally free!", encoding="utf-8")
    assert cc.main([str(good)]) == 0
    assert cc.main([str(bad)]) == 1
    assert "bad.txt:1: free" in capsys.readouterr().out
