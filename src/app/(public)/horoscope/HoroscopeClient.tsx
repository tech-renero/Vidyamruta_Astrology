'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { zodiacSigns, getTodayDate, type ZodiacSign } from '@/lib/horoscope-data';
import type { DailyHoroscope } from '@/services/horoscope/horoscope.service';

type TabKey = 'daily' | 'history';
type CategoryKey = 'general' | 'career' | 'finance' | 'health' | 'romance';

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: 'daily', label: 'Today\'s Prediction', icon: '🌟' },
  { key: 'history', label: 'Weekly History', icon: '📅' },
];

const categories: { key: CategoryKey; label: string; icon: string }[] = [
  { key: 'general', label: 'General', icon: '🔮' },
  { key: 'career', label: 'Career', icon: '💼' },
  { key: 'finance', label: 'Finance', icon: '💰' },
  { key: 'health', label: 'Health', icon: '❤️' },
  { key: 'romance', label: 'Romance', icon: '🌹' },
];

function SignSelector({ signs, selectedId, onSelect }: { signs: ZodiacSign[]; selectedId: string; onSelect: (id: string) => void }) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
      {signs.map(sign => (
        <button
          key={sign.id}
          onClick={() => onSelect(sign.id)}
          className="flex flex-col items-center gap-2 p-2 rounded-xl transition-all border"
          style={{
            background: selectedId === sign.id ? 'var(--primary-lighter)' : '#ffffff',
            borderColor: selectedId === sign.id ? 'var(--primary)' : 'var(--border-light)',
            transform: selectedId === sign.id ? 'scale(1.05)' : 'scale(1)',
            boxShadow: selectedId === sign.id ? 'var(--shadow-md)' : 'none',
          }}
        >
          {/* Replaced symbol text with Image component */}
          <div className="relative w-10 h-10">
            <Image
              // Ensure the filename here matches the exact casing of your file (e.g., Aries.webp)
              src={`/zodiac/${sign.name}.webp`}
              alt={sign.name}
              fill
              className="object-contain"
              sizes="200px"
            />
          </div>
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

export default function HoroscopeClient({
  initialSign,
  todayHoroscope,
  weeklyHistory
}: {
  initialSign: string;
  todayHoroscope: DailyHoroscope | null;
  weeklyHistory: DailyHoroscope[];
}) {
  const router = useRouter();
  const [selectedSignId, setSelectedSignId] = useState(initialSign);
  const [activeTab, setActiveTab] = useState<TabKey>('daily');
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('general');
  const [loading, setLoading] = useState(false);

  const selectedSign = zodiacSigns.find(s => s.id === selectedSignId) || zodiacSigns[0];

  useEffect(() => {
    if (initialSign === selectedSignId) {
      setLoading(false);
    }
  }, [initialSign, selectedSignId]);

  const handleSignSelect = (id: string) => {
    setSelectedSignId(id);
    setLoading(true);
    router.push(`/horoscope?sign=${id}`);
  };

  // Helper functions to grab specific data based on the active category tab
  const getCategoryPrediction = (cat: CategoryKey) => {
    if (!todayHoroscope) return selectedSign.dailyPrediction;
    switch (cat) {
      case 'career': return todayHoroscope.career_prediction || 'No specific career prediction available today.';
      case 'finance': return todayHoroscope.finance_prediction || 'No specific finance prediction available today.';
      case 'health': return todayHoroscope.health_prediction || 'No specific health prediction available today.';
      case 'romance': return todayHoroscope.romance_prediction || 'No specific romance prediction available today.';
      case 'general':
      default:
        return todayHoroscope.prediction || selectedSign.dailyPrediction;
    }
  };

  const getCategoryRating = (cat: CategoryKey) => {
    if (!todayHoroscope) return selectedSign.overallRating;
    switch (cat) {
      case 'career': return todayHoroscope.career_rating || 3;
      case 'finance': return todayHoroscope.finance_rating || 3;
      case 'health': return todayHoroscope.health_rating || 3;
      case 'romance': return todayHoroscope.romance_rating || 3;
      case 'general':
      default:
        return todayHoroscope.overall_rating || selectedSign.overallRating;
    }
  };

  // Safe fallback for compatibility strings which might be stored as an array or comma string
  const displayCompatibility = todayHoroscope?.compatibility
    ? Array.isArray(todayHoroscope.compatibility) ? todayHoroscope.compatibility.join(', ') : todayHoroscope.compatibility
    : selectedSign.compatibility;

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
          <SignSelector signs={zodiacSigns} selectedId={selectedSignId} onSelect={handleSignSelect} />
        </div>

        {/* Selected Sign Detail */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left Panel — Sign Info */}
          <div className="space-y-6">
            <div className="card text-center p-8 space-y-4">
              <div className="relative w-50 h-50 mx-auto rounded-2xl flex items-center justify-center animate-float overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--primary-lighter), #fff8e1)' }}>
                <Image
                  src={`/zodiac/${selectedSign.name}.webp`}
                  alt={selectedSign.name}
                  fill
                  className="object-contain p-4"
                  sizes="200px"
                />
              </div>
              <h2 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{selectedSign.name}</h2>
              <p className="text-sm font-bold" style={{ color: 'var(--primary)' }}>{selectedSign.nameHindi}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{selectedSign.dateRange}</p>
              <hr className="divider-saffron mx-auto" />
              <div className="text-left space-y-3 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Element</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{todayHoroscope?.element || selectedSign.element}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Ruling Planet</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{selectedSign.ruler}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Compatibility</span>
                  <span className="font-bold text-right" style={{ color: 'var(--text-primary)' }}>{displayCompatibility}</span>
                </div>
              </div>
            </div>

            {/* Lucky Panel */}
            <div className="card p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Today&apos;s Lucky</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl" style={{ background: 'var(--primary-lighter)' }}>
                  <div className="text-lg font-black" style={{ color: 'var(--primary)' }}>{todayHoroscope?.lucky_number || selectedSign.luckyNumber}</div>
                  <div className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>Number</div>
                </div>

                {/* Dynamically colors the icon based on AstroJSON Hex Code */}
                <div className="p-3 rounded-xl" style={{ background: '#fff8e1' }}>
                  <div className="flex justify-center mb-1 h-[28px] items-center">
                    <div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: todayHoroscope?.color_hex || '#f57f17' }}></div>
                  </div>
                  <div className="text-[10px] font-bold truncate" style={{ color: 'var(--text-muted)' }}>{todayHoroscope?.lucky_color || selectedSign.luckyColor}</div>
                </div>

                <div className="p-3 rounded-xl" style={{ background: '#e8f5e9' }}>
                  <div className="flex justify-center mb-1 h-[28px] items-center">
                    <span className="text-lg">🕒</span>
                  </div>
                  <div className="text-[10px] font-bold truncate" style={{ color: 'var(--text-muted)' }}>{todayHoroscope?.lucky_time || 'Morning'}</div>
                </div>
              </div>
            </div>

            {/* Mood Panel */}
            {todayHoroscope?.mood && (
              <div className="card p-5 border-l-4" style={{ borderColor: 'var(--primary)' }}>
                <p className="text-xs uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Today's Vibe</p>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{todayHoroscope.mood}</p>
              </div>
            )}
          </div>

          {/* Right Panel — Prediction */}
          <div className="lg:col-span-2 space-y-6">

            {/* Main Tabs (Daily vs History) */}
            <div className="flex flex-wrap gap-2">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setActiveCategory('general'); }}
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
              <div className="flex items-center gap-3 mb-2">
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

              {/* ONLY show Category Sub-tabs if looking at Daily */}
              {activeTab === 'daily' && (
                <div className="space-y-6 animate-fadeIn">

                  {/* Category Pills */}
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat.key}
                        onClick={() => setActiveCategory(cat.key)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${activeCategory === cat.key
                          ? 'bg-orange-100 text-orange-600 border-orange-200 shadow-sm'
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                          }`}
                      >
                        {cat.icon} {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Focused Prediction Box */}
                  <div className="p-6 rounded-xl border space-y-4" style={{ backgroundColor: '#fafafa', borderColor: 'var(--border-light)' }}>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <h4 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                        {categories.find(c => c.key === activeCategory)?.label} Outlook
                      </h4>
                      <RatingStars rating={getCategoryRating(activeCategory)} />
                    </div>
                    <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                      {loading ? 'Consulting the stars...' : getCategoryPrediction(activeCategory)}
                    </p>
                  </div>
                </div>
              )}

              {/* History Content */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  {loading ? (
                    <p className="text-base" style={{ color: 'var(--text-secondary)' }}>Consulting the stars...</p>
                  ) : weeklyHistory.length > 0 ? (
                    weeklyHistory.map((entry, idx) => (
                      <div key={idx} className="p-4 rounded-xl border" style={{ borderColor: 'var(--border-light)' }}>
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-sm font-bold" style={{ color: 'var(--primary)' }}>
                            {new Date(entry.horoscope_date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </div>
                          {entry.overall_rating && <RatingStars rating={entry.overall_rating} />}
                        </div>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{entry.prediction}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No recent history available for {selectedSign.name}.</p>
                  )}
                </div>
              )}

              <div className="p-5 rounded-xl border-l-4 mt-6" style={{ background: 'var(--primary-lighter)', borderColor: 'var(--primary)' }}>
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
                    onClick={() => { handleSignSelect(sign.id); setActiveTab('daily'); setActiveCategory('general'); }}
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