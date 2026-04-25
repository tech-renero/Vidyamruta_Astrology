"use client";

import React, { useState, useEffect } from 'react';
import KundliChart from '@/components/astrology/KundliChart';
import { getKundliForDetails } from '@/services/astrologyService';
import { useAuth } from '@/providers/AuthProvider';
import { createClient } from '@/utils/supabase/client';
import { generateLagnaAnalysis, generateMoonAnalysis, generatePlanetAnalysis, generateDashaAnalysis, getActualCurrentMahadasha, downloadPDFReport } from '@/lib/report-generator';

export default function KundliPage() {
  const { user } = useAuth();
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [kundliData, setKundliData] = useState<any>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Basic');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedMaha, setSelectedMaha] = useState<number | null>(null);

  const tabs = ['Basic', 'Kundli', 'KP', 'Ashtakvarga', 'Charts', 'Dasha', 'Free Report'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Auto-save to Supabase when kundli is generated
  const saveKundliToAccount = async (chartData: any) => {
    if (!user) return;
    setSaving(true);
    try {
      const { error: insertError } = await supabase
        .from('saved_kundlis')
        .insert({
          user_id: user.id,
          name: formData.name,
          date_of_birth: formData.date,
          time_of_birth: formData.time + ':00',
          birth_location: formData.location,
          chart_data: chartData,
          ascendant_rashi: chartData.ascendant?.rashiName || null,
          moon_rashi: chartData.moonDetails?.rashiName || null,
          nakshatra: chartData.moonDetails?.nakshatra || null,
        });
      
      if (!insertError) {
        setSaved(true);
      } else {
        console.error("Failed to save Kundli:", insertError);
      }
    } catch (err) {
      console.error("Save Kundli Exception:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setKundliData(null);
    setSaved(false);

    try {
      const kData = await getKundliForDetails(formData);
      setKundliData(kData);
      // Auto-save if user is logged in
      await saveKundliToAccount(kData);
    } catch (err: any) {
      setError(err.message || "An error occurred while generating the Kundli.");
    } finally {
      setLoading(false);
    }
  };

  const pData = kundliData?.panchangData || {};
  const dashaData = kundliData?.dasha || pData?.vimshottariDasha || null;

  // Planet colors for dasha timeline
  const planetColors: Record<string, string> = {
    'Sun': '#e65100', 'Moon': '#5c6bc0', 'Mars': '#c62828',
    'Rahu': '#37474f', 'Jupiter': '#f9a825', 'Saturn': '#455a64',
    'Mercury': '#2e7d32', 'Ketu': '#6d4c41', 'Venus': '#ec407a',
  };

  const planetYears: Record<string, number> = {
    'Sun': 6, 'Moon': 10, 'Mars': 7, 'Rahu': 18, 'Jupiter': 16,
    'Saturn': 19, 'Mercury': 17, 'Ketu': 7, 'Venus': 20,
  };

  const formatDate = (d: string | Date) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const isCurrentPeriod = (start: string | Date, end: string | Date) => {
    const now = new Date();
    return new Date(start) <= now && now <= new Date(end);
  };

  const getAntardashas = (mahaPlanet: string, startDate: string | Date) => {
    const sequence = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
    const mahaYears = planetYears[mahaPlanet];
    if (!mahaYears) return [];

    let startIndex = sequence.indexOf(mahaPlanet);
    let currentStart = new Date(startDate);
    const antardashas = [];

    for (let i = 0; i < 9; i++) {
      const antarPlanet = sequence[(startIndex + i) % 9];
      const antarYears = planetYears[antarPlanet];
      // Duration in days = (Maha * Antar) / 120 * 365.2425
      const durationDays = (mahaYears * antarYears / 120) * 365.2425;
      
      const endTime = new Date(currentStart.getTime() + durationDays * 24 * 60 * 60 * 1000);
      
      antardashas.push({
        planet: antarPlanet,
        startTime: new Date(currentStart),
        endTime: new Date(endTime)
      });
      
      currentStart = endTime;
    }
    return antardashas;
  };

  return (
    <main style={{ background: 'var(--surface)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="section-title">Generate Your <span className="section-accent">Kundli</span></h1>
          <p className="section-subtitle mx-auto">Comprehensive Vedic Astrology Charts & Reports with Swiss Ephemeris Precision</p>
          <hr className="divider-saffron mx-auto" />
        </div>

        {/* Input Form */}
        {!kundliData && (
          <section className="max-w-2xl mx-auto">
            <div className="card p-8 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📜</span>
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Birth Details</h2>
              </div>
              
              {!user && (
                <div className="p-4 rounded-xl text-sm flex items-start gap-3" style={{ background: '#fff8e1', border: '1px solid var(--gold)' }}>
                  <span className="text-lg">💡</span>
                  <div>
                    <strong style={{ color: '#f57f17' }}>Sign in to auto-save!</strong>
                    <p style={{ color: 'var(--text-secondary)' }}>Your Kundli will be automatically saved to your account when you&apos;re logged in.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="input-label">Full Name</label>
                  <input 
                    type="text" name="name" value={formData.name} onChange={handleChange}
                    className="input-field" placeholder="Enter your full name" required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Date of Birth</label>
                    <input type="date" name="date" value={formData.date} onChange={handleChange}
                      className="input-field" required
                    />
                  </div>
                  <div>
                    <label className="input-label">Time of Birth</label>
                    <input type="time" name="time" value={formData.time} onChange={handleChange}
                      className="input-field" required
                    />
                  </div>
                </div>
                <div>
                  <label className="input-label">Birth Place (City, State, Country)</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange}
                    className="input-field" placeholder="e.g., Kolkata, West Bengal, India" required
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base disabled:opacity-50">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⚙️</span> Calculating Planetary Positions...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">📜 Generate Comprehensive Report</span>
                  )}
                </button>
              </form>
              {error && (
                <div className="p-4 rounded-xl text-sm font-bold flex items-center gap-2" style={{ background: '#ffebee', color: 'var(--danger)', border: '1px solid #ef9a9a' }}>
                  <span>⚠️</span> {error}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Results Container */}
        {kundliData && (
          <div className="space-y-6">
            
            {/* Action Bar */}
            <div className="card p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: 'var(--primary-lighter)' }}>📜</div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Horoscope for {formData.name}</h2>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formData.date} • {formData.time} • {formData.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {user && (
                  <span className={`badge ${saved ? 'badge-success' : (saving ? 'badge-primary' : 'badge-danger')} flex items-center gap-1`}>
                    {saving ? '⏳ Saving...' : saved ? '✅ Saved to Account' : '❌ Save Failed'}
                  </span>
                )}
                <button onClick={() => { setKundliData(null); setSaved(false); }} className="btn-ghost text-xs">
                  ✏️ Edit Details
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 justify-center pb-1">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="tab-btn"
                  style={{
                    background: activeTab === tab ? '#ffffff' : 'transparent',
                    color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                    borderColor: activeTab === tab ? 'var(--border)' : 'transparent',
                    boxShadow: activeTab === tab ? '0 -2px 8px rgba(230,81,0,0.06)' : 'none',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              
              {/* BASIC TAB */}
              {activeTab === 'Basic' && (
                <div className="grid md:grid-cols-2 gap-8 animate-fadeIn">
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                      <span>📋</span> Basic Details
                    </h3>
                    <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border-light)' }}>
                      <table className="data-table">
                        <tbody>
                          <tr><td className="font-bold" style={{ color: 'var(--text-muted)', width: '35%' }}>Name</td><td className="font-bold" style={{ color: 'var(--text-primary)' }}>{formData.name}</td></tr>
                          <tr><td className="font-bold" style={{ color: 'var(--text-muted)' }}>Date</td><td style={{ color: 'var(--text-primary)' }}>{formData.date}</td></tr>
                          <tr><td className="font-bold" style={{ color: 'var(--text-muted)' }}>Time</td><td style={{ color: 'var(--text-primary)' }}>{formData.time}</td></tr>
                          <tr><td className="font-bold" style={{ color: 'var(--text-muted)' }}>Place</td><td style={{ color: 'var(--text-primary)' }}>{formData.location}</td></tr>
                          <tr><td className="font-bold" style={{ color: 'var(--text-muted)' }}>Ayanamsha</td><td style={{ color: 'var(--text-primary)' }}>{pData?.ayanamsha ? pData.ayanamsha.toFixed(4) : '24.12'} (Lahiri)</td></tr>
                          <tr><td className="font-bold" style={{ color: 'var(--text-muted)' }}>Sunrise</td><td style={{ color: 'var(--text-primary)' }}>{pData?.sunrise ? new Date(pData.sunrise).toLocaleTimeString() : '—'}</td></tr>
                          <tr><td className="font-bold" style={{ color: 'var(--text-muted)' }}>Sunset</td><td style={{ color: 'var(--text-primary)' }}>{pData?.sunset ? new Date(pData.sunset).toLocaleTimeString() : '—'}</td></tr>
                        </tbody>
                      </table>
                    </div>

                    <h3 className="text-lg font-bold flex items-center gap-2 pt-4" style={{ color: 'var(--primary)' }}>
                      <span>📅</span> Panchang Details
                    </h3>
                    <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border-light)' }}>
                      <table className="data-table">
                        <tbody>
                          <tr><td className="font-bold" style={{ color: 'var(--text-muted)', width: '35%' }}>Tithi</td><td style={{ color: 'var(--text-primary)' }}>{pData?.tithi?.name || '—'}</td></tr>
                          <tr><td className="font-bold" style={{ color: 'var(--text-muted)' }}>Karan</td><td style={{ color: 'var(--text-primary)' }}>{pData?.karana?.name || '—'}</td></tr>
                          <tr><td className="font-bold" style={{ color: 'var(--text-muted)' }}>Yog</td><td style={{ color: 'var(--text-primary)' }}>{pData?.yoga?.name || '—'}</td></tr>
                          <tr><td className="font-bold" style={{ color: 'var(--text-muted)' }}>Nakshatra</td><td style={{ color: 'var(--text-primary)' }}>{kundliData.moonDetails?.nakshatra || '—'}</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                      <span>🪷</span> Avakhada Details
                    </h3>
                    <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border-light)' }}>
                      <table className="data-table">
                        <tbody>
                          {(() => {
                            const moonRashi = kundliData.moonDetails?.rashiName || '—';
                            const moonNak = kundliData.moonDetails?.nakshatra || '—';
                            const moonPada = kundliData.moonDetails?.pada || '—';

                            // Sign Lord mapping
                            const signLords: Record<string, string> = {
                              Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
                              Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars',
                              Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter'
                            };
                            // Tatva (Element)
                            const tatvaMap: Record<string, string> = {
                              Aries: 'Fire', Taurus: 'Earth', Gemini: 'Air', Cancer: 'Water',
                              Leo: 'Fire', Virgo: 'Earth', Libra: 'Air', Scorpio: 'Water',
                              Sagittarius: 'Fire', Capricorn: 'Earth', Aquarius: 'Air', Pisces: 'Water'
                            };
                            // Varna based on nakshatra
                            const varnaOrder = ['Brahmin', 'Kshattriya', 'Vaishya', 'Shudra'];
                            const nakshatraList = [
                              'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha',
                              'Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
                              'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'
                            ];
                            const nakIdx = nakshatraList.indexOf(moonNak);
                            const varna = nakIdx >= 0 ? varnaOrder[nakIdx % 4] : '—';
                            // Vashya based on rashi
                            const vashyaMap: Record<string, string> = {
                              Aries: 'Chatushpada', Taurus: 'Chatushpada', Gemini: 'Nara',
                              Cancer: 'Jalachara', Leo: 'Vanachara', Virgo: 'Nara',
                              Libra: 'Nara', Scorpio: 'Keeta', Sagittarius: 'Chatushpada',
                              Capricorn: 'Jalachara', Aquarius: 'Nara', Pisces: 'Jalachara'
                            };
                            // Yoni based on nakshatra
                            const yoniList = [
                              'Ashwa','Gaja','Mesha','Sarpa','Sarpa','Shwana','Marjara','Mesha','Marjara',
                              'Mushaka','Mushaka','Gau','Mahisha','Vyaghra','Mahisha','Vyaghra','Mriga','Mriga',
                              'Shwana','Vaanara','Nakula','Vaanara','Simha','Ashwa','Simha','Gau','Gaja'
                            ];
                            const yoni = nakIdx >= 0 ? yoniList[nakIdx] : '—';
                            // Gan
                            const ganList = [
                              'Deva','Manav','Rakshasa','Manav','Deva','Manav','Deva','Deva','Rakshasa',
                              'Rakshasa','Manav','Manav','Deva','Rakshasa','Deva','Rakshasa','Deva','Rakshasa',
                              'Rakshasa','Manav','Manav','Deva','Rakshasa','Rakshasa','Manav','Manav','Deva'
                            ];
                            const gan = nakIdx >= 0 ? ganList[nakIdx] : '—';
                            // Nadi
                            const nadiList = [
                              'Vata','Pitta','Kapha','Vata','Pitta','Kapha','Vata','Pitta','Kapha',
                              'Vata','Pitta','Kapha','Vata','Pitta','Kapha','Vata','Pitta','Kapha',
                              'Vata','Pitta','Kapha','Vata','Pitta','Kapha','Vata','Pitta','Kapha'
                            ];
                            // Map Nadi to traditional names
                            const nadiNames: Record<string, string> = { Vata: 'Aadi (Vata)', Pitta: 'Madhya (Pitta)', Kapha: 'Antya (Kapha)' };
                            const nadi = nakIdx >= 0 ? (nadiNames[nadiList[nakIdx]] || nadiList[nakIdx]) : '—';
                            // Paya based on Moon rashi
                            const payaMap: Record<string, string> = {
                              Aries: 'Gold', Taurus: 'Silver', Gemini: 'Copper', Cancer: 'Iron',
                              Leo: 'Gold', Virgo: 'Silver', Libra: 'Copper', Scorpio: 'Iron',
                              Sagittarius: 'Gold', Capricorn: 'Silver', Aquarius: 'Copper', Pisces: 'Iron'
                            };

                            return (<>
                              <tr><td className="font-bold" style={{ color: 'var(--text-muted)', width: '40%' }}>Varna</td><td style={{ color: 'var(--text-primary)' }}>{varna}</td></tr>
                              <tr><td className="font-bold" style={{ color: 'var(--text-muted)' }}>Vashya</td><td style={{ color: 'var(--text-primary)' }}>{vashyaMap[moonRashi] || '—'}</td></tr>
                              <tr><td className="font-bold" style={{ color: 'var(--text-muted)' }}>Yoni</td><td style={{ color: 'var(--text-primary)' }}>{yoni}</td></tr>
                              <tr><td className="font-bold" style={{ color: 'var(--text-muted)' }}>Gan</td><td style={{ color: 'var(--text-primary)' }}>{gan}</td></tr>
                              <tr><td className="font-bold" style={{ color: 'var(--text-muted)' }}>Nadi</td><td style={{ color: 'var(--text-primary)' }}>{nadi}</td></tr>
                              <tr><td className="font-bold" style={{ color: 'var(--text-muted)' }}>Moon Sign (Rashi)</td><td className="font-bold" style={{ color: 'var(--primary)' }}>{moonRashi}</td></tr>
                              <tr><td className="font-bold" style={{ color: 'var(--text-muted)' }}>Sign Lord</td><td style={{ color: 'var(--text-primary)' }}>{signLords[moonRashi] || '—'}</td></tr>
                              <tr><td className="font-bold" style={{ color: 'var(--text-muted)' }}>Nakshatra-Charan</td><td style={{ color: 'var(--text-primary)' }}>{moonNak} - {moonPada}</td></tr>
                              <tr><td className="font-bold" style={{ color: 'var(--text-muted)' }}>Tatva</td><td style={{ color: 'var(--text-primary)' }}>{tatvaMap[moonRashi] || '—'}</td></tr>
                              <tr><td className="font-bold" style={{ color: 'var(--text-muted)' }}>Paya</td><td style={{ color: 'var(--text-primary)' }}>{payaMap[moonRashi] || '—'}</td></tr>
                            </>);
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* KUNDLI TAB */}
              {activeTab === 'Kundli' && (
                <div className="space-y-10 animate-fadeIn">
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="flex flex-col items-center space-y-4">
                      <h3 className="text-lg font-bold" style={{ color: 'var(--primary)' }}>Lagna / Ascendant Chart</h3>
                      <div className="p-3 rounded-xl border" style={{ background: '#ffffff', borderColor: 'var(--border)' }}>
                        <KundliChart houses={kundliData.mappedHouses} width={380} height={380} />
                      </div>
                    </div>
                    <div className="flex flex-col items-center space-y-4">
                      <h3 className="text-lg font-bold" style={{ color: 'var(--primary)' }}>Navamsa (D9) Chart</h3>
                      <div className="p-3 rounded-xl border" style={{ background: '#ffffff', borderColor: 'var(--border)' }}>
                        <KundliChart houses={kundliData.mappedHouses.map((h:any) => ({...h, rashi: (h.rashi + 3) % 12}))} width={380} height={380} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                      <span>🪐</span> Planetary Positions
                    </h3>
                    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border-light)' }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Planet</th><th>Sign</th><th>Degree</th><th>Retro</th><th>Dignity</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="font-bold">Ascendant</td>
                            <td>{kundliData.ascendant?.rashiName || '—'}</td>
                            <td>{kundliData.ascendant?.degree != null ? `${Math.floor(kundliData.ascendant.degree)}°${Math.floor((kundliData.ascendant.degree % 1) * 60)}'` : '—'}</td>
                            <td style={{ color: 'var(--text-muted)' }}>—</td>
                            <td style={{ color: 'var(--text-muted)' }}>—</td>
                          </tr>
                          {pData?.planetaryPositions && Object.entries(pData.planetaryPositions).map(([key, pos]: [string, any]) => {
                            const name = key.charAt(0).toUpperCase() + key.slice(1);
                            const deg = pos.degree != null ? pos.degree : pos.longitude % 30;
                            const degInt = Math.floor(deg);
                            const minInt = Math.floor((deg - degInt) * 60);
                            const secInt = Math.floor(((deg - degInt) * 60 - minInt) * 60);
                            const dignityColors: Record<string, string> = {
                              'exalted': 'var(--success)', 'debilitated': 'var(--danger)',
                              'own': 'var(--primary)', 'neutral': 'var(--text-muted)',
                            };
                            return (
                              <tr key={key}>
                                <td className="font-bold">{name}</td>
                                <td>{pos.rashiName || '—'}</td>
                                <td>{degInt}°{minInt}&apos;{secInt}&quot;</td>
                                <td>
                                  {pos.isRetrograde ? (
                                    <span className="badge badge-gold text-[10px]">↺ Retro</span>
                                  ) : (
                                    <span style={{ color: 'var(--text-muted)' }}>Direct</span>
                                  )}
                                </td>
                                <td>
                                  <span className="text-xs font-bold capitalize" style={{ color: dignityColors[pos.dignity] || 'var(--text-muted)' }}>
                                    {pos.dignity || '—'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="card-warm p-6 rounded-xl space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                      <span>🕉️</span> Vimshottari Dasha (Mahadasha Overview)
                    </h3>
                    {dashaData ? (
                      <div className="space-y-4">
                        {/* Current period highlight */}
                        <div className="p-4 rounded-xl flex items-center gap-4" style={{ background: 'var(--primary-lighter)', border: '1px solid var(--border)' }}>
                          {(() => { const am = getActualCurrentMahadasha(dashaData); return (<>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black" style={{ background: planetColors[am?.planet || ''] || 'var(--primary)' }}>
                            {am?.planet?.substring(0, 2)}
                          </div>
                          <div>
                            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Current Mahadasha</div>
                            <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                              {am?.planet} — ends {formatDate(am?.endTime)}
                            </div>
                          </div>
                          </>); })()}
                        </div>
                        {/* Mini timeline bar */}
                        <div className="flex rounded-lg overflow-hidden h-8" style={{ border: '1px solid var(--border-light)' }}>
                          {dashaData.fullCycle?.map((period: any, i: number) => {
                            const years = planetYears[period.planet] || 7;
                            const widthPct = (years / 120) * 100;
                            const isCurrent = isCurrentPeriod(period.startTime, period.endTime);
                            return (
                              <div
                                key={i}
                                className="flex items-center justify-center text-[9px] text-white font-bold relative"
                                style={{
                                  width: `${widthPct}%`,
                                  background: planetColors[period.planet] || '#666',
                                  opacity: isCurrent ? 1 : 0.6,
                                  borderRight: '1px solid rgba(255,255,255,0.3)',
                                }}
                                title={`${period.planet}: ${formatDate(period.startTime)} – ${formatDate(period.endTime)}`}
                              >
                                {years >= 10 ? period.planet.substring(0, 3) : period.planet.substring(0, 2)}
                                {isCurrent && <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full" />}
                              </div>
                            );
                          })}
                        </div>
                        <div className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                          Birth Nakshatra: <strong style={{ color: 'var(--text-primary)' }}>{dashaData.birthNakshatra}</strong> (Pada {dashaData.nakshatraPada}) &nbsp;•&nbsp; Balance: {dashaData.dashaBalance}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Dasha data not available for this chart.</p>
                    )}
                  </div>
                </div>
              )}

              {/* KP TAB */}
              {activeTab === 'KP' && (
                <div className="space-y-8 text-center animate-fadeIn">
                  <h3 className="text-xl font-bold" style={{ color: 'var(--primary)' }}>Krishnamurti Paddhati (KP) System</h3>
                  <div className="inline-block p-3 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
                    <KundliChart houses={kundliData.mappedHouses} width={380} height={380} />
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>KP Cuspal charts, Ruling Planets, and Significators are derived from precise sub-lord analysis.</p>
                </div>
              )}

              {/* ASHTAKVARGA TAB */}
              {activeTab === 'Ashtakvarga' && (
                <div className="space-y-8 animate-fadeIn">
                  <h3 className="text-xl font-bold text-center" style={{ color: 'var(--primary)' }}>Ashtakvarga (Binnashtakvarga)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                     {['SAV', 'Ascendant', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].map((planet) => (
                       <div key={planet} className="card p-4 flex flex-col items-center space-y-3">
                         <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{planet}</h4>
                         <KundliChart houses={kundliData.mappedHouses} width={220} height={220} />
                       </div>
                     ))}
                  </div>
                </div>
              )}

              {/* CHARTS TAB */}
              {activeTab === 'Charts' && (
                <div className="space-y-8 text-center animate-fadeIn">
                  <h3 className="text-xl font-bold" style={{ color: 'var(--primary)' }}>Divisional Charts (Vargas)</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>From D1 to D60, explore all microscopic aspects of life.</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    {['Hora (D2)', 'Drekkana (D3)', 'Chaturthamsa (D4)', 'Saptamsa (D7)', 'Dasamsa (D10)', 'Dwadasamsa (D12)', 'Shodasamsa (D16)', 'Trimsamsa (D30)'].map(chartName => (
                       <div key={chartName} className="card p-3 flex flex-col items-center space-y-2">
                         <h4 className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{chartName}</h4>
                         <KundliChart houses={kundliData.mappedHouses} width={180} height={180} />
                       </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DASHA TAB */}
              {activeTab === 'Dasha' && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold" style={{ color: 'var(--primary)' }}>Vimshottari Dasha Timeline</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Complete 120-year Mahadasha cycle based on Moon&apos;s position at birth</p>
                  </div>

                  {dashaData ? (
                    <div className="space-y-6">
                      {/* Summary Cards */}
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="card p-5 text-center space-y-2" style={{ background: 'var(--primary-lighter)' }}>
                          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Birth Nakshatra</div>
                          <div className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>{dashaData.birthNakshatra}</div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Pada {dashaData.nakshatraPada}</div>
                        </div>
                        <div className="card p-5 text-center space-y-2" style={{ background: '#fff8e1' }}>
                          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: '#f57f17' }}>Current Mahadasha</div>
                          <div className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>{getActualCurrentMahadasha(dashaData)?.planet}</div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Until {formatDate(getActualCurrentMahadasha(dashaData)?.endTime)}</div>
                        </div>
                        <div className="card p-5 text-center space-y-2" style={{ background: '#e8f5e9' }}>
                          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--success)' }}>Balance at Birth</div>
                          <div className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>{dashaData.dashaBalance}</div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Remaining in first dasha</div>
                        </div>
                      </div>

                      {/* Visual Timeline Bar */}
                      <div className="card p-6 space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>120-Year Cycle Timeline</h4>
                        <div className="flex rounded-xl overflow-hidden h-12" style={{ border: '1px solid var(--border)' }}>
                          {dashaData.fullCycle?.map((period: any, i: number) => {
                            const years = planetYears[period.planet] || 7;
                            const widthPct = (years / 120) * 100;
                            const isCurrent = isCurrentPeriod(period.startTime, period.endTime);
                            return (
                              <div
                                key={i}
                                className="flex flex-col items-center justify-center text-white relative transition-all"
                                style={{
                                  width: `${widthPct}%`,
                                  background: planetColors[period.planet] || '#666',
                                  opacity: isCurrent ? 1 : 0.55,
                                  borderRight: '1px solid rgba(255,255,255,0.2)',
                                  boxShadow: isCurrent ? 'inset 0 0 0 2px rgba(255,255,255,0.5)' : 'none',
                                }}
                                title={`${period.planet}: ${formatDate(period.startTime)} – ${formatDate(period.endTime)} (${years} yrs)`}
                              >
                                <span className="text-[10px] font-black">{period.planet.substring(0, 3)}</span>
                                <span className="text-[8px] opacity-80">{years}y</span>
                                {isCurrent && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent" style={{ borderTopColor: planetColors[period.planet] }} />}
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex flex-wrap gap-3 justify-center">
                          {Object.entries(planetColors).map(([planet, color]) => (
                            <div key={planet} className="flex items-center gap-1.5">
                              <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
                              <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>{planet}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Detailed Table */}
                      <div className="card p-6 space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Mahadasha Periods</h4>
                        <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border-light)' }}>
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Planet</th>
                                <th>Period (Years)</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dashaData.fullCycle?.map((period: any, i: number) => {
                                const isCurrent = isCurrentPeriod(period.startTime, period.endTime);
                                const isPast = new Date(period.endTime) < new Date();
                                const isExpanded = selectedMaha === i;
                                const antardashas = isExpanded ? getAntardashas(period.planet, period.startTime) : [];
                                
                                return (
                                  <React.Fragment key={i}>
                                    <tr 
                                      onClick={() => setSelectedMaha(isExpanded ? null : i)}
                                      className="cursor-pointer transition-colors hover:bg-orange-50"
                                      style={{ background: isCurrent ? 'var(--primary-lighter)' : isExpanded ? '#fff8e1' : 'transparent' }}
                                    >
                                      <td>
                                        <div className="flex items-center gap-2">
                                          <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                                          <div className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[10px] font-black" style={{ background: planetColors[period.planet] || '#666' }}>
                                            {period.planet.substring(0, 2)}
                                          </div>
                                          <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{period.planet}</span>
                                        </div>
                                      </td>
                                      <td className="font-bold">{planetYears[period.planet] || '—'} years</td>
                                      <td>{formatDate(period.startTime)}</td>
                                      <td>{formatDate(period.endTime)}</td>
                                      <td>
                                        {isCurrent ? (
                                          <span className="badge badge-success">Active</span>
                                        ) : isPast ? (
                                          <span className="badge" style={{ background: '#f5f5f5', color: 'var(--text-muted)' }}>Completed</span>
                                        ) : (
                                          <span className="badge badge-gold">Upcoming</span>
                                        )}
                                      </td>
                                    </tr>
                                    {isExpanded && (
                                      <tr>
                                        <td colSpan={5} className="p-0 border-b border-orange-100">
                                          <div className="p-4 bg-orange-50/50">
                                            <h5 className="text-xs font-bold text-orange-600 mb-3 ml-2">Antardashas of {period.planet}</h5>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                              {antardashas.map((antar: any, j: number) => {
                                                const antarCurrent = isCurrentPeriod(antar.startTime, antar.endTime);
                                                return (
                                                  <div key={j} className={`p-2 rounded-lg border text-xs flex justify-between items-center ${antarCurrent ? 'bg-orange-100 border-orange-300 shadow-sm' : 'bg-white border-gray-200'}`}>
                                                    <div className="flex items-center gap-1.5">
                                                      <div className="w-2 h-2 rounded-full" style={{ background: planetColors[antar.planet] }} />
                                                      <span className="font-bold text-gray-700">{antar.planet}</span>
                                                    </div>
                                                    <div className="text-gray-500 text-[10px]">
                                                      {formatDate(antar.startTime)} - {formatDate(antar.endTime)}
                                                    </div>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Current Antardasha */}
                      {dashaData.currentAntardasha && (
                        <div className="card p-6 space-y-3" style={{ background: 'linear-gradient(135deg, var(--primary-lighter), #fff8e1)' }}>
                          <h4 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Current Sub-Period (Antardasha)</h4>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-black" style={{ background: planetColors[dashaData.currentAntardasha.planet] || 'var(--primary)' }}>
                              {dashaData.currentAntardasha.planet.substring(0, 2)}
                            </div>
                            <div>
                              <div className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                                {getActualCurrentMahadasha(dashaData)?.planet} / {dashaData.currentAntardasha.planet}
                              </div>
                              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                Antardasha of {dashaData.currentAntardasha.planet} within {getActualCurrentMahadasha(dashaData)?.planet} Mahadasha — ends {formatDate(dashaData.currentAntardasha.endTime)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Explanatory Note */}
                      <div className="p-5 rounded-xl border-l-4" style={{ background: 'var(--primary-lighter)', borderColor: 'var(--primary)' }}>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          <strong>About Vimshottari Dasha:</strong> This is the most widely used Dasha system in Vedic Astrology. Based on the Moon&apos;s Nakshatra at birth ({dashaData.birthNakshatra}), the 120-year cycle is divided among 9 planets. Each Mahadasha is further divided into Antardashas (sub-periods), Pratyantardashas, and so on.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16 space-y-4">
                      <div className="text-4xl">🕉️</div>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Dasha data could not be calculated for this chart.</p>
                    </div>
                  )}
                </div>
              )}

              {/* FREE REPORT TAB */}
              {activeTab === 'Free Report' && (() => {
                const asc = kundliData?.ascendant;
                const moon = kundliData?.moonDetails;
                const planets = pData?.planetaryPositions || kundliData?.planets || {};
                const actualMaha = getActualCurrentMahadasha(dashaData);
                const lagnaText = generateLagnaAnalysis(asc?.rashiName || '');
                const moonText = generateMoonAnalysis(moon?.rashiName || '', moon?.nakshatra || '', moon?.pada);
                const planetTexts = generatePlanetAnalysis(planets);
                const dashaText = generateDashaAnalysis(dashaData);

                const handleDownload = () => {
                  downloadPDFReport(formData, kundliData, pData, dashaData);
                };

                return (
                  <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
                    {/* Header + Download */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <h3 className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>Astrological Analysis</h3>
                      <button onClick={handleDownload} className="btn-primary text-sm flex items-center gap-2">
                        <span>📄</span> Download PDF Report
                      </button>
                    </div>

                    {/* Summary Card */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: 'Lagna', value: asc?.rashiName || '—', icon: '🏠' },
                        { label: 'Moon Sign', value: moon?.rashiName || '—', icon: '🌙' },
                        { label: 'Nakshatra', value: moon?.nakshatra || '—', icon: '⭐' },
                        { label: 'Mahadasha', value: actualMaha?.planet || '—', icon: '🕉️' },
                      ].map(item => (
                        <div key={item.label} className="card p-4 text-center space-y-1">
                          <div className="text-xl">{item.icon}</div>
                          <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{item.label}</div>
                          <div className="text-sm font-black" style={{ color: 'var(--primary)' }}>{item.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Lagna Analysis */}
                    <div className="space-y-3">
                      <h4 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <span>🏠</span> Lagna (Ascendant) Analysis
                      </h4>
                      <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        {lagnaText}
                      </p>
                    </div>

                    {/* Moon Analysis */}
                    <div className="space-y-3">
                      <h4 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <span>🌙</span> Moon (Chandra) Analysis
                      </h4>
                      <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        {moonText}
                      </p>
                    </div>

                    <hr className="divider-saffron mx-auto" />

                    {/* Per-Planet Analysis */}
                    <div className="space-y-6">
                      <h4 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <span>🪐</span> Planetary Influence Analysis
                      </h4>
                      {planetTexts.map((text, i) => {
                        // Parse bold markers **text** for rendering
                        const parts = text.split(/\*\*(.*?)\*\*/g);
                        return (
                          <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                            {parts.map((part, j) =>
                              j % 2 === 1
                                ? <strong key={j} style={{ color: 'var(--primary)' }}>{part}</strong>
                                : <span key={j}>{part}</span>
                            )}
                          </p>
                        );
                      })}
                    </div>

                    {/* Dasha Analysis */}
                    {dashaText && (
                      <div className="space-y-3">
                        <h4 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                          <span>🕉️</span> Current Dasha Period
                        </h4>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                          {dashaText.split(/\*\*(.*?)\*\*/g).map((part, j) =>
                            j % 2 === 1
                              ? <strong key={j} style={{ color: 'var(--primary)' }}>{part}</strong>
                              : <span key={j}>{part}</span>
                          )}
                        </p>
                      </div>
                    )}

                    {/* Wisdom Quote */}
                    <div className="p-6 rounded-xl border-l-4" style={{ background: 'var(--primary-lighter)', borderColor: 'var(--primary)' }}>
                      <p className="text-sm italic font-medium" style={{ color: 'var(--text-secondary)' }}>
                        &quot;The stars impel, they do not compel. Awareness of these cosmic influences allows you to navigate your karma with wisdom and grace.&quot;
                      </p>
                    </div>

                    {/* Download CTA */}
                    <div className="card p-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ background: 'linear-gradient(135deg, var(--primary-lighter), #fff8e1)' }}>
                      <div>
                        <h4 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Save this report for future reference</h4>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Download includes birth details, planetary positions, dasha periods, and full analysis</p>
                      </div>
                      <button onClick={handleDownload} className="btn-primary shrink-0 flex items-center gap-2">
                        <span>📄</span> Download Full PDF Report
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
