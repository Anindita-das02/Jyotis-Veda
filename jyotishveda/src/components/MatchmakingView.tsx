import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
  HeartHandshake,
  Sparkles,
  Download,
  Printer,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Dna,
  Heart,
  Compass,
  Star,
  Calendar,
  Clock,
  MapPin,
  User,
  RefreshCw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Layers,
  Award,
  Zap,
  Info,
  Sliders,
  CloudUpload,
  Loader2,
  X,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { UserProfile, AshtaKootaMilanResult, KootaItem } from '../types';
import { VedicDatePicker } from './VedicDatePicker';
import { VedicTimePicker } from './VedicTimePicker';
import { calculateKundliMilan, PRESET_MATCHMAKING_COUPLES, calculateVedicChart, calculateNumerology } from '../services/astroEngine';
import { MatchReportSummary, MatchReportFull, saveMatchReport, listMatchReports, fetchMatchReport, getMatchReportPdfUrl } from '../services/matchmakingApi';
import { getTranslation } from '../services/translations';
import { API_ENDPOINTS } from '../config/api_config';
import { ApiError, API_BASE_URL } from '../services/api';

interface MatchmakingViewProps {
  currentProfile: UserProfile;
  profiles: UserProfile[];
  language?: string;
  isAuthenticated?: boolean;
  theme?: 'light' | 'dark';
}

const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-');
    if (!y || !m || !d) return dateStr;
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

const formatDisplayTime = (timeStr: string) => {
  if (!timeStr) return '';
  try {
    const [h, m] = timeStr.split(':');
    if (h === undefined || m === undefined) return timeStr;
    let hour = parseInt(h);
    const minute = m.slice(0, 2);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute.padStart(2, '0')} ${ampm}`;
  } catch {
    return timeStr;
  }
};

export const MatchmakingView: React.FC<MatchmakingViewProps> = ({
  currentProfile,
  profiles,
  language = 'en',
  isAuthenticated,
  theme = 'dark',
}) => {
  const profileId = currentProfile?.id || 'default';
  const storageKey = `jyotish_matchmaking_state_${profileId}`;
  const historyKey = `jyotish_matchmaking_history_${profileId}`;

  // Default templates for Partner 1 and Partner 2
  const getDefaultP1 = (): UserProfile => ({
    id: 'p1',
    fullName: '',
    gender: 'male',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    latitude: 22.5726,
    longitude: 88.3639,
    timezone: 5.5,
    horoscopeSystem: 'vedic',
    focusAreas: ['relationships'],
    createdAt: new Date().toISOString(),
  });

  const getDefaultP2 = (): UserProfile => ({
    id: 'p2',
    fullName: '',
    gender: 'female',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 5.5,
    horoscopeSystem: 'vedic',
    focusAreas: ['relationships'],
    createdAt: new Date().toISOString(),
  });

  // Select partner 1 and partner 2 (Clean default state on load/refresh)
  const [partner1, setPartner1] = useState<UserProfile>(getDefaultP1());
  const [partner2, setPartner2] = useState<UserProfile>(getDefaultP2());

  const [isP1Saved, setIsP1Saved] = useState<boolean>(false);
  const [isP2Saved, setIsP2Saved] = useState<boolean>(false);
  const [isCalculatingMilan, setIsCalculatingMilan] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const [matchResult, setMatchResult] = useState<AshtaKootaMilanResult | null>(null);

  const [expandedKoota, setExpandedKoota] = useState<string | null>('nadi');
  const [activeTab, setActiveTab] = useState<'kootas' | 'doshas' | 'synastry' | 'remedies' | 'ai_counsel' | 'download'>('kootas');

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSynthesis, setAiSynthesis] = useState<any | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedReportId, setSavedReportId] = useState<string | null>(null);

  // Saved Matches History Modal & List
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [savedMatches, setSavedMatches] = useState<any[]>(() => {
    try {
      const rawHist = localStorage.getItem(historyKey);
      return rawHist ? JSON.parse(rawHist) : [];
    } catch {
      return [];
    }
  });

  // When profile switches, reset to clean form and load profile history
  useEffect(() => {
    setPartner1(getDefaultP1());
    setPartner2(getDefaultP2());
    setIsP1Saved(false);
    setIsP2Saved(false);
    setMatchResult(null);
    setAiSynthesis(null);

    try {
      const rawHist = localStorage.getItem(historyKey);
      setSavedMatches(rawHist ? JSON.parse(rawHist) : []);
    } catch {
      setSavedMatches([]);
    }
  }, [profileId, historyKey]);

  // Auto-scroll down smoothly to the Generate button when both partners are saved
  useEffect(() => {
    if (isP1Saved && isP2Saved && partner1.birthDate && partner2.birthDate && !matchResult) {
      const scrollTimer = setTimeout(() => {
        const generateSection = document.getElementById('generate-milan-section');
        if (generateSection) {
          generateSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
      return () => clearTimeout(scrollTimer);
    }
  }, [isP1Saved, isP2Saved, partner1.birthDate, partner2.birthDate, matchResult]);

  // Save calculated result to history list
  const saveToHistoryList = (result: AshtaKootaMilanResult, p1: UserProfile, p2: UserProfile) => {
    try {
      const matchId = `match_${Date.now()}`;
      const record = {
        id: matchId,
        partner1Name: p1.fullName || 'Partner 1',
        partner1BirthDate: p1.birthDate,
        partner2Name: p2.fullName || 'Partner 2',
        partner2BirthDate: p2.birthDate,
        totalScore: result.totalPoints,
        maxScore: result.maxPoints,
        percentage: result.percentage,
        verdictTitle: result.verdictTitle,
        createdAt: new Date().toISOString(),
        partner1: p1,
        partner2: p2,
        result: result,
      };

      setSavedMatches((prev) => {
        // Filter out duplicate if same pair
        const filtered = prev.filter(
          (m) => !(m.partner1Name === record.partner1Name && m.partner2Name === record.partner2Name)
        );
        const updated = [record, ...filtered].slice(0, 20); // Keep latest 20
        localStorage.setItem(historyKey, JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      console.warn('Failed to save match to history:', e);
    }
  };

  // Reset / Start New Match
  const handleNewMatch = () => {
    setPartner1(getDefaultP1());
    setPartner2(getDefaultP2());
    setIsP1Saved(false);
    setIsP2Saved(false);
    setMatchResult(null);
    setAiSynthesis(null);
  };

  // Load a match from history into the UI with full-page cosmic loader & auto-scroll
  const handleLoadFromHistory = (item: any) => {
    if (item.partner1 && item.partner2) {
      setPartner1(item.partner1);
      setPartner2(item.partner2);
      setIsP1Saved(true);
      setIsP2Saved(true);
      setIsHistoryModalOpen(false);
      triggerMilanCalculation(item.partner1, item.partner2);
    }
  };

  // Delete a match record from history
  const handleDeleteFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedMatches.filter((m) => m.id !== id);
    setSavedMatches(updated);
    try {
      localStorage.setItem(historyKey, JSON.stringify(updated));
    } catch {}
  };

  const handleSaveMatchReport = async () => {
    if (!matchResult) return;
    setSaveState('saving');
    setSaveError(null);
    try {
      saveToHistoryList(matchResult, partner1, partner2);
      if (isAuthenticated) {
        const saved = await saveMatchReport(matchResult);
        if (saved && saved.id) {
          setSavedReportId(saved.id);
        }
      }
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 3000);
    } catch (err: any) {
      console.error('Failed to save match report to server:', err);
      setSaveState('error');
      const errorMsg = err instanceof ApiError ? err.message : (err?.message || 'Could not save report to server.');
      setSaveError(errorMsg);
    }
  };

  const printableRef = useRef<HTMLDivElement>(null);
  const t = (key: string) => getTranslation(key, language);
  const calculationTimerRef = useRef<NodeJS.Timeout[]>([]);

  // Recalculate match with cosmic celestial loader animation
  const triggerMilanCalculation = (p1: UserProfile = partner1, p2: UserProfile = partner2) => {
    if (!p1.birthDate || !p2.birthDate) {
      return;
    }

    // Clear any previous running timers
    calculationTimerRef.current.forEach((timer) => clearTimeout(timer));
    calculationTimerRef.current = [];

    setIsCalculatingMilan(true);
    setLoadingStep(0);
    setMatchResult(null);

    const t1 = setTimeout(() => {
      setLoadingStep(1);
    }, 300);

    const t2 = setTimeout(() => {
      setLoadingStep(2);
    }, 600);

    const t3 = setTimeout(() => {
      try {
        const result = calculateKundliMilan(p1, p2);
        setMatchResult(result);
        setAiSynthesis(null);
        saveToHistoryList(result, p1, p2);

        // Auto-fetch AI relationship synthesis in background
        handleGenerateAISynthesis(result, p1, p2);

        // Smooth scroll to score hero results
        setTimeout(() => {
          const resultsEl = document.getElementById('kundli-milan-results');
          if (resultsEl) {
            resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 50);
      } catch (err) {
        console.error('Error calculating Kundli Milan:', err);
      } finally {
        setIsCalculatingMilan(false);
      }
    }, 900);

    calculationTimerRef.current = [t1, t2, t3];
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      calculationTimerRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  // Generate AI deep synthesis
  const handleGenerateAISynthesis = async (
    customResult?: AshtaKootaMilanResult | null,
    p1: UserProfile = partner1,
    p2: UserProfile = partner2
  ) => {
    const resToUse = customResult || matchResult;
    if (!resToUse || !p1.birthDate || !p2.birthDate) return;

    setIsGeneratingAI(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/matchmaking/synthesis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner1: p1,
          partner2: p2,
          matchResult: resToUse,
          language,
        }),
      });
      const data = await response.json();
      if ((data.success || data.status === 'success') && data.synthesis) {
        let synth = data.synthesis;
        if (typeof synth === 'string') {
          try {
            synth = JSON.parse(synth);
          } catch {
            // Keep as raw string if it's pure markdown
          }
        }
        setAiSynthesis(synth);
      } else {
        throw new Error(data.message || 'Failed to generate synthesis');
      }
    } catch (err) {
      console.error('Failed to generate AI Kundli Milan synthesis:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // If user opens AI Counsel tab and synthesis is not yet generated, auto-fetch it
  useEffect(() => {
    if (activeTab === 'ai_counsel' && !aiSynthesis && !isGeneratingAI && matchResult) {
      handleGenerateAISynthesis(matchResult, partner1, partner2);
    }
  }, [activeTab, aiSynthesis, isGeneratingAI, matchResult, partner1, partner2]);

  const handleCopyAISynthesis = () => {
    if (!aiSynthesis) return;
    let textToCopy = '';
    if (typeof aiSynthesis === 'object') {
      textToCopy = `JYOTISHVEDA • AI RELATIONSHIP SYNTHESIS\n` +
        `Partner 1: ${partner1.fullName || 'Partner 1'} | Partner 2: ${partner2.fullName || 'Partner 2'}\n\n` +
        (aiSynthesis.overall_compatibility ? `OVERALL COMPATIBILITY:\n${aiSynthesis.overall_compatibility}\n\n` : '') +
        (aiSynthesis.guna_milan ? `GUNA MILAN:\n${aiSynthesis.guna_milan}\n\n` : '') +
        (aiSynthesis.manglik_dosha ? `MANGLIK DOSHA:\n${aiSynthesis.manglik_dosha}\n\n` : '') +
        (aiSynthesis.nadi_analysis ? `NADI ANALYSIS:\n${aiSynthesis.nadi_analysis}\n\n` : '') +
        (aiSynthesis.bhakoot_analysis ? `BHAKOOT ANALYSIS:\n${aiSynthesis.bhakoot_analysis}\n\n` : '') +
        (aiSynthesis.psychological_affinity ? `PSYCHOLOGICAL AFFINITY:\n${aiSynthesis.psychological_affinity}\n\n` : '') +
        (aiSynthesis.emotional_resonance ? `EMOTIONAL RESONANCE:\n${aiSynthesis.emotional_resonance}\n\n` : '') +
        (aiSynthesis.karmic_bond ? `KARMIC BOND:\n${aiSynthesis.karmic_bond}\n\n` : '') +
        (aiSynthesis.physical_harmonization ? `PHYSICAL HARMONIZATION:\n${aiSynthesis.physical_harmonization}\n\n` : '') +
        (aiSynthesis.family_and_married_life ? `FAMILY & MARRIED LIFE:\n${aiSynthesis.family_and_married_life}\n\n` : '') +
        (aiSynthesis.wealth_and_prosperity ? `WEALTH & PROSPERITY:\n${aiSynthesis.wealth_and_prosperity}\n\n` : '') +
        (Array.isArray(aiSynthesis.major_strengths) ? `MAJOR STRENGTHS:\n${aiSynthesis.major_strengths.map((s: string) => `• ${s}`).join('\n')}\n\n` : '') +
        (Array.isArray(aiSynthesis.major_challenges) ? `POTENTIAL CHALLENGES:\n${aiSynthesis.major_challenges.map((s: string) => `• ${s}`).join('\n')}\n\n` : '') +
        (Array.isArray(aiSynthesis.conflict_resolution) ? `CONFLICT RESOLUTION:\n${aiSynthesis.conflict_resolution.map((s: string) => `• ${s}`).join('\n')}\n\n` : '') +
        (Array.isArray(aiSynthesis.vedic_remedies) ? `VEDIC REMEDIES:\n${aiSynthesis.vedic_remedies.map((s: string) => `• ${s}`).join('\n')}\n\n` : '') +
        (aiSynthesis.final_assessment ? `FINAL ASSESSMENT:\n${aiSynthesis.final_assessment}\n` : '');
    } else {
      textToCopy = String(aiSynthesis);
    }
    navigator.clipboard.writeText(textToCopy);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

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

  // Direct High-Res PDF Generation & Download via Backend API (with client fallback)
  const handleDownloadPDF = async () => {
    if (!matchResult) return;
    setIsGeneratingPdf(true);

    const cleanP1 = (partner1.fullName || 'Partner1').trim().replace(/\s+/g, '_');
    const cleanP2 = (partner2.fullName || 'Partner2').trim().replace(/\s+/g, '_');
    const fileName = `Kundli_Milan_${cleanP1}_and_${cleanP2}.pdf`;

    try {
      // 1. Hit Backend Python API for direct PDF generation & streaming
      const response = await fetch(`${API_BASE_URL}/api/matchmaking/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partner1_name: partner1.fullName || 'Person A',
          partner1_birth_date: partner1.birthDate || '',
          partner1_birth_time: partner1.birthTime || '',
          partner1_birth_place: partner1.birthPlace || '',
          partner2_name: partner2.fullName || 'Person B',
          partner2_birth_date: partner2.birthDate || '',
          partner2_birth_time: partner2.birthTime || '',
          partner2_birth_place: partner2.birthPlace || '',
          total_score: matchResult.totalPoints,
          max_score: 36,
          manglik_status: matchResult.manglik.verdict,
          report_json: {
            ...matchResult,
            ai_synthesis: aiSynthesis,
          },
          ai_synthesis: aiSynthesis,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
        return;
      }
      throw new Error(`Backend PDF API responded with status ${response.status}`);
    } catch (backendErr) {
      console.warn('Backend API PDF generation fallback to client jsPDF:', backendErr);

      // 2. High-speed vector jsPDF fallback with Full Page Sage Watermark & Website Logo
      try {
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
        const pageHeight = doc.internal.pageSize.getHeight(); // 297mm

        // Background canvas fill
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');

        // 1. Draw Full Page Background Watermark Image of the Meditating Astrologer / Sage
        try {
          const bgBase64 = await loadImageBase64('/astrologer_bg.jpg');
          if (bgBase64) {
            try {
              if (typeof (doc as any).setGState === 'function' && (doc as any).GState) {
                (doc as any).setGState(new (doc as any).GState({ opacity: 0.09 }));
              }
            } catch {}
            doc.addImage(bgBase64, 'JPEG', 0, 0, pageWidth, pageHeight);
            try {
              if (typeof (doc as any).setGState === 'function' && (doc as any).GState) {
                (doc as any).setGState(new (doc as any).GState({ opacity: 1.0 }));
              }
            } catch {}
          }
        } catch {}

        // Outer Decorative Golden Double Border
        doc.setDrawColor(201, 160, 80);
        doc.setLineWidth(1.2);
        doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
        doc.setLineWidth(0.4);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

        // Corner decorative gold dots
        doc.setFillColor(201, 160, 80);
        doc.circle(10, 10, 1.2, 'F');
        doc.circle(pageWidth - 10, 10, 1.2, 'F');
        doc.circle(10, pageHeight - 10, 1.2, 'F');
        doc.circle(pageWidth - 10, pageHeight - 10, 1.2, 'F');

        // Header Brand & Logo Emblem (Matching Image 2)
        try {
          const logoBase64 = await loadImageBase64('/jyotishveda_logo.png');
          if (logoBase64) {
            doc.addImage(logoBase64, 'PNG', 14, 13, 16, 16);
          }
        } catch {}

        // Brand Title "JYOTISH" (black) + "VEDA" (gold)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(17, 17, 17);
        doc.text('JYOTISH', 33, 20);
        doc.setTextColor(181, 131, 40);
        doc.text('VEDA', 33 + doc.getTextWidth('JYOTISH') + 0.5, 20);

        doc.setFontSize(8.5);
        doc.setTextColor(126, 95, 24);
        doc.text('VEDIC KUNDLI MILAN & ASHTA KOOTA COMPATIBILITY CERTIFICATE', 33, 24.5);

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.setTextColor(100, 95, 85);
        doc.text('Calculated in accordance with Brihat Parashara Hora Shastra & Classical Jyotish Sutras', 33, 28);

        // Couple Information Box
        doc.setFillColor(252, 249, 242);
        doc.setDrawColor(226, 211, 176);
        doc.setLineWidth(0.4);
        doc.roundedRect(13, 33, pageWidth - 26, 25, 2, 2, 'FD');
        doc.line(pageWidth / 2, 33, pageWidth / 2, 58);

        // Groom (Partner 1)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(126, 95, 24);
        doc.text('GROOM / PARTNER A', 17, 39);
        doc.setFontSize(11);
        doc.setTextColor(26, 26, 30);
        doc.text(partner1.fullName || 'Person A', 17, 45);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(80, 80, 80);
        const p1Info = `Born: ${partner1.birthDate || 'N/A'}${partner1.birthTime ? ` at ${partner1.birthTime}` : ''}${partner1.birthPlace ? `, ${partner1.birthPlace}` : ''}`;
        doc.text(doc.splitTextToSize(p1Info, (pageWidth - 36) / 2)[0] || '', 17, 50.5);

        // Bride (Partner 2)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(126, 95, 24);
        doc.text('BRIDE / PARTNER B', pageWidth / 2 + 5, 39);
        doc.setFontSize(11);
        doc.setTextColor(26, 26, 30);
        doc.text(partner2.fullName || 'Person B', pageWidth / 2 + 5, 45);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(80, 80, 80);
        const p2Info = `Born: ${partner2.birthDate || 'N/A'}${partner2.birthTime ? ` at ${partner2.birthTime}` : ''}${partner2.birthPlace ? `, ${partner2.birthPlace}` : ''}`;
        doc.text(doc.splitTextToSize(p2Info, (pageWidth - 36) / 2)[0] || '', pageWidth / 2 + 5, 50.5);

        // Score & Verdict Highlight Box
        doc.setFillColor(254, 250, 240);
        doc.setDrawColor(201, 160, 80);
        doc.setLineWidth(0.6);
        doc.roundedRect(13, 62, pageWidth - 26, 26, 2, 2, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(126, 95, 24);
        doc.text('TOTAL COMPATIBILITY SCORE', pageWidth / 2, 68, { align: 'center' });

        doc.setFontSize(18);
        doc.setTextColor(126, 95, 24);
        doc.text(`${matchResult.totalPoints} / 36 Gunas (${matchResult.percentage}%)`, pageWidth / 2, 75.5, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(26, 26, 30);
        doc.text(matchResult.verdictTitle.toUpperCase(), pageWidth / 2, 81, { align: 'center' });

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7.8);
        doc.setTextColor(90, 85, 75);
        const summaryLines = doc.splitTextToSize(`"${matchResult.summary}"`, pageWidth - 36);
        doc.text(summaryLines.slice(0, 1), pageWidth / 2, 85.5, { align: 'center' });

        // 8 Kootas Table Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(126, 95, 24);
        doc.text('ASHTA KOOTA POINTS BREAKDOWN', 13, 93.5);

        // Table Column Headers
        doc.setFillColor(243, 236, 218);
        doc.rect(13, 96, pageWidth - 26, 6.5, 'F');
        doc.setFontSize(8);
        doc.setTextColor(126, 95, 24);
        doc.text('Koota', 15, 100.5);
        doc.text('Significance', 48, 100.5);
        doc.text(partner1.fullName ? partner1.fullName.split(' ')[0] : 'P1', 118, 100.5, { align: 'center' });
        doc.text(partner2.fullName ? partner2.fullName.split(' ')[0] : 'P2', 153, 100.5, { align: 'center' });
        doc.text('Points', pageWidth - 15, 100.5, { align: 'right' });

        // Table Rows
        let startY = 108;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);

        matchResult.kootas.forEach((k, idx) => {
          const rowY = startY + idx * 7.5;
          if (idx % 2 === 1) {
            doc.setFillColor(252, 250, 245);
            doc.rect(13, rowY - 5, pageWidth - 26, 7.5, 'F');
          }
          doc.setDrawColor(229, 220, 190);
          doc.setLineWidth(0.3);
          doc.line(13, rowY + 2.5, pageWidth - 13, rowY + 2.5);

          doc.setFont('helvetica', 'bold');
          doc.setTextColor(26, 26, 30);
          doc.text(`${k.name}`, 15, rowY);

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(90, 85, 76);
          doc.text(k.area.slice(0, 36), 48, rowY);
          doc.text(String(k.p1Value || '-'), 118, rowY, { align: 'center' });
          doc.text(String(k.p2Value || '-'), 153, rowY, { align: 'center' });

          doc.setFont('helvetica', 'bold');
          doc.setTextColor(126, 95, 24);
          doc.text(`${k.obtainedPoints} / ${k.maxPoints}`, pageWidth - 15, rowY, { align: 'right' });
        });

        // Dosha & Vitality Assessment Section
        const doshaStartY = startY + 8 * 7.5 + 4;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(126, 95, 24);
        doc.text('CRITICAL DOSHA & VITALITY ASSESSMENT', 13, doshaStartY);

        // Dosha Boxes
        const boxWidth = (pageWidth - 30) / 2;
        doc.setFillColor(250, 247, 240);
        doc.setDrawColor(226, 211, 176);
        doc.roundedRect(13, doshaStartY + 2.5, boxWidth, 23, 2, 2, 'FD');
        doc.roundedRect(13 + boxWidth + 4, doshaStartY + 2.5, boxWidth, 23, 2, 2, 'FD');

        // Manglik box
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(26, 26, 30);
        doc.text('Manglik (Kuja) Dosha:', 17, doshaStartY + 7.5);
        doc.setFontSize(7.8);
        doc.setTextColor(126, 95, 24);
        doc.text(`Verdict: ${matchResult.manglik.verdict}`, 17, doshaStartY + 12);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(80, 80, 80);
        const manglikExp = doc.splitTextToSize(matchResult.manglik.explanation, boxWidth - 8);
        doc.text(manglikExp.slice(0, 2), 17, doshaStartY + 16.5);

        // Nadi & Bhakoot box
        const rightBoxX = 13 + boxWidth + 4;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(26, 26, 30);
        doc.text('Nadi & Bhakoot Vitality:', rightBoxX + 4, doshaStartY + 7.5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(80, 80, 80);
        const nadiText = doc.splitTextToSize(`Nadi: ${matchResult.nadiDosha.reason}. Bhakoot: ${matchResult.bhakootDosha.reason}.`, boxWidth - 8);
        doc.text(nadiText.slice(0, 3), rightBoxX + 4, doshaStartY + 12.5);

        // Remedies Section
        const remedyY = doshaStartY + 28.5;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(126, 95, 24);
        doc.text('AUSPICIOUS VEDIC REMEDIES & GUIDANCE', 13, remedyY);

        doc.setFillColor(254, 252, 247);
        doc.setDrawColor(201, 160, 80);
        doc.roundedRect(13, remedyY + 2.5, pageWidth - 26, 21, 2, 2, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.2);
        doc.setTextColor(126, 95, 24);
        doc.text('AUSPICIOUS VEDIC REMEDIES & GUIDANCE', 17, remedyY + 7.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.8);
        doc.setTextColor(60, 60, 60);
        const remediesText = matchResult.remedies.slice(0, 3).map((r, i) => `${i + 1}. ${r}`);
        remediesText.forEach((rem, i) => {
          doc.text(rem, 17, remedyY + 12 + i * 4);
        });

        // Certificate Footer & Authentication Seal (Raised up cleanly)
        const footerY = pageHeight - 19;
        doc.setDrawColor(226, 211, 176);
        doc.setLineWidth(0.5);
        doc.line(13, footerY, pageWidth - 13, footerY);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text(`Certificate ID: JV-KM-${Date.now().toString(36).toUpperCase()}`, 14, footerY + 4.5);
        doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, footerY + 8);
        doc.text('Certified via JyotishVeda Mathematical AstroEngine & Classical Ephemeris', 14, footerY + 11.5);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(126, 95, 24);
        doc.text('DAIVAJNA ASTROLOGICAL SEAL', pageWidth - 14, footerY + 4.5, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(120, 120, 120);
        doc.text('Digitally Verified & Certified', pageWidth - 14, footerY + 8, { align: 'right' });

        doc.save(fileName);
      } catch (clientErr) {
        console.error('Fatal PDF generation error:', clientErr);
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Trigger browser print for certificate fallback
  const handlePrintCertificate = () => {
    handleDownloadPDF();
  };

  // Download JSON dossier
  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(matchResult, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `JyotishVeda_Kundli_Milan_${partner1.fullName.replace(/\s+/g, '_')}_and_${partner2.fullName.replace(/\s+/g, '_')}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Download Text Report
  const handleDownloadTextReport = () => {
    const textContent = `===================================================================
JYOTISHVEDA • SACRED VEDIC ASHTA KOOTA MATCHMAKING DOSSIER
===================================================================
Calculated On: ${new Date(matchResult.calculatedAt).toLocaleString()}
Horoscope Tradition: Vedic Sidereal (Nirayana) & Multi-Tradition Synthesis

PARTNER 1 (Groom / Person A):
Name: ${partner1.fullName} (${partner1.gender.toUpperCase()})
Birth: ${partner1.birthDate} at ${partner1.birthTime}
Place: ${partner1.birthPlace} (Lat: ${partner1.latitude}, Long: ${partner1.longitude})

PARTNER 2 (Bride / Person B):
Name: ${partner2.fullName} (${partner2.gender.toUpperCase()})
Birth: ${partner2.birthDate} at ${partner2.birthTime}
Place: ${partner2.birthPlace} (Lat: ${partner2.latitude}, Long: ${partner2.longitude})

-------------------------------------------------------------------
MATCH SUMMARY & ASHTA KOOTA SCORE:
Total Gunas Matched: ${matchResult.totalPoints} / 36 Points (${matchResult.percentage}%)
Verdict: ${matchResult.verdictTitle}
Summary: ${matchResult.summary}

-------------------------------------------------------------------
8 KOOTAS (ASHTA KOOTA) DETAILED BREAKDOWN:
1. Varna (Work & Spiritual Ego): ${matchResult.kootas[0].obtainedPoints}/1 pt [${matchResult.kootas[0].p1Value} vs ${matchResult.kootas[0].p2Value}] - ${matchResult.kootas[0].verdict}
2. Vashya (Magnetic Dominance): ${matchResult.kootas[1].obtainedPoints}/2 pts [${matchResult.kootas[1].p1Value} vs ${matchResult.kootas[1].p2Value}] - ${matchResult.kootas[1].verdict}
3. Tara (Destiny & Longevity): ${matchResult.kootas[2].obtainedPoints}/3 pts [${matchResult.kootas[2].p1Value} vs ${matchResult.kootas[2].p2Value}] - ${matchResult.kootas[2].verdict}
4. Yoni (Physical & Intimacy): ${matchResult.kootas[3].obtainedPoints}/4 pts [${matchResult.kootas[3].p1Value} vs ${matchResult.kootas[3].p2Value}] - ${matchResult.kootas[3].verdict}
5. Graha Maitri (Mental Harmony): ${matchResult.kootas[4].obtainedPoints}/5 pts [${matchResult.kootas[4].p1Value} vs ${matchResult.kootas[4].p2Value}] - ${matchResult.kootas[4].verdict}
6. Gana (Temperament & Ego): ${matchResult.kootas[5].obtainedPoints}/6 pts [${matchResult.kootas[5].p1Value} vs ${matchResult.kootas[5].p2Value}] - ${matchResult.kootas[5].verdict}
7. Bhakoot (Emotional & Family): ${matchResult.kootas[6].obtainedPoints}/7 pts [${matchResult.kootas[6].p1Value} vs ${matchResult.kootas[6].p2Value}] - ${matchResult.kootas[6].verdict}
8. Nadi (Genetic & Progeny): ${matchResult.kootas[7].obtainedPoints}/8 pts [${matchResult.kootas[7].p1Value} vs ${matchResult.kootas[7].p2Value}] - ${matchResult.kootas[7].verdict}

-------------------------------------------------------------------
DOSHA ASSESSMENT:
Manglik (Kuja) Dosha: ${matchResult.manglik.verdict}
- ${partner1.fullName}: ${matchResult.manglik.partner1.severity} (${matchResult.manglik.partner1.cancellation})
- ${partner2.fullName}: ${matchResult.manglik.partner2.severity} (${matchResult.manglik.partner2.cancellation})
Explanation: ${matchResult.manglik.explanation}

Nadi Dosha: ${matchResult.nadiDosha.hasDosha ? 'Active' : 'No Dosha'} (${matchResult.nadiDosha.reason})
Bhakoot Dosha: ${matchResult.bhakootDosha.hasDosha ? 'Active' : 'Harmonious'} (${matchResult.bhakootDosha.reason})

-------------------------------------------------------------------
NUMEROLOGY & ELEMENTAL SYNERGY:
Numerology Mulanks: ${matchResult.numerologyMilan.partner1Mulank} & ${matchResult.numerologyMilan.partner2Mulank} (Harmony Score: ${matchResult.numerologyMilan.harmonyScore}%)
Elemental Balance: ${matchResult.elementalBalance.synergy} (Score: ${matchResult.elementalBalance.score}%)

-------------------------------------------------------------------
AUSPICIOUS REMEDIES & UPAYAS:
${matchResult.remedies.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Auspicious Muhurat Guidance:
${matchResult.auspiciousMuhuratAdvice}

===================================================================
Issued by JyotishVeda AI Daivajna Astrological Intelligence Engine
===================================================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Kundli_Milan_Report_${partner1.fullName}_and_${partner2.fullName}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyReport = () => {
    const summary = `${matchResult.verdictTitle} - ${matchResult.totalPoints}/36 Gunas Matched (${matchResult.percentage}%) between ${partner1.fullName} and ${partner2.fullName}. ${matchResult.summary}`;
    navigator.clipboard.writeText(summary);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Get score color
  const getScoreColor = (points: number, max: number) => {
    return 'text-[#C9A050] bg-[#C9A050]/15 border-[#C9A050]/30';
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className={`${
        theme === 'dark' 
          ? 'bg-[#141418] border-[#2A2A2E]' 
          : 'bg-gradient-to-br from-[#FAF3DF] via-[#FAF7EB] to-[#F5E8C8] border-[#DFC896] shadow-md shadow-[#C9A050]/10'
      } border rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A050]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold tracking-widest text-[#C9A050] uppercase mb-2">
              <HeartHandshake className="w-4 h-4" />
              <span>{t('matchmaking.title')}</span>
            </div>
            <h1 className={`text-2xl sm:text-4xl font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#1E1B15]'}`}>
              Kundli Milan & Relationship Compatibility
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6E6452]'} mt-2 max-w-2xl leading-relaxed`}>
              Authentic Ashta Koota 36 Gunas calculation, Manglik (Kuja) Dosha balance, Nadi vitality, and Western synastry synthesis for marriage, love, and life partnerships.
            </p>
          </div>

          {/* Action Row: Saved Matches History, New Match, Direct PDF Download */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Saved Matches History Button */}
            <button
              type="button"
              onClick={() => setIsHistoryModalOpen(true)}
              className={`flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[#1A1A1E] border-[#2A2A2E] text-[#E5E1D8] hover:border-[#C9A050]/50 hover:bg-[#222228]'
                  : 'bg-[#FAF4E4] border-[#DFC896] text-[#423C32] hover:border-[#C9A050] hover:bg-[#F5E8C8]'
              }`}
              title="View saved matchmaking reports"
            >
              <FileText className="w-3.5 h-3.5 text-[#C9A050]" />
              <span>Saved Matches</span>
              {savedMatches.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C9A050]/20 text-[#C9A050]">
                  {savedMatches.length}
                </span>
              )}
            </button>

            {/* Quick Action: Direct 1-Page PDF Download */}
            <button
              type="button"
              onClick={() => {
                if (isGeneratingPdf) return;
                if (!matchResult) {
                  if (partner1.birthDate && partner2.birthDate) {
                    triggerMilanCalculation(partner1, partner2);
                  } else {
                    const p1El = document.getElementById('partner-card-1');
                    p1El?.scrollIntoView({ behavior: 'smooth' });
                  }
                  return;
                }
                handleDownloadPDF();
              }}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs tracking-wide bg-[#C9A050] hover:bg-[#D4AF37] text-[#0D0D0F] shadow-lg shadow-[#C9A050]/25 transition active:scale-[0.98] cursor-pointer"
              title="Download Match Report (PDF)"
            >
              {isGeneratingPdf ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{t('matchmaking.download_pdf')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Partner 1 & Partner 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Partner 1 Card */}
        <div className={`rounded-2xl p-6 shadow-sm border ${
          theme === 'dark' 
            ? 'bg-[#141418] border-[#2A2A2E]' 
            : 'bg-gradient-to-b from-[#FAF4E4] via-[#FCF8EE] to-[#F6ECD2] border-[#DFC896] shadow-sm'
        } relative flex flex-col justify-between`}>
          <div>
            <div className={`flex items-center justify-between mb-5 pb-3 border-b ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#DECFA6]'}`}>
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border matchmaking-avatar-a">
                  A
                </div>
                <div>
                  <h3 className={`text-base font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#1E1B15]'}`}>
                    {t('matchmaking.partner1')}
                  </h3>
                </div>
              </div>

              {isP1Saved && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-[#FCE59F] text-[#3B2902] border-2 border-[#C9A050] dark:bg-[#C9A050] dark:text-[#0D0D0F] dark:border-[#DFC896] shadow-md">
                  <Check className="w-3.5 h-3.5 text-[#3B2902] dark:text-[#0D0D0F] stroke-[3]" />
                  <span>Saved</span>
                </span>
              )}
            </div>

            <div className="space-y-4 text-xs">
              {/* Full Name */}
              <div>
                <label className={`block mb-1.5 font-medium ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>Full Name</label>
                <input
                  type="text"
                  disabled={isP1Saved}
                  placeholder="Enter Groom / Person A Name"
                  value={partner1.fullName}
                  onChange={(e) => setPartner1({ ...partner1, fullName: e.target.value })}
                  className={`w-full rounded-lg px-3 py-2 text-sm border outline-none transition ${
                    theme === 'dark'
                      ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8] placeholder:text-gray-600 focus:border-[#C9A050]'
                      : 'bg-[#FFFDF7] border-[#DECFA6] text-[#1E1B15] placeholder:text-[#A89F8F] focus:border-[#C9A050] focus:ring-1 focus:ring-[#C9A050]/20'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                />
              </div>

              {/* Birth Date & Time Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Birth Date */}
                <div>
                  <label className={`block mb-1.5 font-medium ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>Date of Birth</label>
                  <VedicDatePicker
                    value={partner1.birthDate}
                    onChange={(newDate) => setPartner1({ ...partner1, birthDate: newDate })}
                    disabled={isP1Saved}
                    theme={theme}
                    placeholder="DD-MM-YYYY"
                  />
                </div>

                {/* Birth Time */}
                <div>
                  <label className={`block mb-1.5 font-medium ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>Birth Time</label>
                  <VedicTimePicker
                    value={partner1.birthTime}
                    onChange={(newTime) => setPartner1({ ...partner1, birthTime: newTime })}
                    disabled={isP1Saved}
                    theme={theme}
                    placeholder="HH:MM (e.g. 10:30)"
                  />
                </div>
              </div>

              {/* Birth City */}
              <div>
                <label className={`block mb-1.5 font-medium ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>Birth City / Country</label>
                <input
                  type="text"
                  disabled={isP1Saved}
                  placeholder="e.g. Kolkata, India"
                  value={partner1.birthPlace}
                  onChange={(e) => setPartner1({ ...partner1, birthPlace: e.target.value })}
                  className={`w-full rounded-lg px-3 py-2 text-sm border outline-none transition ${
                    theme === 'dark'
                      ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8] placeholder:text-gray-600 focus:border-[#C9A050]'
                      : 'bg-[#FFFDF7] border-[#DECFA6] text-[#1E1B15] placeholder:text-[#A89F8F] focus:border-[#C9A050]'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                />
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className={`pt-4 flex items-center justify-end border-t ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#DECFA6]'} mt-5`}>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsP1Saved(false)}
                className="px-5 py-2 rounded-xl font-extrabold text-xs border-2 border-[#B38730] bg-[#FAF0D0] hover:bg-[#EEDCA8] text-[#0D0D0F] dark:bg-[#FAF0D0] dark:border-[#B38730] dark:text-[#0D0D0F] dark:hover:bg-[#EEDCA8] transition shadow-sm cursor-pointer"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => {
                  if (partner1.birthDate) {
                    setIsP1Saved(true);
                  }
                }}
                className={`px-5 py-2 rounded-xl font-extrabold text-xs shadow-md transition cursor-pointer flex items-center justify-center ${
                  isP1Saved
                    ? 'bg-[#C9A050] text-[#0D0D0F] border border-[#A67C28] shadow-[#C9A050]/25 dark:bg-[#C9A050] dark:text-[#0D0D0F]'
                    : 'bg-[#D4AF37] hover:bg-[#C9A050] text-[#0D0D0F] border border-[#B38730] shadow-[#C9A050]/30 hover:scale-[1.02] dark:bg-[#D4AF37] dark:text-[#0D0D0F]'
                }`}
              >
                <span>{isP1Saved ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Partner 2 Card */}
        <div className={`rounded-2xl p-6 shadow-sm border ${
          theme === 'dark' 
            ? 'bg-[#141418] border-[#2A2A2E]' 
            : 'bg-gradient-to-b from-[#FAF4E4] via-[#FCF8EE] to-[#F6ECD2] border-[#DFC896] shadow-sm'
        } relative flex flex-col justify-between`}>
          <div>
            <div className={`flex items-center justify-between mb-5 pb-3 border-b ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#DECFA6]'}`}>
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border matchmaking-avatar-b">
                  B
                </div>
                <div>
                  <h3 className={`text-base font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#1E1B15]'}`}>
                    {t('matchmaking.partner2')}
                  </h3>
                </div>
              </div>

              {isP2Saved && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-[#FCE59F] text-[#3B2902] border-2 border-[#C9A050] dark:bg-[#C9A050] dark:text-[#0D0D0F] dark:border-[#DFC896] shadow-md">
                  <Check className="w-3.5 h-3.5 text-[#3B2902] dark:text-[#0D0D0F] stroke-[3]" />
                  <span>Saved</span>
                </span>
              )}
            </div>

            <div className="space-y-4 text-xs">
              {/* Full Name */}
              <div>
                <label className={`block mb-1.5 font-medium ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>Full Name</label>
                <input
                  type="text"
                  disabled={isP2Saved}
                  placeholder="Enter Bride / Person B Name"
                  value={partner2.fullName}
                  onChange={(e) => setPartner2({ ...partner2, fullName: e.target.value })}
                  className={`w-full rounded-lg px-3 py-2 text-sm border outline-none transition ${
                    theme === 'dark'
                      ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8] placeholder:text-gray-600 focus:border-[#C9A050]'
                      : 'bg-[#FFFDF7] border-[#DECFA6] text-[#1E1B15] placeholder:text-[#A89F8F] focus:border-[#C9A050]'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                />
              </div>

              {/* Birth Date & Time Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Birth Date */}
                <div>
                  <label className={`block mb-1.5 font-medium ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>Date of Birth</label>
                  <VedicDatePicker
                    value={partner2.birthDate}
                    onChange={(newDate) => setPartner2({ ...partner2, birthDate: newDate })}
                    disabled={isP2Saved}
                    theme={theme}
                    placeholder="DD-MM-YYYY"
                  />
                </div>

                {/* Birth Time */}
                <div>
                  <label className={`block mb-1.5 font-medium ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>Birth Time</label>
                  <VedicTimePicker
                    value={partner2.birthTime}
                    onChange={(newTime) => setPartner2({ ...partner2, birthTime: newTime })}
                    disabled={isP2Saved}
                    theme={theme}
                    placeholder="HH:MM (e.g. 10:30)"
                  />
                </div>
              </div>

              {/* Birth City */}
              <div>
                <label className={`block mb-1.5 font-medium ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>Birth City / Country</label>
                <input
                  type="text"
                  disabled={isP2Saved}
                  placeholder="e.g. Mumbai, India"
                  value={partner2.birthPlace}
                  onChange={(e) => setPartner2({ ...partner2, birthPlace: e.target.value })}
                  className={`w-full rounded-lg px-3 py-2 text-sm border outline-none transition ${
                    theme === 'dark'
                      ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8] placeholder:text-gray-600 focus:border-[#C9A050]'
                      : 'bg-[#FFFDF7] border-[#DECFA6] text-[#1E1B15] placeholder:text-[#A89F8F] focus:border-[#C9A050]'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                />
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className={`pt-4 flex items-center justify-end border-t ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#DECFA6]'} mt-5`}>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsP2Saved(false)}
                className="px-5 py-2 rounded-xl font-extrabold text-xs border-2 border-[#B38730] bg-[#FAF0D0] hover:bg-[#EEDCA8] text-[#0D0D0F] dark:bg-[#FAF0D0] dark:border-[#B38730] dark:text-[#0D0D0F] dark:hover:bg-[#EEDCA8] transition shadow-sm cursor-pointer"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => {
                  if (partner2.birthDate) {
                    setIsP2Saved(true);
                  }
                }}
                className={`px-5 py-2 rounded-xl font-extrabold text-xs shadow-md transition cursor-pointer flex items-center justify-center ${
                  isP2Saved
                    ? 'bg-[#C9A050] text-[#0D0D0F] border border-[#A67C28] shadow-[#C9A050]/25 dark:bg-[#C9A050] dark:text-[#0D0D0F]'
                    : 'bg-[#D4AF37] hover:bg-[#C9A050] text-[#0D0D0F] border border-[#B38730] shadow-[#C9A050]/30 hover:scale-[1.02] dark:bg-[#D4AF37] dark:text-[#0D0D0F]'
                }`}
              >
                <span>{isP2Saved ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right-Aligned Generate Action Button */}
      {partner1.birthDate && partner2.birthDate && isP1Saved && isP2Saved && (
        <div id="generate-milan-section" className="flex justify-end my-4 animate-fadeIn">
          <button
            type="button"
            onClick={() => triggerMilanCalculation(partner1, partner2)}
            disabled={isCalculatingMilan}
            className={`px-8 py-3.5 rounded-2xl font-serif font-bold text-sm sm:text-base tracking-wider shadow-xl transition-all duration-300 flex items-center space-x-2.5 cursor-pointer hover:scale-105 active:scale-95 ${
              isCalculatingMilan
                ? 'bg-[#C9A050]/60 text-[#0D0D0F] cursor-wait opacity-80'
                : 'bg-gradient-to-r from-[#C9A050] via-[#D4AF37] to-[#B38730] hover:from-[#D4AF37] hover:to-[#C9A050] text-[#0D0D0F] shadow-[#C9A050]/30 border border-[#B38730]'
            }`}
          >
            <Sparkles className={`w-5 h-5 text-[#0D0D0F] ${isCalculatingMilan ? 'animate-spin' : ''}`} />
            <span>
              {isCalculatingMilan
                ? 'Synthesizing Celestial Mansions...'
                : 'Generate'}
            </span>
          </button>
        </div>
      )}

      {/* Full-Page Cosmic Astrological Loader Overlay */}
      <AnimatePresence>
        {isCalculatingMilan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`w-full max-w-lg ${
                theme === 'dark'
                  ? 'bg-gradient-to-b from-[#18181D] via-[#121215] to-[#0D0D0F] border-[#C9A050]/50 shadow-[0_0_50px_rgba(201,160,80,0.25)]'
                  : 'bg-gradient-to-br from-[#FAF2DA] via-[#FAF7EB] to-[#F5E8C8] border-[#DFC896] shadow-[0_0_50px_rgba(201,160,80,0.35)]'
              } border-2 rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden`}
            >
              {/* Ambient Gold Halo Glow */}
              <div className="absolute inset-0 bg-radial from-[#C9A050]/20 via-transparent to-transparent pointer-events-none" />

              {/* Sacred Rotating Yantra / Chakra Animation */}
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 mx-auto flex items-center justify-center">
                {/* Outer dashed spinning celestial ring */}
                <div
                  className="absolute inset-0 rounded-full border-2 border-dashed border-[#C9A050]/60 animate-spin"
                  style={{ animationDuration: '8s' }}
                />
                {/* Middle counter-spinning ring */}
                <div
                  className="absolute inset-2 rounded-full border-2 border-t-[#C9A050] border-r-[#C9A050]/40 border-b-transparent border-l-transparent animate-spin"
                  style={{ animationDirection: 'reverse', animationDuration: '3s' }}
                />
                {/* Inner glowing core with sparkles */}
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${
                    theme === 'dark'
                      ? 'bg-gradient-to-br from-[#C9A050]/30 to-[#C9A050]/10 border-[#C9A050]/60 text-[#C9A050]'
                      : 'bg-[#FFF9EE] border-[#C9A050]/50 text-[#8C6218]'
                  } border flex items-center justify-center shadow-xl shadow-[#C9A050]/30 animate-pulse`}
                >
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-[#C9A050]" />
                </div>
              </div>

              {/* Dynamic Step Text */}
              <div className="space-y-2 relative z-10">
                <h3
                  className={`text-lg sm:text-xl font-serif font-bold ${
                    theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#1A1816]'
                  } tracking-wide min-h-[32px] transition-all`}
                >
                  {loadingStep === 0 && '✨ Aligning Moon Nakshatras & Lunar Mansions...'}
                  {loadingStep === 1 && '🪐 Computing 8 Kootas & 36 Guna Milan Matrix...'}
                  {loadingStep === 2 && '🔮 Synthesizing Manglik (Kuja), Nadi & Synastry Vitality...'}
                </h3>
                <p className="text-xs sm:text-sm text-[#C9A050] font-semibold tracking-widest uppercase">
                  Vedic Kundli Milan In Progress ({loadingStep === 0 ? '33%' : loadingStep === 1 ? '66%' : '99%'})
                </p>
              </div>

              {/* Shimmering Progress Bar */}
              <div
                className={`max-w-md mx-auto w-full ${
                  theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#FAF1D8] border-[#DFC896]'
                } border h-3 rounded-full overflow-hidden p-0.5 shadow-inner`}
              >
                <div
                  className="h-full bg-gradient-to-r from-[#C9A050] via-[#F3E5AB] to-[#C9A050] rounded-full transition-all duration-700 ease-out shadow-sm shadow-[#C9A050]"
                  style={{ width: loadingStep === 0 ? '35%' : loadingStep === 1 ? '70%' : '100%' }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Section (Calculated when matchResult is available) */}
      {matchResult && !isCalculatingMilan && (
        <>
          <div id="kundli-milan-results" className="space-y-8 animate-fadeIn">
      {/* Main Score Hero Card */}
      <div className={`${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-[#1A1A1E] via-[#141418] to-[#0D0D0F] border-[#C9A050]/40' 
          : 'bg-gradient-to-br from-[#FAF2DA] via-[#FAF7EB] to-[#F5E8C8] border-[#DFC896] shadow-xl'
      } border rounded-3xl p-5 sm:p-10 relative overflow-hidden`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
          {/* Left: Overall Guna Gauge */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  className="matchmaking-circle-track"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="url(#gunaGradient)"
                  strokeWidth="10"
                  strokeDasharray={314}
                  strokeDashoffset={314 - (314 * matchResult.percentage) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="gunaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C9A050" />
                    <stop offset="100%" stopColor="#E8D5B5" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className={`text-2xl sm:text-3xl font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#1E1B15]'}`}>
                  {matchResult.totalPoints}
                </span>
                <span className="text-[10px] text-[#C9A050] font-bold tracking-wider uppercase">/ 36 Gunas</span>
                <span className={`text-[9px] ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6E6452]'} font-sans`}>{matchResult.percentage}%</span>
              </div>
            </div>

            <div>
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#C9A050]/20 text-[#C9A050] border border-[#C9A050]/40 mb-2">
                <Award className="w-3.5 h-3.5" />
                <span>{matchResult.verdictTitle}</span>
              </span>
              <h2 className={`text-xl sm:text-2xl font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#1E1B15]'}`}>
                {partner1.fullName} &amp; {partner2.fullName}
              </h2>
              <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6E6452]'} mt-2 max-w-xl leading-relaxed`}>
                {matchResult.summary}
              </p>
            </div>
          </div>

          {/* Right: Key Compatibility Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className={`p-3.5 rounded-xl border text-center ${
              theme === 'dark' ? 'bg-[#0D0D0F]/80 border-[#2A2A2E]' : 'bg-[#FFFDF7] border-[#DECFA6] shadow-xs'
            }`}>
              <div className="flex items-center justify-center text-[#C9A050] mb-1">
                <Flame className="w-4 h-4" />
              </div>
              <span className={`text-[10px] ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#7A6F5D]'} uppercase tracking-wider block`}>Manglik Dosha</span>
              <span className={`text-xs font-bold ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#1E1B15]'} mt-0.5 block`}>
                {matchResult.manglik.isNeutralized ? 'Neutralized ✓' : 'Remedy Needed ⚠️'}
              </span>
            </div>

            <div className={`p-3.5 rounded-xl border text-center ${
              theme === 'dark' ? 'bg-[#0D0D0F]/80 border-[#2A2A2E]' : 'bg-[#FFFDF7] border-[#DECFA6] shadow-xs'
            }`}>
              <div className="flex items-center justify-center text-[#C9A050] mb-1">
                <Dna className="w-4 h-4" />
              </div>
              <span className={`text-[10px] ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#7A6F5D]'} uppercase tracking-wider block`}>Nadi Vitality</span>
              <span className={`text-xs font-bold ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#1E1B15]'} mt-0.5 block`}>
                {matchResult.kootas.find((k) => k.id === 'nadi')?.obtainedPoints}/8 Points
              </span>
            </div>

            <div className={`p-3.5 rounded-xl border text-center ${
              theme === 'dark' ? 'bg-[#0D0D0F]/80 border-[#2A2A2E]' : 'bg-[#FFFDF7] border-[#DECFA6] shadow-xs'
            }`}>
              <div className="flex items-center justify-center text-[#C9A050] mb-1">
                <Heart className="w-4 h-4" />
              </div>
              <span className={`text-[10px] ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#7A6F5D]'} uppercase tracking-wider block`}>Bhakoot Harmony</span>
              <span className={`text-xs font-bold ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#1E1B15]'} mt-0.5 block`}>
                {matchResult.kootas.find((k) => k.id === 'bhakoot')?.obtainedPoints}/7 Points
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className={`flex items-center space-x-2 border-b ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#DECFA6]'} pb-2 overflow-x-auto no-scrollbar`}>
        <button
          onClick={() => setActiveTab('kootas')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'kootas'
              ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20 font-bold'
              : theme === 'dark'
              ? 'bg-[#141418] text-[#9E9A90] hover:text-[#E5E1D8] border border-[#2A2A2E]'
              : 'bg-[#FAF4E4] text-[#6E6452] hover:text-[#1E1B15] hover:bg-[#F5E8C8] border border-[#DECFA6]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>8 Kootas Breakdown ({matchResult.totalPoints}/36)</span>
        </button>

        <button
          onClick={() => setActiveTab('doshas')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'doshas'
              ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20 font-bold'
              : theme === 'dark'
              ? 'bg-[#141418] text-[#9E9A90] hover:text-[#E5E1D8] border border-[#2A2A2E]'
              : 'bg-[#FAF4E4] text-[#6E6452] hover:text-[#1E1B15] hover:bg-[#F5E8C8] border border-[#DECFA6]'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Manglik &amp; Critical Doshas</span>
        </button>

        <button
          onClick={() => setActiveTab('synastry')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'synastry'
              ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20 font-bold'
              : theme === 'dark'
              ? 'bg-[#141418] text-[#9E9A90] hover:text-[#E5E1D8] border border-[#2A2A2E]'
              : 'bg-[#FAF4E4] text-[#6E6452] hover:text-[#1E1B15] hover:bg-[#F5E8C8] border border-[#DECFA6]'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Western Synastry &amp; Elements</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_counsel')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'ai_counsel'
              ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20 font-bold'
              : theme === 'dark'
              ? 'bg-[#141418] text-[#9E9A90] hover:text-[#E5E1D8] border border-[#2A2A2E]'
              : 'bg-[#FAF4E4] text-[#6E6452] hover:text-[#1E1B15] hover:bg-[#F5E8C8] border border-[#DECFA6]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Astrological Counsel</span>
        </button>

        <button
          onClick={() => setActiveTab('remedies')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'remedies'
              ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20 font-bold'
              : theme === 'dark'
              ? 'bg-[#141418] text-[#9E9A90] hover:text-[#E5E1D8] border border-[#2A2A2E]'
              : 'bg-[#FAF4E4] text-[#6E6452] hover:text-[#1E1B15] hover:bg-[#F5E8C8] border border-[#DECFA6]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Remedies &amp; Muhurat</span>
        </button>

        <button
          onClick={() => setActiveTab('download')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'download'
              ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20 font-bold'
              : theme === 'dark'
              ? 'bg-[#141418] text-[#9E9A90] hover:text-[#E5E1D8] border border-[#2A2A2E]'
              : 'bg-[#FAF4E4] text-[#6E6452] hover:text-[#1E1B15] hover:bg-[#F5E8C8] border border-[#DECFA6]'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download &amp; Export Report</span>
        </button>
      </div>

      {/* Tab 1: 8 Kootas Detailed Breakdown Table & Cards */}
      {activeTab === 'kootas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#1E1B15]'}`}>
              Ashta Koota (8 Kootas) Classical Scoring Matrix
            </h3>
            <span className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6E6452]'}`}>
              Score: <strong className="text-[#C9A050]">{matchResult.totalPoints}</strong> / 36 Maximum
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {matchResult.kootas.map((koota, index) => {
              const isExpanded = expandedKoota === koota.id;
              const badgeClass = getScoreColor(koota.obtainedPoints, koota.maxPoints);

              return (
                <div
                  key={koota.id}
                  className={`${
                    theme === 'dark'
                      ? 'bg-[#141418] border-[#2A2A2E] hover:border-[#C9A050]/40'
                      : 'bg-gradient-to-b from-[#FAF4E4] to-[#F6ECD2] border-[#DFC896] hover:border-[#C9A050]'
                  } border rounded-2xl p-5 transition shadow-sm`}
                >
                  <div
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                    onClick={() => setExpandedKoota(isExpanded ? null : koota.id)}
                  >
                    <div className="flex items-start sm:items-center space-x-4">
                      <div className={`w-9 h-9 rounded-xl ${
                        theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#FAF0D4] border-[#DECFA6]'
                      } border flex items-center justify-center font-bold text-sm text-[#C9A050] shrink-0`}>
                        0{index + 1}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className={`text-base font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#1E1B15]'}`}>
                            {koota.name}
                          </h4>
                          <span className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#7A6F5D]'} italic`}>({koota.sanskritName})</span>
                        </div>
                        <p className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6E6452]'} mt-0.5`}>{koota.area}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Values Comparison Pill */}
                      <div className={`hidden md:flex items-center space-x-2 text-xs px-3 py-1.5 rounded-lg border ${
                        theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E] text-[#9E9A90]' : 'bg-[#FFFDF7] border-[#DECFA6] text-[#6E6452]'
                      }`}>
                        <span className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#1E1B15]'}>{partner1.fullName.split(' ')[0]}: <strong className="text-[#C9A050]">{koota.p1Value}</strong></span>
                        <span>↔</span>
                        <span className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#1E1B15]'}>{partner2.fullName.split(' ')[0]}: <strong className="text-[#C9A050]">{koota.p2Value}</strong></span>
                      </div>

                      {/* Points Badge */}
                      <div className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeClass}`}>
                        {koota.obtainedPoints} / {koota.maxPoints} Pts
                      </div>

                      {isExpanded ? (
                        <ChevronUp className={`w-4 h-4 ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6E6452]'}`} />
                      ) : (
                        <ChevronDown className={`w-4 h-4 ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6E6452]'}`} />
                      )}
                    </div>
                  </div>

                  {/* Expanded Explanation */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`mt-4 pt-4 border-t ${
                          theme === 'dark' ? 'border-[#2A2A2E] text-[#E5E1D8]' : 'border-[#DECFA6] text-[#2C2825]'
                        } text-xs space-y-2 leading-relaxed`}
                      >
                        <p className={theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6E6452]'}>{koota.description}</p>
                        <div className={`p-3 rounded-xl border flex items-start space-x-2 ${
                          theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#FFFDF7] border-[#DECFA6]'
                        }`}>
                          <Info className="w-4 h-4 text-[#C9A050] shrink-0 mt-0.5" />
                          <div>
                            <span className={`font-semibold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#1E1B15]'}`}>Verdict Details: </span>
                            <span>{koota.details}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Manglik & Critical Doshas */}
      {activeTab === 'doshas' && (
        <div className="space-y-6">
          {/* Manglik Analysis Card */}
          <div className={`${
            theme === 'dark' 
              ? 'bg-[#141418] border-[#2A2A2E]' 
              : 'bg-gradient-to-b from-[#FAF4E4] to-[#F6ECD2] border-[#DFC896]'
          } border rounded-2xl p-6 shadow-md`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-lg font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#1E1B15]'}`}>
                  Manglik (Kuja) Dosha Comparative Assessment
                </h3>
                <p className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6E6452]'}`}>Mars placement in 1st, 2nd, 4th, 7th, 8th, or 12th houses</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
              {/* Partner 1 Manglik */}
              <div className={`p-4 rounded-xl border ${
                theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#FFFDF7] border-[#DECFA6]'
              }`}>
                <span className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#7A6F5D]'} uppercase tracking-wider block mb-1`}>
                  {partner1.fullName} (Partner A)
                </span>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#1E1B15]'}`}>
                    {matchResult.manglik.partner1.isManglik ? `Manglik (${matchResult.manglik.partner1.severity})` : 'Non-Manglik'}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded border ${
                    theme === 'dark' ? 'bg-[#1A1A1E] text-[#9E9A90] border-[#2A2A2E]' : 'bg-[#FAF1D8] text-[#6E6452] border-[#DECFA6]'
                  }`}>
                    House {matchResult.manglik.partner1.marsHouse}
                  </span>
                </div>
                <p className={`text-[11px] ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6E6452]'} mt-2`}>
                  Status: <strong className="text-[#C9A050]">{matchResult.manglik.partner1.cancellation}</strong>
                </p>
              </div>

              {/* Partner 2 Manglik */}
              <div className={`p-4 rounded-xl border ${
                theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#FFFDF7] border-[#DECFA6]'
              }`}>
                <span className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#7A6F5D]'} uppercase tracking-wider block mb-1`}>
                  {partner2.fullName} (Partner B)
                </span>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#1E1B15]'}`}>
                    {matchResult.manglik.partner2.isManglik ? `Manglik (${matchResult.manglik.partner2.severity})` : 'Non-Manglik'}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded border ${
                    theme === 'dark' ? 'bg-[#1A1A1E] text-[#9E9A90] border-[#2A2A2E]' : 'bg-[#FAF1D8] text-[#6E6452] border-[#DECFA6]'
                  }`}>
                    House {matchResult.manglik.partner2.marsHouse}
                  </span>
                </div>
                <p className={`text-[11px] ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6E6452]'} mt-2`}>
                  Status: <strong className="text-[#C9A050]">{matchResult.manglik.partner2.cancellation}</strong>
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
              matchResult.manglik.isNeutralized
                ? theme === 'light'
                  ? 'bg-[#FAF7EE] border-[#C9A050]/50 text-[#8C6B28]'
                  : 'bg-[#1C1A14] border-[#C9A050]/50 text-[#E8C470]'
                : theme === 'light'
                  ? 'bg-[#FFF8F6] border-rose-300 text-rose-800'
                  : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
            }`}>
              <div className={`font-bold text-sm mb-1 ${theme === 'light' ? 'text-[#8C6B28]' : 'text-[#E8C470]'}`}>
                {matchResult.manglik.verdict}
              </div>
              <p className={theme === 'light' ? 'text-[#5C574F]' : 'text-[#9E9A90]'}>
                {matchResult.manglik.explanation}
              </p>
            </div>
          </div>

          {/* Nadi & Bhakoot Dosha Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nadi Dosha */}
            <div className={`${
              theme === 'dark' 
                ? 'bg-[#141418] border-[#2A2A2E]' 
                : 'bg-gradient-to-b from-[#FAF4E4] to-[#F6ECD2] border-[#DFC896]'
            } border rounded-2xl p-6 shadow-md`}>
              <div className="flex items-center space-x-3 mb-3">
                <Dna className="w-5 h-5 text-[#C9A050]" />
                <h4 className={`text-base font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#1E1B15]'}`}>Nadi Dosha Examination</h4>
              </div>
              <div className={`space-y-2 text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6E6452]'}`}>
                <div className="flex justify-between">
                  <span>{partner1.fullName.split(' ')[0]} Nadi:</span>
                  <strong className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#1E1B15]'}>{matchResult.nadiDosha.partner1Nadi}</strong>
                </div>
                <div className="flex justify-between">
                  <span>{partner2.fullName.split(' ')[0]} Nadi:</span>
                  <strong className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#1E1B15]'}>{matchResult.nadiDosha.partner2Nadi}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <strong className={matchResult.nadiDosha.hasDosha && !matchResult.nadiDosha.isCancelled ? 'text-rose-400' : 'text-[#C9A050]'}>
                    {matchResult.nadiDosha.hasDosha
                      ? matchResult.nadiDosha.isCancelled
                        ? 'Dosha Cancelled ✓'
                        : 'Active Nadi Dosha ⚠️'
                      : 'No Dosha (Pure Harmony) ✓'}
                  </strong>
                </div>
                <p className={`p-3 rounded-lg border text-[11px] mt-3 ${
                  theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-[#FFFDF7] border-[#DECFA6] text-[#2C2825]'
                }`}>
                  {matchResult.nadiDosha.reason}. {matchResult.nadiDosha.remedy}
                </p>
              </div>
            </div>

            {/* Bhakoot Dosha */}
            <div className={`${
              theme === 'dark' 
                ? 'bg-[#141418] border-[#2A2A2E]' 
                : 'bg-gradient-to-b from-[#FAF4E4] to-[#F6ECD2] border-[#DFC896]'
            } border rounded-2xl p-6 shadow-md`}>
              <div className="flex items-center space-x-3 mb-3">
                <Heart className="w-5 h-5 text-[#C9A050]" />
                <h4 className={`text-base font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#1E1B15]'}`}>Bhakoot Dosha Examination</h4>
              </div>
              <div className={`space-y-2 text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6E6452]'}`}>
                <div className="flex justify-between">
                  <span>{partner1.fullName.split(' ')[0]} Rashi:</span>
                  <strong className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#1E1B15]'}>{matchResult.bhakootDosha.partner1Rashi}</strong>
                </div>
                <div className="flex justify-between">
                  <span>{partner2.fullName.split(' ')[0]} Rashi:</span>
                  <strong className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#1E1B15]'}>{matchResult.bhakootDosha.partner2Rashi}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Rashi Angular Disparity:</span>
                  <strong className="text-[#C9A050]">{matchResult.bhakootDosha.rashiDistance}</strong>
                </div>
                <p className={`p-3 rounded-lg border text-[11px] mt-3 ${
                  theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-[#FFFDF7] border-[#DECFA6] text-[#2C2825]'
                }`}>
                  {matchResult.bhakootDosha.reason}. {matchResult.bhakootDosha.remedy}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Western Synastry & Elements */}
      {activeTab === 'synastry' && (
        <div className="space-y-6">
          <div className={`${
            theme === 'dark' 
              ? 'bg-[#141418] border-[#2A2A2E]' 
              : 'bg-gradient-to-b from-[#FAF4E4] to-[#F6ECD2] border-[#DFC896]'
          } border rounded-2xl p-6 shadow-md`}>
            <h3 className={`text-lg font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#1E1B15]'} mb-2`}>
              Western Synastry &amp; Cosmic Planetary Aspects
            </h3>
            <p className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6E6452]'} mb-6`}>
              Cross-tradition psychological harmonization between solar-lunar archetypes and interpersonal attraction vectors.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {matchResult.synastry.map((syn, i) => (
                <div key={i} className={`p-4 rounded-xl border space-y-2.5 ${
                  theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#FFFDF7] border-[#DECFA6]'
                }`}>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs font-bold text-[#C9A050] truncate">{syn.title}</span>
                    <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full shrink-0 shadow-sm ${
                      theme === 'light'
                        ? 'bg-[#FAF1D6] text-[#8C6218] border border-[#DECFA6]'
                        : 'bg-[#C9A050]/20 text-[#E8C470] border border-[#C9A050]/40'
                    }`}>
                      {syn.harmonyScore}%
                    </span>
                  </div>
                  <span className={`text-[11px] ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#7A6F5D]'} block`}>{syn.planets}</span>
                  <div className={`w-full ${theme === 'light' ? 'bg-[#FAF1D6]' : 'bg-[#1A1A1E]'} h-2 rounded-full overflow-hidden`}>
                    <div className="bg-[#C9A050] h-full rounded-full transition-all duration-500" style={{ width: `${syn.harmonyScore}%` }} />
                  </div>
                  <p className={`text-xs ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2C2825]'} pt-1 leading-relaxed`}>{syn.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Elemental & Numerology Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`${
              theme === 'dark' 
                ? 'bg-[#141418] border-[#2A2A2E]' 
                : 'bg-gradient-to-b from-[#FAF4E4] to-[#F6ECD2] border-[#DFC896]'
            } border rounded-2xl p-6 shadow-md`}>
              <h4 className={`text-base font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#1E1B15]'} mb-3`}>Elemental Synergy</h4>
              <div className={`p-4 rounded-xl border space-y-2.5 text-xs ${
                theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#FFFDF7] border-[#DECFA6]'
              }`}>
                <div className={`flex justify-between ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6E6452]'}`}>
                  <span>Elements:</span>
                  <strong className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#1E1B15]'}>
                    {matchResult.elementalBalance.partner1Element} ↔ {matchResult.elementalBalance.partner2Element}
                  </strong>
                </div>
                <div className={`flex justify-between items-center ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6E6452]'}`}>
                  <span>Synergy Score:</span>
                  <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                    theme === 'light'
                      ? 'bg-[#FAF1D6] text-[#8C6218] border border-[#DECFA6]'
                      : 'bg-[#C9A050]/20 text-[#E8C470] border border-[#C9A050]/40'
                  }`}>
                    {matchResult.elementalBalance.score}%
                  </span>
                </div>
                <p className={`${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2C2825]'} pt-1 leading-relaxed`}>{matchResult.elementalBalance.synergy}</p>
              </div>
            </div>

            <div className={`${
              theme === 'dark' 
                ? 'bg-[#141418] border-[#2A2A2E]' 
                : 'bg-gradient-to-b from-[#FAF4E4] to-[#F6ECD2] border-[#DFC896]'
            } border rounded-2xl p-6 shadow-md`}>
              <h4 className={`text-base font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#1E1B15]'} mb-3`}>Numerological Alignment (Mulank &amp; Bhagyank)</h4>
              <div className={`p-4 rounded-xl border space-y-2.5 text-xs ${
                theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#FFFDF7] border-[#DECFA6]'
              }`}>
                <div className={`flex justify-between ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6E6452]'}`}>
                  <span>Psychic Numbers (Mulank):</span>
                  <strong className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#1E1B15]'}>
                    Mulank {matchResult.numerologyMilan.partner1Mulank} ↔ Mulank {matchResult.numerologyMilan.partner2Mulank}
                  </strong>
                </div>
                <div className={`flex justify-between items-center ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6E6452]'}`}>
                  <span>Destiny Harmony Score:</span>
                  <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                    theme === 'light'
                      ? 'bg-[#FAF1D6] text-[#8C6218] border border-[#DECFA6]'
                      : 'bg-[#C9A050]/20 text-[#E8C470] border border-[#C9A050]/40'
                  }`}>
                    {matchResult.numerologyMilan.harmonyScore}%
                  </span>
                </div>
                <p className={`${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2C2825]'} pt-1 leading-relaxed`}>{matchResult.numerologyMilan.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: AI Astrological Counsel */}
      {activeTab === 'ai_counsel' && (
        <div className={`${
          theme === 'dark' 
            ? 'bg-[#141418] border-[#2A2A2E]' 
            : 'bg-gradient-to-b from-[#FAF4E4] to-[#F6ECD2] border-[#DFC896]'
        } border rounded-2xl p-6 sm:p-8 shadow-xl space-y-6`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold tracking-widest text-[#C9A050] uppercase mb-1">
                <Sparkles className="w-4 h-4" />
                <span>{t('matchmaking.ai_counsel')}</span>
              </div>
              <h3 className={`text-xl font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#1E1B15]'}`}>
                AI Daivajna Deep Relationship Synthesis
              </h3>
              <p className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6E6452]'}`}>
                Multidimensional karmic counsel generated dynamically for {partner1.fullName} &amp; {partner2.fullName}.
              </p>
            </div>

            <div className="flex items-center space-x-2.5 shrink-0">
              {aiSynthesis && (
                <button
                  onClick={handleCopyAISynthesis}
                  className={`flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-[#1C1C22] hover:bg-[#25252E] text-[#E5E1D8] border-[#3A3A42]'
                      : 'bg-[#FFFDF7] hover:bg-[#FAF4E4] text-[#1E1B15] border-[#DECFA6]'
                  }`}
                  title="Copy counsel report"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#C9A050]" />
                      <span>Copy Report</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={handleGenerateAISynthesis}
                disabled={isGeneratingAI}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#C9A050] hover:bg-[#D4AF37] disabled:opacity-50 text-[#0D0D0F] font-bold text-xs shadow-lg shadow-[#C9A050]/20 transition cursor-pointer"
              >
                {isGeneratingAI ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Cosmic Charts...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{aiSynthesis ? 'Regenerate Full AI Counsel' : 'Generate Full AI Counsel'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {aiSynthesis ? (
            <div className="space-y-6">
              {typeof aiSynthesis === 'object' ? (
                <div className="space-y-6 text-xs sm:text-sm">
                  {/* Overall Compatibility Hero */}
                  {aiSynthesis.overall_compatibility && (
                    <div className={`p-5 rounded-2xl border ${
                      theme === 'dark' ? 'bg-[#0D0D0F] border-[#C9A050]/40' : 'bg-[#FFFDF7] border-[#DECFA6]'
                    } space-y-2`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-[#C9A050] font-serif font-bold text-sm">
                          <Sparkles className="w-4 h-4" />
                          <span>Overall Astrological Compatibility</span>
                        </div>
                        {typeof aiSynthesis.overall_compatibility === 'string' && aiSynthesis.overall_compatibility.length < 30 && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C9A050]/20 text-[#C9A050] border border-[#C9A050]/40">
                            {aiSynthesis.overall_compatibility}
                          </span>
                        )}
                      </div>
                      <p className={`${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2C2825]'} leading-relaxed`}>
                        {aiSynthesis.overall_compatibility}
                      </p>
                    </div>
                  )}

                  {/* Core Dimensions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aiSynthesis.guna_milan && (
                      <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#FFFDF7] border-[#DECFA6]'} space-y-1.5`}>
                        <h4 className="font-serif font-bold text-[#C9A050] text-xs uppercase tracking-wider flex items-center space-x-1.5">
                          <span>✨ Guna Milan &amp; Cosmic Alignment</span>
                        </h4>
                        <p className={`${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} leading-relaxed`}>
                          {aiSynthesis.guna_milan}
                        </p>
                      </div>
                    )}

                    {aiSynthesis.manglik_dosha && (
                      <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#FFFDF7] border-[#DECFA6]'} space-y-1.5`}>
                        <h4 className="font-serif font-bold text-amber-500 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                          <Flame className="w-3.5 h-3.5 text-amber-500" />
                          <span>Manglik (Kuja) Dosha Evaluation</span>
                        </h4>
                        <p className={`${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} leading-relaxed`}>
                          {aiSynthesis.manglik_dosha}
                        </p>
                      </div>
                    )}

                    {aiSynthesis.nadi_analysis && (
                      <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#FFFDF7] border-[#DECFA6]'} space-y-1.5`}>
                        <h4 className="font-serif font-bold text-purple-400 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                          <Dna className="w-3.5 h-3.5 text-purple-400" />
                          <span>Nadi Koota &amp; Genetic Prana Harmony</span>
                        </h4>
                        <p className={`${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} leading-relaxed`}>
                          {aiSynthesis.nadi_analysis}
                        </p>
                      </div>
                    )}

                    {aiSynthesis.bhakoot_analysis && (
                      <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#FFFDF7] border-[#DECFA6]'} space-y-1.5`}>
                        <h4 className="font-serif font-bold text-[#C9A050] text-xs uppercase tracking-wider flex items-center space-x-1.5">
                          <Heart className="w-3.5 h-3.5 text-[#C9A050]" />
                          <span>Bhakoot Harmony &amp; Emotional Rhythm</span>
                        </h4>
                        <p className={`${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} leading-relaxed`}>
                          {aiSynthesis.bhakoot_analysis}
                        </p>
                      </div>
                    )}

                    {aiSynthesis.psychological_affinity && (
                      <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#FFFDF7] border-[#DECFA6]'} space-y-1.5`}>
                        <h4 className="font-serif font-bold text-[#C9A050] text-xs uppercase tracking-wider flex items-center space-x-1.5">
                          <span>🧠 Psychological &amp; Intellectual Affinity</span>
                        </h4>
                        <p className={`${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} leading-relaxed`}>
                          {aiSynthesis.psychological_affinity}
                        </p>
                      </div>
                    )}

                    {aiSynthesis.emotional_resonance && (
                      <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#FFFDF7] border-[#DECFA6]'} space-y-1.5`}>
                        <h4 className="font-serif font-bold text-[#C9A050] text-xs uppercase tracking-wider flex items-center space-x-1.5">
                          <span>❤️ Emotional Resonance &amp; Temperament</span>
                        </h4>
                        <p className={`${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} leading-relaxed`}>
                          {aiSynthesis.emotional_resonance}
                        </p>
                      </div>
                    )}

                    {aiSynthesis.karmic_bond && (
                      <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#FFFDF7] border-[#DECFA6]'} space-y-1.5`}>
                        <h4 className="font-serif font-bold text-[#C9A050] text-xs uppercase tracking-wider flex items-center space-x-1.5">
                          <span>🪐 Karmic Bond &amp; Destiny</span>
                        </h4>
                        <p className={`${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} leading-relaxed`}>
                          {aiSynthesis.karmic_bond}
                        </p>
                      </div>
                    )}

                    {aiSynthesis.physical_harmonization && (
                      <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#FFFDF7] border-[#DECFA6]'} space-y-1.5`}>
                        <h4 className="font-serif font-bold text-[#C9A050] text-xs uppercase tracking-wider flex items-center space-x-1.5">
                          <span>🌿 Biological &amp; Physical Harmonization</span>
                        </h4>
                        <p className={`${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} leading-relaxed`}>
                          {aiSynthesis.physical_harmonization}
                        </p>
                      </div>
                    )}

                    {aiSynthesis.family_and_married_life && (
                      <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#FFFDF7] border-[#DECFA6]'} space-y-1.5`}>
                        <h4 className="font-serif font-bold text-[#C9A050] text-xs uppercase tracking-wider flex items-center space-x-1.5">
                          <span>🏡 Family &amp; Married Life</span>
                        </h4>
                        <p className={`${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} leading-relaxed`}>
                          {aiSynthesis.family_and_married_life}
                        </p>
                      </div>
                    )}

                    {aiSynthesis.wealth_and_prosperity && (
                      <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#FFFDF7] border-[#DECFA6]'} space-y-1.5`}>
                        <h4 className="font-serif font-bold text-[#C9A050] text-xs uppercase tracking-wider flex items-center space-x-1.5">
                          <span>💰 Wealth Multiplication &amp; Prosperity</span>
                        </h4>
                        <p className={`${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} leading-relaxed`}>
                          {aiSynthesis.wealth_and_prosperity}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Strengths & Challenges Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.isArray(aiSynthesis.major_strengths) && aiSynthesis.major_strengths.length > 0 && (
                      <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#0D0D0F] border-emerald-500/30' : 'bg-[#FFFDF7] border-emerald-500/30'} space-y-2`}>
                        <h4 className="font-serif font-bold text-emerald-500 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Major Relationship Strengths</span>
                        </h4>
                        <ul className="space-y-1.5">
                          {aiSynthesis.major_strengths.map((str: string, i: number) => (
                            <li key={i} className="flex items-start space-x-2 text-xs">
                              <span className="text-emerald-500 font-bold">•</span>
                              <span className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2C2825]'}>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {Array.isArray(aiSynthesis.major_challenges) && aiSynthesis.major_challenges.length > 0 && (
                      <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#0D0D0F] border-amber-500/30' : 'bg-[#FFFDF7] border-amber-500/30'} space-y-2`}>
                        <h4 className="font-serif font-bold text-amber-500 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <span>Potential Challenges &amp; Growth Areas</span>
                        </h4>
                        <ul className="space-y-1.5">
                          {aiSynthesis.major_challenges.map((ch: string, i: number) => (
                            <li key={i} className="flex items-start space-x-2 text-xs">
                              <span className="text-amber-500 font-bold">•</span>
                              <span className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2C2825]'}>{ch}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Conflict Resolution & Vedic Remedies */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.isArray(aiSynthesis.conflict_resolution) && aiSynthesis.conflict_resolution.length > 0 && (
                      <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#FFFDF7] border-[#DECFA6]'} space-y-2`}>
                        <h4 className="font-serif font-bold text-blue-400 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                          <ShieldCheck className="w-4 h-4 text-blue-400" />
                          <span>Conflict Resolution Guidance</span>
                        </h4>
                        <ul className="space-y-1.5">
                          {aiSynthesis.conflict_resolution.map((cr: string, i: number) => (
                            <li key={i} className="flex items-start space-x-2 text-xs">
                              <span className="text-blue-400 font-bold">•</span>
                              <span className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2C2825]'}>{cr}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {Array.isArray(aiSynthesis.vedic_remedies) && aiSynthesis.vedic_remedies.length > 0 && (
                      <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#0D0D0F] border-[#C9A050]/40' : 'bg-[#FFFDF7] border-[#DECFA6]'} space-y-2`}>
                        <h4 className="font-serif font-bold text-[#C9A050] text-xs uppercase tracking-wider flex items-center space-x-1.5">
                          <Sparkles className="w-4 h-4 text-[#C9A050]" />
                          <span>Vedic Upayas &amp; Remedies</span>
                        </h4>
                        <ul className="space-y-1.5">
                          {aiSynthesis.vedic_remedies.map((vr: string, i: number) => (
                            <li key={i} className="flex items-start space-x-2 text-xs">
                              <span className="text-[#C9A050] font-bold">•</span>
                              <span className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2C2825]'}>{vr}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Final Assessment Box */}
                  {aiSynthesis.final_assessment && (
                    <div className={`p-5 rounded-2xl border ${
                      theme === 'dark' ? 'bg-gradient-to-r from-[#C9A050]/15 via-[#C9A050]/5 to-transparent border-[#C9A050]/50' : 'bg-gradient-to-r from-[#FAF0D0] via-[#FAF6E8] to-[#FFFDF7] border-[#DFC896]'
                    } space-y-2`}>
                      <h4 className="font-serif font-bold text-[#C9A050] text-sm flex items-center space-x-2">
                        <HeartHandshake className="w-4 h-4 text-[#C9A050]" />
                        <span>AI Daivajna Final Assessment &amp; Blessings</span>
                      </h4>
                      <p className={`${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#1E1B15]'} font-serif italic text-xs sm:text-sm leading-relaxed`}>
                        "{aiSynthesis.final_assessment}"
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className={`p-6 rounded-2xl border text-sm leading-relaxed space-y-4 ${
                  theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-[#FFFDF7] border-[#DECFA6] text-[#1E1B15]'
                }`}>
                  <div className={`prose max-w-none text-xs sm:text-sm ${theme === 'dark' ? 'prose-invert' : 'text-[#1E1B15]'}`}>
                    <ReactMarkdown>{aiSynthesis}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ) : isGeneratingAI ? (
            <div className={`p-12 rounded-2xl border border-dashed text-center space-y-4 ${
              theme === 'dark' ? 'bg-[#0D0D0F]/60 border-[#C9A050]/40' : 'bg-[#FFFDF7]/80 border-[#DECFA6]'
            }`}>
              <RefreshCw className="w-8 h-8 text-[#C9A050] mx-auto animate-spin" />
              <div className="space-y-1">
                <h4 className={`text-base font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#1E1B15]'}`}>
                  Synthesizing Vedic Charts &amp; Planetary Alignments...
                </h4>
                <p className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6E6452]'}`}>
                  AI Daivajna is analyzing Guna Milan, Doshas, and synastry dynamics for {partner1.fullName} &amp; {partner2.fullName}.
                </p>
              </div>
            </div>
          ) : (
            <div className={`p-8 rounded-2xl border border-dashed text-center space-y-3 ${
              theme === 'dark' ? 'bg-[#0D0D0F]/60 border-[#2A2A2E]' : 'bg-[#FFFDF7]/80 border-[#DECFA6]'
            }`}>
              <Sparkles className="w-8 h-8 text-[#C9A050] mx-auto opacity-70" />
              <p className={`text-sm font-serif ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#1E1B15]'}`}>
                Generate an exhaustive AI consultation covering psychological affinity, wealth generation, marital timing, and conflict resolution.
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6E6452]'}`}>
                Click the button above to synthesize charts using AI Daivajna intelligence.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Remedies & Muhurat */}
      {activeTab === 'remedies' && (
        <div className="space-y-6">
          <div className={`${
            theme === 'dark' 
              ? 'bg-[#141418] border-[#2A2A2E]' 
              : 'bg-gradient-to-b from-[#FAF4E4] to-[#F6ECD2] border-[#DFC896]'
          } border rounded-2xl p-6 shadow-md space-y-4`}>
            <div className="flex items-center space-x-2.5 text-[#C9A050]">
              <ShieldCheck className="w-5 h-5" />
              <h3 className={`text-lg font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#1E1B15]'}`}>
                {t('matchmaking.remedies_title')}
              </h3>
            </div>
            <p className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6E6452]'}`}>
              Traditional Vedic Upayas and practical actions designed to pacify minor planetary afflictions and enhance marital sweetness.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {matchResult.remedies.map((rem, idx) => (
                <div key={idx} className={`p-4 rounded-xl border flex items-start space-x-3 text-xs ${
                  theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#FFFDF7] border-[#DECFA6]'
                }`}>
                  <span className="w-6 h-6 rounded-full bg-[#C9A050]/20 text-[#C9A050] font-bold flex items-center justify-center shrink-0 text-[11px]">
                    {idx + 1}
                  </span>
                  <span className={`${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2C2825]'} leading-relaxed`}>{rem}</span>
                </div>
              ))}
            </div>

            {Array.isArray(aiSynthesis?.vedic_remedies) && aiSynthesis.vedic_remedies.length > 0 && (
              <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#0D0D0F] border-[#C9A050]/40' : 'bg-[#FFFDF7] border-[#DECFA6]'} space-y-2 mt-4`}>
                <h4 className="font-serif font-bold text-[#C9A050] text-xs uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-[#C9A050]" />
                  <span>AI Daivajna Personalized Relationship Upayas</span>
                </h4>
                <ul className="space-y-1.5">
                  {aiSynthesis.vedic_remedies.map((vr: string, i: number) => (
                    <li key={i} className="flex items-start space-x-2 text-xs">
                      <span className="text-[#C9A050] font-bold">•</span>
                      <span className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2C2825]'}>{vr}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Auspicious Muhurat Window Card */}
          <div className={`${
            theme === 'dark' 
              ? 'bg-[#141418] border-[#2A2A2E]' 
              : 'bg-gradient-to-b from-[#FAF4E4] to-[#F6ECD2] border-[#DFC896]'
          } border rounded-2xl p-6 shadow-md space-y-3`}>
            <div className="flex items-center space-x-2.5 text-amber-500">
              <Calendar className="w-5 h-5" />
              <h4 className={`text-base font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#1E1B15]'}`}>
                Auspicious Vivaha / Partnership Muhurat Guidance
              </h4>
            </div>
            <p className={`text-xs leading-relaxed p-4 rounded-xl border ${
              theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-[#FFFDF7] border-[#DECFA6] text-[#2C2825]'
            }`}>
              {matchResult.auspiciousMuhuratAdvice}
            </p>
          </div>
        </div>
      )}

      {/* Tab 6: Dedicated Match Report Download & Export Center */}
      {activeTab === 'download' && (
        <div className="space-y-6">
          <div className={`${
            theme === 'dark' 
              ? 'bg-[#141418] border-[#2A2A2E]' 
              : 'bg-gradient-to-b from-[#FAF4E4] to-[#F6ECD2] border-[#DFC896]'
          } border rounded-2xl p-6 sm:p-8 shadow-xl`}>
            <div className="max-w-2xl">
              <div className="flex items-center space-x-2 text-xs font-semibold tracking-widest text-[#C9A050] uppercase mb-1">
                <Download className="w-4 h-4" />
                <span>Match Report Export &amp; Archival</span>
              </div>
              <h3 className={`text-2xl font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#1E1B15]'}`}>
                Download Kundli Milan Dossier
              </h3>
              <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6E6452]'} mt-1.5 leading-relaxed`}>
                Export high-resolution printable certificates and formatted PDF reports for family consultation.
              </p>
            </div>

            {/* Export Card - Full Width Banner */}
            <div className="mt-6 w-full">
              <div className={`p-6 sm:p-7 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                theme === 'dark' 
                  ? 'bg-[#0D0D0F] border-[#2A2A2E] hover:border-[#C9A050]/60 shadow-lg' 
                  : 'bg-[#FFFDF7] border-[#DECFA6] hover:border-[#C9A050] shadow-md'
              }`}>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#C9A050]/15 border border-[#C9A050]/30 flex items-center justify-center text-[#C9A050] shrink-0 shadow-sm">
                    <Download className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className={`text-lg font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#1E1B15]'}`}>
                      Download Official Kundli Milan PDF Certificate
                    </h4>
                    <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6E6452]'} leading-relaxed max-w-2xl`}>
                      High-resolution printable document with traditional Vedic double borders, authentication seal, 8 Kootas matrix score, and Pandit verification signature line.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPdf}
                  className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-[#C9A050] hover:bg-[#D4AF37] text-[#0D0D0F] font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-[#C9A050]/25 transition cursor-pointer flex items-center justify-center space-x-2 shrink-0 hover:scale-[1.02] active:scale-95"
                >
                  {isGeneratingPdf ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download PDF Certificate</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* ========================================================================= */}
      {/* PRINTABLE OFFICIAL KUNDLI MILAN CERTIFICATE (Visible in Print Mode Only)  */}
      {/* ========================================================================= */}
      <div
        ref={printableRef}
        id="printable-certificate"
        className="hidden print:block bg-white text-black p-8 max-w-4xl mx-auto border-8 border-double border-[#C9A050] my-6 font-sans"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {/* Certificate Header */}
        <div className="text-center border-b-2 border-[#C9A050] pb-6 mb-6">
          <div className="text-3xl font-bold tracking-widest text-[#8C6D23] uppercase mb-1">
            🕉️ JYOTISHVEDA
          </div>
          <div className="text-sm font-semibold tracking-wider text-gray-700 uppercase">
            Vedic Kundli Milan &amp; Ashta Koota Compatibility Certificate
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Calculated in accordance with Brihat Parashara Hora Shastra &amp; Classical Jyotish Sutras
          </p>
        </div>

        {/* Partners Banner */}
        <div className="grid grid-cols-2 gap-6 my-6 p-4 bg-amber-50/50 border border-amber-200 rounded-lg">
          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-[#8C6D23]">Groom / Partner A</div>
            <div className="text-lg font-bold text-gray-900">{partner1.fullName}</div>
            <div className="text-xs text-gray-600 mt-1">
              Born: {partner1.birthDate} at {partner1.birthTime}
            </div>
            <div className="text-xs text-gray-600">Place: {partner1.birthPlace}</div>
          </div>

          <div className="text-right">
            <div className="text-xs uppercase tracking-wider font-bold text-[#8C6D23]">Bride / Partner B</div>
            <div className="text-lg font-bold text-gray-900">{partner2.fullName}</div>
            <div className="text-xs text-gray-600 mt-1">
              Born: {partner2.birthDate} at {partner2.birthTime}
            </div>
            <div className="text-xs text-gray-600">Place: {partner2.birthPlace}</div>
          </div>
        </div>

        {/* Score & Verdict Banner */}
        <div className="text-center my-6 p-4 bg-amber-100/60 border-2 border-[#C9A050] rounded-lg">
          <div className="text-xs font-bold uppercase tracking-widest text-[#8C6D23]">Total Compatibility Score</div>
          <div className="text-4xl font-bold text-[#8C6D23] my-1">
            {matchResult.totalPoints} / 36 Gunas ({matchResult.percentage}%)
          </div>
          <div className="text-sm font-bold text-gray-800 uppercase tracking-wide">
            {matchResult.verdictTitle}
          </div>
          <p className="text-xs text-gray-700 mt-2 max-w-xl mx-auto italic">
            &ldquo;{matchResult.summary}&rdquo;
          </p>
        </div>

        {/* 8 Kootas Table */}
        <div className="my-6">
          <h4 className="text-sm font-bold text-gray-900 border-b border-gray-300 pb-2 mb-3 uppercase tracking-wide">
            Ashta Koota Points Breakdown
          </h4>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-400 bg-gray-100">
                <th className="p-2 font-bold">Koota</th>
                <th className="p-2 font-bold">Significance</th>
                <th className="p-2 font-bold">{partner1.fullName.split(' ')[0]}</th>
                <th className="p-2 font-bold">{partner2.fullName.split(' ')[0]}</th>
                <th className="p-2 font-bold text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {matchResult.kootas.map((k) => (
                <tr key={k.id} className="border-b border-gray-200">
                  <td className="p-2 font-bold">{k.name} ({k.sanskritName})</td>
                  <td className="p-2 text-gray-600">{k.area}</td>
                  <td className="p-2">{k.p1Value}</td>
                  <td className="p-2">{k.p2Value}</td>
                  <td className="p-2 font-bold text-right">{k.obtainedPoints} / {k.maxPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dosha & Remedial Summary */}
        <div className="grid grid-cols-2 gap-4 my-6 text-xs">
          <div className="p-3 bg-gray-50 border border-gray-200 rounded">
            <strong className="block text-gray-900 mb-1">Manglik (Kuja) Dosha:</strong>
            <p className="text-gray-700">{matchResult.manglik.verdict}. {matchResult.manglik.explanation}</p>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded">
            <strong className="block text-gray-900 mb-1">Nadi &amp; Bhakoot Vitality:</strong>
            <p className="text-gray-700">Nadi: {matchResult.nadiDosha.reason}. Bhakoot: {matchResult.bhakootDosha.reason}.</p>
          </div>
        </div>

        {/* Certificate Footer / Authentication */}
        <div className="mt-8 pt-6 border-t-2 border-gray-300 flex justify-between items-end text-xs text-gray-600">
          <div>
            <div>Certificate ID: <strong className="text-gray-900">JV-KM-{Date.now().toString(36).toUpperCase()}</strong></div>
            <div>Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div className="text-[10px] text-gray-500 mt-1">Verified via JyotishVeda Mathematical AstroEngine</div>
          </div>
          <div className="text-center">
            <div className="w-36 border-b border-gray-400 mb-1 mx-auto" />
            <span className="text-[11px] font-bold text-gray-800 uppercase">Daivajna Astrological Seal</span>
          </div>
        </div>
      </div>
        </>
      )}

      {/* Saved Matches History Modal */}
      <AnimatePresence>
        {isHistoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className={`w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${
                theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#FAF4E4] border-[#DFC896]'
              }`}
            >
              {/* Modal Header */}
              <div className={`p-5 border-b flex items-center justify-between ${
                theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#DECFA6]'
              }`}>
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#C9A050]/15 flex items-center justify-center text-[#C9A050]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className={`font-serif font-bold text-base ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#1E1B15]'}`}>
                      Saved Matchmaking Reports
                    </h3>
                    <p className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6E6452]'}`}>
                      History for {currentProfile?.fullName || 'Current User'} ({savedMatches.length} records)
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsHistoryModalOpen(false)}
                  className={`p-1.5 rounded-lg transition ${
                    theme === 'dark' ? 'text-[#9E9A90] hover:text-[#F0ECE1] hover:bg-[#1A1A1E]' : 'text-[#6E6452] hover:text-[#1E1B15] hover:bg-[#F3EACB]'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body: List of Saved Matches */}
              <div className="flex-1 p-5 overflow-y-auto space-y-3">
                {savedMatches.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <HeartHandshake className="w-12 h-12 text-[#9E9A90]/40 mx-auto" />
                    <p className={`text-sm ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6E6452]'}`}>
                      No saved matchmaking reports yet for this profile.
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]/60' : 'text-[#6E6452]/70'}`}>
                      When you enter partner details and save them, your match reports will appear here.
                    </p>
                  </div>
                ) : (
                  savedMatches.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleLoadFromHistory(m)}
                      className={`p-4 rounded-xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        theme === 'dark'
                          ? 'bg-[#1A1A1E] border-[#2A2A2E] hover:border-[#C9A050]/60 hover:bg-[#202026]'
                          : 'bg-[#FFFDF7] border-[#DECFA6] hover:border-[#C9A050] hover:bg-[#FAF4E4]'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-[#C9A050]">
                            {m.partner1Name || 'Partner 1'}
                          </span>
                          <span className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6E6452]'}`}>&amp;</span>
                          <span className="font-bold text-sm text-[#C9A050]">
                            {m.partner2Name || 'Partner 2'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="px-2 py-0.5 rounded font-bold bg-[#C9A050]/15 text-[#C9A050] border border-[#C9A050]/30">
                            {m.totalScore} / {m.maxScore || 36} Gunas ({m.percentage || Math.round((m.totalScore / (m.maxScore || 36)) * 100)}%)
                          </span>
                          <span className={`text-[11px] font-semibold ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#1E1B15]'}`}>
                            {m.verdictTitle || 'Calculated Match'}
                          </span>
                        </div>

                        <div className={`text-[11px] ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6E6452]'} flex items-center space-x-2 pt-0.5`}>
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(m.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleLoadFromHistory(m)}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#C9A050] hover:bg-[#D4AF37] text-black transition shadow-sm"
                        >
                          <span>Load</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteFromHistory(m.id, e)}
                          className="p-1.5 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition"
                          title="Delete from history"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Modal Footer */}
              <div className={`p-4 border-t flex justify-between items-center ${
                theme === 'dark' ? 'border-[#2A2A2E] bg-[#101014]' : 'border-[#DECFA6] bg-[#FAF0D8]'
              }`}>
                <span className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6E6452]'}`}>
                  Click "Load" to restore any match report directly into the UI.
                </span>
                <button
                  type="button"
                  onClick={() => setIsHistoryModalOpen(false)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-[#FFFDF7] border-[#DECFA6] text-[#423C32] hover:bg-[#F3EACB]'
                  }`}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
