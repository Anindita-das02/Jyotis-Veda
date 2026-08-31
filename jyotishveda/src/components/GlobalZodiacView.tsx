import React, { useState, useEffect } from 'react';
import {
  Globe,
  Sparkles,
  Flame,
  Mountain,
  Wind,
  Droplets,
  Heart,
  Briefcase,
  Coins,
  Compass,
  Calendar,
  Layers,
  ArrowRight,
  MessageSquareText,
  CheckCircle,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { ZODIAC_SIGNS, ZodiacSign, calculateZodiacCompatibility, ZodiacCompatibilityResult } from '../services/zodiacData';
import { getTranslation } from '../services/translations';
import { API_ENDPOINTS } from '../config/api_config';
import { API_BASE_URL } from '../services/api';
import { UserProfile } from '../types';

function getZodiacSignId(dateStr?: string): string {
  if (!dateStr) return 'aries';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'aries';
  
  const m = date.getMonth() + 1; // 1-12
  const d = date.getDate();

  if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return 'aries';
  if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return 'taurus';
  if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) return 'gemini';
  if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) return 'cancer';
  if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return 'leo';
  if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return 'virgo';
  if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return 'libra';
  if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return 'scorpio';
  if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return 'sagittarius';
  if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return 'capricorn';
  if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return 'aquarius';
  if ((m === 2 && d >= 19) || (m === 3 && d <= 20)) return 'pisces';
  
  return 'aries';
}

const CustomZodiacSelect = ({ value, onChange, theme, label }: any) => {
  const [isOpen, React_useState] = React.useState(false);
  const selectedSign = ZODIAC_SIGNS.find(s => s.id === value) || ZODIAC_SIGNS[0];
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        React_useState(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {label && <label className="text-[11px] text-[#9E9A90] block mb-1">{label}</label>}
      <button
        onClick={() => React_useState(!isOpen)}
        className={`w-full flex items-center justify-between border px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none transition-colors ${
          theme === 'dark' 
            ? 'bg-[#1C1C22] border-[#2A2A2E] text-[#F0ECE1] hover:border-[#C9A050]' 
            : 'bg-[#FFFFFF] border-[#E5E1D8] text-[#2A2A2E] hover:border-[#C9A050]'
        } ${isOpen ? 'border-[#C9A050] ring-1 ring-[#C9A050]/50' : ''}`}
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg text-[#C9A050]" style={{ fontFamily: '"Segoe UI Symbol", "Apple Symbols", sans-serif' }}>
            {selectedSign.symbol}&#xFE0E;
          </span>
          <span>{selectedSign.name} ({selectedSign.sanskritName})</span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 opacity-70" />
      </button>

      {isOpen && (
        <div className={`absolute z-50 w-full mt-1 border rounded-lg shadow-xl max-h-60 overflow-y-auto scrollbar-thin ${
          theme === 'dark'
            ? 'bg-[#1C1C22] border-[#2A2A2E]'
            : 'bg-[#FFFFFF] border-[#E5E1D8] shadow-black/5'
        }`}>
          {ZODIAC_SIGNS.map((s) => (
            <div
              key={s.id}
              onClick={() => {
                onChange(s.id);
                React_useState(false);
              }}
              className={`flex items-center space-x-2 px-3 py-2 cursor-pointer transition-colors text-xs font-semibold ${
                value === s.id 
                  ? (theme === 'dark' ? 'bg-[#C9A050]/20 text-[#C9A050]' : 'bg-[#C9A050]/10 text-[#94691E]') 
                  : (theme === 'dark' ? 'text-[#F0ECE1] hover:bg-[#2A2A2E]' : 'text-[#2A2A2E] hover:bg-[#FAF8F2]')
              }`}
            >
              <span className={`text-lg ${value === s.id ? '' : 'text-[#C9A050]'}`} style={{ fontFamily: '"Segoe UI Symbol", "Apple Symbols", sans-serif' }}>
                {s.symbol}&#xFE0E;
              </span>
              <span>{s.name} ({s.sanskritName})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface GlobalZodiacViewProps {
  profile?: UserProfile;
  chartData?: any;
  language?: string;
  onAskAIForSign?: (signName: string, promptText: string) => void;
  theme?: 'light' | 'dark';
}

export const GlobalZodiacView: React.FC<GlobalZodiacViewProps> = ({
  profile,
  chartData,
  language = 'en',
  onAskAIForSign,
  theme = 'dark',
}) => {
  const [selectedElement, setSelectedElement] = useState<'All' | 'Fire' | 'Earth' | 'Air' | 'Water'>('All');
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'year'>('today');
  const [zodiacSystem, setZodiacSystem] = useState<'tropical' | 'sidereal'>('tropical');
  const [selectedSignId, setSelectedSignId] = useState<string>('aries');

  useEffect(() => {
    let signId = 'aries';
    if (chartData?.ascendant?.signName) {
      signId = chartData.ascendant.signName.toLowerCase();
    } else if (profile?.birthDate) {
      signId = getZodiacSignId(profile.birthDate);
    }
    setSelectedSignId(signId);
    
    setCompatSignA(signId);
    
    // Find highest compatibility match
    let bestMatchId = signId === 'aries' ? 'leo' : 'aries';
    let maxScore = -1;
    for (const sign of ZODIAC_SIGNS) {
      if (sign.id === signId) continue;
      const res = calculateZodiacCompatibility(signId, sign.id, zodiacSystem);
      if (res.overallScore > maxScore) {
        maxScore = res.overallScore;
        bestMatchId = sign.id;
      }
    }
    setCompatSignB(bestMatchId);
  }, [profile, chartData, zodiacSystem]);

  // Compatibility state
  const [compatSignA, setCompatSignA] = useState<string>('aries');
  const [compatSignB, setCompatSignB] = useState<string>('leo');

  // Dynamic AI Forecast state
  const [dynamicZodiacData, setDynamicZodiacData] = useState<Record<string, any>>({});
  const [isFetchingForecast, setIsFetchingForecast] = useState(false);

  const filteredSigns = ZODIAC_SIGNS.filter(
    (s) => selectedElement === 'All' || s.element === selectedElement
  );

  const activeSign = ZODIAC_SIGNS.find((s) => s.id === selectedSignId) || ZODIAC_SIGNS[0];
  const compatResult: ZodiacCompatibilityResult = calculateZodiacCompatibility(compatSignA, compatSignB, zodiacSystem);

  const t = (key: string) => getTranslation(key, language);

  React.useEffect(() => {
    const fetchForecast = async () => {
      const cacheKey = `${activeSign.id}-${timeframe}-${language}`;
      if (dynamicZodiacData[cacheKey]) return; // Already fetched

      setIsFetchingForecast(true);
      try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ZODIAC.GLOBAL_FORECAST}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sign: activeSign.name, timeframe, language })
        });
        const data = await response.json();
        if (data && data.data) {
          setDynamicZodiacData(prev => ({ ...prev, [cacheKey]: data.data }));
        }
      } catch (error) {
        console.error("Failed to fetch dynamic forecast:", error);
      } finally {
        setIsFetchingForecast(false);
      }
    };

    fetchForecast();
  }, [activeSign.id, activeSign.name, timeframe, language]);

  const currentDynamicData = dynamicZodiacData[`${activeSign.id}-${timeframe}-${language}`];

  const getForecastText = (sign: ZodiacSign) => {
    if (currentDynamicData && currentDynamicData.forecast) return currentDynamicData.forecast;

    switch (timeframe) {
      case 'week':
        return sign.weeklyForecast;
      case 'month':
        return sign.monthlyForecast;
      case 'year':
        return sign.yearly2026Forecast;
      case 'today':
      default:
        return t(sign.todayForecast);
    }
  };

  const getElementBadge = (element: string) => {
    if (theme === 'light') {
      let Icon = Globe;
      if (element === 'Fire') Icon = Flame;
      if (element === 'Earth') Icon = Mountain;
      if (element === 'Air') Icon = Wind;
      if (element === 'Water') Icon = Droplets;

      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#C9A050]/10 text-[#C9A050] border border-[#C9A050]/30">
          <Icon className="w-3 h-3 text-[#C9A050]" />
          <span>{element}</span>
        </span>
      );
    }

    switch (element) {
      case 'Fire':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <Flame className="w-3 h-3 text-rose-400" />
            <span>{element}</span>
          </span>
        );
      case 'Earth':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <Mountain className="w-3 h-3 text-emerald-400" />
            <span>{element}</span>
          </span>
        );
      case 'Air':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
            <Wind className="w-3 h-3 text-sky-400" />
            <span>{element}</span>
          </span>
        );
      case 'Water':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            <Droplets className="w-3 h-3 text-indigo-400" />
            <span>{element}</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-10 animate-fade-in text-[#E5E1D8]">
      {/* Header Banner */}
      <div className="bg-[#141418] border border-[#2A2A2E] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#C9A050]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2.5 text-[#C9A050] text-xs font-semibold uppercase tracking-widest mb-2">
              <Globe className="w-4 h-4 text-[#C9A050]" />
              <span>{t('zodiac.title')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F0ECE1] tracking-tight">
              {t('zodiac.title')}
            </h1>
            <p className="text-sm text-[#9E9A90] mt-1.5 max-w-3xl leading-relaxed">
              {t('zodiac.subtitle')}
            </p>
          </div>

          {/* Tropical vs Sidereal Switcher */}
          <div className="flex items-center bg-[#0D0D0F] p-1.5 rounded-xl border border-[#2A2A2E] text-xs self-stretch sm:self-auto justify-center">
            <button
              onClick={() => setZodiacSystem('tropical')}
              className={`px-3.5 py-2 rounded-lg font-medium transition cursor-pointer flex items-center space-x-1.5 ${
                zodiacSystem === 'tropical'
                  ? 'bg-[#C9A050] text-[#0D0D0F] shadow font-bold'
                  : 'text-[#9E9A90] hover:text-[#E5E1D8]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{t('zodiac.system.tropical')}</span>
            </button>
            <button
              onClick={() => setZodiacSystem('sidereal')}
              className={`px-3.5 py-2 rounded-lg font-medium transition cursor-pointer flex items-center space-x-1.5 ${
                zodiacSystem === 'sidereal'
                  ? 'bg-[#C9A050] text-[#0D0D0F] shadow font-bold'
                  : 'text-[#9E9A90] hover:text-[#E5E1D8]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t('zodiac.system.sidereal')}</span>
            </button>
          </div>
        </div>

        {/* Ayanamsha Note */}
        <div className="mt-4 pt-4 border-t border-[#2A2A2E]/60 flex items-center space-x-2 text-[12px] text-[#C9A050]/90">
          <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-[#C9A050]" />
          <span>{t('zodiac.ayanamsa_note')}</span>
        </div>
      </div>

      {/* Control Bar: Element Filter & Timeframe Selector */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-[#141418] border border-[#2A2A2E] p-4 rounded-xl shadow-lg">
        {/* Element Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {(['All', 'Fire', 'Earth', 'Air', 'Water'] as const).map((el) => (
            <button
              key={el}
              onClick={() => setSelectedElement(el)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
                selectedElement === el
                  ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20'
                  : 'bg-[#1C1C22] text-[#9E9A90] hover:text-[#E5E1D8] border border-[#2A2A2E]'
              }`}
            >
              {el === 'Fire' && <Flame className={`w-3 h-3 ${theme === 'dark' ? 'text-rose-400' : 'text-[#C9A050]'}`} />}
              {el === 'Earth' && <Mountain className={`w-3 h-3 ${theme === 'dark' ? 'text-emerald-400' : 'text-[#C9A050]'}`} />}
              {el === 'Air' && <Wind className={`w-3 h-3 ${theme === 'dark' ? 'text-sky-400' : 'text-[#C9A050]'}`} />}
              {el === 'Water' && <Droplets className={`w-3 h-3 ${theme === 'dark' ? 'text-indigo-400' : 'text-[#C9A050]'}`} />}
              <span>{el === 'All' ? t('zodiac.filter.all') : el}</span>
            </button>
          ))}
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center bg-[#0D0D0F] p-1 rounded-lg border border-[#2A2A2E] text-xs">
          <button
            onClick={() => setTimeframe('today')}
            className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              timeframe === 'today' ? 'bg-[#2A2A2E] text-[#F0ECE1] font-bold' : 'text-[#9E9A90] hover:text-[#E5E1D8]'
            }`}
          >
            {t('zodiac.timeframe.today')}
          </button>
          <button
            onClick={() => setTimeframe('week')}
            className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              timeframe === 'week' ? 'bg-[#2A2A2E] text-[#F0ECE1] font-bold' : 'text-[#9E9A90] hover:text-[#E5E1D8]'
            }`}
          >
            {t('zodiac.timeframe.week')}
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              timeframe === 'month' ? 'bg-[#2A2A2E] text-[#F0ECE1] font-bold' : 'text-[#9E9A90] hover:text-[#E5E1D8]'
            }`}
          >
            {t('zodiac.timeframe.month')}
          </button>
          <button
            onClick={() => setTimeframe('year')}
            className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              timeframe === 'year' ? 'bg-[#2A2A2E] text-[#F0ECE1] font-bold' : 'text-[#9E9A90] hover:text-[#E5E1D8]'
            }`}
          >
            {t('zodiac.timeframe.year')}
          </button>
        </div>
      </div>

      {/* Zodiac Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5">
        {filteredSigns.map((sign) => {
          const isSelected = sign.id === selectedSignId;
          return (
            <button
              key={sign.id}
              onClick={() => setSelectedSignId(sign.id)}
              className={`p-4 rounded-xl border text-left transition-all duration-300 ease-out cursor-pointer flex flex-col justify-between relative overflow-hidden group hover:scale-[1.03] hover:-translate-y-1 hover:shadow-xl hover:shadow-[#C9A050]/20 ${
                isSelected
                  ? theme === 'dark'
                    ? 'bg-gradient-to-b from-[#1C1C22] to-[#141418] border-transparent shadow-xl shadow-[#C9A050]/25 ring-2 ring-[#C9A050]'
                    : 'bg-[#FFFFFF] border-transparent shadow-xl shadow-[#C9A050]/25 ring-2 ring-[#C9A050]'
                  : 'bg-[#141418] border-[#2A2A2E] hover:border-[#C9A050]/60 hover:bg-[#1A1A20] ring-0'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span 
                    className="text-2xl font-serif text-[#C9A050] group-hover:scale-110 transition duration-200"
                    style={{ fontVariantEmoji: 'text', fontFamily: '"Segoe UI Symbol", "Apple Symbols", sans-serif' }}
                  >
                    {sign.symbol}&#xFE0E;
                  </span>
                  {getElementBadge(sign.element)}
                </div>

                <h3 className="font-bold text-sm text-[#F0ECE1] flex items-baseline space-x-1.5">
                  <span>{sign.name}</span>
                  <span className="text-[11px] text-[#9E9A90] font-normal">({sign.sanskritScript})</span>
                </h3>

                <div className="text-[11px] text-[#C9A050]/90 mt-0.5">
                  {zodiacSystem === 'tropical' ? sign.tropicalDates : sign.siderealDates}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[#2A2A2E]/60 flex items-center justify-between text-[10px] text-[#9E9A90]">
                <span>{sign.glyph}</span>
                <span className={`font-semibold ${theme === 'dark' ? 'text-emerald-400' : 'text-[#C9A050]'}`}>{zodiacSystem === 'sidereal' ? Math.max(0, sign.vitalityToday - 3) : sign.vitalityToday}% Vitality</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Sign Detailed Deep-Dive Container */}
      <div className="bg-[#141418] border border-[#2A2A2E] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-8">
        {/* Top Highlight Info */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-[#2A2A2E]">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-[#C9A050]/15 border border-[#C9A050]/30 flex items-center justify-center text-[#C9A050] font-serif text-3xl font-bold shadow-sm" style={{ fontVariantEmoji: 'text', fontFamily: '"Segoe UI Symbol", "Apple Symbols", sans-serif' }}>
              {activeSign.symbol}&#xFE0E;
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-[#F0ECE1]">
                  {activeSign.name} • {activeSign.sanskritName} ({activeSign.sanskritScript})
                </h2>
                {getElementBadge(activeSign.element)}
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-[#2A2A2E] text-[#E5E1D8] font-medium">
                  {activeSign.modality} Modality
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-[#2A2A2E] text-[#C9A050] font-medium">
                  {activeSign.polarity}
                </span>
              </div>
              <p className="text-xs text-[#9E9A90] font-medium">
                {activeSign.glyph} • {activeSign.motto} • Ruled by{' '}
                <span className="text-[#C9A050] font-semibold">{activeSign.ruler} ({activeSign.sanskritRuler})</span>
              </p>
              <div className="text-[11px] text-[#C9A050] mt-1">
                Dates: <span className="font-semibold">{zodiacSystem === 'tropical' ? `${activeSign.tropicalDates} (Western Tropical)` : `${activeSign.siderealDates} (Vedic Sidereal)`}</span>
              </div>
            </div>
          </div>


        </div>

        {/* 4 Dimension Energy Meter */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              key: 'love',
              label: t('zodiac.love_rating'),
              value: (currentDynamicData?.loveRating || activeSign.loveRating) + (zodiacSystem === 'sidereal' ? 2 : 0),
              Icon: Heart,
              color: theme === 'dark' ? 'text-rose-400' : 'text-[#C9A050]',
              bg: theme === 'dark' ? 'bg-rose-500' : 'bg-[#C9A050]',
            },
            {
              key: 'career',
              label: t('zodiac.career_rating'),
              value: (currentDynamicData?.careerRating || activeSign.careerRating) + (zodiacSystem === 'sidereal' ? -1 : 0),
              Icon: Briefcase,
              color: theme === 'dark' ? 'text-sky-400' : 'text-[#C9A050]',
              bg: theme === 'dark' ? 'bg-sky-500' : 'bg-[#C9A050]',
            },
            {
              key: 'wealth',
              label: t('zodiac.wealth_rating'),
              value: (currentDynamicData?.wealthRating || activeSign.wealthRating) + (zodiacSystem === 'sidereal' ? 3 : 0),
              Icon: Coins,
              color: theme === 'dark' ? 'text-amber-400' : 'text-[#C9A050]',
              bg: theme === 'dark' ? 'bg-amber-500' : 'bg-[#C9A050]',
            },
            {
              key: 'vitality',
              label: t('zodiac.vitality_meter'),
              value: (currentDynamicData?.vitalityToday || activeSign.vitalityToday) + (zodiacSystem === 'sidereal' ? -3 : 0),
              Icon: Zap,
              color: theme === 'dark' ? 'text-emerald-400' : 'text-[#C9A050]',
              bg: theme === 'dark' ? 'bg-emerald-500' : 'bg-[#C9A050]',
            }
          ]
            .sort((a, b) => b.value - a.value)
            .map((metric) => (
              <div key={metric.key} className="bg-[#0D0D0F] p-4 rounded-xl border border-[#2A2A2E]">
                <div className="flex items-center justify-between text-xs text-[#9E9A90] mb-2">
                  <span className="flex items-center space-x-1.5">
                    <metric.Icon className={`w-3.5 h-3.5 ${metric.color}`} />
                    <span>{metric.label}</span>
                  </span>
                  <span className={`font-bold ${metric.color}`}>{metric.value}%</span>
                </div>
                <div className="w-full bg-[#1C1C22] h-2 rounded-full overflow-hidden">
                  <div
                    className={`${metric.bg} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </div>
            ))}
        </div>

        {/* Selected Timeframe Forecast Content */}
        <div className="bg-[#0D0D0F] p-6 rounded-xl border border-[#2A2A2E] space-y-4">
          <div className="flex items-center justify-between border-b border-[#2A2A2E]/60 pb-3">
            <h3 className="text-sm font-bold text-[#C9A050] flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>
                {activeSign.name} Horizon: {timeframe === 'today' ? "Today's Cosmic Pulse" : timeframe === 'week' ? 'Weekly Outlook' : timeframe === 'month' ? 'Monthly Transits' : '2026/2027 Long-Range Panorama'}
              </span>
            </h3>
            <span className="text-[11px] text-[#9E9A90]">
              Ephemeris Real-Time Calculation
            </span>
          </div>

          <div className="text-sm text-[#E5E1D8] leading-relaxed min-h-[60px]">
            {isFetchingForecast && !dynamicZodiacData[`${activeSign.id}-${timeframe}-${language}`] ? (
              <div className="animate-pulse flex space-x-2 items-center text-[#C9A050]">
                <Sparkles className="w-4 h-4 animate-spin-slow" />
                <span>Consulting AI Daivajna for personalized transits...</span>
              </div>
            ) : (
              <p>{getForecastText(activeSign)}</p>
            )}
          </div>

          <div className="pt-3 border-t border-[#2A2A2E]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#9E9A90]">
            <div className="flex items-center space-x-2">
              <span className="text-[#C9A050] font-semibold">Celestial Affirmation:</span>
              <span className="italic text-[#E5E1D8]">&ldquo;{currentDynamicData?.affirmation || t(activeSign.affirmation)}&rdquo;</span>
            </div>
            <div>
              <span className="text-[#C9A050] font-semibold">Resonant Chakra:</span> {currentDynamicData?.resonantChakra || activeSign.resonantChakra}
            </div>
          </div>
        </div>

        {/* Diaspora Concordance: Chinese Archetype, Nakshatras & Lucky Resonances */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Box 1: Chinese Lunar & Diaspora Correlation */}
          <div className="bg-[#0D0D0F] p-5 rounded-xl border border-[#2A2A2E] space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#C9A050]">
              <Globe className="w-4 h-4" />
              <span>Global Diaspora Archetype</span>
            </div>
            <p className="text-xs text-[#E5E1D8] leading-relaxed">
              <span className="font-semibold text-[#F0ECE1]">Chinese Lunar Zodiac Concordance:</span><br />
              {activeSign.chineseArchetype}
            </p>
            <div className="pt-2 border-t border-[#2A2A2E]/60 text-[11px] text-[#9E9A90]">
              Bridging East-West astrological archetypes for universal consciousness.
            </div>
          </div>

          {/* Box 2: Vedic Nakshatras & Sub-Padas */}
          <div className="bg-[#0D0D0F] p-5 rounded-xl border border-[#2A2A2E] space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#C9A050]">
              <Compass className="w-4 h-4" />
              <span>Vedic Nakshatra Constellations</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeSign.nakshatras.map((nak, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#1C1C22] text-[#E5E1D8] border border-[#2A2A2E]"
                >
                  ✦ {nak}
                </span>
              ))}
            </div>
            <div className="pt-2 border-t border-[#2A2A2E]/60 text-[11px] text-[#9E9A90]">
              Governs 2.25 lunar mansions (9 quarters/padas) in the sidereal band.
            </div>
          </div>

          {/* Box 3: Auspicious Attributes */}
          <div className="bg-[#0D0D0F] p-5 rounded-xl border border-[#2A2A2E] space-y-2.5 text-xs">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#C9A050]">
              <Sparkles className="w-4 h-4" />
              <span>Auspicious Resonances</span>
            </div>
            <div className="flex justify-between text-[#9E9A90]">
              <span>{t('zodiac.lucky_gem')}:</span>
              <span className="text-[#F0ECE1] font-semibold">{currentDynamicData?.luckyGemstone || t(activeSign.luckyGemstone)}</span>
            </div>
            <div className="flex justify-between text-[#9E9A90]">
              <span>{t('zodiac.lucky_color')}:</span>
              <span className="text-[#F0ECE1] font-semibold">{currentDynamicData?.luckyColor || t(activeSign.luckyColor)}</span>
            </div>
            <div className="flex justify-between text-[#9E9A90]">
              <span>{t('zodiac.lucky_day')}:</span>
              <span className="text-[#F0ECE1] font-semibold">{currentDynamicData?.luckyDay || t(activeSign.luckyDay)}</span>
            </div>
            <div className="flex justify-between text-[#9E9A90]">
              <span>{t('zodiac.power_numbers')}:</span>
              <span className="text-[#F0ECE1] font-semibold">
                {currentDynamicData?.powerNumbers ? currentDynamicData.powerNumbers.join(', ') : activeSign.powerNumbers.join(', ')}
              </span>
            </div>
          </div>
        </div>

        {/* Compatibility Matrix Interactive Tool */}
        <div className="bg-[#0D0D0F] p-6 rounded-xl border border-[#2A2A2E] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#2A2A2E]">
            <div>
              <h3 className="text-base font-bold text-[#F0ECE1] flex items-center space-x-2">
                <Heart className="w-4 h-4 text-[#C9A050]" />
                <span>{t('zodiac.compat_title')}</span>
              </h3>
              <p className="text-xs text-[#9E9A90] mt-0.5">
                {t('zodiac.compat_subtitle')}
              </p>
            </div>

            <div className="flex items-start space-x-3 text-xs">
              <div className="min-w-[170px]">
                <CustomZodiacSelect
                  value={compatSignA}
                  onChange={setCompatSignA}
                  theme={theme}
                  label={t('zodiac.sign_a')}
                />
              </div>

              <div className="min-w-[170px]">
                <CustomZodiacSelect
                  value={compatSignB}
                  onChange={setCompatSignB}
                  theme={theme}
                  label={t('zodiac.sign_b')}
                />
              </div>
              
              <div className="flex flex-col">
                <label className="text-[11px] block mb-1 opacity-0 select-none pointer-events-none">Analyze</label>
                <button
                  onClick={() => {}}
                  className={`px-6 rounded-lg font-bold text-sm transition shadow-sm flex items-center justify-center h-[40px] ${theme === 'dark' ? 'bg-[#C9A050] text-[#141418] hover:bg-[#D4AF60]' : 'bg-[#C9A050] text-white hover:bg-[#B88E40]'}`}
                >
                  <span>Analyze</span>
                </button>
              </div>
            </div>
          </div>

          {/* Compatibility Breakdown Card */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
            {/* Score circle */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center p-6 bg-[#141418] rounded-xl border border-[#2A2A2E] text-center">
              <div className="w-20 h-20 rounded-full border-4 border-[#C9A050] flex flex-col items-center justify-center text-[#F0ECE1] shadow-lg shadow-[#C9A050]/20">
                <span className="text-xl font-bold">{compatResult.overallScore}%</span>
                <span className="text-[9px] uppercase tracking-wider text-[#9E9A90]">Harmony</span>
              </div>
              <div className="mt-3 text-xs font-bold text-[#C9A050]">
                {compatResult.signA.name} + {compatResult.signB.name}
              </div>
              <div className="text-[10px] text-[#9E9A90] mt-0.5">
                {compatResult.signA.element} & {compatResult.signB.element} Elements
              </div>
            </div>

            {/* Analysis details */}
            <div className="lg:col-span-3 space-y-3 text-xs text-[#E5E1D8]">
              <div className="bg-[#141418] p-3 rounded-lg border border-[#2A2A2E]/80">
                <span className="font-semibold text-[#C9A050] block mb-0.5">{t('zodiac.element_synergy')}:</span>
                <span className="text-[#9E9A90]">{compatResult.elementSynergy}</span>
              </div>

              <div className="bg-[#141418] p-3 rounded-lg border border-[#2A2A2E]/80">
                <span className={`font-semibold block mb-0.5 ${theme === 'dark' ? 'text-rose-400' : 'text-[#C9A050]'}`}>Romantic & Soul Synergy:</span>
                <span className="text-[#9E9A90]">{compatResult.romanceAnalysis}</span>
              </div>

              <div className="bg-[#141418] p-3 rounded-lg border border-[#2A2A2E]/80">
                <span className={`font-semibold block mb-0.5 ${theme === 'dark' ? 'text-emerald-400' : 'text-[#C9A050]'}`}>Evolution & Remedial Guidance:</span>
                <span className="text-[#9E9A90]">{compatResult.remedialAdvice}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
