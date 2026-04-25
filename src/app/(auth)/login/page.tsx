"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <main style={{ background: 'var(--surface)' }} className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="text-4xl mb-2">🙏</div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Welcome Back</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sign in to access your saved Kundlis and consultations</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="input-label">Email</label>
              <input 
                type="email" 
                className="input-field"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div>
              <label className="input-label">Password</label>
              <input 
                type="password" 
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            {error && (
              <div className="p-3 rounded-lg text-sm font-bold flex items-center gap-2" style={{ background: '#ffebee', color: 'var(--danger)', border: '1px solid #ef9a9a' }}>
                <span>⚠️</span> {error}
              </div>
            )}
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full py-3 disabled:opacity-50"
            >
              {loading ? '⏳ Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <div className="text-center space-y-3">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-bold hover:underline" style={{ color: 'var(--primary)' }}>Create Account</Link>
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Are you an astrologer?{' '}
            <Link href="/register?role=astrologer" className="font-bold hover:underline" style={{ color: 'var(--accent)' }}>Join as Consultant</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
