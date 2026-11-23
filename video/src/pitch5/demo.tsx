import React from "react";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, interpolateColors, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useAppSpring } from "../motion/primitives";
import { Check, ContourField, Mono, NAVY_DEEP, Pill, Rise, Vignette } from "../pitch/kit";
import { f } from "../pitch/timing";
import { FONT, PALETTE } from "../theme";
import { Beat, Narration, Num, Sfx } from "./parts";
import SCREEN from "./screen-shape.json";

// ------------------------------------------------------------ 4 · Demo 1:28–2:40
// The whole demo is told on the app's own screens, not filmed (sun glare makes a
// phone unreadable on camera): one phone on the right whose screen changes
// chapter by chapter, drawn on as the voice names each part (v13–v20, v38),
// while the left names the feature. Times are seconds into the section.
// Screens are the Play Store mockups (public/mockups, from 11-play-store/mockup);
// the navigate and anchor captures have no mockup, so they are set into the
// same phone frame.

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// The phone is laid out at twice its full-frame size so the UI reads clearly
// (the mockups are 1310x2708, frame included); the camera scales it for the recap.
export const MOCK_H = 1720;
export const MOCK_W = (MOCK_H * 1310) / 2708;
const RED = "#DC2626";

const CHAPTERS = [
  { n: 1, at: 0, title: "Offline sea chart" },
  { n: 2, at: 13.4, title: "Save a spot, find it again" },
  { n: 3, at: 23.0, title: "Every trip recorded" },
  { n: 4, at: 27.8, title: "Fishing score" },
  { n: 5, at: 36.2, title: "Anchor alarm" },
  { n: 6, at: 42.6, title: "SOS by plain SMS" },
  { n: 7, at: 56.0, title: "Catch log and AI fish ID" },
];
const RECAP = 66.4;
const LEN = 72;
const endOf = (i: number) => (i + 1 < CHAPTERS.length ? CHAPTERS[i + 1].at : RECAP);

// ------------------------------------------------------------------ drawing on screens

// Overlays draw in the coordinates of the image under them: 968x2000 for the
// mockups, 900x2000 for the bare captures (the sizes the notes were taken at).
const Space = React.createContext({ vw: 968, w: MOCK_W, h: MOCK_H });

const Layer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { vw, w, h } = React.useContext(Space);
  return (
    <svg viewBox={`0 0 ${vw} 2000`} width={w} height={h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      {children}
    </svg>
  );
};

// An amber outline drawn around part of the screen.
const Outline: React.FC<{ x: number; y: number; w: number; h: number; startAt: number; until?: number }> = ({ x, y, w, h, startAt, until }) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [startAt, startAt + 14], [0, 1], clamp);
  const out = until ? interpolate(frame, [until, until + 8], [1, 0], clamp) : 1;
  return (
    <Layer>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={30}
        fill="none"
        stroke={PALETTE.amber}
        strokeWidth={10}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - draw}
        opacity={draw > 0 ? out : 0}
        style={{ filter: `drop-shadow(0 0 16px ${PALETTE.amber})` }}
      />
    </Layer>
  );
};

// A pulsing amber ring around a button or a number.
const Ring: React.FC<{ x: number; y: number; r: number; startAt: number; until?: number }> = ({ x, y, r, startAt, until }) => {
  const frame = useCurrentFrame();
  const s = useAppSpring(startAt);
  const out = until ? interpolate(frame, [until, until + 8], [1, 0], clamp) : 1;
  if (frame < startAt) return null;
  return (
    <Layer>
      <circle
        cx={x}
        cy={y}
        r={r * s * (1 + 0.07 * Math.sin((frame - startAt) / 5))}
        fill="none"
        stroke={PALETTE.amber}
        strokeWidth={11}
        opacity={out}
        style={{ filter: `drop-shadow(0 0 14px ${PALETTE.amber})` }}
      />
    </Layer>
  );
};

// ------------------------------------------------------------------ the phone and its screens

// A Play Store mockup (phone frame included) with drawing over its screen.
const Mockup: React.FC<{ src: string; children?: React.ReactNode }> = ({ src, children }) => (
  <div style={{ position: "relative", width: MOCK_W, height: MOCK_H }}>
    <Img src={staticFile(`mockups/${src}`)} style={{ width: MOCK_W, height: MOCK_H, display: "block" }} />
    <Space.Provider value={{ vw: 968, w: MOCK_W, h: MOCK_H }}>{children}</Space.Provider>
  </div>
);

// Where a capture sits in the 1310x2708 mockups (measured; it reaches a hair
// under the bezel), the Dynamic Island, and the exact outline of the screen
// with its long iPhone corners, traced from the mockup itself.
const OPEN = { x: 49, y: 42, w: 1209 };
const ISLAND = { x: 469, y: 87, w: 372, h: 107 };
const SCREEN_CLIP = `polygon(${SCREEN.points.map(([x, y]) => `${((x * MOCK_W) / 1310).toFixed(1)}px ${((y * MOCK_H) / 2708).toFixed(1)}px`).join(", ")})`;

// A bare 1080x2400 capture set into the mockups' phone frame, clipped to the
// screen's outline. `shift` (mockup px) lowers an Android capture so its
// header clears the island, over `fill`. Children draw on the capture in its
// own 900x2000 space; `overlay` covers the whole screen.
export const Framed: React.FC<{ base: string; src: string; shift?: number; fill?: string; overlay?: React.ReactNode; children?: React.ReactNode }> = ({
  base,
  src,
  shift = 0,
  fill = "#000",
  overlay,
  children,
}) => {
  const k = MOCK_W / 1310;
  const w = OPEN.w * k;
  const h = (w * 2400) / 1080; // the capture at full width; the opening crops its foot
  return (
    <div style={{ position: "relative", width: MOCK_W, height: MOCK_H }}>
      <Img src={staticFile(`mockups/${base}`)} style={{ width: MOCK_W, height: MOCK_H, display: "block" }} />
      <div style={{ position: "absolute", inset: 0, clipPath: SCREEN_CLIP, background: fill }}>
        <div style={{ position: "absolute", left: OPEN.x * k, top: (OPEN.y + shift) * k, width: w, height: h }}>
          <Img src={staticFile(src)} style={{ width: w, height: h, display: "block" }} />
          <Space.Provider value={{ vw: 900, w, h }}>{children}</Space.Provider>
        </div>
        {overlay}
      </div>
      <div
        style={{
          position: "absolute",
          left: ISLAND.x * k,
          top: ISLAND.y * k,
          width: ISLAND.w * k,
          height: ISLAND.h * k,
          borderRadius: (ISLAND.h * k) / 2,
          background: "#000",
        }}
      >
        <div style={{ position: "absolute", left: 300 * k, top: (ISLAND.h / 2 - 22) * k, width: 44 * k, height: 44 * k, borderRadius: "50%", background: "#0D1430" }} />
      </div>
    </div>
  );
};

// One screen of the phone, on from `from` to `to` (seconds); after the first,
// each fades in over the one before. Children use frames counted from `from`.
const Screen: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => (
  <Sequence from={f(from)} durationInFrames={f(to - from) + 10}>
    <FadeUp first={from === 0}>{children}</FadeUp>
  </Sequence>
);

const FadeUp: React.FC<{ first: boolean; children: React.ReactNode }> = ({ first, children }) => {
  const o = first ? 1 : interpolate(useCurrentFrame(), [0, 8], [0, 1], clamp);
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

// Where the camera looks: [seconds, zoom, focus, centre x]. Zoom 1 is the whole
// phone in frame; the camera zooms in (up to 2) only while a feature is being
// shown, then pulls back out. Focus is the point down the phone (0 top, 1
// bottom) held mid-frame. Each move lands just before the voice names what it shows.
const PHONE_X = 560; // the phone's centre across the frame, beside the text
const CAM: [number, number, number, number][] = [
  [0, 1, 0.5, PHONE_X], // the whole chart
  [7.3, 1, 0.5, PHONE_X],
  [7.8, 1.8, 0.5, PHONE_X], // in: the pins pop on, the depths
  [9.3, 1.8, 0.5, PHONE_X],
  [9.8, 1.9, 0.84, PHONE_X], // the GPS bar
  [11.0, 1.9, 0.84, PHONE_X],
  [11.6, 1, 0.5, PHONE_X], // out: it keeps working
  [14.0, 1, 0.5, PHONE_X],
  [14.45, 1.9, 0.84, PHONE_X], // in: the pin button is tapped
  [14.75, 1.9, 0.84, PHONE_X],
  [15.2, 1.5, 0.39, PHONE_X], // the new pin and "Spot saved"
  [16.0, 1.5, 0.39, PHONE_X],
  [16.4, 1, 0.5, PHONE_X], // out: navigate
  [17.4, 1, 0.5, PHONE_X],
  [17.85, 1.7, 0.62, PHONE_X], // in: the compass points the way
  [19.0, 1.7, 0.62, PHONE_X],
  [19.45, 2, 0.86, PHONE_X], // distance and arrival time
  [21.6, 2, 0.86, PHONE_X],
  [22.2, 1, 0.5, PHONE_X], // out
  [23.3, 1, 0.5, PHONE_X],
  [23.8, 1.7, 0.33, PHONE_X], // in: the trail grows, the screen goes dark
  [26.6, 1.7, 0.33, PHONE_X],
  [27.2, 1, 0.5, PHONE_X], // out
  [28.9, 1, 0.5, PHONE_X],
  [29.35, 1.8, 0.44, PHONE_X], // in: the score
  [30.2, 1.8, 0.44, PHONE_X],
  [30.6, 1.8, 0.76, PHONE_X], // wind and waves
  [31.3, 1.8, 0.76, PHONE_X],
  [31.8, 1, 0.5, PHONE_X], // out: a stormy day
  [32.0, 1, 0.5, PHONE_X],
  [32.4, 1.7, 0.47, PHONE_X], // in: 40, thunderstorms and current
  [33.0, 1.7, 0.47, PHONE_X],
  [33.4, 1.7, 0.69, PHONE_X], // the next 24 hours
  [35.3, 1.7, 0.69, PHONE_X],
  [35.9, 1, 0.5, PHONE_X], // out
  [37.5, 1, 0.5, PHONE_X],
  [37.95, 1.7, 0.3, PHONE_X], // in: the boat drifts off the anchor
  [39.2, 1.7, 0.3, PHONE_X],
  [39.6, 1, 0.5, PHONE_X], // out: the whole phone turns red
  [43.9, 1, 0.5, PHONE_X],
  [44.3, 1.8, 0.36, PHONE_X], // in: the 3-second hold
  [47.1, 1.8, 0.36, PHONE_X],
  [47.6, 1.6, 0.74, PHONE_X], // the contacts
  [48.6, 1.6, 0.74, PHONE_X],
  [49.0, 1, 0.5, PHONE_X], // out: the message flies out
  [57.0, 1, 0.5, PHONE_X],
  [57.45, 1.9, 0.14, PHONE_X], // in: the scan button
  [59.1, 1.9, 0.14, PHONE_X],
  [59.6, 1.8, 0.8, PHONE_X], // the scan
  [61.5, 1.8, 0.8, PHONE_X],
  [62.0, 1.9, 0.1, PHONE_X], // the guide: 300 / 300
  [63.1, 1.9, 0.1, PHONE_X],
  [63.6, 1.15, 0.5, PHONE_X], // back: species after species scroll by
  [65.6, 1.15, 0.5, PHONE_X],
  [66.2, 1, 0.5, PHONE_X], // out
  [RECAP + 0.1, 1, 0.5, PHONE_X],
  [RECAP + 0.8, 1, 0.5, 960], // the recap, centred
];

// The phone, led by the camera: slides in from the left, floats, shakes with
// the anchor alarm, and moves to the centre for the recap. Zoomed in, it is
// kept filling the frame top to bottom.
const Phone: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / 30;
  const cam = (i: 1 | 2 | 3) =>
    interpolate(
      t,
      CAM.map((c) => c[0]),
      CAM.map((c) => c[i]),
      { ...clamp, easing: Easing.inOut(Easing.cubic) },
    );
  const s = cam(1) / 2; // scale of the twice-size layout
  const h = MOCK_H * s;
  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 100, mass: 1 } });
  const k = frame - f(39.45);
  const shake = k >= 0 && k < 40 ? Math.sin(k * 2.9) * 9 * (1 - k / 40) : 0;
  const top = Math.min(Math.max(60, (1080 - h) / 2), Math.max(Math.min(1020 - h, (1080 - h) / 2), 540 - cam(2) * h));
  return (
    <div
      style={{
        position: "absolute",
        left: cam(3) - (MOCK_W * s) / 2 - (1 - enter) * 900 + shake,
        top: top + Math.sin(frame / 22) * 5,
        width: MOCK_W,
        height: MOCK_H,
        transformOrigin: "0 0",
        transform: `scale(${s}) rotateZ(${shake * 0.04}deg)`,
        filter: "drop-shadow(0 40px 60px rgba(0,0,0,0.55))",
        opacity: interpolate(enter, [0, 0.15], [0, 1], clamp),
      }}
    >
      {children}
    </div>
  );
};

// ------------------------------------------------------------------ chart: pins pop on

// The pins baked into the map mockup, hidden under a patch of the sea beside
// them (dx) until each springs up from its tip. 968x2000 coordinates.
const MAP_PINS = [
  { x: 180, y: 775, dx: -70 },
  { x: 397, y: 737, dx: 70 },
  { x: 592, y: 888, dx: -70 },
  { x: 646, y: 1058, dx: -70 },
  { x: 370, y: 1153, dx: 70 },
  { x: 254, y: 1337, dx: 70 },
];

const K968 = MOCK_W / 968;
const PIN = { w: 68, h: 80, cx: 34, cy: 36, tip: 74 }; // a pin's box, its head centre and tip
const pinPath = (() => {
  const p = (x: number, y: number) => `${(x * K968).toFixed(2)} ${(y * K968).toFixed(2)}`;
  const r = (29 * K968).toFixed(2);
  return `path("M${p(34, 74)} C${p(27, 64)} ${p(5, 54)} ${p(5, 36)} A${r} ${r} 0 1 1 ${p(63, 36)} C${p(63, 54)} ${p(41, 64)} ${p(34, 74)} Z")`;
})();

const MapCut: React.FC<{ src: string; cx: number; cy: number }> = ({ src, cx, cy }) => (
  <Img
    src={staticFile(`mockups/${src}`)}
    style={{ position: "absolute", left: -(cx - PIN.cx) * K968, top: -(cy - PIN.cy) * K968, width: MOCK_W, height: MOCK_H, maxWidth: "none" }}
  />
);

// Pops the pin at (x, y) onto the chart at `at` (frames); with `dx` it first
// hides the baked pin, with (tx, ty) it drops a copy somewhere new.
const PinPop: React.FC<{ src: string; x: number; y: number; at: number; dx?: number; tx?: number; ty?: number }> = ({ src, x, y, at, dx, tx = x, ty = y }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - at, fps, config: { damping: 9, stiffness: 190, mass: 0.6 } });
  const ripple = interpolate(frame, [at + 4, at + 22], [0, 1], clamp);
  const box = (bx: number, by: number): React.CSSProperties => ({
    position: "absolute",
    left: (bx - PIN.cx) * K968,
    top: (by - PIN.cy) * K968,
    width: PIN.w * K968,
    height: PIN.h * K968,
    overflow: "hidden",
  });
  return (
    <>
      {dx !== undefined ? (
        <div style={{ ...box(x, y), opacity: interpolate(frame, [at + 12, at + 20], [1, 0], clamp) }}>
          <MapCut src={src} cx={x + dx} cy={y} />
        </div>
      ) : null}
      {frame >= at + 4 && ripple < 1 ? (
        <Layer>
          <ellipse cx={tx} cy={ty + PIN.tip - PIN.cy} rx={12 + 40 * ripple} ry={5 + 14 * ripple} fill="none" stroke="#FFFFFF" strokeWidth={4} opacity={0.9 * (1 - ripple)} />
        </Layer>
      ) : null}
      <div style={{ ...box(tx, ty), clipPath: pinPath, transform: `scale(${pop})`, transformOrigin: `${PIN.cx * K968}px ${PIN.tip * K968}px` }}>
        <MapCut src={src} cx={x} cy={y} />
      </div>
    </>
  );
};

// A finger tap: a soft disc presses down and a ring spreads.
const Tap: React.FC<{ x: number; y: number; at: number }> = ({ x, y, at }) => {
  const frame = useCurrentFrame();
  if (frame < at || frame > at + 24) return null;
  const k = frame - at;
  const press = interpolate(k, [0, 5, 10, 24], [0, 1, 0.85, 0], clamp);
  const ring = interpolate(k, [4, 22], [0, 1], clamp);
  return (
    <Layer>
      <circle cx={x} cy={y} r={46} fill="rgba(255,255,255,0.45)" stroke="rgba(255,255,255,0.9)" strokeWidth={4} opacity={press} />
      <circle cx={x} cy={y} r={46 + 60 * ring} fill="none" stroke="#FFFFFF" strokeWidth={5} opacity={0.8 * (1 - ring)} />
    </Layer>
  );
};

// "Spot saved", the way a confirmation drops in at the top of the map.
const Toast: React.FC<{ at: number; title: string; sub: string }> = ({ at, title, sub }) => {
  const s = useAppSpring(at);
  const k = K968;
  return (
    <div
      style={{
        position: "absolute",
        left: 110 * k,
        top: 270 * k,
        width: 748 * k,
        padding: `${22 * k}px ${28 * k}px`,
        boxSizing: "border-box",
        borderRadius: 28 * k,
        background: "#FFFFFF",
        boxShadow: "0 10px 26px rgba(11,31,77,0.25)",
        display: "flex",
        alignItems: "center",
        gap: 20 * k,
        opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
        transform: `translateY(${(1 - s) * -30}px)`,
      }}
    >
      <div style={{ width: 64 * k, height: 64 * k, borderRadius: "50%", background: "#16A34A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width={36 * k} height={36 * k} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <div>
        <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 34 * k, color: "#0B1F4D" }}>{title}</div>
        <div style={{ fontFamily: FONT.mono, fontSize: 26 * k, color: "#5A6886" }}>{sub}</div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ trip, anchor, SOS, catch

// Recording: the trail grows from the boat, then the screen goes dark and the
// trail keeps drawing. Mockup coordinates.
const TRAIL = "M483 634 C 540 612, 600 566, 652 524 S 762 432, 830 404";
const TrailRec: React.FC<{ drawAt: number; offAt: number }> = ({ drawAt, offAt }) => {
  const frame = useCurrentFrame();
  const before = interpolate(frame, [drawAt, offAt], [0, 0.5], clamp);
  const after = interpolate(frame, [offAt + 8, offAt + 60], [0.5, 1], clamp);
  const dark = interpolate(frame, [offAt, offAt + 8], [0, 0.94], clamp);
  const rec = Math.floor((frame - offAt) / 15) % 2 === 0 ? 1 : 0.35;
  return (
    <Layer>
      <rect x={37} y={32} width={892} height={1937} rx={79} fill="#000000" opacity={dark} />
      <path
        d={TRAIL}
        fill="none"
        stroke="#2F80FF"
        strokeWidth={14}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - (frame < offAt ? before : after)}
        opacity={frame >= drawAt ? 1 : 0}
        style={{ filter: dark > 0 ? "drop-shadow(0 0 16px #3B9BFF)" : "none" }}
      />
      {dark > 0 ? (
        <>
          <circle cx={120} cy={250} r={20} fill={RED} opacity={rec} />
          <text x={158} y={266} fill="#FFFFFF" fontFamily={FONT.mono} fontSize={46} fontWeight={700} opacity={dark}>
            REC
          </text>
        </>
      ) : null}
    </Layer>
  );
};

// The boat drifting out of the anchor circle, then the alarm (capture coordinates).
const Drift: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const p = interpolate(frame, [at, at + 40], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const [x0, y0, x1, y1] = [511, 429, 700, 225];
  const [x, y] = [x0 + (x1 - x0) * p, y0 + (y1 - y0) * p];
  return (
    <Layer>
      <line x1={x0} y1={y0} x2={x} y2={y} stroke={RED} strokeWidth={8} strokeDasharray="22 16" />
      <circle cx={x} cy={y} r={26} fill={RED} stroke="#FFFFFF" strokeWidth={8} />
    </Layer>
  );
};

const AnchorGlyph: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22V8" />
    <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
    <circle cx={12} cy={5} r={3} />
  </svg>
);

const Alarm: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const k = frame - at;
  const flash = interpolate(k, [0, 4], [0, 1], clamp) * (Math.floor(k / 8) % 2 === 0 ? 0.93 : 0.78);
  return (
    <AbsoluteFill style={{ background: `rgba(220,38,38,${flash})`, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
      <AnchorGlyph size={70} color="#FFFFFF" />
      <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 46, letterSpacing: 2, color: "#FFFFFF" }}>DRAGGING</div>
      <div style={{ fontFamily: FONT.mono, fontSize: 17, color: "#FFFFFF", opacity: 0.92 }}>Past the 20 m limit</div>
    </AbsoluteFill>
  );
};

// The SOS button held for 3 seconds, the way the app shows it: the face fills,
// sonar rings spread, the caption turns to "Keep holding..."
// (apps/mobile/app/_sos/SOSButton.tsx). Mockup coordinates.
const SosHold: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const end = at + 3 * fps;
  if (frame < at || frame > end + 6) return null;
  const hold = interpolate(frame, [at, end], [0, 1], clamp);
  const [cx, cy, r] = [484, 663, 162];
  return (
    <Layer>
      <defs>
        <clipPath id="sos-face">
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      {[0, 13, 26].map((d) => {
        const p = ((frame - at + d) % 39) / 39;
        return <circle key={d} cx={cx} cy={cy} r={r + p * 90} fill="none" stroke={RED} strokeWidth={6} opacity={0.7 * (1 - p)} />;
      })}
      <rect x={cx - r} y={cy + r - 2 * r * hold} width={2 * r} height={2 * r * hold} fill="rgba(255,255,255,0.22)" clipPath="url(#sos-face)" />
      <circle
        cx={cx}
        cy={cy}
        r={r + 22}
        fill="none"
        stroke={PALETTE.amber}
        strokeWidth={12}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - hold}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ filter: `drop-shadow(0 0 12px ${PALETTE.amber})` }}
      />
      <circle cx={cx} cy={cy} r={58 * (1 + 0.05 * Math.sin((frame - at) / 4))} fill="rgba(255,255,255,0.32)" stroke="rgba(255,255,255,0.75)" strokeWidth={4} />
      <rect x={180} y={960} width={608} height={64} fill="#EAF1FB" />
      <text x={cx} y={1003} textAnchor="middle" fontFamily={FONT.mono} fontSize={34} fill={RED}>
        Keep holding...
      </text>
    </Layer>
  );
};

// The AI at work: a scan line sweeps the photo of the catch twice.
const ScanSweep: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  if (frame < at || frame > at + 50) return null;
  const p = ((frame - at) % 25) / 25;
  const [x0, y0, x1, y1] = [82, 1405, 886, 1832];
  const y = y0 + (y1 - y0) * p;
  return (
    <Layer>
      <defs>
        <clipPath id="scan-box">
          <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx={28} />
        </clipPath>
        <linearGradient id="scan-band" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={PALETTE.amber} stopOpacity="0" />
          <stop offset="1" stopColor={PALETTE.amber} stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <g clipPath="url(#scan-box)">
        <rect x={x0} y={y - 120} width={x1 - x0} height={120} fill="url(#scan-band)" />
        <rect x={x0} y={y - 4} width={x1 - x0} height={8} fill={PALETTE.amber} style={{ filter: `drop-shadow(0 0 10px ${PALETTE.amber})` }} />
      </g>
    </Layer>
  );
};

// The guide's species list scrolling under its fixed header. The two guide
// captures (09-screenshots/light/07-fish-guide-and-scan/03 and 04) are joined:
// the second is the first scrolled 1160 px down (900x2000 space). Frames.
const GUIDE_LIST: [number, number] = [430, 1780]; // the list area of a capture, above its tab bar
const GuideScroll: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame();
  const { w } = React.useContext(Space);
  const k = w / 900;
  const s = interpolate(frame, [from, to], [0, 940], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const [top, bottom] = GUIDE_LIST;
  const listPart = (src: string, at: number) => (
    <div style={{ position: "absolute", left: 0, top: (at - s) * k, width: w, height: (bottom - top) * k, overflow: "hidden" }}>
      <Img src={staticFile(src)} style={{ position: "absolute", left: 0, top: -top * k, width: w, height: 2000 * k, maxWidth: "none" }} />
    </div>
  );
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: top * k, width: w, height: (2000 - top) * k, overflow: "hidden", background: "#EEF3FA" }}>
        {listPart("pitch5/img/guide-grid.png", 0)}
        {listPart("pitch5/img/guide-grid-2.png", 1160)}
      </div>
      {/* the floating tab bar and home indicator stay put */}
      <div style={{ position: "absolute", left: 62 * k, top: 1782 * k, width: 776 * k, height: 146 * k, borderRadius: 36 * k, overflow: "hidden", boxShadow: "0 6px 18px rgba(11,31,77,0.12)" }}>
        <Img src={staticFile("pitch5/img/guide-grid.png")} style={{ position: "absolute", left: -62 * k, top: -1782 * k, width: w, height: 2000 * k, maxWidth: "none" }} />
      </div>
      <div style={{ position: "absolute", left: 332 * k, top: 1966 * k, width: 236 * k, height: 10 * k, borderRadius: 5 * k, background: "#3A3A3C" }} />
    </>
  );
};

// ------------------------------------------------------------------ left column

const Chapter: React.FC<{ n: number; title: string; len: number; children: React.ReactNode }> = ({ n, title, len, children }) => {
  const out = interpolate(useCurrentFrame(), [len - 8, len], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: out, transform: `translateX(${(1 - out) * 40}px)` }}>
      <div style={{ position: "absolute", left: 1060, top: 180, width: 780 }}>
        <Rise startAt={0}>
          <Mono size={28} color={PALETTE.amber}>{`0${n} / 07`}</Mono>
        </Rise>
        <Rise startAt={3}>
          <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 72, lineHeight: 1.05, letterSpacing: -1, color: "#FFFFFF", marginTop: 10 }}>{title}</div>
        </Rise>
        <div style={{ marginTop: 44, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 24 }}>{children}</div>
      </div>
    </AbsoluteFill>
  );
};

// Rows that fold away once they have been said, making room for what follows.
const Fold: React.FC<{ at: number; height: number; children: React.ReactNode }> = ({ at, height, children }) => {
  const p = interpolate(useCurrentFrame(), [at, at + 12], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return (
    <div style={{ height: height * (1 - p), marginBottom: -24 * p, overflow: "hidden", opacity: 1 - p, display: "flex", flexDirection: "column", gap: 24 }}>
      {children}
    </div>
  );
};

const PLANE = "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z";

// Airplane mode switching on: signal and data off, the chart carries on.
const AirplaneToggle: React.FC<{ startAt: number }> = ({ startAt }) => {
  const s = useAppSpring(startAt);
  const on = useAppSpring(startAt + 10);
  const note = useAppSpring(startAt + 18);
  return (
    <div
      style={{
        padding: "16px 26px",
        borderRadius: 24,
        background: "rgba(234,242,255,0.08)",
        border: "2px solid rgba(234,242,255,0.16)",
        opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
        transform: `translateX(${(1 - s) * 50}px)`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <svg width={42} height={42} viewBox="0 0 24 24" fill="none" stroke={PALETTE.amber} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d={PLANE} />
        </svg>
        <span style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 40, color: "#FFFFFF" }}>Airplane mode</span>
        <div style={{ position: "relative", width: 92, height: 50, borderRadius: 25, background: interpolateColors(on, [0, 1], ["rgba(234,242,255,0.25)", PALETTE.amber]) }}>
          <div style={{ position: "absolute", top: 5, left: 5 + on * 42, width: 40, height: 40, borderRadius: 20, background: "#FFFFFF" }} />
        </div>
      </div>
      <div style={{ marginTop: 8, marginLeft: 64, opacity: interpolate(note, [0, 0.4], [0, 1], clamp) }}>
        <Mono size={26} color={PALETTE.mist}>
          no signal · no data
        </Mono>
      </div>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string; unit: string; startAt: number }> = ({ label, value, unit, startAt }) => (
  <Rise startAt={startAt}>
    <Mono size={24} color={PALETTE.mist}>
      {label}
    </Mono>
    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
      <span style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 96, lineHeight: 1.05, color: PALETTE.amber }}>{value}</span>
      <Mono size={34} color="#EAF2FF">
        {unit}
      </Mono>
    </div>
  </Rise>
);

// A fishing score read off the screen: the number counts up, its verdict lands.
const Score: React.FC<{ startAt: number; to: number; color: string; verdict: string }> = ({ startAt, to, color, verdict }) => (
  <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
    <Num to={to} startAt={startAt} length={24} size={100} color={color} />
    <Rise startAt={startAt + 20}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
        <Mono size={34} color="#EAF2FF">
          / 100
        </Mono>
        <span style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 34, color }}>{verdict}</span>
      </div>
    </Rise>
  </div>
);

// The SOS message flying out of the phone to the three contacts on the
// screen, with FishPin's own wording (apps/mobile/lib/sos.ts).
const SOS_TEXT = "EMERGENCY! I need help at sea. Please send rescue assistance.";
const LOCATION = ["Location: maps.google.com/?q=12.5012,121.5108", "Lat: 12.5012 · Lng: 121.5108", "Time: 5:42 AM"];

const SmsCard: React.FC<{ startAt: number; locAt: number }> = ({ startAt, locAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - startAt, fps, config: { damping: 17, stiffness: 120, mass: 1 } });
  const loc = interpolate(frame, [locAt, locAt + 8], [0, 1], clamp);
  if (frame < startAt) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 200,
        top: 330,
        width: 580,
        padding: "24px 28px",
        borderRadius: 28,
        borderBottomRightRadius: 6,
        background: "#FFFFFF",
        boxShadow: "0 30px 70px rgba(0,0,0,0.55)",
        opacity: interpolate(s, [0, 0.2], [0, 1], clamp),
        transform: `translateY(${(1 - s) * 160}px) scale(${0.6 + 0.4 * s}) rotate(${(1 - s) * -6}deg)`,
        transformOrigin: "50% 100%",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ padding: "4px 12px", borderRadius: 10, background: RED, fontFamily: FONT.mono, fontWeight: 700, fontSize: 20, color: "#FFFFFF" }}>SMS</span>
        <span style={{ fontFamily: FONT.mono, fontSize: 21, color: "#5A6886" }}>to Kuya Ben · Coast Guard · Tatay</span>
      </div>
      <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 26, lineHeight: 1.35, color: "#0B1F4D", marginTop: 16 }}>{SOS_TEXT}</div>
      <div style={{ marginTop: 12, padding: "8px 12px", borderRadius: 12, background: `rgba(255,200,87,${0.6 * loc})` }}>
        {LOCATION.map((l) => (
          <div key={l} style={{ fontFamily: FONT.mono, fontSize: 21, lineHeight: 1.5, color: "#0B1F4D" }}>
            {l}
          </div>
        ))}
      </div>
      <div style={{ fontFamily: FONT.mono, fontSize: 20, color: "#5A6886", marginTop: 10 }}>- Sent via FishPin SOS</div>
    </div>
  );
};

const NameChip: React.FC<{ startAt: number; children: string }> = ({ startAt, children }) => {
  const s = useAppSpring(startAt);
  return (
    <div
      style={{
        padding: "10px 22px",
        borderRadius: 999,
        background: "rgba(234,242,255,0.08)",
        border: "2px solid rgba(255,200,87,0.6)",
        fontFamily: FONT.mono,
        fontSize: 30,
        color: "#FFFFFF",
        opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
        transform: `translateY(${(1 - s) * 20}px) scale(${0.9 + 0.1 * s})`,
      }}
    >
      {children}
    </div>
  );
};

// ------------------------------------------------------------------ recap

const FAN: { src: string; h: number; cx: number; dx: number; ry: number; rz: number; at: number }[] = [
  { src: "sos.png", h: 600, cx: 360, dx: 600, ry: 30, rz: -5, at: 9 },
  { src: "chart.png", h: 600, cx: 1560, dx: -600, ry: -30, rz: 5, at: 9 },
  { src: "score-90.png", h: 700, cx: 640, dx: 320, ry: 22, rz: -3, at: 4 },
  { src: "navigate.png", h: 700, cx: 1280, dx: -320, ry: -22, rz: 3, at: 4 },
];

const FanPhone: React.FC<{ src: string; h: number; cx: number; dx: number; ry: number; rz: number; at: number }> = ({ src, h, cx, dx, ry, rz, at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 18, stiffness: 100, mass: 1 } });
  const w = (h * 1310) / 2708;
  return (
    <div style={{ position: "absolute", left: cx - w / 2, top: (1080 - h) / 2 - 50, perspective: 1800, opacity: interpolate(s, [0, 0.2], [0, 1], clamp) }}>
      <div style={{ transform: `translateX(${dx * (1 - s)}px) rotateY(${ry * s}deg) rotateZ(${rz * s}deg)`, filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.5)) brightness(0.72)" }}>
        <Img src={staticFile(`mockups/${src}`)} style={{ width: w, height: h, display: "block" }} />
      </div>
    </div>
  );
};

// The closing line lands with the voice (v38): shore, spot, safely home.
const RecapLine: React.FC = () => {
  const parts: [number, string, boolean][] = [
    [0.9, "From the shore,", false],
    [2.0, "to the spot,", false],
    [3.05, "and safely home.", true],
  ];
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 58, display: "flex", justifyContent: "center", gap: 16 }}>
      {parts.map(([at, text, hi]) => (
        <Rise key={text} startAt={f(at)}>
          <span style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 56, color: hi ? PALETTE.amber : "#FFFFFF", textShadow: "0 4px 18px rgba(0,0,0,0.6)" }}>{text}</span>
        </Rise>
      ))}
    </div>
  );
};

// ------------------------------------------------------------------ section

const Stage: React.FC = () => {
  const c = (n: number) => CHAPTERS[n - 1].at;
  const L = (n: number, s: number) => f(s - c(n)); // a section time as a frame in chapter n
  const at = (from: number) => (s: number) => f(s - from); // a section time as a frame on a screen shown from `from`
  return (
    <AbsoluteFill>
      <ContourField glowAt={[78, 45]} />
      <Vignette />

      {/* left column, one chapter at a time */}
      {CHAPTERS.map((ch, i) => (
        <Sequence key={ch.n} from={f(ch.at)} durationInFrames={f(endOf(i) - ch.at)}>
          <Chapter n={ch.n} title={ch.title} len={f(endOf(i) - ch.at)}>
            {ch.n === 1 ? (
              <>
                <Check startAt={L(1, 2.0)}>On any Android phone</Check>
                <AirplaneToggle startAt={L(1, 6.0)} />
                <div style={{ display: "flex", gap: 30 }}>
                  <Check startAt={L(1, 7.9)} size={38}>
                    Map
                  </Check>
                  <Check startAt={L(1, 8.6)} size={38}>
                    Depth chart
                  </Check>
                  <Check startAt={L(1, 9.7)} size={38}>
                    GPS
                  </Check>
                </div>
                <Pill startAt={L(1, 10.5)}>Keeps working with no signal</Pill>
              </>
            ) : ch.n === 2 ? (
              <>
                <Check startAt={L(2, 14.8)}>One tap saves the spot</Check>
                <Check startAt={L(2, 17.9)}>Points you straight back</Check>
                <div style={{ display: "flex", gap: 70, marginTop: 8 }}>
                  <Stat label="DISTANCE" value="2.6" unit="nm" startAt={L(2, 19.5)} />
                  <Stat label="ARRIVAL" value="25" unit="min" startAt={L(2, 20.6)} />
                </div>
              </>
            ) : ch.n === 3 ? (
              <>
                <Check startAt={L(3, 23.5)}>Records every trip</Check>
                <Check startAt={L(3, 25.5)}>Even with the screen off</Check>
              </>
            ) : ch.n === 4 ? (
              <>
                <Score startAt={L(4, 29.3)} to={90} color={PALETTE.amber} verdict="Excellent: calm seas" />
                <div style={{ display: "flex", gap: 16 }}>
                  <Pill startAt={L(4, 30.5)}>Wind</Pill>
                  <Pill startAt={L(4, 31.2)}>Waves</Pill>
                  <Pill startAt={L(4, 31.8)}>Current</Pill>
                </div>
                <Score startAt={L(4, 32.3)} to={40} color="#F87171" verdict="Risky: thunderstorms" />
                <Check startAt={L(4, 33.3)}>Best hours to go out</Check>
              </>
            ) : ch.n === 5 ? (
              <>
                <Check startAt={L(5, 36.8)}>Set a safe radius</Check>
                <Check startAt={L(5, 38.1)}>Watches for drifting</Check>
                <Pill tone="danger" startAt={L(5, 39.5)}>
                  Loud alarm wakes the crew
                </Pill>
              </>
            ) : ch.n === 6 ? (
              <>
                <Check startAt={L(6, 44.4)}>Hold for 3 seconds</Check>
                <Check startAt={L(6, 47.4)}>Texts 3 to 5 contacts</Check>
                <Check startAt={L(6, 49.2)}>With your exact location</Check>
                <Pill startAt={L(6, 53.0)}>Plain SMS · no data needed</Pill>
              </>
            ) : (
              <>
                <Fold at={L(7, 61.7)} height={140}>
                  <Check startAt={L(7, 57.5)}>Log the catch</Check>
                  <Check startAt={L(7, 59.6)}>AI names the fish</Check>
                </Fold>
                <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 6 }}>
                  <Num to={300} startAt={L(7, 61.9)} length={30} size={110} color={PALETTE.amber} />
                  <Rise startAt={L(7, 62.4)}>
                    <Mono size={34} color="#EAF2FF">
                      Philippine species
                    </Mono>
                  </Rise>
                </div>
                <Rise startAt={L(7, 63.4)}>
                  <Mono size={30} color={PALETTE.mist}>
                    262 saltwater · 38 freshwater
                  </Mono>
                </Rise>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, width: 780 }}>
                  {["Tulingan", "Hubad", "Bisugo", "Balo", "Alatan", "Lapu-lapu", "Mamsa", "Talakitok"].map((name, k) => (
                    <NameChip key={name} startAt={L(7, 64.0 + k * 0.12)}>
                      {name}
                    </NameChip>
                  ))}
                </div>
              </>
            )}
          </Chapter>
        </Sequence>
      ))}

      {/* recap: the other screens fan out behind the phone */}
      <Sequence from={f(RECAP)}>
        {FAN.map((p) => (
          <FanPhone key={p.src} {...p} />
        ))}
        <RecapLine />
      </Sequence>

      <Phone>
        {/* 01 · the chart: the pins pop on with "map", rings on the depths with
            "depth chart", the speed and heading bar with "GPS" (v14).
            02 · one tap on the pin button drops a new spot (v15). */}
        <Screen from={0} to={16.2}>
          <Mockup src="map.png">
            {MAP_PINS.map((p, i) => (
              <PinPop key={i} src="map.png" x={p.x} y={p.y} dx={p.dx} at={f(7.6 + i * 0.12)} />
            ))}
            <Ring x={390} y={684} r={50} startAt={f(8.6)} until={f(11.8)} />
            <Ring x={535} y={955} r={50} startAt={f(8.75)} until={f(11.8)} />
            <Ring x={360} y={1268} r={50} startAt={f(8.9)} until={f(11.8)} />
            <Outline x={60} y={1628} w={846} h={120} startAt={f(9.7)} until={f(12.6)} />
            <Tap x={628} y={1687} at={f(14.55)} />
            <PinPop src="map.png" x={180} y={775} tx={560} ty={1220} at={f(14.95)} />
            <Toast at={f(15.05)} title="Spot saved" sub="North Reef Edge" />
          </Mockup>
        </Screen>
        {/* 02 · on the next trip it points straight back, distance and arrival time */}
        <Screen from={16.2} to={23.0}>
          <Framed base="navigate.png" src="mockups/screen-navigate-eta-speed.png" shift={46} fill="#FFFFFF">
            <Outline x={40} y={1595} w={820} h={180} startAt={at(16.2)(19.4)} />
          </Framed>
        </Screen>
        {/* 03 · the trail grows, the screen goes dark, the trail goes on */}
        <Screen from={23.0} to={27.8}>
          <Mockup src="trail.png">
            <TrailRec drawAt={at(23.0)(23.3)} offAt={at(23.0)(25.45)} />
          </Mockup>
        </Screen>
        {/* 04 · a calm day scores 90: the score, then wind and waves */}
        <Screen from={27.8} to={31.8}>
          <Mockup src="score-90.png">
            <Outline x={480} y={672} w={404} h={452} startAt={at(27.8)(29.3)} />
            <Outline x={66} y={1342} w={326} h={368} startAt={at(27.8)(30.5)} />
            <Outline x={399} y={1342} w={326} h={368} startAt={at(27.8)(31.2)} />
          </Mockup>
        </Screen>
        {/* 04 · on "current" a stormy day: 40, then its calmer hours ahead */}
        <Screen from={31.8} to={36.2}>
          <Mockup src="score-40.png">
            <Outline x={485} y={1068} w={300} h={118} startAt={at(31.8)(32.3)} />
            <Outline x={478} y={1286} w={410} h={190} startAt={at(31.8)(33.3)} />
          </Mockup>
        </Screen>
        {/* 05 · the boat drifts past the limit and the alarm goes */}
        <Screen from={36.2} to={42.6}>
          <Framed base="sos.png" src="pitch/shots/anchor.png" shift={46} fill="#FFFFFF" overlay={<Alarm at={at(36.2)(39.45)} />}>
            <Drift at={at(36.2)(38.0)} />
          </Framed>
        </Screen>
        {/* 06 · the real SOS screen: a 3-second hold, then the contacts */}
        <Screen from={42.6} to={56.0}>
          <Mockup src="sos.png">
            <SosHold at={at(42.6)(44.36)} />
            <Outline x={70} y={1116} w={828} h={752} startAt={at(42.6)(47.4)} />
            <Ring x={833} y={1174} r={46} startAt={at(42.6)(47.6)} />
          </Mockup>
        </Screen>
        {/* 07 · the guide: scan the catch, the AI names it, 300 species in local names */}
        <Screen from={56.0} to={61.6}>
          <Mockup src="chart.png">
            <Ring x={845} y={274} r={64} startAt={at(56.0)(57.5)} until={at(56.0)(59.4)} />
            <ScanSweep at={at(56.0)(59.6)} />
            <Outline x={76} y={1398} w={816} h={442} startAt={at(56.0)(59.6)} />
          </Mockup>
        </Screen>
        {/* 07 · on "a guide of three hundred": the whole guide, 300 / 300, then
            species after species scrolling by "in local names" */}
        <Screen from={61.6} to={RECAP}>
          <Framed base="sos.png" src="pitch5/img/guide-grid.png" shift={46} fill="#EEF4FB">
            <GuideScroll from={at(61.6)(63.2)} to={at(61.6)(66.3)} />
            <Outline x={646} y={82} w={226} h={88} startAt={at(61.6)(62.1)} until={at(61.6)(63.3)} />
            <Outline x={252} y={318} w={298} h={86} startAt={at(61.6)(63.4)} until={at(61.6)(64.4)} />
            <Outline x={557} y={318} w={298} h={86} startAt={at(61.6)(63.55)} until={at(61.6)(64.4)} />
          </Framed>
        </Screen>
        <Screen from={RECAP} to={LEN}>
          <Mockup src="map.png" />
        </Screen>
      </Phone>

      {/* 06 · the message itself, flying out of the phone */}
      <Sequence from={f(42.6)} durationInFrames={f(56.0 - 42.6) + 10}>
        <SmsCard startAt={f(48.9 - 42.6)} locAt={f(49.2 - 42.6)} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const S4Demo: React.FC = () => (
  <AbsoluteFill style={{ background: NAVY_DEEP }}>
    <Beat at={0} len={LEN} enter="contour">
      <Stage />
    </Beat>

    <Sfx at={0} file="whoosh.wav" volume={0.45} />
    {CHAPTERS.slice(1).map((ch) => (
      <Sfx key={ch.n} at={ch.at - 0.05} file="whoosh.wav" volume={0.25} />
    ))}
    <Sfx at={RECAP - 0.05} file="whoosh.wav" volume={0.5} />
    {[2.0, 6.0, 6.35, 7.6, 7.84, 8.08, 8.6, 9.7, 10.5, 14.55, 14.8, 17.9, 23.3, 23.5, 25.45, 30.5, 31.2, 31.8, 33.3, 36.8, 38.1, 44.4, 45.4, 46.4, 49.2, 53.0, 57.5, 59.6, 64.0].map((t) => (
      <Sfx key={t} at={t} file="tick.wav" volume={0.3} />
    ))}
    <Sfx at={14.95} file="ping.wav" volume={0.35} />
    <Sfx at={19.5} file="ping.wav" volume={0.35} />
    <Sfx at={20.6} file="ping.wav" volume={0.35} />
    <Sfx at={29.3} file="count-up-24.wav" volume={0.4} />
    <Sfx at={30.1} file="ping.wav" volume={0.35} />
    <Sfx at={31.75} file="whoosh.wav" volume={0.3} />
    <Sfx at={32.3} file="count-up-24.wav" volume={0.4} />
    <Sfx at={33.1} file="thud.wav" volume={0.4} />
    <Sfx at={39.45} file="alarm.wav" volume={0.42} />
    <Sfx at={47.4} file="ping.wav" volume={0.4} />
    <Sfx at={48.85} file="whoosh.wav" volume={0.35} />
    <Sfx at={59.6} file="whoosh.wav" volume={0.2} />
    <Sfx at={61.55} file="whoosh.wav" volume={0.25} />
    {[64.12, 64.24, 64.36, 64.48, 64.6, 64.72, 64.84].map((t) => (
      <Sfx key={t} at={t} file="tick.wav" volume={0.15} />
    ))}
    <Sfx at={61.9} file="count-up-30.wav" volume={0.4} />
    <Sfx at={62.9} file="ping.wav" volume={0.35} />

    {/* captions on the right, clear of the phone */}
    <Narration section={4} box={{ left: 1000, width: 880 }} />
  </AbsoluteFill>
);
