"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

function RegisterForm() {
  const searchParams = useSearchParams();
  const isAstrologer = searchParams.get('role') === 'astrologer';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState<'user' | 'astrologer'>(isAstrologer ? 'astrologer' : 'user');

  // Astrologer-specific fields
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');
  const [offersVastu, setOffersVastu] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // 1. Sign up the user in Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: accountType,
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // 2. Create base user profile (Removed 'role' as it doesn't exist in the schema)
      const { error: profileError } = await supabase.from('user_profiles').insert({
        id: data.user.id,
        full_name: name,
      });

      if (profileError) {
        console.error("Profile Error:", profileError);
        setError(`Failed to create user profile: ${profileError.message}`);
        setLoading(false);
        return;
      }

      // 3. If astrologer, create the astrologer profile
      if (accountType === 'astrologer') {
        const { error: astroError } = await supabase.from('astrologer_profiles').insert({
          user_id: data.user.id,
          display_name: name,
          specializations: specialization ? specialization.split(',').map(s => s.trim()) : [],
          experience_years: parseInt(experience) || 0,
          bio: bio,
          offers_vastu: offersVastu,
        });

        if (astroError) {
          console.error("Astrologer Profile Error:", astroError);
          setError(`Failed to create astrologer profile: ${astroError.message}`);
          setLoading(false);
          return;
        }
      }

      setMessage('Registration successful! Check your email to verify your account.');
    }
    setLoading(false);
  };

  const handleOAuth = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <main style={{ background: 'var(--surface)' }} className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="text-4xl mb-2">{accountType === 'astrologer' ? '🧘' : '🙏'}</div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
            {accountType === 'astrologer' ? 'Join as Astrologer' : 'Create Account'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {accountType === 'astrologer'
              ? 'Register to offer consultations on Vidyamruta'
              : 'Sign up to save Kundlis and book consultations'}
          </p>
        </div>

        {/* Account Type Toggle */}
        <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
          <button
            type="button"
            onClick={() => setAccountType('user')}
            className="flex-1 py-3 text-sm font-bold transition-all"
            style={{
              background: accountType === 'user' ? 'var(--primary)' : '#ffffff',
              color: accountType === 'user' ? '#ffffff' : 'var(--text-muted)',
            }}
          >
            👤 User Account
          </button>
          <button
            type="button"
            onClick={() => setAccountType('astrologer')}
            className="flex-1 py-3 text-sm font-bold transition-all"
            style={{
              background: accountType === 'astrologer' ? 'var(--primary)' : '#ffffff',
              color: accountType === 'astrologer' ? '#ffffff' : 'var(--text-muted)',
            }}
          >
            🧘 Astrologer Account
          </button>
        </div>

        <div className="card p-8">
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="input-label text-sm text-gray-600">Full Name</label>
              <input type="text" className="input-field w-full mt-1 border rounded p-2" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="input-label text-sm text-gray-600">Email</label>
              <input type="email" className="input-field w-full mt-1 border rounded p-2" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="input-label text-sm text-gray-600">Password</label>
              <input type="password" className="input-field w-full mt-1 border rounded p-2" placeholder="Minimum 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>

            {/* Astrologer-specific fields */}
            {accountType === 'astrologer' && (
              <div className="space-y-5 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
                <div className="text-xs font-bold uppercase tracking-wider text-orange-500">Astrologer Details</div>
                <div>
                  <label className="input-label text-sm text-gray-600">Specializations</label>
                  <input type="text" className="input-field w-full mt-1 border rounded p-2" placeholder="e.g., Vedic, KP, Lal Kitab (comma-separated)" value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
                </div>
                <div>
                  <label className="input-label text-sm text-gray-600">Years of Experience</label>
                  <input type="number" className="input-field w-full mt-1 border rounded p-2" placeholder="e.g., 5" value={experience} onChange={(e) => setExperience(e.target.value)} min="0" />
                </div>
                <div>
                  <label className="input-label text-sm text-gray-600">Short Bio</label>
                  <textarea
                    className="input-field w-full mt-1 border rounded p-2"
                    rows={3}
                    placeholder="Tell users about your expertise and approach..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    id="offersVastu"
                    checked={offersVastu}
                    onChange={(e) => setOffersVastu(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <label htmlFor="offersVastu" className="text-sm font-medium text-gray-700">
                    I also offer Vastu Consultation
                  </label>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg text-sm font-bold flex items-center gap-2 bg-red-50 text-red-600 border border-red-200">
                <span>⚠️</span> {error}
              </div>
            )}
            {message && (
              <div className="p-3 rounded-lg text-sm font-bold flex items-center gap-2 bg-green-50 text-green-600 border border-green-200">
                <span>✅</span> {message}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2 bg-blue-600 text-white rounded font-bold disabled:opacity-50">
              {loading ? '⏳ Creating Account...' : accountType === 'astrologer' ? '🧘 Register as Astrologer' : '📜 Create Free Account'}
            </button>

            <div className="flex items-center gap-3 my-4">
              <hr className="flex-1 border-t border-gray-200" />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">OR</span>
              <hr className="flex-1 border-t border-gray-200" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                disabled={loading}
                className="btn-secondary py-3 flex justify-center items-center gap-2 border border-gray-300 rounded bg-white text-gray-600"
              >
                <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={20} height={20} unoptimized />
                <span className="text-sm">Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleOAuth('facebook')}
                disabled={loading}
                className="btn-secondary py-3 flex justify-center items-center gap-2 border border-blue-600 rounded bg-blue-600 text-white"
              >
                <Image src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" width={20} height={20} className="brightness-0 invert" unoptimized />
                <span className="text-sm">Facebook</span>
              </button>
            </div>
          </form>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-blue-600 hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterForm />
    </React.Suspense>
  );
}