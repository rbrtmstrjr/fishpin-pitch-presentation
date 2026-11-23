import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { AnimatedMark, ContourField, Mono, Rise, Vignette } from "../pitch/kit";
import { f } from "../pitch/timing";
import { FONT, PALETTE } from "../theme";
import { Sfx } from "./parts";

// ------------------------------------------------------------ 0 · Intro 0:00–0:05
// The title card, in the end card's style: "FISHPIN PITCH 2026" types out, then
// its tagline, then the occasion and the presenter, and last the
// FishPin mark builds itself above them; then it all eases into darkness so the
// first shot can open on the sunrise. Calm: no voice, one soft ping as the fin
// rises. Section seconds.

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OUT: [number, number] = [4.3, 5.0];
const MARK_AT = 2.8; // the mark builds last: waves, then the fin about 0.37 s later

// The headline types out, two frames a letter, behind an amber cursor that
// blinks a few times once it is done. The untyped letters keep their space, so
// the line stays centred while it types.
const TITLE: [string, string][] = [
  ["FISHPIN ", "#FFFFFF"],
  ["PITCH 2026", PALETTE.amber],
];
const TYPE_STEP = 2; // frames per letter
const TITLE_LEN = TITLE.reduce((n, [w]) => n + w.length, 0);
const TYPED_AT = (at: number) => at + TITLE_LEN * TYPE_STEP; // frame the last letter lands

const Cursor: React.FC<{ on: boolean }> = ({ on }) => (
  <span style={{ display: "inline-block", width: 0, position: "relative" }}>
    <span style={{ position: "absolute", left: 4, top: -86, width: 9, height: 90, borderRadius: 2, background: PALETTE.amber, opacity: on ? 1 : 0 }} />
  </span>
);

const Title: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const shown = Math.max(0, Math.min(TITLE_LEN, Math.floor((frame - at) / TYPE_STEP) + 1));
  const typing = frame >= at && frame < TYPED_AT(at);
  const cursorOn = frame >= at - 8 && frame < TYPED_AT(at) + 30 && (typing || Math.floor(frame / 8) % 2 === 0);
  let start = 0;
  return (
    <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 112, lineHeight: 1, letterSpacing: 8, whiteSpace: "pre" }}>
      {TITLE.map(([w, color], i) => {
        const vis = Math.max(0, Math.min(w.length, (frame < at ? 0 : shown) - start));
        const hasCursor = frame < at ? i === 0 : shown - start <= w.length && shown - start >= 0 && (i === TITLE.length - 1 || shown - start < w.length);
        start += w.length;
        return (
          <span key={w} style={{ color }}>
            {w.slice(0, vis)}
            {hasCursor ? <Cursor on={cursorOn} /> : null}
            <span style={{ visibility: "hidden" }}>{w.slice(vis)}</span>
          </span>
        );
      })}
    </div>
  );
};

export const S0Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const bgIn = interpolate(t, [0, 0.6], [0, 1], clamp);
  const out = interpolate(t, OUT, [1, 0], clamp);
  const line = interpolate(frame, [f(1.55), f(1.55) + 14], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ opacity: bgIn * out }}>
        <ContourField glowAt={[50, 42]} />
        <Vignette />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: out, transform: `scale(${1 + 0.04 * (1 - out)})` }}>
        {/* positioned, so the mark paints above the full-frame background */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* the mark builds last, in the space kept for it */}
          <AnimatedMark id="intro" startAt={f(MARK_AT)} size={170} />
          <div style={{ height: 44 }} />

          {/* the title: headline, rule, tagline */}
          <Title at={f(0.3)} />
          <div style={{ height: 30, display: "flex", alignItems: "center" }}>
            <div style={{ width: 560 * line, height: 4, borderRadius: 2, background: PALETTE.amber, opacity: line }} />
          </div>
          <Rise startAt={f(1.8)}>
            <span style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 46, color: "#FFFFFF" }}>Marine navigation for Filipino fishermen.</span>
          </Rise>

          <div style={{ height: 64 }} />

          {/* the occasion and the presenter */}
          <Rise startAt={f(2.15)}>
            <Mono size={28} color={PALETTE.mist}>
              DA Young Farmers Challenge 2026 · MIMAROPA Regional Round
            </Mono>
          </Rise>
          <div style={{ height: 14 }} />
          <Rise startAt={f(2.4)}>
            <Mono size={28} color={PALETTE.amber}>
              Robert Maestro Jr · Mansalay, Oriental Mindoro
            </Mono>
          </Rise>
        </div>
      </AbsoluteFill>
      <Sfx at={MARK_AT + 0.37} file="ping.wav" volume={0.3} />
    </AbsoluteFill>
  );
};
