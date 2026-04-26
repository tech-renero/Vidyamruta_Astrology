'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { zodiacSigns, getTodayDate, type ZodiacSign } from '@/lib/horoscope-data';
import { getTodayHoroscope, getWeeklyHoroscopeHistory, type HoroscopeEntry } from '@/services/horoscopeService';

type TabKey = 'daily' | 'history';

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: 'daily', label: 'Today\'s Prediction', icon: '🌟' },
  { key: 'history', label: 'Weekly History', icon: '📅' },
];

function SignSelector({ signs, selectedId, onSelect }: { signs: ZodiacSign[]; selectedId: string; onSelect: (id: string) => void }) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
      {signs.map(sign => (
        <button
          key={sign.id}
          onClick={() => onSelect(sign.id)}
          className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all border"
          style={{
            background: selectedId === sign.id ? 'var(--primary-lighter)' : '#ffffff',
            borderColor: selectedId === sign.id ? 'var(--primary)' : 'var(--border-light)',
            transform: selectedId === sign.id ? 'scale(1.05)' : 'scale(1)',
            boxShadow: selectedId === sign.id ? 'var(--shadow-md)' : 'none',
          }}
        >
          <span className="text-xl">{sign.symbol}</span>
          <span className="text-[10px] font-bold" style={{ color: selectedId === sign.id ? 'var(--primary)' : 'var(--text-muted)' }}>
            {sign.name}
          </span>
        </button>
      ))}
    </div>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="text-lg" style={{ color: i < rating ? 'var(--gold)' : 'var(--border)' }}>★</span>
      ))}
    </div>
  );
}

function HoroscopeContent() {
  const searchParams = useSearchParams();
  const initialSign = searchParams.get('sign') || 'aries';
  const [selectedSignId, setSelectedSignId] = useState(initialSign);
  const [activeTab, setActiveTab] = useState<TabKey>('daily');
  const [todayHoroscope, setTodayHoroscope] = useState<HoroscopeEntry | null>(null);
  const [weeklyHistory, setWeeklyHistory] = useState<HoroscopeEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedSign = zodiacSigns.find(s => s.id === selectedSignId) || zodiacSigns[0];

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      setLoading(true);
      try {
        const [today, history] = await Promise.all([
          getTodayHoroscope(selectedSignId),
          getWeeklyHoroscopeHistory(selectedSignId)
        ]);
        if (isMounted) {
          setTodayHoroscope(today);
          setWeeklyHistory(history);
        }
      } catch (err) {
        console.error("Failed to fetch horoscope data", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchData();
    return () => { isMounted = false; };
  }, [selectedSignId]);

  return (
    <main style={{ background: 'var(--surface)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="section-title">
            Daily <span className="section-accent">Horoscope</span>
          </h1>
          <p className="section-subtitle mx-auto">{getTodayDate()}</p>
          <hr className="divider-saffron mx-auto" />
        </div>

        {/* Sign Selector */}
        <div className="card p-5">
          <SignSelector signs={zodiacSigns} selectedId={selectedSignId} onSelect={setSelectedSignId} />
        </div>

        {/* Selected Sign Detail */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel — Sign Info */}
          <div className="space-y-6">
            <div className="card text-center p-8 space-y-4">
              <div className="w-24 h-24 mx-auto rounded-2xl flex items-center justify-center text-5xl animate-float" style={{ background: 'linear-gradient(135deg, var(--primary-lighter), #fff8e1)' }}>
                {selectedSign.symbol}
              </div>
              <h2 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{selectedSign.name}</h2>
              <p className="text-sm font-bold" style={{ color: 'var(--primary)' }}>{selectedSign.nameHindi}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{selectedSign.dateRange}</p>
              <hr className="divider-saffron mx-auto" />
              <div className="text-left space-y-3 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Element</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{selectedSign.element}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Ruling Planet</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{selectedSign.ruler}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Compatibility</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{selectedSign.compatibility}</span>
                </div>
              </div>
            </div>

            {/* Lucky Panel */}
            <div className="card p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Today&apos;s Lucky</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl" style={{ background: 'var(--primary-lighter)' }}>
                  <div className="text-lg font-black" style={{ color: 'var(--primary)' }}>{selectedSign.luckyNumber}</div>
                  <div className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>Number</div>
                </div>
                <div className="p-3 rounded-xl" style={{ background: '#fff8e1' }}>
                  <div className="text-lg font-black" style={{ color: '#f57f17' }}>🎨</div>
                  <div className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>{selectedSign.luckyColor}</div>
                </div>
                <div className="p-3 rounded-xl" style={{ background: '#e8f5e9' }}>
                  <div className="text-lg font-black" style={{ color: 'var(--success)' }}>📅</div>
                  <div className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>{selectedSign.luckyDay}</div>
                </div>
              </div>
            </div>

            {/* Overall Rating */}
            <div className="card p-6 space-y-3 text-center">
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Overall Rating</h3>
              <RatingStars rating={selectedSign.overallRating} />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {selectedSign.overallRating >= 4 ? 'Excellent day ahead!' : selectedSign.overallRating >= 3 ? 'A good day with minor challenges.' : 'Exercise patience today.'}
              </p>
            </div>
          </div>

          {/* Right Panel — Prediction */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all border"
                  style={{
                    background: activeTab === tab.key ? 'var(--primary)' : '#ffffff',
                    color: activeTab === tab.key ? '#ffffff' : 'var(--text-secondary)',
                    borderColor: activeTab === tab.key ? 'var(--primary)' : 'var(--border-light)',
                    boxShadow: activeTab === tab.key ? '0 4px 14px rgba(230, 81, 0, 0.25)' : 'none',
                  }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Prediction Content */}
            <div className="card p-8 md:p-10 space-y-6 animate-fadeIn" key={`${selectedSignId}-${activeTab}`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{tabs.find(t => t.key === activeTab)?.icon}</span>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {tabs.find(t => t.key === activeTab)?.label} Prediction
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {selectedSign.name} — {getTodayDate()}
                  </p>
                </div>
              </div>

              {activeTab === 'daily' && (
                <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  {loading ? 'Consulting the stars...' : (todayHoroscope?.prediction || selectedSign.dailyPrediction)}
                </p>
              )}

              {activeTab === 'history' && (
                <div className="space-y-4">
                  {loading ? (
                    <p className="text-base" style={{ color: 'var(--text-secondary)' }}>Consulting the stars...</p>
                  ) : weeklyHistory.length > 0 ? (
                    weeklyHistory.map((entry, idx) => (
                      <div key={idx} className="p-4 rounded-xl border" style={{ borderColor: 'var(--border-light)' }}>
                        <div className="text-sm font-bold mb-2" style={{ color: 'var(--primary)' }}>
                          {new Date(entry.horoscope_date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{entry.prediction}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No recent history available for {selectedSign.name}.</p>
                  )}
                </div>
              )}

              <div className="p-5 rounded-xl border-l-4" style={{ background: 'var(--primary-lighter)', borderColor: 'var(--primary)' }}>
                <p className="text-sm italic font-medium" style={{ color: 'var(--text-secondary)' }}>
                  &quot;The stars impel, they do not compel. Awareness of these cosmic influences allows you to navigate your karma with wisdom and grace.&quot;
                </p>
              </div>
            </div>

            {/* Quick Links to Other Signs */}
            <div className="card p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--primary)' }}>
                Other Zodiac Signs
              </h3>
              <div className="flex flex-wrap gap-2">
                {zodiacSigns.filter(s => s.id !== selectedSignId).map(sign => (
                  <button
                    key={sign.id}
                    onClick={() => { setSelectedSignId(sign.id); setActiveTab('daily'); }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all hover:border-orange-300 hover:bg-orange-50"
                    style={{ borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }}
                  >
                    <span>{sign.symbol}</span>
                    <span>{sign.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-10 rounded-2xl" style={{ background: 'linear-gradient(135deg, var(--primary-lighter), #fff8e1)' }}>
          <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Want a Personalized Detailed Reading?</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Generate your full Kundli chart or consult with an expert Vedic astrologer.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/kundli" className="btn-primary">Generate Kundli</Link>
            <Link href="/consultations" className="btn-secondary">Book Consultation</Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function HoroscopePage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <HoroscopeContent />
    </React.Suspense>
  );
}
