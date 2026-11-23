import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SPRING } from "../theme";

// Nothing in this ad is ever still: a slow push runs under every beat, because
// a static frame in a feed reads as a photo and gets scrolled past.
export const Push: React.FC<{
  children: React.ReactNode;
  from?: number;
  to?: number;
  origin?: string;
}> = ({ children, from = 1, to = 1.04, origin = "50% 50%" }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], [from, to], {
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ width: "100%", height: "100%", transform: `scale(${scale})`, transformOrigin: origin }}>
      {children}
    </div>
  );
};

// The app's own entrance spring, so the ad moves like the product.
export const useAppSpring = (startAt: number, config = SPRING) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - startAt, fps, config });
};

// A whip-pan: the outgoing scene is thrown off-screen and smeared, the
// incoming one arrives from the other side. Never a cross-dissolve.
export const Whip: React.FC<{
  children: React.ReactNode;
  startAt: number;
  lengthInFrames: number;
  direction?: 1 | -1;
  incoming?: boolean;
}> = ({ children, startAt, lengthInFrames, direction = 1, incoming = false }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const t = interpolate(frame, [startAt, startAt + lengthInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Ease the travel but keep the blur peaking mid-throw.
  const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const x = incoming ? (1 - eased) * width * direction : -eased * width * direction;
  const blur = Math.sin(Math.PI * t) * 26;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `translateX(${x}px)`,
        filter: `blur(${blur}px)`,
      }}
    >
      {children}
    </div>
  );
};
