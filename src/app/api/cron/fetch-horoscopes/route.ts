import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const API_NINJAS_KEY = process.env.API_NINJAS_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const ZODIAC_SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

interface HoroscopeResponse {
  sunsign: string;
  horoscope: string;
  date: string;
}

export async function GET() {
  // Optional: Add a simple auth mechanism for manual triggers if needed
  // For Vercel Cron, you can verify the authorization header:
  // const authHeader = request.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) { ... }

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase URL or Service Role Key is missing in environment variables.');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const today = new Date().toISOString().split('T')[0];
    let successCount = 0;

    console.log(`Starting horoscope fetch for ${today}...`);

    for (const sign of ZODIAC_SIGNS) {
      try {
        const response = await fetch(`https://api.api-ninjas.com/v1/horoscope?zodiac=${sign}`, {
          headers: { 'X-Api-Key': API_NINJAS_KEY || '' },
        });

        if (!response.ok) {
          throw new Error(`API Ninjas error: ${response.status} ${response.statusText}`);
        }

        const data: HoroscopeResponse = await response.json();
        const horoscopeDate = data.date || today;

        const { error: upsertError } = await supabase
          .from('daily_horoscopes')
          .upsert({
            sunsign: sign,
            prediction: data.horoscope,
            horoscope_date: horoscopeDate,
          }, { 
            onConflict: 'sunsign, horoscope_date' 
          });

        if (upsertError) {
          console.error(`Supabase upsert error for ${sign}:`, upsertError);
        } else {
          successCount++;
          console.log(`Successfully updated horoscope for ${sign}`);
        }
      } catch (err) {
        console.error(`Failed to fetch horoscope for ${sign}:`, err);
      }
    }

    // Rolling Retention: Delete records older than 7 days
    if (successCount > 0) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const dateLimit = sevenDaysAgo.toISOString().split('T')[0];

      console.log(`Cleaning up records older than ${dateLimit}...`);
      
      const { error: deleteError } = await supabase
        .from('daily_horoscopes')
        .delete()
        .lt('horoscope_date', dateLimit);

      if (deleteError) {
        console.error('Error during rolling retention cleanup:', deleteError);
      } else {
        console.log('Rolling retention cleanup successful.');
      }
    } else {
      console.warn('No new records were saved today. Skipping cleanup to preserve historical data.');
    }

    return NextResponse.json({ 
      message: 'Horoscope update process completed', 
      success_count: successCount 
    });

  } catch (error: unknown) {
    console.error('Fatal error in cron API route:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
