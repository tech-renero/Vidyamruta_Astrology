import axios from 'axios';

export async function getCoordinates(locationName: string): Promise<{ lat: number; lon: number }> {
  try {
    const geoRes = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: locationName,
        format: 'json',
        limit: 1,
      },
      headers: {
        // 🛡️ User-Agent updated for production safety
        'User-Agent': 'Vidyamruta/1.0 (admin@vidyamruta.com)',
        'Accept-Language': 'en',
      },
    });

    if (geoRes.data.length === 0) {
      throw new Error(`Location not found for: ${locationName}`);
    }

    return {
      lat: parseFloat(geoRes.data[0].lat),
      lon: parseFloat(geoRes.data[0].lon),
    };
  } catch (error: unknown) {
    throw new Error(`Failed to geocode location '${locationName}': ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}