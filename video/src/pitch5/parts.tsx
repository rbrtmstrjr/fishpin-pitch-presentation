import React from "react";
import { AbsoluteFill, Audio, Easing, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { LINES, VoLine, Word, durOf, hasVo, wordsOf } from "./narration";
import { useAppSpring } from "../motion/primitives";
import { AnimatedMark, ContourField, ContourReveal, Mono, Vignette, WhipIn } from "../pitch/kit";
import { PW, f } from "../pitch/timing";
import { FONT, PALETTE } from "../theme";
import { useCounter } from "../ui/brand";

// Building blocks for the 5-minute pitch: real footage, captions, a name
// card, and clearly marked placeholders for shots still to be filmed.

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const FADE = 8; // frames of crossfade between beats

const FadeIn: React.FC<{ children: React.ReactNode; enabled: boolean }> = ({ children, enabled }) => {
  const frame = useCurrentFrame();
  const o = enabled ? interpolate(frame, [0, FADE], [0, 1], clamp) : 1;
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

// One shot on the timeline (seconds, relative to the section). It runs past
// its length so the next shot can arrive over it, with the teaser's moves:
// a fade, a whip-pan, the contour-line wipe, or a hard cut.
export type Enter = "fade" | "whip" | "contour" | "cut";
export const TAIL = 18; // frames a shot stays under the next one's entrance

export const Beat: React.FC<{ at: number; len: number; children: React.ReactNode; enter?: Enter; fade?: boolean }> = ({
  at,
  len,
  children,
  enter,
  fade = true,
}) => {
  const how: Enter = enter ?? (fade ? "fade" : "cut");
  return (
    <Sequence from={f(at)} durationInFrames={f(len) + TAIL}>
      {how === "whip" ? (
        <WhipIn>{children}</WhipIn>
      ) : how === "contour" ? (
        <ContourReveal>{children}</ContourReveal>
      ) : (
        <FadeIn enabled={how === "fade"}>{children}</FadeIn>
      )}
    </Sequence>
  );
};

// A sound hit (public/sfx) at `at` seconds into the section.
export const Sfx: React.FC<{ at: number; file: string; volume?: number }> = ({ at, file, volume = 1 }) => (
  <Sequence from={Math.max(0, f(at))} durationInFrames={45}>
    <Audio src={staticFile(`sfx/${file}`)} volume={volume} />
  </Sequence>
);

// A short camera shake starting at frame `at` (relative to its parent).
export const Shake: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const frame = useCurrentFrame();
  const k = frame >= at && frame < at + 10 ? Math.sin(frame * 2.7) * (at + 10 - frame) * 1.6 : 0;
  return <AbsoluteFill style={{ transform: `translate(${k}px, ${k * 0.5}px)` }}>{children}</AbsoluteFill>;
};

// Navy gradient so headlines read over footage.
export const Shade: React.FC<{ side?: "left" | "center" | "right"; strength?: number }> = ({ side = "left", strength = 0.9 }) => {
  const a = strength;
  const bg =
    side === "center"
      ? `radial-gradient(ellipse at center, rgba(6,18,51,${a * 0.55}) 0%, rgba(6,18,51,${a}) 100%)`
      : `linear-gradient(${side === "left" ? 90 : 270}deg, rgba(6,18,51,${a}) 0%, rgba(6,18,51,${a * 0.6}) 45%, rgba(6,18,51,0.05) 100%)`;
  return <AbsoluteFill style={{ background: bg }} />;
};

// A clip from public/pitch5/clips, starting `from` seconds in, with a slow push.
export const Clip: React.FC<{
  src: string;
  from: number;
  len: number;
  volume?: number;
  push?: [number, number];
  dim?: number;
  rate?: number; // playback speed; below 1 stretches a short clip in slow motion
}> = ({ src, from, len, volume = 0.15, push = [1, 1.06], dim = 0, rate = 1 }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, f(len)], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <OffthreadVideo
        src={staticFile(`pitch5/clips/${src}.mp4`)}
        trimBefore={f(from)}
        playbackRate={rate}
        volume={volume}
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${push[0] + (push[1] - push[0]) * t})` }}
      />
      {dim > 0 ? <AbsoluteFill style={{ background: `rgba(6,18,51,${dim})` }} /> : null}
    </AbsoluteFill>
  );
};

// Narration captions (seconds, relative to the section).
export type Line = { at: number; to: number; text: string };

const CaptionLine: React.FC<{ text: string; len: number }> = ({ text, len }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 5, len - 5, len], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 60 }}>
      <div
        style={{
          opacity: o,
          transform: `translateY(${(1 - o) * 8}px)`,
          maxWidth: 1500,
          textAlign: "center",
          fontFamily: FONT.sans,
          fontWeight: 600,
          fontSize: 42,
          lineHeight: 1.25,
          color: "#FFFFFF",
          background: "rgba(6,18,51,0.68)",
          padding: "14px 30px",
          borderRadius: 18,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

export const Captions: React.FC<{ lines: Line[] }> = ({ lines }) => (
  <>
    {lines.map((l, i) => (
      <Sequence key={i} from={f(l.at)} durationInFrames={Math.max(1, f(l.to - l.at))}>
        <CaptionLine text={l.text} len={f(l.to - l.at)} />
      </Sequence>
    ))}
  </>
);

// ---- word-by-word captions: short chunks that follow the voice, the word
// being spoken in amber with a small pop, spoken words white, the rest dim.

type Chunk = { words: Word[]; start: number; end: number };
const MAX_WORDS = 4;
const display = (w: string) => w.replace(/[.,;:…]+$/g, "").replace(/^…+/, "");

const chunksOf = (ws: Word[]): Chunk[] => {
  const out: Chunk[] = [];
  let cur: Word[] = [];
  ws.forEach((w, i) => {
    cur.push(w);
    const breakHere = /[,.!?…;:]$/.test(w.w) || cur.length >= MAX_WORDS || i === ws.length - 1;
    if (breakHere) {
      out.push({ words: cur, start: cur[0].s, end: cur[cur.length - 1].e });
      cur = [];
    }
  });
  return out;
};

// `box` keeps the captions within part of the frame (left edge and width in px).
type Box = { left: number; width: number };

const CaptionChunk: React.FC<{ chunk: Chunk; offset: number; box?: Box }> = ({ chunk, offset, box }) => {
  const frame = useCurrentFrame();
  const t = frame / 30 + offset; // seconds from the line's start
  const enter = interpolate(frame, [0, 6], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 96, ...(box ? { left: box.left, right: PW - box.left - box.width, width: box.width } : null) }}>
      <div
        style={{
          opacity: enter,
          transform: `translateY(${(1 - enter) * 18}px)`,
          display: "flex",
          gap: 30,
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: box ? box.width : 1500,
        }}
      >
        {chunk.words.map((w, i) => {
          const spoken = t >= w.s - 0.03;
          // keep the keyframes strictly increasing even for a very short word
          const a = w.s - 0.03;
          const b = a + 0.09;
          const c = Math.max(b + 0.01, w.e);
          const bump = interpolate(t, [a, b, c, c + 0.1], [0, 1, 1, 0], clamp);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                fontFamily: FONT.sans,
                fontWeight: 700,
                fontSize: 62,
                lineHeight: 1.1,
                color: bump > 0.5 ? PALETTE.amber : "#FFFFFF",
                opacity: spoken ? 1 : 0.5,
                transform: `scale(${1 + 0.12 * bump}) translateY(${-6 * bump}px)`,
                textShadow: "0 4px 18px rgba(0,0,0,0.7), 0 0 3px rgba(0,0,0,0.9)",
              }}
            >
              {display(w.w)}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const WordCaptions: React.FC<{ line: VoLine; box?: Box }> = ({ line, box }) => {
  const chunks = chunksOf(wordsOf(line).filter((w) => line.captionUntil === undefined || w.s < line.captionUntil));
  return (
    <>
      {chunks.map((c, i) => {
        const next = chunks[i + 1];
        const from = Math.max(0, c.start - 0.05);
        const to = next ? next.start - 0.03 : c.end + 0.4;
        return (
          <Sequence key={i} from={f(line.at + from)} durationInFrames={Math.max(1, f(to - from))}>
            <CaptionChunk chunk={c} offset={from} box={box} />
          </Sequence>
        );
      })}
    </>
  );
};

// Word-by-word captions on by default; set false for a clean (no subtitles) cut.
// Deck copy: off. Robert speaks live, so the voice-over's captions would not match.
export const SHOW_CAPTIONS = false;

// A section's narration: the voice-over plus word-by-word captions.
export const Narration: React.FC<{ section: number; captions?: boolean; box?: Box }> = ({ section, captions = SHOW_CAPTIONS, box }) => {
  const lines = LINES.filter((l) => l.section === section);
  return (
    <>
      {lines.filter(hasVo).map((l) => (
        <Sequence key={l.id} from={f(l.at)}>
          <Audio src={staticFile(`pitch5/vo/${l.id}.wav`)} volume={1} />
        </Sequence>
      ))}
      {captions ? lines.filter((l) => l.caption !== false).map((l) => <WordCaptions key={l.id} line={l} box={box} />) : null}
    </>
  );
};

// Name card: an amber bar grows, the plate wipes open, then it fades out.
// With `logo`, the animated FishPin mark (no background) sits above it, left-aligned:
// the waves roll in at `logoAt` (frames), the fin rises 11 frames later.
export const LowerThird: React.FC<{ name: string; role: string; len: number; logo?: boolean; logoAt?: number }> = ({ name, role, len, logo, logoAt = 4 }) => {
  const frame = useCurrentFrame();
  const s = useAppSpring(0);
  const out = interpolate(frame, [len - 10, len], [1, 0], clamp);
  return (
    <AbsoluteFill>
      {logo ? (
        <div style={{ position: "absolute", left: 104, bottom: 190 + 152, opacity: out, filter: "drop-shadow(0 4px 14px rgba(6,18,51,0.75))" }}>
          <AnimatedMark id="namecard" startAt={logoAt} size={330} />
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 110, bottom: 190, opacity: out, display: "flex", gap: 20 }}>
        <div style={{ width: 8, borderRadius: 4, background: PALETTE.amber, transform: `scaleY(${s})` }} />
        <div
          style={{
            background: "rgba(6,18,51,0.74)",
            padding: "18px 30px",
            borderRadius: 14,
            clipPath: `inset(0 ${Math.max(0, (1 - s) * 100)}% 0 0)`,
          }}
        >
          <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 52, color: "#FFFFFF", lineHeight: 1.1 }}>{name}</div>
          <div style={{ fontFamily: FONT.mono, fontWeight: 500, fontSize: 26, color: PALETTE.amber, marginTop: 6, letterSpacing: 1 }}>
            {role}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Corner tag on a frame that still uses a stand-in.
export const Pending: React.FC<{ id: string; what: string; side?: "left" | "right" }> = ({ id, what, side = "right" }) => {
  const frame = useCurrentFrame();
  const blink = Math.floor(frame / 15) % 2 === 0 ? 1 : 0.3;
  return (
    <div
      style={{
        position: "absolute",
        [side]: 48,
        top: 44,
        maxWidth: 640,
        background: "rgba(6,18,51,0.84)",
        border: `3px dashed ${PALETTE.amber}`,
        borderRadius: 16,
        padding: "14px 20px",
      }}
    >
      <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 24, color: PALETTE.amber, letterSpacing: 2 }}>
        <span style={{ color: "#F87171", opacity: blink }}>●</span> PLACEHOLDER · {id}
      </div>
      <div style={{ fontFamily: FONT.mono, fontWeight: 500, fontSize: 22, color: "#EAF2FF", marginTop: 6, lineHeight: 1.35 }}>{what}</div>
    </div>
  );
};

// Full-frame card for a shot with no stand-in yet.
export const PendingCard: React.FC<{ id: string; title: string; how: string }> = ({ id, title, how }) => {
  const frame = useCurrentFrame();
  const blink = Math.floor(frame / 15) % 2 === 0 ? 1 : 0.3;
  return (
    <AbsoluteFill>
      <ContourField speed={0.6} />
      <Vignette />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: 1180,
            border: `4px dashed ${PALETTE.amber}`,
            borderRadius: 32,
            padding: "46px 60px",
            background: "rgba(6,18,51,0.6)",
            marginBottom: 120,
          }}
        >
          <Mono size={28} color={PALETTE.amber} spacing={3}>
            <span style={{ color: "#F87171", opacity: blink }}>●</span> FILM TOMORROW · {id}
          </Mono>
          <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 62, color: "#FFFFFF", marginTop: 16, lineHeight: 1.1 }}>
            {title}
          </div>
          <div style={{ marginTop: 22 }}>
            <Mono size={30}>{how}</Mono>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// A counting number in the mono face; keeps decimals and a true minus sign.
// Pair it with a count sound of the same length (scripts/count-sfx.mjs).
export const Num: React.FC<{
  from?: number;
  to: number;
  startAt: number;
  length?: number;
  dp?: number;
  prefix?: string;
  suffix?: string;
  size: number;
  color?: string;
}> = ({ from = 0, to, startAt, length = 30, dp = 0, prefix = "", suffix = "", size, color = "#FFFFFF" }) => {
  const v = useCounter(from, to, startAt, length);
  const s = useAppSpring(startAt);
  const body = dp ? Math.abs(v).toFixed(dp) : Math.round(Math.abs(v)).toLocaleString("en-US");
  return (
    <div
      style={{
        fontFamily: FONT.mono,
        fontWeight: 600,
        fontSize: size,
        lineHeight: 1,
        color,
        opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
        transform: `scale(${interpolate(s, [0, 1], [1.08, 1])})`,
        transformOrigin: "0% 50%",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {v < 0 ? "−" : prefix}
      {body}
      {suffix}
    </div>
  );
};

// Lucide glyphs (navy on an amber tile unless `color` says otherwise).
export const Glyph: React.FC<{ d: string[]; circles?: [number, number, number][]; size?: number; color?: string }> = ({
  d,
  circles = [],
  size = 58,
  color = PALETTE.brand950,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    {circles.map(([cx, cy, r], i) => (
      <circle key={i} cx={cx} cy={cy} r={r} />
    ))}
    {d.map((p, i) => (
      <path key={i} d={p} />
    ))}
  </svg>
);

// A big centred headline, word by word with the voice (`at` in seconds, one per
// word); with `moveAt` (frames) it then glides up into the header.
const HeadWord: React.FC<{ word: string; startAt: number; size: number }> = ({ word, startAt, size }) => {
  const s = useAppSpring(startAt);
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: FONT.sans,
        fontWeight: 800,
        fontSize: size,
        letterSpacing: -2,
        color: "#FFFFFF",
        opacity: interpolate(s, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }),
        transform: `translateY(${(1 - s) * 40}px)`,
      }}
    >
      {word}
    </span>
  );
};

export const Headline: React.FC<{ words: string[]; at: number[]; moveAt?: number; size?: number }> = ({ words, at, moveAt, size = 112 }) => {
  const up = useAppSpring(moveAt ?? Number.MAX_SAFE_INTEGER);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: interpolate(up, [0, 1], [440, 92]),
        display: "flex",
        justifyContent: "center",
        gap: size / 4,
        transform: `scale(${interpolate(up, [0, 1], [1, 0.52])})`,
        transformOrigin: "50% 0%",
      }}
    >
      {words.map((w, i) => (
        <HeadWord key={i} word={w} startAt={f(at[i])} size={size} />
      ))}
    </div>
  );
};

// ------------------------------------------------------------ interviews

export type InterviewData = {
  src: string; // public/pitch5/clips/<src>.mp4, the answer only (the interviewer's voice is cut)
  len: number;
  question: string; // as asked, in Tagalog
  name?: string; // shown in a name card, as for the founder
  role?: string;
  // muted cutaways over the answer (seconds into the answer); the speaker's voice runs on underneath
  inserts?: { src: string; at: number; len: number }[];
};

// The question that was asked, typed out quickly at the vertical centre on the
// left (clear of the speaker), with no panel behind it; it stays for the whole answer.
const TYPE_FROM = 4; // frames
const TYPE_LEN = 32;
const QuestionCard: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const s = useAppSpring(0);
  const shown = Math.round(interpolate(frame, [TYPE_FROM, TYPE_FROM + TYPE_LEN], [0, text.length], clamp));
  const typing = frame < TYPE_FROM + TYPE_LEN + 15;
  const cursor = typing && Math.floor(frame / 6) % 2 === 0;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "flex-start", paddingLeft: 90 }}>
      <div
        style={{
          maxWidth: 820,
          display: "flex",
          gap: 22,
          opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
          transform: `translateX(${(1 - s) * -40}px)`,
        }}
      >
        <div
          style={{
            width: 62,
            height: 62,
            borderRadius: 16,
            flexShrink: 0,
            background: PALETTE.amber,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT.sans,
            fontWeight: 800,
            fontSize: 36,
            color: PALETTE.brand950,
          }}
        >
          Q
        </div>
        <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 50, lineHeight: 1.22, color: "#FFFFFF", textShadow: "0 4px 20px rgba(0,0,0,0.75), 0 0 3px rgba(0,0,0,0.9)" }}>
          {text.slice(0, shown)}
          <span style={{ display: "inline-block", width: 4, height: 46, marginLeft: 2, marginRight: -6, verticalAlign: -6, background: PALETTE.amber, opacity: cursor ? 1 : 0 }} />
          <span style={{ visibility: "hidden" }}>{text.slice(shown)}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// A cutaway over the answer: zooms in out of a blur, plays muted, fades back.
const InsertCut: React.FC<{ src: string; len: number }> = ({ src, len }) => {
  const frame = useCurrentFrame();
  const n = f(len);
  const inn = interpolate(frame, [0, 9], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const out = interpolate(frame, [n - 9, n], [1, 0], clamp);
  return (
    <AbsoluteFill
      style={{
        opacity: Math.min(inn, out),
        transform: `scale(${1.12 - 0.12 * inn + 0.04 * (1 - out)})`,
        filter: `blur(${(1 - inn) * 14}px)`,
      }}
    >
      <Clip src={src} from={0} len={len} volume={0} push={[1.0, 1.06]} />
    </AbsoluteFill>
  );
};

// An interview answer: the clip at full volume, the question that was asked
// typed on screen (the interviewer's voice is cut), and the speaker's name card.
// The answer's own words run as word-by-word captions through the section's
// narration (an `oncam` line), like the founder's introduction.
export const Interview: React.FC<{ data: InterviewData }> = ({ data }) => (
  <AbsoluteFill>
    <Clip src={data.src} from={0} len={data.len} volume={1} push={[1.0, 1.05]} />
    {(data.inserts ?? []).map((c) => (
      <Sequence key={c.at} from={f(c.at)} durationInFrames={f(c.len)}>
        <InsertCut src={c.src} len={c.len} />
      </Sequence>
    ))}
    <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(6,18,51,0.5) 0%, rgba(6,18,51,0) 55%), linear-gradient(180deg, rgba(6,18,51,0) 70%, rgba(6,18,51,0.6) 100%)" }} />
    {data.question ? <QuestionCard text={data.question} /> : null}
    {data.name ? (
      <Sequence from={f(0.6)} durationInFrames={f(5.4)}>
        <LowerThird name={data.name} role={data.role ?? ""} len={f(5.4)} />
      </Sequence>
    ) : null}
  </AbsoluteFill>
);
