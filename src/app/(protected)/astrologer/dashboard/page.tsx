/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { useAuth } from '@/providers/AuthProvider';
import { createClient } from '@/utils/supabase/client';

// --- STRICT TYPES ---
interface AstrologerProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string | null;
  hourly_rate: number;
  is_available: boolean;
  avatar_url: string | null;
  rating: number;
  total_consultations: number;
  offers_vastu: boolean;
}

interface StandardBooking {
  id: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  consultation_type: string;
  booking_date: string;
  booking_time: string;
  notes?: string | null;
  user_profiles?: { full_name: string | null };
}

interface VastuBooking {
  id: string;
  status: 'pending' | 'accepted' | 'denied' | 'completed' | 'cancelled';
  requested_date: string;
  requested_time: string;
  notes: string | null;
  user_profiles?: { full_name: string | null };
}

const fetchDashboardData = async ([_key, userId]: [string, string]) => {
  const supabase = createClient();
  
  const { data: astroProfile, error: astroError } = await supabase
    .from('astrologer_profiles')
    .select(`
      *,
      user_profiles (avatar_url)
    `)
    .eq('user_id', userId)
    .single();

  if (astroError) {
    console.error("Failed to fetch profile:", astroError);
    return null;
  }
  if (!astroProfile) return null;

  const fetchedAvatar = (astroProfile as any).user_profiles?.avatar_url ||
    (Array.isArray((astroProfile as any).user_profiles) ? (astroProfile as any).user_profiles[0]?.avatar_url : '') || '';

  const profile = { ...astroProfile, avatar_url: fetchedAvatar } as AstrologerProfile;

  const { data: bookingData, error: bookingError } = await supabase
    .from('consultation_bookings')
    .select('*, user_profiles(full_name)')
    .eq('astrologer_id', profile.id)
    .order('booking_date', { ascending: true });

  if (bookingError) console.error("Failed to fetch bookings:", bookingError);

  let vastuBookings: VastuBooking[] = [];
  if (profile.offers_vastu) {
    const { data: vastuData, error: vastuError } = await supabase
      .from('vastu_bookings')
      .select('*, user_profiles(full_name)')
      .eq('astrologer_id', profile.id)
      .order('requested_date', { ascending: true });

    if (vastuError) console.error("Failed to fetch vastu bookings:", vastuError);
    else vastuBookings = (vastuData as unknown as VastuBooking[]) || [];
  }

  return {
    profile,
    bookings: (bookingData as StandardBooking[]) || [],
    vastuBookings
  };
};

export default function AstrologerDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const supabase = createClient();

  const { data, error, isLoading, mutate } = useSWR(
    user ? ['astrologer-dashboard', user.id] : null,
    fetchDashboardData
  );

  const profile = data?.profile || null;
  const bookings = data?.bookings || [];
  const vastuBookings = data?.vastuBookings || [];

  const [editMode, setEditMode] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<StandardBooking | VastuBooking | null>(null);

  const [editForm, setEditForm] = useState({
    display_name: '',
    bio: '',
    hourly_rate: 0,
    is_available: true,
    avatar_url: '',
  });

  useEffect(() => {
    if (profile && !editMode) {
      setEditForm({
        display_name: profile.display_name,
        bio: profile.bio || '',
        hourly_rate: profile.hourly_rate,
        is_available: profile.is_available,
        avatar_url: profile.avatar_url || '',
      });
    }
  }, [profile, editMode]);

  const handleUpdateProfile = async () => {
    if (!profile || !user || !data) return;

    // 1. Update the Astrologer Profile (Display Name, Bio, Rate, Availability)
    const { data: astroData, error: astroError } = await supabase
      .from('astrologer_profiles')
      .update({
        display_name: editForm.display_name,
        bio: editForm.bio,
        hourly_rate: editForm.hourly_rate,
        is_available: editForm.is_available,
        // Intentionally omitting updated_at to prevent 400 Bad Request if the column doesn't exist
      })
      .eq('id', profile.id)
      .select();

    if (astroError) {
      alert(`Failed to update astrologer profile: ${astroError.message}`);
      return;
    }

    if (!astroData || astroData.length === 0) {
      alert("Error: Astrologer profile update affected 0 rows. (Possible RLS issue)");
      return;
    }

    // 2. Update the User Profile (Avatar URL)
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .update({
        avatar_url: editForm.avatar_url,
      })
      .eq('id', user.id)
      .select();

    if (userError) {
      alert(`Failed to update profile picture: ${userError.message}`);
      return;
    }

    if (!userData || userData.length === 0) {
      alert("Error: User profile update affected 0 rows. (Possible RLS issue)");
      return;
    }

    // Update local state smoothly via SWR mutation
    mutate({
      ...data,
      profile: {
        ...profile,
        ...editForm,
        offers_vastu: profile.offers_vastu,
        total_consultations: profile.total_consultations,
        rating: profile.rating
      }
    }, { revalidate: true });
    setEditMode(false);
  };

  const updateBookingStatus = async (bookingId: string, status: StandardBooking['status']) => {
    if (!data) return;
    const { error } = await supabase
      .from('consultation_bookings')
      .update({ status }) // Omitted updated_at assuming standard schema parity
      .eq('id', bookingId);

    if (error) {
      alert(`Failed to update booking: ${error.message}`);
      return;
    }

    mutate({
      ...data,
      bookings: bookings.map(b => b.id === bookingId ? { ...b, status } : b)
    }, { revalidate: true });
  };

  const updateVastuBookingStatus = async (bookingId: string, status: VastuBooking['status']) => {
    if (!data) return;
    const { error } = await supabase
      .from('vastu_bookings')
      .update({ status })
      .eq('id', bookingId);

    if (error) {
      alert(`Failed to update Vastu booking: ${error.message}`);
      return;
    }

    mutate({
      ...data,
      vastuBookings: vastuBookings.map(b => b.id === bookingId ? { ...b, status } : b)
    }, { revalidate: true });
  };

  if (authLoading || isLoading) {
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

  const totalPending = pendingBookings.length + vastuBookings.filter(b => b.status === 'pending').length;
  const totalConfirmed = confirmedBookings.length + vastuBookings.filter(b => b.status === 'accepted').length;
  const totalCompleted = bookings.filter(b => b.status === 'completed').length + vastuBookings.filter(b => b.status === 'completed').length;
  const displayTotalConsultations = profile.total_consultations > 0 ? profile.total_consultations : totalCompleted;

  return (
    <main style={{ background: 'var(--surface)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* Header */}
        <div className="card p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" style={{ background: 'linear-gradient(135deg, var(--primary-lighter), #fff8e1)' }}>
          <div className="flex items-center gap-4">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name} className="w-14 h-14 rounded-2xl object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl text-white font-bold" style={{ background: 'linear-gradient(135deg, var(--primary), var(--saffron))' }}>
                {profile.display_name.charAt(0)}
              </div>
            )}
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
            { label: 'Total Consultations', value: displayTotalConsultations, icon: '📊', bg: 'var(--primary-lighter)' },
            { label: 'Pending Requests', value: totalPending, icon: '⏳', bg: '#fff8e1' },
            { label: 'Confirmed Today', value: totalConfirmed, icon: '✅', bg: '#e8f5e9' },
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
                <input type="text" className="input-field" value={editForm.display_name} onChange={e => setEditForm({ ...editForm, display_name: e.target.value })} />
              </div>
              <div>
                <label className="input-label">Hourly Rate (₹)</label>
                <input type="number" className="input-field" value={editForm.hourly_rate} onChange={e => setEditForm({ ...editForm, hourly_rate: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div>
              <label className="input-label">Profile Picture URL</label>
              <input type="url" className="input-field" placeholder="https://example.com/avatar.jpg" value={editForm.avatar_url || ''} onChange={e => setEditForm({ ...editForm, avatar_url: e.target.value })} />
            </div>
            <div>
              <label className="input-label">Bio</label>
              <textarea className="input-field" rows={3} value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} style={{ resize: 'vertical' }} />
            </div>
            <div className="flex items-center gap-3">
              <label className="input-label mb-0">Available for Consultations</label>
              <button
                onClick={() => setEditForm({ ...editForm, is_available: !editForm.is_available })}
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
                <div key={booking.id} 
                     onClick={() => setSelectedBooking(booking)}
                     className="card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`badge ${booking.status === 'pending' ? 'badge-gold' :
                        booking.status === 'confirmed' ? 'badge-success' :
                          booking.status === 'completed' ? 'badge-primary' : 'badge-danger'
                        }`}>
                        {booking.status}
                      </span>
                      <span className="badge badge-primary">{booking.consultation_type}</span>
                      <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        {booking.user_profiles?.full_name || 'User'}
                      </span>
                    </div>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {booking.booking_date} at {booking.booking_time}
                    </p>
                  </div>
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vastu Bookings */}
        {profile.offers_vastu && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <span>🏠</span> Vastu Bookings
            </h2>

            {vastuBookings.length === 0 ? (
              <div className="card p-10 text-center space-y-4">
                <div className="text-4xl">📭</div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>No Vastu Bookings Yet</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Bookings from users will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {vastuBookings.map(booking => (
                  <div key={booking.id} 
                       onClick={() => setSelectedBooking(booking)}
                       className="card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`badge ${booking.status === 'pending' ? 'badge-gold' :
                          booking.status === 'accepted' ? 'badge-success' :
                            booking.status === 'completed' ? 'badge-primary' : 'badge-danger'
                          }`}>
                          {booking.status}
                        </span>
                        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                          {booking.user_profiles?.full_name || 'User'}
                        </span>
                      </div>
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        {booking.requested_date} at {booking.requested_time}
                      </p>
                      {booking.notes && (
                        <p className="text-xs italic" style={{ color: 'var(--text-secondary)' }}>&quot;{booking.notes.substring(0, 30)}{booking.notes.length > 30 ? '...' : ''}&quot;</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      {booking.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => updateVastuBookingStatus(booking.id, 'accepted')} className="btn-primary text-xs py-1.5 px-3">
                            ✅ Accept
                          </button>
                          <button onClick={() => updateVastuBookingStatus(booking.id, 'denied')} className="btn-ghost text-xs py-1.5 px-3" style={{ color: 'var(--danger)' }}>
                            ✕ Deny
                          </button>
                        </div>
                      )}
                      {booking.status === 'accepted' && (
                        <button onClick={() => updateVastuBookingStatus(booking.id, 'completed')} className="btn-secondary text-xs py-1.5 px-3">
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedBooking(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: 'var(--border-light)' }}>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Booking Details</h3>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-500 hover:text-black">✕</button>
            </div>
            
            <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <p><strong style={{ color: 'var(--text-primary)' }}>Booking ID:</strong> <span className="text-xs font-mono">{selectedBooking.id}</span></p>
              <p><strong style={{ color: 'var(--text-primary)' }}>Client Name:</strong> {selectedBooking.user_profiles?.full_name || 'Unknown User'}</p>
              <p><strong style={{ color: 'var(--text-primary)' }}>Date & Time:</strong> {('booking_date' in selectedBooking) ? `${selectedBooking.booking_date} at ${selectedBooking.booking_time}` : `${selectedBooking.requested_date} at ${selectedBooking.requested_time}`}</p>
              <p><strong style={{ color: 'var(--text-primary)' }}>Type:</strong> {('consultation_type' in selectedBooking) ? `Standard (${selectedBooking.consultation_type})` : 'Vastu Consultation'}</p>
              <p><strong style={{ color: 'var(--text-primary)' }}>Status:</strong> <span className="uppercase font-bold" style={{ color: 'var(--primary)' }}>{selectedBooking.status}</span></p>
              
              {selectedBooking.notes && (
                <div className="pt-2">
                  <strong style={{ color: 'var(--text-primary)' }}>Notes / Address:</strong>
                  <p className="mt-1 p-3 rounded-lg italic" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)' }}>
                    {selectedBooking.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t text-right" style={{ borderColor: 'var(--border-light)' }}>
              <button onClick={() => setSelectedBooking(null)} className="btn-secondary py-2 px-4 text-xs">Close</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}