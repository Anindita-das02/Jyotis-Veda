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
}

export const LifeRoadmapView: React.FC<LifeRoadmapViewProps> = ({
  profile,
  tradition,
  chartData,
  numerology,
  roadmap,
  setRoadmap,
  onNavigateToConsultations,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedHorizon, setSelectedHorizon] = useState<string>('0-5 Years');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [loadingText, setLoadingText] = useState<string>('0-5 Years');

  // Ensure roadmap is initialized with full 15 milestones on mount/profile change if partial
  useEffect(() => {
    if (!roadmap || roadmap.length < 15) {
      setRoadmap(generateCustomRoadmap(profile, chartData));
    }
  }, [profile, chartData]);

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

  const handleGenerateRoadmap = async () => {
    setIsGenerating(true);
    const catObj = categories.find((c) => c.id === selectedCategory);
    setLoadingText(`${catObj ? catObj.label : 'All Life Spheres'} • ${selectedHorizon}`);
    try {
      const data = await api.post<any>(API_ENDPOINTS.ROADMAP.GENERATE, {
        profile,
        tradition,
        chartData,
        numerology,
      });

      if (data && data.milestones && Array.isArray(data.milestones) && data.milestones.length >= 15) {
        setRoadmap(data.milestones);
      } else if (data && data.milestones && Array.isArray(data.milestones) && data.milestones.length > 0) {
        // Merge AI milestones with default 15-milestone structure
        const customRoadmap = generateCustomRoadmap(profile, chartData);
        const merged = customRoadmap.map((defaultItem) => {
          const matched = data.milestones.find(
            (m: any) => m.timeframe === defaultItem.timeframe && m.category === defaultItem.category
          );
          return matched ? { ...defaultItem, ...matched } : defaultItem;
        });
        setRoadmap(merged);
      } else {
        setRoadmap(generateCustomRoadmap(profile, chartData));
      }
    } catch (e) {
      console.warn('Roadmap AI generation fallback:', e);
      setRoadmap(generateCustomRoadmap(profile, chartData));
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
        setHasGenerated(true);
      }, 700);
    }
  };

  const isMilestoneLocked = (item: LifeMilestone): boolean => {
    const tf = item.timeframe;
    const cat = item.category;

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
        return cat;
    }
  };

  const normalizedRoadmap = roadmap.map((m) => {
    let t = m.timeframe;
    if (t === '0-12 Months' || t === '1-3 Years') t = '0-5 Years';
    else if (t === '3-5 Years') t = '5-10 Years';
    return { ...m, timeframe: t };
  });

  const sortedRoadmap = [...normalizedRoadmap].sort((a, b) => {
    const isALocked = isMilestoneLocked(a);
    const isBLocked = isMilestoneLocked(b);
    if (isALocked && !isBLocked) return 1;
    if (!isALocked && isBLocked) return -1;
    return 0;
  });

  const filteredRoadmap = sortedRoadmap.filter((m) => {
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
      doc.setFillColor(243, 236, 218);
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
          pageWidth - 36
        );
        const guidanceHeight = guidanceLines.length * 3.5;

        const transitText = `Transit Window: ${m.favorableTransits || 'Favorable transit alignment'}`;
        const remedyText = `Upaya / Sadhana: ${m.remedialAction || 'Chant Maha Mrityunjaya Mantra & perform Guru Seva'}`;
        const transitLines = doc.splitTextToSize(transitText, pageWidth - 42);
        const remedyLines = doc.splitTextToSize(remedyText, pageWidth - 42);

        const cardHeight = 12 + guidanceHeight + 2 + transitLines.length * 3.2 + remedyLines.length * 3.2 + 5;

        // Check page overflow
        if (yPos + cardHeight > pageHeight - 22) {
          doc.addPage();
          yPos = 20; // reset yPos on subsequent pages
        }

        // Card Container
        const isCompleted = m.status === 'Completed';
        const isInProgress = m.status === 'In-Progress';

        if (isCompleted) {
          doc.setFillColor(242, 250, 245);
          doc.setDrawColor(120, 190, 150);
        } else if (isInProgress) {
          doc.setFillColor(254, 250, 240);
          doc.setDrawColor(201, 160, 80);
        } else {
          doc.setFillColor(250, 249, 246);
          doc.setDrawColor(220, 215, 205);
        }
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
        if (isCompleted) {
          doc.setTextColor(20, 120, 60);
        } else if (isInProgress) {
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
        textY += guidanceHeight + 1;

        // Transit Window Row
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.2);
        doc.setTextColor(126, 95, 24);
        doc.text('Astrological Transit Window: ', 17, textY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        doc.text(transitLines, 17 + doc.getTextWidth('Astrological Transit Window: '), textY);
        textY += transitLines.length * 3.4;

        // Upaya / Sadhana Row
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.2);
        doc.setTextColor(180, 80, 20);
        doc.text('Recommended Upaya / Sadhana: ', 17, textY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        doc.text(remedyLines, 17 + doc.getTextWidth('Recommended Upaya / Sadhana: '), textY);

        yPos += cardHeight + 4;
      });

      // Auspicious Remedies & Numerology Harmonies Box at the End
      const remedyBoxHeight = 28;
      if (yPos + remedyBoxHeight > pageHeight - 22) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFillColor(254, 252, 247);
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
        const certId = `JV-RM-${Date.now().toString(36).toUpperCase()}`;
        doc.text(
          `Document ID: ${certId}  |  Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
          14,
          footerY + 4.5
        );
        doc.text(
          'Certified via JyotishVeda Mathematical AstroEngine & Classical Parashari Hora Ephemeris',
          14,
          footerY + 8
        );

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
      <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#2A2A2E]">
          <div>
            <div className="flex items-center space-x-2 text-xs font-sans font-semibold tracking-widest text-[#C9A050] uppercase mb-1">
              <Milestone className="w-4 h-4" />
              <span>25-Year Astrological Life Blueprint</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F0ECE1]">
              Vedic Destiny Roadmap ({new Date().getFullYear()} – {new Date().getFullYear() + 25})
            </h1>
            <p className="text-xs font-sans text-[#9E9A90] mt-1 leading-relaxed">
              Synthesized through your active Vimshottari Mahadasha/Antardasha cycles, major Saturn (Shani) and Jupiter (Guru) transits.
            </p>
          </div>

          <div className="flex items-center space-x-3 font-sans">
            <button
              onClick={handleDownloadPdfReport}
              disabled={isGeneratingPdf}
              className="px-3.5 py-2 rounded-lg bg-[#1A1A1E] hover:bg-[#2A2A2E] border border-[#C9A050]/40 text-[#C9A050] hover:text-[#F0ECE1] transition cursor-pointer text-xs font-semibold flex items-center space-x-1.5 disabled:opacity-50"
              title="Download 25-Year Vedic Destiny Roadmap (PDF)"
            >
              <Download className={`w-3.5 h-3.5 ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
              <span>{isGeneratingPdf ? 'Generating Report...' : 'Download Report (PDF)'}</span>
            </button>

            <button
              onClick={handleGenerateRoadmap}
              disabled={isGenerating}
              className="px-4 py-2 rounded-lg bg-[#C9A050] hover:bg-[#D4AF37] text-[#0D0D0F] font-bold text-xs shadow-md shadow-[#C9A050]/20 transition cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Generating...' : 'Generate Roadmap'}</span>
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 pt-4 font-sans">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-[#C9A050] text-[#0D0D0F] shadow-sm'
                    : 'bg-[#1A1A1E] text-[#9E9A90] hover:bg-[#2A2A2E] hover:text-[#F0ECE1] border border-[#2A2A2E]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Timeframe Horizons */}
        <div className="flex items-center space-x-2 pt-3 text-xs overflow-x-auto font-sans">
          <span className="text-[#9E9A90] text-[11px] shrink-0 font-medium">Time Horizon:</span>
          {horizons.map((hor) => (
            <button
              key={hor}
              onClick={() => setSelectedHorizon(hor)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer shrink-0 ${
                selectedHorizon === hor
                  ? 'bg-[#C9A050]/20 text-[#C9A050] border border-[#C9A050]/40'
                  : 'bg-[#1A1A1E]/60 text-[#9E9A90] hover:text-[#F0ECE1]'
              }`}
            >
              {hor}
            </button>
          ))}
        </div>
      </div>

      {/* Roadmap Milestone Cards */}
      {hasGenerated || isGenerating ? (
        <div className="space-y-4 min-h-[300px]">
          {isGenerating ? (
            <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-16 sm:p-24 flex flex-col items-center justify-center min-h-[340px] text-center shadow-xl space-y-4 animate-in fade-in duration-300">
              <div className="relative flex items-center justify-center">
                {/* Outer Golden Spinner */}
                <div className="w-14 h-14 rounded-full border-2 border-[#C9A050]/20 border-t-[#C9A050] animate-spin" />
                {/* Center Sacred Icon */}
                <Sparkles className="w-5 h-5 text-[#C9A050] absolute animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#F0ECE1]">
                  Generating {loadingText} Roadmap...
                </h3>
                <p className="text-xs text-[#9E9A90] font-sans max-w-sm mx-auto">
                  Synthesizing Vimshottari Mahadasha cycles, Saturn Gochara &amp; Jupiter transit windows
                </p>
              </div>
            </div>
          ) : selectedHorizon === '15-20 Years' || selectedHorizon === '20-25 Years' ? (
            <div className="relative bg-[#141418] border border-[#C9A050]/40 rounded-xl p-8 sm:p-12 text-center shadow-xl space-y-5 flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-16 h-16 rounded-full bg-black/60 border border-[#C9A050]/40 flex items-center justify-center mb-2">
                <span className="text-[#C9A050] text-2xl font-bold">🔒</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#F0ECE1]">
                Unlock the {selectedHorizon} Roadmap
              </h3>
              <p className="text-[#9E9A90] text-sm max-w-lg mx-auto pb-4">
                Accessing your long-term Vedic Destiny beyond 15 years requires a deeper astrological synthesis. Please visit the Consultations & Gateway section to unlock this premium analysis.
              </p>
              <button 
                onClick={() => onNavigateToConsultations && onNavigateToConsultations()} 
                className="px-6 py-3 bg-[#C9A050] text-[#0D0D0F] font-bold text-sm rounded-lg shadow-md cursor-pointer transition hover:bg-[#D4AF37]"
              >
                Consultations & Gateway
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
                  className={`relative bg-[#141418] border rounded-xl shadow-xl transition overflow-hidden group ${
                    isLockedCategory ? 'border-[#C9A050]/40' :
                    isCompleted
                      ? 'border-emerald-500/40 bg-emerald-950/10'
                      : isInProgress
                      ? 'border-[#C9A050]/40 bg-[#C9A050]/5'
                      : 'border-[#2A2A2E]'
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2A2A2E]">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-8 h-8 rounded-xl bg-[#C9A050]/20 text-[#C9A050] font-serif font-bold text-xs flex items-center justify-center shrink-0 border border-[#C9A050]/30">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1A1A1E] text-[#C9A050] border border-[#2A2A2E]">
                          {item.timeframe}
                        </span>
                        <span className="text-xs font-semibold text-[#9E9A90]">{item.category}</span>
                      </div>
                      <h3 className="text-base font-serif font-bold text-[#F0ECE1] mt-0.5">{item.title}</h3>
                    </div>
                  </div>
                </div>

              {/* Guidance & Favorable Transits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                <div className="bg-[#1A1A1E] p-3.5 rounded-xl border border-[#2A2A2E] space-y-1">
                  <span className="text-[9px] uppercase font-bold text-[#C9A050] block tracking-wider">
                    Dasha & Life Strategy Guidance
                  </span>
                  <p className="text-[#E5E1D8] leading-relaxed">{item.guidance}</p>
                </div>

                <div className="space-y-2">
                  <div className="bg-[#1A1A1E] p-3 rounded-xl border border-[#2A2A2E] flex items-center justify-between">
                    <span className="text-[11px] text-[#9E9A90]">Astrological Window:</span>
                    <span className="font-semibold text-[#C9A050] text-right font-mono">{item.favorableTransits}</span>
                  </div>

                  <div className="bg-[#1A1A1E] p-3 rounded-xl border border-[#2A2A2E] flex items-start space-x-2.5">
                    <Flame className="w-3.5 h-3.5 text-[#C9A050] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[9px] uppercase font-bold text-[#9E9A90] block tracking-wider">Recommended Upaya / Sadhana</span>
                      <span className="text-[11px] text-[#E5E1D8]">{item.remedialAction}</span>
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
) : null}
</div>
);
};
