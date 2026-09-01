import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquareText, X, Send, Bot, Lock, Compass, Hash, Milestone, ShieldAlert, Sun, Moon, Home, Globe, Calendar, Play, RotateCcw } from 'lucide-react';
import { useZodiacData } from '../hooks/useZodiacData';
import { StarfieldBackground } from './StarfieldBackground';
import { GlobalZodiacView } from './GlobalZodiacView';
import PanjikaCalendarView from './PanjikaCalendarView';
import { ZodiacCompatibilityMatrix } from './ZodiacCompatibilityMatrix';
import { Footer } from './Footer';
import { FeaturePreviewModal, PREMIUM_FEATURES_CATALOG, PremiumFeatureDetail } from './FeaturePreviewModal';

interface LandingPageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onOpenDisclaimer: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export function LandingPage({ onLoginClick, onRegisterClick, onOpenDisclaimer, theme, toggleTheme }: LandingPageProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>(() => {
    try {
      const saved = localStorage.getItem('jyotishveda_guest_chat_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [{ role: 'assistant', content: 'Namaste. I am JyotishVeda. How may I guide your astrological journey today?' }];
  });

  const [input, setInput] = useState('');
  
  const [msgCount, setMsgCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('jyotishveda_guest_chat_count');
      if (saved) return parseInt(saved, 10) || 0;
    } catch (e) {}
    return 0;
  });

  const [isAiThinking, setIsAiThinking] = useState(false);
  
  const [savedDob, setSavedDob] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('jyotishveda_guest_chat_dob');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  const [selectedFeatureForPreview, setSelectedFeatureForPreview] = useState<PremiumFeatureDetail | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [activeSection, setActiveSection] = useState<string>('hero-section');

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('jyotishveda_guest_chat_messages', JSON.stringify(messages));
      localStorage.setItem('jyotishveda_guest_chat_count', String(msgCount));
      if (savedDob) {
        localStorage.setItem('jyotishveda_guest_chat_dob', JSON.stringify(savedDob));
      } else {
        localStorage.removeItem('jyotishveda_guest_chat_dob');
      }
    } catch (e) {}
  }, [messages, msgCount, savedDob]);

  const handleResetChat = () => {
    try {
      localStorage.removeItem('jyotishveda_guest_chat_messages');
      localStorage.removeItem('jyotishveda_guest_chat_count');
      localStorage.removeItem('jyotishveda_guest_chat_dob');
    } catch (e) {}
    setMessages([{ role: 'assistant', content: 'Namaste. I am JyotishVeda. How may I guide your astrological journey today?' }]);
    setMsgCount(0);
    setSavedDob(null);
  };

  useEffect(() => {
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAiThinking, isChatOpen]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const navHeight = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    setInput('');

    if (msgCount >= 3) {
      setMessages(prev => [
        ...prev,
        { role: 'user', content: userText },
        { role: 'assistant', content: "Please login to unlock deep analysis and detailed celestial wisdom." }
      ]);
      return;
    }

    const updatedMessages = [...messages, { role: 'user' as const, content: userText }];
    setMessages(updatedMessages);
    setMsgCount(prev => prev + 1);
    setIsAiThinking(true);

    try {
      const resp = await fetch('http://localhost:5001/api/public-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          msgCount: msgCount,
          dob: savedDob
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.dob) setSavedDob(data.dob);
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        if (data.msgCount) setMsgCount(data.msgCount);
      } else {
        throw new Error('API response not ok');
      }
    } catch (err) {
      // Client-side Fallback
      setTimeout(() => {
        const lower = userText.toLowerCase();
        let reply = "";
        
        if (msgCount >= 2) {
          reply = "Please login to unlock deep analysis and detailed celestial wisdom.";
          setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
          return;
        }

        // 1. Date Detection
        const dateMatch = userText.match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
        if (dateMatch) {
          const d = dateMatch[1];
          const m = dateMatch[2];
          const y = dateMatch[3];
          const newDob = [parseInt(y), parseInt(m), parseInt(d)];
          setSavedDob(newDob);
          
          const year = parseInt(y);
          const month = parseInt(m);
          const day = parseInt(d);
          const digits = `${year}${month < 10 ? '0' + month : month}${day < 10 ? '0' + day : day}`.split('').map(Number);
          let lp = digits.reduce((a, b) => a + b, 0);
          while (lp > 9 && lp !== 11 && lp !== 22 && lp !== 33) {
            lp = String(lp).split('').map(Number).reduce((a, b) => a + b, 0);
          }
          const signNames: [number, number, string][] = [
            [1, 20, "Makara (Capricorn)"], [2, 19, "Kumbha (Aquarius)"],
            [3, 20, "Meena (Pisces)"], [4, 20, "Mesha (Aries)"],
            [5, 21, "Vrishabha (Taurus)"], [6, 21, "Mithuna (Gemini)"],
            [7, 22, "Karka (Cancer)"], [8, 23, "Simha (Leo)"],
            [9, 23, "Kanya (Virgo)"], [10, 23, "Tula (Libra)"],
            [11, 22, "Vrishchika (Scorpio)"], [12, 21, "Dhanu (Sagittarius)"],
            [12, 31, "Makara (Capricorn)"]
          ];
          let detectedSign = "Karka (Cancer)";
          for (const [sm, sd, sname] of signNames) {
            if (month < sm || (month === sm && day <= sd)) {
              detectedSign = sname;
              break;
            }
          }
          const planetMap: Record<number, string> = {
            1: "Surya Dev (Sun)",
            2: "Chandra Dev (Moon)",
            3: "Devaguru Brihaspati (Jupiter)",
            4: "Rahu Dev",
            5: "Budha Dev (Mercury)",
            6: "Shukra Dev (Venus)",
            7: "Ketu Dev",
            8: "Shani Dev (Saturn)",
            9: "Mangal Dev (Mars)",
            11: "Master Number 11",
            22: "Master Number 22",
            33: "Master Number 33"
          };
          const rulingPlanet = planetMap[lp] || "Devaguru Brihaspati (Jupiter)";

          reply = `🕉️ **Kalyan Ho! Detailed Janma Kundli Analysis (${d}-${m}-${y})**:\n\nYour chart aligns with **${detectedSign}**, governed by the planetary grace of **${rulingPlanet}** (Life Path **${lp}**).`;
        } else if (!savedDob && (lower.includes('career') || lower.includes('job') || lower.includes('future') || lower.includes('details'))) {
          reply = `Ayushman Bhava! To look into your Janma Kundli and reveal the precise planetary alignments for your query, please share your **Date of Birth (DD-MM-YYYY)** and **Birth Time**.`;
        } else {
          reply = `Namaste! I am JyotishVeda, your Vedic Daivajna. Please share your **Date of Birth (DD-MM-YYYY)** and **Birth Time**.`;
        }

        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      }, 700);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleAskAIForSign = (signName: string, promptText: string) => {
    setIsChatOpen(true);
    if (msgCount >= 10) return;

    setMessages(prev => [...prev, { role: 'user', content: promptText }]);
    setMsgCount(prev => prev + 1);

    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: "Please login to unlock deep AI analysis and detailed celestial wisdom." }]);
    }, 1000);
  };

  return (
    <div className={`min-h-screen relative font-sans flex flex-col ${theme === 'dark' ? 'bg-[#0D0D0F] text-[#E5E1D8]' : 'bg-[#F0ECE1] text-[#0D0D0F]'}`}>
      {theme === 'dark' && <StarfieldBackground />}

      {/* Navigation Bar */}
      <nav className={`sticky top-0 z-50 backdrop-blur-2xl transition-all duration-300 border-b ${theme === 'dark' ? 'bg-[#0D0D0F]/80 border-[#2A2A2E]/50' : 'bg-[#F9F7F1]/80 border-[#E5E1D8]/80'} shadow-sm`}>
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div
              onClick={() => scrollToSection('hero-section')}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9A050]/20 to-transparent border border-[#C9A050]/50 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-5 h-5 text-[#C9A050]" />
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold tracking-wider flex items-center">
                  JYOTISH<span className="text-[#C9A050] font-sans ml-1 text-[22px] leading-none mb-0.5">वेद</span>
                </h1>
                <p className={`text-[9px] font-bold tracking-widest uppercase mt-0.5 ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                  Authentic Vedic Wisdom
                </p>
              </div>
            </div>

            {/* Center Links (Desktop only) */}
            <div className={`hidden lg:flex items-center space-x-1 px-1.5 py-1.5 rounded-full border backdrop-blur-md shadow-inner ${theme === 'dark' ? 'bg-[#141418]/60 border-[#2A2A2E]' : 'bg-white/60 border-gray-200/50'}`}>
              <button
                onClick={() => scrollToSection('hero-section')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-[13px] font-semibold transition-all cursor-pointer ${activeSection === 'hero-section'
                    ? 'text-[#0D0D0F] bg-[#C9A050] shadow-md shadow-[#C9A050]/20'
                    : theme === 'dark' ? 'text-[#9E9A90] hover:text-[#E5E1D8] hover:bg-white/5' : 'text-gray-600 hover:text-[#0D0D0F] hover:bg-black/5'
                  }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>
              <button
                onClick={() => scrollToSection('panjika-section')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-[13px] font-semibold transition-all cursor-pointer ${activeSection === 'panjika-section'
                    ? 'text-[#0D0D0F] bg-[#C9A050] shadow-md shadow-[#C9A050]/20'
                    : theme === 'dark' ? 'text-[#9E9A90] hover:text-[#E5E1D8] hover:bg-white/5' : 'text-gray-600 hover:text-[#0D0D0F] hover:bg-black/5'
                  }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Panjika</span>
              </button>
              <button
                onClick={() => scrollToSection('zodiac-section')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-[13px] font-semibold transition-all cursor-pointer ${activeSection === 'zodiac-section'
                    ? 'text-[#0D0D0F] bg-[#C9A050] shadow-md shadow-[#C9A050]/20'
                    : theme === 'dark' ? 'text-[#9E9A90] hover:text-[#E5E1D8] hover:bg-white/5' : 'text-gray-600 hover:text-[#0D0D0F] hover:bg-black/5'
                  }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Global Zodiac</span>
              </button>
              <button
                onClick={() => scrollToSection('premium-section')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-[13px] font-semibold transition-all cursor-pointer ${activeSection === 'premium-section'
                    ? 'text-[#0D0D0F] bg-[#C9A050] shadow-md shadow-[#C9A050]/20'
                    : theme === 'dark' ? 'text-[#9E9A90] hover:text-[#E5E1D8] hover:bg-white/5' : 'text-gray-600 hover:text-[#0D0D0F] hover:bg-black/5'
                  }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Premium</span>
              </button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-full transition-all border ${theme === 'dark'
                    ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8] hover:border-[#C9A050]/50'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-[#C9A050]/50 shadow-sm'
                  }`}
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1"></div>

              <button
                onClick={onLoginClick}
                className={`hidden sm:block px-5 py-2.5 rounded-full font-bold text-[13px] transition-all cursor-pointer border shadow-sm ${theme === 'dark'
                    ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8] hover:text-[#C9A050] hover:border-[#C9A050]/50'
                    : 'bg-white border-gray-200 text-[#0D0D0F] hover:text-[#8C6B28] hover:border-[#C9A050]/50'
                  }`}
              >
                Log In
              </button>
              <button
                onClick={onRegisterClick}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#C9A050] to-[#8C6B28] text-white font-bold text-[13px] hover:from-[#D4AF37] hover:to-[#A37B2F] transition-all cursor-pointer shadow-[0_0_15px_rgba(201,160,80,0.3)] hover:shadow-[0_0_20px_rgba(201,160,80,0.5)] hover:-translate-y-0.5"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 scroll-smooth">

        {/* Universal Astrologer Background (Fixed across all sections) */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.08] dark:opacity-[0.18] bg-no-repeat bg-cover bg-center transition-opacity duration-700"
            style={{
              backgroundImage: 'url(/astrologer_bg.jpg)',
              backgroundPosition: 'center center'
            }}
          ></div>
          {/* Subtle gradient to fade the background slightly at the bottom of the screen */}
          <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-transparent ${theme === 'dark' ? 'to-[#0D0D0F]/90' : 'to-[#F0ECE1]/90'}`}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div id="hero-section" className="min-h-[calc(100vh-5rem)] py-8 lg:py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left Column: Greetings */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1">
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#C9A050]/20 to-transparent border border-[#C9A050]/30 text-[#C9A050] text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(201,160,80,0.15)]">
                <Compass className="w-4 h-4" />
                <span>Authentic Vedic Oracle</span>
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-6">
                <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Decode Your Destiny with
                </span>
                <br />
                <span className="inline-flex mt-2 items-center">
                  {"JYOTISH".split("").map((char, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.08, ease: "easeOut" }}
                      className={`inline-block ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}`}
                    >
                      {char}
                    </motion.span>
                  ))}
                  <motion.span
                    initial={{ opacity: 0, y: 15 }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      y: [15, 0, 0, 15],
                      textShadow: [
                        "0px 0px 0px rgba(201,160,80,0)",
                        "0px 0px 15px rgba(201,160,80,0.6)",
                        "0px 0px 15px rgba(201,160,80,0.6)",
                        "0px 0px 0px rgba(201,160,80,0)"
                      ]
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      repeatDelay: 2.5,
                      times: [0, 0.1, 0.8, 1],
                      ease: "easeInOut"
                    }}
                    className="inline-block text-[#C9A050] font-sans ml-3 text-[1.1em] leading-none -mt-1"
                  >
                    वेद
                  </motion.span>
                </span>
              </h2>

              <p className={`max-w-xl text-lg sm:text-xl mb-10 leading-relaxed font-light ${theme === 'dark' ? 'text-[#D0CBC0]' : 'text-gray-700'}`}>
                Harness the profound wisdom of ancient <strong className="font-semibold text-[#C9A050]">Vedic astrology</strong>. Receive highly personalized cosmic insights and numerology readings mapped directly to your unique stellar blueprint.
              </p>

              <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto space-y-4 sm:space-y-0 sm:space-x-4">
                <button onClick={onRegisterClick} className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#C9A050] to-[#8C6B28] text-white font-bold text-base hover:from-[#D4AF37] hover:to-[#A37B2F] transition-all cursor-pointer shadow-[0_0_20px_rgba(201,160,80,0.4)] hover:shadow-[0_0_30px_rgba(201,160,80,0.6)] hover:-translate-y-1">
                  <span>Unlock Your Future</span>
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Column: Hero Spinning Zodiac Wheel */}
            <div className="relative group flex justify-center lg:justify-end order-1 lg:order-2 overflow-visible">
              <div className="absolute inset-0 bg-[#C9A050]/20 rounded-full blur-[60px] opacity-60 group-hover:opacity-100 transition-opacity duration-700 lg:translate-x-16"></div>

              {/* The wheel container */}
              <div className="relative w-72 h-72 sm:w-96 sm:h-96 lg:w-[500px] lg:h-[500px] flex items-center justify-center lg:translate-x-[15%]">
                <img
                  src="/white_zodiac_wheel.png"
                  alt="JyotishVeda Zodiac Wheel"
                  className="w-full h-full object-cover rounded-full shadow-[0_0_60px_rgba(201,160,80,0.4)] border border-[#C9A050]/40 relative z-10"
                  style={{ animation: 'spin 60s linear infinite' }}
                />

                {/* JYOTISHVEDA Center Overlay to cover "A.I." */}
                <div className="absolute z-20 flex flex-col items-center justify-center pointer-events-none">
                  <div className="bg-[#0b0c10] border border-[#C9A050]/80 shadow-[0_0_30px_rgba(201,160,80,0.5)] rounded-full w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center backdrop-blur-md">
                    <span className="text-[#C9A050] font-serif font-bold text-[10px] sm:text-xs tracking-[0.2em] text-center px-2 flex flex-col items-center">
                      <span>JYOTISH</span>
                      <span className="font-sans text-sm sm:text-base tracking-normal mt-0.5">वेद</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side-by-side Layout for Panjika and Zodiac on larger screens */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 pt-6 pb-12 items-start">
            {/* Panjika & Calendar Section (Takes less width) */}
            <div id="panjika-section" className="w-full lg:w-[40%] xl:w-[35%] text-left">
              <PanjikaCalendarView theme={theme} />
              <ZodiacCompatibilityMatrix theme={theme} />
            </div>

            {/* Full Global Zodiac Section (Takes more width to prevent squishing) */}
            <div id="zodiac-section" className="w-full lg:w-[60%] xl:w-[65%] text-left">
              <GlobalZodiacView
                theme={theme}
                onAskAIForSign={handleAskAIForSign}
              />
            </div>
          </div>

          {/* Premium Features Teaser (Locked Cards) */}
          <div id="premium-section" className="w-full pt-8 pb-28 min-h-[calc(100vh-5rem)]">
            <div className="text-center mb-10">
              <h3 className="text-2xl md:text-3xl font-serif font-bold mb-3 flex items-center justify-center space-x-2">
                <Lock className="w-6 h-6 text-[#C9A050]" />
                <span>Unlock Premium Features</span>
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-600'}`}>
                Log in to access your deeply personalized astrological and numerological journey.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {PREMIUM_FEATURES_CATALOG.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.id}
                    onClick={() => setSelectedFeatureForPreview(feat)}
                    className={`relative overflow-hidden rounded-2xl p-6 text-left cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#C9A050]/20 group ${theme === 'dark'
                        ? 'bg-white/5 border border-white/10 backdrop-blur-md hover:border-[#C9A050]/50'
                        : 'bg-white/40 border border-white/60 backdrop-blur-md shadow-sm hover:border-[#C9A050]/50'
                      }`}
                  >
                    {/* Glassmorphism Video Demo Preview Overlay on Hover */}
                    <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/65 backdrop-blur-[3px] p-4 text-center">
                      <div className="flex flex-col items-center transform group-hover:scale-105 transition-transform duration-300">
                        <div className="w-12 h-12 rounded-full bg-[#C9A050] text-[#0D0D0F] flex items-center justify-center shadow-lg shadow-[#C9A050]/50 mb-2">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                        <span className="text-[#F0ECE1] font-serif font-bold text-xs tracking-wide">
                          15s Demo Video
                        </span>
                        <span className="text-[10px] text-[#C9A050] font-mono mt-0.5">
                          Click to Preview & Unlock
                        </span>
                      </div>
                    </div>

                    <div className="relative z-10 opacity-80 group-hover:opacity-30 transition-opacity duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[#C9A050]/20 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-[#C9A050]" />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C9A050]/15 text-[#8C6B28] dark:text-[#C9A050] border border-[#C9A050]/30">
                          15s Video
                        </span>
                      </div>
                      <h4 className="font-bold text-base mb-1.5">{feat.title}</h4>
                      <p className="text-xs leading-relaxed text-[#9E9A90]">{feat.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <Footer onOpenDisclaimer={onOpenDisclaimer} theme={theme} />
      </main>

      {/* Feature 15-Second Video Preview & Details Modal */}
      <FeaturePreviewModal
        feature={selectedFeatureForPreview}
        isOpen={!!selectedFeatureForPreview}
        onClose={() => setSelectedFeatureForPreview(null)}
        onLoginClick={() => {
          setSelectedFeatureForPreview(null);
          onLoginClick();
        }}
        onRegisterClick={() => {
          setSelectedFeatureForPreview(null);
          onRegisterClick();
        }}
        theme={theme}
      />

      {/* Mini Chat Pop-up */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className={`mb-4 w-[320px] rounded-2xl shadow-2xl border flex flex-col overflow-hidden ${theme === 'dark' ? 'bg-[#141418] border-[#C9A050]/40' : 'bg-[#FFFFFF] border-[#C9A050]/40 shadow-[#C9A050]/10'}`}
            >
              <div className="bg-[#C9A050] p-3 text-[#0D0D0F] flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-bold text-sm">JyotishVeda AI</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={handleResetChat} 
                    title="Restart Chat"
                    className="hover:bg-black/10 p-1 rounded-md transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setIsChatOpen(false)} className="hover:bg-black/10 p-1 rounded-md transition cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className={`h-[300px] p-3 overflow-y-auto flex flex-col space-y-3 text-xs ${theme === 'dark' ? 'bg-[#0D0D0F]' : 'bg-[#F0ECE1]/50'}`}>
                {messages.map((m, i) => {
                  const isLoginPrompt = m.content.includes("Please login to unlock");
                  return (
                    <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[88%] p-2.5 rounded-xl flex items-start space-x-2 shadow-sm ${
                        m.role === 'user'
                          ? 'bg-[#C9A050] text-[#0D0D0F] rounded-tr-sm font-medium'
                          : (theme === 'dark' ? 'bg-[#1A1A1E] text-[#E5E1D8] border border-[#2A2A2E] rounded-tl-sm' : 'bg-[#FFFFFF] text-[#0D0D0F] border border-[#E5E1D8] rounded-tl-sm')
                      }`}>
                        {m.role === 'assistant' && <Bot className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#C9A050]" />}
                        <div className="flex flex-col space-y-1.5 leading-relaxed">
                          <span className="whitespace-pre-line">{m.content}</span>
                          {isLoginPrompt && (
                            <button
                              onClick={() => {
                                setIsChatOpen(false);
                                onLoginClick();
                              }}
                              className="mt-1 py-1.5 px-3 rounded-lg bg-[#C9A050] hover:bg-[#D4AF37] text-[#0D0D0F] font-bold text-xs transition shadow-sm cursor-pointer flex items-center justify-center space-x-1"
                            >
                              <span>Log In to Continue</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isAiThinking && (
                  <div className="flex items-center space-x-1.5 p-2 rounded-xl bg-black/5 dark:bg-white/5 text-[11px] text-[#C9A050] w-fit">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Consulting celestial transits...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className={`p-3 border-t flex flex-col ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#FFFFFF] border-[#E5E1D8]'}`}>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={msgCount >= 3 ? "Message limit reached." : "Ask a quick question..."}
                    disabled={msgCount >= 3}
                    className={`flex-1 px-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:border-[#C9A050] disabled:opacity-50 ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E] text-[#F0ECE1]' : 'bg-[#F0ECE1] border-[#E5E1D8] text-[#0D0D0F]'}`}
                  />
                  <button
                    onClick={handleSend}
                    disabled={msgCount >= 3 || !input.trim()}
                    className="p-1.5 rounded-lg bg-[#C9A050] text-[#0D0D0F] disabled:opacity-50 cursor-pointer hover:bg-[#D4AF37] transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isChatOpen && (
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-12 h-12 rounded-full bg-[#C9A050] text-[#0D0D0F] flex items-center justify-center shadow-lg shadow-[#C9A050]/30 hover:scale-105 transition cursor-pointer"
          >
            <MessageSquareText className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}




