import React from 'react';
import { AncientTraditionLogo } from './AncientTraditionLogo';
import { getTranslation } from '../services/translations';

interface FooterProps {
  onOpenDisclaimer?: () => void;
  setActiveTab?: (tab: string) => void;
  theme?: 'dark' | 'light';
  language?: string;
}

export const Footer: React.FC<FooterProps> = ({
  theme = 'dark',
  language = 'en',
}) => {
  const t = (key: string) => getTranslation(key, language);

  return (
    <footer
      className={`mt-4 sm:mt-6 text-xs sm:text-sm py-5 sm:py-6 transition-all relative z-20 ${
        theme === 'light'
          ? 'bg-[#EAE3D4]/95 backdrop-blur-md text-[#1A1816] shadow-sm'
          : 'bg-[#060608] text-[#9E9A90]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4 text-center md:text-left">
            <AncientTraditionLogo size="md" isLight={theme === 'light'} />
            <div>
              <div className={`font-serif font-black text-lg sm:text-xl tracking-wide flex items-center gap-2 justify-center md:justify-start ${
                theme === 'light' ? 'text-[#0D0D0F]' : 'text-[#FFFFFF]'
              }`}>
                <span>JYOTISH<span className={theme === 'light' ? 'text-[#8C6218]' : 'text-[#C9A050]'}>VEDA</span></span>
                <span className={`text-[11px] px-3 py-0.5 rounded-full font-sans font-extrabold border ${
                  theme === 'light'
                    ? 'bg-[#FFFFFF] text-[#5C3E08] border-[#8C6218] shadow-sm'
                    : 'bg-[#C9A050]/20 text-[#E8C470] border-[#C9A050]/40'
                }`}>
                  Global Platform
                </span>
              </div>
              <div className={`text-xs sm:text-sm mt-1 font-bold ${
                theme === 'light' ? 'text-[#3D2C0E]' : 'text-[#C9A050]'
              }`}>
                {t('brand.tagline')}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-center md:text-left pt-3 border-t border-black/5 dark:border-white/5">
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
