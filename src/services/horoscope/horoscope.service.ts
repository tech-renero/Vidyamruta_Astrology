// app/horoscope/horoscope.service.ts (IMPROVED VERSION)
import { createClient } from '@/utils/supabase/client';

export interface DailyHoroscope {
  id: string;
  sunsign: string;
  prediction: string;
  horoscope_date: string;
  created_at: string | null;
  symbol: string | null;
  element: string | null;
  ruling_planet: string | null;
  compatibility: string[] | null;
  lucky_day: string | null;
  weekly_prediction: string | null;
  overall_rating: number | null;
  rating_label: string | null;
  lucky_number: number | null;
  lucky_color: string | null;
  week_label: string | null;
  career_prediction?: string | null;
  finance_prediction?: string | null;
  health_prediction?: string | null;
  romance_prediction?: string | null;
  career_rating?: number | null;
  finance_rating?: number | null;
  health_rating?: number | null;
  romance_rating?: number | null;
  lucky_time?: string | null;
  color_hex?: string | null;
  mood?: string | null;
}

/**
 * Fetches the last 7 days of predictions for a specific sign.
 * Ordered by date descending for 'Weekly History' section.
 */
export async function getWeeklyHoroscopeHistory(sign: string): Promise<DailyHoroscope[]> {
  const supabase = createClient();

  // FIX #5: Use .returns<T> instead of type assertion for type safety
  const { data, error } = await supabase
    .from('daily_horoscopes')
    .select('*')
    .eq('sunsign', sign.toLowerCase())
    .order('horoscope_date', { ascending: false })
    .limit(7)
    .returns<DailyHoroscope[]>();

  if (error) {
    console.error(`Error fetching weekly history for ${sign}:`, error);
    throw error;
  }

  return data ?? [];
}

/**
 * Fetches today's prediction for a specific sign.
 */
export async function getTodayHoroscope(sign: string): Promise<DailyHoroscope | null> {
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('daily_horoscopes')
    .select('*')
    .eq('sunsign', sign.toLowerCase())
    .eq('horoscope_date', today)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching today's horoscope for ${sign}:`, error);
  }

  return (data as unknown as DailyHoroscope) ?? null;
}

/**
 * Fetches today's predictions for ALL 12 signs at once.
 * Used on the home page zodiac grid.
 */
export async function getAllTodayHoroscopes(): Promise<DailyHoroscope[]> {
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('daily_horoscopes')
    .select('*')
    .eq('horoscope_date', today)
    .returns<DailyHoroscope[]>();

  if (error) {
    console.error('Error fetching all today horoscopes:', error);
    return [];
  }

  return data ?? [];
}

/**
 * Get all horoscopes for a sign for the past N days.
 * Useful for trend analysis or showing reading history.
 */
export async function getHoroscopeHistory(
  sign: string,
  days: number = 30
): Promise<DailyHoroscope[]> {
  const supabase = createClient();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('daily_horoscopes')
    .select('*')
    .eq('sunsign', sign.toLowerCase())
    .gte('horoscope_date', startDateStr)
    .order('horoscope_date', { ascending: false })
    .returns<DailyHoroscope[]>();

  if (error) {
    console.error(`Error fetching horoscope history for ${sign}:`, error);
    throw error;
  }

  return data ?? [];
}

/**
 * Fetches the weekly quote from the Vidyamruta Star quotes table.
 */
export async function getStarQuote(sign: string): Promise<string | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('Vidyamruta Star quotes')
    .select('Quotes')
    .eq('Zodiac', sign.toLowerCase())
    .maybeSingle();

  if (error) {
    console.error(`Error fetching star quote for ${sign}:`, error);
    return null;
  }

  return data?.Quotes ?? null;
}