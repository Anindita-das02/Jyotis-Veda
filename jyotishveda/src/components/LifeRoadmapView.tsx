import { api } from '../services/api';
import React, { useState, useEffect } from 'react';
import {
  Milestone,
  Sparkles,
  Briefcase,
  DollarSign,
  Heart,
  Activity,
  Flame,
  CheckCircle2,
  Clock,
  ChevronRight,
  Filter,
  Download,
  Calendar,
  AlertCircle,
  FileText,
  Loader2,
} from 'lucide-react';
import { UserProfile, LifeMilestone, HoroscopeTradition, NumerologyReport } from '../types';
import { API_ENDPOINTS } from '../config/api_config';
import { generateCustomRoadmap } from '../services/astroEngine';
import { jsPDF } from 'jspdf';

interface LifeRoadmapViewProps {
  profile: UserProfile;
  tradition: HoroscopeTradition;
  chartData: any;
  numerology: NumerologyReport;
  roadmap: LifeMilestone[];
  setRoadmap: React.Dispatch<React.SetStateAction<LifeMilestone[]>>;
  onNavigateToConsultations?: () => void;
  theme?: 'light' | 'dark';
}

export const LifeRoadmapView: React.FC<LifeRoadmapViewProps> = ({
  profile,
  tradition,
  chartData,
  numerology,
  roadmap,
  setRoadmap,
  onNavigateToConsultations,
  theme = 'dark',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedHorizon, setSelectedHorizon] = useState<string>('0-5 Years');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHorizons, setGeneratedHorizons] = useState<Record<string, boolean>>({});
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [loadingText, setLoadingText] = useState<string>('0-5 Years');

  const getStorageKey = () => `jyotish_roadmap_horizons_${profile?.id || profile?.name || 'user'}_${profile?.birthDate || ''}`;

  // Ensure roadmap is initialized with full 15 milestones on mount/profile change
  // and restore generated horizons state
  useEffect(() => {
    if (!profile) return;
    const key = getStorageKey();
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') {
          if (parsed.generatedHorizons) {
            setGeneratedHorizons(parsed.generatedHorizons);
          }
          if (Array.isArray(parsed.milestones) && parsed.milestones.length > 0) {
            setRoadmap(parsed.milestones);
            return;
          }
        }
      }
    } catch (e) {
      console.warn('Error reading cached roadmap horizons:', e);
    }

    if (!roadmap || roadmap.length < 15) {
      setRoadmap(generateCustomRoadmap(profile, chartData));
    }
  }, [profile?.name, profile?.birthDate]);

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

  const categories = [
    { id: 'all', label: 'All Life Spheres', icon: Milestone },
    { id: 'Career', label: 'Career & Executive', icon: Briefcase },
    { id: 'Wealth', label: 'Wealth & Real Estate', icon: DollarSign },
    { id: 'Relationships', label: 'Love & Family', icon: Heart },
    { id: 'Health', label: 'Health & Vitality', icon: Activity },
    { id: 'Spirituality', label: 'Spiritual Dharma', icon: Flame },
  ];

  const horizons = ['0-5 Years', '5-10 Years', '10-15 Years', '15-20 Years', '20-25 Years'];
  const isCurrentHorizonGenerated = Boolean(generatedHorizons[selectedHorizon]);

  const handleGenerateRoadmap = async () => {
    if (isCurrentHorizonGenerated || isGenerating) return;

    setIsGenerating(true);
    const catObj = categories.find((c) => c.id === selectedCategory);
    setLoadingText(`${catObj && catObj.id !== 'all' ? catObj.label + ' • ' : ''}${selectedHorizon}`);
    
    let updatedRoadmap = roadmap && roadmap.length >= 15 ? [...roadmap] : generateCustomRoadmap(profile, chartData);

    try {
      const data = await api.post<any>(API_ENDPOINTS.ROADMAP.GENERATE, {
        profile,
        tradition,
        chartData,
        numerology,
        horizon: selectedHorizon,
      });

      if (data && data.milestones && Array.isArray(data.milestones) && data.milestones.length > 0) {
        // Merge generated AI milestones for the selected horizon
        const generatedForHorizon = data.milestones.filter((m: any) => m.timeframe === selectedHorizon);
        if (generatedForHorizon.length > 0) {
          updatedRoadmap = updatedRoadmap.map((item) => {
            if (item.timeframe === selectedHorizon) {
              const matched = generatedForHorizon.find((m: any) => m.category === item.category);
              return matched ? { ...item, ...matched } : item;
            }
            return item;
          });
        } else {
          updatedRoadmap = updatedRoadmap.map((item) => {
            if (item.timeframe === selectedHorizon) {
              const matched = data.milestones.find((m: any) => m.category === item.category);
              return matched ? { ...item, ...matched } : item;
            }
            return item;
          });
        }
      }
    } catch (e) {
      console.warn('Roadmap AI generation fallback:', e);
    } finally {
      const nextGeneratedHorizons = {
        ...generatedHorizons,
        [selectedHorizon]: true,
      };
      setGeneratedHorizons(nextGeneratedHorizons);
      setRoadmap(updatedRoadmap);

      try {
        localStorage.setItem(
          getStorageKey(),
          JSON.stringify({
            generatedHorizons: nextGeneratedHorizons,
            milestones: updatedRoadmap,
          })
        );
      } catch (storageErr) {
        console.warn('Could not cache roadmap to localStorage:', storageErr);
      }

      setTimeout(() => {
        setIsGenerating(false);
      }, 700);
    }
  };

  const isMilestoneLocked = (item: LifeMilestone): boolean => {
    if (!item) return false;
    const tf = item.timeframe || '';
    const cat = item.category || '';

    // 0-5 Years: All categories are OPEN
    if (tf === '0-5 Years' || tf === '0-12 Months' || tf === '1-3 Years') {
      return false;
    }

    // 5-10 Years: Career, Spiritual Dharma, Health & Vitality are OPEN. Wealth & Relationships are LOCKED.
    if (tf === '5-10 Years' || tf === '3-5 Years') {
      if (cat === 'Career' || cat === 'Spirituality' || cat === 'Health') {
        return false;
      }
      return true; // Wealth & Relationships locked
    }

    // 10-15 Years: Career & Spiritual Dharma are OPEN. Health, Wealth & Relationships are LOCKED.
    if (tf === '10-15 Years') {
      if (cat === 'Career' || cat === 'Spirituality') {
        return false;
      }
      return true; // Health, Wealth, Relationships locked
    }

    // 15-20 Years & 20-25 Years
    if (tf === '15-20 Years' || tf === '20-25 Years') {
      return true;
    }

    return false;
  };

  const getCategoryDisplayName = (cat: string) => {
    switch (cat) {
      case 'Relationships':
        return 'Love & Family';
      case 'Wealth':
        return 'Wealth & Real Estate';
      case 'Health':
        return 'Health & Vitality';
      case 'Spirituality':
        return 'Spiritual Dharma';
      case 'Career':
        return 'Career & Executive';
      default:
        return cat || '';
    }
  };

  const safeRoadmap = Array.isArray(roadmap) && roadmap.length > 0 
    ? roadmap 
    : generateCustomRoadmap(profile, chartData);

  const normalizedRoadmap = safeRoadmap.map((m) => {
    if (!m) return m;
    let t = m.timeframe || '0-5 Years';
    if (t === '0-12 Months' || t === '1-3 Years') t = '0-5 Years';
    else if (t === '3-5 Years') t = '5-10 Years';
    return { ...m, timeframe: t };
  }).filter(Boolean);

  const sortedRoadmap = [...normalizedRoadmap].sort((a, b) => {
    const isALocked = isMilestoneLocked(a);
    const isBLocked = isMilestoneLocked(b);
    if (isALocked && !isBLocked) return 1;
    if (!isALocked && isBLocked) return -1;
    return 0;
  });

  const filteredRoadmap = sortedRoadmap.filter((m) => {
    if (!m) return false;
    const matchCat = selectedCategory === 'all' || m.category === selectedCategory;
    const matchHor = selectedHorizon === 'all' || m.timeframe === selectedHorizon;
    return matchCat && matchHor;
  });

  // Comprehensive Multi-Page PDF Report Generator
  const handleDownloadPdfReport = async () => {
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

      const milestonesToExport = sortedRoadmap.length > 0 ? sortedRoadmap : roadmap;

      // Extract celestial and natal particulars
      const ascSign = chartData?.ascendant?.signName || chartData?.ascendant?.signSanskrit || 'Vedic Ascendant';
      const moonPlanet = chartData?.planets?.find((p: any) => p.id === 'moon' || p.name?.toLowerCase() === 'moon');
      const moonSign = chartData?.moonSign || moonPlanet?.signName || moonPlanet?.signSanskrit || 'Chandra Rashi';
      const nakshatra = moonPlanet?.nakshatra ? `${moonPlanet.nakshatra} (Pada ${moonPlanet.pada || 1})` : 'Vedic Nakshatra';

      const currentDashaObj = chartData?.dashaPeriods?.find((d: any) => d.isCurrent);
      const activeDashaText = currentDashaObj
        ? `${currentDashaObj.planet || 'Vimshottari'} Mahadasha`
        : 'Active Vimshottari Mahadasha Cycle';

      const mulankText = numerology?.mulank ? `Mulank ${numerology.mulank} (${numerology.mulankPlanet || ''})` : 'Mulank -';
      const bhagyankText = numerology?.bhagyank ? `Bhagyank ${numerology.bhagyank} (${numerology.bhagyankPlanet || ''})` : 'Bhagyank -';

      // --- PAGE 1: USER PARTICULARS & OVERVIEW ---
      let yPos = 33;

      // User Information Box
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 211, 176);
      doc.setLineWidth(0.4);
      doc.roundedRect(13, yPos, pageWidth - 26, 24, 2, 2, 'FD');
      doc.line(pageWidth / 2, yPos, pageWidth / 2, yPos + 24);

      // Left Column: Client Details
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(126, 95, 24);
      doc.text('CLIENT & NATAL PARTICULARS', 17, yPos + 5.5);

      doc.setFontSize(10.5);
      doc.setTextColor(26, 26, 30);
      doc.text(profile.fullName || 'Vedic Seeker', 17, yPos + 11);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.2);
      doc.setTextColor(80, 80, 80);
      const birthDetails = `Born: ${profile.birthDate || 'N/A'}${profile.birthTime ? ` at ${profile.birthTime}` : ''} | ${profile.birthPlace || 'Global'}`;
      doc.text(doc.splitTextToSize(birthDetails, (pageWidth - 36) / 2)[0] || '', 17, yPos + 16);
      doc.text(`Active Dasha: ${activeDashaText}`, 17, yPos + 20.5);

      // Right Column: Celestial Coordinates
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(126, 95, 24);
      doc.text('CELESTIAL & NUMEROLOGICAL COORDINATES', pageWidth / 2 + 5, yPos + 5.5);

      doc.setFontSize(8.5);
      doc.setTextColor(26, 26, 30);
      doc.text(`Lagna: ${ascSign}  |  Rashi: ${moonSign}`, pageWidth / 2 + 5, yPos + 11);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.2);
      doc.setTextColor(80, 80, 80);
      doc.text(`Nakshatra: ${nakshatra}`, pageWidth / 2 + 5, yPos + 16);
      doc.text(`Numerology: ${mulankText}  |  ${bhagyankText}`, pageWidth / 2 + 5, yPos + 20.5);

      yPos += 28;

      // 25-Year Lifecycle Overview Banner
      doc.setFillColor(250, 247, 240);
      doc.setDrawColor(201, 160, 80);
      doc.setLineWidth(0.5);
      doc.roundedRect(13, yPos, pageWidth - 26, 12, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(126, 95, 24);
      const completedCount = milestonesToExport.filter((m) => m.status === 'Completed').length;
      const inProgressCount = milestonesToExport.filter((m) => m.status === 'In-Progress').length;
      const pendingCount = milestonesToExport.filter((m) => m.status === 'Pending' || !m.status).length;

      doc.text('25-YEAR DESTINY ARC OVERVIEW', 17, yPos + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(60, 60, 60);
      doc.text(
        `Total Horizons: 5 Epochs (0–25 Yrs)  |  Milestones: ${milestonesToExport.length}  |  ✓ Completed: ${completedCount}  •  ⚡ In-Progress: ${inProgressCount}  •  ⏳ Pending: ${pendingCount}`,
        17,
        yPos + 9
      );

      yPos += 16;

      // Render Milestone Cards
      milestonesToExport.forEach((m, idx) => {
        // Calculate dynamic card height
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        const guidanceLines = doc.splitTextToSize(
          m.guidance || 'Astrological dasha guidance and strategic timing.',
          pageWidth - 34
        );
        const guidanceHeight = guidanceLines.length * 3.5;

        const transitVal = m.favorableTransits || 'Favorable transit alignment';
        const remedyVal = m.remedialAction || 'Chant Maha Mrityunjaya Mantra & perform Guru Seva';

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.2);
        const transitLabelW = doc.getTextWidth('Astrological Transit Window: ');
        const remedyLabelW = doc.getTextWidth('Recommended Upaya / Sadhana: ');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.2);
        const transitLines = doc.splitTextToSize(transitVal, pageWidth - 34 - transitLabelW);
        const remedyLines = doc.splitTextToSize(remedyVal, pageWidth - 34 - remedyLabelW);

        const cardHeight = 12 + guidanceHeight + 2 + transitLines.length * 3.4 + remedyLines.length * 3.4 + 5;

        // Check page overflow
        if (yPos + cardHeight > pageHeight - 22) {
          doc.addPage();
          yPos = 20; // reset yPos on subsequent pages
        }

        // Card Container - Pure white with gold border
        const isCompleted = m.status === 'Completed';
        const isInProgress = m.status === 'In-Progress';

        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(201, 160, 80);
        doc.setLineWidth(0.4);
        doc.roundedRect(13, yPos, pageWidth - 26, cardHeight, 1.5, 1.5, 'FD');

        // Card Header Bar: Index Badge + Timeframe + Category + Status
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(126, 95, 24);
        doc.text(`[${idx + 1}] ${m.timeframe || '0-5 Years'}`, 17, yPos + 5);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(80, 75, 70);
        doc.text(`•  ${m.category}`, 17 + doc.getTextWidth(`[${idx + 1}] ${m.timeframe || '0-5 Years'}`) + 3, yPos + 5);

        // Status Tag
        const statusStr = m.status ? m.status.toUpperCase() : 'PENDING';
        if (isCompleted || isInProgress) {
          doc.setTextColor(181, 131, 40);
        } else {
          doc.setTextColor(120, 120, 120);
        }
        doc.text(`Status: ${statusStr}`, pageWidth - 17, yPos + 5, { align: 'right' });

        // Milestone Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(26, 26, 30);
        doc.text(m.title, 17, yPos + 10);

        // Guidance Paragraph
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(50, 50, 50);
        let textY = yPos + 14.5;
        doc.text(guidanceLines, 17, textY);
        textY += guidanceHeight + 1.5;

        // Transit Window Row
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.2);
        doc.setTextColor(126, 95, 24);
        doc.text('Astrological Transit Window: ', 17, textY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        doc.text(transitLines, 17 + transitLabelW, textY);
        textY += transitLines.length * 3.4;

        // Upaya / Sadhana Row
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.2);
        doc.setTextColor(181, 131, 40);
        doc.text('Recommended Upaya / Sadhana: ', 17, textY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        doc.text(remedyLines, 17 + remedyLabelW, textY);

        yPos += cardHeight + 4;
      });

      // Auspicious Remedies & Numerology Harmonies Box at the End
      const remedyBoxHeight = 28;
      if (yPos + remedyBoxHeight > pageHeight - 22) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(201, 160, 80);
      doc.setLineWidth(0.5);
      doc.roundedRect(13, yPos, pageWidth - 26, remedyBoxHeight, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(126, 95, 24);
      doc.text('AUSPICIOUS VEDIC REMEDIES & PLANETARY HARMONIZATION', 17, yPos + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.3);
      doc.setTextColor(60, 60, 60);

      const gemstones =
        numerology?.luckyGemstones?.join(', ') || 'Yellow Sapphire (Pukhraj), Ruby (Manik), Emerald (Panna)';
      const colors = numerology?.luckyColors?.join(', ') || 'Gold, Saffron, Off-White, Radiant Yellow';
      const days = numerology?.luckyDays?.join(', ') || 'Thursday, Sunday, Monday';
      const numbers = numerology?.luckyNumbers?.join(', ') || '1, 3, 7, 9';

      doc.text(`• Favorable Gemstones: ${gemstones}`, 17, yPos + 10.5);
      doc.text(
        `• Auspicious Colors: ${colors}  |  Lucky Numbers: ${numbers}  |  Favorable Days: ${days}`,
        17,
        yPos + 15
      );
      doc.text(
        '• Daily Sadhana: Surya Namaskar with Gayatri Mantra (108 Japa) & Thursday Vishnu/Guru Archana.',
        17,
        yPos + 19.5
      );
      doc.text(
        '• Charitable Upaya: Feed birds on Wednesdays and donate sesame oil lamps on Saturdays for Shani Pacification.',
        17,
        yPos + 24
      );

      // --- PAGE DECORATIONS PASS (WATERMARK, BORDERS, HEADERS & FOOTERS) ---
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);

        // Full Page Astrologer / Sage Watermark
        if (bgBase64) {
          try {
            if (typeof (doc as any).setGState === 'function' && (doc as any).GState) {
              (doc as any).setGState(new (doc as any).GState({ opacity: 0.08 }));
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
          // Page 1 Full Header with Logo
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
          doc.text('25-YEAR VEDIC DESTINY ROADMAP & LIFE BLUEPRINT', 33, 24.5);

          doc.setFont('helvetica', 'italic');
          doc.setFontSize(7);
          doc.setTextColor(110, 105, 95);
          doc.text(
            `Synthesized through Vimshottari Mahadasha/Antardasha cycles & planetary transits (${new Date().getFullYear()} – ${new Date().getFullYear() + 25})`,
            33,
            28
          );
        } else {
          // Compact Header on Later Pages
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(126, 95, 24);
          doc.text('JYOTISHVEDA • 25-YEAR VEDIC DESTINY ROADMAP', 14, 14);
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

        // Footer details
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(110, 105, 95);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(126, 95, 24);
        doc.text('DAIVAJNA ASTROLOGICAL SEAL', pageWidth - 14, footerY + 4.5, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(120, 120, 120);
        doc.text(`Page ${i} of ${totalPages}  |  Digitally Verified`, pageWidth - 14, footerY + 8, {
          align: 'right',
        });
      }

      // Save & Trigger Download
      const cleanName = (profile.fullName || 'Seeker').trim().replace(/\s+/g, '_');
      const fileName = `Vedic_25Year_Destiny_Roadmap_${cleanName}.pdf`;
      doc.save(fileName);

      // Also create a Blob URL to open preview in a new tab so the user can immediately view it
      try {
        const blobUrl = doc.output('bloburl');
        window.open(blobUrl, '_blank');
      } catch (openErr) {
        console.warn('Direct preview open error:', openErr);
      }
    } catch (err) {
      console.error('Failed to generate Roadmap PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className={`border rounded-xl p-6 shadow-xl transition-colors ${
        theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-white border-[#E5E1D8] text-[#0D0D0F]'
      }`}>
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b ${
          theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'
        }`}>
          <div>
            <div className="flex items-center space-x-2 text-xs font-sans font-semibold tracking-widest text-[#C9A050] uppercase mb-1">
              <Milestone className="w-4 h-4" />
              <span>25-Year Astrological Life Blueprint</span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-serif font-bold ${
              theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'
            }`}>
              Vedic Destiny Roadmap ({new Date().getFullYear()} – {new Date().getFullYear() + 25})
            </h1>
            <p className={`text-xs font-sans mt-1 leading-relaxed ${
              theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-600'
            }`}>
              Synthesized through your active Vimshottari Mahadasha/Antardasha cycles, major Saturn (Shani) and Jupiter (Guru) transits.
            </p>
          </div>

          <div className="flex items-center space-x-3 font-sans">
            <button
              onClick={handleDownloadPdfReport}
              disabled={isGeneratingPdf}
              className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition shadow-lg cursor-pointer shrink-0 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-[#C9A050] to-[#A07828] hover:from-[#D4AF37] hover:to-[#B38730] text-[#0D0D0F] border-[#C9A050] shadow-[#C9A050]/20'
                  : 'bg-[#C9A050] hover:bg-[#B38730] text-white border-[#C9A050] shadow-[#C9A050]/20'
              } disabled:opacity-50`}
              title="Download 25-Year Vedic Destiny Roadmap (PDF)"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Report (PDF)'}</span>
            </button>

            {isCurrentHorizonGenerated ? (
              <button
                type="button"
                disabled
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center space-x-1.5 cursor-default select-none shadow-sm"
                title={`${selectedHorizon} Vedic Destiny Roadmap has been generated (1 of 1 complimentary access used)`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{selectedHorizon} Generated</span>
              </button>
            ) : selectedHorizon === '15-20 Years' || selectedHorizon === '20-25 Years' ? (
              <button
                type="button"
                onClick={() => onNavigateToConsultations && onNavigateToConsultations()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A050] to-[#A07828] hover:from-[#D4AF37] hover:to-[#B38730] text-[#0D0D0F] font-bold text-xs shadow-md transition cursor-pointer flex items-center space-x-1.5"
              >
                <span>🔒 Unlock {selectedHorizon}</span>
              </button>
            ) : (
              <button
                onClick={handleGenerateRoadmap}
                disabled={isGenerating}
                className="px-4 py-2.5 rounded-xl bg-[#C9A050] hover:bg-[#D4AF37] text-[#0D0D0F] font-bold text-xs shadow-md shadow-[#C9A050]/20 transition cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Generating...' : `Generate ${selectedHorizon}`}</span>
              </button>
            )}
          </div>
        </div>

        {/* 1. Time Horizon Filters (Prominent Top Row) */}
        <div className="flex flex-wrap gap-2 pt-4 font-sans">
          {horizons.map((hor) => {
            const isSelected = selectedHorizon === hor;
            return (
              <button
                key={hor}
                onClick={() => setSelectedHorizon(hor)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 border shadow-sm ${
                  isSelected
                    ? 'bg-[#C9A050] text-[#0D0D0F] border-[#C9A050] font-bold shadow-md shadow-[#C9A050]/20'
                    : theme === 'dark'
                    ? 'bg-[#1A1A1E] text-[#9E9A90] hover:bg-[#2A2A2E] hover:text-[#F0ECE1] border-[#2A2A2E]'
                    : 'bg-white text-gray-700 hover:bg-gray-100 hover:text-black border-[#E5E1D8]'
                }`}
              >
                <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-[#0D0D0F]' : 'text-[#C9A050]'}`} />
                <span>{hor}</span>
              </button>
            );
          })}
        </div>

        {/* 2. Life Spheres / Categories (Compact Sub-Row with Label) */}
        <div className="flex items-center space-x-2 pt-3 text-xs overflow-x-auto font-sans">
          <span className={`text-[11px] shrink-0 font-medium ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
            Life Spheres:
          </span>
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer shrink-0 flex items-center space-x-1 border ${
                  isSelected
                    ? 'bg-[#C9A050]/20 text-[#C9A050] border-[#C9A050]/50 font-semibold'
                    : theme === 'dark'
                    ? 'bg-[#1A1A1E]/60 text-[#9E9A90] hover:text-[#F0ECE1] border-transparent'
                    : 'bg-gray-100 text-gray-600 hover:text-black border-transparent'
                }`}
              >
                <Icon className="w-3 h-3 text-[#C9A050]" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Roadmap Milestone Cards & Horizon State */}
      <div className="space-y-4 min-h-[300px]">
        {isGenerating ? (
          <div className={`border rounded-xl p-16 sm:p-24 flex flex-col items-center justify-center min-h-[340px] text-center shadow-xl space-y-4 animate-in fade-in duration-300 ${
            theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-white border-[#E5E1D8]'
          }`}>
            <div className="relative flex items-center justify-center">
              {/* Outer Golden Spinner */}
              <div className="w-14 h-14 rounded-full border-2 border-[#C9A050]/20 border-t-[#C9A050] animate-spin" />
              {/* Center Sacred Icon */}
              <Sparkles className="w-5 h-5 text-[#C9A050] absolute animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <h3 className={`font-serif font-bold text-base sm:text-lg ${
                theme === 'dark' ? 'text-[#F0ECE1]' : 'text-gray-900'
              }`}>
                Generating {loadingText} Roadmap...
              </h3>
              <p className={`text-xs font-sans max-w-sm mx-auto ${
                theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-500'
              }`}>
                Synthesizing Vimshottari Mahadasha cycles, Saturn Gochara &amp; Jupiter transit windows
              </p>
            </div>
          </div>
        ) : selectedHorizon === '15-20 Years' || selectedHorizon === '20-25 Years' ? (
          <div className={`relative border border-[#C9A050]/40 rounded-xl p-8 sm:p-12 text-center shadow-xl space-y-5 flex flex-col items-center justify-center min-h-[300px] ${
            theme === 'dark' ? 'bg-[#141418]' : 'bg-white'
          }`}>
            <div className="w-16 h-16 rounded-full bg-black/60 border border-[#C9A050]/40 flex items-center justify-center mb-2">
              <span className="text-[#C9A050] text-2xl font-bold">🔒</span>
            </div>
            <h3 className={`text-xl sm:text-2xl font-serif font-bold ${
              theme === 'dark' ? 'text-[#F0ECE1]' : 'text-gray-900'
            }`}>
              Unlock the {selectedHorizon} Roadmap
            </h3>
            <p className={`text-sm max-w-lg mx-auto pb-4 ${
              theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-600'
            }`}>
              Accessing your long-term Vedic Destiny beyond 15 years requires a deeper astrological synthesis. Please visit the Consultations & Gateway section to unlock this premium analysis.
            </p>
            <button 
              onClick={() => onNavigateToConsultations && onNavigateToConsultations()} 
              className="px-6 py-3 bg-[#C9A050] text-[#0D0D0F] font-bold text-sm rounded-lg shadow-md cursor-pointer transition hover:bg-[#D4AF37]"
            >
              Consultations & Gateway
            </button>
          </div>
        ) : !isCurrentHorizonGenerated ? (
          <div className={`border rounded-xl p-10 sm:p-14 text-center shadow-xl space-y-4 flex flex-col items-center justify-center min-h-[300px] ${
            theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-white border-[#E5E1D8]'
          }`}>
            <div className="w-14 h-14 rounded-2xl bg-[#C9A050]/15 border border-[#C9A050]/30 flex items-center justify-center mb-1 shadow-inner">
              <Sparkles className="w-6 h-6 text-[#C9A050]" />
            </div>
            <div className="space-y-1">
              <h3 className={`text-xl sm:text-2xl font-serif font-bold ${
                theme === 'dark' ? 'text-[#F0ECE1]' : 'text-gray-900'
              }`}>
                Synthesize {selectedHorizon} Vedic Life Blueprint
              </h3>
              <p className={`text-xs sm:text-sm max-w-md mx-auto leading-relaxed ${
                theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-600'
              }`}>
                Unlock your individualized planetary dasha cycles, favorable transit windows, and life milestones for the {selectedHorizon} epoch.
              </p>
            </div>
            <button
              onClick={handleGenerateRoadmap}
              disabled={isGenerating}
              className="px-6 py-3 rounded-xl bg-[#C9A050] hover:bg-[#D4AF37] text-[#0D0D0F] font-bold text-xs shadow-lg shadow-[#C9A050]/25 transition cursor-pointer flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate {selectedHorizon} Roadmap</span>
            </button>
          </div>
        ) : (
          <>
            {filteredRoadmap.map((item, idx) => {
              const isCompleted = item.status === 'Completed';
              const isInProgress = item.status === 'In-Progress';
              const isLockedCategory = isMilestoneLocked(item);

              return (
                <div
                  key={item.id}
                  className={`relative border rounded-xl shadow-xl transition overflow-hidden group ${
                    theme === 'dark' ? 'bg-[#141418]' : 'bg-white'
                  } ${
                    isLockedCategory ? 'border-[#C9A050]/40' :
                    isCompleted
                      ? 'border-emerald-500/40 bg-emerald-950/10'
                      : isInProgress
                      ? 'border-[#C9A050]/40 bg-[#C9A050]/5'
                      : theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'
                  }`}
                >
                  {isLockedCategory && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] transition duration-300">
                      <div className="opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center p-6 bg-black/80 w-full h-full transition duration-300">
                        <h3 className="text-lg sm:text-xl font-serif font-bold text-[#F0ECE1] mb-3 text-center">
                          Unlock {getCategoryDisplayName(item.category)} Roadmap ({item.timeframe})
                        </h3>
                        <button 
                          onClick={() => onNavigateToConsultations && onNavigateToConsultations()} 
                          className="px-5 py-2.5 bg-[#C9A050] text-[#0D0D0F] font-bold text-xs sm:text-sm rounded-lg shadow-md cursor-pointer transition hover:bg-[#D4AF37]"
                        >
                          Consultations & Gateway
                        </button>
                      </div>
                      <div className="absolute opacity-100 group-hover:opacity-0 transition duration-300">
                        <div className="w-12 h-12 rounded-full bg-black/60 border border-[#C9A050]/40 flex items-center justify-center">
                          <span className="text-[#C9A050] text-lg font-bold">🔒</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={`p-5 sm:p-6 space-y-4 ${isLockedCategory ? 'opacity-30 blur-[3px] pointer-events-none' : ''}`}>
                    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${
                      theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'
                    }`}>
                      <div className="flex items-center space-x-3.5">
                        <div className="w-8 h-8 rounded-xl bg-[#C9A050]/20 text-[#C9A050] font-serif font-bold text-xs flex items-center justify-center shrink-0 border border-[#C9A050]/30">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 font-sans">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              theme === 'dark' ? 'bg-[#1A1A1E] text-[#C9A050] border-[#2A2A2E]' : 'bg-amber-50 text-amber-900 border-amber-200'
                            }`}>
                              {item.timeframe}
                            </span>
                            <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                              {item.category}
                            </span>
                          </div>
                          <h3 className={`text-base font-serif font-bold mt-0.5 ${
                            theme === 'dark' ? 'text-[#F0ECE1]' : 'text-gray-900'
                          }`}>
                            {item.title}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* Guidance & Favorable Transits */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                      <div className={`p-3.5 rounded-xl border space-y-1 ${
                        theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
                      }`}>
                        <span className="text-[9px] uppercase font-bold text-[#C9A050] block tracking-wider">
                          Dasha & Life Strategy Guidance
                        </span>
                        <p className={`leading-relaxed ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-gray-800'}`}>
                          {item.guidance}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className={`p-3 rounded-xl border flex items-center justify-between ${
                          theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
                        }`}>
                          <span className={`text-[11px] ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                            Astrological Window:
                          </span>
                          <span className="font-semibold text-[#C9A050] text-right font-mono">{item.favorableTransits}</span>
                        </div>

                        <div className={`p-3 rounded-xl border flex items-start space-x-2.5 ${
                          theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
                        }`}>
                          <Flame className="w-3.5 h-3.5 text-[#C9A050] shrink-0 mt-0.5" />
                          <div>
                            <span className={`text-[9px] uppercase font-bold block tracking-wider ${
                              theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-500'
                            }`}>
                              Recommended Upaya / Sadhana
                            </span>
                            <span className={`text-[11px] ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-gray-800'}`}>
                              {item.remedialAction}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
</div>
);
};
