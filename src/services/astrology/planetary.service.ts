import { MoonDetails, MappedHouse, PlanetInfo } from '@/types/astrology';

export interface CorrectedPositions {
  [key: string]: {
    longitude: number;
    degree: number;
    rashiIndex: number;
  };
}

export interface PanchangPositionData {
  longitude?: number;
  degree?: number;
  rashiIndex?: number;
}

export interface PanchangData {
  planetaryPositions?: Record<string, PanchangPositionData>;
  [key: string]: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getStandardLahiriAyanamsa(_date: Date): number {
  // Using a fixed Lahiri ayanamsa of 23.8545 consistently
  return 23.8545;
}

export function applySiderealCorrection(positions: Record<string, PanchangPositionData>, date: Date): CorrectedPositions {
  const ayanamsa = getStandardLahiriAyanamsa(date);
  const corrected: CorrectedPositions = {};
  if (!positions) return corrected;

  for (const [key, pos] of Object.entries(positions)) {
    if (!pos || (typeof pos.longitude !== 'number' && typeof pos.rashiIndex !== 'number')) continue;

    const fullLon = pos.longitude ?? ((pos.rashiIndex || 0) * 30 + (pos.degree || 0));
    const siderealLon = ((fullLon - ayanamsa) % 360 + 360) % 360;

    corrected[key] = {
      longitude: siderealLon,
      degree: siderealLon % 30,
      rashiIndex: Math.floor(siderealLon / 30)
    };
  }

  return corrected;
}

export function buildMappedHouses(kData: { houses: { rashi?: number, planets: string[] }[] }, panchangData: PanchangData, ayanamsa: number): MappedHouse[] {
  const ascPos = panchangData.planetaryPositions?.ascendant;
  let ascendantSiderealRashi = kData.houses?.[0]?.rashi || 0;

  if (ascPos) {
    const ascFullLon = ascPos.longitude ?? ((ascPos.rashiIndex || 0) * 30 + (ascPos.degree || 0));
    const siderealAscLon = ((ascFullLon - ayanamsa) % 360 + 360) % 360;
    ascendantSiderealRashi = Math.floor(siderealAscLon / 30);
  }

  return kData.houses.map((h: { rashi?: number, planets: string[] }, i: number) => {
    const planetsWithDegrees: PlanetInfo[] = h.planets.map((pName: string) => {
      const posKey = pName.toLowerCase();
      const pos = panchangData.planetaryPositions?.[posKey];
      let degree: number | undefined = undefined;

      if (pos) {
        const fullLon = pos.longitude ?? ((pos.rashiIndex || 0) * 30 + (pos.degree || 0));
        const siderealLon = ((fullLon - ayanamsa) % 360 + 360) % 360;
        degree = siderealLon % 30;
      }

      return { name: pName, degree };
    });

    return {
      houseNumber: i + 1,
      rashi: (ascendantSiderealRashi + i) % 12,
      planets: planetsWithDegrees
    };
  });
}

export function getMoonDetails(panchangData: PanchangData, date: Date): MoonDetails | null {
  const moon = panchangData.planetaryPositions?.moon || panchangData.planetaryPositions?.Moon;
  if (!moon) return null;

  const ayanamsa = getStandardLahiriAyanamsa(date);
  const tropicalMoonLon = moon.longitude ?? 0;
  const moonLon = ((tropicalMoonLon - ayanamsa) % 360 + 360) % 360;

  const rashiNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const nakshatraNames = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashirsha', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
    'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
  ];
  const nakshatraLords = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
  const dashaDurations: Record<string, number> = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 };

  const rashiIndex = Math.floor(moonLon / 30);
  const nakshatraLength = 360 / 27;
  const nakshatraIndex = Math.floor(moonLon / nakshatraLength);
  const degInNak = moonLon % nakshatraLength;
  const pada = Math.floor(degInNak / (nakshatraLength / 4)) + 1;

  const lord = nakshatraLords[nakshatraIndex];
  const degreesRemaining = nakshatraLength - degInNak;
  const balanceYears = (degreesRemaining / nakshatraLength) * (dashaDurations[lord] || 0);

  return {
    rashiName: rashiNames[rashiIndex],
    nakshatra: nakshatraNames[nakshatraIndex],
    nakshatraLord: lord,
    pada: pada,
    degree: moonLon,
    tropicalDegree: tropicalMoonLon,
    ayanamsa,
    dashaBalance: balanceYears,
  };
}