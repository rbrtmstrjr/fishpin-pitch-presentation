import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, interpolateColors, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useAppSpring } from "../motion/primitives";
import { AnimatedMark, ContourField, Mono, NAVY_DEEP, Pill, Rise, Vignette, WordReveal } from "../pitch/kit";
import { f } from "../pitch/timing";
import { FONT, PALETTE } from "../theme";
import { Slam } from "../type/Slam";
import { Eyebrow, useCounter } from "../ui/brand";
import { GarminGps } from "./GarminGps";
import { Beat, Clip, FADE, Glyph, Headline, Interview, LowerThird, Narration, Num, Sfx, Shade, Shake } from "./parts";
import { T1 } from "./interviews";
// Deck copy: the national figures, generated from deck-data.js by scripts/build_clips.mjs.
import N from "../deck-numbers.json";
const peso = (n: number) => "₱" + n.toLocaleString("en-US");

// Section by section, in timeline order (see PITCH-5MIN-PLAN.md).
// Times inside a section are seconds from the section's start. The motion
// language is the 30 s teaser's: whip-pans, the contour wipe, sound hits on
// the cuts, a shake when the signal dies, the logo building itself.

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ------------------------------------------------------------ 1 · Hook 0:00–0:20

// The signal dies as the boat heads out (v02): on "gone" NO SERVICE fills the
// frame for a beat with a thud and a shake, and the picture drains of colour.
// Section seconds.
const SIG_GONE = 9.29;
const RED = "#F87171";

// Four signal bars; `left` of them still lit, the rest hollow. Slashed when none are.
const BarsGlyph: React.FC<{ left: number; size: number; color: string; slash?: number }> = ({ left, size, color, slash = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ overflow: "visible" }}>
    {[0, 1, 2, 3].map((i) => {
      const h = 5 + i * 5;
      const on = Math.max(0, Math.min(1, left - i));
      return <rect key={i} x={1.5 + i * 5.6} y={22 - h} width={4} height={h} rx={1} fill={color} opacity={0.22 + 0.78 * on} />;
    })}
    {slash > 0 ? <line x1={2} y1={2} x2={2 + 20 * slash} y2={2 + 20 * slash} stroke={RED} strokeWidth={2.6} strokeLinecap="round" /> : null}
  </svg>
);

const SignalLoss: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < SIG_GONE || t > 11) return null;
  const gone = true;
  const slash = interpolate(frame, [f(SIG_GONE), f(SIG_GONE) + 6], [0, 1], clamp);
  // the big moment on "gone", then it clears
  const big = spring({ frame: frame - f(SIG_GONE), fps, config: { damping: 12, stiffness: 170, mass: 0.7 } });
  const bigOut = interpolate(t, [10.3, 10.75], [1, 0], clamp);
  const drain = gone ? interpolate(t, [SIG_GONE, SIG_GONE + 0.25, 10.4, 10.9], [0, 0.85, 0.85, 0], clamp) : 0;
  const jolt = gone && frame - f(SIG_GONE) < 4 ? (frame % 2 ? 1 : -1) * 10 : 0;
  return (
    <AbsoluteFill>
      {/* the colour drains out of the sea when the signal goes */}
      <AbsoluteFill style={{ background: "#7f7f7f", mixBlendMode: "saturation", opacity: drain }} />
      <AbsoluteFill style={{ background: "rgba(6,18,51,0.35)", opacity: drain }} />

      {/* NO SERVICE, big, on "gone" */}
      {gone ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: bigOut }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              transform: `translate(${jolt}px, -40px) scale(${0.7 + 0.3 * big})`,
              opacity: interpolate(big, [0, 0.2], [0, 1], clamp),
            }}
          >
            <BarsGlyph left={0} size={150} color="#FFFFFF" slash={slash} />
            <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 88, letterSpacing: 4, color: "#FFFFFF", textShadow: "0 6px 30px rgba(0,0,0,0.6)" }}>NO SERVICE</div>
            <div style={{ padding: "6px 18px", borderRadius: 12, background: "rgba(248,113,113,0.9)", fontFamily: FONT.mono, fontWeight: 700, fontSize: 30, color: "#FFFFFF" }}>mobile data unavailable</div>
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

// 1B · far out, a fisherman checks his phone: no chart, no tracking
// (Raw videos/last_clip.mp4).
const PhoneOnBoat: React.FC = () => (
  <AbsoluteFill>
    <Clip src="1B-fisher-phone-at-sea" from={0.3} len={4.3} push={[1.0, 1.1]} />
  </AbsoluteFill>
);

// The lonely-boat shot: a lone banca far out at sea (Raw videos/dead_spot.mp4),
// in black and white, a slow push while the dark closes in. "NO ONE KNOWS WHERE
// YOU ARE" surfaces word by word as it is spoken, slow, out of a soft blur, and
// stays (v03's captions stop before it). Section seconds.
const LONELY_WORDS: [string, number, number][] = [
  ["NO", 17.0, 17.15],
  ["ONE", 17.23, 17.39],
  ["KNOWS", 17.43, 17.72],
  ["WHERE", 17.76, 17.94],
  ["YOU", 17.98, 18.07],
  ["ARE", 18.16, 18.47],
];
const LonelyBoat: React.FC<{ len: number; at: number }> = ({ len, at }) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [0, f(len)], [0.35, 0.9], clamp);
  const toBw = interpolate(frame, [0, 10], [0.4, 1], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: `grayscale(${toBw}) contrast(1.12) brightness(0.92)` }}>
        <Clip src="1-dead-spot" from={0.1} len={len} rate={0.85} push={[1.0, 1.16]} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 30%, rgba(0,0,0,${k}) 100%)` }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 170,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: 36,
          rowGap: 4,
          padding: "0 230px",
        }}
      >
        {LONELY_WORDS.map(([w, t, e]) => {
          const p = interpolate(frame, [f(t - at - 0.04), f(t - at - 0.04) + 14], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
          // amber while it is spoken, like the captions, then white
          const now = frame / 30 + at;
          const a = t - 0.03;
          const bump = interpolate(now, [a, a + 0.09, Math.max(a + 0.1, e), Math.max(a + 0.1, e) + 0.12], [0, 1, 1, 0], clamp);
          return (
            <span
              key={w}
              style={{
                display: "inline-block",
                fontFamily: FONT.sans,
                fontWeight: 800,
                fontSize: 132,
                lineHeight: 1.05,
                letterSpacing: interpolate(p, [0, 1], [18, 4]),
                color: interpolateColors(bump, [0, 1], ["#FFFFFF", PALETTE.amber]),
                textShadow: "0 8px 44px rgba(0,0,0,0.65)",
                opacity: p,
                filter: `blur(${(1 - p) * 12}px)`,
                transform: `translateY(${(1 - p) * 18 - 8 * bump}px) scale(${1 + 0.08 * bump})`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// The first shot opens like a sunrise: out of pre-dawn dark into daylight as the
// voice says "Every morning" (0.5–1.4 s), with a warm glow over the horizon that
// fades as the day comes up. Seconds into the shot.
const Sunrise: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const t = useCurrentFrame() / 30;
  const light = interpolate(t, [0, 2.6], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const glow = interpolate(t, [0.3, 1.3, 3.2], [0, 1, 0], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: `brightness(${0.28 + 0.72 * light}) saturate(${0.5 + 0.5 * light})` }}>{children}</AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(4,10,30,0.8) 0%, rgba(4,10,30,0.45) 55%, rgba(4,10,30,0.7) 100%)", opacity: 1 - light }} />
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse 70% 45% at 72% 30%, rgba(255,196,120,0.6) 0%, rgba(255,160,80,0.22) 40%, rgba(255,160,80,0) 70%)",
          mixBlendMode: "screen",
          opacity: glow,
        }}
      />
    </AbsoluteFill>
  );
};

export const S1Hook: React.FC = () => (
  <AbsoluteFill style={{ background: NAVY_DEEP }}>
    <Beat at={0} len={3.5} enter="cut">
      <Sunrise>
        <Clip src="broll-ready-to-fish" from={0.3} len={3.5} volume={0.55} push={[1.12, 1.04]} />
      </Sunrise>
    </Beat>
    {/* he settles at the engine and pulls it into life (Raw videos/fisherman-starting-his-boat.mp4, 11.2–14.2 s) */}
    <Beat at={3.5} len={3.0} enter="fade">
      <Clip src="broll-boat-start" from={11.2} len={3.0} volume={0.55} push={[1.08, 1.0]} />
    </Beat>
    <Beat at={6.5} len={4.5} enter="fade">
      {/* the banca heads out and pulls away, as the signal drops */}
      <Shake at={f(SIG_GONE - 6.5)}>
        <Clip src="broll-boat-start" from={30} len={5.1} volume={0.55} push={[1.0, 1.08]} />
      </Shake>
    </Beat>
    <Beat at={11} len={3.7} enter="contour">
      <PhoneOnBoat />
    </Beat>
    {/* the same moment over his shoulder: the phone in his hand, the open sea (Raw videos/overhead_2.mp4) */}
    <Beat at={14.7} len={2.1} enter="cut">
      <Clip src="1C-phone-shoulder" from={0.4} len={2.1} push={[1.0, 1.06]} />
    </Beat>
    <Beat at={16.8} len={3.8} enter="fade">
      <LonelyBoat len={3.8} at={16.8} />
    </Beat>

    {/* the signal dies as the boat heads out; NO SERVICE lands on "gone" with a thud and a shake */}
    <SignalLoss />
    {/* no sound effects over the first two clips: the opening stays calm */}
    <Sfx at={SIG_GONE} file="thud.wav" volume={0.9} />
    <Sfx at={10.95} file="whoosh.wav" volume={0.5} />

    <Narration section={1} />
  </AbsoluteFill>
);

// ------------------------------------------------------------ 2 · Founder 0:20–0:40

// Pushes in toward a point of the frame (fractions), easing in and out over `len` seconds.
const ZoomTo: React.FC<{ len: number; to: number; at: [number, number]; children: React.ReactNode }> = ({ len, to, at, children }) => {
  const z = interpolate(useCurrentFrame(), [0, f(len)], [1, to], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: `${at[0] * 100}% ${at[1] * 100}%` }}>{children}</AbsoluteFill>;
};

// End of the section: FishPin at work on a phone at sea (Raw videos/overhead_shot.mp4)
// while the brand builds itself.
const LogoMoment: React.FC = () => (
  <AbsoluteFill>
    <Clip src="2D-fishpin-at-sea" from={0.3} len={4.1} volume={0.12} push={[1.0, 1.08]} />
    {/* one smooth wash: dark behind the logo, lighter over the phone on the right */}
    <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(6,18,51,0.82) 0%, rgba(6,18,51,0.6) 35%, rgba(6,18,51,0.32) 65%, rgba(6,18,51,0.22) 100%)" }} />
    <div style={{ position: "absolute", left: 120, top: 300 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 28 }}>
        <AnimatedMark id="s2" startAt={8} size={200} />
        <div style={{ paddingBottom: 6 }}>
          <WordReveal startAt={24} height={100} />
        </div>
      </div>
      <div style={{ height: 30 }} />
      <Rise startAt={40}>
        <Mono size={34} color="#EAF2FF">
          Marine navigation for Filipino fishermen.
        </Mono>
      </Rise>
    </div>
  </AbsoluteFill>
);

// On "FishPin" the moment is captured like a photo: a flash and a shutter click,
// the beach behind freezes and softens under a light FishPin-blue tint, and the
// founder pops forward as a white-bordered cut-out that keeps moving: one per
// frame (scripts/sticker.py --seq, frames 184–218 of 2A-intro.mp4 in
// public/pitch5/img/snap). Section seconds; the clip starts 0.1 s in (3 frames).
const SNAP_AT = 6.02;

const FounderSnap: React.FC<{ len: number; push: [number, number] }> = ({ len, push }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = f(SNAP_AT);
  if (frame < at) return null;
  const scale = interpolate(at, [0, f(len)], push, clamp); // the clip's push, held where it froze
  const settle = interpolate(frame, [at, at + 8], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const pop = spring({ frame: frame - at - 2, fps, config: { damping: 13, stiffness: 160, mass: 0.8 } });
  const flash = interpolate(frame, [at, at + 2, at + 10], [0, 0.85, 0], clamp);
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})` }}>
      <AbsoluteFill style={{ transform: "scale(1.03)" }}>
        <Img
          src={staticFile("pitch5/img/2A-snap-frame.jpg")}
          style={{ width: 1920, height: 1080, filter: `blur(${4 * settle}px) brightness(${1 - 0.18 * settle})` }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#061233", opacity: 0.16 * settle }} />
      <AbsoluteFill style={{ background: "#2F6BFF", mixBlendMode: "color", opacity: 0.4 * settle }} />
      <Img
        src={staticFile(`pitch5/img/snap/s${Math.min(218, Math.max(184, frame + 3))}.png`)}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1920,
          height: 1080,
          transformOrigin: "62% 100%",
          transform: `scale(${1 + 0.05 * pop}) rotate(${-1 * pop}deg)`,
          filter: `drop-shadow(0 ${16 * pop}px ${26 * pop}px rgba(0,0,0,${0.45 * pop}))`,
        }}
      />
      <AbsoluteFill style={{ background: "#FFFFFF", opacity: flash }} />
    </AbsoluteFill>
  );
};

export const S2Founder: React.FC = () => (
  <AbsoluteFill style={{ background: NAVY_DEEP }}>
    {/* your intro to camera, with its own sound */}
    <Beat at={0} len={7.2} enter="contour">
      <Clip src="2A-intro" from={0.1} len={7.2} volume={1} push={[1.0, 1.04]} />
      <FounderSnap len={7.2} push={[1.0, 1.04]} />
    </Beat>
    <Beat at={7.2} len={4.5} enter="whip">
      <Clip src="2B-robert-hero" from={0.2} len={4.5} volume={0.12} />
    </Beat>
    {/* you at the desk building FishPin; ends on the grid of app screens */}
    <Beat at={11.7} len={4.8} enter="fade">
      <ZoomTo len={4.8} to={1.45} at={[0.45, 0.55]}>
        <Clip src="2C-laptop" from={3.0} len={4.8} volume={0.1} push={[1.0, 1.0]} />
      </ZoomTo>
    </Beat>
    <Beat at={16.5} len={3.5} enter="contour">
      <LogoMoment />
    </Beat>

    {/* the FishPin mark rises above the name as he says "FishPin" (6.02 s): waves on "ng", the fin on the word */}
    <Sequence from={f(0.6)} durationInFrames={f(6.6)}>
      <LowerThird name="Robert Maestro Jr" role="Founder & developer · Mansalay, Oriental Mindoro" len={f(6.6)} logo logoAt={f(5.66 - 0.6)} />
    </Sequence>

    <Sfx at={0} file="whoosh.wav" volume={0.45} />
    <Sfx at={SNAP_AT} file="shutter.wav" volume={0.7} />
    <Sfx at={7.15} file="whoosh.wav" volume={0.5} />
    <Sfx at={16.45} file="whoosh.wav" volume={0.4} />
    <Sfx at={17.15} file="ping.wav" volume={0.55} />

    <Narration section={2} />
  </AbsoluteFill>
);

// ------------------------------------------------------------ 3 · Problem 0:40–1:28

// 0:40 · about 103 fishermen, only 10 own a GPS, over the moored bancas in slow motion
// (deck copy: the national figures; the regional cut said around 100 and 15%).
const StatsBeat: React.FC = () => (
  <AbsoluteFill>
    <Clip src="broll-bancas-beach" from={0.1} len={9.7} rate={0.51} push={[1.04, 1.12]} />
    <Shade side="left" strength={0.85} />
    <div style={{ position: "absolute", left: 140, top: 250 }}>
      <Rise startAt={f(3.3)}>
        <Eyebrow>In our barangay</Eyebrow>
      </Rise>
      <div style={{ height: 28 }} />
      <div style={{ display: "flex", gap: 110 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
            <Rise startAt={f(4.45)}>
              <Mono size={40} color="#EAF2FF">
                about
              </Mono>
            </Rise>
            <Num to={N.barangayFishermen} startAt={f(4.5)} length={26} size={170} />
          </div>
          <Rise startAt={f(5.45)}>
            <Mono size={32}>fishermen</Mono>
          </Rise>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Slam startAt={f(7.0)} size={170} mono color={PALETTE.amber}>
            {String(N.barangayGps)}
          </Slam>
          <Rise startAt={f(8.0)}>
            <Mono size={32}>own a GPS</Mono>
          </Rise>
        </div>
      </div>
    </div>
  </AbsoluteFill>
);

// 0:50 · what a GPS costs, beside the Garmin carried over from the stats beat.
// ₱5,000 rises on "five thousand"; the top of the range counts up to land on "twenty-five thousand" (v09).
const CostBeat: React.FC = () => (
  <AbsoluteFill>
    <ContourField />
    <Vignette strength={0.5} />
    <div style={{ position: "absolute", left: 140, top: 300 }}>
      <Rise startAt={6}>
        <Eyebrow>A marine GPS costs</Eyebrow>
      </Rise>
      <div style={{ height: 26 }} />
      <div style={{ display: "flex", alignItems: "baseline", gap: 28 }}>
        <Rise startAt={f(2.15)}>
          <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 112, lineHeight: 1, color: "#FFFFFF" }}>{peso(N.plotterMin)}</div>
        </Rise>
        <Rise startAt={f(3.3)}>
          <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 112, lineHeight: 1, color: PALETTE.mist }}>–</div>
        </Rise>
        <Num from={N.plotterMin} to={N.plotterMax} startAt={f(3.3)} length={27} size={112} prefix="₱" color={PALETTE.amber} />
      </div>
      <div style={{ height: 36 }} />
      <Pill startAt={f(5.5)}>depends on the brand</Pill>
      <div style={{ height: 30 }} />
      <Rise startAt={f(6.0)}>
        <Mono size={36} color="#EAF2FF">
          Out of reach for most small fishers.
        </Mono>
      </Rise>
    </div>
  </AbsoluteFill>
);

// The Garmin only ~15% own: glides in on "Garmin GPS" over the beach, stays put while the
// cost beat whips in under it, and the interview fades in over it. Section frames.
const GarminHero: React.FC<{ enterAt: number; until: number }> = ({ enterAt, until }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < enterAt || frame > until) return null;
  const s = spring({ frame: frame - enterAt, fps, config: { damping: 15, stiffness: 110, mass: 1 } });
  const t = frame - enterAt;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 1250,
          top: 170,
          width: 600,
          height: 740,
          opacity: interpolate(s, [0, 1], [0, 1], clamp),
          background: `radial-gradient(ellipse at 50% 50%, ${PALETTE.amber}4D 0%, ${PALETTE.amber}00 62%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 1392,
          top: 255,
          transform: `translateX(${(1 - s) * 760}px) translateY(${Math.sin(t / 24) * 7}px) rotate(${-7 + Math.sin(t / 31) * 1.2 + (1 - s) * 26}deg)`,
          filter: "drop-shadow(0 34px 44px rgba(0,0,0,0.55))",
        }}
      >
        <GarminGps height={560} drawAt={enterAt + 16} />
      </div>
    </AbsoluteFill>
  );
};

const WIFI_OFF = [
  "M12 20h.01",
  "M8.5 16.429a5 5 0 0 1 7 0",
  "M5 12.859a10 10 0 0 1 5.17-2.69",
  "M19 12.859a10 10 0 0 0-2.007-1.523",
  "M2 8.82a15 15 0 0 1 4.177-2.643",
  "M22 8.82a15 15 0 0 0-11.288-3.764",
  "m2 2 20 20",
];
const LIFE_BUOY = ["m4.93 4.93 4.24 4.24", "m14.83 9.17 4.24-4.24", "m14.83 14.83 4.24 4.24", "m9.17 14.83-4.24 4.24"];

const GapCard: React.FC<{ startAt: number; icon: React.ReactNode; title: string; sub: string }> = ({ startAt, icon, title, sub }) => {
  const s = useAppSpring(startAt);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 30,
        width: 1180,
        padding: "28px 36px",
        borderRadius: 26,
        background: "rgba(6,18,51,0.8)",
        border: "2px solid rgba(234,242,255,0.14)",
        opacity: interpolate(s, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }),
        transform: `translateX(${(1 - s) * -80}px)`,
      }}
    >
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: 24,
          background: PALETTE.amber,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transform: `scale(${s}) rotate(${(1 - s) * -20}deg)`,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 50, color: "#FFFFFF", lineHeight: 1.15 }}>{title}</div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 500, fontSize: 28, color: PALETTE.mist, marginTop: 8 }}>{sub}</div>
      </div>
    </div>
  );
};

// 1:06 · the gap: no data, no safety net.
const GapBeat: React.FC = () => (
  <AbsoluteFill>
    <Clip src="broll-bancas-moored" from={0.1} len={8.6} rate={0.6} push={[1.02, 1.1]} />
    <Shade side="left" strength={0.8} />
    <div style={{ position: "absolute", left: 140, top: 230, display: "flex", flexDirection: "column", gap: 34 }}>
      <GapCard startAt={f(0.3)} icon={<Glyph d={WIFI_OFF} />} title="Phone apps need mobile data" sub="A few kilometers out, there is none." />
      <GapCard
        startAt={f(4.4)}
        icon={<Glyph d={LIFE_BUOY} circles={[[12, 12, 10], [12, 12, 4]]} />}
        title="No tracking. No safety net."
        sub="Small boats aren't covered by any vessel monitoring."
      />
    </div>
  </AbsoluteFill>
);

const Bar: React.FC<{ label: string; value: string; frac: number; startAt: number; color: string }> = ({ label, value, frac, startAt, color }) => {
  const s = useAppSpring(startAt);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: interpolate(s, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }) }}>
      <Mono size={26} color="#EAF2FF">
        {label}
      </Mono>
      <div style={{ width: 500, height: 34, borderRadius: 10, background: "rgba(234,242,255,0.08)", overflow: "hidden" }}>
        <div style={{ width: `${frac * 100 * s}%`, height: "100%", background: color, borderRadius: 10 }} />
      </div>
      <Mono size={26} color="#EAF2FF">
        {value}
      </Mono>
    </div>
  );
};

// 1:14 · poverty up, catch down (PSA). +10.0 lands on "ten", −43.4% on "forty-three" (v12);
// the 2024 bar starts at the 2023 level and falls with its tonnage.
const TrendsBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [f(3.5), f(5.1)], [0, 1], clamp);
  const shrink = useCounter(1, 1994.55 / 3523.01, f(8.4), 30);
  return (
    <AbsoluteFill>
      <ContourField glowAt={[50, 40]} />
      <Vignette />
      <Headline words={["Life", "is", "getting", "harder."]} at={[0.25, 0.65, 0.8, 1.1]} moveAt={f(2.1)} />

      <div style={{ position: "absolute", left: 150, top: 300, width: 760 }}>
        <Rise startAt={f(2.5)}>
          <Mono size={30} color="#EAF2FF">
            Fisherfolk poverty · MIMAROPA
          </Mono>
        </Rise>
        <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 14 }}>
          <Num to={10.0} dp={1} prefix="+" startAt={f(3.6)} length={45} size={150} color={PALETTE.amber} />
          <Rise startAt={f(5.3)}>
            <Mono size={44} color={PALETTE.amber}>
              points
            </Mono>
          </Rise>
        </div>
        <Rise startAt={f(3.0)}>
          <svg width={700} height={190} viewBox="0 0 700 190" style={{ marginTop: 24 }}>
            <line x1={0} y1={150} x2={700} y2={150} stroke="rgba(234,242,255,0.2)" strokeWidth={2} />
            <path
              d="M 20 130 C 220 124, 420 84, 680 22"
              fill="none"
              stroke={PALETTE.amber}
              strokeWidth={7}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - draw}
            />
            <circle cx={680} cy={22} r={11} fill={PALETTE.amber} opacity={draw > 0.98 ? 1 : 0} />
            <text x={20} y={182} fill={PALETTE.mist} fontFamily={FONT.mono} fontSize={22}>
              2021
            </text>
            <text x={630} y={182} fill={PALETTE.mist} fontFamily={FONT.mono} fontSize={22}>
              2023
            </text>
          </svg>
        </Rise>
      </div>

      <div style={{ position: "absolute", left: 1010, top: 300, width: 780 }}>
        <Rise startAt={f(6.3)}>
          <Mono size={30} color="#EAF2FF">
            Municipal catch · Oriental Mindoro
          </Mono>
        </Rise>
        <div style={{ marginTop: 14 }}>
          <Num to={-43.4} dp={1} suffix="%" startAt={f(8.4)} length={30} size={150} color="#F87171" />
        </div>
        <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 18 }}>
          <Bar label="2023" value="3,523 MT" frac={1} startAt={f(6.5)} color="rgba(234,242,255,0.5)" />
          <Bar
            label="2024"
            value={`${Math.round(3523.01 * shrink).toLocaleString("en-US")} MT`}
            frac={shrink}
            startAt={f(8.2)}
            color="#F87171"
          />
        </div>
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 200, textAlign: "center" }}>
        <Rise startAt={f(6)}>
          <Mono size={22} color="rgba(159,179,217,0.85)">
            Sources: PSA MIMAROPA poverty statistics 2021–2023 · PSA Oriental Mindoro fisheries 2024
          </Mono>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

export const S3Problem: React.FC = () => (
  <AbsoluteFill style={{ background: NAVY_DEEP }}>
    <Beat at={0} len={9.7} enter="contour">
      <StatsBeat />
    </Beat>
    <Beat at={9.7} len={8.3} enter="whip">
      <CostBeat />
    </Beat>
    <GarminHero enterAt={f(8.3)} until={f(18.0) + FADE} />
    {/* T1 · a fisherman on the problem, in his own words */}
    <Beat at={18.0} len={T1.len} enter="fade">
      <Interview data={T1} />
    </Beat>
    <Beat at={30.6} len={8.6} enter="contour">
      <GapBeat />
    </Beat>
    <Beat at={39.2} len={10.8} enter="whip">
      <TrendsBeat />
    </Beat>

    {/* each counting number ticks as it rolls (scripts/count-sfx.mjs) and lands on a ping or thud */}
    <Sfx at={0} file="whoosh.wav" volume={0.45} />
    <Sfx at={4.5} file="count-up-26.wav" volume={0.4} />
    <Sfx at={5.37} file="ping.wav" volume={0.35} />
    <Sfx at={7.1} file="thud.wav" volume={0.6} />
    <Sfx at={8.25} file="whoosh.wav" volume={0.3} />
    <Sfx at={9.65} file="whoosh.wav" volume={0.5} />
    <Sfx at={13.0} file="count-up-27.wav" volume={0.4} />
    <Sfx at={13.9} file="ping.wav" volume={0.4} />
    <Sfx at={30.55} file="whoosh.wav" volume={0.45} />
    <Sfx at={30.95} file="tick.wav" volume={0.5} />
    <Sfx at={35.05} file="tick.wav" volume={0.5} />
    <Sfx at={39.15} file="whoosh.wav" volume={0.5} />
    <Sfx at={42.8} file="count-up-45.wav" volume={0.4} />
    <Sfx at={44.3} file="ping.wav" volume={0.4} />
    <Sfx at={47.6} file="count-down-30.wav" volume={0.4} />
    <Sfx at={48.6} file="thud.wav" volume={0.5} />

    <Narration section={3} />
  </AbsoluteFill>
);
