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
    <footer className="mt-16 bg-[#08080A] border-t border-[#2A2A2E] text-[#9E9A90] text-xs py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#2A2A2E]">
          <div className="flex items-center space-x-3.5 text-center md:text-left">
            <AncientTraditionLogo size="md" isLight={theme === 'light'} />
            <div>
              <div className="text-[#F0ECE1] font-bold text-sm tracking-wide">
                JyotishVeda • Global Astrological Platform
              </div>
              <div className="text-[11px] text-[#9E9A90]">
                {t('brand.tagline')}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-5 text-xs text-[#9E9A90]">
            {setActiveTab && (
              <>
                <button onClick={() => setActiveTab('daily')} className="hover:text-[#C9A050] transition cursor-pointer">
                  {t('tab.daily')}
                </button>
                <button onClick={() => setActiveTab('horoscope')} className="hover:text-[#C9A050] transition cursor-pointer">
                  {t('tab.horoscope')}
                </button>
                <button onClick={() => setActiveTab('numerology')} className="hover:text-[#C9A050] transition cursor-pointer">
                  {t('tab.numerology')}
                </button>
                <button onClick={() => setActiveTab('counsellor')} className="hover:text-[#C9A050] transition cursor-pointer">
                  {t('tab.counsellor')}
                </button>
                <button onClick={() => setActiveTab('roadmap')} className="hover:text-[#C9A050] transition cursor-pointer">
                  {t('tab.roadmap')}
                </button>
              </>
            )}
            <button onClick={onOpenDisclaimer} className="text-[#C9A050] hover:text-[#D4AF37] transition cursor-pointer flex items-center space-x-1.5 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('header.disclaimer')}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-[#9E9A90] text-center md:text-left">
          <p className="italic text-[#C9A050]/90">
            ✦ &quot;The cosmos is within us. We are made of star-stuff. We are a way for the cosmos to know itself.&quot; — Timeless Celestial Wisdom
          </p>
          <p>© {new Date().getFullYear()} JyotishVeda. Grounded in Ancient Ephemeris & Precision Planetary Calculations.</p>
        </div>
      </div>
    </footer>
  );
};
