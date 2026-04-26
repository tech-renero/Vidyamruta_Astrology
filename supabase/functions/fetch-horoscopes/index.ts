// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const API_NINJAS_KEY = Deno.env.get('API_NINJAS_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const ZODIAC_SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

interface HoroscopeResponse {
  sunsign: string;
  horoscope: string;
  date: string;
}

Deno.serve(async () => {
  try {
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

        // Use the date provided by the API to ensure consistency
        const horoscopeDate = data.date || today;

        // Use upsert to prevent duplicates
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
    // ONLY run if at least one new record was saved today
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

    return new Response(JSON.stringify({ 
      message: 'Horoscope update process completed', 
      success_count: successCount 
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Fatal error in edge function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
