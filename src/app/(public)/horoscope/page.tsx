import HoroscopeClient from './HoroscopeClient';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { DailyHoroscope } from '@/services/horoscope/horoscope.service';

export const metadata: Metadata = {
  title: "Daily Horoscope & Planetary Predictions | Vidyamruta",
  description: "Read your daily Vedic horoscope based on your Moon sign. Get accurate predictions for career, health, love, and finances.",
  openGraph: {
    title: "Daily Horoscope & Planetary Predictions | Vidyamruta",
    description: "Read your daily Vedic horoscope based on your Moon sign. Get accurate predictions for career, health, love, and finances.",
    type: 'website',
    siteName: 'Vidyamruta',
  },
};

export default async function HoroscopePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const sign = typeof resolvedParams.sign === 'string' ? resolvedParams.sign.toLowerCase() : 'aries';
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const today = new Date().toISOString().split('T')[0];

  // Fetch today
  const { data: todayHoroscope } = await supabase
    .from('daily_horoscopes')
    .select('*')
    .eq('sunsign', sign)
    .eq('horoscope_date', today)
    .maybeSingle();

  // Fetch weekly history
  const { data: weeklyHistory } = await supabase
    .from('daily_horoscopes')
    .select('*')
    .eq('sunsign', sign)
    .order('horoscope_date', { ascending: false })
    .limit(7);

  return (
    <HoroscopeClient 
      initialSign={sign} 
      todayHoroscope={todayHoroscope || null} 
      weeklyHistory={weeklyHistory || []} 
    />
  );
}
