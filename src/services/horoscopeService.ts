import { createClient } from '@/utils/supabase/client';

export interface HoroscopeEntry {
  sunsign: string;
  prediction: string;
  horoscope_date: string;
  created_at: string;
}

/**
 * Fetches the last 7 days of predictions for a specific sign.
 * Ordered by date descending for 'Weekly History' section.
 */
export async function getWeeklyHoroscopeHistory(sign: string): Promise<HoroscopeEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('daily_horoscopes')
    .select('*')
    .eq('sunsign', sign.toLowerCase())
    .order('horoscope_date', { ascending: false })
    .limit(7);

  if (error) {
    console.error(`Error fetching weekly history for ${sign}:`, error);
    throw error;
  }

  return data || [];
}

/**
 * Fetches today's prediction for a specific sign.
 */
export async function getTodayHoroscope(sign: string): Promise<HoroscopeEntry | null> {
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('daily_horoscopes')
    .select('*')
    .eq('sunsign', sign.toLowerCase())
    .eq('horoscope_date', today)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is 'no rows returned'
    console.error(`Error fetching today's horoscope for ${sign}:`, error);
  }

  return data || null;
}

/**
 * Fetches today's predictions for ALL 12 signs at once.
 * Used on the home page zodiac grid.
 */
export async function getAllTodayHoroscopes(): Promise<HoroscopeEntry[]> {
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('daily_horoscopes')
    .select('*')
    .eq('horoscope_date', today);

  if (error) {
    console.error('Error fetching all today horoscopes:', error);
    return [];
  }

  return data || [];
}
