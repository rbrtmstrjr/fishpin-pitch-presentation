import { FPS } from "../theme";

export const PW = 1920;
export const PH = 1080;
export const f = (seconds: number) => Math.round(seconds * FPS);

// Scene starts in seconds. Each scene keeps running for TRANSITION frames
// after the next one starts, so every transition has a picture underneath.
// Order: hook, cost, memory, reveal, features, safety, proof, end card.
export const SCENE_AT = [0, 3.0, 6.4, 9.6, 13.4, 17.0, 21.4, 24.8];
export const TOTAL_SECONDS = 30;
export const TRANSITION = 18;

// Narration slots in seconds, one per scene. scripts/generate-pitch-vo.mjs
// writes public/vo/pitch30/line-N.wav; flip this on once those files exist
// (or once a recorded voiceover has been cut into the same files).
export const HAS_PITCH_VO = false;
export const VO_AT = [0.45, 3.2, 6.6, 10.0, 13.6, 17.15, 21.55, 25.3];
