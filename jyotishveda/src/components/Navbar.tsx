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
  FileText,
  Users,
  Terminal,
  Wallet,
  Menu,
  X,
  Shield,
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
  isAdmin?: boolean;
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
  isAdmin = false,
}) => {
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

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

  // Close mobile drawer on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileDrawerOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // User & Admin tabs (Panjika is excluded for logged-in users)
  const tabs = isAdmin
    ? [
        { id: 'admin_dashboard', label: 'Dashboard', icon: Network },
        { id: 'admin_users', label: 'Users', icon: Users },
        { id: 'admin_revenue', label: 'Revenue', icon: Wallet },
        { id: 'admin_logs', label: 'Logs', icon: Terminal },
        { id: 'blogs', label: 'Blogs', icon: FileText },
        { id: 'admin', label: t('tab.admin'), icon: Network },
      ]
    : [
        { id: 'daily', label: t('tab.daily'), icon: Sun },
        { id: 'horoscope', label: t('tab.horoscope'), icon: Compass },
        { id: 'matchmaking', label: t('tab.matchmaking'), icon: HeartHandshake },
        { id: 'numerology', label: t('tab.numerology'), icon: Hash },
        { id: 'roadmap', label: t('tab.roadmap'), icon: Milestone },
        { id: 'consultations', label: t('tab.consultations'), icon: CreditCard },
      ];

  // Mobile Bottom Bar Quick Tabs (Panjika excluded)
  const mobileQuickTabs = isAdmin
    ? [
        { id: 'admin_dashboard', label: 'Dashboard', icon: Network },
        { id: 'admin_users', label: 'Users', icon: Users },
        { id: 'admin_revenue', label: 'Revenue', icon: Wallet },
        { id: 'blogs', label: 'Blogs', icon: FileText },
      ]
    : [
        { id: 'daily', label: 'Daily', icon: Sun },
        { id: 'horoscope', label: 'Kundli', icon: Compass },
        { id: 'matchmaking', label: 'Match', icon: HeartHandshake },
        { id: 'counsellor', label: 'AI Daivajna', icon: Sparkles },
      ];

  return (
    <>
      {/* Top Primary Header Bar */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-xl transition-colors ${
          theme === 'dark' ? 'bg-[#0D0D0F]/90 text-[#E5E1D8]' : 'bg-[#F9F7F1]/95 text-[#0D0D0F]'
        }`}
      >
        {/* Top Auspicious & Astronomical Banner */}
        <div
          className={`px-3 sm:px-4 py-1 text-xs border-b flex items-center justify-between text-[#C9A050]/90 overflow-x-auto no-scrollbar ${
            theme === 'dark' ? 'bg-[#08080A] border-[#2A2A2E]/60' : 'bg-[#F0ECE1] border-[#E5E1D8]'
          }`}
        >
          <div className="flex items-center space-x-2 shrink-0">
            <span className="font-semibold tracking-wide text-[#C9A050] text-[11px] sm:text-[12px]">
              {t('header.ephemeris')}
            </span>
            <span className="text-[#2A2A2E] hidden xs:inline">|</span>
            <span className="hidden sm:inline text-[#9E9A90] text-[11px] uppercase tracking-wider">
              {t('header.traditions')}
            </span>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4 shrink-0 text-[11px]">
            <div className="flex items-center space-x-1.5 text-[#E5E1D8]">
              <Clock className="w-3.5 h-3.5 text-[#C9A050]" />
              <span className="text-[#9E9A90] truncate max-w-[150px] sm:max-w-none">
                {t('header.active_dasha')}: <span className="font-semibold text-[#C9A050]">Jupiter-Venus</span>
              </span>
            </div>
            <button
              onClick={onOpenDisclaimer}
              className="text-[#C9A050] hover:text-[#E8D5B5] flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{t('header.disclaimer')}</span>
            </button>
          </div>
        </div>

        {/* Main Header Row */}
        <div className="w-full px-3 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo & Brand */}
            <div
              className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer select-none"
              onClick={() => setActiveTab(isAdmin ? 'admin_dashboard' : 'daily')}
            >
              <AncientTraditionLogo size="sm" isLight={theme === 'light'} />
              <div>
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <span className="text-lg sm:text-xl font-bold tracking-wider text-[#F0ECE1]">
                    JYOTISH<span className="text-[#C9A050]">VEDA</span>
                  </span>
                  {isAdmin ? (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40">
                      ADMIN CONSOLE
                    </span>
                  ) : (
                    <span className="hidden xs:inline-block px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-bold tracking-widest uppercase bg-[#C9A050]/15 text-[#C9A050] border border-[#C9A050]/30">
                      {t('brand.subtitle')}
                    </span>
                  )}
                </div>
                <p className="text-[10px] sm:text-[11px] text-[#9E9A90] hidden md:block">
                  {t('brand.tagline')}
                </p>
              </div>
            </div>

            {/* Controls: Language Selector, Theme Toggle, Profile Switcher & Mobile Menu Button */}
            <div className="flex items-center space-x-1.5 sm:space-x-2.5">
              {/* Multi-Language Selector Dropdown */}
              <div className="relative" ref={langMenuRef}>
                <button
                  onClick={() => setIsLangMenuOpen((prev) => !prev)}
                  className="flex items-center space-x-1 px-2 py-1.5 sm:px-2.5 rounded-lg bg-[#141418] border border-[#2A2A2E] text-xs text-[#E5E1D8] hover:border-[#C9A050]/50 hover:bg-[#1A1A1E] transition cursor-pointer shadow-sm"
                  title={t('header.switch_lang')}
                  aria-label="Language Selector"
                >
                  <span className="text-sm">{currentLangObj.flag}</span>
                  <span className="font-semibold hidden lg:inline">{currentLangObj.nativeName}</span>
                  <span className="font-semibold lg:hidden uppercase text-[10px] sm:text-[11px]">{currentLangObj.code}</span>
                  <ChevronDown className="w-3 h-3 text-[#9E9A90]" />
                </button>

                {isLangMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 sm:w-64 max-h-80 overflow-y-auto bg-[#141418] border border-[#2A2A2E] rounded-xl shadow-2xl z-50 p-1.5 divide-y divide-[#2A2A2E]/50">
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

              {/* Active Profile Dropdown */}
              <div
                className="relative flex items-center bg-[#141418] border border-[#2A2A2E] rounded-lg p-1 sm:p-1.5 text-xs shadow-inner max-w-[130px] sm:max-w-[200px]"
                ref={profileMenuRef}
              >
                <User className="w-3.5 h-3.5 text-[#C9A050] ml-1 mr-1 shrink-0" />
                <button
                  onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                  className="bg-transparent text-[#E5E1D8] focus:outline-none pr-4 sm:pr-5 cursor-pointer text-xs truncate flex items-center flex-1 text-left"
                >
                  <span className="truncate">{currentProfile.fullName}</span>
                  <ChevronDown className="w-3 h-3 ml-0.5 absolute right-6 text-[#9E9A90]" />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-52 bg-[#141418] border border-[#2A2A2E] rounded-xl shadow-xl shadow-[#0D0D0F]/50 overflow-hidden z-50">
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
                            <span className="truncate">
                              {p.fullName} ({p.horoscopeSystem === 'western' ? 'Western' : 'Vedic'})
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#C9A050] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  onClick={onOpenNewProfile}
                  title={t('header.add_profile')}
                  className="ml-0.5 p-1 rounded bg-[#C9A050]/15 text-[#C9A050] hover:bg-[#C9A050]/25 transition-colors cursor-pointer shrink-0"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Desktop Quick Action: Ask AI */}
              <button
                onClick={() => setActiveTab('counsellor')}
                className={`hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold text-xs shadow-md transition-all duration-300 cursor-pointer shrink-0 hover:-translate-y-0.5 hover:scale-105 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-[#C9A050] to-[#A07828] hover:from-[#D4AF37] hover:to-[#B38730] text-[#0D0D0F] shadow-[#C9A050]/20 hover:shadow-[#C9A050]/40'
                    : 'bg-[#FFFFFF] border border-[#C9A050]/50 text-[#C9A050] hover:bg-[#C9A050]/10 shadow-[#C9A050]/10 hover:shadow-[#C9A050]/20'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('header.ask_ai')}</span>
              </button>

              {/* Logout (Desktop) */}
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Log out"
                  className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-[#141418] border border-[#2A2A2E] text-[#9E9A90] hover:border-[#C9A050]/50 hover:text-[#C9A050] transition-all cursor-pointer shadow-sm shrink-0"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}

              {/* Mobile Drawer Menu Toggle */}
              <button
                onClick={() => setIsMobileDrawerOpen((prev) => !prev)}
                className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-[#141418] border border-[#2A2A2E] text-[#E5E1D8] hover:text-[#C9A050] hover:border-[#C9A050]/50 transition cursor-pointer shrink-0"
                aria-label="Toggle navigation drawer"
              >
                {isMobileDrawerOpen ? <X className="w-4 h-4 text-[#C9A050]" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* 
          ========================================================================
          UNIFIED STICKY SUB-NAVIGATION BAR (TRANSPARENT BACKGROUND + TOP BORDER ONLY)
          ========================================================================
        */}
        <div
          className={`hidden md:block w-full border-t transition-colors ${
            theme === 'dark' ? 'border-[#2A2A2E]/60' : 'border-[#EAE4D8]'
          } bg-transparent`}
        >
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <nav
              className="flex items-center justify-center flex-wrap gap-2.5 sm:gap-3"
              aria-label="Secondary Tabs Navigation"
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                      isActive
                        ? theme === 'dark'
                          ? 'bg-[#1C1A14] text-[#E8C470] border-2 border-[#C9A050] shadow-md shadow-[#C9A050]/20 font-bold scale-[1.02]'
                          : 'bg-[#FFFFFF] text-[#94691E] border-2 border-[#C9A050] shadow-md shadow-[#C9A050]/15 font-bold scale-[1.02]'
                        : theme === 'dark'
                        ? 'bg-[#141418] text-[#9E9A90] border border-[#2A2A2E] hover:border-[#C9A050]/60 hover:text-[#F0ECE1] hover:bg-[#1A1A1E]'
                        : 'bg-[#FFFFFF] text-[#5C574F] border border-[#DDD7C9] hover:border-[#C9A050] hover:text-[#1A1816] hover:bg-[#FDFBF7]'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-[#C9A050]' : theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#8A847A]'
                      }`}
                    />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Out Navigation Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in">
          <div className="w-[82%] max-w-sm h-full bg-[#141418] border-l border-[#2A2A2E] p-5 shadow-2xl flex flex-col justify-between overflow-y-auto font-sans">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#2A2A2E]">
                <div className="flex items-center space-x-2.5">
                  <AncientTraditionLogo size="sm" isLight={theme === 'light'} />
                  <div>
                    <h3 className="font-bold text-sm text-[#F0ECE1]">
                      JYOTISH<span className="text-[#C9A050]">VEDA</span>
                    </h3>
                    <p className="text-[10px] text-[#9E9A90]">Astrological Intelligence</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg bg-[#1A1A1E] text-[#9E9A90] hover:text-[#F0ECE1] border border-[#2A2A2E]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Profile Card in Drawer */}
              <div className="my-4 p-3 rounded-xl bg-[#1A1A1E] border border-[#2A2A2E] flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#C9A050]/20 text-[#C9A050] flex items-center justify-center font-bold text-xs">
                    {currentProfile.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#F0ECE1]">{currentProfile.fullName}</div>
                    <div className="text-[10px] text-[#9E9A90] capitalize">
                      {currentProfile.horoscopeSystem || 'Vedic'} System
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onOpenNewProfile();
                  }}
                  className="p-1.5 rounded-lg bg-[#C9A050]/15 text-[#C9A050] hover:bg-[#C9A050]/25 text-xs font-semibold"
                  title="Edit or Add Profile"
                >
                  <PlusCircle className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Tabs List */}
              <div className="space-y-1 mt-2">
                <div className="text-[10px] font-bold text-[#9E9A90] uppercase tracking-wider px-2 py-1">
                  Navigation
                </div>
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMobileDrawerOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer text-left ${
                        isActive
                          ? 'bg-[#C9A050]/20 text-[#C9A050] font-bold border border-[#C9A050]/30'
                          : 'text-[#E5E1D8] hover:bg-[#1A1A1E] hover:text-[#F0ECE1]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#C9A050]' : 'text-[#9E9A90]'}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}

                {/* AI Daivajna Consultation Link */}
                <button
                  onClick={() => {
                    setActiveTab('counsellor');
                    setIsMobileDrawerOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer text-left mt-2 ${
                    activeTab === 'counsellor'
                      ? 'bg-[#C9A050]/20 text-[#C9A050] font-bold border border-[#C9A050]/30'
                      : 'text-[#C9A050] bg-[#C9A050]/10 hover:bg-[#C9A050]/20'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-[#C9A050]" />
                  <span>AI Daivajna Consultation</span>
                </button>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-[#2A2A2E] space-y-2">
              <button
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  onOpenDisclaimer();
                }}
                className="w-full flex items-center space-x-2 text-xs text-[#9E9A90] hover:text-[#C9A050] py-1.5 px-2 rounded"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#C9A050]" />
                <span>Astrological Disclaimer</span>
              </button>

              {onLogout && (
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center space-x-2 text-xs text-rose-400 hover:text-rose-300 py-1.5 px-2 rounded hover:bg-rose-500/10 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out of Account</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Navigation Bar (Visible on md and below) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0D0D0F]/95 backdrop-blur-xl border-t border-[#2A2A2E]/80 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <nav className="flex items-center justify-around" aria-label="Mobile Bottom Navigation">
          {mobileQuickTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all text-[10px] font-medium min-w-[54px] cursor-pointer ${
                  isActive
                    ? 'text-[#C9A050] font-bold scale-105'
                    : 'text-[#9E9A90] hover:text-[#E5E1D8]'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-[#C9A050]' : 'text-[#9E9A90]'}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};
