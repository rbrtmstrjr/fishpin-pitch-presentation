import React from "react";
import { AbsoluteFill, Img, interpolate, interpolateColors, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useAppSpring } from "../motion/primitives";
import { ContourField, Mono, NAVY_DEEP, Rise, Vignette } from "../pitch/kit";
import { f } from "../pitch/timing";
import { FONT, PALETTE } from "../theme";
import { Eyebrow } from "../ui/brand";
import { Framed, MOCK_H, MOCK_W } from "./demo";
import { Beat, Glyph, Narration, Num, Sfx } from "./parts";

// Section 6: status of implementation. Times are seconds into the section;
// sections 7–9 are in closing.tsx and reuse the tile and icons here.

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Lucide map-pin, trophy, users, laptop, sparkles, smartphone
export const PIN = ["M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"];
export const TROPHY = [
  "M6 9H4.5a2.5 2.5 0 0 1 0-5H6",
  "M18 9h1.5a2.5 2.5 0 0 0 0-5H18",
  "M4 22h16",
  "M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22",
  "M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22",
  "M18 2H6v7a6 6 0 0 0 12 0V2Z",
];
export const USERS = ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M22 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"];
const LAPTOP = ["M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2z", "M20.054 15.987H3.946"];
const SPARKLES = [
  "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
  "M20 3v4",
  "M22 5h-4",
];
const PHONE = ["M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z", "M12 18h.01"];
const HEAD: [number, number, number][] = [[9, 7, 4]]; // the head in Lucide's users icon

// An amber tile with a navy glyph, as on the value cards.
export const Tile: React.FC<{ startAt: number; d: string[]; circles?: [number, number, number][]; size?: number }> = ({ startAt, d, circles, size = 96 }) => {
  const s = useAppSpring(startAt);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 4,
        background: PALETTE.amber,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
        transform: `scale(${s}) rotate(${(1 - s) * -20}deg)`,
      }}
    >
      <Glyph d={d} circles={circles} size={size * 0.56} />
    </div>
  );
};

// A stat read off the FishPin dashboard: the number counts, the label settles.
const Stat: React.FC<{ startAt: number; to: number; label: string }> = ({ startAt, to, label }) => {
  const s = useAppSpring(startAt);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 16,
        padding: "16px 26px",
        borderRadius: 20,
        background: "rgba(6,18,51,0.86)",
        border: "2px solid rgba(234,242,255,0.16)",
        opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
        transform: `translateY(${(1 - s) * 24}px)`,
      }}
    >
      <Num to={to} startAt={startAt} length={18} size={56} color={PALETTE.amber} />
      <Mono size={28} color="#EAF2FF">
        {label}
      </Mono>
    </div>
  );
};

// A chip with an icon, for what the prize pays for.
const UseChip: React.FC<{ startAt: number; icon: string[]; children: string }> = ({ startAt, icon, children }) => {
  const s = useAppSpring(startAt);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "16px 26px",
        borderRadius: 999,
        background: "rgba(6,18,51,0.86)",
        border: `2px solid ${PALETTE.amber}`,
        opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
        transform: `scale(${0.7 + 0.3 * s})`,
      }}
    >
      <Glyph d={icon} size={40} color={PALETTE.amber} />
      <span style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 38, color: "#FFFFFF" }}>{children}</span>
    </div>
  );
};

// ------------------------------------------------------------ 6 · Status 3:10–3:39

// Lucide download, gauge, compass, thumbs-up, message-circle, forward
const DOWNLOAD = ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "m7 10 5 5 5-5", "M12 15V3"];
const GAUGE = ["m12 14 4-4", "M3.34 19a10 10 0 1 1 17.32 0"];
const COMPASS = ["m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"];
const THUMBS = ["M7 10v12", "M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"];
const COMMENT = ["M7.9 20A9 9 0 1 0 4 16.1L2 22Z"];
const SHARE = ["m15 14 5-5-5-5", "M4 20v-7a4 4 0 0 1 4-4h12"];

// A phone of the given height: a Play Store mockup, or a capture set into the
// same iPhone frame.
const FanPhone: React.FC<{ h: number; src?: string; capture?: string }> = ({ h, src, capture }) => {
  const s = h / MOCK_H;
  return (
    <div style={{ width: MOCK_W * s, height: h }}>
      {capture ? (
        <div style={{ width: MOCK_W, height: MOCK_H, transform: `scale(${s})`, transformOrigin: "0 0" }}>
          <Framed base="sos.png" src={capture} fill="#EEF4FB" />
        </div>
      ) : (
        <Img src={staticFile(`mockups/${src}`)} style={{ width: MOCK_W * s, height: h, display: "block" }} />
      )}
    </div>
  );
};

// An amber callout, as on the Play Store hero image.
const Callout: React.FC<{ at: number; icon: string[]; circles?: [number, number, number][]; children: string; style: React.CSSProperties }> = ({ at, icon, circles, children, style }) => {
  const s = useAppSpring(at);
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 24px",
        borderRadius: 18,
        whiteSpace: "nowrap",
        background: PALETTE.amber,
        boxShadow: "0 16px 34px rgba(0,0,0,0.4)",
        opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
        transform: `scale(${0.6 + 0.4 * s})`,
        ...style,
      }}
    >
      <Glyph d={icon} circles={circles} size={34} />
      <span style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 32, color: PALETTE.brand950 }}>{children}</span>
    </div>
  );
};

// 0:00 · "An idea" is struck through on "idea"; on "live" the app rises on its
// sign-in screen, its other screens fan out behind and the callouts pop on (v25).
const LiveBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const strike = interpolate(frame, [f(1.55), f(1.95)], [0, 1], clamp);
  const centre = useAppSpring(f(2.35));
  const left = useAppSpring(f(2.8));
  const right = useAppSpring(f(2.95));
  const live = useAppSpring(f(3.0));
  const pulse = 0.5 + 0.5 * Math.sin(frame / 6);
  const CX = 1420; // the fan's centre
  const [H, h] = [720, 600];
  const [W, w] = [(H * 1310) / 2708, (h * 1310) / 2708];
  const side = (s: number, dir: -1 | 1): React.CSSProperties => ({
    position: "absolute",
    left: CX + dir * 270 - w / 2,
    top: 236,
    opacity: interpolate(s, [0, 0.2], [0, 1], clamp),
    transform: `translateX(${(1 - s) * -dir * 270}px) rotate(${dir * 8 * s}deg)`,
    transformOrigin: "50% 100%",
    filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.5)) brightness(0.85)",
  });
  return (
    <AbsoluteFill>
      <ContourField glowAt={[74, 45]} />
      <Vignette />
      <div style={{ position: "absolute", left: 150, top: 220, width: 780 }}>
        <Rise startAt={f(0.4)}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <span style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 96, color: PALETTE.mist, opacity: interpolate(strike, [0, 1], [1, 0.55]) }}>An idea.</span>
            <div style={{ position: "absolute", left: -10, top: "54%", height: 12, borderRadius: 6, width: `calc(${strike * 100}% + 20px)`, background: PALETTE.amber }} />
          </div>
        </Rise>
        <Rise startAt={f(2.5)}>
          <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 100, lineHeight: 1.05, color: "#FFFFFF", marginTop: 14 }}>
            Live on
            <br />
            Google Play.
          </div>
        </Rise>
        <Rise startAt={f(4.1)}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginTop: 34 }}>
            <svg width={38} height={38} viewBox="0 0 24 24" fill="none" stroke={PALETTE.amber} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2 }}>
              <path d={PIN[0]} />
              <circle cx={12} cy={10} r={3} />
            </svg>
            <Mono size={32} color="#EAF2FF">
              Built and supported in
              <br />
              Mansalay, Oriental Mindoro
            </Mono>
          </div>
        </Rise>
      </div>

      <div style={side(left, -1)}>
        <FanPhone h={h} src="score-90.png" />
      </div>
      <div style={side(right, 1)}>
        <FanPhone h={h} src="navigate.png" />
      </div>
      <div
        style={{
          position: "absolute",
          left: CX - W / 2,
          top: 150,
          opacity: interpolate(centre, [0, 0.2], [0, 1], clamp),
          transform: `translateY(${(1 - centre) * 240}px)`,
          filter: "drop-shadow(0 40px 50px rgba(0,0,0,0.55))",
        }}
      >
        <FanPhone h={H} capture="pitch5/img/login-sign-in.png" />
      </div>
      <div
        style={{
          position: "absolute",
          left: CX,
          top: 884,
          transform: `translateX(-50%) scale(${live})`,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 22px",
          borderRadius: 999,
          background: "#0E2A1B",
          border: "2px solid #22C55E",
          fontFamily: FONT.mono,
          fontWeight: 700,
          fontSize: 26,
          color: "#4ADE80",
          letterSpacing: 3,
        }}
      >
        <span style={{ width: 14, height: 14, borderRadius: 7, background: "#22C55E", opacity: 0.4 + 0.6 * pulse }} />
        LIVE
      </div>
      <Callout at={f(3.4)} icon={DOWNLOAD} style={{ left: CX + 20, top: 300 }}>
        Works offline
      </Callout>
      <Callout at={f(3.6)} icon={GAUGE} style={{ left: CX - 470, top: 610 }}>
        Fishing score 90
      </Callout>
      <Callout at={f(3.8)} icon={COMPASS} circles={[[12, 12, 10]]} style={{ left: CX - 40, top: 740 }}>
        4.6 nm to your spot
      </Callout>
    </AbsoluteFill>
  );
};

// The 35 users as figures (a 7 x 5 unit chart). Which ones are among the 21
// active in the last 30 days, and the 6 new this month, is a fixed shuffle so
// they light up across the grid rather than in reading order.
const USERS_TOTAL = 35;
const ACTIVE = 21;
const NEW = 6;
const ORDER = (() => {
  const idx = Array.from({ length: USERS_TOTAL }, (_, i) => i);
  let seed = 7;
  for (let i = idx.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
})();
const RANK = Object.fromEntries(ORDER.map((u, k) => [u, k])); // a figure's place in the shuffle

const Figure: React.FC<{ appear: number; active: number; isNew: number }> = ({ appear, active, isNew }) => {
  const color = interpolateColors(active, [0, 1], ["rgba(234,242,255,0.38)", PALETTE.amber]);
  return (
    <svg width={56} height={63} viewBox="0 0 32 36" style={{ overflow: "visible", opacity: appear, transform: `scale(${0.4 + 0.6 * appear})` }}>
      <circle cx={16} cy={10} r={8} fill={color} />
      <path d="M1 35 C 1 24, 31 24, 31 35 Z" fill={color} />
      {isNew > 0 ? (
        <g transform={`translate(28 4) scale(${isNew})`}>
          <circle r={7} fill="#FFFFFF" />
          <path d="M0 -4.5 L1.3 -1.3 L4.5 0 L1.3 1.3 L0 4.5 L-1.3 1.3 L-4.5 0 L-1.3 -1.3 Z" fill={PALETTE.amber} />
        </g>
      ) : null}
    </svg>
  );
};

// 0:07 · thirty-five users appear as figures while the count runs; on "already
// use FishPin" the 21 active this month light up and the 6 new ones spark.
// Then, on "demos at our landing site come next", today's users step aside and
// a path draws to the next step (v26).
const TractionBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (s: number) => f(s - 6.8); // section seconds as frames in this beat
  const aside = useAppSpring(t(11.0));
  const legend = interpolate(frame, [t(10.9), t(11.2)], [1, 0], clamp);
  const path = interpolate(frame, [t(11.4), t(12.1)], [0, 1], clamp);
  const next = useAppSpring(t(11.95));
  const sub = useAppSpring(t(12.6));
  const today = useAppSpring(t(11.3));
  const CELL = [92, 100];
  // the grid: right side while it is being counted, then small at the lower left
  const gx = interpolate(aside, [0, 1], [1060, 170]);
  const gy = interpolate(aside, [0, 1], [250, 590]);
  const gs = interpolate(aside, [0, 1], [1, 0.6]);
  return (
    <AbsoluteFill>
      <ContourField glowAt={[62, 45]} />
      <Vignette />
      <div style={{ position: "absolute", left: 160, top: 170 }}>
        <Rise startAt={6}>
          <Eyebrow>Already in use</Eyebrow>
        </Rise>
        <div style={{ display: "flex", alignItems: "center", gap: 26, marginTop: 20 }}>
          <Num to={35} startAt={t(7.1)} length={20} size={170} color={PALETTE.amber} />
          <Rise startAt={t(7.75)}>
            <span style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 80, color: "#FFFFFF" }}>users</span>
          </Rise>
        </div>
        <Rise startAt={t(8.25)}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10 }}>
            <svg width={38} height={38} viewBox="0 0 24 24" fill="none" stroke={PALETTE.amber} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d={PIN[0]} />
              <circle cx={12} cy={10} r={3} />
            </svg>
            <Mono size={34} color="#EAF2FF">
              from around the Philippines
            </Mono>
          </div>
        </Rise>
      </div>

      {/* the figures */}
      <div style={{ position: "absolute", left: gx, top: gy, transform: `scale(${gs})`, transformOrigin: "0 0", width: CELL[0] * 7, height: CELL[1] * 5 }}>
        {Array.from({ length: USERS_TOTAL }, (_, i) => {
          const k = RANK[i];
          const appear = spring({ frame: frame - t(7.1) - i * 0.6, fps, config: { damping: 14, stiffness: 180, mass: 0.6 } });
          const active = k < ACTIVE ? interpolate(frame, [t(9.45) + k, t(9.45) + k + 6], [0, 1], clamp) : 0;
          const isNew = k < NEW ? spring({ frame: frame - t(10.25) - k * 2, fps, config: { damping: 10, stiffness: 200, mass: 0.5 } }) : 0;
          return (
            <div key={i} style={{ position: "absolute", left: (i % 7) * CELL[0], top: Math.floor(i / 7) * CELL[1] }}>
              <Figure appear={appear} active={active} isNew={isNew} />
            </div>
          );
        })}
      </div>

      {/* the legend while the grid is on the right */}
      <div style={{ position: "absolute", left: 1060, top: 760, display: "flex", gap: 40, opacity: legend }}>
        <Rise startAt={t(9.5)}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 22, height: 22, borderRadius: 11, background: PALETTE.amber }} />
            <span style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 34, color: PALETTE.amber }}>21</span>
            <Mono size={26} color="#EAF2FF">
              active in the last 30 days
            </Mono>
          </div>
        </Rise>
        <Rise startAt={t(10.3)}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <svg width={26} height={26} viewBox="-8 -8 16 16">
              <circle r={7} fill="#FFFFFF" />
              <path d="M0 -4.5 L1.3 -1.3 L4.5 0 L1.3 1.3 L0 4.5 L-1.3 1.3 L-4.5 0 L-1.3 -1.3 Z" fill={PALETTE.amber} />
            </svg>
            <span style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 34, color: "#FFFFFF" }}>6</span>
            <Mono size={26} color="#EAF2FF">
              new this month
            </Mono>
          </div>
        </Rise>
      </div>

      {/* today, then the path to the next step */}
      <div style={{ position: "absolute", left: 170, top: 540, opacity: interpolate(today, [0, 0.4], [0, 1], clamp) }}>
        <Mono size={26} color={PALETTE.amber}>
          TODAY · 35 USERS
        </Mono>
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <mask id="next-path">
            <path d="M600 740 C 700 740, 760 700, 900 700" fill="none" stroke="#FFFFFF" strokeWidth={14} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - path} />
          </mask>
        </defs>
        <path d="M600 740 C 700 740, 760 700, 900 700" fill="none" stroke={PALETTE.amber} strokeWidth={5} strokeDasharray="14 12" mask="url(#next-path)" />
        <path d="M884 688 L904 700 L884 712" fill="none" stroke={PALETTE.amber} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" opacity={path > 0.95 ? 1 : 0} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 930,
          top: 600,
          display: "flex",
          alignItems: "center",
          gap: 28,
          padding: "26px 34px",
          borderRadius: 28,
          background: "rgba(6,18,51,0.9)",
          border: `3px solid ${PALETTE.amber}`,
          boxShadow: `0 0 40px ${PALETTE.amber}33`,
          opacity: interpolate(next, [0, 0.3], [0, 1], clamp),
          transform: `translateX(${(1 - next) * 60}px) scale(${0.92 + 0.08 * next})`,
        }}
      >
        <Tile startAt={t(12.0)} d={USERS} circles={HEAD} size={96} />
        <div>
          <span style={{ padding: "5px 14px", borderRadius: 10, background: PALETTE.amber, fontFamily: FONT.mono, fontWeight: 700, fontSize: 24, letterSpacing: 2, color: NAVY_DEEP }}>NEXT</span>
          <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 46, color: "#FFFFFF", marginTop: 12 }}>Demos at our landing site</div>
          <div style={{ opacity: interpolate(sub, [0, 0.4], [0, 1], clamp), marginTop: 4 }}>
            <Mono size={26} color={PALETTE.mist}>
              right after the in-app purchase release
            </Mono>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// The Young Farmers Challenge announcement as a clean Facebook-style post:
// the program's header, a one-line caption, the founder poster and the action
// bar (no like counts: it shows only what the post says).
const PostCard: React.FC = () => {
  const frame = useCurrentFrame();
  const s = useAppSpring(6);
  const W = 480;
  return (
    <div
      style={{
        position: "absolute",
        left: 1270,
        top: 92,
        width: W,
        borderRadius: 22,
        overflow: "hidden",
        background: "#163170",
        boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(159,197,255,0.22)",
        opacity: interpolate(s, [0, 0.2], [0, 1], clamp),
        transform: `translate(${(1 - s) * 320}px, ${Math.sin(frame / 30) * 4}px) rotate(${2 + (1 - s) * 6}deg)`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 20px 12px" }}>
        <div style={{ width: 52, height: 52, borderRadius: 26, background: PALETTE.amber, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Glyph d={TROPHY} size={30} />
        </div>
        <div>
          <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 21, color: "#E4E6EB" }}>Young Farmers Challenge</div>
          <div style={{ fontFamily: FONT.sans, fontSize: 15, color: "#B0B3B8" }}>Oriental Mindoro · Provincial round</div>
        </div>
      </div>
      <div style={{ padding: "0 20px 14px", fontFamily: FONT.sans, fontSize: 19, lineHeight: 1.35, color: "#E4E6EB" }}>
        Congratulations to <b>Robert Maestro Jr.</b> of FishPin, provincial winner of the DA Young Farmers Challenge!
      </div>
      <div style={{ background: "#1F4290" }}>
        <Img src={staticFile("pitch5/img/fishpin_maestro_robert.png")} style={{ width: W, height: (W * 1350) / 1080, display: "block" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-around", padding: "12px 10px", borderTop: "1px solid #2B4F9C" }}>
        {(
          [
            [THUMBS, "Like"],
            [COMMENT, "Comment"],
            [SHARE, "Share"],
          ] as [string[], string][]
        ).map(([d, label]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Glyph d={d} size={22} color="#B0B3B8" />
            <span style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 17, color: "#B0B3B8" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 0:14 · the provincial win and the ₱80,000, then what it builds: each item
// lands on its words (v27). The program's post sits beside it.
const AwardBeat: React.FC = () => (
  <AbsoluteFill>
    <ContourField glowAt={[30, 45]} />
    <Vignette />
    <div style={{ position: "absolute", left: 150, top: 220, width: 1060 }}>
      <Rise startAt={4}>
        <Eyebrow>DA Young Farmers Challenge</Eyebrow>
      </Rise>
      <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 26 }}>
        <Tile startAt={f(0.3)} d={TROPHY} size={110} />
        <Rise startAt={f(0.35)}>
          <span style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 86, color: "#FFFFFF" }}>Provincial winner</span>
        </Rise>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 22, marginTop: 36 }}>
        <Num to={80000} startAt={f(0.9)} length={27} size={120} prefix="₱" color={PALETTE.amber} />
        <Rise startAt={f(1.45)}>
          <Mono size={38} color="#EAF2FF">
            funds the build:
          </Mono>
        </Rise>
      </div>
      <div style={{ display: "flex", gap: 18, marginTop: 40, flexWrap: "wrap", width: 1000 }}>
        <UseChip startAt={f(2.9)} icon={LAPTOP}>
          Development PC
        </UseChip>
        <UseChip startAt={f(4.35)} icon={SPARKLES}>
          AI subscriptions
        </UseChip>
        <UseChip startAt={f(5.85)} icon={PHONE}>
          Demo phones
        </UseChip>
        <Rise startAt={f(6.5)}>
          <div style={{ padding: "22px 10px" }}>
            <Mono size={32} color={PALETTE.mist}>
              and more
            </Mono>
          </div>
        </Rise>
      </div>
    </div>
    <PostCard />
  </AbsoluteFill>
);

// 0:21 · the road so far and what comes next (v28): the trial lands on
// "seven-day trial", the one-time purchase on "paying once", then the
// landing-site demos.
// Deck copy (national round): the trial and Lifetime shipped on 17 Oct 2026 and the
// MIMAROPA regional round is won (deck-data.js traction.milestones); the iPhone version
// is the planned next step (iOS planned for Dec 2026).
const MILESTONES = [
  { at: 0.5, label: "Built in Mansalay", done: true },
  { at: 0.9, label: "Live on Google Play", done: true },
  { at: 1.3, label: "Provincial winner", done: true },
  { at: 1.75, label: "7-day trial, then Lifetime", done: true },
  { at: 2.2, label: "Regional winner", done: true },
  { at: 5.5, label: "iPhone version", done: false },
];

const TimelineBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const X0 = 200;
  const STEP = 304;
  const line = interpolate(frame, [f(0.4), f(1.4), f(1.6), f(1.9), f(2.05), f(2.35), f(5.3), f(5.6)], [0, 2, 2, 3, 3, 4, 4, 5], clamp);
  return (
    <AbsoluteFill>
      <ContourField glowAt={[50, 55]} />
      <Vignette />
      <div style={{ position: "absolute", left: 0, right: 0, top: 200, display: "flex", justifyContent: "center" }}>
        <Rise startAt={6}>
          <Eyebrow>Status of implementation</Eyebrow>
        </Rise>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 260, display: "flex", justifyContent: "center" }}>
        <Rise startAt={f(1.7)}>
          <span style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 84, color: "#FFFFFF" }}>
            Try it at sea, then <span style={{ color: PALETTE.amber }}>pay once.</span>
          </span>
        </Rise>
      </div>
      <div style={{ position: "absolute", left: X0, top: 596, height: 8, borderRadius: 4, width: STEP * 5, background: "rgba(234,242,255,0.14)" }} />
      <div style={{ position: "absolute", left: X0, top: 596, height: 8, borderRadius: 4, width: STEP * line, background: PALETTE.amber }} />
      {MILESTONES.map((m, i) => (
        <Milestone key={m.label} x={X0 + STEP * i} startAt={f(m.at)} label={m.label} done={m.done} />
      ))}
    </AbsoluteFill>
  );
};

const Milestone: React.FC<{ x: number; startAt: number; label: string; done: boolean }> = ({ x, startAt, label, done }) => {
  const frame = useCurrentFrame();
  const s = useAppSpring(startAt);
  const pulse = done ? 0 : Math.max(0, Math.sin((frame - startAt) / 7));
  return (
    <div style={{ position: "absolute", left: x - 140, top: 560, width: 280, display: "flex", flexDirection: "column", alignItems: "center", opacity: interpolate(s, [0, 0.3], [0, 1], clamp) }}>
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          background: done ? PALETTE.amber : NAVY_DEEP,
          border: `6px solid ${PALETTE.amber}`,
          boxShadow: done ? "none" : `0 0 ${20 + 24 * pulse}px ${PALETTE.amber}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${s})`,
        }}
      >
        {done ? (
          <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke={PALETTE.brand950} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : null}
      </div>
      <div style={{ marginTop: 24, textAlign: "center", fontFamily: FONT.sans, fontWeight: 700, fontSize: 34, lineHeight: 1.15, color: done ? "#EAF2FF" : PALETTE.amber }}>{label}</div>
      {done ? null : (
        <Mono size={22} color={PALETTE.mist}>
          NEXT
        </Mono>
      )}
    </div>
  );
};

export const S6Status: React.FC = () => (
  <AbsoluteFill style={{ background: NAVY_DEEP }}>
    <Beat at={0} len={6.8} enter="contour">
      <LiveBeat />
    </Beat>
    <Beat at={6.8} len={7.4} enter="whip">
      <TractionBeat />
    </Beat>
    <Beat at={14.2} len={7.0} enter="whip">
      <AwardBeat />
    </Beat>
    <Beat at={21.2} len={7.8} enter="contour">
      <TimelineBeat />
    </Beat>

    <Sfx at={0} file="whoosh.wav" volume={0.45} />
    <Sfx at={1.55} file="tick.wav" volume={0.5} />
    <Sfx at={2.4} file="whoosh.wav" volume={0.3} />
    <Sfx at={2.8} file="ping.wav" volume={0.4} />
    <Sfx at={6.75} file="whoosh.wav" volume={0.45} />
    <Sfx at={7.1} file="count-up-24.wav" volume={0.4} />
    <Sfx at={7.8} file="ping.wav" volume={0.35} />
    <Sfx at={9.3} file="tick.wav" volume={0.35} />
    <Sfx at={9.8} file="tick.wav" volume={0.35} />
    <Sfx at={11.35} file="ping.wav" volume={0.4} />
    <Sfx at={14.15} file="whoosh.wav" volume={0.45} />
    <Sfx at={15.1} file="count-up-27.wav" volume={0.4} />
    <Sfx at={16.0} file="ping.wav" volume={0.35} />
    {[17.1, 18.55, 20.05].map((t) => (
      <Sfx key={t} at={t} file="tick.wav" volume={0.35} />
    ))}
    <Sfx at={21.15} file="whoosh.wav" volume={0.45} />
    {[21.7, 22.1, 22.5].map((t) => (
      <Sfx key={t} at={t} file="tick.wav" volume={0.35} />
    ))}
    <Sfx at={22.95} file="ping.wav" volume={0.4} />
    <Sfx at={26.7} file="ping.wav" volume={0.4} />
    <Sfx at={27.4} file="ping.wav" volume={0.35} />

    <Narration section={6} />
  </AbsoluteFill>
);
