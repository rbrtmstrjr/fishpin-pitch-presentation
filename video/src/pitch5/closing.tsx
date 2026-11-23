import React from "react";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, interpolateColors, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useAppSpring } from "../motion/primitives";
import { AnimatedMark, ContourField, Mono, NAVY_DEEP, Rise, Vignette, WordReveal } from "../pitch/kit";
import { f } from "../pitch/timing";
import { FONT, PALETTE } from "../theme";
import { Eyebrow } from "../ui/brand";
import { Tile, USERS } from "./business";
import MIMAROPA from "./mimaropa-map.json";
import { Beat, Clip, Glyph, Narration, Num, Shade, Sfx } from "./parts";
// Deck copy: the national figures, generated from deck-data.js by scripts/build_clips.mjs.
import N from "../deck-numbers.json";
const peso = (n: number) => "₱" + n.toLocaleString("en-US");

// Sections 7–9: business model and reach, financials, the ask. Times are
// seconds into each section.

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Lucide infinity, smartphone, cloud-sun, book-open, triangle-alert
const INFINITY = ["M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z"];
const PHONE = ["M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z", "M12 18h.01"];
const CLOUD_SUN = ["M12 2v2", "m4.93 4.93 1.41 1.41", "M20 12h2", "m19.07 4.93-1.41 1.41", "M15.947 12.65a4 4 0 0 0-5.925-4.128", "M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"];
const BOOK = ["M12 7v14", "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"];
const SOS_CARD = ["m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3", "M12 9v4", "M12 17h.01"];
const HEAD: [number, number, number][] = [[9, 7, 4]]; // the head in Lucide's users icon

// ------------------------------------------------------------ 7 · Business 3:39–4:06

// Lucide repeat, lock, sim card
const REPEAT = ["m17 2 4 4-4 4", "M3 11v-1a4 4 0 0 1 4-4h14", "m7 22-4-4 4-4", "M21 13v1a4 4 0 0 1-4 4H3"];
const LOCK = ["M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z", "M7 11V7a5 5 0 0 1 10 0v4"];
const SIM = ["M7 2h7l5 5v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z", "M9 12h6v6H9z"];
const INK = "#0B1F4D";
const INK_SOFT = "#5A6886";

// A word group that lands with the voice (frames).
const WordIn: React.FC<{ at: number; text: string; hi?: boolean; size: number }> = ({ at, text, hi, size }) => {
  const s = useAppSpring(at);
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: FONT.sans,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.12,
        letterSpacing: -1,
        color: hi ? PALETTE.amber : "#FFFFFF",
        opacity: interpolate(s, [0, 0.4], [0, 1], clamp),
        transform: `translateY(${(1 - s) * 34}px)`,
      }}
    >
      {text}
    </span>
  );
};

const Sparkle: React.FC<{ x: number; y: number; size: number; opacity: number }> = ({ x, y, size, opacity }) => (
  <svg width={size} height={size} viewBox="-10 -10 20 20" style={{ position: "absolute", left: x - size / 2, top: y - size / 2, opacity }}>
    <path d="M0 -9 L2.4 -2.4 L9 0 L2.4 2.4 L0 9 L-2.4 2.4 L-9 0 L-2.4 -2.4 Z" fill="#FFFFFF" />
  </svg>
);

// 0:02 · seven day tiles fill one by one on "try it for seven days" (v29).
const TrialDays: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const label = useAppSpring(f(2.1));
  const cap = useAppSpring(f(3.65));
  return (
    <div style={{ position: "absolute", left: 120, top: 440 }}>
      <div style={{ opacity: interpolate(label, [0, 0.4], [0, 1], clamp) }}>
        <Mono size={26} color={PALETTE.amber}>
          7-DAY TRIAL
        </Mono>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        {Array.from({ length: 7 }, (_, i) => {
          const appear = spring({ frame: frame - f(2.12) - i, fps, config: { damping: 14, stiffness: 200, mass: 0.6 } });
          const at = f(2.35 + i * 0.19);
          const fill = interpolate(frame, [at, at + 5], [0, 1], clamp);
          const pop = interpolate(frame, [at, at + 4, at + 10], [1, 1.14, 1], clamp);
          return (
            <div
              key={i}
              style={{
                width: 76,
                height: 100,
                borderRadius: 16,
                boxSizing: "border-box",
                border: `2px solid ${interpolateColors(fill, [0, 1], ["rgba(234,242,255,0.3)", PALETTE.amber])}`,
                background: interpolateColors(fill, [0, 1], ["rgba(234,242,255,0.05)", PALETTE.amber]),
                boxShadow: fill > 0.5 ? `0 0 22px ${PALETTE.amber}66` : "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                opacity: appear,
                transform: `translateY(${(1 - appear) * 30}px) scale(${pop})`,
              }}
            >
              <span style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 15, letterSpacing: 2, color: fill > 0.5 ? INK : PALETTE.mist }}>DAY</span>
              <span style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 40, lineHeight: 1.05, color: fill > 0.5 ? INK : "#EAF2FF" }}>{i + 1}</span>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 22, opacity: interpolate(cap, [0, 0.4], [0, 1], clamp), transform: `translateY(${(1 - cap) * 16}px)` }}>
        <span style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 40, color: "#FFFFFF" }}>Try it at sea first</span>
      </div>
    </div>
  );
};

// An arrow drawing itself from one step to the next.
const FlowArrow: React.FC<{ x: number; at: number }> = ({ x, at }) => {
  const draw = interpolate(useCurrentFrame(), [at, at + 10], [0, 1], clamp);
  return (
    <svg width={90} height={40} style={{ position: "absolute", left: x, top: 518, overflow: "visible" }}>
      <path d="M4 20 H 72" stroke={PALETTE.amber} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
      <path d="M58 8 L 76 20 L 58 32" fill="none" stroke={PALETTE.amber} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={draw > 0.9 ? 1 : 0} />
    </svg>
  );
};

// 0:04 · the Lifetime badge lands on "one-time", its name on "Lifetime" (v29).
const LifetimeBadge: React.FC = () => {
  const frame = useCurrentFrame();
  const s = useAppSpring(f(4.6));
  const name = useAppSpring(f(5.1));
  const sub = useAppSpring(f(5.6));
  const a = (frame - f(4.6)) / 14;
  const glow = 0.5 + 0.5 * Math.sin(frame / 9);
  return (
    <div style={{ position: "absolute", left: 790, top: 445, width: 340, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: 190, height: 190 }}>
        <div style={{ position: "absolute", inset: -60, borderRadius: "50%", background: `radial-gradient(circle, ${PALETTE.amber}66 0%, ${PALETTE.amber}00 66%)`, opacity: s * (0.55 + 0.45 * glow) }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 48,
            background: PALETTE.amber,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 24px 50px rgba(0,0,0,0.45)",
            opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
            transform: `scale(${s}) rotate(${(1 - s) * -25}deg)`,
          }}
        >
          <Glyph d={INFINITY} size={126} />
        </div>
        <Sparkle x={95 + Math.cos(a) * 132} y={95 + Math.sin(a) * 132} size={30} opacity={interpolate(frame, [f(5.0), f(5.3)], [0, 1], clamp)} />
      </div>
      <div style={{ marginTop: 26, fontFamily: FONT.sans, fontWeight: 800, fontSize: 56, color: "#FFFFFF", opacity: interpolate(name, [0, 0.4], [0, 1], clamp), transform: `translateY(${(1 - name) * 20}px)` }}>
        Lifetime
      </div>
      <div style={{ opacity: interpolate(sub, [0, 0.4], [0, 1], clamp), transform: `translateY(${(1 - sub) * 14}px)` }}>
        <Mono size={28} color={PALETTE.mist}>
          one-time purchase
        </Mono>
      </div>
    </div>
  );
};

// The ways to pay through Google Play; the choice moves to each as it is named.
const PAY: { at: number; until?: number; name: string; sub: string; color: string; mark?: string }[] = [
  { at: 8.25, until: 9.2, name: "GCash", sub: "e-wallet", color: "#1A6DFF", mark: "G" },
  { at: 9.2, until: 10.05, name: "Maya", sub: "e-wallet", color: "#0FA958", mark: "M" },
  { at: 10.05, name: "Load", sub: "mobile load", color: PALETTE.amber },
];

const PayRow: React.FC<{ i: number; at: number; until?: number; name: string; sub: string; color: string; mark?: string }> = ({ i, at, until, name, sub, color, mark }) => {
  const frame = useCurrentFrame();
  const appear = useAppSpring(f(6.4) + i * 4);
  const on = until ? interpolate(frame, [f(at), f(at) + 6, f(until), f(until) + 6], [0, 1, 1, 0], clamp) : interpolate(frame, [f(at), f(at) + 6], [0, 1], clamp);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        height: 76,
        padding: "0 20px",
        boxSizing: "border-box",
        borderRadius: 18,
        border: `2px solid ${interpolateColors(on, [0, 1], ["#E3E8F2", PALETTE.amber])}`,
        background: interpolateColors(on, [0, 1], ["#FFFFFF", "#FFF4D6"]),
        opacity: interpolate(appear, [0, 0.3], [0, 1], clamp),
        transform: `translateX(${(1 - appear) * 40}px) scale(${1 + 0.025 * on})`,
      }}
    >
      <div style={{ width: 48, height: 48, borderRadius: mark ? 24 : 12, background: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {mark ? <span style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 26, color: "#FFFFFF" }}>{mark}</span> : <Glyph d={SIM} size={28} />}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 28, lineHeight: 1.1, color: INK }}>{name}</div>
        <div style={{ fontFamily: FONT.mono, fontSize: 18, color: INK_SOFT }}>{sub}</div>
      </div>
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          boxSizing: "border-box",
          border: `3px solid ${interpolateColors(on, [0, 1], ["#B7C2D6", PALETTE.amber])}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: 14, height: 14, borderRadius: 7, background: PALETTE.amber, transform: `scale(${on})` }} />
      </div>
    </div>
  );
};

// 0:06 · the purchase goes through Google Play (v29). No price: the pitch keeps
// the peso amount out.
const Checkout: React.FC = () => {
  const s = useAppSpring(f(6.1));
  return (
    <div
      style={{
        position: "absolute",
        left: 1215,
        top: 318,
        width: 560,
        padding: 30,
        boxSizing: "border-box",
        borderRadius: 30,
        background: "#FFFFFF",
        boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
        opacity: interpolate(s, [0, 0.25], [0, 1], clamp),
        transform: `translateY(${(1 - s) * 140}px) rotate(${(1 - s) * 4}deg)`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Img src={staticFile("pitch/play-store-icon-512.png")} style={{ width: 70, height: 70, borderRadius: 18 }} />
        <div>
          <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 32, color: INK }}>FishPin Lifetime</div>
          <div style={{ fontFamily: FONT.mono, fontSize: 20, color: INK_SOFT }}>One-time purchase</div>
        </div>
      </div>
      <div style={{ height: 2, background: "#E7ECF4", margin: "22px 0 18px" }} />
      <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 18, letterSpacing: 2, color: INK_SOFT }}>PAY WITH</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
        {PAY.map((p, i) => (
          <PayRow key={p.name} i={i} {...p} />
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 20 }}>
        <Glyph d={LOCK} size={22} color={INK_SOFT} />
        <span style={{ fontFamily: FONT.mono, fontSize: 18, color: INK_SOFT }}>Paid securely through Google Play</span>
      </div>
    </div>
  );
};

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

// 0:11 · a year of renewals, slashed on "no subscription" and falling away on
// "no renewals to miss"; what is left: pay once (v30). Frames from 10.85.
const NoSubscription: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (s: number) => f(s - 10.85);
  const strike = interpolate(frame, [L(11.25), L(11.55)], [0, 1], clamp);
  const stamp = spring({ frame: frame - L(11.4), fps, config: { damping: 11, stiffness: 170, mass: 0.8 } });
  const fall = Math.max(0, (frame - L(12.2)) / fps);
  const lift = useAppSpring(L(12.25));
  const W = 112;
  const G = 14;
  const X0 = (1920 - (12 * W + 11 * G)) / 2;
  const Y = 456;
  const gone = interpolate(fall, [0, 0.5], [1, 0], clamp);
  return (
    <AbsoluteFill>
      {MONTHS.map((m, i) => {
        const appear = spring({ frame: frame - i, fps, config: { damping: 14, stiffness: 200, mass: 0.6 } });
        const t = Math.max(0, fall - (i % 4) * 0.03);
        return (
          <div
            key={m}
            style={{
              position: "absolute",
              left: X0 + i * (W + G),
              top: Y,
              width: W,
              height: 128,
              borderRadius: 18,
              overflow: "hidden",
              background: "rgba(6,18,51,0.86)",
              border: "2px solid rgba(234,242,255,0.18)",
              opacity: appear * interpolate(t, [0, 0.45], [1, 0], clamp),
              transform: `translateY(${(1 - appear) * 40 + 1500 * t * t}px) rotate(${(i % 2 ? 1 : -1) * t * 150}deg)`,
            }}
          >
            <div style={{ height: 34, background: "rgba(248,113,113,0.85)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 18, letterSpacing: 2, color: "#FFFFFF" }}>{m}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, marginTop: 14 }}>
              <Glyph d={REPEAT} size={36} color={PALETTE.mist} />
              <Mono size={16} color={PALETTE.mist}>
                renew
              </Mono>
            </div>
          </div>
        );
      })}
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={X0 - 24} y1={Y + 66} x2={X0 - 24 + (12 * W + 11 * G + 48) * strike} y2={Y + 66} stroke="#F87171" strokeWidth={12} strokeLinecap="round" opacity={strike > 0 ? gone : 0} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: interpolate(lift, [0, 1], [Y + 20, 250]), display: "flex", justifyContent: "center" }}>
        <div
          style={{
            padding: "10px 30px",
            border: "6px solid #F87171",
            borderRadius: 18,
            background: "rgba(6,18,51,0.92)",
            fontFamily: FONT.sans,
            fontWeight: 800,
            fontSize: 70,
            letterSpacing: 2,
            color: "#F87171",
            opacity: interpolate(stamp, [0, 0.2], [0, 1], clamp),
            transform: `rotate(-5deg) scale(${(1.8 - 0.8 * Math.min(stamp, 1.05)) * (1 - 0.3 * lift)})`,
          }}
        >
          NO SUBSCRIPTION
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 500, display: "flex", justifyContent: "center", gap: 28 }}>
        <WordIn at={L(12.5)} text="Pay once." size={100} />
        <WordIn at={L(12.75)} text="Keep it for life." hi size={100} />
      </div>
    </AbsoluteFill>
  );
};

// 0:00 · the model, told as it is spoken (v29): seven days to try it, then one
// Lifetime purchase through Google Play; then no subscription (v30).
const ModelBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const flow = interpolate(frame, [f(10.7), f(11.0)], [1, 0], clamp);
  const head = useAppSpring(f(1.0));
  return (
    <AbsoluteFill>
      <ContourField glowAt={[50, 40]} />
      <Vignette />
      <AbsoluteFill style={{ opacity: flow, transform: `translateY(${(1 - flow) * -60}px) scale(${1 - 0.04 * (1 - flow)})` }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 110, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <Rise startAt={4}>
            <Eyebrow>Business model</Eyebrow>
          </Rise>
          <div
            style={{
              fontFamily: FONT.sans,
              fontWeight: 800,
              fontSize: 104,
              color: "#FFFFFF",
              opacity: interpolate(head, [0, 0.3], [0, 1], clamp),
              transform: `scale(${1.25 - 0.25 * head})`,
            }}
          >
            Simple.
          </div>
        </div>
        <TrialDays />
        <FlowArrow x={728} at={f(4.0)} />
        <LifetimeBadge />
        <FlowArrow x={1122} at={f(6.0)} />
        <Checkout />
      </AbsoluteFill>
      <Sequence from={f(10.85)}>
        <NoSubscription />
      </Sequence>
    </AbsoluteFill>
  );
};

// Southern Oriental Mindoro, the five towns placed from their coordinates
// (x = 330 + (lon − 121.35) · 1206, y = 140 + (12.867 − lat) · 1236) with the
// east coast just seaward of them. Times are section seconds.
const TOWNS = [
  { name: "Bansud", x: 451, y: 140, at: 19.65 },
  { name: "Bongabong", x: 490, y: 285, at: 19.45 },
  { name: "Roxas", x: 531, y: 491, at: 19.25 },
  { name: "Mansalay", x: 430, y: 573, at: 14.45, home: true },
  { name: "Bulalacao", x: 330, y: 800, at: 19.85 },
];
const COAST: [number, number][] = [
  [474, 60],
  [487, 140],
  [529, 285],
  [571, 408],
  [565, 491],
  [510, 540],
  [457, 569],
  [426, 655],
  [392, 735],
  [354, 804],
  [270, 841],
  [149, 865],
];
const BOATS: [number, number, number][] = [
  [640, 110, 15],
  [690, 215, 20],
  [770, 370, 30],
  [705, 600, -20],
  [630, 705, -35],
  [610, 800, -45],
];

// A smooth line through the points (Catmull-Rom as cubic Béziers).
const smooth = (pts: [number, number][]) => {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [p0, p1, p2, p3] = [pts[Math.max(0, i - 1)], pts[i], pts[i + 1], pts[Math.min(pts.length - 1, i + 2)]];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0]} ${p2[1]}`;
  }
  return d;
};
const COAST_D = smooth(COAST);

// A bangka seen from above: hull, two outrigger floats and their crossbars.
const Bangka: React.FC<{ x: number; y: number; heading: number; at: number }> = ({ x, y, heading, at }) => {
  const frame = useCurrentFrame();
  const s = useAppSpring(at);
  const bob = Math.sin((frame + x) / 14) * 3;
  return (
    <g transform={`translate(${x} ${y + bob}) rotate(${heading}) scale(${1.25 * s})`} opacity={interpolate(s, [0, 0.3], [0, 1], clamp)}>
      <path d="M0 -20 C 6 -10, 6 12, 0 22 C -6 12, -6 -10, 0 -20 Z" fill="#EAF2FF" />
      <path d="M-17 -9 H 17 M-17 9 H 17" stroke="#EAF2FF" strokeWidth={2.5} />
      <path d="M-17 -16 V 16 M17 -16 V 16" stroke="#EAF2FF" strokeWidth={4} strokeLinecap="round" />
    </g>
  );
};

// A dashed route that draws itself from its start.
const DrawDashed: React.FC<{ id: string; d: string; from: number; to: number }> = ({ id, d, from, to }) => {
  const p = interpolate(useCurrentFrame(), [from, to], [0, 1], clamp);
  return (
    <>
      <defs>
        <mask id={id}>
          <path d={d} fill="none" stroke="#FFFFFF" strokeWidth={16} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
        </mask>
      </defs>
      <path d={d} fill="none" stroke={PALETTE.amber} strokeWidth={5} strokeDasharray="12 10" strokeLinecap="round" mask={`url(#${id})`} />
    </>
  );
};

const TownPin: React.FC<{ at: number; x: number; y: number; name: string; home?: boolean }> = ({ at, x, y, name, home }) => {
  const frame = useCurrentFrame();
  const s = useAppSpring(at);
  const ring = interpolate(frame, [at + 2, at + 26], [0, 1], clamp);
  return (
    <>
      {frame >= at && ring < 1 ? (
        <div
          style={{
            position: "absolute",
            left: x - 22 - 40 * ring,
            top: y - 22 - 40 * ring,
            width: 44 + 80 * ring,
            height: 44 + 80 * ring,
            borderRadius: "50%",
            boxSizing: "border-box",
            border: `3px solid ${home ? PALETTE.amber : "#EAF2FF"}`,
            opacity: 1 - ring,
          }}
        />
      ) : null}
      <div style={{ position: "absolute", left: x - 22, top: y - 22, display: "flex", alignItems: "center", gap: 18, opacity: interpolate(s, [0, 0.3], [0, 1], clamp) }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            background: home ? PALETTE.amber : "#EAF2FF",
            border: `6px solid ${NAVY_DEEP}`,
            boxShadow: home ? `0 0 26px ${PALETTE.amber}` : "0 0 0 3px rgba(234,242,255,0.3)",
            transform: `scale(${s})`,
          }}
        />
        <span style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 36, color: home ? PALETTE.amber : "#FFFFFF", transform: `translateX(${(1 - s) * -16}px)` }}>{name}</span>
        {home ? (
          <span style={{ padding: "3px 10px", borderRadius: 8, background: PALETTE.amber, fontFamily: FONT.mono, fontWeight: 700, fontSize: 16, letterSpacing: 2, color: NAVY_DEEP }}>HOME</span>
        ) : null}
      </div>
    </>
  );
};

// One mark per cooperative session (deck copy: the national plan's count), filling as the count runs.
const Tally: React.FC<{ from: number; step: number }> = ({ from, step }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", gap: 8, opacity: interpolate(frame, [from - 6, from], [0, 1], clamp) }}>
      {Array.from({ length: N.coopSessions }, (_, i) => {
        const at = from + i * step;
        const on = interpolate(frame, [at, at + 4], [0, 1], clamp);
        const pop = interpolate(frame, [at, at + 3, at + 8], [1, 1.2, 1], clamp);
        return (
          <div
            key={i}
            style={{
              width: 40,
              height: 40,
              borderRadius: 11,
              boxSizing: "border-box",
              border: `2px solid ${interpolateColors(on, [0, 1], ["rgba(234,242,255,0.25)", PALETTE.amber])}`,
              background: interpolateColors(on, [0, 1], ["rgba(234,242,255,0.04)", PALETTE.amber]),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${pop})`,
            }}
          >
            <Glyph d={USERS} circles={HEAD} size={24} color={on > 0.5 ? PALETTE.brand950 : "rgba(234,242,255,0.35)"} />
          </div>
        );
      })}
    </div>
  );
};

// What each session brings, drawn as the things themselves.
const KitItem: React.FC<{ at: number; x: number; label: string; children: React.ReactNode }> = ({ at, x, label, children }) => {
  const s = useAppSpring(at);
  const lab = useAppSpring(at + 6);
  return (
    <div style={{ position: "absolute", left: x - 140, top: 662, width: 280, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div
        style={{
          position: "relative",
          height: 160,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: interpolate(s, [0, 0.25], [0, 1], clamp),
          transform: `translateY(${(1 - s) * 50}px) scale(${0.5 + 0.5 * s})`,
        }}
      >
        <div style={{ position: "absolute", width: 210, height: 210, borderRadius: "50%", background: `radial-gradient(circle, ${PALETTE.amber}33 0%, ${PALETTE.amber}00 65%)` }} />
        {children}
      </div>
      <div style={{ marginTop: 8, fontFamily: FONT.sans, fontWeight: 700, fontSize: 32, color: "#FFFFFF", opacity: interpolate(lab, [0, 0.4], [0, 1], clamp) }}>{label}</div>
    </div>
  );
};

// A Tagalog guide booklet ("Gabay sa FishPin": a guide to FishPin).
const GuideBook: React.FC = () => (
  <div style={{ position: "relative", width: 124, height: 156 }}>
    <div style={{ position: "absolute", inset: 0, borderRadius: 10, background: "#DCE6F7", transform: "rotate(7deg) translate(10px, 4px)" }} />
    <div style={{ position: "absolute", inset: 0, borderRadius: 10, overflow: "hidden", background: "#FFFFFF", transform: "rotate(-4deg)", boxShadow: "0 14px 26px rgba(0,0,0,0.4)" }}>
      <div style={{ height: 60, background: PALETTE.amber, padding: "9px 12px", boxSizing: "border-box" }}>
        <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 13, color: INK }}>Gabay sa</div>
        <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 22, lineHeight: 1, color: INK }}>FishPin</div>
      </div>
      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {[100, 84, 92, 70, 88].map((w, i) => (
          <div key={i} style={{ width: `${w}%`, height: 7, borderRadius: 4, background: "#D5DDEB" }} />
        ))}
      </div>
    </div>
  </div>
);

// An SOS card ("Pindutin nang 3 segundo": press for 3 seconds).
const SosCardArt: React.FC = () => (
  <div
    style={{
      width: 176,
      height: 112,
      borderRadius: 16,
      background: "#DC2626",
      transform: "rotate(6deg)",
      boxShadow: "0 14px 26px rgba(0,0,0,0.4)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Glyph d={SOS_CARD} size={30} color="#FFFFFF" />
      <span style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 44, lineHeight: 1, letterSpacing: 2, color: "#FFFFFF" }}>SOS</span>
    </div>
    <span style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 13, color: "rgba(255,255,255,0.92)" }}>Pindutin nang 3 segundo</span>
  </div>
);

// 0:14 · the go-to-market plan, not yet run (v31, v32): boats along the coast
// on "where they are", fifteen sessions, the five towns reached from Mansalay,
// and what each session brings.
const ReachBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const R = (s: number) => f(s - 13.8); // section seconds as frames in this beat
  const land = interpolate(frame, [0, 16], [0, 1], clamp);
  const coast = interpolate(frame, [2, 26], [0, 1], clamp);
  const region = interpolate(frame, [R(20.2), R(20.7)], [0, 1], clamp);
  const where = useAppSpring(R(18.4));
  const kit = useAppSpring(R(21.95));
  return (
    <AbsoluteFill>
      <ContourField glowAt={[22, 50]} />
      <Vignette />
      <svg width={900} height={1080} viewBox="0 0 900 1080" style={{ position: "absolute", left: 0, top: 0 }}>
        <path d={`${COAST_D} L 100 880 L 100 60 Z`} fill="#16306A" opacity={0.9 * land} />
        {[38, 92].map((dx, i) => (
          <path key={dx} d={COAST_D} transform={`translate(${dx} 0)`} fill="none" stroke="#EAF2FF" strokeOpacity={i ? 0.12 : 0.2} strokeWidth={2} strokeDasharray="6 10" opacity={land} />
        ))}
        <path d={COAST_D} fill="none" stroke="#EAF2FF" strokeOpacity={0.6} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - coast} />
        <text x={800} y={250} transform="rotate(78 800 250)" fill="#EAF2FF" opacity={0.28 * land} fontFamily={FONT.mono} fontSize={22} letterSpacing={10}>
          TABLAS STRAIT
        </text>
        <g transform="translate(150 110)" opacity={0.5 * land}>
          <path d="M0 -26 L9 4 L0 -2 L-9 4 Z" fill="#EAF2FF" />
          <text x={0} y={26} textAnchor="middle" fill="#EAF2FF" fontFamily={FONT.mono} fontSize={18} fontWeight={700}>
            N
          </text>
        </g>
        {BOATS.map(([x, y, h], i) => (
          <Bangka key={i} x={x} y={y} heading={h} at={R(15.3) + i * 3} />
        ))}
        <DrawDashed id="route-north" d="M430 573 Q 505 548 531 491 Q 548 380 490 285 Q 466 205 451 140" from={R(19.05)} to={R(19.7)} />
        <DrawDashed id="route-south" d="M430 573 Q 398 690 330 800" from={R(19.35)} to={R(19.85)} />
      </svg>
      <div style={{ position: "absolute", left: 150, top: 400, opacity: 0.35 + 0.65 * region }}>
        <Mono size={22} color={interpolateColors(region, [0, 1], [PALETTE.mist, PALETTE.amber])}>
          SOUTHERN
          <br />
          ORIENTAL MINDORO
        </Mono>
      </div>
      {TOWNS.map((t) => (
        <TownPin key={t.name} at={R(t.at)} x={t.x} y={t.y} name={t.name} home={t.home} />
      ))}

      {/* the plan, on the right */}
      <div style={{ position: "absolute", left: 960, top: 104, width: 900 }}>
        <Rise startAt={4}>
          <Eyebrow>Go-to-market plan</Eyebrow>
        </Rise>
        <div style={{ display: "flex", flexWrap: "wrap", columnGap: 20, marginTop: 14, width: 880 }}>
          <WordIn at={R(14.2)} text="We'll reach fishers" size={68} />
          <WordIn at={R(15.3)} text="where they are." hi size={68} />
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 20, marginTop: 26 }}>
          <Num to={N.coopSessions} startAt={R(16.68)} length={24} size={130} color={PALETTE.amber} />
          <Rise startAt={R(17.25)}>
            <span style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 50, color: "#FFFFFF" }}>cooperative sessions</span>
          </Rise>
        </div>
        <div style={{ marginTop: 16 }}>
          <Tally from={R(16.7)} step={2.4} />
        </div>
        <div style={{ marginTop: 22, opacity: interpolate(where, [0, 0.4], [0, 1], clamp), transform: `translateY(${(1 - where) * 14}px)` }}>
          <Mono size={30} color="#EAF2FF">
            at the landing sites of <span style={{ color: PALETTE.amber, fontWeight: 700 }}>{N.towns.length} towns</span>
          </Mono>
        </div>
      </div>
      <div style={{ position: "absolute", left: 960, top: 618, opacity: interpolate(kit, [0, 0.4], [0, 1], clamp) }}>
        <Eyebrow>We'll bring</Eyebrow>
      </div>
      <KitItem at={R(22.18)} x={1080} label="Demo phones">
        <Img src={staticFile("mockups/map.png")} style={{ height: 160, width: (160 * 1310) / 2708, transform: "rotate(-8deg)", filter: "drop-shadow(0 16px 24px rgba(0,0,0,0.5))" }} />
      </KitItem>
      <KitItem at={R(23.28)} x={1370} label="Tagalog guides">
        <GuideBook />
      </KitItem>
      <KitItem at={R(24.78)} x={1660} label="SOS cards">
        <SosCardArt />
      </KitItem>
    </AbsoluteFill>
  );
};

export const S7Business: React.FC = () => (
  <AbsoluteFill style={{ background: NAVY_DEEP }}>
    <Beat at={0} len={13.8} enter="contour">
      <ModelBeat />
    </Beat>
    <Beat at={13.8} len={13.2} enter="whip">
      <ReachBeat />
    </Beat>

    <Sfx at={0} file="whoosh.wav" volume={0.45} />
    <Sfx at={1.0} file="ping.wav" volume={0.3} />
    {Array.from({ length: 7 }, (_, i) => 2.35 + i * 0.19).map((t) => (
      <Sfx key={t} at={t} file="tick.wav" volume={0.22} />
    ))}
    <Sfx at={4.0} file="whoosh.wav" volume={0.22} />
    <Sfx at={4.6} file="ping.wav" volume={0.4} />
    <Sfx at={6.05} file="whoosh.wav" volume={0.3} />
    {[8.25, 9.2, 10.05].map((t) => (
      <Sfx key={t} at={t} file="tick.wav" volume={0.35} />
    ))}
    <Sfx at={10.8} file="whoosh.wav" volume={0.35} />
    <Sfx at={11.25} file="whoosh.wav" volume={0.25} />
    <Sfx at={11.4} file="thud.wav" volume={0.5} />
    <Sfx at={12.2} file="whoosh.wav" volume={0.3} />
    <Sfx at={12.5} file="ping.wav" volume={0.4} />
    <Sfx at={13.75} file="whoosh.wav" volume={0.45} />
    {[15.3, 15.45].map((t) => (
      <Sfx key={t} at={t} file="tick.wav" volume={0.25} />
    ))}
    <Sfx at={16.68} file="count-up-24.wav" volume={0.4} />
    <Sfx at={17.48} file="ping.wav" volume={0.35} />
    <Sfx at={19.05} file="whoosh.wav" volume={0.2} />
    {[19.25, 19.45, 19.65, 19.85].map((t) => (
      <Sfx key={t} at={t} file="tick.wav" volume={0.3} />
    ))}
    {[22.18, 23.28, 24.78].map((t) => (
      <Sfx key={t} at={t} file="ping.wav" volume={0.3} />
    ))}

    <Narration section={7} />
  </AbsoluteFill>
);

// ------------------------------------------------------------ 8 · Financials 4:06–4:36
// Figures from the regional work and financial plan ("D. YFC Financials_Work
// and Financial Plan - FishPin Regional.xlsx"): total investment ₱284,915
// funded by the two grants and the proponent's counterpart; 1,000 licences in
// year one; payback 0.67 years and return on investment 148.6% (DA template).
// Deck copy: every figure below now comes from the national plan via deck-numbers.json.

// Deck copy: the national work and financial plan (deck-data.js fin.*).
const SPLIT: { at: number; label: string; amount: number; color: string; note?: string }[] = [
  { at: 5.15, label: "Provincial grant", amount: N.grantProvincial, color: PALETTE.mist },
  { at: 6.8, label: "Regional grant", amount: N.grantRegional, color: "#40a2ff" },
  { at: 8.4, label: "National grant", amount: N.grantNational, color: PALETTE.amber },
  { at: 9.95, label: "Our counterpart", amount: N.counterpart, color: "#EAF2FF", note: `${peso(N.counterpartInKind)} in kind · ${peso(N.counterpartCash)} from sales` },
];
const TOTAL = SPLIT.reduce((s, p) => s + p.amount, 0);

// 0:00 · ₱284,915 counts up on "two hundred eighty-five thousand"; each share
// fills its part of the bar as it is named (v33).
const InvestBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const W = 1500;
  return (
    <AbsoluteFill>
      <ContourField glowAt={[50, 35]} />
      <Vignette />
      <div style={{ position: "absolute", left: 210, top: 180 }}>
        <Rise startAt={4}>
          <Eyebrow>Total investment</Eyebrow>
        </Rise>
        <div style={{ marginTop: 18 }}>
          <Num to={TOTAL} startAt={f(2.0)} length={40} size={150} prefix="₱" />
        </div>
      </div>
      <div style={{ position: "absolute", left: 210, top: 520, width: W, height: 96, borderRadius: 20, background: "rgba(234,242,255,0.08)", overflow: "hidden", display: "flex" }}>
        {SPLIT.map((p) => {
          const grow = interpolate(frame, [f(p.at), f(p.at) + 18], [0, 1], clamp);
          return <div key={p.label} style={{ width: (W * p.amount * grow) / TOTAL, height: "100%", background: p.color, borderRight: `4px solid ${NAVY_DEEP}` }} />;
        })}
      </div>
      <div style={{ position: "absolute", left: 210, top: 660, width: W, display: "flex", gap: 48 }}>
        {SPLIT.map((p) => (
          <Rise key={p.label} startAt={f(p.at)}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ width: 22, height: 22, borderRadius: 6, background: p.color }} />
              <Mono size={30} color="#EAF2FF">
                {p.label}
              </Mono>
            </div>
            <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 56, color: p.color, marginTop: 8 }}>₱{p.amount.toLocaleString("en-US")}</div>
            {p.note ? (
              <Mono size={22} color={PALETTE.mist}>
                {p.note}
              </Mono>
            ) : null}
          </Rise>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// Year one as three cards that build with the voice (v34): the licences and
// their monthly ramp, the payback (a twelve-month strip filling to month 8),
// then the return on investment. Figures from the regional plan: the adoption
// ramp of 25 … 135 licences a month (1,000 in year one), payback 0.67 years,
// ROI 148.6% (DA template rows). Section seconds.
// Deck copy: the ramp, licences, payback and ROI come from deck-data.js (fin.ramp, unitsY1, payback, roi).
const RAMP: number[] = N.ramp;
const PAYBACK_MONTHS = Math.round(N.payback * 12);
const TRENDING = ["M16 7h6v6", "m22 7-8.5 8.5-5-5L2 17"]; // Lucide trending-up

// A tear-off desk calendar: one page per month of year one.
const CalendarPage: React.FC<{ month: number }> = ({ month }) => (
  <div style={{ position: "absolute", inset: 0, borderRadius: 18, overflow: "hidden", background: "#F4F7FC", boxShadow: "0 14px 30px rgba(0,0,0,0.35)" }}>
    <div style={{ height: 58, background: PALETTE.amber, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: PALETTE.brand950 }}>MONTH</span>
    </div>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "calc(100% - 58px)" }}>
      <span style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 116, lineHeight: 1, color: PALETTE.brand950 }}>{month}</span>
      <span style={{ fontFamily: FONT.mono, fontSize: 20, color: "#5A6886", marginTop: 6 }}>of 12</span>
    </div>
  </div>
);

// The calendar runs from month 1 to 8 between `from` and `to` (frames), fast
// then settling (ease-out), each torn page flying off; then PAID BACK stamps it.
const RunningCalendar: React.FC<{ from: number; to: number; months: number }> = ({ from, to, months }) => {
  const frame = useCurrentFrame();
  const steps = months - 1;
  // the frame each page tears off: the inverse of an ease-out cubic
  const tear = (k: number) => from + (to - from) * (1 - Math.cbrt(1 - k / steps));
  let current = 1;
  for (let k = 1; k <= steps; k++) if (frame >= tear(k)) current = k + 1;
  const stamp = useAppSpring(to + 2);
  const W = 250;
  const H = 230;
  return (
    <div style={{ position: "relative", width: W, height: H + 18, margin: "0 auto" }}>
      {/* the binding rings */}
      {[0.3, 0.7].map((x) => (
        <div key={x} style={{ position: "absolute", left: W * x - 7, top: -10, width: 14, height: 32, borderRadius: 7, background: "#9FB3D9", zIndex: 3, boxShadow: "0 2px 4px rgba(0,0,0,0.4)" }} />
      ))}
      <div style={{ position: "absolute", left: 0, top: 10, width: W, height: H }}>
        {/* the pages left underneath, then the current one */}
        <div style={{ position: "absolute", inset: 0, transform: "translate(5px, 6px)", borderRadius: 18, background: "#C9D4E8" }} />
        <CalendarPage month={current} />
        {/* the page just torn off flies away */}
        {Array.from({ length: steps }, (_, i) => i + 1).map((k) => {
          const t0 = tear(k);
          const p = interpolate(frame, [t0, t0 + 7], [0, 1], clamp);
          if (frame < t0 || p >= 1) return null;
          return (
            <div
              key={k}
              style={{
                position: "absolute",
                inset: 0,
                transformOrigin: "20% 0%",
                transform: `translate(${-90 * p}px, ${-110 * p}px) rotate(${-28 * p}deg)`,
                opacity: 1 - p,
              }}
            >
              <CalendarPage month={k} />
            </div>
          );
        })}
        {/* PAID BACK, stamped on the last page */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "88%",
            padding: "4px 14px",
            border: `5px solid ${PALETTE.amber}`,
            borderRadius: 12,
            background: "rgba(6,18,51,0.92)",
            fontFamily: FONT.sans,
            fontWeight: 800,
            fontSize: 24,
            letterSpacing: 2,
            whiteSpace: "nowrap",
            color: PALETTE.amber,
            opacity: interpolate(stamp, [0, 0.2], [0, 1], clamp),
            transform: `translate(-50%, -50%) rotate(-10deg) scale(${1.7 - 0.7 * Math.min(1, stamp)})`,
          }}
        >
          PAID BACK
        </div>
      </div>
    </div>
  );
};

const YearCard: React.FC<{ at: number; hi?: boolean; label: string; children: React.ReactNode }> = ({ at, hi, label, children }) => {
  const s = useAppSpring(at);
  return (
    <div
      style={{
        width: 540,
        height: 480,
        boxSizing: "border-box",
        padding: "36px 38px",
        borderRadius: 30,
        background: hi ? "rgba(255,200,87,0.07)" : "rgba(6,18,51,0.86)",
        border: `2px solid ${hi ? PALETTE.amber : "rgba(234,242,255,0.16)"}`,
        boxShadow: hi ? `0 0 46px ${PALETTE.amber}30, 0 30px 60px rgba(0,0,0,0.4)` : "0 30px 60px rgba(0,0,0,0.4)",
        display: "flex",
        flexDirection: "column",
        opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
        transform: `translateY(${(1 - s) * 50}px) scale(${0.94 + 0.06 * s})`,
      }}
    >
      <Mono size={24} color={hi ? PALETTE.amber : PALETTE.mist}>
        {label}
      </Mono>
      {children}
    </div>
  );
};

const ReturnBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const B = (s: number) => f(s - 11.0); // section seconds as frames in this beat
  const paidAt = B(15.55);
  return (
    <AbsoluteFill>
      <ContourField glowAt={[50, 50]} />
      <Vignette />
      <div style={{ position: "absolute", left: 0, right: 0, top: 170, display: "flex", justifyContent: "center" }}>
        <Rise startAt={4}>
          <Eyebrow>Year one</Eyebrow>
        </Rise>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 270, display: "flex", justifyContent: "center", gap: 40 }}>
        {/* 1 · the licences, and the monthly ramp they build from */}
        <YearCard at={B(11.3)} label="LICENCES SOLD">
          <div style={{ marginTop: 18 }}>
            <Num to={N.yearOneLicences} startAt={B(11.41)} length={24} size={112} color="#FFFFFF" />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120, marginTop: "auto" }}>
            {RAMP.map((n, i) => {
              const grow = interpolate(frame, [B(11.5) + i * 1.6, B(11.5) + i * 1.6 + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
              return <div key={i} style={{ flex: 1, height: (120 * n * grow) / Math.max(...RAMP), borderRadius: 5, background: i === 11 ? PALETTE.amber : "rgba(159,179,217,0.5)" }} />;
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
            <Mono size={18} color={PALETTE.mist}>
              month 1 · {RAMP[0]}
            </Mono>
            <Mono size={18} color={PALETTE.amber}>
              month 12 · {RAMP[11]}
            </Mono>
          </div>
        </YearCard>

        {/* 2 · the payback: a calendar runs through the months to 8, then PAID BACK */}
        <YearCard at={B(14.25)} hi label="PAYS BACK IN">
          <div style={{ marginTop: 26 }}>
            <RunningCalendar from={B(14.4)} to={paidAt} months={PAYBACK_MONTHS} />
          </div>
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <span style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 44, lineHeight: 1.1, color: PALETTE.amber, whiteSpace: "nowrap" }}>{PAYBACK_MONTHS} months</span>
            <Mono size={22} color={PALETTE.mist}>
              {N.payback} of a year
            </Mono>
          </div>
        </YearCard>

        {/* 3 · the return */}
        <YearCard at={B(15.4)} label="RETURN ON INVESTMENT">
          <div style={{ marginTop: 18 }}>
            <Num to={Math.round(N.roi * 10) / 10} dp={1} suffix="%" startAt={B(15.5)} length={24} size={112} color="#FFFFFF" />
          </div>
          <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 18 }}>
            <Tile startAt={B(15.6)} d={TRENDING} size={76} />
            <Mono size={24} color={PALETTE.mist}>
              in year one
            </Mono>
          </div>
        </YearCard>
      </div>
    </AbsoluteFill>
  );
};

// Lucide megaphone
const MEGAPHONE = ["m3 11 18-5v12L3 14v-3z", "M11.6 16.8a3 3 0 1 1-5.8-1.6"];

// What the regional grant funds (the plan's note), each named in v35.
const FUND_USES: { at: number; title: string; sub: string; icon: string[]; circles?: [number, number, number][] }[] = [
  { at: 18.45, title: "Social media campaign", sub: "Facebook, TikTok and the Play Store listing", icon: MEGAPHONE },
  { at: 20.5, title: "The iPhone version", sub: "a test iPhone and the Apple Developer Program", icon: PHONE },
  { at: 22.2, title: "Commercial weather licence", sub: "weather and marine data", icon: CLOUD_SUN },
  { at: 24.1, title: "15 cooperative sessions", sub: "in five coastal towns", icon: USERS, circles: HEAD },
  { at: 26.7, title: "Tagalog guides and SOS cards", sub: "1,000 printed", icon: BOOK },
];
const GRANT_OUT: [number, number] = [560, 510]; // where the funding lines leave the grant
const USE_X = 880;
const USE_Y = (i: number) => 170 + i * 132; // top of each card

const bezier = (t: number, p: number[]) => (1 - t) ** 3 * p[0] + 3 * (1 - t) ** 2 * t * p[1] + 3 * (1 - t) * t ** 2 * p[2] + t ** 3 * p[3];

// A funding line from the grant to a card: draws on, then keeps flowing, with
// a coin riding it to the card.
const FundLine: React.FC<{ i: number; at: number }> = ({ i, at }) => {
  const frame = useCurrentFrame();
  const y = USE_Y(i) + 56;
  const [x0, y0] = GRANT_OUT;
  const xs = [x0, x0 + 160, USE_X - 160, USE_X];
  const ys = [y0, y0, y, y];
  const d = `M${x0} ${y0} C${xs[1]} ${ys[1]}, ${xs[2]} ${ys[2]}, ${USE_X} ${y}`;
  const draw = interpolate(frame, [at, at + 10], [0, 1], clamp);
  const ride = interpolate(frame, [at, at + 14], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  if (frame < at) return null;
  return (
    <>
      <defs>
        <mask id={`fund-${i}`}>
          <path d={d} fill="none" stroke="#FFFFFF" strokeWidth={14} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        </mask>
      </defs>
      <path d={d} fill="none" stroke={PALETTE.amber} strokeOpacity={0.85} strokeWidth={4} strokeDasharray="10 12" strokeDashoffset={-(frame - at) * 1.6} mask={`url(#fund-${i})`} />
      {ride < 1 ? (
        <g transform={`translate(${bezier(ride, xs)} ${bezier(ride, ys)})`}>
          <circle r={15} fill={PALETTE.amber} style={{ filter: `drop-shadow(0 0 10px ${PALETTE.amber})` }} />
          <text y={7} textAnchor="middle" fontFamily={FONT.sans} fontWeight={800} fontSize={19} fill={NAVY_DEEP}>
            ₱
          </text>
        </g>
      ) : null}
    </>
  );
};

const UseCard: React.FC<{ i: number; at: number; title: string; sub: string; icon: string[]; circles?: [number, number, number][] }> = ({ i, at, title, sub, icon, circles }) => {
  const frame = useCurrentFrame();
  const s = useAppSpring(at + 8);
  const lit = interpolate(frame, [at + 12, at + 16, at + 40], [0, 1, 0.35], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: USE_X,
        top: USE_Y(i),
        width: 900,
        height: 112,
        boxSizing: "border-box",
        padding: "0 26px",
        borderRadius: 24,
        display: "flex",
        alignItems: "center",
        gap: 24,
        background: "rgba(6,18,51,0.86)",
        border: `2px solid ${interpolateColors(lit, [0, 1], ["rgba(234,242,255,0.14)", PALETTE.amber])}`,
        boxShadow: `0 0 ${30 * lit}px ${PALETTE.amber}55`,
        opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
        transform: `translateX(${(1 - s) * 60}px)`,
      }}
    >
      <Tile startAt={at + 8} d={icon} circles={circles} size={72} />
      <div>
        <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 38, lineHeight: 1.1, color: "#FFFFFF" }}>{title}</div>
        <Mono size={22} color={PALETTE.mist}>
          {sub}
        </Mono>
      </div>
    </div>
  );
};

// 0:17 · where the ₱150,000 regional grant goes: the grant on the left, and a
// funding line to each use as it is named (v35).
const FundsBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const F = (s: number) => f(s - 16.7); // section seconds as frames in this beat
  const g = useAppSpring(4);
  const pulse = FUND_USES.reduce((m, u) => Math.max(m, interpolate(frame, [F(u.at), F(u.at) + 4, F(u.at) + 14], [0, 1, 0], clamp)), 0);
  const also = useAppSpring(F(27.6));
  return (
    <AbsoluteFill>
      <ContourField glowAt={[22, 50]} />
      <Vignette />
      <div style={{ position: "absolute", left: 140, top: 96 }}>
        <Rise startAt={4}>
          <Eyebrow>Where the regional grant goes</Eyebrow>
        </Rise>
      </div>
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 330,
          width: 420,
          height: 360,
          borderRadius: 34,
          boxSizing: "border-box",
          padding: 34,
          background: `linear-gradient(160deg, ${PALETTE.amber} 0%, #F5B23A 100%)`,
          boxShadow: `0 30px 70px rgba(0,0,0,0.45), 0 0 ${50 + 40 * pulse}px ${PALETTE.amber}66`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          opacity: interpolate(g, [0, 0.3], [0, 1], clamp),
          transform: `scale(${(0.9 + 0.1 * g) * (1 + 0.03 * pulse)})`,
        }}
      >
        <div style={{ width: 84, height: 84, borderRadius: 42, background: NAVY_DEEP, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 48, color: PALETTE.amber }}>₱</span>
        </div>
        <div style={{ marginTop: 26 }}>
          <Num to={150000} startAt={F(17.0)} length={24} size={74} prefix="₱" color={NAVY_DEEP} />
        </div>
        <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 34, color: NAVY_DEEP, marginTop: 8 }}>regional grant</div>
      </div>
      <div style={{ position: "absolute", left: 140, top: 724, width: 440, opacity: interpolate(also, [0, 0.4], [0, 1], clamp) }}>
        <Mono size={22} color={PALETTE.mist}>
          also internet, the development subscription and notarization
        </Mono>
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        {FUND_USES.map((u, i) => (
          <FundLine key={u.title} i={i} at={F(u.at)} />
        ))}
      </svg>
      {FUND_USES.map((u, i) => (
        <UseCard key={u.title} i={i} at={F(u.at)} title={u.title} sub={u.sub} icon={u.icon} circles={u.circles} />
      ))}
    </AbsoluteFill>
  );
};

export const S8Financials: React.FC = () => (
  <AbsoluteFill style={{ background: NAVY_DEEP }}>
    <Beat at={0} len={11.0} enter="contour">
      <InvestBeat />
    </Beat>
    <Beat at={11.0} len={5.7} enter="whip">
      <ReturnBeat />
    </Beat>
    <Beat at={16.7} len={13.3} enter="whip">
      <FundsBeat />
    </Beat>

    <Sfx at={0} file="whoosh.wav" volume={0.45} />
    <Sfx at={2.0} file="count-up-40.wav" volume={0.4} />
    <Sfx at={3.35} file="ping.wav" volume={0.35} />
    {SPLIT.map((p) => (
      <Sfx key={p.at} at={p.at} file="tick.wav" volume={0.4} />
    ))}
    <Sfx at={10.95} file="whoosh.wav" volume={0.45} />
    <Sfx at={11.41} file="count-up-24.wav" volume={0.4} />
    <Sfx at={12.2} file="ping.wav" volume={0.35} />
    {Array.from({ length: 7 }, (_, i) => 14.4 + (15.55 - 14.4) * (1 - Math.cbrt(1 - (i + 1) / 7))).map((t) => (
      <Sfx key={t} at={t} file="tick.wav" volume={0.3} />
    ))}
    <Sfx at={15.55} file="ping.wav" volume={0.4} />
    <Sfx at={15.5} file="count-up-24.wav" volume={0.3} />
    <Sfx at={16.65} file="whoosh.wav" volume={0.45} />
    <Sfx at={17.0} file="count-up-24.wav" volume={0.35} />
    {FUND_USES.map((u) => (
      <React.Fragment key={u.at}>
        <Sfx at={u.at - 0.05} file="whoosh.wav" volume={0.18} />
        <Sfx at={u.at + 0.45} file="ping.wav" volume={0.3} />
      </React.Fragment>
    ))}

    <Narration section={8} />
  </AbsoluteFill>
);

// ------------------------------------------------------------ 9 · Ask and close 4:36–4:48

// The MIMAROPA map (PSA 2023 boundaries, see scripts/build-mimaropa-map.mjs).
// Section seconds: "MIMAROPA" is spoken at 3.07.
const M_TYPE = 3.0;
const M_ZOOM = 3.75;
const MAP_BOX = { x: 140, y: 250, w: 640, h: 680 };

type Fit = { s: number; tx: number; ty: number };
const fit = ([x0, y0, x1, y1]: number[]): Fit => {
  const s = Math.min(MAP_BOX.w / (x1 - x0), MAP_BOX.h / (y1 - y0));
  return { s, tx: MAP_BOX.x + (MAP_BOX.w - (x1 - x0) * s) / 2 - x0 * s, ty: MAP_BOX.y + (MAP_BOX.h - (y1 - y0) * s) / 2 - y0 * s };
};
const COUNTRY_FIT = fit(MIMAROPA.countryBox);
const REGION_FIT = fit(MIMAROPA.regionBox);
const toScreen = ([x, y]: number[]): [number, number] => [x * REGION_FIT.s + REGION_FIT.tx, y * REGION_FIT.s + REGION_FIT.ty];

// Each province's fill.
const FILL: Record<string, string> = {
  Marinduque: "#FFE3A3",
  "Occidental Mindoro": "#F2B13C",
  "Oriental Mindoro": "#FFC857",
  Romblon: "#FFD27A",
  Palawan: "#E8A33A",
};
// Where each name sits once zoomed in: the point on the map it points from
// (map units) and the label's left or right edge (screen px). The eastern names
// stack in a column on the right, joined to their islands by leader lines.
const LABELS: Record<string, { from: number[]; pos: [number, number]; align: "left" | "right" }> = {
  Marinduque: { from: [556, 811], pos: [840, 282], align: "left" },
  "Oriental Mindoro": { from: [494, 845], pos: [840, 334], align: "left" },
  Mansalay: { from: MIMAROPA.mansalay, pos: [840, 386], align: "left" },
  Romblon: { from: [600, 905], pos: [840, 438], align: "left" },
  "Occidental Mindoro": { from: [352, 836], pos: [462, 318], align: "right" },
  Palawan: { from: [330, 1080], pos: [520, 600], align: "left" },
};

const MapLabel: React.FC<{ at: number; name: string; small?: boolean }> = ({ at: start, name, small }) => {
  const frame = useCurrentFrame();
  const s = useAppSpring(start);
  const { from, pos, align } = LABELS[name];
  const right = align === "right";
  const [ax, ay] = toScreen(from);
  const ex = right ? pos[0] + 10 : pos[0] - 10;
  const draw = interpolate(frame, [start, start + 8], [0, 1], clamp);
  return (
    <>
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={ax} y1={ay} x2={ax + (ex - ax) * draw} y2={ay + (pos[1] - ay) * draw} stroke={small ? PALETTE.amber : "#EAF2FF"} strokeOpacity={0.75} strokeWidth={2} />
        <circle cx={ax} cy={ay} r={4} fill={small ? PALETTE.amber : "#EAF2FF"} opacity={draw} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: right ? undefined : pos[0],
          right: right ? 1920 - pos[0] : undefined,
          top: pos[1] - 22,
          whiteSpace: "nowrap",
          fontFamily: small ? FONT.mono : FONT.sans,
          fontWeight: 700,
          fontSize: small ? 28 : 32,
          color: small ? PALETTE.amber : "#FFFFFF",
          textShadow: "0 3px 14px rgba(0,0,0,0.75)",
          opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
          transform: `translateX(${(1 - s) * (right ? 20 : -20)}px)`,
        }}
      >
        {name}
      </div>
    </>
  );
};

const MimaropaMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const appear = interpolate(frame, [f(M_TYPE), f(M_TYPE) + 9], [0, 1], clamp);
  const zoom = interpolate(frame, [f(M_ZOOM), f(M_ZOOM) + 24], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const s = COUNTRY_FIT.s + (REGION_FIT.s - COUNTRY_FIT.s) * zoom;
  const tx = COUNTRY_FIT.tx + (REGION_FIT.tx - COUNTRY_FIT.tx) * zoom;
  const ty = COUNTRY_FIT.ty + (REGION_FIT.ty - COUNTRY_FIT.ty) * zoom;
  const rest = (0.45 - 0.35 * zoom) * appear;
  const typed = Math.round(interpolate(frame, [f(M_TYPE), f(M_TYPE) + 10], [0, 8], clamp));
  const pinAt = f(5.15);
  const pin = spring({ frame: frame - pinAt, fps, config: { damping: 9, stiffness: 160, mass: 0.6 } });
  const [mx, my] = toScreen(MIMAROPA.mansalay);
  if (frame < f(M_TYPE)) return null;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: MAP_BOX.x, top: 120, fontFamily: FONT.sans, fontWeight: 800, fontSize: 96, lineHeight: 1, letterSpacing: 4, color: PALETTE.amber, textShadow: "0 6px 30px rgba(0,0,0,0.55)" }}>
        {"MIMAROPA".slice(0, typed)}
        <span style={{ visibility: "hidden" }}>{"MIMAROPA".slice(typed)}</span>
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <linearGradient id="map-fade" gradientUnits="userSpaceOnUse" x1={920} y1={0} x2={1120} y2={0}>
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#000000" />
          </linearGradient>
          <mask id="map-mask" maskUnits="userSpaceOnUse" x={0} y={0} width={1920} height={1080}>
            <rect x={0} y={0} width={1920} height={1080} fill="url(#map-fade)" />
          </mask>
        </defs>
        <g mask="url(#map-mask)">
        <g transform={`translate(${tx} ${ty}) scale(${s})`}>
          {MIMAROPA.regions
            .filter((r) => !r.mimaropa)
            .map((r) => (
              <path key={r.name} d={r.d} fill="#EAF2FF" opacity={rest} />
            ))}
          {MIMAROPA.provinces.map((p, i) => {
            const on = interpolate(frame, [f(M_TYPE) + 6 + i * 2, f(M_TYPE) + 14 + i * 2], [0, 1], clamp);
            return <path key={p.name} d={p.d} fill={FILL[p.name]} stroke={NAVY_DEEP} strokeWidth={1.4} vectorEffect="non-scaling-stroke" opacity={on} style={{ filter: `drop-shadow(0 0 ${6 + 10 * zoom}px rgba(255,200,87,0.45))` }} />;
          })}
        </g>
        </g>
        {frame >= pinAt
          ? [0, 14].map((d) => {
              const p = ((frame - pinAt + d) % 28) / 28;
              return <circle key={d} cx={mx} cy={my} r={8 + p * 46} fill="none" stroke="#FFFFFF" strokeWidth={3} opacity={(1 - p) * 0.9} />;
            })
          : null}
        {frame >= pinAt ? (
          <g transform={`translate(${mx} ${my}) scale(${pin})`}>
            <path d="M0 0 C -6 -10, -20 -18, -20 -33 A 20 20 0 1 1 20 -33 C 20 -18, 6 -10, 0 0 Z" fill="#FFFFFF" stroke={NAVY_DEEP} strokeWidth={3} />
            <circle cx={0} cy={-33} r={8} fill={NAVY_DEEP} />
          </g>
        ) : null}
      </svg>
      {MIMAROPA.provinces.map((p, i) => (
        <MapLabel key={p.name} at={f(4.45) + i * 3} name={p.name} />
      ))}
      <MapLabel at={pinAt + 6} name="Mansalay" small />
    </AbsoluteFill>
  );
};

// 0:00 · the ask (v36) over the founder seen from behind, looking out at the
// bancas: the fishers it is for (Raw videos/avp/20261013_163059.mp4), with a
// slow push in. The words are the caption's; on screen, MIMAROPA on the map.
const AskBeat: React.FC = () => (
  <AbsoluteFill>
    <Clip src="9-ask-lookout" from={0} len={7.6} rate={0.49} volume={0} dim={0.25} push={[1.0, 1.28]} />
    <Shade side="left" strength={0.9} />
    <MimaropaMap />
  </AbsoluteFill>
);

// 0:07 · end card: the mark, the wordmark, the line (v37).
const EndCard: React.FC = () => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
    <ContourField glowAt={[50, 45]} />
    <Vignette />
    {/* positioned, so the mark paints above the full-frame background */}
    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
      <AnimatedMark id="end" startAt={4} size={230} />
      <WordReveal startAt={14} height={92} />
      <Rise startAt={f(1.1)}>
        <span style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 56, color: "#FFFFFF" }}>
          Safer seas for every <span style={{ color: PALETTE.amber }}>Filipino fisher.</span>
        </span>
      </Rise>
      <Rise startAt={f(3.2)}>
        <Mono size={28} color={PALETTE.mist}>
          DA Young Farmers Challenge 2026 · MIMAROPA · fishpin.app
        </Mono>
      </Rise>
    </div>
  </AbsoluteFill>
);

export const S9Close: React.FC = () => (
  <AbsoluteFill style={{ background: NAVY_DEEP }}>
    <Beat at={0} len={7.0} enter="contour">
      <AskBeat />
    </Beat>
    <Beat at={7.0} len={5.0} enter="fade">
      <EndCard />
    </Beat>

    <Sfx at={0} file="whoosh.wav" volume={0.45} />
    {Array.from({ length: 8 }, (_, i) => 3.0 + i * 0.04).map((t) => (
      <Sfx key={t} at={t} file="tick.wav" volume={0.18} />
    ))}
    <Sfx at={3.75} file="whoosh.wav" volume={0.3} />
    {[4.45, 4.55, 4.65, 4.75, 4.85].map((t) => (
      <Sfx key={t} at={t} file="tick.wav" volume={0.3} />
    ))}
    <Sfx at={5.15} file="ping.wav" volume={0.4} />
    <Sfx at={6.95} file="whoosh.wav" volume={0.4} />
    <Sfx at={7.6} file="ping.wav" volume={0.45} />

    <Narration section={9} />
  </AbsoluteFill>
);
