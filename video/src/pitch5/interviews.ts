import type { InterviewData } from "./parts";

// The fisherman interviews. Each clip is the answer only: the interviewer's
// question is cut from the audio and typed on screen instead. The answer's words
// are an `oncam` line in narration.json (captions only), timed in words.json on
// the speech bursts.

// Section 3 · the problem. Raw: Pictures/Raw videos/testimonial_problem.mp4,
// cut from 4.6 s (the question ends at 3.9 s), voice raised to the narration level.
// He says: "'Yung hindi namin makita 'yung location ng aming pupuntahan, 'yung
// kapag madilim, umulan, gabi, 'yun ang problema."
export const T1: InterviewData = {
  src: "T1-problem",
  len: 12.6,
  question: "Ano po ang pinakamalaking problema ninyo sa laot?",
  name: "Clarence Santiago",
  role: "Local fisherman · Mansalay",
};

// Section 5 · the solution, the same fisherman. Raw: Pictures/Raw videos/testimonial_solution.mp4,
// cut from 4.3 s (the question ends at 3.5 s) to 22.3 s, dropping his closing
// "Laking tulong talaga ang FishPin" (he says it at the start), voice raised to
// the narration level.
// He says: "Ah, malaking tulong ang FishPin, kase unang una, mahal nga ang GPS,
// tapos pag mayron ka nito ay makikita mo kagad yung location, at hindi kana
// mamroblema kahit gabi, kahit maulan, madilim, may sigurado ka nang pupuntahan."
export const T2: InterviewData = {
  src: "T2-solution",
  len: 18.0,
  // right after "makikita mo": FishPin on a phone at sea, the first 5 s of
  // Pictures/Raw videos/testimonial-add-clip.mp4, muted
  inserts: [{ src: "T2-ui-insert", at: 7.3, len: 5.0 }],
  question: "Paano po nakatulong sa inyo ang FishPin?",
  name: "Clarence Santiago",
  role: "Local fisherman · Mansalay",
};
