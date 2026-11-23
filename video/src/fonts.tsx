import { staticFile } from "remotion";

// The real app faces, loaded from files so a render never needs the network.
const FACES = [
  { family: "Poppins", weight: 600, file: "fonts/Poppins-SemiBold.ttf" },
  { family: "Poppins", weight: 700, file: "fonts/Poppins-Bold.ttf" },
  { family: "IBM Plex Mono", weight: 500, file: "fonts/IBMPlexMono-Medium.ttf" },
  { family: "IBM Plex Mono", weight: 600, file: "fonts/IBMPlexMono-SemiBold.ttf" },
];

export const FontFaces: React.FC = () => (
  <style
    // eslint-disable-next-line react/no-danger
    dangerouslySetInnerHTML={{
      __html: FACES.map(
        (f) =>
          `@font-face{font-family:"${f.family}";font-weight:${f.weight};font-style:normal;src:url("${staticFile(
            f.file,
          )}") format("truetype");font-display:block;}`,
      ).join(""),
    }}
  />
);
