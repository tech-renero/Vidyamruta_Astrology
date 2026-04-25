/**
 * Generates the Google OAuth consent URL.
 */
export function getGoogleOAuthUrl() {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/calendar/callback`,
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/calendar.events',
    ].join(' '),
  };
  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
}

/**
 * Pushes a new astrological remedy to the user's primary Google Calendar.
 */
export async function addRemedyToGoogleCalendar(accessToken: string, remedy: { title: string, date: string, description: string }) {
  const event = {
    summary: remedy.title,
    description: remedy.description,
    start: { date: remedy.date }, // Format: 'YYYY-MM-DD'
    end: { date: remedy.date },
  };

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    throw new Error('Failed to create calendar event');
  }

  return response.json();
}
