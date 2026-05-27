export type TrainTrackType =
  | "straight"
  | "curve"
  | "corner-module"
  | "loop"
  | "switch-left"
  | "switch-right"
  | "flex"
  | "station"
  | "double-straight"
  | "double-corner";

export type TrainPreset = {
  id: string;
  name: string;
  widthStuds: number;
  depthStuds: number;
  category: "train";
  trackType: TrainTrackType;
  rotationAllowed: boolean;
  moduleType:
    | "straight-module"
    | "r40-corner-module"
    | "switch-module"
    | "station-module"
    | "double-track-module"
    | "turning-loop-module";
  baseplateModule: string;
  radiusStuds?: number;
  angleDegrees?: number;
  piecesIncluded?: number;
  straightSectionsIncluded?: number;
  clearanceStuds?: number;
  trackCenterSpacingStuds?: number;
  trackWidthStuds?: number;
  sideMarginStuds?: number;
  innerRadiusStuds?: number;
  outerRadiusStuds?: number;
};

export const trainPresets: TrainPreset[] = [
  {
    id: "train-straight-16",
    name: "Straight Track Module",
    widthStuds: 16,
    depthStuds: 32,
    category: "train",
    trackType: "straight",
    moduleType: "straight-module",
    baseplateModule: "16x32",
    straightSectionsIncluded: 2,
    trackWidthStuds: 8,
    sideMarginStuds: 4,
    rotationAllowed: true,
  },
  {
    id: "train-curve-r40-22-5",
    name: "R40 Curve Reference",
    widthStuds: 48,
    depthStuds: 48,
    category: "train",
    trackType: "curve",
    moduleType: "r40-corner-module",
    baseplateModule: "48x48",
    radiusStuds: 40,
    angleDegrees: 22.5,
    piecesIncluded: 1,
    rotationAllowed: true,
  },
  {
    id: "train-corner-r40-90",
    name: "R40 Corner Module",
    widthStuds: 48,
    depthStuds: 48,
    category: "train",
    trackType: "corner-module",
    moduleType: "r40-corner-module",
    baseplateModule: "48x48",
    radiusStuds: 40,
    angleDegrees: 90,
    piecesIncluded: 4,
    rotationAllowed: true,
  },
  {
    id: "train-circle-r40",
    name: "R40 Turning Loop Module",
    widthStuds: 96,
    depthStuds: 96,
    category: "train",
    trackType: "loop",
    moduleType: "turning-loop-module",
    baseplateModule: "96x96",
    radiusStuds: 40,
    angleDegrees: 360,
    piecesIncluded: 16,
    rotationAllowed: false,
  },
  {
    id: "train-switch-left",
    name: "Left Switch Module",
    widthStuds: 48,
    depthStuds: 32,
    category: "train",
    trackType: "switch-left",
    moduleType: "switch-module",
    baseplateModule: "48x32",
    rotationAllowed: true,
  },
  {
    id: "train-switch-right",
    name: "Right Switch Module",
    widthStuds: 48,
    depthStuds: 32,
    category: "train",
    trackType: "switch-right",
    moduleType: "switch-module",
    baseplateModule: "48x32",
    rotationAllowed: true,
  },
  {
    id: "train-flex-4",
    name: "Flex Track",
    widthStuds: 16,
    depthStuds: 32,
    category: "train",
    trackType: "flex",
    moduleType: "straight-module",
    baseplateModule: "16x32",
    trackWidthStuds: 8,
    sideMarginStuds: 4,
    rotationAllowed: true,
  },
  {
    id: "train-station-section",
    name: "Station Track Module",
    widthStuds: 16,
    depthStuds: 32,
    category: "train",
    trackType: "station",
    moduleType: "station-module",
    baseplateModule: "16x32",
    rotationAllowed: true,
  },
  {
    id: "train-double-straight-16",
    name: "Double Track Straight Module",
    widthStuds: 32,
    depthStuds: 32,
    category: "train",
    trackType: "double-straight",
    moduleType: "double-track-module",
    baseplateModule: "32x32",
    trackCenterSpacingStuds: 16,
    trackWidthStuds: 8,
    sideMarginStuds: 4,
    rotationAllowed: true,
  },
  {
    id: "train-double-corner-r40-r56",
    name: "Double Track Corner Module",
    widthStuds: 64,
    depthStuds: 64,
    category: "train",
    trackType: "double-corner",
    moduleType: "double-track-module",
    baseplateModule: "64x64",
    innerRadiusStuds: 40,
    outerRadiusStuds: 56,
    trackCenterSpacingStuds: 16,
    rotationAllowed: true,
  },
];
