import PanchangClient from './PanchangClient';
import { getPanchangForDetails, extractTithiName, extractYogaName, extractKaranName, extractNakshatraName } from '@/services/astrology/panchang.service';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Today's Panchang & Auspicious Timings | Vidyamruta",
  description: "Check the daily Hindu Panchang. Find accurate Tithi, Nakshatra, Yoga, Karana, and auspicious/inauspicious Muhurats for your location.",
};

export default async function PanchangPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const date = typeof resolvedParams.date === 'string' ? resolvedParams.date : undefined;
  const location = typeof resolvedParams.location === 'string' ? resolvedParams.location : undefined;

  let panchangResult = null;

  if (date && location) {
    try {
      const pData = await getPanchangForDetails({ name: 'User', date, time: '12:00', location });

      const formatTime = (d: Date | string | undefined) => {
        if (!d) return '—';
        return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      };

      const formatRange = (start: Date | string | undefined, end: Date | string | undefined) => {
        if (!start || !end) return '—';
        return `${formatTime(start)} - ${formatTime(end)}`;
      };

      const formatRangeArray = (arr: any) => {
        if (!Array.isArray(arr) || arr.length === 0) return '—';
        return arr.map((item: any) => formatRange(item.start, item.end)).join(', ');
      };

      const extractArrayNames = (arr: any) => {
        if (Array.isArray(arr) && arr.length > 0) return arr.map((i: any) => i.name).join(' / ');
        return null;
      };

      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = typeof pData.vara === 'number' ? days[pData.vara] : (pData.dayOfWeek || new Date(date).toLocaleDateString('en-US', { weekday: 'long' }));

      panchangResult = {
        // --- 1. RAW DATA FOR VISUAL TIMELINE ---
        // Passed exactly as-is so the client component can calculate math/percentages
        sunrise: pData.sunrise,
        sunset: pData.sunset,
        tithis: pData.tithis,
        nakshatras: pData.nakshatras,
        yogas: pData.yogas,
        karanas: pData.karanas,

        // --- 2. FORMATTED STRINGS FOR INFO CARDS ---
        tithi: extractArrayNames(pData.tithis) || extractTithiName(pData.tithi),
        karana: extractArrayNames(pData.karanas) || extractKaranName(pData.karana),
        yoga: extractArrayNames(pData.yogas) || extractYogaName(pData.yoga),
        nakshatra: extractArrayNames(pData.nakshatras) || extractNakshatraName(pData.nakshatra),

        formattedSunrise: formatTime(pData.sunrise),
        formattedSunset: formatTime(pData.sunset),
        moonrise: formatTime(pData.moonrise),
        moonset: formatTime(pData.moonset),

        // Timings
        rahuKalam: formatRange(pData.rahuKalamStart || pData.rahuKalam?.start, pData.rahuKalamEnd || pData.rahuKalam?.end),
        yamaganda: formatRange(pData.yamagandaKalam?.start || pData.yamaganda?.start, pData.yamagandaKalam?.end || pData.yamaganda?.end),
        gulika: formatRange(pData.gulikaKalam?.start || pData.gulika?.start, pData.gulikaKalam?.end || pData.gulika?.end),
        abhijit: formatRange(pData.abhijitMuhurta?.start || pData.abhijit?.start, pData.abhijitMuhurta?.end || pData.abhijit?.end),
        brahma: formatRange(pData.brahmaMuhurta?.start, pData.brahmaMuhurta?.end),
        amritKalam: formatRangeArray(pData.amritKalam),
        durMuhurta: formatRangeArray(pData.durMuhurta),
        varjyam: formatRangeArray(pData.varjyam),

        // Meta & Extras
        dayOfWeek: dayName,
        paksha: pData.paksha ? `${pData.paksha} Paksha` : '—',
        masa: pData.masa?.name || pData.masa || '—',
        samvat: pData.samvat?.vikram || pData.vikramSamvat || '—',
        sunSign: pData.sunRashi?.name || '—',
        moonSign: pData.moonRashi?.name || '—',
        ritu: pData.ritu || '—',
        ayana: pData.ayana || '—',
        dishaShoola: pData.dishaShoola?.inauspiciousDirection || '—',

        // --- 3. RAW CHOGHADIYA ARRAY ---
        choghadiya: pData.choghadiya
      };
    } catch (err: any) {
      console.error("Panchang Error:", err);
    }
  }

  return (
    <PanchangClient
      initialData={panchangResult}
      initialParams={{ date, location }}
    />
  );
}