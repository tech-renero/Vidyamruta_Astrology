"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { createClient } from '@/utils/supabase/client';

export interface UserProfile {
  avatar_url: string | null;
  full_name: string | null;
}

export interface VastuAvailability {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface AstrologerProfile {
  id: string;
  display_name: string;
  offers_vastu: boolean;
  rating: number;
  total_consultations: number;
  bio: string | null;
  specializations: string[];
  experience_years: number;
  hourly_rate: number;
  created_at: string;
  user_profiles?: UserProfile;
  vastu_availability?: VastuAvailability[];
  is_available?: boolean;
}

export default function VastuClientDirectory({ initialAstrologers, fetchError }: { initialAstrologers: AstrologerProfile[], fetchError: string | null }) {
  const { user } = useAuth();
  const supabase = createClient();
  const router = useRouter();

  const [astrologers] = useState<AstrologerProfile[]>(initialAstrologers);
  const [filter, setFilter] = useState<'all' | 'available'>('all');
  const [selectedAstrologer, setSelectedAstrologer] = useState<AstrologerProfile | null>(null);

  const [bookingDate, setBookingDate] = useState<string>('');
  const [bookingTime, setBookingTime] = useState<string>('');
  const [bookingNotes, setBookingNotes] = useState<string>('');
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Memoize filtered results for performance
  const filteredAstrologers = useMemo(() => {
    return filter === 'available'
      ? astrologers.filter(a => a.is_available)
      : astrologers;
  }, [filter, astrologers]);

  const handleBooking = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!bookingDate || !bookingTime || !selectedAstrologer) return;

    setBookingStatus('loading');

    try {
      const { data: profileCheck, error: profileCheckError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileCheckError || !profileCheck) {
        setBookingStatus('error');
        alert("Please complete your profile setup before booking a consultation.");
        router.push('/dashboard');
        return;
      }

      const { error } = await supabase.from('vastu_bookings').insert({
        user_id: user.id,
        astrologer_id: selectedAstrologer.id,
        requested_date: bookingDate,
        requested_time: `${bookingTime}:00`,
        notes: bookingNotes,
        status: 'pending',
      });

      if (error) throw error;
      setBookingStatus('success');
    } catch (err) {
      console.error("Booking error:", err);
      setBookingStatus('error');
    }
  };

  return (
    <div className="space-y-10">
      {fetchError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong>Fetch Error:</strong> {fetchError} (Check Supabase RLS Policies)
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className="px-4 py-2 rounded-lg text-sm font-bold transition-all border"
            style={{
              background: filter === 'all' ? 'var(--primary)' : '#ffffff',
              color: filter === 'all' ? '#ffffff' : 'var(--text-secondary)',
              borderColor: filter === 'all' ? 'var(--primary)' : 'var(--border-light)',
            }}
          >
            All Astrologers ({astrologers.length})
          </button>
          <button
            onClick={() => setFilter('available')}
            className="px-4 py-2 rounded-lg text-sm font-bold transition-all border"
            style={{
              background: filter === 'available' ? 'var(--success)' : '#ffffff',
              color: filter === 'available' ? '#ffffff' : 'var(--text-secondary)',
              borderColor: filter === 'available' ? 'var(--success)' : 'var(--border-light)',
            }}
          >
            🟢 Available Now
          </button>
        </div>
        <Link href="/register?role=astrologer" className="btn-ghost text-sm">
          🧘 Join as Astrologer
        </Link>
      </div>

      {/* Astrologer Grid */}
      {filteredAstrologers.length === 0 && !fetchError ? (
        <div className="card p-10 text-center space-y-4 max-w-lg mx-auto">
          <div className="text-5xl">🧘</div>
          <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>No Vastu Consultants Available</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Check back later or view all available astrologers in the regular consultation section.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAstrologers.map((astrologer, i) => (
            <div key={astrologer.id} className="card p-6 space-y-4 animate-fadeInUp" style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {astrologer.user_profiles?.avatar_url ? (
                    <Image
                      src={astrologer.user_profiles.avatar_url}
                      alt={astrologer.display_name}
                      width={56}
                      height={56}
                      className="rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl text-white font-bold" style={{ background: 'linear-gradient(135deg, var(--primary), var(--saffron))' }}>
                      {astrologer.display_name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{astrologer.display_name}</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-xs" style={{ color: 'var(--gold)' }}>★</span>
                      <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{astrologer.rating}</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({astrologer.total_consultations})</span>
                    </div>
                  </div>
                </div>
                <span className={`badge ${astrologer.is_available ? 'badge-success' : 'badge-danger'}`}>
                  {astrologer.is_available ? 'Online' : 'Offline'}
                </span>
              </div>

              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {astrologer.bio?.substring(0, 120) || "No bio available."}...
              </p>

              <div className="flex flex-wrap gap-1">
                {astrologer.specializations?.map((s) => (
                  <span key={s} className="badge badge-gold text-[10px]">{s}</span>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>{astrologer.experience_years} yrs experience</span>
                <span className="font-bold" style={{ color: 'var(--primary)' }}>₹{astrologer.hourly_rate}/hr</span>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setSelectedAstrologer(astrologer)}
                  className="btn-primary flex-1 text-xs py-2"
                >
                  Book Consultation
                </button>
                <button className="btn-ghost text-xs py-2 px-3">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {selectedAstrologer && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={() => { setSelectedAstrologer(null); setBookingStatus('idle'); }}>
          <div className="card p-8 w-full max-w-md space-y-6" onClick={e => e.stopPropagation()}>
            {bookingStatus === 'success' ? (
              <div className="text-center space-y-4 py-6">
                <div className="text-5xl">✅</div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--success)' }}>Booking Confirmed!</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Your consultation with {selectedAstrologer.display_name} has been booked for {bookingDate} at {bookingTime}.
                </p>
                <button onClick={() => { setSelectedAstrologer(null); setBookingStatus('idle'); }} className="btn-primary">
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Book Consultation</h3>
                  <button onClick={() => { setSelectedAstrologer(null); setBookingStatus('idle'); }} className="text-xl" style={{ color: 'var(--text-muted)' }}>×</button>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'var(--primary-lighter)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg text-white font-bold" style={{ background: 'linear-gradient(135deg, var(--primary), var(--saffron))' }}>
                    {selectedAstrologer.display_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{selectedAstrologer.display_name}</h4>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>₹{selectedAstrologer.hourly_rate}/hr</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="input-label text-sm text-gray-600">Date</label>
                    <input type="date" className="input-field w-full mt-1 border rounded p-2" value={bookingDate} onChange={e => setBookingDate(e.target.value)} required />
                  </div>
                  <div>
                    <label className="input-label text-sm text-gray-600">Time</label>
                    <input type="time" className="input-field w-full mt-1 border rounded p-2" value={bookingTime} onChange={e => setBookingTime(e.target.value)} required />
                  </div>
                </div>

                <div>
                  <label className="input-label text-sm text-gray-600">Additional Notes (Optional)</label>
                  <textarea
                    className="input-field w-full mt-1 border rounded p-2"
                    value={bookingNotes}
                    onChange={e => setBookingNotes(e.target.value)}
                    placeholder="Briefly describe what you're looking for..."
                    rows={3}
                  />
                </div>

                {!user && (
                  <div className="p-3 rounded-xl text-sm" style={{ background: '#fff8e1', border: '1px solid var(--gold)' }}>
                    <strong style={{ color: '#f57f17' }}>Note:</strong> You will need to sign in to complete the booking.
                  </div>
                )}

                <button
                  onClick={handleBooking}
                  disabled={!bookingDate || !bookingTime || bookingStatus === 'loading'}
                  className="btn-primary w-full py-3 mt-4 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 text-white rounded font-bold"
                >
                  {bookingStatus === 'loading' ? '⏳ Booking...' : `Confirm Booking — ₹${selectedAstrologer.hourly_rate}`}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Join as Astrologer CTA */}
      <div className="text-center p-10 rounded-2xl" style={{ background: 'linear-gradient(135deg, var(--primary-lighter), #fff8e1)' }}>
        <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Are You a Vedic Astrologer?</h3>
        <p className="text-sm mb-6 max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Join Vidyamruta as a consultant and share your wisdom with thousands of seekers. Create your astrologer profile and start accepting consultations.
        </p>
        <Link href="/register?role=astrologer" className="btn-primary bg-orange-500 text-white px-6 py-2 rounded-lg font-bold">
          🧘 Register as Astrologer
        </Link>
      </div>
    </div>
  );
}
