import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Database Connection Check
    // Fetch the standard daily astrological data that the Horoscope module relies on
    const today = new Date().toISOString().split('T')[0];
    const { data: databaseResult, error: dbError } = await supabase
      .from('daily_horoscopes')
      .select('*')
      .eq('sunsign', 'aries')
      .eq('horoscope_date', today)
      .maybeSingle();

    if (dbError) {
      throw new Error(`Database fetch failed: ${dbError.message}`);
    }

    // 2. Engine Check (@ishubhamx/panchangam-js)
    // Running the engine exactly as it happens in the astrology service layer
    const astrologyService = await import('@/services');
    let engineResult = null;
    
    try {
      // We use a default location to verify the geocoding and calculation engine is working
      engineResult = await astrologyService.getPanchangForDetails({
        name: 'Debug Check',
        date: today,
        time: '12:00',
        location: 'New Delhi, India'
      });
    } catch (engineError: any) {
      engineResult = { engineFailure: engineError.message };
    }

    return NextResponse.json({
      status: "success",
      databaseResult: databaseResult || { message: "No rows found for today's horoscope" },
      engineResult,
      errorDetails: null
    }, { status: 200 });

  } catch (error: any) {
    console.error("Horoscope Debug Error:", error);
    return NextResponse.json({
      status: "error",
      databaseResult: null,
      engineResult: null,
      errorDetails: error.message || "Unknown internal error occurred"
    }, { status: 500 });
  }
}
