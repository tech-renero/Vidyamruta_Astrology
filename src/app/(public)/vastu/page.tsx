import { Metadata } from 'next';
import React from 'react';
import { cookies } from "next/headers";
import { createClient } from '@/utils/supabase/server';
import VastuClientDirectory, { AstrologerProfile } from './VastuClientDirectory';

export const metadata: Metadata = {
  title: "Vastu Consultations | Vidyamruta",
  description: "Connect with expert Vastu consultants to harmonize your living and workspaces according to ancient Vedic architectural principles.",
  openGraph: {
    title: "Vastu Consultations | Vidyamruta",
    description: "Connect with expert Vastu consultants to harmonize your living and workspaces according to ancient Vedic architectural principles.",
    type: 'website',
    siteName: 'Vidyamruta',
  },
};

export default async function VastuPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  let initialAstrologers: AstrologerProfile[] = [];
  let fetchError: string | null = null;

  const { data, error } = await supabase
    .from('astrologer_profiles')
    .select(`
      *,
      user_profiles (avatar_url, full_name),
      vastu_availability (day_of_week, start_time, end_time)
    `)
    .eq('offers_vastu', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch astrologers:', error);
    fetchError = error.message;
  } else if (data) {
    initialAstrologers = data as unknown as AstrologerProfile[];
  }

  return (
    <main style={{ background: 'var(--surface)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">

        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="section-title">Expert <span className="section-accent">Vastu Consultants</span></h1>
          <p className="section-subtitle mx-auto">Connect with verified Vastu experts for harmony in your space</p>
          <hr className="divider-saffron mx-auto" />
        </div>

        {/* 2. Pass data to the interactive client component */}
        <VastuClientDirectory initialAstrologers={initialAstrologers} fetchError={fetchError} />
        
      </div>
    </main>
  );
}