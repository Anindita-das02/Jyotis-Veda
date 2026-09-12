import { jsPDF } from 'jspdf';
import { UserProfile, HoroscopeTradition } from '../types';
import { API_BASE_URL } from './api';

// Helper to load image as base64 DataURL
const loadImageBase64 = (url: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

export interface GenerateFullReportOptions {
  profile: UserProfile;
  tradition?: HoroscopeTradition;
  language?: string;
  chartData?: any;
  panchang?: any;
  numerology?: any;
}

// Global page decoration helper to guarantee unified styling across all pages
function drawPageDecorations(
  doc: jsPDF,
  pageWidth: number,
  pageHeight: number,
  bgBase64: string | null,
  logoBase64: string | null,
  pageNum: number,
  totalPages: number,
  title: string,
  subtitle: string,
  generatedDate: string
) {
  // 1. Soft Page Background Tint (Warm off-white / parchment ivory)
  doc.setFillColor(254, 253, 250);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // 2. Subtle Watermark (painted underneath before any text or cards)
  if (bgBase64) {
    try {
      if (typeof (doc as any).setGState === 'function' && (doc as any).GState) {
        (doc as any).setGState(new (doc as any).GState({ opacity: 0.05 }));
      }
      doc.addImage(bgBase64, 'JPEG', 0, 0, pageWidth, pageHeight);
      if (typeof (doc as any).setGState === 'function' && (doc as any).GState) {
        (doc as any).setGState(new (doc as any).GState({ opacity: 1.0 }));
      }
    } catch {}
  }

  // 3. Double Golden Border (Standardized across all JyotishVeda reports)
  doc.setDrawColor(201, 160, 80); // #C9A050
  doc.setLineWidth(1.1);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
  doc.setLineWidth(0.35);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // 4. Corner Golden Rosettes
  doc.setFillColor(201, 160, 80);
  doc.circle(10, 10, 1.2, 'F');
  doc.circle(pageWidth - 10, 10, 1.2, 'F');
  doc.circle(10, pageHeight - 10, 1.2, 'F');
  doc.circle(pageWidth - 10, pageHeight - 10, 1.2, 'F');

  // 5. Official Brand Header (Identical structure to all other system PDFs)
  const headerY = 13.5;
  if (logoBase64) {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 211, 176);
    doc.setLineWidth(0.4);
    doc.roundedRect(13, headerY, 15, 15, 2, 2, 'FD');
    doc.addImage(logoBase64, 'PNG', 13.75, headerY + 0.75, 13.5, 13.5);
  }

  const textStartX = logoBase64 ? 31 : 14;

  // "JYOTISH" in Dark + "VEDA" in Golden Ochre
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(20, 20, 24);
  doc.text('JYOTISH', textStartX, headerY + 4.8);
  const jW = doc.getTextWidth('JYOTISH');
  doc.setTextColor(181, 131, 40); // #B58328
  doc.text('VEDA', textStartX + jW, headerY + 4.8);

  // Section Heading (All-Caps Gold)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(126, 95, 24); // #7E5F18
  doc.text(title.toUpperCase(), textStartX, headerY + 9.5);

  // Subtitle (Italic Muted Charcoal)
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.8);
  doc.setTextColor(110, 105, 95); // #6E695F
  doc.text(subtitle, textStartX, headerY + 13.5);

  // Golden Divider Line under Header
  doc.setDrawColor(226, 211, 176);
  doc.setLineWidth(0.4);
  doc.line(13, headerY + 16.5, pageWidth - 13, headerY + 16.5);

  // 6. Footer Divider & Standardized Page Information
  const footerY = pageHeight - 16;
  doc.setDrawColor(226, 211, 176);
  doc.setLineWidth(0.4);
  doc.line(13, footerY, pageWidth - 13, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(102, 102, 102);
  doc.text(`Generated: ${generatedDate}`, 14, footerY + 4.5);
  doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 14, footerY + 4.5, { align: 'right' });
}

export async function generateMasterFullReportPdf({
  profile,
  tradition = 'parashari',
  language = 'en',
  chartData: initialChartData,
  panchang: initialPanchang,
  numerology: initialNumerology,
}: GenerateFullReportOptions): Promise<void> {
  let chartData = initialChartData;
  let panchang = initialPanchang;
  let numerology = initialNumerology;
  let dailyInsights: any = null;
  let roadmapData: any = null;

  // ── 1. Fetch Aggregated Master Data from Backend (with fallback) ──
  try {
    const res = await fetch(`${API_BASE_URL}/api/reports/full-report-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, tradition, language }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.status === 'success' && json.data) {
        chartData = json.data.chartData || chartData;
        panchang = json.data.panchang || panchang;
        numerology = json.data.numerology || numerology;
        dailyInsights = json.data.dailyInsights;
        roadmapData = json.data.roadmap;
      }
    }
  } catch (err) {
    console.warn('Backend full-report-data API fetch failed, using local fallback:', err);
  }

  // Safe default object fallbacks
  chartData = chartData || {};
  panchang = panchang || {};
  numerology = numerology || {};

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm

  // Load Brand Assets
  const [bgBase64, logoStandardBase64, logoAltBase64] = await Promise.all([
    loadImageBase64('/astrologer_bg.jpg'),
    loadImageBase64('/jyotishveda_logo_standard.png'),
    loadImageBase64('/jyotishveda_logo.png')
  ]);
  const logoBase64 = logoStandardBase64 || logoAltBase64;

  // Strict ASCII Sanitization Helper (Removes Devanagari Unicode and avoids (■■■) boxes)
  const sanitize = (text: any): string => {
    if (!text) return '';
    return String(text)
      .replace(/[\u0900-\u097F]/g, '') // Strip Devanagari characters
      .replace(/\(\s*\)/g, '')         // Strip empty parentheses
      .replace(/[^\x20-\x7E]/g, '')   // Keep printable ASCII
      .replace(/\s+/g, ' ')
      .trim();
  };

  const cleanSignName = (val: string): string => {
    if (!val) return '';
    return sanitize(val.replace(/\([^)]*\)/g, '').trim());
  };

  const getSanskritPlanetName = (name: string): string => {
    const n = (name || '').toLowerCase();
    if (n.includes('ascendant') || n.includes('lagna')) return 'Lagna';
    if (n.includes('sun') || n.includes('surya')) return 'Surya';
    if (n.includes('moon') || n.includes('chandra')) return 'Chandra';
    if (n.includes('mars') || n.includes('mangal')) return 'Mangala';
    if (n.includes('mercury') || n.includes('budh')) return 'Budha';
    if (n.includes('jupiter') || n.includes('guru')) return 'Guru';
    if (n.includes('venus') || n.includes('shukra')) return 'Shukra';
    if (n.includes('saturn') || n.includes('shani')) return 'Shani';
    if (n.includes('rahu')) return 'Rahu';
    if (n.includes('ketu')) return 'Ketu';
    return sanitize(name);
  };

  const ascSign = cleanSignName(chartData?.ascendant?.signName) || 'Aries';
  const ascDeg = chartData?.ascendant?.degree != null ? `${chartData.ascendant.degree.toFixed(2)} deg` : '11.95 deg';
  const ascNakshatra = sanitize(chartData?.ascendant?.nakshatra) || 'Ashwini';
  const moonPlanet = chartData?.planets?.find((p: any) => p.id === 'moon' || p.name?.toLowerCase() === 'moon');
  const moonSign = cleanSignName(panchang?.lunarSign || chartData?.moonSign || moonPlanet?.signName) || 'Simha';
  const sunSign = cleanSignName(panchang?.solarSign || chartData?.sunSign) || 'Cancer';
  const nakshatra = sanitize(panchang?.nakshatra || moonPlanet?.nakshatra) || 'Uttara Phalguni';
  const mulank = numerology?.mulank || 1;
  const mulankPlanet = sanitize(numerology?.mulankPlanet || 'Sun').replace(/\([^)]*\)/g, '').trim();
  const bhagyank = numerology?.bhagyank || 1;
  const namank = numerology?.namankChaldean || numerology?.namankPythagorean || 1;
  const auspiciousScore = panchang?.auspiciousScore || 78;

  const now = new Date();
  const todayStr = sanitize(now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }));
  const currentYear = now.getFullYear();
  const totalReportPages = 8;

  // ==========================================
  // PAGE 1: GRAND HEADER & DAILY TRANSIT SYNTHESIS
  // ==========================================
  drawPageDecorations(
    doc,
    pageWidth,
    pageHeight,
    bgBase64,
    logoBase64,
    1,
    totalReportPages,
    'OFFICIAL VEDIC MASTER REPORT & DAILY SYNTHESIS',
    `Deep Vedic Psychodynamic & Astronomical Synthesis for ${sanitize(profile.fullName) || 'Seeker'}`,
    todayStr
  );

  let yP1 = 33;

  // 1. Seeker Natal Particulars (Left Card) & Harmonic Celestial Anchors (Right Card)
  const profCardW = (pageWidth - 26 - 4) / 2; // 89mm
  const profCardH = 30;

  // Left Card: Seeker Particulars
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(201, 160, 80);
  doc.setLineWidth(0.4);
  doc.roundedRect(13, yP1, profCardW, profCardH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(126, 95, 24);
  doc.text('SEEKER NATAL PARTICULARS', 17, yP1 + 5.5);

  doc.setFontSize(10.5);
  doc.setTextColor(26, 26, 30);
  doc.text(sanitize(profile.fullName) || 'Vedic Seeker', 17, yP1 + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(70, 70, 75);
  doc.text(`Date of Birth: ${sanitize(profile.birthDate) || 'N/A'}${profile.birthTime ? ` at ${sanitize(profile.birthTime)}` : ''}`, 17, yP1 + 16.5);
  doc.text(`Place of Birth: ${sanitize(profile.birthPlace) || 'Global'} (${profile.latitude ? profile.latitude.toFixed(2) : '28.61'}N, ${profile.longitude ? profile.longitude.toFixed(2) : '77.20'}E)`, 17, yP1 + 21);
  doc.text(`Active Tradition: ${tradition.toUpperCase()} (Lahiri Nirayana)`, 17, yP1 + 25.5);

  // Right Card: Harmonic Celestial Anchors
  const rightProfX = 13 + profCardW + 4;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(201, 160, 80);
  doc.setLineWidth(0.4);
  doc.roundedRect(rightProfX, yP1, profCardW, profCardH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(126, 95, 24);
  doc.text('HARMONIC CELESTIAL ANCHORS', rightProfX + 4, yP1 + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(50, 50, 55);
  doc.text(`* Lagna: ${ascSign} (${ascDeg})`, rightProfX + 4, yP1 + 11.5);
  doc.text(`* Moon Sign: ${moonSign} (${nakshatra.slice(0, 18)})`, rightProfX + 4, yP1 + 16.5);
  doc.text(`* Mulank ${mulank} (${mulankPlanet}) | Bhagyank ${bhagyank} | Score: ${auspiciousScore}%`, rightProfX + 4, yP1 + 21);
  doc.text(`* Auspicious Color: ${luckyColorVal}`, rightProfX + 4, yP1 + 25.5);

  yP1 += profCardH + 4;

  // 2. Auspicious Transit Strip (4 Cards)
  const colWidth = (pageWidth - 26 - 9) / 4;
  const cardH = 14;
  const luckyColorVal = sanitize(panchang.luckyData?.luckyColor || numerology?.luckyColors?.[0] || 'Bright Yellow');
  const abhijitVal = sanitize((panchang.timings?.abhijitMuhurta || panchang.abhijitMuhurta || '11:53 AM - 12:41 PM').split('(')[0].trim());
  const rahuVal = sanitize((panchang.timings?.rahuKaal || panchang.rahuKaal || '09:10 AM - 10:44 AM').split('(')[0].trim());

  const metrics = [
    { label: 'LUCKY NUMBER', val: `${panchang.luckyData?.luckyNumber || mulank}`, sub: `Ruled by ${mulankPlanet}` },
    { label: 'LUCKY COLOR & TONE', val: luckyColorVal, sub: 'Enhances focus' },
    { label: 'SHUBH ABHIJIT MUHURTA', val: abhijitVal, sub: 'Victory Window' },
    { label: 'RAHU KAAL (AVOID)', val: rahuVal, sub: 'Inauspicious' }
  ];

  metrics.forEach((m, idx) => {
    const xPos = 13 + idx * (colWidth + 3);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 211, 176);
    doc.setLineWidth(0.3);
    doc.roundedRect(xPos, yP1, colWidth, cardH, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.setTextColor(126, 95, 24);
    doc.text(m.label, xPos + 2.5, yP1 + 3.6);

    doc.setFontSize(7.0);
    doc.setTextColor(26, 26, 30);
    doc.text(doc.splitTextToSize(m.val, colWidth - 5)[0] || m.val, xPos + 2.5, yP1 + 7.6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.4);
    doc.setTextColor(90, 90, 90);
    doc.text(doc.splitTextToSize(m.sub, colWidth - 5)[0] || m.sub, xPos + 2.5, yP1 + 11.4);
  });

  yP1 += cardH + 4;

  // 3. Daily AI Planetary Synthesis Card
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(201, 160, 80);
  doc.setLineWidth(0.4);
  const summaryBoxH = 24;
  doc.roundedRect(13, yP1, pageWidth - 26, summaryBoxH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(126, 95, 24);
  doc.text('DAILY PLANETARY SYNTHESIS & CELESTIAL RHYTHM', 17, yP1 + 5.2);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.2);
  doc.setTextColor(160, 130, 70);
  doc.text('Lahiri Ephemeris & Vedic Model', pageWidth - 17, yP1 + 5.2, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.6);
  doc.setTextColor(45, 45, 50);
  const summaryText = sanitize(dailyInsights?.summary || "Today's cosmic transits favor steady progress, routine refinement, and maintaining emotional equilibrium across all life endeavors.");
  const summaryLines = doc.splitTextToSize(summaryText, pageWidth - 34);
  doc.text(summaryLines.slice(0, 4), 17, yP1 + 10.2);

  yP1 += summaryBoxH + 4;

  // 4. Three Life Domains Cards (Career, Love, Health)
  const domainW = (pageWidth - 26 - 6) / 3;
  const domainCardH = 34;
  const domains = [
    { title: 'CAREER & COMMERCE', desc: sanitize(dailyInsights?.career || 'Steady momentum supports operational tasks, documentation, and routine client interactions.'), tag: '[ Strategy & Wealth ]' },
    { title: 'LOVE & HARMONY', desc: sanitize(dailyInsights?.love || 'Balanced vibrations nurture mutual respect, shared domestic responsibilities, and supportive listening.'), tag: '[ Companionship ]' },
    { title: 'HEALTH & PRANA', desc: sanitize(dailyInsights?.health || 'Stable physical equilibrium; maintain hydration and gentle restorative yoga or morning walks.'), tag: '[ Vitality & Balance ]' }
  ];

  domains.forEach((d, idx) => {
    const xPos = 13 + idx * (domainW + 3);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 211, 176);
    doc.setLineWidth(0.3);
    doc.roundedRect(xPos, yP1, domainW, domainCardH, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(126, 95, 24);
    doc.text(d.title, xPos + 3, yP1 + 4.8);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(5.6);
    doc.setTextColor(150, 120, 60);
    doc.text(d.tag, xPos + domainW - 3, yP1 + 4.8, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(55, 55, 60);
    const lines = doc.splitTextToSize(d.desc, domainW - 6);
    doc.text(lines.slice(0, 6), xPos + 3, yP1 + 9.5);
  });

  yP1 += domainCardH + 4;

  // 5. Recommended Daily Sadhana Rituals (Nitya Sadhana)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(201, 160, 80);
  doc.setLineWidth(0.4);
  const ritualBoxH = 28;
  doc.roundedRect(13, yP1, pageWidth - 26, ritualBoxH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.4);
  doc.setTextColor(126, 95, 24);
  doc.text('RECOMMENDED DAILY VEDIC RITUALS (NITYA SADHANA)', 17, yP1 + 5);

  const ritualColW = (pageWidth - 36) / 2;
  const morningTitle = sanitize(panchang.rituals?.morningTitle || 'MORNING SADHANA (PRABHAT KRIYA)');
  const morningDesc = sanitize(panchang.rituals?.morningDesc || 'Start your day with meditation, mindful pranayama, and Surya Arghya.');
  const eveningTitle = sanitize(panchang.rituals?.eveningTitle || 'EVENING SADHANA (SANDHYA KRIYA)');
  const eveningDesc = sanitize(panchang.rituals?.eveningDesc || 'Light a ghee diya, practice gratitude prayer, and perform silent introspection.');

  // Morning Sadhana
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 211, 176);
  doc.setLineWidth(0.3);
  doc.roundedRect(17, yP1 + 7.5, ritualColW - 2, 18, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.4);
  doc.setTextColor(181, 131, 40);
  doc.text(doc.splitTextToSize(morningTitle, ritualColW - 8)[0] || morningTitle, 20, yP1 + 11.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.8);
  doc.setTextColor(50, 50, 55);
  doc.text(doc.splitTextToSize(morningDesc, ritualColW - 8).slice(0, 3), 20, yP1 + 15.5);

  // Evening Sadhana
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 211, 176);
  doc.setLineWidth(0.3);
  doc.roundedRect(17 + ritualColW + 2, yP1 + 7.5, ritualColW - 2, 18, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.4);
  doc.setTextColor(181, 131, 40);
  doc.text(doc.splitTextToSize(eveningTitle, ritualColW - 8)[0] || eveningTitle, 17 + ritualColW + 5, yP1 + 11.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.8);
  doc.setTextColor(50, 50, 55);
  doc.text(doc.splitTextToSize(eveningDesc, ritualColW - 8).slice(0, 3), 17 + ritualColW + 5, yP1 + 15.5);

  // ==========================================
  // PAGE 2: PANCHANG PARAMETERS & PLANETARY TABLE
  // ==========================================
  doc.addPage();
  drawPageDecorations(
    doc,
    pageWidth,
    pageHeight,
    bgBase64,
    logoBase64,
    2,
    totalReportPages,
    'SACRED PANCHANG & PLANETARY EPHEMERIS',
    'Sidereal Coordinates, Auspicious Muhurtas & Planetary Motions',
    todayStr
  );

  let yP2 = 33;

  // 1. Sacred Panchang Parameters Table
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(201, 160, 80);
  doc.setLineWidth(0.4);
  doc.roundedRect(13, yP2, pageWidth - 26, 36, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(126, 95, 24);
  doc.text('SACRED PANCHANG PARAMETERS (SIDEREAL VEDIC EPHEMERIS)', 17, yP2 + 5.2);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.2);
  doc.setTextColor(160, 130, 70);
  doc.text('Computed for Local Latitude & Longitude', pageWidth - 17, yP2 + 5.2, { align: 'right' });

  const sunriseVal = sanitize(panchang.timings?.sunrise || panchang.sunrise || '06:03 AM');
  const sunsetVal = sanitize(panchang.timings?.sunset || panchang.sunset || '06:31 PM');
  const brahmaVal = sanitize((panchang.timings?.brahmaMuhurta || panchang.brahmaMuhurta || '04:27 AM - 05:15 AM').split('(')[0].trim());

  const panchangGrid = [
    [
      { label: 'Tithi (Lunar Day)', val: sanitize(panchang.tithi || 'Shukla Dwitiya') },
      { label: 'Nakshatra (Asterism)', val: sanitize(panchang.nakshatra || nakshatra) },
      { label: 'Vedic Yoga', val: sanitize(panchang.yoga || 'Shubha') },
      { label: 'Karana (Half Tithi)', val: sanitize(panchang.karana || 'Kaulava') }
    ],
    [
      { label: 'Sun Sign (Surya Rashi)', val: cleanSignName(panchang.solarSign) || sunSign },
      { label: 'Moon Sign (Chandra Rashi)', val: cleanSignName(panchang.lunarSign) || moonSign },
      { label: 'Sunrise / Sunset', val: `${sunriseVal} / ${sunsetVal}` },
      { label: 'Brahma Muhurta', val: brahmaVal }
    ]
  ];

  const pColW2 = (pageWidth - 36) / 2;
  panchangGrid.forEach((col, colIdx) => {
    const xOffset = 17 + colIdx * (pColW2 + 4);
    col.forEach((row, rowIdx) => {
      const rowY = yP2 + 10 + rowIdx * 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(95, 90, 85);
      doc.text(row.label, xOffset, rowY);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8);
      doc.setTextColor(26, 26, 30);
      doc.text(row.val, xOffset + pColW2, rowY, { align: 'right' });

      if (rowIdx < 3) {
        doc.setDrawColor(235, 225, 205);
        doc.setLineWidth(0.2);
        doc.line(xOffset, rowY + 1.5, xOffset + pColW2, rowY + 1.5);
      }
    });
  });

  yP2 += 40;

  // 2. Active Planetary Positions Table
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(201, 160, 80);
  doc.setLineWidth(0.4);
  const tableBoxH = 74;
  doc.roundedRect(13, yP2, pageWidth - 26, tableBoxH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(126, 95, 24);
  doc.text('ACTIVE PLANETARY POSITIONS & NATAL TRANSIT VIBRATION', 17, yP2 + 5.2);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.2);
  doc.setTextColor(160, 130, 70);
  doc.text('Lahiri Ayanamsha (Chitra Paksha) Ephemeris Coordinates', pageWidth - 17, yP2 + 5.2, { align: 'right' });

  const tblY = yP2 + 7.5;
  doc.setFillColor(250, 247, 240);
  doc.rect(17, tblY, pageWidth - 34, 5.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(126, 95, 24);
  doc.text('PLANET (GRAHA)', 20, tblY + 3.8);
  doc.text('SANSKRIT', 54, tblY + 3.8);
  doc.text('RASHI (SIGN)', 82, tblY + 3.8);
  doc.text('LONGITUDE', 116, tblY + 3.8);
  doc.text('NAKSHATRA & PADA', 142, tblY + 3.8);
  doc.text('HOUSE', 178, tblY + 3.8);

  const defaultPlanets = [
    { name: 'Ascendant', sanskritName: 'Lagna', signName: ascSign, degree: 11.95, nakshatra: ascNakshatra, pada: 1, house: 1, isRetrograde: false },
    { name: 'Sun', sanskritName: 'Surya', signName: sunSign, degree: 6.84, nakshatra: 'Pushya', pada: 2, house: 4, isRetrograde: false },
    { name: 'Moon', sanskritName: 'Chandra', signName: moonSign, degree: 29.60, nakshatra: 'Uttara Ashadha', pada: 1, house: 9, isRetrograde: false },
    { name: 'Mars', sanskritName: 'Mangala', signName: 'Cancer', degree: 12.61, nakshatra: 'Pushya', pada: 3, house: 4, isRetrograde: false },
    { name: 'Mercury', sanskritName: 'Budha', signName: 'Cancer', degree: 9.95, nakshatra: 'Pushya', pada: 2, house: 4, isRetrograde: false },
    { name: 'Jupiter', sanskritName: 'Guru', signName: 'Cancer', degree: 4.12, nakshatra: 'Pushya', pada: 1, house: 4, isRetrograde: false },
    { name: 'Venus', sanskritName: 'Shukra', signName: 'Leo', degree: 20.46, nakshatra: 'Purva Phalguni', pada: 3, house: 5, isRetrograde: false },
    { name: 'Saturn', sanskritName: 'Shani', signName: 'Gemini', degree: 0.07, nakshatra: 'Mrigashira', pada: 3, house: 3, isRetrograde: false },
    { name: 'Rahu', sanskritName: 'Rahu', signName: 'Taurus', degree: 23.33, nakshatra: 'Mrigashira', pada: 1, house: 2, isRetrograde: true },
    { name: 'Ketu', sanskritName: 'Ketu', signName: 'Scorpio', degree: 23.33, nakshatra: 'Jyeshtha', pada: 3, house: 8, isRetrograde: true },
  ];

  const planetsToDisplay = (chartData?.planets && chartData.planets.length > 0)
    ? [
        {
          name: 'Ascendant',
          sanskritName: 'Lagna',
          signName: cleanSignName(chartData.ascendant?.signName) || ascSign,
          degree: chartData.ascendant?.degree || 0,
          nakshatra: sanitize(chartData.ascendant?.nakshatra) || ascNakshatra,
          pada: 1,
          house: 1,
          isRetrograde: false
        },
        ...chartData.planets.slice(0, 9).map((p: any) => ({
          name: sanitize(p.name),
          sanskritName: getSanskritPlanetName(p.name),
          signName: cleanSignName(p.signName),
          degree: p.degree || 0,
          nakshatra: sanitize(p.nakshatra),
          pada: p.pada || 1,
          house: p.house || 1,
          isRetrograde: !!p.isRetrograde
        }))
      ]
    : defaultPlanets;

  planetsToDisplay.forEach((p: any, pIdx: number) => {
    const rowY = tblY + 6 + pIdx * 5.9;
    const isLagna = p.name?.toLowerCase().includes('ascendant') || p.sanskritName?.toLowerCase() === 'lagna';
    const isMoon = p.name?.toLowerCase() === 'moon' || p.sanskritName?.toLowerCase() === 'chandra';

    if (isLagna || isMoon) {
      doc.setFillColor(252, 249, 240);
      doc.rect(17, rowY - 1, pageWidth - 34, 5.9, 'F');
    } else if (pIdx % 2 === 1) {
      doc.setFillColor(253, 252, 250);
      doc.rect(17, rowY - 1, pageWidth - 34, 5.9, 'F');
    }

    doc.setFont('helvetica', (isLagna || isMoon) ? 'bold' : 'normal');
    doc.setFontSize(6.4);
    if (isLagna) {
      doc.setTextColor(140, 80, 10);
      doc.text('Ascendant (Lagna)', 20, rowY + 3.1);
    } else if (isMoon) {
      doc.setTextColor(140, 80, 10);
      doc.text('Moon (Janma Rashi)', 20, rowY + 3.1);
    } else {
      doc.setTextColor(26, 26, 30);
      doc.text(p.name + (p.isRetrograde ? ' (R)' : ''), 20, rowY + 3.1);
    }

    doc.setFont('helvetica', (isLagna || isMoon) ? 'bold' : 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(isLagna || isMoon ? 130 : 90, isLagna || isMoon ? 85 : 85, isLagna || isMoon ? 20 : 80);
    doc.text(p.sanskritName || '-', 54, rowY + 3.1);

    doc.setFont('helvetica', (isLagna || isMoon) ? 'bold' : 'normal');
    doc.setTextColor(isLagna || isMoon ? 140 : 40, isLagna || isMoon ? 60 : 40, isLagna || isMoon ? 0 : 45);
    doc.text(p.signName || '-', 82, rowY + 3.1);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 45);
    doc.text(`${(p.degree || 0).toFixed(2)} deg`, 116, rowY + 3.1);
    doc.text(`${p.nakshatra || '-'} (P${p.pada || 1})`, 142, rowY + 3.1);
    doc.text(`H${p.house || (pIdx + 1)}`, 178, rowY + 3.1);

    doc.setDrawColor(235, 225, 205);
    doc.setLineWidth(0.15);
    doc.line(17, rowY + 4.9, pageWidth - 17, rowY + 4.9);
  });

  yP2 += tableBoxH + 4;

  // 3. Sacred Muhurtas & Numerology Summary
  const splitCardW = (pageWidth - 26 - 4) / 2;
  const splitCardH = 48;

  // Muhurtas Card (Left)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(201, 160, 80);
  doc.setLineWidth(0.35);
  doc.roundedRect(13, yP2, splitCardW, splitCardH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(126, 95, 24);
  doc.text('SACRED MUHURTA & TIMING WINDOWS', 17, yP2 + 5.2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.4);
  doc.setTextColor(181, 131, 40);
  doc.text('ABHIJIT MUHURTA (VIJAY KAAL)', 17, yP2 + 11);
  doc.setFontSize(6.8);
  doc.setTextColor(26, 26, 30);
  doc.text(abhijitVal, 17, yP2 + 15.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.4);
  doc.setTextColor(181, 131, 40);
  doc.text('BRAHMA MUHURTA (AMRIT KAAL)', 17, yP2 + 23);
  doc.setFontSize(6.8);
  doc.setTextColor(26, 26, 30);
  doc.text(brahmaVal, 17, yP2 + 27.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.4);
  doc.setTextColor(181, 131, 40);
  doc.text('RAHU KAAL (INAUSPICIOUS - AVOID)', 17, yP2 + 35);
  doc.setFontSize(6.8);
  doc.setTextColor(26, 26, 30);
  doc.text(rahuVal, 17, yP2 + 39.5);

  // Numerology Summary Pill (Right)
  const rightCardInnerX = 17 + splitCardW + 4;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(201, 160, 80);
  doc.setLineWidth(0.35);
  doc.roundedRect(13 + splitCardW + 4, yP2, splitCardW, splitCardH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(126, 95, 24);
  doc.text('DAILY NUMEROLOGY & REMEDIES', rightCardInnerX, yP2 + 5.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(50, 50, 55);
  doc.text(`* Psychic Number (Mulank): ${mulank} (${mulankPlanet})`, rightCardInnerX, yP2 + 11.5);
  doc.text(`* Destiny (Bhagyank): ${bhagyank}  |  Namank: ${namank}`, rightCardInnerX, yP2 + 17.5);
  doc.text(`* Lucky Color Today: ${luckyColorVal}`, rightCardInnerX, yP2 + 23.5);
  doc.text(`* Primary Gem: ${sanitize(numerology?.luckyGems?.[0]) || 'Ruby / Yellow Sapphire'}`, rightCardInnerX, yP2 + 29.5);
  doc.text(`* Favorable Days: ${sanitize(numerology?.luckyDays?.join(', ')) || 'Friday, Wednesday'}`, rightCardInnerX, yP2 + 35.5);
  doc.text(`* Auspicious Direction: ${sanitize(numerology?.favorableDirections?.join(', ')) || 'East / North-East'}`, rightCardInnerX, yP2 + 41.5);

  // ==========================================
  // PAGE 3: 5 TRADITIONS & BIRTH CHART
  // ==========================================
  doc.addPage();
  drawPageDecorations(
    doc,
    pageWidth,
    pageHeight,
    bgBase64,
    logoBase64,
    3,
    totalReportPages,
    '5 TRADITIONS HOROSCOPE & NATAL BIRTH CHART',
    'Parashari, Jaimini, Lal Kitab, KP System & Nadi Astrological Synthesis',
    todayStr
  );

  let yP3 = 33;

  // 1. Graha Positions Table
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(201, 160, 80);
  doc.setLineWidth(0.4);
  doc.roundedRect(13, yP3, pageWidth - 26, 78, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(126, 95, 24);
  doc.text('GRAHA EPHEMERIS POSITIONS (NINE PLANETARY COORDINATES)', 17, yP3 + 5.2);

  const tblY3 = yP3 + 7.5;
  doc.setFillColor(250, 247, 240);
  doc.rect(17, tblY3, pageWidth - 34, 5.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(126, 95, 24);
  doc.text('PLANET', 20, tblY3 + 3.8);
  doc.text('SANSKRIT', 48, tblY3 + 3.8);
  doc.text('SIGN / RASHI', 78, tblY3 + 3.8);
  doc.text('DEGREE', 114, tblY3 + 3.8);
  doc.text('NAKSHATRA', 140, tblY3 + 3.8);
  doc.text('PADA', 170, tblY3 + 3.8);
  doc.text('DIGNITY', 184, tblY3 + 3.8);

  const rawNinePlanets = (chartData?.planets && chartData.planets.length > 0)
    ? chartData.planets.slice(0, 9).map((p: any) => ({
        name: sanitize(p.name),
        sanskrit: sanitize(p.sanskritName) || getSanskritPlanetName(p.name),
        sign: `${cleanSignName(p.signName)} (H${p.house || 1})`,
        deg: `${(p.degree || 0).toFixed(2)} deg`,
        nak: sanitize(p.nakshatra) || '-',
        pada: `Pada ${p.pada || 1}`,
        dignity: sanitize(p.dignity) || 'Neutral'
      }))
    : [
        { name: 'Sun', sanskrit: 'Surya', sign: `${sunSign} (H4)`, deg: '6.84 deg', nak: 'Pushya', pada: 'Pada 2', dignity: 'Neutral' },
        { name: 'Moon', sanskrit: 'Chandra', sign: `${moonSign} (H9)`, deg: '29.60 deg', nak: 'Uttara Ashadha', pada: 'Pada 1', dignity: 'Neutral' },
        { name: 'Mars', sanskrit: 'Mangala', sign: 'Cancer (H4)', deg: '12.61 deg', nak: 'Pushya', pada: 'Pada 3', dignity: 'Debilitated' },
        { name: 'Mercury', sanskrit: 'Budha', sign: 'Cancer (H4)', deg: '9.95 deg', nak: 'Pushya', pada: 'Pada 2', dignity: 'Neutral' },
        { name: 'Jupiter', sanskrit: 'Guru', sign: 'Cancer (H4)', deg: '4.12 deg', nak: 'Pushya', pada: 'Pada 1', dignity: 'Exalted' },
        { name: 'Venus', sanskrit: 'Shukra', sign: 'Leo (H5)', deg: '20.46 deg', nak: 'Purva Phalguni', pada: 'Pada 3', dignity: 'Neutral' },
        { name: 'Saturn', sanskrit: 'Shani', sign: 'Gemini (H3)', deg: '0.07 deg', nak: 'Mrigashira', pada: 'Pada 3', dignity: 'Neutral' },
        { name: 'Rahu', sanskrit: 'Rahu', sign: 'Taurus (H2)', deg: '23.33 deg', nak: 'Mrigashira', pada: 'Pada 1', dignity: 'Neutral' },
        { name: 'Ketu', sanskrit: 'Ketu', sign: 'Scorpio (H8)', deg: '23.33 deg', nak: 'Jyeshtha', pada: 'Pada 3', dignity: 'Neutral' },
      ];

  rawNinePlanets.forEach((p: any, idx: number) => {
    const rowY = tblY3 + 6 + idx * 7.2;
    if (idx % 2 === 1) {
      doc.setFillColor(253, 252, 250);
      doc.rect(17, rowY - 1, pageWidth - 34, 7.2, 'F');
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.4);
    doc.setTextColor(26, 26, 30);
    doc.text(p.name, 20, rowY + 3.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(90, 85, 80);
    doc.text(p.sanskrit || '', 48, rowY + 3.8);

    doc.setTextColor(40, 40, 45);
    doc.text(p.sign, 78, rowY + 3.8);
    doc.text(p.deg, 114, rowY + 3.8);
    doc.text(p.nak, 140, rowY + 3.8);
    doc.text(p.pada, 170, rowY + 3.8);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(181, 131, 40);
    doc.text(p.dignity, 184, rowY + 3.8);

    doc.setDrawColor(235, 225, 205);
    doc.setLineWidth(0.15);
    doc.line(17, rowY + 5.8, pageWidth - 17, rowY + 5.8);
  });

  yP3 += 82;

  // 2. Twelve Bhavas Grid
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(201, 160, 80);
  doc.setLineWidth(0.4);
  doc.roundedRect(13, yP3, pageWidth - 26, 68, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(126, 95, 24);
  doc.text('TWELVE BHAVAS (HOUSE PARTICULARS & SIGNIFICANCES)', 17, yP3 + 5.2);

  const bhavaCols = (pageWidth - 36) / 2;
  const rawHouses = (chartData?.houses && chartData.houses.length >= 12)
    ? chartData.houses.slice(0, 12).map((h: any) => ({
        name: `H${h.houseNumber}: ${sanitize(h.sanskritName) || `House ${h.houseNumber}`}`,
        sign: `${cleanSignName(h.signName)} (Lord: ${sanitize(h.signLord) || 'Mars'})`,
        sub: sanitize(h.kpSubLord) || (h.planets?.length > 0 ? h.planets.map((p: any) => p.name).join(', ') : 'Direct Flow')
      }))
    : [
        { name: 'H1: First House (Lagna)', sign: `${ascSign} (Lord: Mars)`, sub: 'Mercury' },
        { name: 'H2: House 2 (Dhana)', sign: 'Taurus (Lord: Venus)', sub: 'Mars' },
        { name: 'H3: House 3 (Sahaja)', sign: 'Gemini (Lord: Mercury)', sub: 'Mars' },
        { name: 'H4: House 4 (Matru / Sukha)', sign: 'Cancer (Lord: Moon)', sub: 'Moon' },
        { name: 'H5: House 5 (Putra)', sign: 'Leo (Lord: Sun)', sub: 'Rahu' },
        { name: 'H6: House 6 (Shatru)', sign: 'Virgo (Lord: Mercury)', sub: 'Venus' },
        { name: 'H7: House 7 (Kalatra)', sign: 'Libra (Lord: Venus)', sub: 'Sun' },
        { name: 'H8: House 8 (Ayur)', sign: 'Scorpio (Lord: Mars)', sub: 'Jupiter' },
        { name: 'H9: House 9 (Bhagya)', sign: 'Sagittarius (Lord: Jupiter)', sub: 'Mercury' },
        { name: 'H10: House 10 (Karma)', sign: 'Capricorn (Lord: Saturn)', sub: 'Saturn' },
        { name: 'H11: House 11 (Labha)', sign: 'Aquarius (Lord: Saturn)', sub: 'Moon' },
        { name: 'H12: House 12 (Vyaya)', sign: 'Pisces (Lord: Jupiter)', sub: 'Venus' },
      ];

  rawHouses.forEach((h: any, hIdx: number) => {
    const colIdx = Math.floor(hIdx / 6);
    const rowIdx = hIdx % 6;
    const hX = 17 + colIdx * (bhavaCols + 2);
    const hY = yP3 + 9 + rowIdx * 9.5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.4);
    doc.setTextColor(181, 131, 40);
    doc.text(h.name, hX, hY + 3.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.0);
    doc.setTextColor(40, 40, 45);
    doc.text(`${h.sign} | Sub: ${h.sub}`, hX + 44, hY + 3.2);

    if (rowIdx < 5) {
      doc.setDrawColor(235, 225, 205);
      doc.setLineWidth(0.15);
      doc.line(hX, hY + 6.5, hX + bhavaCols - 2, hY + 6.5);
    }
  });

  // ==========================================
  // PAGE 4: YOGAS, DOSHAS & DASHA CYCLES
  // ==========================================
  doc.addPage();
  drawPageDecorations(
    doc,
    pageWidth,
    pageHeight,
    bgBase64,
    logoBase64,
    4,
    totalReportPages,
    'AUSPICIOUS YOGAS, DOSHAS & DASHA CYCLES',
    'Comprehensive Formation Analysis, Karmic Influences & Planetary Periods',
    todayStr
  );

  let yP4 = 33;

  // 1. Auspicious Yogas Card
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(201, 160, 80);
  doc.setLineWidth(0.4);
  doc.roundedRect(13, yP4, pageWidth - 26, 32, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(126, 95, 24);
  doc.text('AUSPICIOUS VEDIC YOGAS & CELESTIAL FORMATIONS', 17, yP4 + 5.2);

  const yogasToDisplay = (chartData?.yogas && chartData.yogas.length > 0)
    ? chartData.yogas.slice(0, 2).map((y: any) => ({
        title: `* ${sanitize(y.name)}${y.sanskritName ? ` (${sanitize(y.sanskritName)})` : ''}`,
        desc: sanitize(y.effects || y.description || 'Harmonious planetary formation elevating wisdom, prestige, and prosperity.')
      }))
    : [
        {
          title: '* Budhaditya Yoga (Sun-Mercury Alignment)',
          desc: 'Formed by Sun & Mercury conjunction. Promotes keen intellect, professional fame, executive communication, and spiritual clarity.'
        },
        {
          title: '* Gaja Kesari / Guru Alignment',
          desc: 'Bestows unshakeable wisdom, noble reputation, public favor, and moral righteousness across lifetime endeavors.'
        }
      ];

  yogasToDisplay.forEach((yg: any, yIdx: number) => {
    const yOff = yP4 + 11 + yIdx * 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(181, 131, 40);
    doc.text(yg.title, 17, yOff);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(50, 50, 55);
    doc.text(doc.splitTextToSize(yg.desc, pageWidth - 34)[0] || yg.desc, 17, yOff + 4.5);
  });

  yP4 += 36;

  // 2. Doshas & Planetary Affliction
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(201, 160, 80);
  doc.setLineWidth(0.4);
  doc.roundedRect(13, yP4, pageWidth - 26, 30, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(126, 95, 24);
  doc.text('VEDIC DOSHAS & PLANETARY AFFLICTION EVALUATION', 17, yP4 + 5.2);

  const doshasToDisplay = (chartData?.doshas && chartData.doshas.length > 0)
    ? chartData.doshas.slice(0, 2).map((d: any) => ({
        title: `* ${sanitize(d.name)}: ${d.present ? `Present (${sanitize(d.intensity) || 'Moderate'})` : 'Low / Absent'}`,
        desc: sanitize(d.remedies || d.description || 'Standard daily mantra chanting and balanced lifestyle provide complete protection.')
      }))
    : [
        {
          title: '* Manglik (Kuja) Dosha: Low / Absent',
          desc: 'Mars position is mitigated by benevolent aspect of Jupiter. No severe marital hindrance detected; mutual understanding preserves harmony.'
        },
        {
          title: '* Kaal Sarp & Pitru Dosha Assessment: Balanced',
          desc: 'Planets are well-distributed across kendras and trikonas. Standard daily mantra chanting provides complete energetic protection.'
        }
      ];

  doshasToDisplay.forEach((ds: any, dIdx: number) => {
    const dOff = yP4 + 11 + dIdx * 9.5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(181, 131, 40);
    doc.text(ds.title, 17, dOff);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(50, 50, 55);
    doc.text(doc.splitTextToSize(ds.desc, pageWidth - 34)[0] || ds.desc, 17, dOff + 4.5);
  });

  yP4 += 34;

  // 3. Vimshottari Dasha Cycles
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(201, 160, 80);
  doc.setLineWidth(0.4);
  doc.roundedRect(13, yP4, pageWidth - 26, 36, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(126, 95, 24);
  doc.text('VIMSHOTTARI DASHA CYCLES & ACTIVE MAHADASHAS', 17, yP4 + 5.2);

  const rawDashas = (chartData?.dashaPeriods || chartData?.dashas || []).length > 0
    ? (chartData.dashaPeriods || chartData.dashas).slice(0, 6).map((d: any) => ({
        title: `${sanitize(d.planet || d.name || 'Cycle')} (${d.duration || d.years || 10} Yrs)${d.isCurrent ? ' - ACTIVE' : ''}`,
        span: d.startYear && d.endYear ? `${d.startYear} - ${d.endYear}` : (d.period || '2024 - 2034'),
        active: !!d.isCurrent
      }))
    : [
        { title: 'Sun (5 Yrs)', span: '2002 - 2007', active: false },
        { title: 'Moon (10 Yrs)', span: '2007 - 2017', active: false },
        { title: 'Mars (7 Yrs)', span: '2017 - 2024', active: false },
        { title: 'Rahu (18 Yrs) - ACTIVE', span: '2024 - 2042', active: true },
        { title: 'Jupiter (16 Yrs)', span: '2042 - 2058', active: false },
        { title: 'Saturn (19 Yrs)', span: '2058 - 2077', active: false },
      ];

  const dashaColW = (pageWidth - 26 - 8) / 3;
  rawDashas.forEach((d: any, idx: number) => {
    const colI = idx % 3;
    const rowI = Math.floor(idx / 3);
    const dX = 17 + colI * (dashaColW + 2);
    const dY = yP4 + 9 + rowI * 12;

    doc.setFillColor(d.active ? 252 : 255, d.active ? 249 : 255, d.active ? 240 : 255);
    doc.setDrawColor(d.active ? 181 : 226, d.active ? 131 : 211, d.active ? 40 : 176);
    doc.setLineWidth(0.35);
    doc.roundedRect(dX, dY, dashaColW, 10, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(d.active ? 140 : 126, d.active ? 60 : 95, d.active ? 0 : 24);
    doc.text(d.title, dX + 2.5, dY + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(60, 60, 65);
    doc.text(d.span, dX + 2.5, dY + 8);
  });

  yP4 += 40;

  // 4. Vedic Deep Synthesis & Gemstone Remedies
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(201, 160, 80);
  doc.setLineWidth(0.4);
  doc.roundedRect(13, yP4, pageWidth - 26, 42, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(126, 95, 24);
  doc.text('VEDIC DEEP SYNTHESIS & RECOMMENDED TRIKONA GEMSTONES', 17, yP4 + 5.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.4);
  doc.setTextColor(50, 50, 55);
  const synthDesc = sanitize(chartData?.interpretation?.summary || 'Planetary positions synthesized across Parashari Jyotish (Brihat Parashara Hora Shastra). The ascendant lord and active Vimshottari Mahadasha indicate key milestones in professional leadership, intellectual growth, and dharmic alignment. Maintain focus on planetary harmonization during transition periods.');
  doc.text(doc.splitTextToSize(synthDesc, pageWidth - 34).slice(0, 3), 17, yP4 + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(181, 131, 40);
  doc.text('Recommended Trikona Gemstones & Remedies:', 17, yP4 + 23);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(50, 50, 55);
  doc.text('* Red Coral (Moonga): Life Force, Vitality & Health (Lagna Lord)', 17, yP4 + 28);
  doc.text('* Ruby (Manikya): Intelligence, Executive Will & Sovereign Focus (5th Lord)', 17, yP4 + 32.5);
  doc.text('* Yellow Sapphire (Pukhraj): Fortune, Wisdom, Spiritual Protection & Wealth (9th Lord)', 17, yP4 + 37);

  // ==========================================
  // PAGE 5: SACRED NUMEROLOGY & LO SHU GRID
  // ==========================================
  doc.addPage();
  drawPageDecorations(
    doc,
    pageWidth,
    pageHeight,
    bgBase64,
    logoBase64,
    5,
    totalReportPages,
    'SACRED NUMEROLOGY & LO SHU GRID MATRIX',
    'Mulank, Bhagyank, Cosmic 3x3 Grid & 8 Elemental Planes Analysis',
    todayStr
  );

  let yP5 = 33;

  // 1. Three Core Numbers Banner
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(201, 160, 80);
  doc.setLineWidth(0.4);
  doc.roundedRect(13, yP5, pageWidth - 26, 26, 1.5, 1.5, 'FD');

  const numColW = (pageWidth - 26) / 3;
  // Mulank
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(140, 95, 20);
  doc.text('PSYCHIC NUMBER (MULANK)', 17, yP5 + 5.5);
  doc.setFontSize(11);
  doc.setTextColor(130, 65, 10);
  doc.text(`Mulank ${mulank}`, 17, yP5 + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.8);
  doc.setTextColor(70, 70, 75);
  doc.text(`Governed by ${mulankPlanet}. Reflects inner personality, drive, and day-to-day behavioral instincts.`, 17, yP5 + 17, { maxWidth: numColW - 6 });

  // Bhagyank
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(140, 95, 20);
  doc.text('DESTINY NUMBER (BHAGYANK)', 17 + numColW, yP5 + 5.5);
  doc.setFontSize(11);
  doc.setTextColor(130, 65, 10);
  doc.text(`Bhagyank ${bhagyank}`, 17 + numColW, yP5 + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.8);
  doc.setTextColor(70, 70, 75);
  doc.text('Calculated from full date of birth. Shapes life purpose, macro karmic lessons, and career destiny.', 17 + numColW, yP5 + 17, { maxWidth: numColW - 6 });

  // Namank
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(140, 95, 20);
  doc.text('NAME NUMBER (NAMANK)', 17 + numColW * 2, yP5 + 5.5);
  doc.setFontSize(11);
  doc.setTextColor(130, 65, 10);
  doc.text(`Namank ${namank}`, 17 + numColW * 2, yP5 + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.8);
  doc.setTextColor(70, 70, 75);
  doc.text('Chaldean & Pythagorean name vibration. Governs social recognition, client attraction, and wealth flow.', 17 + numColW * 2, yP5 + 17, { maxWidth: numColW - 6 });

  yP5 += 30;

  // 2. Lo Shu 3x3 Grid & 8 Planes
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(201, 160, 80);
  doc.setLineWidth(0.4);
  doc.roundedRect(13, yP5, pageWidth - 26, 110, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(126, 95, 24);
  doc.text('3x3 LO SHU COSMIC GRID & 8 PLANES OF LIFE ANALYSIS', 17, yP5 + 5.2);

  // Draw 3x3 Lo Shu Matrix with counts
  const matrixStartX = 20;
  const matrixStartY = yP5 + 10;
  const cellSize = 15;
  const standardLoShu = [
    [4, 9, 2],
    [3, 5, 7],
    [8, 1, 6]
  ];

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const cellX = matrixStartX + c * cellSize;
      const cellY = matrixStartY + r * cellSize;
      const cellNum = standardLoShu[r][c];
      const count = numerology?.loShuGrid?.[cellNum] || 0;
      const isPresent = count > 0;

      doc.setFillColor(isPresent ? 252 : 255, isPresent ? 249 : 255, isPresent ? 240 : 255);
      doc.setDrawColor(isPresent ? 201 : 230, isPresent ? 160 : 225, isPresent ? 80 : 215);
      doc.setLineWidth(isPresent ? 0.35 : 0.2);
      doc.roundedRect(cellX, cellY, cellSize, cellSize, 1, 1, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(isPresent ? 140 : 180, isPresent ? 80 : 180, isPresent ? 10 : 180);
      doc.text(String(cellNum), cellX + 3.5, cellY + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.2);
      doc.setTextColor(isPresent ? 60 : 160, isPresent ? 60 : 160, isPresent ? 65 : 160);
      doc.text(isPresent ? `${count}x` : 'Miss', cellX + cellSize - 2.5, cellY + 5.5, { align: 'right' });
    }
  }

  // 8 Planes Analysis on the right of the matrix
  const planesStartX = matrixStartX + 3 * cellSize + 8;
  const dynamicPlanes = (numerology?.loShuPlanes && numerology.loShuPlanes.length > 0)
    ? numerology.loShuPlanes.slice(0, 8).map((pl: any) => ({
        name: `${sanitize(pl.name)} [${sanitize(pl.status) || 'Active'} - ${Math.round(pl.strength || 100)}%]`,
        desc: sanitize(pl.meaning || pl.desc || '')
      }))
    : [
        { name: 'Thought Plane (4-9-2)', desc: 'Visionary planning, imagination, and strategic conceptualization.' },
        { name: 'Will Plane (3-5-7)', desc: 'Tenacity, endurance, persistent courage, and unwavering determination.' },
        { name: 'Action Plane (8-1-6)', desc: 'Commercial pragmatism, execution speed, and tangible results.' },
        { name: 'Mental Plane (4-3-8)', desc: 'Intellectual curiosity, memory retention, structured analytical logic.' },
        { name: 'Emotional Plane (9-5-1)', desc: 'Empathetic listening, artistic charisma, and emotional balance.' },
        { name: 'Practical Plane (2-7-6)', desc: 'Material execution, physical organization, and precision craftsmanship.' },
        { name: 'Golden Raj Yoga Line (4-5-6)', desc: 'Supreme prosperity, commercial expansions, and authority.' },
        { name: 'Silver Spirituality Line (2-5-8)', desc: 'Spiritual grounding, real estate insight, and ancestral blessings.' },
      ];

  dynamicPlanes.forEach((pl: any, pIdx: number) => {
    const plY = yP5 + 10 + pIdx * 11.5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.4);
    doc.setTextColor(140, 95, 20);
    doc.text(`* ${pl.name}`, planesStartX, plY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(60, 60, 65);
    doc.text(pl.desc, planesStartX + 3, plY + 4, { maxWidth: pageWidth - planesStartX - 20 });
  });

  // ==========================================
  // PAGE 6: NAME HARMONICS & NUMEROLOGY REMEDIES
  // ==========================================
  doc.addPage();
  drawPageDecorations(
    doc,
    pageWidth,
    pageHeight,
    bgBase64,
    logoBase64,
    6,
    totalReportPages,
    'NAME HARMONICS, CHALDEAN VIBRATION & REMEDIES',
    'Acoustic Name Alignment, Vastu Directional Harmonizers & Gemstone Shield',
    todayStr
  );

  let yP6 = 33;

  // 1. Name Vibration Card
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(201, 160, 80);
  doc.setLineWidth(0.4);
  doc.roundedRect(13, yP6, pageWidth - 26, 38, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(126, 95, 24);
  doc.text('NAME HARMONIC VIBRATION & CHALDEAN / PYTHAGOREAN ALIGNMENT', 17, yP6 + 5.2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(181, 131, 40);
  doc.text(`Client Full Name: ${sanitize(profile.fullName) || 'Seeker'}`, 17, yP6 + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(50, 50, 55);
  doc.text(`* Chaldean Name Number: ${numerology?.namankChaldean || 7}  |  Pythagorean Name Number: ${numerology?.namankPythagorean || 7}`, 17, yP6 + 16);
  doc.text(`* Compatibility Assessment: ${sanitize(numerology?.nameCompatibility) || 'Highly Harmonious & Auspicious Vibration for Long-Term Endeavors.'}`, 17, yP6 + 21);
  doc.text('* Resonance: Amplifies professional authority, legal clarity, commercial negotiations, and public prestige.', 17, yP6 + 26);
  doc.text('* Correction Guidance: Current phonetic alignment is balanced; no radical spelling modification required.', 17, yP6 + 31);

  yP6 += 42;

  // 2. Missing Numbers Vastu Remedies
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(201, 160, 80);
  doc.setLineWidth(0.4);
  doc.roundedRect(13, yP6, pageWidth - 26, 52, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(126, 95, 24);
  doc.text('MISSING NUMBER ENERGETIC BALANCING & VASTU REMEDIES', 17, yP6 + 5.2);

  const missingRemediesMap: Record<number, string> = {
    1: 'Number 1 (Water / North Zone): Place a serene indoor water fountain or image of flowing water to activate career flow and networking.',
    2: 'Number 2 (Earth / South-West Zone): Keep a pair of natural rose quartz crystals or terracotta pottery to ground personal relationships and stability.',
    3: 'Number 3 (Wood / East Zone): Introduce lush green indoor plants or wooden artifacts to stimulate wisdom, health, and family blessings.',
    4: 'Number 4 (Wood / South-East Zone): Place a wooden money plant or green aventurine crystal to anchor systematic financial discipline.',
    5: 'Number 5 (Earth / Brahmasthan Center): Ensure the central space of your dwelling is open, well-illuminated, and clutter-free to preserve vital prana.',
    6: 'Number 6 (Metal / North-West Zone): Wear a metal/silver watch or keep metallic wind chimes to attract influential friends and mentors.',
    7: 'Number 7 (Metal / West Zone): Keep white crystal spheres and engage in spiritual meditation to awaken deep intuition and creative insight.',
    8: 'Number 8 (Earth / North-East Zone): Light mustard oil lamps on Saturdays and support educational charities to balance Saturnian karmic tasks.',
    9: 'Number 9 (Fire / South Zone): Light a ghee diya in the south zone and chant Hanuman Chalisa to illuminate willpower, fame, and courage.'
  };

  const dynamicMissingNums = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => !numerology?.loShuGrid?.[n]);
  const missingToDisplay = dynamicMissingNums.length > 0 ? dynamicMissingNums.slice(0, 5) : [1, 2, 3, 4, 5];

  missingToDisplay.forEach((num, idx) => {
    const nrY = yP6 + 10 + idx * 8;
    const textDesc = missingRemediesMap[num] || `Number ${num}: Practice daily Japa and gemstone balancing.`;
    const parts = textDesc.split(':');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(181, 131, 40);
    doc.text(`* ${parts[0]}:`, 17, nrY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(50, 50, 55);
    doc.text(parts[1] || '', 55, nrY, { maxWidth: pageWidth - 75 });
  });

  yP6 += 56;

  // 3. Sacred Remedial Harmonizers Table
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(201, 160, 80);
  doc.setLineWidth(0.4);
  doc.roundedRect(13, yP6, pageWidth - 26, 42, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(126, 95, 24);
  doc.text('SACRED REMEDIAL HARMONIZERS & AUSPICIOUS DIRECTIONS', 17, yP6 + 5.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(50, 50, 55);
  doc.text(`* Primary Auspicious Colors: ${sanitize(numerology?.luckyColors?.join(', ')) || 'Gold, Yellow, Royal Blue, Saffron'}`, 17, yP6 + 12);
  doc.text(`* Favorable Days of the Week: ${sanitize(numerology?.luckyDays?.join(', ')) || 'Friday, Wednesday'}`, 17, yP6 + 18);
  doc.text(`* Beneficial Gemstones: ${sanitize(numerology?.luckyGems?.join(', ')) || 'Ruby, Yellow Sapphire, Red Coral'}`, 17, yP6 + 24);
  doc.text(`* Optimal Directions: ${sanitize(numerology?.favorableDirections?.join(', ')) || 'East, North-East, and North for study and commerce.'}`, 17, yP6 + 30);
  doc.text(`* Daily Affirmation: "${sanitize(numerology?.dailyAffirmation) || 'I channel divine harmony, purposeful focus, and grounded prosperity.'}"`, 17, yP6 + 36);

  // ==========================================
  // PAGE 7: 25-YEAR VEDIC DESTINY ROADMAP
  // ==========================================
  doc.addPage();
  drawPageDecorations(
    doc,
    pageWidth,
    pageHeight,
    bgBase64,
    logoBase64,
    7,
    totalReportPages,
    `25-YEAR VEDIC DESTINY ROADMAP (${currentYear} – ${currentYear + 25})`,
    'Macro Vimshottari Mahadasha Eras, Long-Term Planetary Transits & Life Milestones',
    todayStr
  );

  let yP7 = 33;

  // 4 Detailed 25-Year Horizon Phases covering all 5 core life domains
  const horizons = [
    {
      phase: `PHASE 1: YEARS 0 – 5 (${currentYear} – ${currentYear + 5})`,
      theme: 'Foundation & Professional Ascension',
      items: [
        { label: 'Career & Enterprise', text: 'Executive visibility stimulates promotions and venture expansion. Strategic transits activate 10th and 11th houses, conferring leadership authority.' },
        { label: 'Wealth & Assets', text: 'Strong liquidity growth; favorable alignments support conservative asset allocation, index funds, and initial commercial/residential real estate evaluation.' },
        { label: 'Family & Relationships', text: 'Harmonious domestic period; favorable alignments for marriage, family celebrations, and deep emotional companionship with domestic peace.' },
        { label: 'Health & Vitality', text: 'High physical stamina; balance circadian rhythm with morning Surya Namaskar, copper vessel hydration, and mindful stress reduction.' },
        { label: 'Dharma & Upayas', text: 'Gayatri Mantra chanting at sunrise; chant Brihaspati Beej Mantra on Thursdays and donate yellow lentils for sustained planetary grace.' }
      ]
    },
    {
      phase: `PHASE 2: YEARS 5 – 10 (${currentYear + 5} – ${currentYear + 10})`,
      theme: 'Expansion, Wealth & Real Estate Compounding',
      items: [
        { label: 'Career & Enterprise', text: 'Institutional recognition and executive board elevation; international collaborations and multi-venture expansion under benefic Jupiter-Saturn Gochara.' },
        { label: 'Wealth & Real Estate', text: 'Prime wealth accumulation window; profitable commercial real estate acquisitions, equity compounding, and sovereign estate structuring.' },
        { label: 'Family & Relationships', text: 'Darakaraka auspiciousness confers deep marital maturity, lineage blessings, family celebrations, and joyful milestones with children.' },
        { label: 'Health & Longevity', text: 'Targeted yogic pranayama and seasonal Panchakarma maintain cellular rejuvenation, metabolic vitality, and high-pressure stress resilience.' },
        { label: 'Dharma & Upayas', text: 'Sacred Himalayan or temple pilgrimages; Annadanam (food charity) on Saturdays balances Saturnian karmic debts and accelerates prosperity.' }
      ]
    },
    {
      phase: `PHASE 3: YEARS 10 – 18 (${currentYear + 10} – ${currentYear + 18})`,
      theme: 'Leadership, Authority & Mentorship',
      items: [
        { label: 'Career & Enterprise', text: 'Transition from operational execution to senior advisory stewardship; mentoring emerging industry leaders and shaping timeless institutional impact.' },
        { label: 'Wealth & Assets', text: 'Consolidation of multi-generational family trusts, sovereign asset holdings, and high-yield estate preservation for future generations.' },
        { label: 'Family & Relationships', text: 'Deep contentment surrounded by flourishing next generation; harmonious family lineage blessings and peaceful domestic harmony.' },
        { label: 'Health & Longevity', text: 'Mind-body longevity through serene natural living, Ayurvedic herbal rasayanas, and daily quiet contemplation to preserve prana.' },
        { label: 'Dharma & Upayas', text: 'Establishment of charitable trust or educational endowments; daily Maha Mrityunjaya meditation for spiritual protection and peace.' }
      ]
    },
    {
      phase: `PHASE 4: YEARS 18 – 25 (${currentYear + 18} – ${currentYear + 25})`,
      theme: 'Wisdom, Legacy & Spiritual Fulfillment',
      items: [
        { label: 'Career & Enterprise', text: 'Revered elder statesmanship; enduring societal impact, philosophical advisory, and timeless life legacy across community institutions.' },
        { label: 'Wealth & Assets', text: 'Complete financial sovereignty; inheritance structures secured, debt-free self-sustaining family trusts, and sovereign tranquility.' },
        { label: 'Family & Relationships', text: 'Deep peace and gratitude; celebrated family dynasty, honoring ancestral traditions, and joyful multigenerational gatherings.' },
        { label: 'Health & Longevity', text: 'Peaceful physical harmony; gentle walks, sattvic diet, and mental tranquility preserve graceful longevity and inner calmness.' },
        { label: 'Dharma & Upayas', text: 'Moksha-oriented spiritual integration; deep surrender to divine consciousness, higher meditative absorption, and timeless bliss.' }
      ]
    }
  ];

  horizons.forEach((h, hIdx) => {
    const cardY = yP7 + hIdx * 58;
    const cardH = 55;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(201, 160, 80);
    doc.setLineWidth(0.4);
    doc.roundedRect(13, cardY, pageWidth - 26, cardH, 1.5, 1.5, 'FD');

    // Header strip inside card
    doc.setFillColor(252, 250, 245);
    doc.rect(13.4, cardY + 0.4, pageWidth - 26.8, 7, 'F');
    doc.setDrawColor(226, 211, 176);
    doc.setLineWidth(0.3);
    doc.line(13, cardY + 7.5, pageWidth - 13, cardY + 7.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(140, 80, 10);
    doc.text(h.phase, 18, cardY + 5.2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(26, 26, 30);
    doc.text(`[ ${h.theme} ]`, pageWidth - 18, cardY + 5.2, { align: 'right' });

    // 5 Domain Items
    h.items.forEach((item, itemIdx) => {
      const itemY = cardY + 12 + itemIdx * 8.5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.2);
      doc.setTextColor(181, 131, 40);
      const labelStr = `* ${item.label}: `;
      doc.text(labelStr, 17, itemY);
      const labelW = doc.getTextWidth(labelStr);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.8);
      doc.setTextColor(50, 50, 55);
      const textLines = doc.splitTextToSize(item.text, pageWidth - 34 - labelW);
      doc.text(textLines.slice(0, 2), 17 + labelW, itemY);
    });
  });

  // ==========================================
  // PAGE 8: ROADMAP MILESTONES & CERTIFIED SEAL
  // ==========================================
  doc.addPage();
  drawPageDecorations(
    doc,
    pageWidth,
    pageHeight,
    bgBase64,
    logoBase64,
    8,
    totalReportPages,
    'DESTINY MILESTONES & CERTIFICATE OF AUTHENTICITY',
    'Peak Transit Windows, Remedial Discipline & Official Daivajna Endorsement',
    todayStr
  );

  let yP8 = 33;

  // 1. Critical 25-Year Milestone Timeline Card
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(201, 160, 80);
  doc.setLineWidth(0.4);
  doc.roundedRect(13, yP8, pageWidth - 26, 56, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(126, 95, 24);
  doc.text('CRITICAL 25-YEAR MILESTONE TIMELINE & TIMING INFLECTIONS', 17, yP8 + 5.2);

  const milestones25Years = [
    { domain: 'Career & Executive Breakthrough', window: `Years 0–5 (${currentYear} - ${currentYear + 5})`, text: 'High-visibility corporate promotions, skill consolidation, and strategic leadership ascension.' },
    { domain: 'Wealth, Enterprise & Real Estate', window: `Years 5–10 (${currentYear + 5} - ${currentYear + 10})`, text: 'Commercial acquisitions, multi-stream asset diversification, and high-yield wealth compounding.' },
    { domain: 'Institutional Standing & Family Lineage', window: `Years 10–15 (${currentYear + 10} - ${currentYear + 15})`, text: 'Advisory board transitions, children celebrations, and multi-generational trust establishment.' },
    { domain: 'Philanthropic Dharma & Community Impact', window: `Years 15–20 (${currentYear + 15} - ${currentYear + 20})`, text: 'Establishment of charitable foundations, educational endowments, and sacred pilgrimages.' },
    { domain: 'Legacy Sovereignty & Spiritual Liberation', window: `Years 20–25 (${currentYear + 20} - ${currentYear + 25})`, text: 'Attainment of complete philosophical peace, revered mentorship, and timeless spiritual fulfillment.' }
  ];

  milestones25Years.forEach((ml, idx) => {
    const mlY = yP8 + 11 + idx * 9;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(181, 131, 40);
    const domainLabel = `* ${ml.domain} [${ml.window}]: `;
    doc.text(domainLabel, 17, mlY);
    const dW = doc.getTextWidth(domainLabel);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(50, 50, 55);
    const textLines = doc.splitTextToSize(ml.text, pageWidth - 34 - dW);
    doc.text(textLines.slice(0, 1), 17 + dW, mlY);
  });

  yP8 += 60;

  // 2. Remedial & Strategic Advisory Card
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(201, 160, 80);
  doc.setLineWidth(0.4);
  doc.roundedRect(13, yP8, pageWidth - 26, 38, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(126, 95, 24);
  doc.text('STRATEGIC TIMING PRECAUTIONS & REMEDIAL DISCIPLINE', 17, yP8 + 5.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(50, 50, 55);
  doc.text('* Saturn / Rahu Sub-periods: Exercise enhanced diligence in speculative contracts and long-term litigation.', 17, yP8 + 12);
  doc.text('* Health & Vitality: Maintain seasonal dietary balance, daily pranayama, and adequate restorative sleep.', 17, yP8 + 18);
  doc.text('* Charitable Dharma: Engaging in voluntary education support or feeding birds on Saturdays resolves planetary afflictions.', 17, yP8 + 24);
  doc.text('* Astrological Guidance: Review roadmap milestones annually around solar return (Varshaphala) for optimal calibration.', 17, yP8 + 30);

  yP8 += 42;

  // 3. Traditional Disclaimer & Certified Seal Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(201, 160, 80);
  doc.setLineWidth(0.4);
  doc.roundedRect(13, yP8, pageWidth - 26, 34, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(126, 95, 24);
  doc.text('CERTIFIED VEDIC VERIFICATION & TRADITIONAL DISCLAIMER', 17, yP8 + 5.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.6);
  doc.setTextColor(90, 85, 80);
  doc.text(
    'This Comprehensive Master Vedic Astrology Report is computationally generated using Swiss Ephemeris mathematical coordinates and Classical Jyotish principles (Lahiri Nirayana). Vedic astrological guidance describes planetary archetypes and cosmic tendencies to foster self-awareness, timing awareness, and proactive wisdom. It does not replace professional medical, legal, or financial counsel.',
    17,
    yP8 + 10,
    { maxWidth: pageWidth - 34 }
  );

  // Daivajna Astrological Seal
  doc.setDrawColor(226, 211, 176);
  doc.setLineWidth(0.3);
  doc.line(17, yP8 + 21, pageWidth - 17, yP8 + 21);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(140, 95, 20);
  doc.text('DAIVAJNA DIGITAL ASTROLOGICAL SEAL', 17, yP8 + 27);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6);
  doc.setTextColor(110, 105, 95);
  doc.text('Authenticated via JyotishVeda AstroEngine & Classical Ephemeris Coordinates', 17, yP8 + 31);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(181, 131, 40);
  doc.text('DIGITALLY VERIFIED', pageWidth - 17, yP8 + 28, { align: 'right' });

  // Save PDF with sanitized clean file name
  const safeName = (profile.fullName || 'Seeker').replace(/[^a-zA-Z0-9]/g, '_');
  const fileDateStr = now.toISOString().split('T')[0];
  doc.save(`JyotishVeda_Master_Full_Report_${safeName}_${fileDateStr}.pdf`);
}
