import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  type SpringConfig,
} from "remotion";
import { useAppSpring } from "../motion/primitives";
import { FONT, PALETTE, SPRING } from "../theme";
import { useCounter } from "../ui/brand";
import { PH, PW } from "./timing";

// Landscape (1920x1080) motion kit for the YFC pitch. Same palette, faces and
// springs as the app and the vertical ads, re-laid for a 16:9 stage.

export const NAVY_DEEP = "#061233";
export const DANGER = "#F87171";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// ---------------------------------------------------------------- backgrounds

// Drifting contour lines over a navy radial: the app's chart texture, alive.
export const ContourField: React.FC<{ speed?: number; glowAt?: [number, number] }> = ({
  speed = 1,
  glowAt = [70, 40],
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 95% at ${glowAt[0]}% ${glowAt[1]}%, ${PALETTE.brand950} 0%, ${NAVY_DEEP} 72%)`,
      }}
    >
      <svg width={PW} height={PH} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 10 }, (_, i) => {
          const y0 = 60 + i * 108;
          const phase = frame * 0.014 * speed + i * 0.7;
          let d = `M -40 ${y0}`;
          for (let x = -40; x <= PW + 40; x += 40) {
            const y = y0 + Math.sin(x / 210 + phase) * (16 + i * 2) + Math.sin(x / 90 - phase * 1.7) * 5;
            d += ` L ${x} ${y.toFixed(1)}`;
          }
          return <path key={i} d={d} fill="none" stroke={PALETTE.contour} strokeWidth={2} opacity={0.5} />;
        })}
      </svg>
      <Particles />
    </AbsoluteFill>
  );
};

const DOTS = Array.from({ length: 36 }, (_, i) => ({
  x: random(`x${i}`) * PW,
  y: random(`y${i}`) * PH,
  r: 1.5 + random(`r${i}`) * 3.2,
  v: 0.3 + random(`v${i}`) * 0.9,
  o: 0.12 + random(`o${i}`) * 0.3,
}));

// Slow plankton-like specks rising: depth, never a static frame.
export const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg width={PW} height={PH} style={{ position: "absolute", inset: 0 }}>
      {DOTS.map((d, i) => {
        const y = (((d.y - frame * d.v) % PH) + PH) % PH;
        const x = d.x + Math.sin((frame + i * 20) / 40) * 10;
        return <circle key={i} cx={x} cy={y} r={d.r} fill="#EAF2FF" opacity={d.o} />;
      })}
    </svg>
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.6 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 52%, rgba(2,6,20,${strength}) 100%)`,
    }}
  />
);

export const Glow: React.FC<{ x: number; y: number; r: number; color?: string }> = ({
  x,
  y,
  r,
  color = "rgba(20,125,255,0.32)",
}) => {
  const frame = useCurrentFrame();
  const breathe = 1 + Math.sin(frame / 30) * 0.04;
  return (
    <div
      style={{
        position: "absolute",
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: r,
        background: `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 70%)`,
        transform: `scale(${breathe})`,
      }}
    />
  );
};

// Full-bleed photo with a slow push (and optional drift) under a tint.
export const Photo: React.FC<{
  src: string;
  len: number;
  from?: number;
  to?: number;
  drift?: number;
  overlay?: string;
}> = ({ src, len, from = 1.12, to = 1.02, drift = 0, overlay }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, len], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: NAVY_DEEP }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${from + (to - from) * t}) translateX(${drift * t}px)`,
        }}
      />
      {overlay ? <AbsoluteFill style={{ background: overlay }} /> : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- transitions

// Signature transition: the next scene is uncovered behind a sweeping edge
// drawn as the brand's contour lines, led by one amber line.
export const ContourReveal: React.FC<{ children: React.ReactNode; length?: number }> = ({
  children,
  length = 18,
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, length], [0, 1], clamp);
  const e = easeInOutCubic(t);
  const edge = e * (PW + 120);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `inset(0 ${Math.max(0, (1 - e) * 100)}% 0 0)` }}>{children}</AbsoluteFill>
      {t > 0 && t < 1 ? (
        <svg width={PW} height={PH} style={{ position: "absolute", inset: 0 }}>
          {[0, 1, 2, 3, 4].map((i) => {
            const amp = 26 + i * 8;
            const phase = i * 0.8;
            let d = "";
            for (let y = -40; y <= PH + 40; y += 30) {
              const x = edge - 40 - i * 26 + Math.sin(y / 150 + phase) * amp;
              d += `${d ? " L" : "M"} ${x.toFixed(1)} ${y}`;
            }
            return (
              <path
                key={i}
                d={d}
                fill="none"
                stroke={i === 0 ? PALETTE.amber : "rgba(125,195,255,0.55)"}
                strokeWidth={i === 0 ? 7 : 3}
              />
            );
          })}
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};

// A whip-pan in: the scene arrives from the side, smeared, and lands.
export const WhipIn: React.FC<{ children: React.ReactNode; length?: number; dir?: 1 | -1 }> = ({
  children,
  length = 14,
  dir = 1,
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, length], [0, 1], clamp);
  const e = 1 - Math.pow(1 - t, 3);
  const blur = t < 1 ? Math.sin(Math.PI * Math.min(1, t * 1.2)) * 22 : 0;
  return (
    <AbsoluteFill
      style={{
        transform: `translateX(${(1 - e) * PW * 0.75 * dir}px)`,
        filter: blur > 0.5 ? `blur(${blur.toFixed(1)}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- type

export const Rise: React.FC<{ startAt: number; children: React.ReactNode; y?: number }> = ({
  startAt,
  children,
  y = 30,
}) => {
  const s = useAppSpring(startAt);
  return (
    <div
      style={{
        opacity: interpolate(s, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }),
        transform: `translateY(${(1 - s) * y}px)`,
      }}
    >
      {children}
    </div>
  );
};

export const Mono: React.FC<{ children: React.ReactNode; size?: number; color?: string; spacing?: number }> = ({
  children,
  size = 34,
  color = PALETTE.mist,
  spacing = 0,
}) => (
  <span style={{ fontFamily: FONT.mono, fontWeight: 500, fontSize: size, color, letterSpacing: spacing }}>
    {children}
  </span>
);

// Pill in the mono face (Poppins has no peso sign).
export const Pill: React.FC<{
  startAt: number;
  children: React.ReactNode;
  tone?: "amber" | "ghost" | "danger";
  size?: number;
}> = ({ startAt, children, tone = "amber", size = 34 }) => {
  const s = useAppSpring(startAt);
  const frame = useCurrentFrame();
  const bg = tone === "amber" ? PALETTE.amber : tone === "danger" ? DANGER : "rgba(234,242,255,0.06)";
  const fg = tone === "ghost" ? "#EAF2FF" : PALETTE.brand950;
  return (
    <div
      style={{
        display: "inline-block",
        background: bg,
        color: fg,
        border: tone === "ghost" ? "2px solid rgba(234,242,255,0.35)" : "none",
        fontFamily: FONT.mono,
        fontWeight: 600,
        fontSize: size,
        padding: `${size * 0.42}px ${size * 0.8}px`,
        borderRadius: size * 1.2,
        opacity: interpolate(s, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }),
        transform: `translateY(${(1 - s) * 30 + Math.sin((frame - startAt) / 24) * 1.5}px) scale(${interpolate(s, [0, 1], [0.9, 1])})`,
        boxShadow: tone === "ghost" ? "none" : "0 18px 40px rgba(0,0,0,0.35)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
};

export const Count: React.FC<{
  from: number;
  to: number;
  startAt: number;
  length: number;
  size: number;
  prefix?: string;
  suffix?: string;
  color?: string;
}> = ({ from, to, startAt, length, size, prefix = "", suffix = "", color = PALETTE.white }) => {
  const v = useCounter(from, to, startAt, length);
  const s = useAppSpring(startAt);
  return (
    <div
      style={{
        fontFamily: FONT.mono,
        fontWeight: 600,
        fontSize: size,
        color,
        lineHeight: 1,
        opacity: interpolate(s, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }),
        transform: `scale(${interpolate(s, [0, 1], [1.08, 1])})`,
        transformOrigin: "0% 50%",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {prefix}
      {Math.round(v).toLocaleString("en-US")}
      {suffix}
    </div>
  );
};

// ---------------------------------------------------------------- brand

// The mark's three paths (fishpin-brand/01-logo, dark-background version):
// the amber fin rises out of the water once the two waves have rolled in.
const FIN =
  "M39.088 72.682C39.850 72.255 40.646 71.829 41.492 71.408C49.361 49.497 63.300 32.720 84.254 22.105C103.027 12.585 125.723 8.824 146.712 8.939C148.292 8.939 150.635 10.970 150.750 12.297C150.792 12.817 150.737 13.299 150.605 13.746C150.604 13.750 150.603 13.754 150.602 13.757C150.082 15.504 148.398 16.710 146.838 17.535C126.450 28.301 114.542 49.185 111.785 72.008L112.312 72.325L112.906 72.681C112.702 72.598 112.498 72.517 112.293 72.440C112.200 73.010 112.112 73.582 112.030 74.155L112.906 74.681C112.607 74.559 112.306 74.443 112.004 74.333C111.926 74.890 111.853 75.449 111.785 76.008L112.906 76.681C104.562 73.272 94.838 74.619 87.600 80.564C80.908 86.068 71.758 86.426 64.962 80.853C57.518 74.748 47.621 73.176 39.088 76.682C39.850 76.255 40.646 75.829 41.492 75.408C41.703 74.821 41.918 74.238 42.138 73.658C41.107 73.930 40.088 74.271 39.088 74.682C39.850 74.255 40.646 73.829 41.492 73.408C41.703 72.821 41.918 72.238 42.138 71.658C41.107 71.930 40.088 72.271 39.088 72.682Z";
const WAVE_TOP =
  "M114.612 83.1300C107.746 77.4758 98.677 77.8912 92.0193 83.3490C82.8001 90.9070 69.5654 91.1370 60.2308 83.4990C53.8154 78.2489 44.7116 77.2105 37.9847 82.7720C28.3731 90.7340 14.977 91.4260 4.99621 83.3600C3.51929 82.1720 1.92698 81.2258 0.0115967 80.2681V71.7643C4.05006 72.6412 7.25775 74.8220 10.3962 77.2105C17.2731 82.4370 26.1578 81.9412 32.6308 76.5758C42.1731 68.6605 55.5347 69.1220 64.9616 76.8528C71.7578 82.4260 80.9078 82.0682 87.6001 76.5643C96.7731 69.0297 109.939 68.8797 119.227 76.4374C125.804 81.8028 134.7 82.5990 141.681 77.1643C146.654 73.2989 152.365 70.5643 158.989 70.8643V79.0105C154.789 79.1605 150.831 80.1528 147.612 82.8760C138.023 91.0100 124.489 91.2410 114.623 83.1180L114.612 83.1300Z";
const WAVE =
  "M114.612 100.728C107.746 95.0738 98.677 95.4892 92.0193 100.947C82.8001 108.505 69.5654 108.735 60.2308 101.097C53.8154 95.8469 44.7116 94.8085 37.9847 100.37C28.3731 108.332 14.977 109.024 4.99621 100.958C3.51929 99.77 1.92698 98.8238 0.0115967 97.8661V89.3623C4.05006 90.2392 7.25775 92.42 10.3962 94.8085C17.2731 100.035 26.1578 99.5392 32.6308 94.1738C42.1731 86.2585 55.5347 86.72 64.9616 94.4508C71.7578 100.024 80.9078 99.6662 87.6001 94.1623C96.7731 86.6277 109.939 86.4777 119.227 94.0354C125.804 99.4008 134.7 100.197 141.681 94.7623C146.654 90.8969 152.365 88.1623 158.989 88.4623V96.6085C154.789 96.7585 150.831 97.7508 147.612 100.474C138.023 108.608 124.489 108.839 114.623 100.716L114.612 100.728Z";

export const AnimatedMark: React.FC<{ id: string; startAt: number; size: number }> = ({ id, startAt, size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (delay: number, config: Partial<SpringConfig> = SPRING) =>
    spring({ frame: frame - startAt - delay, fps, config });
  const w1 = sp(0);
  const w2 = sp(5);
  const fin = sp(11, { damping: 13, stiffness: 130, mass: 0.9 });
  const settled = Math.min(1, Math.max(0, (frame - startAt - 34) / 20));
  const bob = Math.sin((frame - startAt) / 13) * 1.4 * settled;
  const roll = Math.sin((frame - startAt) / 17) * 3 * settled;
  return (
    <svg width={size} height={(size * 107) / 159} viewBox="0 0 159 107" style={{ overflow: "visible" }}>
      <defs>
        <clipPath id={`fin-${id}`}>
          <rect x={-10} y={-80} width={180} height={164} />
        </clipPath>
      </defs>
      <g clipPath={`url(#fin-${id})`}>
        <path d={FIN} fill={PALETTE.amber} transform={`translate(0 ${((1 - fin) * 76 + bob).toFixed(2)})`} />
      </g>
      <path d={WAVE_TOP} fill="#FFFFFF" opacity={w1} transform={`translate(${((1 - w1) * -70 + roll).toFixed(2)} 0)`} />
      <path d={WAVE} fill="#FFFFFF" opacity={w2} transform={`translate(${((1 - w2) * 70 - roll).toFixed(2)} 0)`} />
    </svg>
  );
};

// The Poppins Bold wordmark, uncovered left to right.
export const WordReveal: React.FC<{ startAt: number; height: number }> = ({ startAt, height }) => {
  const s = useAppSpring(startAt);
  return (
    <Img
      src={staticFile("pitch/fishpin-wordmark.svg")}
      style={{
        height,
        clipPath: `inset(0 ${Math.max(0, (1 - s) * 100)}% 0 0)`,
        transform: `translateX(${(1 - s) * -20}px)`,
      }}
    />
  );
};

// ---------------------------------------------------------------- devices

// A phone that flies in with a 3D turn, lands on the app spring and floats.
export const Phone: React.FC<{
  src: string;
  height: number;
  startAt: number;
  from: { x: number; y: number; ry: number; rz: number };
  to: { ry: number; rz: number };
  focus?: number; // 1 = in focus, 0 = pushed back and dimmed
  glow?: boolean;
}> = ({ src, height, startAt, from, to, focus = 1, glow = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - startAt, fps, config: { damping: 18, stiffness: 110, mass: 1 } });
  // A generic Android body around a real 1080x2400 capture (no iPhone frame:
  // FishPin is Android-only).
  const bezel = Math.round(height * 0.017);
  const screenH = height - bezel * 2;
  const screenW = (screenH * 1080) / 2400;
  const width = screenW + bezel * 2;
  const radius = height * 0.062;
  const settle = Math.max(0, frame - startAt - 18);
  const bob = Math.sin(settle / 22) * 7 * Math.min(1, settle / 24);
  const ry = from.ry + (to.ry - from.ry) * s;
  const rz = from.rz + (to.rz - from.rz) * s;
  const lit = glow && focus > 0.6;
  const shadows = `drop-shadow(0 40px 50px rgba(0,0,0,0.55))${lit ? ` drop-shadow(0 0 36px rgba(255,200,87,${(0.55 * focus).toFixed(2)}))` : ""}`;
  return (
    <div style={{ width, height, perspective: 1800 }}>
      <div
        style={{
          width,
          height,
          opacity: interpolate(s, [0, 0.15], [0, 1], { extrapolateRight: "clamp" }),
          transform: `translate(${from.x * (1 - s)}px, ${from.y * (1 - s) + bob}px) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${(0.92 + 0.08 * focus).toFixed(3)})`,
          filter: `${shadows} brightness(${(0.58 + 0.42 * focus).toFixed(3)})`,
        }}
      >
        <PhoneBody height={height}>
          <Img src={staticFile(src)} style={{ width: screenW, height: screenH, display: "block" }} />
        </PhoneBody>
      </div>
    </div>
  );
};

// The Android body on its own, around any 1080x2400 screen content (an image,
// a screen recording, or a drawn screen).
export const phoneWidth = (height: number) => {
  const bezel = Math.round(height * 0.017);
  return ((height - bezel * 2) * 1080) / 2400 + bezel * 2;
};

export const PhoneBody: React.FC<{ height: number; children: React.ReactNode }> = ({ height, children }) => {
  const bezel = Math.round(height * 0.017);
  const screenH = height - bezel * 2;
  const screenW = (screenH * 1080) / 2400;
  const radius = height * 0.062;
  return (
    <div style={{ position: "relative", width: phoneWidth(height), height }}>
      <div style={{ position: "absolute", right: -height * 0.006, top: height * 0.2, width: height * 0.008, height: height * 0.09, borderRadius: 3, background: "#1b2440" }} />
      <div style={{ position: "absolute", right: -height * 0.006, top: height * 0.32, width: height * 0.008, height: height * 0.14, borderRadius: 3, background: "#1b2440" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          padding: bezel,
          background: "linear-gradient(145deg, #2c3656 0%, #0b1020 55%, #151d36 100%)",
          boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.09)",
        }}
      >
        <div style={{ position: "relative", width: screenW, height: screenH, borderRadius: radius - bezel * 0.6, overflow: "hidden", background: "#000" }}>
          {children}
          <div
            style={{
              position: "absolute",
              top: screenH * 0.012,
              left: screenW / 2 - screenH * 0.008,
              width: screenH * 0.016,
              height: screenH * 0.016,
              borderRadius: "50%",
              background: "#05070d",
              boxShadow: "0 0 0 2px rgba(255,255,255,0.06)",
            }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 36%)" }} />
        </div>
      </div>
    </div>
  );
};

// Phone status bars dropping one by one, tallest first, then NO SERVICE.
export const SignalBars: React.FC<{ dropAt: number[] }> = ({ dropAt }) => {
  const frame = useCurrentFrame();
  const last = dropAt[dropAt.length - 1];
  const gone = frame >= last;
  const blink = gone ? (Math.floor((frame - last) / 7) % 2 === 0 ? 1 : 0.4) : 1;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 22,
        background: "rgba(6,18,51,0.6)",
        padding: "18px 28px",
        borderRadius: 20,
        border: "2px solid rgba(234,242,255,0.18)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 54 }}>
        {[16, 28, 40, 54].map((h, i) => {
          const at = dropAt[3 - i];
          const k = interpolate(frame, [at, at + 6], [1, 0], clamp);
          return (
            <div
              key={i}
              style={{
                width: 14,
                height: h,
                borderRadius: 3,
                background: k > 0.02 ? `rgba(255,255,255,${0.25 + 0.75 * k})` : "rgba(248,113,113,0.35)",
                transform: `translateY(${(1 - k) * 6}px)`,
              }}
            />
          );
        })}
      </div>
      <span
        style={{
          fontFamily: FONT.mono,
          fontWeight: 600,
          fontSize: 30,
          letterSpacing: 3,
          color: gone ? DANGER : "#EAF2FF",
          opacity: blink,
        }}
      >
        {gone ? "NO SERVICE" : "SIGNAL"}
      </span>
    </div>
  );
};

export const Check: React.FC<{ startAt: number; children: React.ReactNode; size?: number }> = ({
  startAt,
  children,
  size = 44,
}) => {
  const s = useAppSpring(startAt);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 26,
        opacity: interpolate(s, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }),
        transform: `translateX(${(1 - s) * -50}px)`,
      }}
    >
      <div
        style={{
          width: 58,
          height: 58,
          borderRadius: 16,
          background: PALETTE.amber,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${s}) rotate(${(1 - s) * -30}deg)`,
          flexShrink: 0,
        }}
      >
        <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={PALETTE.brand950} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: size, color: "#FFFFFF" }}>{children}</div>
    </div>
  );
};
