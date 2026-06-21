/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */
import { getCoordinates } from './geocoding.service';
import { buildMappedHouses, getMoonDetails, getStandardLahiriAyanamsa } from './planetary.service';
import { computeDashaData } from './dasha.service';
import { getLocalDateObject } from './panchang.service';
import { UserDetails, KundliResult } from '@/types/astrology';

export async function getKundliForDetails(details: UserDetails): Promise<KundliResult> {
  const { lat, lon } = await getCoordinates(details.location);
  const dateObj = getLocalDateObject(details.date, details.time);

  const { generateKundli } = await import('@/lib/astrology');
  const kData = generateKundli(dateObj, { latitude: lat, longitude: lon });

  const { generatePanchang } = await import('@/lib/astrology');
  const panchangData = generatePanchang(dateObj, { latitude: lat, longitude: lon });

  // Use fixed Lahiri ayanamsa (23.8545) instead of the library's value
  const ayanamsa = getStandardLahiriAyanamsa(dateObj);

  // Override the library's ayanamsha so the UI displays our fixed value
  // @ts-ignore
  panchangData.ayanamsha = ayanamsa;
  panchangData.ayanamsa = ayanamsa;

  const mappedHouses = buildMappedHouses(kData, panchangData as any, ayanamsa);
  const moonDetails = getMoonDetails(panchangData as any, dateObj);

  let dashaDataOverride = null;
  if (moonDetails) {
    dashaDataOverride = computeDashaData(moonDetails, dateObj);
  }

  return {
    ...kData,
    mappedHouses,
    panchangData,
    moonDetails,
    chartData: { ascendant: kData.ascendant, moonDetails },
    // @ts-ignore
    dashaData: dashaDataOverride || panchangData.vimshottariDasha,
  };
}
