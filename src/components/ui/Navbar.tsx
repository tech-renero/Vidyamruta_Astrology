'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { createClient } from '@/utils/supabase/client';

const publicLinks = [
  { href: '/', label: 'Home' },
  { href: '/kundli', label: 'Kundli' },
  { href: '/horoscope', label: 'Horoscope' },
  { href: '/matching', label: 'Matching' },
  { href: '/panchang', label: 'Panchang' },
];

const protectedLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/consultations', label: 'Consultations' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-decoration-none">
            <span className="text-2xl">🙏</span>
            <span className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--primary)' }}>
              Vidyamruta
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {publicLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${pathname === link.href ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
            {user && protectedLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${pathname === link.href ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="w-24 h-9 skeleton" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, var(--primary), var(--saffron))' }}>
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </Link>
                <button onClick={handleLogout} className="btn-ghost text-xs py-1.5 px-3">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn-ghost text-xs py-2 px-4">
                  Sign In
                </Link>
                <Link href="/register" className="btn-primary text-xs py-2 px-4" style={{ fontSize: '13px' }}>
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t animate-slideDown" style={{ borderColor: 'var(--border-light)' }}>
            <div className="flex flex-col gap-1">
              {publicLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`nav-link ${pathname === link.href ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
              {user && protectedLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`nav-link ${pathname === link.href ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 mt-2 border-t flex gap-2" style={{ borderColor: 'var(--border-light)' }}>
                {user ? (
                  <button onClick={handleLogout} className="btn-ghost w-full text-sm">Logout</button>
                ) : (
                  <>
                    <Link href="/login" className="btn-ghost flex-1 text-sm text-center" onClick={() => setMenuOpen(false)}>Sign In</Link>
                    <Link href="/register" className="btn-primary flex-1 text-sm text-center" onClick={() => setMenuOpen(false)}>Get Started</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
