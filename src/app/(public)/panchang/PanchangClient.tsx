"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// --- HELPER FUNCTIONS ---
const formatTime = (iso?: string) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

// --- VISUAL TIMELINE COMPONENT (UPGRADED) ---
const PanchangTimeline = ({ data }: { data: any }) => {
  if (!data || !data.sunrise) return null;

  const sunriseMs = new Date(data.sunrise).getTime();
  const startMs = sunriseMs - (2 * 60 * 60 * 1000);
  const endMs = startMs + (26 * 60 * 60 * 1000);
  const totalMs = endMs - startMs;

  const timeToPercent = (timeIso: string) => {
    if (!timeIso) return null;
    const tMs = new Date(timeIso).getTime();
    return ((tMs - startMs) / totalMs) * 100;
  };

  const mapSegments = (items: any[]) => {
    if (!items) return [];
    return items.map((item) => ({
      name: item.name,
      startPercent: timeToPercent(item.startTime) as number,
      endPercent: timeToPercent(item.endTime) as number,
      endLabel: item.endTime ? formatTime(item.endTime) : ''
    }));
  };

  const timelineData = {
    sunrisePercent: timeToPercent(data.sunrise) || 0,
    sunsetPercent: timeToPercent(data.sunset) || 50,
    tithi: mapSegments(data.tithis),
    nakshatra: mapSegments(data.nakshatras),
    yoga: mapSegments(data.yogas),
    karana: mapSegments(data.karanas)
  };

  const colors = [
    { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
    { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
    { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
    { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
    { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
    { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' }
  ];

  return (
    <div className="w-full">
      {/* Scrollable Container for Mobile */}
      <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-[700px] relative border border-gray-200 rounded-lg overflow-hidden bg-slate-50">

          {/* Shading */}
          <div className="absolute top-0 bottom-0 bg-blue-900/5 pointer-events-none" style={{ left: 0, right: 0 }} />
          <div
            className="absolute top-0 bottom-0 bg-amber-500/5 pointer-events-none"
            style={{ left: `${Math.max(0, timelineData.sunrisePercent)}%`, width: `${Math.max(0, timelineData.sunsetPercent - timelineData.sunrisePercent)}%` }}
          />

          {/* Header Axis */}
          <div className="flex relative h-10 border-b border-gray-200 text-[10px] font-bold text-gray-500 bg-gray-100">
            <div className="w-20 shrink-0 border-r border-gray-200"></div>
            <div className="flex-1 relative flex items-end pb-1">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="absolute flex flex-col items-center -translate-x-1/2" style={{ left: `${(i / 13) * 100}%` }}>
                  <span>{((i * 2 + 3) % 12 || 12)}</span>
                  <div className="h-1.5 w-px bg-gray-400 mt-1"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Rows */}
          <div className="relative">
            {['Tithi', 'Nakshatra', 'Yoga', 'Karana'].map((label, i) => (
              <div key={label} className="relative h-14 flex items-center border-b border-gray-200">
                <div className="w-20 shrink-0 text-gray-600 font-bold text-[11px] sm:text-xs z-10 pl-2 bg-white/60 h-full flex items-center truncate">
                  {label}
                </div>
                <div className="flex-1 relative h-full">
                  {[timelineData.tithi, timelineData.nakshatra, timelineData.yoga, timelineData.karana][i].map((seg, idx) => {
                    const left = Math.max(0, Math.min(100, seg.startPercent));
                    const width = Math.max(0, Math.min(100, seg.endPercent) - left);
                    if (width <= 0) return null;
                    const color = colors[idx % colors.length];
                    return (
                      <div key={idx} className={`absolute top-2 bottom-2 rounded border shadow-sm flex items-center px-1.5 z-10 ${color.bg} ${color.text} ${color.border}`} style={{ left: `${left}%`, width: `${width}%` }}>
                        <span className="font-bold text-[10px] sm:text-xs truncate">{seg.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="text-[10px] text-gray-400 italic text-center sm:hidden">Swipe left/right to view full timeline</p>
    </div>
  );
};

// --- CHOGHADIYA TIMETABLE COMPONENT ---
const DailyTimetable = ({ data }: { data: any }) => {
  if (!data || !data.choghadiya) return null;

  const renderRow = (item: any, idx: number) => {
    let bg = 'bg-gray-50';
    let text = 'text-gray-700';
    let icon = '➖';

    if (item.rating === 'good') {
      bg = 'bg-emerald-50 border-emerald-100';
      text = 'text-emerald-700';
      icon = '✅';
    } else if (item.rating === 'bad') {
      bg = 'bg-red-50 border-red-100';
      text = 'text-red-700';
      icon = '⚠️';
    } else if (item.rating === 'neutral') {
      bg = 'bg-blue-50 border-blue-100';
      text = 'text-blue-700';
      icon = '▶️';
    }

    return (
      <div key={idx} className={`flex justify-between items-center p-3 rounded-lg border shadow-sm mb-2 ${bg}`}>
        <div className="flex items-center gap-3">
          <span className="text-lg">{icon}</span>
          <span className={`font-bold uppercase tracking-wide text-sm ${text}`}>
            {item.name}
          </span>
        </div>
        <span className="text-xs font-semibold text-gray-700 bg-white/80 px-2 py-1 rounded shadow-sm">
          {formatTime(item.startTime)} - {formatTime(item.endTime)}
        </span>
      </div>
    );
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 w-full">
      <div className="flex flex-col">
        <h3 className="text-lg font-bold text-orange-500 mb-4 flex items-center gap-2 border-b pb-2">
          <span>☀️</span> Day Choghadiya
        </h3>
        <div>
          {data.choghadiya.day.map((item: any, idx: number) => renderRow(item, idx))}
        </div>
      </div>
      <div className="flex flex-col">
        <h3 className="text-lg font-bold text-indigo-500 mb-4 flex items-center gap-2 border-b pb-2">
          <span>🌙</span> Night Choghadiya
        </h3>
        <div>
          {data.choghadiya.night.map((item: any, idx: number) => renderRow(item, idx))}
        </div>
      </div>
    </div>
  );
};

// --- MAIN CLIENT COMPONENT ---
export default function PanchangClient({
  initialData,
  initialParams
}: {
  initialData: any | null,
  initialParams: { date?: string, location?: string }
}) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    date: initialParams.date || new Date().toISOString().split('T')[0],
    location: initialParams.location || 'New Delhi, India'
  });

  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<any | null>(initialData);

  useEffect(() => {
    setApiResponse(initialData);
    setLoading(false);
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const params = new URLSearchParams(formData);
    router.push(`/panchang?${params.toString()}`);
  };

  const result = apiResponse?.data || apiResponse;

  return (
    <main style={{ background: 'var(--surface)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">

        {/* Header Section */}
        <div className="text-center space-y-3">
          <h1 className="section-title">Daily <span className="section-accent">Panchang</span></h1>
          <p className="section-subtitle mx-auto">Tithi, Nakshatra, Yoga, Karana, and Timetable</p>
          <hr className="divider-saffron mx-auto" />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="card p-6 flex flex-col sm:flex-row gap-4 items-end max-w-5xl mx-auto">
          <div className="flex-1 w-full">
            <label className="input-label">Date</label>
            <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="input-field w-full" required />
          </div>
          <div className="flex-1 w-full">
            <label className="input-label">Location</label>
            <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="input-field w-full" placeholder="City, Country" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary h-[46px] px-8 shrink-0 w-full sm:w-auto hover:scale-105 transition-transform">
            {loading ? '⏳ Loading...' : '📅 Check Panchang'}
          </button>
        </form>

        {result && (
          <div className="space-y-6 animate-fadeIn">

            {/* Title Bar */}
            <div className="card-warm p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Panchang for {formData.date}</h2>
                <p className="text-sm text-gray-500 font-medium">{formData.location}</p>
              </div>
              <div className="flex gap-3">
                <span className="badge badge-gold shadow-sm">Vikram Samvat {result.samvat?.vikram || result.samvat}</span>
                <span className="badge badge-primary shadow-sm">{result.masa?.name || result.masa} • {result.paksha} Paksha</span>
              </div>
            </div>

            {/* NEW: VISUAL PANCHANG TIMELINE */}
            <div className="card p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-6 text-indigo-600">
                <span>📊</span> Visual Timeline
              </h3>
              <PanchangTimeline data={result} />
            </div>

            {/* FULL WIDTH CHOGHADIYA TIMETABLE */}
            <div className="card p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-6 text-indigo-600">
                <span>⏱️</span> Today's Choghadiya Timetable
              </h3>
              <DailyTimetable data={result} />
            </div>

            {/* 2x2 Info Cards Grid */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* 1. Core Panchang */}
              <div className="card p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-indigo-600">
                  <span>🪷</span> Current Daily States
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Tithi', value: result.tithi, icon: '🌙' },
                    { label: 'Nakshatra', value: result.nakshatra, icon: '⭐' },
                    { label: 'Yoga', value: result.yoga, icon: '🧘' },
                    { label: 'Karana', value: result.karana, icon: '📿' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        <span>{item.icon}</span> {item.label}
                      </span>
                      <span className="text-sm font-bold text-gray-800 text-right ml-4">{item.value || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Astrological Details */}
              <div className="card p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-indigo-600">
                  <span>🪐</span> Astrological Details
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Sun Sign', value: result.sunSign, icon: '☀️' },
                    { label: 'Moon Sign', value: result.moonSign, icon: '🌑' },
                    { label: 'Ritu (Season)', value: result.ritu, icon: '🌿' },
                    { label: 'Ayana', value: result.ayana, icon: '🧭' },
                    { label: 'Disha Shoola', value: result.dishaShoola, icon: '⛔' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        <span>{item.icon}</span> {item.label}
                      </span>
                      <span className="text-sm font-bold text-gray-800 text-right ml-4">{item.value || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Auspicious Timings Overview */}
              <div className="card p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-emerald-600">
                  <span>✅</span> Auspicious Timings
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Abhijit Muhurta', value: result.abhijit },
                    { label: 'Brahma Muhurta', value: result.brahma },
                    { label: 'Amrit Kalam', value: result.amritKalam },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="flex items-center gap-2 text-sm text-emerald-700 font-medium">
                        {item.label}
                      </span>
                      <span className="text-sm font-bold text-gray-800 text-right ml-4">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Inauspicious Timings Overview */}
              <div className="card p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-red-500">
                  <span>⚠️</span> Inauspicious Timings
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Rahu Kalam', value: result.rahuKalam },
                    { label: 'Yamaganda', value: result.yamaganda },
                    { label: 'Gulika Kalam', value: result.gulika },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="flex items-center gap-2 text-sm text-red-600 font-medium">
                        {item.label}
                      </span>
                      <span className="text-sm font-bold text-gray-800 text-right ml-4">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </main>
  );
}