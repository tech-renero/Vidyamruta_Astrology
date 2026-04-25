import jsPDF from 'jspdf';

// ─── Data Maps ─────────────────────────────────────────────────────

const rashiTraits: Record<string, { personality: string; ruler: string; element: string; quality: string }> = {
  Aries:       { personality: 'courageous, energetic, and a natural pioneer. Your pioneering spirit drives you to take bold initiatives', ruler: 'Mars (Mangal)', element: 'Fire', quality: 'Cardinal' },
  Taurus:      { personality: 'stable, patient, and deeply appreciative of beauty and comfort. Your steadfast nature provides reliability', ruler: 'Venus (Shukra)', element: 'Earth', quality: 'Fixed' },
  Gemini:      { personality: 'intellectually curious, adaptable, and a gifted communicator. Your versatile mind excels at processing information', ruler: 'Mercury (Budha)', element: 'Air', quality: 'Mutable' },
  Cancer:      { personality: 'nurturing, intuitive, and emotionally deep. Your protective instincts create strong bonds with family', ruler: 'Moon (Chandra)', element: 'Water', quality: 'Cardinal' },
  Leo:         { personality: 'charismatic, confident, and a natural leader. Your radiant personality commands attention and respect', ruler: 'Sun (Surya)', element: 'Fire', quality: 'Fixed' },
  Virgo:       { personality: 'analytical, detail-oriented, and service-minded. Your discriminating intellect excels at perfecting systems', ruler: 'Mercury (Budha)', element: 'Earth', quality: 'Mutable' },
  Libra:       { personality: 'diplomatic, harmonious, and aesthetically refined. Your sense of balance guides you toward fairness', ruler: 'Venus (Shukra)', element: 'Air', quality: 'Cardinal' },
  Scorpio:     { personality: 'intense, perceptive, and deeply transformative. Your penetrating insight uncovers hidden truths', ruler: 'Mars (Mangal)', element: 'Water', quality: 'Fixed' },
  Sagittarius: { personality: 'optimistic, philosophical, and freedom-loving. Your expansive vision seeks higher knowledge and truth', ruler: 'Jupiter (Guru)', element: 'Fire', quality: 'Mutable' },
  Capricorn:   { personality: 'disciplined, ambitious, and methodical. Your perseverance and strategic thinking lead to lasting achievements', ruler: 'Saturn (Shani)', element: 'Earth', quality: 'Cardinal' },
  Aquarius:    { personality: 'innovative, humanitarian, and independent. Your forward-thinking vision aims to uplift collective well-being', ruler: 'Saturn (Shani)', element: 'Air', quality: 'Fixed' },
  Pisces:      { personality: 'compassionate, imaginative, and spiritually inclined. Your empathic nature and intuition guide you through life', ruler: 'Jupiter (Guru)', element: 'Water', quality: 'Mutable' },
};

const nakshatraInsights: Record<string, string> = {
  Ashwini: 'swift action, healing abilities, and an eagerness to begin new ventures',
  Bharani: 'intense emotions, creative power, and the ability to endure and transform',
  Krittika: 'sharp intellect, purifying energy, and determination to cut through obstacles',
  Rohini: 'artistic talent, material abundance, and a magnetic personality',
  Mrigashira: 'curiosity, searching nature, and a gentle yet restless disposition',
  Ardra: 'emotional depth, intellectual intensity, and the power of transformation through storms',
  Punarvasu: 'renewal, optimism, and the ability to bounce back from adversity',
  Pushya: 'nourishment, spiritual growth, and a deeply caring nature',
  Ashlesha: 'mystical wisdom, strategic thinking, and deep psychological understanding',
  Magha: 'authority, ancestral pride, and a regal bearing that commands respect',
  'Purva Phalguni': 'creativity, love of pleasure, and a generous heart',
  'Uttara Phalguni': 'patronage, friendship, and the ability to help others prosper',
  Hasta: 'skill with hands, craftsmanship, and practical intelligence',
  Chitra: 'artistic brilliance, structural vision, and an eye for beauty in design',
  Swati: 'independence, flexibility, and the ability to adapt like the wind',
  Vishakha: 'determination, goal-oriented focus, and transformative ambition',
  Anuradha: 'devotion, friendship, and success through cooperation and loyalty',
  Jyeshtha: 'leadership, protective nature, and the courage to defend the righteous',
  Mula: 'investigative spirit, capacity for deep research, and the power to uproot the old',
  'Purva Ashadha': 'invincibility, purification, and the power of rejuvenation through water',
  'Uttara Ashadha': 'final victory, unwavering determination, and universal righteousness',
  Shravana: 'listening ability, learning, and connection through knowledge and wisdom',
  Dhanishta: 'musical talent, wealth accumulation, and an adaptable social nature',
  Shatabhisha: 'healing powers, secretive nature, and an independent philosophical mind',
  'Purva Bhadrapada': 'fiery passion, spiritual warrior energy, and profound transformation',
  'Uttara Bhadrapada': 'deep wisdom, patience, and the stability of the cosmic serpent',
  Revati: 'compassion, safe journeys, and the nurturing energy that guides others home',
};

const dignityEffects: Record<string, string> = {
  exalted: 'is in an exalted position, bestowing its strongest and most auspicious results',
  debilitated: 'is debilitated, which may present challenges that require conscious effort to overcome',
  own: 'is in its own sign, functioning comfortably and delivering reliable results',
  neutral: 'occupies a neutral position, giving moderate and balanced effects',
};

const planetNature: Record<string, { domain: string; positive: string; challenge: string }> = {
  sun:     { domain: 'soul, authority, father, government, and vitality', positive: 'strong willpower, leadership, and self-confidence', challenge: 'ego conflicts and issues with authority' },
  moon:    { domain: 'mind, emotions, mother, and public image', positive: 'emotional intelligence, nurturing ability, and intuition', challenge: 'mood fluctuations and emotional vulnerability' },
  mars:    { domain: 'courage, energy, siblings, and property', positive: 'determination, physical strength, and courage', challenge: 'anger management and impulsive decisions' },
  mercury: { domain: 'intellect, communication, business, and education', positive: 'analytical thinking, eloquence, and commercial success', challenge: 'nervous energy and over-thinking' },
  jupiter: { domain: 'wisdom, spirituality, children, and fortune', positive: 'ethical conduct, prosperity, and spiritual growth', challenge: 'over-optimism and complacency' },
  venus:   { domain: 'love, beauty, luxury, marriage, and creativity', positive: 'artistic talent, harmonious relationships, and material comfort', challenge: 'indulgence and attachment to pleasures' },
  saturn:  { domain: 'discipline, longevity, karma, and hard work', positive: 'perseverance, structure, and long-term rewards', challenge: 'delays, restrictions, and lessons through hardship' },
  rahu:    { domain: 'worldly desires, foreign connections, and unconventional paths', positive: 'innovation, ambition, and breaking boundaries', challenge: 'obsession, confusion, and illusion' },
  ketu:    { domain: 'spirituality, past-life karma, and detachment', positive: 'spiritual insight, moksha inclination, and psychic ability', challenge: 'isolation, lack of direction, and past-life karmic debt' },
};

// ─── Helper: Get ACTUAL current Mahadasha from fullCycle ────────────

export function getActualCurrentMahadasha(dashaData: any): { planet: string; endTime: any } | null {
  if (!dashaData?.fullCycle) return dashaData?.currentMahadasha || null;
  const now = new Date();
  for (const period of dashaData.fullCycle) {
    if (new Date(period.startTime) <= now && now <= new Date(period.endTime)) {
      return { planet: period.planet, endTime: period.endTime };
    }
  }
  return dashaData?.currentMahadasha || null;
}

// ─── Text Generators ────────────────────────────────────────────────

export function generateLagnaAnalysis(rashiName: string): string {
  const traits = rashiTraits[rashiName];
  if (!traits) return `Based on your Lagna (Ascendant) being ${rashiName}, your personality is shaped by the unique qualities of this sign.`;
  return `Based on your Lagna (Ascendant) being ${rashiName}, you are ${traits.personality}. Your Lagna lord is ${traits.ruler}, belonging to the ${traits.element} element with ${traits.quality} quality. This fundamentally shapes your physical appearance, temperament, and how the world perceives you.`;
}

export function generateMoonAnalysis(rashiName: string, nakshatra: string, pada?: number): string {
  const nk = nakshatraInsights[nakshatra];
  const nkText = nk ? `This nakshatra bestows ${nk}.` : '';
  const padaText = pada ? ` Pada ${pada} adds specific nuances to how these lunar energies manifest in your daily emotional life.` : '';
  return `The Moon in ${rashiName} sign and ${nakshatra} nakshatra reveals your inner emotional world, mental patterns, and subconscious tendencies. ${nkText}${padaText} The Moon's placement is considered the most important factor in Vedic Astrology as it governs your mind (Manas).`;
}

export function generatePlanetAnalysis(planets: Record<string, any>): string[] {
  const paragraphs: string[] = [];
  for (const [key, pos] of Object.entries(planets)) {
    const info = planetNature[key];
    if (!info) continue;
    const name = key.charAt(0).toUpperCase() + key.slice(1);
    const dignityText = dignityEffects[pos.dignity] || 'occupies its current position';
    const retroText = pos.isRetrograde ? ` Being retrograde, ${name}'s energy is internalized — you may experience its effects more on a psychological and karmic level.` : '';
    paragraphs.push(
      `**${name}** in **${pos.rashiName || 'its sign'}** — ${name} governs ${info.domain}. In your chart, ${name} ${dignityText}.${retroText} This placement brings ${info.positive}, though you may need to navigate ${info.challenge}.`
    );
  }
  return paragraphs;
}

export function generateDashaAnalysis(dashaData: any): string {
  const actualMaha = getActualCurrentMahadasha(dashaData);
  if (!actualMaha) return '';
  const current = actualMaha.planet;
  const info = planetNature[current.toLowerCase()];
  if (!info) return `You are currently running the **${current} Mahadasha**, which influences the primary themes of your life during this period.`;

  // Find actual current antardasha too
  let antarText = '';
  if (dashaData?.currentAntardasha) {
    // Check if the library's antardasha is actually current
    const antarEnd = new Date(dashaData.currentAntardasha.endTime);
    if (antarEnd > new Date()) {
      antarText = ` The sub-period (Antardasha) of **${dashaData.currentAntardasha.planet}** adds a secondary layer of influence.`;
    }
  }
  return `You are currently running the **${current} Mahadasha**. This major planetary period highlights themes of ${info.domain}. During this time, you can expect ${info.positive}.${antarText}`;
}

// ─── PDF Generator ──────────────────────────────────────────────────

export function downloadPDFReport(formData: any, kundliData: any, pData: any, dashaData: any) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentW = W - margin * 2;
  let y = 0;

  const actualMaha = getActualCurrentMahadasha(dashaData);
  const asc = kundliData?.ascendant;
  const moon = kundliData?.moonDetails;
  const planets = pData?.planetaryPositions || kundliData?.planets || {};
  const fmtDate = (d: any) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const fmtTime = (d: any) => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—';

  const planetYears: Record<string, number> = { Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17, Ketu: 7, Venus: 20 };

  // Colors
  const orange = [230, 81, 0];     // #e65100
  const darkText = [33, 33, 33];   // #212121
  const mutedText = [117, 117, 117]; // #757575
  const warmBg = [255, 248, 225];  // #fff8e1
  const saffronLight = [255, 243, 224]; // #fff3e0

  function checkPage(needed: number) {
    if (y + needed > H - 20) {
      // Footer on current page
      doc.setFontSize(7);
      doc.setTextColor(...mutedText);
      doc.text('Generated by Vidyamruta | www.vidyamruta.com', W / 2, H - 8, { align: 'center' });
      doc.addPage();
      y = 15;
    }
  }

  function sectionTitle(title: string) {
    checkPage(15);
    doc.setFillColor(...saffronLight);
    doc.roundedRect(margin, y, contentW, 10, 2, 2, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...orange);
    doc.text(title.toUpperCase(), margin + 4, y + 7);
    y += 15;
  }

  function bodyText(text: string, indent = 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...darkText);
    const lines = doc.splitTextToSize(text, contentW - indent);
    checkPage(lines.length * 4.5 + 2);
    doc.text(lines, margin + indent, y);
    y += lines.length * 4.5 + 2;
  }

  function labelValue(label: string, value: string, lw = 45) {
    checkPage(6);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mutedText);
    doc.text(label, margin + 4, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkText);
    doc.text(value, margin + lw, y);
    y += 5.5;
  }

  // ══════ PAGE 1: COVER ══════

  // Saffron header bar
  doc.setFillColor(...orange);
  doc.rect(0, 0, W, 50, 'F');

  // Logo circle
  doc.setFillColor(255, 255, 255);
  doc.circle(W / 2, 22, 8, 'F');
  doc.setFontSize(16);
  doc.setTextColor(...orange);
  doc.text('\uD83D\uDE4F', W / 2 - 4, 26); // 🙏

  // Title
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('VIDYAMRUTA', W / 2, 40, { align: 'center' });

  // Subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 243, 224);
  doc.text('Vedic Astrology Report', W / 2, 46, { align: 'center' });

  y = 62;

  // Person details card
  doc.setFillColor(...warmBg);
  doc.roundedRect(margin, y, contentW, 40, 3, 3, 'F');
  doc.setDrawColor(255, 183, 77);
  doc.roundedRect(margin, y, contentW, 40, 3, 3, 'S');

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkText);
  doc.text(formData.name || 'Name', W / 2, y + 12, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedText);
  doc.text(`Born: ${formData.date}  |  Time: ${formData.time}  |  Place: ${formData.location}`, W / 2, y + 20, { align: 'center' });
  doc.text(`Report Generated: ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, W / 2, y + 27, { align: 'center' });

  y += 50;

  // Quick summary boxes
  const boxW = (contentW - 9) / 4;
  const summaryItems = [
    { label: 'LAGNA', value: asc?.rashiName || '—' },
    { label: 'MOON SIGN', value: moon?.rashiName || '—' },
    { label: 'NAKSHATRA', value: moon?.nakshatra || '—' },
    { label: 'MAHADASHA', value: actualMaha?.planet || '—' },
  ];
  summaryItems.forEach((item, i) => {
    const x = margin + i * (boxW + 3);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, y, boxW, 22, 2, 2, 'F');
    doc.setDrawColor(230, 230, 230);
    doc.roundedRect(x, y, boxW, 22, 2, 2, 'S');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...orange);
    doc.text(item.label, x + boxW / 2, y + 8, { align: 'center' });
    doc.setFontSize(11);
    doc.setTextColor(...darkText);
    doc.text(item.value, x + boxW / 2, y + 17, { align: 'center' });
  });
  y += 32;

  // ══════ BASIC DETAILS ══════
  sectionTitle('Basic Details');
  labelValue('Lagna (Ascendant)', asc?.rashiName || '—');
  labelValue('Lagna Nakshatra', `${asc?.nakshatra || '—'} (Pada ${asc?.pada || '—'})`);
  labelValue('Moon Sign (Rashi)', moon?.rashiName || '—');
  labelValue('Moon Nakshatra', `${moon?.nakshatra || '—'} (Pada ${moon?.pada || '—'})`);
  labelValue('Ayanamsha', `${pData?.ayanamsa ? pData.ayanamsa.toFixed(4) : (pData?.ayanamsha?.toFixed(4) || '—')} (Lahiri)`);
  labelValue('Sunrise', fmtTime(pData?.sunrise));
  labelValue('Sunset', fmtTime(pData?.sunset));
  y += 5;

  // ══════ PLANETARY POSITIONS ══════
  sectionTitle('Planetary Positions');

  // Table header
  doc.setFillColor(...orange);
  doc.roundedRect(margin, y, contentW, 7, 1, 1, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  const cols = [margin + 4, margin + 30, margin + 68, margin + 95, margin + 120, margin + 145];
  doc.text('PLANET', cols[0], y + 5);
  doc.text('SIGN', cols[1], y + 5);
  doc.text('DEGREE', cols[2], y + 5);
  doc.text('MOTION', cols[3], y + 5);
  doc.text('DIGNITY', cols[4], y + 5);
  y += 9;

  Object.entries(planets).forEach(([key, pos]: [string, any], i) => {
    checkPage(6);
    const name = key.charAt(0).toUpperCase() + key.slice(1);
    const deg = pos.degree != null ? pos.degree : (pos.longitude || 0) % 30;
    const degStr = `${Math.floor(deg)}°${Math.floor((deg % 1) * 60)}'`;

    if (i % 2 === 0) {
      doc.setFillColor(252, 248, 240);
      doc.rect(margin, y - 3.5, contentW, 5.5, 'F');
    }

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkText);
    doc.text(name, cols[0], y);
    doc.setFont('helvetica', 'normal');
    doc.text(pos.rashiName || '—', cols[1], y);
    doc.text(degStr, cols[2], y);
    doc.text(pos.isRetrograde ? 'Retro' : 'Direct', cols[3], y);
    // Dignity with color
    if (pos.dignity === 'exalted') doc.setTextColor(46, 125, 50);
    else if (pos.dignity === 'debilitated') doc.setTextColor(198, 40, 40);
    else doc.setTextColor(...mutedText);
    doc.text((pos.dignity || '—').charAt(0).toUpperCase() + (pos.dignity || '—').slice(1), cols[4], y);
    y += 5.5;
  });
  y += 5;

  // ══════ DASHA PERIODS ══════
  if (dashaData?.fullCycle) {
    sectionTitle('Vimshottari Dasha Periods');

    labelValue('Birth Nakshatra', `${dashaData.birthNakshatra || '—'} (Pada ${dashaData.nakshatraPada || '—'})`);
    labelValue('Balance at Birth', dashaData.dashaBalance || '—');
    labelValue('Current Mahadasha', actualMaha?.planet || '—');
    y += 3;

    // Dasha table header
    doc.setFillColor(...orange);
    doc.roundedRect(margin, y, contentW, 7, 1, 1, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    const dcols = [margin + 4, margin + 30, margin + 60, margin + 100, margin + 140];
    doc.text('PLANET', dcols[0], y + 5);
    doc.text('YEARS', dcols[1], y + 5);
    doc.text('START', dcols[2], y + 5);
    doc.text('END', dcols[3], y + 5);
    doc.text('STATUS', dcols[4], y + 5);
    y += 9;

    const now = new Date();
    dashaData.fullCycle.forEach((period: any, i: number) => {
      checkPage(6);
      const isCurrent = new Date(period.startTime) <= now && now <= new Date(period.endTime);
      const isPast = new Date(period.endTime) < now;

      if (isCurrent) {
        doc.setFillColor(255, 243, 224);
        doc.rect(margin, y - 3.5, contentW, 5.5, 'F');
      } else if (i % 2 === 0) {
        doc.setFillColor(252, 248, 240);
        doc.rect(margin, y - 3.5, contentW, 5.5, 'F');
      }

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...darkText);
      doc.text(period.planet, dcols[0], y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${planetYears[period.planet] || '—'} years`, dcols[1], y);
      doc.text(fmtDate(period.startTime), dcols[2], y);
      doc.text(fmtDate(period.endTime), dcols[3], y);

      if (isCurrent) { doc.setTextColor(46, 125, 50); doc.setFont('helvetica', 'bold'); doc.text('ACTIVE', dcols[4], y); }
      else if (isPast) { doc.setTextColor(...mutedText); doc.text('Completed', dcols[4], y); }
      else { doc.setTextColor(...orange); doc.text('Upcoming', dcols[4], y); }
      y += 5.5;
    });
    y += 5;
  }

  // ══════ ANALYSIS ══════
  sectionTitle('Lagna (Ascendant) Analysis');
  bodyText(generateLagnaAnalysis(asc?.rashiName || ''));
  y += 3;

  sectionTitle('Moon (Chandra) Analysis');
  bodyText(generateMoonAnalysis(moon?.rashiName || '', moon?.nakshatra || '', moon?.pada));
  y += 3;

  sectionTitle('Planetary Influence Analysis');
  const planetTexts = generatePlanetAnalysis(planets);
  planetTexts.forEach(text => {
    bodyText(text.replace(/\*\*/g, ''));
    y += 1;
  });

  const dashaText = generateDashaAnalysis(dashaData);
  if (dashaText) {
    sectionTitle('Current Dasha Period');
    bodyText(dashaText.replace(/\*\*/g, ''));
    y += 3;
  }

  // Quote
  checkPage(25);
  doc.setFillColor(...warmBg);
  doc.roundedRect(margin, y, contentW, 18, 2, 2, 'F');
  doc.setDrawColor(...orange);
  doc.setLineWidth(0.8);
  doc.line(margin, y, margin, y + 18);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...mutedText);
  const quoteLines = doc.splitTextToSize('"The stars impel, they do not compel. Awareness of these cosmic influences allows you to navigate your karma with wisdom and grace."', contentW - 10);
  doc.text(quoteLines, margin + 6, y + 7);
  y += 25;

  // Footer on last page
  doc.setFontSize(7);
  doc.setTextColor(...mutedText);
  doc.text(`Report generated by Vidyamruta | www.vidyamruta.com | © ${new Date().getFullYear()} All rights reserved.`, W / 2, H - 8, { align: 'center' });

  // Save
  doc.save(`Vidyamruta_Report_${(formData.name || 'Kundli').replace(/\s+/g, '_')}_${formData.date}.pdf`);
}
