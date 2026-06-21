import { getCoordinates } from './geocoding.service';
import { UserDetails, PanchangData } from '@/types/astrology';

export function getLocalDateObject(dateStr: string, timeStr: string): Date {
  const datetimeStr = `${dateStr}T${timeStr}:00+05:30`;
  const dateObj = new Date(datetimeStr);

  if (isNaN(dateObj.getTime())) {
    throw new Error("Invalid date or time format provided.");
  }
  return dateObj;
}

export async function getPanchangForDetails(details: UserDetails): Promise<PanchangData> {
  const { lat, lon } = await getCoordinates(details.location);
  const dateObj = getLocalDateObject(details.date, details.time);

  const { generatePanchang } = await import('@/lib/astrology');
  return generatePanchang(dateObj, { latitude: lat, longitude: lon });
}

// ✨ FIXED: Accurately parses 0-29 index for Tithi
export function extractTithiName(tithi: any): string {
  if (tithi == null) return '—';

  if (typeof tithi === 'number') {
    const tithiNames = [
      "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi",
      "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi",
      "Trayodashi", "Chaturdashi", "Purnima", "Pratipada", "Dwitiya",
      "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami",
      "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"
    ];
    return `${tithiNames[tithi % 30]} (${tithi < 15 ? 'Shukla' : 'Krishna'})`;
  }

  if (typeof tithi === 'string') return tithi;
  return tithi.name || '—';
}

// 🛡️ FULLY ARRAY-PROOF: Parses 0-26 index or array of Yogas
export function extractYogaName(yoga: any): string {
  if (yoga == null) return '—';

  const yogaNames = [
    "Vishkumbha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda",
    "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata",
    "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva",
    "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
  ];

  const parseValue = (val: any) => {
    if (typeof val === 'number') return yogaNames[val % 27];
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && val !== null) {
      return val.name || (val.id !== undefined ? yogaNames[val.id % 27] : null);
    }
    return null;
  };

  if (Array.isArray(yoga)) {
    const names = yoga.map(parseValue).filter(Boolean);
    return names.length > 0 ? Array.from(new Set(names)).join(' / ') : '—';
  }

  return parseValue(yoga) || '—';
}

// 🛡️ FULLY ARRAY-PROOF: Parses 0-26 index or array of Nakshatras
export function extractNakshatraName(nakshatra: any): string {
  if (nakshatra == null) return '—';

  const nakshatraNames = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha",
    "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
  ];

  const parseValue = (val: any) => {
    if (typeof val === 'number') return nakshatraNames[val % 27];
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && val !== null) {
      return val.name || (val.id !== undefined ? nakshatraNames[val.id % 27] : null);
    }
    return null;
  };

  if (Array.isArray(nakshatra)) {
    const names = nakshatra.map(parseValue).filter(Boolean);
    return names.length > 0 ? Array.from(new Set(names)).join(' / ') : '—';
  }

  return parseValue(nakshatra) || '—';
}

// 🛡️ FULLY ARRAY-PROOF: Handles standard math transitions and arrays of Karanas
export function extractKaranName(karana: any): string {
  if (karana == null) return '—';

  const parseNumber = (num: number) => {
    if (num >= 1 && num <= 60) {
      if (num === 1) return "Kintughna";
      if (num === 58) return "Shakuni";
      if (num === 59) return "Chatushpada";
      if (num === 60) return "Naga";
      const movingKaranas = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti"];
      return movingKaranas[(num - 2) % 7];
    }
    if (num >= 0 && num <= 10) {
      const karanaList = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti", "Shakuni", "Chatushpada", "Naga", "Kintughna"];
      return karanaList[num];
    }
    return String(num);
  };

  if (Array.isArray(karana)) {
    const names = karana.map((k: any) => {
      if (typeof k === 'string') return k;
      if (typeof k === 'number') return parseNumber(k);
      return k.name || k.id || '';
    }).filter(Boolean);

    return names.length > 0 ? Array.from(new Set(names)).join(' / ') : '—';
  }

  if (typeof karana === 'string') return karana;
  if (typeof karana === 'number') return parseNumber(karana);
  if (typeof karana === 'object' && karana.name) return karana.name;

  return '—';
}