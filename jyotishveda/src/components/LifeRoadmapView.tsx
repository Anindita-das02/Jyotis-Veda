import { api, API_BASE_URL, getToken } from '../services/api';
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
  Users,
  GraduationCap,
  Globe,
  Lock,
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
  onNavigateToConsultations?: (tierId?: string) => void;
  theme?: 'light' | 'dark';
  language?: string;
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
  language = 'en',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedHorizon, setSelectedHorizon] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHorizons, setGeneratedHorizons] = useState<Record<string, boolean>>({});
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [loadingText, setLoadingText] = useState<string>('0-5 Years');

  const getStorageKey = () => `jyotish_roadmap_horizons_${profile?.id || profile?.fullName || 'user'}_${profile?.birthDate || ''}`;

  // Ensure roadmap is initialized on mount/profile change
  useEffect(() => {
    if (!profile) return;
    const key = getStorageKey();
    let hasLoadedCache = false;
    const normalizeTf = (tf: string) => {
      if (tf === '5-10 Years' || tf === '3-5 Years') return '0-10 Years';
      if (tf === '10-15 Years') return '0-15 Years';
      if (tf === '15-20 Years') return '0-20 Years';
      if (tf === '20-25 Years') return '0-25 Years';
      return tf;
    };

    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed.milestones) && parsed.milestones.length > 0) {
            const updatedMilestones = parsed.milestones.map((m: any) => ({
              ...m,
              timeframe: normalizeTf(m.timeframe || ''),
            }));
            setRoadmap(updatedMilestones);
            hasLoadedCache = true;
          }
          if (parsed.generatedHorizons) {
            const nextGen: Record<string, boolean> = {};
            Object.entries(parsed.generatedHorizons).forEach(([k, v]) => {
              nextGen[normalizeTf(k)] = !!v;
            });
            setGeneratedHorizons(nextGen);
          }
        }
      }
    } catch (e) {
      console.warn('Error reading cached roadmap horizons:', e);
    }

    if (!hasLoadedCache && (!roadmap || roadmap.length < 25)) {
      setRoadmap(generateCustomRoadmap(profile, chartData));
    }
  }, [profile?.fullName, profile?.birthDate]);

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
    { id: 'Career', label: 'Career', icon: Briefcase },
    { id: 'Wealth', label: 'Wealth', icon: DollarSign },
    { id: 'Health', label: 'Health', icon: Activity },
    { id: 'Relationships', label: 'Love', icon: Heart },
    { id: 'Family', label: 'Family', icon: Users },
    { id: 'Education', label: 'Education', icon: GraduationCap },
    { id: 'Travel', label: 'Travel', icon: Globe },
    { id: 'Spirituality', label: 'Spirituality', icon: Flame },
  ];

  const horizons = ['0-5 Years', '0-10 Years', '0-15 Years', '0-20 Years', '0-25 Years'];

  const getHorizonTierId = (tf: string): string | null => {
    if (tf === '0-15 Years' || tf === '10-15 Years') return 'roadmap_15_subscription';
    if (tf === '0-20 Years' || tf === '15-20 Years') return 'roadmap_20_subscription';
    if (tf === '0-25 Years' || tf === '20-25 Years') return 'roadmap_25_subscription';
    return null;
  };

  const getHorizonPrice = (tf: string): number => {
    if (tf === '0-15 Years' || tf === '10-15 Years') return 169;
    if (tf === '0-20 Years' || tf === '15-20 Years') return 199;
    if (tf === '0-25 Years' || tf === '20-25 Years') return 249;
    return 0;
  };

  const isMilestoneLocked = (item: LifeMilestone): boolean => {
    if (!item) return false;
    if (profile?.isPremium) return false;

    const tf = (item.timeframe || '').trim();

    // 🌟 0-5 Years & 0-10 Years: 100% FREE & UNLOCKED for all 8 life spheres
    if (
      tf === '0-5 Years' || tf === '0-12 Months' || tf === '1-3 Years' ||
      tf === '0-10 Years' || tf === '5-10 Years' || tf === '3-5 Years'
    ) {
      return false;
    }

    const tierId = getHorizonTierId(tf);
    const unlockedTiers: string[] = (profile as any)?.unlockedRoadmapTiers || [];

    // Check if user has purchased this specific tier or the master 25-yr tier
    if (tierId && (unlockedTiers.includes(tierId) || unlockedTiers.includes('roadmap_25_subscription'))) {
      return false;
    }

    try {
      if (tierId && localStorage.getItem(`jyotish_${tierId}_active`) === 'true') {
        return false;
      }
      if (localStorage.getItem('jyotish_roadmap_25_subscription_active') === 'true') {
        return false;
      }
    } catch {}

    // 0-15 Years (₹169), 0-20 Years (₹199), 0-25 Years (₹249) require subscription
    return true;
  };

  const isHorizonLocked = (tf?: string): boolean => {
    const horizon = tf || selectedHorizon;
    if (!horizon) return false;
    if (horizon === '0-5 Years' || horizon === '0-10 Years') return false;
    return isMilestoneLocked({ timeframe: horizon } as any);
  };

  const handleGenerateHorizon = async (horizonToGen?: string) => {
    const targetHorizon = horizonToGen || selectedHorizon || '0-5 Years';
    if (!targetHorizon || isGenerating) return;

    // 🌟 If this horizon is locked, DO NOT generate or show loading spinner!
    if (isHorizonLocked(targetHorizon)) {
      console.log('🔒 Horizon is locked; prompt subscription instead of generating:', targetHorizon);
      return;
    }

    if (!selectedHorizon) {
      setSelectedHorizon(targetHorizon);
    }

    setIsGenerating(true);
    const catObj = categories.find((c) => c.id === selectedCategory);
    setLoadingText(`${catObj && catObj.id !== 'all' ? catObj.label + ' • ' : ''}${targetHorizon}`);
    
    let updatedRoadmap = roadmap && roadmap.length > 0 ? [...roadmap] : generateCustomRoadmap(profile, chartData);

    console.log('🚀 [Roadmap] Calling Filtered Predictions API /api/roadmap/filtered-predictions for:', targetHorizon);

    try {
      // Fetch the 8-topic life dimension predictions (/api/roadmap/filtered-predictions)
      const res = await api.post<any>(API_ENDPOINTS.ROADMAP.FILTERED_PREDICTIONS, {
        profile,
        tradition,
        chartData,
        numerology,
        filter: targetHorizon,
        horizon: targetHorizon,
        language,
      });

      console.log('✅ [Roadmap] Received predictions response:', res);

      if (res && res.topics && Array.isArray(res.topics) && res.topics.length > 0) {
        const categoryMap: Record<string, string> = {
          career: 'Career',
          wealth: 'Wealth',
          health: 'Health',
          relationships: 'Relationships',
          family: 'Family',
          education: 'Education',
          travel: 'Travel',
          spirituality: 'Spirituality',
        };

        const generatedForHorizon: LifeMilestone[] = res.topics.map((t: any, idx: number) => {
          const rawKey = (t.topicKey || '').toLowerCase();
          const mappedCat = categoryMap[rawKey] || t.topicName || 'General';
          return {
            id: `ms-${targetHorizon.replace(/\s+/g, '-').toLowerCase()}-${rawKey || idx}`,
            timeframe: targetHorizon,
            category: mappedCat,
            title: t.topicName || getCategoryDisplayName(mappedCat),
            guidance: t.prediction || '',
            favorableTransits: t.favorableTransits || 'Favorable transit aspect',
            remedialAction: t.remedialAction || 'Chant Navagraha Stotra daily',
            status: idx === 0 ? 'In-Progress' : 'Pending',
          };
        });

        const others = updatedRoadmap.filter((m) => m.timeframe !== targetHorizon);
        updatedRoadmap = [...others, ...generatedForHorizon];
      } else if (res && res.milestones && Array.isArray(res.milestones) && res.milestones.length > 0) {
        const generatedForHorizon = res.milestones.filter((m: any) => m.timeframe === targetHorizon);
        if (generatedForHorizon.length > 0) {
          updatedRoadmap = updatedRoadmap.map((item) => {
            if (item.timeframe === targetHorizon) {
              const matched = generatedForHorizon.find((m: any) => m.category === item.category);
              return matched ? { ...item, ...matched } : item;
            }
            return item;
          });
        }
      }
    } catch (e) {
      console.warn('Roadmap filtered AI generation error/fallback:', e);
    } finally {
      const nextGeneratedHorizons = {
        ...generatedHorizons,
        [targetHorizon]: true,
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
      }, 500);
    }
  };

  const handleHorizonTabClick = (hor: string) => {
    setSelectedHorizon(hor);
    // 🌟 Never generate for locked horizons; immediately show subscription paywall
    if (!isHorizonLocked(hor)) {
      handleGenerateHorizon(hor);
    }
  };

  const getCategoryDisplayName = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case 'relationships':
        return 'Marriage & Love';
      case 'wealth':
        return 'Wealth & Finance';
      case 'health':
        return 'Health & Vitality';
      case 'spirituality':
        return 'Spirituality & Upayas';
      case 'career':
        return 'Career & Profession';
      case 'family':
        return 'Family & Children';
      case 'education':
        return 'Education & Learning';
      case 'travel':
        return 'Travel & Relocation';
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
    else if (t === '3-5 Years' || t === '5-10 Years') t = '0-10 Years';
    else if (t === '10-15 Years') t = '0-15 Years';
    else if (t === '15-20 Years') t = '0-20 Years';
    else if (t === '20-25 Years') t = '0-25 Years';
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
    const matchCat = !selectedCategory || selectedCategory === 'all' || m.category === selectedCategory;
    const matchHor = !selectedHorizon || selectedHorizon === 'all' || m.timeframe === selectedHorizon;
    return matchCat && matchHor;
  });

  // Comprehensive Multi-Page PDF Report Generator (Exporting Exact UI Predictions)
  const handleDownloadPdfReport = async () => {
    const targetHorizon = selectedHorizon || '0-5 Years';
    if (isHorizonLocked(targetHorizon)) {
      if (onNavigateToConsultations) {
        onNavigateToConsultations(getHorizonTierId(targetHorizon) || undefined);
      }
      return;
    }

    setIsGeneratingPdf(true);
    const cleanName = (profile.fullName || (profile as any)?.name || 'Seeker').trim().replace(/\s+/g, '_');
    const fileName = `Vedic_Destiny_Roadmap_${cleanName}_${targetHorizon.replace(/\s+/g, '_')}.pdf`;

    // 🌟 Ensure we export the exact predictions currently displayed on the user's screen
    let milestonesToExport = (filteredRoadmap && filteredRoadmap.length > 0)
      ? filteredRoadmap
      : (roadmap && roadmap.length > 0
          ? (selectedHorizon ? roadmap.filter((m) => m.timeframe === selectedHorizon) : roadmap)
          : []);

    // Only if nothing is loaded at all on screen, fetch from Filter API once
    if (milestonesToExport.length === 0) {
      try {
        const res = await api.post<any>(API_ENDPOINTS.ROADMAP.FILTERED_PREDICTIONS, {
          profile,
          tradition,
          chartData,
          numerology,
          filter: targetHorizon,
          horizon: targetHorizon,
          language,
        });

        if (res && res.topics && Array.isArray(res.topics) && res.topics.length > 0) {
          const categoryMap: Record<string, string> = {
            career: 'Career',
            wealth: 'Wealth',
            health: 'Health',
            relationships: 'Relationships',
            family: 'Family',
            education: 'Education',
            travel: 'Travel',
            spirituality: 'Spirituality',
          };

          milestonesToExport = res.topics.map((t: any, idx: number) => {
            const rawKey = (t.topicKey || '').toLowerCase();
            const mappedCat = categoryMap[rawKey] || t.topicName || 'General';
            return {
              id: `ms-${targetHorizon.replace(/\s+/g, '-').toLowerCase()}-${rawKey || idx}`,
              timeframe: targetHorizon,
              category: mappedCat,
              title: t.topicName || getCategoryDisplayName(mappedCat),
              guidance: t.prediction || '',
              favorableTransits: t.favorableTransits || 'Favorable transit aspect',
              remedialAction: t.remedialAction || 'Chant Navagraha Stotra daily',
              status: idx === 0 ? 'In-Progress' : 'Pending',
            };
          });

          setRoadmap(milestonesToExport);
        }
      } catch (err) {
        console.warn('Pre-fetching predictions for PDF failed:', err);
      }
    }

    if (milestonesToExport.length === 0) {
      milestonesToExport = generateCustomRoadmap(profile, chartData);
    }

    // 1. Attempt Server-Side Python Flask PDF Download via API
    try {
      const token = getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/roadmap/download-pdf`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          profile,
          selectedHorizon: targetHorizon,
          includeAll: false,
          roadmap: milestonesToExport,
          chartData,
          numerology,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
        setIsGeneratingPdf(false);
        return;
      }
    } catch (apiErr) {
      console.warn('Backend PDF endpoint error or offline, falling back to Client-Side PDF generator:', apiErr);
    }

    // 2. Client-Side jsPDF Generator (Fallback)
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const bgBase64 = await loadImageBase64('/astrologer_bg.jpg');
      const logoBase64 = await loadImageBase64('/jyotishveda_logo.png');

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

      let yPos = 33;

      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      if (bgBase64) {
        doc.addImage(bgBase64, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
      }

      doc.setDrawColor(201, 160, 80);
      doc.setLineWidth(0.8);
      doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
      doc.setLineWidth(0.3);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', 14, 13, 14, 14);
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(180, 130, 40);
      doc.text('ASTROJUNCTION', 31, 19);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(110, 110, 110);
      doc.text('Sacred Vedic Astrology & Life Horizon Synthesis', 31, 23.5);

      doc.setDrawColor(220, 200, 160);
      doc.setLineWidth(0.4);
      doc.line(13, 29, pageWidth - 13, 29);

      doc.setFillColor(252, 251, 248);
      doc.setDrawColor(226, 211, 176);
      doc.setLineWidth(0.4);
      doc.roundedRect(13, yPos, pageWidth - 26, 24, 2, 2, 'FD');
      doc.line(pageWidth / 2, yPos, pageWidth / 2, yPos + 24);

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

      doc.text(`VEDIC DESTINY ROADMAP — ${targetHorizon.toUpperCase()}`, 17, yPos + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(60, 60, 60);
      doc.text(
        `Active Horizon: ${targetHorizon}  |  Predictions: ${milestonesToExport.length} Life Spheres  |  ✓ Completed: ${completedCount}  •  ⚡ In-Progress: ${inProgressCount}  •  ⏳ Pending: ${pendingCount}`,
        17,
        yPos + 9
      );

      yPos += 16;

      // Render Milestone Cards (Exporting all predictions returned from Filter API)
      milestonesToExport.forEach((m, idx) => {
        if (isMilestoneLocked(m)) return;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);

        const guidanceLines = doc.splitTextToSize(
          m.guidance || 'Astrological dasha guidance and strategic timing.',
          pageWidth - 34
        );
        const guidanceHeight = guidanceLines.length * 3.5;

        const transitVal = m.favorableTransits || 'Favorable transit alignment';
        const remedyVal = m.remedialAction || 'Chant Maha Mrityunjaya Mantra & perform Guru Seva';

        const transitLabelW = doc.getTextWidth('Astrological Window & Transits: ');
        const remedyLabelW = doc.getTextWidth('Recommended Upaya / Sadhana: ');

        const transitLines = doc.splitTextToSize(transitVal, pageWidth - 34 - transitLabelW);
        const remedyLines = doc.splitTextToSize(remedyVal, pageWidth - 34 - remedyLabelW);

        const cardHeight = 14 + guidanceHeight + 2 + transitLines.length * 3.4 + remedyLines.length * 3.4 + 5;

        if (yPos + cardHeight > pageHeight - 22) {
          doc.addPage();
          yPos = 20; // reset yPos on subsequent pages
        }

        doc.setFillColor(252, 251, 248);
        doc.setDrawColor(226, 211, 176);
        doc.setLineWidth(0.35);
        doc.roundedRect(13, yPos, pageWidth - 26, cardHeight, 1.5, 1.5, 'FD');

        // Status accent indicator on left border
        if (m.status === 'Completed') {
          doc.setFillColor(16, 185, 129); // emerald
        } else if (m.status === 'In-Progress') {
          doc.setFillColor(201, 160, 80); // gold
        } else {
          doc.setFillColor(160, 160, 160); // gray
        }
        doc.roundedRect(13, yPos, 2, cardHeight, 1, 1, 'F');

        // Milestone Number & Title (Matching UI without redundant category badge)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(26, 26, 30);
        doc.text(`${idx + 1}.  ${m.title || getCategoryDisplayName(m.category)}`, 17, yPos + 6.5);

        // Section: Dasha Guidance
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.8);
        doc.setTextColor(126, 95, 24);
        doc.text('DASHA & LIFE STRATEGY GUIDANCE', 17, yPos + 11.5);

        // Strategic Guidance
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(50, 50, 50);
        doc.text(guidanceLines, 17, yPos + 15.5);

        const afterGuidanceY = yPos + 15.5 + guidanceHeight;

        // Transit Window
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(150, 108, 30);
        doc.text('Astrological Window & Transits: ', 17, afterGuidanceY + 1);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50, 50, 50);
        doc.text(transitLines, 17 + transitLabelW, afterGuidanceY + 1);

        const afterTransitY = afterGuidanceY + 1 + transitLines.length * 3.4;

        // Remedial Upaya
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(126, 95, 24);
        doc.text('Recommended Upaya / Sadhana: ', 17, afterTransitY + 1);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50, 50, 50);
        doc.text(remedyLines, 17 + remedyLabelW, afterTransitY + 1);

        yPos += cardHeight + 3.5;
      });

      // Daily Sadhana & Upaya Box
      if (yPos + 32 > pageHeight - 22) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFillColor(248, 245, 237);
      doc.setDrawColor(201, 160, 80);
      doc.setLineWidth(0.4);
      doc.roundedRect(13, yPos, pageWidth - 26, 28, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(126, 95, 24);
      doc.text('LIFETIME VEDIC REMEDIES & DAILY SADHANA (PANCHA MAHABHUTA PACIFICATION)', 17, yPos + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.2);
      doc.setTextColor(60, 60, 60);
      doc.text(
        '• Primary Stotra: Recite Sri Vishnu Sahasranama or Sri Rudram during major planetary shifts and transits.',
        17,
        yPos + 10.5
      );
      doc.text(
        '• Navagraha Shanti: Offer water to the rising Sun (Arghya) and light pure cow-ghee diyas every evening.',
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

      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);

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

        doc.setDrawColor(201, 160, 80);
        doc.setLineWidth(1.1);
        doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
        doc.setLineWidth(0.35);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

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
          doc.text('ASTRO', 33, 20);
          doc.setTextColor(181, 131, 40);
          doc.text('JUNCTION', 33 + doc.getTextWidth('ASTRO') + 0.5, 20);

          doc.setFontSize(8.5);
          doc.setTextColor(126, 95, 24);
          doc.text('VEDIC DESTINY ROADMAP & LIFE BLUEPRINT (AVAILABLE: 0–15 YEARS)', 33, 24.5);

          doc.setFont('helvetica', 'italic');
          doc.setFontSize(7);
          doc.setTextColor(110, 105, 95);
          doc.text(
            `Synthesized through Vimshottari Mahadasha/Antardasha cycles & planetary transits (${new Date().getFullYear()} – ${new Date().getFullYear() + 15})`,
            33,
            28
          );
        } else {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(126, 95, 24);
          doc.text('ASTROJUNCTION • VEDIC DESTINY ROADMAP (0–15 YEARS)', 14, 14);
          doc.setDrawColor(226, 211, 176);
          doc.setLineWidth(0.3);
          doc.line(13, 16, pageWidth - 13, 16);
        }

        const footerY = pageHeight - 16;
        doc.setDrawColor(226, 211, 176);
        doc.setLineWidth(0.4);
        doc.line(13, footerY, pageWidth - 13, footerY);

        const now = new Date();
        const generatedTimestamp = `${now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.8);
        doc.setTextColor(110, 105, 95);
        doc.text(`Generated on: ${generatedTimestamp}`, 14, footerY + 5);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, footerY + 5, {
          align: 'right',
        });
      }

      doc.save(fileName);
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
              Vedic Destiny Roadmap
            </h1>
            <p className={`text-xs font-sans mt-1 leading-relaxed ${
              theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-600'
            }`}>
              Synthesized through your active Vimshottari Mahadasha/Antardasha cycles, major Saturn (Shani) and Jupiter (Guru) transits.
            </p>
          </div>

          <div className="flex items-center space-x-3 font-sans">
            <button
              onClick={() => {
                const targetHorizon = selectedHorizon || '0-5 Years';
                if (isHorizonLocked(targetHorizon)) {
                  onNavigateToConsultations && onNavigateToConsultations(getHorizonTierId(targetHorizon) || undefined);
                  return;
                }
                handleGenerateHorizon(targetHorizon);
              }}
              disabled={isGenerating}
              className={`flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition shadow-md cursor-pointer shrink-0 ${
                theme === 'dark'
                  ? 'bg-[#1A1A1E] hover:bg-[#25252A] text-[#C9A050] border-[#C9A050]/40'
                  : 'bg-white hover:bg-gray-50 text-[#96721E] border-[#C9A050]/40'
              } disabled:opacity-50`}
              title="Fetch/Refresh predictions via Filter API"
            >
              <Sparkles className={`w-3.5 h-3.5 text-[#C9A050] ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Fetching Predictions...' : 'Refresh Predictions'}</span>
            </button>

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
          </div>
        </div>

        {/* 1. Time Horizon Filters (Prominent Top Row with Free/Subscription Badges) */}
        <div className="flex flex-wrap gap-2 pt-4 font-sans">
          {horizons.map((hor) => {
            const isSelected = selectedHorizon === hor;
            const isFree = hor === '0-5 Years' || hor === '0-10 Years';
            const price = getHorizonPrice(hor);
            const isLocked = !isFree && isMilestoneLocked({ timeframe: hor } as any);

            return (
              <button
                key={hor}
                onClick={() => handleHorizonTabClick(hor)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 border shadow-sm ${
                  isSelected
                    ? 'bg-[#C9A050] text-[#0D0D0F] border-[#C9A050] font-bold shadow-md shadow-[#C9A050]/20'
                    : theme === 'dark'
                    ? 'bg-[#1A1A1E] text-[#9E9A90] hover:bg-[#2A2A2E] hover:text-[#F0ECE1] border-[#2A2A2E]'
                    : 'bg-white text-gray-700 hover:bg-gray-100 hover:text-black border-[#E5E1D8]'
                }`}
              >
                <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-[#0D0D0F]' : 'text-[#C9A050]'}`} />
                <span>{hor}</span>
                {isFree ? (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                    isSelected ? 'bg-black/20 text-[#0D0D0F]' : 'bg-emerald-500/15 text-emerald-500'
                  }`}>
                    Free
                  </span>
                ) : (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                    isSelected ? 'bg-black/20 text-[#0D0D0F]' : 'bg-[#C9A050]/20 text-[#C9A050]'
                  }`}>
                    {isLocked ? `₹${price}` : '✓ Active'}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 2. Life Spheres / Categories (Compact Flex-Wrap Row without Scrollbar) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2.5 text-xs font-sans">
          <span className={`text-[11px] shrink-0 font-medium mr-1 ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
            Life Spheres:
          </span>
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  const nextCat = isSelected ? null : cat.id;
                  setSelectedCategory(nextCat);
                  if (!selectedHorizon) {
                    setSelectedHorizon('0-5 Years');
                    handleGenerateHorizon('0-5 Years');
                  }
                }}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition cursor-pointer flex items-center space-x-1 border ${
                  isSelected
                    ? 'bg-[#C9A050]/20 text-[#C9A050] border-[#C9A050]/50 font-semibold'
                    : theme === 'dark'
                    ? 'bg-[#1A1A1E]/60 text-[#9E9A90] hover:text-[#F0ECE1] border-[#2A2A2E]'
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
      <div className="space-y-4">
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
        ) : !selectedHorizon ? (
          <div className={`border rounded-xl p-16 sm:p-24 flex flex-col items-center justify-center min-h-[340px] text-center shadow-xl space-y-4 ${
            theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-white border-[#E5E1D8]'
          }`}>
            <h3 className={`font-serif font-bold text-base sm:text-lg ${
              theme === 'dark' ? 'text-[#F0ECE1]' : 'text-gray-900'
            }`}>
              Select a Time Horizon
            </h3>
            <p className={`text-xs font-sans max-w-sm mx-auto ${
              theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-500'
            }`}>
              Please select a time horizon and a life sphere from the filters above to generate your Vedic Destiny Roadmap.
            </p>
            <button
              onClick={() => handleHorizonTabClick('0-5 Years')}
              className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A050] to-[#A07828] hover:from-[#D4AF37] hover:to-[#B38730] text-[#0D0D0F] font-bold text-xs shadow-lg shadow-[#C9A050]/20 transition cursor-pointer flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore 0-5 Years Roadmap</span>
            </button>
          </div>
        ) : isHorizonLocked(selectedHorizon) ? (
          <div className={`border rounded-2xl p-8 sm:p-14 relative overflow-hidden shadow-2xl text-center space-y-6 animate-in fade-in duration-300 ${
            theme === 'dark'
              ? 'bg-gradient-to-b from-[#18181D] via-[#141418] to-[#0F0F12] border-[#C9A050]/40'
              : 'bg-gradient-to-b from-[#FFFDF9] via-[#FAF7F0] to-[#F5EFEB] border-[#C9A050]/50'
          }`}>
            {/* Background Ambient Glow */}
            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#C9A050]/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-[#A07828]/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-5">
              {/* Badge & Sacred Icon */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#C9A050]/15 border border-[#C9A050]/40 text-[#C9A050] text-xs font-semibold uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5" />
                <span>Subscription Required • Premium Horizon</span>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h2 className={`font-serif font-bold text-2xl sm:text-3xl ${
                  theme === 'dark' ? 'text-[#F0ECE1]' : 'text-gray-900'
                }`}>
                  Unlock {selectedHorizon} Vedic Destiny Roadmap
                </h2>
                <p className={`text-xs sm:text-sm font-sans max-w-lg mx-auto ${
                  theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-600'
                }`}>
                  To access multi-decade predictive insights, deep Vimshottari Mahadasha shifts, Saturn Sade Sati / Kantaka Shani, and planetary transit remedies for {selectedHorizon}, please unlock this subscription tier.
                </p>
              </div>

              {/* Features List */}
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 text-left p-5 rounded-xl border ${
                theme === 'dark' ? 'bg-[#1A1A1E]/80 border-[#2A2A2E]' : 'bg-white/80 border-[#E5E1D8]'
              }`}>
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A050] shrink-0 mt-0.5" />
                  <span className={`text-xs font-sans ${theme === 'dark' ? 'text-[#D0CCC2]' : 'text-gray-700'}`}>
                    All 8 Life Spheres (Career, Wealth, Love, Family, Health, Education, Travel, Spirituality)
                  </span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A050] shrink-0 mt-0.5" />
                  <span className={`text-xs font-sans ${theme === 'dark' ? 'text-[#D0CCC2]' : 'text-gray-700'}`}>
                    Vimshottari Dasha &amp; Antardasha Timeline Breakdown
                  </span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A050] shrink-0 mt-0.5" />
                  <span className={`text-xs font-sans ${theme === 'dark' ? 'text-[#D0CCC2]' : 'text-gray-700'}`}>
                    Saturn Gochara (Sade Sati) &amp; Jupiter (Guru) Transits
                  </span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A050] shrink-0 mt-0.5" />
                  <span className={`text-xs font-sans ${theme === 'dark' ? 'text-[#D0CCC2]' : 'text-gray-700'}`}>
                    Full Printable Vedic Destiny Roadmap (PDF Report)
                  </span>
                </div>
              </div>

              {/* Price & CTA Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => onNavigateToConsultations && onNavigateToConsultations(getHorizonTierId(selectedHorizon) || undefined)}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-[#C9A050] via-[#D4AF37] to-[#A07828] hover:from-[#D4AF37] hover:to-[#B38730] text-[#0D0D0F] font-bold text-sm shadow-xl shadow-[#C9A050]/25 transition transform hover:scale-[1.02] cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Subscribe {selectedHorizon} • ₹{getHorizonPrice(selectedHorizon)}</span>
                </button>

                {selectedHorizon !== '0-25 Years' && (
                  <button
                    onClick={() => onNavigateToConsultations && onNavigateToConsultations('roadmap_25_subscription')}
                    className={`w-full sm:w-auto px-6 py-3 rounded-xl border font-bold text-xs sm:text-sm transition cursor-pointer flex items-center justify-center space-x-2 ${
                      theme === 'dark'
                        ? 'border-[#C9A050]/50 text-[#C9A050] hover:bg-[#C9A050]/10'
                        : 'border-[#C9A050] text-[#96721E] hover:bg-[#C9A050]/10'
                    }`}
                  >
                    <span>Unlock All Horizons (Up to 25 Years) • ₹249</span>
                  </button>
                )}
              </div>

              {/* Return to Free horizons */}
              <div className="pt-2">
                <button
                  onClick={() => handleHorizonTabClick('0-5 Years')}
                  className={`text-xs font-medium underline underline-offset-4 transition cursor-pointer ${
                    theme === 'dark' ? 'text-[#9E9A90] hover:text-[#F0ECE1]' : 'text-gray-500 hover:text-black'
                  }`}
                >
                  ← Return to Free 0-5 Years &amp; 0-10 Years Roadmap
                </button>
              </div>
            </div>
          </div>
        ) : filteredRoadmap.length > 0 || generatedHorizons[selectedHorizon] ? (
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
                    isLockedCategory 
                      ? 'border-[#C9A050]/40' 
                      : theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'
                  }`}
                >
                  {isLockedCategory && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] transition duration-300 p-6 text-center">
                      <div className="w-12 h-12 rounded-full bg-black/80 border border-[#C9A050]/50 flex items-center justify-center mb-3 shadow-lg shadow-[#C9A050]/20">
                        <span className="text-[#C9A050] text-xl font-bold">🔒</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-serif font-bold text-[#F0ECE1] mb-1">
                        Unlock {item.timeframe} Roadmap
                      </h3>
                      <p className="text-xs text-[#9E9A90] font-sans max-w-sm mb-3.5">
                        Subscription required to access all 8 life spheres, Mahadasha cycles &amp; transit upayas for {item.timeframe}.
                      </p>
                      <button 
                        onClick={() => onNavigateToConsultations && onNavigateToConsultations(getHorizonTierId(item.timeframe) || undefined)} 
                        className="px-6 py-2.5 bg-gradient-to-r from-[#C9A050] to-[#A07828] hover:from-[#D4AF37] hover:to-[#B38730] text-[#0D0D0F] font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-[#C9A050]/25 cursor-pointer transition flex items-center space-x-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Unlock {item.timeframe} • ₹{getHorizonPrice(item.timeframe)}</span>
                      </button>
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
                        <h3 className={`text-base font-serif font-bold ${
                          theme === 'dark' ? 'text-[#F0ECE1]' : 'text-gray-900'
                        }`}>
                          {item.title}
                        </h3>
                      </div>
                    </div>

                    {/* Guidance & Favorable Transits */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                      <div className={`p-4 rounded-xl border space-y-1.5 flex flex-col ${
                        theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
                      }`}>
                        <span className="text-[9px] uppercase font-bold text-[#C9A050] block tracking-wider">
                          Dasha & Life Strategy Guidance
                        </span>
                        <p className={`leading-relaxed text-xs ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-gray-800'}`}>
                          {item.guidance}
                        </p>
                      </div>

                      <div className="space-y-3 flex flex-col justify-between">
                        {/* Highlighted Astrological Window & Transits Card */}
                        <div className={`p-4 rounded-xl border border-l-4 border-l-[#C9A050] transition shadow-sm ${
                          theme === 'dark' 
                            ? 'bg-gradient-to-br from-[#C9A050]/15 via-[#1A1A1E] to-[#1A1A1E] border-[#C9A050]/40 shadow-[#C9A050]/5' 
                            : 'bg-gradient-to-br from-[#FFF8E7] via-[#FFFDF8] to-[#FAF6ED] border-[#E8DFC8] shadow-[#C9A050]/15'
                        }`}>
                          <div className="flex items-start space-x-2.5">
                            <div className="w-5 h-5 rounded-md bg-[#C9A050]/20 flex items-center justify-center shrink-0 mt-0.5 border border-[#C9A050]/40">
                              <Clock className="w-3 h-3 text-[#B38730] dark:text-[#C9A050]" />
                            </div>
                            <div className="space-y-1 flex-1 min-w-0">
                              <span className="text-[10px] uppercase font-black block tracking-wider text-[#966C1E] dark:text-[#C9A050]">
                                Astrological Window &amp; Transits
                              </span>
                              <p className={`text-xs leading-relaxed font-medium pt-0.5 ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-gray-900'}`}>
                                {item.favorableTransits}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Recommended Upaya / Sadhana Card */}
                        <div className={`p-3.5 rounded-xl border flex items-start space-x-2.5 transition ${
                          theme === 'dark' 
                            ? 'bg-[#1A1A1E] border-[#2A2A2E]' 
                            : 'bg-[#F9F7F1] border-[#E5E1D8]'
                        }`}>
                          <div className="w-5 h-5 rounded-md bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
                            <Flame className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="space-y-1 flex-1 min-w-0">
                            <span className={`text-[9px] uppercase font-bold block tracking-wider ${
                              theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-500'
                            }`}>
                              Recommended Upaya / Sadhana
                            </span>
                            <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-gray-800'}`}>
                              {item.remedialAction}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        ) : null}
      </div>
    </div>
  );
};
