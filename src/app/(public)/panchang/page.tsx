"use client";

import React, { useState } from 'react';

export default function PanchangPage() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    location: 'New Delhi, India'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setResult({
        tithi: 'Shukla Paksha Dashami',
        karana: 'Garaja',
        yoga: 'Dhriti',
        nakshatra: 'Magha',
        sunrise: '05:58 AM',
        sunset: '06:45 PM',
        moonrise: '02:30 PM',
        moonset: '01:15 AM',
        rahuKalam: '04:30 PM - 06:00 PM',
        yamaganda: '12:00 PM - 01:30 PM',
        gulika: '10:30 AM - 12:00 PM',
        abhijit: '11:45 AM - 12:35 PM',
        dayOfWeek: 'Friday',
        paksha: 'Shukla Paksha',
        masa: 'Vaishakha',
        samvat: '2083',
        shaka: '1948',
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <main style={{ background: 'var(--surface)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="text-center space-y-3">
          <h1 className="section-title">Daily <span className="section-accent">Panchang</span></h1>
          <p className="section-subtitle mx-auto">Tithi, Nakshatra, Yoga, Karana, and Auspicious Muhurtas for any date and location</p>
          <hr className="divider-saffron mx-auto" />
        </div>

        <form onSubmit={handleSubmit} className="card p-6 flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="input-label">Date</label>
            <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="input-field" required />
          </div>
          <div className="flex-1">
            <label className="input-label">Location</label>
            <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="input-field" placeholder="City, Country" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary h-[46px] px-8 shrink-0">
            {loading ? '⏳ Loading...' : '📅 Check Panchang'}
          </button>
        </form>

        {result && (
          <div className="space-y-6 animate-fadeIn">
            {/* Title Bar */}
            <div className="card-warm p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Panchang for {formData.date}</h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{formData.location} • {result.dayOfWeek}</p>
              </div>
              <div className="flex gap-3">
                <span className="badge badge-gold">Vikram Samvat {result.samvat}</span>
                <span className="badge badge-primary">{result.masa}</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Core Panchang */}
              <div className="card p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                  <span>🪷</span> Five Limbs (Panchang)
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Tithi', value: result.tithi, icon: '🌙' },
                    { label: 'Nakshatra', value: result.nakshatra, icon: '⭐' },
                    { label: 'Yoga', value: result.yoga, icon: '🧘' },
                    { label: 'Karana', value: result.karana, icon: '📿' },
                    { label: 'Paksha', value: result.paksha, icon: '🌓' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--border-light)' }}>
                      <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                        <span>{item.icon}</span> {item.label}
                      </span>
                      <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timings */}
              <div className="card p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                  <span>⏰</span> Auspicious & Inauspicious Timings
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--border-light)' }}>
                    <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--success)' }}>
                      <span>✅</span> Abhijit Muhurta
                    </span>
                    <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{result.abhijit}</span>
                  </div>
                  {[
                    { label: 'Rahu Kalam', value: result.rahuKalam },
                    { label: 'Yamaganda', value: result.yamaganda },
                    { label: 'Gulika Kalam', value: result.gulika },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--border-light)' }}>
                      <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--danger)' }}>
                        <span>⚠️</span> {item.label}
                      </span>
                      <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sun & Moon */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Sunrise', value: result.sunrise, icon: '🌅', bg: '#fff8e1' },
                { label: 'Sunset', value: result.sunset, icon: '🌇', bg: '#fbe9e7' },
                { label: 'Moonrise', value: result.moonrise, icon: '🌕', bg: '#e8eaf6' },
                { label: 'Moonset', value: result.moonset, icon: '🌑', bg: '#efebe9' },
              ].map(item => (
                <div key={item.label} className="card p-5 text-center space-y-2" style={{ background: item.bg }}>
                  <div className="text-2xl">{item.icon}</div>
                  <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{item.label}</div>
                  <div className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
