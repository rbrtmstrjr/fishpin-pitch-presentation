import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FONT, PALETTE } from "../theme";

// The app's own components, redrawn at ad scale. A screenshot of a 9:20 phone
// shrunk into a 9:16 frame is unreadable; the same UI drawn full size is the
// product, legible, and able to move.

// ── the rippled hero panel, ported from apps/mobile/components/ui/wave.ts ──
const WAVE_H = 14;
const CRESTS = 9;
const AMP = 4;

function ripple(w: number, base: number, reverse: boolean) {
  const p = w / CRESTS;
  const out: string[] = [];
  for (let i = 0; i < CRESTS; i++) {
    const dir = i % 2 === 0 ? -1 : 1;
    const x0 = reverse ? w - i * p : i * p;
    const cx = reverse ? x0 - p / 2 : x0 + p / 2;
    const x1 = reverse ? x0 - p : x0 + p;
    out.push(`Q${cx.toFixed(2)} ${(base + dir * 2 * AMP).toFixed(2)},${x1.toFixed(2)} ${base.toFixed(2)}`);
  }
  return out.join(" ");
}

export function panelPath(w: number, h: number, scale: number) {
  const waveH = WAVE_H * scale;
  const amp = AMP * scale;
  const inner = (base: number, reverse: boolean) => {
    const p = w / CRESTS;
    const out: string[] = [];
    for (let i = 0; i < CRESTS; i++) {
      const dir = i % 2 === 0 ? -1 : 1;
      const x0 = reverse ? w - i * p : i * p;
      const cx = reverse ? x0 - p / 2 : x0 + p / 2;
      const x1 = reverse ? x0 - p : x0 + p;
      out.push(`Q${cx.toFixed(2)} ${(base + dir * 2 * amp).toFixed(2)},${x1.toFixed(2)} ${base.toFixed(2)}`);
    }
    return out.join(" ");
  };
  const top = waveH / 2;
  const bottom = h - waveH / 2;
  return `M0 ${top} ${inner(top, false)} L${w.toFixed(2)} ${bottom} ${inner(bottom, true)} Z`;
}

export const WavePanel: React.FC<{
  width: number;
  height: number;
  children?: React.ReactNode;
}> = ({ width, height, children }) => (
  <div style={{ position: "relative", width, height }}>
    <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <clipPath id="wavePanelClip">
          <path d={panelPath(width, height, 3)} />
        </clipPath>
        <pattern id="wavePanelGrid" width="56" height="56" patternUnits="userSpaceOnUse">
          <path d="M56 0 L0 0 0 56" fill="none" stroke="rgba(10,36,97,0.07)" strokeWidth="2" />
        </pattern>
      </defs>
      <path d={panelPath(width, height, 3)} fill={PALETTE.white} />
      <rect width={width} height={height} fill="url(#wavePanelGrid)" clipPath="url(#wavePanelClip)" />
    </svg>
    <div style={{ position: "absolute", inset: 0 }}>{children}</div>
  </div>
);

// ── the navigate compass, the app's dial at ad scale ──
export const CompassDial: React.FC<{ size: number; bearing: number }> = ({ size, bearing }) => {
  const r = size / 2;
  const ticks = [...Array(36)].map((_, i) => i * 10);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={r} cy={r} r={r - 4} fill="#0a1b40" stroke="rgba(125,195,255,0.35)" strokeWidth={3} />
      <circle cx={r} cy={r} r={r - 30} fill="none" stroke="rgba(125,195,255,0.18)" strokeWidth={2} />
      <g transform={`rotate(${-bearing} ${r} ${r})`}>
        {ticks.map((deg) => {
          const major = deg % 90 === 0;
          const len = major ? 26 : 13;
          const a = ((deg - 90) * Math.PI) / 180;
          const x1 = r + Math.cos(a) * (r - 34);
          const y1 = r + Math.sin(a) * (r - 34);
          const x2 = r + Math.cos(a) * (r - 34 - len);
          const y2 = r + Math.sin(a) * (r - 34 - len);
          return (
            <line
              key={deg}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={major ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.3)"}
              strokeWidth={major ? 5 : 3}
              strokeLinecap="round"
            />
          );
        })}
        {[
          ["N", 0, PALETTE.amber],
          ["E", 90, "rgba(255,255,255,0.8)"],
          ["S", 180, "rgba(255,255,255,0.8)"],
          ["W", 270, "rgba(255,255,255,0.8)"],
        ].map(([label, deg, fill]) => {
          const a = ((Number(deg) - 90) * Math.PI) / 180;
          return (
            <text
              key={String(label)}
              x={r + Math.cos(a) * (r - 92)}
              y={r + Math.sin(a) * (r - 92) + 16}
              fontFamily={FONT.sans}
              fontWeight={700}
              fontSize={46}
              fill={String(fill)}
              textAnchor="middle"
            >
              {label}
            </text>
          );
        })}
      </g>
      {/* the heading arrow, fixed while the ring turns under it */}
      <g transform={`translate(${r} ${r})`}>
        <path
          d={`M0 ${-r * 0.52} L ${r * 0.3} ${r * 0.34} L 0 ${r * 0.16} L ${-r * 0.3} ${r * 0.34} Z`}
          fill={PALETTE.amber}
        />
      </g>
    </svg>
  );
};

// ── instrument readouts, the app's own strip ──
export const Readout: React.FC<{
  label: string;
  value: string;
  unit?: string;
  color?: string;
  size?: number;
}> = ({ label, value, unit, color = PALETTE.white, size = 72 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
    <span
      style={{
        fontFamily: FONT.mono,
        fontWeight: 500,
        fontSize: size * 0.3,
        letterSpacing: 3,
        color: "rgba(255,255,255,0.62)",
      }}
    >
      {label}
    </span>
    <span style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <span style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: size, color }}>{value}</span>
      {unit ? (
        <span style={{ fontFamily: FONT.mono, fontWeight: 500, fontSize: size * 0.38, color, opacity: 0.8 }}>
          {unit}
        </span>
      ) : null}
    </span>
  </div>
);

// ── the SOS dial with its sonar rings ──
export const SosDial: React.FC<{ size: number; startAt: number }> = ({ size, startAt }) => {
  const frame = useCurrentFrame() - startAt;
  const r = size / 2;
  const rings = [0, 1, 2].map((i) => {
    const t = ((frame / 30 + i * 0.45) % 1.35) / 1.35;
    return { scale: 1 + t * 0.85, opacity: (1 - t) * 0.5 };
  });
  const pulse = 1 + Math.sin(frame / 9) * 0.015;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {rings.map((ring, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `4px solid ${PALETTE.amber}`,
            opacity: ring.opacity,
            transform: `scale(${ring.scale})`,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "radial-gradient(circle at 50% 36%, #E8392B 0%, #C1251A 100%)",
          boxShadow: "0 26px 70px rgba(193,37,26,0.5)",
          transform: `scale(${pulse})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: r * 0.08,
        }}
      >
        <svg width={r * 0.58} height={r * 0.58} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
        <span
          style={{
            fontFamily: FONT.sans,
            fontWeight: 700,
            fontSize: r * 0.44,
            letterSpacing: r * 0.05,
            color: PALETTE.white,
          }}
        >
          SOS
        </span>
      </div>
    </div>
  );
};

// ── a small uppercase mono label, the app's Eyebrow ──
export const Eyebrow: React.FC<{ children: React.ReactNode; color?: string; size?: number }> = ({
  children,
  color = PALETTE.amber,
  size = 26,
}) => (
  <span
    style={{
      fontFamily: FONT.mono,
      fontWeight: 600,
      fontSize: size,
      letterSpacing: 5,
      color,
      textTransform: "uppercase",
    }}
  >
    {children}
  </span>
);

// The score bar's one allowed ramp, from apps/mobile scoreBarColor.
export function scoreBarColor(score: number) {
  if (score >= 80) return PALETTE.amber;
  if (score >= 60) return PALETTE.amberWarm;
  if (score >= 40) return "#FF6B35";
  if (score >= 20) return "#EA580C";
  return "#DC2626";
}

export const useCounter = (from: number, to: number, startAt: number, length: number) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [startAt, startAt + length], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return from + (to - from) * (1 - Math.pow(1 - t, 3));
};
