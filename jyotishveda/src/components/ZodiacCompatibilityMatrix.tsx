import React, { useState, useRef } from 'react';
import { Heart, ChevronDown } from 'lucide-react';
import { getTranslation } from '../services/translations';
import { ZODIAC_SIGNS, calculateZodiacCompatibility, ZodiacCompatibilityResult } from '../services/zodiacData';

const CustomZodiacSelect = ({ value, onChange, theme, label }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedSign = ZODIAC_SIGNS.find(s => s.id === value) || ZODIAC_SIGNS[0];
  const dropdownRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {label && <label className={`text-[11px] block mb-1 ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-500'}`}>{label}</label>}
      <button
        onClick={() => setIsOpen(!isOpen)}
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
                setIsOpen(false);
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

interface ZodiacCompatibilityMatrixProps {
  language?: string;
  theme?: 'light' | 'dark';
  zodiacSystem?: 'tropical' | 'sidereal';
}

export const ZodiacCompatibilityMatrix: React.FC<ZodiacCompatibilityMatrixProps> = ({
  language = 'en',
  theme = 'dark',
  zodiacSystem = 'tropical'
}) => {
  const t = (key: string) => getTranslation(key, language);
  const isDark = theme === 'dark';

  const [compatSignA, setCompatSignA] = useState('aries');
  const [compatSignB, setCompatSignB] = useState('gemini');
  const [isCompatLoading, setIsCompatLoading] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const compatResultRef = useRef<HTMLDivElement>(null);

  const compatResult: ZodiacCompatibilityResult = calculateZodiacCompatibility(compatSignA, compatSignB, zodiacSystem);

  return (
    <div className={`mt-6 p-6 rounded-2xl border shadow-lg space-y-6 transition-all ${isDark ? 'bg-[#141418]/90 border-[#2A2A2E] shadow-black/40' : 'bg-[#FFFFFF]/90 border-[#E5E1D8] shadow-amber-900/5'}`}>
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b ${isDark ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
        <div>
          <h3 className={`text-base font-bold flex items-center space-x-2 ${isDark ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
            <Heart className="w-4 h-4 text-[#C9A050]" />
            <span>{t('zodiac.compat_title')}</span>
          </h3>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
            {t('zodiac.compat_subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap lg:flex-nowrap items-start space-x-2 sm:space-x-3 text-xs mt-3 sm:mt-0">
          <div className="min-w-[150px] sm:min-w-[170px] mb-2 sm:mb-0">
            <CustomZodiacSelect
              value={compatSignA}
              onChange={(val: string) => {
                setCompatSignA(val);
                setHasAnalyzed(false);
              }}
              theme={theme}
              label={t('zodiac.sign_a')}
            />
          </div>

          <div className="min-w-[150px] sm:min-w-[170px] mb-2 sm:mb-0">
            <CustomZodiacSelect
              value={compatSignB}
              onChange={(val: string) => {
                setCompatSignB(val);
                setHasAnalyzed(false);
              }}
              theme={theme}
              label={t('zodiac.sign_b')}
            />
          </div>
          
          <div className="flex flex-col">
            <label className="text-[11px] block mb-1 opacity-0 select-none pointer-events-none">Analyze</label>
            <button
              onClick={() => {
                setIsCompatLoading(true);
                setHasAnalyzed(false);
                setTimeout(() => {
                  setIsCompatLoading(false);
                  setHasAnalyzed(true);
                  setTimeout(() => {
                    if (compatResultRef.current) {
                      const elementPosition = compatResultRef.current.getBoundingClientRect().top;
                      const offsetPosition = elementPosition + window.pageYOffset - 90;
                      window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                      });
                    }
                  }, 100);
                }, 1200);
              }}
              className={`px-4 sm:px-6 rounded-lg font-bold text-sm transition shadow-sm flex items-center justify-center h-[34px] sm:h-[40px] ${isDark ? 'bg-[#C9A050] text-[#141418] hover:bg-[#D4AF60]' : 'bg-[#C9A050] text-white hover:bg-[#B88E40]'}`}
            >
              <span>Analyze</span>
            </button>
          </div>
        </div>
      </div>

      {/* Compatibility Breakdown Card */}
      {isCompatLoading && (
        <div className={`flex flex-col items-center justify-center p-8 sm:p-12 rounded-xl border text-center animate-pulse w-full ${isDark ? 'bg-[#1C1C22] border-[#2A2A2E]' : 'bg-[#FAF8F2] border-[#E5E1D8]'}`}>
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-[#C9A050] mb-4"></div>
          <p className="text-xs sm:text-sm font-semibold tracking-wider text-[#C9A050] animate-pulse font-serif">
            {language === 'bn' ? 'গ্রহের সংযোগ এবং নক্ষত্রের সামঞ্জস্য গণনা করা হচ্ছে...' : 'Calculating Cosmic Harmony & Planetary Alignments...'}
          </p>
        </div>
      )}

      {hasAnalyzed && !isCompatLoading && (
        <div ref={compatResultRef} className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Score circle */}
        <div className={`flex flex-col items-center justify-center p-6 rounded-xl border text-center ${isDark ? 'bg-[#1C1C22] border-[#2A2A2E]' : 'bg-[#FFFFFF] border-[#E5E1D8]'}`}>
          <div className="w-20 h-20 rounded-full border-4 border-[#C9A050] flex flex-col items-center justify-center shadow-lg shadow-[#C9A050]/20">
            <span className={`text-xl font-bold ${isDark ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>{compatResult.overallScore}%</span>
            <span className={`text-[9px] uppercase tracking-wider ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>Harmony</span>
          </div>
          <div className="mt-3 text-xs font-bold text-[#C9A050]">
            {compatResult.signA.name} + {compatResult.signB.name}
          </div>
          <div className={`text-[10px] mt-0.5 ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
            {compatResult.signA.element} & {compatResult.signB.element} Elements
          </div>
        </div>

        {/* Analysis details */}
        <div className={`space-y-3 text-xs ${isDark ? 'text-[#E5E1D8]' : 'text-gray-700'}`}>
          <div className={`p-3 rounded-lg border ${isDark ? 'bg-[#1C1C22] border-[#2A2A2E]/80' : 'bg-[#FFFFFF] border-[#E5E1D8]'}`}>
            <span className="font-semibold text-[#C9A050] block mb-0.5">{t('zodiac.element_synergy')}:</span>
            <span className={`${isDark ? 'text-[#9E9A90]' : 'text-gray-600'}`}>{compatResult.elementSynergy}</span>
          </div>

          <div className={`p-3 rounded-lg border ${isDark ? 'bg-[#1C1C22] border-[#2A2A2E]/80' : 'bg-[#FFFFFF] border-[#E5E1D8]'}`}>
            <span className={`font-semibold block mb-0.5 ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>Romantic & Soul Synergy:</span>
            <span className={`${isDark ? 'text-[#9E9A90]' : 'text-gray-600'}`}>{compatResult.romanceAnalysis}</span>
          </div>

          <div className={`p-3 rounded-lg border ${isDark ? 'bg-[#1C1C22] border-[#2A2A2E]/80' : 'bg-[#FFFFFF] border-[#E5E1D8]'}`}>
            <span className={`font-semibold block mb-0.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Evolution & Remedial Guidance:</span>
            <span className={`${isDark ? 'text-[#9E9A90]' : 'text-gray-600'}`}>{compatResult.remedialAdvice}</span>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
