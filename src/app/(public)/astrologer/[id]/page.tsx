import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Await the params object (Next.js 16 strict convention)
  const resolvedParams = await params;
  const astrologerId = resolvedParams.id;

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Fetch the astrologer's profile
    const { data: profile, error } = await supabase
      .from('astrologer_profiles')
      .select('*, user_profiles(full_name, avatar_url)')
      .eq('user_id', astrologerId)
      .single();

    if (error || !profile) {
      return {
        title: 'Astrologer Profile | Vidyamruta',
        description: 'View this expert Vedic astrologer profile on Vidyamruta.',
      };
    }

    const displayName = profile.display_name || profile.user_profiles?.full_name || 'Expert Astrologer';
    const specializations = Array.isArray(profile.specializations) 
      ? profile.specializations.join(', ') 
      : (profile.specializations || 'Vedic Astrology');
    const avatarUrl = profile.avatar_url || profile.user_profiles?.avatar_url || 'https://vidyamruta.com/default-avatar.png';
    const bio = profile.bio || `Consult with ${displayName} for expert guidance in ${specializations}.`;

    return {
      title: `${displayName} - Vedic Astrologer | Vidyamruta`,
      description: bio,
      openGraph: {
        title: `${displayName} - Vedic Astrologer`,
        description: bio,
        url: `https://vidyamruta.com/astrologer/${astrologerId}`,
        siteName: 'Vidyamruta',
        images: [
          {
            url: avatarUrl,
            width: 800,
            height: 800,
            alt: `Profile picture of ${displayName}`,
          },
        ],
        type: 'profile',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${displayName} - Vedic Astrologer`,
        description: bio,
        images: [avatarUrl],
      },
    };
  } catch (err) {
    // Sensible fallback if fetch throws an exception
    return {
      title: 'Astrologer Profile | Vidyamruta',
      description: 'View this expert Vedic astrologer profile on Vidyamruta.',
    };
  }
}

export default async function AstrologerProfilePage({ params }: Props) {
  const resolvedParams = await params;
  
  return (
    <main style={{ background: 'var(--surface)', minHeight: '80vh' }} className="flex items-center justify-center p-4">
      <div className="card p-10 text-center max-w-lg space-y-4">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Astrologer Profile</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Profile ID: {resolvedParams.id}</p>
      </div>
    </main>
  );
}
