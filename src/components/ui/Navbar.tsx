'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';
import logoImage from '@/assets/site-essentials/Vidyamruta.svg';
import sitelogo from '@/assets/site-essentials/Site-favicon.svg';

const toolLinks = [
  { href: '/kundli', label: 'Kundli' },
  { href: '/horoscope', label: 'Horoscope' },
  { href: '/matching', label: 'Matching' },
  { href: '/panchang', label: 'Panchang' },
];

const consultingLinks = [
  { href: '/vastu', label: 'Vastu Consultation' },
  { href: '/consultations', label: 'Normal Consultation' },
];

const protectedLinks = [
  { href: '/dashboard', label: 'Dashboard' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
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
    router.push('/');
    router.refresh();
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''} sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-decoration-none">
            <span className="text-2xl">
              <Image
                src={sitelogo}
                alt="Vidyamruta Logo"
                width={50}
                height={50}
                priority
              />
            </span>
            <span className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--primary)' }}>
              <Image
                src={logoImage}
                alt="Vidyamruta Logo"
                width={150}
                height={50}
                priority
              />
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
              Home
            </Link>

            {/* Services Dropdown */}
            <div className="relative group">
              <button className="nav-link flex items-center gap-1 py-2">
                Services
                <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div className="absolute left-0 mt-0 w-48 bg-white border border-gray-100 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  {toolLinks.map(link => (
                    <Link key={link.href} href={link.href} className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Consulting Dropdown */}
            <div className="relative group">
              <button className="nav-link flex items-center gap-1 py-2">
                Consulting
                <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div className="absolute left-0 mt-0 w-56 bg-white border border-gray-100 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  {consultingLinks.map(link => (
                    <Link key={link.href} href={link.href} className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Protected Links */}
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
          <div className="md:hidden py-4 border-t animate-slideDown max-h-[80vh] overflow-y-auto" style={{ borderColor: 'var(--border-light)' }}>
            <div className="flex flex-col gap-2">
              <Link href="/" onClick={() => setMenuOpen(false)} className="nav-link px-2 font-bold">Home</Link>

              <div className="px-2 pt-2 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Services</div>
              {toolLinks.map(link => (
                <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="nav-link pl-6 py-1 text-sm text-gray-600">
                  {link.label}
                </Link>
              ))}

              <div className="px-2 pt-3 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Consulting</div>
              {consultingLinks.map(link => (
                <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="nav-link pl-6 py-1 text-sm text-gray-600">
                  {link.label}
                </Link>
              ))}

              {user && (
                <>
                  <div className="px-2 pt-3 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Account</div>
                  {protectedLinks.map(link => (
                    <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="nav-link pl-6 py-1 text-sm text-gray-600">
                      {link.label}
                    </Link>
                  ))}
                </>
              )}

              <div className="pt-4 mt-2 border-t flex gap-2" style={{ borderColor: 'var(--border-light)' }}>
                {user ? (
                  <button onClick={handleLogout} className="btn-ghost w-full text-sm py-2">Logout</button>
                ) : (
                  <>
                    <Link href="/login" className="btn-ghost flex-1 text-sm text-center py-2" onClick={() => setMenuOpen(false)}>Sign In</Link>
                    <Link href="/register" className="btn-primary flex-1 text-sm text-center py-2" onClick={() => setMenuOpen(false)}>Get Started</Link>
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