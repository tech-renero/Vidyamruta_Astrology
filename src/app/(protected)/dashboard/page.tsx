"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';

export const zodiacList = [
  { id: 'aries', name: 'Aries' },
  { id: 'taurus', name: 'Taurus' },
  { id: 'gemini', name: 'Gemini' },
  { id: 'cancer', name: 'Cancer' },
  { id: 'leo', name: 'Leo' },
  { id: 'virgo', name: 'Virgo' },
  { id: 'libra', name: 'Libra' },
  { id: 'scorpio', name: 'Scorpio' },
  { id: 'sagittarius', name: 'Sagittarius' },
  { id: 'capricorn', name: 'Capricorn' },
  { id: 'aquarius', name: 'Aquarius' },
  { id: 'pisces', name: 'Pisces' }
];

export interface SavedKundli {
  id: string;
  user_id: string;
  name: string;
  date_of_birth: string;
  time_of_birth: string;
  birth_location: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  ascendant_rashi?: string;
  nakshatra?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name?: string | null;
  date_of_birth?: string | null;
  time_of_birth?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  role?: string | null;
}

export interface PersonalKundliData {
  chartData?: {
    ascendant?: {
      rashiName?: string;
    };
    moonDetails?: {
      rashiName?: string;
      nakshatra?: string;
    };
  };
}

const fetchDashboardData = async ([_key, userId, userMetadata]: [string, string, Record<string, unknown> | undefined]) => {
  const supabase = createClient();

  const { data: kundlis, error: kundlisError } = await supabase
    .from('saved_kundlis')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (kundlisError) console.error("Failed to fetch kundlis:", kundlisError);

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    console.error("Failed to fetch profile:", profileError);
  }

  let personalKundli: PersonalKundliData | null = null;

  if (profile && profile.date_of_birth && profile.time_of_birth && userMetadata?.birth_location) {
    try {
      const astrologyService = await import('@/services');
      personalKundli = await astrologyService.getKundliForDetails({
        name: profile.full_name || 'Me',
        date: profile.date_of_birth,
        time: profile.time_of_birth.substring(0, 5),
        location: String(userMetadata.birth_location)
      }) as PersonalKundliData;
    } catch (e) {
      console.error("Failed to generate personal kundli", e);
    }
  }

  let role = 'user';
  if (userMetadata?.role === 'astrologer') {
    role = 'astrologer';
  } else if (profile?.role) {
    role = profile.role;
  }

  return {
    savedKundlis: (kundlis as SavedKundli[]) || [],
    profile: (profile as UserProfile) || null,
    personalKundli,
    userRole: role
  };
};

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const supabase = createClient();
  const router = useRouter();

  const { data, error, isLoading: dataLoading, mutate } = useSWR(
    user ? ['user-dashboard', user.id, user.user_metadata] : null,
    fetchDashboardData
  );

  const savedKundlis = data?.savedKundlis || [];
  const profile = data?.profile || null;
  const personalKundli = data?.personalKundli || null;
  const userRole = data?.userRole || 'user';

  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings'>('dashboard');
  const [settingsForm, setSettingsForm] = useState({ date_of_birth: '', time_of_birth: '', birth_location: '' });
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (profile) {
      setSettingsForm({
        date_of_birth: profile.date_of_birth || '',
        time_of_birth: profile.time_of_birth ? profile.time_of_birth.substring(0, 5) : '',
        birth_location: user?.user_metadata?.birth_location ? String(user.user_metadata.birth_location) : '',
      });
    }
  }, [profile, user?.user_metadata?.birth_location]);

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingSettings(true);

    const timeWithSeconds = settingsForm.time_of_birth.includes(':') && settingsForm.time_of_birth.length === 5
      ? settingsForm.time_of_birth + ':00'
      : settingsForm.time_of_birth;

    const { error: updateError } = await supabase.from('user_profiles').update({
      date_of_birth: settingsForm.date_of_birth,
      time_of_birth: timeWithSeconds,
    }).eq('id', user.id);

    if (updateError) {
      console.error("Failed to update profile", updateError);
    }

    // Save location to user_metadata as schema might not have it
    const { error: authError } = await supabase.auth.updateUser({
      data: { birth_location: settingsForm.birth_location }
    });

    if (authError) {
      console.error("Failed to update auth metadata", authError);
    }

    setSavingSettings(false);

    // Refresh the auth session and data without a hard reload
    router.refresh();
    mutate();
  };

  const deleteKundli = async (id: string) => {
    const { error } = await supabase.from('saved_kundlis').delete().eq('id', id);
    if (error) {
      console.error("Failed to delete kundli", error);
      return;
    }
    if (data) {
      mutate({
        ...data,
        savedKundlis: savedKundlis.filter((k: SavedKundli) => k.id !== id)
      }, { revalidate: false });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (authLoading || (!data && dataLoading)) {
    return (
      <main style={{ background: 'var(--surface)' }} className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-4xl animate-float">🙏</div>
          <p className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>Loading your dashboard...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main style={{ background: 'var(--surface)' }} className="min-h-[80vh] flex items-center justify-center">
        <div className="card p-10 text-center space-y-4 max-w-md">
          <div className="text-4xl">🔒</div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Sign In Required</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Please sign in to access your dashboard.</p>
          <Link href="/login" className="btn-primary inline-block">Sign In</Link>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ background: 'var(--surface)' }} className="min-h-[80vh] flex items-center justify-center">
        <div className="card p-10 text-center space-y-4 max-w-md">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Error Loading Dashboard</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{error.message || 'An unexpected error occurred.'}</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: 'var(--surface)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* Header */}
        <div className="card p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl text-white font-bold" style={{ background: 'linear-gradient(135deg, var(--primary), var(--saffron))' }}>
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
                Namaste, {String(user.user_metadata?.full_name || user.email?.split('@')[0])}! 🙏
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
              <span className="badge badge-primary mt-1">{userRole}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setActiveTab(activeTab === 'dashboard' ? 'settings' : 'dashboard')} className="btn-secondary text-xs py-2 px-4">
              {activeTab === 'dashboard' ? '⚙️ Settings' : '📊 Dashboard'}
            </button>
            {userRole === 'astrologer' && (
              <Link href="/astrologer/dashboard" className="btn-secondary text-xs py-2 px-4">
                🧘 Astrologer Portal
              </Link>
            )}
            <button onClick={handleLogout} className="btn-ghost text-xs py-2 px-4">
              Logout
            </button>
          </div>
        </div>

        {activeTab === 'settings' ? (
          <div className="card p-8 max-w-2xl mx-auto space-y-6 animate-fadeIn">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Profile Settings</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Save your birth details to automatically generate your personal horoscope and panchang on your dashboard.</p>

            <form onSubmit={saveSettings} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Date of Birth</label>
                  <input type="date" className="input-field" value={settingsForm.date_of_birth} onChange={e => setSettingsForm({ ...settingsForm, date_of_birth: e.target.value })} required />
                </div>
                <div>
                  <label className="input-label">Time of Birth</label>
                  <input type="time" className="input-field" value={settingsForm.time_of_birth} onChange={e => setSettingsForm({ ...settingsForm, time_of_birth: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="input-label">Birth Place (City, State, Country)</label>
                <input type="text" className="input-field" placeholder="e.g., Mumbai, Maharashtra, India" value={settingsForm.birth_location} onChange={e => setSettingsForm({ ...settingsForm, birth_location: e.target.value })} required />
              </div>
              <button type="submit" disabled={savingSettings} className="btn-primary w-full py-3">
                {savingSettings ? 'Saving...' : 'Save Details'}
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: '📜', label: 'Generate Kundli', href: '/kundli', bg: 'var(--primary-lighter)' },
                { icon: '🔮', label: 'Daily Horoscope', href: '/horoscope', bg: '#fff8e1' },
                { icon: '💑', label: 'Kundli Match', href: '/matching', bg: '#fce4ec' },
                { icon: '📅', label: 'Panchang', href: '/panchang', bg: '#e8f5e9' },
              ].map(action => (
                <Link key={action.label} href={action.href} className="card p-5 text-center space-y-3 hover:scale-[1.02] transition-transform">
                  <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center text-2xl" style={{ background: action.bg }}>
                    {action.icon}
                  </div>
                  <span className="text-sm font-bold block" style={{ color: 'var(--text-primary)' }}>{action.label}</span>
                </Link>
              ))}
            </div>

            {personalKundli && (
              <div className="card p-6 border-l-4" style={{ borderColor: 'var(--primary)' }}>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <span>🌟</span> Your Personal Horoscope
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Ascendant</div>
                    <div className="font-bold">{personalKundli.chartData?.ascendant?.rashiName || 'Unknown'}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Moon Sign</div>
                    <div className="font-bold">{personalKundli.chartData?.moonDetails?.rashiName || 'Unknown'}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Nakshatra</div>
                    <div className="font-bold">{personalKundli.chartData?.moonDetails?.nakshatra || 'Unknown'}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Saved Kundlis */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <span>📜</span> Saved Kundli Charts
                  </h2>
                  <span className="badge badge-primary">{savedKundlis.length} saved</span>
                </div>

                {!data && dataLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="skeleton h-20 w-full" />)}
                  </div>
                ) : savedKundlis.length === 0 ? (
                  <div className="card p-10 text-center space-y-4">
                    <div className="text-4xl">📭</div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>No Saved Charts Yet</h3>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Generate a Kundli and it will automatically be saved here!
                    </p>
                    <Link href="/kundli" className="btn-primary inline-block">Generate Your First Kundli</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedKundlis.map(k => (
                      <div key={k.id} className="card p-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: 'var(--primary-lighter)' }}>📜</div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{k.name}</h4>
                            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                              {k.date_of_birth} • {k.birth_location}
                            </p>
                            <div className="flex gap-2 mt-1">
                              {k.ascendant_rashi && <span className="badge badge-gold text-[10px]">{k.ascendant_rashi}</span>}
                              {k.nakshatra && <span className="badge badge-primary text-[10px]">{k.nakshatra}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {new Date(k.created_at).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => deleteKundli(k.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all hover:bg-red-50"
                            style={{ color: 'var(--danger)' }}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Daily Panchang Widget */}
                <div className="card p-6 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                    <span>📅</span> Today&apos;s Panchang
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-muted)' }}>Tithi</span>
                      <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Shukla Navami</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-muted)' }}>Nakshatra</span>
                      <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Pushya</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-muted)' }}>Rahu Kalam</span>
                      <span className="font-bold" style={{ color: 'var(--danger)' }}>13:30 - 15:00</span>
                    </div>
                  </div>
                  <Link href="/panchang" className="text-xs font-bold flex items-center gap-1" style={{ color: 'var(--primary)' }}>
                    View Full Panchang →
                  </Link>
                </div>

                {/* Consultation Card */}
                <div className="card p-6 space-y-4" style={{ background: 'linear-gradient(135deg, var(--primary-lighter), #fff8e1)' }}>
                  <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                    <span>🧘</span> Expert Guidance
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Get personalized readings from verified Vedic astrologers.
                  </p>
                  <Link href="/consultations" className="btn-primary text-sm w-full text-center">
                    Book Consultation
                  </Link>
                </div>

                {/* Quick Horoscope */}
                <div className="card p-6 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                    <span>🔮</span> Quick Horoscope
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {zodiacList.map((sign) => (
                      <Link
                        key={sign.id}
                        href={`/horoscope?sign=${sign.id}`}
                        className="w-full aspect-square rounded-lg flex items-center justify-center relative overflow-hidden transition-all hover:scale-110"
                        style={{ background: 'var(--surface-warm)', border: '1px solid var(--border-light)' }}
                      >
                        <Image
                          src={`/images/zodiac/${sign.id}.png`}
                          alt={`${sign.name} zodiac sign`}
                          fill
                          className="object-contain p-2"
                          sizes="(max-width: 768px) 25vw, 15vw"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
