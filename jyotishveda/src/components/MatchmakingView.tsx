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
import { calculateKundliMilan, PRESET_MATCHMAKING_COUPLES, calculateVedicChart, calculateNumerology, getLagnaGemstones } from '../services/astroEngine';
import { MatchReportSummary, MatchReportFull, saveMatchReport, listMatchReports, fetchMatchReport, getMatchReportPdfUrl, calculateMatchReportBackend } from '../services/matchmakingApi';
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

const renderSafeAiText = (val: any): string => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'object') {
    if (val.status) return String(val.status);
    if (val.description) return String(val.description);
    if (val.text) return String(val.text);
    if (val.content) return String(val.content);
    if (val.present !== undefined) {
      return val.present ? `Manglik Dosha Present (${val.status || 'Active'})` : `No Manglik Dosha (${val.status || 'Clean'})`;
    }
    if (Array.isArray(val)) {
      return val.map((v) => (typeof v === 'object' ? JSON.stringify(v) : String(v))).join(', ');
    }
    return JSON.stringify(val);
  }
  return String(val);
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
  const [aiSynthesisId, setAiSynthesisId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedReportId, setSavedReportId] = useState<string | null>(null);

  // Live Auto-Refresh State
  const [isAutoRefreshing, setIsAutoRefreshing] = useState<boolean>(false);
  const [lastAutoRefreshedAt, setLastAutoRefreshedAt] = useState<Date | null>(null);

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
    setLastAutoRefreshedAt(null);

    try {
      const rawHist = localStorage.getItem(historyKey);
      setSavedMatches(rawHist ? JSON.parse(rawHist) : []);
    } catch {
      setSavedMatches([]);
    }
  }, [profileId, historyKey]);

  // (Auto-refresh on typing removed to prevent unwanted API calls before clicking Generate)

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
        verdictTitle: result.verdictTitle || (typeof result.summary === 'object' ? (result.summary as any)?.verdictTitle : undefined) || 'Kundli Milan',
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
    setLastAutoRefreshedAt(null);
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

    const t3 = setTimeout(async () => {
      try {
        let result = calculateKundliMilan(p1, p2);
        try {
          const backendReport = await calculateMatchReportBackend(p1, p2);
          if (backendReport) {
            result = {
              ...result,
              totalPoints: backendReport.totalPoints ?? (backendReport as any).totalScore ?? result.totalPoints,
              maxPoints: backendReport.maxPoints ?? (backendReport as any).maxScore ?? 36,
              percentage: backendReport.percentage ?? (backendReport.summary as any)?.percentage ?? result.percentage,
              verdictTitle: backendReport.verdictTitle ?? (backendReport.summary as any)?.verdictTitle ?? result.verdictTitle,
              summary: backendReport.summary ?? result.summary,
              partner1ManglikStatus: (backendReport as any).partner1ManglikStatus ?? (backendReport as any).report?.manglik?.status?.partner1,
              partner2ManglikStatus: (backendReport as any).partner2ManglikStatus ?? (backendReport as any).report?.manglik?.status?.partner2,
            } as any;
          }
        } catch (apiErr) {
          console.warn('Backend API calculation fallback:', apiErr);
        }

        setMatchResult(result);
        setAiSynthesis(null);
        saveToHistoryList(result, p1, p2);

        // (AI synthesis is no longer fetched automatically in the background)

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
    customResult?: AshtaKootaMilanResult | null | any,
    p1: UserProfile = partner1,
    p2: UserProfile = partner2,
    forceRefresh: boolean = false
  ) => {
    // Sanitize customResult so React SyntheticMouseEvent is never passed as matchResult
    const validResult = (customResult && typeof customResult === 'object' && 'totalPoints' in customResult)
      ? customResult
      : matchResult;

    if (!validResult || !p1.birthDate || !p2.birthDate) {
      console.warn('Cannot generate AI synthesis without valid matchResult and partner birthDates');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/matchmaking/synthesis`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jyotish_auth_token') || ''}`
        },
        body: JSON.stringify({
          partner1: p1,
          partner2: p2,
          matchResult: validResult,
          language,
          force: forceRefresh,
        }),
      });
      const data = await response.json();
      if ((data.success || data.status === 'success') && data.synthesis) {
        let synth = data.synthesis;
        if (data.synthesisId) {
          setAiSynthesisId(data.synthesisId);
        }
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



  const handleCopyAISynthesis = () => {
    if (!aiSynthesis) return;
    let textToCopy = '';
    if (typeof aiSynthesis === 'object') {
      textToCopy = `JYOTISHVEDA • RELATIONSHIP SYNTHESIS\n` +
        `Partner 1: ${partner1.fullName || 'Partner 1'} | Partner 2: ${partner2.fullName || 'Partner 2'}\n\n` +
        (aiSynthesis.overall_compatibility ? `OVERALL COMPATIBILITY:\n${renderSafeAiText(aiSynthesis.overall_compatibility)}\n\n` : '') +
        (aiSynthesis.guna_milan ? `GUNA MILAN:\n${renderSafeAiText(aiSynthesis.guna_milan)}\n\n` : '') +
        (aiSynthesis.manglik_dosha ? `MANGLIK DOSHA:\n${renderSafeAiText(aiSynthesis.manglik_dosha)}\n\n` : '') +
        (aiSynthesis.nadi_analysis ? `NADI ANALYSIS:\n${renderSafeAiText(aiSynthesis.nadi_analysis)}\n\n` : '') +
        (aiSynthesis.bhakoot_analysis ? `BHAKOOT ANALYSIS:\n${renderSafeAiText(aiSynthesis.bhakoot_analysis)}\n\n` : '') +
        (aiSynthesis.psychological_affinity ? `PSYCHOLOGICAL AFFINITY:\n${renderSafeAiText(aiSynthesis.psychological_affinity)}\n\n` : '') +
        (aiSynthesis.emotional_resonance ? `EMOTIONAL RESONANCE:\n${renderSafeAiText(aiSynthesis.emotional_resonance)}\n\n` : '') +
        (aiSynthesis.karmic_bond ? `KARMIC BOND:\n${renderSafeAiText(aiSynthesis.karmic_bond)}\n\n` : '') +
        (aiSynthesis.physical_harmonization ? `PHYSICAL HARMONIZATION:\n${renderSafeAiText(aiSynthesis.physical_harmonization)}\n\n` : '') +
        (aiSynthesis.family_and_married_life ? `FAMILY & MARRIED LIFE:\n${renderSafeAiText(aiSynthesis.family_and_married_life)}\n\n` : '') +
        (aiSynthesis.wealth_and_prosperity ? `WEALTH & PROSPERITY:\n${renderSafeAiText(aiSynthesis.wealth_and_prosperity)}\n\n` : '') +
        (Array.isArray(aiSynthesis.major_strengths) ? `MAJOR STRENGTHS:\n${aiSynthesis.major_strengths.map((s: any) => `• ${renderSafeAiText(s)}`).join('\n')}\n\n` : '') +
        (Array.isArray(aiSynthesis.major_challenges) ? `POTENTIAL CHALLENGES:\n${aiSynthesis.major_challenges.map((s: any) => `• ${renderSafeAiText(s)}`).join('\n')}\n\n` : '') +
        (Array.isArray(aiSynthesis.conflict_resolution) ? `CONFLICT RESOLUTION:\n${aiSynthesis.conflict_resolution.map((s: any) => `• ${renderSafeAiText(s)}`).join('\n')}\n\n` : '') +
        (Array.isArray(aiSynthesis.vedic_remedies) ? `VEDIC REMEDIES:\n${aiSynthesis.vedic_remedies.map((s: any) => `• ${renderSafeAiText(s)}`).join('\n')}\n\n` : '') +
        (aiSynthesis.final_assessment ? `FINAL ASSESSMENT:\n${renderSafeAiText(aiSynthesis.final_assessment)}\n` : '');
    } else {
      textToCopy = String(aiSynthesis);
    }
    navigator.clipboard.writeText(textToCopy);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadAICounselPDF = async () => {
    if (!aiSynthesis) return;
    setIsGeneratingPdf(true);

    const cleanP1 = (partner1.fullName || 'Partner1').trim().replace(/\s+/g, '_');
    const cleanP2 = (partner2.fullName || 'Partner2').trim().replace(/\s+/g, '_');
    const fileName = `Astrological_Counsel_${cleanP1}_and_${cleanP2}.pdf`;

    // 1. First attempt: Official Backend PDF Engine
    try {
      const token = localStorage.getItem('jyotish_auth_token') || '';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let response: Response | null = null;
      if (aiSynthesisId) {
        response = await fetch(`${API_BASE_URL}/api/matchmaking/ai-synthesis/${aiSynthesisId}/pdf`, {
          method: 'GET',
          headers,
        });
      }
      if (!response || !response.ok) {
        response = await fetch(`${API_BASE_URL}/api/matchmaking/ai-synthesis/generate-pdf`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            synthesisId: aiSynthesisId,
            partner1_name: partner1.fullName || 'Partner 1',
            partner2_name: partner2.fullName || 'Partner 2',
            score: matchResult?.totalPoints ?? 0,
            max_score: matchResult?.maxPoints ?? 36,
            partner1_manglik_status: (matchResult as any)?.partner1ManglikStatus,
            partner2_manglik_status: (matchResult as any)?.partner2ManglikStatus,
            synthesis: aiSynthesis,
          }),
        });
      }

      if (response && response.ok) {
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
      console.warn('Backend AI Counsel PDF endpoint error or offline, falling back to client-side:', apiErr);
    }

    // 2. Client-side fallback jsPDF AI Counsel Report
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth  = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const bgBase64   = await loadImageBase64('/astrologer_bg.jpg');
      const logoBase64 = await loadImageBase64('/jyotishveda_logo.png');

      const san = (text: any): string => {
        if (!text) return '';
        return String(text).replace(/[^\x20-\x7E]/g, '').replace(/\s+/g, ' ').trim();
      };
      const safeAI = (val: any): string => san(renderSafeAiText(val));

      const certId  = `JV-AC-${Date.now().toString(36).toUpperCase()}`;
      const genDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const p1Name  = san(partner1.fullName) || 'Partner A';
      const p2Name  = san(partner2.fullName) || 'Partner B';
      const score   = matchResult ? `${matchResult.totalPoints}/36 (${matchResult.percentage}%)` : 'N/A';

      // ── Shared page chrome ────────────────────────────────────────────────
      const drawChrome = (pageNum: number, totalPages: number) => {
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        if (bgBase64) {
          try {
            if (typeof (doc as any).setGState === 'function' && (doc as any).GState)
              (doc as any).setGState(new (doc as any).GState({ opacity: 0.07 }));
          } catch {}
          doc.addImage(bgBase64, 'JPEG', 0, 0, pageWidth, pageHeight);
          try {
            if (typeof (doc as any).setGState === 'function' && (doc as any).GState)
              (doc as any).setGState(new (doc as any).GState({ opacity: 1.0 }));
          } catch {}
        }
        doc.setDrawColor(201, 160, 80); doc.setLineWidth(1.2);
        doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
        doc.setLineWidth(0.4);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
        doc.setFillColor(201, 160, 80);
        doc.circle(10, 10, 1.2, 'F'); doc.circle(pageWidth - 10, 10, 1.2, 'F');
        doc.circle(10, pageHeight - 10, 1.2, 'F'); doc.circle(pageWidth - 10, pageHeight - 10, 1.2, 'F');
        const footerY = pageHeight - 16;
        doc.setDrawColor(226, 211, 176); doc.setLineWidth(0.4);
        doc.line(13, footerY, pageWidth - 13, footerY);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(110, 110, 110);
        doc.text(`Certificate ID: ${certId}  |  Generated: ${genDate}`, 14, footerY + 5);
        doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 14, footerY + 5, { align: 'right' });
        doc.setFont('helvetica', 'italic'); doc.setFontSize(6.5); doc.setTextColor(140, 130, 100);
        doc.text('JyotishVeda Daivajna AI Engine  |  Vedic Relationship Intelligence', 14, footerY + 9.5);
      };

      // ── Shared section title helper ───────────────────────────────────────
      const sectionTitle = (label: string, xRight: string, y: number) => {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(126, 95, 24);
        doc.text(label, 13, y);
        doc.setFont('helvetica', 'italic'); doc.setFontSize(6.5); doc.setTextColor(150, 120, 55);
        doc.text(xRight, pageWidth - 13, y, { align: 'right' });
      };

      // ── AI synthesis field card helper ────────────────────────────────────
      const drawCard = (title: string, content: string, x: number, y: number, w: number, h: number) => {
        doc.setFillColor(255, 255, 255); doc.setDrawColor(226, 211, 176); doc.setLineWidth(0.35);
        doc.roundedRect(x, y, w, h, 1.5, 1.5, 'FD');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5); doc.setTextColor(126, 95, 24);
        doc.text(title.toUpperCase(), x + 3, y + 5);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(6.8); doc.setTextColor(45, 45, 50);
        const lines = doc.splitTextToSize(content, w - 6);
        doc.text(lines.slice(0, Math.floor((h - 8) / 3.6)), x + 3, y + 9.5);
      };

      // ════════════════════════════════════════════════════════════════════
      // PAGE 1 — Header + Couple Info + Score + Overall + Core Dimensions
      // ════════════════════════════════════════════════════════════════════
      drawChrome(1, 2);

      // Header
      if (logoBase64) doc.addImage(logoBase64, 'PNG', 14, 13, 16, 16);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(19); doc.setTextColor(17, 17, 17);
      doc.text('JYOTISH', 33, 20);
      doc.setTextColor(181, 131, 40);
      doc.text('VEDA', 33 + doc.getTextWidth('JYOTISH') + 0.5, 20);
      doc.setFontSize(8.5); doc.setTextColor(126, 95, 24);
      doc.text('DAIVAJNA DEEP RELATIONSHIP SYNTHESIS & ASTROLOGICAL COUNSEL', 33, 24.5);
      doc.setFont('helvetica', 'italic'); doc.setFontSize(7); doc.setTextColor(100, 95, 85);
      doc.text('Multidimensional Karmic Counsel  |  AI Vedic Intelligence Engine  |  Lahiri Ephemeris', 33, 28);

      let yPos = 33;

      // Couple Info Box
      doc.setFillColor(255, 255, 255); doc.setDrawColor(226, 211, 176); doc.setLineWidth(0.4);
      doc.roundedRect(13, yPos, pageWidth - 26, 22, 2, 2, 'FD');
      doc.line(pageWidth / 2, yPos, pageWidth / 2, yPos + 22);

      doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(126, 95, 24);
      doc.text('GROOM / PARTNER A', 17, yPos + 5.5);
      doc.setFontSize(10.5); doc.setTextColor(26, 26, 30);
      doc.text(p1Name, 17, yPos + 11);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(6.8); doc.setTextColor(80, 80, 80);
      const p1b = `Born: ${san(partner1.birthDate) || 'N/A'}${partner1.birthTime ? ` at ${san(partner1.birthTime)}` : ''}`;
      doc.text(doc.splitTextToSize(p1b, (pageWidth - 36) / 2)[0] || p1b, 17, yPos + 16);
      if (partner1.birthPlace) doc.text(san(partner1.birthPlace).slice(0, 35), 17, yPos + 19.5);

      const col2 = pageWidth / 2 + 5;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(126, 95, 24);
      doc.text('BRIDE / PARTNER B', col2, yPos + 5.5);
      doc.setFontSize(10.5); doc.setTextColor(26, 26, 30);
      doc.text(p2Name, col2, yPos + 11);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(6.8); doc.setTextColor(80, 80, 80);
      const p2b = `Born: ${san(partner2.birthDate) || 'N/A'}${partner2.birthTime ? ` at ${san(partner2.birthTime)}` : ''}`;
      doc.text(doc.splitTextToSize(p2b, (pageWidth - 36) / 2)[0] || p2b, col2, yPos + 16);
      if (partner2.birthPlace) doc.text(san(partner2.birthPlace).slice(0, 35), col2, yPos + 19.5);

      yPos += 26;

      // Score & Report Banner
      doc.setFillColor(255, 255, 255); doc.setDrawColor(201, 160, 80); doc.setLineWidth(0.5);
      doc.roundedRect(13, yPos, pageWidth - 26, 17, 2, 2, 'FD');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(126, 95, 24);
      doc.text('ASHTA KOOTA SCORE', 17, yPos + 6);
      doc.setFontSize(11); doc.setTextColor(181, 131, 40);
      doc.text(score, 17, yPos + 12.5);
      if (matchResult) {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(26, 26, 30);
        doc.text(san(matchResult.verdictTitle).toUpperCase(), pageWidth / 2, yPos + 6.5, { align: 'center' });
        doc.setFont('helvetica', 'italic'); doc.setFontSize(7); doc.setTextColor(90, 85, 70);
        const sLines = doc.splitTextToSize(`"${san(matchResult.summary)}"`, 90);
        doc.text(sLines[0] || '', pageWidth / 2, yPos + 12, { align: 'center' });
      }
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(126, 95, 24);
      doc.text('REPORT TYPE', pageWidth - 17, yPos + 6, { align: 'right' });
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(60, 60, 60);
      doc.text('AI Daivajna Synthesis', pageWidth - 17, yPos + 11, { align: 'right' });

      yPos += 21;

      // Section: Overall Compatibility (wide card)
      if (aiSynthesis?.overall_compatibility) {
        const ocText = safeAI(aiSynthesis.overall_compatibility);
        const ocLines = doc.splitTextToSize(ocText, pageWidth - 34);
        const ocBoxH = Math.min(32, Math.max(18, 9 + ocLines.length * 3.8));
        doc.setFillColor(250, 247, 238); doc.setDrawColor(201, 160, 80); doc.setLineWidth(0.5);
        doc.roundedRect(13, yPos, pageWidth - 26, ocBoxH, 1.5, 1.5, 'FD');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(126, 95, 24);
        doc.text('OVERALL ASTROLOGICAL COMPATIBILITY', 17, yPos + 5.5);
        doc.setFont('helvetica', 'italic'); doc.setFontSize(6.2); doc.setTextColor(155, 125, 60);
        doc.text('Core Vedic Synthesis', pageWidth - 17, yPos + 5.5, { align: 'right' });
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(40, 40, 45);
        doc.text(ocLines.slice(0, 7), 17, yPos + 10);
        yPos += ocBoxH + 4;
      }

      // Section: Core Dimensions 2x2 grid (Guna Milan, Manglik, Nadi, Bhakoot)
      sectionTitle('CORE VEDIC COMPATIBILITY DIMENSIONS', 'Classical Ashta Koota Analysis', yPos);
      yPos += 3;
      const cardW = (pageWidth - 28) / 2;
      const coreCards = [
        { title: 'Guna Milan & Cosmic Alignment',     content: safeAI(aiSynthesis?.guna_milan) },
        { title: 'Manglik (Kuja) Dosha Evaluation',   content: safeAI(aiSynthesis?.manglik_dosha) },
        { title: 'Nadi Koota & Genetic Prana Harmony', content: safeAI(aiSynthesis?.nadi_analysis) },
        { title: 'Bhakoot Harmony & Emotional Rhythm', content: safeAI(aiSynthesis?.bhakoot_analysis) },
      ].filter(c => c.content);

      let col = 0;
      let rowStartY = yPos;
      const cCardH = 36;
      coreCards.forEach((c, i) => {
        col = i % 2;
        if (i > 0 && col === 0) rowStartY += cCardH + 2;
        const cx = 13 + col * (cardW + 2);
        drawCard(c.title, c.content, cx, rowStartY, cardW, cCardH);
      });
      yPos = rowStartY + cCardH + 5;

      // ════════════════════════════════════════════════════════════════════
      // PAGE 2 — Advanced Dimensions + Strengths/Challenges + Remedies + Seal
      // ════════════════════════════════════════════════════════════════════
      doc.addPage();
      drawChrome(2, 2);

      // Compact page 2 header
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(126, 95, 24);
      doc.text('JYOTISHVEDA  •  DAIVAJNA DEEP RELATIONSHIP SYNTHESIS', 14, 17);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(100, 100, 100);
      doc.text(`${p1Name}  &  ${p2Name}  |  Score: ${score}`, pageWidth - 14, 17, { align: 'right' });
      doc.setDrawColor(226, 211, 176); doc.setLineWidth(0.3);
      doc.line(13, 19.5, pageWidth - 13, 19.5);

      let y2 = 24;

      // Advanced Dimensions grid (psychological, emotional, karmic, physical, family, wealth)
      const advCards = [
        { title: 'Psychological & Intellectual Affinity', content: safeAI(aiSynthesis?.psychological_affinity) },
        { title: 'Emotional Resonance & Temperament',     content: safeAI(aiSynthesis?.emotional_resonance) },
        { title: 'Karmic Bond & Destiny Connection',      content: safeAI(aiSynthesis?.karmic_bond) },
        { title: 'Physical Harmonization & Vitality',     content: safeAI(aiSynthesis?.physical_harmonization) },
        { title: 'Family Life & Married Harmony',          content: safeAI(aiSynthesis?.family_and_married_life) },
        { title: 'Wealth, Prosperity & Shared Goals',     content: safeAI(aiSynthesis?.wealth_and_prosperity) },
      ].filter(c => c.content);

      if (advCards.length > 0) {
        sectionTitle('ADVANCED VEDIC DIMENSIONS', 'Multidimensional Karmic Analysis', y2);
        y2 += 3;
        const aCardH = 30;
        const aCardW = (pageWidth - 28) / 2;
        let aRowY = y2;
        advCards.forEach((c, i) => {
          const aC = i % 2;
          if (i > 0 && aC === 0) aRowY += aCardH + 2;
          drawCard(c.title, c.content, 13 + aC * (aCardW + 2), aRowY, aCardW, aCardH);
        });
        y2 = aRowY + aCardH + 5;
      }

      // Major Strengths & Challenges (2-column)
      const strengths  = Array.isArray(aiSynthesis?.major_strengths) ? aiSynthesis.major_strengths.map((s: any) => safeAI(s)).filter(Boolean) : [];
      const challenges = Array.isArray(aiSynthesis?.major_challenges) ? aiSynthesis.major_challenges.map((s: any) => safeAI(s)).filter(Boolean) : [];
      if (strengths.length > 0 || challenges.length > 0) {
        sectionTitle('MAJOR STRENGTHS & POTENTIAL CHALLENGES', 'Jyotish Assessment', y2);
        y2 += 3;
        const scW = (pageWidth - 28) / 2;
        const scH = Math.max(10, 7 + Math.max(strengths.length, challenges.length) * 6.5);
        // Strengths card
        doc.setFillColor(245, 255, 250); doc.setDrawColor(16, 120, 80); doc.setLineWidth(0.35);
        doc.roundedRect(13, y2, scW, scH, 1.5, 1.5, 'FD');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(16, 100, 65);
        doc.text('MAJOR STRENGTHS', 16, y2 + 5);
        strengths.slice(0, 4).forEach((s, i) => {
          doc.setFillColor(16, 120, 80); doc.circle(17, y2 + 10.5 + i * 6.5 - 1.2, 1, 'F');
          doc.setFont('helvetica', 'normal'); doc.setFontSize(6.8); doc.setTextColor(35, 50, 40);
          doc.text(doc.splitTextToSize(s, scW - 9)[0] || s, 20, y2 + 10.5 + i * 6.5);
        });
        // Challenges card
        const c2X = 13 + scW + 2;
        doc.setFillColor(255, 250, 245); doc.setDrawColor(180, 80, 40); doc.setLineWidth(0.35);
        doc.roundedRect(c2X, y2, scW, scH, 1.5, 1.5, 'FD');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(160, 65, 30);
        doc.text('POTENTIAL CHALLENGES', c2X + 3, y2 + 5);
        challenges.slice(0, 4).forEach((s, i) => {
          doc.setFillColor(180, 80, 40); doc.circle(c2X + 4, y2 + 10.5 + i * 6.5 - 1.2, 1, 'F');
          doc.setFont('helvetica', 'normal'); doc.setFontSize(6.8); doc.setTextColor(55, 35, 25);
          doc.text(doc.splitTextToSize(s, scW - 9)[0] || s, c2X + 7, y2 + 10.5 + i * 6.5);
        });
        y2 += scH + 5;
      }

      // Vedic Remedies
      const vedRemeds = Array.isArray(aiSynthesis?.vedic_remedies) ? aiSynthesis.vedic_remedies.map((r: any) => safeAI(r)).filter(Boolean) :
                        Array.isArray(aiSynthesis?.conflict_resolution) ? aiSynthesis.conflict_resolution.map((r: any) => safeAI(r)).filter(Boolean) : [];
      if (vedRemeds.length > 0 && y2 + 40 < pageHeight - 22) {
        sectionTitle('VEDIC REMEDIES & CONFLICT RESOLUTION', 'Shanti Upaya Prescriptions', y2);
        y2 += 3;
        const rBoxH = Math.min(40, 8 + vedRemeds.slice(0, 5).length * 7);
        doc.setFillColor(255, 255, 255); doc.setDrawColor(201, 160, 80); doc.setLineWidth(0.4);
        doc.roundedRect(13, y2, pageWidth - 26, rBoxH, 1.5, 1.5, 'FD');
        vedRemeds.slice(0, 5).forEach((rem, i) => {
          const rY = y2 + 6 + i * 7;
          doc.setFillColor(181, 131, 40); doc.circle(17, rY - 1.2, 1, 'F');
          doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(40, 40, 45);
          doc.text(doc.splitTextToSize(rem, pageWidth - 44)[0] || rem, 20, rY);
        });
        y2 += rBoxH + 5;
      }

      // Final Assessment
      if (aiSynthesis?.final_assessment && y2 + 22 < pageHeight - 22) {
        const faText = safeAI(aiSynthesis.final_assessment);
        const faLines = doc.splitTextToSize(faText, pageWidth - 34);
        const faBoxH = Math.min(30, Math.max(16, 9 + faLines.length * 3.8));
        doc.setFillColor(250, 247, 238); doc.setDrawColor(201, 160, 80); doc.setLineWidth(0.4);
        doc.roundedRect(13, y2, pageWidth - 26, faBoxH, 1.5, 1.5, 'FD');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(126, 95, 24);
        doc.text('FINAL DAIVAJNA ASSESSMENT', 17, y2 + 5.5);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(40, 38, 32);
        doc.text(faLines.slice(0, 6), 17, y2 + 10);
        y2 += faBoxH + 5;
      }

      // Authentication Seal
      if (y2 + 18 < pageHeight - 22) {
        doc.setFillColor(250, 247, 238); doc.setDrawColor(201, 160, 80); doc.setLineWidth(0.5);
        doc.roundedRect(13, y2, pageWidth - 26, 16, 2, 2, 'FD');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(126, 95, 24);
        doc.text('DAIVAJNA ASTROLOGICAL AUTHENTICITY SEAL', pageWidth / 2, y2 + 6.5, { align: 'center' });
        doc.setFont('helvetica', 'italic'); doc.setFontSize(6.8); doc.setTextColor(90, 85, 70);
        doc.text(
          '"Om Shri Gurubhyo Namah — This sacred relationship synthesis was generated through JyotishVeda AI Intelligence aligned with classical Vedic Jyotish sutras and Lahiri Ayanamsa."',
          pageWidth / 2, y2 + 11.5, { align: 'center', maxWidth: pageWidth - 36 }
        );
      }

      doc.save(fileName);
    } catch (err) {
      console.error('Fatal AI Counsel PDF generation error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

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

  // Premium 2-Page Client-Side PDF Generation (direct, skipping backend plain PDF)
  const handleDownloadPDF = async () => {
    if (!matchResult) return;
    setIsGeneratingPdf(true);

    const cleanP1 = (partner1.fullName || 'Partner1').trim().replace(/\s+/g, '_');
    const cleanP2 = (partner2.fullName || 'Partner2').trim().replace(/\s+/g, '_');
    const fileName = `Kundli_Milan_${cleanP1}_and_${cleanP2}.pdf`;

    // 1. First attempt: Official Backend PDF Engine (ReportLab 5-page Kundli Milan Dossier)
    try {
      const token = localStorage.getItem('jyotish_auth_token') || '';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const p1Tz = (partner1 as any).timezoneIana || 'Asia/Kolkata';
      const p2Tz = (partner2 as any).timezoneIana || 'Asia/Kolkata';

      const response = await fetch(`${API_BASE_URL}/api/matchmaking/generate-pdf`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          partner1: {
            fullName: partner1.fullName || 'Partner 1',
            birthDate: partner1.birthDate || '',
            birthTime: partner1.birthTime || '12:00',
            birthPlace: partner1.birthPlace || 'Delhi, India',
            latitude: partner1.latitude || 28.6139,
            longitude: partner1.longitude || 77.2090,
            timezone: p1Tz,
          },
          partner2: {
            fullName: partner2.fullName || 'Partner 2',
            birthDate: partner2.birthDate || '',
            birthTime: partner2.birthTime || '12:00',
            birthPlace: partner2.birthPlace || 'Mumbai, India',
            latitude: partner2.latitude || 19.0760,
            longitude: partner2.longitude || 72.8777,
            timezone: p2Tz,
          },
          matchResult,
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
      } else {
        const errJson = await response.json().catch(() => null);
        console.error('Backend PDF generation failed:', response.status, errJson);
      }
    } catch (apiErr) {
      console.warn('Backend Kundli Milan PDF endpoint error or offline, falling back to client-side:', apiErr);
    }

    // 2. Client-side fallback jsPDF
    {
      console.log('Generating client-side fallback Kundli Milan PDF...');
      try {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();   // 210mm
        const pageHeight = doc.internal.pageSize.getHeight(); // 297mm

        // ── Load Assets ──────────────────────────────────────────────────
        const bgBase64   = await loadImageBase64('/astrologer_bg.jpg');
        const logoBase64 = await loadImageBase64('/jyotishveda_logo.png');

        // ASCII Sanitization Helper (matching other pages)
        const sanitize = (text: any): string => {
          if (!text) return '';
          return String(text).replace(/[^\x20-\x7E]/g, '').replace(/\s+/g, ' ').trim();
        };

        const certId  = `JV-KM-${Date.now().toString(36).toUpperCase()}`;
        const genDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        // ── Helper: draw shared page chrome (bg, border, footer) ─────────
        const drawPageChrome = (pageNum: number, totalPages: number) => {
          // White base
          doc.setFillColor(255, 255, 255);
          doc.rect(0, 0, pageWidth, pageHeight, 'F');
          // Subtle astrologer watermark
          if (bgBase64) {
            try {
              if (typeof (doc as any).setGState === 'function' && (doc as any).GState)
                (doc as any).setGState(new (doc as any).GState({ opacity: 0.07 }));
            } catch {}
            doc.addImage(bgBase64, 'JPEG', 0, 0, pageWidth, pageHeight);
            try {
              if (typeof (doc as any).setGState === 'function' && (doc as any).GState)
                (doc as any).setGState(new (doc as any).GState({ opacity: 1.0 }));
            } catch {}
          }
          // Outer golden double border
          doc.setDrawColor(201, 160, 80); doc.setLineWidth(1.2);
          doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
          doc.setLineWidth(0.4);
          doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
          // Corner gold dots
          doc.setFillColor(201, 160, 80);
          doc.circle(10, 10, 1.2, 'F');
          doc.circle(pageWidth - 10, 10, 1.2, 'F');
          doc.circle(10, pageHeight - 10, 1.2, 'F');
          doc.circle(pageWidth - 10, pageHeight - 10, 1.2, 'F');
          // Footer divider
          const footerY = pageHeight - 16;
          doc.setDrawColor(226, 211, 176); doc.setLineWidth(0.4);
          doc.line(13, footerY, pageWidth - 13, footerY);
          doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(110, 110, 110);
          doc.text(`Certificate ID: ${certId}  |  Generated: ${genDate}`, 14, footerY + 5);
          doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 14, footerY + 5, { align: 'right' });
          doc.setFont('helvetica', 'italic'); doc.setFontSize(6.5); doc.setTextColor(140, 130, 100);
          doc.text('JyotishVeda Daivajna AstroEngine  |  Certified via Classical Ephemeris', 14, footerY + 9.5);
        };

        // ── Helper: draw shared page header ──────────────────────────────
        const drawPageHeader = (isFirstPage: boolean) => {
          if (isFirstPage) {
            if (logoBase64) doc.addImage(logoBase64, 'PNG', 14, 13, 16, 16);
            doc.setFont('helvetica', 'bold'); doc.setFontSize(19); doc.setTextColor(17, 17, 17);
            doc.text('JYOTISH', 33, 20);
            doc.setTextColor(181, 131, 40);
            doc.text('VEDA', 33 + doc.getTextWidth('JYOTISH') + 0.5, 20);
            doc.setFontSize(8.5); doc.setTextColor(126, 95, 24);
            doc.text('VEDIC KUNDLI MILAN & ASHTA KOOTA COMPATIBILITY CERTIFICATE', 33, 24.5);
            doc.setFont('helvetica', 'italic'); doc.setFontSize(7); doc.setTextColor(100, 95, 85);
            doc.text('Calculated in accordance with Brihat Parashara Hora Shastra & Classical Jyotish Sutras', 33, 28);
          } else {
            // Compact header for page 2+
            doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(126, 95, 24);
            doc.text('JYOTISHVEDA  •  KUNDLI MILAN & ASHTA KOOTA COMPATIBILITY REPORT', 14, 17);
            doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(100, 100, 100);
            doc.text(
              `${sanitize(partner1.fullName) || 'Partner A'}  &  ${sanitize(partner2.fullName) || 'Partner B'}  |  Score: ${matchResult.totalPoints}/36 (${matchResult.percentage}%)`,
              pageWidth - 14, 17, { align: 'right' }
            );
            doc.setDrawColor(226, 211, 176); doc.setLineWidth(0.3);
            doc.line(13, 19.5, pageWidth - 13, 19.5);
          }
        };

        // ════════════════════════════════════════════════════════════════
        // PAGE 1 — Cover + Couple Info + Score Banner + Ashta Koota Table
        // ════════════════════════════════════════════════════════════════
        drawPageChrome(1, 2);
        drawPageHeader(true);

        let yPos = 33;

        // ── Couple Information Box (2-column) ────────────────────────────
        doc.setFillColor(255, 255, 255); doc.setDrawColor(226, 211, 176); doc.setLineWidth(0.4);
        doc.roundedRect(13, yPos, pageWidth - 26, 26, 2, 2, 'FD');
        doc.line(pageWidth / 2, yPos, pageWidth / 2, yPos + 26);

        // Partner 1
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(126, 95, 24);
        doc.text('GROOM / PARTNER A', 17, yPos + 5.5);
        doc.setFontSize(11); doc.setTextColor(26, 26, 30);
        doc.text(sanitize(partner1.fullName) || 'Person A', 17, yPos + 11);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(80, 80, 80);
        const p1Born = `Born: ${sanitize(partner1.birthDate) || 'N/A'}${partner1.birthTime ? ` at ${sanitize(partner1.birthTime)}` : ''}`;
        doc.text(doc.splitTextToSize(p1Born, (pageWidth - 36) / 2)[0] || p1Born, 17, yPos + 16);
        if (partner1.birthPlace) {
          doc.text(doc.splitTextToSize(sanitize(partner1.birthPlace), (pageWidth - 36) / 2)[0] || '', 17, yPos + 20.5);
        }

        // Partner 2
        const col2X = pageWidth / 2 + 5;
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(126, 95, 24);
        doc.text('BRIDE / PARTNER B', col2X, yPos + 5.5);
        doc.setFontSize(11); doc.setTextColor(26, 26, 30);
        doc.text(sanitize(partner2.fullName) || 'Person B', col2X, yPos + 11);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(80, 80, 80);
        const p2Born = `Born: ${sanitize(partner2.birthDate) || 'N/A'}${partner2.birthTime ? ` at ${sanitize(partner2.birthTime)}` : ''}`;
        doc.text(doc.splitTextToSize(p2Born, (pageWidth - 36) / 2)[0] || p2Born, col2X, yPos + 16);
        if (partner2.birthPlace) {
          doc.text(doc.splitTextToSize(sanitize(partner2.birthPlace), (pageWidth - 36) / 2)[0] || '', col2X, yPos + 20.5);
        }

        yPos += 30;

        // ── Score & Verdict Banner ───────────────────────────────────────
        doc.setFillColor(255, 255, 255); doc.setDrawColor(201, 160, 80); doc.setLineWidth(0.5);
        doc.roundedRect(13, yPos, pageWidth - 26, 30, 2, 2, 'FD');

        // Score circle/badge at left
        doc.setFillColor(250, 246, 235); doc.setDrawColor(201, 160, 80); doc.setLineWidth(0.8);
        doc.circle(36, yPos + 15, 12, 'FD');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(126, 95, 24);
        doc.text(String(matchResult.totalPoints), 36, yPos + 12.5, { align: 'center' });
        doc.setFontSize(6); doc.setTextColor(140, 105, 30);
        doc.text('/ 36', 36, yPos + 17.5, { align: 'center' });
        doc.setFontSize(5); doc.setTextColor(160, 130, 60);
        doc.text('GUNAS', 36, yPos + 21, { align: 'center' });

        // Score details (right of badge)
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(126, 95, 24);
        doc.text('TOTAL ASHTA KOOTA COMPATIBILITY SCORE', 52, yPos + 6);
        doc.setFontSize(15); doc.setTextColor(181, 131, 40);
        doc.text(`${matchResult.percentage}%`, 52, yPos + 15);
        doc.setFontSize(9); doc.setTextColor(26, 26, 30);
        doc.text(sanitize(matchResult.verdictTitle).toUpperCase(), 52, yPos + 20.5);
        doc.setFont('helvetica', 'italic'); doc.setFontSize(7); doc.setTextColor(90, 85, 75);
        const verdictSummaryLines = doc.splitTextToSize(`"${sanitize(matchResult.summary)}"`, pageWidth - 80);
        doc.text(verdictSummaryLines.slice(0, 2), 52, yPos + 25);

        yPos += 34;

        // ── Ashta Koota Table ────────────────────────────────────────────
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(126, 95, 24);
        doc.text('ASHTA KOOTA MILAN — DETAILED GUNA POINTS BREAKDOWN', 13, yPos);
        doc.setFont('helvetica', 'italic'); doc.setFontSize(6.5); doc.setTextColor(140, 115, 55);
        doc.text('Classical 8-fold Vedic compatibility analysis | Lahiri Ayanamsa Sidereal Calculation', pageWidth - 13, yPos, { align: 'right' });
        yPos += 3;

        // Table header row
        doc.setFillColor(250, 247, 240); doc.setDrawColor(201, 160, 80); doc.setLineWidth(0.3);
        doc.roundedRect(13, yPos, pageWidth - 26, 7, 1, 1, 'FD');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(126, 95, 24);
        doc.text('Koota (Factor)', 16, yPos + 4.8);
        doc.text('Area of Life', 58, yPos + 4.8);
        const p1Short = sanitize(partner1.fullName || '').split(' ')[0] || 'P1';
        const p2Short = sanitize(partner2.fullName || '').split(' ')[0] || 'P2';
        doc.text(p1Short, 122, yPos + 4.8, { align: 'center' });
        doc.text(p2Short, 148, yPos + 4.8, { align: 'center' });
        doc.text('Score', pageWidth - 15, yPos + 4.8, { align: 'right' });
        yPos += 8;

        // Table rows (8 kootas)
        matchResult.kootas.forEach((k, idx) => {
          const rowH = 8;
          if (idx % 2 === 0) {
            doc.setFillColor(255, 255, 255);
          } else {
            doc.setFillColor(252, 250, 245);
          }
          doc.setDrawColor(232, 222, 195); doc.setLineWidth(0.25);
          doc.roundedRect(13, yPos, pageWidth - 26, rowH, 0.5, 0.5, 'FD');

          // Koota name
          doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(26, 26, 30);
          doc.text(sanitize(k.name), 16, yPos + 5.2);

          // Max points badge
          doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(150, 130, 80);
          doc.text(`(max ${k.maxPoints})`, 16 + doc.getTextWidth(sanitize(k.name)) + 1.2, yPos + 5.2);

          // Area
          doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(80, 75, 65);
          doc.text((sanitize(k.area) || '').slice(0, 30), 58, yPos + 5.2);

          // P1 & P2 values
          doc.setFont('helvetica', 'normal'); doc.setFontSize(7.2); doc.setTextColor(60, 60, 65);
          doc.text(sanitize(String(k.p1Value || '-')), 122, yPos + 5.2, { align: 'center' });
          doc.text(sanitize(String(k.p2Value || '-')), 148, yPos + 5.2, { align: 'center' });

          // Score (colored by performance)
          const ratio = k.obtainedPoints / k.maxPoints;
          if (ratio >= 0.67) doc.setTextColor(16, 120, 80);
          else if (ratio >= 0.4) doc.setTextColor(181, 131, 40);
          else doc.setTextColor(180, 60, 50);
          doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
          doc.text(`${k.obtainedPoints}/${k.maxPoints}`, pageWidth - 15, yPos + 5.2, { align: 'right' });

          yPos += rowH + 1.5;
        });

        // Total row
        doc.setFillColor(248, 244, 232); doc.setDrawColor(201, 160, 80); doc.setLineWidth(0.5);
        doc.roundedRect(13, yPos, pageWidth - 26, 9, 1, 1, 'FD');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(126, 95, 24);
        doc.text('TOTAL GUNAS MATCHED', 16, yPos + 6);
        doc.setFontSize(10); doc.setTextColor(181, 131, 40);
        doc.text(`${matchResult.totalPoints} / 36  (${matchResult.percentage}%)`, pageWidth - 15, yPos + 6.2, { align: 'right' });

        // ════════════════════════════════════════════════════════════════
        // PAGE 2 — Dosha + Numerology + AI Synthesis + Remedies + Seal
        // ════════════════════════════════════════════════════════════════
        doc.addPage();
        drawPageChrome(2, 2);
        drawPageHeader(false);

        let y2 = 25;

        // ── Section 1: Critical Dosha & Vitality Assessment (3-column) ──
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(126, 95, 24);
        doc.text('CRITICAL DOSHA & VITALITY ASSESSMENT', 13, y2);
        doc.setFont('helvetica', 'italic'); doc.setFontSize(6.5); doc.setTextColor(140, 115, 55);
        doc.text('Manglik (Kuja) Dosha  |  Nadi Dosha  |  Bhakoot Dosha', pageWidth - 13, y2, { align: 'right' });
        y2 += 3;

        const doshaColW = (pageWidth - 30) / 3;
        const doshaBoxH = 30;

        // Manglik Dosha card
        doc.setFillColor(255, 255, 255); doc.setDrawColor(226, 211, 176); doc.setLineWidth(0.4);
        doc.roundedRect(13, y2, doshaColW, doshaBoxH, 1.5, 1.5, 'FD');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(126, 95, 24);
        doc.text('MANGLIK (KUJA) DOSHA', 16, y2 + 5.5);
        doc.setFontSize(8); doc.setTextColor(26, 26, 30);
        doc.text(sanitize(matchResult.manglik.verdict), 16, y2 + 11);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(80, 80, 80);
        const manglikLines = doc.splitTextToSize(sanitize(matchResult.manglik.explanation), doshaColW - 6);
        doc.text(manglikLines.slice(0, 4), 16, y2 + 16);

        // Nadi Dosha card
        const d2X = 13 + doshaColW + 2;
        doc.setFillColor(255, 255, 255); doc.setDrawColor(226, 211, 176); doc.setLineWidth(0.4);
        doc.roundedRect(d2X, y2, doshaColW, doshaBoxH, 1.5, 1.5, 'FD');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(126, 95, 24);
        doc.text('NADI DOSHA (GENETIC VITALITY)', d2X + 3, y2 + 5.5);
        doc.setFontSize(8); doc.setTextColor(26, 26, 30);
        doc.text(matchResult.nadiDosha.hasDosha ? 'Dosha Present' : 'No Nadi Dosha', d2X + 3, y2 + 11);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(80, 80, 80);
        const nadiLines = doc.splitTextToSize(sanitize(matchResult.nadiDosha.reason), doshaColW - 6);
        doc.text(nadiLines.slice(0, 4), d2X + 3, y2 + 16);

        // Bhakoot Dosha card
        const d3X = 13 + 2 * (doshaColW + 2);
        doc.setFillColor(255, 255, 255); doc.setDrawColor(226, 211, 176); doc.setLineWidth(0.4);
        doc.roundedRect(d3X, y2, doshaColW, doshaBoxH, 1.5, 1.5, 'FD');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(126, 95, 24);
        doc.text('BHAKOOT DOSHA (EMOTIONAL)', d3X + 3, y2 + 5.5);
        doc.setFontSize(8); doc.setTextColor(26, 26, 30);
        doc.text(matchResult.bhakootDosha.hasDosha ? 'Dosha Present' : 'Harmonious', d3X + 3, y2 + 11);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(80, 80, 80);
        const bhakootLines = doc.splitTextToSize(sanitize(matchResult.bhakootDosha.reason), doshaColW - 6);
        doc.text(bhakootLines.slice(0, 4), d3X + 3, y2 + 16);

        y2 += doshaBoxH + 5;

        // ── Section 2: Numerology & Elemental Synergy (2-column) ─────────
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(126, 95, 24);
        doc.text('NUMEROLOGY & ELEMENTAL SYNERGY ANALYSIS', 13, y2);
        y2 += 3;

        const synColW = (pageWidth - 28) / 2;
        const synBoxH = 26;

        // Numerology Milan card
        doc.setFillColor(255, 255, 255); doc.setDrawColor(226, 211, 176); doc.setLineWidth(0.4);
        doc.roundedRect(13, y2, synColW, synBoxH, 1.5, 1.5, 'FD');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(126, 95, 24);
        doc.text('NUMEROLOGICAL MULANK MILAN', 16, y2 + 5.5);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.2); doc.setTextColor(26, 26, 30);
        const numMulanks = `${p1Short}: Mulank ${matchResult.numerologyMilan?.partner1Mulank ?? '-'}   |   ${p2Short}: Mulank ${matchResult.numerologyMilan?.partner2Mulank ?? '-'}`;
        doc.text(numMulanks, 16, y2 + 11);
        doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(181, 131, 40);
        doc.text(`Harmony Score: ${matchResult.numerologyMilan?.harmonyScore ?? '-'}%`, 16, y2 + 16.5);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(80, 80, 80);
        const numDesc = sanitize(matchResult.numerologyMilan?.description || 'Numerological vibration alignment between partners.');
        doc.text(doc.splitTextToSize(numDesc, synColW - 6).slice(0, 3), 16, y2 + 21);

        // Elemental Balance card
        const e2X = 13 + synColW + 2;
        doc.setFillColor(255, 255, 255); doc.setDrawColor(226, 211, 176); doc.setLineWidth(0.4);
        doc.roundedRect(e2X, y2, synColW, synBoxH, 1.5, 1.5, 'FD');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(126, 95, 24);
        doc.text('PANCHA BHUTA ELEMENTAL BALANCE', e2X + 3, y2 + 5.5);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(181, 131, 40);
        doc.text(`Synergy: ${sanitize(matchResult.elementalBalance?.synergy || 'Balanced')}  (${matchResult.elementalBalance?.score ?? '-'}%)`, e2X + 3, y2 + 11);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(80, 80, 80);
        const elemDesc = sanitize(`${matchResult.elementalBalance?.partner1Element || 'Element A'} & ${matchResult.elementalBalance?.partner2Element || 'Element B'} — Five-element cosmic balance between the couple.`);
        doc.text(doc.splitTextToSize(elemDesc, synColW - 6).slice(0, 3), e2X + 3, y2 + 16.5);
        doc.setFontSize(7.2); doc.setTextColor(126, 95, 24); doc.setFont('helvetica', 'bold');
        const elemScore = matchResult.elementalBalance?.score ?? 0;
        const elemVerdict = elemScore >= 75 ? 'Highly Auspicious' : elemScore >= 50 ? 'Moderately Compatible' : 'Needs Attention';
        doc.text(elemVerdict, e2X + 3, y2 + 22);

        y2 += synBoxH + 5;

        // ── Section 3: AI Planetary Synthesis Card ───────────────────────
        const aiText = sanitize(
          typeof aiSynthesis === 'string'
            ? aiSynthesis
            : (aiSynthesis as any)?.synthesis || (aiSynthesis as any)?.summary || ''
        );
        if (aiText) {
          doc.setFillColor(255, 255, 255); doc.setDrawColor(201, 160, 80); doc.setLineWidth(0.4);
          const aiLines   = doc.splitTextToSize(aiText, pageWidth - 34);
          const aiBoxH    = Math.min(48, Math.max(22, 10 + aiLines.length * 3.8));
          doc.roundedRect(13, y2, pageWidth - 26, aiBoxH, 1.5, 1.5, 'FD');
          doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(126, 95, 24);
          doc.text('AI VEDIC PLANETARY SYNTHESIS & PARTNERSHIP COUNSEL', 17, y2 + 5.5);
          doc.setFont('helvetica', 'italic'); doc.setFontSize(6.2); doc.setTextColor(155, 125, 60);
          doc.text('Personalized Jyotish Intelligence | Daivajna Analysis Engine', pageWidth - 17, y2 + 5.5, { align: 'right' });
          doc.setFont('helvetica', 'normal'); doc.setFontSize(6.8); doc.setTextColor(45, 45, 50);
          doc.text(aiLines.slice(0, 10), 17, y2 + 10);
          y2 += aiBoxH + 5;
        }

        // ── Section 4: Auspicious Vedic Remedies & Guidance ─────────────
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(126, 95, 24);
        doc.text('AUSPICIOUS VEDIC REMEDIES & SHANTI UPAYAS', 13, y2);
        doc.setFont('helvetica', 'italic'); doc.setFontSize(6.5); doc.setTextColor(140, 115, 55);
        doc.text('Classical Jyotish prescriptions for harmonious union', pageWidth - 13, y2, { align: 'right' });
        y2 += 3;

        const remedyBoxH = Math.min(45, 8 + matchResult.remedies.slice(0, 5).length * 7.5);
        doc.setFillColor(255, 255, 255); doc.setDrawColor(201, 160, 80); doc.setLineWidth(0.4);
        doc.roundedRect(13, y2, pageWidth - 26, remedyBoxH, 1.5, 1.5, 'FD');

        matchResult.remedies.slice(0, 5).forEach((rem, i) => {
          const rY = y2 + 6 + i * 7.5;
          // Small golden bullet
          doc.setFillColor(181, 131, 40); doc.circle(17, rY - 1.2, 1, 'F');
          doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(40, 40, 45);
          const remLines = doc.splitTextToSize(sanitize(rem), pageWidth - 44);
          doc.text(remLines[0] || '', 20, rY);
          if (remLines[1]) doc.text(remLines[1], 20, rY + 3.5);
        });

        y2 += remedyBoxH + 5;

        // ── Section 5: Muhurat Guidance ──────────────────────────────────
        if (matchResult.auspiciousMuhuratAdvice && y2 + 18 < pageHeight - 25) {
          doc.setFillColor(250, 247, 238); doc.setDrawColor(201, 160, 80); doc.setLineWidth(0.4);
          doc.roundedRect(13, y2, pageWidth - 26, 16, 1.5, 1.5, 'FD');
          doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(126, 95, 24);
          doc.text('AUSPICIOUS MUHURAT GUIDANCE FOR WEDDING DATE SELECTION', 17, y2 + 5.5);
          doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(55, 50, 45);
          const muhuratLines = doc.splitTextToSize(sanitize(matchResult.auspiciousMuhuratAdvice), pageWidth - 34);
          doc.text(muhuratLines.slice(0, 2), 17, y2 + 10.5);
          y2 += 20;
        }

        // ── Section 6: Authentication Seal ──────────────────────────────
        if (y2 + 20 < pageHeight - 22) {
          doc.setFillColor(250, 247, 238); doc.setDrawColor(201, 160, 80); doc.setLineWidth(0.5);
          doc.roundedRect(13, y2, pageWidth - 26, 18, 2, 2, 'FD');
          doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(126, 95, 24);
          doc.text('DAIVAJNA ASTROLOGICAL AUTHENTICITY SEAL', pageWidth / 2, y2 + 6.5, { align: 'center' });
          doc.setFont('helvetica', 'italic'); doc.setFontSize(7); doc.setTextColor(90, 85, 70);
          doc.text(
            '"Om Shri Gurubhyo Namah — This sacred Kundli Milan has been computed through classical Vedic AstroEngine aligned with Lahiri Ayanamsa, Brihat Parashara Hora Shastra, and traditional Ashta Koota sutras."',
            pageWidth / 2, y2 + 12, { align: 'center', maxWidth: pageWidth - 36 }
          );
        }

        doc.save(fileName);
      } catch (clientErr) {
        console.error('Fatal PDF generation error:', clientErr);
      }
    }
    setIsGeneratingPdf(false);
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
Issued by JyotishVeda Daivajna Astrological Intelligence Engine
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
    <div className="space-y-8 animate-fadeIn w-full">
      {/* Header Banner */}
      <div className={`${
        theme === 'dark' 
          ? 'bg-[#141418] border-[#2A2A2E]' 
          : 'bg-white border-[#E5E1D8] shadow-sm'
      } border rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A050]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#C9A050]/20 to-transparent border border-[#C9A050]/30 text-[#C9A050] text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3 backdrop-blur-md shadow-[0_0_15px_rgba(201,160,80,0.15)]">
              <HeartHandshake className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C9A050]" />
              <span>{t('matchmaking.title')}</span>
            </div>
            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-serif font-bold leading-tight ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
              Kundli Milan &amp; Relationship Compatibility
            </h1>
            <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} mt-2.5 max-w-2xl leading-relaxed`}>
              Authentic Ashta Koota 36 Gunas calculation, Manglik (Kuja) Dosha balance, Nadi vitality, and Western synastry synthesis for marriage, love, and life partnerships.
            </p>
          </div>

          {/* Action Row: Saved Matches History, New Match, Direct PDF Download */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Saved Matches History Button */}
            <button
              type="button"
              onClick={() => setIsHistoryModalOpen(true)}
              className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[#1A1A1E] border-[#2A2A2E] text-[#E5E1D8] hover:border-[#C9A050]/50 hover:bg-[#222228]'
                  : 'bg-[#F9F7F1] border-[#E5E1D8] text-[#2A2A2E] hover:border-[#C9A050] hover:bg-[#F0ECE1]'
              }`}
              title="View saved matchmaking reports"
            >
              <FileText className="w-4 h-4 text-[#C9A050]" />
              <span>Saved Matches</span>
              {savedMatches.length > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-[#C9A050]/20 text-[#C9A050]">
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
              disabled={isGeneratingPdf}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border text-xs font-bold transition shadow-lg cursor-pointer shrink-0 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-[#C9A050] to-[#A07828] hover:from-[#D4AF37] hover:to-[#B38730] text-[#0D0D0F] border-[#C9A050] shadow-[#C9A050]/20'
                  : 'bg-[#C9A050] hover:bg-[#B38730] text-white border-[#C9A050] shadow-[#C9A050]/20'
              } disabled:opacity-50`}
              title="Download Match Report (PDF)"
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
      </div>

      {/* 2-Column Grid: Partner 1 & Partner 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Partner 1 Card */}
        <div id="partner-card-1" className={`rounded-2xl p-6 sm:p-8 shadow-sm border ${
          theme === 'dark' 
            ? 'bg-[#141418] border-[#2A2A2E]' 
            : 'bg-white border-[#E5E1D8] shadow-sm'
        } relative flex flex-col justify-between`}>
          <div>
            <div className={`flex items-center justify-between mb-5 pb-3.5 border-b ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm border matchmaking-avatar-a shadow-sm">
                  A
                </div>
                <div>
                  <h3 className={`text-base sm:text-lg font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                    {t('matchmaking.partner1')}
                  </h3>
                </div>
              </div>

              {isP1Saved && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#C9A050]/20 text-[#C9A050] border border-[#C9A050]/40 shadow-sm">
                  <Check className="w-3.5 h-3.5 text-[#C9A050] stroke-[2.5]" />
                  <span>Saved</span>
                </span>
              )}
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className={`block mb-1.5 text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>Full Name</label>
                <input
                  type="text"
                  disabled={isP1Saved}
                  placeholder="Enter Groom / Person A Name"
                  value={partner1.fullName}
                  onChange={(e) => setPartner1({ ...partner1, fullName: e.target.value })}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm border outline-none transition ${
                    theme === 'dark'
                      ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8] placeholder:text-gray-600 focus:border-[#C9A050]'
                      : 'bg-white border-[#E5E1D8] text-[#0D0D0F] placeholder:text-[#9E9A90] focus:border-[#C9A050] focus:ring-1 focus:ring-[#C9A050]/20'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                />
              </div>

              {/* Birth Date & Time Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Birth Date */}
                <div>
                  <label className={`block mb-1.5 text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>Date of Birth</label>
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
                  <label className={`block mb-1.5 text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>Birth Time</label>
                  <VedicTimePicker
                    value={partner1.birthTime}
                    onChange={(newTime) => setPartner1({ ...partner1, birthTime: newTime })}
                    disabled={isP1Saved}
                    theme={theme}
                    placeholder="HH:MM"
                  />
                </div>
              </div>

              {/* Birth City */}
              <div>
                <label className={`block mb-1.5 text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>Birth City / Country</label>
                <input
                  type="text"
                  disabled={isP1Saved}
                  placeholder="e.g. Kolkata, India"
                  value={partner1.birthPlace}
                  onChange={(e) => setPartner1({ ...partner1, birthPlace: e.target.value })}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm border outline-none transition ${
                    theme === 'dark'
                      ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8] placeholder:text-gray-600 focus:border-[#C9A050]'
                      : 'bg-white border-[#E5E1D8] text-[#0D0D0F] placeholder:text-[#9E9A90] focus:border-[#C9A050]'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                />
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className={`pt-4 flex items-center justify-end border-t ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'} mt-6`}>
            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={() => setIsP1Saved(false)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition shadow-sm cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[#1A1A1E] border-[#2A2A2E] text-[#E5E1D8] hover:text-white'
                    : 'bg-[#F9F7F1] border-[#E5E1D8] text-[#2A2A2E] hover:bg-[#F0ECE1]'
                }`}
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
                className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center ${
                  isP1Saved
                    ? 'bg-[#C9A050] text-[#0D0D0F] border border-[#A67C28] shadow-[#C9A050]/25'
                    : 'bg-[#C9A050] hover:bg-[#D4AF37] text-[#0D0D0F] shadow-[#C9A050]/20 hover:scale-[1.02]'
                }`}
              >
                <span>{isP1Saved ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Partner 2 Card */}
        <div id="partner-card-2" className={`rounded-2xl p-6 sm:p-8 shadow-sm border ${
          theme === 'dark' 
            ? 'bg-[#141418] border-[#2A2A2E]' 
            : 'bg-white border-[#E5E1D8] shadow-sm'
        } relative flex flex-col justify-between`}>
          <div>
            <div className={`flex items-center justify-between mb-5 pb-3.5 border-b ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm border matchmaking-avatar-b shadow-sm">
                  B
                </div>
                <div>
                  <h3 className={`text-base sm:text-lg font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                    {t('matchmaking.partner2')}
                  </h3>
                </div>
              </div>

              {isP2Saved && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#C9A050]/20 text-[#C9A050] border border-[#C9A050]/40 shadow-sm">
                  <Check className="w-3.5 h-3.5 text-[#C9A050] stroke-[2.5]" />
                  <span>Saved</span>
                </span>
              )}
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className={`block mb-1.5 text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>Full Name</label>
                <input
                  type="text"
                  disabled={isP2Saved}
                  placeholder="Enter Bride / Person B Name"
                  value={partner2.fullName}
                  onChange={(e) => setPartner2({ ...partner2, fullName: e.target.value })}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm border outline-none transition ${
                    theme === 'dark'
                      ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8] placeholder:text-gray-600 focus:border-[#C9A050]'
                      : 'bg-white border-[#E5E1D8] text-[#0D0D0F] placeholder:text-[#9E9A90] focus:border-[#C9A050]'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                />
              </div>

              {/* Birth Date & Time Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Birth Date */}
                <div>
                  <label className={`block mb-1.5 text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>Date of Birth</label>
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
                  <label className={`block mb-1.5 text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>Birth Time</label>
                  <VedicTimePicker
                    value={partner2.birthTime}
                    onChange={(newTime) => setPartner2({ ...partner2, birthTime: newTime })}
                    disabled={isP2Saved}
                    theme={theme}
                    placeholder="HH:MM"
                  />
                </div>
              </div>

              {/* Birth City */}
              <div>
                <label className={`block mb-1.5 text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>Birth City / Country</label>
                <input
                  type="text"
                  disabled={isP2Saved}
                  placeholder="e.g. Mumbai, India"
                  value={partner2.birthPlace}
                  onChange={(e) => setPartner2({ ...partner2, birthPlace: e.target.value })}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm border outline-none transition ${
                    theme === 'dark'
                      ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8] placeholder:text-gray-600 focus:border-[#C9A050]'
                      : 'bg-white border-[#E5E1D8] text-[#0D0D0F] placeholder:text-[#9E9A90] focus:border-[#C9A050]'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                />
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className={`pt-4 flex items-center justify-end border-t ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'} mt-6`}>
            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={() => setIsP2Saved(false)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition shadow-sm cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[#1A1A1E] border-[#2A2A2E] text-[#E5E1D8] hover:text-white'
                    : 'bg-[#F9F7F1] border-[#E5E1D8] text-[#2A2A2E] hover:bg-[#F0ECE1]'
                }`}
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
                className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center ${
                  isP2Saved
                    ? 'bg-[#C9A050] text-[#0D0D0F] border border-[#A67C28] shadow-[#C9A050]/25'
                    : 'bg-[#C9A050] hover:bg-[#D4AF37] text-[#0D0D0F] shadow-[#C9A050]/20 hover:scale-[1.02]'
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
            className={`px-8 py-3.5 rounded-2xl font-serif font-bold text-sm sm:text-base tracking-wide shadow-xl transition-all duration-300 flex items-center space-x-2.5 cursor-pointer hover:scale-105 active:scale-95 ${
              isCalculatingMilan
                ? 'bg-[#C9A050]/60 text-[#0D0D0F] cursor-wait opacity-80'
                : 'bg-gradient-to-r from-[#C9A050] via-[#D4AF37] to-[#8C6B28] hover:from-[#D4AF37] hover:to-[#C9A050] text-[#0D0D0F] shadow-[#C9A050]/30 border border-[#B38730]'
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
                  : 'bg-white border-[#E5E1D8] shadow-2xl'
              } border rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden`}
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
                      : 'bg-[#F9F7F1] border-[#C9A050]/50 text-[#C9A050]'
                  } border flex items-center justify-center shadow-xl shadow-[#C9A050]/30 animate-pulse`}
                >
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-[#C9A050]" />
                </div>
              </div>

              {/* Dynamic Step Text */}
              <div className="space-y-2 relative z-10">
                <h3
                  className={`text-lg sm:text-xl font-serif font-bold ${
                    theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'
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
                  theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
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
          : 'bg-white border-[#E5E1D8] shadow-sm'
      } border rounded-3xl p-6 sm:p-8 lg:p-10 relative overflow-hidden`}>
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
                <span className={`text-3xl sm:text-4xl font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                  {matchResult.totalPoints}
                </span>
                <span className="text-[10px] sm:text-xs text-[#C9A050] font-bold tracking-wider uppercase">/ 36 Gunas</span>
                <span className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} font-sans font-semibold`}>{matchResult.percentage}%</span>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                <span className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#C9A050]/20 text-[#C9A050] border border-[#C9A050]/40 shadow-sm">
                  <Award className="w-3.5 h-3.5" />
                  <span>
                    {matchResult.verdictTitle ||
                      (typeof matchResult.summary === 'object' ? (matchResult.summary as any)?.verdictTitle : null) ||
                      'Kundli Milan'}
                  </span>
                </span>
                {isAutoRefreshing ? (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600 dark:text-amber-400" />
                    <span>Auto-refreshing...</span>
                  </span>
                ) : lastAutoRefreshedAt ? (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Live Auto-Updated</span>
                  </span>
                ) : null}
              </div>
              <h2 className={`text-xl sm:text-2xl lg:text-3xl font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                {partner1.fullName || 'Partner 1'} &amp; {partner2.fullName || 'Partner 2'}
              </h2>
              <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} mt-2.5 max-w-xl leading-relaxed`}>
                {typeof matchResult.summary === 'object'
                  ? (matchResult.summary as any)?.description
                  : (matchResult.summary || (matchResult as any)?.description || '')}
              </p>
            </div>
          </div>

          {/* Right: Key Compatibility Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            <div className={`p-4 sm:p-5 rounded-xl border text-center ${
              theme === 'dark' ? 'bg-[#0D0D0F]/80 border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8] shadow-sm'
            }`}>
              <div className="flex items-center justify-center text-[#C9A050] mb-1.5">
                <Flame className="w-4 h-4" />
              </div>
              <span className={`text-[10px] sm:text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#9E9A90]'} font-semibold uppercase tracking-wider block`}>Manglik Dosha</span>
              <span className={`text-xs sm:text-sm font-bold ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'} mt-1 block`}>
                {matchResult.manglik?.isNeutralized ? 'Neutralized ✓' : 'Remedy Needed ⚠️'}
              </span>
            </div>

            <div className={`p-4 sm:p-5 rounded-xl border text-center ${
              theme === 'dark' ? 'bg-[#0D0D0F]/80 border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8] shadow-sm'
            }`}>
              <div className="flex items-center justify-center text-[#C9A050] mb-1.5">
                <Dna className="w-4 h-4" />
              </div>
              <span className={`text-[10px] sm:text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#9E9A90]'} font-semibold uppercase tracking-wider block`}>Nadi Vitality</span>
              <span className={`text-xs sm:text-sm font-bold ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'} mt-1 block`}>
                {matchResult.kootas?.find((k) => k.id === 'nadi')?.obtainedPoints ?? 0}/8 Points
              </span>
            </div>

            <div className={`p-4 sm:p-5 rounded-xl border text-center ${
              theme === 'dark' ? 'bg-[#0D0D0F]/80 border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8] shadow-sm'
            }`}>
              <div className="flex items-center justify-center text-[#C9A050] mb-1.5">
                <Heart className="w-4 h-4" />
              </div>
              <span className={`text-[10px] sm:text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#9E9A90]'} font-semibold uppercase tracking-wider block`}>Bhakoot Harmony</span>
              <span className={`text-xs sm:text-sm font-bold ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'} mt-1 block`}>
                {matchResult.kootas?.find((k) => k.id === 'bhakoot')?.obtainedPoints ?? 0}/7 Points
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className={`flex items-center space-x-2 border-b ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'} pb-3 overflow-x-auto no-scrollbar`}>
        <button
          onClick={() => setActiveTab('kootas')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'kootas'
              ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20 font-bold'
              : theme === 'dark'
              ? 'bg-[#141418] text-[#9E9A90] hover:text-[#E5E1D8] border border-[#2A2A2E]'
              : 'bg-[#F9F7F1] text-[#544B3D] hover:text-[#0D0D0F] hover:bg-[#F0ECE1] border border-[#E5E1D8]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>8 Kootas Breakdown ({matchResult.totalPoints}/36)</span>
        </button>

        <button
          onClick={() => setActiveTab('doshas')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'doshas'
              ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20 font-bold'
              : theme === 'dark'
              ? 'bg-[#141418] text-[#9E9A90] hover:text-[#E5E1D8] border border-[#2A2A2E]'
              : 'bg-[#F9F7F1] text-[#544B3D] hover:text-[#0D0D0F] hover:bg-[#F0ECE1] border border-[#E5E1D8]'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Manglik &amp; Critical Doshas</span>
        </button>

        <button
          onClick={() => setActiveTab('synastry')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'synastry'
              ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20 font-bold'
              : theme === 'dark'
              ? 'bg-[#141418] text-[#9E9A90] hover:text-[#E5E1D8] border border-[#2A2A2E]'
              : 'bg-[#F9F7F1] text-[#544B3D] hover:text-[#0D0D0F] hover:bg-[#F0ECE1] border border-[#E5E1D8]'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Western Synastry &amp; Elements</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_counsel')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'ai_counsel'
              ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20 font-bold'
              : theme === 'dark'
              ? 'bg-[#141418] text-[#9E9A90] hover:text-[#E5E1D8] border border-[#2A2A2E]'
              : 'bg-[#F9F7F1] text-[#544B3D] hover:text-[#0D0D0F] hover:bg-[#F0ECE1] border border-[#E5E1D8]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Astrological Counsel</span>
        </button>

        <button
          onClick={() => setActiveTab('remedies')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'remedies'
              ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20 font-bold'
              : theme === 'dark'
              ? 'bg-[#141418] text-[#9E9A90] hover:text-[#E5E1D8] border border-[#2A2A2E]'
              : 'bg-[#F9F7F1] text-[#544B3D] hover:text-[#0D0D0F] hover:bg-[#F0ECE1] border border-[#E5E1D8]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Remedies &amp; Muhurat</span>
        </button>
      </div>

      {/* Tab 1: 8 Kootas Detailed Breakdown Table & Cards */}
      {activeTab === 'kootas' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className={`text-lg sm:text-xl font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
              Ashta Koota (8 Kootas) Classical Scoring Matrix
            </h3>
            <span className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>
              Score: <strong className="text-[#C9A050] font-bold">{matchResult.totalPoints}</strong> / 36 Maximum
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {matchResult.kootas.map((koota, index) => {
              const isExpanded = expandedKoota === koota.id;
              const badgeClass = getScoreColor(koota.obtainedPoints, koota.maxPoints);

              return (
                <div
                  key={koota.id}
                  className={`${
                    theme === 'dark'
                      ? 'bg-[#141418] border-[#2A2A2E] hover:border-[#C9A050]/40'
                      : 'bg-white border-[#E5E1D8] hover:border-[#C9A050] shadow-sm'
                  } border rounded-2xl p-5 sm:p-6 transition`}
                >
                  <div
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                    onClick={() => setExpandedKoota(isExpanded ? null : koota.id)}
                  >
                    <div className="flex items-start sm:items-center space-x-4">
                      <div className={`w-9 h-9 rounded-xl ${
                        theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
                      } border flex items-center justify-center font-bold text-xs sm:text-sm text-[#C9A050] shrink-0`}>
                        0{index + 1}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className={`text-base sm:text-lg font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                            {koota.name}
                          </h4>
                          <span className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#9E9A90]'} italic`}>({koota.sanskritName})</span>
                        </div>
                        <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} mt-0.5`}>{koota.area}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Values Comparison Pill */}
                      <div className={`hidden md:flex items-center space-x-2 text-xs px-3.5 py-1.5 rounded-xl border ${
                        theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E] text-[#9E9A90]' : 'bg-[#F9F7F1] border-[#E5E1D8] text-[#544B3D]'
                      }`}>
                        <span className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}>{partner1.fullName.split(' ')[0]}: <strong className="text-[#C9A050]">{koota.p1Value}</strong></span>
                        <span>↔</span>
                        <span className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}>{partner2.fullName.split(' ')[0]}: <strong className="text-[#C9A050]">{koota.p2Value}</strong></span>
                      </div>

                      {/* Points Badge */}
                      <div className={`px-3.5 py-1 rounded-full text-xs font-bold border ${badgeClass}`}>
                        {koota.obtainedPoints} / {koota.maxPoints} Pts
                      </div>

                      {isExpanded ? (
                        <ChevronUp className={`w-4 h-4 ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#9E9A90]'}`} />
                      ) : (
                        <ChevronDown className={`w-4 h-4 ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#9E9A90]'}`} />
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
                          theme === 'dark' ? 'border-[#2A2A2E] text-[#E5E1D8]' : 'border-[#E5E1D8] text-[#2A2A2E]'
                        } text-xs sm:text-sm space-y-2.5 leading-relaxed`}
                      >
                        <p className={theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}>{koota.description}</p>
                        <div className={`p-3.5 sm:p-4 rounded-xl border flex items-start space-x-2.5 ${
                          theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
                        }`}>
                          <Info className="w-4 h-4 text-[#C9A050] shrink-0 mt-0.5" />
                          <div>
                            <span className={`font-semibold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>Verdict Details: </span>
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
              : 'bg-white border-[#E5E1D8] shadow-sm'
          } border rounded-2xl p-6 sm:p-8`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-lg sm:text-xl font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                  Manglik (Kuja) Dosha Comparative Assessment
                </h3>
                <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>Mars placement in 1st, 2nd, 4th, 7th, 8th, or 12th houses</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
              {/* Partner 1 Manglik */}
              <div className={`p-4 sm:p-5 rounded-xl border ${
                theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
              }`}>
                <span className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#9E9A90]'} font-semibold uppercase tracking-wider block mb-1.5`}>
                  {partner1.fullName} (Partner A)
                </span>
                <div className="flex items-center justify-between">
                  <span className={`text-xs sm:text-sm font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                    {matchResult.manglik?.partner1?.isManglik ? `Manglik (${matchResult.manglik?.partner1?.severity || 'Active'})` : 'Non-Manglik'}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-lg border font-semibold ${
                    theme === 'dark' ? 'bg-[#1A1A1E] text-[#9E9A90] border-[#2A2A2E]' : 'bg-white text-[#544B3D] border-[#E5E1D8]'
                  }`}>
                    House {matchResult.manglik?.partner1?.marsHouse || '-'}
                  </span>
                </div>
                <p className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} mt-2.5`}>
                  Status: <strong className="text-[#C9A050] font-semibold">{matchResult.manglik?.partner1?.cancellation || 'Standard Evaluation'}</strong>
                </p>
              </div>

              {/* Partner 2 Manglik */}
              <div className={`p-4 sm:p-5 rounded-xl border ${
                theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
              }`}>
                <span className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#9E9A90]'} font-semibold uppercase tracking-wider block mb-1.5`}>
                  {partner2.fullName} (Partner B)
                </span>
                <div className="flex items-center justify-between">
                  <span className={`text-xs sm:text-sm font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                    {matchResult.manglik?.partner2?.isManglik ? `Manglik (${matchResult.manglik?.partner2?.severity || 'Active'})` : 'Non-Manglik'}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-lg border font-semibold ${
                    theme === 'dark' ? 'bg-[#1A1A1E] text-[#9E9A90] border-[#2A2A2E]' : 'bg-white text-[#544B3D] border-[#E5E1D8]'
                  }`}>
                    House {matchResult.manglik?.partner2?.marsHouse || '-'}
                  </span>
                </div>
                <p className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} mt-2.5`}>
                  Status: <strong className="text-[#C9A050] font-semibold">{matchResult.manglik?.partner2?.cancellation || 'Standard Evaluation'}</strong>
                </p>
              </div>
            </div>

            <div className={`p-4 sm:p-5 rounded-xl border text-xs sm:text-sm leading-relaxed ${
              matchResult.manglik?.isNeutralized
                ? theme === 'light'
                  ? 'bg-[#F9F7F1] border-[#C9A050]/40 text-[#2A2A2E]'
                  : 'bg-[#1C1A14] border-[#C9A050]/50 text-[#E8C470]'
                : theme === 'light'
                  ? 'bg-[#FFF8F6] border-rose-300 text-rose-800'
                  : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
            }`}>
              <div className={`font-bold text-sm sm:text-base mb-1.5 ${theme === 'light' ? 'text-[#C9A050]' : 'text-[#E8C470]'}`}>
                {matchResult.manglik?.verdict || 'Manglik Analysis'}
              </div>
              <p className={theme === 'light' ? 'text-[#544B3D]' : 'text-[#9E9A90]'}>
                {matchResult.manglik?.explanation || ''}
              </p>
            </div>
          </div>

          {/* Nadi & Bhakoot Dosha Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nadi Dosha */}
            <div className={`${
              theme === 'dark' 
                ? 'bg-[#141418] border-[#2A2A2E]' 
                : 'bg-white border-[#E5E1D8] shadow-sm'
            } border rounded-2xl p-6 sm:p-8`}>
              <div className="flex items-center space-x-3 mb-3.5">
                <Dna className="w-5 h-5 text-[#C9A050]" />
                <h4 className={`text-base sm:text-lg font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>Nadi Dosha Examination</h4>
              </div>
              <div className={`space-y-2.5 text-xs sm:text-sm ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>
                <div className="flex justify-between">
                  <span>{partner1.fullName.split(' ')[0]} Nadi:</span>
                  <strong className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}>{matchResult.nadiDosha?.partner1Nadi || '-'}</strong>
                </div>
                <div className="flex justify-between">
                  <span>{partner2.fullName.split(' ')[0]} Nadi:</span>
                  <strong className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}>{matchResult.nadiDosha?.partner2Nadi || '-'}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <strong className={matchResult.nadiDosha?.hasDosha && !matchResult.nadiDosha?.isCancelled ? 'text-rose-400 font-bold' : 'text-[#C9A050] font-bold'}>
                    {matchResult.nadiDosha?.hasDosha
                      ? matchResult.nadiDosha?.isCancelled
                        ? 'Dosha Cancelled ✓'
                        : 'Active Nadi Dosha ⚠️'
                      : 'No Dosha (Pure Harmony) ✓'}
                  </strong>
                </div>
                <p className={`p-3.5 rounded-xl border text-xs sm:text-sm mt-3.5 leading-relaxed ${
                  theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-[#F9F7F1] border-[#E5E1D8] text-[#2A2A2E]'
                }`}>
                  {matchResult.nadiDosha?.reason || 'Evaluation completed'}. {matchResult.nadiDosha?.remedy || ''}
                </p>
              </div>
            </div>

            {/* Bhakoot Dosha */}
            <div className={`${
              theme === 'dark' 
                ? 'bg-[#141418] border-[#2A2A2E]' 
                : 'bg-white border-[#E5E1D8] shadow-sm'
            } border rounded-2xl p-6 sm:p-8`}>
              <div className="flex items-center space-x-3 mb-3.5">
                <Heart className="w-5 h-5 text-[#C9A050]" />
                <h4 className={`text-base sm:text-lg font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>Bhakoot Dosha Examination</h4>
              </div>
              <div className={`space-y-2.5 text-xs sm:text-sm ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>
                <div className="flex justify-between">
                  <span>{partner1.fullName.split(' ')[0]} Rashi:</span>
                  <strong className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}>{matchResult.bhakootDosha?.partner1Rashi || '-'}</strong>
                </div>
                <div className="flex justify-between">
                  <span>{partner2.fullName.split(' ')[0]} Rashi:</span>
                  <strong className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}>{matchResult.bhakootDosha?.partner2Rashi || '-'}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Rashi Angular Disparity:</span>
                  <strong className="text-[#C9A050] font-bold">{matchResult.bhakootDosha?.rashiDistance || '-'}</strong>
                </div>
                <p className={`p-3.5 rounded-xl border text-xs sm:text-sm mt-3.5 leading-relaxed ${
                  theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-[#F9F7F1] border-[#E5E1D8] text-[#2A2A2E]'
                }`}>
                  {matchResult.bhakootDosha?.reason || 'Evaluation completed'}. {matchResult.bhakootDosha?.remedy || ''}
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
              : 'bg-white border-[#E5E1D8] shadow-sm'
          } border rounded-2xl p-6 sm:p-8`}>
            <h3 className={`text-lg sm:text-xl font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'} mb-2`}>
              Western Synastry &amp; Cosmic Planetary Aspects
            </h3>
            <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} mb-6 leading-relaxed`}>
              Cross-tradition psychological harmonization between solar-lunar archetypes and interpersonal attraction vectors.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {matchResult.synastry?.map((syn, i) => (
                <div key={i} className={`p-4 sm:p-5 rounded-xl border space-y-2.5 ${
                  theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
                }`}>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-[#C9A050] truncate">{syn.title}</span>
                    <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full shrink-0 shadow-sm ${
                      theme === 'light'
                        ? 'bg-[#C9A050]/15 text-[#C9A050] border border-[#C9A050]/30'
                        : 'bg-[#C9A050]/20 text-[#E8C470] border border-[#C9A050]/40'
                    }`}>
                      {syn.harmonyScore}%
                    </span>
                  </div>
                  <span className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#9E9A90]'} block`}>{syn.planets}</span>
                  <div className={`w-full ${theme === 'light' ? 'bg-[#E5E1D8]' : 'bg-[#1A1A1E]'} h-2 rounded-full overflow-hidden`}>
                    <div className="bg-[#C9A050] h-full rounded-full transition-all duration-500" style={{ width: `${syn.harmonyScore}%` }} />
                  </div>
                  <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'} pt-1 leading-relaxed`}>{syn.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Elemental & Numerology Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`${
              theme === 'dark' 
                ? 'bg-[#141418] border-[#2A2A2E]' 
                : 'bg-white border-[#E5E1D8] shadow-sm'
            } border rounded-2xl p-6 sm:p-8`}>
              <h4 className={`text-base sm:text-lg font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'} mb-3`}>Elemental Synergy</h4>
              <div className={`p-4 sm:p-5 rounded-xl border space-y-2.5 text-xs sm:text-sm ${
                theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
              }`}>
                <div className={`flex justify-between ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>
                  <span>Elements:</span>
                  <strong className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}>
                    {matchResult.elementalBalance?.partner1Element || '-'} ↔ {matchResult.elementalBalance?.partner2Element || '-'}
                  </strong>
                </div>
                <div className={`flex justify-between items-center ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>
                  <span>Synergy Score:</span>
                  <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                    theme === 'light'
                      ? 'bg-[#C9A050]/15 text-[#C9A050] border border-[#C9A050]/30'
                      : 'bg-[#C9A050]/20 text-[#E8C470] border border-[#C9A050]/40'
                  }`}>
                    {matchResult.elementalBalance?.score || 0}%
                  </span>
                </div>
                <p className={`${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'} pt-1 leading-relaxed`}>{matchResult.elementalBalance?.synergy || ''}</p>
              </div>
            </div>

            <div className={`${
              theme === 'dark' 
                ? 'bg-[#141418] border-[#2A2A2E]' 
                : 'bg-white border-[#E5E1D8] shadow-sm'
            } border rounded-2xl p-6 sm:p-8`}>
              <h4 className={`text-base sm:text-lg font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'} mb-3`}>Numerological Alignment (Mulank &amp; Bhagyank)</h4>
              <div className={`p-4 sm:p-5 rounded-xl border space-y-2.5 text-xs sm:text-sm ${
                theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
              }`}>
                <div className={`flex justify-between ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>
                  <span>Psychic Numbers (Mulank):</span>
                  <strong className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}>
                    Mulank {matchResult.numerologyMilan?.partner1Mulank || 0} ↔ Mulank {matchResult.numerologyMilan?.partner2Mulank || 0}
                  </strong>
                </div>
                <div className={`flex justify-between items-center ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>
                  <span>Destiny Harmony Score:</span>
                  <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                    theme === 'light'
                      ? 'bg-[#C9A050]/15 text-[#C9A050] border border-[#C9A050]/30'
                      : 'bg-[#C9A050]/20 text-[#E8C470] border border-[#C9A050]/40'
                  }`}>
                    {matchResult.numerologyMilan?.harmonyScore || 0}%
                  </span>
                </div>
                <p className={`${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'} pt-1 leading-relaxed`}>{matchResult.numerologyMilan?.description || ''}</p>
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
            : 'bg-white border-[#E5E1D8] shadow-sm'
        } border rounded-2xl p-6 sm:p-8 space-y-6`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#C9A050]/20 to-transparent border border-[#C9A050]/30 text-[#C9A050] text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-2.5 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C9A050]" />
                <span>{t('matchmaking.ai_counsel')}</span>
              </div>
              <h3 className={`text-xl sm:text-2xl font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                Daivajna Deep Relationship Synthesis
              </h3>
              <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} mt-1`}>
                Multidimensional karmic counsel generated dynamically for {partner1.fullName} &amp; {partner2.fullName}.
              </p>
            </div>

            <div className="flex items-center space-x-2.5 shrink-0">
              {aiSynthesis && (
                <button
                  onClick={handleDownloadAICounselPDF}
                  disabled={isGeneratingPdf}
                  className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition cursor-pointer disabled:opacity-50 ${
                    theme === 'dark'
                      ? 'bg-[#1C1C22] hover:bg-[#25252E] text-[#E5E1D8] border-[#3A3A42]'
                      : 'bg-[#F9F7F1] hover:bg-[#F0ECE1] text-[#2A2A2E] border-[#E5E1D8]'
                  }`}
                  title="Download counsel report as PDF"
                >
                  {isGeneratingPdf ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#C9A050]" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-[#C9A050]" />
                      <span>Download Report</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={() => handleGenerateAISynthesis(matchResult, partner1, partner2, true)}
                disabled={isGeneratingAI}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#C9A050] hover:bg-[#D4AF37] disabled:opacity-50 text-[#0D0D0F] font-bold text-xs sm:text-sm shadow-lg shadow-[#C9A050]/20 transition cursor-pointer"
              >
                {isGeneratingAI ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Cosmic Charts...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{aiSynthesis ? 'Regenerate Full Counsel' : 'Generate Full Counsel'}</span>
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
                    <div className={`p-5 sm:p-6 rounded-2xl border ${
                      theme === 'dark' ? 'bg-[#0D0D0F] border-[#C9A050]/40' : 'bg-[#F9F7F1] border-[#E5E1D8]'
                    } space-y-2.5`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-[#C9A050] font-serif font-bold text-sm sm:text-base">
                          <Sparkles className="w-4 h-4" />
                          <span>Overall Astrological Compatibility</span>
                        </div>
                        {typeof aiSynthesis.overall_compatibility === 'string' && aiSynthesis.overall_compatibility.length < 30 && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#C9A050]/20 text-[#C9A050] border border-[#C9A050]/40">
                            {renderSafeAiText(aiSynthesis.overall_compatibility)}
                          </span>
                        )}
                      </div>
                      <p className={`${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'} leading-relaxed`}>
                        {renderSafeAiText(aiSynthesis.overall_compatibility)}
                      </p>
                    </div>
                  )}

                  {/* Core Dimensions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {aiSynthesis.guna_milan && (
                      <div className={`p-4 sm:p-5 rounded-xl border ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'} space-y-2`}>
                        <h4 className="font-serif font-bold text-[#C9A050] text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5">
                          <span>✨ Guna Milan &amp; Cosmic Alignment</span>
                        </h4>
                        <p className={`${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} leading-relaxed`}>
                          {renderSafeAiText(aiSynthesis.guna_milan)}
                        </p>
                      </div>
                    )}

                    {aiSynthesis.manglik_dosha && (
                      <div className={`p-4 sm:p-5 rounded-xl border ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'} space-y-2`}>
                        <h4 className="font-serif font-bold text-amber-500 text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5">
                          <Flame className="w-4 h-4 text-amber-500" />
                          <span>Manglik (Kuja) Dosha Evaluation</span>
                        </h4>
                        <p className={`${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} leading-relaxed`}>
                          {renderSafeAiText(aiSynthesis.manglik_dosha)}
                        </p>
                      </div>
                    )}

                    {aiSynthesis.nadi_analysis && (
                      <div className={`p-4 sm:p-5 rounded-xl border ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'} space-y-2`}>
                        <h4 className="font-serif font-bold text-purple-400 text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5">
                          <Dna className="w-4 h-4 text-purple-400" />
                          <span>Nadi Koota &amp; Genetic Prana Harmony</span>
                        </h4>
                        <p className={`${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} leading-relaxed`}>
                          {renderSafeAiText(aiSynthesis.nadi_analysis)}
                        </p>
                      </div>
                    )}

                    {aiSynthesis.bhakoot_analysis && (
                      <div className={`p-4 sm:p-5 rounded-xl border ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'} space-y-2`}>
                        <h4 className="font-serif font-bold text-[#C9A050] text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5">
                          <Heart className="w-4 h-4 text-[#C9A050]" />
                          <span>Bhakoot Harmony &amp; Emotional Rhythm</span>
                        </h4>
                        <p className={`${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} leading-relaxed`}>
                          {renderSafeAiText(aiSynthesis.bhakoot_analysis)}
                        </p>
                      </div>
                    )}

                    {aiSynthesis.psychological_affinity && (
                      <div className={`p-4 sm:p-5 rounded-xl border ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'} space-y-2`}>
                        <h4 className="font-serif font-bold text-[#C9A050] text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5">
                          <span>🧠 Psychological &amp; Intellectual Affinity</span>
                        </h4>
                        <p className={`${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} leading-relaxed`}>
                          {renderSafeAiText(aiSynthesis.psychological_affinity)}
                        </p>
                      </div>
                    )}

                    {aiSynthesis.emotional_resonance && (
                      <div className={`p-4 sm:p-5 rounded-xl border ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'} space-y-2`}>
                        <h4 className="font-serif font-bold text-[#C9A050] text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5">
                          <span>❤️ Emotional Resonance &amp; Temperament</span>
                        </h4>
                        <p className={`${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} leading-relaxed`}>
                          {renderSafeAiText(aiSynthesis.emotional_resonance)}
                        </p>
                      </div>
                    )}

                    {aiSynthesis.karmic_bond && (
                      <div className={`p-4 sm:p-5 rounded-xl border ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'} space-y-2`}>
                        <h4 className="font-serif font-bold text-[#C9A050] text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5">
                          <span>🪐 Karmic Bond &amp; Destiny</span>
                        </h4>
                        <p className={`${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} leading-relaxed`}>
                          {renderSafeAiText(aiSynthesis.karmic_bond)}
                        </p>
                      </div>
                    )}

                    {aiSynthesis.physical_harmonization && (
                      <div className={`p-4 sm:p-5 rounded-xl border ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'} space-y-2`}>
                        <h4 className="font-serif font-bold text-[#C9A050] text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5">
                          <span>🌿 Biological &amp; Physical Harmonization</span>
                        </h4>
                        <p className={`${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} leading-relaxed`}>
                          {renderSafeAiText(aiSynthesis.physical_harmonization)}
                        </p>
                      </div>
                    )}

                    {aiSynthesis.family_and_married_life && (
                      <div className={`p-4 sm:p-5 rounded-xl border ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'} space-y-2`}>
                        <h4 className="font-serif font-bold text-[#C9A050] text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5">
                          <span>🏡 Family &amp; Married Life</span>
                        </h4>
                        <p className={`${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} leading-relaxed`}>
                          {renderSafeAiText(aiSynthesis.family_and_married_life)}
                        </p>
                      </div>
                    )}

                    {aiSynthesis.wealth_and_prosperity && (
                      <div className={`p-4 sm:p-5 rounded-xl border ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'} space-y-2`}>
                        <h4 className="font-serif font-bold text-[#C9A050] text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5">
                          <span>💰 Wealth Multiplication &amp; Prosperity</span>
                        </h4>
                        <p className={`${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} leading-relaxed`}>
                          {renderSafeAiText(aiSynthesis.wealth_and_prosperity)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Strengths & Challenges Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {Array.isArray(aiSynthesis.major_strengths) && aiSynthesis.major_strengths.length > 0 && (
                      <div className={`p-4 sm:p-5 rounded-xl border ${theme === 'dark' ? 'bg-[#0D0D0F] border-emerald-500/30' : 'bg-[#F9F7F1] border-emerald-500/30'} space-y-2.5`}>
                        <h4 className="font-serif font-bold text-emerald-500 text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Major Relationship Strengths</span>
                        </h4>
                        <ul className="space-y-2">
                          {aiSynthesis.major_strengths.map((str: any, i: number) => (
                            <li key={i} className="flex items-start space-x-2 text-xs sm:text-sm">
                              <span className="text-emerald-500 font-bold">•</span>
                              <span className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'}>{renderSafeAiText(str)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {Array.isArray(aiSynthesis.major_challenges) && aiSynthesis.major_challenges.length > 0 && (
                      <div className={`p-4 sm:p-5 rounded-xl border ${theme === 'dark' ? 'bg-[#0D0D0F] border-amber-500/30' : 'bg-[#F9F7F1] border-amber-500/30'} space-y-2.5`}>
                        <h4 className="font-serif font-bold text-amber-500 text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <span>Potential Challenges &amp; Growth Areas</span>
                        </h4>
                        <ul className="space-y-2">
                          {aiSynthesis.major_challenges.map((ch: any, i: number) => (
                            <li key={i} className="flex items-start space-x-2 text-xs sm:text-sm">
                              <span className="text-amber-500 font-bold">•</span>
                              <span className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'}>{renderSafeAiText(ch)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Conflict Resolution & Vedic Remedies */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {Array.isArray(aiSynthesis.conflict_resolution) && aiSynthesis.conflict_resolution.length > 0 && (
                      <div className={`p-4 sm:p-5 rounded-xl border ${theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'} space-y-2.5`}>
                        <h4 className="font-serif font-bold text-blue-400 text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5">
                          <ShieldCheck className="w-4 h-4 text-blue-400" />
                          <span>Conflict Resolution Guidance</span>
                        </h4>
                        <ul className="space-y-2">
                          {aiSynthesis.conflict_resolution.map((cr: any, i: number) => (
                            <li key={i} className="flex items-start space-x-2 text-xs sm:text-sm">
                              <span className="text-blue-400 font-bold">•</span>
                              <span className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'}>{renderSafeAiText(cr)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {Array.isArray(aiSynthesis.vedic_remedies) && aiSynthesis.vedic_remedies.length > 0 && (
                      <div className={`p-4 sm:p-5 rounded-xl border ${theme === 'dark' ? 'bg-[#0D0D0F] border-[#C9A050]/40' : 'bg-[#F9F7F1] border-[#E5E1D8]'} space-y-2.5`}>
                        <h4 className="font-serif font-bold text-[#C9A050] text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5">
                          <Sparkles className="w-4 h-4 text-[#C9A050]" />
                          <span>Vedic Upayas &amp; Remedies</span>
                        </h4>
                        <ul className="space-y-2">
                          {aiSynthesis.vedic_remedies.map((vr: any, i: number) => (
                            <li key={i} className="flex items-start space-x-2 text-xs sm:text-sm">
                              <span className="text-[#C9A050] font-bold">•</span>
                              <span className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'}>{renderSafeAiText(vr)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Final Assessment Box */}
                  {aiSynthesis.final_assessment && (
                    <div className={`p-5 sm:p-6 rounded-2xl border ${
                      theme === 'dark' ? 'bg-gradient-to-r from-[#C9A050]/15 via-[#C9A050]/5 to-transparent border-[#C9A050]/50' : 'bg-[#F9F7F1] border-[#E5E1D8]'
                    } space-y-2.5`}>
                      <h4 className="font-serif font-bold text-[#C9A050] text-sm sm:text-base flex items-center space-x-2">
                        <HeartHandshake className="w-4 h-4 text-[#C9A050]" />
                        <span>Daivajna Final Assessment &amp; Blessings</span>
                      </h4>
                      <p className={`${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#2A2A2E]'} font-serif italic text-xs sm:text-sm leading-relaxed`}>
                        "{renderSafeAiText(aiSynthesis.final_assessment)}"
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className={`p-6 sm:p-8 rounded-2xl border text-xs sm:text-sm leading-relaxed space-y-4 ${
                  theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-[#F9F7F1] border-[#E5E1D8] text-[#2A2A2E]'
                }`}>
                  <div className={`prose max-w-none text-xs sm:text-sm ${theme === 'dark' ? 'prose-invert' : 'text-[#2A2A2E]'}`}>
                    <ReactMarkdown>{aiSynthesis}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ) : isGeneratingAI ? (
            <div className={`p-12 rounded-2xl border border-dashed text-center space-y-4 ${
              theme === 'dark' ? 'bg-[#0D0D0F]/60 border-[#C9A050]/40' : 'bg-[#F9F7F1] border-[#E5E1D8]'
            }`}>
              <RefreshCw className="w-8 h-8 text-[#C9A050] mx-auto animate-spin" />
              <div className="space-y-1.5">
                <h4 className={`text-base sm:text-lg font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                  Synthesizing Vedic Charts &amp; Planetary Alignments...
                </h4>
                <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>
                  Daivajna is analyzing Guna Milan, Doshas, and synastry dynamics for {partner1.fullName} &amp; {partner2.fullName}.
                </p>
              </div>
            </div>
          ) : (
            <div className={`p-8 sm:p-10 rounded-2xl border border-dashed text-center space-y-3.5 ${
              theme === 'dark' ? 'bg-[#0D0D0F]/60 border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
            }`}>
              <Sparkles className="w-8 h-8 text-[#C9A050] mx-auto opacity-70" />
              <p className={`text-xs sm:text-sm font-serif ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'}`}>
                Generate an exhaustive consultation covering psychological affinity, wealth generation, marital timing, and conflict resolution.
              </p>
              <div>
                <button
                  onClick={() => handleGenerateAISynthesis(matchResult, partner1, partner2, true)}
                  disabled={isGeneratingAI}
                  className="mt-2 inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#C9A050] hover:bg-[#D4AF37] disabled:opacity-50 text-[#0D0D0F] font-bold text-xs sm:text-sm shadow-lg shadow-[#C9A050]/20 transition cursor-pointer hover:scale-[1.02] active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Full Counsel</span>
                </button>
              </div>
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
              : 'bg-white border-[#E5E1D8] shadow-sm'
          } border rounded-2xl p-6 sm:p-8 space-y-4`}>
            <div className="flex items-center space-x-2.5 text-[#C9A050]">
              <ShieldCheck className="w-5 h-5" />
              <h3 className={`text-lg sm:text-xl font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                {t('matchmaking.remedies_title')}
              </h3>
            </div>
            <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>
              Traditional Vedic Upayas and practical actions designed to pacify minor planetary afflictions and enhance marital sweetness.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {matchResult.remedies?.map((rem, idx) => (
                <div key={idx} className={`p-4 sm:p-5 rounded-xl border flex items-start space-x-3 text-xs sm:text-sm ${
                  theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
                }`}>
                  <span className="w-6 h-6 rounded-full bg-[#C9A050]/20 text-[#C9A050] font-bold flex items-center justify-center shrink-0 text-xs">
                    {idx + 1}
                  </span>
                  <span className={`${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'} leading-relaxed`}>{rem}</span>
                </div>
              ))}
            </div>

            {Array.isArray(aiSynthesis?.vedic_remedies) && aiSynthesis.vedic_remedies.length > 0 && (
              <div className={`p-4 sm:p-5 rounded-xl border ${theme === 'dark' ? 'bg-[#0D0D0F] border-[#C9A050]/40' : 'bg-[#F9F7F1] border-[#E5E1D8]'} space-y-2.5 mt-4`}>
                <h4 className="font-serif font-bold text-[#C9A050] text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-[#C9A050]" />
                  <span>Daivajna Personalized Relationship Upayas</span>
                </h4>
                <ul className="space-y-2">
                  {aiSynthesis.vedic_remedies.map((vr: string, i: number) => (
                    <li key={i} className="flex items-start space-x-2 text-xs sm:text-sm">
                      <span className="text-[#C9A050] font-bold">•</span>
                      <span className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'}>{vr}</span>
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
              : 'bg-white border-[#E5E1D8] shadow-sm'
          } border rounded-2xl p-6 sm:p-8 space-y-3`}>
            <div className="flex items-center space-x-2.5 text-amber-500">
              <Calendar className="w-5 h-5" />
              <h4 className={`text-base sm:text-lg font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                Auspicious Vivaha / Partnership Muhurat Guidance
              </h4>
            </div>
            <p className={`text-xs sm:text-sm leading-relaxed p-4 sm:p-5 rounded-xl border ${
              theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-[#F9F7F1] border-[#E5E1D8] text-[#2A2A2E]'
            }`}>
              {matchResult.auspiciousMuhuratAdvice}
            </p>
          </div>

          {/* Couple Favorable Gemstones Cards */}
          {(() => {
            const p1Chart = partner1.birthDate ? calculateVedicChart(partner1) : null;
            const p2Chart = partner2.birthDate ? calculateVedicChart(partner2) : null;
            const p1Gems = p1Chart?.gemstones && p1Chart.gemstones.length > 0 ? p1Chart.gemstones : getLagnaGemstones(p1Chart?.ascendant?.signIndex ?? 11);
            const p2Gems = p2Chart?.gemstones && p2Chart.gemstones.length > 0 ? p2Chart.gemstones : getLagnaGemstones(p2Chart?.ascendant?.signIndex ?? 3);

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Partner 1 Gemstones */}
                <div className={`${
                  theme === 'dark' 
                    ? 'bg-[#141418] border-[#2A2A2E]' 
                    : 'bg-white border-[#E5E1D8] shadow-sm'
                } border rounded-2xl p-6 sm:p-8 space-y-4`}>
                  <div className="flex items-center space-x-2 font-serif font-bold text-xs sm:text-sm pb-2.5 border-b border-[#E5E1D8]">
                    <Layers className="w-4 h-4 text-[#C9A050]" />
                    <span className={theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}>
                      Favorable Gemstones (Lagna Based) • {partner1.fullName || 'Partner 1'}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {p1Gems.map((g: any, idx: number) => (
                      <div key={idx} className={`p-3.5 sm:p-4 rounded-xl border flex flex-col ${
                        theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
                      }`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-xs sm:text-sm font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>{g.gem}</span>
                          <span className="text-[10px] sm:text-xs font-bold text-[#C9A050] uppercase tracking-wider">{g.planet}</span>
                        </div>
                        <span className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>{g.purpose}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Partner 2 Gemstones */}
                <div className={`${
                  theme === 'dark' 
                    ? 'bg-[#141418] border-[#2A2A2E]' 
                    : 'bg-white border-[#E5E1D8] shadow-sm'
                } border rounded-2xl p-6 sm:p-8 space-y-4`}>
                  <div className="flex items-center space-x-2 font-serif font-bold text-xs sm:text-sm pb-2.5 border-b border-[#E5E1D8]">
                    <Layers className="w-4 h-4 text-[#C9A050]" />
                    <span className={theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}>
                      Favorable Gemstones (Lagna Based) • {partner2.fullName || 'Partner 2'}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {p2Gems.map((g: any, idx: number) => (
                      <div key={idx} className={`p-3.5 sm:p-4 rounded-xl border flex flex-col ${
                        theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
                      }`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-xs sm:text-sm font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>{g.gem}</span>
                          <span className="text-[10px] sm:text-xs font-bold text-[#C9A050] uppercase tracking-wider">{g.planet}</span>
                        </div>
                        <span className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>{g.purpose}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
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
        style={{ fontFamily: "'Nunito'" }}
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
            {matchResult.verdictTitle ||
              (typeof matchResult.summary === 'object' ? (matchResult.summary as any)?.verdictTitle : null) ||
              'Kundli Milan'}
          </div>
          <p className="text-xs text-gray-700 mt-2 max-w-xl mx-auto italic">
            &ldquo;
            {typeof matchResult.summary === 'object'
              ? (matchResult.summary as any)?.description
              : (matchResult.summary || (matchResult as any)?.description || '')}
            &rdquo;
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
                theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-white border-[#E5E1D8]'
              }`}
            >
              {/* Modal Header */}
              <div className={`p-5 sm:p-6 border-b flex items-center justify-between ${
                theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#C9A050]/15 flex items-center justify-center text-[#C9A050]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className={`font-serif font-bold text-base sm:text-lg ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                      Saved Matchmaking Reports
                    </h3>
                    <p className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>
                      History for {currentProfile?.fullName || 'Current User'} ({savedMatches.length} records)
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsHistoryModalOpen(false)}
                  className={`p-1.5 rounded-lg transition ${
                    theme === 'dark' ? 'text-[#9E9A90] hover:text-[#F0ECE1] hover:bg-[#1A1A1E]' : 'text-[#544B3D] hover:text-[#0D0D0F] hover:bg-[#F0ECE1]'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body: List of Saved Matches */}
              <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-3.5">
                {savedMatches.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <HeartHandshake className="w-12 h-12 text-[#9E9A90]/40 mx-auto" />
                    <p className={`text-sm ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>
                      No saved matchmaking reports yet for this profile.
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]/60' : 'text-[#9E9A90]'}`}>
                      When you enter partner details and save them, your match reports will appear here.
                    </p>
                  </div>
                ) : (
                  savedMatches.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleLoadFromHistory(m)}
                      className={`p-4 sm:p-5 rounded-xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        theme === 'dark'
                          ? 'bg-[#1A1A1E] border-[#2A2A2E] hover:border-[#C9A050]/60 hover:bg-[#202026]'
                          : 'bg-[#F9F7F1] border-[#E5E1D8] hover:border-[#C9A050] hover:bg-[#F0ECE1]'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm sm:text-base text-[#C9A050]">
                            {m.partner1Name || 'Partner 1'}
                          </span>
                          <span className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>&amp;</span>
                          <span className="font-bold text-sm sm:text-base text-[#C9A050]">
                            {m.partner2Name || 'Partner 2'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#C9A050]/15 text-[#C9A050] border border-[#C9A050]/30">
                            {m.totalScore} / {m.maxScore || 36} Gunas ({m.percentage || Math.round((m.totalScore / (m.maxScore || 36)) * 100)}%)
                          </span>
                          <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}`}>
                            {m.verdictTitle || 'Calculated Match'}
                          </span>
                        </div>

                        <div className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} flex items-center space-x-2 pt-0.5`}>
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(m.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleLoadFromHistory(m)}
                          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#C9A050] hover:bg-[#D4AF37] text-black transition shadow-sm cursor-pointer"
                        >
                          <span>Load</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteFromHistory(m.id, e)}
                          className="p-1.5 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
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
              <div className={`p-4 sm:p-5 border-t flex justify-between items-center ${
                theme === 'dark' ? 'border-[#2A2A2E] bg-[#101014]' : 'border-[#E5E1D8] bg-[#F9F7F1]'
              }`}>
                <span className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>
                  Click "Load" to restore any match report directly into the UI.
                </span>
                <button
                  type="button"
                  onClick={() => setIsHistoryModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition cursor-pointer ${
                    theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-white border-[#E5E1D8] text-[#2A2A2E] hover:bg-[#F0ECE1]'
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


