"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { createClient } from '@/utils/supabase/client';

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const supabase = createClient();
  const [savedKundlis, setSavedKundlis] = useState<any[]>([]);
  const [loadingKundlis, setLoadingKundlis] = useState(true);
  const [userRole, setUserRole] = useState<string>('user');

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      // Fetch saved kundlis
      const { data: kundlis } = await supabase
        .from('saved_kundlis')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      setSavedKundlis(kundlis || []);
      setLoadingKundlis(false);

      // Fetch user role - fallback to user_metadata if user_profiles fetch fails
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (user.user_metadata?.role === 'astrologer') {
        setUserRole('astrologer');
      } else if (profile?.role) {
        setUserRole(profile.role);
      } else if (user.user_metadata?.role) {
        setUserRole(user.user_metadata.role);
      }
    };

    fetchData();
  }, [user, supabase]);

  const deleteKundli = async (id: string) => {
    await supabase.from('saved_kundlis').delete().eq('id', id);
    setSavedKundlis(prev => prev.filter(k => k.id !== id));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (authLoading) {
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
                Namaste, {user.user_metadata?.full_name || user.email?.split('@')[0]}! 🙏
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
              <span className="badge badge-primary mt-1">{userRole}</span>
            </div>
          </div>
          <div className="flex gap-2">
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

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Saved Kundlis */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <span>📜</span> Saved Kundli Charts
              </h2>
              <span className="badge badge-primary">{savedKundlis.length} saved</span>
            </div>

            {loadingKundlis ? (
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
                {['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'].map((sym, i) => (
                  <Link
                    key={i}
                    href={`/horoscope?sign=${['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'][i]}`}
                    className="w-full aspect-square rounded-lg flex items-center justify-center text-xl transition-all hover:scale-110"
                    style={{ background: 'var(--surface-warm)', border: '1px solid var(--border-light)' }}
                  >
                    {sym}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
