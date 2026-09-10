import React, { useState, useEffect } from 'react';
import {
  Hash,
  Sparkles,
  Grid,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  Layers,
  ArrowRight,
  RefreshCw,
  Sliders,
  Shield,
  Flame,
  CloudUpload,
  Loader2,
  Download,
  FileText,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { UserProfile, NumerologyReport } from '../types';
import { CHALDEAN_VALUES, reduceToSingleDigit } from '../services/astroEngine';
import { saveNumerologyReport } from '../services/numerologyApi';
import { ApiError, api } from '../services/api';
import { API_ENDPOINTS } from '../config/api_config';

interface NumerologyViewProps {
  profile: UserProfile;
  numerology: NumerologyReport;
  isAuthenticated?: boolean;
  theme?: 'light' | 'dark';
}

export const NumerologyView: React.FC<NumerologyViewProps> = ({
  profile,
  numerology,
  isAuthenticated,
  theme = 'dark',
}) => {
  const [testName, setTestName] = useState(profile.fullName);
  
  const [backendData, setBackendData] = useState<NumerologyReport | null>(null);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
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

  useEffect(() => {
    const fetchBackendData = async () => {
      setIsAiLoading(true);
      try {
        // Fetch math/calc data from backend
        const calcData = await api.post<any>('/numerology/calculate', {
          fullName: profile.fullName,
          birthDate: profile.birthDate
        });
        
        if (calcData && calcData.data) {
          setBackendData(calcData.data);
          
          // Then fetch AI insights
          const missingNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => !calcData.data.loShuGrid[n]);
          const aiData = await api.post<any>(API_ENDPOINTS.NUMEROLOGY.AI_INSIGHTS, {
            mulank: calcData.data.mulank,
            bhagyank: calcData.data.bhagyank,
            namank: calcData.data.namankChaldean,
            missingNumbers,
            language: 'en'
          });
          
          if (aiData) setAiInsights(aiData);
        }
      } catch (e) {
        console.error('Failed to fetch Numerology data', e);
      } finally {
        setIsAiLoading(false);
      }
    };
    fetchBackendData();
  }, [profile.fullName, profile.birthDate]);

  const activeNumerology = backendData || numerology;
  const [activeTab, setActiveTab] = useState<'matrix' | 'loshu' | 'name_correction' | 'remedies'>('matrix');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSaveReport = async () => {
    setSaveState('saving');
    setSaveError(null);
    try {
      await saveNumerologyReport(profile.id, activeNumerology, profile);
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2500);
    } catch (err) {
      setSaveState('error');
      setSaveError(err instanceof ApiError ? err.message : 'Could not save report');
    }
  };

  // Calculate dynamic Chaldean value for test name
  const cleanTestName = testName.toUpperCase().replace(/[^A-Z]/g, '');
  let testChaldeanSum = 0;
  for (const ch of cleanTestName) {
    testChaldeanSum += CHALDEAN_VALUES[ch] || 0;
  }
  const testChaldeanSingle = reduceToSingleDigit(testChaldeanSum);

  // Standard 3x3 Lo Shu layout positions
  // Top Row: 4, 9, 2
  // Mid Row: 3, 5, 7
  // Bot Row: 8, 1, 6
  const loShuPositions = [
    [4, 9, 2],
    [3, 5, 7],
    [8, 1, 6],
  ];

  // Comprehensive Sacred Numerology & Lo Shu Magic Grid PDF Report Generator
  const handleDownloadNumerologyPdf = async () => {
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

      const mulank = activeNumerology.mulank;
      const mulankPlanet = activeNumerology.mulankPlanet || 'Ruling Planet';
      const bhagyank = activeNumerology.bhagyank;
      const bhagyankPlanet = activeNumerology.bhagyankPlanet || 'Destiny Planet';
      const namankChaldean = activeNumerology.namankChaldean;
      const namankPythagorean = activeNumerology.namankPythagorean || activeNumerology.namankChaldean;

      // --- PAGE 1: CORE MATRIX, LO SHU 3x3 GRID & 8 PLANES ---
      let yPos = 33;

      // 1. Client & Core Numerological Particulars Box
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 211, 176);
      doc.setLineWidth(0.4);
      doc.roundedRect(13, yPos, pageWidth - 26, 24, 2, 2, 'FD');
      doc.line(pageWidth / 2, yPos, pageWidth / 2, yPos + 24);

      // Left Column
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(126, 95, 24);
      doc.text('CLIENT & NUMEROLOGICAL PARTICULARS', 17, yPos + 5.5);

      doc.setFontSize(10);
      doc.setTextColor(26, 26, 30);
      doc.text(profile.fullName || 'Vedic Seeker', 17, yPos + 10.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.2);
      doc.setTextColor(80, 80, 80);
      const birthDetails = `Born: ${profile.birthDate || 'N/A'}${profile.birthTime ? ` at ${profile.birthTime}` : ''} | ${profile.birthPlace || 'Global'}`;
      doc.text(doc.splitTextToSize(birthDetails, (pageWidth - 36) / 2)[0] || '', 17, yPos + 15);
      doc.text(`Methodology: Vedic Sidereal & Chaldean Sacred Vibration Matrix`, 17, yPos + 19.5);

      // Right Column
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(126, 95, 24);
      doc.text('CORE NUMEROLOGY FREQUENCIES', pageWidth / 2 + 5, yPos + 5.5);

      doc.setFontSize(8.5);
      doc.setTextColor(26, 26, 30);
      doc.text(`Mulank: ${mulank} (${mulankPlanet.split('(')[0].trim()})  |  Bhagyank: ${bhagyank}`, pageWidth / 2 + 5, yPos + 10.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.2);
      doc.setTextColor(80, 80, 80);
      doc.text(`Namank: ${namankChaldean} (Chaldean) / ${namankPythagorean} (Pythagorean)`, pageWidth / 2 + 5, yPos + 15);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(181, 131, 40);
      doc.text(`Name Harmony: ${activeNumerology.nameCompatibility || 'Harmonious Resonance'}`, pageWidth / 2 + 5, yPos + 19.5);

      yPos += 32;

      // 2. Mulank & Bhagyank Synthesis Deep Dive
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(201, 160, 80);
      doc.setLineWidth(0.4);

      const traits = (aiInsights?.mulankCharacteristics || activeNumerology.mulankCharacteristics || []).join(' • ');
      const instinctText = `Your Mulank reveals how you instinctively react to challenges, your personal desires, and your subconscious behavioral patterns. Ruled by ${mulankPlanet}, you radiate authority and strive for self-directed excellence.`;
      const synergyText = `Your combination of Mulank ${activeNumerology.mulank} and Bhagyank ${activeNumerology.bhagyank} creates an energetic balance between daily execution and grand karmic accomplishments. Harness this alignment by scheduling critical launches on your auspicious dates.`;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      
      const halfW2 = (pageWidth - 36) / 2;
      const instinctLines = doc.splitTextToSize(instinctText, halfW2);
      const missionLines = doc.splitTextToSize(activeNumerology.bhagyankMission || '', halfW2);
      const synergyLines = doc.splitTextToSize(synergyText, halfW2);

      const leftH = 26 + (instinctLines.length * 3.5);
      const rightH = 14 + (missionLines.length * 3.5) + 8 + (synergyLines.length * 3.5);
      const synthBoxHeight = Math.max(leftH, rightH) + 12;

      doc.roundedRect(13, yPos, pageWidth - 26, synthBoxHeight, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(126, 95, 24);
      doc.text('MULANK & BHAGYANK (PSYCHIC & DESTINY) DEEP SYNTHESIS', 17, yPos + 5);

      const leftColX = 17;
      const rightColX = 13 + halfW2 + 8;

      // LEFT COL: MULANK
      doc.setFontSize(7.2);
      doc.setTextColor(181, 131, 40);
      doc.text(`MULANK ${activeNumerology.mulank} - PSYCHOLOGICAL DRIVERS`, leftColX, yPos + 10);
      
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6);
      doc.setTextColor(100, 100, 105);
      doc.text(doc.splitTextToSize(traits, halfW2).slice(0, 2), leftColX, yPos + 13.5);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(126, 95, 24);
      doc.text('INSTINCTIVE NATURE:', leftColX, yPos + 21);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 55);
      doc.text(instinctLines, leftColX, yPos + 24.5);

      // RIGHT COL: BHAGYANK
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.2);
      doc.setTextColor(181, 131, 40);
      doc.text(`BHAGYANK ${activeNumerology.bhagyank} - KARMIC LIFE MISSION`, rightColX, yPos + 10);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(50, 50, 55);
      doc.text(missionLines, rightColX, yPos + 13.5);

      let curRY = yPos + 13.5 + missionLines.length * 3.5 + 3;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(126, 95, 24);
      doc.text('MULANK-BHAGYANK SYNERGY:', rightColX, curRY);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 55);
      doc.text(synergyLines, rightColX, curRY + 3.5);

      yPos += synthBoxHeight + 16;

      // 3. Lo Shu 3x3 Magic Grid & 8 Planes Breakdown (Side-by-Side)
      const halfW = (pageWidth - 26 - 4) / 2;
      const loShuBoxH = 118;

      // Left Box: Lo Shu 3x3 Magic Grid Drawing
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(201, 160, 80);
      doc.setLineWidth(0.4);
      doc.roundedRect(13, yPos, halfW, loShuBoxH, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.8);
      doc.setTextColor(126, 95, 24);
      doc.text('LO SHU SACRED 3x3 MAGIC GRID', 17, yPos + 5);

      // Grid Rendering
      const gridStartX = 17;
      const gridStartY = yPos + 16;
      const cellSize = (halfW - 8) / 3;

      const loShuLayout = [
        [4, 9, 2],
        [3, 5, 7],
        [8, 1, 6],
      ];
      const loShuElements: Record<number, string> = {
        4: 'Wood / Wealth', 9: 'Fire / Fame', 2: 'Earth / Love',
        3: 'Wood / Family', 5: 'Earth / Core', 7: 'Metal / Creativity',
        8: 'Earth / Knowledge', 1: 'Water / Career', 6: 'Metal / Friends'
      };

      loShuLayout.forEach((row, rIdx) => {
        row.forEach((num, cIdx) => {
          const cellX = gridStartX + cIdx * cellSize;
          const cellY = gridStartY + rIdx * (cellSize - 1);
          const count = activeNumerology.loShuGrid?.[num] || 0;
          const isPresent = count > 0;

          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(isPresent ? 201 : 230, isPresent ? 160 : 225, isPresent ? 80 : 215);
          doc.setLineWidth(isPresent ? 0.4 : 0.2);
          doc.roundedRect(cellX, cellY, cellSize - 1.5, cellSize - 2.5, 1, 1, 'FD');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(isPresent ? 181 : 160, isPresent ? 131 : 155, isPresent ? 40 : 150);
          doc.text(`${num}`, cellX + 3, cellY + 5);

          doc.setFontSize(6.5);
          doc.setTextColor(isPresent ? 40 : 160, isPresent ? 40 : 160, isPresent ? 45 : 160);
          doc.text(isPresent ? `${count}x present` : 'Missing', cellX + cellSize - 4, cellY + 5, { align: 'right' });

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(5.2);
          doc.setTextColor(90, 85, 80);
          doc.text(loShuElements[num] || '', cellX + 3, cellY + 9.5);
        });
      });

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(5.8);
      doc.setTextColor(110, 105, 95);
      doc.text('Calculated from birth day, month & year digits + Mulank & Bhagyank.', 17, yPos + loShuBoxH - 3.5);

      // Right Box: 8 Lo Shu Planes Assessment
      const rightBoxX = 13 + halfW + 4;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(201, 160, 80);
      doc.setLineWidth(0.4);
      doc.roundedRect(rightBoxX, yPos, halfW, loShuBoxH, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.8);
      doc.setTextColor(126, 95, 24);
      doc.text('8 LO SHU PLANES & RAJ YOGAS', rightBoxX + 4, yPos + 5);

      if (activeNumerology.loShuPlanes && activeNumerology.loShuPlanes.length > 0) {
        activeNumerology.loShuPlanes.slice(0, 8).forEach((plane, pIdx) => {
          const pY = yPos + 8.5 + pIdx * 13.5;
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(226, 211, 176);
          doc.setLineWidth(0.15);
          doc.roundedRect(rightBoxX + 3, pY, halfW - 6, 12.5, 0.8, 0.8, 'FD');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.2);
          doc.setTextColor(126, 95, 24);
          doc.text(plane.name, rightBoxX + 5, pY + 4);

          // Status Badge in UI gold / neutral slate
          let statusCol = [181, 131, 40];
          if (plane.status === 'Empty' || plane.status === 'Weak') statusCol = [100, 95, 85];

          doc.setTextColor(statusCol[0], statusCol[1], statusCol[2]);
          doc.setFontSize(5.8);
          doc.text(`${plane.status} (${Math.round(plane.strength)}%)`, rightBoxX + halfW - 5, pY + 4, { align: 'right' });

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(5.5);
          doc.setTextColor(70, 70, 75);
          const meaningLines = doc.splitTextToSize(plane.meaning, halfW - 10);
          doc.text(meaningLines.slice(0, 2), rightBoxX + 5, pY + 7.5);
        });
      }

      // --- PAGE 2: MISSING NUMBERS, CHALDEAN CORRECTION & LUCKY ATTRIBUTES ---
      doc.addPage();
      yPos = 22;

      // 4. Missing Numbers & Planetary Harmonization Table
      const missingNums = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => !activeNumerology.loShuGrid?.[n]);
      const displayMissingNums = missingNums.length > 0 ? Math.min(missingNums.length, 5) : 0;
      const missingBoxHeight = displayMissingNums > 0 ? (12 + displayMissingNums * 10) : 18;

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(201, 160, 80);
      doc.setLineWidth(0.4);
      doc.roundedRect(13, yPos, pageWidth - 26, missingBoxHeight, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(126, 95, 24);
      doc.text('MISSING NUMBERS & VEDIC-ELEMENTAL REMEDIES', 17, yPos + 5);
      const missingRemediesMap: Record<number, { element: string; upaya: string; gem: string }> = {
        1: { element: 'Water (North)', upaya: 'Place a clear water fountain in North; chant Surya Gayatri.', gem: 'Ruby / Red Jasper' },
        2: { element: 'Earth (South-West)', upaya: 'Keep rose quartz crystals; respect maternal figures.', gem: 'Pearl / Moonstone' },
        3: { element: 'Wood (East)', upaya: 'Keep indoor plants / bamboo; chant Om Guruve Namaha.', gem: 'Yellow Sapphire' },
        4: { element: 'Wood (South-East)', upaya: 'Wear green aventurine wristlet; avoid excessive clutter.', gem: 'Hessonite / Emerald' },
        5: { element: 'Earth (Center / Brahmasthan)', upaya: 'Keep house center open & illuminated; worship Lord Ganesha.', gem: 'Emerald / Jade' },
        6: { element: 'Metal (North-West)', upaya: 'Wear metal/silver watch; chant Om Shukraya Namaha.', gem: 'Diamond / Opal' },
        7: { element: 'Metal (West)', upaya: 'Keep white flowers; practice spiritual meditation.', gem: 'Cat\'s Eye / Tiger Eye' },
        8: { element: 'Earth (North-East)', upaya: 'Light mustard oil lamps on Saturdays; help underprivileged.', gem: 'Blue Sapphire / Amethyst' },
        9: { element: 'Fire (South)', upaya: 'Light red diya in South; chant Hanuman Chalisa.', gem: 'Red Coral / Carnelian' },
      };

      if (missingNums.length > 0) {
        doc.setFont('helvetica', 'normal');
        missingNums.slice(0, 5).forEach((num, mIdx) => {
          const mY = yPos + 9 + mIdx * 10;
          const info = missingRemediesMap[num] || { element: 'Cosmic Harmonics', upaya: 'Practice daily Japa.', gem: 'Crystal Quartz' };

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.2);
          doc.setTextColor(181, 131, 40);
          doc.text(`• Missing Number ${num} [${info.element}]:`, 17, mY);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6.5);
          doc.setTextColor(50, 50, 55);
          doc.text(`Recommended Upaya: ${info.upaya}  |  Gemstone/Crystal: ${info.gem}`, 20, mY + 4);
        });
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(181, 131, 40);
        doc.text('All nine Lo Shu digits are activated in your birth blueprint. Golden vibrational harmony established.', 17, yPos + 12);
      }

      yPos += missingBoxHeight + 8;

      // 6. Chaldean Name Correction & Acoustic Vibration
      const pdfTestName = profile.fullName || 'Seeker';
      const pdfCleanName = pdfTestName.toUpperCase().replace(/[^A-Z]/g, '');
      let pdfChaldeanSum = 0;
      for (const ch of pdfCleanName) {
        pdfChaldeanSum += CHALDEAN_VALUES[ch] || 0;
      }
      const pdfChaldeanSingleStr = reduceToSingleDigit(pdfChaldeanSum);
      const chaldeanRecs = activeNumerology.nameCorrectionSuggestions || [];
      
      const lettersRows = Math.ceil(pdfCleanName.length / ((pageWidth - 34) / 7)) || 1;
      const chaldeanBoxHeight = 40 + (lettersRows * 10) + (chaldeanRecs.length * 5);

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(201, 160, 80);
      doc.setLineWidth(0.4);
      doc.roundedRect(13, yPos, pageWidth - 26, chaldeanBoxHeight, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(126, 95, 24);
      doc.text('CHALDEAN & PYTHAGOREAN NAME SPELLING OPTIMIZER', 17, yPos + 5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(150, 145, 135);
      doc.text('LETTER GEMATRIA VALUES', 17, yPos + 10);

      let lx = 17;
      let ly = yPos + 12;
      let maxLy = ly;
      pdfCleanName.split('').forEach((char) => {
         if (lx > pageWidth - 26) {
             lx = 17;
             ly += 10;
         }
         doc.setFillColor(255, 255, 255);
         doc.setDrawColor(226, 211, 176);
         doc.setLineWidth(0.2);
         doc.roundedRect(lx, ly, 6, 8, 0.5, 0.5, 'FD');
         
         doc.setFont('helvetica', 'bold');
         doc.setFontSize(6.5);
         doc.setTextColor(20, 20, 25);
         doc.text(char, lx + 3, ly + 3.5, { align: 'center' });
         
         doc.setFont('helvetica', 'normal');
         doc.setFontSize(5.5);
         doc.setTextColor(181, 131, 40);
         doc.text(`${CHALDEAN_VALUES[char] || 0}`, lx + 3, ly + 7, { align: 'center' });
         
         lx += 7;
         maxLy = ly;
      });

      let nextY = maxLy + 13;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 100, 105);
      doc.text('Total Compound Vibration:', 17, nextY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(181, 131, 40);
      doc.text(`${pdfChaldeanSum}`, 55, nextY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 100, 105);
      doc.text('Single Digit Namank:', 80, nextY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(181, 131, 40);
      doc.text(`${pdfChaldeanSingleStr}`, 110, nextY);

      nextY += 4;

      const isFav = [1, 3, 5, 6].includes(Number(pdfChaldeanSingleStr));
      const compatText = isFav 
        ? `Highly favorable vibration ${pdfChaldeanSingleStr}. Resonates strongly with commercial prosperity, leadership respect, and smooth financial transactions.`
        : `Vibration ${pdfChaldeanSingleStr} requires conscious balancing or a slight single-letter adjustment to align with Mercury (5) or Venus (6).`;

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 211, 176);
      doc.roundedRect(17, nextY, pageWidth - 34, 11, 1, 1, 'FD');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(181, 131, 40);
      doc.text('Vibrational Compatibility:', 20, nextY + 4);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(80, 80, 85);
      doc.text(doc.splitTextToSize(compatText, pageWidth - 40), 20, nextY + 7.5);

      nextY += 15;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(150, 145, 135);
      doc.text('CLASSICAL RECOMMENDATIONS', 17, nextY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(80, 80, 85);
      let recY = nextY + 4;
      chaldeanRecs.forEach((rec) => {
         const recLines = doc.splitTextToSize(`• ${rec}`, pageWidth - 34);
         doc.text(recLines, 17, recY);
         recY += recLines.length * 3.5;
      });

      yPos += chaldeanBoxHeight + 8;

      // 6. Auspicious Correspondences & Numerology Upayas
      const correspondsBoxHeight = 34;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(201, 160, 80);
      doc.setLineWidth(0.4);
      doc.roundedRect(13, yPos, pageWidth - 26, correspondsBoxHeight, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(126, 95, 24);
      doc.text('SACRED NUMEROLOGICAL CORRESPONDENCES & AUSPICIOUS ATTRIBUTES', 17, yPos + 5);

      const numGems = activeNumerology.luckyGemstones?.join(', ') || 'Yellow Sapphire, Emerald, Ruby';
      const numColors = activeNumerology.luckyColors?.join(', ') || 'Gold, Saffron, Emerald Green, Royal Yellow';
      const numDays = activeNumerology.luckyDays?.join(', ') || 'Thursday, Sunday, Wednesday';
      const numLucky = activeNumerology.luckyNumbers?.join(', ') || `${mulank}, ${bhagyank}, 1, 3, 5, 9`;
      const numUnfav = activeNumerology.unfavorableNumbers?.join(', ') || '8, 4 (Handle with caution on critical beginnings)';

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(50, 50, 55);
      doc.text(`• Favorable Gemstones: ${numGems}`, 17, yPos + 10.5);
      doc.text(`• Lucky Colors: ${numColors}`, 17, yPos + 15.5);
      doc.text(`• Auspicious Days: ${numDays}  |  Lucky Numbers: ${numLucky}`, 17, yPos + 20.5);
      doc.text(`• Numbers to Handle Carefully: ${numUnfav}`, 17, yPos + 25.5);
      doc.text('• Daily Sadhana: Meditate upon your ruling planet Yantra at dawn; chant Om Gam Ganapataye Namaha.', 17, yPos + 30.5);

      yPos += correspondsBoxHeight + 8;

      // 7. AI Life Blueprint Synthesis Reading
      if (aiInsights && aiInsights.summary) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        const aiLines = doc.splitTextToSize(aiInsights.summary.replace(/[#*`_>-]/g, ' '), pageWidth - 34);
        const visibleAiLines = aiLines.slice(0, 15);
        const aiBoxHeight = 14 + (visibleAiLines.length * 4.0);
        
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(201, 160, 80);
        doc.setLineWidth(0.4);
        doc.roundedRect(13, yPos, pageWidth - 26, aiBoxHeight, 1.5, 1.5, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(126, 95, 24);
        doc.text('NUMEROLOGICAL LIFE BLUEPRINT & SUTRA SYNTHESIS', 17, yPos + 5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(40, 40, 45);
        doc.text(visibleAiLines, 17, yPos + 10);
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
          doc.text('SACRED NUMEROLOGY & LO SHU MAGIC GRID BLUEPRINT', 33, 24.5);

          doc.setFont('helvetica', 'italic');
          doc.setFontSize(7);
          doc.setTextColor(110, 105, 95);
          doc.text(
            `Vedic Psyche & Destiny Codes • Lo Shu 3x3 Grid • Chaldean Name Harmonics (${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })})`,
            33,
            28
          );
        } else {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(126, 95, 24);
          doc.text('JYOTISHVEDA • SACRED NUMEROLOGY & LO SHU REPORT', 14, 14);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(100, 100, 100);
          doc.text(
            `Client: ${profile.fullName || 'Seeker'}  |  Mulank ${mulank} • Bhagyank ${bhagyank}`,
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
      doc.save(`JyotishVeda_Numerology_LoShu_${safeName}_${dateStr}.pdf`);
    } catch (err) {
      console.error('Failed to generate numerology PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#2A2A2E]">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold tracking-widest text-[#C9A050] uppercase mb-1">
              <Hash className="w-4 h-4" />
              <span>Vedic & Chaldean Numerology Matrix</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F0ECE1]">
              Sacred Numbers & Lo Shu Magic Grid
            </h1>
            <p className="text-xs text-[#9E9A90] mt-1 leading-relaxed">
              Decode the planetary vibrational codes governing your psyche (Mulank), karmic destiny (Bhagyank), and name resonance (Namank).
            </p>
          </div>

          {/* Core Numbers Badges & Download Report Action */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="text-center bg-[#1A1A1E] border border-[#C9A050]/30 px-3.5 py-2 rounded-xl">
              <div className="text-[9px] uppercase font-bold text-[#9E9A90] tracking-wider">Mulank</div>
              <div className="text-xl font-bold text-[#C9A050]">{activeNumerology.mulank}</div>
            </div>
            <div className="text-center bg-[#1A1A1E] border border-[#C9A050]/30 px-3.5 py-2 rounded-xl">
              <div className="text-[9px] uppercase font-bold text-[#9E9A90] tracking-wider">Bhagyank</div>
              <div className="text-xl font-bold text-[#C9A050]">{activeNumerology.bhagyank}</div>
            </div>
            <div className="text-center bg-[#1A1A1E] border border-[#C9A050]/30 px-3.5 py-2 rounded-xl">
              <div className="text-[9px] uppercase font-bold text-[#9E9A90] tracking-wider">Namank</div>
              <div className="text-xl font-bold text-[#C9A050]">{activeNumerology.namankChaldean}</div>
            </div>

            <button
              onClick={handleDownloadNumerologyPdf}
              disabled={isGeneratingPdf}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border text-xs font-bold transition shadow-lg cursor-pointer shrink-0 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-[#C9A050] to-[#A07828] hover:from-[#D4AF37] hover:to-[#B38730] text-[#0D0D0F] border-[#C9A050] shadow-[#C9A050]/20'
                  : 'bg-[#C9A050] hover:bg-[#B38730] text-white border-[#C9A050] shadow-[#C9A050]/20'
              } disabled:opacity-50`}
              title="Download full Numerology & Lo Shu magic grid PDF report"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Report (PDF)'}</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap gap-2 pt-4">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-sans font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'matrix'
                ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20'
                : 'bg-[#1A1A1E] text-[#9E9A90] hover:text-white border border-[#2A2A2E]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Mulank & Bhagyank Synthesis</span>
          </button>
          <button
            onClick={() => setActiveTab('loshu')}
            className={`px-4 py-2 rounded-xl text-xs font-sans font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'loshu'
                ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20'
                : 'bg-[#1A1A1E] text-[#9E9A90] hover:text-white border border-[#2A2A2E]'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Lo Shu 3x3 Magic Grid ({activeNumerology.loShuPlanes.length} Planes)</span>
          </button>
          <button
            onClick={() => setActiveTab('name_correction')}
            className={`px-4 py-2 rounded-xl text-xs font-sans font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'name_correction'
                ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20'
                : 'bg-[#1A1A1E] text-[#9E9A90] hover:text-white border border-[#2A2A2E]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Chaldean Name Correction Tool</span>
          </button>
          <button
            onClick={() => setActiveTab('remedies')}
            className={`px-4 py-2 rounded-xl text-xs font-sans font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'remedies'
                ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20'
                : 'bg-[#1A1A1E] text-[#9E9A90] hover:text-white border border-[#2A2A2E]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Numerology Remedies & Gems</span>
          </button>
        </div>
      </div>

      {/* View 1: Mulank & Bhagyank Matrix */}
      {activeTab === 'matrix' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mulank (Psychic Number) Deep Dive */}
          <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2E]">
              <div className="flex items-center space-x-2">
                <span className="w-8 h-8 rounded-xl bg-[#C9A050]/20 text-[#C9A050] font-serif font-bold text-base flex items-center justify-center border border-[#C9A050]/30">
                  {activeNumerology.mulank}
                </span>
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#F0ECE1]">Mulank (Psychic / Driver Number)</h3>
                  <p className="text-[11px] text-[#9E9A90]">Sum of Birth Day ({profile.birthDate.split('-')[2]})</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#C9A050]">{activeNumerology.mulankPlanet}</span>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div>
                <span className="text-[9px] uppercase font-bold text-[#9E9A90] tracking-wider">Psychological Drivers</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {(aiInsights?.mulankCharacteristics || activeNumerology.mulankCharacteristics).map((trait: string) => (
                    <span
                      key={trait}
                      className="px-2.5 py-1 rounded-lg bg-[#1A1A1E] border border-[#2A2A2E] text-[#C9A050] font-medium"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-[#1A1A1E] rounded-xl border border-[#2A2A2E] space-y-1">
                <span className="text-[9px] uppercase font-bold text-[#C9A050] tracking-wider">Instinctive Nature</span>
                <p className="text-[#E5E1D8] leading-relaxed">
                  Your Mulank reveals how you instinctively react to challenges, your personal desires, and your subconscious behavioral patterns.
                  Ruled by {activeNumerology.mulankPlanet}, you radiate authority and strive for self-directed excellence.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-[#1A1A1E]/60 rounded-lg border border-[#2A2A2E]">
                  <span className="text-[9px] text-[#9E9A90] block uppercase font-bold tracking-wider">Favorable Days</span>
                  <span className="font-semibold text-[#C9A050]">{activeNumerology.luckyDays.join(', ')}</span>
                </div>
                <div className="p-3 bg-[#1A1A1E]/60 rounded-lg border border-[#2A2A2E]">
                  <span className="text-[9px] text-[#9E9A90] block uppercase font-bold tracking-wider">Lucky Colors</span>
                  <span className="font-semibold text-[#C9A050]">{activeNumerology.luckyColors.join(', ')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bhagyank (Destiny Number) Deep Dive */}
          <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2E]">
              <div className="flex items-center space-x-2">
                <span className="w-8 h-8 rounded-xl bg-[#C9A050]/20 text-[#C9A050] font-serif font-bold text-base flex items-center justify-center border border-[#C9A050]/30">
                  {activeNumerology.bhagyank}
                </span>
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#F0ECE1]">Bhagyank (Destiny / Conductor Number)</h3>
                  <p className="text-[11px] text-[#9E9A90]">Sum of Day + Month + Year ({profile.birthDate})</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#C9A050]">{activeNumerology.bhagyankPlanet}</span>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div className="p-3.5 bg-[#1A1A1E] rounded-xl border border-[#2A2A2E] space-y-1">
                <span className="text-[9px] uppercase font-bold text-[#C9A050] tracking-wider">Karmic Life Mission</span>
                <p className="text-[#E5E1D8] leading-relaxed">{activeNumerology.bhagyankMission}</p>
              </div>

              <div className="p-3.5 bg-[#1A1A1E] rounded-xl border border-[#2A2A2E] space-y-1">
                <span className="text-[9px] uppercase font-bold text-[#C9A050] tracking-wider">Mulank-Bhagyank Synergy</span>
                <p className="text-[#E5E1D8] leading-relaxed">
                  Your combination of Mulank {activeNumerology.mulank} and Bhagyank {activeNumerology.bhagyank} creates an energetic balance between 
                  daily execution and grand karmic accomplishments. Harness this alignment by scheduling critical launches on your auspicious dates.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-[#1A1A1E]/60 rounded-lg border border-[#2A2A2E]">
                  <span className="text-[9px] text-[#9E9A90] block uppercase font-bold tracking-wider">Friendly Numbers</span>
                  <span className="font-semibold text-[#C9A050]">{activeNumerology.luckyNumbers.join(', ')}</span>
                </div>
                <div className="p-3 bg-[#1A1A1E]/60 rounded-lg border border-[#2A2A2E]">
                  <span className="text-[9px] text-[#9E9A90] block uppercase font-bold tracking-wider">Unfavorable Numbers</span>
                  <span className="font-semibold text-[#C9A050]">{activeNumerology.unfavorableNumbers.join(', ') || 'None (Universal Friend)'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Lo Shu 3x3 Magic Grid */}
      {activeTab === 'loshu' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left 5 Cols: Visual Lo Shu Grid */}
          <div className="lg:col-span-5 bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl flex flex-col justify-between items-center h-full min-h-[485px]">
            <div className="w-full flex items-center justify-between pb-3 border-b border-[#2A2A2E] mb-3 text-xs">
              <span className="font-serif font-bold text-[#F0ECE1]">Sacred 3x3 Lo Shu Matrix</span>
              <span className="text-[#C9A050] font-mono">Date: {profile.birthDate.replace(/-/g, '')}</span>
            </div>

            {/* 3x3 Grid */}
            <div className="w-full max-w-[320px] aspect-square grid grid-cols-3 grid-rows-3 gap-2 p-3 bg-[#08080A] rounded-2xl border border-[#C9A050]/40 shadow-inner my-auto">
              {loShuPositions.map((row) =>
                row.map((num) => {
                  const count = activeNumerology.loShuGrid[num] || 0;
                  const isPresent = count > 0;
                  return (
                    <div
                      key={num}
                      className={`rounded-xl border flex flex-col items-center justify-center p-2 transition ${
                        isPresent
                          ? 'bg-[#1A1A1E] border-[#C9A050] shadow-md shadow-[#C9A050]/10'
                          : 'bg-[#141418]/60 border-[#2A2A2E] text-[#9E9A90]'
                      }`}
                    >
                      <span className={`text-2xl font-serif font-bold ${isPresent ? 'text-[#C9A050]' : 'text-[#504E48]'}`}>
                        {num}
                      </span>
                      <span
                        className={`text-[10px] font-sans font-bold px-1.5 py-0.5 rounded-full mt-1 ${
                          isPresent ? 'bg-[#C9A050] text-[#0D0D0F]' : 'bg-[#1A1A1E] text-[#9E9A90]'
                        }`}
                      >
                        {isPresent ? `${count}x` : 'Absent'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-3 text-xs text-[#9E9A90] text-center space-y-1 font-sans">
              <p>Numbers extracted directly from your complete birth date string ({profile.birthDate}).</p>
              <p className="text-[#C9A050]/90 font-medium">Missing numbers can be energetically balanced using spatial Vastu & crystal remedies.</p>
            </div>
          </div>

          {/* Right 7 Cols: Lo Shu Planes & Strengths with Scrollbar */}
          <div className="lg:col-span-7">
            <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl flex flex-col max-h-[485px]">
              <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2E] shrink-0 mb-3">
                <h3 className="text-base font-bold text-[#F0ECE1]">Planes of Strength & Arrows of Destiny</h3>
                <span className="text-xs text-[#C9A050] font-medium">8 Geometric Vectors</span>
              </div>

              <div className="space-y-3 font-sans overflow-y-auto pr-1.5 custom-scrollbar">
                {activeNumerology.loShuPlanes.map((plane) => (
                  <div key={plane.name} className="p-3.5 bg-[#1A1A1E] rounded-xl border border-[#2A2A2E] space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-serif font-bold text-[#F0ECE1]">{plane.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border border-transparent ${
                          plane.status !== 'Empty'
                            ? 'bg-[#C9A050]/20 text-[#C9A050]'
                            : 'bg-[#141418] text-[#9E9A90]'
                        }`}
                      >
                        {plane.status} ({Math.round(plane.strength)}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-[#141418] rounded-full overflow-hidden border border-[#2A2A2E]">
                      <div
                        className="h-full bg-gradient-to-r from-[#C9A050] to-[#E5C158] rounded-full"
                        style={{ width: `${plane.strength}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-[#9E9A90] leading-relaxed">
                      {isAiLoading ? (
                        <span className="flex items-center text-[#C9A050] space-x-2 animate-pulse"><Sparkles className="w-3 h-3" /> <span>Synthesizing Vedic Insights...</span></span>
                      ) : (
                        (aiInsights?.planeMeanings && aiInsights.planeMeanings[plane.name]) || plane.meaning
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 3: Chaldean Name Correction Simulator */}
      {activeTab === 'name_correction' && (
        <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl space-y-6">
          <div className="pb-4 border-b border-[#2A2A2E]">
            <h3 className="text-base font-serif font-bold text-[#F0ECE1] flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-[#C9A050]" />
              <span>Chaldean & Pythagorean Name Spelling Optimizer</span>
            </h3>
            <p className="text-xs font-sans text-[#9E9A90] mt-1">
              Ancient Chaldean numerology assigns sacred vibrations to each letter. Test subtle spelling variations to achieve optimum wealth (5 or 6) or authority (1).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#C9A050] mb-1">
                  Test Name Spelling
                </label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#1A1A1E] border border-[#2A2A2E] rounded-lg text-sm text-[#F0ECE1] focus:outline-none focus:border-[#C9A050] font-medium"
                />
              </div>

              {/* Letter breakdown */}
              <div className="p-3 bg-[#08080A] rounded-xl border border-[#2A2A2E] space-y-2">
                <span className="text-[9px] uppercase font-bold text-[#9E9A90] block tracking-wider">Letter Gematria Values</span>
                <div className="flex flex-wrap gap-1">
                  {cleanTestName.split('').map((char, idx) => (
                    <div key={idx} className="p-1 px-2 bg-[#1A1A1E] rounded text-center border border-[#2A2A2E]">
                      <div className="text-xs font-bold text-[#F0ECE1]">{char}</div>
                      <div className="text-[10px] font-mono text-[#C9A050]">{CHALDEAN_VALUES[char] || 0}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Output */}
            <div className="bg-[#1A1A1E] p-5 rounded-xl border border-[#2A2A2E] space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-[#9E9A90]">Total Compound Vibration:</span>
                <span className="text-lg font-serif font-bold text-[#C9A050] font-mono">{testChaldeanSum}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-[#9E9A90]">Single Digit Namank:</span>
                <span className="text-2xl font-serif font-bold text-[#C9A050] font-mono">{testChaldeanSingle}</span>
              </div>

              <div className="p-3 rounded-lg bg-[#141418] border border-[#2A2A2E] text-xs">
                <span className="font-serif font-bold text-[#C9A050] block mb-1">Vibrational Compatibility</span>
                <p className="text-[#9E9A90] text-[11px] leading-relaxed">
                  {[1, 3, 5, 6].includes(testChaldeanSingle)
                    ? `✓ Highly favorable vibration ${testChaldeanSingle}. Resonates strongly with commercial prosperity, leadership respect, and smooth financial transactions.`
                    : `⚠️ Vibration ${testChaldeanSingle} requires conscious balancing or a slight single-letter adjustment to align with Mercury (5) or Venus (6).`}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-[#9E9A90] tracking-wider">Classical Recommendations</span>
                {activeNumerology.nameCorrectionSuggestions.map((sug, i) => (
                  <p key={i} className="text-[11px] text-[#9E9A90]">• {sug}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 4: Numerology Remedies */}
      {activeTab === 'remedies' && (
        <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl space-y-4">
          <div className="pb-3 border-b border-[#2A2A2E]">
            <h3 className="text-base font-serif font-bold text-[#F0ECE1] flex items-center space-x-2">
              <Flame className="w-4 h-4 text-[#C9A050]" />
              <span>Personalized Ancient Numerology Remedies & Vastu Upayas</span>
            </h3>
            <p className="text-xs font-sans text-[#9E9A90] mt-1">
              Correct missing energetic vibrations from your Lo Shu grid and strengthen your Mulank planetary ruler.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
            {(aiInsights?.remedies || activeNumerology.remedies).map((rem: string, idx: number) => (
              <div key={idx} className="p-3.5 bg-[#1A1A1E] rounded-xl border border-[#2A2A2E] flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-[#C9A050]/20 text-[#C9A050] font-serif font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-[#C9A050]/30">
                  {idx + 1}
                </span>
                <p className="text-xs text-[#E5E1D8] leading-relaxed">{rem}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
