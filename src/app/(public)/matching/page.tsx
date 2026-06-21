import MatchingClient from './MatchingClient';
import { getMatchForDetails } from '@/services/astrology/matching.service';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Kundli Matching & Ashtakoot Guna Milan | Vidyamruta",
  description: "Perform highly accurate Kundli matching (Guna Milan) for marriage. Check compatibility based on the traditional 36 points system.",
  openGraph: {
    title: "Kundli Matching & Ashtakoot Guna Milan | Vidyamruta",
    description: "Perform highly accurate Kundli matching (Guna Milan) for marriage. Check compatibility based on the traditional 36 points system.",
    type: 'website',
    siteName: 'Vidyamruta',
  },
};

export default async function MatchingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const boy_name = typeof resolvedParams.boy_name === 'string' ? resolvedParams.boy_name : undefined;
  const boy_date = typeof resolvedParams.boy_date === 'string' ? resolvedParams.boy_date : undefined;
  const boy_time = typeof resolvedParams.boy_time === 'string' ? resolvedParams.boy_time : undefined;
  const boy_location = typeof resolvedParams.boy_location === 'string' ? resolvedParams.boy_location : undefined;

  const girl_name = typeof resolvedParams.girl_name === 'string' ? resolvedParams.girl_name : undefined;
  const girl_date = typeof resolvedParams.girl_date === 'string' ? resolvedParams.girl_date : undefined;
  const girl_time = typeof resolvedParams.girl_time === 'string' ? resolvedParams.girl_time : undefined;
  const girl_location = typeof resolvedParams.girl_location === 'string' ? resolvedParams.girl_location : undefined;

  let matchResult = null;

  if (boy_name && boy_date && boy_time && boy_location &&
      girl_name && girl_date && girl_time && girl_location) {
    try {
      const result = await getMatchForDetails(
        { name: boy_name, date: boy_date, time: boy_time, location: boy_location },
        { name: girl_name, date: girl_date, time: girl_time, location: girl_location }
      );
      
      let message = "Not Recommended";
      if (result.totalScore >= 18 && result.totalScore < 24) message = "Average Match (Acceptable)";
      if (result.totalScore >= 24 && result.totalScore < 30) message = "Good Match (Recommended)";
      if (result.totalScore >= 30) message = "Highly Compatible (Excellent Match)";
      
      matchResult = {
        score: result.totalScore || 0,
        max: 36,
        message,
        details: result.ashtakoota ? Object.entries(result.ashtakoota).map(([guna, data]: [string, any]) => ({
          guna,
          obtained: data.score || 0,
          max: data.max || 0,
        })) : []
      };
      
    } catch (err: any) {
      console.error("Match Error:", err);
    }
  }

  return (
    <MatchingClient 
      initialData={matchResult} 
      initialParams={{
        boy_name, boy_date, boy_time, boy_location,
        girl_name, girl_date, girl_time, girl_location
      }} 
    />
  );
}
