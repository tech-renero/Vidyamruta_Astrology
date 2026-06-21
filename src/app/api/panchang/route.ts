import { NextResponse } from 'next/server';
import { getPanchangForDetails } from '@/services/astrology/panchang.service';

export async function GET(request: Request) {
    try {
        // 1. Get the date and location from the URL search parameters
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');
        const location = searchParams.get('location');

        // We can default the time to midnight or accept it from params
        const time = searchParams.get('time') || '00:00';

        if (!date || !location) {
            return NextResponse.json(
                { error: "Missing required parameters: date and location" },
                { status: 400 }
            );
        }

        // 2. Use the helper function we built earlier
        const panchangData = await getPanchangForDetails({
            name: 'API User', // Default name since it's required by UserDetails
            date,
            time,
            location
        });

        // 3. Return it strictly as JSON!
        return NextResponse.json({ success: true, data: panchangData });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}