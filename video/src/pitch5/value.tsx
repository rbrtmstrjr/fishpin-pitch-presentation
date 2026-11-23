import React from "react";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { useAppSpring } from "../motion/primitives";
import { ContourField, Mono, NAVY_DEEP, Vignette } from "../pitch/kit";
import { f } from "../pitch/timing";
import { FONT, PALETTE } from "../theme";
import { Tile, USERS } from "./business";
import { T2 } from "./interviews";
import { Beat, Clip, Glyph, Headline, Interview, Narration, Sfx } from "./parts";

// ------------------------------------------------------------ 5 · Value 2:40–3:10
// The question over a fisherman at work; then each value as its own short
// scene on the contour background, cued to the voice (v21–v24); then the T2
// testimonial. Times are seconds into the section.

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const RED = "#F87171";

// Lucide shield-check, message-square, anchor, route, fuel, notebook-pen, fish, user, house
const SHIELD = ["M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z", "m9 12 2 2 4-4"];
const SMS = ["M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"];
const ANCHOR = ["M12 22V8", "M5 12H2a10 10 0 0 0 20 0h-3"];
const ROUTE = ["M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"];
const FUEL = ["M3 22h12", "M4 9h10", "M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18", "M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"];
const NOTEBOOK = [
  "M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4",
  "M2 6h4",
  "M2 10h4",
  "M2 14h4",
  "M2 18h4",
  "M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z",
];
const FISH = [
  "M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z",
  "M18 12v.5",
  "M16 17.93a9.77 9.77 0 0 1 0-11.86",
  "M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33",
];
const USER = ["M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"];
const HOUSE = ["M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8", "M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"];

// ------------------------------------------------------------------ pieces

// A scene inside the value beat: fades in over the one before, out at its end.
const Scene: React.FC<{ len: number; first?: boolean; children: React.ReactNode }> = ({ len, first, children }) => {
  const frame = useCurrentFrame();
  const o = Math.min(first ? 1 : interpolate(frame, [0, 8], [0, 1], clamp), interpolate(frame, [len, len + 8], [1, 0], clamp));
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

// A scene title at the top left, word groups landing with the voice.
const Title: React.FC<{ parts: [number, string, boolean?][] }> = ({ parts }) => (
  <div style={{ position: "absolute", left: 140, top: 120, display: "flex", gap: 24, flexWrap: "wrap", width: 1100 }}>
    {parts.map(([at, text, hi]) => (
      <Word key={text} at={at} text={text} hi={hi} />
    ))}
  </div>
);

const Word: React.FC<{ at: number; text: string; hi?: boolean }> = ({ at, text, hi }) => {
  const s = useAppSpring(at);
  return (
    <span
      style={{
        fontFamily: FONT.sans,
        fontWeight: 800,
        fontSize: 84,
        letterSpacing: -1,
        color: hi ? PALETTE.amber : "#FFFFFF",
        opacity: interpolate(s, [0, 0.4], [0, 1], clamp),
        transform: `translateY(${(1 - s) * 40}px)`,
      }}
    >
      {text}
    </span>
  );
};

// A rounded chip with an icon, popping in.
const Chip: React.FC<{ at: number; icon: string[]; circles?: [number, number, number][]; children: string; style?: React.CSSProperties }> = ({ at, icon, circles, children, style }) => {
  const s = useAppSpring(at);
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "16px 26px",
        borderRadius: 999,
        background: "rgba(6,18,51,0.86)",
        border: `2px solid ${PALETTE.amber}`,
        boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
        opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
        transform: `scale(${0.6 + 0.4 * s})`,
        ...style,
      }}
    >
      <Glyph d={icon} circles={circles} size={40} color={PALETTE.amber} />
      <span style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 38, color: "#FFFFFF" }}>{children}</span>
    </div>
  );
};

// ------------------------------------------------------------------ 1 · safer trips (v22)

// The shield draws itself on "safer trips"; the three tools that make it so pop around it.
const SaferScene: React.FC = () => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [3, 24], [0, 1], { ...clamp });
  const glow = useAppSpring(22);
  return (
    <AbsoluteFill>
      <Title
        parts={[
          [f(0.3), "Safer"],
          [f(0.8), "trips.", true],
        ]}
      />
      <div style={{ position: "absolute", left: 960 - 170, top: 330, width: 340, height: 340 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `radial-gradient(circle, ${PALETTE.amber}55 0%, ${PALETTE.amber}00 65%)`, opacity: glow }} />
        <svg width={340} height={340} viewBox="0 0 24 24" fill="none" stroke={PALETTE.amber} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
          {SHIELD.map((d, i) => (
            <path key={i} d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
          ))}
        </svg>
      </div>
      <Chip at={f(0.9)} icon={SMS} style={{ left: 380, top: 420 }}>
        SOS by SMS
      </Chip>
      <Chip at={f(1.05)} icon={ANCHOR} circles={[[12, 5, 3]]} style={{ left: 1210, top: 360 }}>
        Anchor alarm
      </Chip>
      <Chip at={f(1.2)} icon={ROUTE} circles={[[6, 19, 3], [18, 5, 3]]} style={{ left: 1250, top: 600 }}>
        Trip log
      </Chip>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 2 · less fuel, less searching (v23)

// A stylised chart: home harbour bottom left, a proven spot top right. Without
// a saved spot the boat wanders; with one it runs straight there.
const HOME: [number, number] = [330, 860];
const SPOT: [number, number] = [1480, 400];
const WANDER: [number, number][] = [HOME, [560, 700], [470, 520], [760, 600], [860, 380], [1080, 560], [1180, 300], [1360, 520], SPOT];

const along = (pts: [number, number][], p: number): [number, number] => {
  const lens = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  let d = p * lens.reduce((a, b) => a + b, 0);
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i] || i === lens.length - 1) {
      const t = Math.min(1, d / lens[i]);
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t];
    }
    d -= lens[i];
  }
  return pts[pts.length - 1];
};

const Boat: React.FC<{ x: number; y: number; color: string }> = ({ x, y, color }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={24} fill={color} stroke="#FFFFFF" strokeWidth={5} />
    <path d="M-11 2 L11 2 L7 9 L-7 9 Z M-1 -10 L-1 2 L8 -1 Z" fill="#FFFFFF" />
  </g>
);

// A fuel bar that fills as fuel is burned.
const Gauge: React.FC<{ y: number; label: string; color: string; fill: number; at: number }> = ({ y, label, color, fill, at }) => {
  const s = useAppSpring(at);
  return (
    <div style={{ position: "absolute", left: 1190, top: y, width: 600, opacity: interpolate(s, [0, 0.3], [0, 1], clamp) }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Glyph d={FUEL} size={34} color={color} />
        <Mono size={26} color="#EAF2FF">
          {label}
        </Mono>
      </div>
      <div style={{ marginTop: 10, height: 22, borderRadius: 11, background: "rgba(234,242,255,0.1)", overflow: "hidden" }}>
        <div style={{ width: `${fill * 100}%`, height: "100%", borderRadius: 11, background: color }} />
      </div>
    </div>
  );
};

const FuelScene: React.FC = () => {
  const frame = useCurrentFrame();
  const t = (s: number) => f(s - 4.75); // section seconds as frames in this scene
  const wander = interpolate(frame, [t(5.7), t(7.6)], [0, 1], clamp);
  const straight = interpolate(frame, [t(8.3), t(9.5)], [0, 1], { ...clamp });
  const spot = useAppSpring(t(5.0));
  const label = useAppSpring(t(9.1));
  const poly = `M${WANDER.map(([x, y]) => `${x} ${y}`).join(" L")}`;
  const [bx, by] = along(WANDER, wander);
  const [sx, sy] = [HOME[0] + (SPOT[0] - HOME[0]) * straight, HOME[1] + (SPOT[1] - HOME[1]) * straight];
  return (
    <AbsoluteFill>
      <Title
        parts={[
          [t(4.9), "Less fuel."],
          [t(6.6), "Less searching.", true],
        ]}
      />
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d="M0 760 C 160 740, 300 800, 420 900 S 560 1040, 640 1080 L 0 1080 Z" fill="#18336B" stroke="rgba(234,242,255,0.35)" strokeWidth={3} />
        <path
          d={poly}
          fill="none"
          stroke="rgba(234,242,255,0.55)"
          strokeWidth={7}
          strokeLinejoin="round"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - wander}
        />
        <line x1={HOME[0]} y1={HOME[1]} x2={sx} y2={sy} stroke={PALETTE.amber} strokeWidth={9} strokeLinecap="round" opacity={straight > 0 ? 1 : 0} style={{ filter: `drop-shadow(0 0 12px ${PALETTE.amber})` }} />
        <g transform={`translate(${SPOT[0]} ${SPOT[1]}) scale(${spot})`}>
          <path d="M0 0 C -8 -14, -30 -26, -30 -48 A 30 30 0 1 1 30 -48 C 30 -26, 8 -14, 0 0 Z" fill={PALETTE.amber} stroke="#FFFFFF" strokeWidth={5} />
          <circle cx={0} cy={-48} r={11} fill={NAVY_DEEP} />
        </g>
        <g transform={`translate(${HOME[0]} ${HOME[1]})`}>
          <circle r={34} fill="#EAF2FF" />
          <g transform="translate(-17 -17) scale(1.42)" fill="none" stroke={NAVY_DEEP} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            {HOUSE.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
        </g>
        {wander > 0 && straight === 0 ? <Boat x={bx} y={by} color="#64748B" /> : null}
        {straight > 0 ? <Boat x={sx} y={sy} color={PALETTE.amber} /> : null}
      </svg>
      <div style={{ position: "absolute", left: SPOT[0] + 44, top: SPOT[1] - 74, opacity: interpolate(label, [0, 0.4], [0, 1], clamp) }}>
        <Mono size={28} color={PALETTE.amber}>
          proven spot
        </Mono>
      </div>
      <div style={{ position: "absolute", left: HOME[0] - 40, top: HOME[1] + 44 }}>
        <Mono size={26} color="#EAF2FF">
          home
        </Mono>
      </div>
      <Gauge y={640} label="searching" color={RED} fill={wander} at={t(5.7)} />
      <Gauge y={740} label="straight back" color={PALETTE.amber} fill={0.32 * straight} at={t(8.3)} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 3 · a record of every catch (v24)
// One catch, followed through: the app names it and it drops into the catch
// log ("a record of every catch"); the fisher sees his own week ("for the
// fisher"); then the members' logs flow into one cooperative record ("and the
// cooperative"). Section seconds; the scene runs 10.55–14.9.

const LOG: [string, string][] = [
  ["Talakitok", "6:20 AM"],
  ["Galunggong", "7:05 AM"],
  ["Tulingan", "8:40 AM"],
];
const MEMBER_LOGS: [string, string][][] = [
  [
    ["Galunggong", "5:40 AM"],
    ["Bisugo", "7:15 AM"],
  ],
  [
    ["Tulingan", "6:05 AM"],
    ["Galunggong", "6:50 AM"],
  ],
  [
    ["Maya-maya", "5:55 AM"],
    ["Tulingan", "7:30 AM"],
  ],
];

const LogRow: React.FC<{ at: number; name: string; time: string }> = ({ at, name, time }) => {
  const s = useAppSpring(at);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "14px 18px",
        borderRadius: 18,
        background: "rgba(234,242,255,0.06)",
        opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
        transform: `translateX(${(1 - s) * 60}px)`,
      }}
    >
      <Glyph d={FISH} size={40} color={PALETTE.amber} />
      <span style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 36, color: "#FFFFFF", flex: 1 }}>{name}</span>
      <Mono size={24} color={PALETTE.mist}>
        {time}
      </Mono>
    </div>
  );
};

// A catch log card (600 wide); rows slide in at their frames.
const LogCard: React.FC<{ rows: [string, string][]; at: number[]; owner: string }> = ({ rows, at, owner }) => (
  <div
    style={{
      width: 600,
      padding: 26,
      boxSizing: "border-box",
      borderRadius: 28,
      background: "rgba(6,18,51,0.92)",
      border: "2px solid rgba(234,242,255,0.16)",
      boxShadow: "0 30px 60px rgba(0,0,0,0.4)",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
      <Tile startAt={0} d={NOTEBOOK} size={60} />
      <span style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 38, color: "#FFFFFF" }}>Catch log</span>
      <span style={{ marginLeft: "auto" }}>
        <Mono size={24} color={PALETTE.mist}>
          {owner}
        </Mono>
      </span>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {rows.map(([name, time], i) => (
        <LogRow key={name + i} at={at[i]} name={name} time={time} />
      ))}
    </div>
  </div>
);

// The species card from the app's fish guide (Giant Trevally · Mamsa ·
// Talakitok), cut from the guide mockup: snapped with a flash, then it flies
// into the log as the first entry.
const SPECIES = { x: 104, y: 654, w: 532, h: 682 }; // in the 1310x2708 mockup
const SpeciesSnap: React.FC<{ at: number; flyAt: number; to: [number, number] }> = ({ at, flyAt, to }) => {
  const frame = useCurrentFrame();
  const s = useAppSpring(at);
  const fly = interpolate(frame, [flyAt, flyAt + 12], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const flash = interpolate(frame, [at, at + 2, at + 9], [0, 0.9, 0], clamp);
  if (frame < at || fly >= 1) return null;
  const k = 0.6;
  const [x0, y0] = [250, 260];
  const x = x0 + (to[0] - x0) * fly;
  const y = y0 + (to[1] - y0) * fly;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: SPECIES.w * k,
          height: SPECIES.h * k,
          borderRadius: 22,
          overflow: "hidden",
          boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
          transformOrigin: "0 0",
          opacity: interpolate(s, [0, 0.2], [0, 1], clamp) * (1 - fly * 0.6),
          transform: `scale(${(0.9 + 0.1 * s) * (1 - 0.82 * fly)}) rotate(${-3 * (1 - fly)}deg)`,
        }}
      >
        <Img
          src={staticFile("mockups/chart.png")}
          style={{ position: "absolute", left: -SPECIES.x * k, top: -SPECIES.y * k, width: 1310 * k, height: 2708 * k, maxWidth: "none" }}
        />
        <AbsoluteFill style={{ background: "#FFFFFF", opacity: flash }} />
      </div>
      {fly === 0 ? (
        <svg width={SPECIES.w * k + 40} height={SPECIES.h * k + 40} style={{ position: "absolute", left: x0 - 20, top: y0 - 20, opacity: interpolate(s, [0, 0.3], [0, 1], clamp) }}>
          {[
            "M4 34 V4 H34",
            `M${SPECIES.w * k + 6} 4 H${SPECIES.w * k + 36} V34`,
            `M4 ${SPECIES.h * k + 6} V${SPECIES.h * k + 36} H34`,
            `M${SPECIES.w * k + 36} ${SPECIES.h * k + 6} V${SPECIES.h * k + 36} H${SPECIES.w * k + 6}`,
          ].map((d) => (
            <path key={d} d={d} fill="none" stroke={PALETTE.amber} strokeWidth={6} strokeLinecap="round" />
          ))}
        </svg>
      ) : null}
    </>
  );
};

// The fisher's own week: a bar per day and his best spot.
const WEEK = [0.45, 0.7, 0.3, 0.85, 0.6, 1.0, 0.5];
const FisherPanel: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const s = useAppSpring(at);
  const spot = useAppSpring(at + 9);
  return (
    <div
      style={{
        width: 470,
        padding: 26,
        boxSizing: "border-box",
        borderRadius: 28,
        background: "rgba(6,18,51,0.92)",
        border: `2px solid ${PALETTE.amber}`,
        boxShadow: `0 0 40px ${PALETTE.amber}33`,
        opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
        transform: `translateX(${(1 - s) * 60}px)`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Tile startAt={at} d={USER} circles={[[12, 7, 4]]} size={60} />
        <div>
          <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 36, color: "#FFFFFF" }}>For the fisher</div>
          <Mono size={22} color={PALETTE.mist}>
            his catches this week
          </Mono>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 120, marginTop: 22 }}>
        {WEEK.map((v, i) => {
          const grow = interpolate(frame, [at + 3 + i * 1.5, at + 13 + i * 1.5], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
          return <div key={i} style={{ flex: 1, height: 120 * v * grow, borderRadius: 8, background: i === 5 ? PALETTE.amber : "rgba(159,179,217,0.45)" }} />;
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <Mono key={i} size={18} color={PALETTE.mist}>
            {d}
          </Mono>
        ))}
      </div>
      <div
        style={{
          marginTop: 18,
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 16px",
          borderRadius: 999,
          background: PALETTE.amber,
          opacity: interpolate(spot, [0, 0.3], [0, 1], clamp),
          transform: `scale(${0.8 + 0.2 * spot})`,
        }}
      >
        <span style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 24, color: PALETTE.brand950 }}>Best spot · North Reef Edge</span>
      </div>
    </div>
  );
};

// The cooperative's record: every member's catches, species by species.
const COOP: [string, number][] = [
  ["Galunggong", 1.0],
  ["Tulingan", 0.8],
  ["Talakitok", 0.55],
  ["Bisugo", 0.4],
];
const CoopHub: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const s = useAppSpring(at);
  return (
    <div
      style={{
        width: 620,
        padding: 30,
        boxSizing: "border-box",
        borderRadius: 30,
        background: "rgba(6,18,51,0.94)",
        border: `2px solid ${PALETTE.amber}`,
        boxShadow: `0 0 50px ${PALETTE.amber}40`,
        opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
        transform: `scale(${0.9 + 0.1 * s})`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Tile startAt={at} d={USERS} circles={[[9, 7, 4]]} size={64} />
        <div>
          <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 40, color: "#FFFFFF" }}>Cooperative</div>
          <Mono size={22} color={PALETTE.mist}>
            every member's catch, in one record
          </Mono>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 24 }}>
        {COOP.map(([name, v], i) => {
          const grow = interpolate(frame, [at + 10 + i * 3, at + 24 + i * 3], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
          return (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ width: 170, fontFamily: FONT.sans, fontWeight: 700, fontSize: 26, color: "#EAF2FF" }}>{name}</span>
              <div style={{ flex: 1, height: 26, borderRadius: 13, background: "rgba(234,242,255,0.08)", overflow: "hidden" }}>
                <div style={{ width: `${v * 100 * grow}%`, height: "100%", borderRadius: 13, background: i === 0 ? PALETTE.amber : "rgba(255,200,87,0.6)" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const RecordScene: React.FC = () => {
  const frame = useCurrentFrame();
  const t = (s: number) => f(s - 10.55);
  const card = useAppSpring(t(10.95));
  const pull = interpolate(frame, [t(13.3), t(13.75)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const fisherOut = interpolate(frame, [t(13.25), t(13.45)], [1, 0], clamp);
  // the log: centre-left, then pulled back into the members' grid
  const LOG_AT: [number, number] = [640, 290];
  const GRID: [number, number][] = [
    [140, 300],
    [520, 300],
    [140, 540],
    [520, 540],
  ];
  const k = 0.58;
  const lx = LOG_AT[0] + (GRID[0][0] - LOG_AT[0]) * pull;
  const ly = LOG_AT[1] + (GRID[0][1] - LOG_AT[1]) * pull;
  const flow = interpolate(frame, [t(13.65), t(13.95)], [0, 1], clamp);
  const HUB: [number, number] = [1130, 330];
  return (
    <AbsoluteFill>
      <Title
        parts={[
          [t(10.7), "Every catch,"],
          [t(11.9), "on record.", true],
        ]}
      />

      {/* the lines into the cooperative (behind the cards), then the members' logs */}
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, opacity: flow > 0 ? 1 : 0 }}>
        {GRID.map(([gx, gy], i) => {
          const sx = gx + 600 * k;
          const sy = gy + 90;
          const ey = HUB[1] + 140 + i * 40;
          const d = `M${sx} ${sy} C${sx + 140} ${sy}, ${HUB[0] - 140} ${ey}, ${HUB[0]} ${ey}`;
          return (
            <React.Fragment key={i}>
              <defs>
                <mask id={`coop-${i}`}>
                  <path d={d} fill="none" stroke="#FFFFFF" strokeWidth={14} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - flow} />
                </mask>
              </defs>
              <path d={d} fill="none" stroke={PALETTE.amber} strokeOpacity={0.85} strokeWidth={4} strokeDasharray="10 12" strokeDashoffset={-frame * 1.6} mask={`url(#coop-${i})`} />
            </React.Fragment>
          );
        })}
      </svg>
      {MEMBER_LOGS.map((rows, i) => {
        const at = t(13.45 + i * 0.1);
        const s = interpolate(frame, [at, at + 8], [0, 1], clamp);
        const [gx, gy] = GRID[i + 1];
        return (
          <div key={i} style={{ position: "absolute", left: gx, top: gy, transformOrigin: "0 0", transform: `scale(${k * (0.9 + 0.1 * s)})`, opacity: s }}>
            <LogCard rows={rows} at={[0, 0]} owner="member" />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: HUB[0], top: HUB[1] }}>
        <CoopHub at={t(13.5)} />
      </div>

      {/* his log, the catch flying into it, his own week */}
      <div
        style={{
          position: "absolute",
          left: lx,
          top: ly,
          transformOrigin: "0 0",
          opacity: interpolate(card, [0, 0.3], [0, 1], clamp),
          transform: `scale(${(0.92 + 0.08 * card) * (1 - (1 - k) * pull)})`,
        }}
      >
        <LogCard rows={LOG} at={[t(11.4), t(11.65), t(11.9)]} owner={pull > 0.5 ? "member" : "today"} />
      </div>
      <SpeciesSnap at={t(10.85)} flyAt={t(11.2)} to={[LOG_AT[0] + 40, LOG_AT[1] + 100]} />
      <div style={{ position: "absolute", left: 1290, top: 290, opacity: fisherOut }}>
        <FisherPanel at={t(12.5)} />
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the three, together

const SUMMARY: [string[], [number, number, number][], string][] = [
  [SHIELD, [], "Safer trips"],
  [FUEL, [], "Less fuel, less searching"],
  [NOTEBOOK, [], "Every catch on record"],
];

const SummaryScene: React.FC = () => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
    <div style={{ position: "relative", display: "flex", gap: 90 }}>
      {SUMMARY.map(([icon, circles, label], i) => (
        <SummaryItem key={label} at={2 + i * 4} icon={icon} circles={circles} label={label} />
      ))}
    </div>
  </AbsoluteFill>
);

const SummaryItem: React.FC<{ at: number; icon: string[]; circles: [number, number, number][]; label: string }> = ({ at, icon, circles, label }) => {
  const s = useAppSpring(at);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22, opacity: interpolate(s, [0, 0.3], [0, 1], clamp), transform: `translateY(${(1 - s) * 30}px)` }}>
      <Tile startAt={at} d={icon} circles={circles} size={130} />
      <span style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 40, color: "#FFFFFF" }}>{label}</span>
    </div>
  );
};

// The value beat: four scenes on the contour background (section 3.0–16.0).
const Values: React.FC = () => {
  const B = (s: number) => f(s - 3.0); // section seconds as frames in this beat
  return (
    <AbsoluteFill>
      <ContourField glowAt={[50, 45]} />
      <Vignette />
      <Sequence from={B(3.0)} durationInFrames={B(4.75) + 8}>
        <Scene len={B(4.75)} first>
          <SaferScene />
        </Scene>
      </Sequence>
      <Sequence from={B(4.75)} durationInFrames={B(10.55) - B(4.75) + 8}>
        <Scene len={B(10.55) - B(4.75)}>
          <FuelScene />
        </Scene>
      </Sequence>
      <Sequence from={B(10.55)} durationInFrames={B(14.9) - B(10.55) + 8}>
        <Scene len={B(14.9) - B(10.55)}>
          <RecordScene />
        </Scene>
      </Sequence>
      <Sequence from={B(14.9)}>
        <Scene len={B(16.6) - B(14.9)}>
          <SummaryScene />
        </Scene>
      </Sequence>
    </AbsoluteFill>
  );
};

export const S5Value: React.FC = () => (
  <AbsoluteFill style={{ background: NAVY_DEEP }}>
    <Beat at={0} len={3.0} enter="contour">
      <Clip src="broll-fixing-tools" from={0.1} len={3.0} rate={0.9} dim={0.5} push={[1.0, 1.06]} />
      <Headline words={["What", "does", "that", "add", "for", "a", "fisher?"]} at={[0.45, 0.62, 0.79, 1.01, 1.38, 1.54, 1.63]} size={96} />
    </Beat>
    <Beat at={3.0} len={13.0} enter="whip">
      <Values />
    </Beat>
    {/* T2 · the same fisherman on what FishPin changed, in his own words */}
    <Beat at={16.0} len={T2.len} enter="fade">
      <Interview data={T2} />
    </Beat>

    <Sfx at={0} file="whoosh.wav" volume={0.45} />
    <Sfx at={2.95} file="whoosh.wav" volume={0.5} />
    <Sfx at={3.8} file="ping.wav" volume={0.35} />
    {[3.9, 4.05, 4.2, 11.4, 11.65, 11.9, 12.5].map((t) => (
      <Sfx key={t} at={t} file="tick.wav" volume={0.3} />
    ))}
    <Sfx at={4.7} file="whoosh.wav" volume={0.3} />
    <Sfx at={8.3} file="whoosh.wav" volume={0.25} />
    <Sfx at={9.5} file="ping.wav" volume={0.35} />
    <Sfx at={10.5} file="whoosh.wav" volume={0.3} />
    <Sfx at={10.85} file="ping.wav" volume={0.3} />
    <Sfx at={13.28} file="whoosh.wav" volume={0.3} />
    <Sfx at={13.55} file="ping.wav" volume={0.35} />
    <Sfx at={14.85} file="whoosh.wav" volume={0.3} />

    <Narration section={5} />
  </AbsoluteFill>
);
