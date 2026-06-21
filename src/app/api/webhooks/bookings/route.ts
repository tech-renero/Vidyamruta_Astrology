import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Supabase Admin Client to fetch user emails (bypass RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: any;
  old_record: any | null;
  schema: string;
}

export async function POST(req: Request) {
  try {
    // 1. Secure the Webhook Endpoint
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse the Webhook Payload
    const payload = (await req.json()) as WebhookPayload;
    const { type, table, record, old_record } = payload;

    // Only process consultation and vastu bookings
    if (table !== 'consultation_bookings' && table !== 'vastu_bookings') {
      return NextResponse.json({ message: 'Ignored table' }, { status: 200 });
    }

    // Extract relevant IDs
    const userId = record?.user_id;
    const astrologerId = record?.astrologer_id;
    const status = record?.status;
    const oldStatus = old_record?.status;

    if (!userId || !astrologerId) {
      return NextResponse.json({ message: 'Missing user or astrologer ID' }, { status: 200 });
    }

    // 3. Fetch Email Addresses using Supabase Admin
    const [userRes, astroRes] = await Promise.all([
      supabaseAdmin.auth.admin.getUserById(userId),
      supabaseAdmin.auth.admin.getUserById(astrologerId)
    ]);

    const userEmail = userRes.data?.user?.email;
    const astroEmail = astroRes.data?.user?.email;

    if (!userEmail) {
      console.warn(`User email not found for ID: ${userId}`);
      return NextResponse.json({ message: 'User email not found' }, { status: 200 });
    }

    // 4. Handle INSERT -> New Booking
    if (type === 'INSERT') {
      // Send Confirmation to User
      await resend.emails.send({
        from: 'Vidyamruta <bookings@vidyamruta.com>',
        to: userEmail,
        subject: 'Booking Received - Vidyamruta',
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Your Booking has been Received! 🙏</h2>
            <p>We have successfully received your booking request.</p>
            <p>Your astrologer will review the details and confirm the appointment shortly.</p>
            <p>Booking ID: <strong>${record.id}</strong></p>
          </div>
        `,
      });

      // Send Notification to Astrologer
      if (astroEmail) {
        await resend.emails.send({
          from: 'Vidyamruta <alerts@vidyamruta.com>',
          to: astroEmail,
          subject: 'New Booking Request - Vidyamruta',
          html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h2>New Booking Request 🌟</h2>
              <p>You have received a new consultation request on your profile.</p>
              <p>Please log in to your dashboard to review and confirm the booking.</p>
              <a href="https://vidyamruta.com/astrologer/dashboard" style="display:inline-block; padding:10px 20px; background:#e65100; color:#fff; text-decoration:none; border-radius:5px;">Go to Dashboard</a>
            </div>
          `,
        });
      }

      return NextResponse.json({ message: 'INSERT emails sent' }, { status: 200 });
    }

    // 5. Handle UPDATE -> Status Changes
    if (type === 'UPDATE' && status !== oldStatus) {
      if (status === 'confirmed' || status === 'accepted') {
        await resend.emails.send({
          from: 'Vidyamruta <bookings@vidyamruta.com>',
          to: userEmail,
          subject: 'Booking Confirmed! - Vidyamruta',
          html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h2>Your Booking is Confirmed ✅</h2>
              <p>Your astrologer has accepted your booking request.</p>
              <p>Please ensure you are available at the scheduled time.</p>
              <a href="https://vidyamruta.com/dashboard" style="display:inline-block; padding:10px 20px; background:#2e7d32; color:#fff; text-decoration:none; border-radius:5px;">View Dashboard</a>
            </div>
          `,
        });
        return NextResponse.json({ message: 'UPDATE (Confirmed) email sent' }, { status: 200 });
      }

      if (status === 'cancelled' || status === 'denied') {
        await resend.emails.send({
          from: 'Vidyamruta <bookings@vidyamruta.com>',
          to: userEmail,
          subject: 'Booking Cancelled - Vidyamruta',
          html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h2>Booking Update ⚠️</h2>
              <p>Your recent booking request has been cancelled or denied.</p>
              <p>If you have any questions, please contact our support team or book another slot.</p>
            </div>
          `,
        });
        return NextResponse.json({ message: 'UPDATE (Cancelled) email sent' }, { status: 200 });
      }
    }

    return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
