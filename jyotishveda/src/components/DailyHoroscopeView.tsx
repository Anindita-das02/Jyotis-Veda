import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Clock,
  Sparkles,
  Calendar,
  AlertTriangle,
  Flame,
  Volume2,
  CheckCircle2,
  Share2,
  Shield,
  Compass,
  Zap,
  Download,
  FileText,
  Loader2,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { API_ENDPOINTS } from '../config/api_config';
import { UserProfile, PanchangInfo, NumerologyReport } from '../types';

const getPlanetForNumber = (num: number): string => {
  const reduced = num > 9 ? num % 9 || 9 : num;
  const planets = ['Sun', 'Moon', 'Jupiter', 'Rahu', 'Mercury', 'Venus', 'Ketu', 'Saturn', 'Mars'];
  return planets[reduced - 1] || 'Unknown';
};

interface DailyHoroscopeViewProps {
  profile: UserProfile;
  panchang: PanchangInfo;
  numerology: NumerologyReport;
  chartData: any;
  onNavigateToTab: (tab: string) => void;
  theme: 'light' | 'dark';
}

interface DailyAiInsights {
  summary: string;
  career: string;
  love: string;
  health: string;
  lucky_color_desc?: string;
}

export const DailyHoroscopeView: React.FC<DailyHoroscopeViewProps> = ({
  profile,
  panchang,
  numerology,
  chartData,
  onNavigateToTab,
  theme,
}) => {
  const [aiInsights, setAiInsights] = useState<DailyAiInsights | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Helper to load image as base64 DataURL for jsPDF canvas rendering
  const loadImageBase64 = (url: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width || 400;
          canvas.height = img.naturalHeight || img.height || 400;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
            return;
          }
        } catch {
          // Ignore canvas security errors
        }
        resolve(null);
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  const fetchDailyAiReading = async () => {
    setIsLoadingAi(true);
    try {
      const data = await api.post<{ insights: DailyAiInsights }>(API_ENDPOINTS.INSIGHTS.DAILY_HOROSCOPE, {
        profile,
        chartData,
        panchang,
        numerology,
      });
      if (data && data.insights) {
        setAiInsights(data.insights);
      }
    } catch (e) {
      console.error('Failed to fetch AI insights:', e);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSpeech = () => {
    if (!('speechSynthesis' in window)) return;
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }
    if (!aiInsights) return;
    const text = `${aiInsights.summary}. For your career: ${aiInsights.career}. In love and harmony: ${aiInsights.love}. For your health: ${aiInsights.health}.`;
    const clean = text.replace(/[#*`_>-]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsPlayingAudio(false);
    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(
      `Daily Vedic Insight for ${profile.fullName} | JyotishVeda AI:\nTithi: ${panchang.tithi} | Nakshatra: ${panchang.nakshatra}\nAbhijit Muhurta: ${panchang.abhijitMuhurta}`
    );
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const getCosmicHarmony = (score: number) => {
    if (score >= 80) return { title: 'High Pranic Vitality', desc: 'Optimal for key initiatives', color: 'text-[#C9A050]', icon: CheckCircle2 };
    if (score >= 60) return { title: 'Balanced Energy', desc: 'Favorable for routine tasks', color: 'text-[#C9A050]', icon: Sparkles };
    if (score >= 40) return { title: 'Mixed Harmonics', desc: 'Proceed with awareness', color: 'text-orange-400', icon: Compass };
    return { title: 'Low Vitality', desc: 'Avoid major new beginnings', color: 'text-rose-400', icon: AlertTriangle };
  };

  const getLuckyColorDesc = (color: string) => {
    if (!color) return 'Amplifies cosmic harmony';
    const c = color.toLowerCase();
    if (c.includes('red') || c.includes('coral') || c.includes('scarlet')) return 'Amplifies vital energy & action';
    if (c.includes('blue') || c.includes('navy')) return 'Enhances calm focus & depth';
    if (c.includes('green') || c.includes('emerald') || c.includes('pistachio')) return 'Attracts growth & prosperity';
    if (c.includes('yellow') || c.includes('gold') || c.includes('amber')) return 'Boosts wisdom & optimism';
    if (c.includes('white') || c.includes('pearl') || c.includes('silver')) return 'Invokes peace & intuition';
    if (c.includes('grey') || c.includes('brown')) return 'Grounds spiritual energy';
    if (c.includes('black') || c.includes('violet')) return 'Promotes discipline & protection';
    if (c.includes('pink') || c.includes('lilac')) return 'Nurtures compassion & charm';
    return 'Amplifies cosmic harmony';
  };

  const getDailyRituals = () => {
    if (panchang.rituals) {
      return panchang.rituals;
    }
    // Very basic fallback if backend fails
    return {
      morningTitle: 'Morning Vedic Ritual',
      morningDesc: 'Start your day with meditation and Surya Arghya.',
      eveningTitle: 'Evening Vedic Ritual',
      eveningDesc: 'Light a diya and practice gratitude.'
    };
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) return 'Shubh Prabhat'; // Good Morning
    if (hour >= 12 && hour < 17) return 'Shubh Madhyahn'; // Good Afternoon
    if (hour >= 17 && hour < 20) return 'Shubh Sandhya'; // Good Evening
    return 'Shubh Ratri'; // Good Night
  };

  const getIntroText = (score: number) => {
    if (score >= 80) return "Today's planetary harmonics emphasize strategic foresight, purposeful intellect, and harmonious execution.";
    if (score >= 60) return "Today's cosmic transits favor steady progress, routine refinement, and maintaining emotional equilibrium.";
    if (score >= 40) return "Current planetary alignments suggest cautious optimism; unexpected shifts require adaptable and measured responses.";
    return "Today's challenging cosmic energy calls for deep introspection, patience, and avoiding major new commitments.";
  };

  const harmony = getCosmicHarmony(panchang.auspiciousScore);

  // Comprehensive Daily Insights PDF Report Generator
  const handleDownloadDailyReportPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
      const pageHeight = doc.internal.pageSize.getHeight(); // 297mm

      // Load background assets
      const bgBase64 = await loadImageBase64('/astrologer_bg.jpg');
      const logoBase64 = await loadImageBase64('/jyotishveda_logo.png');

      const ascSign = chartData?.ascendant?.signName || chartData?.ascendant?.signSanskrit || 'Vedic Ascendant';
      const moonPlanet = chartData?.planets?.find((p: any) => p.id === 'moon' || p.name?.toLowerCase() === 'moon');
      const moonSign = panchang?.lunarSign || chartData?.moonSign || moonPlanet?.signName || 'Chandra Rashi';
      const nakshatra = panchang?.nakshatra || moonPlanet?.nakshatra || 'Vedic Nakshatra';
      const luckyNum = panchang?.luckyData?.luckyNumber || numerology?.luckyNumbers?.[0] || numerology?.mulank || 1;
      const luckyPlanet = getPlanetForNumber(luckyNum);
      const luckyColor = panchang?.luckyData?.luckyColor || numerology?.luckyColors?.[0] || 'Golden Saffron';
      const luckyColorDesc = aiInsights?.lucky_color_desc || getLuckyColorDesc(luckyColor);
      const rituals = getDailyRituals();

      const summaryText = aiInsights?.summary || getIntroText(panchang.auspiciousScore);
      const careerText = aiInsights?.career || (panchang.auspiciousScore >= 80 ? "Excellent for structured negotiations, strategy decks, and leadership decisions." : panchang.auspiciousScore >= 60 ? "Good for routine administrative tasks and organizing future workflows." : panchang.auspiciousScore >= 40 ? "Avoid finalizing major contracts today. Focus on reviewing details instead." : "Not ideal for initiating new ventures. Focus on clearing backlogs silently.");
      const loveText = aiInsights?.love || (panchang.auspiciousScore >= 80 ? "Nurturing dialogue resolves past hesitations; evening hours favor quiet companionship." : panchang.auspiciousScore >= 60 ? "Mutual understanding grows through patient listening and shared domestic activities." : panchang.auspiciousScore >= 40 ? "Potential for minor misunderstandings. Practice clear and gentle communication." : "Give space to loved ones. Solitude might be more restorative than socializing today.");
      const healthText = aiInsights?.health || (panchang.auspiciousScore >= 80 ? "High stamina; hydrate with warm herbal infusions to balance Pitta-Vata energy." : panchang.auspiciousScore >= 60 ? "Stable energy levels; gentle yoga or evening walks are highly recommended." : panchang.auspiciousScore >= 40 ? "Energy may fluctuate. Ensure adequate rest and avoid heavy, rich meals." : "Vitality is lower than usual. Prioritize deep rest and grounding practices.");

      let yPos = 33;

      // 1. Seeker & Natal Coordinates Box
      doc.setFillColor(252, 249, 242);
      doc.setDrawColor(226, 211, 176);
      doc.setLineWidth(0.4);
      doc.roundedRect(13, yPos, pageWidth - 26, 24, 2, 2, 'FD');
      doc.line(pageWidth / 2, yPos, pageWidth / 2, yPos + 24);

      // Left Column: Client Details
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(126, 95, 24);
      doc.text('CLIENT & NATAL PARTICULARS', 17, yPos + 5.5);

      doc.setFontSize(10);
      doc.setTextColor(26, 26, 30);
      doc.text(profile.fullName || 'Vedic Seeker', 17, yPos + 10.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.2);
      doc.setTextColor(80, 80, 80);
      const birthDetails = `Born: ${profile.birthDate || 'N/A'}${profile.birthTime ? ` at ${profile.birthTime}` : ''} | ${profile.birthPlace || 'Global'}`;
      doc.text(doc.splitTextToSize(birthDetails, (pageWidth - 36) / 2)[0] || '', 17, yPos + 15);
      doc.text(`System: ${profile.horoscopeSystem === 'western' ? 'Western Tropical' : 'Vedic Sidereal'} | Transit: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`, 17, yPos + 19.5);

      // Right Column: Celestial & Harmonic Vibration
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(126, 95, 24);
      doc.text('CELESTIAL & HARMONIC VIBRATION', pageWidth / 2 + 5, yPos + 5.5);

      doc.setFontSize(8.5);
      doc.setTextColor(26, 26, 30);
      doc.text(`Lagna: ${ascSign}  |  Moon: ${moonSign}`, pageWidth / 2 + 5, yPos + 10.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.2);
      doc.setTextColor(80, 80, 80);
      doc.text(`Nakshatra: ${nakshatra}  |  Mulank: ${numerology?.mulank || '-'} (${numerology?.mulankPlanet || ''})`, pageWidth / 2 + 5, yPos + 15);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(181, 131, 40);
      doc.text(`Cosmic Harmony: ${panchang.auspiciousScore}% (${harmony.title})`, pageWidth / 2 + 5, yPos + 19.5);

      yPos += 27;

      // 2. Auspicious Transit Strip (4 Metrics)
      const colWidth = (pageWidth - 26 - 9) / 4;
      const cardH = 15;
      const metrics = [
        { label: 'LUCKY NUMBER', val: `${luckyNum}`, sub: `Ruled by ${luckyPlanet}` },
        { label: 'LUCKY COLOR & TONE', val: `${luckyColor}`, sub: doc.splitTextToSize(luckyColorDesc, colWidth - 4)[0] || luckyColorDesc },
        { label: 'SHUBH ABHIJIT MUHURTA', val: `${panchang.abhijitMuhurta.split('(')[0].trim()}`, sub: 'Victory Window' },
        { label: 'RAHU KAAL (AVOID)', val: `${panchang.rahuKaal.split('(')[0].trim()}`, sub: 'Inauspicious Window' }
      ];

      metrics.forEach((m, idx) => {
        const xPos = 13 + idx * (colWidth + 3);
        doc.setFillColor(248, 245, 237);
        doc.setDrawColor(226, 211, 176);
        doc.setLineWidth(0.3);
        doc.roundedRect(xPos, yPos, colWidth, cardH, 1.5, 1.5, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.2);
        doc.setTextColor(126, 95, 24);
        doc.text(m.label, xPos + 2.5, yPos + 4);

        doc.setFontSize(8);
        doc.setTextColor(26, 26, 30);
        doc.text(m.val, xPos + 2.5, yPos + 8.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.setTextColor(90, 90, 90);
        doc.text(m.sub, xPos + 2.5, yPos + 12.5);
      });

      yPos += cardH + 4;

      // 3. Daily Horoscope & Domain Breakdown
      doc.setFillColor(254, 252, 247);
      doc.setDrawColor(201, 160, 80);
      doc.setLineWidth(0.4);

      const summaryLines = doc.splitTextToSize(summaryText, pageWidth - 34);
      const summaryBoxH = Math.max(16, 7 + summaryLines.length * 3.6);

      doc.roundedRect(13, yPos, pageWidth - 26, summaryBoxH, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.8);
      doc.setTextColor(126, 95, 24);
      doc.text('DAILY PLANETARY SYNTHESIS & CELESTIAL RHYTHM', 17, yPos + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(45, 45, 50);
      doc.text(summaryLines, 17, yPos + 9);

      yPos += summaryBoxH + 4;

      // 3 Domain Cards
      const domainW = (pageWidth - 26 - 6) / 3;
      const domains = [
        { title: 'CAREER & COMMERCE', desc: careerText, iconTag: '⚡ Focus' },
        { title: 'LOVE & HARMONY', desc: loveText, iconTag: '♥ Companionship' },
        { title: 'HEALTH & PRANA', desc: healthText, iconTag: '◈ Vitality' }
      ];

      // Calculate max height needed for domain cards
      let maxDomH = 26;
      domains.forEach(d => {
        const lines = doc.splitTextToSize(d.desc, domainW - 6);
        const h = 10 + lines.length * 3.3;
        if (h > maxDomH) maxDomH = h;
      });

      domains.forEach((d, idx) => {
        const xPos = 13 + idx * (domainW + 3);
        doc.setFillColor(252, 249, 242);
        doc.setDrawColor(226, 211, 176);
        doc.setLineWidth(0.3);
        doc.roundedRect(xPos, yPos, domainW, maxDomH, 1.5, 1.5, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.8);
        doc.setTextColor(126, 95, 24);
        doc.text(d.title, xPos + 3, yPos + 4.5);

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(5.8);
        doc.setTextColor(150, 120, 60);
        doc.text(d.iconTag, xPos + domainW - 3, yPos + 4.5, { align: 'right' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(55, 55, 60);
        const lines = doc.splitTextToSize(d.desc, domainW - 6);
        doc.text(lines, xPos + 3, yPos + 8.5);
      });

      yPos += maxDomH + 4;

      // Check if page split is needed
      if (yPos > pageHeight - 90) {
        doc.addPage();
        yPos = 22;
      }

      // 4. Sacred Panchang Parameters Table (8 attributes in 2x4 grid)
      doc.setFillColor(250, 247, 240);
      doc.setDrawColor(201, 160, 80);
      doc.setLineWidth(0.4);
      doc.roundedRect(13, yPos, pageWidth - 26, 33, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.8);
      doc.setTextColor(126, 95, 24);
      doc.text('SACRED PANCHANG PARAMETERS (SIDEREAL VEDIC EPHEMERIS)', 17, yPos + 5);

      const panchangGrid = [
        [
          { label: 'Tithi (Lunar Day)', val: panchang.tithi },
          { label: 'Nakshatra (Asterism)', val: panchang.nakshatra },
          { label: 'Vedic Yoga', val: panchang.yoga },
          { label: 'Karana (Half Tithi)', val: panchang.karana }
        ],
        [
          { label: 'Sun Sign (Surya Rashi)', val: panchang.solarSign },
          { label: 'Moon Sign (Chandra Rashi)', val: panchang.lunarSign },
          { label: 'Sunrise / Sunset', val: `${panchang.sunrise} / ${panchang.sunset}` },
          { label: 'Brahma Muhurta', val: panchang.brahmaMuhurta }
        ]
      ];

      const pColW = (pageWidth - 36) / 2;
      panchangGrid.forEach((col, colIdx) => {
        const xOffset = 17 + colIdx * (pColW + 4);
        col.forEach((row, rowIdx) => {
          const rowY = yPos + 9.5 + rowIdx * 5.4;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6.8);
          doc.setTextColor(95, 90, 85);
          doc.text(row.label, xOffset, rowY);

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.8);
          doc.setTextColor(26, 26, 30);
          doc.text(row.val, xOffset + pColW, rowY, { align: 'right' });

          if (rowIdx < 3) {
            doc.setDrawColor(235, 225, 205);
            doc.setLineWidth(0.2);
            doc.line(xOffset, rowY + 1.2, xOffset + pColW, rowY + 1.2);
          }
        });
      });

      yPos += 37;

      // 5. Recommended Daily Vedic Sadhana & Upaya (Morning & Evening)
      if (yPos > pageHeight - 48) {
        doc.addPage();
        yPos = 22;
      }

      doc.setFillColor(254, 252, 247);
      doc.setDrawColor(201, 160, 80);
      doc.setLineWidth(0.4);
      doc.roundedRect(13, yPos, pageWidth - 26, 32, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.8);
      doc.setTextColor(126, 95, 24);
      doc.text('RECOMMENDED DAILY VEDIC RITUALS (NITYA SADHANA)', 17, yPos + 5);

      const ritualColW = (pageWidth - 36) / 2;
      // Morning
      doc.setFillColor(248, 244, 234);
      doc.setDrawColor(226, 211, 176);
      doc.roundedRect(17, yPos + 7.5, ritualColW - 2, 21, 1, 1, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(181, 131, 40);
      doc.text('MORNING SADHANA', 20, yPos + 11.5);

      doc.setFontSize(7);
      doc.setTextColor(26, 26, 30);
      doc.text(doc.splitTextToSize(rituals.morningTitle, ritualColW - 8)[0] || rituals.morningTitle, 20, yPos + 15.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.2);
      doc.setTextColor(70, 70, 75);
      const mLines = doc.splitTextToSize(rituals.morningDesc, ritualColW - 8);
      doc.text(mLines.slice(0, 2), 20, yPos + 19);

      // Evening
      doc.setFillColor(248, 244, 234);
      doc.setDrawColor(226, 211, 176);
      doc.roundedRect(17 + ritualColW + 2, yPos + 7.5, ritualColW - 2, 21, 1, 1, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(181, 131, 40);
      doc.text('EVENING SADHANA', 17 + ritualColW + 5, yPos + 11.5);

      doc.setFontSize(7);
      doc.setTextColor(26, 26, 30);
      doc.text(doc.splitTextToSize(rituals.eveningTitle, ritualColW - 8)[0] || rituals.eveningTitle, 17 + ritualColW + 5, yPos + 15.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.2);
      doc.setTextColor(70, 70, 75);
      const eLines = doc.splitTextToSize(rituals.eveningDesc, ritualColW - 8);
      doc.text(eLines.slice(0, 2), 17 + ritualColW + 5, yPos + 19);

      yPos += 36;

      // 6. Page Decorations Pass (Watermark, Double Border, Header & Footer)
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);

        // Watermark
        if (bgBase64) {
          try {
            if (typeof (doc as any).setGState === 'function' && (doc as any).GState) {
              (doc as any).setGState(new (doc as any).GState({ opacity: 0.07 }));
            }
          } catch {}
          doc.addImage(bgBase64, 'JPEG', 0, 0, pageWidth, pageHeight);
          try {
            if (typeof (doc as any).setGState === 'function' && (doc as any).GState) {
              (doc as any).setGState(new (doc as any).GState({ opacity: 1.0 }));
            }
          } catch {}
        }

        // Outer Decorative Golden Double Border
        doc.setDrawColor(201, 160, 80);
        doc.setLineWidth(1.1);
        doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
        doc.setLineWidth(0.35);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

        // Corner gold accents
        doc.setFillColor(201, 160, 80);
        doc.circle(10, 10, 1.2, 'F');
        doc.circle(pageWidth - 10, 10, 1.2, 'F');
        doc.circle(10, pageHeight - 10, 1.2, 'F');
        doc.circle(pageWidth - 10, pageHeight - 10, 1.2, 'F');

        if (i === 1) {
          // Page 1 Header with Logo
          if (logoBase64) {
            doc.addImage(logoBase64, 'PNG', 14, 13, 16, 16);
          }

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(18);
          doc.setTextColor(20, 20, 24);
          doc.text('JYOTISH', 33, 20);
          doc.setTextColor(181, 131, 40);
          doc.text('VEDA', 33 + doc.getTextWidth('JYOTISH') + 0.5, 20);

          doc.setFontSize(8.5);
          doc.setTextColor(126, 95, 24);
          doc.text('DAILY VEDIC TRANSIT & PANCHANG REPORT', 33, 24.5);

          doc.setFont('helvetica', 'italic');
          doc.setFontSize(7);
          doc.setTextColor(110, 105, 95);
          doc.text(
            `Precision Astronomical Ephemeris & AI Vedic Synthesis • ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`,
            33,
            28
          );
        } else {
          // Header for page 2+
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(126, 95, 24);
          doc.text('JYOTISHVEDA • DAILY VEDIC TRANSIT & PANCHANG REPORT', 14, 14);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(100, 100, 100);
          doc.text(
            `Client: ${profile.fullName || 'Seeker'}  |  Lagna: ${ascSign}`,
            pageWidth - 14,
            14,
            { align: 'right' }
          );
          doc.setDrawColor(226, 211, 176);
          doc.setLineWidth(0.3);
          doc.line(13, 16, pageWidth - 13, 16);
        }

        // Footer Divider Line
        const footerY = pageHeight - 18;
        doc.setDrawColor(226, 211, 176);
        doc.setLineWidth(0.4);
        doc.line(13, footerY, pageWidth - 13, footerY);

        // Footer Details
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(110, 105, 95);
        doc.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - 14,
          footerY + 4,
          { align: 'right' }
        );
      }

      // Save PDF
      const safeName = (profile.fullName || 'Seeker').replace(/[^a-zA-Z0-9]/g, '_');
      const dateStr = new Date().toISOString().split('T')[0];
      doc.save(`JyotishVeda_Daily_Report_${safeName}_${dateStr}.pdf`);
    } catch (err) {
      console.error('Failed to generate daily insights PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Greeting, Cosmic Alignment Score & Download Button */}
      <div className={`relative overflow-hidden rounded-xl border p-6 sm:p-8 shadow-2xl ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-white border-[#E5E1D8] text-[#2A2A2E]'}`}>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#C9A050]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold tracking-widest text-[#C9A050] mb-2 uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {profile.horoscopeSystem === 'western' ? 'Western Tropical' : 'Vedic Sidereal'} Daily Transit • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h1 className={`text-3xl sm:text-4xl font-bold tracking-tight ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
              {getGreeting()}, <span className="text-[#C9A050] italic">{profile.fullName}</span>
            </h1>
            <p className="text-sm text-[#9E9A90] mt-2 max-w-2xl leading-relaxed">
              Your natal {profile.horoscopeSystem === 'western' ? 'Ascendant' : 'Lagna'} is <span className={`font-semibold ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'}`}>{chartData?.ascendant?.signName}</span> ({profile.horoscopeSystem === 'western' ? 'Tropical Sayana' : 'Sidereal Nirayana'}) with{' '}
              <span className="font-semibold text-[#C9A050]">Mulank {numerology.mulank}</span> ({numerology.mulankPlanet.split('(')[0]}). 
              {aiInsights?.summary || getIntroText(panchang.auspiciousScore)}
            </p>
          </div>

          {/* Right Area: Alignment Score Meter & Download Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={handleDownloadDailyReportPdf}
              disabled={isGeneratingPdf}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border text-xs font-bold transition shadow-lg cursor-pointer ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-[#C9A050] to-[#A07828] hover:from-[#D4AF37] hover:to-[#B38730] text-[#0D0D0F] border-[#C9A050] shadow-[#C9A050]/20'
                  : 'bg-[#C9A050] hover:bg-[#B38730] text-white border-[#C9A050] shadow-[#C9A050]/20'
              } disabled:opacity-50`}
              title="Download daily insights as formatted PDF report"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Report (PDF)'}</span>
            </button>

            <div className={`flex items-center space-x-4 border rounded-xl p-4 shadow-lg ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'}`}>
              <div className="text-center">
                <div className="text-3xl font-black text-[#C9A050]">{panchang.auspiciousScore}%</div>
                <div className="text-[9px] uppercase font-bold tracking-widest text-[#9E9A90]">Cosmic Harmony</div>
              </div>
              <div className="h-10 w-[1px] bg-[#2A2A2E]" />
              <div className={`text-xs space-y-1 ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'}`}>
                <div className={`flex items-center space-x-1.5 font-medium ${harmony.color}`}>
                  <harmony.icon className="w-3.5 h-3.5" />
                  <span>{harmony.title}</span>
                </div>
                <div className="text-[11px] text-[#9E9A90]">{harmony.desc}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Auspicious Attributes Strip */}
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
          <div className={`p-3.5 rounded-lg border ${theme === 'dark' ? 'bg-[#1A1A1E]/80 border-[#2A2A2E]' : 'bg-[#F9F7F1]/80 border-[#E5E1D8]'}`}>
            <div className="text-[9px] text-[#9E9A90] uppercase font-bold tracking-wider">Lucky Number Today</div>
            <div className="text-xl font-bold text-[#C9A050] mt-0.5">{panchang.luckyData?.luckyNumber || numerology.luckyNumbers[0] || numerology.mulank}</div>
            <div className="text-[11px] text-[#9E9A90]">Ruled by {getPlanetForNumber(panchang.luckyData?.luckyNumber || numerology.luckyNumbers[0] || numerology.mulank)}</div>
          </div>

          <div className={`p-3.5 rounded-lg border ${theme === 'dark' ? 'bg-[#1A1A1E]/80 border-[#2A2A2E]' : 'bg-[#F9F7F1]/80 border-[#E5E1D8]'}`}>
            <div className="text-[9px] text-[#9E9A90] uppercase font-bold tracking-wider">Lucky Color & Tone</div>
            <div className="text-xl font-bold text-[#C9A050] mt-0.5">{panchang.luckyData?.luckyColor || numerology.luckyColors[0] || 'Golden Saffron'}</div>
            <div className="text-[11px] text-[#9E9A90] line-clamp-1" title={aiInsights?.lucky_color_desc || getLuckyColorDesc(panchang.luckyData?.luckyColor || numerology.luckyColors[0])}>
              {aiInsights?.lucky_color_desc || getLuckyColorDesc(panchang.luckyData?.luckyColor || numerology.luckyColors[0])}
            </div>
          </div>

          <div className={`p-3.5 rounded-lg border ${theme === 'dark' ? 'bg-[#1A1A1E]/80 border-[#2A2A2E]' : 'bg-[#F9F7F1]/80 border-[#E5E1D8]'}`}>
            <div className="text-[9px] text-[#9E9A90] uppercase font-bold tracking-wider">Shubh Abhijit Muhurta</div>
            <div className={`text-sm font-bold mt-1 ${theme === 'dark' ? 'text-emerald-400' : 'text-[#C9A050]'}`}>{panchang.abhijitMuhurta.split('(')[0].trim()}</div>
            <div className="text-[11px] text-[#9E9A90]">
              {panchang.abhijitMuhurta.match(/\(([^)]+)\)/)?.[1] || 'Victory window for tasks'}
            </div>
          </div>

          <div className={`p-3.5 rounded-lg border ${theme === 'dark' ? 'bg-[#1A1A1E]/80 border-[#2A2A2E]' : 'bg-[#F9F7F1]/80 border-[#E5E1D8]'}`}>
            <div className="text-[9px] text-[#9E9A90] uppercase font-bold tracking-wider">Rahu Kaal (Avoid Starts)</div>
            <div className={`text-sm font-bold mt-1 ${theme === 'dark' ? 'text-rose-400' : 'text-[#C9A050]'}`}>{panchang.rahuKaal.split('(')[0].trim()}</div>
            <div className="text-[11px] text-[#9E9A90]">
              {panchang.rahuKaal.match(/\(([^)]+)\)/)?.[1] || 'Inauspicious time bracket'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Panchang Deep Dive & Daily AI Horoscope */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Daily AI Insights & Daily Ritual */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Personalized Forecast Card */}
          <div className={`border rounded-xl p-6 shadow-xl ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-white border-[#E5E1D8] text-[#2A2A2E]'}`}>
            <div className={`flex items-center justify-between pb-4 border-b mb-4 ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-[#C9A050]/15 text-[#C9A050] border border-[#C9A050]/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>Daily AI Vedic Horoscope Interpretation</h2>
                  <p className="text-xs text-[#9E9A90]">Personalized transit synthesis based on your specific birth chart & active dasha</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownloadDailyReportPdf}
                  disabled={isGeneratingPdf}
                  className={`p-2 rounded-lg border hover:text-[#C9A050] transition cursor-pointer text-xs flex items-center space-x-1 ${
                    theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-[#F9F7F1] border-[#E5E1D8] text-[#2A2A2E]'
                  }`}
                  title="Download Daily PDF Report"
                >
                  {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin text-[#C9A050]" /> : <Download className="w-4 h-4 text-[#C9A050]" />}
                  <span className="hidden sm:inline">{isGeneratingPdf ? 'Exporting...' : 'PDF'}</span>
                </button>

                {aiInsights && (
                  <>
                    <button
                      onClick={handleSpeech}
                      className={`p-2 rounded-lg border transition cursor-pointer text-xs flex items-center space-x-1 ${
                        isPlayingAudio
                          ? 'bg-[#C9A050] text-[#0D0D0F] border-[#C9A050]'
                          : 'bg-[#1A1A1E] text-[#E5E1D8] border-[#2A2A2E] hover:text-white'
                      }`}
                      title="Listen to reading"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span className="hidden sm:inline">{isPlayingAudio ? 'Stop' : 'Listen'}</span>
                    </button>
                    <button
                      onClick={handleShare}
                      className={`p-2 rounded-lg border hover:text-white transition cursor-pointer text-xs flex items-center space-x-1 ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-[#F9F7F1] border-[#E5E1D8] text-[#2A2A2E]'}`}
                      title="Copy & Share"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="hidden sm:inline">{isCopied ? 'Copied!' : 'Share'}</span>
                    </button>
                  </>
                )}

                <button
                  onClick={fetchDailyAiReading}
                  disabled={isLoadingAi}
                  className={`px-3.5 py-2 rounded-lg font-bold text-xs shadow-md transition cursor-pointer flex items-center space-x-1.5 disabled:opacity-50 ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-[#C9A050] to-[#A07828] hover:from-[#D4AF37] hover:to-[#B38730] text-[#0D0D0F] shadow-[#C9A050]/15'
                      : 'bg-[#FFFFFF] border border-[#C9A050]/50 text-[#C9A050] hover:bg-[#C9A050]/10 shadow-[#C9A050]/10'
                  }`}
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin' : ''}`} />
                  <span>{isLoadingAi ? 'Consulting...' : aiInsights ? 'Regenerate Insight' : 'Generate Full AI Reading'}</span>
                </button>
              </div>
            </div>

            {/* Reading Content */}
            {isLoadingAi ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
                <div className="w-9 h-9 border-2 border-[#C9A050] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-[#C9A050] font-serif font-semibold">Consulting Planetary Ephemeris & AI Model...</p>
                <p className="text-[11px] text-[#9E9A90] max-w-sm">Calculating Moon transit, Nakshatra lord aspect, and today’s Tithi vibration for your Ascendant.</p>
              </div>
            ) : aiInsights ? (
              <div className="space-y-4">
                <div className={`prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed space-y-3 whitespace-pre-line p-5 rounded-xl border font-serif ${theme === 'dark' ? 'border-[#2A2A2E] text-[#E5E1D8] bg-[#08080A]' : 'border-[#E5E1D8] text-[#2A2A2E] bg-[#F0ECE1]'}`}>
                  {aiInsights.summary}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className={`p-3.5 /60 rounded-lg border ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'}`}>
                    <span className="text-[9px] uppercase font-sans font-bold tracking-wider text-[#C9A050]">Career & Commerce</span>
                    <p className="text-xs font-sans text-[#9E9A90] mt-1">{aiInsights.career}</p>
                  </div>
                  <div className={`p-3.5 /60 rounded-lg border ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'}`}>
                    <span className="text-[9px] uppercase font-sans font-bold tracking-wider text-[#C9A050]">Love & Harmony</span>
                    <p className="text-xs font-sans text-[#9E9A90] mt-1">{aiInsights.love}</p>
                  </div>
                  <div className={`p-3.5 /60 rounded-lg border ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'}`}>
                    <span className="text-[9px] uppercase font-sans font-bold tracking-wider text-[#C9A050]">Health & Prana</span>
                    <p className="text-xs font-sans text-[#9E9A90] mt-1">{aiInsights.health}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border space-y-2 ${theme === 'dark' ? 'bg-[#1A1A1E]/80 border-[#2A2A2E]' : 'bg-[#F9F7F1]/80 border-[#E5E1D8]'}`}>
                  <div className="text-sm font-serif font-semibold text-[#C9A050] flex items-center space-x-2">
                    <Sun className="w-4 h-4 text-[#C9A050]" />
                    <span>Today’s Dominant Cosmic Rhythm: {panchang.tithi} in {panchang.nakshatra}</span>
                  </div>
                  <p className={`text-xs font-sans leading-relaxed ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'}`}>
                    {panchang.auspiciousScore >= 80 ? "The Moon traverses through highly auspicious degrees today, stimulating sharp communication, favorable business contracts, and relationship harmony." 
                    : panchang.auspiciousScore >= 60 ? "Planetary aspects indicate a balanced rhythm today. Steady progress is favored over risky leaps, maintaining equilibrium in daily affairs."
                    : panchang.auspiciousScore >= 40 ? "Mixed cosmic influences suggest proceeding with awareness. Unexpected shifts might require adaptable responses rather than rigid plans."
                    : "Current planetary transits suggest a phase of introspection and caution. It is a day to lay low, conserve energy, and avoid unnecessary conflicts."}
                    {" "}Maintain an even temperament during the Rahu Kaal window ({panchang.rahuKaal.split('(')[0].trim()}).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className={`p-3.5 /60 rounded-lg border ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'}`}>
                    <span className="text-[9px] uppercase font-sans font-bold tracking-wider text-[#C9A050]">Career & Commerce</span>
                    <p className="text-xs font-sans text-[#9E9A90] mt-1">
                      {panchang.auspiciousScore >= 80 ? "Excellent for structured negotiations, strategy decks, and leadership decisions."
                      : panchang.auspiciousScore >= 60 ? "Good for routine administrative tasks and organizing future workflows."
                      : panchang.auspiciousScore >= 40 ? "Avoid finalizing major contracts today. Focus on reviewing details instead."
                      : "Not ideal for initiating new ventures. Focus on clearing backlogs silently."}
                    </p>
                  </div>
                  <div className={`p-3.5 /60 rounded-lg border ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'}`}>
                    <span className="text-[9px] uppercase font-sans font-bold tracking-wider text-[#C9A050]">Love & Harmony</span>
                    <p className="text-xs font-sans text-[#9E9A90] mt-1">
                      {panchang.auspiciousScore >= 80 ? "Nurturing dialogue resolves past hesitations; evening hours favor quiet companionship."
                      : panchang.auspiciousScore >= 60 ? "Mutual understanding grows through patient listening and shared domestic activities."
                      : panchang.auspiciousScore >= 40 ? "Potential for minor misunderstandings. Practice clear and gentle communication."
                      : "Give space to loved ones. Solitude might be more restorative than socializing today."}
                    </p>
                  </div>
                  <div className={`p-3.5 /60 rounded-lg border ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'}`}>
                    <span className="text-[9px] uppercase font-sans font-bold tracking-wider text-[#C9A050]">Health & Prana</span>
                    <p className="text-xs font-sans text-[#9E9A90] mt-1">
                      {panchang.auspiciousScore >= 80 ? "High stamina; hydrate with warm herbal infusions to balance Pitta-Vata energy."
                      : panchang.auspiciousScore >= 60 ? "Stable energy levels; gentle yoga or evening walks are highly recommended."
                      : panchang.auspiciousScore >= 40 ? "Energy may fluctuate. Ensure adequate rest and avoid heavy, rich meals."
                      : "Vitality is lower than usual. Prioritize deep rest and grounding practices."}
                    </p>
                  </div>
                </div>

                <button
                  onClick={fetchDailyAiReading}
                  className="w-full py-3 rounded-lg border border-[#C9A050]/40 bg-[#C9A050]/10 hover:bg-[#C9A050]/20 text-[#C9A050] text-xs font-sans font-semibold flex items-center justify-center space-x-2 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Click to Unlock Comprehensive AI Vedic Deep-Dive Reading</span>
                </button>
              </div>
            )}
          </div>

          {/* Daily Vedic Sadhana & Upaya Card */}
          <div className={`border rounded-xl p-6 shadow-xl ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-white border-[#E5E1D8] text-[#2A2A2E]'}`}>
            <div className="flex items-center space-x-2 text-[#C9A050] font-serif font-bold text-base mb-3">
              <Flame className="w-4 h-4" />
              <span>Recommended Daily Vedic Ritual (Nitya Sadhana)</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#1A1A1E]/80 border-[#2A2A2E]' : 'bg-[#F9F7F1]/80 border-[#E5E1D8]'}`}>
                <span className="text-[9px] uppercase font-sans font-bold text-[#C9A050] tracking-widest">Morning Sadhana</span>
                <h4 className={`text-sm font-serif font-bold mt-1 ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                  {getDailyRituals().morningTitle}
                </h4>
                <p className="text-xs font-sans text-[#9E9A90] mt-1 leading-relaxed">
                  {getDailyRituals().morningDesc}
                </p>
              </div>

              <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#1A1A1E]/80 border-[#2A2A2E]' : 'bg-[#F9F7F1]/80 border-[#E5E1D8]'}`}>
                <span className="text-[9px] uppercase font-sans font-bold text-[#C9A050] tracking-widest">Evening Sadhana</span>
                <h4 className={`text-sm font-serif font-bold mt-1 ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                  {getDailyRituals().eveningTitle}
                </h4>
                <p className="text-xs font-sans text-[#9E9A90] mt-1 leading-relaxed">
                  {getDailyRituals().eveningDesc}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Complete Vedic Panchang Breakdown & Fast Actions */}
        <div className="space-y-6">
          {/* Panchang Deep Dive Card */}
          <div className={`border rounded-xl p-6 shadow-xl ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-white border-[#E5E1D8] text-[#2A2A2E]'}`}>
            <div className={`flex items-center justify-between pb-3 border-b mb-4 ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-[#C9A050]" />
                <h3 className={`text-base font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>Sacred Panchang Parameters</h3>
              </div>
              <span className="text-[10px] font-sans text-[#C9A050]/80 font-medium">Sidereal Vedic</span>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div className={`flex justify-between items-center py-1.5 border-b /60 ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
                <span className="text-[#9E9A90]">Tithi (Lunar Day)</span>
                <span className={`font-semibold text-right ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>{panchang.tithi}</span>
              </div>
              <div className={`flex justify-between items-center py-1.5 border-b /60 ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
                <span className="text-[#9E9A90]">Nakshatra (Asterism)</span>
                <span className={`font-semibold text-right font-serif ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>{panchang.nakshatra}</span>
              </div>
              <div className={`flex justify-between items-center py-1.5 border-b /60 ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
                <span className="text-[#9E9A90]">Vedic Yoga</span>
                <span className={`font-semibold text-right ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>{panchang.yoga}</span>
              </div>
              <div className={`flex justify-between items-center py-1.5 border-b /60 ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
                <span className="text-[#9E9A90]">Karana (Half Tithi)</span>
                <span className={`font-semibold text-right ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>{panchang.karana}</span>
              </div>
              <div className={`flex justify-between items-center py-1.5 border-b /60 ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
                <span className="text-[#9E9A90]">Sun Sign (Surya Rashi)</span>
                <span className={`font-semibold text-right ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>{panchang.solarSign}</span>
              </div>
              <div className={`flex justify-between items-center py-1.5 border-b /60 ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
                <span className="text-[#9E9A90]">Moon Sign (Chandra Rashi)</span>
                <span className={`font-semibold text-right font-serif ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>{panchang.lunarSign}</span>
              </div>
              <div className={`flex justify-between items-center py-1.5 border-b /60 ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
                <span className="text-[#9E9A90]">Sunrise / Sunset</span>
                <span className={`font-semibold text-right ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>{panchang.sunrise} / {panchang.sunset}</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-[#9E9A90]">Brahma Muhurta</span>
                <span className={`font-semibold text-right ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>{panchang.brahmaMuhurta}</span>
              </div>
            </div>
          </div>

          {/* Quick Nav Cards */}
          <div className={`border rounded-xl p-5 shadow-xl space-y-3 ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-white border-[#E5E1D8] text-[#2A2A2E]'}`}>
            <h3 className="text-xs font-sans font-bold text-[#C9A050] uppercase tracking-wider">Explore Your Vedic Blueprint</h3>
            
            <button
              onClick={() => onNavigateToTab('horoscope')}
              className={`w-full text-left p-3 rounded-lg hover:bg-[#1E1E24] border transition cursor-pointer flex items-center justify-between group ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'}`}
            >
              <div>
                <div className={`text-xs font-semibold group-hover:text-[#C9A050] transition ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>5 Indian Ancient Traditions</div>
                <div className="text-[11px] text-[#9E9A90]">Parashari, Jaimini, Lal Kitab, KP & Nadi</div>
              </div>
              <Compass className="w-4 h-4 text-[#C9A050] group-hover:translate-x-0.5 transition" />
            </button>

            <button
              onClick={() => onNavigateToTab('counsellor')}
              className={`w-full text-left p-3 rounded-lg hover:bg-[#1E1E24] border transition cursor-pointer flex items-center justify-between group ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'}`}
            >
              <div>
                <div className={`text-xs font-semibold group-hover:text-[#C9A050] transition ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>Interactive AI Astrologer</div>
                <div className="text-[11px] text-[#9E9A90]">Counselling grounded in your exact birth chart</div>
              </div>
              <Sparkles className="w-4 h-4 text-[#C9A050] group-hover:translate-x-0.5 transition" />
            </button>

            <button
              onClick={() => onNavigateToTab('roadmap')}
              className={`w-full text-left p-3 rounded-lg hover:bg-[#1E1E24] border transition cursor-pointer flex items-center justify-between group ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'}`}
            >
              <div>
                <div className={`text-xs font-semibold group-hover:text-[#C9A050] transition ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>Personal & Career Roadmap</div>
                <div className="text-[11px] text-[#9E9A90]">10-Year milestone forecasts & dasha windows</div>
              </div>
              <Zap className="w-4 h-4 text-[#C9A050] group-hover:translate-x-0.5 transition" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
