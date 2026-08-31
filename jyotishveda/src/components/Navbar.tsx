import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  Sparkles,
  Layers,
  Hash,
  MessageSquareText,
  Milestone,
  CreditCard,
  ShieldCheck,
  Network,
  User,
  PlusCircle,
  Clock,
  Sun,
  Moon,
  Globe,
  ChevronDown,
  Check,
  HeartHandshake,
  LogOut,
  Calendar,
} from 'lucide-react';
import { UserProfile, HoroscopeTradition } from '../types';
import { AncientTraditionLogo } from './AncientTraditionLogo';
import { SUPPORTED_LANGUAGES, getTranslation } from '../services/translations';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentProfile: UserProfile;
  profiles: UserProfile[];
  onSelectProfile: (profile: UserProfile) => void;
  onOpenNewProfile: () => void;
  onOpenDisclaimer: () => void;
  tradition: HoroscopeTradition;
  setTradition: (tradition: HoroscopeTradition) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  language: string;
  setLanguage: (lang: string) => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentProfile,
  profiles,
  onSelectProfile,
  onOpenNewProfile,
  onOpenDisclaimer,
  tradition,
  setTradition,
  theme,
  toggleTheme,
  language,
  setLanguage,
  onLogout,
}) => {
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const t = (key: string) => getTranslation(key, language);

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabs = [
    { id: 'daily', label: t('tab.daily'), icon: Sun },
    { id: 'zodiac', label: t('tab.zodiac'), icon: Globe },
    { id: 'horoscope', label: t('tab.horoscope'), icon: Compass },
    { id: 'matchmaking', label: t('tab.matchmaking'), icon: HeartHandshake },
    { id: 'numerology', label: t('tab.numerology'), icon: Hash },
    { id: 'roadmap', label: t('tab.roadmap'), icon: Milestone },
    { id: 'consultations', label: t('tab.consultations'), icon: CreditCard },
    { id: 'admin', label: t('tab.admin'), icon: Network },
  ];

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-xl border-b shadow-2xl transition-colors ${theme === 'dark' ? 'bg-[#0D0D0F]/80 border-[#2A2A2E]/80 text-[#E5E1D8]' : 'bg-[#F9F7F1]/85 border-[#E5E1D8] text-[#0D0D0F]'}`}>
      {/* Top Auspicious & Astronomical Banner */}
      <div className={`px-4 py-1.5 text-xs border-b flex items-center justify-between text-[#C9A050]/90 overflow-x-auto ${theme === 'dark' ? 'bg-[#08080A] border-[#2A2A2E]/60' : 'bg-[#F0ECE1] border-[#E5E1D8]'}`}>
        <div className="flex items-center space-x-2 shrink-0">
          <span className="font-semibold tracking-wide text-[#C9A050] text-[12px]">
            {t('header.ephemeris')}
          </span>
          <span className="text-[#2A2A2E]">|</span>
          <span className="hidden sm:inline text-[#9E9A90] text-[11px] uppercase tracking-wider">
            {t('header.traditions')}
          </span>
        </div>
        <div className="flex items-center space-x-4 shrink-0 text-[11px]">
          <div className="flex items-center space-x-1.5 text-[#E5E1D8]">
            <Clock className="w-3.5 h-3.5 text-[#C9A050]" />
            <span className="text-[#9E9A90]">{t('header.active_dasha')}: <span className="font-semibold text-[#C9A050]">Jupiter-Venus</span></span>
          </div>
          <button
            onClick={onOpenDisclaimer}
            className="text-[#C9A050] hover:text-[#E8D5B5] flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('header.disclaimer')}</span>
          </button>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => setActiveTab('daily')}>
            <AncientTraditionLogo size="md" isLight={theme === 'light'} />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-wider text-[#F0ECE1]">
                  JYOTISH<span className="text-[#C9A050]">VEDA</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase bg-[#C9A050]/15 text-[#C9A050] border border-[#C9A050]/30">
                  {t('brand.subtitle')}
                </span>
              </div>
              <p className="text-[11px] text-[#9E9A90] hidden sm:block">
                {t('brand.tagline')}
              </p>
            </div>
          </div>

          {/* Controls: Language Selector, Theme Toggle & Profile Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Multi-Language Selector Dropdown */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setIsLangMenuOpen((prev) => !prev)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-[#141418] border border-[#2A2A2E] text-xs text-[#E5E1D8] hover:border-[#C9A050]/50 hover:bg-[#1A1A1E] transition cursor-pointer shadow-sm"
                title={t('header.switch_lang')}
              >
                <span className="text-sm">{currentLangObj.flag}</span>
                <span className="font-semibold hidden sm:inline">{currentLangObj.nativeName}</span>
                <span className="font-semibold sm:hidden uppercase text-[11px]">{currentLangObj.code}</span>
                <ChevronDown className="w-3 h-3 text-[#9E9A90]" />
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 max-h-80 overflow-y-auto bg-[#141418] border border-[#2A2A2E] rounded-xl shadow-2xl z-50 p-1.5 divide-y divide-[#2A2A2E]/50 animate-fade-in">
                  <div className="px-2.5 py-1.5 text-[11px] font-bold text-[#C9A050] uppercase tracking-wider">
                    {t('header.switch_lang')} ({SUPPORTED_LANGUAGES.length})
                  </div>
                  <div className="pt-1 space-y-0.5">
                    {SUPPORTED_LANGUAGES.map((lang) => {
                      const isSelected = lang.code === language;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setIsLangMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition cursor-pointer text-left ${
                            isSelected
                              ? 'bg-[#C9A050]/20 text-[#C9A050] font-bold'
                              : 'text-[#E5E1D8] hover:bg-[#1C1C22] hover:text-[#F0ECE1]'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <span className="text-base">{lang.flag}</span>
                            <div>
                              <div className="font-medium text-xs text-[#F0ECE1]">{lang.nativeName}</div>
                              <div className="text-[10px] text-[#9E9A90]">{lang.name} • {lang.region}</div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#C9A050]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? t('header.theme_light') : t('header.theme_dark')}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#141418] border border-[#2A2A2E] text-[#C9A050] hover:border-[#C9A050]/50 hover:bg-[#1A1A1E] transition-all cursor-pointer shadow-sm shrink-0"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#C9A050] transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-[#C9A050] transition-transform hover:-rotate-12" />
              )}
            </button>

            {/* Logout */}
            {onLogout && (
              <button
                onClick={onLogout}
                title="Log out"
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#141418] border border-[#2A2A2E] text-[#9E9A90] hover:border-[#C9A050]/50 hover:text-[#C9A050] transition-all cursor-pointer shadow-sm shrink-0"
                aria-label="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}

            {/* Active Profile Dropdown */}
            <div className="relative flex items-center bg-[#141418] border border-[#2A2A2E] rounded-lg p-1.5 text-xs shadow-inner" ref={profileMenuRef}>
              <User className="w-3.5 h-3.5 text-[#C9A050] ml-1 mr-1.5" />
              <button
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                className="bg-transparent text-[#E5E1D8] focus:outline-none pr-5 cursor-pointer text-xs max-w-[120px] sm:max-w-none truncate flex items-center"
              >
                <span className="truncate">{currentProfile.fullName} ({currentProfile.horoscopeSystem === 'western' ? 'Western' : 'Vedic'})</span>
                <ChevronDown className="w-3.5 h-3.5 ml-1 absolute right-6 text-[#9E9A90]" />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-[#141418] border border-[#2A2A2E] rounded-xl shadow-xl shadow-[#0D0D0F]/50 overflow-hidden z-50">
                  <div className="py-1">
                    {profiles.map((p) => {
                      const isSelected = p.id === currentProfile.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            onSelectProfile(p);
                            setIsProfileMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs transition cursor-pointer text-left ${
                            isSelected
                              ? 'bg-[#C9A050]/20 text-[#C9A050] font-bold'
                              : 'text-[#E5E1D8] hover:bg-[#1C1C22] hover:text-[#F0ECE1]'
                          }`}
                        >
                          <span className="truncate">{p.fullName} ({p.horoscopeSystem === 'western' ? 'Western' : 'Vedic'})</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#C9A050]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                onClick={onOpenNewProfile}
                title={t('header.add_profile')}
                className="ml-1 p-1 rounded bg-[#C9A050]/15 text-[#C9A050] hover:bg-[#C9A050]/25 transition-colors cursor-pointer shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Action: Ask AI */}
            <button
              onClick={() => setActiveTab('counsellor')}
              className={`hidden lg:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs shadow-md transition-all duration-300 cursor-pointer shrink-0 hover:-translate-y-0.5 hover:scale-105 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-[#C9A050] to-[#A07828] hover:from-[#D4AF37] hover:to-[#B38730] text-[#0D0D0F] shadow-[#C9A050]/20 hover:shadow-[#C9A050]/40'
                  : 'bg-[#FFFFFF] border border-[#C9A050]/50 text-[#C9A050] hover:bg-[#C9A050]/10 shadow-[#C9A050]/10 hover:shadow-[#C9A050]/20'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('header.ask_ai')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className={`border-t backdrop-blur-lg ${theme === 'dark' ? 'border-[#2A2A2E]/60 bg-[#08080A]/60' : 'border-[#E5E1D8] bg-[#F9F7F1]/70'}`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between py-2 w-full" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center space-x-1.5 px-2 py-1.5 rounded-md text-[11px] lg:text-xs font-semibold whitespace-nowrap transition-all duration-300 ease-out cursor-pointer hover:-translate-y-0.5 hover:scale-[1.02] ${
                    isActive
                      ? 'bg-[#C9A050]/15 text-[#C9A050] border border-[#C9A050]/40 shadow-sm'
                      : `${theme === 'dark' ? 'text-[#9E9A90] hover:text-[#E5E1D8] hover:bg-[#1C1C22]' : 'text-[#6C6960] hover:text-[#0D0D0F] hover:bg-[#E5E1D8]'} hover:shadow-md hover:shadow-[#C9A050]/10`
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#C9A050]' : 'text-[#9E9A90]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

