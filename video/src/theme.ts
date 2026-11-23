// Mirrored from the app so the ad moves and reads like the product.
// Palette: packages/shared/constants/index.ts · Motion: apps/mobile/theme/motion.ts

export const PALETTE = {
  brand50: "#ecf6ff",
  brand500: "#147dff",
  brand600: "#0061ff",
  brand900: "#083aa0",
  brand950: "#0a2461",
  amber: "#FFC857",
  amberWarm: "#FFA74B",
  white: "#FFFFFF",
  mist: "#9FB3D9",
  card: "#0c1d45",
  contour: "rgba(125,195,255,0.34)",
} as const;

export const FONT = {
  sans: "Poppins",
  mono: "IBM Plex Mono",
} as const;

// Durations are in milliseconds in the app; video thinks in frames.
export const DURATION = { fast: 120, base: 200, slow: 320 } as const;
export const SPRING = { damping: 26, stiffness: 260, mass: 0.9 } as const;
export const STAGGER_MS = 40;

export const FPS = 30;
export const ms = (value: number) => Math.round((value / 1000) * FPS);

// Meta unified the 9:16 safe zone in March 2026: the top 250px and bottom
// 672px are covered by platform UI, so every readable word lives between them.
export const SAFE = { top: 250, bottom: 1248, side: 64 } as const;

export const CANVAS = { width: 1080, height: 1920 } as const;
