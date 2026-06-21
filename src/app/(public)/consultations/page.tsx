/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { createClient } from '@/utils/supabase/client';

export default function ConsultationsPage() {
  const { user } = useAuth();
  const supabase = createClient();

  // State initialized without mock data
  const [astrologers, setAstrologers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedAstrologer, setSelectedAstrologer] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingType, setBookingType] = useState<'chat' | 'call' | 'video'>('chat');
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchAstrologers = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('astrologer_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch astrologers:', JSON.stringify(error, null, 2));
        setAstrologers([]);
      } else if (data) {
        setAstrologers(data);
      }

      setIsLoading(false);
    };

    fetchAstrologers();
  }, [supabase]);

  const filteredAstrologers = filter === 'available'
    ? astrologers.filter(a => a.is_available)
    : astrologers;

  const handleBooking = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    if (!bookingDate || !bookingTime) return;

    setBookingStatus('loading');

    try {
      const { error } = await supabase.from('consultation_bookings').insert({
        user_id: user.id,
        astrologer_id: selectedAstrologer.id,
        booking_date: bookingDate,
        booking_time: bookingTime + ':00',
        consultation_type: bookingType,
        status: 'pending',
      });

      if (error) throw error;
      setBookingStatus('success');
    } catch (err) {
      console.error(err);
      setBookingStatus('error');
    }
  };

  return (
    <main style={{ background: 'var(--surface)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">

        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="section-title">Expert <span className="section-accent">Consultations</span></h1>
          <p className="section-subtitle mx-auto">Connect with verified Vedic astrologers for personalized guidance</p>
          <hr className="divider-saffron mx-auto" />
        </div>

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

        {/* Astrologer Grid with Loading State */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            Loading astrologers...
          </div>
        ) : filteredAstrologers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No astrologers found at the moment.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAstrologers.map((astrologer, i) => (
              <div key={astrologer.id} className="card p-6 space-y-4 animate-fadeInUp" style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {astrologer.avatar_url ? (
                      <img src={astrologer.avatar_url} alt={astrologer.display_name} className="w-14 h-14 rounded-2xl object-cover" />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl text-white font-bold" style={{ background: 'linear-gradient(135deg, var(--primary), var(--saffron))' }}>
                        {astrologer.display_name ? astrologer.display_name.charAt(0) : '?'}
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{astrologer.display_name}</h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-xs" style={{ color: 'var(--gold)' }}>★</span>
                        <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{astrologer.rating || 'New'}</span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({astrologer.total_consultations || 0})</span>
                      </div>
                    </div>
                  </div>
                  <span className={`badge ${astrologer.is_available ? 'badge-success' : 'badge-danger'}`}>
                    {astrologer.is_available ? 'Online' : 'Offline'}
                  </span>
                </div>

                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {astrologer.bio ? `${astrologer.bio.substring(0, 120)}...` : 'No bio available.'}
                </p>

                <div className="flex flex-wrap gap-1">
                  {astrologer.specializations?.map((s: string) => (
                    <span key={s} className="badge badge-gold text-[10px]">{s}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>{astrologer.experience_years || 0} yrs experience</span>
                  <span className="font-bold" style={{ color: 'var(--primary)' }}>₹{astrologer.hourly_rate || 0}/hr</span>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setSelectedAstrologer(astrologer)}
                    className="btn-primary flex-1 text-xs py-2"
                    disabled={!astrologer.is_available}
                  >
                    {astrologer.is_available ? 'Book Now' : 'Unavailable'}
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
              ) : bookingStatus === 'error' ? (
                <div className="text-center space-y-4 py-6">
                  <div className="text-5xl">❌</div>
                  <h3 className="text-xl font-bold text-red-500">Booking Failed</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    There was an error processing your booking. Please try again later.
                  </p>
                  <button onClick={() => setBookingStatus('idle')} className="btn-primary">
                    Go Back
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
                      {selectedAstrologer.display_name ? selectedAstrologer.display_name.charAt(0) : '?'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{selectedAstrologer.display_name}</h4>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>₹{selectedAstrologer.hourly_rate}/hr</p>
                    </div>
                  </div>

                  {/* Consultation Type */}
                  <div>
                    <label className="input-label">Consultation Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['chat', 'call', 'video'] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => setBookingType(type)}
                          className="py-3 rounded-xl text-sm font-bold border transition-all capitalize"
                          style={{
                            background: bookingType === type ? 'var(--primary)' : '#ffffff',
                            color: bookingType === type ? '#ffffff' : 'var(--text-secondary)',
                            borderColor: bookingType === type ? 'var(--primary)' : 'var(--border-light)',
                          }}
                        >
                          {type === 'chat' ? '💬' : type === 'call' ? '📞' : '📹'} {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="input-label">Date</label>
                      <input type="date" className="input-field" value={bookingDate} onChange={e => setBookingDate(e.target.value)} required />
                    </div>
                    <div>
                      <label className="input-label">Time</label>
                      <input type="time" className="input-field" value={bookingTime} onChange={e => setBookingTime(e.target.value)} required />
                    </div>
                  </div>

                  {!user && (
                    <div className="p-3 rounded-xl text-sm" style={{ background: '#fff8e1', border: '1px solid var(--gold)' }}>
                      <strong style={{ color: '#f57f17' }}>Note:</strong> You&apos;ll need to sign in to complete the booking.
                    </div>
                  )}

                  <button
                    onClick={handleBooking}
                    disabled={!bookingDate || !bookingTime || bookingStatus === 'loading'}
                    className="btn-primary w-full py-3 disabled:opacity-50"
                  >
                    {bookingStatus === 'loading' ? '⏳ Booking...' : `Confirm Booking — ₹${selectedAstrologer.hourly_rate || 0}`}
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
          <Link href="/register?role=astrologer" className="btn-primary">
            🧘 Register as Astrologer
          </Link>
        </div>
      </div>
    </main>
  );
}