export type ModularBuildingCategory =
  | "restaurants"
  | "transport"
  | "civic"
  | "retail"
  | "residential"
  | "park"
  | "industrial";

export type ModularBuildingType = "straight" | "corner" | "end" | "freestanding";
export type FrontFacingSide = "north" | "east" | "south" | "west";

export type ModularBuildingPreset = {
  setNumber: string;
  name: string;
  year: number;
  widthStuds: number;
  depthStuds: number;
  type?: "official-modular";
  category: ModularBuildingCategory;
  modularType?: ModularBuildingType;
  frontFacingSide?: FrontFacingSide;
  footprintSvg?: string;
  silhouetteAsset?: string;
  isCornerBuilding: boolean;
  isOfficialLEGO: boolean;
  isSplitBuildingCompatible: boolean;
};

export type ModularFootprint = {
  name: string;
  setNumber: string;
  year: number;
  dimensions: {
    widthStuds: number;
    depthStuds: number;
  };
  footprintSvg: string;
  modularType: ModularBuildingType;
  frontFacingSide: FrontFacingSide;
};

export const modularBuildings: ModularBuildingPreset[] = [
  {
    setNumber: "10182",
    name: "Cafe Corner",
    year: 2007,
    widthStuds: 32,
    depthStuds: 32,
    category: "residential",
    isCornerBuilding: true,
    isOfficialLEGO: true,
    isSplitBuildingCompatible: false,
  },
  {
    setNumber: "10190",
    name: "Market Street",
    year: 2007,
    widthStuds: 32,
    depthStuds: 32,
    category: "retail",
    isCornerBuilding: false,
    isOfficialLEGO: true,
    isSplitBuildingCompatible: false,
  },
  {
    setNumber: "10185",
    name: "Green Grocer",
    year: 2008,
    widthStuds: 32,
    depthStuds: 32,
    category: "retail",
    isCornerBuilding: false,
    isOfficialLEGO: true,
    isSplitBuildingCompatible: false,
  },
  {
    setNumber: "10197",
    name: "Fire Brigade",
    year: 2009,
    widthStuds: 32,
    depthStuds: 32,
    category: "civic",
    isCornerBuilding: false,
    isOfficialLEGO: true,
    isSplitBuildingCompatible: false,
  },
  {
    setNumber: "10211",
    name: "Grand Emporium",
    year: 2010,
    widthStuds: 32,
    depthStuds: 32,
    category: "retail",
    isCornerBuilding: true,
    isOfficialLEGO: true,
    isSplitBuildingCompatible: false,
  },
  {
    setNumber: "10218",
    name: "Pet Shop",
    year: 2011,
    widthStuds: 32,
    depthStuds: 32,
    category: "retail",
    isCornerBuilding: false,
    isOfficialLEGO: true,
    isSplitBuildingCompatible: true,
  },
  {
    setNumber: "10224",
    name: "Town Hall",
    year: 2012,
    widthStuds: 32,
    depthStuds: 32,
    category: "civic",
    isCornerBuilding: false,
    isOfficialLEGO: true,
    isSplitBuildingCompatible: false,
  },
  {
    setNumber: "10232",
    name: "Palace Cinema",
    year: 2013,
    widthStuds: 32,
    depthStuds: 32,
    category: "civic",
    isCornerBuilding: true,
    isOfficialLEGO: true,
    isSplitBuildingCompatible: false,
  },
  {
    setNumber: "10243",
    name: "Parisian Restaurant",
    year: 2014,
    widthStuds: 32,
    depthStuds: 32,
    category: "restaurants",
    isCornerBuilding: false,
    isOfficialLEGO: true,
    isSplitBuildingCompatible: false,
  },
  {
    setNumber: "10246",
    name: "Detective's Office",
    year: 2015,
    widthStuds: 32,
    depthStuds: 32,
    category: "civic",
    isCornerBuilding: false,
    isOfficialLEGO: true,
    isSplitBuildingCompatible: false,
  },
  {
    setNumber: "10251",
    name: "Brick Bank",
    year: 2016,
    widthStuds: 32,
    depthStuds: 32,
    category: "civic",
    isCornerBuilding: true,
    isOfficialLEGO: true,
    isSplitBuildingCompatible: false,
  },
  {
    setNumber: "10255",
    name: "Assembly Square",
    year: 2017,
    widthStuds: 48,
    depthStuds: 32,
    category: "retail",
    isCornerBuilding: false,
    isOfficialLEGO: true,
    isSplitBuildingCompatible: false,
  },
  {
    setNumber: "10260",
    name: "Downtown Diner",
    year: 2018,
    widthStuds: 32,
    depthStuds: 32,
    category: "restaurants",
    isCornerBuilding: false,
    isOfficialLEGO: true,
    isSplitBuildingCompatible: false,
  },
  {
    setNumber: "10264",
    name: "Corner Garage",
    year: 2019,
    widthStuds: 32,
    depthStuds: 32,
    category: "industrial",
    isCornerBuilding: true,
    isOfficialLEGO: true,
    isSplitBuildingCompatible: false,
  },
  {
    setNumber: "10270",
    name: "Bookshop",
    year: 2020,
    widthStuds: 32,
    depthStuds: 32,
    category: "retail",
    isCornerBuilding: false,
    isOfficialLEGO: true,
    isSplitBuildingCompatible: true,
  },
  {
    setNumber: "10278",
    name: "Police Station",
    year: 2021,
    widthStuds: 32,
    depthStuds: 32,
    category: "civic",
    isCornerBuilding: false,
    isOfficialLEGO: true,
    isSplitBuildingCompatible: false,
  },
  {
    setNumber: "10297",
    name: "Boutique Hotel",
    year: 2022,
    widthStuds: 32,
    depthStuds: 32,
    category: "residential",
    isCornerBuilding: true,
    isOfficialLEGO: true,
    isSplitBuildingCompatible: false,
  },
  {
    setNumber: "10312",
    name: "Jazz Club",
    year: 2023,
    widthStuds: 32,
    depthStuds: 32,
    category: "restaurants",
    isCornerBuilding: false,
    isOfficialLEGO: true,
    isSplitBuildingCompatible: false,
  },
  {
    setNumber: "10326",
    name: "Natural History Museum",
    year: 2024,
    widthStuds: 48,
    depthStuds: 32,
    category: "civic",
    isCornerBuilding: false,
    isOfficialLEGO: true,
    isSplitBuildingCompatible: false,
  },
  {
    setNumber: "10350",
    name: "Tudor Corner",
    year: 2025,
    widthStuds: 32,
    depthStuds: 32,
    category: "residential",
    isCornerBuilding: true,
    isOfficialLEGO: true,
    isSplitBuildingCompatible: false,
  },
  {
    setNumber: "11371",
    name: "Shopping Street",
    year: 2026,
    widthStuds: 32,
    depthStuds: 32,
    category: "retail",
    isCornerBuilding: false,
    isOfficialLEGO: true,
    isSplitBuildingCompatible: false,
  },
];

const buildingAsset = (slug: string) => `/assets/buildings/${slug}.svg`;

const modularSilhouetteAssets: Record<string, string> = {
  "10182": buildingAsset("cafe-corner"),
  "10190": buildingAsset("market-street"),
  "10185": buildingAsset("green-grocer"),
  "10197": buildingAsset("fire-brigade"),
  "10211": buildingAsset("grand-emporium"),
  "10218": buildingAsset("pet-shop"),
  "10224": buildingAsset("town-hall"),
  "10232": buildingAsset("palace-cinema"),
  "10243": buildingAsset("parisian-restaurant"),
  "10246": buildingAsset("detectives-office"),
  "10251": buildingAsset("brick-bank"),
  "10255": buildingAsset("assembly-square"),
  "10260": buildingAsset("downtown-diner"),
  "10264": buildingAsset("corner-garage"),
  "10270": buildingAsset("bookshop"),
  "10278": buildingAsset("police-station"),
  "10297": buildingAsset("boutique-hotel"),
  "10312": buildingAsset("jazz-club"),
  "10326": buildingAsset("natural-history-museum"),
  "10350": buildingAsset("tudor-corner"),
  "11371": buildingAsset("shopping-street"),
};

modularBuildings.forEach((building) => {
  building.type = "official-modular";
  building.modularType = building.isCornerBuilding ? "corner" : "straight";
  building.frontFacingSide = building.frontFacingSide ?? "south";
  building.silhouetteAsset = modularSilhouetteAssets[building.setNumber];
  building.footprintSvg = modularSilhouetteAssets[building.setNumber];
});

const modularFootprintSvg = (modularType: ModularBuildingType) => {
  if (modularType === "corner") {
    return '<svg viewBox="0 0 100 100"><rect x="4" y="4" width="92" height="92" rx="4"/><path d="M4 4h44v22H26v22H4z"/></svg>';
  }
  if (modularType === "freestanding") {
    return '<svg viewBox="0 0 100 100"><rect x="14" y="14" width="72" height="72" rx="8"/></svg>';
  }
  if (modularType === "end") {
    return '<svg viewBox="0 0 100 100"><rect x="4" y="4" width="92" height="92" rx="4"/><path d="M4 4h18v92H4z"/></svg>';
  }
  return '<svg viewBox="0 0 100 100"><rect x="4" y="4" width="92" height="92" rx="4"/><path d="M18 12h64M18 32h64M18 52h64"/></svg>';
};

export const officialModularFootprints: ModularFootprint[] = modularBuildings.map((building) => {
  const modularType: ModularBuildingType = building.isCornerBuilding ? "corner" : "straight";
  return {
    name: building.name,
    setNumber: building.setNumber,
    year: building.year,
    dimensions: {
      widthStuds: building.widthStuds,
      depthStuds: building.depthStuds,
    },
    footprintSvg: building.silhouetteAsset ?? modularFootprintSvg(modularType),
    modularType,
    frontFacingSide: "south",
  };
});
