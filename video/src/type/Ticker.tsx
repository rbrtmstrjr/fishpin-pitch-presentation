import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FONT, PALETTE } from "../theme";

// Digits that actually roll, odometer-style: each wheel is driven by the
// continuous value at its place, not by the rounded digit, so the ones column
// is always mid-turn. Rolling numerals are one of the cheapest scroll-stoppers
// there is, and the app already sets every measurement in mono — so this is
// the product's own type doing the work.
const Wheel: React.FC<{ value: number; size: number; color: string }> = ({ value, size, color }) => {
  const h = size * 1.34;
  // Three turns of 0-9 so the wheel can roll in either direction without
  // running off the end of the strip.
  const digits = [...Array(30)].map((_, i) => i % 10);
  const offset = (((value % 10) + 10) % 10) + 10;
  return (
    <span
      style={{
        display: "inline-block",
        height: h,
        width: size * 0.62,
        overflow: "hidden",
        maskImage: "linear-gradient(to bottom, transparent 0%, #000 22%, #000 78%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, #000 22%, #000 78%, transparent 100%)",
      }}
    >
      <span
        style={{
          display: "block",
          transform: `translateY(${-offset * h}px)`,
          fontFamily: FONT.mono,
          fontWeight: 600,
          fontSize: size,
          color,
          lineHeight: `${h}px`,
          textAlign: "center",
        }}
      >
        {digits.map((d, i) => (
          <span key={i} style={{ display: "block", height: h }}>
            {d}
          </span>
        ))}
      </span>
    </span>
  );
};

export const Ticker: React.FC<{
  from: number;
  to: number;
  startAt: number;
  lengthInFrames: number;
  decimals?: number;
  size?: number;
  color?: string;
  suffix?: string;
}> = ({
  from,
  to,
  startAt,
  lengthInFrames,
  decimals = 1,
  size = 120,
  color = PALETTE.amber,
  suffix,
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [startAt, startAt + lengthInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Ease out, so the number lands rather than stopping dead.
  const value = from + (to - from) * (1 - Math.pow(1 - t, 3));

  // Lay out for the widest the number ever gets, so nothing shifts mid-count.
  const widest = Math.max(Math.abs(from), Math.abs(to));
  const intDigits = Math.max(1, String(Math.floor(widest)).length);
  const scaled = value * Math.pow(10, decimals);

  const places: React.ReactNode[] = [];
  for (let i = intDigits + decimals - 1; i >= 0; i--) {
    if (decimals > 0 && i === decimals - 1) {
      places.push(
        <span
          key="dot"
          style={{
            fontFamily: FONT.mono,
            fontWeight: 600,
            fontSize: size,
            color,
            lineHeight: `${size * 1.34}px`,
          }}
        >
          .
        </span>,
      );
    }
    places.push(<Wheel key={i} value={scaled / Math.pow(10, i)} size={size} color={color} />);
  }

  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: size * 0.14 }}>
      <div style={{ display: "flex" }}>{places}</div>
      {suffix ? (
        <span
          style={{
            fontFamily: FONT.mono,
            fontWeight: 500,
            fontSize: size * 0.4,
            color,
            opacity: 0.85,
          }}
        >
          {suffix}
        </span>
      ) : null}
    </div>
  );
};
