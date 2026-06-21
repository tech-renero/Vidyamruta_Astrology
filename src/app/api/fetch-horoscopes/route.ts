import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'; // Using the Admin library to bypass RLS

export const dynamic = 'force-dynamic';

// 1. Strict TypeScript Interface for the AstroJSON Response
interface AstroJsonResponse {
  lang: string;
  date: string;
  period: string;
  color: string;
  colorHex: string;
  compatibility: string[];
  luckyNumber: number;
  luckyTime: string;
  mood: string;
  sign: string;
  zodiac: { element: string; name: string; symbol: string };
  horoscope: {
    general: string;
    career: string;
    finance: string;
    health: string;
    romance: string;
  };
  horoscopeScore: {
    general: number;
    career: number;
    finance: number;
    health: number;
    romance: number;
  };
}

// 2. Explicitly define the signs array
const ZODIAC_SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

export async function GET(request: Request) {
  // Security guard for the Cron Job
//   const authHeader = request.headers.get('authorization');
//   if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

  // 3. CREATE THE ADMIN CLIENT (This completely bypasses RLS)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const apiKey = process.env.ASTROJSON_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });
  }

  const results = { successful: 0, failed: 0, errors: [] as string[] };

  // 4. Fetch and Upsert Loop
  for (const sign of ZODIAC_SIGNS) {
    try {
      // Fetching with required &lang=en parameter and x-api-key header
      const response = await fetch(`https://api.astrojson.com/v1/horoscopes?sign=${sign}&lang=en&period=daily`, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) throw new Error(`API returned ${response.status}`);

      const apiData = (await response.json()) as AstroJsonResponse;

      // 5. USE THE ADMIN CLIENT FOR THE UPSERT
      const { error: dbError } = await supabaseAdmin 
        .from('daily_horoscopes')
        .upsert(
          {
            sunsign: sign,
            horoscope_date: apiData.date,
            prediction: apiData.horoscope.general,
            symbol: apiData.zodiac.symbol,
            element: apiData.zodiac.element,
            lucky_color: apiData.color,
            color_hex: apiData.colorHex,
            lucky_number: apiData.luckyNumber,
            lucky_time: apiData.luckyTime,
            mood: apiData.mood,
            compatibility: apiData.compatibility,
            career_prediction: apiData.horoscope.career,
            finance_prediction: apiData.horoscope.finance,
            health_prediction: apiData.horoscope.health,
            romance_prediction: apiData.horoscope.romance,
            overall_rating: apiData.horoscopeScore.general,
            career_rating: apiData.horoscopeScore.career,
            finance_rating: apiData.horoscopeScore.finance,
            health_rating: apiData.horoscopeScore.health,
            romance_rating: apiData.horoscopeScore.romance,
          },
          { onConflict: 'sunsign, horoscope_date' }
        );

      if (dbError) throw dbError;
      results.successful++;
    } catch (error: any) {
      // Unmasks the true database error if it fails
      const errorMessage = error?.message || JSON.stringify(error) || 'Unknown error';
      results.errors.push(`${sign}: ${errorMessage}`);
      results.failed++;
    }
  }

  return NextResponse.json({ message: 'AstroJSON Sync Complete', results });
}