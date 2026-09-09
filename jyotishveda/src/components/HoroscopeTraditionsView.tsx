import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Layers,
  CheckCircle,
  Flame,
  Volume2,
  Download,
  FileText,
  Loader2,
} from 'lucide-react';
import { jsPDF } from 'jspdf';

import {
  UserProfile,
  HoroscopeTradition,
  ChartStyle,
  PlanetPosition,
  HouseData,
  DashaPeriod,
  VedicYoga,
  VedicDosha,
  NumerologyReport,
} from '../types';

import { getTranslation } from '../services/translations';
import { api } from '../services/api';
import { API_ENDPOINTS } from '../config/api_config';

const PlanetBadge = ({
  p,
  isDiamond,
}: {
  p: any;
  isDiamond?: boolean;
}) => (
  <div className="group relative z-50">
    <span
      className={`cursor-help transition-all duration-300 block ${
        isDiamond
          ? 'text-[10px] font-sans font-bold text-[#E5E1D8] bg-[#1A1A1E] px-1 rounded border border-[#C9A050]/40 hover:scale-110 shadow-sm hover:shadow-[#C9A050]/30'
          : 'text-[9px] font-bold text-[#C9A050] hover:scale-110 hover:text-[#F0ECE1] hover:drop-shadow-[0_0_4px_rgba(201,160,80,0.8)]'
      }`}
    >
      {p.name.slice(0, 2)}
    </span>

    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-[#141418]/95 backdrop-blur-xl border border-[#C9A050]/40 text-[#E5E1D8] text-[10px] rounded-lg px-3 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.8)] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[100] flex flex-col items-center translate-y-2 group-hover:translate-y-0 scale-95 group-hover:scale-100">
      <span className="font-bold text-[#C9A050] text-xs">
        {p.name} ({p.sanskritName})
      </span>

      <div className="flex items-center gap-1.5 mt-1 opacity-90">
        {p.isRetrograde && (
          <span className="text-[#C9A050] uppercase tracking-wider text-[8px] font-bold bg-[#C9A050]/15 px-1 rounded border border-[#C9A050]/30">
            Retrograde
          </span>
        )}

        <span>
          {p.degree.toFixed(2)}° {p.signName}
        </span>
      </div>

      <div className="mt-1 text-[9px] text-[#9E9A90]">
        {p.nakshatra} (Pada {p.pada})
      </div>

      <div className="mt-0.5 text-[8px] text-[#C9A050]/90 uppercase tracking-widest bg-[#C9A050]/10 px-1.5 rounded-sm">
        {p.dignity}
      </div>
    </div>
  </div>
);

interface HoroscopeTraditionsViewProps {
  profile: UserProfile;
  tradition: HoroscopeTradition;
  setTradition: (t: HoroscopeTradition) => void;

  chartData: {
    ascendant: {
      signIndex: number;
      degree: number;
      signName: string;
      signSanskrit: string;
      nakshatra: string;
    };
    planets: PlanetPosition[];
    houses: HouseData[];
    dashas: DashaPeriod[];
    yogas: VedicYoga[];
    doshas: VedicDosha[];
    divisionalCharts?: { d9: any; d10: any };
    aspects?: any[];
    gemstones?: any[];
    kpSystem?: { houses: number[] };
  };

  numerology: NumerologyReport;
  language?: string;
  theme?: 'light' | 'dark';
}

export const HoroscopeTraditionsView: React.FC<
  HoroscopeTraditionsViewProps
> = ({
  profile,
  tradition,
  setTradition,
  chartData,
  numerology,
  language = 'en',
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const [chartStyle, setChartStyle] =
    useState<ChartStyle>('north_indian');

  const [selectedHouse, setSelectedHouse] =
    useState<HouseData | null>(chartData.houses[0]);

  const [selectedPlanet, setSelectedPlanet] =
    useState<PlanetPosition | null>(chartData.planets[0]);

  const [aiInterpretation, setAiInterpretation] =
    useState<string | null>(null);

  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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

  const t = (key: string) =>
    getTranslation(key, language);

  const traditionsList: {
    id: HoroscopeTradition;
    name: string;
    tag: string;
    description: string;
  }[] = [
    {
      id: 'parashari',
      name: t('tradition.parashari.name'),
      tag: t('tradition.parashari.tag'),
      description: t('tradition.parashari.desc'),
    },
    {
      id: 'jaimini',
      name: t('tradition.jaimini.name'),
      tag: t('tradition.jaimini.tag'),
      description: t('tradition.jaimini.desc'),
    },
    {
      id: 'lal_kitab',
      name: t('tradition.lal_kitab.name'),
      tag: t('tradition.lal_kitab.tag'),
      description: t('tradition.lal_kitab.desc'),
    },
    {
      id: 'kp_system',
      name: t('tradition.kp_system.name'),
      tag: t('tradition.kp_system.tag'),
      description: t('tradition.kp_system.desc'),
    },
    {
      id: 'bhrigu_nadi',
      name: t('tradition.bhrigu_nadi.name'),
      tag: t('tradition.bhrigu_nadi.tag'),
      description: t('tradition.bhrigu_nadi.desc'),
    },
  ];

  const handleGenerateAIInterpretation = async () => {
    setIsLoadingAi(true);

    try {
      const data = await api.post<any>(
        API_ENDPOINTS.BIRTH_CHART.INTERPRET,
        {
          profile,
          tradition,
          chartData,
          numerology,
          language,
        }
      );

      if (data && data.interpretation) {
        setAiInterpretation(data.interpretation);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const clean = text.replace(/[#*`_>-]/g, ' ');

    const utterance =
      new SpeechSynthesisUtterance(clean);

    utterance.rate = 0.95;

    utterance.onend = () =>
      setIsPlayingAudio(false);

    setIsPlayingAudio(true);

    window.speechSynthesis.speak(utterance);
  };

  // Comprehensive 5 Vedic Traditions & Birth Chart PDF Report Generator
  const handleDownloadTraditionsPdf = async () => {
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

      const ascSign = chartData.ascendant?.signName || 'Aries';
      const ascDeg = chartData.ascendant?.degree !== undefined ? chartData.ascendant.degree.toFixed(2) : '0.00';
      const ascNak = chartData.ascendant?.nakshatra || 'Ashwini';
      const moonPlanet = chartData.planets?.find((p) => p.id === 'moon' || p.name?.toLowerCase() === 'moon');
      const moonSign = moonPlanet?.signName || 'Moon Sign';
      const moonNak = moonPlanet?.nakshatra ? `${moonPlanet.nakshatra} (Pada ${moonPlanet.pada || 1})` : 'Nakshatra';

      const traditionNames: Record<string, string> = {
        parashari: 'Parashari Jyotish (Brihat Parashara Hora Shastra)',
        jaimini: 'Jaimini Sutras (Chara Karaka & Sign Aspects)',
        lal_kitab: 'Lal Kitab (Palmistry & Planetary Debts)',
        kp_system: 'KP System (Krishnamurti Padhdhati Placidus Cusps)',
        bhrigu_nadi: 'Bhrigu Nadi (Nandi Nadi Planetary Combinations)',
      };
      const activeTraditionTitle = traditionNames[tradition] || 'Vedic Multi-Tradition Synthesis';

      // --- PAGE 1: NATAL PARTICULARS, PLANETARY EPHEMERIS & 12 HOUSES ---
      let yPos = 33;

      // 1. Client & Natal Coordinates Box
      doc.setFillColor(252, 249, 242);
      doc.setDrawColor(226, 211, 176);
      doc.setLineWidth(0.4);
      doc.roundedRect(13, yPos, pageWidth - 26, 24, 2, 2, 'FD');
      doc.line(pageWidth / 2, yPos, pageWidth / 2, yPos + 24);

      // Left Column
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(126, 95, 24);
      doc.text('CLIENT & BIRTH PARTICULARS', 17, yPos + 5.5);

      doc.setFontSize(10);
      doc.setTextColor(26, 26, 30);
      doc.text(profile.fullName || 'Vedic Seeker', 17, yPos + 10.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.2);
      doc.setTextColor(80, 80, 80);
      const birthDetails = `Born: ${profile.birthDate || 'N/A'}${profile.birthTime ? ` at ${profile.birthTime}` : ''} | ${profile.birthPlace || 'Global'}`;
      doc.text(doc.splitTextToSize(birthDetails, (pageWidth - 36) / 2)[0] || '', 17, yPos + 15);
      doc.text(`System: ${profile.horoscopeSystem === 'western' ? 'Western Tropical (Sayana)' : 'Vedic Sidereal (Nirayana - Lahiri)'}`, 17, yPos + 19.5);

      // Right Column
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(126, 95, 24);
      doc.text('CELESTIAL & TRADITION COORDINATES', pageWidth / 2 + 5, yPos + 5.5);

      doc.setFontSize(8.5);
      doc.setTextColor(26, 26, 30);
      doc.text(`Lagna: ${ascSign} (${ascDeg}°)  |  Moon: ${moonSign}`, pageWidth / 2 + 5, yPos + 10.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.2);
      doc.setTextColor(80, 80, 80);
      doc.text(`Nakshatra: ${moonNak}  |  Asc: ${ascNak}`, pageWidth / 2 + 5, yPos + 15);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(181, 131, 40);
      doc.text(`Active Tradition: ${activeTraditionTitle.split('(')[0].trim()}`, pageWidth / 2 + 5, yPos + 19.5);

      yPos += 27;

      // 2. Graha Ephemeris Positions (9 Planets Table)
      doc.setFillColor(248, 245, 237);
      doc.setDrawColor(201, 160, 80);
      doc.setLineWidth(0.4);
      doc.roundedRect(13, yPos, pageWidth - 26, 70, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(126, 95, 24);
      doc.text('GRAHA EPHEMERIS POSITIONS (NINE PLANETARY COORDINATES)', 17, yPos + 5);

      // Table Header Bar
      const tableHeaders = ['Planet', 'Sanskrit', 'Sign / Rashi', 'Degree', 'Nakshatra', 'Pada', 'Dignity', 'Motion'];
      const colWidths = [24, 22, 28, 20, 32, 14, 24, 20];
      const startX = 13;
      let headerY = yPos + 8;

      doc.setFillColor(236, 227, 206);
      doc.rect(startX, headerY, pageWidth - 26, 5.5, 'F');
      doc.setFontSize(6.8);
      doc.setTextColor(100, 75, 20);

      let curX = startX + 2;
      tableHeaders.forEach((th, i) => {
        doc.text(th, curX, headerY + 3.8);
        curX += colWidths[i];
      });

      // Planet Rows
      doc.setFont('helvetica', 'normal');
      let rowY = headerY + 5.5;
      chartData.planets.slice(0, 9).forEach((p, idx) => {
        if (idx % 2 === 1) {
          doc.setFillColor(252, 250, 245);
          doc.rect(startX, rowY, pageWidth - 26, 6, 'F');
        }
        doc.setFontSize(6.8);
        doc.setTextColor(30, 30, 35);

        let cellX = startX + 2;
        doc.setFont('helvetica', 'bold');
        doc.text(p.name, cellX, rowY + 4);
        cellX += colWidths[0];

        doc.setFont('helvetica', 'normal');
        doc.text(p.sanskritName || p.name, cellX, rowY + 4);
        cellX += colWidths[1];

        doc.text(`${p.signName} (H${p.house || 1})`, cellX, rowY + 4);
        cellX += colWidths[2];

        doc.text(`${p.degree.toFixed(2)}°`, cellX, rowY + 4);
        cellX += colWidths[3];

        doc.text(p.nakshatra || '-', cellX, rowY + 4);
        cellX += colWidths[4];

        doc.text(`Pada ${p.pada || 1}`, cellX, rowY + 4);
        cellX += colWidths[5];

        // Dignity with color highlight
        if (p.dignity?.toLowerCase().includes('exalt')) {
          doc.setTextColor(34, 139, 34);
        } else if (p.dignity?.toLowerCase().includes('debilit')) {
          doc.setTextColor(178, 34, 34);
        } else {
          doc.setTextColor(181, 131, 40);
        }
        doc.text(p.dignity || 'Neutral', cellX, rowY + 4);
        doc.setTextColor(30, 30, 35);
        cellX += colWidths[6];

        doc.text(p.isRetrograde ? 'Retrograde (R)' : 'Direct (D)', cellX, rowY + 4);

        doc.setDrawColor(235, 225, 205);
        doc.setLineWidth(0.15);
        doc.line(startX, rowY + 6, pageWidth - 13, rowY + 6);

        rowY += 6;
      });

      yPos += 74;

      // 3. 12 Bhavas (Houses) Overview Grid
      doc.setFillColor(252, 249, 242);
      doc.setDrawColor(201, 160, 80);
      doc.setLineWidth(0.4);
      doc.roundedRect(13, yPos, pageWidth - 26, 92, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(126, 95, 24);
      doc.text('TWELVE BHAVAS (HOUSE PARTICULARS & SIGNIFICANCES)', 17, yPos + 5);

      const hHalfW = (pageWidth - 36) / 2;
      chartData.houses.slice(0, 12).forEach((h, hIdx) => {
        const isRightCol = hIdx >= 6;
        const localIdx = isRightCol ? hIdx - 6 : hIdx;
        const boxX = isRightCol ? pageWidth / 2 + 3 : 16;
        const boxY = yPos + 8 + localIdx * 13.5;

        doc.setFillColor(248, 244, 235);
        doc.setDrawColor(226, 211, 176);
        doc.setLineWidth(0.2);
        doc.roundedRect(boxX, boxY, hHalfW, 12, 1, 1, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.8);
        doc.setTextColor(126, 95, 24);
        doc.text(`H${h.houseNumber}: ${h.sanskritName || `House ${h.houseNumber}`}`, boxX + 2.5, boxY + 3.8);

        doc.setFontSize(6.5);
        doc.setTextColor(26, 26, 30);
        doc.text(`Sign: ${h.signName} (Lord: ${h.signLord})`, boxX + 2.5, boxY + 7.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.setTextColor(80, 80, 80);
        const occPlanets = h.planets?.map((p) => p.name).join(', ') || 'No Planets';
        const subLordText = h.kpSubLord ? ` | Sub-Lord: ${h.kpSubLord}` : '';
        doc.text(`Occupants: ${occPlanets}${subLordText}`, boxX + 2.5, boxY + 10.5);
      });

      // --- PAGE 2: YOGAS, DOSHAS, DASHA TIMELINE, AI SYNTHESIS & REMEDIES ---
      doc.addPage();
      yPos = 22;

      // 4. Vedic Yogas Box
      doc.setFillColor(254, 252, 247);
      doc.setDrawColor(201, 160, 80);
      doc.setLineWidth(0.4);
      doc.roundedRect(13, yPos, pageWidth - 26, 42, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(126, 95, 24);
      doc.text('AUSPICIOUS VEDIC YOGAS & CELESTIAL FORMATIONS', 17, yPos + 5);

      if (chartData.yogas && chartData.yogas.length > 0) {
        chartData.yogas.slice(0, 3).forEach((yoga, yIdx) => {
          const yOff = yPos + 9 + yIdx * 10.5;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.2);
          doc.setTextColor(181, 131, 40);
          doc.text(`• ${yoga.name} (${yoga.sanskritName || yoga.name})`, 17, yOff);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6.5);
          doc.setTextColor(50, 50, 55);
          const yogaDesc = doc.splitTextToSize(yoga.effects || yoga.description || 'Promotes auspicious spiritual and material elevation.', pageWidth - 40);
          doc.text(yogaDesc[0] || '', 20, yOff + 4);
        });
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(80, 80, 80);
        doc.text('Harmonious planetary configurations active across Kendras and Trikonas.', 17, yPos + 12);
      }

      yPos += 46;

      // 5. Vedic Doshas Box
      doc.setFillColor(254, 252, 247);
      doc.setDrawColor(201, 160, 80);
      doc.setLineWidth(0.4);
      doc.roundedRect(13, yPos, pageWidth - 26, 38, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(126, 95, 24);
      doc.text('VEDIC DOSHAS & PLANETARY AFFLICTION EVALUATION', 17, yPos + 5);

      if (chartData.doshas && chartData.doshas.length > 0) {
        chartData.doshas.slice(0, 3).forEach((dosha, dIdx) => {
          const dOff = yPos + 9 + dIdx * 9.5;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.2);
          doc.setTextColor(dosha.present ? 178 : 34, dosha.present ? 34 : 139, 34);
          doc.text(`• ${dosha.name}: ${dosha.present ? `Present (${dosha.intensity || 'Moderate'})` : 'Not Afflicted / Absent'}`, 17, dOff);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6.5);
          doc.setTextColor(60, 60, 65);
          const doshaDesc = doc.splitTextToSize(dosha.remedies || dosha.description || 'Standard pacification practices recommended.', pageWidth - 40);
          doc.text(doshaDesc[0] || '', 20, dOff + 3.8);
        });
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(80, 80, 80);
        doc.text('No severe planetary afflictions identified; standard daily Japa maintains equilibrium.', 17, yPos + 12);
      }

      yPos += 42;

      // 6. Vimshottari Dasha Timeline Box
      doc.setFillColor(252, 249, 242);
      doc.setDrawColor(201, 160, 80);
      doc.setLineWidth(0.4);
      doc.roundedRect(13, yPos, pageWidth - 26, 36, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(126, 95, 24);
      doc.text('VIMSHOTTARI DASHA CYCLES & ACTIVE MAHADASHAS', 17, yPos + 5);

      const dashaW = (pageWidth - 36) / 3;
      chartData.dashas.slice(0, 6).forEach((d, dIdx) => {
        const col = dIdx % 3;
        const row = Math.floor(dIdx / 3);
        const dX = 17 + col * (dashaW + 2);
        const dY = yPos + 9 + row * 12.5;

        doc.setFillColor(d.isCurrent ? 245 : 255, d.isCurrent ? 236 : 255, d.isCurrent ? 215 : 255);
        doc.setDrawColor(d.isCurrent ? 201 : 226, d.isCurrent ? 160 : 211, d.isCurrent ? 80 : 176);
        doc.setLineWidth(d.isCurrent ? 0.4 : 0.2);
        doc.roundedRect(dX, dY, dashaW, 11, 1, 1, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.8);
        doc.setTextColor(d.isCurrent ? 181 : 30, d.isCurrent ? 131 : 30, d.isCurrent ? 40 : 35);
        doc.text(`${d.planet} (${d.durationYears} Yrs)${d.isCurrent ? ' • ACTIVE' : ''}`, dX + 2.5, dY + 4);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.setTextColor(90, 90, 90);
        doc.text(`${d.startDate.slice(0, 4)} – ${d.endDate.slice(0, 4)}`, dX + 2.5, dY + 8);
      });

      yPos += 40;

      // 7. AI Multi-Tradition Interpretation / Guidance
      doc.setFillColor(254, 252, 247);
      doc.setDrawColor(201, 160, 80);
      doc.setLineWidth(0.4);
      doc.roundedRect(13, yPos, pageWidth - 26, 44, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(126, 95, 24);
      doc.text(`AI DEEP SYNTHESIS (${tradition.toUpperCase()} METHODOLOGY)`, 17, yPos + 5);

      const aiText = aiInterpretation || `Planetary positions synthesized across ${activeTraditionTitle}. The ascendant ${ascSign} lord and active Vimshottari Mahadasha indicate key milestones in professional leadership, intellectual growth, and dharmic alignment. Maintain focus on planetary harmonization during transition periods.`;
      const aiLines = doc.splitTextToSize(aiText.replace(/[#*`_>-]/g, ' '), pageWidth - 36);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(40, 40, 45);
      doc.text(aiLines.slice(0, 8), 17, yPos + 9.5);

      yPos += 48;

      // 8. Recommended Gemstones & Upayas
      doc.setFillColor(250, 247, 240);
      doc.setDrawColor(201, 160, 80);
      doc.setLineWidth(0.4);
      doc.roundedRect(13, yPos, pageWidth - 26, 26, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(126, 95, 24);
      doc.text('RECOMMENDED TRIKONA GEMSTONES & VEDIC REMEDIES', 17, yPos + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(50, 50, 55);
      if (chartData.gemstones && chartData.gemstones.length > 0) {
        chartData.gemstones.slice(0, 3).forEach((g, gIdx) => {
          doc.text(`• ${g.gem} (${g.planet}): ${g.purpose}`, 17, yPos + 9.5 + gIdx * 4.8);
        });
      } else {
        doc.text('• Primary Gemstone: Yellow Sapphire (Jupiter) or Ruby (Sun) in Gold on Sunday/Thursday morning.', 17, yPos + 10);
        doc.text('• Daily Upaya: Gayatri Mantra (108 Japa) during Brahma Muhurta and Surya Arghya.', 17, yPos + 15);
      }

      // --- PAGE DECORATIONS PASS ---
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);

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
          doc.text('5 VEDIC TRADITIONS & BIRTH CHART REPORT', 33, 24.5);

          doc.setFont('helvetica', 'italic');
          doc.setFontSize(7);
          doc.setTextColor(110, 105, 95);
          doc.text(
            `Precision Astronomical Ephemeris • Parashari • Jaimini • Lal Kitab • KP • Nadi (${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })})`,
            33,
            28
          );
        } else {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(126, 95, 24);
          doc.text('JYOTISHVEDA • 5 VEDIC TRADITIONS & BIRTH CHART REPORT', 14, 14);
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

        // Footer
        const footerY = pageHeight - 18;
        doc.setDrawColor(226, 211, 176);
        doc.setLineWidth(0.4);
        doc.line(13, footerY, pageWidth - 13, footerY);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(110, 105, 95);
        const certId = `JV-TRAD-${Date.now().toString(36).toUpperCase()}`;
        doc.text(
          `Document ID: ${certId}  |  Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}  |  Confidential`,
          14,
          footerY + 4
        );
        doc.text(
          `Certified by JyotishVeda AI & Traditional Daivajna Ephemeris Engine  |  Page ${i} of ${totalPages}`,
          pageWidth - 14,
          footerY + 4,
          { align: 'right' }
        );
      }

      // Save PDF
      const safeName = (profile.fullName || 'Seeker').replace(/[^a-zA-Z0-9]/g, '_');
      const dateStr = new Date().toISOString().split('T')[0];
      doc.save(`JyotishVeda_BirthChart_${tradition}_${safeName}_${dateStr}.pdf`);
    } catch (err) {
      console.error('Failed to generate birth chart traditions PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // --------------------------------------------------
  // NORTH INDIAN CHART
  // --------------------------------------------------

  const renderNorthIndianChart = () => {
    return (
      <div className="relative w-full max-w-[380px] aspect-square mx-auto bg-[#08080A] rounded-xl border border-[#C9A050]/40 p-1 shadow-2xl select-none">
        <svg
          viewBox="0 0 300 300"
          className="w-full h-full text-[#C9A050] stroke-[#C9A050]/60 stroke-[1.5]"
        >
          <rect
            x="5"
            y="5"
            width="290"
            height="290"
            fill="none"
            className="stroke-[#C9A050]/80 stroke-2"
          />

          <line
            x1="5"
            y1="5"
            x2="295"
            y2="295"
          />

          <line
            x1="295"
            y1="5"
            x2="5"
            y2="295"
          />

          <line
            x1="150"
            y1="5"
            x2="5"
            y2="150"
          />

          <line
            x1="5"
            y1="150"
            x2="150"
            y2="295"
          />

          <line
            x1="150"
            y1="295"
            x2="295"
            y2="150"
          />

          <line
            x1="295"
            y1="150"
            x2="150"
            y2="5"
          />
        </svg>

        {/* House 1 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[0])
          }
          className={`absolute top-[18%] left-[32%] w-[36%] h-[26%] flex flex-col items-center justify-center cursor-pointer rounded transition p-1 ${
            selectedHouse?.houseNumber === 1
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[10px] font-serif font-bold text-[#C9A050]">
            H1 ({chartData.houses[0].signIndex + 1})
          </span>

          <span className="text-[9px] text-[#9E9A90]">
            Lagna {chartData.ascendant.signName.slice(0, 3)}
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center mt-0.5">
            {chartData.houses[0].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
                isDiamond
              />
            ))}
          </div>
        </div>

        {/* House 2 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[1])
          }
          className={`absolute top-[4%] left-[6%] w-[26%] h-[22%] flex flex-col items-center justify-center cursor-pointer rounded transition ${
            selectedHouse?.houseNumber === 2
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[9px] font-serif font-bold text-[#E5E1D8]">
            H2 ({chartData.houses[1].signIndex + 1})
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center">
            {chartData.houses[1].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
              />
            ))}
          </div>
        </div>

        {/* House 3 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[2])
          }
          className={`absolute top-[26%] left-[4%] w-[22%] h-[26%] flex flex-col items-center justify-center cursor-pointer rounded transition ${
            selectedHouse?.houseNumber === 3
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[9px] font-serif font-bold text-[#E5E1D8]">
            H3 ({chartData.houses[2].signIndex + 1})
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center">
            {chartData.houses[2].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
              />
            ))}
          </div>
        </div>

        {/* House 4 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[3])
          }
          className={`absolute top-[38%] left-[16%] w-[26%] h-[26%] flex flex-col items-center justify-center cursor-pointer rounded transition ${
            selectedHouse?.houseNumber === 4
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[10px] font-serif font-bold text-[#C9A050]">
            H4 ({chartData.houses[3].signIndex + 1})
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center">
            {chartData.houses[3].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
                isDiamond
              />
            ))}
          </div>
        </div>

        {/* House 5 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[4])
          }
          className={`absolute top-[58%] left-[4%] w-[22%] h-[26%] flex flex-col items-center justify-center cursor-pointer rounded transition ${
            selectedHouse?.houseNumber === 5
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[9px] font-serif font-bold text-[#E5E1D8]">
            H5 ({chartData.houses[4].signIndex + 1})
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center">
            {chartData.houses[4].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
              />
            ))}
          </div>
        </div>

        {/* House 6 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[5])
          }
          className={`absolute bottom-[4%] left-[6%] w-[26%] h-[22%] flex flex-col items-center justify-center cursor-pointer rounded transition ${
            selectedHouse?.houseNumber === 6
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[9px] font-serif font-bold text-[#E5E1D8]">
            H6 ({chartData.houses[5].signIndex + 1})
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center">
            {chartData.houses[5].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
              />
            ))}
          </div>
        </div>

        {/* House 7 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[6])
          }
          className={`absolute bottom-[16%] left-[32%] w-[36%] h-[26%] flex flex-col items-center justify-center cursor-pointer rounded transition ${
            selectedHouse?.houseNumber === 7
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[10px] font-serif font-bold text-[#C9A050]">
            H7 ({chartData.houses[6].signIndex + 1})
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center">
            {chartData.houses[6].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
                isDiamond
              />
            ))}
          </div>
        </div>

        {/* House 8 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[7])
          }
          className={`absolute bottom-[4%] right-[6%] w-[26%] h-[22%] flex flex-col items-center justify-center cursor-pointer rounded transition ${
            selectedHouse?.houseNumber === 8
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[9px] font-serif font-bold text-[#E5E1D8]">
            H8 ({chartData.houses[7].signIndex + 1})
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center">
            {chartData.houses[7].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
              />
            ))}
          </div>
        </div>

        {/* House 9 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[8])
          }
          className={`absolute top-[58%] right-[4%] w-[22%] h-[26%] flex flex-col items-center justify-center cursor-pointer rounded transition ${
            selectedHouse?.houseNumber === 9
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[9px] font-serif font-bold text-[#E5E1D8]">
            H9 ({chartData.houses[8].signIndex + 1})
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center">
            {chartData.houses[8].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
              />
            ))}
          </div>
        </div>

        {/* House 10 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[9])
          }
          className={`absolute top-[38%] right-[16%] w-[26%] h-[26%] flex flex-col items-center justify-center cursor-pointer rounded transition ${
            selectedHouse?.houseNumber === 10
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[10px] font-serif font-bold text-[#C9A050]">
            H10 ({chartData.houses[9].signIndex + 1})
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center">
            {chartData.houses[9].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
                isDiamond
              />
            ))}
          </div>
        </div>

        {/* House 11 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[10])
          }
          className={`absolute top-[26%] right-[4%] w-[22%] h-[26%] flex flex-col items-center justify-center cursor-pointer rounded transition ${
            selectedHouse?.houseNumber === 11
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[9px] font-serif font-bold text-[#E5E1D8]">
            H11 ({chartData.houses[10].signIndex + 1})
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center">
            {chartData.houses[10].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
              />
            ))}
          </div>
        </div>

        {/* House 12 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[11])
          }
          className={`absolute top-[4%] right-[6%] w-[26%] h-[22%] flex flex-col items-center justify-center cursor-pointer rounded transition ${
            selectedHouse?.houseNumber === 12
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[9px] font-serif font-bold text-[#E5E1D8]">
            H12 ({chartData.houses[11].signIndex + 1})
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center">
            {chartData.houses[11].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  // --------------------------------------------------
  // SOUTH INDIAN CHART
  // --------------------------------------------------

  const renderSouthIndianChart = () => {
    const gridSignIndices = [
      [11, 0, 1, 2],
      [10, -1, -1, 3],
      [9, -1, -1, 4],
      [8, 7, 6, 5],
    ];

    return (
      <div className="w-full max-w-[380px] aspect-square mx-auto bg-[#08080A] rounded-xl border border-[#C9A050]/40 p-2 shadow-2xl grid grid-cols-4 grid-rows-4 gap-1 select-none">
        {gridSignIndices.map((row, rIdx) =>
          row.map((signIdx, cIdx) => {
            if (signIdx === -1) {
              if (rIdx === 1 && cIdx === 1) {
                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className="col-span-2 row-span-2 bg-[#141418] border border-[#2A2A2E] rounded-lg flex flex-col items-center justify-center p-2 text-center"
                  >
                    <span className="text-[#C9A050] font-serif font-bold text-xs">
                      South Indian Kundli
                    </span>

                    <span className="text-[10px] text-[#9E9A90] mt-1">
                      Lagna in House 1 (
                      {chartData.ascendant.signName})
                    </span>

                    <span className="text-[9px] text-[#C9A050]/80 mt-1 font-mono">
                      12 Fixed Rashis Matrix
                    </span>
                  </div>
                );
              }

              return null;
            }

            const houseMatchingSign =
              chartData.houses.find(
                (h) => h.signIndex === signIdx
              );

            const isLagnaSign =
              chartData.ascendant.signIndex === signIdx;

            const planetsInSign =
              chartData.planets.filter(
                (p) => p.signIndex === signIdx
              );

            const isSelected =
              selectedHouse?.signIndex === signIdx;

            return (
              <div
                key={`${rIdx}-${cIdx}`}
                onClick={() =>
                  houseMatchingSign &&
                  setSelectedHouse(houseMatchingSign)
                }
                className={`border rounded p-1 flex flex-col justify-between cursor-pointer transition ${
                  isSelected
                    ? 'border-[#C9A050] bg-[#C9A050]/15'
                    : isLagnaSign
                    ? 'border-[#C9A050]/50 bg-[#141418]'
                    : 'border-[#2A2A2E] bg-[#141418]/60 hover:bg-[#1A1A1E]'
                }`}
              >
                <div className="flex justify-between items-center text-[9px] font-bold">
                  <span
                    className={
                      isLagnaSign
                        ? 'text-[#C9A050]'
                        : 'text-[#9E9A90]'
                    }
                  >
                    {isLagnaSign
                      ? 'ASC/L'
                      : `H${houseMatchingSign?.houseNumber || ''}`}
                  </span>

                  <span className="text-[#9E9A90] font-mono">
                    {signIdx + 1}
                  </span>
                </div>

                <div className="flex flex-wrap gap-0.5 justify-center py-0.5">
                  {planetsInSign.map((p) => (
                    <span
                      key={p.id}
                      className="text-[9px] font-bold text-[#E5E1D8] bg-[#1A1A1E] px-0.5 rounded border border-[#C9A050]/30"
                    >
                      {p.name.slice(0, 2)}
                    </span>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  // --------------------------------------------------
  // --------------------------------------------------
  // EAST INDIAN CHART (12-Box Perimeter Layout / Surya Chakra)
  // --------------------------------------------------

  const renderEastIndianChart = () => {
    // Standard East Indian (Surya Chakra / Bengali style):
    // 12 outer boxes along the perimeter with a 2x2 center.
    // Fixed Rashis running Counter-Clockwise starting from Aries (Mesha, 0) at top:
    // Row 0: Taurus (1), Aries (0), Pisces (11), Aquarius (10)
    // Row 1: Gemini (2), [Center], [Center], Capricorn (9)
    // Row 2: Cancer (3), [Center], [Center], Sagittarius (8)
    // Row 3: Leo (4), Virgo (5), Libra (6), Scorpio (7)
    const eastGridSignIndices = [
      [1, 0, 11, 10],
      [2, -1, -1, 9],
      [3, -1, -1, 8],
      [4, 5, 6, 7],
    ];

    return (
      <div className="w-full max-w-[380px] aspect-square mx-auto bg-[#08080A] rounded-xl border border-[#C9A050]/40 p-2 shadow-2xl grid grid-cols-4 grid-rows-4 gap-1 select-none">
        {eastGridSignIndices.map((row, rIdx) =>
          row.map((signIdx, cIdx) => {
            if (signIdx === -1) {
              if (rIdx === 1 && cIdx === 1) {
                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className="col-span-2 row-span-2 bg-[#141418] border border-[#C9A050]/30 rounded-lg flex flex-col items-center justify-center p-2 text-center"
                  >
                    <span className="text-[#C9A050] font-serif font-bold text-xs">
                      East Indian Kundli
                    </span>
                    <span className="text-[10px] text-[#9E9A90] mt-1">
                      Lagna: {chartData.ascendant.signName} (H1)
                    </span>
                    <span className="text-[9px] text-[#C9A050]/80 mt-1 font-mono">
                      12 Fixed Rashis (Anti-Clockwise)
                    </span>
                  </div>
                );
              }
              return null;
            }

            const houseMatchingSign = chartData.houses.find(
              (h) => h.signIndex === signIdx
            );

            const isLagnaSign =
              chartData.ascendant.signIndex === signIdx;

            const planetsInSign = chartData.planets.filter(
              (p) => p.signIndex === signIdx
            );

            const isSelected =
              selectedHouse?.signIndex === signIdx;

            return (
              <div
                key={`${rIdx}-${cIdx}`}
                onClick={() =>
                  houseMatchingSign && setSelectedHouse(houseMatchingSign)
                }
                className={`border rounded p-1 flex flex-col justify-between cursor-pointer transition ${
                  isSelected
                    ? 'border-[#C9A050] bg-[#C9A050]/15'
                    : isLagnaSign
                    ? 'border-[#C9A050]/60 bg-[#C9A050]/10'
                    : 'border-[#2A2A2E] bg-[#141418]/60 hover:bg-[#1A1A1E]'
                }`}
              >
                <div className="flex justify-between items-center text-[9px] font-bold">
                  <span
                    className={
                      isLagnaSign ? 'text-[#C9A050]' : 'text-[#9E9A90]'
                    }
                  >
                    {isLagnaSign
                      ? 'ASC/L'
                      : `H${houseMatchingSign?.houseNumber || ''}`}
                  </span>

                  <span className="text-[#C9A050]/80 font-mono text-[8.5px]">
                    {signIdx + 1}
                  </span>
                </div>

                <div className="flex flex-wrap gap-0.5 justify-center py-0.5">
                  {planetsInSign.map((p) => (
                    <PlanetBadge
                      key={p.id}
                      p={p}
                      isDiamond
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#2A2A2E]">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-widest text-[#C9A050] uppercase mb-1">
              <span className="flex items-center space-x-1.5">
                <Compass className="w-4 h-4" />
                <span>
                  {profile.horoscopeSystem === 'western'
                    ? 'Western Tropical (Sayana) Horoscope Engine'
                    : 'Vedic Sidereal (Nirayana) Jyotish Engine'}
                </span>
              </span>

              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1A1A1E] text-[#9E9A90] border border-[#2A2A2E] normal-case tracking-normal">
                {profile.horoscopeSystem === 'western'
                  ? 'Equinox-Aligned • Ayanamsha: +23.86° Tropical Shift'
                  : 'Lahiri Ayanamsha (~24°) • 27 Nakshatras'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#F0ECE1]">
              {profile.horoscopeSystem === 'western'
                ? 'Western & Multi-Tradition Astrological Synthesis'
                : 'Vedic Birth Chart & Multi-Tradition Synthesis'}
            </h1>

            <p className="text-xs text-[#9E9A90] mt-1 leading-relaxed">
              Synthesizing {profile.fullName}&apos;s profile across Parashari, Jaimini, Lal Kitab, KP System, and Bhrigu Nadi methodologies.
            </p>
          </div>

          <button
            onClick={handleDownloadTraditionsPdf}
            disabled={isGeneratingPdf}
            className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border text-xs font-bold transition shadow-lg cursor-pointer bg-gradient-to-r from-[#C9A050] to-[#A07828] hover:from-[#D4AF37] hover:to-[#B38730] text-[#0D0D0F] border-[#C9A050] shadow-[#C9A050]/20 shrink-0 disabled:opacity-50"
            title="Download full birth chart traditions PDF report"
          >
            {isGeneratingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Report (PDF)'}</span>
          </button>
        </div>

        {/* TRADITIONS */}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 mt-5">
          {traditionsList.map((traditionItem) => {
            const isActive =
              tradition === traditionItem.id;

            return (
              <button
                key={traditionItem.id}
                onClick={() =>
                  setTradition(traditionItem.id)
                }
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'bg-[#1A1A1E] border-[#C9A050] shadow-md shadow-[#C9A050]/10'
                    : 'bg-[#141418] border-[#2A2A2E] hover:border-[#C9A050]/40 text-[#9E9A90]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-serif font-bold ${
                        isActive
                          ? 'text-[#C9A050]'
                          : 'text-[#F0ECE1]'
                      }`}
                    >
                      {traditionItem.name}
                    </span>

                    {isActive && (
                      <CheckCircle className="w-3.5 h-3.5 text-[#C9A050]" />
                    )}
                  </div>

                  <span className="text-[10px] text-[#C9A050]/80 font-mono block mt-0.5">
                    {traditionItem.tag}
                  </span>
                </div>

                <p className="text-[11px] text-[#9E9A90] mt-2 line-clamp-2 leading-relaxed">
                  {traditionItem.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN GRID (2 COLUMNS ON TABLETS & DESKTOPS) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* LEFT COLUMN */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-5 text-[#E5E1D8] shadow-xl flex flex-col items-center">
            <div className="w-full pb-3 mb-3 border-b border-[#2A2A2E] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-serif font-semibold text-[#C9A050] flex items-center space-x-1.5">
                  <Layers className="w-4 h-4" />

                  <span>
                    Click any House to inspect
                  </span>
                </span>

                <span className="text-[#9E9A90]">
                  Lagna: {chartData.ascendant.signName} (
                  {chartData.ascendant.degree}°)
                </span>
              </div>

              {/* CHART STYLE */}
              <div className="flex items-center justify-between bg-[#1A1A1E] p-1 rounded-xl border border-[#2A2A2E]">
                <span className="text-[11px] text-[#9E9A90] px-2 font-medium">
                  Chart Style:
                </span>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() =>
                      setChartStyle('north_indian')
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition cursor-pointer ${
                      chartStyle === 'north_indian'
                        ? 'bg-[#C9A050] text-[#0D0D0F] shadow'
                        : 'text-[#9E9A90] hover:text-white'
                    }`}
                  >
                    North Indian
                  </button>

                  <button
                    onClick={() =>
                      setChartStyle('south_indian')
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition cursor-pointer ${
                      chartStyle === 'south_indian'
                        ? 'bg-[#C9A050] text-[#0D0D0F] shadow'
                        : 'text-[#9E9A90] hover:text-white'
                    }`}
                  >
                    South Indian
                  </button>

                  <button
                    onClick={() =>
                      setChartStyle('east_indian')
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition cursor-pointer ${
                      chartStyle === 'east_indian'
                        ? 'bg-[#C9A050] text-[#0D0D0F] shadow'
                        : 'text-[#9E9A90] hover:text-white'
                    }`}
                  >
                    East Indian
                  </button>
                </div>
              </div>
            </div>

            {chartStyle === 'north_indian' &&
              renderNorthIndianChart()}

            {chartStyle === 'south_indian' &&
              renderSouthIndianChart()}

            {chartStyle === 'east_indian' &&
              renderEastIndianChart()}

            <p className="text-[11px] text-[#9E9A90] mt-4 text-center">
              Houses indicate life domains (Bhavas).
              Badges show planetary placements and
              conjunctions.
            </p>
          </div>

          {/* SELECTED HOUSE */}

          {selectedHouse && (
            <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-5 text-[#E5E1D8] shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2E]">
                <div className="flex items-center space-x-2">
                  <span className="w-7 h-7 rounded-lg bg-[#C9A050]/20 text-[#C9A050] font-serif font-bold text-xs flex items-center justify-center border border-[#C9A050]/30">
                    {selectedHouse.houseNumber}
                  </span>

                  <div>
                    <h3 className="text-sm font-serif font-bold text-[#F0ECE1]">
                      {selectedHouse.sanskritName}
                    </h3>

                    <span className="text-[11px] text-[#9E9A90]">
                      Sign: {selectedHouse.signName} (
                      {selectedHouse.signSanskrit}) • Lord:{' '}
                      {selectedHouse.signLord}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded bg-[#1A1A1E] text-[#C9A050] font-medium border border-[#2A2A2E]">
                  {selectedHouse.planets.length} Planets
                </span>
              </div>

              <div className="mt-3 space-y-2 text-xs font-sans">
                <div>
                  <span className="text-[9px] uppercase font-bold text-[#9E9A90] tracking-wider">
                    Significance
                  </span>

                  <p className="text-[#E5E1D8] mt-0.5 leading-relaxed">
                    {selectedHouse.significance}
                  </p>
                </div>

                {tradition === 'kp_system' && (
                  <div className="p-2.5 bg-[#1A1A1E] rounded-lg border border-[#2A2A2E] flex justify-between">
                    <span>
                      KP Cuspal Sub-Lord:{' '}
                      <strong className="text-[#C9A050]">
                        {selectedHouse.kpSubLord}
                      </strong>
                    </span>

                    <span>
                      Star Lord:{' '}
                      <strong className="text-[#C9A050]">
                        {selectedHouse.kpStarLord}
                      </strong>
                    </span>
                  </div>
                )}

                {tradition === 'lal_kitab' && (
                  <div className="p-2.5 bg-[#1A1A1E] rounded-lg border border-[#2A2A2E]">
                    <span className="text-[11px] text-[#9E9A90]">
                      Lal Kitab Farman State:
                    </span>

                    <p className="text-[#C9A050] font-semibold text-xs mt-0.5">
                      {selectedHouse.lalKitabState}
                    </p>
                  </div>
                )}

                {selectedHouse.planets.length > 0 && (
                  <div>
                    <span className="text-[9px] uppercase font-bold text-[#9E9A90] tracking-wider">
                      Occupying Grahas
                    </span>

                    <div className="grid grid-cols-1 gap-1.5 mt-1">
                      {selectedHouse.planets.map((p) => (
                        <div
                          key={p.id}
                          onClick={() =>
                            setSelectedPlanet(p)
                          }
                          className="p-2 bg-[#1A1A1E] rounded-lg border border-[#2A2A2E] flex items-center justify-between cursor-pointer hover:border-[#C9A050]/50"
                        >
                          <span className="font-semibold text-[#C9A050]">
                            {p.sanskritName} ({p.name})
                          </span>

                          <span className="text-[11px] text-[#9E9A90]">
                            {p.degree}° in {p.nakshatra} (
                            {p.dignity})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* YOGAS & DOSHAS (Moved to Left Column for perfect balanced layout) */}
          <div className="grid grid-cols-1 gap-4">
            {/* YOGAS */}
            <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-5 text-[#E5E1D8] shadow-xl space-y-3">
              <div className="flex items-center space-x-2 text-[#C9A050] font-serif font-bold text-xs pb-2 border-b border-[#2A2A2E]">
                <Sparkles className="w-4 h-4" />
                <span>
                  Detected Auspicious Yogas ({chartData.yogas.length})
                </span>
              </div>

              <div className="space-y-2">
                {chartData.yogas.map((y) => (
                  <div
                    key={y.id}
                    className="p-3 bg-[#1A1A1E] rounded-xl border border-[#2A2A2E]"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-serif font-bold text-[#C9A050]">
                        {y.name}
                      </h4>

                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#C9A050]/15 text-[#C9A050] font-sans">
                        {y.type}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#9E9A90] mt-1 leading-relaxed font-sans">
                      {y.effect}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* DOSHAS */}
            <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-5 text-[#E5E1D8] shadow-xl space-y-3">
              <div className="flex items-center space-x-2 text-[#C9A050] font-serif font-bold text-xs pb-2 border-b border-[#2A2A2E]">
                <Flame className="w-4 h-4" />
                <span>
                  Karmic Doshas & Planetary Afflictions
                </span>
              </div>

              <div className="space-y-2">
                {chartData.doshas.map((d) => (
                  <div
                    key={d.id}
                    className="p-3 bg-[#1A1A1E] rounded-xl border border-[#2A2A2E]"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-serif font-bold text-[#F0ECE1]">
                        {d.name}
                      </h4>

                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold font-sans ${
                          d.isPresent
                            ? 'dignity-badge-severe'
                            : 'dignity-badge-neutral'
                        }`}
                      >
                        {d.isPresent
                          ? d.severity
                          : 'Neutral'}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#9E9A90] mt-1 leading-relaxed font-sans">
                      {d.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ASPECTS */}
            {chartData.aspects && chartData.aspects.length > 0 && (
              <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-5 text-[#E5E1D8] shadow-xl space-y-3">
                <div className="flex items-center space-x-2 text-[#C9A050] font-serif font-bold text-xs pb-2 border-b border-[#2A2A2E]">
                  <Sparkles className="w-4 h-4" />
                  <span>
                    Planetary Aspects (Drishti)
                  </span>
                </div>
                <div className="space-y-2">
                  {chartData.aspects.map((asp, idx) => (
                    <div key={idx} className="p-2.5 bg-[#1A1A1E] rounded-lg border border-[#2A2A2E] grid grid-cols-3 items-center">
                      <span className="text-[11px] text-[#E5E1D8] font-semibold uppercase text-left truncate">{asp.aspectingPlanet}</span>
                      <span className="text-[9.5px] font-semibold text-[#C9A050] bg-[#C9A050]/15 border border-[#C9A050]/30 px-2.5 py-0.5 rounded-full justify-self-center text-center whitespace-nowrap">{asp.aspectType}</span>
                      <span className="text-[11px] text-[#C9A050] font-semibold uppercase text-right truncate">{asp.aspectedPlanet}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="md:col-span-7 space-y-6">
          {/* PLANETARY TABLE */}

          <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl overflow-x-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#2A2A2E] mb-4">
              <div>
                <h3 className="text-base font-serif font-bold text-[#F0ECE1]">
                  Sidereal Planetary Positions
                  (Graha Spashta)
                </h3>

                <p className="text-xs text-[#9E9A90]">
                  Lahiri Ayanamsha • Click a planet for
                  remedies & karakas
                </p>
              </div>

              <span className="text-[10px] px-2 py-0.5 bg-[#C9A050]/15 text-[#C9A050] rounded font-semibold border border-[#C9A050]/30 font-mono">
                {chartData.planets.length} Grahas
              </span>
            </div>

            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-[#2A2A2E] text-[#9E9A90] font-semibold">
                  <th className="pb-2.5 pl-3 pr-2">Planet</th>
                  <th className="pb-2.5 px-2">Sign (Rashi)</th>
                  <th className="pb-2.5 px-2">Degree</th>
                  <th className="pb-2.5 px-2">Nakshatra & Pada</th>
                  <th className="pb-2.5 px-2">Dignity</th>
                  {tradition === 'jaimini' && (
                    <th className="pb-2.5 px-2">Chara Karaka</th>
                  )}
                  {tradition === 'kp_system' && (
                    <>
                      <th className="pb-2.5 px-2 text-[#C9A050]">Star Lord</th>
                      <th className="pb-2.5 px-2 text-[#9E9A90]">Sub-Lord</th>
                    </>
                  )}
                  <th className="pb-2.5 pr-3 pl-2">Gemstone</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#2A2A2E]/60">
                {chartData.planets.map((p) => {
                  const isSelected = selectedPlanet?.id === p.id;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedPlanet(p)}
                      className={`hover:bg-[#1A1A1E] transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#C9A050]/15 font-semibold text-[#C9A050]'
                          : 'text-[#E5E1D8]'
                      }`}
                    >
                      <td className="py-2.5 pl-3 pr-2 flex items-center space-x-2 font-medium text-[#F0ECE1]">
                        <span className="text-sm sm:text-base text-[#C9A050] w-4 text-center shrink-0 inline-block">
                          {p.symbol}
                        </span>
                        <span className="whitespace-nowrap">{p.name}</span>
                        {p.isRetrograde && (
                          <span className="text-[10px] text-[#C9A050] font-bold shrink-0">
                            (R)
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-2 whitespace-nowrap">
                        {p.signName}
                      </td>

                      <td className="py-2.5 px-2 font-mono whitespace-nowrap">
                        {p.degree}°
                      </td>

                      <td className="py-2.5 px-2 text-[#9E9A90] whitespace-nowrap">
                        {p.nakshatra} (P{p.pada})
                      </td>

                      <td className="py-2.5 px-2 whitespace-nowrap">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            p.dignity === 'Exalted'
                              ? 'dignity-badge-neutral'
                              : p.dignity === 'Own'
                              ? 'dignity-badge-own'
                              : p.dignity === 'Debilitated'
                              ? 'dignity-badge-debilitated'
                              : 'dignity-badge-neutral'
                          }`}
                        >
                          {p.dignity}
                        </span>
                      </td>

                      {tradition === 'jaimini' && (
                        <td className="py-2.5 px-2 text-[#C9A050] font-medium font-serif whitespace-nowrap">
                          {p.karaka || '-'}
                        </td>
                      )}

                      {tradition === 'kp_system' && (
                        <>
                          <td className="py-2.5 px-2 whitespace-nowrap">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#C9A050]/15 text-[#C9A050] border border-[#C9A050]/30">
                              {p.nakshatraLord}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 whitespace-nowrap">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#9E9A90]/10 text-[#9E9A90] border border-[#9E9A90]/30">
                              {p.kpSubLord || '-'}
                            </span>
                          </td>
                        </>
                      )}

                      <td className="py-2.5 pr-3 pl-2 text-[11px] text-[#9E9A90] whitespace-nowrap">
                        {t(p.gemstone).split('(')[0]}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* DASHA */}

          <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2E] mb-4">
              <div>
                <h3 className="text-base font-serif font-bold text-[#F0ECE1]">
                  Vimshottari Mahadasha Timeline
                  (120 Years)
                </h3>

                <p className="text-xs text-[#9E9A90]">
                  Calculated from Moon’s natal Nakshatra
                  degree
                </p>
              </div>

              <span className="text-xs text-[#C9A050] font-semibold">
                Active: Jupiter Mahadasha
              </span>
            </div>

            <div className="space-y-2.5 font-sans">
              {chartData.dashas.map((d) => (
                <div
                  key={d.planet}
                  className={`p-3 rounded-xl border transition ${
                    d.isCurrent
                      ? 'bg-[#1A1A1E] border-[#C9A050] shadow-md'
                      : 'bg-[#141418]/60 border-[#2A2A2E] text-[#9E9A90]'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`font-bold ${
                          d.isCurrent
                            ? 'text-[#C9A050] text-sm font-serif'
                            : 'text-[#E5E1D8]'
                        }`}
                      >
                        {d.planet} ({d.sanskrit})
                      </span>

                      {d.isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-[#C9A050] text-[#0D0D0F] font-bold text-[9px] uppercase tracking-wider">
                          ACTIVE DASHA
                        </span>
                      )}
                    </div>

                    <span className="font-mono text-[#9E9A90] text-[11px]">
                      {d.startDate.slice(0, 4)} –{' '}
                      {d.endDate.slice(0, 4)} (
                      {d.durationYears} Years)
                    </span>
                  </div>

                  {d.isCurrent && d.subPeriods && (
                    <div className="mt-3 pt-3 border-t border-[#2A2A2E]">
                      <span className="text-[9px] uppercase font-bold text-[#C9A050] block mb-1.5 tracking-wider">
                        Active Antardashas (Sub-Periods)
                      </span>

                      <div className="flex flex-wrap gap-1.5">
                        {d.subPeriods
                          .slice(0, 6)
                          .map((sub) => (
                            <span
                              key={sub.planet}
                              className={`px-2 py-1 rounded text-[11px] border ${
                                sub.isCurrent
                                  ? 'bg-[#C9A050] text-[#0D0D0F] font-bold border-[#C9A050]'
                                  : 'bg-[#1A1A1E] text-[#E5E1D8] border-[#2A2A2E]'
                              }`}
                            >
                              {sub.planet} (
                              {new Date(sub.startDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })} - {new Date(sub.endDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })})
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* GEMSTONES (Favorable Gemstones placed in right column to balance layout) */}
          {chartData.gemstones && chartData.gemstones.length > 0 && (
            <div className={`${
              isDark
                ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]'
                : 'bg-[#FFFDF7] border-[#DECFA6] text-[#1E1B15]'
            } border rounded-2xl p-6 shadow-md space-y-4`}>
              <div className={`flex items-center justify-between pb-3 border-b ${
                isDark ? 'border-[#2A2A2E]' : 'border-[#DECFA6]/60'
              }`}>
                <div className="flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-[#C9A050]" />
                  <h3 className={`text-sm sm:text-base font-serif font-bold ${
                    isDark ? 'text-[#F0ECE1]' : 'text-[#8C6D23]'
                  }`}>
                    Favorable Gemstones (Lagna Based)
                  </h3>
                </div>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-semibold ${
                  isDark ? 'bg-[#C9A050]/15 text-[#C9A050] border border-[#C9A050]/30' : 'bg-[#FAF4E4] text-[#8C6D23] border border-[#DFC896]'
                }`}>
                  Trikona Vedic Upayas
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {chartData.gemstones.map((g, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition hover:scale-[1.01] ${
                      isDark
                        ? 'bg-[#1A1A1E] border-[#2A2A2E]'
                        : 'bg-[#FAF7F0] border-[#DECFA6]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-1">
                        <span className={`text-xs sm:text-[13px] font-bold ${
                          isDark ? 'text-[#F0ECE1]' : 'text-[#1E1B15]'
                        }`}>
                          {g.gem}
                        </span>
                        <span className="text-[10px] font-bold text-[#C9A050] uppercase tracking-wider shrink-0 bg-[#C9A050]/10 px-1.5 py-0.5 rounded">
                          {g.planet}
                        </span>
                      </div>
                      <p className={`text-[11px] leading-relaxed pt-1 ${
                        isDark ? 'text-[#9E9A90]' : 'text-[#6E6452]'
                      }`}>
                        {g.purpose}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI COMPREHENSIVE SYNTHESIS (FULL WIDTH ACROSS ENTIRE PAGE) */}
      <div className="w-full bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2E] flex-wrap gap-3">
          <div>
            <h3 className="text-base font-serif font-bold text-[#F0ECE1] flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#C9A050]" />
              <span>
                AI Comprehensive Synthesis ({tradition.toUpperCase()})
              </span>
            </h3>
            <p className="text-xs text-[#9E9A90]">
              Deep AI analysis integrating chart positions, dashas & ancient rules
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {aiInterpretation && (
              <button
                onClick={() => handleSpeech(aiInterpretation)}
                className="p-2 rounded-lg bg-[#1A1A1E] border border-[#2A2A2E] text-[#E5E1D8] hover:text-white transition cursor-pointer text-xs flex items-center space-x-1"
              >
                <Volume2 className="w-4 h-4" />
                <span>{isPlayingAudio ? 'Stop' : 'Listen'}</span>
              </button>
            )}

            <button
              onClick={handleGenerateAIInterpretation}
              disabled={isLoadingAi}
              className="px-3.5 py-2 rounded-lg bg-[#C9A050]/15 hover:bg-[#C9A050]/25 border border-[#C9A050]/40 text-[#C9A050] font-bold text-xs shadow-sm transition cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Sparkles
                className={`w-3.5 h-3.5 ${
                  isLoadingAi ? 'animate-spin' : ''
                }`}
              />
              <span>
                {isLoadingAi
                  ? 'Synthesizing...'
                  : aiInterpretation
                  ? 'Regenerate Analysis'
                  : 'Run Full AI Analysis'}
              </span>
            </button>
          </div>
        </div>

        {isLoadingAi ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
            <div className="w-9 h-9 border-2 border-[#C9A050] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-[#C9A050] font-serif font-semibold">
              JyotishVeda AI synthesizing multi-tradition Vedic sutras...
            </p>
          </div>
        ) : aiInterpretation ? (
          <div className="prose prose-invert max-w-none text-[#E5E1D8] text-xs sm:text-sm leading-relaxed space-y-3 whitespace-pre-line bg-[#08080A] p-5 rounded-xl border border-[#2A2A2E] font-serif">
            {aiInterpretation}
          </div>
        ) : (
          <div className="text-center py-6 bg-[#1A1A1E]/40 rounded-xl border border-[#2A2A2E]">
            <p className="text-xs text-[#9E9A90] font-sans">
              Ready to generate a comprehensive synthesis combining{' '}
              <strong className="text-[#C9A050]">{tradition}</strong> rules with your active Dasha timeline and yogas.
            </p>
            <button
              onClick={handleGenerateAIInterpretation}
              className="mt-3 px-4 py-2 rounded-lg bg-[#C9A050]/15 hover:bg-[#C9A050]/25 border border-[#C9A050]/40 text-[#C9A050] text-xs font-semibold cursor-pointer transition"
            >
              Click to Generate Deep AI Interpretation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};