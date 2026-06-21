export interface UserDetails {
  name: string;
  date: string;
  time: string;
  location: string;
}

export interface MoonDetails {
  rashiName: string;
  nakshatra: string;
  nakshatraLord: string;
  pada: number;
  degree: number;
  tropicalDegree: number;
  ayanamsa: number;
  dashaBalance: number;
}

export interface DashaPeriod {
  planet: string;
  startTime: Date;
  endTime: Date;
}

export interface DashaData {
  birthNakshatra: string;
  nakshatraPada: number;
  dashaBalance: string;
  fullCycle: DashaPeriod[];
  currentAntardasha?: DashaPeriod;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface PlanetInfo {
  name: string;
  degree?: number;
}

export interface MappedHouse {
  houseNumber: number;
  rashi: number; // 0–11, sidereal-corrected
  planets: PlanetInfo[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface PanchangData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface KundliResult {
  mappedHouses: MappedHouse[];
  moonDetails: MoonDetails | null;
  dashaData: DashaData | null;
  panchangData: PanchangData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ascendant: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chartData: { ascendant: any; moonDetails: MoonDetails | null };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface MatchResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface Antardasha {
  planet: string;
  startTime: Date;
  endTime: Date;
}
