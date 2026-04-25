import Link from 'next/link';
import { zodiacSigns } from '@/lib/horoscope-data';

const features = [
  {
    icon: '📜',
    title: 'Kundli Generation',
    description: 'Generate highly accurate birth charts with precise planetary positions using Swiss Ephemeris calculations. Lagna, Navamsa, and all divisional charts.',
    href: '/kundli',
    color: '#e65100',
  },
  {
    icon: '🔮',
    title: 'Daily Horoscope',
    description: 'Personalized daily predictions for all 12 zodiac signs covering career, love, health, and finance. Powered by authentic Vedic wisdom.',
    href: '/horoscope',
    color: '#f57c00',
  },
  {
    icon: '💑',
    title: 'Kundli Matching',
    description: '36-Guna Ashtakoota compatibility analysis for marriage. Detailed Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, and Nadi scoring.',
    href: '/matching',
    color: '#ff9800',
  },
  {
    icon: '📅',
    title: 'Daily Panchang',
    description: 'Tithi, Nakshatra, Yoga, Karana, and auspicious muhurtas. Complete Rahu Kalam, Yamaganda, and Gulika timings for any location.',
    href: '/panchang',
    color: '#ffc107',
  },
  {
    icon: '🧘',
    title: 'Expert Consultations',
    description: 'Connect with verified Vedic astrologers for personalized guidance via chat, call, or video. Book sessions at your convenience.',
    href: '/consultations',
    color: '#e65100',
  },
  {
    icon: '💾',
    title: 'Save & Track',
    description: 'Every Kundli you generate is automatically saved to your account. Access your charts anytime, track planetary periods, and revisit insights.',
    href: '/register',
    color: '#f57c00',
  },
];

const testimonials = [
  { name: 'Priya Sharma', location: 'Mumbai', text: 'The Kundli generation is incredibly accurate. The planetary positions matched exactly with my pandit ji\'s calculations. Truly impressed!', rating: 5 },
  { name: 'Arjun Patel', location: 'Ahmedabad', text: 'Used the Kundli matching for my sister\'s wedding. The 36-guna analysis was detailed and helped our family make an informed decision.', rating: 5 },
  { name: 'Meera Iyer', location: 'Chennai', text: 'The daily horoscopes are surprisingly insightful. I check them every morning. The consultation with Pandit Rameshwar ji was life-changing.', rating: 4 },
];

const stats = [
  { value: '50K+', label: 'Kundlis Generated' },
  { value: '12K+', label: 'Happy Users' },
  { value: '100+', label: 'Expert Astrologers' },
  { value: '99.9%', label: 'Calculation Accuracy' },
];

export default function Home() {
  return (
    <main>
      {/* ============ HERO SECTION ============ */}
      <section className="hero-bg relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold animate-fadeInUp" style={{ background: 'var(--primary-lighter)', color: 'var(--primary)' }}>
              <span>🪷</span>
              <span>Ancient Wisdom, Modern Precision</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight animate-fadeInUp animate-delay-100">
              <span style={{ color: 'var(--text-primary)' }}>Your Cosmic </span>
              <span style={{ background: 'linear-gradient(135deg, var(--primary), var(--gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Blueprint</span>
              <br />
              <span style={{ color: 'var(--text-primary)' }}>Awaits</span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed animate-fadeInUp animate-delay-200" style={{ color: 'var(--text-secondary)' }}>
              Unveil the secrets of your stars with India&apos;s most precise Vedic Astrology platform. Generate birth charts, explore daily horoscopes, and consult with enlightened guides.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp animate-delay-300">
              <Link href="/kundli" className="btn-primary text-lg px-8 py-4">
                <span>📜</span> Generate Free Kundli
              </Link>
              <Link href="/horoscope" className="btn-secondary text-lg px-8 py-4">
                <span>🔮</span> Today&apos;s Horoscope
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ STATS BAR ============ */}
      <section style={{ background: 'linear-gradient(135deg, var(--primary), var(--saffron))' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {stats.map(stat => (
              <div key={stat.label} className="space-y-1">
                <div className="text-3xl md:text-4xl font-black">{stat.value}</div>
                <div className="text-sm font-medium opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ZODIAC SIGNS GRID ============ */}
      <section style={{ background: 'var(--surface)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14 space-y-4">
            <h2 className="section-title">Daily <span className="section-accent">Horoscope</span></h2>
            <p className="section-subtitle mx-auto">Select your zodiac sign to read today&apos;s cosmic insights</p>
            <hr className="divider-saffron mx-auto" />
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 md:gap-5">
            {zodiacSigns.map((sign, i) => (
              <Link
                key={sign.id}
                href={`/horoscope?sign=${sign.id}`}
                className="zodiac-card animate-fadeInUp"
                style={{ animationDelay: `${i * 60}ms`, opacity: 0 }}
              >
                <div className="zodiac-icon">{sign.symbol}</div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{sign.name}</h3>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{sign.dateRange}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURES SECTION ============ */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14 space-y-4">
            <h2 className="section-title">Everything You <span className="section-accent">Need</span></h2>
            <p className="section-subtitle mx-auto">A complete suite of Vedic Astrology tools, all in one place</p>
            <hr className="divider-saffron mx-auto" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="card-feature group animate-fadeInUp"
                style={{ animationDelay: `${i * 80}ms`, opacity: 0, textDecoration: 'none' }}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{feature.description}</p>
                <div className="mt-4 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: feature.color }}>
                  Explore <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section style={{ background: 'var(--surface-warm)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14 space-y-4">
            <h2 className="section-title">How It <span className="section-accent">Works</span></h2>
            <p className="section-subtitle mx-auto">Three simple steps to unlock your cosmic wisdom</p>
            <hr className="divider-saffron mx-auto" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: '✍️', title: 'Enter Birth Details', desc: 'Provide your date, time, and place of birth for precise calculations.' },
              { step: '02', icon: '⚙️', title: 'AI-Powered Analysis', desc: 'Our Swiss Ephemeris engine calculates exact planetary positions and house placements.' },
              { step: '03', icon: '📊', title: 'Get Detailed Report', desc: 'Receive comprehensive charts, dasha periods, predictions, and personalized remedies.' },
            ].map((item, i) => (
              <div key={item.step} className="text-center space-y-4 animate-fadeInUp" style={{ animationDelay: `${i * 120}ms`, opacity: 0 }}>
                <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-4xl" style={{ background: 'linear-gradient(135deg, var(--primary-lighter), #fff8e1)' }}>
                  {item.icon}
                </div>
                <div className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--primary)' }}>Step {item.step}</div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14 space-y-4">
            <h2 className="section-title">Trusted by <span className="section-accent">Thousands</span></h2>
            <p className="section-subtitle mx-auto">See what our users say about their experience</p>
            <hr className="divider-saffron mx-auto" />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={t.name} className="card p-8 space-y-4 animate-fadeInUp" style={{ animationDelay: `${i * 100}ms`, opacity: 0 }}>
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j} className="text-lg" style={{ color: 'var(--gold)' }}>★</span>
                  ))}
                </div>
                <p className="text-sm leading-relaxed italic" style={{ color: 'var(--text-secondary)' }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: 'linear-gradient(135deg, var(--primary), var(--saffron))' }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{t.name}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section style={{ background: 'linear-gradient(135deg, var(--primary), var(--saffron))' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-white space-y-8">
          <h2 className="text-3xl md:text-4xl font-black">Ready to Discover Your Destiny?</h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Create a free account to generate unlimited Kundli charts, get personalized daily horoscopes, and connect with expert astrologers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white font-bold rounded-xl text-lg transition-all hover:shadow-xl hover:scale-105" style={{ color: 'var(--primary)' }}>
              Create Free Account
            </Link>
            <Link href="/consultations" className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white font-bold rounded-xl text-lg transition-all hover:bg-white/10">
              Browse Astrologers
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
