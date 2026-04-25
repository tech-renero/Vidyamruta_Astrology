import Link from 'next/link';

const footerLinks = {
  'Services': [
    { href: '/kundli', label: 'Kundli Generation' },
    { href: '/horoscope', label: 'Daily Horoscope' },
    { href: '/matching', label: 'Kundli Matching' },
    { href: '/panchang', label: 'Daily Panchang' },
  ],
  'Company': [
    { href: '/consultations', label: 'Book Consultation' },
    { href: '/register?role=astrologer', label: 'Join as Astrologer' },
    { href: '#', label: 'About Us' },
    { href: '#', label: 'Contact' },
  ],
  'Resources': [
    { href: '/horoscope', label: 'Vedic Astrology Guide' },
    { href: '#', label: 'Nakshatra Guide' },
    { href: '#', label: 'Dasha Explained' },
    { href: '#', label: 'Remedies' },
  ],
};

export default function Footer() {
  return (
    <footer className="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🙏</span>
              <span className="text-xl font-extrabold" style={{ color: 'var(--primary)' }}>Vidyamruta</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Unveil the cosmic blueprint of your destiny with authentic Vedic Astrology. Precise calculations, ancient wisdom, modern interface.
            </p>
            <div className="flex gap-3 pt-2">
              <span className="w-9 h-9 rounded-full flex items-center justify-center text-sm cursor-pointer transition-all hover:scale-110" style={{ background: 'var(--primary-lighter)', color: 'var(--primary)' }}>𝕏</span>
              <span className="w-9 h-9 rounded-full flex items-center justify-center text-sm cursor-pointer transition-all hover:scale-110" style={{ background: 'var(--primary-lighter)', color: 'var(--primary)' }}>📷</span>
              <span className="w-9 h-9 rounded-full flex items-center justify-center text-sm cursor-pointer transition-all hover:scale-110" style={{ background: 'var(--primary-lighter)', color: 'var(--primary)' }}>📘</span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-primary)' }}>{title}</h4>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm transition-colors hover:underline" style={{ color: 'var(--text-secondary)' }}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4" style={{ borderTop: '1px solid var(--border-light)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} Vidyamruta. All rights reserved. Powered by Vedic Wisdom.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs hover:underline" style={{ color: 'var(--text-muted)' }}>Privacy Policy</Link>
            <Link href="#" className="text-xs hover:underline" style={{ color: 'var(--text-muted)' }}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
