import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile } from "remotion";
import { FontFaces } from "../fonts";
import { NAVY_DEEP } from "../pitch/kit";
import { f } from "../pitch/timing";
import { voRanges } from "./narration";
import { PendingCard, TAIL } from "./parts";
import { S4Demo } from "./demo";
import { S0Intro } from "./intro";
import { S5Value } from "./value";
import { S6Status } from "./business";
import { S7Business, S8Financials, S9Close } from "./closing";
import { S1Hook, S2Founder, S3Problem } from "./sections";

// The 5-minute YFC pitch (4:50), built and reviewed section by section.
// A section with no component yet shows a "next to build" card, so the full
// timeline always plays end to end.

type Section = { id: string; title: string; start: number; len: number; C: React.FC | null };

export const SECTIONS: Section[] = [
  { id: "0", title: "Intro", start: 0, len: 5, C: S0Intro },
  { id: "1", title: "Hook", start: 5, len: 20, C: S1Hook },
  { id: "2", title: "You, the founder", start: 25, len: 20, C: S2Founder },
  { id: "3", title: "Problem and verified need", start: 45, len: 50, C: S3Problem },
  { id: "4", title: "Demo in real use", start: 95, len: 72, C: S4Demo },
  { id: "5", title: "Value added", start: 167, len: 34, C: S5Value },
  { id: "6", title: "Status of implementation", start: 201, len: 29, C: S6Status },
  { id: "7", title: "Business model and reach", start: 230, len: 27, C: S7Business },
  { id: "8", title: "Financials and use of the grant", start: 257, len: 30, C: S8Financials },
  { id: "9", title: "Ask and close", start: 287, len: 12, C: S9Close },
];
export const PITCH5_SECONDS = 299;

// Music sits under the narration: it dips under every voice-over line and
// drops further while someone speaks on camera.
const ON_CAMERA: [number, number][] = [
  [25.0, 32.2], // the founder's intro
  [63.0, 75.6], // T1, the fisherman on the problem
  [183.0, 201.0], // T2, the fisherman on what FishPin changed
];
const DUCK: [number, number, number][] = [
  ...ON_CAMERA.map(([a, b]) => [a, b, 0.35] as [number, number, number]),
  ...voRanges().map(([a, b]) => [a, b, 0.55] as [number, number, number]),
];

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

const MusicBed: React.FC<{ offset: number; total: number }> = ({ offset, total }) => (
  <Audio
    src={staticFile("sfx/music.wav")}
    loop
    volume={(fr) => {
      const t = fr / 30 + offset;
      const base = interpolate(fr, [0, 20, total - 45, total], [0, 0.5, 0.5, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      const duck = DUCK.reduce(
        (low, [a, b, level]) =>
          Math.min(low, interpolate(t, [a - 0.3, a, b, b + 0.4], [1, level, level, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })),
        1,
      );
      return base * duck;
    }}
  />
);

const Sections: React.FC<{ from: number; to: number }> = ({ from, to }) => (
  <>
    {SECTIONS.filter((s) => s.start < to && s.start + s.len > from).map((s) => (
      // each section runs TAIL frames into the next, so the next one's entrance has a picture under it
      <Sequence key={s.id} from={f(s.start - from)} durationInFrames={f(s.len) + TAIL}>
        {s.C ? (
          <s.C />
        ) : (
          <PendingCard id={`SECTION ${s.id}`} title={s.title} how={`${mmss(s.start)}–${mmss(s.start + s.len)} · next to build`} />
        )}
      </Sequence>
    ))}
  </>
);

// Full pitch.
export const Pitch5: React.FC = () => (
  <AbsoluteFill style={{ background: NAVY_DEEP }}>
    <FontFaces />
    <Sections from={0} to={PITCH5_SECONDS} />
    <MusicBed offset={0} total={f(PITCH5_SECONDS)} />
  </AbsoluteFill>
);

// A review cut of part of the timeline (seconds), e.g. sections 1–2 = 0..40.
export const Pitch5Part: React.FC<{ from: number; to: number }> = ({ from, to }) => (
  <AbsoluteFill style={{ background: NAVY_DEEP }}>
    <FontFaces />
    <Sections from={from} to={to} />
    <MusicBed offset={from} total={f(to - from)} />
  </AbsoluteFill>
);
