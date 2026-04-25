"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { createClient } from '@/utils/supabase/client';

export default function AstrologerDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: '',
    bio: '',
    hourly_rate: 0,
    is_available: true,
  });

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Fetch astrologer profile
      const { data: astroProfile } = await supabase
        .from('astrologer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (astroProfile) {
        setProfile(astroProfile);
        setEditForm({
          display_name: astroProfile.display_name,
          bio: astroProfile.bio || '',
          hourly_rate: astroProfile.hourly_rate,
          is_available: astroProfile.is_available,
        });

        // Fetch bookings
        const { data: bookingData } = await supabase
          .from('consultation_bookings')
          .select('*')
          .eq('astrologer_id', astroProfile.id)
          .order('booking_date', { ascending: true });

        setBookings(bookingData || []);
      }
      setLoading(false);
    };

    fetchData();
  }, [user, supabase]);

  const handleUpdateProfile = async () => {
    if (!profile) return;
    
    await supabase
      .from('astrologer_profiles')
      .update({
        display_name: editForm.display_name,
        bio: editForm.bio,
        hourly_rate: editForm.hourly_rate,
        is_available: editForm.is_available,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    setProfile({ ...profile, ...editForm });
    setEditMode(false);
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    await supabase
      .from('consultation_bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', bookingId);

    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
  };

  if (authLoading || loading) {
    return (
      <main style={{ background: 'var(--surface)' }} className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-4xl animate-float">🧘</div>
          <p className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>Loading astrologer portal...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main style={{ background: 'var(--surface)' }} className="min-h-[80vh] flex items-center justify-center">
        <div className="card p-10 text-center space-y-4 max-w-md">
          <div className="text-4xl">🔒</div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Astrologer Sign In Required</h2>
          <Link href="/login" className="btn-primary inline-block">Sign In</Link>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main style={{ background: 'var(--surface)' }} className="min-h-[80vh] flex items-center justify-center">
        <div className="card p-10 text-center space-y-4 max-w-md">
          <div className="text-4xl">🧘</div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>No Astrologer Profile Found</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Register as an astrologer to access this portal.</p>
          <Link href="/register?role=astrologer" className="btn-primary inline-block">Register as Astrologer</Link>
        </div>
      </main>
    );
  }

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const completedBookings = bookings.filter(b => b.status === 'completed');

  return (
    <main style={{ background: 'var(--surface)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Header */}
        <div className="card p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" style={{ background: 'linear-gradient(135deg, var(--primary-lighter), #fff8e1)' }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl text-white font-bold" style={{ background: 'linear-gradient(135deg, var(--primary), var(--saffron))' }}>
              🧘
            </div>
            <div>
              <h1 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
                Astrologer Portal
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{profile.display_name}</p>
              <div className="flex gap-2 mt-1">
                <span className={`badge ${profile.is_available ? 'badge-success' : 'badge-danger'}`}>
                  {profile.is_available ? '🟢 Online' : '🔴 Offline'}
                </span>
                <span className="badge badge-gold">★ {profile.rating}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditMode(!editMode)} className="btn-secondary text-xs py-2 px-4">
              {editMode ? 'Cancel' : '✏️ Edit Profile'}
            </button>
            <Link href="/dashboard" className="btn-ghost text-xs py-2 px-4">
              ← User Dashboard
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Consultations', value: profile.total_consultations || 0, icon: '📊', bg: 'var(--primary-lighter)' },
            { label: 'Pending Requests', value: pendingBookings.length, icon: '⏳', bg: '#fff8e1' },
            { label: 'Confirmed Today', value: confirmedBookings.length, icon: '✅', bg: '#e8f5e9' },
            { label: 'Rating', value: profile.rating || '5.0', icon: '⭐', bg: '#fce4ec' },
          ].map(stat => (
            <div key={stat.label} className="card p-5 text-center space-y-2" style={{ background: stat.bg }}>
              <div className="text-2xl">{stat.icon}</div>
              <div className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
              <div className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Edit Profile */}
        {editMode && (
          <div className="card p-6 space-y-5 animate-slideDown">
            <h3 className="text-lg font-bold" style={{ color: 'var(--primary)' }}>Edit Profile</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Display Name</label>
                <input type="text" className="input-field" value={editForm.display_name} onChange={e => setEditForm({...editForm, display_name: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Hourly Rate (₹)</label>
                <input type="number" className="input-field" value={editForm.hourly_rate} onChange={e => setEditForm({...editForm, hourly_rate: parseInt(e.target.value)})} />
              </div>
            </div>
            <div>
              <label className="input-label">Bio</label>
              <textarea className="input-field" rows={3} value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} style={{ resize: 'vertical' }} />
            </div>
            <div className="flex items-center gap-3">
              <label className="input-label mb-0">Available for Consultations</label>
              <button
                onClick={() => setEditForm({...editForm, is_available: !editForm.is_available})}
                className="w-12 h-6 rounded-full transition-all relative"
                style={{ background: editForm.is_available ? 'var(--success)' : 'var(--border)' }}
              >
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all" style={{ left: editForm.is_available ? '26px' : '2px' }} />
              </button>
            </div>
            <button onClick={handleUpdateProfile} className="btn-primary">Save Changes</button>
          </div>
        )}

        {/* Bookings */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span>📋</span> Consultation Bookings
          </h2>

          {bookings.length === 0 ? (
            <div className="card p-10 text-center space-y-4">
              <div className="text-4xl">📭</div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>No Bookings Yet</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Bookings from users will appear here. Make sure your profile is complete and you&apos;re marked as available.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map(booking => (
                <div key={booking.id} className="card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`badge ${
                        booking.status === 'pending' ? 'badge-gold' :
                        booking.status === 'confirmed' ? 'badge-success' :
                        booking.status === 'completed' ? 'badge-primary' : 'badge-danger'
                      }`}>
                        {booking.status}
                      </span>
                      <span className="badge badge-primary">{booking.consultation_type}</span>
                    </div>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {booking.booking_date} at {booking.booking_time}
                    </p>
                  </div>
                  {booking.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => updateBookingStatus(booking.id, 'confirmed')} className="btn-primary text-xs py-1.5 px-3">
                        ✅ Confirm
                      </button>
                      <button onClick={() => updateBookingStatus(booking.id, 'cancelled')} className="btn-ghost text-xs py-1.5 px-3" style={{ color: 'var(--danger)' }}>
                        ✕ Decline
                      </button>
                    </div>
                  )}
                  {booking.status === 'confirmed' && (
                    <button onClick={() => updateBookingStatus(booking.id, 'completed')} className="btn-secondary text-xs py-1.5 px-3">
                      Mark Complete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
