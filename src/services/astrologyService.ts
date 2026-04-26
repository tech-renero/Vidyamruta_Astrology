import axios from 'axios';
import { generateKundli, performMatch } from '@/lib/astrology';

export interface UserDetails {
  name: string;
  date: string;
  time: string;
  location: string;
}

/**
 * Geocodes a location string using OpenStreetMap Nominatim API.
 */
export async function getCoordinates(locationName: string): Promise<{ lat: number; lon: number }> {
  const geoRes = await axios.get('https://nominatim.openstreetmap.org/search', {
    params: {
      q: locationName,
      format: 'json',
      limit: 1
    }
  });

  if (geoRes.data.length === 0) {
    throw new Error(`Location not found for: ${locationName}`);
  }

  return {
    lat: parseFloat(geoRes.data[0].lat),
    lon: parseFloat(geoRes.data[0].lon)
  };
}

/**
 * Generates Kundli data for the given user details.
 */
export async function getKundliForDetails(details: UserDetails) {
  const { lat, lon } = await getCoordinates(details.location);
  
  // Format: YYYY-MM-DDTHH:mm:ss
  const datetimeStr = `${details.date}T${details.time}:00`;
  const dateObj = new Date(datetimeStr);
  
  // Basic validation to prevent "Invalid Date"
  if (isNaN(dateObj.getTime())) {
    throw new Error("Invalid date or time format provided.");
  }

  const kData = generateKundli(dateObj, { latitude: lat, longitude: lon });
  
  const { generatePanchang } = require('@/lib/astrology');
  const panchangData = generatePanchang(dateObj, { latitude: lat, longitude: lon });

  // Format houses to match our KundliChart expected props
  const mappedHouses = kData.houses.map((h: any, i: number) => {
    const planetsWithDegrees = h.planets.map((pName: string) => {
      const posKey = pName.toLowerCase();
      const pos = panchangData.planetaryPositions?.[posKey];
      let degree = undefined;
      if (pos) {
         degree = pos.degree !== undefined ? pos.degree : pos.longitude % 30;
      }
      return { name: pName, degree };
    });
    return {
      houseNumber: i + 1,
      rashi: h.rashi,
      planets: planetsWithDegrees
    };
  });

  // Calculate accurate Moon Rashi and Nakshatra
  const moon = panchangData.planetaryPositions?.moon || panchangData.planetaryPositions?.Moon;
  let moonDetails = null;
  if (moon) {
    // CRITICAL: The library returns TROPICAL longitude.
    // For Vedic/sidereal calculations we must subtract the Lahiri Ayanamsha.
    // getAyanamsa() returns the Lahiri ayanamsa in degrees.
    const { getAyanamsa } = require('@ishubhamx/panchangam-js');
    const ayanamsa = getAyanamsa(dateObj); // e.g. 23.8545 for Oct 1999
    const tropicalMoonLon = moon.longitude;
    // Sidereal longitude (0-360, wrapping)
    const moonLon = ((tropicalMoonLon - ayanamsa) % 360 + 360) % 360;

    const rashiNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const nakshatraNames = [
      'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashirsha', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
      'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
      'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ];
    const nakshatraLords = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury','Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury','Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
    const dashaDurations: Record<string, number> = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 };

    // Each rashi is 30 degrees (sidereal)
    const rashiIndex = Math.floor(moonLon / 30) % 12;
    // Each nakshatra is 13°20' = 13.3333... degrees
    const nakshatraLength = 360 / 27;
    const nakshatraIndex = Math.floor(moonLon / nakshatraLength);
    const degInNak = moonLon % nakshatraLength;
    const pada = Math.floor(degInNak / (nakshatraLength / 4)) + 1;

    // Vimshottari balance at birth based on sidereal Moon
    const lord = nakshatraLords[nakshatraIndex];
    const fractionRemaining = (nakshatraLength - degInNak) / nakshatraLength;
    const balanceYears = fractionRemaining * dashaDurations[lord];

    moonDetails = {
      rashiName: rashiNames[rashiIndex],
      nakshatra: nakshatraNames[nakshatraIndex],
      nakshatraLord: lord,
      pada: pada,
      degree: moonLon, // sidereal
      tropicalDegree: tropicalMoonLon,
      ayanamsa,
      dashaBalance: balanceYears,
    };
  }

  // Build corrected dasha cycle from sidereal Moon
  let dashaDataOverride = null;
  if (moonDetails) {
    const fixedOrder = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
    const dashaDurations: Record<string, number> = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 };
    const startIdx = fixedOrder.indexOf(moonDetails.nakshatraLord);
    const fullCycle: any[] = [];
    let curDate = new Date(dateObj);

    // First entry: balance of current dasha
    const firstEnd = new Date(curDate.getTime() + moonDetails.dashaBalance * 365.2425 * 86400 * 1000);
    fullCycle.push({ planet: moonDetails.nakshatraLord, startTime: new Date(curDate), endTime: firstEnd });
    curDate = firstEnd;

    for (let i = 1; i < 9; i++) {
      const planet = fixedOrder[(startIdx + i) % 9];
      const yrs = dashaDurations[planet];
      const endDate = new Date(curDate.getTime() + yrs * 365.2425 * 86400 * 1000);
      fullCycle.push({ planet, startTime: new Date(curDate), endTime: endDate });
      curDate = endDate;
    }

    dashaDataOverride = {
      birthNakshatra: moonDetails.nakshatra,
      nakshatraPada: moonDetails.pada,
      dashaBalance: `${moonDetails.nakshatraLord}: ${moonDetails.dashaBalance.toFixed(2)}y`,
      fullCycle,
    };
  }

  return {
    ...kData,
    mappedHouses,
    panchangData,
    moonDetails,
    chartData: { ascendant: kData.ascendant, moonDetails },
    // Override the library's dasha with our sidereal-correct calculation
    dashaData: dashaDataOverride || panchangData.vimshottariDasha,
  };
}

/**
 * Performs Ashtakoota matching for two sets of user details.
 */
export async function getMatchForDetails(boyDetails: UserDetails, girlDetails: UserDetails) {
  const boyKundli = await getKundliForDetails(boyDetails);
  const girlKundli = await getKundliForDetails(girlDetails);
  
  return performMatch(boyKundli, girlKundli);
}

/**
 * Generates Daily Panchang data for the given user details (location & date).
 */
export async function getPanchangForDetails(details: UserDetails) {
  const { lat, lon } = await getCoordinates(details.location);
  
  // Format: YYYY-MM-DDTHH:mm:ss
  const datetimeStr = `${details.date}T${details.time}:00`;
  const dateObj = new Date(datetimeStr);
  
  if (isNaN(dateObj.getTime())) {
    throw new Error("Invalid date or time format provided.");
  }

  const { generatePanchang } = require('@/lib/astrology');
  return generatePanchang(dateObj, { latitude: lat, longitude: lon });
}
