import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CANVAS, PALETTE } from "../theme";

// Our signature transition: the incoming scene is uncovered by a sweep whose
// leading edge is the brand's own contour line. Nobody else's ad can use it,
// and it ties the video to the static posts, which are built on the same
// artwork.
const CONTOUR = [0, 1, 2, 3, 4, 5].map((i) => {
  const amp = 46 + i * 9;
  const phase = i * 0.8;
  let d = `M 0 ${-200}`;
  for (let y = -200; y <= CANVAS.height + 200; y += 60) {
    d += ` L ${Math.sin(y / 240 + phase) * amp + i * 26} ${y}`;
  }
  return d;
});

export const ContourWipe: React.FC<{
  children: React.ReactNode;
  startAt: number;
  lengthInFrames: number;
}> = ({ children, startAt, lengthInFrames }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [startAt, startAt + lengthInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const edge = eased * (CANVAS.width + 260);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `inset(0 ${(1 - eased) * 100}% 0 0)` }}>{children}</AbsoluteFill>

      {/* the contour rides the leading edge and leaves with it */}
      {t > 0 && t < 1 ? (
        <AbsoluteFill style={{ transform: `translateX(${edge - 160}px)` }}>
          <svg width={CANVAS.width} height={CANVAS.height} style={{ opacity: 0.9 }}>
            {CONTOUR.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="none"
                stroke={i === 0 ? PALETTE.amber : PALETTE.contour}
                strokeWidth={i === 0 ? 7 : 3}
              />
            ))}
          </svg>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
