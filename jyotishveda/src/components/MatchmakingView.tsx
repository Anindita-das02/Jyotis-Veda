import React, { useState, useEffect, useRef } from 'react';
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
  Users,
  Calendar,
  Clock,
  MapPin,
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { UserProfile, AshtaKootaMilanResult, KootaItem } from '../types';
import { calculateKundliMilan, PRESET_MATCHMAKING_COUPLES, calculateVedicChart, calculateNumerology } from '../services/astroEngine';
import { MatchReportSummary, MatchReportFull, saveMatchReport, listMatchReports, fetchMatchReport, getMatchReportPdfUrl } from '../services/matchmakingApi';
import { getTranslation } from '../services/translations';
import { API_ENDPOINTS } from '../config/api_config';
import { ApiError } from '../services/api';

interface MatchmakingViewProps {
  currentProfile: UserProfile;
  profiles: UserProfile[];
  language?: string;
  isAuthenticated?: boolean;
  theme?: 'light' | 'dark';
}

export const MatchmakingView: React.FC<MatchmakingViewProps> = ({
  currentProfile,
  profiles,
  language = 'en',
  isAuthenticated,
  theme = 'dark',
}) => {
  // Select partner 1 and partner 2
  const [partner1, setPartner1] = useState<UserProfile>(() => {
    return profiles[0] || PRESET_MATCHMAKING_COUPLES[0].partner1;
  });

  const [partner2, setPartner2] = useState<UserProfile>(() => {
    return profiles[1] || PRESET_MATCHMAKING_COUPLES[0].partner2;
  });

  const [isCustomEntryP1, setIsCustomEntryP1] = useState(false);
  const [isCustomEntryP2, setIsCustomEntryP2] = useState(false);

  const [matchResult, setMatchResult] = useState<AshtaKootaMilanResult>(() =>
    calculateKundliMilan(partner1, partner2)
  );

  const [expandedKoota, setExpandedKoota] = useState<string | null>('nadi');
  const [activeTab, setActiveTab] = useState<'kootas' | 'doshas' | 'synastry' | 'remedies' | 'ai_counsel' | 'download'>('kootas');

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSynthesis, setAiSynthesis] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedReportId, setSavedReportId] = useState<string | null>(null);

  const handleSaveMatchReport = async () => {
    setSaveState('saving');
    setSaveError(null);
    try {
      const saved = await saveMatchReport(matchResult);
      setSavedReportId(saved.id);
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2500);
    } catch (err) {
      setSaveState('error');
      setSaveError(err instanceof ApiError ? err.message : 'Could not save report');
    }
  };

  const printableRef = useRef<HTMLDivElement>(null);
  const t = (key: string) => getTranslation(key, language);

  // Recalculate match whenever partner1 or partner2 changes
  useEffect(() => {
    const result = calculateKundliMilan(partner1, partner2);
    setMatchResult(result);
    setAiSynthesis(null); // Reset AI synthesis for new pair
  }, [partner1, partner2]);

  // Handle Preset selection
  const handleSelectPreset = (idx: number) => {
    const preset = PRESET_MATCHMAKING_COUPLES[idx];
    if (preset) {
      setPartner1(preset.partner1);
      setPartner2(preset.partner2);
      setIsCustomEntryP1(false);
      setIsCustomEntryP2(false);
    }
  };

  // Generate AI deep synthesis
  const handleGenerateAISynthesis = async () => {
    setIsGeneratingAI(true);
    try {
      const response = await fetch(API_ENDPOINTS.MATCHMAKING.SYNTHESIS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner1,
          partner2,
          matchResult,
          language,
        }),
      });
      const data = await response.json();
      if (data.success && data.synthesis) {
        setAiSynthesis(data.synthesis);
      }
    } catch (err) {
      console.error('Failed to generate AI Kundli Milan synthesis:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Trigger browser print for certificate
  const handlePrintCertificate = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 300);
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
      <div className="bg-[#141418] border border-[#2A2A2E] rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A050]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold tracking-widest text-[#C9A050] uppercase mb-2">
              <HeartHandshake className="w-4 h-4" />
              <span>{t('matchmaking.title')}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#F0ECE1]">
              Kundli Milan & Relationship Compatibility
            </h1>
            <p className="text-sm text-[#9E9A90] mt-2 max-w-2xl leading-relaxed">
              Authentic Ashta Koota 36 Gunas calculation, Manglik (Kuja) Dosha balance, Nadi vitality, and Western synastry synthesis for marriage, love, and life partnerships.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('download')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#C9A050] hover:bg-[#D4AF37] text-[#0D0D0F] font-bold text-xs tracking-wide shadow-lg shadow-[#C9A050]/20 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{t('matchmaking.download_pdf')}</span>
            </button>
            <button
              onClick={handlePrintCertificate}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#1A1A1E] hover:bg-[#222228] border border-[#2A2A2E] text-xs text-[#E5E1D8] font-medium transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#C9A050]" />
              <span>{t('matchmaking.print_report')}</span>
            </button>
          </div>
        </div>

        {/* Preset Couples Selector */}
        <div className="mt-6 pt-6 border-t border-[#2A2A2E]/80">
          <span className="text-xs font-semibold text-[#9E9A90] uppercase tracking-wider block mb-3">
            ✨ Quick Preset Test Couples (Demonstration):
          </span>
          <div className="flex flex-wrap gap-2.5">
            {PRESET_MATCHMAKING_COUPLES.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectPreset(idx)}
                className={`text-xs px-3.5 py-1.5 rounded-lg border transition cursor-pointer ${
                  partner1.fullName === preset.partner1.fullName && partner2.fullName === preset.partner2.fullName
                    ? 'bg-[#C9A050]/20 border-[#C9A050] text-[#E8D5B5] font-semibold'
                    : 'bg-[#0D0D0F] border-[#2A2A2E] text-[#9E9A90] hover:border-[#C9A050]/40 hover:text-[#E5E1D8]'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Partner Profiles Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Partner 1 Card */}
        <div className="bg-[#141418] border border-[#2A2A2E] rounded-2xl p-6 shadow-lg relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border matchmaking-avatar-a">
                A
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-[#F0ECE1]">
                  {t('matchmaking.partner1')}
                </h3>
                <span className="text-[11px] text-[#9E9A90]">Groom / Person A Details</span>
              </div>
            </div>
            <button
              onClick={() => setIsCustomEntryP1(!isCustomEntryP1)}
              className="text-xs text-[#C9A050] hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <Sliders className="w-3 h-3" />
              <span>{isCustomEntryP1 ? 'Select Saved' : 'Edit Birth Details'}</span>
            </button>
          </div>

          {!isCustomEntryP1 ? (
            <div className="space-y-3">
              <label className="text-xs text-[#9E9A90] font-medium block">Select from Saved Profiles:</label>
              <select
                value={partner1.id}
                onChange={(e) => {
                  const selected = profiles.find((p) => p.id === e.target.value);
                  if (selected) setPartner1(selected);
                }}
                className="w-full bg-[#0D0D0F] border border-[#2A2A2E] rounded-xl px-4 py-2.5 text-sm text-[#E5E1D8] focus:border-[#C9A050] outline-none"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.gender}, {p.birthDate} - {p.birthPlace})
                  </option>
                ))}
              </select>

              <div className="p-3.5 rounded-xl bg-[#0D0D0F]/80 border border-[#2A2A2E] text-xs space-y-1.5 mt-3">
                <div className="flex justify-between text-[#9E9A90]">
                  <span>Birth Date & Time:</span>
                  <span className="text-[#E5E1D8] font-medium">{partner1.birthDate} at {partner1.birthTime}</span>
                </div>
                <div className="flex justify-between text-[#9E9A90]">
                  <span>Birth Place:</span>
                  <span className="text-[#E5E1D8] font-medium">{partner1.birthPlace}</span>
                </div>
                <div className="flex justify-between text-[#9E9A90]">
                  <span>System:</span>
                  <span className="text-[#C9A050] font-medium uppercase">{partner1.horoscopeSystem || 'Vedic Sidereal'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#9E9A90] block mb-1">Full Name</label>
                <input
                  type="text"
                  value={partner1.fullName}
                  onChange={(e) => setPartner1({ ...partner1, fullName: e.target.value })}
                  className="w-full bg-[#0D0D0F] border border-[#2A2A2E] rounded-lg px-3 py-2 text-[#E5E1D8]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#9E9A90] block mb-1">Birth Date</label>
                  <input
                    type="date"
                    value={partner1.birthDate}
                    onChange={(e) => setPartner1({ ...partner1, birthDate: e.target.value })}
                    className="w-full bg-[#0D0D0F] border border-[#2A2A2E] rounded-lg px-3 py-2 text-[#E5E1D8]"
                  />
                </div>
                <div>
                  <label className="text-[#9E9A90] block mb-1">Birth Time</label>
                  <input
                    type="time"
                    value={partner1.birthTime}
                    onChange={(e) => setPartner1({ ...partner1, birthTime: e.target.value })}
                    className="w-full bg-[#0D0D0F] border border-[#2A2A2E] rounded-lg px-3 py-2 text-[#E5E1D8]"
                  />
                </div>
              </div>
              <div>
                <label className="text-[#9E9A90] block mb-1">Birth City / Country</label>
                <input
                  type="text"
                  value={partner1.birthPlace}
                  onChange={(e) => setPartner1({ ...partner1, birthPlace: e.target.value })}
                  className="w-full bg-[#0D0D0F] border border-[#2A2A2E] rounded-lg px-3 py-2 text-[#E5E1D8]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Partner 2 Card */}
        <div className="bg-[#141418] border border-[#2A2A2E] rounded-2xl p-6 shadow-lg relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border matchmaking-avatar-b">
                B
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-[#F0ECE1]">
                  {t('matchmaking.partner2')}
                </h3>
                <span className="text-[11px] text-[#9E9A90]">Bride / Person B Details</span>
              </div>
            </div>
            <button
              onClick={() => setIsCustomEntryP2(!isCustomEntryP2)}
              className="text-xs text-[#C9A050] hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <Sliders className="w-3 h-3" />
              <span>{isCustomEntryP2 ? 'Select Saved' : 'Edit Birth Details'}</span>
            </button>
          </div>

          {!isCustomEntryP2 ? (
            <div className="space-y-3">
              <label className="text-xs text-[#9E9A90] font-medium block">Select from Saved Profiles:</label>
              <select
                value={partner2.id}
                onChange={(e) => {
                  const selected = profiles.find((p) => p.id === e.target.value);
                  if (selected) setPartner2(selected);
                }}
                className="w-full bg-[#0D0D0F] border border-[#2A2A2E] rounded-xl px-4 py-2.5 text-sm text-[#E5E1D8] focus:border-[#C9A050] outline-none"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.gender}, {p.birthDate} - {p.birthPlace})
                  </option>
                ))}
              </select>

              <div className="p-3.5 rounded-xl bg-[#0D0D0F]/80 border border-[#2A2A2E] text-xs space-y-1.5 mt-3">
                <div className="flex justify-between text-[#9E9A90]">
                  <span>Birth Date & Time:</span>
                  <span className="text-[#E5E1D8] font-medium">{partner2.birthDate} at {partner2.birthTime}</span>
                </div>
                <div className="flex justify-between text-[#9E9A90]">
                  <span>Birth Place:</span>
                  <span className="text-[#E5E1D8] font-medium">{partner2.birthPlace}</span>
                </div>
                <div className="flex justify-between text-[#9E9A90]">
                  <span>System:</span>
                  <span className="text-[#C9A050] font-medium uppercase">{partner2.horoscopeSystem || 'Vedic Sidereal'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#9E9A90] block mb-1">Full Name</label>
                <input
                  type="text"
                  value={partner2.fullName}
                  onChange={(e) => setPartner2({ ...partner2, fullName: e.target.value })}
                  className="w-full bg-[#0D0D0F] border border-[#2A2A2E] rounded-lg px-3 py-2 text-[#E5E1D8]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#9E9A90] block mb-1">Birth Date</label>
                  <input
                    type="date"
                    value={partner2.birthDate}
                    onChange={(e) => setPartner2({ ...partner2, birthDate: e.target.value })}
                    className="w-full bg-[#0D0D0F] border border-[#2A2A2E] rounded-lg px-3 py-2 text-[#E5E1D8]"
                  />
                </div>
                <div>
                  <label className="text-[#9E9A90] block mb-1">Birth Time</label>
                  <input
                    type="time"
                    value={partner2.birthTime}
                    onChange={(e) => setPartner2({ ...partner2, birthTime: e.target.value })}
                    className="w-full bg-[#0D0D0F] border border-[#2A2A2E] rounded-lg px-3 py-2 text-[#E5E1D8]"
                  />
                </div>
              </div>
              <div>
                <label className="text-[#9E9A90] block mb-1">Birth City / Country</label>
                <input
                  type="text"
                  value={partner2.birthPlace}
                  onChange={(e) => setPartner2({ ...partner2, birthPlace: e.target.value })}
                  className="w-full bg-[#0D0D0F] border border-[#2A2A2E] rounded-lg px-3 py-2 text-[#E5E1D8]"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Score Hero Card */}
      <div className={`${theme === 'dark' ? 'bg-gradient-to-br from-[#1A1A1E] via-[#141418] to-[#0D0D0F]' : 'bg-[#FFFFFF]'} border border-[#C9A050]/40 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left: Overall Guna Gauge */}
          <div className="flex items-center space-x-6">
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 shrink-0 flex items-center justify-center">
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
                <span className="text-2xl sm:text-3xl font-serif font-bold text-[#F0ECE1]">
                  {matchResult.totalPoints}
                </span>
                <span className="text-[10px] text-[#C9A050] font-bold tracking-wider uppercase">/ 36 Gunas</span>
                <span className="text-[9px] text-[#9E9A90] font-sans">{matchResult.percentage}%</span>
              </div>
            </div>

            <div>
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#C9A050]/20 text-[#C9A050] border border-[#C9A050]/40 mb-2">
                <Award className="w-3.5 h-3.5" />
                <span>{matchResult.verdictTitle}</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#F0ECE1]">
                {partner1.fullName} &amp; {partner2.fullName}
              </h2>
              <p className="text-xs sm:text-sm text-[#9E9A90] mt-2 max-w-xl leading-relaxed">
                {matchResult.summary}
              </p>
            </div>
          </div>

          {/* Right: Key Compatibility Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[#0D0D0F]/80 border border-[#2A2A2E] text-center">
              <div className="flex items-center justify-center text-[#C9A050] mb-1">
                <Flame className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-[#9E9A90] uppercase tracking-wider block">Manglik Dosha</span>
              <span className="text-xs font-bold text-[#E5E1D8] mt-0.5 block">
                {matchResult.manglik.isNeutralized ? 'Neutralized ✓' : 'Remedy Needed ⚠️'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0D0D0F]/80 border border-[#2A2A2E] text-center">
              <div className="flex items-center justify-center text-[#C9A050] mb-1">
                <Dna className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-[#9E9A90] uppercase tracking-wider block">Nadi Vitality</span>
              <span className="text-xs font-bold text-[#E5E1D8] mt-0.5 block">
                {matchResult.kootas.find((k) => k.id === 'nadi')?.obtainedPoints}/8 Points
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0D0D0F]/80 border border-[#2A2A2E] text-center">
              <div className="flex items-center justify-center text-[#C9A050] mb-1">
                <Heart className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-[#9E9A90] uppercase tracking-wider block">Bhakoot Harmony</span>
              <span className="text-xs font-bold text-[#E5E1D8] mt-0.5 block">
                {matchResult.kootas.find((k) => k.id === 'bhakoot')?.obtainedPoints}/7 Points
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#2A2A2E] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('kootas')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'kootas'
              ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20'
              : 'bg-[#141418] text-[#9E9A90] hover:text-[#E5E1D8] border border-[#2A2A2E]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>8 Kootas Breakdown ({matchResult.totalPoints}/36)</span>
        </button>

        <button
          onClick={() => setActiveTab('doshas')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'doshas'
              ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20'
              : 'bg-[#141418] text-[#9E9A90] hover:text-[#E5E1D8] border border-[#2A2A2E]'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Manglik &amp; Critical Doshas</span>
        </button>

        <button
          onClick={() => setActiveTab('synastry')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'synastry'
              ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20'
              : 'bg-[#141418] text-[#9E9A90] hover:text-[#E5E1D8] border border-[#2A2A2E]'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Western Synastry &amp; Elements</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_counsel')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'ai_counsel'
              ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20'
              : 'bg-[#141418] text-[#9E9A90] hover:text-[#E5E1D8] border border-[#2A2A2E]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Astrological Counsel</span>
        </button>

        <button
          onClick={() => setActiveTab('remedies')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'remedies'
              ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20'
              : 'bg-[#141418] text-[#9E9A90] hover:text-[#E5E1D8] border border-[#2A2A2E]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Remedies &amp; Muhurat</span>
        </button>

        <button
          onClick={() => setActiveTab('download')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'download'
              ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20'
              : 'bg-[#141418] text-[#9E9A90] hover:text-[#E5E1D8] border border-[#2A2A2E]'
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
            <h3 className="text-lg font-serif font-bold text-[#F0ECE1]">
              Ashta Koota (8 Kootas) Classical Scoring Matrix
            </h3>
            <span className="text-xs text-[#9E9A90]">
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
                  className="bg-[#141418] border border-[#2A2A2E] rounded-2xl p-5 hover:border-[#C9A050]/40 transition shadow-sm"
                >
                  <div
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                    onClick={() => setExpandedKoota(isExpanded ? null : koota.id)}
                  >
                    <div className="flex items-start sm:items-center space-x-4">
                      <div className="w-9 h-9 rounded-xl bg-[#1A1A1E] border border-[#2A2A2E] flex items-center justify-center font-bold text-sm text-[#C9A050] shrink-0">
                        0{index + 1}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-base font-serif font-bold text-[#F0ECE1]">
                            {koota.name}
                          </h4>
                          <span className="text-xs text-[#9E9A90] italic">({koota.sanskritName})</span>
                        </div>
                        <p className="text-xs text-[#9E9A90] mt-0.5">{koota.area}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Values Comparison Pill */}
                      <div className="hidden md:flex items-center space-x-2 text-xs px-3 py-1.5 rounded-lg bg-[#0D0D0F] border border-[#2A2A2E] text-[#9E9A90]">
                        <span className="text-[#E5E1D8]">{partner1.fullName.split(' ')[0]}: <strong className="text-[#C9A050]">{koota.p1Value}</strong></span>
                        <span>↔</span>
                        <span className="text-[#E5E1D8]">{partner2.fullName.split(' ')[0]}: <strong className="text-[#C9A050]">{koota.p2Value}</strong></span>
                      </div>

                      {/* Points Badge */}
                      <div className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeClass}`}>
                        {koota.obtainedPoints} / {koota.maxPoints} Pts
                      </div>

                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#9E9A90]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#9E9A90]" />
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
                        className="mt-4 pt-4 border-t border-[#2A2A2E] text-xs text-[#E5E1D8] space-y-2 leading-relaxed"
                      >
                        <p className="text-[#9E9A90]">{koota.description}</p>
                        <div className="p-3 rounded-xl bg-[#0D0D0F] border border-[#2A2A2E] flex items-start space-x-2">
                          <Info className="w-4 h-4 text-[#C9A050] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-[#F0ECE1]">Verdict Details: </span>
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
          <div className="bg-[#141418] border border-[#2A2A2E] rounded-2xl p-6 shadow-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-[#F0ECE1]">
                  Manglik (Kuja) Dosha Comparative Assessment
                </h3>
                <p className="text-xs text-[#9E9A90]">Mars placement in 1st, 2nd, 4th, 7th, 8th, or 12th houses</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
              {/* Partner 1 Manglik */}
              <div className="p-4 rounded-xl bg-[#0D0D0F] border border-[#2A2A2E]">
                <span className="text-xs text-[#9E9A90] uppercase tracking-wider block mb-1">
                  {partner1.fullName} (Partner A)
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#F0ECE1]">
                    {matchResult.manglik.partner1.isManglik ? `Manglik (${matchResult.manglik.partner1.severity})` : 'Non-Manglik'}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded bg-[#1A1A1E] text-[#9E9A90] border border-[#2A2A2E]">
                    House {matchResult.manglik.partner1.marsHouse}
                  </span>
                </div>
                <p className="text-[11px] text-[#9E9A90] mt-2">
                  Status: <strong className="text-[#C9A050]">{matchResult.manglik.partner1.cancellation}</strong>
                </p>
              </div>

              {/* Partner 2 Manglik */}
              <div className="p-4 rounded-xl bg-[#0D0D0F] border border-[#2A2A2E]">
                <span className="text-xs text-[#9E9A90] uppercase tracking-wider block mb-1">
                  {partner2.fullName} (Partner B)
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#F0ECE1]">
                    {matchResult.manglik.partner2.isManglik ? `Manglik (${matchResult.manglik.partner2.severity})` : 'Non-Manglik'}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded bg-[#1A1A1E] text-[#9E9A90] border border-[#2A2A2E]">
                    House {matchResult.manglik.partner2.marsHouse}
                  </span>
                </div>
                <p className="text-[11px] text-[#9E9A90] mt-2">
                  Status: <strong className="text-[#C9A050]">{matchResult.manglik.partner2.cancellation}</strong>
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
              matchResult.manglik.isNeutralized
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/20 border-amber-500/40 text-amber-300'
            }`}>
              <div className="font-bold text-sm mb-1">{matchResult.manglik.verdict}</div>
              <p>{matchResult.manglik.explanation}</p>
            </div>
          </div>

          {/* Nadi & Bhakoot Dosha Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nadi Dosha */}
            <div className="bg-[#141418] border border-[#2A2A2E] rounded-2xl p-6 shadow-md">
              <div className="flex items-center space-x-3 mb-3">
                <Dna className="w-5 h-5 text-emerald-400" />
                <h4 className="text-base font-serif font-bold text-[#F0ECE1]">Nadi Dosha Examination</h4>
              </div>
              <div className="space-y-2 text-xs text-[#9E9A90]">
                <div className="flex justify-between">
                  <span>{partner1.fullName.split(' ')[0]} Nadi:</span>
                  <strong className="text-[#E5E1D8]">{matchResult.nadiDosha.partner1Nadi}</strong>
                </div>
                <div className="flex justify-between">
                  <span>{partner2.fullName.split(' ')[0]} Nadi:</span>
                  <strong className="text-[#E5E1D8]">{matchResult.nadiDosha.partner2Nadi}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <strong className={matchResult.nadiDosha.hasDosha && !matchResult.nadiDosha.isCancelled ? 'text-rose-400' : 'text-emerald-400'}>
                    {matchResult.nadiDosha.hasDosha
                      ? matchResult.nadiDosha.isCancelled
                        ? 'Dosha Cancelled ✓'
                        : 'Active Nadi Dosha ⚠️'
                      : 'No Dosha (Pure Harmony) ✓'}
                  </strong>
                </div>
                <p className="p-3 rounded-lg bg-[#0D0D0F] border border-[#2A2A2E] text-[11px] text-[#E5E1D8] mt-3">
                  {matchResult.nadiDosha.reason}. {matchResult.nadiDosha.remedy}
                </p>
              </div>
            </div>

            {/* Bhakoot Dosha */}
            <div className="bg-[#141418] border border-[#2A2A2E] rounded-2xl p-6 shadow-md">
              <div className="flex items-center space-x-3 mb-3">
                <Heart className="w-5 h-5 text-purple-400" />
                <h4 className="text-base font-serif font-bold text-[#F0ECE1]">Bhakoot Dosha Examination</h4>
              </div>
              <div className="space-y-2 text-xs text-[#9E9A90]">
                <div className="flex justify-between">
                  <span>{partner1.fullName.split(' ')[0]} Rashi:</span>
                  <strong className="text-[#E5E1D8]">{matchResult.bhakootDosha.partner1Rashi}</strong>
                </div>
                <div className="flex justify-between">
                  <span>{partner2.fullName.split(' ')[0]} Rashi:</span>
                  <strong className="text-[#E5E1D8]">{matchResult.bhakootDosha.partner2Rashi}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Rashi Angular Disparity:</span>
                  <strong className="text-[#C9A050]">{matchResult.bhakootDosha.rashiDistance}</strong>
                </div>
                <p className="p-3 rounded-lg bg-[#0D0D0F] border border-[#2A2A2E] text-[11px] text-[#E5E1D8] mt-3">
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
          <div className="bg-[#141418] border border-[#2A2A2E] rounded-2xl p-6 shadow-md">
            <h3 className="text-lg font-serif font-bold text-[#F0ECE1] mb-2">
              Western Synastry &amp; Cosmic Planetary Aspects
            </h3>
            <p className="text-xs text-[#9E9A90] mb-6">
              Cross-tradition psychological harmonization between solar-lunar archetypes and interpersonal attraction vectors.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {matchResult.synastry.map((syn, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#0D0D0F] border border-[#2A2A2E] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#C9A050]">{syn.title}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#C9A050]/20 text-[#E8D5B5]">
                      {syn.harmonyScore}%
                    </span>
                  </div>
                  <span className="text-[11px] text-[#9E9A90] block">{syn.planets}</span>
                  <div className="w-full bg-[#1A1A1E] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#C9A050] h-full" style={{ width: `${syn.harmonyScore}%` }} />
                  </div>
                  <p className="text-xs text-[#E5E1D8] pt-1">{syn.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Elemental & Numerology Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#141418] border border-[#2A2A2E] rounded-2xl p-6 shadow-md">
              <h4 className="text-base font-serif font-bold text-[#F0ECE1] mb-3">Elemental Synergy</h4>
              <div className="p-4 rounded-xl bg-[#0D0D0F] border border-[#2A2A2E] space-y-2 text-xs">
                <div className="flex justify-between text-[#9E9A90]">
                  <span>Elements:</span>
                  <strong className="text-[#E5E1D8]">
                    {matchResult.elementalBalance.partner1Element} ↔ {matchResult.elementalBalance.partner2Element}
                  </strong>
                </div>
                <div className="flex justify-between text-[#9E9A90]">
                  <span>Synergy Score:</span>
                  <strong className="text-[#C9A050]">{matchResult.elementalBalance.score}%</strong>
                </div>
                <p className="text-[#E5E1D8] pt-1">{matchResult.elementalBalance.synergy}</p>
              </div>
            </div>

            <div className="bg-[#141418] border border-[#2A2A2E] rounded-2xl p-6 shadow-md">
              <h4 className="text-base font-serif font-bold text-[#F0ECE1] mb-3">Numerological Alignment (Mulank &amp; Bhagyank)</h4>
              <div className="p-4 rounded-xl bg-[#0D0D0F] border border-[#2A2A2E] space-y-2 text-xs">
                <div className="flex justify-between text-[#9E9A90]">
                  <span>Psychic Numbers (Mulank):</span>
                  <strong className="text-[#E5E1D8]">
                    Mulank {matchResult.numerologyMilan.partner1Mulank} ↔ Mulank {matchResult.numerologyMilan.partner2Mulank}
                  </strong>
                </div>
                <div className="flex justify-between text-[#9E9A90]">
                  <span>Destiny Harmony Score:</span>
                  <strong className="text-[#C9A050]">{matchResult.numerologyMilan.harmonyScore}%</strong>
                </div>
                <p className="text-[#E5E1D8] pt-1">{matchResult.numerologyMilan.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: AI Astrological Counsel */}
      {activeTab === 'ai_counsel' && (
        <div className="bg-[#141418] border border-[#2A2A2E] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold tracking-widest text-[#C9A050] uppercase mb-1">
                <Sparkles className="w-4 h-4" />
                <span>{t('matchmaking.ai_counsel')}</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-[#F0ECE1]">
                AI Daivajna Deep Relationship Synthesis
              </h3>
              <p className="text-xs text-[#9E9A90]">
                Multidimensional karmic counsel generated dynamically for {partner1.fullName} &amp; {partner2.fullName}.
              </p>
            </div>

            <button
              onClick={handleGenerateAISynthesis}
              disabled={isGeneratingAI}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#C9A050] hover:bg-[#D4AF37] disabled:opacity-50 text-[#0D0D0F] font-bold text-xs shadow-lg shadow-[#C9A050]/20 transition cursor-pointer shrink-0"
            >
              {isGeneratingAI ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Cosmic Charts...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Full AI Counsel</span>
                </>
              )}
            </button>
          </div>

          {aiSynthesis ? (
            <div className="p-6 rounded-2xl bg-[#0D0D0F] border border-[#2A2A2E] text-sm text-[#E5E1D8] leading-relaxed space-y-4">
              <div className="prose prose-invert max-w-none text-xs sm:text-sm">
                <ReactMarkdown>{aiSynthesis}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#0D0D0F]/60 border border-dashed border-[#2A2A2E] text-center space-y-3">
              <Sparkles className="w-8 h-8 text-[#C9A050] mx-auto opacity-70" />
              <p className="text-sm text-[#E5E1D8] font-serif">
                Generate an exhaustive AI consultation covering psychological affinity, wealth generation, marital timing, and conflict resolution.
              </p>
              <p className="text-xs text-[#9E9A90]">
                Click the button above to synthesize charts using Gemini 3.7 Flash.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Remedies & Muhurat */}
      {activeTab === 'remedies' && (
        <div className="space-y-6">
          <div className="bg-[#141418] border border-[#2A2A2E] rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center space-x-2.5 text-[#C9A050]">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-lg font-serif font-bold text-[#F0ECE1]">
                {t('matchmaking.remedies_title')}
              </h3>
            </div>
            <p className="text-xs text-[#9E9A90]">
              Traditional Vedic Upayas and practical actions designed to pacify minor planetary afflictions and enhance marital sweetness.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {matchResult.remedies.map((rem, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#0D0D0F] border border-[#2A2A2E] flex items-start space-x-3 text-xs">
                  <span className="w-6 h-6 rounded-full bg-[#C9A050]/20 text-[#C9A050] font-bold flex items-center justify-center shrink-0 text-[11px]">
                    {idx + 1}
                  </span>
                  <span className="text-[#E5E1D8] leading-relaxed">{rem}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Auspicious Muhurat Window Card */}
          <div className="bg-[#141418] border border-[#2A2A2E] rounded-2xl p-6 shadow-md space-y-3">
            <div className="flex items-center space-x-2.5 text-amber-400">
              <Calendar className="w-5 h-5" />
              <h4 className="text-base font-serif font-bold text-[#F0ECE1]">
                Auspicious Vivaha / Partnership Muhurat Guidance
              </h4>
            </div>
            <p className="text-xs text-[#E5E1D8] leading-relaxed p-4 rounded-xl bg-[#0D0D0F] border border-[#2A2A2E]">
              {matchResult.auspiciousMuhuratAdvice}
            </p>
          </div>
        </div>
      )}

      {/* Tab 6: Dedicated Match Report Download & Export Center */}
      {activeTab === 'download' && (
        <div className="space-y-6">
          <div className="bg-[#141418] border border-[#2A2A2E] rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="max-w-2xl">
              <div className="flex items-center space-x-2 text-xs font-semibold tracking-widest text-[#C9A050] uppercase mb-1">
                <Download className="w-4 h-4" />
                <span>Match Report Export &amp; Archival</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-[#F0ECE1]">
                Download Official Kundli Milan Dossier
              </h3>
              <p className="text-xs sm:text-sm text-[#9E9A90] mt-1.5 leading-relaxed">
                Export high-resolution printable certificates, formatted PDF reports, JSON astrological payloads, or plain-text summaries for family consultation.
              </p>
            </div>

            {/* Export Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
              {/* Option 0: Save to Account (server persistence) */}
              {isAuthenticated && (
                <div className="p-5 rounded-2xl bg-[#0D0D0F] border border-[#2A2A2E] hover:border-[#C9A050]/50 transition space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
                      <CloudUpload className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-serif font-bold text-[#F0ECE1]">
                      Save to My Account
                    </h4>
                    <p className="text-xs text-[#9E9A90] mt-1 leading-relaxed">
                      Persist this match report to your JyotishVeda account so it's accessible from any device.
                    </p>
                  </div>

                  <button
                    onClick={handleSaveMatchReport}
                    disabled={saveState === 'saving'}
                    title={saveError || undefined}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs tracking-wide transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                      saveState === 'saved'
                        ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
                        : saveState === 'error'
                        ? 'bg-rose-500/15 border border-rose-500/40 text-rose-400'
                        : 'bg-[#C9A050] hover:bg-[#D4AF37] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20'
                    }`}
                  >
                    {saveState === 'saving' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : saveState === 'saved' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : saveState === 'error' ? (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    ) : (
                      <CloudUpload className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {saveState === 'saving'
                        ? 'Saving...'
                        : saveState === 'saved'
                        ? 'Saved to Account'
                        : saveState === 'error'
                        ? 'Retry Save'
                        : 'Save Report'}
                    </span>
                  </button>

                  {savedReportId && (
                    <button
                      onClick={() => window.open(getMatchReportPdfUrl(savedReportId), '_blank')}
                      className="w-full py-2 rounded-xl bg-[#1A1A1E] hover:bg-[#222228] border border-[#2A2A2E] text-xs font-semibold text-[#E5E1D8] transition cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Download Server-Generated PDF</span>
                    </button>
                  )}
                </div>
              )}

              {/* Option 1: PDF Certificate */}
              <div className="p-5 rounded-2xl bg-[#0D0D0F] border border-[#2A2A2E] hover:border-[#C9A050]/50 transition space-y-4 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#C9A050]/15 border border-[#C9A050]/30 flex items-center justify-center text-[#C9A050] mb-3">
                    <Printer className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-serif font-bold text-[#F0ECE1]">
                    Print / Save PDF Certificate
                  </h4>
                  <p className="text-xs text-[#9E9A90] mt-1 leading-relaxed">
                    Formatted with classical borders, authentication seal, 8 Kootas matrix, and Pandit verification line.
                  </p>
                </div>

                <button
                  onClick={handlePrintCertificate}
                  className="w-full py-2.5 rounded-xl bg-[#C9A050] hover:bg-[#D4AF37] text-[#0D0D0F] font-bold text-xs tracking-wide shadow-md shadow-[#C9A050]/20 transition cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save as PDF</span>
                </button>
              </div>

              {/* Option 2: JSON Astrological Payload */}
              <div className="p-5 rounded-2xl bg-[#0D0D0F] border border-[#2A2A2E] hover:border-[#C9A050]/50 transition space-y-4 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-serif font-bold text-[#F0ECE1]">
                    Export Digital Dossier (JSON)
                  </h4>
                  <p className="text-xs text-[#9E9A90] mt-1 leading-relaxed">
                    Full mathematical calculation objects, planetary longitudes, and dosha records for archival.
                  </p>
                </div>

                <button
                  onClick={handleDownloadJSON}
                  className="w-full py-2.5 rounded-xl bg-[#1A1A1E] hover:bg-[#222228] border border-[#2A2A2E] text-xs font-semibold text-[#E5E1D8] transition cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>Download .JSON File</span>
                </button>
              </div>

              {/* Option 3: Plain Text Summary */}
              <div className="p-5 rounded-2xl bg-[#0D0D0F] border border-[#2A2A2E] hover:border-[#C9A050]/50 transition space-y-4 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3">
                    <Copy className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-serif font-bold text-[#F0ECE1]">
                    Plain Text / WhatsApp Summary
                  </h4>
                  <p className="text-xs text-[#9E9A90] mt-1 leading-relaxed">
                    Formatted text report ready to copy or download for rapid sharing with elders or consultants.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleDownloadTextReport}
                    className="flex-1 py-2.5 rounded-xl bg-[#1A1A1E] hover:bg-[#222228] border border-[#2A2A2E] text-xs font-semibold text-[#E5E1D8] transition cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <Download className="w-3.5 h-3.5 text-purple-400" />
                    <span>Download .TXT</span>
                  </button>
                  <button
                    onClick={handleCopyReport}
                    className="px-3 py-2.5 rounded-xl bg-[#1A1A1E] hover:bg-[#222228] border border-[#2A2A2E] text-xs font-semibold text-[#E5E1D8] transition cursor-pointer"
                    title="Copy Summary"
                  >
                    {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#9E9A90]" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRINTABLE OFFICIAL KUNDLI MILAN CERTIFICATE (Visible in Print Mode)       */}
      {/* ========================================================================= */}
      <div
        ref={printableRef}
        className={`${isPrinting ? 'block' : 'hidden'} print:block bg-white text-black p-8 max-w-4xl mx-auto border-8 border-double border-[#C9A050] my-6`}
        style={{ fontFamily: 'Georgia, serif' }}
      >
        {/* Certificate Header */}
        <div className="text-center border-b-2 border-[#C9A050] pb-6 mb-6">
          <div className="text-3xl font-bold tracking-widest text-[#8C6D23] uppercase mb-1">
            🕉️ JYOTISHVEDA
          </div>
          <div className="text-sm font-semibold tracking-wider text-gray-700 uppercase">
            Official Vedic Kundli Milan &amp; Ashta Koota Compatibility Certificate
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
    </div>
  );
};
