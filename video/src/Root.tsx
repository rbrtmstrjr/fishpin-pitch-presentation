import React from "react";
import { Composition } from "remotion";
import { Pitch5Part } from "./pitch5/Pitch5";
import { PH, PW } from "./pitch/timing";
import { FPS } from "./theme";

// One composition: any time range of the FishPin Pitch 2026 timeline, in seconds.
// scripts/build_clips.mjs renders each section through it (muted, no captions)
// and cuts the deck's slide clips out of those renders.
export const DeckClipsRoot: React.FC = () => (
  <Composition
    id="clip"
    component={Pitch5Part}
    defaultProps={{ from: 5, to: 25 }}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.round((props.to - props.from) * FPS) })}
    fps={FPS}
    width={PW}
    height={PH}
  />
);
