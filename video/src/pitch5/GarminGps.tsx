import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FONT } from "../theme";

// A vector Garmin eTrex 10, the handheld GPS the few fishers who own one carry,
// drawn after the product photo (viewBox 340x600). From `drawAt` its monochrome
// screen draws a track from HOME out to a fishing SPOT, then the position
// marker blinks there. `brand={false}` leaves off the printed GARMIN and
// eTrex 10 (the paid ad uses the device without a competitor's name on it).

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const INK = "#1D1D1D";
const BODY = "M6 104 Q6 4 112 4 L228 4 Q334 4 334 104 L334 508 Q334 596 246 596 L94 596 Q6 596 6 508 Z";
const FACE = "M26 112 Q26 24 118 24 L222 24 Q314 24 314 112 L314 498 Q314 572 240 572 L100 572 Q26 572 26 498 Z";
const PANEL = "M52 114 Q52 60 106 60 L234 60 Q288 60 288 114 L288 466 Q288 524 230 524 L110 524 Q52 524 52 466 Z";
const GLOSS = "M52 114 Q52 60 106 60 L234 60 Q288 60 288 114 L288 200 Q170 232 52 200 Z";
const TRACK = "M156 420 C150 397 110 394 118 368 S176 344 168 318 S196 282 236 264";

const SideLabel: React.FC<{ x: number; y: number; turn: number; children: string }> = ({ x, y, turn, children }) => (
  <text
    transform={`translate(${x} ${y}) rotate(${turn})`}
    textAnchor="middle"
    dominantBaseline="middle"
    fontFamily={FONT.sans}
    fontSize={12}
    fontWeight={600}
    fill="#2B2B2B"
  >
    {children}
  </text>
);

export const GarminGps: React.FC<{ height: number; drawAt: number; id?: string; brand?: boolean }> = ({ height, drawAt, id = "garmin", brand = true }) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [drawAt, drawAt + 36], [0, 1], clamp);
  const arrive = interpolate(frame, [drawAt + 30, drawAt + 38], [0, 1], clamp);
  const blink = frame < drawAt + 38 ? arrive : Math.floor((frame - drawAt - 38) / 12) % 2 === 0 ? 1 : 0.3;
  const url = (name: string) => `url(#${id}-${name})`;
  return (
    <svg width={(height * 340) / 600} height={height} viewBox="0 0 340 600" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`${id}-rubber`} x1="0" x2="1">
          <stop offset="0" stopColor="#141414" />
          <stop offset="0.5" stopColor="#383838" />
          <stop offset="1" stopColor="#141414" />
        </linearGradient>
        <linearGradient id={`${id}-yellow`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFCD33" />
          <stop offset="1" stopColor="#F0AA00" />
        </linearGradient>
        <linearGradient id={`${id}-sheen`} x1="0" x2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.28" />
          <stop offset="0.22" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="0.8" stopColor="#000000" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.16" />
        </linearGradient>
        <linearGradient id={`${id}-gloss`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.13" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${id}-stick`} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#4A4A4A" />
          <stop offset="1" stopColor="#090909" />
        </radialGradient>
        <linearGradient id={`${id}-lcd`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#CFD3C8" />
          <stop offset="0.05" stopColor="#E8EAE3" />
          <stop offset="1" stopColor="#E1E4DB" />
        </linearGradient>
        <clipPath id={`${id}-screen`}>
          <rect x={72} y={214} width={196} height={240} rx={5} />
        </clipPath>
      </defs>

      {/* rubber body, yellow face, black panel */}
      <path d={BODY} fill={url("rubber")} />
      <path d={FACE} fill={url("yellow")} stroke="rgba(0,0,0,0.35)" strokeWidth={1.5} />
      <path d={FACE} fill={url("sheen")} />
      <path d={PANEL} fill="#111111" />
      <path d={GLOSS} fill={url("gloss")} />

      {/* side buttons' labels, printed on the yellow */}
      <path d="M39 82 l5 8 h-10 Z" fill="#2B2B2B" />
      <path d="M39 130 l5 -8 h-10 Z" fill="#2B2B2B" />
      <SideLabel x={40} y={236} turn={-90}>
        menu
      </SideLabel>
      <SideLabel x={300} y={100} turn={90}>
        back
      </SideLabel>
      <SideLabel x={300} y={226} turn={90}>
        light
      </SideLabel>

      {/* model name and joystick */}
      {brand ? (
        <text x={78} y={156} fontFamily={FONT.sans} fontSize={27} fontWeight={700} fontStyle="italic" fill="#D8D8D8">
          eTrex 10
        </text>
      ) : null}
      <circle cx={238} cy={138} r={27.5} fill="#F4A300" stroke="#5C3D00" strokeWidth={2} />
      <circle cx={238} cy={138} r={24} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={1.8} />
      <circle cx={238} cy={138} r={17.5} fill={url("stick")} />
      <ellipse cx={232} cy={131} rx={5.5} ry={3.5} fill="rgba(255,255,255,0.22)" />

      {/* screen: north arrow, scale, HOME, and the track out to the SPOT */}
      <rect x={72} y={214} width={196} height={240} rx={5} fill={url("lcd")} stroke="#6F6F6F" strokeWidth={2} />
      <g clipPath={url("screen")}>
        <path d="M88 246 L95 228 L102 246 L95 241 Z" fill={INK} />
        <text x={106} y={245} fontFamily={FONT.mono} fontSize={13} fontWeight={700} fill={INK}>
          N
        </text>
        <path d="M84 444 v-5 M84 444 h40 M124 444 v-5" stroke={INK} strokeWidth={2} fill="none" />
        <text x={84} y={434} fontFamily={FONT.mono} fontSize={11} fontWeight={700} fill={INK}>
          0.5km
        </text>
        <path
          d={TRACK}
          fill="none"
          stroke="#8C8C8C"
          strokeWidth={5.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
          opacity={draw > 0 ? 1 : 0}
        />
        <path d="M149 437 v-8 l7 -6 l7 6 v8 Z" fill={INK} />
        <text x={168} y={436} fontFamily={FONT.mono} fontSize={12} fontWeight={700} fill={INK}>
          HOME
        </text>
        <text x={226} y={256} textAnchor="end" fontFamily={FONT.mono} fontSize={12} fontWeight={700} fill={INK} opacity={arrive}>
          SPOT
        </text>
        <path d="M11 0 L-7 -7 L-3 0 L-7 7 Z" transform="translate(236 264) rotate(-24)" fill="#111111" opacity={blink} />
      </g>

      {brand ? (
        <text x={170} y={498} textAnchor="middle" fontFamily={FONT.sans} fontSize={24} fontWeight={800} letterSpacing={3} fill="#EFEFEF">
          GARMIN
        </text>
      ) : null}
    </svg>
  );
};
