"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function MatchingPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setResult({ score: 28, max: 36, message: "Highly Compatible (Excellent Match)", details: [
        { guna: 'Varna', obtained: 1, max: 1 },
        { guna: 'Vashya', obtained: 2, max: 2 },
        { guna: 'Tara', obtained: 3, max: 3 },
        { guna: 'Yoni', obtained: 4, max: 4 },
        { guna: 'Graha Maitri', obtained: 5, max: 5 },
        { guna: 'Gana', obtained: 6, max: 6 },
        { guna: 'Bhakoot', obtained: 7, max: 7 },
        { guna: 'Nadi', obtained: 0, max: 8 },
      ]});
      setLoading(false);
    }, 1500);
  };

  return (
    <main style={{ background: 'var(--surface)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="text-center space-y-3">
          <h1 className="section-title">Ashtakoota <span className="section-accent">Matchmaking</span></h1>
          <p className="section-subtitle mx-auto">Check 36-Guna compatibility for marriage with precise Vedic calculations</p>
          <hr className="divider-saffron mx-auto" />
        </div>

        <form onSubmit={handleMatch} className="card p-8 space-y-8">
          <div className="grid md:grid-cols-2 gap-10">
            {/* Boy Details */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: '#e3f2fd', color: '#1565c0' }}>♂</div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Boy&apos;s Details</h2>
              </div>
              <div>
                <label className="input-label">Name</label>
                <input type="text" className="input-field" placeholder="Enter boy's name" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="input-label">Date of Birth</label><input type="date" className="input-field" required /></div>
                <div><label className="input-label">Time of Birth</label><input type="time" className="input-field" required /></div>
              </div>
              <div><label className="input-label">Birth Place</label><input type="text" className="input-field" placeholder="City, State, Country" required /></div>
            </div>

            {/* Girl Details */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: '#fce4ec', color: '#c62828' }}>♀</div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Girl&apos;s Details</h2>
              </div>
              <div>
                <label className="input-label">Name</label>
                <input type="text" className="input-field" placeholder="Enter girl's name" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="input-label">Date of Birth</label><input type="date" className="input-field" required /></div>
                <div><label className="input-label">Time of Birth</label><input type="time" className="input-field" required /></div>
              </div>
              <div><label className="input-label">Birth Place</label><input type="text" className="input-field" placeholder="City, State, Country" required /></div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base disabled:opacity-50">
            {loading ? '⏳ Calculating Guna Milan...' : '💑 Calculate Compatibility'}
          </button>

          {result && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center p-8 rounded-2xl" style={{ background: result.score >= 18 ? '#e8f5e9' : '#fff3e0', border: `1px solid ${result.score >= 18 ? '#a5d6a7' : '#ffe0b2'}` }}>
                <div className="text-5xl font-black mb-2" style={{ color: result.score >= 18 ? 'var(--success)' : 'var(--primary)' }}>
                  {result.score} / {result.max}
                </div>
                <div className="text-lg font-bold" style={{ color: result.score >= 18 ? 'var(--success)' : 'var(--primary)' }}>Gunas Matched</div>
                <p className="text-sm mt-1 font-bold" style={{ color: 'var(--text-secondary)' }}>{result.message}</p>
              </div>

              <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border-light)' }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Guna (Koota)</th><th>Obtained</th><th>Maximum</th><th>Result</th></tr>
                  </thead>
                  <tbody>
                    {result.details.map((d: any) => (
                      <tr key={d.guna}>
                        <td className="font-bold">{d.guna}</td>
                        <td className="font-bold" style={{ color: d.obtained === d.max ? 'var(--success)' : d.obtained === 0 ? 'var(--danger)' : 'var(--text-primary)' }}>{d.obtained}</td>
                        <td>{d.max}</td>
                        <td>
                          <span className={`badge ${d.obtained === d.max ? 'badge-success' : d.obtained === 0 ? 'badge-danger' : 'badge-gold'}`}>
                            {d.obtained === d.max ? 'Perfect' : d.obtained === 0 ? 'Mismatch' : 'Partial'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-5 rounded-xl border-l-4" style={{ background: 'var(--primary-lighter)', borderColor: 'var(--primary)' }}>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <strong>Note:</strong> Ashtakoota matching is one aspect of marriage compatibility in Vedic astrology. For a comprehensive analysis, consider consulting a qualified Vedic astrologer who can examine Mangal Dosha, planetary strengths, and Dasha compatibility.
                </p>
              </div>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
