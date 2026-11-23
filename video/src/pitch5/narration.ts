import data from "./narration.json";
import durations from "../../public/pitch5/vo/durations.json";
import words from "../../public/pitch5/vo/words.json";

// Narration is data: text + where it starts (seconds into its section).
// scripts/comfy-vo.mjs speaks each line and records its real length in
// public/pitch5/vo/durations.json; until a line has audio, its caption length
// is estimated from the word count.

export const SECTION_START: Record<number, number> = { 0: 0, 1: 5, 2: 25, 3: 45, 4: 95, 5: 167, 6: 201, 7: 230, 8: 257, 9: 287 };

// `oncam` lines are spoken on camera in the footage itself: captions only, no voice-over.
// `caption: false` lines are already on screen as a title, so they get no captions;
// `captionUntil` (seconds into the line) stops them early, where the rest is a title.
export type VoLine = { id: string; section: number; at: number; text: string; oncam?: boolean; caption?: boolean; captionUntil?: number };
export const LINES: VoLine[] = data.lines;

const D = durations as Record<string, number>;
const estimate = (text: string) => Math.max(1.2, text.split(/\s+/).length / 2.6);

export const hasVo = (l: VoLine) => !l.oncam && D[l.id] !== undefined;
export const durOf = (l: VoLine) => D[l.id] ?? estimate(l.text);

// Word timings (seconds from the line's start) for the word-by-word captions.
// ElevenLabs takes carry real timings; any other take spreads the words over
// the line by length, which is close enough for a draft.
export type Word = { w: string; s: number; e: number };
const W = words as Record<string, Word[]>;

export const wordsOf = (l: VoLine): Word[] => {
  if (W[l.id]?.length) return W[l.id];
  const parts = l.text.split(/\s+/);
  const total = durOf(l);
  const chars = parts.reduce((a, p) => a + p.length + 1, 0);
  let t = 0;
  return parts.map((p) => {
    const d = ((p.length + 1) / chars) * total;
    const w = { w: p, s: t, e: t + d };
    t += d;
    return w;
  });
};

// Where narration plays on the full timeline (seconds), for ducking the music.
export const voRanges = (): [number, number][] =>
  LINES.filter(hasVo).map((l) => {
    const start = SECTION_START[l.section] + l.at;
    return [start, start + durOf(l)];
  });
