import KundliClient from './KundliClient';
import { getKundliForDetails } from '@/services';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Free Janam Kundli & Birth Chart | Vidyamruta",
  description: "Generate your highly accurate Vedic Janam Kundli (Birth Chart) instantly. Discover planetary positions, doshas, and astrological insights.",
  openGraph: {
    title: "Free Janam Kundli & Birth Chart | Vidyamruta",
    description: "Generate your highly accurate Vedic Janam Kundli (Birth Chart) instantly. Discover planetary positions, doshas, and astrological insights.",
    type: 'website',
    siteName: 'Vidyamruta',
  },
};

export default async function KundliPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const name = typeof resolvedParams.name === 'string' ? resolvedParams.name : undefined;
  const date = typeof resolvedParams.date === 'string' ? resolvedParams.date : undefined;
  const time = typeof resolvedParams.time === 'string' ? resolvedParams.time : undefined;
  const location = typeof resolvedParams.location === 'string' ? resolvedParams.location : undefined;

  let kundliData = null;
  let error = '';

  if (name && date && time && location) {
    try {
      kundliData = await getKundliForDetails({ name, date, time, location });
    } catch (err: any) {
      error = err.message || 'An error occurred while generating the Kundli.';
    }
  }

  return (
    <KundliClient 
      initialData={kundliData} 
      initialError={error} 
      initialParams={{ name, date, time, location }} 
    />
  );
}
