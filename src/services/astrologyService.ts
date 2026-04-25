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
  
  // Format houses to match our KundliChart expected props
  const mappedHouses = kData.houses.map((h: any, i: number) => ({
    houseNumber: i + 1,
    rashi: h.rashi,
    planets: h.planets
  }));

  const { generatePanchang } = require('@/lib/astrology');
  const panchangData = generatePanchang(dateObj, { latitude: lat, longitude: lon });

  // Calculate accurate Moon Rashi and Nakshatra
  const moon = panchangData.planetaryPositions?.moon || panchangData.planetaryPositions?.Moon;
  let moonDetails = null;
  if (moon) {
    // IMPORTANT: moon.degree is degree-within-rashi (0-30°), NOT full longitude.
    // We MUST use moon.longitude (0-360°) for rashi and nakshatra calculations.
    const moonLon = moon.longitude;
    const rashiNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const nakshatraNames = [
      'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashirsha', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
      'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
      'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ];
    
    // Each rashi is 30 degrees
    const rashiIndex = Math.floor(moonLon / 30) % 12;
    // Each nakshatra is 13 degrees 20 minutes = 13.333333... degrees
    const nakshatraIndex = Math.floor(moonLon / (360 / 27));
    const pada = Math.floor((moonLon % (360 / 27)) / (360 / 108)) + 1;

    moonDetails = {
      rashiName: rashiNames[rashiIndex],
      nakshatra: nakshatraNames[nakshatraIndex],
      pada: pada,
      degree: moonLon
    };
  }

  return {
    ...kData,
    mappedHouses,
    panchangData,
    moonDetails
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
