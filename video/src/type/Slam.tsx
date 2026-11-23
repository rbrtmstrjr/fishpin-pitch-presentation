import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { useAppSpring } from "../motion/primitives";
import { FONT, PALETTE } from "../theme";

// Text that arrives with an overshoot and settles — the app's own spring.
export const Slam: React.FC<{
  children: React.ReactNode;
  startAt: number;
  size?: number;
  color?: string;
  mono?: boolean;
  weight?: number;
  letterSpacing?: number;
  align?: "left" | "center";
}> = ({
  children,
  startAt,
  size = 96,
  color = PALETTE.white,
  mono = false,
  weight = 700,
  letterSpacing = 0,
  align = "left",
}) => {
  const s = useAppSpring(startAt);
  const scale = interpolate(s, [0, 1], [1.14, 1]);
  const opacity = interpolate(s, [0, 0.35], [0, 1], { extrapolateRight: "clamp" });
  const y = interpolate(s, [0, 1], [26, 0]);
  return (
    <div
      style={{
        fontFamily: mono ? FONT.mono : FONT.sans,
        fontWeight: mono ? 600 : weight,
        fontSize: size,
        color,
        letterSpacing,
        lineHeight: 1.05,
        opacity,
        textAlign: align,
        transform: `translateY(${y}px) scale(${scale})`,
        transformOrigin: align === "center" ? "50% 50%" : "0% 50%",
      }}
    >
      {children}
    </div>
  );
};

// A caption pill: slides up and fades, the app's chip treatment.
export const Chip: React.FC<{
  children: React.ReactNode;
  startAt: number;
  size?: number;
}> = ({ children, startAt, size = 40 }) => {
  const s = useAppSpring(startAt);
  const frame = useCurrentFrame();
  const opacity = interpolate(s, [0, 0.4], [0, 1], { extrapolateRight: "clamp" });
  const y = interpolate(s, [0, 1], [34, 0]);
  // A hair of drift keeps it alive once it has landed.
  const drift = Math.sin((frame - startAt) / 26) * 2;
  return (
    <div
      style={{
        display: "inline-block",
        background: PALETTE.amber,
        color: PALETTE.brand950,
        fontFamily: FONT.sans,
        fontWeight: 600,
        fontSize: size,
        padding: `${size * 0.46}px ${size * 0.78}px`,
        borderRadius: size * 1.1,
        opacity,
        transform: `translateY(${y + drift}px)`,
        boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
      }}
    >
      {children}
    </div>
  );
};
