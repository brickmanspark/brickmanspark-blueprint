"use client";

import { toPng } from "html-to-image";
import {
  Building2,
  Download,
  Filter,
  Grip,
  Info,
  Map,
  Plus,
  Printer,
  RotateCw,
  Route,
  Save,
  Sparkles,
  Trash2,
  Undo2,
  Redo2,
} from "lucide-react";
import { type CSSProperties, PointerEvent, WheelEvent, useEffect, useMemo, useRef, useState } from "react";
import { modularBuildings } from "@/app/data/modularBuildings";
import { TrainPreset, trainPresets } from "@/src/data/trainPresets";

type Category =
  | "restaurants"
  | "transport"
  | "retail"
  | "residential"
  | "civic"
  | "entertainment"
  | "park"
  | "industrial"
  | "other";

type CategoryFilter = Category | "all";
type PickerTab = "buildings" | "roads" | "train";
type ViewMode = "blueprint" | "build-guide";
type BlueprintDisplayMode = "build" | "planning";
type PlanningMode = "auto" | "manual";
type TrainGenerator =
  | "none"
  | "perimeter"
  | "single-loop"
  | "double-loop"
  | "point-to-point"
  | "dogbone"
  | "custom";
type TrainElevation = "ground" | "elevated-rear" | "elevated-side" | "fully-elevated";
type LayoutShape = "rectangle" | "l-shape" | "u-shape" | "custom";
type LayoutFeatureChoice = "roads" | "train" | "both" | "neither";
type FrontSide = "north" | "east" | "south" | "west";
type ModularType = "straight" | "corner" | "end" | "landmark" | "freestanding";
type PreferredPlacement = "road-facing" | "corner" | "plaza-facing" | "park-facing";
type WidthType = "16x32" | "32x32" | "48x32" | "48x48" | "custom";
type RoadKind = "straight" | "corner" | "t-junction" | "cross" | "dead-end" | "plaza" | "alley";
type SelectedObject = { kind: "piece"; id: string } | { kind: "train"; id: string };
type Direction = "north" | "east" | "south" | "west";
type ModularCardFilter = "all" | "corner" | "straight" | "residential" | "commercial" | "civic";
type RoadSystem = "32x32" | "16x32" | "mixed" | "minimal" | "decide";
type AddOnSize = "small" | "medium" | "large" | "wide" | "custom";
type InventoryMode = "unlimited" | "owned" | "suggest";
type OverhangMode = "none" | "slight" | "moderate";
type SnapGroup = "modular" | "road" | "detail";
type RoadAssetKey =
  | "straight_32x32"
  | "corner_32x32"
  | "t_junction_32x32"
  | "crossroad_32x32"
  | "dead_end_32x32"
  | "future_road_connection_32x32"
  | "straight_16x32";
type RoadInventoryKey =
  | "straight32"
  | "corner32"
  | "t32"
  | "cross32"
  | "deadEnd32"
  | "straight16"
  | "corner16"
  | "t16"
  | "cross16";
type TrainInventoryKey = "straight" | "curve" | "leftSwitch" | "rightSwitch" | "flex" | "platform";
type SpaceFillChoice =
  | "future-straight"
  | "future-corner"
  | "park"
  | "plaza"
  | "market"
  | "construction"
  | "bus-stop"
  | "outdoor-seating"
  | "car-park"
  | "playground"
  | "waterfront"
  | "open-space"
  | "decide";
type CityStyle = "modular-downtown" | "european-town" | "modern-city" | "mixed-use" | "decide";
type FeatureCategory = "Buildings" | "Roads" | "Trains" | "Terrain" | "UI / UX" | "Performance" | "Exporting" | "Other";
type RoadmapStatus = "Planned" | "In Progress" | "Released";
type ActiveModal = null | "waitlist" | "featureRequest" | "roadmap";
type CityAddOnId =
  | "park"
  | "plaza"
  | "car-park"
  | "bus-stop"
  | "construction-site"
  | "outdoor-seating"
  | "market-stalls"
  | "waterfront"
  | "alleyway"
  | "future-expansion"
  | "plate-8x16"
  | "plate-16x8"
  | "pavement-8x16"
  | "alley-8x16"
  | "seating-8x16"
  | "bus-stop-8x16"
  | "market-stall-8x16"
  | "small-park-8x16"
  | "filler-8x16";
type DimensionInputKey =
  | "tableWidth"
  | "tableDepth"
  | "lArmWidth"
  | "lArmDepth"
  | "uBackWidth"
  | "uBackDepth"
  | "uLeftArmLength"
  | "uLeftArmWidth"
  | "uRightArmLength"
  | "uRightArmWidth"
  | "uInnerGapWidth"
  | "uInnerGapDepth";
type CustomSectionInputField = "widthStuds" | "depthStuds" | "x" | "y";
type TrainObjectType = "trackPiece" | "supportBaseplate";
type TrainSupportSize = "16x16" | "16x32" | "48x48" | "96x96" | "32x32" | "48x32" | "64x64";

type CityAddOnSelection = {
  id: CityAddOnId;
  size: AddOnSize;
  customWidth: number;
  customDepth: number;
};

type CustomMoc = {
  id: string;
  name: string;
  widthStuds: number;
  depthStuds: number;
  widthCm: number;
  depthCm: number;
  modularType: "straight" | "corner" | "landmark" | "freestanding";
  category: Category;
  isCustomMoc: true;
  silhouetteAsset?: string;
};

type TableSection = {
  id: string;
  name: string;
  widthCm: number;
  depthCm: number;
  widthStuds: number;
  depthStuds: number;
  x: number;
  y: number;
};

type Zone = {
  id: string;
  name: string;
  widthCm: number;
  depthCm: number;
  widthStuds: number;
  depthStuds: number;
  x: number;
  y: number;
};

type Piece = {
  id: string;
  type: "building" | "road" | "future";
  name: string;
  category: Category | "Road" | "Future";
  width: number;
  depth: number;
  x: number;
  y: number;
  rotation: 0 | 90 | 180 | 270;
  frontSide?: FrontSide;
  allowedRotations?: number[];
  modularType?: ModularType;
  preferredPlacement?: PreferredPlacement;
  setNumber?: string;
  year?: number;
  isOfficialLEGO?: boolean;
  isCustomMoc?: boolean;
  isSplitBuildingCompatible?: boolean;
  roadKind?: RoadKind;
  roadConnections?: Record<Direction, boolean>;
  selectedRoadType?: RoadAssetKey;
  lockRoadAsset?: boolean;
  footprintKind?: ModularType | "official";
  footprintSvg?: string;
  baseplateModule?: string;
  snapGroup?: SnapGroup;
  snapSize?: 8 | 16;
};

type TrainPiece = {
  id: string;
  presetId: string;
  type: "trackPiece" | "train";
  name: string;
  category: "train";
  trainObjectType?: TrainObjectType;
  supportSize?: TrainSupportSize;
  supportPurpose?: "track-support";
  visible?: boolean;
  trackType: TrainPreset["trackType"];
  width: number;
  depth: number;
  x: number;
  y: number;
  rotation: 0 | 90 | 180 | 270;
  rotationAllowed: boolean;
  clearanceStuds?: number;
  level?: "ground" | "elevated";
  elevationMode?: TrainElevation;
  baseplateModule?: string;
  radiusStuds?: number;
  angleDegrees?: number;
  piecesIncluded?: number;
};

type SupportBaseplate = {
  id: string;
  type: "supportBaseplate";
  size: TrainSupportSize;
  purpose: "track-support";
  visible: boolean;
  trackPieceId: string;
  x: number;
  y: number;
  widthStuds: number;
  depthStuds: number;
};

type RailwaySegment = {
  id: string;
  pieceIds: string[];
  orientation: "horizontal" | "vertical";
  x: number;
  y: number;
  width: number;
  depth: number;
  level?: "ground" | "elevated";
  elevationMode?: TrainElevation;
};

type DistrictKind = "retail" | "restaurant" | "civic" | "residential" | "business" | "park" | "mixed";

type SavedLayout = {
  id: string;
  name: string;
  widthCm: number;
  depthCm: number;
  widthStuds: number;
  depthStuds: number;
  tableWidth?: number;
  tableDepth?: number;
  bridgeTableJoins?: boolean;
  overhangMode?: OverhangMode;
  layoutShape?: LayoutShape;
  planningMode?: PlanningMode | null;
  tableSections?: TableSection[];
  blockedZones?: Zone[];
  usableZones?: Zone[];
  pieces: Piece[];
  trainPieces?: TrainPiece[];
  layoutScore?: number;
  layoutNotes?: string[];
  updatedAt: string;
};

type LayoutSnapshot = {
  pieces: Piece[];
  trainPieces: TrainPiece[];
  layoutScore: number;
  layoutNotes: string[];
  objectWarning: string;
};

type HistoryEntry = LayoutSnapshot & {
  action: string;
  timestamp: string;
};

type AutoSavedProject = {
  planningMode: PlanningMode | null;
  selectedOfficialSets: string[];
  customMocs: CustomMoc[];
  roadInventory: Record<RoadInventoryKey, number>;
  roadInventoryMode: InventoryMode;
  cityAddOns: CityAddOnSelection[];
  layoutFeatureChoice: LayoutFeatureChoice;
  roadSystem: RoadSystem;
  layoutShape: LayoutShape;
  tableWidth: number;
  tableDepth: number;
  dimensionInputs: Record<DimensionInputKey, string>;
  bridgeTableJoins: boolean;
  overhangMode: OverhangMode;
  cityStyle: CityStyle;
  pieces: Piece[];
  trainPieces: TrainPiece[];
  layoutScore: number;
  layoutNotes: string[];
  blueprintReady: boolean;
  savedAt: string;
};

type FeatureRequest = {
  id: string;
  text: string;
  category: FeatureCategory;
  email?: string;
  createdAt: string;
};

type RoadmapItem = {
  id: string;
  title: string;
  votes: number;
  status: RoadmapStatus;
};

type LayoutFeedback = {
  id: string;
  useful: boolean;
  reasons: string[];
  createdAt: string;
  layoutScore: number;
};

const STORAGE_KEY = "brick-city-planner-layouts";
const PROJECT_AUTOSAVE_KEY = "brickmanspark-blueprint-autosave";
const FEATURE_REQUESTS_KEY = "brickmanspark-feature-requests";
const ROADMAP_VOTES_KEY = "brickmanspark-roadmap-votes";
const LAYOUT_FEEDBACK_KEY = "brickmanspark-layout-feedback";
const SIDEBAR_COLLAPSED_KEY = "brickmanspark-sidebar-collapsed";
const SNAP_STUDS = 8;
const STUD_PX = 8;
const STUD_CM = 0.8;
const DEFAULT_WIDTH_CM = 240;
const DEFAULT_DEPTH_CM = 120;
const DEFAULT_WIDTH = DEFAULT_WIDTH_CM / STUD_CM;
const DEFAULT_DEPTH = DEFAULT_DEPTH_CM / STUD_CM;
const ROAD_PLATE_SIZE = 32;
const TRAIN_CORNER_CLEARANCE = 48;
const TRAIN_TRACK_WIDTH = 8;
const TRAIN_TRACK_LENGTH = 16;
const TRAIN_STRAIGHT_MODULE_WIDTH = 16;
const TRAIN_STRAIGHT_MODULE_DEPTH = 32;
const TRAIN_CORNER_MODULE_SIZE = 48;
const TRAIN_LOOP_MODULE_SIZE = 96;
const TRAIN_DOUBLE_CORNER_MODULE_SIZE = 64;
const TRACK_CENTER_SPACING = 16;

const supportedBaseplateModules = [
  [8, 16],
  [16, 8],
  [16, 16],
  [16, 32],
  [32, 16],
  [32, 32],
  [48, 48],
  [48, 32],
  [64, 32],
] as const;

const trainElevationLabels: Record<TrainElevation, string> = {
  ground: "Ground Level",
  "elevated-rear": "Elevated Rear Edge",
  "elevated-side": "Elevated Side Edge",
  "fully-elevated": "Fully Elevated",
};

const categoryOptions: Array<{ value: Category; label: string }> = [
  { value: "restaurants", label: "Restaurants" },
  { value: "transport", label: "Transport" },
  { value: "retail", label: "Retail" },
  { value: "residential", label: "Residential" },
  { value: "civic", label: "Civic" },
  { value: "entertainment", label: "Entertainment" },
  { value: "park", label: "Park/green space" },
  { value: "industrial", label: "Industrial" },
  { value: "other", label: "Other" },
];

const featureCategories: FeatureCategory[] = [
  "Buildings",
  "Roads",
  "Trains",
  "Terrain",
  "UI / UX",
  "Performance",
  "Exporting",
  "Other",
];

const roadmapSeedItems: RoadmapItem[] = [
  { id: "train-planner-v2", title: "Train Planner V2", votes: 124, status: "In Progress" },
  { id: "raised-layout-planning", title: "Raised Layout Planning", votes: 87, status: "Planned" },
  { id: "water-river-tool", title: "Water / River Tool", votes: 65, status: "Planned" },
  { id: "mils-mode", title: "MILS Mode", votes: 58, status: "Planned" },
  { id: "train-station-generator", title: "Train Station Generator", votes: 41, status: "Planned" },
  { id: "rebrickable-integration", title: "Rebrickable Integration", votes: 37, status: "Planned" },
  { id: "build-guide-mode", title: "Build Guide Mode", votes: 29, status: "Released" },
  { id: "manual-build-mode", title: "Manual Build Mode", votes: 24, status: "Released" },
  { id: "live-city-rating", title: "Live City Rating", votes: 18, status: "Released" },
];

const feedbackReasons = [
  "Roads not realistic",
  "Didn't use enough space",
  "Wrong building placement",
  "Poor district generation",
  "Other",
];

const categoryStyles: Record<Piece["category"], string> = {
  restaurants: "bg-orange-200 border-orange-500 text-orange-950",
  transport: "bg-violet-200 border-violet-500 text-violet-950",
  retail: "bg-yellow-200 border-yellow-500 text-yellow-950",
  residential: "bg-green-200 border-green-500 text-green-950",
  civic: "bg-blue-200 border-blue-500 text-blue-950",
  entertainment: "bg-purple-200 border-purple-500 text-purple-950",
  park: "bg-lime-200 border-lime-500 text-lime-950",
  industrial: "bg-stone-300 border-stone-600 text-stone-950",
  other: "bg-purple-100 border-purple-400 text-purple-950",
  Road: "bg-zinc-600 border-zinc-800 text-white",
  Future: "bg-emerald-100 border-emerald-500 text-emerald-950",
};

const categorySwatches: Record<Piece["category"], string> = {
  restaurants: "#fb923c",
  transport: "#8b5cf6",
  retail: "#facc15",
  residential: "#86efac",
  civic: "#60a5fa",
  entertainment: "#c084fc",
  park: "#84cc16",
  industrial: "#a8a29e",
  other: "#d8b4fe",
  Road: "#52525b",
  Future: "#bbf7d0",
};

const ratingTone = (value: number) =>
  value >= 90
    ? "border-lime-300 bg-lime-100 text-lime-950"
    : value >= 75
      ? "border-yellow-300 bg-yellow-100 text-yellow-950"
      : "border-orange-300 bg-orange-100 text-orange-950";
const ratingStatus = (value: number) =>
  value >= 90
    ? { label: "Excellent", icon: "🟢", className: "border-lime-300 bg-lime-100 text-lime-950" }
    : value >= 75
      ? { label: "Good", icon: "🟡", className: "border-yellow-300 bg-yellow-100 text-yellow-950" }
      : value >= 50
        ? { label: "Average", icon: "🟠", className: "border-orange-300 bg-orange-100 text-orange-950" }
        : { label: "Poor", icon: "🔴", className: "border-red-300 bg-red-100 text-red-950" };
const cityChallengeTier = (value: number) =>
  value >= 100
    ? "Perfect Blueprint"
    : value >= 95
      ? "Master Builder City"
      : value >= 90
        ? "Gold City"
        : value >= 75
          ? "Silver City"
          : value >= 60
            ? "Bronze City"
            : "Starter Town";

const cityRatingCapForWarnings = (warningCount: number) => {
  if (warningCount <= 0) return 100;
  if (warningCount === 1) return 95;
  if (warningCount === 2) return 90;
  if (warningCount === 3) return 85;
  return 80;
};

const capCityRatingByWarnings = (score: number, warningCount: number) =>
  Math.min(score, cityRatingCapForWarnings(warningCount));

const directions: Direction[] = ["north", "east", "south", "west"];
const directionOpposites: Record<Direction, Direction> = {
  north: "south",
  east: "west",
  south: "north",
  west: "east",
};
const directionAngles: Record<Direction, Piece["rotation"]> = {
  east: 0,
  south: 90,
  west: 180,
  north: 270,
};
const roadRotationAngles: Piece["rotation"][] = [0, 90, 180, 270];
const rotateDirection = (direction: Direction, rotation: Piece["rotation"]): Direction => {
  const index = directions.indexOf(direction);
  return directions[(index + rotation / 90) % directions.length];
};
const sideForTouchingRoads = (
  road: { x: number; y: number; width: number; depth: number },
  other: { x: number; y: number; width: number; depth: number },
): Direction | null => {
  const horizontalOverlap = road.x < other.x + other.width && road.x + road.width > other.x;
  const verticalOverlap = road.y < other.y + other.depth && road.y + road.depth > other.y;
  if (horizontalOverlap && road.y === other.y + other.depth) return "north";
  if (horizontalOverlap && road.y + road.depth === other.y) return "south";
  if (verticalOverlap && road.x === other.x + other.width) return "west";
  if (verticalOverlap && road.x + road.width === other.x) return "east";
  return null;
};
const roadConnectionRecord = (connections: Set<Direction>): Record<Direction, boolean> => ({
  north: connections.has("north"),
  east: connections.has("east"),
  south: connections.has("south"),
  west: connections.has("west"),
});
const connectionKey = (connections: Set<Direction>) =>
  directions.filter((direction) => connections.has(direction)).join("-");
const roadAssetDefaultConnectionsFor = (kind: RoadKind = "straight"): Set<Direction> => {
  const defaults: Record<RoadKind, Direction[]> = {
    straight: ["north", "south"],
    corner: ["north", "east"],
    "t-junction": ["north", "east", "west"],
    cross: ["north", "east", "south", "west"],
    "dead-end": ["north"],
    plaza: [],
    alley: ["north", "south"],
  };
  return new Set(defaults[kind] ?? defaults.straight);
};
const rotatedConnections = (connections: Set<Direction>, rotation: Piece["rotation"]) =>
  new Set(Array.from(connections).map((direction) => rotateDirection(direction, rotation)));
const sameConnections = (a: Set<Direction>, b: Set<Direction>) =>
  directions.every((direction) => a.has(direction) === b.has(direction));
const getRotationForConnections = (
  assetDefaultConnections: Set<Direction>,
  requiredConnections: Set<Direction>,
): Piece["rotation"] =>
  roadRotationAngles.find((rotation) =>
    sameConnections(rotatedConnections(assetDefaultConnections, rotation), requiredConnections),
  ) ?? 0;
const roadConnectionsFor = (road: Pick<Piece, "roadKind" | "rotation">): Set<Direction> =>
  rotatedConnections(roadAssetDefaultConnectionsFor(road.roadKind), road.rotation ?? 0);
const roadKindForConnections = (connections: Set<Direction>, preferredKind?: RoadKind): RoadKind => {
  const count = connections.size;
  if (count === 4) return "cross";
  if (count === 3) return "t-junction";
  if (count === 1) return "dead-end";
  if (count === 2) {
    const straight = (connections.has("north") && connections.has("south")) || (connections.has("east") && connections.has("west"));
    return straight ? "straight" : "corner";
  }
  return preferredKind ?? "straight";
};
const roadKindAndRotationForConnections = (
  connections: Set<Direction>,
  preferredKind?: RoadKind,
): { roadKind: RoadKind; rotation: Piece["rotation"] } => {
  const roadKind = roadKindForConnections(connections, preferredKind);
  const rotation = getRotationForConnections(roadAssetDefaultConnectionsFor(roadKind), connections);
  return { roadKind, rotation };
};
const orientRoadFootprint = (road: Piece, rotation: Piece["rotation"]): Piece => {
  const isRectangular = road.width !== road.depth;
  if (!isRectangular) return { ...road, rotation };
  const rotated = rotatedConnections(roadAssetDefaultConnectionsFor(road.roadKind), rotation);
  const shouldBeVertical = rotated.has("north") && rotated.has("south") && !rotated.has("east") && !rotated.has("west");
  const longSide = Math.max(road.width, road.depth);
  const shortSide = Math.min(road.width, road.depth);
  return {
    ...road,
    rotation,
    width: shouldBeVertical ? shortSide : longSide,
    depth: shouldBeVertical ? longSide : shortSide,
  };
};

const districtLabels: Record<DistrictKind, string> = {
  retail: "Retail District",
  restaurant: "Restaurant Row",
  civic: "Civic Quarter",
  residential: "Residential District",
  business: "Business District",
  park: "Green Space",
  mixed: "Mixed Use Core",
};

const categoryLabels: Record<Piece["category"], string> = {
  restaurants: "Restaurants",
  transport: "Transport",
  retail: "Retail",
  residential: "Residential",
  civic: "Civic",
  entertainment: "Entertainment",
  park: "Park/green space",
  industrial: "Industrial",
  other: "Other",
  Road: "Road",
  Future: "Future",
};

const roadSystemOptions: Array<{ value: RoadSystem; label: string }> = [
  { value: "decide", label: "Let app decide" },
  { value: "32x32", label: "32x32 LEGO road modules" },
  { value: "16x32", label: "Compact 16x32 road modules" },
  { value: "mixed", label: "Mixed 32x32 city roads" },
  { value: "minimal", label: "Minimal 32x32 roads" },
];

const cityAddOnOptions: Array<{ id: CityAddOnId; label: string }> = [
  { id: "park", label: "Park" },
  { id: "plaza", label: "Plaza" },
  { id: "car-park", label: "Car park" },
  { id: "bus-stop", label: "Bus stop" },
  { id: "construction-site", label: "Construction site" },
  { id: "outdoor-seating", label: "Outdoor seating" },
  { id: "market-stalls", label: "Market stalls" },
  { id: "waterfront", label: "Waterfront" },
  { id: "alleyway", label: "Alleyway" },
  { id: "future-expansion", label: "Future expansion zone" },
  { id: "plate-8x16", label: "8x16 plate" },
  { id: "plate-16x8", label: "16x8 plate" },
  { id: "pavement-8x16", label: "8x16 pavement" },
  { id: "alley-8x16", label: "8x16 alley" },
  { id: "seating-8x16", label: "8x16 seating area" },
  { id: "bus-stop-8x16", label: "8x16 bus stop" },
  { id: "market-stall-8x16", label: "8x16 market stall" },
  { id: "small-park-8x16", label: "8x16 small park" },
  { id: "filler-8x16", label: "8x16 filler / detail zone" },
];

const roadInventoryOptions: Array<{ key: RoadInventoryKey; label: string }> = [
  { key: "straight32", label: "Straight road 32x32" },
  { key: "corner32", label: "Corner road 32x32" },
  { key: "t32", label: "T-junction 32x32" },
  { key: "cross32", label: "Cross junction 32x32" },
  { key: "deadEnd32", label: "Dead end / future road 32x32" },
  { key: "straight16", label: "Straight road 16x32" },
  { key: "corner16", label: "Corner road 16x32" },
  { key: "t16", label: "T-junction 16x32" },
  { key: "cross16", label: "Cross junction 16x32" },
];

const trainInventoryOptions: Array<{ key: TrainInventoryKey; label: string }> = [
  { key: "straight", label: "Straight track pieces" },
  { key: "curve", label: "Curved R40 track pieces" },
  { key: "leftSwitch", label: "Left switches" },
  { key: "rightSwitch", label: "Right switches" },
  { key: "flex", label: "Flex track pieces" },
  { key: "platform", label: "Platform modules" },
];

const spaceFillOptions: Array<{ value: SpaceFillChoice; label: string }> = [
  { value: "future-straight", label: "Future straight modular plots" },
  { value: "future-corner", label: "Future corner modular plots" },
  { value: "park", label: "Park" },
  { value: "plaza", label: "Plaza" },
  { value: "market", label: "Market" },
  { value: "construction", label: "Construction site" },
  { value: "bus-stop", label: "Bus stop" },
  { value: "outdoor-seating", label: "Outdoor seating" },
  { value: "car-park", label: "Car park" },
  { value: "playground", label: "Playground" },
  { value: "waterfront", label: "Waterfront" },
  { value: "open-space", label: "Leave as open space" },
  { value: "decide", label: "Let Blueprint decide" },
];

const addOnSizeLabels: Record<AddOnSize, string> = {
  small: "Small 16x16",
  medium: "Medium 16x32",
  large: "Large 32x32",
  wide: "Wide 48x32",
  custom: "Custom",
};

const modularCardFilters: Array<{ value: ModularCardFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "corner", label: "Corner" },
  { value: "straight", label: "Straight" },
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "civic", label: "Civic" },
];

const normalizeCategory = (category: string): Piece["category"] => {
  const legacy: Record<string, Piece["category"]> = {
    Restaurant: "restaurants",
    Restaurants: "restaurants",
    Transit: "transport",
    Transport: "transport",
    Shop: "retail",
    Retail: "retail",
    Residential: "residential",
    Civic: "civic",
    Entertainment: "entertainment",
    Park: "park",
    "Park/green space": "park",
    Industrial: "industrial",
    Other: "other",
    Road: "Road",
    Future: "Future",
  };

  if (legacy[category]) return legacy[category];
  if (categoryOptions.some((option) => option.value === category)) return category as Category;
  return "retail";
};

const normalizePiece = (piece: Piece): Piece => ({
  ...alignPieceToSnap({
    ...piece,
    snapGroup: piece.snapGroup ?? snapGroupForPiece(piece),
    snapSize: piece.snapSize ?? snapSizeForPiece(piece),
  }),
  category: normalizeCategory(piece.category),
  rotation: piece.rotation ?? 0,
  frontSide: piece.frontSide ?? "south",
  allowedRotations: piece.allowedRotations ?? [0, 90, 180, 270],
  modularType: piece.modularType ?? "straight",
  preferredPlacement: piece.preferredPlacement ?? "road-facing",
  roadConnections:
    piece.roadConnections ??
    (piece.type === "road" && piece.roadKind
      ? roadConnectionRecord(roadConnectionsFor(piece))
      : undefined),
  footprintSvg:
    piece.footprintSvg ??
    (piece.isOfficialLEGO && piece.setNumber
      ? modularBuildings.find((building) => building.setNumber === piece.setNumber)?.silhouetteAsset
      : undefined),
  baseplateModule: piece.baseplateModule ?? baseplateModuleLabel(piece.width, piece.depth),
});

const normalizeTrainPiece = (piece: TrainPiece): TrainPiece => ({
  ...piece,
  type: piece.trainObjectType === "supportBaseplate" ? "train" : "trackPiece",
  category: "train",
  trainObjectType: piece.trainObjectType ?? "trackPiece",
  rotation: piece.rotation ?? 0,
  level: piece.level ?? "ground",
  elevationMode: piece.elevationMode ?? "ground",
  baseplateModule: piece.baseplateModule ?? baseplateModuleLabel(piece.width, piece.depth),
});

const normalizeTableSection = (section: TableSection): TableSection =>
  sectionWithCm({
    ...section,
    widthStuds: section.widthStuds,
    depthStuds: section.depthStuds,
  });

const newId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), Math.max(min, max));

const snap = (value: number) => Math.round(value / SNAP_STUDS) * SNAP_STUDS;
const snapTo = (value: number, size: 8 | 16) => Math.round(value / size) * size;

const snapGroupForPiece = (piece: Pick<Piece, "type" | "width" | "depth" | "snapGroup">): SnapGroup => {
  if (piece.snapGroup) return piece.snapGroup;
  if (piece.type === "building") return "modular";
  if (piece.type === "road") return piece.width <= 8 || piece.depth <= 8 ? "detail" : "road";
  return piece.width <= 16 && piece.depth <= 16 ? "detail" : "modular";
};

const snapSizeForPiece = (piece: Pick<Piece, "type" | "width" | "depth" | "snapGroup" | "snapSize">): 8 | 16 =>
  piece.snapSize ?? (snapGroupForPiece(piece) === "detail" ? 8 : 16);

const alignPieceToSnap = <T extends Pick<Piece, "x" | "y" | "type" | "width" | "depth" | "snapGroup" | "snapSize">>(piece: T): T => {
  const snapSize = snapSizeForPiece(piece);
  return {
    ...piece,
    x: snapTo(piece.x, snapSize),
    y: snapTo(piece.y, snapSize),
  };
};

const cmToStuds = (cm: number) => cm / STUD_CM;

const studsToCm = (studs: number) => Number((studs * STUD_CM).toFixed(1));

const baseplateModuleLabel = (width: number, depth: number) => {
  const exact = supportedBaseplateModules.some(([moduleWidth, moduleDepth]) => moduleWidth === width && moduleDepth === depth);
  return exact ? `${width}x${depth}` : `Custom ${width}x${depth}`;
};

const snapBaseplateDimension = (value: number) => Math.max(8, snap(value));

const withPieceModule = <T extends { width: number; depth: number; baseplateModule?: string }>(item: T): T => ({
  ...item,
  width: snapBaseplateDimension(item.width),
  depth: snapBaseplateDimension(item.depth),
  baseplateModule: baseplateModuleLabel(snapBaseplateDimension(item.width), snapBaseplateDimension(item.depth)),
});

const sectionWithCm = (
  section: Omit<TableSection, "widthCm" | "depthCm">,
): TableSection => ({
  ...section,
  widthCm: studsToCm(section.widthStuds),
  depthCm: studsToCm(section.depthStuds),
});

const zoneWithCm = (zone: Omit<Zone, "widthCm" | "depthCm">): Zone => ({
  ...zone,
  widthCm: studsToCm(zone.widthStuds),
  depthCm: studsToCm(zone.depthStuds),
});

const rectsOverlap = (
  a: { x: number; y: number; width: number; depth: number },
  b: { x: number; y: number; width: number; depth: number },
) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.depth && a.y + a.depth > b.y;

const zoneToRect = (zone: Zone | TableSection) => ({
  x: zone.x,
  y: zone.y,
  width: zone.widthStuds,
  depth: zone.depthStuds,
});

const rectInside = (
  rect: { x: number; y: number; width: number; depth: number },
  zone: Zone | TableSection,
) =>
  rect.x >= zone.x &&
  rect.y >= zone.y &&
  rect.x + rect.width <= zone.x + zone.widthStuds &&
  rect.y + rect.depth <= zone.y + zone.depthStuds;

const rectCoveredByUsableSurface = (
  rect: { x: number; y: number; width: number; depth: number },
  usableZones: Zone[],
) => {
  const rectRight = rect.x + rect.width;
  const rectBottom = rect.y + rect.depth;
  const xStops = new Set<number>([rect.x, rectRight]);

  usableZones.forEach((zone) => {
    const zoneLeft = zone.x;
    const zoneRight = zone.x + zone.widthStuds;
    if (zoneRight <= rect.x || zoneLeft >= rectRight) return;
    xStops.add(clamp(zoneLeft, rect.x, rectRight));
    xStops.add(clamp(zoneRight, rect.x, rectRight));
  });

  const sortedXStops = Array.from(xStops).sort((a, b) => a - b);
  if (sortedXStops.length < 2) return false;

  for (let index = 0; index < sortedXStops.length - 1; index += 1) {
    const sliceLeft = sortedXStops[index];
    const sliceRight = sortedXStops[index + 1];
    if (sliceRight <= sliceLeft) continue;

    const yIntervals = usableZones
      .filter((zone) => zone.x < sliceRight && zone.x + zone.widthStuds > sliceLeft)
      .map((zone) => ({
        top: clamp(zone.y, rect.y, rectBottom),
        bottom: clamp(zone.y + zone.depthStuds, rect.y, rectBottom),
      }))
      .filter((interval) => interval.bottom > interval.top)
      .sort((a, b) => a.top - b.top);

    let coveredTo = rect.y;
    for (const interval of yIntervals) {
      if (interval.top > coveredTo) break;
      coveredTo = Math.max(coveredTo, interval.bottom);
      if (coveredTo >= rectBottom) break;
    }

    if (coveredTo < rectBottom) return false;
  }

  return true;
};

const supportedAreaForRect = (
  rect: { x: number; y: number; width: number; depth: number },
  usableZones: Zone[],
  blockedZones: Zone[],
) => {
  const supportedArea = usableZones.reduce((sum, zone) => {
    const left = Math.max(rect.x, zone.x);
    const right = Math.min(rect.x + rect.width, zone.x + zone.widthStuds);
    const top = Math.max(rect.y, zone.y);
    const bottom = Math.min(rect.y + rect.depth, zone.y + zone.depthStuds);
    return sum + Math.max(0, right - left) * Math.max(0, bottom - top);
  }, 0);
  const blockedArea = blockedZones.reduce((sum, zone) => {
    const left = Math.max(rect.x, zone.x);
    const right = Math.min(rect.x + rect.width, zone.x + zone.widthStuds);
    const top = Math.max(rect.y, zone.y);
    const bottom = Math.min(rect.y + rect.depth, zone.y + zone.depthStuds);
    return sum + Math.max(0, right - left) * Math.max(0, bottom - top);
  }, 0);
  return Math.max(0, supportedArea - blockedArea);
};

const supportRatioForRect = (
  rect: { x: number; y: number; width: number; depth: number },
  usableZones: Zone[],
  blockedZones: Zone[],
) => supportedAreaForRect(rect, usableZones, blockedZones) / Math.max(1, rect.width * rect.depth);

const usableBounds = (usableZones: Zone[]) => ({
  left: Math.min(...usableZones.map((zone) => zone.x)),
  top: Math.min(...usableZones.map((zone) => zone.y)),
  right: Math.max(...usableZones.map((zone) => zone.x + zone.widthStuds)),
  bottom: Math.max(...usableZones.map((zone) => zone.y + zone.depthStuds)),
});

const maxOverhangDistanceForRect = (
  rect: { x: number; y: number; width: number; depth: number },
  usableZones: Zone[],
) => {
  const bounds = usableBounds(usableZones);
  return Math.max(
    0,
    bounds.left - rect.x,
    bounds.top - rect.y,
    rect.x + rect.width - bounds.right,
    rect.y + rect.depth - bounds.bottom,
  );
};

const rectCornersSupported = (
  rect: { x: number; y: number; width: number; depth: number },
  usableZones: Zone[],
) => {
  const corners = [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y },
    { x: rect.x, y: rect.y + rect.depth },
    { x: rect.x + rect.width, y: rect.y + rect.depth },
  ];
  return corners.every((corner) =>
    usableZones.some(
      (zone) =>
        corner.x >= zone.x &&
        corner.x <= zone.x + zone.widthStuds &&
        corner.y >= zone.y &&
        corner.y <= zone.y + zone.depthStuds,
    ),
  );
};

const rectIsUsable = (
  rect: { x: number; y: number; width: number; depth: number },
  usableZones: Zone[],
  blockedZones: Zone[],
  bridgeTableJoins = true,
) => {
  if (blockedZones.some((zone) => rectsOverlap(rect, zoneToRect(zone)))) return false;
  if (!bridgeTableJoins) return usableZones.some((zone) => rectInside(rect, zone));
  return rectCoveredByUsableSurface(rect, usableZones);
};

const trainVisualClass = (trackType: TrainPreset["trackType"]) => {
  if (trackType.includes("corner") || trackType === "curve" || trackType === "loop") {
    return "rounded-tl-[999px] border-l-[10px] border-t-[10px]";
  }
  if (trackType.includes("switch")) {
    return "before:absolute before:left-2 before:top-1/2 before:h-[10px] before:w-[80%] before:-translate-y-1/2 before:rounded-full before:bg-zinc-700 after:absolute after:left-1/3 after:top-1/2 after:h-[10px] after:w-[55%] after:origin-left after:-translate-y-1/2 after:rotate-[28deg] after:rounded-full after:bg-zinc-700";
  }
  return "before:absolute before:left-1 before:right-1 before:top-1/2 before:h-[10px] before:-translate-y-1/2 before:rounded-full before:bg-zinc-700";
};

const rotateSide = (side: FrontSide, rotation: number): FrontSide => {
  const sides: FrontSide[] = ["north", "east", "south", "west"];
  const index = sides.indexOf(side);
  return sides[(index + rotation / 90) % sides.length];
};

const footprintForModular = (modularType: ModularType) => {
  if (modularType === "corner") return "corner";
  if (modularType === "freestanding" || modularType === "landmark") return "freestanding";
  if (modularType === "end") return "end";
  return "straight";
};

const mocSizeFromWidthType = (widthType: WidthType, customWidth: number, customDepth: number) => {
  if (widthType === "16x32") return { width: 16, depth: 32 };
  if (widthType === "48x32") return { width: 48, depth: 32 };
  if (widthType === "48x48") return { width: 48, depth: 48 };
  if (widthType === "custom") {
    return { width: snapBaseplateDimension(customWidth), depth: snapBaseplateDimension(customDepth) };
  }
  return { width: 32, depth: 32 };
};

const addOnSizeToStuds = (addOn: CityAddOnSelection) => {
  if (addOn.id === "plate-8x16" || addOn.id === "pavement-8x16" || addOn.id === "alley-8x16" || addOn.id === "seating-8x16" || addOn.id === "bus-stop-8x16" || addOn.id === "market-stall-8x16" || addOn.id === "small-park-8x16" || addOn.id === "filler-8x16") {
    return { width: 8, depth: 16 };
  }
  if (addOn.id === "plate-16x8") return { width: 16, depth: 8 };
  if (addOn.size === "small") return { width: 16, depth: 16 };
  if (addOn.size === "medium") return { width: 16, depth: 32 };
  if (addOn.size === "large") return { width: 32, depth: 32 };
  if (addOn.size === "wide") return { width: 48, depth: 32 };
  return {
    width: snapBaseplateDimension(addOn.customWidth),
    depth: snapBaseplateDimension(addOn.customDepth),
  };
};

const roadAssetFor = (kind: RoadKind = "straight", width = 32, depth = 32) => {
  if (kind === "corner") return "/assets/roads/curve-32.png";
  if (kind === "t-junction") return "/assets/roads/t-junction-32.png";
  if (kind === "cross") return "/assets/roads/crossroad-32.png";
  if (kind === "dead-end") return "/assets/roads/dead-end-32.png";
  if (kind === "plaza") return "/assets/roads/plaza-32.png";
  if (kind === "alley") return "/assets/roads/alley-32.png";
  if ((width === 16 && depth === 32) || (width === 32 && depth === 16)) return "/assets/roads/straight-16x32.png";
  return "/assets/roads/straight-32.png";
};

const roadAssetKeyFor = (kind: RoadKind = "straight", width = 32, depth = 32): RoadAssetKey => {
  if (kind === "corner") return "corner_32x32";
  if (kind === "t-junction") return "t_junction_32x32";
  if (kind === "cross") return "crossroad_32x32";
  if (kind === "dead-end") return "dead_end_32x32";
  if ((width === 16 && depth === 32) || (width === 32 && depth === 16)) return "straight_16x32";
  return "straight_32x32";
};

const roadLabelFor = (kind: RoadKind = "straight", width = 32, depth = 32) => {
  if (kind === "corner") return "32x32 Corner Road";
  if (kind === "t-junction") return "32x32 T Junction";
  if (kind === "cross") return "32x32 Crossroad";
  if (kind === "dead-end") return "32x32 Dead End";
  if (width === 16 && depth === 32) return "16x32 Straight Road";
  if (width === 32 && depth === 16) return "32x16 Straight Road";
  return "32x32 Straight Road";
};

const roadDebugPayloadFor = (piece: Pick<Piece, "roadKind" | "width" | "depth" | "rotation" | "selectedRoadType">) => ({
  selectedRoadType: piece.selectedRoadType ?? roadAssetKeyFor(piece.roadKind, piece.width, piece.depth),
  imageAssetUsed: roadAssetFor(piece.roadKind, piece.width, piece.depth),
  rotation: piece.rotation,
});

function RoadFootprint({
  kind,
  rotation = 0,
  width = 32,
  depth = 32,
}: {
  kind?: RoadKind;
  rotation?: Piece["rotation"];
  width?: number;
  depth?: number;
}) {
  const asset = roadAssetFor(kind, width, depth);
  const needsRotatedAsset = rotation === 90 || rotation === 270;
  return (
    <div className="relative h-full w-full overflow-hidden bg-stone-300">
      <img
        src={asset}
        alt=""
        draggable={false}
        className="pointer-events-none absolute left-1/2 top-1/2 select-none"
        style={{
          width: needsRotatedAsset ? `${(depth / Math.max(1, width)) * 100}%` : "100%",
          height: needsRotatedAsset ? `${(width / Math.max(1, depth)) * 100}%` : "100%",
          objectFit: "fill",
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
          transformOrigin: "center",
        }}
      />
    </div>
  );
}

function TrainFootprint({ trackType }: { trackType: TrainPreset["trackType"] }) {
  if (trackType.includes("switch")) {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <g strokeLinecap="round" fill="none">
          <path d="M0 43h100M0 57h100M36 43l58-34M42 57l58-34" stroke="#27272a" strokeWidth="4" vectorEffect="non-scaling-stroke" />
          <path d="M6 32v36M18 32v36M30 32v36M42 31v38M54 30v35M66 24v35M78 17v35M90 10v35" stroke="#8b7355" strokeWidth="3" opacity="0.65" vectorEffect="non-scaling-stroke" />
        </g>
      </svg>
    );
  }
  if (trackType === "station") {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <rect x="8" y="8" width="84" height="22" rx="3" fill="#c6b58f" opacity="0.8" />
        <path d="M0 43h100M0 57h100" stroke="#27272a" strokeWidth="4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <path d="M8 34v32M22 34v32M36 34v32M50 34v32M64 34v32M78 34v32M92 34v32" stroke="#8b7355" strokeWidth="3" opacity="0.65" vectorEffect="non-scaling-stroke" />
      </svg>
    );
  }
  if (trackType.includes("corner") || trackType === "curve" || trackType === "loop") {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <path d="M10 90A80 80 0 0 1 90 10" stroke="#27272a" strokeWidth="4" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <path d="M24 90A66 66 0 0 1 90 24" stroke="#27272a" strokeWidth="4" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {Array.from({ length: 8 }).map((_, index) => {
          const angle = (92 - index * 11.5) * Math.PI / 180;
          const inner = 66;
          const outer = 80;
          const cx = 90;
          const cy = 90;
          return (
            <path
              key={index}
              d={`M${cx - Math.cos(angle) * inner} ${cy - Math.sin(angle) * inner}L${cx - Math.cos(angle) * outer} ${cy - Math.sin(angle) * outer}`}
              stroke="#8b7355"
              strokeWidth="3"
              opacity="0.65"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path d="M0 38h100M0 62h100" stroke="#27272a" strokeWidth="5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path d="M8 28v44M22 28v44M36 28v44M50 28v44M64 28v44M78 28v44M92 28v44" stroke="#8b7355" strokeWidth="4" opacity="0.65" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function ContinuousRailSegment({ orientation }: { orientation: RailwaySegment["orientation"] }) {
  const sleepers = Array.from({ length: 18 });

  if (orientation === "vertical") {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
        <path d="M38 0v100M62 0v100" stroke="#27272a" strokeWidth="5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {sleepers.map((_, index) => {
          const y = 4 + index * (92 / (sleepers.length - 1));
          return (
            <path
              key={index}
              d={`M28 ${y}h44`}
              stroke="#8b7355"
              strokeWidth="4"
              opacity="0.65"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
      <path d="M0 38h100M0 62h100" stroke="#27272a" strokeWidth="5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      {sleepers.map((_, index) => {
        const x = 4 + index * (92 / (sleepers.length - 1));
        return (
          <path
            key={index}
            d={`M${x} 28v44`}
            stroke="#8b7355"
            strokeWidth="4"
            opacity="0.65"
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
}

function BuildingFootprint({ piece }: { piece: Piece }) {
  const fill = categorySwatches[piece.category] ?? "#d8b4fe";
  const entrance = rotateSide(piece.frontSide ?? "south", 0);
  if (piece.footprintSvg) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-white/20">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
          <rect x="3" y="3" width="94" height="94" rx="3" fill={fill} stroke="#172026" strokeWidth="3" />
          <path
            d={
              entrance === "north"
                ? "M42 3h16v11H42z"
                : entrance === "east"
                  ? "M86 42h11v16H86z"
                  : entrance === "west"
                    ? "M3 42h11v16H3z"
                    : "M42 86h16v11H42z"
            }
            fill="#16a34a"
          />
        </svg>
        <img
          src={piece.footprintSvg}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full"
          draggable={false}
        />
      </div>
    );
  }
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <rect x="4" y="4" width="92" height="92" rx="4" fill={fill} stroke="#172026" strokeWidth="3" />
      <path d="M14 18h72M14 34h72M14 50h72" stroke="#ffffff" strokeWidth="3" opacity="0.25" />
      {piece.modularType === "corner" && <path d="M4 4h42v22H26v20H4z" fill="#fff7ed" stroke="#172026" strokeWidth="2" />}
      {piece.modularType === "freestanding" && <rect x="18" y="18" width="64" height="64" rx="8" fill="#ffffff88" stroke="#172026" strokeWidth="2" />}
      {piece.modularType === "end" && <path d="M4 4h20v92H4z" fill="#ffffff66" />}
      <path
        d={
          entrance === "north"
            ? "M42 4h16v12H42z"
            : entrance === "east"
              ? "M84 42h12v16H84z"
              : entrance === "west"
                ? "M4 42h12v16H4z"
                : "M42 84h16v12H42z"
        }
        fill="#16a34a"
      />
    </svg>
  );
}

function ModularCardThumbnail({ preset }: { preset: (typeof modularBuildings)[number] }) {
  const fill = categorySwatches[preset.category as Piece["category"]] ?? "#d8b4fe";
  const isCorner = preset.modularType === "corner" || preset.isCornerBuilding;

  return (
    <div className="relative h-full w-full overflow-hidden rounded bg-sky-100">
      <div className="absolute inset-x-0 bottom-0 h-4 bg-lime-300" />
      <div
        className={`absolute ${preset.widthStuds > 32 ? "left-[5%] top-[14%] h-[64%] w-[90%]" : "left-[14%] top-[10%] h-[72%] w-[72%]"}`}
        style={{ backgroundColor: fill }}
      >
        {preset.silhouetteAsset ? (
          <img src={preset.silhouetteAsset} alt="" className="h-full w-full" draggable={false} />
        ) : (
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <rect x="3" y="3" width="94" height="94" rx="4" fill="none" stroke="#172026" strokeWidth="4" />
            {isCorner && <path d="M3 3h42v22H26v20H3z" fill="#fff7ed" stroke="#172026" strokeWidth="2" />}
            {!isCorner && <path d="M22 18h56M22 36h56M22 54h56" stroke="#172026" strokeWidth="2" />}
          </svg>
        )}
      </div>
      <div className="absolute inset-x-[14%] bottom-3 h-1 rounded bg-stone-500" />
    </div>
  );
}

function BlueprintPreview() {
  return (
    <svg viewBox="0 0 720 470" className="h-full w-full" role="img" aria-label="Preview of a generated LEGO city blueprint with roads, districts, parks and expansion zones">
      <defs>
        <pattern id="preview-studs" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="5" cy="5" r="2" fill="#93c5fd" opacity="0.35" />
          <path d="M24 0H0v24" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.65" />
        </pattern>
        <filter id="preview-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.18" />
        </filter>
      </defs>
      <rect width="720" height="470" rx="28" fill="#dbeafe" />
      <rect x="22" y="22" width="676" height="426" rx="18" fill="url(#preview-studs)" stroke="#172026" strokeWidth="3" />
      <path d="M42 210h636M328 42v386M520 42v168M112 326h408" stroke="#4b5563" strokeWidth="38" strokeLinecap="square" />
      <path d="M42 210h636M328 42v386M520 42v168M112 326h408" stroke="#fef3c7" strokeWidth="5" strokeDasharray="18 14" />
      <rect x="492" y="182" width="56" height="56" rx="7" fill="#4b5563" stroke="#172026" strokeWidth="3" />
      <path d="M520 182v56M492 210h56" stroke="#fef3c7" strokeWidth="5" />

      {[
        [70, 66, 72, 72, categorySwatches.retail, "Shop"],
        [154, 66, 72, 72, categorySwatches.retail, "Emp."],
        [238, 66, 72, 72, categorySwatches.restaurants, "Cafe"],
        [356, 66, 96, 72, categorySwatches.civic, "Hall"],
        [554, 66, 72, 72, categorySwatches.civic, "Museum"],
        [70, 238, 72, 72, categorySwatches.restaurants, "Jazz"],
        [154, 238, 72, 72, categorySwatches.residential, "Hotel"],
        [238, 238, 72, 72, categorySwatches.residential, "Apts"],
        [356, 354, 72, 72, categorySwatches.retail, "Book"],
        [440, 354, 72, 72, categorySwatches.restaurants, "Food"],
      ].map(([x, y, width, height, fill, label], index) => (
        <g key={index} filter="url(#preview-shadow)">
          <rect x={x} y={y} width={width} height={height} rx="7" fill={fill as string} stroke="#172026" strokeWidth="3" />
          <path d={`M${Number(x) + 10} ${Number(y) + 15}h${Number(width) - 20}M${Number(x) + 10} ${Number(y) + 32}h${Number(width) - 20}M${Number(x) + 10} ${Number(y) + 49}h${Number(width) - 26}`} stroke="#fff" strokeWidth="3" opacity="0.38" />
          {index === 0 || index === 4 ? <path d={`M${x} ${y}h34v22h-18v18h-16z`} fill="#fff7ed" stroke="#172026" strokeWidth="2" /> : null}
          <text x={Number(x) + Number(width) / 2} y={Number(y) + Number(height) - 10} textAnchor="middle" fill="#172026" fontSize="12" fontWeight="900">{label}</text>
        </g>
      ))}

      <rect x="554" y="238" width="96" height="72" rx="8" fill="#84cc16" stroke="#166534" strokeWidth="3" />
      <path d="M572 288c26-42 48-42 62 0" fill="none" stroke="#166534" strokeWidth="5" />
      <text x="602" y="276" textAnchor="middle" fill="#14532d" fontSize="14" fontWeight="900">Park</text>
      <rect x="356" y="238" width="72" height="72" rx="8" fill="#fde68a" stroke="#ca8a04" strokeWidth="3" />
      <text x="392" y="278" textAnchor="middle" fill="#713f12" fontSize="13" fontWeight="900">Plaza</text>
      <rect x="554" y="354" width="72" height="72" rx="8" fill="#bbf7d0" stroke="#047857" strokeWidth="2" strokeDasharray="8 7" opacity="0.72" />
      <text x="590" y="385" textAnchor="middle" fill="#065f46" fontSize="11" fontWeight="900">Future</text>
      <text x="590" y="400" textAnchor="middle" fill="#065f46" fontSize="11" fontWeight="900">Corner</text>

      <g>
        <rect x="44" y="28" width="144" height="34" rx="17" fill="#ffffff" opacity="0.92" />
        <text x="116" y="50" textAnchor="middle" fill="#172026" fontSize="14" fontWeight="900">Retail District</text>
        <rect x="350" y="28" width="138" height="34" rx="17" fill="#ffffff" opacity="0.92" />
        <text x="419" y="50" textAnchor="middle" fill="#172026" fontSize="14" fontWeight="900">Civic Core</text>
        <rect x="520" y="322" width="146" height="34" rx="17" fill="#ffffff" opacity="0.92" />
        <text x="593" y="344" textAnchor="middle" fill="#172026" fontSize="14" fontWeight="900">Expansion Zone</text>
      </g>

      <g filter="url(#preview-shadow)">
        <rect x="42" y="394" width="178" height="42" rx="21" fill="#172026" />
        <text x="131" y="421" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="900">City Rating 96%</text>
      </g>
    </svg>
  );
}

export default function Home() {
  const [hasStartedBlueprint, setHasStartedBlueprint] = useState(false);
  const [planningMode, setPlanningMode] = useState<PlanningMode | null>(null);
  const [blueprintReady, setBlueprintReady] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);
  const [generationStage, setGenerationStage] = useState("Analysing Collection...");
  const [cityStyle, setCityStyle] = useState<CityStyle>("decide");
  const [layoutShape, setLayoutShape] = useState<LayoutShape>("rectangle");
  const [tableWidth, setTableWidth] = useState(DEFAULT_WIDTH);
  const [tableDepth, setTableDepth] = useState(DEFAULT_DEPTH);
  const [lArmWidth, setLArmWidth] = useState(48);
  const [lArmDepth, setLArmDepth] = useState(96);
  const [uBackWidth, setUBackWidth] = useState(192);
  const [uBackDepth, setUBackDepth] = useState(48);
  const [uLeftArmLength, setULeftArmLength] = useState(128);
  const [uLeftArmWidth, setULeftArmWidth] = useState(48);
  const [uRightArmLength, setURightArmLength] = useState(128);
  const [uRightArmWidth, setURightArmWidth] = useState(48);
  const [uInnerGapWidth, setUInnerGapWidth] = useState(96);
  const [uInnerGapDepth, setUInnerGapDepth] = useState(128);
  const [dimensionInputs, setDimensionInputs] = useState<Record<DimensionInputKey, string>>({
    tableWidth: String(DEFAULT_WIDTH_CM),
    tableDepth: String(DEFAULT_DEPTH_CM),
    lArmWidth: String(studsToCm(48)),
    lArmDepth: String(studsToCm(96)),
    uBackWidth: String(studsToCm(192)),
    uBackDepth: String(studsToCm(48)),
    uLeftArmLength: String(studsToCm(128)),
    uLeftArmWidth: String(studsToCm(48)),
    uRightArmLength: String(studsToCm(128)),
    uRightArmWidth: String(studsToCm(48)),
    uInnerGapWidth: String(studsToCm(96)),
    uInnerGapDepth: String(studsToCm(128)),
  });
  const [dimensionError, setDimensionError] = useState("");
  const [customSections, setCustomSections] = useState<TableSection[]>([
    sectionWithCm({
      id: "custom-main",
      name: "Section 1",
      widthStuds: DEFAULT_WIDTH,
      depthStuds: DEFAULT_DEPTH,
      x: 0,
      y: 0,
    }),
  ]);
  const [customSectionInputs, setCustomSectionInputs] = useState<
    Record<string, Record<CustomSectionInputField, string>>
  >({
    "custom-main": {
      widthStuds: String(DEFAULT_WIDTH_CM),
      depthStuds: String(DEFAULT_DEPTH_CM),
      x: "0",
      y: "0",
    },
  });
  const [bridgeTableJoins, setBridgeTableJoins] = useState(true);
  const [overhangMode, setOverhangMode] = useState<OverhangMode>("slight");
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [trainPieces, setTrainPieces] = useState<TrainPiece[]>([]);
  const [layoutFeatureChoice, setLayoutFeatureChoice] = useState<LayoutFeatureChoice>("roads");
  const [roadSystem, setRoadSystem] = useState<RoadSystem>("decide");
  const [viewMode, setViewMode] = useState<ViewMode>("blueprint");
  const [blueprintDisplayMode, setBlueprintDisplayMode] = useState<BlueprintDisplayMode>("build");
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);
  const [showViewOptions, setShowViewOptions] = useState(false);
  const [miniMapExpanded, setMiniMapExpanded] = useState(false);
  const [autoAlignRoads, setAutoAlignRoads] = useState(true);
  const [showRoadDebug, setShowRoadDebug] = useState(false);
  const [pickerTab, setPickerTab] = useState<PickerTab>("buildings");
  const [buildingName, setBuildingName] = useState("Corner Cafe");
  const [buildingWidth, setBuildingWidth] = useState(32);
  const [buildingDepth, setBuildingDepth] = useState(32);
  const [buildingCategory, setBuildingCategory] = useState<Category>("retail");
  const [selectedModularSet, setSelectedModularSet] = useState(modularBuildings[0].setNumber);
  const [selectedOfficialSets, setSelectedOfficialSets] = useState<string[]>([]);
  const [modularSearch, setModularSearch] = useState("");
  const [modularFilter, setModularFilter] = useState<ModularCardFilter>("all");
  const [showMocForm, setShowMocForm] = useState(false);
  const [mocWidthType, setMocWidthType] = useState<WidthType>("32x32");
  const [mocModularType, setMocModularType] = useState<ModularType>("straight");
  const [mocSilhouetteAsset, setMocSilhouetteAsset] = useState<string>("");
  const [customMocs, setCustomMocs] = useState<CustomMoc[]>([]);
  const [editingMocId, setEditingMocId] = useState<string | null>(null);
  const [cityAddOns, setCityAddOns] = useState<CityAddOnSelection[]>([]);
  const [roadInventoryMode, setRoadInventoryMode] = useState<InventoryMode>("unlimited");
  const [roadInventory, setRoadInventory] = useState<Record<RoadInventoryKey, number>>({
    straight32: 8,
    corner32: 4,
    t32: 2,
    cross32: 1,
    deadEnd32: 2,
    straight16: 0,
    corner16: 0,
    t16: 0,
    cross16: 0,
  });
  const [trainInventoryMode, setTrainInventoryMode] = useState<InventoryMode>("unlimited");
  const [trainInventory, setTrainInventory] = useState<Record<TrainInventoryKey, number>>({
    straight: 24,
    curve: 16,
    leftSwitch: 1,
    rightSwitch: 1,
    flex: 0,
    platform: 2,
  });
  const [showSpaceFillPrompt, setShowSpaceFillPrompt] = useState(false);
  const [showClearLayoutPrompt, setShowClearLayoutPrompt] = useState(false);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [featureRequestText, setFeatureRequestText] = useState("");
  const [featureRequestCategory, setFeatureRequestCategory] = useState<FeatureCategory>("Buildings");
  const [featureRequestEmail, setFeatureRequestEmail] = useState("");
  const [waitlistName, setWaitlistName] = useState("");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistNotes, setWaitlistNotes] = useState("");
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>([]);
  const [roadmapVotes, setRoadmapVotes] = useState<Record<string, boolean>>({});
  const [layoutFeedback, setLayoutFeedback] = useState<LayoutFeedback[]>([]);
  const [showLayoutFeedbackPrompt, setShowLayoutFeedbackPrompt] = useState(false);
  const [layoutFeedbackReasons, setLayoutFeedbackReasons] = useState<string[]>([]);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [spaceFillChoices, setSpaceFillChoices] = useState<SpaceFillChoice[]>(["decide"]);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [selectedTrainPresetId, setSelectedTrainPresetId] = useState(trainPresets[0].id);
  const [trainGenerator, setTrainGenerator] = useState<TrainGenerator>("none");
  const [trainElevation, setTrainElevation] = useState<TrainElevation>("ground");
  const [railMargin, setRailMargin] = useState(0);
  const [trainWarning, setTrainWarning] = useState("");
  const [objectWarning, setObjectWarning] = useState("");
  const [layoutScore, setLayoutScore] = useState(0);
  const [layoutNotes, setLayoutNotes] = useState<string[]>([]);
  const [layoutName, setLayoutName] = useState("Downtown layout");
  const [savedLayouts, setSavedLayouts] = useState<SavedLayout[]>([]);
  const [activeLayoutId, setActiveLayoutId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragTrainId, setDragTrainId] = useState<string | null>(null);
  const [selectedObject, setSelectedObject] = useState<SelectedObject | null>(null);
  const [hoveredBuildGuideId, setHoveredBuildGuideId] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<HistoryEntry[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryEntry[]>([]);
  const [actionHistory, setActionHistory] = useState<Array<{ action: string; timestamp: string }>>([]);
  const [zoomPercent, setZoomPercent] = useState(100);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 900, height: 620 });
  const gridRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const piecesRef = useRef<Piece[]>([]);
  const trainPiecesRef = useRef<TrainPiece[]>([]);
  const layoutScoreRef = useRef(0);
  const layoutNotesRef = useRef<string[]>([]);
  const objectWarningRef = useRef("");

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as SavedLayout[];
      setSavedLayouts(
        parsed.map((layout) => ({
          ...layout,
          pieces: layout.pieces.map(normalizePiece),
          trainPieces: [],
        })),
      );
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [hasStartedBlueprint]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedLayouts));
  }, [savedLayouts]);

  useEffect(() => {
    piecesRef.current = pieces;
  }, [pieces]);

  useEffect(() => {
    trainPiecesRef.current = trainPieces;
  }, [trainPieces]);

  useEffect(() => {
    layoutScoreRef.current = layoutScore;
  }, [layoutScore]);

  useEffect(() => {
    layoutNotesRef.current = layoutNotes;
  }, [layoutNotes]);

  useEffect(() => {
    objectWarningRef.current = objectWarning;
  }, [objectWarning]);

  useEffect(() => {
    setShowRestorePrompt(Boolean(window.localStorage.getItem(PROJECT_AUTOSAVE_KEY)));
    try {
      setFeatureRequests(JSON.parse(window.localStorage.getItem(FEATURE_REQUESTS_KEY) ?? "[]") as FeatureRequest[]);
      setRoadmapVotes(JSON.parse(window.localStorage.getItem(ROADMAP_VOTES_KEY) ?? "{}") as Record<string, boolean>);
      setLayoutFeedback(JSON.parse(window.localStorage.getItem(LAYOUT_FEEDBACK_KEY) ?? "[]") as LayoutFeedback[]);
    } catch {
      window.localStorage.removeItem(FEATURE_REQUESTS_KEY);
      window.localStorage.removeItem(ROADMAP_VOTES_KEY);
      window.localStorage.removeItem(LAYOUT_FEEDBACK_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(FEATURE_REQUESTS_KEY, JSON.stringify(featureRequests));
  }, [featureRequests]);

  useEffect(() => {
    window.localStorage.setItem(ROADMAP_VOTES_KEY, JSON.stringify(roadmapVotes));
  }, [roadmapVotes]);

  useEffect(() => {
    window.localStorage.setItem(LAYOUT_FEEDBACK_KEY, JSON.stringify(layoutFeedback));
  }, [layoutFeedback]);

  useEffect(() => {
    const stored = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    setSidebarCollapsed(stored ? stored === "true" : window.innerWidth < 768);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (!canvasWrapRef.current) return;
    const measureCanvas = () => {
      const element = canvasWrapRef.current;
      if (!element) return;
      setCanvasSize({
        width: Math.max(1, element.clientWidth),
        height: Math.max(1, element.clientHeight),
      });
    };
    measureCanvas();
    const observer = new ResizeObserver(() => {
      window.requestAnimationFrame(measureCanvas);
    });
    observer.observe(canvasWrapRef.current);
    window.addEventListener("resize", measureCanvas);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measureCanvas);
    };
  }, [hasStartedBlueprint]);

  useEffect(() => {
    const element = canvasWrapRef.current;
    if (!element) return;
    const nextSize = {
      width: Math.max(1, element.clientWidth),
      height: Math.max(1, element.clientHeight),
    };
    setCanvasSize((current) =>
      current.width === nextSize.width && current.height === nextSize.height ? current : nextSize,
    );
  });

  const layoutGeometry = useMemo(() => {
    const rectangleSection: TableSection = {
      id: "rectangle-main",
      name: "Main table",
      widthCm: studsToCm(tableWidth),
      depthCm: studsToCm(tableDepth),
      widthStuds: tableWidth,
      depthStuds: tableDepth,
      x: 0,
      y: 0,
    };

    if (layoutShape === "l-shape") {
      const sections: TableSection[] = [
        rectangleSection,
        sectionWithCm({
          id: "l-arm",
          name: "L arm",
          widthStuds: lArmWidth,
          depthStuds: lArmDepth,
          x: 0,
          y: tableDepth,
        }),
      ];
      const width = Math.max(tableWidth, lArmWidth);
      const depth = tableDepth + lArmDepth;
      return { width, depth, tableSections: sections, usableZones: sections, blockedZones: [] };
    }

    if (layoutShape === "u-shape") {
      const leftX = 0;
      const rightX = uLeftArmWidth + uInnerGapWidth;
      const width = Math.max(uBackWidth, uLeftArmWidth + uInnerGapWidth + uRightArmWidth);
      const depth = uBackDepth + Math.max(uLeftArmLength, uRightArmLength, uInnerGapDepth);
      const sections: TableSection[] = [
        sectionWithCm({
          id: "u-back",
          name: "Back section",
          widthStuds: width,
          depthStuds: uBackDepth,
          x: 0,
          y: 0,
        }),
        sectionWithCm({
          id: "u-left-arm",
          name: "Left arm",
          widthStuds: uLeftArmWidth,
          depthStuds: uLeftArmLength,
          x: leftX,
          y: uBackDepth,
        }),
        sectionWithCm({
          id: "u-right-arm",
          name: "Right arm",
          widthStuds: uRightArmWidth,
          depthStuds: uRightArmLength,
          x: rightX,
          y: uBackDepth,
        }),
      ];
      const blockedZones: Zone[] = [
        zoneWithCm({
          id: "u-inner-gap",
          name: "Inner gap",
          widthStuds: uInnerGapWidth,
          depthStuds: uInnerGapDepth,
          x: uLeftArmWidth,
          y: uBackDepth,
        }),
      ];

      return { width, depth, tableSections: sections, usableZones: sections, blockedZones };
    }

    if (layoutShape === "custom") {
      const width = Math.max(
        32,
        ...customSections.map((section) => section.x + section.widthStuds),
      );
      const depth = Math.max(
        32,
        ...customSections.map((section) => section.y + section.depthStuds),
      );
      return {
        width,
        depth,
        tableSections: customSections,
        usableZones: customSections,
        blockedZones: [],
      };
    }

    return {
      width: tableWidth,
      depth: tableDepth,
      tableSections: [rectangleSection],
      usableZones: [rectangleSection],
      blockedZones: [],
    };
  }, [
    customSections,
    lArmDepth,
    lArmWidth,
    layoutShape,
    tableDepth,
    tableWidth,
    uBackDepth,
    uBackWidth,
    uInnerGapDepth,
    uInnerGapWidth,
    uLeftArmLength,
    uLeftArmWidth,
    uRightArmLength,
    uRightArmWidth,
  ]);

  const fitScale = Math.min(
    canvasSize.width / Math.max(1, layoutGeometry.width),
    canvasSize.height / Math.max(1, layoutGeometry.depth),
  );
  const canvasScale = fitScale * (zoomPercent / 100);
  const showInlineLabels = canvasScale >= 2.4 || zoomPercent >= 150;
  const showBaseplateLabels = canvasScale >= 1.45 || zoomPercent >= 150;

  const tableStyle = useMemo<CSSProperties>(
    () => ({
      width: layoutGeometry.width * canvasScale,
      height: layoutGeometry.depth * canvasScale,
      backgroundImage: [
        "linear-gradient(rgba(23, 32, 38, 0.10) 1px, transparent 1px)",
        "linear-gradient(90deg, rgba(23, 32, 38, 0.10) 1px, transparent 1px)",
        "linear-gradient(rgba(23, 32, 38, 0.22) 1px, transparent 1px)",
        "linear-gradient(90deg, rgba(23, 32, 38, 0.22) 1px, transparent 1px)",
        "linear-gradient(rgba(23, 32, 38, 0.42) 2px, transparent 2px)",
        "linear-gradient(90deg, rgba(23, 32, 38, 0.42) 2px, transparent 2px)",
      ].join(", "),
      backgroundSize: [
        `${8 * canvasScale}px ${8 * canvasScale}px`,
        `${8 * canvasScale}px ${8 * canvasScale}px`,
        `${16 * canvasScale}px ${16 * canvasScale}px`,
        `${16 * canvasScale}px ${16 * canvasScale}px`,
        `${32 * canvasScale}px ${32 * canvasScale}px`,
        `${32 * canvasScale}px ${32 * canvasScale}px`,
      ].join(", "),
    }),
    [canvasScale, layoutGeometry.depth, layoutGeometry.width],
  );

  const currentLayoutSnapshot = (): LayoutSnapshot => ({
    pieces: piecesRef.current.map((piece) => ({ ...piece })),
    trainPieces: trainPiecesRef.current.map((piece) => ({ ...piece })),
    layoutScore: layoutScoreRef.current,
    layoutNotes: [...layoutNotesRef.current],
    objectWarning: objectWarningRef.current,
  });

  const restoreLayoutSnapshot = (snapshot: LayoutSnapshot) => {
    const restoredPieces = snapshot.pieces.map(normalizePiece);
    setPieces(restoredPieces.some((piece) => piece.type === "road") ? normaliseManualRoadTiles(restoredPieces) : restoredPieces);
    setTrainPieces(snapshot.trainPieces);
    setLayoutScore(snapshot.layoutScore);
    setLayoutNotes(snapshot.layoutNotes);
    setObjectWarning(snapshot.objectWarning);
    setSelectedObject(null);
  };

  const pushHistory = (action: string, snapshot = currentLayoutSnapshot()) => {
    const entry: HistoryEntry = {
      ...snapshot,
      action,
      timestamp: new Date().toISOString(),
    };
    setUndoStack((current) => [entry, ...current].slice(0, 20));
    setRedoStack([]);
    setActionHistory((current) => [
      { action, timestamp: entry.timestamp },
      ...current,
    ].slice(0, 20));
  };

  const recordLayoutChange = (action: string, update: () => void) => {
    pushHistory(action);
    update();
  };

  const undoLayoutChange = () => {
    const [entry, ...remaining] = undoStack;
    if (!entry) return;
    const redoEntry: HistoryEntry = {
      ...currentLayoutSnapshot(),
      action: `Redo ${entry.action}`,
      timestamp: new Date().toISOString(),
    };
    setUndoStack(remaining);
    setRedoStack((current) => [redoEntry, ...current].slice(0, 20));
    restoreLayoutSnapshot(entry);
  };

  const redoLayoutChange = () => {
    const [entry, ...remaining] = redoStack;
    if (!entry) return;
    pushHistory(entry.action.replace(/^Redo\s+/, ""));
    setRedoStack(remaining);
    restoreLayoutSnapshot(entry);
  };

  const clearLayoutObjects = (action = "Cleared layout") => {
    recordLayoutChange(action, () => {
      setPieces([]);
      setTrainPieces([]);
      setLayoutScore(0);
      setLayoutNotes([]);
      setObjectWarning("");
      setSelectedObject(null);
      fitToScreen();
    });
  };

  const roadIsAtTableEdge = (road: Piece, side: Direction) => {
    const bounds = usableBounds(layoutGeometry.usableZones);
    if (side === "north") return road.y <= bounds.top;
    if (side === "south") return road.y + road.depth >= bounds.bottom;
    if (side === "west") return road.x <= bounds.left;
    return road.x + road.width >= bounds.right;
  };

  const requiredRoadConnections = (road: Piece, roads: Piece[]) => {
    const connections = new Set<Direction>();
    roads.forEach((other) => {
      if (other.id === road.id || other.roadKind === "plaza" || other.roadKind === "alley") return;
      const side = sideForTouchingRoads(road, other);
      if (side) connections.add(side);
    });
    const intendedConnections = roadConnectionsFor(road);
    directions.forEach((side) => {
      if (roadIsAtTableEdge(road, side) && intendedConnections.has(side)) {
        connections.add(side);
      }
    });
    if (connections.size === 1 && road.roadKind === "straight") {
      const [connectedSide] = Array.from(connections);
      const oppositeSide = directionOpposites[connectedSide];
      if (intendedConnections.has(oppositeSide) || roadIsAtTableEdge(road, oppositeSide)) {
        connections.add(oppositeSide);
      } else if (road.roadKind === "straight") {
        connections.add(oppositeSide);
      }
    }
    return connections;
  };

  const normalizeRoadNetwork = (items: Piece[], options: { respectLockedAssets?: boolean } = {}) => {
    const respectLockedAssets = options.respectLockedAssets ?? false;
    const roads = items.filter((piece) => piece.type === "road" && piece.roadKind !== "plaza" && piece.roadKind !== "alley");
    return items.map((piece) => {
      if (piece.type !== "road" || piece.roadKind === "plaza" || piece.roadKind === "alley") return piece;
      if (piece.lockRoadAsset && respectLockedAssets) {
        return {
          ...piece,
          selectedRoadType: piece.selectedRoadType ?? roadAssetKeyFor(piece.roadKind, piece.width, piece.depth),
          roadConnections: roadConnectionRecord(roadConnectionsFor(piece)),
        };
      }
      const connections = requiredRoadConnections(piece, roads);
      if (connections.size === 0) {
        const fallbackConnections = roadConnectionsFor(piece);
        return { ...piece, roadConnections: roadConnectionRecord(fallbackConnections) };
      }
      const { roadKind, rotation } = roadKindAndRotationForConnections(connections, piece.roadKind);
      return orientRoadFootprint({ ...piece, roadKind, roadConnections: roadConnectionRecord(connections) }, rotation);
    });
  };
  const normaliseRoadTiles = (items: Piece[]) => normalizeRoadNetwork(items, { respectLockedAssets: false });
  const normaliseManualRoadTiles = (items: Piece[]) =>
    autoAlignRoads ? normaliseRoadTiles(items) : normalizeRoadNetwork(items, { respectLockedAssets: true });

  const roadMismatchMessages = (items: Piece[]) => {
    const roads = items.filter((piece) => piece.type === "road" && piece.roadKind !== "plaza" && piece.roadKind !== "alley");
    const messages = new Set<string>();
    roads.forEach((road) => {
      const connections = roadConnectionsFor(road);
      directions.forEach((side) => {
        const neighbour = roads.find((other) => other.id !== road.id && sideForTouchingRoads(road, other) === side);
        const isOpen = connections.has(side);
        if (neighbour) {
          const neighbourOpen = roadConnectionsFor(neighbour).has(directionOpposites[side]);
          if (isOpen !== neighbourOpen) messages.add(`Road mismatch near ${road.name}`);
          return;
        }
        const canExit = roadIsAtTableEdge(road, side);
        if (isOpen && !canExit) messages.add(`Road open side points into non-road space near ${road.name}`);
      });
    });
    return Array.from(messages);
  };

  const updateRoadValidationNotes = (nextPieces: Piece[]) => {
    const mismatches = roadMismatchMessages(nextPieces);
    setLayoutNotes((current) => [
      ...current.filter((note) => !note.startsWith("Road mismatch") && !note.startsWith("Road open side")),
      ...mismatches,
    ]);
  };

  const restoreAutoSavedProject = () => {
    const raw = window.localStorage.getItem(PROJECT_AUTOSAVE_KEY);
    if (!raw) return;
    try {
      const project = JSON.parse(raw) as AutoSavedProject;
      setSelectedOfficialSets(project.selectedOfficialSets ?? []);
      setCustomMocs(project.customMocs ?? []);
      setRoadInventory(project.roadInventory ?? roadInventory);
      setRoadInventoryMode(project.roadInventoryMode ?? "unlimited");
      setCityAddOns(project.cityAddOns ?? []);
      setLayoutFeatureChoice(project.layoutFeatureChoice ?? "roads");
      setRoadSystem(project.roadSystem ?? "decide");
      setLayoutShape(project.layoutShape ?? "rectangle");
      setTableWidth(project.tableWidth ?? DEFAULT_WIDTH);
      setTableDepth(project.tableDepth ?? DEFAULT_DEPTH);
      setDimensionInputs(project.dimensionInputs ?? dimensionInputs);
      setBridgeTableJoins(project.bridgeTableJoins ?? true);
      setOverhangMode(project.overhangMode ?? "slight");
      setCityStyle("decide");
      setPlanningMode(project.planningMode ?? (project.blueprintReady ? "manual" : "auto"));
      setPieces((project.pieces ?? []).map(normalizePiece));
      setTrainPieces(project.trainPieces ?? []);
      setLayoutScore(project.layoutScore ?? 0);
      setLayoutNotes(project.layoutNotes ?? []);
      setBlueprintReady(project.blueprintReady ?? Boolean(project.pieces?.length));
      setHasStartedBlueprint(true);
      setShowRestorePrompt(false);
      fitToScreen();
    } catch {
      window.localStorage.removeItem(PROJECT_AUTOSAVE_KEY);
      setShowRestorePrompt(false);
    }
  };

  const startNewProject = () => {
    window.localStorage.removeItem(PROJECT_AUTOSAVE_KEY);
    setShowRestorePrompt(false);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;
      if (!isTyping && event.key.toLowerCase() === "r" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        if (selectedObject?.kind === "piece") {
          event.preventDefault();
          rotatePiece(selectedObject.id);
        }
        if (selectedObject?.kind === "train") {
          event.preventDefault();
          rotateTrainPiece(selectedObject.id);
        }
        return;
      }
      const modifier = event.metaKey || event.ctrlKey;
      if (!modifier) return;
      const key = event.key.toLowerCase();
      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        undoLayoutChange();
      }
      if ((key === "z" && event.shiftKey) || key === "y") {
        event.preventDefault();
        redoLayoutChange();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undoStack, redoStack, selectedObject, pieces, trainPieces]);

  useEffect(() => {
    if (showRestorePrompt && !hasStartedBlueprint) return;
    const autosave = window.setTimeout(() => {
      const project: AutoSavedProject = {
        planningMode,
        selectedOfficialSets,
        customMocs,
        roadInventory,
        roadInventoryMode,
        cityAddOns,
        layoutFeatureChoice,
        roadSystem,
        layoutShape,
        tableWidth,
        tableDepth,
        dimensionInputs,
        bridgeTableJoins,
        overhangMode,
        cityStyle,
        pieces,
        trainPieces,
        layoutScore,
        layoutNotes,
        blueprintReady,
        savedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(PROJECT_AUTOSAVE_KEY, JSON.stringify(project));
    }, 1800);
    return () => window.clearTimeout(autosave);
  }, [
    showRestorePrompt,
    hasStartedBlueprint,
    planningMode,
    selectedOfficialSets,
    customMocs,
    roadInventory,
    roadInventoryMode,
    cityAddOns,
    layoutFeatureChoice,
    roadSystem,
    layoutShape,
    tableWidth,
    tableDepth,
    dimensionInputs,
    bridgeTableJoins,
    overhangMode,
    cityStyle,
    pieces,
    trainPieces,
    layoutScore,
    layoutNotes,
    blueprintReady,
  ]);

  const zoomLevels = [25, 50, 75, 100, 150, 200, 300];
  const clampZoom = (value: number) => clamp(value, 25, 300);
  const centerView = () => setPanOffset({ x: 0, y: 0 });
  const setZoomCentered = (nextZoom: number) => {
    setZoomPercent(clampZoom(nextZoom));
    centerView();
  };
  const fitToScreen = () => {
    setZoomPercent(100);
    centerView();
  };
  const zoomByStep = (direction: 1 | -1) => {
    const currentIndex = zoomLevels.findIndex((level) => level >= zoomPercent);
    const baseIndex = currentIndex === -1 ? zoomLevels.length - 1 : currentIndex;
    const nextIndex = clamp(baseIndex + direction, 0, zoomLevels.length - 1);
    setZoomPercent(zoomLevels[nextIndex]);
  };

  const baseplateLabels = useMemo(() => {
    const labels: Array<{ id: string; x: number; y: number; label: string }> = [];
    layoutGeometry.usableZones.forEach((zone) => {
      const startX = Math.ceil(zone.x / 32) * 32;
      const startY = Math.ceil(zone.y / 32) * 32;
      for (let y = startY; y + 32 <= zone.y + zone.depthStuds; y += 32) {
        for (let x = startX; x + 32 <= zone.x + zone.widthStuds; x += 32) {
          const rect = { x, y, width: 32, depth: 32 };
          if (!rectIsUsable(rect, layoutGeometry.usableZones, layoutGeometry.blockedZones, bridgeTableJoins)) continue;
          labels.push({ id: `${zone.id}-${x}-${y}`, x, y, label: "32x32" });
        }
      }
    });
    return labels;
  }, [bridgeTableJoins, layoutGeometry.blockedZones, layoutGeometry.usableZones]);

  const overhangPolicy = useMemo(() => {
    if (overhangMode === "moderate") return { label: "Moderate overhang", maxDistance: 16, minSupport: 0.6 };
    if (overhangMode === "slight") return { label: "Slight overhang", maxDistance: 8, minSupport: 0.75 };
    return { label: "No overhang", maxDistance: 0, minSupport: 1 };
  }, [overhangMode]);

  const placementSupport = (rect: { x: number; y: number; width: number; depth: number }) => ({
    ratio: supportRatioForRect(rect, layoutGeometry.usableZones, layoutGeometry.blockedZones),
    overhangDistance: maxOverhangDistanceForRect(rect, layoutGeometry.usableZones),
  });

  const placementAllowed = (
    rect: { x: number; y: number; width: number; depth: number; modularType?: ModularType },
    minimumSupport = overhangPolicy.minSupport,
  ) => {
    if (layoutGeometry.blockedZones.some((zone) => rectsOverlap(rect, zoneToRect(zone)))) return false;
    if (overhangMode === "none") {
      return rectIsUsable(rect, layoutGeometry.usableZones, layoutGeometry.blockedZones, bridgeTableJoins);
    }
    const support = placementSupport(rect);
    if (support.ratio < Math.max(0.5, minimumSupport)) return false;
    if (support.overhangDistance > overhangPolicy.maxDistance) return false;
    if (rect.modularType === "corner" && !rectCornersSupported(rect, layoutGeometry.usableZones)) return false;
    return true;
  };

  const placementWarningFor = (rect: { x: number; y: number; width: number; depth: number; modularType?: ModularType }) => {
    if (placementAllowed(rect)) {
      const support = placementSupport(rect);
      return support.overhangDistance > 0
        ? `${overhangPolicy.label}: ${Math.round(support.overhangDistance)} studs beyond table edge, ${Math.round(support.ratio * 100)}% supported.`
        : "";
    }
    return "This object is outside your usable table space.";
  };

  const pieceFromCustomMoc = (moc: CustomMoc): Piece => ({
    id: `moc-${moc.id}`,
    type: "building",
    name: moc.name,
    category: moc.category,
    width: moc.widthStuds,
    depth: moc.depthStuds,
    x: 0,
    y: 0,
    rotation: 0,
    frontSide: "south",
    allowedRotations: [0, 90, 180, 270],
    modularType: moc.modularType,
    preferredPlacement: moc.modularType === "corner" ? "corner" : "road-facing",
    footprintKind: footprintForModular(moc.modularType),
    footprintSvg: moc.silhouetteAsset,
    isCustomMoc: true,
    snapGroup: "modular",
    snapSize: 16,
  });

  const resetMocForm = () => {
    setBuildingName("Corner Cafe");
    setMocWidthType("32x32");
    setBuildingWidth(32);
    setBuildingDepth(32);
    setMocModularType("straight");
    setBuildingCategory("retail");
    setMocSilhouetteAsset("");
    setEditingMocId(null);
  };

  const loadMocSilhouette = (file: File | undefined) => {
    if (!file) return;
    if (!["image/svg+xml", "image/png"].includes(file.type)) {
      setObjectWarning("Custom MOC silhouettes must be SVG or PNG files.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setMocSilhouetteAsset(typeof reader.result === "string" ? reader.result : "");
      setObjectWarning("");
    };
    reader.readAsDataURL(file);
  };

  const addBuilding = () => {
    const size = mocSizeFromWidthType(mocWidthType, buildingWidth, buildingDepth);
    const id = editingMocId ?? newId();
    const modularType = mocModularType === "end" ? "straight" : mocModularType;
    const moc: CustomMoc = {
      id,
      name: buildingName.trim() || "Untitled building",
      widthStuds: size.width,
      depthStuds: size.depth,
      widthCm: studsToCm(size.width),
      depthCm: studsToCm(size.depth),
      modularType: modularType as CustomMoc["modularType"],
      category: buildingCategory,
      isCustomMoc: true,
      silhouetteAsset: mocSilhouetteAsset || undefined,
    };

    setCustomMocs((current) =>
      editingMocId ? current.map((item) => (item.id === editingMocId ? moc : item)) : [...current, moc],
    );
    if (blueprintReady) {
      const placed = placeWithinTable(pieceFromCustomMoc(moc));
      recordLayoutChange(editingMocId ? `Updated ${moc.name}` : `Added ${moc.name}`, () => {
        setPieces((current) => {
          const withoutExisting = current.filter((piece) => piece.id !== `moc-${moc.id}`);
          return [...withoutExisting, withPieceModule(placed)];
        });
        setObjectWarning(placementWarningFor(placed));
      });
    }
    resetMocForm();
  };

  const pieceFromOfficialPreset = (setNumber: string): Piece | null => {
    const preset = modularBuildings.find((item) => item.setNumber === setNumber);
    if (!preset) return null;
    const modularType: ModularType = preset.modularType ?? (preset.isCornerBuilding ? "corner" : "straight");
    return {
      id: `official-${preset.setNumber}`,
      type: "building",
      name: `${preset.name} (${preset.setNumber})`,
      category: preset.category as Category,
      width: preset.widthStuds,
      depth: preset.depthStuds,
      x: 0,
      y: 0,
      rotation: 0,
      frontSide: preset.frontFacingSide ?? "south",
      allowedRotations: [0, 90, 180, 270],
      modularType,
      preferredPlacement: modularType === "corner" ? "corner" : "road-facing",
      setNumber: preset.setNumber,
      year: preset.year,
      isOfficialLEGO: true,
      isSplitBuildingCompatible: preset.isSplitBuildingCompatible,
      footprintKind: "official",
      footprintSvg: preset.silhouetteAsset ?? preset.footprintSvg,
      snapGroup: "modular",
      snapSize: 16,
    };
  };

  const toggleOfficialSet = (setNumber: string) => {
    setSelectedOfficialSets((current) =>
      current.includes(setNumber)
        ? current.filter((item) => item !== setNumber)
        : [...current, setNumber],
    );
  };

  const addOfficialModular = () => {
    addOfficialModularBySet(selectedModularSet);
  };

  const addOfficialModularBySet = (setNumber: string) => {
    const piece = pieceFromOfficialPreset(setNumber);
    if (!piece) return;

    recordLayoutChange(`Added ${piece.name}`, () => {
      setPieces((current) => [...current, withPieceModule(placeWithinTable({ ...piece, id: newId() }))]);
    });
  };

  const addRoadPlate = (width = ROAD_PLATE_SIZE, depth = ROAD_PLATE_SIZE, roadKind: RoadKind = "straight") => {
    const selectedRoadType = roadAssetKeyFor(roadKind, width, depth);
    const piece: Piece = {
      id: newId(),
      type: "road",
      name: roadLabelFor(roadKind, width, depth),
      category: "Road",
      width,
      depth,
      x: 0,
      y: 0,
      rotation: 0,
      roadKind,
      selectedRoadType,
      lockRoadAsset: true,
      snapGroup: "road",
      snapSize: 16,
    };
    piece.roadConnections = roadConnectionRecord(roadConnectionsFor(piece));

    recordLayoutChange(`Added ${piece.name}`, () => {
      setPieces((current) => {
        const placedPiece = withPieceModule(placeWithinTable(piece));
        console.debug("Road picker placement", roadDebugPayloadFor(placedPiece));
        const nextPieces = normaliseManualRoadTiles([...current, placedPiece]);
        updateRoadValidationNotes(nextPieces);
        return nextPieces;
      });
    });
  };

  const addCityFeature = (optionId: CityAddOnId, size: AddOnSize = "large") => {
    const option = cityAddOnOptions.find((item) => item.id === optionId);
    if (!option) return;
    const dims = addOnSizeToStuds({ id: optionId, size, customWidth: 32, customDepth: 32 });
    const isDetailPlate = optionId === "plate-8x16" || optionId === "plate-16x8" || optionId === "filler-8x16";
    const isPark = optionId === "park" || optionId === "future-expansion" || optionId === "small-park-8x16" || isDetailPlate;
    const isPublicRoute = optionId === "pavement-8x16" || optionId === "alley-8x16" || optionId === "alleyway";
    const isPublicSpace = optionId === "plaza" || optionId === "market-stalls" || optionId === "outdoor-seating" || optionId === "seating-8x16" || optionId === "bus-stop-8x16" || optionId === "market-stall-8x16";
    const usesDetailSnap = dims.width <= 8 || dims.depth <= 8 || isDetailPlate || optionId.includes("8x16") || optionId.includes("16x8");
    const pieceType: Piece["type"] = isPark ? "future" : "road";
    const piece: Piece = withPieceModule({
      id: newId(),
      type: pieceType,
      name: option.label,
      category: optionId === "park" ? "park" : isPark ? "Future" : "Road",
      width: dims.width,
      depth: dims.depth,
      x: 0,
      y: 0,
      rotation: 0,
      roadKind: isPublicSpace ? "plaza" : isPublicRoute ? "alley" : undefined,
      snapGroup: usesDetailSnap ? "detail" : pieceType === "road" ? "road" : "modular",
      snapSize: usesDetailSnap ? 8 : 16,
    });
    recordLayoutChange(`Added ${option.label}`, () => {
      setPieces((current) => {
        const nextPieces = piece.type === "road" ? normaliseManualRoadTiles([...current, placeWithinTable(piece)]) : [...current, placeWithinTable(piece)];
        updateRoadValidationNotes(nextPieces);
        return nextPieces;
      });
    });
  };

  const toggleCityAddOn = (id: CityAddOnId) => {
    setCityAddOns((current) => {
      if (current.some((item) => item.id === id)) return current.filter((item) => item.id !== id);
      return [...current, { id, size: "medium", customWidth: 16, customDepth: 32 }];
    });
  };

  const updateCityAddOn = (id: CityAddOnId, updates: Partial<CityAddOnSelection>) => {
    setCityAddOns((current) =>
      current.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  };

  const placeWithinTable = (
    piece: Piece,
    widthLimit = layoutGeometry.width,
    depthLimit = layoutGeometry.depth,
  ) => {
    const snapSize = snapSizeForPiece(piece);
    const maxX = widthLimit - Math.min(piece.width, widthLimit) + overhangPolicy.maxDistance;
    const maxY = depthLimit - Math.min(piece.depth, depthLimit) + overhangPolicy.maxDistance;
    const next = {
      ...piece,
      width: Math.min(piece.width, widthLimit),
      depth: Math.min(piece.depth, depthLimit),
      x: clamp(snapTo(piece.x, snapSize), -overhangPolicy.maxDistance, maxX),
      y: clamp(snapTo(piece.y, snapSize), -overhangPolicy.maxDistance, maxY),
    };
    if (placementAllowed(next)) return next;

    const zone = layoutGeometry.usableZones.find(
      (item) => item.widthStuds >= next.width && item.depthStuds >= next.depth,
    );
    return zone ? alignPieceToSnap({ ...next, x: zone.x, y: zone.y }) : next;
  };

  const placeTrainWithinTable = (
    piece: TrainPiece,
    widthLimit = layoutGeometry.width,
    depthLimit = layoutGeometry.depth,
  ) => {
    const next = {
      ...piece,
      width: Math.min(piece.width, widthLimit),
      depth: Math.min(piece.depth, depthLimit),
      x: clamp(piece.x, 0, widthLimit - Math.min(piece.width, widthLimit)),
      y: clamp(piece.y, 0, depthLimit - Math.min(piece.depth, depthLimit)),
    };
    if (placementAllowed(next)) return next;

    const zone = layoutGeometry.usableZones.find(
      (item) => item.widthStuds >= next.width && item.depthStuds >= next.depth,
    );
    return zone ? { ...next, x: zone.x, y: zone.y } : next;
  };

  const updateTableWidth = (value: number) => {
    const next = Math.max(32, cmToStuds(value));
    setTableWidth(next);
    setPieces((current) => current.map((piece) => placeWithinTable(piece, next, tableDepth)));
    setTrainPieces((current) =>
      current.map((piece) => placeTrainWithinTable(piece, next, tableDepth)),
    );
  };

  const updateTableDepth = (value: number) => {
    const next = Math.max(32, cmToStuds(value));
    setTableDepth(next);
    setPieces((current) => current.map((piece) => placeWithinTable(piece, tableWidth, next)));
    setTrainPieces((current) =>
      current.map((piece) => placeTrainWithinTable(piece, tableWidth, next)),
    );
  };

  const setDimensionInput = (key: DimensionInputKey, value: string) => {
    setDimensionInputs((current) => ({ ...current, [key]: value }));
    if (dimensionError) setDimensionError("");
  };

  const setCustomSectionInput = (
    sectionId: string,
    field: CustomSectionInputField,
    value: string,
  ) => {
    setCustomSectionInputs((current) => ({
      ...current,
      [sectionId]: {
        ...current[sectionId],
        [field]: value,
      },
    }));
    if (dimensionError) setDimensionError("");
  };

  const parseDimensionInput = (key: DimensionInputKey, label: string) => {
    const rawValue = dimensionInputs[key].trim();
    const value = Number(rawValue);
    if (rawValue === "" || !Number.isFinite(value) || value <= 0) {
      setDimensionError(`Enter a valid ${label.toLowerCase()} greater than 0 cm.`);
      return null;
    }
    setDimensionError("");
    return value;
  };

  const applyDimensionInput = (
    key: DimensionInputKey,
    label: string,
    applyValue: (valueCm: number) => void,
  ) => {
    const value = parseDimensionInput(key, label);
    if (value === null) return false;
    applyValue(value);
    return true;
  };

  const applyCustomSectionInput = (
    sectionId: string,
    field: CustomSectionInputField,
    label: string,
  ) => {
    const rawValue = customSectionInputs[sectionId]?.[field]?.trim() ?? "";
    const value = Number(rawValue);
    const canBeZero = field === "x" || field === "y";
    if (rawValue === "" || !Number.isFinite(value) || value < 0 || (!canBeZero && value <= 0)) {
      setDimensionError(
        canBeZero
          ? `Enter a valid ${label.toLowerCase()} of 0 cm or greater.`
          : `Enter a valid ${label.toLowerCase()} greater than 0 cm.`,
      );
      return false;
    }
    setDimensionError("");
    updateCustomSection(sectionId, field, value);
    return true;
  };

  const validateActiveDimensionInputs = () => {
    if (layoutShape === "custom") {
      return customSections.every((section) =>
        (["widthStuds", "depthStuds", "x", "y"] as const).every((field) =>
          applyCustomSectionInput(
            section.id,
            field,
            field === "widthStuds"
              ? `${section.name} width`
              : field === "depthStuds"
                ? `${section.name} depth`
                : `${section.name} ${field.toUpperCase()}`,
          ),
        ),
      );
    }

    const validations: Array<[DimensionInputKey, string, (valueCm: number) => void]> =
      layoutShape === "u-shape"
        ? [
            ["uBackWidth", "back width", (value) => setUBackWidth(Math.max(16, cmToStuds(value)))],
            ["uBackDepth", "back depth", (value) => setUBackDepth(Math.max(16, cmToStuds(value)))],
            ["uLeftArmLength", "left arm length", (value) => setULeftArmLength(Math.max(16, cmToStuds(value)))],
            ["uLeftArmWidth", "left arm width", (value) => setULeftArmWidth(Math.max(16, cmToStuds(value)))],
            ["uRightArmLength", "right arm length", (value) => setURightArmLength(Math.max(16, cmToStuds(value)))],
            ["uRightArmWidth", "right arm width", (value) => setURightArmWidth(Math.max(16, cmToStuds(value)))],
            ["uInnerGapWidth", "inner gap width", (value) => setUInnerGapWidth(Math.max(16, cmToStuds(value)))],
            ["uInnerGapDepth", "inner gap depth", (value) => setUInnerGapDepth(Math.max(16, cmToStuds(value)))],
          ]
        : [
            ["tableWidth", "table width", updateTableWidth],
            ["tableDepth", "table depth", updateTableDepth],
            ...(layoutShape === "l-shape"
              ? ([
                  ["lArmWidth", "arm width", (value) => setLArmWidth(Math.max(16, cmToStuds(value)))],
                  ["lArmDepth", "arm length", (value) => setLArmDepth(Math.max(16, cmToStuds(value)))],
                ] as Array<[DimensionInputKey, string, (valueCm: number) => void]>)
              : []),
          ];

    return validations.every(([key, label, applyValue]) =>
      applyDimensionInput(key, label, applyValue),
    );
  };

  const startDrag = (event: PointerEvent<HTMLDivElement>, piece: Piece) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const beforeMove = currentLayoutSnapshot();
    const originX = event.clientX;
    const originY = event.clientY;
    const startX = piece.x;
    const startY = piece.y;
    setDragId(piece.id);
    setSelectedObject({ kind: "piece", id: piece.id });
    const pieceSnapSize = snapSizeForPiece(piece);

    const onMove = (moveEvent: globalThis.PointerEvent) => {
      const deltaX = (moveEvent.clientX - originX) / canvasScale;
      const deltaY = (moveEvent.clientY - originY) / canvasScale;
      const x = clamp(snapTo(startX + deltaX, pieceSnapSize), -overhangPolicy.maxDistance, layoutGeometry.width - piece.width + overhangPolicy.maxDistance);
      const y = clamp(snapTo(startY + deltaY, pieceSnapSize), -overhangPolicy.maxDistance, layoutGeometry.depth - piece.depth + overhangPolicy.maxDistance);
      const nextRect = { ...piece, x, y };

      if (!placementAllowed(nextRect)) {
        setObjectWarning("This object is outside your usable table space.");
        return;
      }
      setObjectWarning(placementWarningFor(nextRect));

      setPieces((current) =>
        current.map((item) => (item.id === piece.id ? { ...item, x, y } : item)),
      );
    };

    const onUp = () => {
      setDragId(null);
      const moved = piecesRef.current.find((item) => item.id === piece.id);
      if (moved && (moved.x !== startX || moved.y !== startY)) {
        if (piece.type === "road") {
          setPieces((current) => {
            const nextPieces = normaliseManualRoadTiles(current);
            updateRoadValidationNotes(nextPieces);
            return nextPieces;
          });
        }
        pushHistory(`Moved ${piece.name}`, beforeMove);
      }
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const startTrainDrag = (event: PointerEvent<HTMLDivElement>, piece: TrainPiece) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const beforeMove = currentLayoutSnapshot();
    const originX = event.clientX;
    const originY = event.clientY;
    const startX = piece.x;
    const startY = piece.y;
    setDragTrainId(piece.id);
    setSelectedObject({ kind: "train", id: piece.id });

    const onMove = (moveEvent: globalThis.PointerEvent) => {
      const deltaX = (moveEvent.clientX - originX) / canvasScale;
      const deltaY = (moveEvent.clientY - originY) / canvasScale;
      const x = clamp(snap(startX + deltaX), -overhangPolicy.maxDistance, layoutGeometry.width - piece.width + overhangPolicy.maxDistance);
      const y = clamp(snap(startY + deltaY), -overhangPolicy.maxDistance, layoutGeometry.depth - piece.depth + overhangPolicy.maxDistance);
      const nextRect = { ...piece, x, y };

      if (!placementAllowed(nextRect)) {
        setObjectWarning("This object is outside your usable table space.");
        return;
      }
      setObjectWarning(placementWarningFor(nextRect));

      setTrainPieces((current) =>
        current.map((item) => (item.id === piece.id ? { ...item, x, y } : item)),
      );
    };

    const onUp = () => {
      setDragTrainId(null);
      const moved = trainPiecesRef.current.find((item) => item.id === piece.id);
      if (moved && (moved.x !== startX || moved.y !== startY)) {
        pushHistory(`Moved ${piece.name}`, beforeMove);
      }
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const startCanvasPan = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || zoomPercent <= 100) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    panStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      panX: panOffset.x,
      panY: panOffset.y,
    };
    setIsPanning(true);
  };

  const moveCanvasPan = (event: PointerEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    const start = panStartRef.current;
    setPanOffset({
      x: start.panX + event.clientX - start.x,
      y: start.panY + event.clientY - start.y,
    });
  };

  const endCanvasPan = () => setIsPanning(false);

  const handleWheelZoom = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const nextZoom = clampZoom(zoomPercent + (event.deltaY < 0 ? 25 : -25));
    if (nextZoom === zoomPercent) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const pointerFromCenter = {
      x: event.clientX - rect.left - rect.width / 2 - panOffset.x,
      y: event.clientY - rect.top - rect.height / 2 - panOffset.y,
    };
    const zoomRatio = nextZoom / zoomPercent;
    setZoomPercent(nextZoom);
    setPanOffset({
      x: panOffset.x - pointerFromCenter.x * (zoomRatio - 1),
      y: panOffset.y - pointerFromCenter.y * (zoomRatio - 1),
    });
  };

  const zoomToPiece = (piece: { x: number; y: number; width: number; depth: number }) => {
    const nextZoom = 200;
    const nextScale = fitScale * (nextZoom / 100);
    setZoomPercent(nextZoom);
    setPanOffset({
      x: -((piece.x + piece.width / 2) - layoutGeometry.width / 2) * nextScale,
      y: -((piece.y + piece.depth / 2) - layoutGeometry.depth / 2) * nextScale,
    });
  };

  const moveViewportFromMiniMap = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const xRatio = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const yRatio = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    const targetX = xRatio * layoutGeometry.width;
    const targetY = yRatio * layoutGeometry.depth;
    setPanOffset({
      x: -((targetX - layoutGeometry.width / 2) * canvasScale),
      y: -((targetY - layoutGeometry.depth / 2) * canvasScale),
    });
  };

  const startMiniMapDrag = (event: PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    moveViewportFromMiniMap(event);
  };

  const makeTrainPiece = (
    preset: TrainPreset,
    x = 0,
    y = 0,
    rotation: TrainPiece["rotation"] = 0,
    elevationMode: TrainElevation = "ground",
  ): TrainPiece => {
    const isTurned = rotation === 90 || rotation === 270;
    const level = elevationMode === "ground" ? "ground" : "elevated";

    return {
      id: newId(),
      presetId: preset.id,
      type: "trackPiece",
      name: preset.name,
      category: "train",
      trainObjectType: "trackPiece",
      trackType: preset.trackType,
      width: isTurned ? preset.depthStuds : preset.widthStuds,
      depth: isTurned ? preset.widthStuds : preset.depthStuds,
      x,
      y,
      rotation,
      rotationAllowed: preset.rotationAllowed,
      clearanceStuds: preset.clearanceStuds,
      level,
      elevationMode,
      radiusStuds: preset.radiusStuds,
      angleDegrees: preset.angleDegrees,
      piecesIncluded: preset.piecesIncluded,
      baseplateModule: baseplateModuleLabel(
        isTurned ? preset.depthStuds : preset.widthStuds,
        isTurned ? preset.widthStuds : preset.depthStuds,
      ),
    };
  };

  const makeTrainModulePiece = (
    preset: TrainPreset,
    x = 0,
    y = 0,
    rotation: TrainPiece["rotation"] = 0,
    elevationMode: TrainElevation = "ground",
  ): TrainPiece => {
    const piece = makeTrainPiece(preset, x, y, rotation, elevationMode);
    const isTurned = rotation === 90 || rotation === 270;

    if (preset.trackType === "straight" || preset.trackType === "flex") {
      return {
        ...piece,
        name: preset.trackType === "flex" ? "Flex Track Piece" : "Straight Track Piece",
        trainObjectType: "trackPiece",
        supportSize: "16x16",
        supportPurpose: "track-support",
        visible: true,
        width: isTurned ? TRAIN_TRACK_WIDTH : TRAIN_TRACK_LENGTH,
        depth: isTurned ? TRAIN_TRACK_LENGTH : TRAIN_TRACK_WIDTH,
        clearanceStuds: undefined,
        baseplateModule: "track piece 8x16 centered on 16x16 support",
      };
    }

    if (preset.trackType === "corner-module" || preset.trackType === "curve") {
      return {
        ...piece,
        name: "R40 Curve Track",
        trainObjectType: "trackPiece",
        supportSize: "48x48",
        supportPurpose: "track-support",
        visible: true,
        width: TRAIN_CORNER_MODULE_SIZE,
        depth: TRAIN_CORNER_MODULE_SIZE,
        clearanceStuds: undefined,
        baseplateModule: baseplateModuleLabel(TRAIN_CORNER_MODULE_SIZE, TRAIN_CORNER_MODULE_SIZE),
      };
    }

    if (preset.trackType === "loop") {
      return {
        ...piece,
        name: "R40 Turning Loop Track",
        trainObjectType: "trackPiece",
        supportSize: "96x96",
        supportPurpose: "track-support",
        visible: true,
        width: TRAIN_LOOP_MODULE_SIZE,
        depth: TRAIN_LOOP_MODULE_SIZE,
        clearanceStuds: undefined,
        baseplateModule: baseplateModuleLabel(TRAIN_LOOP_MODULE_SIZE, TRAIN_LOOP_MODULE_SIZE),
      };
    }

    if (preset.trackType === "station") {
      return {
        ...piece,
        name: "Platform Track Piece",
        trainObjectType: "trackPiece",
        supportSize: "16x32",
        supportPurpose: "track-support",
        visible: true,
        width: isTurned ? 32 : 16,
        depth: isTurned ? 16 : 32,
        clearanceStuds: undefined,
        baseplateModule: baseplateModuleLabel(isTurned ? 32 : 16, isTurned ? 16 : 32),
      };
    }

    if (preset.trackType.includes("switch")) {
      return {
        ...piece,
        name: preset.trackType === "switch-left" ? "Left Switch Track" : "Right Switch Track",
        trainObjectType: "trackPiece",
        supportSize: "48x32",
        supportPurpose: "track-support",
        visible: true,
        width: isTurned ? 32 : 48,
        depth: isTurned ? 48 : 32,
        clearanceStuds: undefined,
        baseplateModule: baseplateModuleLabel(isTurned ? 32 : 48, isTurned ? 48 : 32),
      };
    }

    if (preset.trackType === "double-straight") {
      return {
        ...piece,
        name: "Double Track Straight Module",
        width: 32,
        depth: 32,
        clearanceStuds: undefined,
        baseplateModule: baseplateModuleLabel(32, 32),
      };
    }

    if (preset.trackType === "double-corner") {
      return {
        ...piece,
        name: "Double Track Corner Module",
        width: TRAIN_DOUBLE_CORNER_MODULE_SIZE,
        depth: TRAIN_DOUBLE_CORNER_MODULE_SIZE,
        clearanceStuds: undefined,
        baseplateModule: baseplateModuleLabel(TRAIN_DOUBLE_CORNER_MODULE_SIZE, TRAIN_DOUBLE_CORNER_MODULE_SIZE),
      };
    }

    return { ...piece, clearanceStuds: undefined };
  };

  const addTrainPiece = () => {
    const preset = trainPresets.find((item) => item.id === selectedTrainPresetId);
    if (!preset) return;

    const placed = placeTrainWithinTable(makeTrainModulePiece(preset, 0, 0, 0, trainElevation));
    recordLayoutChange(`Added ${placed.name}`, () => {
      setTrainPieces((current) => [...current, placed]);
      if (!placementAllowed(placed)) {
        setObjectWarning("This object is outside your usable table space.");
      } else {
        setObjectWarning(placementWarningFor(placed));
      }
    });
  };

  const rotateTrainPiece = (id: string) => {
    const target = trainPieces.find((piece) => piece.id === id);
    recordLayoutChange(`Rotated ${target?.name ?? "train piece"}`, () => {
      setTrainPieces((current) =>
        current.map((piece) => {
          if (piece.id !== id || !piece.rotationAllowed) return piece;
          const rotation = ((piece.rotation + 90) % 360) as TrainPiece["rotation"];
          return placeTrainWithinTable({
            ...piece,
            rotation,
            width: piece.depth,
            depth: piece.width,
          });
        }),
      );
    });
  };

  const rotatePiece = (id: string) => {
    const target = pieces.find((piece) => piece.id === id);
    if (!target) return;
    recordLayoutChange(`Rotated ${target.name}`, () => {
      setPieces((current) =>
        {
          const nextPieces = current.map((piece) => {
      if (piece.id !== id) return piece;
            const rotation = ((piece.rotation + 90) % 360) as Piece["rotation"];
            const rotatedPiece = placeWithinTable(
              piece.type === "road"
                ? {
                    ...orientRoadFootprint(piece, rotation),
                    selectedRoadType: piece.selectedRoadType ?? roadAssetKeyFor(piece.roadKind, piece.width, piece.depth),
                    roadConnections: roadConnectionRecord(roadConnectionsFor({ ...piece, rotation })),
                  }
                : {
                    ...withPieceModule({
                      ...piece,
                      rotation,
                      width: piece.depth,
                      depth: piece.width,
                    }),
                    frontSide: rotateSide(piece.frontSide ?? "south", 90),
                  },
            );
            setObjectWarning(placementWarningFor(rotatedPiece));
            if (piece.type === "road") console.debug("Road rotation", roadDebugPayloadFor(rotatedPiece));
            return rotatedPiece;
          });
          const normalisedPieces = target.type === "road" ? normaliseManualRoadTiles(nextPieces) : nextPieces;
          updateRoadValidationNotes(normalisedPieces);
          return normalisedPieces;
        },
      );
    });
  };

  const removePiece = (id: string) => {
    const target = pieces.find((piece) => piece.id === id);
    recordLayoutChange(`Deleted ${target?.name ?? "object"}`, () => {
      setPieces((current) => {
        const nextPieces = normaliseManualRoadTiles(current.filter((piece) => piece.id !== id));
        updateRoadValidationNotes(nextPieces);
        return nextPieces;
      });
      setSelectedObject((current) => (current?.kind === "piece" && current.id === id ? null : current));
    });
  };

  const removeTrainPiece = (id: string) => {
    const target = trainPieces.find((piece) => piece.id === id);
    recordLayoutChange(`Deleted ${target?.name ?? "train piece"}`, () => {
      setTrainPieces((current) => current.filter((piece) => piece.id !== id));
      setSelectedObject((current) => (current?.kind === "train" && current.id === id ? null : current));
    });
  };

  const duplicateSelectedObject = () => {
    if (selectedObject?.kind === "piece") {
      const target = pieces.find((piece) => piece.id === selectedObject.id);
      if (!target) return;
      const duplicate = placeWithinTable({
        ...target,
        id: newId(),
        name: `${target.name} copy`,
        x: target.x + snapSizeForPiece(target),
        y: target.y + snapSizeForPiece(target),
      });
      recordLayoutChange(`Duplicated ${target.name}`, () => {
        setPieces((current) => {
          const nextPieces = target.type === "road" ? normaliseManualRoadTiles([...current, duplicate]) : [...current, duplicate];
          updateRoadValidationNotes(nextPieces);
          return nextPieces;
        });
        setSelectedObject({ kind: "piece", id: duplicate.id });
      });
    }
    if (selectedObject?.kind === "train") {
      const target = trainPieces.find((piece) => piece.id === selectedObject.id);
      if (!target) return;
      const duplicate = placeTrainWithinTable({
        ...target,
        id: newId(),
        name: `${target.name} copy`,
        x: target.x + SNAP_STUDS,
        y: target.y + SNAP_STUDS,
      });
      recordLayoutChange(`Duplicated ${target.name}`, () => {
        setTrainPieces((current) => [...current, duplicate]);
        setSelectedObject({ kind: "train", id: duplicate.id });
      });
    }
  };

  const deleteLayoutCategory = (
    label: string,
    predicate: (piece: Piece) => boolean,
  ) => {
    const count = pieces.filter(predicate).length;
    if (count === 0) return;
    recordLayoutChange(`Deleted all ${label}`, () => {
      setPieces((current) => {
        const nextPieces = normaliseManualRoadTiles(current.filter((piece) => !predicate(piece)));
        updateRoadValidationNotes(nextPieces);
        return nextPieces;
      });
      setSelectedObject(null);
    });
  };

  const buildSingleLoopPieces = (margin: number) => {
    if (layoutShape !== "rectangle") {
      setTrainWarning("A single loop needs a rectangular area. For shaped tables, use Point-to-Point or Custom.");
      return null;
    }

    if (
      tableWidth < TRAIN_CORNER_CLEARANCE * 2 + margin * 2 ||
      tableDepth < TRAIN_CORNER_CLEARANCE * 2 + margin * 2
    ) {
      setTrainWarning("Single loop not possible with compact R40 modules. Try Point-to-Point or a station siding.");
      return null;
    }

    const corner = trainPresets.find((preset) => preset.id === "train-corner-r40-90");
    const straight = trainPresets.find((preset) => preset.id === "train-straight-16");
    if (!corner || !straight) return null;

    const maxX = snap(tableWidth - margin - TRAIN_CORNER_MODULE_SIZE);
    const maxY = snap(tableDepth - margin - TRAIN_CORNER_MODULE_SIZE);
    const next: TrainPiece[] = [
      makeTrainModulePiece(corner, margin, margin, 0),
      makeTrainModulePiece(corner, maxX, margin, 90),
      makeTrainModulePiece(corner, maxX, maxY, 180),
      makeTrainModulePiece(corner, margin, maxY, 270),
    ];

    for (let x = snap(margin + TRAIN_CORNER_MODULE_SIZE); x <= maxX - TRAIN_STRAIGHT_MODULE_WIDTH; x += TRAIN_STRAIGHT_MODULE_WIDTH) {
      next.push(makeTrainModulePiece(straight, x, snap(margin + 16), 0));
      next.push(makeTrainModulePiece(straight, x, snap(maxY), 0));
    }

    for (let y = snap(margin + TRAIN_CORNER_MODULE_SIZE); y <= maxY - TRAIN_STRAIGHT_MODULE_WIDTH; y += TRAIN_STRAIGHT_MODULE_WIDTH) {
      next.push(makeTrainModulePiece(straight, snap(margin + 16), y, 90));
      next.push(makeTrainModulePiece(straight, snap(maxX), y, 90));
    }

    return next.map((piece) => placeTrainWithinTable(piece));
  };

  const buildShapedPerimeterPieces = (margin: number) => {
    const straight = trainPresets.find((preset) => preset.id === "train-straight-16");
    if (!straight) return null;

    if (layoutGeometry.tableSections.length < 2) {
      return buildSingleLoopPieces(margin);
    }

    setTrainWarning(
      "Complete loop not possible on this shaped table. Generated a point-to-point perimeter route; consider a dogbone if you add turning space.",
    );

    const next: TrainPiece[] = [];
    const occupied = new Set<string>();
    const addStraight = (x: number, y: number, rotation: TrainPiece["rotation"]) => {
      const piece = makeTrainModulePiece(straight, x, y, rotation);
      if (!placementAllowed(piece)) return;
      const key = `${piece.x}:${piece.y}:${piece.rotation}`;
      if (occupied.has(key)) return;
      occupied.add(key);
      next.push(piece);
    };

    layoutGeometry.tableSections.forEach((section, sectionIndex) => {
      const startX = snap(section.x + margin);
      const endX = snap(section.x + section.widthStuds - margin - TRAIN_STRAIGHT_MODULE_WIDTH);
      const topY = snap(section.y + margin);
      const bottomY = snap(section.y + section.depthStuds - margin - TRAIN_STRAIGHT_MODULE_DEPTH);
      for (let x = startX; x <= endX; x += TRAIN_STRAIGHT_MODULE_WIDTH) {
        addStraight(x, topY, 0);
        addStraight(x, bottomY, 0);
      }

      const leftX = snap(section.x + margin);
      const rightX = snap(section.x + section.widthStuds - margin - TRAIN_STRAIGHT_MODULE_DEPTH);
      const startY = snap(section.y + margin);
      const endY = snap(section.y + section.depthStuds - margin - TRAIN_STRAIGHT_MODULE_WIDTH);
      for (let yArm = startY; yArm <= endY; yArm += TRAIN_STRAIGHT_MODULE_WIDTH) {
        addStraight(leftX, yArm, 90);
        if (sectionIndex > 0 || layoutShape === "custom") addStraight(rightX, yArm, 90);
      }
    });

    return next.map((piece) => placeTrainWithinTable(piece));
  };

  const buildPointToPointPieces = (margin: number) => {
    const straight = trainPresets.find((preset) => preset.id === "train-straight-16");
    const station = trainPresets.find((preset) => preset.id === "train-station-section");
    const leftSwitch = trainPresets.find((preset) => preset.id === "train-switch-left");
    const rightSwitch = trainPresets.find((preset) => preset.id === "train-switch-right");
    if (!straight || !station) return null;

    const zone = layoutGeometry.usableZones[0];
    if (!zone || zone.widthStuds < 64) {
      setTrainWarning("Point-to-point railway needs at least 51.2 cm of straight space.");
      return null;
    }

    const y = snap(zone.y + margin + Math.min(24, Math.max(8, zone.depthStuds * 0.16)));
    const startX = snap(zone.x + margin);
    const endX = snap(zone.x + zone.widthStuds - margin - 16);
    const next: TrainPiece[] = [];
    for (let x = startX; x <= endX; x += SNAP_STUDS) {
      next.push(makeTrainModulePiece(straight, x, y, 0));
    }
    if (zone.widthStuds >= 96) {
      next.push(makeTrainModulePiece(station, snap(startX + 32), snap(y + TRACK_CENTER_SPACING), 0));
      next.push(makeTrainModulePiece(station, snap(endX - 64), snap(y + TRACK_CENTER_SPACING), 0));
    }
    if (leftSwitch && rightSwitch && zone.widthStuds >= 176 && zone.depthStuds >= 80) {
      const sidingY = snap(y + TRACK_CENTER_SPACING * 2);
      next.push(makeTrainModulePiece(leftSwitch, snap(startX + 48), y, 0));
      for (let x = snap(startX + 96); x <= snap(endX - 96); x += SNAP_STUDS) {
        next.push(makeTrainModulePiece(straight, x, sidingY, 0));
      }
      next.push(makeTrainModulePiece(rightSwitch, snap(endX - 64), y, 0));
    }
    setTrainWarning("Generated point-to-point railway with station opportunities and 16-stud siding spacing where space allows.");
    return next.map((piece) => placeTrainWithinTable(piece));
  };

  const buildRearEdgeRailwayPieces = (margin: number, elevationMode: TrainElevation) => {
    const straight = trainPresets.find((preset) => preset.id === "train-straight-16");
    const station = trainPresets.find((preset) => preset.id === "train-station-section");
    if (!straight) return null;

    const zone = layoutGeometry.usableZones[0];
    if (!zone || zone.widthStuds < 64) return null;

    const y = snap(zone.y + margin);
    const startX = snap(zone.x + margin);
    const endX = snap(zone.x + zone.widthStuds - margin - TRAIN_STRAIGHT_MODULE_WIDTH);
    const next: TrainPiece[] = [];
    for (let x = startX; x <= endX; x += TRAIN_STRAIGHT_MODULE_WIDTH) {
      next.push(makeTrainModulePiece(straight, x, y, 0, elevationMode));
    }
    if (station && zone.widthStuds >= 128) {
      next.push(makeTrainModulePiece(station, snap(startX + 48), snap(y + TRACK_CENTER_SPACING), 0, elevationMode));
    }

    setTrainWarning("Generated rear-edge railway corridor.");
    return applyTrainElevation(next.map((piece) => placeTrainWithinTable(piece)), elevationMode);
  };

  const buildStationSidingPieces = (margin: number) => {
    const straight = trainPresets.find((preset) => preset.id === "train-straight-16");
    const station = trainPresets.find((preset) => preset.id === "train-station-section");
    if (!straight || !station) return null;

    const zone = layoutGeometry.usableZones[0];
    if (!zone || zone.widthStuds < 80) return null;

    const y = snap(zone.y + margin + 16);
    const startX = snap(zone.x + margin);
    const endX = snap(Math.min(zone.x + zone.widthStuds - TRAIN_STRAIGHT_MODULE_WIDTH, startX + 96));
    const next: TrainPiece[] = [];
    for (let x = startX; x <= endX; x += TRAIN_STRAIGHT_MODULE_WIDTH) {
      next.push(makeTrainModulePiece(straight, x, y, 0));
    }
    next.push(makeTrainModulePiece(station, snap(startX + 32), snap(y + TRACK_CENTER_SPACING), 0));

    setTrainWarning("Generated small station display track.");
    return next.map((piece) => placeTrainWithinTable(piece));
  };

  const buildDoubleLoopPieces = (margin: number) => {
    const outer = buildSingleLoopPieces(margin);
    if (!outer) return null;
    if (tableWidth < TRAIN_CORNER_CLEARANCE * 2 + margin * 2 + 32 || tableDepth < TRAIN_CORNER_CLEARANCE * 2 + margin * 2 + 32) {
      setTrainWarning("Double loop needs more room. Generated a single loop instead.");
      return outer;
    }
    const inner = buildSingleLoopPieces(margin + TRACK_CENTER_SPACING);
    setTrainWarning(inner ? "Generated double loop with 16-stud track spacing." : "Double loop not possible; generated single loop.");
    return inner ? [...outer, ...inner] : outer;
  };

  const buildDogbonePieces = (margin: number) => {
    const loop = trainPresets.find((preset) => preset.id === "train-circle-r40");
    const straight = trainPresets.find((preset) => preset.id === "train-straight-16");
    if (!loop || !straight) return null;
    const zone = layoutGeometry.usableZones[0];
    if (!zone || zone.widthStuds < TRAIN_LOOP_MODULE_SIZE * 2 + 48 || zone.depthStuds < TRAIN_LOOP_MODULE_SIZE) {
      setTrainWarning("Dogbone needs turning space at both ends. Generated point-to-point railway instead.");
      return buildPointToPointPieces(margin);
    }
    const y = snap(zone.y + margin);
    const leftX = snap(zone.x + margin);
    const rightX = snap(zone.x + zone.widthStuds - margin - TRAIN_LOOP_MODULE_SIZE);
    const centerY = snap(y + TRAIN_CORNER_MODULE_SIZE - TRAIN_STRAIGHT_MODULE_DEPTH / 2);
    const next = [
      makeTrainModulePiece(loop, leftX, y, 0),
      makeTrainModulePiece(loop, rightX, y, 0),
    ];
    for (let x = leftX + TRAIN_LOOP_MODULE_SIZE; x <= rightX - TRAIN_STRAIGHT_MODULE_WIDTH; x += TRAIN_STRAIGHT_MODULE_WIDTH) {
      next.push(makeTrainModulePiece(straight, x, centerY, 0));
    }
    setTrainWarning("Generated dogbone railway from R40 turning-loop modules connected by straight track modules.");
    return next.map((piece) => placeTrainWithinTable(piece));
  };

  const buildCustomTrainCorridor = (margin: number) => {
    setTrainWarning("Reserved a custom train corridor for manual editing.");
    return buildPointToPointPieces(margin);
  };

  const applyTrainElevation = (pieces: TrainPiece[] | null, mode: TrainElevation) => {
    if (!pieces) return null;
    if (mode === "ground") {
      return pieces.map((piece) => ({ ...piece, level: "ground" as const, elevationMode: "ground" as const }));
    }

    const minX = Math.min(...pieces.map((piece) => piece.x));
    const minY = Math.min(...pieces.map((piece) => piece.y));
    const rearLimit = minY + TRAIN_CORNER_CLEARANCE;
    const sideLimit = minX + TRAIN_CORNER_CLEARANCE;

    return pieces.map((piece) => {
      const shouldElevate =
        mode === "fully-elevated" ||
        (mode === "elevated-rear" && piece.y <= rearLimit) ||
        (mode === "elevated-side" && piece.x <= sideLimit);

      return {
        ...piece,
        level: shouldElevate ? "elevated" as const : "ground" as const,
        elevationMode: shouldElevate ? mode : "ground" as const,
      };
    });
  };

  const buildPerimeterRailwayPieces = (margin: number, elevationMode: TrainElevation) => {
    const minimum = TRAIN_CORNER_CLEARANCE * 2 + margin * 2;
    if (layoutShape === "rectangle" && (tableWidth < minimum || tableDepth < minimum)) {
      setTrainWarning(
        "Around Edge railway may not fit with compact 48x48 R40 corner modules on this table. Try Point-to-Point, Dogbone, or an elevated station siding.",
      );
      return null;
    }

    const pieces =
      layoutShape === "rectangle" ? buildSingleLoopPieces(margin) : buildShapedPerimeterPieces(margin);
    if (!pieces) return null;

    const elevatedPieces = applyTrainElevation(pieces, elevationMode);
    const extraRoom = layoutGeometry.width >= 320 && layoutGeometry.depth >= 220;
    setTrainWarning(
      elevationMode === "ground"
        ? extraRoom
          ? "Generated an around-edge perimeter railway. Large layout could support double track or freight sidings."
          : "Generated an around-edge perimeter railway that keeps the central city area open."
        : `Generated ${trainElevationLabels[elevationMode].toLowerCase()} perimeter railway with support columns and reusable ground space.`,
    );
    return elevatedPieces;
  };

  const buildTrainByStyle = (style: TrainGenerator, margin: number) => {
    if (style === "none") return [];
    if (style === "perimeter") return buildPerimeterRailwayPieces(margin, trainElevation);
    if (style === "single-loop") return layoutShape === "rectangle" ? buildSingleLoopPieces(margin) : buildPointToPointPieces(margin);
    if (style === "double-loop") return layoutShape === "rectangle" ? buildDoubleLoopPieces(margin) : buildPointToPointPieces(margin);
    if (style === "point-to-point") return layoutShape === "rectangle" ? buildPointToPointPieces(margin) : buildShapedPerimeterPieces(margin);
    if (style === "dogbone") return buildDogbonePieces(margin);
    return buildCustomTrainCorridor(margin);
  };

  const generateTrainLayout = () => {
    if (!validateActiveDimensionInputs()) return;
    setTrainWarning("");
    const next = buildTrainByStyle(trainGenerator, Math.max(0, snap(railMargin)));
    setTrainPieces(next ?? []);
  };

  const generateLayout = (confirmedSpaceFillChoices?: SpaceFillChoice[]) => {
    if (!validateActiveDimensionInputs()) return;
    const historyBeforeGeneration = currentLayoutSnapshot();
    const wantsRoads = layoutFeatureChoice !== "neither";
    const activeSpaceFillChoices = confirmedSpaceFillChoices ?? [];
    const shouldAskForSpaceFill = confirmedSpaceFillChoices === undefined;
    const notes: string[] = [];
    const decisionNotes: string[] = [];
    const usedRoadInventory: Partial<Record<RoadInventoryKey, number>> = {};
    const missingRoadInventory: Partial<Record<RoadInventoryKey, number>> = {};
    let score = 0;
    const addCount = <Key extends string>(target: Partial<Record<Key, number>>, key: Key, count = 1) => {
      target[key] = (target[key] ?? 0) + count;
    };

    setTrainPieces([]);
    setTrainWarning("");
    setTrainGenerator("none");

    const sourceBuildings = pieces
      .filter((piece) => piece.type === "building")
      .filter((piece) => !piece.isCustomMoc)
      .filter((piece) => !piece.isOfficialLEGO || !piece.setNumber || !selectedOfficialSets.includes(piece.setNumber))
      .map((piece) => withPieceModule({
        ...piece,
        width: Math.max(8, snap(piece.width)),
        depth: Math.max(8, snap(piece.depth)),
        rotation: piece.rotation ?? 0,
        modularType: piece.modularType ?? "straight",
        preferredPlacement: piece.preferredPlacement ?? "road-facing",
        frontSide: piece.frontSide ?? "south",
      }));
    const selectedOfficialBuildings = selectedOfficialSets
      .map(pieceFromOfficialPreset)
      .filter(Boolean)
      .map((piece) => withPieceModule({
        ...(piece as Piece),
        id: newId(),
        width: Math.max(8, snap((piece as Piece).width)),
        depth: Math.max(8, snap((piece as Piece).depth)),
      }));
    const customMocBuildings = customMocs.map((moc) =>
      withPieceModule({
        ...pieceFromCustomMoc(moc),
        id: `moc-${moc.id}`,
        width: Math.max(8, snap(moc.widthStuds)),
        depth: Math.max(8, snap(moc.depthStuds)),
      }),
    );
    const ownedBuildings = [...selectedOfficialBuildings, ...customMocBuildings, ...sourceBuildings];
    notes.push(`Generation input: ${selectedOfficialBuildings.length} official buildings, ${customMocs.length} custom MOCs`);
    const districtForPiece = (piece: Piece): DistrictKind => {
      const name = piece.name.toLowerCase();
      if (piece.category === "retail" || /emporium|market|shop|grocer|store|bookshop|shopping/.test(name)) return "retail";
      if (piece.category === "restaurants" || /restaurant|cafe|jazz|diner|bar|food/.test(name)) return "restaurant";
      if (piece.category === "civic" || /police|fire|museum|town hall|bank|office/.test(name)) return "civic";
      if (piece.category === "residential" || /hotel|apartment|house|residence|corner/.test(name)) return "residential";
      if (piece.category === "industrial") return "business";
      if (piece.category === "park") return "park";
      return "mixed";
    };
    const districtGroups = ownedBuildings.reduce((groups, building) => {
      const district = districtForPiece(building);
      groups[district] = [...(groups[district] ?? []), building];
      return groups;
    }, {} as Partial<Record<DistrictKind, Piece[]>>);

    const usableSections = layoutGeometry.usableZones;
    const zone = usableSections[0];
    if (!zone) return;
    const usableLeft = Math.min(...usableSections.map((section) => section.x));
    const usableTop = Math.min(...usableSections.map((section) => section.y));
    const usableRight = Math.max(...usableSections.map((section) => section.x + section.widthStuds));
    const usableBottom = Math.max(...usableSections.map((section) => section.y + section.depthStuds));
    const combinedUsableZone = zoneWithCm({
      id: "combined-usable-layout",
      name: "Combined usable layout",
      widthStuds: usableRight - usableLeft,
      depthStuds: usableBottom - usableTop,
      x: usableLeft,
      y: usableTop,
    });

    const edgeCorridor = 0;
    const cityZone =
      edgeCorridor > 0 &&
      combinedUsableZone.widthStuds > edgeCorridor * 2 + 64 &&
      combinedUsableZone.depthStuds > edgeCorridor * 2 + 64
        ? zoneWithCm({
            id: `${combinedUsableZone.id}-city-core`,
            name: "City core inside perimeter railway",
            widthStuds: combinedUsableZone.widthStuds - edgeCorridor * 2,
            depthStuds: combinedUsableZone.depthStuds - edgeCorridor * 2,
            x: combinedUsableZone.x + edgeCorridor,
            y: combinedUsableZone.y + edgeCorridor,
          })
        : combinedUsableZone;
    notes.push("City style: Blueprint inferred from selected buildings, roads, features, and table shape");

    const ownedBuildingFootprintArea = ownedBuildings.reduce((sum, piece) => sum + piece.width * piece.depth, 0);
    const cityArea = Math.max(1, usableSections.reduce((sum, section) => sum + section.widthStuds * section.depthStuds, 0));
    if (shouldAskForSpaceFill && ownedBuildingFootprintArea / cityArea < 0.45) {
      setShowSpaceFillPrompt(true);
      setLayoutNotes([
        "Your current buildings do not fill the full layout yet",
        "Choose what Blueprint should add to complete the city masterplan",
      ]);
      return;
    }
    setShowSpaceFillPrompt(false);

    const hasCornerBuildings = ownedBuildings.some((building) => building.modularType === "corner");
    const hasIndustrial = ownedBuildings.some((building) => building.category === "industrial");
    const districtWidth = Math.min(
      cityZone.widthStuds,
      Math.max(160, snap(cityZone.widthStuds - 16)),
    );
    const districtDepth = Math.min(
      cityZone.depthStuds,
      Math.max(112, snap(cityZone.depthStuds - 16)),
    );
    const districtX = cityZone.x;
    const districtY = cityZone.y;
    const roadPieces: Piece[] = [];
    const gridLeft = Math.ceil(cityZone.x / SNAP_STUDS) * SNAP_STUDS;
    const gridTop = Math.ceil(cityZone.y / SNAP_STUDS) * SNAP_STUDS;
    const gridRight = Math.floor((cityZone.x + cityZone.widthStuds) / SNAP_STUDS) * SNAP_STUDS;
    const gridBottom = Math.floor((cityZone.y + cityZone.depthStuds) / SNAP_STUDS) * SNAP_STUDS;
    const roadY = clamp(
      gridTop + Math.max(32, Math.floor((districtDepth * 0.38) / 32) * 32),
      gridTop,
      Math.max(gridTop, gridBottom - 32),
    );
    const roadX = clamp(
      gridLeft + Math.max(64, Math.floor((districtWidth * 0.46) / 32) * 32),
      gridLeft,
      Math.max(gridLeft, gridRight - 32),
    );
    const districtAnchors: Record<DistrictKind, { x: number; y: number }> = {
      retail: { x: gridLeft + 32, y: Math.max(gridTop, roadY - 64) },
      restaurant: { x: gridLeft + 32, y: Math.min(gridBottom - 32, roadY + 64) },
      civic: { x: Math.min(gridRight - 64, roadX + 64), y: Math.max(gridTop, roadY - 64) },
      residential: { x: Math.min(gridRight - 64, roadX + 64), y: Math.min(gridBottom - 32, roadY + 64) },
      business: { x: Math.min(gridRight - 64, roadX + 128), y: Math.min(gridBottom - 32, roadY + 96) },
      park: { x: Math.max(gridLeft, roadX - 32), y: Math.max(gridTop, roadY - 32) },
      mixed: { x: roadX, y: roadY },
    };
    Object.entries(districtGroups).forEach(([district, buildings]) => {
      if (!buildings || buildings.length === 0) return;
      decisionNotes.push(`Decision: Created a ${districtLabels[district as DistrictKind]} around ${buildings[0].name}`);
    });
    const trainClearanceRects: Array<{ x: number; y: number; width: number; depth: number }> = [];
    const trainFootprintRects: Array<{ x: number; y: number; width: number; depth: number }> = [];
    const occupiedRects: Array<{ x: number; y: number; width: number; depth: number }> = [];
    const supportedAreaRatio = (rect: { x: number; y: number; width: number; depth: number }) =>
      supportRatioForRect(rect, layoutGeometry.usableZones, layoutGeometry.blockedZones);
    const isBuildablySupported = (
      rect: { x: number; y: number; width: number; depth: number; modularType?: ModularType },
      minimum = 0.75,
    ) => placementAllowed(rect, minimum);

    if (wantsRoads) {
      const compactCity = roadSystem === "minimal";
      const prefersHorizontalBackbone = cityZone.widthStuds >= cityZone.depthStuds;
      const roadInventoryKeyForKind = (roadKind: RoadKind, width = 32, depth = 32): RoadInventoryKey => {
        const isCompactRoad = width === 16 || depth === 16;
        if (roadKind === "corner") return isCompactRoad ? "corner16" : "corner32";
        if (roadKind === "t-junction") return isCompactRoad ? "t16" : "t32";
        if (roadKind === "cross") return isCompactRoad ? "cross16" : "cross32";
        if (roadKind === "dead-end") return "deadEnd32";
        return isCompactRoad ? "straight16" : "straight32";
      };
      const canUseRoad = (roadKind: RoadKind, width = 32, depth = 32) => {
        const key = roadInventoryKeyForKind(roadKind, width, depth);
        if (roadInventoryMode === "unlimited") {
          addCount(usedRoadInventory, key);
          return true;
        }
        if (roadInventoryMode === "suggest") {
          addCount(usedRoadInventory, key);
          addCount(missingRoadInventory, key);
          return true;
        }
        if ((roadInventory[key] ?? 0) > (usedRoadInventory[key] ?? 0)) {
          addCount(usedRoadInventory, key);
          return true;
        }
        addCount(missingRoadInventory, key);
        return false;
      };
      const addRoadModule = (
        x: number,
        y: number,
        roadKind: RoadKind,
        name: string,
        rotation: Piece["rotation"] = 0,
        width = 32,
        depth = 32,
      ) => {
        const rect = { x, y, width, depth };
        if (!placementAllowed(rect, roadKind === "plaza" ? 0.6 : overhangPolicy.minSupport)) return;
        if (trainClearanceRects.some((piece) => rectsOverlap(rect, piece))) return;
        if (trainFootprintRects.some((piece) => rectsOverlap(rect, piece))) return;
        const existing = roadPieces.find((piece) => piece.x === x && piece.y === y && piece.width === width && piece.depth === depth);
        if (existing) {
          existing.roadKind =
            existing.roadKind === "t-junction" || roadKind === "t-junction"
              ? roadKind === "cross" || existing.roadKind === "cross"
                ? "cross"
                : "t-junction"
              : roadKind;
          existing.name = existing.roadKind === "cross" ? "Cross junction" : existing.name;
          return;
        }
        if (roadPieces.some((piece) => rectsOverlap(rect, piece))) return;
        if (!canUseRoad(roadKind, width, depth)) return;
        roadPieces.push({
          id: newId(),
          type: "road",
          name,
          category: "Road",
          width,
          depth,
          x,
          y,
          rotation,
          roadKind,
          snapGroup: "road",
          snapSize: 16,
        });
      };
      const addHorizontalRoad = (x: number, y: number, kind: RoadKind, name: string, width = 32) =>
        addRoadModule(x, y, kind, name, width === 16 ? 90 : 0, width === 16 ? 16 : width, width === 16 ? 32 : 32);
      const addVerticalRoad = (x: number, y: number, kind: RoadKind, name: string, depth = 32) =>
        addRoadModule(x, y, kind, name, depth === 16 ? 0 : 90, depth === 16 ? 32 : 32, depth === 16 ? 16 : depth);
      const addNarrowHorizontalRoad = (x: number, y: number, kind: RoadKind, name: string, width = 32) =>
        addRoadModule(x, y, kind, name, 0, width, 16);
      const addNarrowVerticalRoad = (x: number, y: number, kind: RoadKind, name: string, depth = 32) =>
        addRoadModule(x, y, kind, name, 90, 16, depth);
      const addBackboneRoad = (offset: number, kind: RoadKind, name: string, size = 32) => {
        if (prefersHorizontalBackbone) addHorizontalRoad(offset, roadY, kind, name, size);
        else addVerticalRoad(roadX, offset, kind, name, size);
      };
      const addCrossRoad = (offset: number, kind: RoadKind, name: string, size = 32) => {
        if (prefersHorizontalBackbone) addVerticalRoad(roadX, offset, kind, name, size);
        else addHorizontalRoad(offset, roadY, kind, name, size);
      };

      if (layoutShape === "l-shape") {
        const mainSection = layoutGeometry.tableSections.find((section) => section.id === "rectangle-main") ?? layoutGeometry.tableSections[0];
        const armSection = layoutGeometry.tableSections.find((section) => section.id === "l-arm") ?? layoutGeometry.tableSections[1];
        const mainRoadY = Math.floor((mainSection.y + mainSection.depthStuds * 0.55) / 32) * 32;
        const useCompactArmRoad = armSection.widthStuds < 64;
        const armRoadX = useCompactArmRoad
          ? Math.max(armSection.x, armSection.x + armSection.widthStuds - 16)
          : Math.floor((armSection.x + Math.max(0, armSection.widthStuds - 32) / 2) / SNAP_STUDS) * SNAP_STUDS;
        const mainStart = Math.ceil(mainSection.x / 32) * 32;
        const mainEnd = Math.floor((mainSection.x + mainSection.widthStuds - 32) / 32) * 32;
        for (let x = mainStart; x <= mainEnd; x += 32) {
          addHorizontalRoad(x, mainRoadY, x === armRoadX ? "t-junction" : x === mainEnd ? "dead-end" : "straight", x === armRoadX ? "L-shape district junction" : x === mainEnd ? "Road terminus" : "Main section road");
        }
        const armStart = Math.ceil(armSection.y / 32) * 32;
        const armEnd = Math.floor((armSection.y + armSection.depthStuds - 32) / 32) * 32;
        for (let y = armStart; y <= armEnd; y += 32) {
          const addArmRoad = useCompactArmRoad ? addNarrowVerticalRoad : addVerticalRoad;
          addArmRoad(armRoadX, y, y === armStart ? "t-junction" : y === armEnd ? "dead-end" : "straight", y === armStart ? "L-shape district junction" : y === armEnd ? "Road terminus" : "L arm road");
        }
        addRoadModule(armRoadX, Math.max(mainSection.y, mainSection.y + mainSection.depthStuds - 32), "plaza", "L-shape join plaza");
        notes.push("L-shape roads use the corner join as the city anchor");
        decisionNotes.push("Decision: Connected both arms of the L-shape with a junction and join plaza");
      } else if (layoutShape === "u-shape") {
        const back = layoutGeometry.tableSections.find((section) => section.id === "u-back") ?? layoutGeometry.tableSections[0];
        const left = layoutGeometry.tableSections.find((section) => section.id === "u-left-arm") ?? layoutGeometry.tableSections[1];
        const right = layoutGeometry.tableSections.find((section) => section.id === "u-right-arm") ?? layoutGeometry.tableSections[2];
        const useCompactBackRoad = back.depthStuds < 64;
        const useCompactLeftRoad = left.widthStuds < 64;
        const useCompactRightRoad = right.widthStuds < 64;
        const backRoadY = useCompactBackRoad
          ? Math.max(back.y, back.y + back.depthStuds - 16)
          : Math.max(back.y, Math.floor((back.y + back.depthStuds - 32) / 32) * 32);
        const leftRoadX = useCompactLeftRoad
          ? Math.max(left.x, left.x + left.widthStuds - 16)
          : Math.max(left.x, Math.floor((left.x + left.widthStuds - 32) / SNAP_STUDS) * SNAP_STUDS);
        const rightRoadX = Math.ceil(right.x / SNAP_STUDS) * SNAP_STUDS;
        const backStart = Math.ceil(back.x / 32) * 32;
        const backEnd = Math.floor((back.x + back.widthStuds - 32) / 32) * 32;
        for (let x = backStart; x <= backEnd; x += 32) {
          const atLeft = Math.abs(x - leftRoadX) < 16;
          const atRight = Math.abs(x - rightRoadX) < 16;
          const addBackRoad = useCompactBackRoad ? addNarrowHorizontalRoad : addHorizontalRoad;
          addBackRoad(x, backRoadY, atLeft || atRight ? "t-junction" : x === backEnd ? "dead-end" : "straight", atLeft || atRight ? "U-shape arm junction" : x === backEnd ? "Road terminus" : "Back section road");
        }
        const armStart = Math.ceil(left.y / 32) * 32;
        const leftEnd = Math.floor((left.y + left.depthStuds - 32) / 32) * 32;
        const rightEnd = Math.floor((right.y + right.depthStuds - 32) / 32) * 32;
        for (let y = armStart; y <= leftEnd; y += 32) {
          const addLeftRoad = useCompactLeftRoad ? addNarrowVerticalRoad : addVerticalRoad;
          addLeftRoad(leftRoadX, y, y === armStart ? "t-junction" : y === leftEnd ? "dead-end" : "straight", y === armStart ? "U-shape arm junction" : y === leftEnd ? "Road terminus" : "Left arm frontage road");
        }
        for (let y = armStart; y <= rightEnd; y += 32) {
          const addRightRoad = useCompactRightRoad ? addNarrowVerticalRoad : addVerticalRoad;
          addRightRoad(rightRoadX, y, y === armStart ? "t-junction" : y === rightEnd ? "dead-end" : "straight", y === armStart ? "U-shape arm junction" : y === rightEnd ? "Road terminus" : "Right arm frontage road");
        }
        if (back.widthStuds >= 160 && back.depthStuds >= 48) {
          const backCrossX = Math.floor((back.x + back.widthStuds / 2) / 32) * 32;
          const backConnectorY = Math.max(back.y, backRoadY - 32);
          addHorizontalRoad(backCrossX - 32, backConnectorY, "t-junction", "Downtown block connector");
          addHorizontalRoad(backCrossX, backConnectorY, "straight", "Downtown block connector");
        }
        if (left.depthStuds >= 112) {
          const leftMidY = Math.floor((left.y + left.depthStuds * 0.55) / 32) * 32;
          addNarrowHorizontalRoad(left.x, leftMidY, "t-junction", "Left arm district connector", Math.max(32, left.widthStuds));
        }
        if (right.depthStuds >= 112) {
          const rightMidY = Math.floor((right.y + right.depthStuds * 0.55) / 32) * 32;
          addNarrowHorizontalRoad(right.x, rightMidY, "t-junction", "Right arm district connector", Math.max(32, right.widthStuds));
        }
        addRoadModule(Math.max(back.x, leftRoadX), backRoadY, "plaza", "Left back corner plaza");
        addRoadModule(Math.min(back.x + back.widthStuds - 32, rightRoadX), backRoadY, "plaza", "Right back corner plaza");
        notes.push("U-shape roads use the inner frontage across the back, left arm, and right arm");
        decisionNotes.push("Decision: Planned separate districts for the U-shape back section and both arms");
      } else {
        const mainStart = prefersHorizontalBackbone ? gridLeft : gridTop;
        const mainLimit = prefersHorizontalBackbone ? gridRight : gridBottom;
        const mainRoadEnd = compactCity
          ? Math.min(mainLimit - 32, mainStart + Math.max(160, Math.floor((prefersHorizontalBackbone ? districtWidth : districtDepth) / 32) * 32))
          : mainLimit - 32;
        const primaryIntersection = prefersHorizontalBackbone ? roadX : roadY;
        const secondaryIntersection = clamp(primaryIntersection + 128, mainStart + 64, Math.max(mainStart + 64, mainRoadEnd - 32));

        for (let offset = mainStart; offset <= mainRoadEnd; offset += 32) {
          const roadKind =
            Math.abs(offset - primaryIntersection) < 16 && (hasCornerBuildings || ownedBuildings.length > 3)
              ? roadSystem === "minimal"
                ? "t-junction"
                : "cross"
              : !compactCity && Math.abs(offset - secondaryIntersection) < 16 && cityZone.widthStuds >= 224
                ? "t-junction"
                : offset >= mainRoadEnd
                  ? "dead-end"
                  : "straight";
          addBackboneRoad(offset, roadKind, offset >= mainRoadEnd ? "Road terminus" : "Main boulevard");
        }
        const compactGap = (prefersHorizontalBackbone ? cityZone.x + cityZone.widthStuds : cityZone.y + cityZone.depthStuds) - (mainRoadEnd + 32);
        if (compactGap >= 16) addBackboneRoad(mainRoadEnd + 32, "straight", "Compact road infill", 16);

        if (roadSystem !== "minimal") {
          const crossStart = compactCity
            ? Math.max(prefersHorizontalBackbone ? gridTop : gridLeft, (prefersHorizontalBackbone ? roadY : roadX) - 64)
            : prefersHorizontalBackbone
              ? gridTop
              : gridLeft;
          const crossEnd = compactCity
            ? Math.min((prefersHorizontalBackbone ? gridBottom : gridRight) - 32, (prefersHorizontalBackbone ? roadY : roadX) + 128)
            : (prefersHorizontalBackbone ? gridBottom : gridRight) - 32;
          for (let offset = crossStart; offset <= crossEnd; offset += 32) {
            const onBackbone = offset === (prefersHorizontalBackbone ? roadY : roadX);
            addCrossRoad(
              offset,
              onBackbone ? "cross" : offset === crossEnd ? "dead-end" : "straight",
              onBackbone ? "District junction" : offset === crossEnd ? "Road terminus" : "Secondary avenue",
            );
          }
          const crossGap = (prefersHorizontalBackbone ? cityZone.y + cityZone.depthStuds : cityZone.x + cityZone.widthStuds) - (crossEnd + 32);
          if (crossGap >= 16) addCrossRoad(crossEnd + 32, "straight", "Compact road infill", 16);
        }

        if (roadSystem !== "minimal" && cityZone.widthStuds >= 224) {
          const districtConnector = secondaryIntersection;
          const connectorStart = Math.max(prefersHorizontalBackbone ? gridTop : gridLeft, (prefersHorizontalBackbone ? roadY : roadX) - 32);
          const connectorEnd = Math.min((prefersHorizontalBackbone ? gridBottom : gridRight) - 32, (prefersHorizontalBackbone ? roadY : roadX) + 128);
          if (Math.abs(districtConnector - primaryIntersection) >= 64) {
            for (let offset = connectorStart; offset <= connectorEnd; offset += 32) {
              if (prefersHorizontalBackbone) {
                addVerticalRoad(
                  districtConnector,
                  offset,
                  offset === roadY ? "t-junction" : offset === connectorEnd ? "dead-end" : "straight",
                  offset === roadY ? "District T junction" : offset === connectorEnd ? "Road terminus" : "Local district road",
                );
              } else {
                addHorizontalRoad(
                  offset,
                  districtConnector,
                  offset === roadX ? "t-junction" : offset === connectorEnd ? "dead-end" : "straight",
                  offset === roadX ? "District T junction" : offset === connectorEnd ? "Road terminus" : "Local district road",
                );
              }
            }
          }
        }

        if (roadSystem !== "minimal" && hasIndustrial) {
          if (prefersHorizontalBackbone) {
            addVerticalRoad(Math.min(gridRight - 32, mainRoadEnd), Math.min(gridBottom - 32, roadY + 32), "dead-end", "Industrial access road");
          } else {
            addHorizontalRoad(Math.min(gridRight - 32, roadX + 32), Math.min(gridBottom - 32, mainRoadEnd), "dead-end", "Industrial access road");
          }
        }

        addRoadModule(Math.max(gridLeft, roadX - 32), Math.max(gridTop, roadY - 32), "plaza", "Public plaza");
      }
      notes.push(compactCity ? "Compact streets serve the owned buildings without forcing a loop" : "Road network planned first as city blocks and districts");
      decisionNotes.push(
        prefersHorizontalBackbone
          ? "Decision: Built a horizontal boulevard as the city backbone"
          : "Decision: Built a vertical avenue as the city backbone",
      );
      if (roadPieces.some((piece) => piece.width === 16 || piece.depth === 16)) {
        decisionNotes.push("Decision: Used compact 16x16 roads to close awkward gaps");
      }
      const normalizedRoads = normaliseRoadTiles(roadPieces);
      roadPieces.splice(0, roadPieces.length, ...normalizedRoads);
      const generatedRoadMismatches = roadMismatchMessages(roadPieces);
      if (generatedRoadMismatches.length > 0) notes.push(...generatedRoadMismatches);
      else decisionNotes.push("Decision: Aligned road tile openings to neighbouring road edges");
    }
    occupiedRects.push(...roadPieces.map((piece) => ({ x: piece.x, y: piece.y, width: piece.width, depth: piece.depth })));

    type Candidate = {
      x: number;
      y: number;
      frontSide: FrontSide;
      rotation: Piece["rotation"];
      placement: PreferredPlacement;
      streetRole: "main-street" | "side-street" | "corner" | "plaza" | "district-edge";
      district?: DistrictKind;
      blockId?: string;
    };

    type CityBlock = {
      id: string;
      x: number;
      y: number;
      width: number;
      depth: number;
      district: DistrictKind;
    };

    const blockDistrictOrder = Array.from(
      new Set<DistrictKind>([
        ...(Object.keys(districtGroups) as DistrictKind[]),
        "retail",
        "restaurant",
        "civic",
        "residential",
        "park",
        "mixed",
      ]),
    );
    const xCuts = new Set<number>([gridLeft, gridRight]);
    const yCuts = new Set<number>([gridTop, gridBottom]);
    usableSections.forEach((section) => {
      xCuts.add(clamp(section.x, gridLeft, gridRight));
      xCuts.add(clamp(section.x + section.widthStuds, gridLeft, gridRight));
      yCuts.add(clamp(section.y, gridTop, gridBottom));
      yCuts.add(clamp(section.y + section.depthStuds, gridTop, gridBottom));
    });
    layoutGeometry.blockedZones.forEach((section) => {
      xCuts.add(clamp(section.x, gridLeft, gridRight));
      xCuts.add(clamp(section.x + section.widthStuds, gridLeft, gridRight));
      yCuts.add(clamp(section.y, gridTop, gridBottom));
      yCuts.add(clamp(section.y + section.depthStuds, gridTop, gridBottom));
    });
    roadPieces.forEach((road) => {
      if (road.roadKind === "plaza" || road.roadKind === "alley") return;
      if (road.rotation === 90 || road.rotation === 270) {
        xCuts.add(clamp(road.x, gridLeft, gridRight));
        xCuts.add(clamp(road.x + road.width, gridLeft, gridRight));
      } else {
        yCuts.add(clamp(road.y, gridTop, gridBottom));
        yCuts.add(clamp(road.y + road.depth, gridTop, gridBottom));
      }
    });
    const sortedXCuts = Array.from(xCuts).sort((a, b) => a - b);
    const sortedYCuts = Array.from(yCuts).sort((a, b) => a - b);
    const cityBlocks: CityBlock[] = [];
    for (let yi = 0; yi < sortedYCuts.length - 1; yi += 1) {
      for (let xi = 0; xi < sortedXCuts.length - 1; xi += 1) {
        const rect = {
          x: sortedXCuts[xi],
          y: sortedYCuts[yi],
          width: sortedXCuts[xi + 1] - sortedXCuts[xi],
          depth: sortedYCuts[yi + 1] - sortedYCuts[yi],
        };
        if (rect.width < 32 || rect.depth < 32) continue;
        if (layoutGeometry.blockedZones.some((blocked) => rectsOverlap(rect, zoneToRect(blocked)))) continue;
        if (!isBuildablySupported(rect, overhangPolicy.minSupport)) continue;
        if (roadPieces.some((road) => rectsOverlap(rect, road))) continue;
        cityBlocks.push({
          ...rect,
          id: `block-${cityBlocks.length + 1}`,
          district: "mixed",
        });
      }
    }
    cityBlocks
      .sort((a, b) => b.width * b.depth - a.width * a.depth)
      .forEach((block, index) => {
        block.district = blockDistrictOrder[index % blockDistrictOrder.length];
      });
    decisionNotes.push(`Decision: Divided the table into ${cityBlocks.length} city blocks before placing buildings`);

    const blockTouchesRoad = (block: CityBlock, side: FrontSide) =>
      roadPieces.some((road) => {
        const horizontalOverlap = block.x < road.x + road.width && block.x + block.width > road.x;
        const verticalOverlap = block.y < road.y + road.depth && block.y + block.depth > road.y;
        if (side === "north") return horizontalOverlap && block.y === road.y + road.depth;
        if (side === "south") return horizontalOverlap && block.y + block.depth === road.y;
        if (side === "west") return verticalOverlap && block.x === road.x + road.width;
        return verticalOverlap && block.x + block.width === road.x;
      });

    const candidates: Candidate[] = [];
    const candidateEndX = Math.min(cityZone.x + cityZone.widthStuds - 32, districtX + districtWidth);
    const candidateEndY = Math.min(cityZone.y + cityZone.depthStuds - 32, districtY + districtDepth);
    const sectionForCandidate = (candidate: Candidate): "back" | "left" | "right" | "main" | "arm" | "other" => {
      const center = { x: candidate.x + 16, y: candidate.y + 16 };
      const section = layoutGeometry.tableSections.find(
        (item) =>
          center.x >= item.x &&
          center.x <= item.x + item.widthStuds &&
          center.y >= item.y &&
          center.y <= item.y + item.depthStuds,
      );
      if (!section) return "other";
      if (section.id === "u-back") return "back";
      if (section.id === "u-left-arm") return "left";
      if (section.id === "u-right-arm") return "right";
      if (section.id === "rectangle-main") return "main";
      if (section.id === "l-arm") return "arm";
      return "other";
    };
    const addCandidateVariants = (candidate: Omit<Candidate, "district">, preferredDistrict: DistrictKind) => {
      const districts = Array.from(new Set<DistrictKind>([preferredDistrict, ...blockDistrictOrder, "mixed"]));
      districts.forEach((district) => candidates.push({ ...candidate, district }));
    };
    cityBlocks.forEach((block) => {
      const northRoad = blockTouchesRoad(block, "north");
      const southRoad = blockTouchesRoad(block, "south");
      const westRoad = blockTouchesRoad(block, "west");
      const eastRoad = blockTouchesRoad(block, "east");
      const blockPlacement = block.district === "park" ? "park-facing" : wantsRoads ? "road-facing" : "plaza-facing";
      for (let x = block.x; x <= block.x + block.width - 16; x += 16) {
        if (northRoad || !wantsRoads) {
          candidates.push({ x, y: block.y, frontSide: "north", rotation: 180, placement: blockPlacement, streetRole: "district-edge", district: block.district, blockId: block.id });
        }
        if (southRoad || !wantsRoads) {
          const y32 = Math.max(block.y, block.y + block.depth - 32);
          const y48 = Math.max(block.y, block.y + block.depth - 48);
          candidates.push({ x, y: y32, frontSide: "south", rotation: 0, placement: blockPlacement, streetRole: "district-edge", district: block.district, blockId: block.id });
          if (y48 !== y32) candidates.push({ x, y: y48, frontSide: "south", rotation: 0, placement: blockPlacement, streetRole: "district-edge", district: block.district, blockId: block.id });
        }
      }
      for (let y = block.y; y <= block.y + block.depth - 16; y += 16) {
        if (westRoad || !wantsRoads) {
          candidates.push({ x: block.x, y, frontSide: "west", rotation: 270, placement: blockPlacement, streetRole: "district-edge", district: block.district, blockId: block.id });
        }
        if (eastRoad || !wantsRoads) {
          const x32 = Math.max(block.x, block.x + block.width - 32);
          const x48 = Math.max(block.x, block.x + block.width - 48);
          candidates.push({ x: x32, y, frontSide: "east", rotation: 90, placement: blockPlacement, streetRole: "district-edge", district: block.district, blockId: block.id });
          if (x48 !== x32) candidates.push({ x: x48, y, frontSide: "east", rotation: 90, placement: blockPlacement, streetRole: "district-edge", district: block.district, blockId: block.id });
        }
      }
      if (northRoad && westRoad) candidates.push({ x: block.x, y: block.y, frontSide: "north", rotation: 180, placement: "corner", streetRole: "corner", district: block.district, blockId: block.id });
      if (northRoad && eastRoad) candidates.push({ x: Math.max(block.x, block.x + block.width - 32), y: block.y, frontSide: "east", rotation: 90, placement: "corner", streetRole: "corner", district: block.district, blockId: block.id });
      if (southRoad && westRoad) candidates.push({ x: block.x, y: Math.max(block.y, block.y + block.depth - 32), frontSide: "west", rotation: 270, placement: "corner", streetRole: "corner", district: block.district, blockId: block.id });
      if (southRoad && eastRoad) candidates.push({ x: Math.max(block.x, block.x + block.width - 32), y: Math.max(block.y, block.y + block.depth - 32), frontSide: "south", rotation: 0, placement: "corner", streetRole: "corner", district: block.district, blockId: block.id });
    });
    if (layoutShape === "l-shape") {
      const mainSection = layoutGeometry.tableSections.find((section) => section.id === "rectangle-main") ?? layoutGeometry.tableSections[0];
      const armSection = layoutGeometry.tableSections.find((section) => section.id === "l-arm") ?? layoutGeometry.tableSections[1];
      const mainRoadY = Math.floor((mainSection.y + mainSection.depthStuds * 0.55) / 32) * 32;
      const useCompactArmRoad = armSection.widthStuds < 64;
      const armRoadX = useCompactArmRoad
        ? Math.max(armSection.x, armSection.x + armSection.widthStuds - 16)
        : Math.floor((armSection.x + Math.max(0, armSection.widthStuds - 32) / 2) / SNAP_STUDS) * SNAP_STUDS;
      for (let x = mainSection.x; x <= mainSection.x + mainSection.widthStuds - 32; x += 16) {
        addCandidateVariants({ x, y: Math.max(mainSection.y, mainRoadY - 32), frontSide: "south", rotation: 0, placement: "road-facing", streetRole: "main-street" }, "retail");
      }
      for (let y = armSection.y; y <= armSection.y + armSection.depthStuds - 32; y += 16) {
        addCandidateVariants({ x: Math.max(armSection.x, armRoadX - 32), y, frontSide: "east", rotation: 270, placement: "road-facing", streetRole: "side-street" }, "residential");
      }
    }
    if (layoutShape === "u-shape") {
      const back = layoutGeometry.tableSections.find((section) => section.id === "u-back") ?? layoutGeometry.tableSections[0];
      const left = layoutGeometry.tableSections.find((section) => section.id === "u-left-arm") ?? layoutGeometry.tableSections[1];
      const right = layoutGeometry.tableSections.find((section) => section.id === "u-right-arm") ?? layoutGeometry.tableSections[2];
      const backRoadY = back.depthStuds < 64
        ? Math.max(back.y, back.y + back.depthStuds - 16)
        : Math.max(back.y, Math.floor((back.y + back.depthStuds - 32) / 32) * 32);
      const leftRoadX = left.widthStuds < 64
        ? Math.max(left.x, left.x + left.widthStuds - 16)
        : Math.max(left.x, Math.floor((left.x + left.widthStuds - 32) / SNAP_STUDS) * SNAP_STUDS);
      const rightRoadX = Math.ceil(right.x / SNAP_STUDS) * SNAP_STUDS;
      const rightRoadWidth = right.widthStuds < 64 ? 16 : 32;
      for (let x = back.x; x <= back.x + back.widthStuds - 32; x += 16) {
        addCandidateVariants({ x, y: Math.max(back.y, backRoadY - 32), frontSide: "south", rotation: 0, placement: "road-facing", streetRole: "main-street" }, "civic");
      }
      for (let y = left.y; y <= left.y + left.depthStuds - 32; y += 16) {
        addCandidateVariants({ x: Math.max(left.x, leftRoadX - 32), y, frontSide: "east", rotation: 270, placement: "road-facing", streetRole: "side-street" }, "residential");
      }
      for (let y = right.y; y <= right.y + right.depthStuds - 32; y += 16) {
        addCandidateVariants({ x: Math.min(right.x + right.widthStuds - 32, rightRoadX + rightRoadWidth), y, frontSide: "west", rotation: 90, placement: "road-facing", streetRole: "side-street" }, "restaurant");
      }
    }
    if (overhangPolicy.maxDistance > 0) {
      const limit = overhangPolicy.maxDistance;
      for (let x = cityZone.x - limit; x <= cityZone.x + cityZone.widthStuds - 32 + limit; x += 16) {
        candidates.push({ x, y: cityZone.y - limit, frontSide: "north", rotation: 180, placement: wantsRoads ? "road-facing" : "plaza-facing", streetRole: "district-edge", district: "mixed" });
        candidates.push({ x, y: cityZone.y + cityZone.depthStuds - 32 + limit, frontSide: "south", rotation: 0, placement: wantsRoads ? "road-facing" : "plaza-facing", streetRole: "district-edge", district: "mixed" });
      }
      for (let y = cityZone.y - limit; y <= cityZone.y + cityZone.depthStuds - 32 + limit; y += 16) {
        candidates.push({ x: cityZone.x - limit, y, frontSide: "west", rotation: 270, placement: wantsRoads ? "road-facing" : "plaza-facing", streetRole: "district-edge", district: "mixed" });
        candidates.push({ x: cityZone.x + cityZone.widthStuds - 32 + limit, y, frontSide: "east", rotation: 90, placement: wantsRoads ? "road-facing" : "plaza-facing", streetRole: "district-edge", district: "mixed" });
      }
    }
    candidates.push(
      { x: roadX - 32, y: roadY - 32, frontSide: "south", rotation: 0, placement: "corner", streetRole: "corner" },
      { x: roadX + 32, y: roadY - 32, frontSide: "west", rotation: 90, placement: "corner", streetRole: "corner" },
      { x: roadX - 32, y: roadY + 32, frontSide: "east", rotation: 270, placement: "corner", streetRole: "corner" },
      { x: roadX + 32, y: roadY + 32, frontSide: "north", rotation: 180, placement: "corner", streetRole: "corner" },
      { x: Math.max(cityZone.x, roadX - 32), y: Math.max(cityZone.y, roadY - 64), frontSide: "south", rotation: 0, placement: "plaza-facing", streetRole: "plaza" },
    );

    let placedBuildings: Piece[] = [];
    const sortedBuildings = [...ownedBuildings].sort((a, b) => {
      const rank = (piece: Piece) => (piece.modularType === "corner" ? 0 : piece.modularType === "end" ? 1 : 2);
      return rank(a) - rank(b);
    });

    const scorePlacement = (building: Piece, candidate: Candidate, activePlacedBuildings: Piece[], activeOccupiedRects: Array<{ x: number; y: number; width: number; depth: number }>) => {
      const rect = { x: candidate.x, y: candidate.y, width: building.width, depth: building.depth };
      let candidateScore = 0;
      const buildingDistrict = districtForPiece(building);
      const candidateSection = sectionForCandidate(candidate);
      if (layoutShape === "u-shape") {
        if (candidateSection === "back" && (buildingDistrict === "civic" || buildingDistrict === "retail" || building.modularType === "landmark")) candidateScore += 90;
        if (candidateSection === "left" && (buildingDistrict === "residential" || buildingDistrict === "retail" || buildingDistrict === "restaurant")) candidateScore += 80;
        if (candidateSection === "right" && (buildingDistrict === "residential" || buildingDistrict === "civic" || buildingDistrict === "restaurant")) candidateScore += 80;
      }
      const candidateBlock = candidate.blockId ? cityBlocks.find((block) => block.id === candidate.blockId) : undefined;
      if (candidateBlock) {
        const insideBlock =
          rect.x >= candidateBlock.x &&
          rect.y >= candidateBlock.y &&
          rect.x + rect.width <= candidateBlock.x + candidateBlock.width &&
          rect.y + rect.depth <= candidateBlock.y + candidateBlock.depth;
        candidateScore += insideBlock ? 35 : -220;
      }
      if (candidate.district === buildingDistrict) candidateScore += 115;
      else if (candidate.district && candidate.district !== "mixed") candidateScore -= 35;
      if (candidate.placement === "road-facing") candidateScore += wantsRoads ? 85 : 20;
      if (candidate.placement === "park-facing" && (building.category === "park" || building.modularType === "freestanding" || building.modularType === "landmark")) candidateScore += 35;
      if (candidate.placement === "plaza-facing") candidateScore += 45;
      if (building.modularType === "corner" && candidate.placement === "corner") candidateScore += 120;
      if (building.modularType === "straight" && candidate.placement === "road-facing") candidateScore += 70;
      if (building.modularType === "end" && (candidate.streetRole === "district-edge" || candidate.x <= districtX + 16 || candidate.x + building.width >= candidateEndX - 16)) candidateScore += 55;
      if (building.modularType === "freestanding" && (candidate.placement === "plaza-facing" || building.category === "park")) candidateScore += 40;
      if (activePlacedBuildings.some((piece) => piece.category === building.category && Math.abs(piece.x - candidate.x) <= 64 && Math.abs(piece.y - candidate.y) <= 64)) {
        candidateScore += 30;
      }
      if (candidate.x + building.width < cityZone.x + cityZone.widthStuds - 32 && candidate.y + building.depth < cityZone.y + cityZone.depthStuds - 32) {
        candidateScore += 25;
      }
      const compactness = candidate.district ? 0 : Math.abs(candidate.x - districtX) + Math.abs(candidate.y - roadY);
      candidateScore -= compactness * 0.04;
      const supportRatio = supportedAreaRatio(rect);
      if (!isBuildablySupported({ ...rect, modularType: building.modularType }, building.modularType === "corner" ? 0.75 : overhangPolicy.minSupport)) candidateScore -= 1000;
      else if (supportRatio < 1) candidateScore -= supportRatio < 0.75 ? 80 : 18;
      if (activePlacedBuildings.some((piece) => rectsOverlap(rect, piece))) candidateScore -= 1000;
      if (activeOccupiedRects.some((piece) => rectsOverlap(rect, piece))) candidateScore -= 1000;
      if (trainFootprintRects.some((piece) => rectsOverlap(rect, piece))) candidateScore -= 1000;
      if (trainClearanceRects.some((piece) => rectsOverlap(rect, piece))) candidateScore -= 700;
      if (wantsRoads && rotateSide(candidate.frontSide, 180) === "south" && candidate.y < roadY) candidateScore -= 80;
      if (building.modularType === "corner" && candidate.placement !== "corner") candidateScore -= 120;
      if (building.modularType === "straight" && candidate.placement === "corner") candidateScore -= 20;
      if (!candidate.district) {
        const anchor = districtAnchors[districtForPiece(building)];
        candidateScore -= (Math.abs(candidate.x - anchor.x) + Math.abs(candidate.y - anchor.y)) * 0.16;
      }
      return candidateScore;
    };

    const placeOwnedBuildings = () => {
      const nextPlacedBuildings: Piece[] = [];
      const nextOccupiedRects = roadPieces.map((piece) => ({ x: piece.x, y: piece.y, width: piece.width, depth: piece.depth }));
      let nextScore = 0;
      const sectionCounts = { back: 0, left: 0, right: 0 };
      const uSectionCapacity = {
        back: Math.max(1, Math.ceil(ownedBuildings.length * 0.4)),
        left: Math.max(1, Math.ceil(ownedBuildings.length * 0.35)),
        right: Math.max(1, Math.ceil(ownedBuildings.length * 0.35)),
      };
      const preferredUSectionsForBuilding = (building: Piece): Array<"back" | "left" | "right"> => {
        const district = districtForPiece(building);
        if (district === "civic" || building.modularType === "landmark") return ["back", "right", "left"];
        if (district === "retail") return ["back", "left", "right"];
        if (district === "restaurant") return ["left", "right", "back"];
        if (district === "residential") return ["left", "right", "back"];
        return ["back", "left", "right"];
      };
      const orderedBuildings = layoutShape === "u-shape"
        ? [...sortedBuildings].sort((a, b) => {
            const rank = (piece: Piece) => {
              const district = districtForPiece(piece);
              if (piece.modularType === "corner") return 0;
              if (district === "civic" || piece.modularType === "landmark") return 1;
              if (district === "retail") return 2;
              if (district === "restaurant") return 3;
              if (district === "residential") return 4;
              return 5;
            };
            return rank(a) - rank(b);
          })
        : sortedBuildings;
      orderedBuildings.forEach((building) => {
        const preferredSections = preferredUSectionsForBuilding(building);
        const candidatePool = layoutShape === "u-shape"
          ? [
              ...preferredSections.flatMap((section) =>
                candidates.filter((candidate) => sectionForCandidate(candidate) === section && sectionCounts[section] < uSectionCapacity[section]),
              ),
              ...preferredSections.flatMap((section) =>
                candidates.filter((candidate) => sectionForCandidate(candidate) === section),
              ),
              ...candidates,
            ]
          : candidates;
        const best = candidatePool
          .map((candidate) => {
            const section = sectionForCandidate(candidate);
            const quotaBonus =
              layoutShape === "u-shape" && (section === "back" || section === "left" || section === "right") && sectionCounts[section] < uSectionCapacity[section]
                ? 75
                : 0;
            const overQuotaPenalty =
              layoutShape === "u-shape" && (section === "back" || section === "left" || section === "right") && sectionCounts[section] >= uSectionCapacity[section]
                ? 80
                : 0;
            return {
              candidate,
              score: scorePlacement(building, candidate, nextPlacedBuildings, nextOccupiedRects) + quotaBonus - overQuotaPenalty,
            };
          })
          .sort((a, b) => b.score - a.score)[0];
        if (!best || best.score < -100) return;
        nextScore += Math.max(0, best.score);
        const bestSection = sectionForCandidate(best.candidate);
        if (bestSection === "back" || bestSection === "left" || bestSection === "right") sectionCounts[bestSection] += 1;
        nextPlacedBuildings.push({
          ...building,
          x: best.candidate.x,
          y: best.candidate.y,
          rotation: best.candidate.rotation,
          frontSide: best.candidate.frontSide,
        });
        nextOccupiedRects.push({ x: best.candidate.x, y: best.candidate.y, width: building.width, depth: building.depth });
      });
      return { nextPlacedBuildings, nextOccupiedRects, nextScore };
    };

    let placementAttempt = placeOwnedBuildings();
    if (placementAttempt.nextPlacedBuildings.length < ownedBuildings.length && roadPieces.length > 0) {
      const beforeRoadCount = roadPieces.length;
      const essentialRoadNames = new Set(["Main boulevard", "District junction"]);
      for (let index = roadPieces.length - 1; index >= 0; index -= 1) {
        const road = roadPieces[index];
        if (
          road.roadKind === "plaza" ||
          road.name.includes("Local") ||
          road.name.includes("Industrial") ||
          road.name.includes("Compact")
        ) {
          roadPieces.splice(index, 1);
        }
      }
      placementAttempt = placeOwnedBuildings();
      if (placementAttempt.nextPlacedBuildings.length < ownedBuildings.length) {
        for (let index = roadPieces.length - 1; index >= 0; index -= 1) {
          const road = roadPieces[index];
          if (!essentialRoadNames.has(road.name)) roadPieces.splice(index, 1);
        }
        placementAttempt = placeOwnedBuildings();
      }
      if (placementAttempt.nextPlacedBuildings.length < ownedBuildings.length) {
        roadPieces.splice(0, roadPieces.length);
        placementAttempt = placeOwnedBuildings();
      }
      if (roadPieces.length < beforeRoadCount) {
        notes.push("Road layout reduced so selected buildings could take priority");
        decisionNotes.push("Decision: Adjusted roads around the owned building collection");
      }
    }

    placedBuildings = placementAttempt.nextPlacedBuildings;
    occupiedRects.splice(0, occupiedRects.length, ...placementAttempt.nextOccupiedRects);
    score += placementAttempt.nextScore;
    const placedDistricts = placedBuildings.reduce((groups, building) => {
      const district = districtForPiece(building);
      groups[district] = [...(groups[district] ?? []), building];
      return groups;
    }, {} as Partial<Record<DistrictKind, Piece[]>>);
    Object.entries(placedDistricts).forEach(([district, buildings]) => {
      if ((buildings?.length ?? 0) > 1) {
        decisionNotes.push(`Decision: Grouped ${buildings?.length} ${districtLabels[district as DistrictKind].replace(" District", "").replace(" Quarter", "")} buildings together`);
      }
    });

    const roadTouchesSide = (
      rect: { x: number; y: number; width: number; depth: number },
      side: FrontSide,
    ) =>
      roadPieces.some((road) => {
        const horizontalOverlap = rect.x < road.x + road.width && rect.x + rect.width > road.x;
        const verticalOverlap = rect.y < road.y + road.depth && rect.y + rect.depth > road.y;
        if (side === "north") return horizontalOverlap && rect.y === road.y + road.depth;
        if (side === "south") return horizontalOverlap && rect.y + rect.depth === road.y;
        if (side === "west") return verticalOverlap && rect.x === road.x + road.width;
        return verticalOverlap && rect.x + rect.width === road.x;
      });

    const roadFacingSide = (rect: { x: number; y: number; width: number; depth: number }): FrontSide | null =>
      (["south", "north", "east", "west"] as FrontSide[]).find((side) => roadTouchesSide(rect, side)) ?? null;

    const sideCoverageRatio = (
      rect: { x: number; y: number; width: number; depth: number },
      side: FrontSide,
      accessPieces: Piece[],
    ) => {
      const sideLength = side === "north" || side === "south" ? rect.width : rect.depth;
      const intervals = accessPieces
        .map((access) => {
          const touches =
            side === "north"
              ? rect.y === access.y + access.depth
              : side === "south"
                ? rect.y + rect.depth === access.y
                : side === "west"
                  ? rect.x === access.x + access.width
                  : rect.x + rect.width === access.x;
          if (!touches) return null;
          if (side === "north" || side === "south") {
            const start = Math.max(rect.x, access.x);
            const end = Math.min(rect.x + rect.width, access.x + access.width);
            return end > start ? [start - rect.x, end - rect.x] : null;
          }
          const start = Math.max(rect.y, access.y);
          const end = Math.min(rect.y + rect.depth, access.y + access.depth);
          return end > start ? [start - rect.y, end - rect.y] : null;
        })
        .filter(Boolean) as Array<[number, number]>;
      if (intervals.length === 0) return 0;
      intervals.sort((a, b) => a[0] - b[0]);
      const merged = intervals.reduce<Array<[number, number]>>((ranges, interval) => {
        const last = ranges[ranges.length - 1];
        if (!last || interval[0] > last[1]) ranges.push([...interval]);
        else last[1] = Math.max(last[1], interval[1]);
        return ranges;
      }, []);
      const covered = merged.reduce((sum, [start, end]) => sum + end - start, 0);
      return covered / Math.max(1, sideLength);
    };

    const roadAccessPieces = () => roadPieces.filter((piece) => piece.type === "road" && piece.roadKind !== "plaza" && piece.roadKind !== "alley");
    const publicAccessPieces = () => roadPieces.filter((piece) => piece.type === "road");
    const fullRoadFacingSide = (rect: { x: number; y: number; width: number; depth: number }): FrontSide | null =>
      (["south", "north", "east", "west"] as FrontSide[]).find((side) => sideCoverageRatio(rect, side, roadAccessPieces()) >= 0.98) ?? null;
    const publicAccessSide = (rect: { x: number; y: number; width: number; depth: number }): FrontSide | null =>
      (["south", "north", "east", "west"] as FrontSide[]).find((side) => sideCoverageRatio(rect, side, publicAccessPieces()) >= 0.5) ?? null;

    const isRoadCornerPlot = (rect: { x: number; y: number; width: number; depth: number }) => {
      const accessPieces = roadAccessPieces();
      const northOrSouth = sideCoverageRatio(rect, "north", accessPieces) >= 0.98 || sideCoverageRatio(rect, "south", accessPieces) >= 0.98;
      const eastOrWest = sideCoverageRatio(rect, "east", accessPieces) >= 0.98 || sideCoverageRatio(rect, "west", accessPieces) >= 0.98;
      return northOrSouth && eastOrWest;
    };
    const districtForPoint = (rect: { x: number; y: number; width: number; depth: number }): DistrictKind => {
      const center = { x: rect.x + rect.width / 2, y: rect.y + rect.depth / 2 };
      const containingBlock = cityBlocks.find(
        (block) =>
          center.x >= block.x &&
          center.x <= block.x + block.width &&
          center.y >= block.y &&
          center.y <= block.y + block.depth,
      );
      if (containingBlock) return containingBlock.district;
      return (Object.entries(districtAnchors) as Array<[DistrictKind, { x: number; y: number }]>)
        .sort(([, a], [, b]) =>
          Math.abs(center.x - a.x) + Math.abs(center.y - a.y) -
          (Math.abs(center.x - b.x) + Math.abs(center.y - b.y)),
        )[0][0];
    };

    const rotationForFrontSide = (side: FrontSide): 0 | 90 | 180 | 270 => {
      if (side === "east") return 90;
      if (side === "north") return 180;
      if (side === "west") return 270;
      return 0;
    };

    const rescueUnplacedOwnedBuildings = () => {
      const placedIds = new Set(placedBuildings.map((piece) => piece.id));
      const remainingOwned = ownedBuildings
        .filter((building) => !placedIds.has(building.id))
        .sort((a, b) => {
          if (a.modularType === "corner" && b.modularType !== "corner") return -1;
          if (a.modularType !== "corner" && b.modularType === "corner") return 1;
          return b.width * b.depth - a.width * a.depth;
        });
      if (remainingOwned.length === 0) return 0;

      let rescuedCount = 0;
      remainingOwned.forEach((building) => {
        let best:
          | {
              rect: { x: number; y: number; width: number; depth: number };
              frontSide: FrontSide;
              score: number;
            }
          | null = null;
        const overhangLimit = overhangPolicy.maxDistance;
        for (let y = gridTop - overhangLimit; y <= gridBottom - building.depth + overhangLimit; y += 16) {
          for (let x = gridLeft - overhangLimit; x <= gridRight - building.width + overhangLimit; x += 16) {
            const rect = { x, y, width: building.width, depth: building.depth };
            if (!placementAllowed(rect, building.modularType === "corner" ? 0.75 : overhangPolicy.minSupport)) continue;
            if (occupiedRects.some((piece) => rectsOverlap(rect, piece))) continue;
            if (trainClearanceRects.some((piece) => rectsOverlap(rect, piece))) continue;
            if (trainFootprintRects.some((piece) => rectsOverlap(rect, piece))) continue;

            const fullRoadSide = fullRoadFacingSide(rect);
            const publicSide = publicAccessSide(rect);
            const roadCorner = isRoadCornerPlot(rect);
            const district = districtForPoint(rect);
            const anchor = districtAnchors[districtForPiece(building)];
            const supportRatio = supportedAreaRatio(rect);
            const center = { x: rect.x + rect.width / 2, y: rect.y + rect.depth / 2 };
            const section = layoutGeometry.tableSections.find(
              (item) =>
                center.x >= item.x &&
                center.x <= item.x + item.widthStuds &&
                center.y >= item.y &&
                center.y <= item.y + item.depthStuds,
            );
            let candidateScore = 0;

            if (fullRoadSide) candidateScore += 180;
            else if (publicSide) candidateScore += 95;
            else candidateScore -= wantsRoads ? 60 : 10;
            if (building.modularType === "corner") candidateScore += roadCorner ? 240 : -60;
            if (building.modularType === "straight") candidateScore += fullRoadSide ? 120 : -40;
            if (building.modularType === "landmark" || building.modularType === "freestanding") candidateScore += publicSide ? 60 : 0;
            if (district === districtForPiece(building)) candidateScore += 70;
            if (supportRatio >= 1) candidateScore += 30;
            else if (supportRatio >= 0.75) candidateScore += 10;
            if (layoutShape === "u-shape" && section?.id.startsWith("u-")) candidateScore += 45;
            candidateScore -= (Math.abs(rect.x - anchor.x) + Math.abs(rect.y - anchor.y)) * 0.04;

            if (!best || candidateScore > best.score) {
              best = {
                rect,
                frontSide: fullRoadSide ?? publicSide ?? building.frontSide ?? "south",
                score: candidateScore,
              };
            }
          }
        }

        if (!best || best.score < -160) return;
        placedBuildings.push({
          ...building,
          x: best.rect.x,
          y: best.rect.y,
          frontSide: best.frontSide,
          rotation: rotationForFrontSide(best.frontSide),
        });
        occupiedRects.push(best.rect);
        placedIds.add(building.id);
        rescuedCount += 1;
      });

      if (rescuedCount > 0) {
        decisionNotes.push(`Decision: Filled ${rescuedCount} empty buildable plots with owned buildings before future expansion`);
      }
      return rescuedCount;
    };

    rescueUnplacedOwnedBuildings();

    const allOwnedBuildingsPlaced = placedBuildings.length >= ownedBuildings.length;
    if (!allOwnedBuildingsPlaced) {
      notes.push("Future expansion plots held back until the selected buildings are placed");
    }

    const contextualFutureName = (district: DistrictKind, fallback: string) => {
      if (fallback.includes("Corner")) return "Future Corner Modular 32x32";
      if (fallback.includes("16x32")) return "Future Straight Modular 16x32";
      if (fallback.includes("32x16")) return "Future Straight Modular 32x16";
      if (fallback.includes("Straight")) return "Future Straight Modular 32x32";
      if (district === "park") return "Community Space";
      return fallback;
    };

    const futurePlotName = (rect: { x: number; y: number; width: number; depth: number }) => {
      const facesRoad = Boolean(fullRoadFacingSide(rect));
      if (rect.width === 16 && rect.depth === 16) return "Detail Area 16x16";
      if (rect.width === 8 && rect.depth === 16) return "Detail Area 8x16";
      if (rect.width === 16 && rect.depth === 8) return "Detail Area 16x8";
      if (isRoadCornerPlot(rect)) return "Future Corner Modular 32x32";
      if (facesRoad && rect.width === 16 && rect.depth === 32) return "Future Straight Modular 16x32";
      if (facesRoad && rect.width === 32 && rect.depth === 16) return "Future Straight Modular 32x16";
      if (facesRoad) return "Future Straight Modular 32x32";
      return "Community Space";
    };

    const makeFutureZone = (name: string, width: number, depth: number, x: number, y: number): Piece | null => {
      const rect = { x, y, width, depth };
      const validModules = new Set(["8x16", "16x8", "16x16", "16x32", "32x16", "32x32", "48x32", "32x48", "48x48", "64x32", "32x64"]);
      if (!validModules.has(`${width}x${depth}`)) return null;
      if (x % SNAP_STUDS !== 0 || y % SNAP_STUDS !== 0 || width % SNAP_STUDS !== 0 || depth % SNAP_STUDS !== 0) return null;
      const isDetailArea = name.includes("Detail Area");
      if (!isDetailArea && (x % 16 !== 0 || y % 16 !== 0)) return null;
      const fullRoadSide = fullRoadFacingSide(rect);
      const accessSide = publicAccessSide(rect);
      const frontSide = fullRoadSide ?? accessSide ?? "south";
      const isPublicSpace = isDetailArea || name.includes("Park") || name.includes("Plaza") || name.includes("Market") || name.includes("Community") || name.includes("Playground") || name.includes("Outdoor Seating") || name.includes("Construction") || name.includes("Car Park") || name.includes("Waterfront");
      const containingBlock = cityBlocks.find(
        (block) =>
          rect.x >= block.x &&
          rect.y >= block.y &&
          rect.x + rect.width <= block.x + block.width &&
          rect.y + rect.depth <= block.y + block.depth,
      );
      if (!accessSide && !fullRoadSide) return null;
      if (wantsRoads && name.includes("Corner Modular") && !isRoadCornerPlot(rect)) return null;
      if (
        wantsRoads &&
        (name.includes("Straight Modular") || name.includes("16x32 Modular") || name.includes("32x16 Modular")) &&
        !fullRoadSide
      ) {
        return null;
      }
      const minimumSupport = isPublicSpace ? 0.5 : 0.75;
      const modularType: ModularType = name.includes("Corner")
        ? "corner"
        : name.includes("Straight") || name.includes("16x32") || name.includes("32x16")
          ? "straight"
          : "freestanding";
      const district = containingBlock?.district ?? districtForPoint(rect);
      const finalName =
        name === "Future Corner Modular 32x32" || name === "Future Straight Modular 32x32"
          ? contextualFutureName(district, name)
          : name === "Future 16x32 Modular"
            ? "Future Straight Modular 16x32"
            : name === "Future 32x16 Modular"
              ? "Future Straight Modular 32x16"
              : isDetailArea
                ? name
                : isPublicSpace
                  ? "Community Space"
                  : name;
      const future = withPieceModule({
        id: newId(),
        type: "future" as const,
        name: finalName,
        category: "Future" as const,
        width,
        depth,
        x,
        y,
        rotation: 0 as const,
        frontSide,
        preferredPlacement: isPublicSpace ? "park-facing" as const : "road-facing" as const,
        modularType,
        snapGroup: isDetailArea ? "detail" as const : "modular" as const,
        snapSize: isDetailArea ? 8 as const : 16 as const,
      });
      if (!isBuildablySupported({ ...rect, modularType }, minimumSupport)) return null;
      if (occupiedRects.some((piece) => rectsOverlap(rect, piece))) return null;
      occupiedRects.push(rect);
      return future;
    };

    const canOccupyInfillRect = (
      rect: { x: number; y: number; width: number; depth: number },
      minimum = overhangPolicy.minSupport,
      requireCityBlock = true,
    ) => {
      if (!placementAllowed(rect, minimum)) return false;
      if (occupiedRects.some((piece) => rectsOverlap(rect, piece))) return false;
      if (trainClearanceRects.some((piece) => rectsOverlap(rect, piece))) return false;
      if (trainFootprintRects.some((piece) => rectsOverlap(rect, piece))) return false;
      if (
        requireCityBlock &&
        cityBlocks.length > 0 &&
        !cityBlocks.some(
          (block) =>
            rect.x >= block.x &&
            rect.y >= block.y &&
            rect.x + rect.width <= block.x + block.width &&
            rect.y + rect.depth <= block.y + block.depth,
        )
      ) {
        return false;
      }
      return true;
    };

    const addInfillRoad = (rect: { x: number; y: number; width: number; depth: number }) => {
      if (!wantsRoads || !canOccupyInfillRect(rect, overhangPolicy.minSupport, false)) return null;
      const road: Piece = {
        id: newId(),
        type: "road",
        name: "Infill frontage road",
        category: "Road",
        width: rect.width,
        depth: rect.depth,
        x: rect.x,
        y: rect.y,
        rotation: rect.width >= rect.depth ? 90 : 0,
        roadKind: "straight",
        snapGroup: "road",
        snapSize: 16,
      };
      roadPieces.push(road);
      const normalisedRoads = normaliseRoadTiles(roadPieces);
      roadPieces.splice(0, roadPieces.length, ...normalisedRoads);
      occupiedRects.push(rect);
      return road;
    };

    const ensureFrontageForRect = (rect: { x: number; y: number; width: number; depth: number }) => {
      if (fullRoadFacingSide(rect) || publicAccessSide(rect)) return true;
      const roadOptions = [
        { x: rect.x, y: rect.y + rect.depth, width: Math.max(16, rect.width), depth: 16 },
        { x: rect.x, y: rect.y - 16, width: Math.max(16, rect.width), depth: 16 },
        { x: rect.x + rect.width, y: rect.y, width: 16, depth: Math.max(16, rect.depth) },
        { x: rect.x - 16, y: rect.y, width: 16, depth: Math.max(16, rect.depth) },
      ]
        .filter((road) => (road.width === 16 && road.depth === 16) || (road.width === 16 && road.depth === 32) || (road.width === 32 && road.depth === 16))
        .sort((a, b) => {
          const aBottomRight = a.x + a.y;
          const bBottomRight = b.x + b.y;
          return bBottomRight - aBottomRight;
        });
      return roadOptions.some((road) => {
        const roadCountBefore = roadPieces.length;
        const occupiedCountBefore = occupiedRects.length;
        const addedRoad = addInfillRoad(road);
        const createsFrontage = Boolean(addedRoad && (fullRoadFacingSide(rect) || publicAccessSide(rect)));
        if (!createsFrontage) {
          roadPieces.splice(roadCountBefore, roadPieces.length - roadCountBefore);
          occupiedRects.splice(occupiedCountBefore, occupiedRects.length - occupiedCountBefore);
          roadPieces.splice(0, roadPieces.length, ...normaliseRoadTiles(roadPieces));
        }
        return createsFrontage;
      });
    };

    const findOpenFutureSpot = (
      width: number,
      depth: number,
      preference: "right" | "bottom" | "near-road" | "train",
      accepts: (rect: { x: number; y: number; width: number; depth: number }) => boolean = () => true,
    ) => {
      const xValues: number[] = [];
      const yValues: number[] = [];
      const overhangLimit = overhangPolicy.maxDistance;
      for (let x = cityZone.x - overhangLimit; x <= cityZone.x + cityZone.widthStuds - width + overhangLimit; x += SNAP_STUDS) xValues.push(x);
      for (let y = cityZone.y - overhangLimit; y <= cityZone.y + cityZone.depthStuds - depth + overhangLimit; y += SNAP_STUDS) yValues.push(y);
      if (preference === "right") xValues.reverse();
      if (preference === "bottom" || preference === "train") yValues.reverse();
      if (preference === "near-road") {
        yValues.sort((a, b) => Math.abs(a - (roadY + 48)) - Math.abs(b - (roadY + 48)));
        xValues.sort((a, b) => Math.abs(a - roadX) - Math.abs(b - roadX));
      }

      for (const y of yValues) {
        for (const x of xValues) {
          const rect = { x, y, width, depth };
          if (!isBuildablySupported(rect, 0.5)) continue;
          if (occupiedRects.some((piece) => rectsOverlap(rect, piece))) continue;
          if (trainClearanceRects.some((piece) => rectsOverlap(rect, piece))) continue;
          if (trainFootprintRects.some((piece) => rectsOverlap(rect, piece))) continue;
          if (
            cityBlocks.length > 0 &&
            !cityBlocks.some(
              (block) =>
                rect.x >= block.x &&
                rect.y >= block.y &&
                rect.x + rect.width <= block.x + block.width &&
                rect.y + rect.depth <= block.y + block.depth,
            )
          ) {
            continue;
          }
          if (!publicAccessSide(rect) && !fullRoadFacingSide(rect)) continue;
          if (!accepts(rect)) continue;
          return rect;
        }
      }
      return null;
    };

    const wantsFill = (choice: SpaceFillChoice) =>
      activeSpaceFillChoices.includes("decide") || activeSpaceFillChoices.includes(choice);
    const shouldAddPlannedSpace =
      !activeSpaceFillChoices.includes("open-space");
    const canPlanFutureZones = allOwnedBuildingsPlaced;
    const addOnFutureZones = canPlanFutureZones
      ? cityAddOns
      .map((addOn) => {
        const option = cityAddOnOptions.find((item) => item.id === addOn.id);
        const size = addOnSizeToStuds(addOn);
        const preference = addOn.id === "alleyway" || addOn.id === "bus-stop" || addOn.id === "outdoor-seating" ? "near-road" : "bottom";
        const spot = findOpenFutureSpot(size.width, size.depth, preference);
        return spot ? makeFutureZone(option?.label ?? "City feature", size.width, size.depth, spot.x, spot.y) : null;
      })
      .filter(Boolean) as Piece[]
      : [];

    const plannedFutureZones: Piece[] = [];

    const futureSpecs: Array<{
      name: string;
      width: number;
      depth: number;
      preference: "right" | "bottom" | "near-road" | "train";
      enabled: boolean;
    }> = [
      { name: "Future Corner Modular 32x32", width: 32, depth: 32, preference: "near-road", enabled: wantsRoads && wantsFill("future-corner") },
      { name: "Future Straight Modular 32x32", width: 32, depth: 32, preference: "near-road", enabled: wantsRoads && wantsFill("future-straight") },
      { name: "Future 16x32 Modular", width: 16, depth: 32, preference: "near-road", enabled: wantsRoads && wantsFill("future-straight") && cityZone.widthStuds >= 128 },
      { name: "Future 32x16 Modular", width: 32, depth: 16, preference: "near-road", enabled: wantsRoads && wantsFill("future-straight") && cityZone.widthStuds >= 128 },
      { name: "Community Space", width: 32, depth: 32, preference: "near-road", enabled: wantsFill("decide") || wantsFill("park") || wantsFill("plaza") || wantsFill("market") || wantsFill("outdoor-seating") || wantsFill("playground") },
      { name: "Community Space", width: 16, depth: 16, preference: "near-road", enabled: wantsFill("decide") || wantsFill("park") || wantsFill("plaza") || wantsFill("market") || wantsFill("outdoor-seating") || wantsFill("playground") },
    ];

    if (canPlanFutureZones) futureSpecs.forEach((spec) => {
        if (!spec.enabled) return null;
        const spot = findOpenFutureSpot(spec.width, spec.depth, spec.preference, (rect) => {
          if (spec.name.includes("Corner Modular")) return isRoadCornerPlot(rect);
          if (spec.name.includes("Straight Modular") || spec.name.includes("16x32 Modular") || spec.name.includes("32x16 Modular")) return Boolean(fullRoadFacingSide(rect));
          return Boolean(publicAccessSide(rect) || fullRoadFacingSide(rect));
        });
        const zone = spot ? makeFutureZone(spec.name, spec.width, spec.depth, spot.x, spot.y) : null;
        if (zone) plannedFutureZones.push(zone);
    });

    let fillIndex = 0;
    if (canPlanFutureZones && shouldAddPlannedSpace) {
      const futureCandidatePool = candidates
        .filter((candidate) => candidate.blockId && (candidate.placement === "corner" || candidate.placement === "road-facing"))
        .sort((a, b) => {
          if (a.placement === "corner" && b.placement !== "corner") return -1;
          if (a.placement !== "corner" && b.placement === "corner") return 1;
          const aDistrictCount = placedBuildings.filter((piece) => districtForPiece(piece) === a.district).length;
          const bDistrictCount = placedBuildings.filter((piece) => districtForPiece(piece) === b.district).length;
          return bDistrictCount - aDistrictCount;
        });
      let candidateFutureCount = 0;
      for (const candidate of futureCandidatePool) {
        if (candidateFutureCount >= 18) break;
        const rect = { x: candidate.x, y: candidate.y, width: 32, depth: 32 };
        const district = candidate.district ?? districtForPoint(rect);
        const name =
          candidate.placement === "corner" && isRoadCornerPlot(rect)
            ? contextualFutureName(district, "Future Corner Modular 32x32")
            : fullRoadFacingSide(rect)
              ? contextualFutureName(district, "Future Straight Modular 32x32")
              : "";
        if (!name) continue;
        const zone = makeFutureZone(name, 32, 32, rect.x, rect.y);
        if (zone) {
          plannedFutureZones.push(zone);
          candidateFutureCount += 1;
        }
      }
      for (const candidate of futureCandidatePool) {
        if (candidateFutureCount >= 24) break;
        const rect = { x: candidate.x, y: candidate.y, width: 16, depth: 32 };
        if (!fullRoadFacingSide(rect)) continue;
        const zone = makeFutureZone("Future 16x32 Modular", 16, 32, rect.x, rect.y);
        if (zone) {
          plannedFutureZones.push(zone);
          candidateFutureCount += 1;
        }
      }

      const fillOverhang = overhangPolicy.maxDistance;
      for (let y = gridTop - fillOverhang; y <= gridBottom - 32 + fillOverhang; y += 32) {
        for (let x = gridLeft - fillOverhang; x <= gridRight - 32 + fillOverhang; x += 32) {
          const rect = { x, y, width: 32, depth: 32 };
          if (!placementAllowed(rect, overhangPolicy.minSupport)) continue;
          if (occupiedRects.some((piece) => rectsOverlap(rect, piece))) continue;
          if (trainClearanceRects.some((piece) => rectsOverlap(rect, piece))) continue;
          if (trainFootprintRects.some((piece) => rectsOverlap(rect, piece))) continue;
          const name = futurePlotName(rect);
          const zone = makeFutureZone(name, 32, 32, x, y);
          if (zone) {
            plannedFutureZones.push(zone);
            fillIndex += 1;
          }
        }
      }

      for (let y = gridTop - fillOverhang; y <= gridBottom - 32 + fillOverhang; y += 32) {
        for (let x = gridLeft - fillOverhang; x <= gridRight - 16 + fillOverhang; x += SNAP_STUDS) {
          const rect = { x, y, width: 16, depth: 32 };
          if (!placementAllowed(rect, overhangPolicy.minSupport)) continue;
          if (occupiedRects.some((piece) => rectsOverlap(rect, piece))) continue;
          if (trainClearanceRects.some((piece) => rectsOverlap(rect, piece))) continue;
          if (trainFootprintRects.some((piece) => rectsOverlap(rect, piece))) continue;
          const zone = makeFutureZone("Future 16x32 Modular", 16, 32, x, y);
          if (zone) plannedFutureZones.push(zone);
        }
      }

      let finalInfillCount = 0;
      const fineGridRight = Math.floor((cityZone.x + cityZone.widthStuds) / SNAP_STUDS) * SNAP_STUDS;
      const fineGridBottom = Math.floor((cityZone.y + cityZone.depthStuds) / SNAP_STUDS) * SNAP_STUDS;
      const finalInfillSpecs = [
        { name: "Future Straight Modular 32x32", width: 32, depth: 32 },
        { name: "Future 16x32 Modular", width: 16, depth: 32 },
        { name: "Future 32x16 Modular", width: 32, depth: 16 },
        { name: "Future Detail Zone 16x16", width: 16, depth: 16 },
        { name: "Future Detail Zone 8x16", width: 8, depth: 16 },
        { name: "Future Detail Zone 16x8", width: 16, depth: 8 },
        { name: "Community Space", width: 32, depth: 32 },
      ];
      const finalYValues: number[] = [];
      const finalXValues: number[] = [];
      for (let y = gridTop - fillOverhang; y <= fineGridBottom - 8 + fillOverhang; y += SNAP_STUDS) finalYValues.push(y);
      for (let x = gridLeft - fillOverhang; x <= fineGridRight - 8 + fillOverhang; x += SNAP_STUDS) finalXValues.push(x);
      finalYValues.sort((a, b) => b - a);
      finalXValues.sort((a, b) => b - a);
      for (const y of finalYValues) {
        for (const x of finalXValues) {
          if (finalInfillCount >= 32) break;
          for (const spec of finalInfillSpecs) {
            const rect = { x, y, width: spec.width, depth: spec.depth };
            if (x + spec.width > fineGridRight + fillOverhang || y + spec.depth > fineGridBottom + fillOverhang) continue;
            if (!canOccupyInfillRect(rect, spec.name.includes("Community") || spec.name.includes("Detail") ? 0.5 : overhangPolicy.minSupport, false)) continue;
            const roadCountBeforeInfill = roadPieces.length;
            const occupiedCountBeforeInfill = occupiedRects.length;
            if (!ensureFrontageForRect(rect)) continue;
            const district = districtForPoint(rect);
            const name =
              spec.name.includes("Straight Modular")
                ? contextualFutureName(district, "Future Straight Modular 32x32")
                : spec.name;
            const zone = makeFutureZone(name, spec.width, spec.depth, x, y);
            if (zone) {
              plannedFutureZones.push(zone);
              finalInfillCount += 1;
              break;
            }
            roadPieces.splice(roadCountBeforeInfill, roadPieces.length - roadCountBeforeInfill);
            occupiedRects.splice(occupiedCountBeforeInfill, occupiedRects.length - occupiedCountBeforeInfill);
            roadPieces.splice(0, roadPieces.length, ...normaliseRoadTiles(roadPieces));
          }
        }
      }
      if (finalInfillCount > 0) {
        decisionNotes.push(`Decision: Added ${finalInfillCount} final infill plots to use bottom/right buildable gaps`);
      }
    }

    let futureZones = [...addOnFutureZones, ...plannedFutureZones];
    const plannedRects = [...roadPieces, ...placedBuildings, ...futureZones].map((piece) => ({
      x: piece.x,
      y: piece.y,
      width: piece.width,
      depth: piece.depth,
    }));
    let unusedBaseplateCells: Array<{ x: number; y: number; width: number; depth: number }> = [];
    for (let y = gridTop; y <= gridBottom - 32; y += 32) {
      for (let x = gridLeft; x <= gridRight - 32; x += 32) {
        const rect = { x, y, width: 32, depth: 32 };
        if (!rectIsUsable(rect, layoutGeometry.usableZones, layoutGeometry.blockedZones, bridgeTableJoins)) continue;
        if (plannedRects.some((piece) => rectsOverlap(rect, piece))) continue;
        if (trainFootprintRects.some((piece) => rectsOverlap(rect, piece))) continue;
        unusedBaseplateCells.push(rect);
      }
    }
    let lateInfillCount = 0;
    if (canPlanFutureZones) [...unusedBaseplateCells]
      .sort((a, b) => b.y - a.y || b.x - a.x)
      .forEach((cell) => {
        if (lateInfillCount >= 12) return;
        const roadCountBeforeLateInfill = roadPieces.length;
        const occupiedCountBeforeLateInfill = occupiedRects.length;
        if (!ensureFrontageForRect(cell)) return;
        const zone = makeFutureZone(futurePlotName(cell), cell.width, cell.depth, cell.x, cell.y);
        if (zone) {
          plannedFutureZones.push(zone);
          futureZones = [...addOnFutureZones, ...plannedFutureZones];
          lateInfillCount += 1;
          return;
        }
        roadPieces.splice(roadCountBeforeLateInfill, roadPieces.length - roadCountBeforeLateInfill);
        occupiedRects.splice(occupiedCountBeforeLateInfill, occupiedRects.length - occupiedCountBeforeLateInfill);
        roadPieces.splice(0, roadPieces.length, ...normaliseRoadTiles(roadPieces));
      });
    if (lateInfillCount > 0) {
      decisionNotes.push(`Decision: Converted ${lateInfillCount} detected empty baseplates into final expansion plots`);
      const refreshedPlannedRects = [...roadPieces, ...placedBuildings, ...futureZones].map((piece) => ({
        x: piece.x,
        y: piece.y,
        width: piece.width,
        depth: piece.depth,
      }));
      unusedBaseplateCells = unusedBaseplateCells.filter((cell) => !refreshedPlannedRects.some((piece) => rectsOverlap(cell, piece)));
    }

    const roadTouchesLayoutEdge = (road: Piece) =>
      road.x <= cityZone.x ||
      road.y <= cityZone.y ||
      road.x + road.width >= cityZone.x + cityZone.widthStuds ||
      road.y + road.depth >= cityZone.y + cityZone.depthStuds;
    const roadHasConnection = (road: Piece) =>
      roadTouchesLayoutEdge(road) ||
      roadPieces.some((other) => {
        if (other.id === road.id) return false;
        const horizontalOverlap = road.x < other.x + other.width && road.x + road.width > other.x;
        const verticalOverlap = road.y < other.y + other.depth && road.y + road.depth > other.y;
        return (
          (horizontalOverlap && (road.y === other.y + other.depth || road.y + road.depth === other.y)) ||
          (verticalOverlap && (road.x === other.x + other.width || road.x + road.width === other.x))
        );
      });
    const disconnectedRoads = roadPieces.filter((road) => roadPieces.length > 1 && !roadHasConnection(road));
    const futureModularWithoutRoad = futureZones.filter(
      (piece) =>
        (piece.name.includes("Straight Modular") || piece.name.includes("16x32 Modular") || piece.name.includes("32x16 Modular")) &&
        !fullRoadFacingSide(piece),
    );
    const cornerPlotsOffCorner = futureZones.filter(
      (piece) => piece.name.includes("Corner Modular") && !isRoadCornerPlot(piece),
    );

    const ownedBuildingArea = placedBuildings.reduce((sum, piece) => sum + piece.width * piece.depth, 0);
    const roadArea = roadPieces.reduce((sum, piece) => sum + piece.width * piece.depth, 0);
    const isCommunityOrDetail = (piece: Piece) => piece.name.includes("Community Space") || piece.name.includes("Detail Area");
    const futureArea = futureZones
      .filter((piece) => !isCommunityOrDetail(piece))
      .reduce((sum, piece) => sum + piece.width * piece.depth, 0);
    const parkPlazaArea = futureZones
      .filter((piece) => isCommunityOrDetail(piece))
      .reduce((sum, piece) => sum + piece.width * piece.depth, 0);
    const unusedArea = unusedBaseplateCells.reduce((sum, cell) => sum + cell.width * cell.depth, 0);
    const usableArea = Math.max(1, layoutGeometry.usableZones.reduce((sum, item) => sum + item.widthStuds * item.depthStuds, 0));
    const pct = (area: number) => Math.round((area / usableArea) * 100);
    const plannedArea = ownedBuildingArea + roadArea + futureArea + parkPlazaArea;
    const utilisationScore = Math.max(0, Math.min(100, Math.round((plannedArea / usableArea) * 100)));

    const placedOwnedCount = placedBuildings.length;
    const placedOwnedIds = new Set(placedBuildings.map((piece) => piece.id));
    const unplacedOwnedBuildings = ownedBuildings.filter((building) => !placedOwnedIds.has(building.id));
    const uSectionCounts = layoutShape === "u-shape"
      ? placedBuildings.reduce(
          (counts, piece) => {
            const center = { x: piece.x + piece.width / 2, y: piece.y + piece.depth / 2 };
            const section = layoutGeometry.tableSections.find(
              (item) =>
                center.x >= item.x &&
                center.x <= item.x + item.widthStuds &&
                center.y >= item.y &&
                center.y <= item.y + item.depthStuds,
            );
            if (section?.id === "u-back") counts.back += 1;
            if (section?.id === "u-left-arm") counts.left += 1;
            if (section?.id === "u-right-arm") counts.right += 1;
            return counts;
          },
          { back: 0, left: 0, right: 0 },
        )
      : null;
    const uBalancedSections = uSectionCounts
      ? [uSectionCounts.back, uSectionCounts.left, uSectionCounts.right].filter((count) => count > 0).length
      : 3;
    const cornerCount = placedBuildings.filter((piece) => piece.modularType === "corner").length;
    const ownedCornerBuildings = ownedBuildings.filter((piece) => piece.modularType === "corner").length;
    const cornerBuildingsOnCorners = placedBuildings.filter((piece) => piece.modularType === "corner" && isRoadCornerPlot(piece)).length;
    const buildingFacingCount = placedBuildings.filter((piece) => fullRoadFacingSide(piece) || publicAccessSide(piece)).length;
    const categories = new Set(placedBuildings.map((piece) => piece.category));
    const placedRatio = ownedBuildings.length > 0 ? placedOwnedCount / ownedBuildings.length : 1;
    const facingRatio = placedBuildings.length > 0 ? buildingFacingCount / placedBuildings.length : 1;
    const cornerRatio = ownedCornerBuildings > 0 ? cornerBuildingsOnCorners / ownedCornerBuildings : 1;
    const connectedRoadRatio = roadPieces.length > 1 ? Math.max(0, (roadPieces.length - disconnectedRoads.length) / roadPieces.length) : 1;
    const remainingUsefulArea = Math.max(1, usableArea - ownedBuildingArea - roadArea);
    const futurePlanningRatio = Math.min(1, (futureArea + parkPlazaArea) / remainingUsefulArea);
    const hasPublicSpaces = parkPlazaArea > 0 || roadPieces.some((piece) => piece.roadKind === "plaza");
    const largeDeadZone = unusedArea >= 32 * 32 * 4;
    const generatedRoadMismatches = roadMismatchMessages(roadPieces);
    const generatedQualityWarnings = [
      unplacedOwnedBuildings.length > 0 ? `${unplacedOwnedBuildings.length} owned buildings not placed` : "",
      placedBuildings.length > buildingFacingCount ? `${placedBuildings.length - buildingFacingCount} buildings do not face roads or public space` : "",
      ownedCornerBuildings > cornerBuildingsOnCorners ? `${ownedCornerBuildings - cornerBuildingsOnCorners} corner buildings not on road corners` : "",
      wantsRoads && roadPieces.length === 0 ? "Road network is missing" : "",
      disconnectedRoads.length > 0 ? `${disconnectedRoads.length} disconnected road segments` : "",
      generatedRoadMismatches.length > 0 ? `${generatedRoadMismatches.length} road connection mismatches` : "",
      futureModularWithoutRoad.length > 0 ? `${futureModularWithoutRoad.length} future modular plots lack road frontage` : "",
      cornerPlotsOffCorner.length > 0 ? `${cornerPlotsOffCorner.length} future corner plots are not on corners` : "",
      hasPublicSpaces ? "" : "No park, plaza, or public space included",
      largeDeadZone ? "Large unused area detected" : "",
      layoutShape === "u-shape" && uBalancedSections < 3 ? "U-shape districts are not connected across all sections" : "",
    ].filter(Boolean);

    let blueprintScore = 0;
    blueprintScore += placedRatio >= 1 ? 30 : Math.max(0, Math.round(30 * placedRatio) - (ownedBuildings.length - placedOwnedCount) * 20);
    blueprintScore += Math.round(20 * facingRatio);
    blueprintScore += Math.round(15 * cornerRatio);
    blueprintScore += Math.round(15 * connectedRoadRatio);
    blueprintScore += Math.round(10 * futurePlanningRatio);
    blueprintScore += hasPublicSpaces ? 5 : 0;
    blueprintScore += largeDeadZone ? 0 : 5;
    if (layoutShape === "u-shape") blueprintScore += uBalancedSections === 3 ? 8 : -18 * (3 - uBalancedSections);
    blueprintScore -= (ownedBuildings.length - placedOwnedCount) * 20;
    blueprintScore -= Math.max(0, ownedCornerBuildings - cornerBuildingsOnCorners) * 10;
    blueprintScore -= disconnectedRoads.length * 10;
    if (largeDeadZone) blueprintScore -= 20;
    score = clamp(Math.round(blueprintScore), 0, 100);
    if (layoutShape === "u-shape" && placedRatio >= 1 && uBalancedSections === 3 && !largeDeadZone && connectedRoadRatio >= 0.85) {
      score = Math.max(score, 82);
    }
    score = capCityRatingByWarnings(score, generatedQualityWarnings.length);

    notes.push(`${placedOwnedCount} of ${ownedBuildings.length} owned buildings placed`);
    unplacedOwnedBuildings.forEach((building) => {
      notes.push(`Blueprint could not place ${building.name} because the table is too small or the road layout uses too much space.`);
    });
    notes.push(`${cornerBuildingsOnCorners} of ${ownedCornerBuildings} corner buildings placed on road junctions`);
    notes.push(`${buildingFacingCount} buildings facing roads, plaza, or open space`);
    if (categories.size > 1) notes.push(`${categories.size} loose districts formed from owned buildings`);
    if (uSectionCounts) {
      notes.push(`U-shape section balance: back ${uSectionCounts.back}, left arm ${uSectionCounts.left}, right arm ${uSectionCounts.right}`);
      if (uBalancedSections === 3) decisionNotes.push("Decision: Distributed buildings across the U-shape back section and both arms");
      else notes.push("U-shape layout is not balanced across all usable sections");
    }
    if (futureZones.length > 0) {
      notes.push(`${futureZones.length} intentional future expansion zones reserved`);
      decisionNotes.push(`Decision: Reserved ${futureZones.length} future build opportunities`);
    }
    if (roadPieces.some((piece) => piece.roadKind === "plaza")) decisionNotes.push("Decision: Added a central plaza as public space");
    if (wantsRoads) {
      notes.push("Road network generated beneath buildings");
      decisionNotes.push("Decision: Connected districts with a main road and side streets");
    }
    if (!wantsRoads) notes.push("Buildings arranged around plaza/open public space");
    notes.push(
      `Layout utilisation score ${utilisationScore}%: owned ${pct(ownedBuildingArea)}%, roads ${pct(roadArea)}%, future builds ${pct(futureArea)}%, parks/plazas ${pct(parkPlazaArea)}%, unused ${pct(unusedArea)}%`,
    );
    if (largeDeadZone) notes.push("Large unused area detected");
    if (disconnectedRoads.length > 0) notes.push("Road segment does not connect to anything");
    if (futureModularWithoutRoad.length > 0) notes.push("Future modular does not face a road");
    if (cornerPlotsOffCorner.length > 0) notes.push("Corner modular plot is not on a corner");
    if (score < 90) notes.push("Table space not efficiently planned");
    if (utilisationScore >= 90) decisionNotes.push(`Decision: Optimised table usage to ${utilisationScore}%`);
    else decisionNotes.push(`Decision: Planned ${utilisationScore}% of usable table space with room to adjust manually`);
    const formatInventory = <Key extends string>(
      values: Partial<Record<Key, number>>,
      labels: Record<Key, string>,
      prefix = "",
    ) =>
      Object.entries(values)
        .filter(([, value]) => Number(value) > 0)
        .map(([key, value]) => `${prefix}${value} ${labels[key as Key]}`);
    const roadInventoryLabels: Record<RoadInventoryKey, string> = {
      straight32: "straight 32x32 roads",
      corner32: "corner 32x32 roads",
      t32: "T-junction 32x32 roads",
      cross32: "cross junction 32x32 roads",
      deadEnd32: "dead end / future road 32x32 roads",
      straight16: "straight 16x32 roads",
      corner16: "corner 16x32 roads",
      t16: "T-junction 16x32 roads",
      cross16: "cross junction 16x32 roads",
    };
    const usedRoadList = formatInventory(usedRoadInventory, roadInventoryLabels);
    const missingRoadList = formatInventory(missingRoadInventory, roadInventoryLabels, "+");
    if (usedRoadList.length > 0) notes.push(`Used road inventory: ${usedRoadList.join(", ")}`);
    if (missingRoadList.length > 0) {
      notes.push(`Needed to complete this layout: ${missingRoadList.join(", ")}`);
    }
    if (roadInventoryMode === "owned") {
      const unusedRoads = Object.fromEntries(
        roadInventoryOptions.map((option) => [
          option.key,
          Math.max(0, roadInventory[option.key] - (usedRoadInventory[option.key] ?? 0)),
        ]),
      ) as Record<RoadInventoryKey, number>;
      const unusedRoadList = formatInventory(unusedRoads, roadInventoryLabels);
      if (unusedRoadList.length > 0) notes.push(`Unused road inventory: ${unusedRoadList.join(", ")}`);
    }
    pushHistory("Generated layout", historyBeforeGeneration);
    setObjectWarning(placedBuildings.length < ownedBuildings.length ? "This object is outside your usable table space." : "");
    setLayoutScore(score);
    setLayoutNotes([...decisionNotes, ...notes]);
    setPieces([...roadPieces, ...placedBuildings, ...futureZones].map((piece) => normalizePiece(withPieceModule(piece))));
    fitToScreen();
  };

  const saveLayout = () => {
    const id = activeLayoutId ?? newId();
    const saved: SavedLayout = {
      id,
      name: layoutName.trim() || "Untitled layout",
      widthCm: studsToCm(layoutGeometry.width),
      depthCm: studsToCm(layoutGeometry.depth),
      widthStuds: layoutGeometry.width,
      depthStuds: layoutGeometry.depth,
      tableWidth,
      tableDepth,
      bridgeTableJoins,
      overhangMode,
      layoutShape,
      planningMode,
      tableSections: layoutGeometry.tableSections,
      usableZones: layoutGeometry.usableZones,
      blockedZones: layoutGeometry.blockedZones,
      pieces,
      trainPieces: [],
      layoutScore,
      layoutNotes,
      updatedAt: new Date().toISOString(),
    };

    setActiveLayoutId(id);
    setSavedLayouts((current) => {
      const withoutCurrent = current.filter((layout) => layout.id !== id);
      return [saved, ...withoutCurrent];
    });
  };

  const loadLayout = (layout: SavedLayout) => {
    pushHistory(`Loaded ${layout.name}`);
    setActiveLayoutId(layout.id);
    setLayoutName(layout.name);
    const nextShape = layout.layoutShape ?? "rectangle";
    setPlanningMode(layout.planningMode ?? "manual");
    setLayoutShape(nextShape);
    setTableWidth(layout.tableWidth ?? layout.widthStuds);
    setTableDepth(layout.tableDepth ?? layout.depthStuds);
    setBridgeTableJoins(layout.bridgeTableJoins ?? true);
    setOverhangMode(layout.overhangMode ?? "slight");
    setDimensionInputs((current) => ({
      ...current,
      tableWidth: String(studsToCm(layout.tableWidth ?? layout.widthStuds)),
      tableDepth: String(studsToCm(layout.tableDepth ?? layout.depthStuds)),
    }));
    if (nextShape === "u-shape" && layout.tableSections && layout.blockedZones?.[0]) {
      const back = layout.tableSections.find((section) => section.id === "u-back");
      const left = layout.tableSections.find((section) => section.id === "u-left-arm");
      const right = layout.tableSections.find((section) => section.id === "u-right-arm");
      const gap = layout.blockedZones[0];
      if (back) {
        setUBackWidth(back.widthStuds);
        setUBackDepth(back.depthStuds);
      }
      if (left) {
        setULeftArmLength(left.depthStuds);
        setULeftArmWidth(left.widthStuds);
      }
      if (right) {
        setURightArmLength(right.depthStuds);
        setURightArmWidth(right.widthStuds);
      }
      setUInnerGapWidth(gap.widthStuds);
      setUInnerGapDepth(gap.depthStuds);
      setDimensionInputs((current) => ({
        ...current,
        uBackWidth: back ? String(studsToCm(back.widthStuds)) : current.uBackWidth,
        uBackDepth: back ? String(studsToCm(back.depthStuds)) : current.uBackDepth,
        uLeftArmLength: left ? String(studsToCm(left.depthStuds)) : current.uLeftArmLength,
        uLeftArmWidth: left ? String(studsToCm(left.widthStuds)) : current.uLeftArmWidth,
        uRightArmLength: right ? String(studsToCm(right.depthStuds)) : current.uRightArmLength,
        uRightArmWidth: right ? String(studsToCm(right.widthStuds)) : current.uRightArmWidth,
        uInnerGapWidth: String(studsToCm(gap.widthStuds)),
        uInnerGapDepth: String(studsToCm(gap.depthStuds)),
      }));
    }
    if (nextShape === "custom" && layout.tableSections) {
      setCustomSections(layout.tableSections.map(normalizeTableSection));
      setCustomSectionInputs(
        Object.fromEntries(
          layout.tableSections.map((section) => [
            section.id,
            {
              widthStuds: String(studsToCm(section.widthStuds)),
              depthStuds: String(studsToCm(section.depthStuds)),
              x: String(studsToCm(section.x)),
              y: String(studsToCm(section.y)),
            },
          ]),
        ),
      );
    }
    setPieces(layout.pieces.map(normalizePiece));
    setTrainPieces([]);
    setLayoutScore(layout.layoutScore ?? 0);
    setLayoutNotes(layout.layoutNotes ?? []);
  };

  const deleteLayout = (id: string) => {
    setSavedLayouts((current) => current.filter((layout) => layout.id !== id));
    if (activeLayoutId === id) setActiveLayoutId(null);
  };

  const updateCustomSection = (
    id: string,
    field: "widthStuds" | "depthStuds" | "x" | "y",
    value: number,
  ) => {
    setCustomSections((current) =>
      current.map((section) =>
        section.id === id
          ? sectionWithCm({
              ...section,
              widthStuds:
                field === "widthStuds" ? Math.max(16, cmToStuds(value)) : section.widthStuds,
              depthStuds:
                field === "depthStuds" ? Math.max(16, cmToStuds(value)) : section.depthStuds,
              x: field === "x" ? Math.max(0, cmToStuds(value)) : section.x,
              y: field === "y" ? Math.max(0, cmToStuds(value)) : section.y,
            })
          : section,
      ),
    );
  };

  const addCustomSection = () => {
    const id = newId();
    const y = customSections.length * 64;
    setCustomSectionInputs((inputs) => ({
      ...inputs,
      [id]: {
        widthStuds: String(studsToCm(64)),
        depthStuds: String(studsToCm(64)),
        x: "0",
        y: String(studsToCm(y)),
      },
    }));
    setCustomSections((current) => {
      return [
        ...current,
        sectionWithCm({
          id,
          name: `Section ${current.length + 1}`,
          widthStuds: 64,
          depthStuds: 64,
          x: 0,
          y,
        }),
      ];
    });
  };

  const exportImage = async () => {
    if (!gridRef.current) return;

    const dataUrl = await toPng(gridRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#e4dfd1",
    });
    const link = document.createElement("a");
    link.download = `${layoutName.trim() || "brick-city-layout"}.png`;
    link.href = dataUrl;
    link.click();
  };

  const columnNameForIndex = (index: number) => {
    let value = Math.max(0, index);
    let label = "";
    do {
      label = String.fromCharCode(65 + (value % 26)) + label;
      value = Math.floor(value / 26) - 1;
    } while (value >= 0);
    return label;
  };

  const gridCoordinateForRect = (rect: { x: number; y: number }) => {
    const bounds = usableBounds(layoutGeometry.usableZones);
    const column = columnNameForIndex(Math.max(0, Math.floor((rect.x - bounds.left) / 32)));
    const row = Math.max(1, Math.floor((rect.y - bounds.top) / 32) + 1);
    return `${column}${row}`;
  };

  const shortBuildName = (name: string) =>
    name
      .replace(/\s*\([^)]*\)/g, "")
      .split(/\s+/)
      .slice(0, 2)
      .join(" ");

  const hasBuildings =
    selectedOfficialSets.length > 0 || pieces.some((piece) => piece.type === "building");
  const clearanceBoxes = trainPieces
    .filter((piece) => piece.clearanceStuds && piece.level !== "elevated")
    .map((piece) => ({
      id: piece.id,
      x: piece.x,
      y: piece.y,
      width: piece.clearanceStuds ?? piece.width,
      depth: piece.clearanceStuds ?? piece.depth,
    }));
  const elevatedClearanceBoxes = trainPieces
    .filter((piece) => piece.clearanceStuds && piece.level === "elevated")
    .map((piece) => ({
      id: piece.id,
      x: piece.x,
      y: piece.y,
      width: piece.clearanceStuds ?? piece.width,
      depth: piece.clearanceStuds ?? piece.depth,
    }));
  const overlappingBuildingIds = new Set(
    pieces
      .filter((piece) => piece.type === "building")
      .filter((building) => clearanceBoxes.some((box) => rectsOverlap(building, box)))
      .map((building) => building.id),
  );
  const overlappingRoadIds = new Set(
    pieces
      .filter((piece) => piece.type === "road")
      .filter((road) => clearanceBoxes.some((box) => rectsOverlap(road, box)))
      .map((road) => road.id),
  );
  const outsidePieceIds = new Set(
    pieces
      .filter((piece) => !placementAllowed(piece))
      .map((piece) => piece.id),
  );
  const outsideTrainIds = new Set(
    trainPieces
      .filter((piece) => !placementAllowed(piece))
      .map((piece) => piece.id),
  );
  const overhangDescriptionFor = (rect: { x: number; y: number; width: number; depth: number }) => {
    const support = placementSupport(rect);
    if (support.overhangDistance <= 0 || !placementAllowed(rect)) return "";
    return `${overhangPolicy.label}: ${Math.round(support.overhangDistance)} studs beyond table edge, ${Math.round(support.ratio * 100)}% supported.`;
  };
  const overhangingPieceIds = new Set(
    pieces
      .filter((piece) => Boolean(overhangDescriptionFor(piece)))
      .map((piece) => piece.id),
  );
  const modularMisalignedPieces = pieces.filter(
    (piece) => snapGroupForPiece(piece) === "modular" && (piece.x % 16 !== 0 || piece.y % 16 !== 0),
  );
  const buildGuideEntries = useMemo(
    () =>
      [...pieces]
        .sort((a, b) => {
          const typeRank = (piece: Piece) => (piece.type === "building" ? 0 : piece.type === "road" ? 1 : 2);
          return typeRank(a) - typeRank(b) || a.y - b.y || a.x - b.x || a.name.localeCompare(b.name);
        })
        .map((piece, index) => {
          const kind =
            piece.type === "building"
              ? "Building"
              : piece.type === "road"
                ? piece.roadKind === "plaza"
                  ? "Plaza"
                  : "Road"
                : "Future Plot";
          const notes = [
            piece.type === "future" ? "Optional" : "",
            piece.frontSide ? `Faces ${piece.frontSide}` : "",
            piece.roadKind ? piece.roadKind.replace("-", " ") : "",
            overhangDescriptionFor(piece),
          ].filter(Boolean);
          return {
            id: piece.id,
            number: index + 1,
            name: piece.name,
            shortName: shortBuildName(piece.name),
            type: kind,
            size: `${piece.width}x${piece.depth}`,
            position: gridCoordinateForRect(piece),
            x: piece.x,
            y: piece.y,
            rotation: piece.rotation,
            notes: notes.join(" · "),
            piece,
          };
        }),
    [pieces, layoutGeometry.usableZones, overhangMode, bridgeTableJoins],
  );
  const buildGuideEntryById = useMemo(
    () => new globalThis.Map(buildGuideEntries.map((entry) => [entry.id, entry])),
    [buildGuideEntries],
  );
  const buildGuideHtml = async () => {
    const image = gridRef.current
      ? await toPng(gridRef.current, { cacheBust: true, pixelRatio: 2, backgroundColor: "#e4dfd1" })
      : "";
    const escapeHtml = (value: string | number) =>
      String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
    const section = (title: string, items: typeof buildGuideEntries) =>
      `<h2>${escapeHtml(title)}</h2><ol>${items
        .map(
          (entry) =>
            `<li><strong>#${entry.number} ${escapeHtml(entry.name)}</strong><br/>${escapeHtml(entry.type)} · ${escapeHtml(entry.size)} studs · ${escapeHtml(entry.position)} · Rotation ${entry.rotation}°${entry.notes ? `<br/><em>${escapeHtml(entry.notes)}</em>` : ""}</li>`,
        )
        .join("")}</ol>`;
    return `<!doctype html><html><head><meta charset="utf-8"/><title>${escapeHtml(layoutName)} Build Guide</title><style>body{font-family:Arial,sans-serif;margin:32px;color:#172026}img{max-width:100%;border:2px solid #172026}li{margin:0 0 10px}h1,h2{margin-bottom:8px}.meta{color:#57534e}</style></head><body><h1>${escapeHtml(layoutName || "BrickmansPark Blueprint")} Build Guide</h1><p class="meta">Table: ${studsToCm(layoutGeometry.width)}cm x ${studsToCm(layoutGeometry.depth)}cm · Grid: ${Math.round(layoutGeometry.width)} x ${Math.round(layoutGeometry.depth)} studs</p>${image ? `<img src="${image}" alt="Blueprint image"/>` : ""}${section("Build List", buildGuideEntries)}${section("Road List", buildGuideEntries.filter((entry) => entry.piece.type === "road"))}${section("Future Plot List", buildGuideEntries.filter((entry) => entry.piece.type === "future"))}</body></html>`;
  };

  const exportBuildGuide = async () => {
    const html = await buildGuideHtml();
    const blob = new Blob([html], { type: "text/html" });
    const link = document.createElement("a");
    link.download = `${layoutName.trim() || "brickmanspark-blueprint"}-build-guide.html`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const printBuildGuide = async () => {
    const html = await buildGuideHtml();
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };
  const hasTrainClearanceOverlap = overlappingBuildingIds.size > 0 || overlappingRoadIds.size > 0;
  const hasOutsideObjects = outsidePieceIds.size > 0 || outsideTrainIds.size > 0 || Boolean(objectWarning);
  const visiblePieces = pieces.filter(
    (piece) =>
      piece.type === "road" || categoryFilter === "all" || piece.category === categoryFilter,
  );
  const futurePlotMeta = (piece: Piece) => {
    const lowerName = piece.name.toLowerCase();
    const district =
      lowerName.includes("retail") || lowerName.includes("shop")
        ? "Retail"
        : lowerName.includes("restaurant")
          ? "Restaurant"
          : lowerName.includes("civic") || lowerName.includes("landmark") || lowerName.includes("office")
            ? "Civic"
            : lowerName.includes("residential") || lowerName.includes("apartments") || lowerName.includes("hotel")
              ? "Residential"
              : lowerName.includes("park")
                ? "Park"
                : lowerName.includes("plaza")
                  ? "Plaza"
                  : "Mixed Use";
    const plotType =
      lowerName.includes("corner")
        ? "Future corner modular"
        : lowerName.includes("community")
          ? "Community space"
          : lowerName.includes("detail")
            ? "Detail area"
            : "Future modular plot";

    return {
      district,
      plotType,
      compactLabel: piece.name
        .replace(/^(.+?\s)?Future\s+/i, "Future ")
        .replace("Modular", "Mod.")
        .replace("Residential", "Res.")
        .replace("Restaurant", "Food")
        .replace("Expansion", "Expand."),
    };
  };
  const pieceLayerClass = (piece: Piece) => {
    if (dragId === piece.id) return "z-30 shadow-xl";
    if (piece.type === "building") return "z-20";
    if (piece.type === "road") return "z-[14]";
    if (piece.name.toLowerCase().includes("community") || piece.name.toLowerCase().includes("detail")) return "z-[12]";
    return "z-[6]";
  };
  const decisionLayoutNotes = layoutNotes
    .filter((note) => note.startsWith("Decision:"))
    .map((note) => note.replace("Decision:", "").trim());
  const planningLayoutNotes = layoutNotes.filter((note) => !note.startsWith("Decision:"));
  const layoutUtilisationNote = layoutNotes.find((note) => note.startsWith("Layout utilisation score"));
  const uShapeBalanceNote = layoutNotes.find((note) => note.startsWith("U-shape section balance"));
  const uShapeBalanced = uShapeBalanceNote
    ? (uShapeBalanceNote.match(/back (\d+), left arm (\d+), right arm (\d+)/)?.slice(1).map(Number) ?? []).every((count) => count > 0)
    : true;
  const visibleBuildingCount = visiblePieces.filter((piece) => piece.type === "building").length;
  const totalBuildingCount = pieces.filter((piece) => piece.type === "building").length;
  const activeDistricts = categoryOptions
    .map((option) => ({
      ...option,
      count: pieces.filter((piece) => piece.category === option.value).length,
    }))
    .filter((option) => option.count > 0);
  const selectedPiece =
    selectedObject?.kind === "piece"
      ? pieces.find((piece) => piece.id === selectedObject.id)
      : undefined;
  const selectedTrainPiece =
    selectedObject?.kind === "train"
      ? trainPieces.find((piece) => piece.id === selectedObject.id)
      : undefined;
  const selectedDetails = selectedPiece
    ? {
        name: selectedPiece.name,
        kind:
          selectedPiece.type === "building"
            ? "Building"
            : selectedPiece.type === "road"
              ? selectedPiece.roadKind === "plaza"
                ? "Plaza"
                : "Road"
              : "Future expansion",
        width: selectedPiece.width,
        depth: selectedPiece.depth,
        x: selectedPiece.x,
        y: selectedPiece.y,
        rotation: selectedPiece.rotation,
        level: "Ground Level",
        module: selectedPiece.baseplateModule ?? baseplateModuleLabel(selectedPiece.width, selectedPiece.depth),
      }
    : selectedTrainPiece
      ? {
          name: selectedTrainPiece.name,
          kind: "Train",
          width: selectedTrainPiece.width,
          depth: selectedTrainPiece.depth,
          x: selectedTrainPiece.x,
          y: selectedTrainPiece.y,
          rotation: selectedTrainPiece.rotation,
          level: trainElevationLabels[selectedTrainPiece.elevationMode ?? "ground"],
          module: selectedTrainPiece.baseplateModule ?? baseplateModuleLabel(selectedTrainPiece.width, selectedTrainPiece.depth),
      }
      : null;
  const liveCityAnalysis = useMemo(() => {
    const allPieces = pieces;
    const buildings = allPieces.filter((piece) => piece.type === "building");
    const roads = allPieces.filter((piece) => piece.type === "road" && piece.roadKind !== "plaza" && piece.roadKind !== "alley");
    const publicSpaces = allPieces.filter((piece) => piece.roadKind === "plaza" || piece.name.toLowerCase().includes("community") || piece.name.toLowerCase().includes("detail"));
    const parks = allPieces.filter((piece) => piece.category === "park" || piece.name.toLowerCase().includes("community"));
    const futureZones = allPieces.filter((piece) => piece.type === "future");
    const landmarks = buildings.filter((piece) => piece.modularType === "landmark" || piece.category === "civic" || /museum|town hall|station|landmark/i.test(piece.name));
    const pieceArea = allPieces.reduce((sum, piece) => sum + piece.width * piece.depth, 0);
    const usableArea = Math.max(1, layoutGeometry.usableZones.reduce((sum, zone) => sum + zone.widthStuds * zone.depthStuds, 0));
    const utilisation = clamp(Math.round((pieceArea / usableArea) * 100), 0, 100);
    const roadTouches = (rect: { x: number; y: number; width: number; depth: number }, side: Direction) =>
      roads.some((road) => sideForTouchingRoads(rect, road) === side);
    const facesRoad = (building: Piece) => roadTouches(building, building.frontSide ?? "south");
    const buildingsFacingRoads = buildings.filter(facesRoad).length;
    const cornerBuildings = buildings.filter((piece) => piece.modularType === "corner");
    const cornerOnRoadCorners = cornerBuildings.filter((piece) => {
      const northSouth = roadTouches(piece, "north") || roadTouches(piece, "south");
      const eastWest = roadTouches(piece, "east") || roadTouches(piece, "west");
      return northSouth && eastWest;
    }).length;
    const roadMismatches = roadMismatchMessages(allPieces);
    const disconnectedRoads = roads.filter((road) => requiredRoadConnections(road, roads).size === 0);
    const categories = new Set(buildings.map((piece) => piece.category).filter((category) => typeof category === "string"));
    const districtStats = categoryOptions
      .filter((category) => category.value !== "park" && category.value !== "entertainment")
      .map((category) => {
        const districtBuildings = buildings.filter((piece) => piece.category === category.value);
        const districtRoadFacing = districtBuildings.filter(facesRoad).length;
        const score = districtBuildings.length === 0
          ? 0
          : clamp(
              Math.round(
                55 +
                  (districtRoadFacing / Math.max(1, districtBuildings.length)) * 25 +
                  Math.min(15, districtBuildings.length * 5) +
                  (publicSpaces.some((space) => districtBuildings.some((building) => Math.abs(space.x - building.x) <= 96 && Math.abs(space.y - building.y) <= 96)) ? 5 : 0),
              ),
              0,
              100,
            );
        return {
          label: category.label.replace("/green space", ""),
          value: category.value,
          count: districtBuildings.length,
          score,
        };
      })
      .filter((district) => district.count > 0);
    const logicalDistrictCount = districtStats.filter((district) => district.count >= 2).length;
    const tooManyRoads = roads.length > Math.max(8, buildings.length * 3 + 6);
    const tooFewRoads = buildings.length > 0 && roads.length < Math.max(1, Math.ceil(buildings.length / 3));
    const hasLargeUnusedArea = utilisation < (buildings.length > 0 ? 35 : 15);
    let score = 25;
    if (buildings.length > 0) score += 10;
    score += Math.round((buildingsFacingRoads / Math.max(1, buildings.length)) * 18);
    score += cornerBuildings.length === 0 ? 8 : Math.round((cornerOnRoadCorners / Math.max(1, cornerBuildings.length)) * 10);
    score += Math.min(12, logicalDistrictCount * 4);
    score += parks.length > 0 ? 7 : 0;
    score += publicSpaces.length > 0 ? 7 : 0;
    score += roads.length === 0 ? 0 : Math.max(0, 12 - disconnectedRoads.length * 3 - roadMismatches.length * 4);
    score += futureZones.length > 0 ? 6 : 0;
    score += Math.min(10, Math.round(utilisation / 10));
    score += Math.min(8, categories.size * 2);
    score += landmarks.length > 0 ? 4 : 0;
    if (tooManyRoads) score -= 8;
    if (tooFewRoads) score -= 8;
    if (parks.length === 0) score -= 5;
    if (publicSpaces.length === 0) score -= 5;
    if (hasLargeUnusedArea) score -= 10;
    if (cornerBuildings.length > cornerOnRoadCorners) score -= (cornerBuildings.length - cornerOnRoadCorners) * 5;
    score = clamp(Math.round(score), 0, 100);
    const positives = [
      buildingsFacingRoads > 0 ? `${buildingsFacingRoads} buildings face roads` : "",
      logicalDistrictCount > 0 ? `${logicalDistrictCount} logical districts created` : "",
      roads.length > 0 && roadMismatches.length === 0 ? "Good road network" : "",
      publicSpaces.length > 0 ? "Includes public plaza or market space" : "",
      parks.length > 0 ? "Includes park space" : "",
      futureZones.length > 0 ? "Expansion zones reserved" : "",
      categories.size >= 3 ? "Good variety of building types" : "",
      landmarks.length > 0 ? "Landmark/civic placement included" : "",
    ].filter(Boolean);
    const warnings = [
      buildings.length > buildingsFacingRoads ? `${buildings.length - buildingsFacingRoads} buildings do not face roads` : "",
      cornerBuildings.length > cornerOnRoadCorners ? `${cornerBuildings.length - cornerOnRoadCorners} corner buildings not on corners` : "",
      buildings.length >= 4 && logicalDistrictCount === 0 ? "No logical districts created" : "",
      disconnectedRoads.length > 0 ? `${disconnectedRoads.length} isolated road segments` : "",
      tooManyRoads ? "Too many roads for the current city density" : "",
      tooFewRoads ? "Too few roads serving buildings" : "",
      parks.length === 0 ? "No park space included" : "",
      publicSpaces.length === 0 ? "No public plaza or market included" : "",
      hasLargeUnusedArea ? "Large unused area detected" : "",
      ...roadMismatches.slice(0, 2),
    ].filter(Boolean);
    score = capCityRatingByWarnings(score, warnings.length);
    return {
      score,
      status: ratingStatus(score),
      tier: cityChallengeTier(score),
      positives,
      warnings,
      districts: districtStats,
      utilisation,
      buildingsFacingRoads,
    };
  }, [pieces, layoutGeometry.usableZones, layoutGeometry.blockedZones]);
  const displayCityRating = liveCityAnalysis.score || layoutScore;
  const expansionPotential = layoutUtilisationNote
    ? Number(layoutUtilisationNote.match(/(\d+)%/)?.[1] ?? layoutScore)
    : Math.max(layoutScore, liveCityAnalysis.utilisation);
  const buildabilityRating = clamp(
    displayCityRating -
      (hasOutsideObjects ? 20 : 0) -
      (hasTrainClearanceOverlap ? 20 : 0) -
      (layoutNotes.some((note) => note.includes("outside your usable")) ? 35 : 0) -
      (layoutNotes.some((note) => note.includes("does not connect")) ? 10 : 0),
    0,
    100,
  );
  const ownedMocs = customMocs;
  const selectedOfficialPresets = selectedOfficialSets
    .map((setNumber) => modularBuildings.find((preset) => preset.setNumber === setNumber))
    .filter(Boolean) as Array<(typeof modularBuildings)[number]>;
  const selectedBuildingCount = selectedOfficialPresets.length + ownedMocs.length;
  const selectedCornerCount =
    selectedOfficialPresets.filter((preset) => preset.modularType === "corner" || preset.isCornerBuilding).length +
    ownedMocs.filter((piece) => piece.modularType === "corner").length;
  const selectedStraightCount = Math.max(0, selectedBuildingCount - selectedCornerCount);
  const selectedFootprintWidth =
    selectedOfficialPresets.reduce((total, preset) => total + preset.widthStuds, 0) +
    ownedMocs.reduce((total, piece) => total + piece.widthStuds, 0);
  const selectedFootprintDepth = Math.max(
    0,
    ...selectedOfficialPresets.map((preset) => preset.depthStuds),
    ...ownedMocs.map((piece) => piece.depthStuds),
  );
  const selectedBaseplateEstimate = Math.ceil(
    (selectedOfficialPresets.reduce((total, preset) => total + preset.widthStuds * preset.depthStuds, 0) +
      ownedMocs.reduce((total, piece) => total + piece.widthStuds * piece.depthStuds, 0)) /
      (32 * 32),
  );
  const generationInputSummary = `${selectedOfficialPresets.length} official buildings selected · ${customMocs.length} custom MOCs added`;
  const trainSupportRect = (piece: TrainPiece) => {
    const size = piece.supportSize ?? "16x32";
    const [supportWidth, supportDepth] =
      size === "16x16"
        ? [16, 16]
        : size === "48x48"
        ? [48, 48]
        : size === "96x96"
          ? [96, 96]
          : size === "48x32"
            ? [48, 32]
            : size === "64x64"
              ? [64, 64]
              : size === "32x32"
                ? [32, 32]
                : [16, 32];
    const xOffset = Math.max(0, (supportWidth - piece.width) / 2);
    const yOffset = Math.max(0, (supportDepth - piece.depth) / 2);
    return {
      x: Math.max(0, piece.x - xOffset),
      y: Math.max(0, piece.y - yOffset),
      width: supportWidth,
      depth: supportDepth,
      label: `${supportWidth}x${supportDepth}`,
    };
  };
  const isStraightRailPiece = (piece: TrainPiece) =>
    piece.trainObjectType === "trackPiece" &&
    piece.visible !== false &&
    (piece.trackType === "straight" || piece.trackType === "flex" || piece.trackType === "double-straight");
  const straightRailSegments: RailwaySegment[] = (() => {
    const candidates = trainPieces.filter(isStraightRailPiece);
    const groups = new globalThis.Map<string, Array<{ piece: TrainPiece; start: number; end: number; crossStart: number; crossDepth: number }>>();

    candidates.forEach((piece) => {
      const orientation = piece.rotation === 90 || piece.rotation === 270 ? "vertical" : "horizontal";
      const level = piece.level ?? "ground";
      const elevationMode = piece.elevationMode ?? "ground";
      const railLength = Math.max(TRAIN_TRACK_LENGTH, orientation === "horizontal" ? piece.width : piece.depth);
      const crossDepth = TRAIN_TRACK_WIDTH;
      const crossStart =
        orientation === "horizontal"
          ? piece.y + Math.max(0, (piece.depth - crossDepth) / 2)
          : piece.x + Math.max(0, (piece.width - crossDepth) / 2);
      const line = snap(crossStart);
      const start = orientation === "horizontal" ? piece.x : piece.y;
      const end = start + railLength;
      const key = `${orientation}:${line}:${level}:${elevationMode}`;
      const bucket = groups.get(key) ?? [];
      bucket.push({ piece, start, end, crossStart, crossDepth });
      groups.set(key, bucket);
    });

    const segments: RailwaySegment[] = [];
    groups.forEach((items, key) => {
      const [orientation] = key.split(":") as [RailwaySegment["orientation"]];
      const sorted = items.sort((a, b) => a.start - b.start);
      let current: (typeof sorted)[number][] = [];

      const flush = () => {
        if (current.length === 0) return;
        const start = Math.min(...current.map((item) => item.start));
        const end = Math.max(...current.map((item) => item.end));
        const crossStart = Math.min(...current.map((item) => item.crossStart));
        const crossDepth = Math.max(...current.map((item) => item.crossDepth));
        const first = current[0].piece;
        segments.push({
          id: `rail-${current.map((item) => item.piece.id).join("-")}`,
          pieceIds: current.map((item) => item.piece.id),
          orientation,
          x: orientation === "horizontal" ? start : crossStart,
          y: orientation === "horizontal" ? crossStart : start,
          width: orientation === "horizontal" ? end - start : crossDepth,
          depth: orientation === "horizontal" ? crossDepth : end - start,
          level: first.level,
          elevationMode: first.elevationMode,
        });
        current = [];
      };

      sorted.forEach((item) => {
        const previous = current[current.length - 1];
        if (previous && item.start > previous.end + 0.1) flush();
        current.push(item);
      });
      flush();
    });

    return segments;
  })();
  const filteredModularBuildings = modularBuildings.filter((preset) => {
    const search = modularSearch.trim().toLowerCase();
    const modularType = preset.modularType ?? (preset.isCornerBuilding ? "corner" : "straight");
    const matchesSearch =
      !search ||
      preset.name.toLowerCase().includes(search) ||
      preset.setNumber.toLowerCase().includes(search);
    const matchesFilter =
      modularFilter === "all" ||
      (modularFilter === "corner" && modularType === "corner") ||
      (modularFilter === "straight" && modularType !== "corner") ||
      (modularFilter === "residential" && preset.category === "residential") ||
      (modularFilter === "commercial" &&
        ["retail", "restaurants", "entertainment", "industrial"].includes(preset.category)) ||
      (modularFilter === "civic" && preset.category === "civic");
    return matchesSearch && matchesFilter;
  });
  const wizardSteps = [
    "Buildings",
    "MOCs",
    "Roads",
    "Trains",
    "Features",
    "Space",
  ];
  const selectedSpaceFillForGeneration =
    spaceFillChoices.length > 0
      ? spaceFillChoices
      : ["decide" as SpaceFillChoice];
  const runBlueprintGeneration = () => {
    const stages = [
      "Analysing Collection...",
      "Planning Road Network...",
      "Finding Expansion Opportunities...",
      "Generating City Blueprint...",
    ];
    setIsGeneratingBlueprint(true);
    setGenerationStage(stages[0]);
    stages.forEach((stage, index) => {
      window.setTimeout(() => setGenerationStage(stage), index * 420);
    });
    window.setTimeout(() => {
      generateLayout(selectedSpaceFillForGeneration);
      setBlueprintReady(true);
      setIsGeneratingBlueprint(false);
      setShowLayoutFeedbackPrompt(true);
    }, stages.length * 420 + 150);
  };
  const submitFeatureRequest = () => {
    const text = featureRequestText.trim();
    if (!text) return;
    setFeatureRequests((current) => [
      {
        id: newId(),
        text,
        category: featureRequestCategory,
        email: featureRequestEmail.trim() || undefined,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setFeatureRequestText("");
    setFeatureRequestCategory("Buildings");
    setFeatureRequestEmail("");
    setActiveModal(null);
  };
  const submitWaitlist = () => {
    if (!waitlistEmail.trim()) return;
    setWaitlistName("");
    setWaitlistEmail("");
    setWaitlistNotes("");
    setActiveModal(null);
  };
  const closeActiveModal = () => {
    setActiveModal(null);
  };
  const toggleRoadmapVote = (id: string) => {
    setRoadmapVotes((current) => ({
      ...current,
      [id]: !current[id],
    }));
  };
  const submitLayoutFeedback = (useful: boolean, reasons: string[] = []) => {
    setLayoutFeedback((current) => [
      {
        id: newId(),
        useful,
        reasons,
        createdAt: new Date().toISOString(),
        layoutScore: displayCityRating,
      },
      ...current,
    ]);
    setLayoutFeedbackReasons([]);
    setShowLayoutFeedbackPrompt(false);
  };
  const toggleFeedbackReason = (reason: string) => {
    setLayoutFeedbackReasons((current) =>
      current.includes(reason) ? current.filter((item) => item !== reason) : [...current, reason],
    );
  };
  const roadmapItems = roadmapSeedItems.map((item) => ({
    ...item,
    votes: item.votes + (roadmapVotes[item.id] ? 1 : 0),
    voted: Boolean(roadmapVotes[item.id]),
  }));
  const startManualBuildMode = () => {
    setPlanningMode("manual");
    setWizardStep(6);
  };
  const startAutoGenerateMode = () => {
    setPlanningMode("auto");
    setWizardStep(1);
  };
  const openManualEditor = () => {
    if (!validateActiveDimensionInputs()) return;
    pushHistory("Started manual layout");
    setPieces([]);
    setTrainPieces([]);
    setLayoutScore(0);
    setLayoutNotes(["Manual build mode: start with an empty LEGO table and add pieces from the picker"]);
    setObjectWarning("");
    setBlueprintReady(true);
    setPlanningMode("manual");
    fitToScreen();
  };
  const convertGeneratedLayoutToManual = () => {
    setPlanningMode("manual");
    setLayoutNotes((current) => [
      "Manual editing enabled: generated layout converted for hands-on planning",
      ...current,
    ]);
  };
  const cityRatingPanel = (
    <div className={`rounded border px-3 py-2 shadow-sm ${liveCityAnalysis.status.className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-black text-ink">
          City Rating {displayCityRating}% <span className="ml-1">{liveCityAnalysis.status.icon} {liveCityAnalysis.status.label}</span>
        </p>
        <button
          className="rounded bg-white/70 px-2 py-1 text-[11px] font-black uppercase text-ink hover:bg-white"
          onClick={() => setShowAnalysisPanel((current) => !current)}
        >
          {showAnalysisPanel ? "Hide Analysis" : "Show Analysis"}
        </button>
      </div>
      {showAnalysisPanel && (
        <>
          <div className="mt-2 grid gap-2 text-xs md:grid-cols-2">
            <div className="rounded bg-white/55 p-2">
              <p className="font-black uppercase text-lime-900">Why is my score this?</p>
              <div className="mt-1 space-y-1">
                {(liveCityAnalysis.positives.length > 0 ? liveCityAnalysis.positives : ["Add roads, buildings, parks, and plazas to raise your score"]).slice(0, 5).map((item) => (
                  <p key={item}>✓ {item}</p>
                ))}
              </div>
            </div>
            <div className="rounded bg-white/55 p-2">
              <p className="font-black uppercase text-orange-900">Improve next</p>
              <div className="mt-1 space-y-1">
                {(liveCityAnalysis.warnings.length > 0 ? liveCityAnalysis.warnings : ["City balance looks strong"]).slice(0, 5).map((item) => (
                  <p key={item}>⚠ {item}</p>
                ))}
              </div>
            </div>
          </div>
          {liveCityAnalysis.districts.length > 0 && (
            <div className="mt-2 grid gap-1.5 text-xs sm:grid-cols-2 lg:grid-cols-4">
              {liveCityAnalysis.districts.slice(0, 4).map((district) => (
                <div key={district.value} className="rounded bg-white/65 px-2 py-1.5">
                  <p className="font-black text-ink">
                    {district.value === "restaurants" ? "🍴 " : district.value === "retail" ? "🛍 " : district.value === "civic" ? "🏛 " : district.value === "residential" ? "🏠 " : ""}
                    {district.label} District
                  </p>
                  <p className="text-stone-700">Score: {district.score}%</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
  const toggleSpaceChoice = (choice: SpaceFillChoice) => {
    setSpaceFillChoices((current) => {
      if (choice === "decide") return ["decide"];
      const withoutDecide = current.filter((item) => item !== "decide");
      return withoutDecide.includes(choice)
        ? withoutDecide.filter((item) => item !== choice)
        : [...withoutDecide, choice];
    });
  };

  if (!hasStartedBlueprint) {
    return (
      <>
        <main className="min-h-screen bg-sky-100">
          <nav className="absolute left-0 right-0 top-0 z-10 flex flex-wrap items-center justify-end gap-2 px-4 py-3 sm:px-8 sm:py-5">
            <button className="rounded border border-sky-300 bg-white/90 px-3 py-2 text-xs font-black text-sky-950 shadow-sm hover:bg-white sm:px-4 sm:text-sm" onClick={() => setActiveModal("roadmap")}>
              Roadmap
            </button>
            <button className="rounded bg-ink px-3 py-2 text-xs font-black text-white shadow-sm hover:bg-black sm:px-4 sm:text-sm" onClick={() => setActiveModal("featureRequest")}>
              Feedback
            </button>
          </nav>
          <section className="relative overflow-hidden px-4 pb-16 pt-24 sm:px-8 sm:pt-28">
            <div className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: "radial-gradient(circle at 16px 16px, rgba(23,32,38,0.08) 2px, transparent 2px)", backgroundSize: "32px 32px" }} />
            <div className="relative mx-auto max-w-7xl">
              <div className="grid items-center gap-10 lg:grid-cols-[1fr_560px]">
                <div>
                  <div className="inline-flex rounded bg-yellow-300 px-3 py-1 text-xs font-black uppercase tracking-wide text-ink shadow-sm">
                    BrickmansPark Blueprint
                  </div>
                  <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[0.95] tracking-normal text-ink [overflow-wrap:break-word] [text-wrap:balance] sm:text-6xl lg:text-7xl">
                    Stop rebuilding your LEGO city. Plan it first.
                  </h1>
                  <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-blue-900 sm:text-xl">
                    Tell Blueprint what LEGO sets, MOCs, roads and space you own, and generate a city layout before moving a single brick.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <button
                      className="h-12 rounded bg-brick px-6 text-base font-black text-white shadow-panel hover:bg-red-700"
                      onClick={() => setActiveModal("waitlist")}
                    >
                      Join Waitlist
                    </button>
                  </div>
                  <div className="mt-6 grid max-w-xl grid-cols-3 gap-2 text-xs font-black uppercase text-ink">
                    {["Official modulars", "MOCs", "Baseplates"].map((item) => (
                      <span key={item} className="rounded border border-white/70 bg-white/80 px-3 py-2 text-center shadow-sm">{item}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-[18px] border-4 border-white bg-white p-3 shadow-panel">
                  <BlueprintPreview />
                </div>
              </div>

              <section className="mt-14 rounded border-2 border-yellow-300 bg-yellow-50/95 p-6 shadow-panel md:p-8">
                <p className="text-sm font-black uppercase tracking-wide text-yellow-800">Built by a LEGO city builder</p>
                <p className="mt-3 max-w-4xl text-2xl font-black leading-tight text-ink [text-wrap:balance]">
                  After rebuilding my own LEGO city multiple times, I realised there was no easy way to test layouts before moving hundreds of baseplates. Blueprint was created to solve that problem.
                </p>
              </section>

              <section className="mt-14">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-black uppercase tracking-wide text-blue-800">How it works</p>
                    <h2 className="mt-2 text-3xl font-black text-ink">From collection to city plan.</h2>
                  </div>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {[
                    ["1", "Select what you own", "Official modulars, custom MOCs, roads and future train support.", "bg-yellow-200"],
                    ["2", "Enter your space", "Rectangle, L-shape, U-shape or custom layouts.", "bg-sky-200"],
                    ["3", "Generate your city", "Blueprint creates roads, districts, parks, plazas and future expansion zones.", "bg-lime-200"],
                  ].map(([step, title, body, tone]) => (
                    <div key={title} className="rounded border-2 border-white bg-white p-5 shadow-panel">
                      <span className={`flex h-10 w-10 items-center justify-center rounded ${tone} text-lg font-black text-ink`}>{step}</span>
                      <h3 className="mt-4 text-xl font-black text-ink">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-stone-700">{body}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-14 rounded border-4 border-white bg-white p-6 shadow-panel md:p-8">
                <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                  <div>
                    <p className="text-sm font-black uppercase tracking-wide text-green-800">Why Blueprint Exists</p>
                    <p className="mt-3 max-w-3xl text-xl font-black leading-8 text-ink [text-wrap:balance]">
                      I rebuilt my LEGO city multiple times and kept running into the same problems: roads not lining up, modulars in awkward places, wasted table space, and no clear plan for future expansion.
                    </p>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-stone-700">
                      Blueprint was created to solve that problem before moving a single baseplate.
                    </p>
                    <button
                      className="mt-6 h-11 rounded bg-brick px-5 text-sm font-black text-white shadow-panel hover:bg-red-700"
                      onClick={() => setActiveModal("waitlist")}
                    >
                      Join Waitlist
                    </button>
                  </div>
                  <ul className="grid gap-3 text-sm font-bold text-stone-800">
                    {[
                      "Plan your city before rebuilding",
                      "Test layouts before moving buildings",
                      "Make better use of your table space",
                      "Reserve room for future modulars and MOCs",
                      "Build with more confidence",
                    ].map((item) => (
                      <li key={item} className="flex gap-3 rounded border border-lime-200 bg-lime-50 px-3 py-2">
                        <span className="font-black text-lime-700">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section className="mt-14">
                <p className="text-sm font-black uppercase tracking-wide text-red-800">Workshop tools</p>
                <h2 className="mt-2 text-3xl font-black text-ink">Built for the way LEGO cities are actually rebuilt.</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {[
                    ["Smart Building Placement", "Position official modulars and MOCs around streets, corners and districts.", "bg-yellow-100"],
                    ["Intelligent Road Planning", "Generate road networks that serve buildings instead of filling space randomly.", "bg-sky-100"],
                    ["Future Expansion Planning", "Reserve useful plots for shops, parks, landmarks and the next modular you buy.", "bg-lime-100"],
                    ["Live City Rating", "See buildability, city balance and expansion potential as the plan changes.", "bg-orange-100"],
                    ["Build Guide View", "Turn a generated map into practical placement instructions for your table.", "bg-blue-100"],
                    ["Trains Coming In Version 2", "Railway planning, station layouts and elevated rail support are on the roadmap.", "bg-red-100"],
                  ].map(([title, body, tone]) => (
                    <div key={title} className={`rounded border-2 border-white ${tone} p-5 shadow-panel`}>
                      <h3 className="text-lg font-black text-ink">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-stone-700">{body}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-14 rounded border-4 border-white bg-ink p-6 text-white shadow-panel md:p-8">
                <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
                  <div>
                    <p className="text-sm font-black uppercase tracking-wide text-yellow-300">Help Shape Blueprint</p>
                    <h2 className="mt-2 text-3xl font-black">Blueprint is being built with feedback from LEGO city builders.</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-sky-100">
                      Request tools, vote on the roadmap, or join the waitlist as planning features evolve.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className="rounded bg-yellow-300 px-4 py-3 text-sm font-black text-ink hover:bg-yellow-200" onClick={() => setActiveModal("featureRequest")}>
                      Request Feature
                    </button>
                    <button className="rounded border border-white/40 px-4 py-3 text-sm font-black text-white hover:bg-white/10" onClick={() => setActiveModal("roadmap")}>
                      View Roadmap
                    </button>
                    <button
                      className="rounded bg-brick px-4 py-3 text-sm font-black text-white hover:bg-red-700"
                      onClick={() => setActiveModal("waitlist")}
                    >
                      Join Waitlist
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </section>
        </main>
        {showRestorePrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 p-4">
            <div className="w-full max-w-md rounded border border-stone-300 bg-white p-6 shadow-xl">
              <h2 className="text-xl font-black text-ink">Restore previous project?</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Blueprint found an auto-saved project with your buildings, roads, dimensions, and latest layout.
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  className="rounded border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-stone-100"
                  onClick={startNewProject}
                >
                  Start New
                </button>
                <button
                  className="rounded bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-black"
                  onClick={restoreAutoSavedProject}
                >
                  Restore
                </button>
              </div>
            </div>
          </div>
        )}
        {activeModal === "waitlist" && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-950/55 p-4">
            <div className="w-full max-w-xl rounded border border-stone-300 bg-white p-6 shadow-xl">
              <h2 className="text-2xl font-black text-ink">Join the Blueprint Waitlist</h2>
              <label className="mt-5 block space-y-2 text-sm font-semibold text-stone-700">
                Name
                <input
                  value={waitlistName}
                  onChange={(event) => setWaitlistName(event.target.value)}
                  className="h-10 w-full rounded border border-stone-300 px-3 text-sm outline-none focus:border-ink"
                />
              </label>
              <label className="mt-4 block space-y-2 text-sm font-semibold text-stone-700">
                Email
                <input
                  type="email"
                  value={waitlistEmail}
                  onChange={(event) => setWaitlistEmail(event.target.value)}
                  className="h-10 w-full rounded border border-stone-300 px-3 text-sm outline-none focus:border-ink"
                />
              </label>
              <label className="mt-4 block space-y-2 text-sm font-semibold text-stone-700">
                LEGO city size / notes optional
                <textarea
                  value={waitlistNotes}
                  onChange={(event) => setWaitlistNotes(event.target.value)}
                  className="min-h-24 w-full rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-ink"
                />
              </label>
              <div className="mt-5 flex justify-between gap-2">
                <button className="rounded border border-stone-300 px-4 py-2 text-sm font-semibold text-ink hover:bg-stone-100" onClick={closeActiveModal}>
                  Cancel
                </button>
                <button className="rounded bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-black" onClick={submitWaitlist}>
                  Join Waitlist
                </button>
              </div>
            </div>
          </div>
        )}
        {activeModal === "featureRequest" && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-950/55 p-4">
            <div className="w-full max-w-xl rounded border border-stone-300 bg-white p-6 shadow-xl">
              <h2 className="text-2xl font-black text-ink">Feedback</h2>
              <label className="mt-5 block space-y-2 text-sm font-semibold text-stone-700">
                Feedback idea
                <textarea
                  value={featureRequestText}
                  onChange={(event) => setFeatureRequestText(event.target.value)}
                  className="min-h-32 w-full rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-ink"
                />
              </label>
              <label className="mt-4 block space-y-2 text-sm font-semibold text-stone-700">
                Category
                <select
                  value={featureRequestCategory}
                  onChange={(event) => setFeatureRequestCategory(event.target.value as FeatureCategory)}
                  className="h-10 w-full rounded border border-stone-300 bg-white px-3"
                >
                  {featureCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>
              <label className="mt-4 block space-y-2 text-sm font-semibold text-stone-700">
                Optional email
                <input
                  type="email"
                  value={featureRequestEmail}
                  onChange={(event) => setFeatureRequestEmail(event.target.value)}
                  className="h-10 w-full rounded border border-stone-300 px-3 text-sm outline-none focus:border-ink"
                />
              </label>
              <div className="mt-5 flex justify-between gap-2">
                <button className="rounded border border-stone-300 px-4 py-2 text-sm font-semibold text-ink hover:bg-stone-100" onClick={closeActiveModal}>
                  Cancel
                </button>
                <button className="rounded bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-black" onClick={submitFeatureRequest}>
                  Send Feedback
                </button>
              </div>
            </div>
          </div>
        )}
        {activeModal === "roadmap" && (
          <div className="fixed inset-0 z-[60] overflow-y-auto bg-stone-950/55 p-4">
            <div className="mx-auto my-8 w-full max-w-4xl rounded border border-stone-300 bg-white p-6 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black text-ink">🚧 Coming Soon</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
                    Vote on the features you want most. The best future Blueprint features should come from LEGO city builders.
                  </p>
                </div>
                <button className="rounded border border-stone-300 px-3 py-2 text-sm font-semibold text-ink hover:bg-stone-100" onClick={() => setActiveModal(null)}>
                  Close
                </button>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {(["Planned", "In Progress", "Released"] as RoadmapStatus[]).map((status) => (
                  <section key={status} className="rounded border border-stone-200 bg-stone-50 p-3">
                    <h3 className="text-sm font-black uppercase tracking-wide text-stone-600">{status}</h3>
                    <div className="mt-3 space-y-2">
                      {roadmapItems.filter((item) => item.status === status).map((item) => (
                        <button
                          key={item.id}
                          className={`w-full rounded border px-3 py-2 text-left text-sm font-semibold ${item.voted ? "border-lime-400 bg-lime-100 text-lime-950" : "border-stone-300 bg-white text-ink hover:bg-stone-100"}`}
                          onClick={() => toggleRoadmapVote(item.id)}
                        >
                          <span className="block">✓ {item.title}</span>
                          <span className="mt-1 block text-xs text-stone-600">👍 {item.votes} votes</span>
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
              {featureRequests.length > 0 && (
                <section className="mt-6 rounded border border-yellow-200 bg-yellow-50 p-4">
                  <h3 className="text-sm font-black uppercase tracking-wide text-yellow-950">Your submitted ideas</h3>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {featureRequests.slice(0, 6).map((request) => (
                      <div key={request.id} className="rounded bg-white p-3 text-sm">
                        <p className="font-semibold text-ink">{request.text}</p>
                        <p className="mt-1 text-xs font-semibold text-stone-500">{request.category}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              <button className="mt-6 rounded bg-ink px-4 py-2 text-sm font-black text-white hover:bg-black" onClick={() => setActiveModal("featureRequest")}>
                Feedback
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  if (!planningMode) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f3f0e8] px-6">
        <section className="w-full max-w-4xl rounded border border-stone-300 bg-white p-8 shadow-panel">
          <p className="text-xs font-black uppercase tracking-wide text-brick">Choose your planning mode</p>
          <h1 className="mt-2 text-4xl font-black text-ink">How do you want to build today?</h1>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <button
              className="rounded border-2 border-sky-200 bg-sky-50 p-6 text-left transition hover:border-sky-500 hover:bg-sky-100"
              onClick={startAutoGenerateMode}
            >
              <span className="text-4xl" aria-hidden="true">🏙️</span>
              <span className="mt-4 block text-2xl font-black text-ink">Auto Generate Layout</span>
              <span className="mt-2 block text-sm leading-6 text-stone-600">
                Tell Blueprint what you own and we&apos;ll design the city for you.
              </span>
            </button>
            <button
              className="rounded border-2 border-yellow-200 bg-yellow-50 p-6 text-left transition hover:border-yellow-500 hover:bg-yellow-100"
              onClick={startManualBuildMode}
            >
              <span className="text-4xl" aria-hidden="true">🧱</span>
              <span className="mt-4 block text-2xl font-black text-ink">Build Manually</span>
              <span className="mt-2 block text-sm leading-6 text-stone-600">
                Start with an empty table and design everything yourself.
              </span>
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (planningMode === "manual" && !blueprintReady) {
    return (
      <main className="min-h-screen bg-[#f3f0e8]">
        <header className="border-b border-stone-300 bg-white">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
            <div>
              <h1 className="text-xl font-semibold text-ink">Manual Blueprint Setup</h1>
              <p className="text-sm text-stone-600">Enter your table size, then start with a blank LEGO grid.</p>
            </div>
            <button className="text-sm font-semibold text-stone-600 hover:text-ink" onClick={() => setPlanningMode(null)}>
              Change mode
            </button>
          </div>
        </header>
        <section className="mx-auto mt-8 max-w-3xl rounded border border-stone-300 bg-white p-6 shadow-panel">
          <h2 className="text-2xl font-black text-ink">Your Layout</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Dimensions are entered in centimetres. Blueprint converts them to studs for snapping, grid coordinates, and baseplate alignment.
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {(["rectangle", "l-shape", "u-shape"] as LayoutShape[]).map((shape) => (
              <button key={shape} className={`rounded border p-3 text-sm font-semibold ${layoutShape === shape ? "border-ink bg-ink text-white" : "bg-white"}`} onClick={() => setLayoutShape(shape)}>
                {shape === "l-shape" ? "L Shape" : shape === "u-shape" ? "U Shape" : "Rectangle"}
              </button>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <label className="space-y-1 text-sm font-medium text-stone-700">
              {layoutShape === "u-shape" ? "Back width (cm)" : "Width (cm)"}
              <input type="number" value={layoutShape === "u-shape" ? dimensionInputs.uBackWidth : dimensionInputs.tableWidth} onChange={(event) => setDimensionInput(layoutShape === "u-shape" ? "uBackWidth" : "tableWidth", event.target.value)} onBlur={() => layoutShape === "u-shape" ? applyDimensionInput("uBackWidth", "back width", (value) => setUBackWidth(Math.max(16, cmToStuds(value)))) : applyDimensionInput("tableWidth", "table width", updateTableWidth)} className="h-10 w-full rounded border border-stone-300 px-3" />
            </label>
            <label className="space-y-1 text-sm font-medium text-stone-700">
              {layoutShape === "u-shape" ? "Back depth (cm)" : "Depth (cm)"}
              <input type="number" value={layoutShape === "u-shape" ? dimensionInputs.uBackDepth : dimensionInputs.tableDepth} onChange={(event) => setDimensionInput(layoutShape === "u-shape" ? "uBackDepth" : "tableDepth", event.target.value)} onBlur={() => layoutShape === "u-shape" ? applyDimensionInput("uBackDepth", "back depth", (value) => setUBackDepth(Math.max(16, cmToStuds(value)))) : applyDimensionInput("tableDepth", "table depth", updateTableDepth)} className="h-10 w-full rounded border border-stone-300 px-3" />
            </label>
          </div>
          {layoutShape === "l-shape" && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm font-medium text-stone-700">
                Arm width (cm)
                <input type="number" value={dimensionInputs.lArmWidth} onChange={(event) => setDimensionInput("lArmWidth", event.target.value)} onBlur={() => applyDimensionInput("lArmWidth", "arm width", (value) => setLArmWidth(Math.max(16, cmToStuds(value))))} className="h-10 w-full rounded border border-stone-300 px-3" />
              </label>
              <label className="space-y-1 text-sm font-medium text-stone-700">
                Arm length (cm)
                <input type="number" value={dimensionInputs.lArmDepth} onChange={(event) => setDimensionInput("lArmDepth", event.target.value)} onBlur={() => applyDimensionInput("lArmDepth", "arm length", (value) => setLArmDepth(Math.max(16, cmToStuds(value))))} className="h-10 w-full rounded border border-stone-300 px-3" />
              </label>
            </div>
          )}
          {layoutShape === "u-shape" && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {[
                ["uLeftArmLength", "Left arm length"],
                ["uLeftArmWidth", "Left arm width"],
                ["uRightArmLength", "Right arm length"],
                ["uRightArmWidth", "Right arm width"],
                ["uInnerGapWidth", "Inner gap width"],
                ["uInnerGapDepth", "Inner gap depth"],
              ].map(([key, label]) => (
                <label key={key} className="space-y-1 text-sm font-medium text-stone-700">
                  {label} (cm)
                  <input
                    type="number"
                    value={dimensionInputs[key as DimensionInputKey]}
                    onChange={(event) => setDimensionInput(key as DimensionInputKey, event.target.value)}
                    onBlur={() =>
                      applyDimensionInput(key as DimensionInputKey, label.toLowerCase(), (value) => {
                        const next = Math.max(16, cmToStuds(value));
                        if (key === "uLeftArmLength") setULeftArmLength(next);
                        if (key === "uLeftArmWidth") setULeftArmWidth(next);
                        if (key === "uRightArmLength") setURightArmLength(next);
                        if (key === "uRightArmWidth") setURightArmWidth(next);
                        if (key === "uInnerGapWidth") setUInnerGapWidth(next);
                        if (key === "uInnerGapDepth") setUInnerGapDepth(next);
                      })
                    }
                    className="h-10 w-full rounded border border-stone-300 px-3"
                  />
                </label>
              ))}
            </div>
          )}
          {dimensionError && <p className="mt-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{dimensionError}</p>}
          <button className="mt-6 h-11 rounded bg-brick px-5 text-sm font-black text-white hover:bg-red-700" onClick={openManualEditor}>
            Open Blank Blueprint
          </button>
        </section>
      </main>
    );
  }

  if (!blueprintReady) {
    if (isGeneratingBlueprint) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[#f3f0e8] px-6">
          <section className="w-full max-w-xl rounded border border-stone-300 bg-white p-8 text-center shadow-panel">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded bg-brick text-white">
              <Sparkles size={26} aria-hidden="true" />
            </div>
            <h1 className="mt-6 text-3xl font-semibold text-ink">Generating City Blueprint</h1>
            <p className="mt-4 text-lg font-medium text-stone-700">{generationStage}</p>
            <div className="mt-6 h-2 overflow-hidden rounded bg-stone-200">
              <div className="h-full w-2/3 animate-pulse rounded bg-brick" />
            </div>
          </section>
        </main>
      );
    }

    return (
      <main className="min-h-screen bg-[#f3f0e8]">
        <header className="border-b border-stone-300 bg-white">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
            <div>
              <h1 className="text-xl font-semibold text-ink">BrickmansPark Blueprint</h1>
              <p className="text-sm text-stone-600">Tell Blueprint what you own, then let it plan the city.</p>
            </div>
            <span className="rounded bg-stone-100 px-3 py-1 text-sm font-semibold text-stone-700">
              Step {wizardStep} of {wizardSteps.length}
            </span>
          </div>
        </header>
        <section className="mx-auto grid max-w-6xl grid-cols-[220px_minmax(0,1fr)] gap-6 px-6 py-6">
          <aside className="rounded border border-stone-300 bg-white p-3 shadow-panel">
            {wizardSteps.map((step, index) => (
              <button
                key={step}
                className={`mb-1 flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm font-medium ${
                  wizardStep === index + 1 ? "bg-ink text-white" : "text-stone-600 hover:bg-stone-100"
                }`}
                onClick={() => setWizardStep(index + 1)}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded bg-white/20 text-xs">
                  {index + 1}
                </span>
                {step}
              </button>
            ))}
          </aside>

          <section className="rounded border border-stone-300 bg-white p-6 shadow-panel">
            {wizardStep === 1 && (
              <div>
                <h2 className="text-2xl font-semibold text-ink">Official LEGO Buildings</h2>
                <p className="mt-2 text-sm text-stone-600">Select the modular buildings you own.</p>
                <input
                  value={modularSearch}
                  onChange={(event) => setModularSearch(event.target.value)}
                  placeholder="Search by name or set number"
                  className="mt-5 h-11 w-full rounded border border-stone-300 px-3 outline-none focus:border-ink"
                />
                <div className="mt-4 grid max-h-[520px] grid-cols-3 gap-3 overflow-y-auto pr-1">
                  {filteredModularBuildings.map((preset) => {
                    const selected = selectedOfficialSets.includes(preset.setNumber);
                    const modularType = preset.modularType ?? (preset.isCornerBuilding ? "corner" : "straight");
                    return (
                      <button
                        key={preset.setNumber}
                        className={`rounded border p-3 text-left ${
                          selected ? "border-brick bg-red-50 ring-2 ring-brick/25" : "border-stone-200 hover:bg-stone-50"
                        }`}
                        onClick={() => {
                          if (blueprintReady && planningMode === "manual") addOfficialModularBySet(preset.setNumber);
                          else toggleOfficialSet(preset.setNumber);
                        }}
                      >
                        <div className="h-20 overflow-hidden rounded border border-stone-200 bg-stone-100">
                          <ModularCardThumbnail preset={preset} />
                        </div>
                        <p className="mt-2 truncate text-sm font-semibold text-ink">{preset.name}</p>
                        <p className="text-xs text-stone-500">{preset.setNumber} · {preset.widthStuds}x{preset.depthStuds}</p>
                        <span className="mt-2 inline-block rounded bg-stone-100 px-2 py-1 text-[10px] font-semibold uppercase text-stone-600">
                          {modularType === "corner" ? "Corner" : "Straight"}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-5 flex items-center justify-between rounded bg-stone-50 p-4">
                  <div className="text-sm text-stone-700">
                    <strong>Buildings Selected:</strong> {selectedOfficialSets.length}
                    <span className="ml-4"><strong>Estimated Footprint:</strong> {selectedBaseplateEstimate} Baseplates</span>
                  </div>
                  <button className="h-10 rounded bg-ink px-5 text-sm font-semibold text-white" onClick={() => setWizardStep(2)}>
                    Continue
                  </button>
                </div>
              </div>
            )}

            {wizardStep === 2 && (
              <div>
                <h2 className="text-2xl font-semibold text-ink">Custom Buildings &amp; MOCs</h2>
                <p className="mt-2 text-sm text-stone-600">Add any custom buildings you want Blueprint to plan around.</p>
                <button
                  className="mt-5 flex h-10 items-center gap-2 rounded bg-brick px-4 text-sm font-semibold text-white"
                  onClick={() => {
                    resetMocForm();
                    setShowMocForm((value) => !value);
                  }}
                >
                  <Plus size={16} aria-hidden="true" />
                  Add MOC
                </button>
                <div className="mt-4 rounded border border-stone-200 bg-stone-50 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-ink">Your MOCs</h3>
                    <span className="text-xs font-medium text-stone-500">
                      {customMocs.length} added
                    </span>
                  </div>
                  {customMocs.length === 0 ? (
                    <p className="mt-3 rounded border border-dashed border-stone-300 bg-white px-3 py-4 text-sm text-stone-500">
                      No MOCs added yet.
                    </p>
                  ) : (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {customMocs.map((moc) => (
                        <div key={moc.id} className="rounded border border-stone-200 bg-white p-3 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-ink">{moc.name}</p>
                              <p className="mt-1 text-xs text-stone-600">
                                {moc.widthStuds}x{moc.depthStuds} · {moc.modularType === "landmark" ? "Landmark" : moc.modularType[0].toUpperCase() + moc.modularType.slice(1)} · {categoryLabels[moc.category]}
                              </p>
                              <p className="mt-2 text-xs font-semibold text-stone-500">
                                {Math.round((moc.widthStuds * moc.depthStuds) / (32 * 32) * 10) / 10} baseplate{moc.widthStuds * moc.depthStuds === 32 * 32 ? "" : "s"}
                                {moc.silhouetteAsset ? " · custom silhouette" : ""}
                              </p>
                            </div>
                            <div className="flex shrink-0 gap-1">
                            <button
                              className="rounded border border-stone-300 px-2 py-1 text-xs font-semibold hover:bg-stone-100"
                              onClick={() => {
                                setEditingMocId(moc.id);
                                setBuildingName(moc.name);
                                setBuildingWidth(moc.widthStuds);
                                setBuildingDepth(moc.depthStuds);
                                setMocWidthType(
                                  moc.widthStuds === 16 && moc.depthStuds === 32
                                    ? "16x32"
                                    : moc.widthStuds === 32 && moc.depthStuds === 32
                                      ? "32x32"
                                      : moc.widthStuds === 48 && moc.depthStuds === 32
                                        ? "48x32"
                                        : moc.widthStuds === 48 && moc.depthStuds === 48
                                          ? "48x48"
                                          : "custom",
                                );
                                setMocModularType(moc.modularType);
                                setBuildingCategory(moc.category);
                                setMocSilhouetteAsset(moc.silhouetteAsset ?? "");
                                setShowMocForm(true);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="rounded border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setCustomMocs((current) => current.filter((item) => item.id !== moc.id));
                                if (blueprintReady) {
                                  recordLayoutChange(`Deleted ${moc.name}`, () => {
                                    setPieces((current) => current.filter((piece) => piece.id !== `moc-${moc.id}`));
                                  });
                                }
                              }}
                            >
                              Delete
                            </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {showMocForm && (
                  <div className="mt-4 grid grid-cols-2 gap-4 rounded border border-stone-200 bg-stone-50 p-4">
                    <label className="space-y-1 text-sm font-medium text-stone-700">
                      Name
                      <input value={buildingName} onChange={(event) => setBuildingName(event.target.value)} className="h-10 w-full rounded border border-stone-300 px-3" />
                    </label>
                    <label className="space-y-1 text-sm font-medium text-stone-700">
                      Size
                      <select value={mocWidthType} onChange={(event) => setMocWidthType(event.target.value as WidthType)} className="h-10 w-full rounded border border-stone-300 bg-white px-3">
                        <option value="16x32">16x32</option>
                        <option value="32x32">32x32</option>
                        <option value="48x32">48x32</option>
                        <option value="48x48">48x48 landmark</option>
                        <option value="custom">Custom</option>
                      </select>
                    </label>
                    <label className="space-y-1 text-sm font-medium text-stone-700">
                      Type
                      <select value={mocModularType} onChange={(event) => setMocModularType(event.target.value as ModularType)} className="h-10 w-full rounded border border-stone-300 bg-white px-3">
                        <option value="straight">Straight</option>
                        <option value="corner">Corner</option>
                        <option value="landmark">Landmark</option>
                        <option value="freestanding">Freestanding</option>
                      </select>
                    </label>
                    <label className="space-y-1 text-sm font-medium text-stone-700">
                      Category
                      <select value={buildingCategory} onChange={(event) => setBuildingCategory(event.target.value as Category)} className="h-10 w-full rounded border border-stone-300 bg-white px-3">
                        {categoryOptions.filter((item) => item.value !== "park" && item.value !== "entertainment").map((category) => (
                          <option key={category.value} value={category.value}>{category.label}</option>
                        ))}
                      </select>
                    </label>
                    <label className="col-span-2 space-y-1 text-sm font-medium text-stone-700">
                      Custom top-down silhouette (SVG or PNG)
                      <input
                        type="file"
                        accept=".svg,.png,image/svg+xml,image/png"
                        onChange={(event) => loadMocSilhouette(event.target.files?.[0])}
                        className="block w-full text-sm text-stone-600 file:mr-3 file:rounded file:border-0 file:bg-ink file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
                      />
                      <span className="block text-xs font-normal text-stone-500">
                        {mocSilhouetteAsset ? "Custom silhouette attached." : "Optional. Blueprint uses a clean fallback footprint when blank."}
                      </span>
                    </label>
                    <button className="col-span-2 h-10 rounded bg-ink px-4 text-sm font-semibold text-white" onClick={() => { addBuilding(); setShowMocForm(false); }}>
                      {editingMocId ? "Update MOC" : "Save MOC"}
                    </button>
                  </div>
                )}
                <div className="mt-5 rounded bg-stone-50 p-4 text-sm text-stone-700">
                  Running total: <strong>{selectedBuildingCount}</strong> buildings, <strong>{customMocs.length}</strong> custom MOCs, <strong>{selectedBaseplateEstimate}</strong> estimated baseplates
                </div>
                <div className="mt-6 flex justify-between">
                  <button className="h-10 rounded border border-stone-300 px-5 text-sm font-semibold" onClick={() => setWizardStep(1)}>Back</button>
                  <button className="h-10 rounded bg-ink px-5 text-sm font-semibold text-white" onClick={() => setWizardStep(3)}>Continue</button>
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div>
                <h2 className="text-2xl font-semibold text-ink">Road Inventory</h2>
                <p className="mt-2 text-sm text-stone-600">Tell Blueprint what road modules you own.</p>
                <div className="mt-5 flex gap-2">
                  <button className={`rounded border px-3 py-2 text-sm font-semibold ${roadInventoryMode === "unlimited" ? "bg-ink text-white" : "bg-white"}`} onClick={() => setRoadInventoryMode("unlimited")}>I don&apos;t know</button>
                  <button className={`rounded border px-3 py-2 text-sm font-semibold ${roadInventoryMode === "suggest" ? "bg-ink text-white" : "bg-white"}`} onClick={() => setRoadInventoryMode("suggest")}>Assume unlimited roads</button>
                  <button className={`rounded border px-3 py-2 text-sm font-semibold ${roadInventoryMode === "owned" ? "bg-ink text-white" : "bg-white"}`} onClick={() => setRoadInventoryMode("owned")}>Use my quantities</button>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-5">
                  <div>
                    <h3 className="font-semibold text-ink">32x32 Road System</h3>
                    {roadInventoryOptions.slice(0, 5).map((option) => (
                      <label key={option.key} className="mt-3 grid grid-cols-[1fr_90px] items-center gap-3 text-sm text-stone-700">
                        {option.label.replace(" 32x32", "")}
                        <input type="number" min={0} value={roadInventory[option.key]} onChange={(event) => setRoadInventory((current) => ({ ...current, [option.key]: Math.max(0, Number(event.target.value)) }))} className="h-9 rounded border border-stone-300 px-2" />
                      </label>
                    ))}
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink">16x16 Road System</h3>
                    {roadInventoryOptions.slice(5).map((option) => (
                      <label key={option.key} className="mt-3 grid grid-cols-[1fr_90px] items-center gap-3 text-sm text-stone-700">
                        {option.label.replace(" 16x32", "")}
                        <input type="number" min={0} value={roadInventory[option.key]} onChange={(event) => setRoadInventory((current) => ({ ...current, [option.key]: Math.max(0, Number(event.target.value)) }))} className="h-9 rounded border border-stone-300 px-2" />
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mt-6 flex justify-between">
                  <button className="h-10 rounded border border-stone-300 px-5 text-sm font-semibold" onClick={() => setWizardStep(2)}>Back</button>
                  <button className="h-10 rounded bg-ink px-5 text-sm font-semibold text-white" onClick={() => setWizardStep(4)}>Continue</button>
                </div>
              </div>
            )}

            {wizardStep === 4 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Trains (Coming in Version 2)</p>
                <h2 className="mt-2 text-2xl font-semibold text-ink">Trains &amp; Railways</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
                  Train planning is currently being developed and will arrive in Version 2.
                </p>
                <div className="mt-5 rounded border border-stone-200 bg-stone-50 p-4">
                  <p className="text-sm font-semibold text-ink">Version 2 will include:</p>
                  <ul className="mt-3 grid gap-2 text-sm text-stone-700 sm:grid-cols-2">
                    <li>LEGO R40 railway support</li>
                    <li>Loop layouts</li>
                    <li>Point-to-point layouts</li>
                    <li>Railway corridors</li>
                    <li>Station planning</li>
                    <li>Elevated railways</li>
                    <li>Train inventory tracking</li>
                  </ul>
                </div>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-600">
                  For now, Blueprint will focus on generating the best city layout possible using your buildings, roads and available space.
                </p>
                <div className="mt-6 flex justify-between">
                  <button className="h-10 rounded border border-stone-300 px-5 text-sm font-semibold" onClick={() => setWizardStep(3)}>Back</button>
                  <button
                    className="h-10 rounded bg-ink px-5 text-sm font-semibold text-white"
                    onClick={() => {
                      setTrainGenerator("none");
                      setLayoutFeatureChoice("roads");
                      setTrainPieces([]);
                      setWizardStep(5);
                    }}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {wizardStep === 5 && (
              <div>
                <h2 className="text-2xl font-semibold text-ink">What would you like in your city?</h2>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {spaceFillOptions.filter((option) => option.value !== "open-space").map((option) => (
                    <button key={option.value} className={`rounded border px-3 py-2 text-left text-sm font-semibold ${spaceFillChoices.includes(option.value) ? "border-ink bg-ink text-white" : "bg-white"}`} onClick={() => toggleSpaceChoice(option.value)}>
                      {option.label}
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex justify-between">
                  <button className="h-10 rounded border border-stone-300 px-5 text-sm font-semibold" onClick={() => setWizardStep(4)}>Back</button>
                  <button className="h-10 rounded bg-ink px-5 text-sm font-semibold text-white" onClick={() => setWizardStep(6)}>Continue</button>
                </div>
              </div>
            )}

            {wizardStep === 6 && (
              <div>
                <h2 className="text-2xl font-semibold text-ink">Your Layout</h2>
                <p className="mt-2 text-sm text-stone-600">Enter dimensions in centimetres. Blueprint converts to studs behind the scenes.</p>
                <div className="mt-5 grid grid-cols-4 gap-2">
                  {(["rectangle", "l-shape", "u-shape"] as LayoutShape[]).map((shape) => (
                    <button key={shape} className={`rounded border p-3 text-sm font-semibold ${layoutShape === shape ? "border-ink bg-ink text-white" : "bg-white"}`} onClick={() => setLayoutShape(shape)}>
                      {shape === "l-shape" ? "L Shape" : shape === "u-shape" ? "U Shape" : "Rectangle"}
                    </button>
                  ))}
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <label className="space-y-1 text-sm font-medium text-stone-700">
                    {layoutShape === "u-shape" ? "Back width (cm)" : "Width (cm)"}
                    <input type="number" value={layoutShape === "u-shape" ? dimensionInputs.uBackWidth : dimensionInputs.tableWidth} onChange={(event) => setDimensionInput(layoutShape === "u-shape" ? "uBackWidth" : "tableWidth", event.target.value)} onBlur={() => layoutShape === "u-shape" ? applyDimensionInput("uBackWidth", "back width", (value) => setUBackWidth(Math.max(16, cmToStuds(value)))) : applyDimensionInput("tableWidth", "table width", updateTableWidth)} className="h-10 w-full rounded border border-stone-300 px-3" />
                  </label>
                  <label className="space-y-1 text-sm font-medium text-stone-700">
                    {layoutShape === "u-shape" ? "Back depth (cm)" : "Depth (cm)"}
                    <input type="number" value={layoutShape === "u-shape" ? dimensionInputs.uBackDepth : dimensionInputs.tableDepth} onChange={(event) => setDimensionInput(layoutShape === "u-shape" ? "uBackDepth" : "tableDepth", event.target.value)} onBlur={() => layoutShape === "u-shape" ? applyDimensionInput("uBackDepth", "back depth", (value) => setUBackDepth(Math.max(16, cmToStuds(value)))) : applyDimensionInput("tableDepth", "table depth", updateTableDepth)} className="h-10 w-full rounded border border-stone-300 px-3" />
                  </label>
                </div>
                {layoutShape === "l-shape" && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <label className="space-y-1 text-sm font-medium text-stone-700">
                      Arm width (cm)
                      <input type="number" value={dimensionInputs.lArmWidth} onChange={(event) => setDimensionInput("lArmWidth", event.target.value)} onBlur={() => applyDimensionInput("lArmWidth", "arm width", (value) => setLArmWidth(Math.max(16, cmToStuds(value))))} className="h-10 w-full rounded border border-stone-300 px-3" />
                    </label>
                    <label className="space-y-1 text-sm font-medium text-stone-700">
                      Arm length (cm)
                      <input type="number" value={dimensionInputs.lArmDepth} onChange={(event) => setDimensionInput("lArmDepth", event.target.value)} onBlur={() => applyDimensionInput("lArmDepth", "arm length", (value) => setLArmDepth(Math.max(16, cmToStuds(value))))} className="h-10 w-full rounded border border-stone-300 px-3" />
                    </label>
                  </div>
                )}
                {layoutShape === "u-shape" && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {[
                      ["uLeftArmLength", "Left arm length"],
                      ["uLeftArmWidth", "Left arm width"],
                      ["uRightArmLength", "Right arm length"],
                      ["uRightArmWidth", "Right arm width"],
                      ["uInnerGapWidth", "Inner gap width"],
                      ["uInnerGapDepth", "Inner gap depth"],
                    ].map(([key, label]) => (
                      <label key={key} className="space-y-1 text-sm font-medium text-stone-700">
                        {label} (cm)
                        <input
                          type="number"
                          value={dimensionInputs[key as DimensionInputKey]}
                          onChange={(event) => setDimensionInput(key as DimensionInputKey, event.target.value)}
                          onBlur={() =>
                            applyDimensionInput(key as DimensionInputKey, label.toLowerCase(), (value) => {
                              const next = Math.max(16, cmToStuds(value));
                              if (key === "uLeftArmLength") setULeftArmLength(next);
                              if (key === "uLeftArmWidth") setULeftArmWidth(next);
                              if (key === "uRightArmLength") setURightArmLength(next);
                              if (key === "uRightArmWidth") setURightArmWidth(next);
                              if (key === "uInnerGapWidth") setUInnerGapWidth(next);
                              if (key === "uInnerGapDepth") setUInnerGapDepth(next);
                            })
                          }
                          className="h-10 w-full rounded border border-stone-300 px-3"
                        />
                      </label>
                    ))}
                  </div>
                )}
                <label className="mt-4 flex items-start gap-3 rounded border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700">
                  <input type="checkbox" checked={bridgeTableJoins} onChange={(event) => setBridgeTableJoins(event.target.checked)} className="mt-1" />
                  Baseplates may bridge connected table sections.
                </label>
                <label className="mt-4 block space-y-1 text-sm font-medium text-stone-700">
                  Overhang
                  <select
                    value={overhangMode}
                    onChange={(event) => setOverhangMode(event.target.value as OverhangMode)}
                    className="h-10 w-full rounded border border-stone-300 bg-white px-3"
                  >
                    <option value="none">No overhang</option>
                    <option value="slight">Slight overhang</option>
                    <option value="moderate">Moderate overhang</option>
                  </select>
                </label>
                <div className="mt-6 flex justify-between">
                  <button className="h-10 rounded border border-stone-300 px-5 text-sm font-semibold" onClick={() => setWizardStep(5)}>Back</button>
                  <div className="text-right">
                    <p className="mb-2 text-xs font-medium text-stone-600">{generationInputSummary}</p>
                    <button
                      className="h-10 rounded bg-brick px-5 text-sm font-semibold text-white"
                      onClick={() => {
                        if (validateActiveDimensionInputs()) runBlueprintGeneration();
                      }}
                    >
                      Generate Blueprint
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </section>
      </main>
    );
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-[#f3f0e8]">
      <header className="shrink-0 border-b border-stone-300 bg-white">
        <div className="flex h-16 items-center justify-between gap-3 overflow-visible px-3 sm:px-4 lg:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-brick text-white">
              <Map className="h-[22px] w-[22px]" aria-hidden="true" />
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="whitespace-nowrap text-sm font-black leading-tight text-ink">BrickmansPark</p>
              <p className="whitespace-nowrap text-xs font-black uppercase leading-tight text-stone-500">Blueprint</p>
            </div>
            <input
              className="h-10 min-w-0 max-w-[220px] flex-1 rounded border border-stone-300 bg-white px-3 text-sm font-semibold text-ink outline-none focus:border-ink lg:max-w-[320px]"
              value={layoutName}
              onChange={(event) => setLayoutName(event.target.value)}
              aria-label="Layout name"
            />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="flex items-center gap-1.5">
              <button
                className="flex h-10 items-center gap-2 whitespace-nowrap rounded bg-brick px-3 text-sm font-black text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-45"
                onClick={() => generateLayout(selectedSpaceFillForGeneration)}
                disabled={planningMode !== "manual" && !hasBuildings}
                title={planningMode === "auto" ? "Regenerate layout" : "Generate layout"}
              >
                <Sparkles size={16} aria-hidden="true" />
                <span className="hidden md:inline">{planningMode === "auto" ? "Regenerate" : "Generate"}</span>
              </button>
              <button
                className="flex h-10 items-center gap-2 whitespace-nowrap rounded border border-sky-300 bg-sky-50 px-3 text-sm font-black text-sky-950 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-45"
                onClick={convertGeneratedLayoutToManual}
                disabled={planningMode !== "auto"}
              >
                Edit
              </button>
              <button
                className="flex h-10 items-center gap-2 whitespace-nowrap rounded bg-ink px-3 text-sm font-black text-white hover:bg-black"
                onClick={saveLayout}
              >
                <Save size={16} aria-hidden="true" />
                <span className="hidden sm:inline">Save</span>
              </button>
            </div>

            <div className="hidden rounded border border-stone-300 bg-white p-0.5 sm:flex">
              <button
                className="flex h-9 items-center gap-1 whitespace-nowrap rounded px-2 text-xs font-semibold text-ink hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                onClick={undoLayoutChange}
                disabled={undoStack.length === 0}
                aria-label="Undo"
                title="Undo (Ctrl/Cmd+Z)"
              >
                <Undo2 size={15} aria-hidden="true" />
                <span className="hidden lg:inline">Undo</span>
              </button>
              <button
                className="flex h-9 items-center gap-1 whitespace-nowrap rounded px-2 text-xs font-semibold text-ink hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                onClick={redoLayoutChange}
                disabled={redoStack.length === 0}
                aria-label="Redo"
                title="Redo (Ctrl+Y or Ctrl/Cmd+Shift+Z)"
              >
                <Redo2 size={15} aria-hidden="true" />
                <span className="hidden lg:inline">Redo</span>
              </button>
            </div>
            <button
              className="hidden h-10 items-center gap-2 whitespace-nowrap rounded border border-stone-300 bg-white px-3 text-sm font-semibold text-ink hover:bg-stone-100 md:flex"
              onClick={exportImage}
            >
              <Download size={16} aria-hidden="true" />
              Export
            </button>

            <div className="relative">
              <button
                className="flex h-10 items-center gap-1 whitespace-nowrap rounded border border-stone-300 bg-white px-3 text-sm font-black text-ink shadow-sm hover:bg-stone-50"
                onClick={() => setShowMoreMenu((current) => !current)}
                aria-expanded={showMoreMenu}
              >
                More
              </button>
              {showMoreMenu && (
                <div className="absolute right-0 top-12 z-50 w-48 rounded border border-stone-300 bg-white p-1.5 text-sm shadow-xl">
                  <button
                    className="flex w-full items-center justify-between rounded px-3 py-2 text-left font-semibold text-ink hover:bg-stone-100"
                    onClick={() => {
                      setShowMoreMenu(false);
                      setActiveModal("roadmap");
                    }}
                  >
                    Roadmap
                  </button>
                  <button
                    className="flex w-full items-center justify-between rounded px-3 py-2 text-left font-semibold text-ink hover:bg-stone-100"
                    onClick={() => {
                      setShowMoreMenu(false);
                      setActiveModal("featureRequest");
                    }}
                  >
                    Feedback
                  </button>
                  <button
                    className="flex w-full items-center justify-between rounded px-3 py-2 text-left font-semibold text-red-700 hover:bg-red-50"
                    onClick={() => {
                      setShowMoreMenu(false);
                      setShowClearLayoutPrompt(true);
                    }}
                  >
                    Clear Layout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className={`grid min-h-0 flex-1 gap-3 p-3 ${
        sidebarCollapsed
          ? "grid-cols-[56px_minmax(0,1fr)]"
          : "grid-cols-[56px_minmax(0,1fr)] lg:grid-cols-[minmax(260px,20vw)_minmax(0,1fr)]"
      }`}>
        <aside className={sidebarCollapsed ? "min-h-0 overflow-hidden" : "max-lg:fixed max-lg:bottom-3 max-lg:left-3 max-lg:top-20 max-lg:z-50 max-lg:w-[min(340px,calc(100vw-24px))] min-h-0 space-y-4 overflow-y-auto pr-1"}>
          {sidebarCollapsed ? (
            <div className="flex h-full flex-col items-center gap-2 rounded border border-stone-300 bg-white p-2 shadow-panel">
              <button
                className="flex h-10 w-10 items-center justify-center rounded bg-ink text-lg font-black text-white hover:bg-black"
                onClick={() => setSidebarCollapsed(false)}
                title="Expand panel"
                aria-label="Expand panel"
              >
                ☰
              </button>
              {[
                { label: "Layout shape", icon: <Map size={18} aria-hidden="true" />, action: () => setSidebarCollapsed(false) },
                { label: "Buildings", icon: <Building2 size={18} aria-hidden="true" />, action: () => { setPickerTab("buildings"); setSidebarCollapsed(false); } },
                { label: "Roads", icon: <Route size={18} aria-hidden="true" />, action: () => { setPickerTab("roads"); setSidebarCollapsed(false); } },
                { label: "Features", icon: <Plus size={18} aria-hidden="true" />, action: () => setSidebarCollapsed(false) },
                { label: "Settings", icon: <Filter size={18} aria-hidden="true" />, action: () => setSidebarCollapsed(false) },
              ].map((item) => (
                <button
                  key={item.label}
                  className="flex h-10 w-10 items-center justify-center rounded border border-stone-200 bg-stone-50 text-ink hover:bg-yellow-100"
                  onClick={item.action}
                  title={item.label}
                  aria-label={item.label}
                >
                  {item.icon}
                </button>
              ))}
            </div>
          ) : (
            <>
          <section className="rounded border border-stone-300 bg-white p-3 shadow-panel">
            <button
              className="flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded border border-stone-300 bg-white px-3 text-sm font-black text-ink hover:bg-stone-100"
              onClick={() => setSidebarCollapsed(true)}
            >
              ◀ Collapse Panel
            </button>
          </section>
          <section className="rounded border border-yellow-300 bg-yellow-50 p-4 shadow-panel">
            <p className="text-sm font-black text-ink">Message from BrickmansPark</p>
            <p className="mt-2 text-xs leading-5 text-stone-700">
              Blueprint is built by a LEGO city builder, for LEGO city builders. Have an idea? Share feedback below.
            </p>
            <div className="mt-3 flex gap-2">
              <button className="rounded bg-ink px-3 py-2 text-xs font-black text-white hover:bg-black" onClick={() => setActiveModal("featureRequest")}>
                Feedback
              </button>
              <button className="rounded border border-stone-300 bg-white px-3 py-2 text-xs font-black text-ink hover:bg-stone-100" onClick={() => setActiveModal("roadmap")}>
                View Roadmap
              </button>
            </div>
          </section>
          <section className="rounded border border-stone-300 bg-white p-5 shadow-panel">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Layout Shape
            </h2>
            <label className="mt-4 block space-y-1 text-sm font-medium text-stone-700">
              Shape
              <select
                value={layoutShape}
                onChange={(event) => setLayoutShape(event.target.value as LayoutShape)}
                className="h-10 w-full rounded border border-stone-300 bg-white px-3 outline-none focus:border-ink"
              >
                <option value="rectangle">Rectangle</option>
                <option value="l-shape">L-shape</option>
                <option value="u-shape">U-shape</option>
                <option value="custom">Custom multi-section layout</option>
              </select>
            </label>

            <label className="mt-4 flex items-start gap-3 rounded border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={bridgeTableJoins}
                onChange={(event) => setBridgeTableJoins(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-stone-300 text-ink focus:ring-ink"
              />
              <span>
                <span className="block font-semibold text-stone-900">Bridge Table Joins</span>
                <span className="mt-1 block text-xs leading-5 text-stone-600">
                  Allow baseplates, roads, and buildings to span connected table sections.
                </span>
              </span>
            </label>

            <label className="mt-4 block space-y-1 text-sm font-medium text-stone-700">
              Overhang
              <select
                value={overhangMode}
                onChange={(event) => setOverhangMode(event.target.value as OverhangMode)}
                className="h-10 w-full rounded border border-stone-300 bg-white px-3 outline-none focus:border-ink"
              >
                <option value="none">No overhang</option>
                <option value="slight">Slight overhang</option>
                <option value="moderate">Moderate overhang</option>
              </select>
              <span className="block text-xs leading-5 text-stone-600">
                {overhangMode === "none"
                  ? "Objects must sit fully inside the usable table footprint."
                  : overhangMode === "slight"
                    ? "Allows up to 8 studs beyond the edge with at least 75% support."
                    : "Allows up to 16 studs beyond the edge with at least 60% support."}
              </span>
            </label>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm font-medium text-stone-700">
                {layoutShape === "u-shape" ? "Back width (cm)" : "Width (cm)"}
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={layoutShape === "u-shape" ? dimensionInputs.uBackWidth : dimensionInputs.tableWidth}
                  onChange={(event) =>
                    setDimensionInput(
                      layoutShape === "u-shape" ? "uBackWidth" : "tableWidth",
                      event.target.value,
                    )
                  }
                  onBlur={() =>
                    layoutShape === "u-shape"
                      ? applyDimensionInput("uBackWidth", "back width", (value) =>
                          setUBackWidth(Math.max(16, cmToStuds(value))),
                        )
                      : applyDimensionInput("tableWidth", "table width", updateTableWidth)
                  }
                  className="h-10 w-full rounded border border-stone-300 px-3 outline-none focus:border-ink"
                />
              </label>
              <label className="space-y-1 text-sm font-medium text-stone-700">
                {layoutShape === "u-shape" ? "Back depth (cm)" : "Depth (cm)"}
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={layoutShape === "u-shape" ? dimensionInputs.uBackDepth : dimensionInputs.tableDepth}
                  onChange={(event) =>
                    setDimensionInput(
                      layoutShape === "u-shape" ? "uBackDepth" : "tableDepth",
                      event.target.value,
                    )
                  }
                  onBlur={() =>
                    layoutShape === "u-shape"
                      ? applyDimensionInput("uBackDepth", "back depth", (value) =>
                          setUBackDepth(Math.max(16, cmToStuds(value))),
                        )
                      : applyDimensionInput("tableDepth", "table depth", updateTableDepth)
                  }
                  className="h-10 w-full rounded border border-stone-300 px-3 outline-none focus:border-ink"
                />
              </label>
            </div>

            {layoutShape === "l-shape" && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="space-y-1 text-sm font-medium text-stone-700">
                  Arm width (cm)
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={dimensionInputs.lArmWidth}
                    onChange={(event) => setDimensionInput("lArmWidth", event.target.value)}
                    onBlur={() =>
                      applyDimensionInput("lArmWidth", "arm width", (value) =>
                        setLArmWidth(Math.max(16, cmToStuds(value))),
                      )
                    }
                    className="h-10 w-full rounded border border-stone-300 px-3 outline-none focus:border-ink"
                  />
                </label>
                <label className="space-y-1 text-sm font-medium text-stone-700">
                  Arm length (cm)
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={dimensionInputs.lArmDepth}
                    onChange={(event) => setDimensionInput("lArmDepth", event.target.value)}
                    onBlur={() =>
                      applyDimensionInput("lArmDepth", "arm length", (value) =>
                        setLArmDepth(Math.max(16, cmToStuds(value))),
                      )
                    }
                    className="h-10 w-full rounded border border-stone-300 px-3 outline-none focus:border-ink"
                  />
                </label>
              </div>
            )}

            {layoutShape === "u-shape" && (
              <div className="mt-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1 text-sm font-medium text-stone-700">
                    Left arm length (cm)
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={dimensionInputs.uLeftArmLength}
                      onChange={(event) => setDimensionInput("uLeftArmLength", event.target.value)}
                      onBlur={() =>
                        applyDimensionInput("uLeftArmLength", "left arm length", (value) =>
                          setULeftArmLength(Math.max(16, cmToStuds(value))),
                        )
                      }
                      className="h-10 w-full rounded border border-stone-300 px-3 outline-none focus:border-ink"
                    />
                  </label>
                  <label className="space-y-1 text-sm font-medium text-stone-700">
                    Left arm width (cm)
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={dimensionInputs.uLeftArmWidth}
                      onChange={(event) => setDimensionInput("uLeftArmWidth", event.target.value)}
                      onBlur={() =>
                        applyDimensionInput("uLeftArmWidth", "left arm width", (value) =>
                          setULeftArmWidth(Math.max(16, cmToStuds(value))),
                        )
                      }
                      className="h-10 w-full rounded border border-stone-300 px-3 outline-none focus:border-ink"
                    />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1 text-sm font-medium text-stone-700">
                    Right arm length (cm)
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={dimensionInputs.uRightArmLength}
                      onChange={(event) => setDimensionInput("uRightArmLength", event.target.value)}
                      onBlur={() =>
                        applyDimensionInput("uRightArmLength", "right arm length", (value) =>
                          setURightArmLength(Math.max(16, cmToStuds(value))),
                        )
                      }
                      className="h-10 w-full rounded border border-stone-300 px-3 outline-none focus:border-ink"
                    />
                  </label>
                  <label className="space-y-1 text-sm font-medium text-stone-700">
                    Right arm width (cm)
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={dimensionInputs.uRightArmWidth}
                      onChange={(event) => setDimensionInput("uRightArmWidth", event.target.value)}
                      onBlur={() =>
                        applyDimensionInput("uRightArmWidth", "right arm width", (value) =>
                          setURightArmWidth(Math.max(16, cmToStuds(value))),
                        )
                      }
                      className="h-10 w-full rounded border border-stone-300 px-3 outline-none focus:border-ink"
                    />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1 text-sm font-medium text-stone-700">
                    Inner gap width (cm)
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={dimensionInputs.uInnerGapWidth}
                      onChange={(event) => setDimensionInput("uInnerGapWidth", event.target.value)}
                      onBlur={() =>
                        applyDimensionInput("uInnerGapWidth", "inner gap width", (value) =>
                          setUInnerGapWidth(Math.max(16, cmToStuds(value))),
                        )
                      }
                      className="h-10 w-full rounded border border-stone-300 px-3 outline-none focus:border-ink"
                    />
                  </label>
                  <label className="space-y-1 text-sm font-medium text-stone-700">
                    Inner gap depth (cm)
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={dimensionInputs.uInnerGapDepth}
                      onChange={(event) => setDimensionInput("uInnerGapDepth", event.target.value)}
                      onBlur={() =>
                        applyDimensionInput("uInnerGapDepth", "inner gap depth", (value) =>
                          setUInnerGapDepth(Math.max(16, cmToStuds(value))),
                        )
                      }
                      className="h-10 w-full rounded border border-stone-300 px-3 outline-none focus:border-ink"
                    />
                  </label>
                </div>
              </div>
            )}

            {layoutShape === "custom" && (
              <div className="mt-3 space-y-3">
                {customSections.map((section) => (
                  <div key={section.id} className="rounded border border-stone-200 bg-stone-50 p-3">
                    <p className="mb-2 text-xs font-semibold uppercase text-stone-500">
                      {section.name}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {(["widthStuds", "depthStuds", "x", "y"] as const).map((field) => (
                        <label key={field} className="space-y-1 text-xs font-medium text-stone-700">
                          {field === "widthStuds"
                            ? "Width (cm)"
                            : field === "depthStuds"
                              ? "Depth (cm)"
                              : `${field.toUpperCase()} (cm)`}
                          <input
                            type="number"
                            min={field === "x" || field === "y" ? 0 : 1}
                            step={1}
                            value={customSectionInputs[section.id]?.[field] ?? String(studsToCm(section[field]))}
                            onChange={(event) =>
                              setCustomSectionInput(section.id, field, event.target.value)
                            }
                            onBlur={() =>
                              applyCustomSectionInput(
                                section.id,
                                field,
                                field === "widthStuds"
                                  ? `${section.name} width`
                                  : field === "depthStuds"
                                    ? `${section.name} depth`
                                    : `${section.name} ${field.toUpperCase()}`,
                              )
                            }
                            className="h-9 w-full rounded border border-stone-300 px-2 outline-none focus:border-ink"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <button
                  className="flex h-9 w-full items-center justify-center gap-2 rounded border border-stone-300 bg-white text-sm font-medium text-ink hover:bg-stone-100"
                  onClick={addCustomSection}
                >
                  <Plus size={15} aria-hidden="true" />
                  Add section
                </button>
              </div>
            )}

            <p className="mt-3 text-xs text-stone-500">
              Table: {studsToCm(layoutGeometry.width)}cm x {studsToCm(layoutGeometry.depth)}cm.
              Build grid: {Math.round(layoutGeometry.width)} x {Math.round(layoutGeometry.depth)} studs.
              Objects snap to LEGO baseplate modules and may span connected table joins when bridging is enabled.
            </p>
            {dimensionError && (
              <p className="mt-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {dimensionError}
              </p>
            )}
          </section>

          <section className="rounded border border-stone-300 bg-white p-5 shadow-panel">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Object picker
            </h2>
            {planningMode === "manual" && (
              <p className="mt-2 rounded border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs font-semibold text-yellow-950">
                Manual mode: choose buildings, roads, and features below to add them directly to the blank blueprint.
              </p>
            )}
            {planningMode !== "manual" && <div className="mt-4">
              <label className="block space-y-1 text-sm font-medium text-stone-700">
                Road planning
                <select
                  value={layoutFeatureChoice}
                  onChange={(event) => setLayoutFeatureChoice(event.target.value as LayoutFeatureChoice)}
                  className="h-10 w-full rounded border border-stone-300 bg-white px-3 outline-none focus:border-ink"
                >
                  <option value="roads">Roads</option>
                  <option value="neither">Neither</option>
                </select>
              </label>
              <label className="mt-3 block space-y-1 text-sm font-medium text-stone-700">
                Road type
                <select
                  value={roadSystem}
                  onChange={(event) => setRoadSystem(event.target.value as RoadSystem)}
                  className="h-10 w-full rounded border border-stone-300 bg-white px-3 outline-none focus:border-ink"
                >
                  {roadSystemOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded bg-ink px-4 text-sm font-medium text-white hover:bg-black"
                onClick={() => generateLayout()}
              >
                <Sparkles size={16} aria-hidden="true" />
                Generate Layout
              </button>
              <p className="mt-2 text-xs font-medium text-stone-500">{generationInputSummary}</p>
            </div>}
            <div className="mt-4 grid grid-cols-2 gap-2 rounded bg-stone-100 p-1">
              {[
                { id: "buildings" as const, label: "Buildings", icon: Building2 },
                { id: "roads" as const, label: "Roads", icon: Route },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={`flex h-9 items-center justify-center gap-1 rounded text-xs font-medium ${
                      pickerTab === tab.id
                        ? "bg-white text-ink shadow-sm"
                        : "text-stone-600 hover:bg-stone-200"
                    }`}
                    onClick={() => setPickerTab(tab.id)}
                  >
                    <Icon size={14} aria-hidden="true" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {pickerTab === "buildings" && (
              <div className="mt-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-ink">Official Modulars</h3>
                    <span className="text-xs font-medium text-stone-500">
                      {selectedOfficialSets.length} selected
                    </span>
                  </div>
                  <input
                    value={modularSearch}
                    onChange={(event) => setModularSearch(event.target.value)}
                    placeholder="Search by name or set number"
                    className="mt-3 h-9 w-full rounded border border-stone-300 bg-white px-3 text-sm outline-none focus:border-ink"
                  />
                  <div className="mt-2 flex flex-wrap gap-1">
                    {modularCardFilters.map((filter) => (
                      <button
                        key={filter.value}
                        className={`rounded border px-2 py-1 text-xs font-medium ${
                          modularFilter === filter.value
                            ? "border-ink bg-ink text-white"
                            : "border-stone-300 bg-white text-stone-600 hover:bg-stone-100"
                        }`}
                        onClick={() => setModularFilter(filter.value)}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {filteredModularBuildings.map((preset) => {
                      const selected = selectedOfficialSets.includes(preset.setNumber);
                      const modularType = preset.modularType ?? (preset.isCornerBuilding ? "corner" : "straight");
                      return (
                        <button
                          key={preset.setNumber}
                          className={`min-h-[142px] rounded border p-2 text-left transition ${
                            selected
                              ? "border-brick bg-red-50 ring-2 ring-brick/30"
                              : "border-stone-200 bg-white hover:border-stone-400 hover:bg-stone-50"
                          }`}
                          onClick={() => {
                            if (blueprintReady && planningMode === "manual") addOfficialModularBySet(preset.setNumber);
                            else toggleOfficialSet(preset.setNumber);
                          }}
                          aria-pressed={selected}
                        >
                          <div className="h-16 overflow-hidden rounded border border-stone-200 bg-stone-100">
                            <ModularCardThumbnail preset={preset} />
                          </div>
                          <div
                            className="mt-2 h-1.5 rounded-full"
                            style={{ backgroundColor: categorySwatches[preset.category as Piece["category"]] ?? "#d8b4fe" }}
                          />
                          <div className="mt-2 flex items-start gap-2">
                            <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${
                              selected ? "border-brick bg-brick text-white" : "border-stone-400 bg-white"
                            }`}>
                              {selected ? "✓" : ""}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-xs font-semibold text-ink">
                                {preset.name}
                              </span>
                              <span className="block text-[11px] text-stone-500">
                                {preset.setNumber} · {preset.widthStuds}x{preset.depthStuds}
                              </span>
                            </span>
                          </div>
                          <div className="mt-2 flex gap-1">
                            <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-stone-600">
                              {modularType === "corner" ? "Corner" : "Straight"}
                            </span>
                            <span
                              className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase text-ink"
                              style={{ backgroundColor: categorySwatches[preset.category as Piece["category"]] ?? "#d8b4fe" }}
                            >
                              {categoryLabels[preset.category as Category] ?? preset.category}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded border border-stone-300 bg-stone-50 p-3">
                  <h3 className="text-sm font-semibold text-ink">Selected Buildings</h3>
                  {selectedBuildingCount > 0 ? (
                    <div className="mt-2 space-y-2">
                      <div className="max-h-24 overflow-hidden text-xs leading-5 text-stone-700">
                        {[...selectedOfficialPresets.map((preset) => preset.name), ...ownedMocs.map((piece) => piece.name)].slice(0, 10).map((name) => (
                          <div key={name} className="truncate">- {name}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded bg-white p-2">
                          <span className="block text-stone-500">Total</span>
                          <span className="font-semibold text-ink">{selectedBuildingCount} buildings</span>
                        </div>
                        <div className="rounded bg-white p-2">
                          <span className="block text-stone-500">Footprint</span>
                          <span className="font-semibold text-ink">
                            {selectedFootprintWidth} x {selectedFootprintDepth || 0} studs
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-stone-500">Select modulars or add a MOC to start.</p>
                  )}
                </div>

                <div className="rounded border border-stone-300 bg-white p-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-ink">MOCs</h3>
                    <button
                      className="flex h-8 items-center gap-1 rounded bg-brick px-3 text-xs font-semibold text-white hover:bg-red-700"
                      onClick={() => {
                        resetMocForm();
                        setShowMocForm((value) => !value);
                      }}
                    >
                      <Plus size={14} aria-hidden="true" />
                      Add MOC
                    </button>
                  </div>
                  {ownedMocs.length > 0 && (
                    <div className="mt-2 space-y-1 text-xs text-stone-600">
                      {ownedMocs.map((moc) => (
                        <div key={moc.id} className="flex items-center justify-between gap-2">
                          <span className="truncate">
                            {moc.name} · {moc.widthStuds}x{moc.depthStuds} · {moc.modularType}
                          </span>
                          <span className="flex gap-1">
                            <button
                              className="rounded border border-stone-300 px-1.5 py-0.5 font-semibold hover:bg-stone-100"
                              onClick={() => {
                                setEditingMocId(moc.id);
                                setBuildingName(moc.name);
                                setBuildingWidth(moc.widthStuds);
                                setBuildingDepth(moc.depthStuds);
                                setMocWidthType(
                                  moc.widthStuds === 16 && moc.depthStuds === 32
                                    ? "16x32"
                                    : moc.widthStuds === 32 && moc.depthStuds === 32
                                      ? "32x32"
                                      : moc.widthStuds === 48 && moc.depthStuds === 32
                                        ? "48x32"
                                        : moc.widthStuds === 48 && moc.depthStuds === 48
                                          ? "48x48"
                                          : "custom",
                                );
                                setMocModularType(moc.modularType);
                                setBuildingCategory(moc.category);
                                setMocSilhouetteAsset(moc.silhouetteAsset ?? "");
                                setShowMocForm(true);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="rounded border border-red-200 px-1.5 py-0.5 font-semibold text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setCustomMocs((current) => current.filter((item) => item.id !== moc.id));
                                if (blueprintReady) {
                                  recordLayoutChange(`Deleted ${moc.name}`, () => {
                                    setPieces((current) => current.filter((piece) => piece.id !== `moc-${moc.id}`));
                                  });
                                }
                              }}
                            >
                              Delete
                            </button>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {showMocForm && (
                    <div className="mt-3 space-y-3 border-t border-stone-200 pt-3">
                      <label className="space-y-1 text-sm font-medium text-stone-700">
                        Name
                        <input
                          value={buildingName}
                          onChange={(event) => setBuildingName(event.target.value)}
                          className="h-10 w-full rounded border border-stone-300 px-3 outline-none focus:border-ink"
                        />
                      </label>
                      <label className="space-y-1 text-sm font-medium text-stone-700">
                        Size
                        <select
                          value={mocWidthType}
                          onChange={(event) => setMocWidthType(event.target.value as WidthType)}
                          className="h-10 w-full rounded border border-stone-300 bg-white px-3 outline-none focus:border-ink"
                        >
                          <option value="16x32">16x32</option>
                          <option value="32x32">32x32</option>
                          <option value="48x32">48x32</option>
                          <option value="48x48">48x48 landmark</option>
                          <option value="custom">Custom</option>
                        </select>
                      </label>
                      {mocWidthType === "custom" && (
                        <div className="grid grid-cols-2 gap-3">
                          <label className="space-y-1 text-sm font-medium text-stone-700">
                            Width
                            <input
                              type="number"
                              min={16}
                              step={16}
                              value={buildingWidth}
                              onChange={(event) => setBuildingWidth(Number(event.target.value))}
                              className="h-10 w-full rounded border border-stone-300 px-3 outline-none focus:border-ink"
                            />
                          </label>
                          <label className="space-y-1 text-sm font-medium text-stone-700">
                            Depth
                            <input
                              type="number"
                              min={16}
                              step={16}
                              value={buildingDepth}
                              onChange={(event) => setBuildingDepth(Number(event.target.value))}
                              className="h-10 w-full rounded border border-stone-300 px-3 outline-none focus:border-ink"
                            />
                          </label>
                        </div>
                      )}
                      <label className="space-y-1 text-sm font-medium text-stone-700">
                        Type
                        <select
                          value={mocModularType}
                          onChange={(event) => setMocModularType(event.target.value as ModularType)}
                          className="h-10 w-full rounded border border-stone-300 bg-white px-3 outline-none focus:border-ink"
                        >
                          <option value="straight">Straight modular</option>
                          <option value="corner">Corner modular</option>
                          <option value="landmark">Landmark</option>
                          <option value="freestanding">Freestanding building</option>
                        </select>
                      </label>
                      <label className="space-y-1 text-sm font-medium text-stone-700">
                        Category
                        <select
                          value={buildingCategory}
                          onChange={(event) => setBuildingCategory(event.target.value as Category)}
                          className="h-10 w-full rounded border border-stone-300 bg-white px-3 outline-none focus:border-ink"
                        >
                          {categoryOptions.map((category) => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-1 text-sm font-medium text-stone-700">
                        Custom top-down silhouette (SVG or PNG)
                        <input
                          type="file"
                          accept=".svg,.png,image/svg+xml,image/png"
                          onChange={(event) => loadMocSilhouette(event.target.files?.[0])}
                          className="block w-full text-xs text-stone-600 file:mr-3 file:rounded file:border-0 file:bg-ink file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
                        />
                        <span className="block text-xs font-normal text-stone-500">
                          {mocSilhouetteAsset ? "Custom silhouette attached." : "Optional. Blank MOCs use Blueprint's simplified footprint."}
                        </span>
                      </label>
                      <button
                        className="flex h-10 w-full items-center justify-center gap-2 rounded bg-brick px-4 text-sm font-medium text-white hover:bg-red-700"
                        onClick={() => {
                          addBuilding();
                          setShowMocForm(false);
                        }}
                      >
                        {editingMocId ? "Update" : "Save"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 rounded border border-stone-300 bg-white p-3 text-xs">
                  <div>
                    <span className="block text-stone-500">Buildings</span>
                    <span className="font-semibold text-ink">{selectedBuildingCount}</span>
                  </div>
                  <div>
                    <span className="block text-stone-500">Corners</span>
                    <span className="font-semibold text-ink">{selectedCornerCount}</span>
                  </div>
                  <div>
                    <span className="block text-stone-500">Straights</span>
                    <span className="font-semibold text-ink">{selectedStraightCount}</span>
                  </div>
                  <div>
                    <span className="block text-stone-500">Estimated City Size</span>
                    <span className="font-semibold text-ink">{selectedBaseplateEstimate} baseplates</span>
                  </div>
                </div>
              </div>
            )}

            {pickerTab === "roads" && (
              <div className="mt-4 space-y-3">
                <label className="block space-y-1 text-sm font-medium text-stone-700">
                  Road inventory
                  <select
                    value={roadInventoryMode}
                    onChange={(event) => setRoadInventoryMode(event.target.value as InventoryMode)}
                    className="h-10 w-full rounded border border-stone-300 bg-white px-3 outline-none focus:border-ink"
                  >
                    <option value="unlimited">I don't know / let app assume unlimited roads</option>
                    <option value="owned">Use only roads I own</option>
                    <option value="suggest">I don't own roads yet / suggest what I need</option>
                  </select>
                </label>
                {roadInventoryMode === "owned" && (
                  <div className="grid grid-cols-2 gap-2 rounded border border-stone-200 bg-stone-50 p-2">
                    {roadInventoryOptions.map((option) => (
                      <label key={option.key} className="space-y-1 text-xs font-medium text-stone-700">
                        {option.label}
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={roadInventory[option.key]}
                          onChange={(event) =>
                            setRoadInventory((current) => ({
                              ...current,
                              [option.key]: Math.max(0, Number(event.target.value)),
                            }))
                          }
                          className="h-9 w-full rounded border border-stone-300 px-2 outline-none focus:border-ink"
                        />
                      </label>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["32x32 Straight", 32, 32, "straight"],
                    ["16x32 Straight", 16, 32, "straight"],
                    ["32x32 Corner", 32, 32, "corner"],
                    ["32x32 T Junction", 32, 32, "t-junction"],
                    ["32x32 Cross", 32, 32, "cross"],
                    ["32x32 Dead End", 32, 32, "dead-end"],
                  ].map(([label, width, depth, kind]) => (
                    <button
                      key={label as string}
                      className="flex h-10 items-center justify-center gap-2 rounded bg-road px-2 text-xs font-medium text-white hover:bg-zinc-700"
                      onClick={() => addRoadPlate(width as number, depth as number, kind as RoadKind)}
                    >
                      <Plus size={14} aria-hidden="true" />
                      {label}
                    </button>
                  ))}
                </div>
                {planningMode !== "manual" && (
                  <button
                    className="flex h-10 w-full items-center justify-center gap-2 rounded border border-stone-300 bg-white px-4 text-sm font-medium text-ink hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-45"
                    onClick={() => generateLayout()}
                    disabled={!hasBuildings}
                  >
                    <Sparkles size={16} aria-hidden="true" />
                    Generate layout
                  </button>
                )}
              </div>
            )}

            {pickerTab === "train" && (
              <div className="mt-4 rounded border border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-stone-700">
                <p className="font-semibold text-ink">Trains &amp; Railways</p>
                <p className="mt-2">
                  Train planning is coming in Version 2. Version 1 focuses on modular buildings, roads,
                  parks, plazas, districts, and future expansion.
                </p>
              </div>
            )}
          </section>

          <section className="rounded border border-stone-300 bg-white p-5 shadow-panel">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Optional add-ons
            </h2>
            <div className="mt-4 space-y-2">
              {cityAddOnOptions.map((option) => {
                const selected = cityAddOns.find((item) => item.id === option.id);
                return (
                  <div key={option.id} className="rounded border border-stone-200 bg-stone-50 p-2">
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-stone-700">
                      <input
                        type="checkbox"
                        checked={Boolean(selected)}
                        onChange={() => toggleCityAddOn(option.id)}
                      />
                      {option.label}
                    </label>
                    {selected && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <select
                          value={selected.size}
                          onChange={(event) =>
                            updateCityAddOn(option.id, { size: event.target.value as AddOnSize })
                          }
                          className="h-9 rounded border border-stone-300 bg-white px-2 text-xs outline-none focus:border-ink"
                        >
                          {Object.entries(addOnSizeLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                        {selected.size === "custom" && (
                          <div className="grid grid-cols-2 gap-1">
                            <input
                              type="number"
                              min={8}
                              step={8}
                              value={selected.customWidth}
                              onChange={(event) =>
                                updateCityAddOn(option.id, { customWidth: Number(event.target.value) })
                              }
                              className="h-9 rounded border border-stone-300 px-2 text-xs outline-none focus:border-ink"
                              aria-label={`${option.label} width studs`}
                            />
                            <input
                              type="number"
                              min={8}
                              step={8}
                              value={selected.customDepth}
                              onChange={(event) =>
                                updateCityAddOn(option.id, { customDepth: Number(event.target.value) })
                              }
                              className="h-9 rounded border border-stone-300 px-2 text-xs outline-none focus:border-ink"
                              aria-label={`${option.label} depth studs`}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    {blueprintReady && planningMode === "manual" && (
                      <button
                        className="mt-2 h-8 w-full rounded bg-ink px-3 text-xs font-semibold text-white hover:bg-black"
                        onClick={() => addCityFeature(option.id, selected?.size ?? "large")}
                      >
                        Add to layout
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded border border-stone-300 bg-white p-5 shadow-panel">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-stone-500">
              <Filter size={16} aria-hidden="true" />
              District filter
            </h2>
            <label className="mt-4 block space-y-1 text-sm font-medium text-stone-700">
              Show
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value as CategoryFilter)}
                className="h-10 w-full rounded border border-stone-300 bg-white px-3 outline-none focus:border-ink"
              >
                <option value="all">All districts</option>
                {categoryOptions.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="rounded border border-stone-300 bg-white p-5 shadow-panel">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Quick cleanup
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                className="rounded border border-stone-300 bg-white px-2 py-2 text-xs font-semibold text-ink hover:bg-stone-100 disabled:opacity-40"
                onClick={() => deleteLayoutCategory("roads", (piece) => piece.type === "road")}
                disabled={!pieces.some((piece) => piece.type === "road")}
              >
                Delete All Roads
              </button>
              <button
                className="rounded border border-stone-300 bg-white px-2 py-2 text-xs font-semibold text-ink hover:bg-stone-100 disabled:opacity-40"
                onClick={() => deleteLayoutCategory("parks", (piece) => piece.category === "park" || piece.name.toLowerCase().includes("park"))}
                disabled={!pieces.some((piece) => piece.category === "park" || piece.name.toLowerCase().includes("park"))}
              >
                Delete All Parks
              </button>
              <button
                className="rounded border border-stone-300 bg-white px-2 py-2 text-xs font-semibold text-ink hover:bg-stone-100 disabled:opacity-40"
                onClick={() => deleteLayoutCategory("expansion zones", (piece) => piece.type === "future" && piece.name.toLowerCase().includes("expansion"))}
                disabled={!pieces.some((piece) => piece.type === "future" && piece.name.toLowerCase().includes("expansion"))}
              >
                Delete Expansion Zones
              </button>
              <button
                className="rounded border border-stone-300 bg-white px-2 py-2 text-xs font-semibold text-ink hover:bg-stone-100 disabled:opacity-40"
                onClick={() => deleteLayoutCategory("future buildings", (piece) => piece.type === "future" && !piece.name.toLowerCase().includes("park") && !piece.name.toLowerCase().includes("plaza"))}
                disabled={!pieces.some((piece) => piece.type === "future" && !piece.name.toLowerCase().includes("park") && !piece.name.toLowerCase().includes("plaza"))}
              >
                Delete Future Buildings
              </button>
            </div>
          </section>

          <section className="rounded border border-stone-300 bg-white p-5 shadow-panel">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Version history
            </h2>
            <div className="mt-3 space-y-2">
              {actionHistory.length === 0 ? (
                <p className="text-sm text-stone-500">Recent edit actions will appear here.</p>
              ) : (
                actionHistory.map((entry) => (
                  <div key={`${entry.timestamp}-${entry.action}`} className="rounded border border-stone-200 bg-stone-50 px-3 py-2 text-xs">
                    <p className="font-semibold text-ink">{entry.action}</p>
                    <p className="text-stone-500">
                      {new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded border border-stone-300 bg-white p-5 shadow-panel">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Build details
            </h2>
            {selectedDetails ? (
              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-ink">{selectedDetails.name}</p>
                  <p className="text-xs uppercase tracking-wide text-stone-500">
                    {selectedDetails.kind}
                  </p>
                </div>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  <dt className="font-medium text-stone-500">Size</dt>
                  <dd className="text-right text-ink">
                    {selectedDetails.width} x {selectedDetails.depth} studs
                  </dd>
                  <dt className="font-medium text-stone-500">Size in cm</dt>
                  <dd className="text-right text-ink">
                    {studsToCm(selectedDetails.width)} x {studsToCm(selectedDetails.depth)} cm
                  </dd>
                  <dt className="font-medium text-stone-500">Baseplate module</dt>
                  <dd className="text-right text-ink">{selectedDetails.module}</dd>
                  <dt className="font-medium text-stone-500">Position</dt>
                  <dd className="text-right text-ink">
                    {selectedPiece ? gridCoordinateForRect(selectedPiece) : selectedTrainPiece ? gridCoordinateForRect(selectedTrainPiece) : `${selectedDetails.x}, ${selectedDetails.y} studs`}
                  </dd>
                  <dt className="font-medium text-stone-500">From top-left</dt>
                  <dd className="text-right text-ink">
                    {studsToCm(selectedDetails.x)}, {studsToCm(selectedDetails.y)} cm
                  </dd>
                  <dt className="font-medium text-stone-500">Rotation</dt>
                  <dd className="text-right text-ink">{selectedDetails.rotation}°</dd>
                  <dt className="font-medium text-stone-500">Level</dt>
                  <dd className="text-right text-ink">{selectedDetails.level}</dd>
                </dl>
              </div>
            ) : (
              <p className="mt-4 text-sm text-stone-500">
                Click or drag a building, road, plaza, or expansion zone to see its build measurements.
              </p>
            )}
          </section>

          <section className="rounded border border-stone-300 bg-white p-5 shadow-panel">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Saved layouts
            </h2>
            <div className="mt-4 space-y-2">
              {savedLayouts.length === 0 ? (
                <p className="text-sm text-stone-500">Saved layouts will appear here.</p>
              ) : (
                savedLayouts.map((layout) => (
                  <div
                    key={layout.id}
                    className="flex items-center justify-between rounded border border-stone-200 bg-stone-50 px-3 py-2"
                  >
                    <button
                      className="min-w-0 flex-1 text-left"
                      onClick={() => loadLayout(layout)}
                    >
                      <span className="block truncate text-sm font-medium text-ink">
                        {layout.name}
                      </span>
                      <span className="text-xs text-stone-500">
                        {layout.widthCm ?? studsToCm(layout.tableWidth ?? layout.widthStuds)} x{" "}
                        {layout.depthCm ?? studsToCm(layout.tableDepth ?? layout.depthStuds)} cm
                      </span>
                    </button>
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded text-stone-500 hover:bg-stone-200 hover:text-red-700"
                      onClick={() => deleteLayout(layout.id)}
                      aria-label={`Delete ${layout.name}`}
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
            </>
          )}
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded border border-sky-200 bg-white shadow-panel">
          <div className="shrink-0 border-b border-sky-200 bg-gradient-to-r from-sky-50 via-lime-50 to-yellow-50 px-3 py-2">
            <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-base font-semibold text-ink">City Blueprint</h2>
                <div className="flex rounded border border-stone-300 bg-white p-0.5 text-xs font-semibold">
                  <button
                    className={`rounded px-2 py-1 ${viewMode === "blueprint" ? "bg-ink text-white" : "text-stone-700 hover:bg-stone-100"}`}
                    onClick={() => setViewMode("blueprint")}
                  >
                    Blueprint View
                  </button>
                  <button
                    className={`rounded px-2 py-1 ${viewMode === "build-guide" ? "bg-ink text-white" : "text-stone-700 hover:bg-stone-100"}`}
                    onClick={() => setViewMode("build-guide")}
                  >
                    Build Guide View
                  </button>
                </div>
                <span className="rounded bg-white/70 px-2 py-1 text-xs font-semibold text-stone-700">
                  {visiblePieces.length} pieces
                </span>
              </div>
              <div className="mt-2 max-w-3xl">
                {cityRatingPanel}
              </div>
              {showAnalysisPanel && (layoutScore > 0 || pieces.length > 0) && (
                <div className="mt-2 grid max-w-xl grid-cols-2 gap-2">
                  {[
                    ["Expansion Potential", expansionPotential],
                    ["Buildability", buildabilityRating],
                  ].map(([label, value]) => (
                    <div key={label as string} className={`rounded border px-3 py-2 shadow-sm ${ratingTone(value as number)}`}>
                      <span className="block text-[10px] font-black uppercase tracking-wide">{label}</span>
                      <span className="text-lg font-black">{Math.round(value as number)}%</span>
                    </div>
                  ))}
                </div>
              )}
              {hasOutsideObjects && (
                <p className="mt-1 text-sm font-semibold text-red-700">
                  This object is outside your usable table space.
                </p>
              )}
              {hasTrainClearanceOverlap && (
                <p className="mt-1 text-sm font-semibold text-red-700">
                  Train clearance conflicts with buildings or roads.
                </p>
              )}
              {showRoadDebug && modularMisalignedPieces.length > 0 && (
                <p className="mt-1 text-sm font-semibold text-amber-700">
                  Modular not aligned to 16x16 grid.
                </p>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              {viewMode === "build-guide" && (
                <>
                  <button
                    className="flex items-center gap-1 rounded bg-ink px-3 py-1 text-xs font-medium text-white hover:bg-black"
                    onClick={printBuildGuide}
                  >
                    <Printer size={13} aria-hidden="true" />
                    Print Build Guide
                  </button>
                  <button
                    className="flex items-center gap-1 rounded border border-stone-300 bg-white px-3 py-1 text-xs font-medium text-ink hover:bg-stone-100"
                    onClick={exportBuildGuide}
                  >
                    <Download size={13} aria-hidden="true" />
                    Export Build Guide
                  </button>
                </>
              )}
              <div className="relative">
                <button
                  className="rounded border border-stone-300 bg-white px-3 py-1 text-xs font-black text-ink shadow-sm hover:bg-stone-50"
                  onClick={() => setShowViewOptions((current) => !current)}
                >
                  ⚙️ View Options
                </button>
                {showViewOptions && (
                  <div className="absolute right-0 top-8 z-50 w-64 rounded border border-stone-300 bg-white p-3 text-xs text-stone-700 shadow-xl">
                    <div className="grid gap-1.5">
                      <p><span className="font-black text-ink">Table:</span> {studsToCm(layoutGeometry.width)}cm x {studsToCm(layoutGeometry.depth)}cm</p>
                      <p><span className="font-black text-ink">Grid:</span> {Math.round(layoutGeometry.width)} x {Math.round(layoutGeometry.depth)} studs</p>
                      <p><span className="font-black text-ink">Grid:</span> 8-stud snap, 16-stud medium lines, 32-stud baseplate lines</p>
                      {categoryFilter !== "all" && <p>{visibleBuildingCount} of {totalBuildingCount} buildings visible</p>}
                    </div>
                    {viewMode === "blueprint" && (
                      <div className="mt-3 flex rounded border border-emerald-200 bg-white p-0.5 text-xs font-semibold">
                        <button
                          className={`flex-1 rounded px-2 py-1 ${blueprintDisplayMode === "build" ? "bg-emerald-700 text-white" : "text-stone-700 hover:bg-emerald-50"}`}
                          onClick={() => setBlueprintDisplayMode("build")}
                        >
                          Build
                        </button>
                        <button
                          className={`flex-1 rounded px-2 py-1 ${blueprintDisplayMode === "planning" ? "bg-emerald-700 text-white" : "text-stone-700 hover:bg-emerald-50"}`}
                          onClick={() => setBlueprintDisplayMode("planning")}
                        >
                          Planning
                        </button>
                      </div>
                    )}
                    <label className="mt-3 flex items-start gap-2 rounded border border-stone-200 bg-stone-50 p-2 text-xs font-semibold text-stone-700">
                      <input
                        type="checkbox"
                        checked={autoAlignRoads}
                        onChange={(event) => {
                          const enabled = event.target.checked;
                          setAutoAlignRoads(enabled);
                          if (enabled) {
                            setPieces((current) => {
                              const nextPieces = normaliseRoadTiles(current);
                              updateRoadValidationNotes(nextPieces);
                              return nextPieces;
                            });
                          }
                        }}
                        className="mt-0.5"
                      />
                      <span>
                        <span className="block font-black text-ink">Auto-align roads</span>
                        <span className="mt-0.5 block font-medium leading-4 text-stone-600">
                          Rotate and type-match road plates when neighbours change.
                        </span>
                      </span>
                    </label>
                    <button
                      className={`mt-3 w-full rounded border px-3 py-2 text-xs font-semibold ${showRoadDebug ? "border-ink bg-ink text-white" : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"}`}
                      onClick={() => setShowRoadDebug((current) => !current)}
                    >
                      Road Debug {showRoadDebug ? "On" : "Off"}
                    </button>
                  </div>
                )}
              </div>
            </div>
            </div>
            {blueprintDisplayMode === "planning" && (activeDistricts.length > 0 || pieces.some((piece) => piece.type === "future")) && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {activeDistricts.map((district) => (
                  <span key={district.value} className="rounded-full border border-white/70 px-2 py-1 text-[10px] font-black uppercase text-ink shadow-sm" style={{ backgroundColor: categorySwatches[district.value] }}>
                    {district.label} District · {district.count}
                  </span>
                ))}
                {pieces.some((piece) => piece.type === "future") && (
                  <span className="rounded-full border border-white/70 bg-emerald-100 px-2 py-1 text-[10px] font-black uppercase text-emerald-950 shadow-sm">
                    Expansion Zones · {pieces.filter((piece) => piece.type === "future").length}
                  </span>
                )}
              </div>
            )}
            {showAnalysisPanel && decisionLayoutNotes.length > 0 && (
              <div className="mt-3 rounded border border-lime-200 bg-white/80 px-3 py-2 text-xs text-stone-700 shadow-sm">
                <p className="font-black uppercase tracking-wide text-lime-800">Why This Layout?</p>
                <div className="mt-2 grid gap-1 sm:grid-cols-2">
                  {decisionLayoutNotes.slice(0, 6).map((note) => (
                    <div key={note} className="flex gap-1.5">
                      <span className="font-black text-lime-700">✓</span>
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {showAnalysisPanel && planningLayoutNotes.length > 0 && (
              <details className="mt-2 rounded border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-600">
                <summary className="cursor-pointer font-semibold text-stone-700">
                  Layout Notes
                </summary>
                <p className="mt-2 leading-5">{planningLayoutNotes.join(" · ")}</p>
              </details>
            )}
          </div>

          <div className="flex min-h-0 flex-1 overflow-hidden">
          <div
            ref={canvasWrapRef}
            className={`relative min-h-0 flex-1 overflow-hidden bg-stone-100 ${isPanning ? "cursor-grabbing" : zoomPercent > 100 ? "cursor-grab" : "cursor-default"}`}
            onWheel={handleWheelZoom}
            onPointerDown={startCanvasPan}
            onPointerMove={moveCanvasPan}
            onPointerUp={endCanvasPan}
            onPointerLeave={endCanvasPan}
            style={{ touchAction: "none" }}
          >
            <div
              className="absolute left-1/2 top-1/2"
              style={{
                transform: `translate(-50%, -50%) translate(${panOffset.x}px, ${panOffset.y}px)`,
              }}
            >
            <div
              ref={gridRef}
              className="planner-grid relative overflow-hidden border-2 border-stone-700"
              style={tableStyle}
              title={`Table: ${studsToCm(layoutGeometry.width)}cm x ${studsToCm(layoutGeometry.depth)}cm · Build grid: ${Math.round(layoutGeometry.width)} x ${Math.round(layoutGeometry.depth)} studs`}
            >
              {layoutGeometry.tableSections.map((section) => (
                <div
                  key={section.id}
                  className="pointer-events-none absolute z-0 border border-stone-500 bg-[#e4dfd1]/70"
                  style={{
                    left: section.x * canvasScale,
                    top: section.y * canvasScale,
                    width: section.widthStuds * canvasScale,
                    height: section.depthStuds * canvasScale,
                  }}
                />
              ))}
              {showBaseplateLabels &&
                baseplateLabels.map((baseplate) => (
                  <div
                    key={baseplate.id}
                    className="pointer-events-none absolute z-[1] flex items-start justify-end border border-dashed border-stone-700/25 p-1 text-[9px] font-semibold uppercase text-stone-700/65"
                    style={{
                      left: baseplate.x * canvasScale,
                      top: baseplate.y * canvasScale,
                      width: 32 * canvasScale,
                      height: 32 * canvasScale,
                    }}
                  >
                    {baseplate.label}
                  </div>
                ))}
              {viewMode === "build-guide" &&
                baseplateLabels.map((baseplate) => (
                  <div
                    key={`coord-${baseplate.id}`}
                    className="pointer-events-none absolute z-[2] rounded-br bg-ink/85 px-1.5 py-0.5 text-[10px] font-black text-white"
                    style={{
                      left: baseplate.x * canvasScale,
                      top: baseplate.y * canvasScale,
                    }}
                  >
                    {gridCoordinateForRect(baseplate)}
                  </div>
                ))}
              {layoutGeometry.blockedZones.map((zone) => (
                <div
                  key={zone.id}
                  className="pointer-events-none absolute z-[4] flex items-center justify-center border-2 border-stone-700 bg-stone-700/55 text-xs font-semibold uppercase text-white"
                  style={{
                    left: zone.x * canvasScale,
                    top: zone.y * canvasScale,
                    width: zone.widthStuds * canvasScale,
                    height: zone.depthStuds * canvasScale,
                  }}
                >
                  Blocked
                </div>
              ))}
              {clearanceBoxes.map((box) => (
                <div
                  key={`clearance-${box.id}`}
                  className="pointer-events-none absolute z-[5] border-2 border-dashed border-red-500 bg-red-500/10"
                  style={{
                    left: box.x * canvasScale,
                    top: box.y * canvasScale,
                    width: box.width * canvasScale,
                    height: box.depth * canvasScale,
                  }}
                />
              ))}
              {elevatedClearanceBoxes.map((box) => (
                <div
                  key={`elevated-clearance-${box.id}`}
                  className="pointer-events-none absolute z-[5] border-2 border-dashed border-sky-500 bg-sky-500/10"
                  style={{
                    left: box.x * canvasScale,
                    top: box.y * canvasScale,
                    width: box.width * canvasScale,
                    height: box.depth * canvasScale,
                  }}
                />
              ))}
              {straightRailSegments.map((segment) => {
                const corridorX = segment.orientation === "horizontal" ? segment.x : Math.max(0, segment.x - 4);
                const corridorY = segment.orientation === "horizontal" ? Math.max(0, segment.y - 4) : segment.y;
                const corridorWidth = segment.orientation === "horizontal" ? segment.width : 16;
                const corridorDepth = segment.orientation === "horizontal" ? 16 : segment.depth;
                return (
                  <div
                    key={`corridor-${segment.id}`}
                    className="pointer-events-none absolute z-[5] rounded-sm border border-dashed border-sky-700/15 bg-sky-100/10"
                    title={`Railway corridor · ${Math.round(corridorWidth)} x ${Math.round(corridorDepth)} studs`}
                    style={{
                      left: corridorX * canvasScale,
                      top: corridorY * canvasScale,
                      width: corridorWidth * canvasScale,
                      height: corridorDepth * canvasScale,
                    }}
                  />
                );
              })}
              {straightRailSegments.map((segment) => (
                <div
                  key={segment.id}
                  className={`pointer-events-none absolute select-none overflow-visible ${
                    segment.level === "elevated" ? "z-[7] drop-shadow-[0_2px_2px_rgba(14,116,144,0.35)]" : "z-[6]"
                  }`}
                  title={`Railway segment · ${Math.round(segment.width)} x ${Math.round(segment.depth)} studs · ${segment.pieceIds.length} straight track pieces`}
                  style={{
                    left: segment.x * canvasScale,
                    top: segment.y * canvasScale,
                    width: segment.width * canvasScale,
                    height: segment.depth * canvasScale,
                  }}
                >
                  <ContinuousRailSegment orientation={segment.orientation} />
                </div>
              ))}
              {trainPieces.filter((piece) => !isStraightRailPiece(piece)).map((piece) => (
                <div
                  key={piece.id}
                  role="button"
                  tabIndex={0}
                  onPointerDown={(event) => startTrainDrag(event, piece)}
                  onClick={() => setSelectedObject({ kind: "train", id: piece.id })}
                  title={`${piece.name} · ${piece.baseplateModule ?? baseplateModuleLabel(piece.width, piece.depth)} module · ${piece.width} x ${piece.depth} studs (${studsToCm(piece.width)} x ${studsToCm(piece.depth)} cm) · Position ${piece.x}, ${piece.y} studs (${studsToCm(piece.x)}, ${studsToCm(piece.y)} cm) · Rotation ${piece.rotation}° · ${trainElevationLabels[piece.elevationMode ?? "ground"]}`}
                  className={`group absolute select-none overflow-visible border text-zinc-950 transition-shadow ${
                    piece.level === "elevated"
                      ? "z-[7] border-transparent bg-transparent drop-shadow-[0_2px_2px_rgba(14,116,144,0.35)]"
                      : "z-[6] border-transparent bg-transparent"
                  } ${
                    outsideTrainIds.has(piece.id) ? "ring-4 ring-red-600" : ""
                  } ${
                    selectedObject?.kind === "train" && selectedObject.id === piece.id
                      ? "ring-2 ring-ink"
                      : ""
                  } ${
                    dragTrainId === piece.id ? "shadow-xl ring-2 ring-zinc-900" : ""
                  }`}
                  style={{
                    left: piece.x * canvasScale,
                    top: piece.y * canvasScale,
                    width: piece.width * canvasScale,
                    height: piece.depth * canvasScale,
                  }}
                >
                  <div className="h-full w-full" style={{ transform: `rotate(${piece.rotation}deg)` }}>
                    <TrainFootprint trackType={piece.trackType} />
                  </div>
                  {piece.level === "elevated" && (
                    <>
                      <div className="pointer-events-none absolute left-1 top-1 h-2 w-2 rounded-full bg-slate-700" />
                      <div className="pointer-events-none absolute right-1 top-1 h-2 w-2 rounded-full bg-slate-700" />
                      <div className="pointer-events-none absolute bottom-1 left-1 h-2 w-2 rounded-full bg-slate-700" />
                      <div className="pointer-events-none absolute bottom-1 right-1 h-2 w-2 rounded-full bg-slate-700" />
                      {(piece.elevationMode === "elevated-rear" || piece.elevationMode === "fully-elevated") && (
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-slate-600" />
                      )}
                      {(piece.elevationMode === "elevated-side" || piece.elevationMode === "fully-elevated") && (
                        <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-slate-600" />
                      )}
                    </>
                  )}
                  {(selectedObject?.kind === "train" && selectedObject.id === piece.id) && (
                    <div className="pointer-events-none absolute left-0 top-[-18px] whitespace-nowrap rounded bg-white/90 px-1 text-[10px] font-bold shadow">
                      {piece.name}
                    </div>
                  )}
                  <div className={`absolute bottom-[-20px] right-0 flex gap-1 opacity-0 transition-opacity ${
                    selectedObject?.kind === "train" && selectedObject.id === piece.id ? "opacity-100" : ""
                  }`}>
                        <button
                          className="flex h-5 w-5 items-center justify-center rounded bg-white/80 hover:bg-white disabled:opacity-40"
                          onPointerDown={(event) => event.stopPropagation()}
                          onClick={() => rotateTrainPiece(piece.id)}
                          disabled={!piece.rotationAllowed}
                          aria-label={`Rotate ${piece.name}`}
                        >
                          <RotateCw size={13} aria-hidden="true" />
                        </button>
                        <button
                          className="flex h-5 w-5 items-center justify-center rounded bg-white/80 hover:bg-white"
                          onPointerDown={(event) => event.stopPropagation()}
                          onClick={() => removeTrainPiece(piece.id)}
                          aria-label={`Remove ${piece.name}`}
                        >
                          <Trash2 size={13} aria-hidden="true" />
                        </button>
                  </div>
                </div>
              ))}
              {visiblePieces.map((piece) => (
                <div
                  key={piece.id}
                  role="button"
                  tabIndex={0}
                  onPointerDown={(event) => startDrag(event, piece)}
                  onClick={() => setSelectedObject({ kind: "piece", id: piece.id })}
                  onDoubleClick={() => piece.type === "building" && zoomToPiece(piece)}
                  onMouseEnter={() => setHoveredBuildGuideId(piece.id)}
                  onMouseLeave={() => setHoveredBuildGuideId(null)}
                  title={`${piece.name} · ${piece.baseplateModule ?? baseplateModuleLabel(piece.width, piece.depth)} module · ${piece.width} x ${piece.depth} studs (${studsToCm(piece.width)} x ${studsToCm(piece.depth)} cm) · Position ${piece.x}, ${piece.y} studs (${studsToCm(piece.x)}, ${studsToCm(piece.y)} cm) · Rotation ${piece.rotation}° · Ground Level${piece.type === "future" ? ` · ${futurePlotMeta(piece).plotType} · District: ${futurePlotMeta(piece).district}` : ""}${overhangDescriptionFor(piece) ? ` · ${overhangDescriptionFor(piece)}` : ""}`}
                  className={`group absolute select-none overflow-hidden border shadow-sm transition-shadow ${pieceLayerClass(piece)} ${
                    piece.type === "road" ? "border-transparent" : piece.type === "future" ? `${blueprintDisplayMode === "planning" ? "border border-dashed border-emerald-700/60 bg-emerald-200/25" : "border border-dashed border-emerald-700/40 bg-emerald-100/15"} text-emerald-950 shadow-none` : categoryStyles[piece.category]
                  } ${
                    overlappingBuildingIds.has(piece.id) || overlappingRoadIds.has(piece.id) || outsidePieceIds.has(piece.id)
                      ? "ring-4 ring-red-600"
                      : ""
                  } ${
                    (selectedObject?.kind === "piece" && selectedObject.id === piece.id) || hoveredBuildGuideId === piece.id
                      ? "ring-2 ring-ink"
                      : ""
                  }`}
                  style={{
                    left: piece.x * canvasScale,
                    top: piece.y * canvasScale,
                    width: piece.width * canvasScale,
                    height: piece.depth * canvasScale,
                    transform: piece.type === "building" ? `rotate(${piece.rotation}deg)` : undefined,
                  }}
                >
                  {piece.type === "road" && <RoadFootprint kind={piece.roadKind} rotation={piece.rotation} width={piece.width} depth={piece.depth} />}
                  {piece.type === "road" && showRoadDebug && (
                    <div className="pointer-events-none absolute inset-1 z-20 flex items-center justify-center rounded bg-white/85 p-1 text-center text-[9px] font-black leading-tight text-slate-950 shadow">
                      <span>
                        {piece.roadKind ?? "road"} {piece.rotation}
                        <br />
                        selected: {roadDebugPayloadFor(piece).selectedRoadType}
                        <br />
                        image: {roadDebugPayloadFor(piece).imageAssetUsed.split("/").pop()}
                        <br />
                        req: {(["north", "east", "south", "west"] as Direction[])
                          .filter((side) => (piece.roadConnections ?? roadConnectionRecord(roadConnectionsFor(piece)))[side])
                          .map((side) => side[0].toUpperCase())
                          .join("/") || "none"}
                        <br />
                        def: {Array.from(roadAssetDefaultConnectionsFor(piece.roadKind))
                          .map((side) => side[0].toUpperCase())
                          .join("/") || "none"}
                      </span>
                    </div>
                  )}
                  {overhangingPieceIds.has(piece.id) && (
                    <div className="pointer-events-none absolute inset-0 border-2 border-dotted border-amber-500/80" />
                  )}
                  {piece.type === "road" && zoomPercent >= 150 && (
                    <div className="pointer-events-none absolute inset-x-1 top-1 rounded bg-slate-950/70 px-1 text-center text-[10px] font-bold uppercase text-white">
                      {piece.name}
                    </div>
                  )}
                  {piece.type === "building" && <BuildingFootprint piece={piece} />}
                  {piece.type === "future" && (
                    <div className="pointer-events-none relative h-full w-full text-emerald-950">
                      <span className="absolute left-1 top-1 h-1.5 w-1.5 rounded-full bg-emerald-600/55 shadow-[0_0_0_1px_rgba(4,120,87,0.25)]" />
                      {blueprintDisplayMode === "planning" && (
                        <div className="absolute inset-1 flex items-center justify-center text-center">
                          <span className="rounded bg-white/65 px-1 py-0.5 text-[9px] font-bold uppercase leading-tight text-emerald-950 shadow-sm">
                            {futurePlotMeta(piece).compactLabel}
                          </span>
                        </div>
                      )}
                      {blueprintDisplayMode === "build" && (
                        <div className="absolute inset-x-1 top-1 hidden text-center group-hover:block">
                          <span className="rounded bg-white/80 px-1 py-0.5 text-[8px] font-bold uppercase leading-tight text-emerald-950 shadow-sm">
                            {futurePlotMeta(piece).compactLabel}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  {viewMode === "build-guide" && buildGuideEntryById.has(piece.id) && (
                    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-white/45 p-1 text-center text-ink">
                      <div className="rounded border border-ink bg-white/90 px-1.5 py-1 text-[10px] font-black leading-tight shadow-sm">
                        <span className="block">#{buildGuideEntryById.get(piece.id)?.number}</span>
                        <span className="block">{buildGuideEntryById.get(piece.id)?.shortName}</span>
                        <span className="block text-[9px]">{piece.width}x{piece.depth}</span>
                      </div>
                    </div>
                  )}
                  {piece.type === "building" && showInlineLabels && (
                    <div className="pointer-events-none absolute inset-x-1 top-1 rounded bg-white/80 px-1 text-center text-[11px] font-bold leading-tight text-ink">
                      {piece.name}
                    </div>
                  )}
                  {zoomPercent >= 150 && viewMode === "blueprint" && (
                    <div className="pointer-events-none absolute bottom-1 left-1 rounded bg-white/80 px-1 text-[9px] font-black text-ink shadow-sm">
                      {gridCoordinateForRect(piece)}
                    </div>
                  )}
                  <button
                    className="absolute bottom-1 right-14 flex h-5 w-5 items-center justify-center rounded bg-white/80 text-ink"
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => rotatePiece(piece.id)}
                    aria-label={`Rotate ${piece.name}`}
                  >
                    <RotateCw size={12} aria-hidden="true" />
                  </button>
                  <button
                    className="absolute bottom-1 right-8 flex h-5 w-5 items-center justify-center rounded bg-white/80 text-ink"
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => {
                      setSelectedObject({ kind: "piece", id: piece.id });
                      window.setTimeout(duplicateSelectedObject, 0);
                    }}
                    aria-label={`Duplicate ${piece.name}`}
                  >
                    <Plus size={12} aria-hidden="true" />
                  </button>
                  <button
                    className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded bg-white/80 text-ink"
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => removePiece(piece.id)}
                    aria-label={`Remove ${piece.name}`}
                  >
                    <Trash2 size={12} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
            </div>
            <div
              className="absolute left-3 top-3 z-40 flex items-center gap-1 rounded-full border border-stone-300 bg-white/95 p-1 shadow-lg"
              onPointerDown={(event) => event.stopPropagation()}
            >
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-sm font-black text-white" onClick={() => zoomByStep(1)} aria-label="Zoom in" title="Zoom in">➕</button>
              <button className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-300 bg-white text-sm font-black text-ink" onClick={() => zoomByStep(-1)} aria-label="Zoom out" title="Zoom out">➖</button>
              <button className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-300 bg-white text-sm font-black text-ink" onClick={() => setZoomCentered(100)} aria-label="Reset view" title="Reset view">⌂</button>
              <button className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-300 bg-white text-sm font-black text-ink" onClick={fitToScreen} aria-label="Fit to screen" title="Fit to screen">🎯</button>
              <span className="px-2 text-[11px] font-black text-stone-700">{zoomPercent}%</span>
            </div>
            {(layoutGeometry.width > 220 || layoutGeometry.depth > 160 || zoomPercent > 100) && (
              <div
                className={`absolute bottom-3 right-3 z-40 rounded border border-stone-400 bg-white/95 p-1.5 shadow-lg transition-all ${miniMapExpanded ? "h-32 w-44" : "h-[88px] w-[120px]"}`}
                onPointerDown={(event) => event.stopPropagation()}
                onDoubleClick={() => setMiniMapExpanded((current) => !current)}
                title="Double click to expand minimap"
              >
                <button
                  className="absolute right-1 top-1 z-10 rounded bg-white/85 px-1 text-[9px] font-black text-ink shadow-sm"
                  onClick={() => setMiniMapExpanded((current) => !current)}
                  aria-label={miniMapExpanded ? "Shrink minimap" : "Expand minimap"}
                >
                  {miniMapExpanded ? "−" : "+"}
                </button>
                <div
                  className="relative h-full w-full cursor-crosshair overflow-hidden bg-stone-200"
                  onPointerDown={startMiniMapDrag}
                  onPointerMove={(event) => {
                    if (event.buttons === 1) moveViewportFromMiniMap(event);
                  }}
                >
                  {layoutGeometry.tableSections.map((section) => (
                    <div
                      key={`mini-${section.id}`}
                      className="absolute border border-stone-600 bg-[#d9d2bf]"
                      style={{
                        left: `${(section.x / layoutGeometry.width) * 100}%`,
                        top: `${(section.y / layoutGeometry.depth) * 100}%`,
                        width: `${(section.widthStuds / layoutGeometry.width) * 100}%`,
                        height: `${(section.depthStuds / layoutGeometry.depth) * 100}%`,
                      }}
                    />
                  ))}
                  {visiblePieces.slice(0, 80).map((piece) => (
                    <div
                      key={`mini-piece-${piece.id}`}
                      className={`absolute ${piece.type === "road" ? "bg-slate-500" : piece.type === "future" ? "border border-emerald-600/40 bg-emerald-300/25" : "bg-yellow-400"}`}
                      style={{
                        left: `${(piece.x / layoutGeometry.width) * 100}%`,
                        top: `${(piece.y / layoutGeometry.depth) * 100}%`,
                        width: `${(piece.width / layoutGeometry.width) * 100}%`,
                        height: `${(piece.depth / layoutGeometry.depth) * 100}%`,
                      }}
                    />
                  ))}
                  <div
                    className="absolute border-2 border-red-600 bg-red-500/10"
                    style={{
                      left: `${clamp((layoutGeometry.width / 2 - (canvasSize.width / 2 - panOffset.x) / canvasScale) / layoutGeometry.width * 100, 0, 100)}%`,
                      top: `${clamp((layoutGeometry.depth / 2 - (canvasSize.height / 2 - panOffset.y) / canvasScale) / layoutGeometry.depth * 100, 0, 100)}%`,
                      width: `${clamp((canvasSize.width / canvasScale) / layoutGeometry.width * 100, 4, 100)}%`,
                      height: `${clamp((canvasSize.height / canvasScale) / layoutGeometry.depth * 100, 4, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          {viewMode === "build-guide" && (
            <aside className="w-80 shrink-0 overflow-y-auto border-l border-stone-300 bg-white p-3">
              <div className="sticky top-0 z-10 border-b border-stone-200 bg-white pb-2">
                <h3 className="text-sm font-black uppercase tracking-wide text-ink">Build List</h3>
                <p className="text-xs text-stone-500">Use coordinates to place each module on the table.</p>
              </div>
              <div className="mt-3 space-y-2">
                {buildGuideEntries.map((entry) => {
                  const active =
                    selectedObject?.kind === "piece" && selectedObject.id === entry.id;
                  const hovered = hoveredBuildGuideId === entry.id;
                  return (
                    <button
                      key={entry.id}
                      className={`w-full rounded border p-3 text-left text-xs transition ${
                        active || hovered
                          ? "border-ink bg-yellow-100 shadow-sm"
                          : "border-stone-200 bg-stone-50 hover:bg-stone-100"
                      }`}
                      onMouseEnter={() => setHoveredBuildGuideId(entry.id)}
                      onMouseLeave={() => setHoveredBuildGuideId(null)}
                      onClick={() => setSelectedObject({ kind: "piece", id: entry.id })}
                    >
                      <span className="block text-sm font-black text-ink">#{entry.number} {entry.name}</span>
                      <span className="mt-1 block font-semibold text-stone-700">{entry.size} studs · {entry.type}</span>
                      <span className="mt-1 block text-stone-600">Position: {entry.position}</span>
                      <span className="block text-stone-600">Rotation: {entry.rotation}°</span>
                      {entry.notes && <span className="mt-1 block text-stone-500">{entry.notes}</span>}
                    </button>
                  );
                })}
              </div>
            </aside>
          )}
          </div>
        </section>
      </div>
      {showSpaceFillPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 p-4">
          <div className="w-full max-w-2xl rounded border border-stone-300 bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-ink">
              Your current buildings don&apos;t fill the full layout
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              You have extra space available. What would you like Blueprint to add?
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {spaceFillOptions.map((option) => {
                const selected = spaceFillChoices.includes(option.value);
                return (
                  <button
                    key={option.value}
                    className={`rounded border px-3 py-2 text-left text-sm font-medium ${
                      selected
                        ? "border-ink bg-ink text-white"
                        : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
                    }`}
                    onClick={() =>
                      setSpaceFillChoices((current) => {
                        if (option.value === "decide") return ["decide"];
                        const withoutDecide = current.filter((choice) => choice !== "decide");
                        return withoutDecide.includes(option.value)
                          ? withoutDecide.filter((choice) => choice !== option.value)
                          : [...withoutDecide, option.value];
                      })
                    }
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                className="h-10 rounded border border-stone-300 bg-white px-4 text-sm font-medium text-stone-700 hover:bg-stone-100"
                onClick={() => {
                  setSpaceFillChoices(["open-space"]);
                  setShowSpaceFillPrompt(false);
                  generateLayout(["open-space"]);
                }}
              >
                Leave open
              </button>
              <button
                className="h-10 rounded bg-ink px-4 text-sm font-medium text-white hover:bg-black"
                onClick={() => generateLayout(spaceFillChoices.length > 0 ? spaceFillChoices : ["decide"])}
              >
                Complete Blueprint
              </button>
            </div>
          </div>
        </div>
      )}
      {showLayoutFeedbackPrompt && planningMode === "auto" && (
        <div className="fixed bottom-5 right-5 z-50 w-full max-w-sm rounded border border-stone-300 bg-white p-4 shadow-xl">
          <h2 className="text-sm font-black text-ink">Was this layout useful?</h2>
          <div className="mt-3 flex gap-2">
            <button className="h-9 flex-1 rounded bg-lime-600 px-3 text-sm font-black text-white hover:bg-lime-700" onClick={() => submitLayoutFeedback(true)}>
              👍 Yes
            </button>
            <button className="h-9 flex-1 rounded border border-red-300 bg-red-50 px-3 text-sm font-black text-red-800 hover:bg-red-100" onClick={() => setLayoutFeedbackReasons(["__show_no__"])}>
              👎 No
            </button>
          </div>
          {layoutFeedbackReasons.includes("__show_no__") && (
            <div className="mt-3 border-t border-stone-200 pt-3">
              <p className="text-xs font-black uppercase text-stone-500">Why?</p>
              <div className="mt-2 space-y-1">
                {feedbackReasons.map((reason) => (
                  <label key={reason} className="flex items-center gap-2 text-xs font-semibold text-stone-700">
                    <input type="checkbox" checked={layoutFeedbackReasons.includes(reason)} onChange={() => toggleFeedbackReason(reason)} />
                    {reason}
                  </label>
                ))}
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <button className="rounded border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700" onClick={() => setShowLayoutFeedbackPrompt(false)}>
                  Skip
                </button>
                <button className="rounded bg-ink px-3 py-1.5 text-xs font-semibold text-white" onClick={() => submitLayoutFeedback(false, layoutFeedbackReasons.filter((reason) => reason !== "__show_no__"))}>
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {showClearLayoutPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 p-4">
          <div className="w-full max-w-md rounded border border-stone-300 bg-white p-6 shadow-xl">
            <h2 className="text-xl font-black text-ink">Clear entire layout?</h2>
            <p className="mt-2 text-sm text-stone-600">
              This will remove:
            </p>
            <ul className="mt-3 space-y-1 text-sm font-semibold text-stone-700">
              <li>✓ Buildings</li>
              <li>✓ Roads</li>
              <li>✓ Parks</li>
              <li>✓ Expansion zones</li>
              <li>✓ Custom placements</li>
            </ul>
            <p className="mt-3 text-xs text-stone-500">
              This cannot be undone after refresh. Your selected modulars, MOCs, road inventory, and setup inputs will remain.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                className="rounded border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-stone-100"
                onClick={() => setShowClearLayoutPrompt(false)}
              >
                Cancel
              </button>
              <button
                className="rounded bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
                onClick={() => {
                  setShowClearLayoutPrompt(false);
                  clearLayoutObjects();
                }}
              >
                Clear Layout
              </button>
            </div>
          </div>
        </div>
      )}
      {activeModal === "waitlist" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-950/55 p-4">
          <div className="w-full max-w-xl rounded border border-stone-300 bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-black text-ink">Join the Blueprint Waitlist</h2>
            <label className="mt-5 block space-y-2 text-sm font-semibold text-stone-700">
              Name
              <input
                value={waitlistName}
                onChange={(event) => setWaitlistName(event.target.value)}
                className="h-10 w-full rounded border border-stone-300 px-3 text-sm outline-none focus:border-ink"
              />
            </label>
            <label className="mt-4 block space-y-2 text-sm font-semibold text-stone-700">
              Email
              <input
                type="email"
                value={waitlistEmail}
                onChange={(event) => setWaitlistEmail(event.target.value)}
                className="h-10 w-full rounded border border-stone-300 px-3 text-sm outline-none focus:border-ink"
              />
            </label>
            <label className="mt-4 block space-y-2 text-sm font-semibold text-stone-700">
              LEGO city size / notes optional
              <textarea
                value={waitlistNotes}
                onChange={(event) => setWaitlistNotes(event.target.value)}
                className="min-h-24 w-full rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-ink"
              />
            </label>
            <div className="mt-5 flex justify-between gap-2">
              <button className="rounded border border-stone-300 px-4 py-2 text-sm font-semibold text-ink hover:bg-stone-100" onClick={closeActiveModal}>
                Cancel
              </button>
              <button className="rounded bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-black" onClick={submitWaitlist}>
                Join Waitlist
              </button>
            </div>
          </div>
        </div>
      )}
      {activeModal === "featureRequest" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-950/55 p-4">
          <div className="w-full max-w-xl rounded border border-stone-300 bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-black text-ink">Feedback</h2>
            <label className="mt-5 block space-y-2 text-sm font-semibold text-stone-700">
              Feedback idea
              <textarea
                value={featureRequestText}
                onChange={(event) => setFeatureRequestText(event.target.value)}
                className="min-h-32 w-full rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-ink"
              />
            </label>
            <label className="mt-4 block space-y-2 text-sm font-semibold text-stone-700">
              Category
              <select
                value={featureRequestCategory}
                onChange={(event) => setFeatureRequestCategory(event.target.value as FeatureCategory)}
                className="h-10 w-full rounded border border-stone-300 bg-white px-3"
              >
                {featureCategories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>
            <label className="mt-4 block space-y-2 text-sm font-semibold text-stone-700">
              Optional email
              <input
                type="email"
                value={featureRequestEmail}
                onChange={(event) => setFeatureRequestEmail(event.target.value)}
                className="h-10 w-full rounded border border-stone-300 px-3 text-sm outline-none focus:border-ink"
              />
            </label>
            <div className="mt-5 flex justify-between gap-2">
              <button className="rounded border border-stone-300 px-4 py-2 text-sm font-semibold text-ink hover:bg-stone-100" onClick={closeActiveModal}>
                Cancel
              </button>
              <button className="rounded bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-black" onClick={submitFeatureRequest}>
                Send Feedback
              </button>
            </div>
          </div>
        </div>
      )}
      {activeModal === "roadmap" && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-stone-950/55 p-4">
          <div className="mx-auto my-8 w-full max-w-4xl rounded border border-stone-300 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-ink">🚧 Coming Soon</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
                  Vote on the features you want most. The best future Blueprint features should come from LEGO city builders.
                </p>
              </div>
              <button className="rounded border border-stone-300 px-3 py-2 text-sm font-semibold text-ink hover:bg-stone-100" onClick={() => setActiveModal(null)}>
                Close
              </button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {(["Planned", "In Progress", "Released"] as RoadmapStatus[]).map((status) => (
                <section key={status} className="rounded border border-stone-200 bg-stone-50 p-3">
                  <h3 className="text-sm font-black uppercase tracking-wide text-stone-600">{status}</h3>
                  <div className="mt-3 space-y-2">
                    {roadmapItems.filter((item) => item.status === status).map((item) => (
                      <button
                        key={item.id}
                        className={`w-full rounded border px-3 py-2 text-left text-sm font-semibold ${item.voted ? "border-lime-400 bg-lime-100 text-lime-950" : "border-stone-300 bg-white text-ink hover:bg-stone-100"}`}
                        onClick={() => toggleRoadmapVote(item.id)}
                      >
                        <span className="block">✓ {item.title}</span>
                        <span className="mt-1 block text-xs text-stone-600">👍 {item.votes} votes</span>
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
            {featureRequests.length > 0 && (
              <section className="mt-6 rounded border border-yellow-200 bg-yellow-50 p-4">
                <h3 className="text-sm font-black uppercase tracking-wide text-yellow-950">Your submitted ideas</h3>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {featureRequests.slice(0, 6).map((request) => (
                    <div key={request.id} className="rounded bg-white p-3 text-sm">
                      <p className="font-semibold text-ink">{request.text}</p>
                      <p className="mt-1 text-xs font-semibold text-stone-500">{request.category}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
            <button className="mt-6 rounded bg-ink px-4 py-2 text-sm font-black text-white hover:bg-black" onClick={() => setActiveModal("featureRequest")}>
              Feedback
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
