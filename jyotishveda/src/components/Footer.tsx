import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { AncientTraditionLogo } from './AncientTraditionLogo';
import { getTranslation } from '../services/translations';

interface FooterProps {
  onOpenDisclaimer: () => void;
  setActiveTab?: (tab: string) => void;
  theme?: 'dark' | 'light';
  language?: string;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenDisclaimer,
  setActiveTab,
  theme = 'dark',
  language = 'en',
}) => {
  const t = (key: string) => getTranslation(key, language);

  return (
    <footer
      className={`mt-16 text-xs py-12 transition-all relative z-20 ${
        theme === 'light'
          ? 'bg-[#EAE3D4]/95 backdrop-blur-md border-t border-[#D5CCBB] text-[#1A1816] shadow-sm'
          : 'bg-[#060608] border-t border-[#2A2A2E] text-[#9E9A90]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className={`flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b ${
          theme === 'light' ? 'border-[#D5CCBB]' : 'border-[#2A2A2E]'
        }`}>
          <div className="flex items-center space-x-3.5 text-center md:text-left">
            <AncientTraditionLogo size="md" isLight={theme === 'light'} />
            <div>
              <div className={`font-serif font-black text-base tracking-wide flex items-center gap-2 justify-center md:justify-start ${
                theme === 'light' ? 'text-[#0D0D0F]' : 'text-[#FFFFFF]'
              }`}>
                <span>JYOTISH<span className={theme === 'light' ? 'text-[#8C6218]' : 'text-[#C9A050]'}>VEDA</span></span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-sans font-extrabold border ${
                  theme === 'light'
                    ? 'bg-[#FFFFFF] text-[#5C3E08] border-[#8C6218] shadow-sm'
                    : 'bg-[#C9A050]/20 text-[#E8C470] border-[#C9A050]/40'
                }`}>
                  Global Platform
                </span>
              </div>
              <div className={`text-xs mt-0.5 font-bold ${
                theme === 'light' ? 'text-[#3D2C0E]' : 'text-[#C9A050]'
              }`}>
                {t('brand.tagline')}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-5 text-xs">
            {setActiveTab && (
              <>
                <button
                  onClick={() => setActiveTab('daily')}
                  className={`transition cursor-pointer font-black ${
                    theme === 'light' ? 'text-[#0D0D0F] hover:text-[#8C6218]' : 'text-[#DDD6C8] hover:text-[#C9A050]'
                  }`}
                >
                  {t('tab.daily')}
                </button>
                <button
                  onClick={() => setActiveTab('horoscope')}
                  className={`transition cursor-pointer font-black ${
                    theme === 'light' ? 'text-[#0D0D0F] hover:text-[#8C6218]' : 'text-[#DDD6C8] hover:text-[#C9A050]'
                  }`}
                >
                  {t('tab.horoscope')}
                </button>
                <button
                  onClick={() => setActiveTab('numerology')}
                  className={`transition cursor-pointer font-black ${
                    theme === 'light' ? 'text-[#0D0D0F] hover:text-[#8C6218]' : 'text-[#DDD6C8] hover:text-[#C9A050]'
                  }`}
                >
                  {t('tab.numerology')}
                </button>
                <button
                  onClick={() => setActiveTab('counsellor')}
                  className={`transition cursor-pointer font-black ${
                    theme === 'light' ? 'text-[#0D0D0F] hover:text-[#8C6218]' : 'text-[#DDD6C8] hover:text-[#C9A050]'
                  }`}
                >
                  {t('tab.counsellor')}
                </button>
                <button
                  onClick={() => setActiveTab('roadmap')}
                  className={`transition cursor-pointer font-black ${
                    theme === 'light' ? 'text-[#0D0D0F] hover:text-[#8C6218]' : 'text-[#DDD6C8] hover:text-[#C9A050]'
                  }`}
                >
                  {t('tab.roadmap')}
                </button>
              </>
            )}
            <button
              onClick={onOpenDisclaimer}
              className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center space-x-1.5 font-black shadow-md ${
                theme === 'light'
                  ? 'bg-[#FFFFFF] text-[#0D0D0F] hover:bg-[#F2ECE0] border-2 border-[#8C6218]'
                  : 'bg-[#C9A050]/20 text-[#E8C470] hover:bg-[#C9A050]/30 border border-[#C9A050]/50'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${theme === 'light' ? 'text-[#8C6218]' : 'text-[#C9A050]'}`} />
              <span>{t('header.disclaimer')}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-center md:text-left">
          <p className={`italic font-bold ${theme === 'light' ? 'text-[#3D2C0E]' : 'text-[#E8C470]'}`}>
            ✦ &quot;The cosmos is within us. We are made of star-stuff. We are a way for the cosmos to know itself.&quot; — Timeless Celestial Wisdom
          </p>
          <p className={`font-bold ${theme === 'light' ? 'text-[#1A1816]' : 'text-[#9E9789]'}`}>
            © {new Date().getFullYear()} JyotishVeda. Grounded in Ancient Ephemeris &amp; Precision Planetary Calculations.
          </p>
        </div>
      </div>
    </footer>
  );
};
