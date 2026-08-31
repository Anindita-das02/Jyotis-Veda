import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquareText, X, Send, Bot, Lock, Compass, Hash, Milestone, ShieldAlert, Sun, Moon, Home, Globe, Calendar } from 'lucide-react';
import { ZODIAC_SIGNS } from '../services/zodiacData';
import { StarfieldBackground } from './StarfieldBackground';
import { GlobalZodiacView } from './GlobalZodiacView';
import PanjikaCalendarView from './PanjikaCalendarView';
import { Footer } from './Footer';

interface LandingPageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onOpenDisclaimer: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export function LandingPage({ onLoginClick, onRegisterClick, onOpenDisclaimer, theme, toggleTheme }: LandingPageProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: 'Namaste. I am JyotishVeda AI. How may the stars guide you today?' }
  ]);
  const [input, setInput] = useState('');
  const [msgCount, setMsgCount] = useState(0);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

  const premiumFeatures = [
    { title: 'Deep Birth Chart', desc: 'Detailed Kundli and planetary positions based on precise birth time.', icon: Compass },
    { title: 'Personalized Numerology', desc: 'Discover your life path, destiny, and soul urge numbers.', icon: Hash },
    { title: 'Life Roadmap', desc: 'Navigate your upcoming dashas and major life milestones.', icon: Milestone },
    { title: 'AI Astrologer Pro', desc: 'Unlimited deep astrological chat without the 10-message limit.', icon: Bot },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSend = () => {
    if (!input.trim() || msgCount >= 10) return;
    
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setMsgCount(prev => prev + 1);
    setInput('');
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: "Please login to unlock deep AI analysis and detailed celestial wisdom." }]);
    }, 1000);
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
      <nav className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors duration-300 shadow-md ${theme === 'dark' ? 'bg-[#0D0D0F]/80 border-[#2A2A2E]/80 text-[#E5E1D8]' : 'bg-[#F9F7F1]/85 border-[#E5E1D8] text-[#0D0D0F]'}`}>
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div 
              onClick={() => scrollToSection('hero-section')}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-[#C9A050]/15 border border-[#C9A050]/50 flex items-center justify-center group-hover:bg-[#C9A050]/20 transition-colors">
                <Sparkles className="w-5 h-5 text-[#C9A050]" />
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold tracking-wider">
                  JYOTISH<span className="text-[#C9A050]">VEDA</span>
                </h1>
                <p className={`text-[9px] font-bold tracking-widest uppercase mt-0.5 ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                  AI Astrological Wisdom
                </p>
              </div>
            </div>

            {/* Center Links (Desktop only) */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('hero-section')} className={`flex items-center space-x-1.5 text-sm font-semibold transition-colors hover:text-[#C9A050] ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'}`}>
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>
              <button onClick={() => scrollToSection('panjika-section')} className={`flex items-center space-x-1.5 text-sm font-semibold transition-colors hover:text-[#C9A050] ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-600'}`}>
                <Calendar className="w-4 h-4" />
                <span>Panjika & Calendar</span>
              </button>
              <button onClick={() => scrollToSection('zodiac-section')} className={`flex items-center space-x-1.5 text-sm font-semibold transition-colors hover:text-[#C9A050] ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-600'}`}>
                <Globe className="w-4 h-4" />
                <span>Global Zodiac</span>
              </button>
              <button onClick={() => scrollToSection('premium-section')} className={`flex items-center space-x-1.5 text-sm font-semibold transition-colors hover:text-[#C9A050] ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-600'}`}>
                <Lock className="w-4 h-4" />
                <span>Premium</span>
              </button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors border ${
                  theme === 'dark'
                    ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8] hover:border-[#C9A050]/50'
                    : 'bg-white border-[#E5E1D8] text-[#2A2A2E] hover:border-[#C9A050]/50 shadow-sm'
                }`}
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              
              <div className="hidden sm:block w-px h-6 bg-[#C9A050]/30 mx-2"></div>
              
              <button onClick={onLoginClick} className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors cursor-pointer ${theme === 'dark' ? 'text-[#E5E1D8] hover:bg-[#1A1A1E]' : 'text-[#0D0D0F] hover:bg-black/5'}`}>Log In</button>
              <button onClick={onRegisterClick} className="px-4 py-2 rounded-lg bg-[#C9A050] text-[#0D0D0F] font-bold text-sm hover:bg-[#D4AF37] transition-all cursor-pointer shadow-lg shadow-[#C9A050]/20 hover:-translate-y-0.5">Get Started</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 overflow-y-auto relative z-10 pb-20 scroll-smooth">
        <div className="max-w-7xl mx-auto px-6">
          <div id="hero-section" className="py-12 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Greetings */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#C9A050]/10 border border-[#C9A050]/20 text-[#C9A050] text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ancient Wisdom Meets AI</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-6">
              Welcome to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D97706] to-[#F59E0B] inline-flex">
                {"JYOTISHVEDA".split("").map((char, index) => {
                  if (index <= 6) { // JYOTISH
                    return (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0, textShadow: "0px 0px 10px rgba(201,160,80,0.5)" }}
                        transition={{ duration: 0.6, delay: index * 0.08, ease: "easeOut" }}
                        className="inline-block"
                      >
                        {char}
                      </motion.span>
                    );
                  }

                  // VEDA
                  const vedaIndex = index - 7;
                  return (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ 
                        opacity: [0, 1, 1, 0], 
                        y: [15, 0, 0, 15],
                        textShadow: [
                          "0px 0px 0px rgba(201,160,80,0)",
                          "0px 0px 10px rgba(201,160,80,0.5)",
                          "0px 0px 10px rgba(201,160,80,0.5)",
                          "0px 0px 0px rgba(201,160,80,0)"
                        ]
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        repeatDelay: 2.5,
                        delay: vedaIndex * 0.3,
                        times: [0, 0.1, 0.8, 1],
                        ease: "easeInOut"
                      }}
                      className="inline-block"
                    >
                      {char}
                    </motion.span>
                  );
                })}
              </span>
            </h2>
            
            <p className={`max-w-xl text-base sm:text-lg mb-8 leading-relaxed ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-600'}`}>
              Experience the profound synergy of authentic Vedic Astrology, intricate Numerology, and cutting-edge Artificial Intelligence tailored just for you.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto space-y-4 sm:space-y-0 sm:space-x-4">
              <button onClick={onRegisterClick} className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#C9A050] text-[#0D0D0F] font-bold text-base hover:bg-[#D4AF37] transition-all cursor-pointer shadow-lg shadow-[#C9A050]/20 hover:-translate-y-1">
                Get Started
              </button>
            </div>
          </div>
          
          {/* Right Column: Hero Spinning Zodiac AI Wheel */}
          <div className="relative group flex justify-center order-1 lg:order-2">
            <div className="absolute inset-0 bg-[#C9A050]/20 rounded-full blur-[60px] opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <div className="relative w-72 h-72 sm:w-96 sm:h-96 lg:w-[450px] lg:h-[450px] flex items-center justify-center">
              <img 
                src="/golden_zodiac_wheel.jpg" 
                alt="JyotishVeda AI Zodiac Wheel" 
                className="w-full h-full object-cover rounded-full shadow-[0_0_60px_rgba(201,160,80,0.4)] border border-[#C9A050]/40 relative z-10"
                style={{ animation: 'spin 60s linear infinite' }}
              />
              
              {/* JYOTISHVEDA Center Overlay to cover "A.I." */}
              <div className="absolute z-20 flex flex-col items-center justify-center pointer-events-none">
                <div className="bg-[#0b0c10] border border-[#C9A050]/80 shadow-[0_0_30px_rgba(201,160,80,0.5)] rounded-full w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center backdrop-blur-md">
                  <span className="text-[#C9A050] font-serif font-bold text-[10px] sm:text-xs tracking-[0.2em] text-center px-2">
                    JYOTISH<br/>VEDA
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>  

          {/* Panjika & Calendar Section */}
          <div id="panjika-section" className="w-full text-left mt-8 scroll-mt-24">
            <PanjikaCalendarView />
          </div>
          {/* Full Global Zodiac Section */}
          <div id="zodiac-section" className="w-full text-left mt-8 scroll-mt-24">
            <GlobalZodiacView 
              theme={theme}
              onAskAIForSign={handleAskAIForSign}
            />
          </div>

          {/* Premium Features Teaser (Locked Cards) */}
          <div id="premium-section" className="w-full mt-24 scroll-mt-24">
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
              {premiumFeatures.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div 
                    key={idx}
                    onClick={() => setIsLoginPromptOpen(true)}
                    className={`relative overflow-hidden rounded-2xl p-6 text-left cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#C9A050]/20 group ${
                      theme === 'dark' 
                        ? 'bg-white/5 border border-white/10 backdrop-blur-md' 
                        : 'bg-white/40 border border-white/60 backdrop-blur-md shadow-sm'
                    }`}
                  >
                    {/* Glassmorphism Lock Overlay */}
                    <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-[#C9A050] text-[#0D0D0F] flex items-center justify-center shadow-lg shadow-[#C9A050]/50 mb-2">
                          <Lock className="w-6 h-6" />
                        </div>
                        <span className="text-white font-bold text-sm tracking-wide">Click to Unlock</span>
                      </div>
                    </div>

                    <div className="relative z-10 opacity-60 group-hover:opacity-40 transition-opacity duration-300">
                      <div className="w-10 h-10 rounded-xl bg-[#C9A050]/20 flex items-center justify-center mb-4">
                        <Icon className="w-5 h-5 text-[#C9A050]" />
                      </div>
                      <h4 className="font-bold text-base mb-2">{feat.title}</h4>
                      <p className="text-xs leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <Footer onOpenDisclaimer={onOpenDisclaimer} theme={theme} />
      </main>

      {/* Login Prompt Modal */}
      <AnimatePresence>
        {isLoginPromptOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
            onClick={() => setIsLoginPromptOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-sm rounded-2xl p-6 text-center shadow-2xl border ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-white border-[#E5E1D8]'}`}
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-[#C9A050]/15 flex items-center justify-center mb-4 border border-[#C9A050]/30">
                <ShieldAlert className="w-8 h-8 text-[#C9A050]" />
              </div>
              <h3 className="text-xl font-serif font-bold mb-2">Unlock Your Destiny</h3>
              <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-600'}`}>
                Please login to unlock your personalized astrological journey and explore these premium features.
              </p>
              <div className="flex flex-col space-y-3">
                <button 
                  onClick={() => {
                    setIsLoginPromptOpen(false);
                    onLoginClick();
                  }}
                  className="w-full py-2.5 rounded-lg bg-[#C9A050] text-[#0D0D0F] font-bold shadow-lg shadow-[#C9A050]/20 hover:bg-[#D4AF37] transition"
                >
                  Log In Now
                </button>
                <button 
                  onClick={() => setIsLoginPromptOpen(false)}
                  className={`w-full py-2.5 rounded-lg font-semibold transition ${theme === 'dark' ? 'text-[#9E9A90] hover:bg-[#1A1A1E]' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <button onClick={() => setIsChatOpen(false)} className="hover:bg-black/10 p-1 rounded-md transition cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className={`h-[300px] p-3 overflow-y-auto flex flex-col space-y-3 text-xs ${theme === 'dark' ? 'bg-[#0D0D0F]' : 'bg-[#F0ECE1]/50'}`}>
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-2.5 rounded-xl flex items-start space-x-2 shadow-sm ${m.role === 'user' ? 'bg-[#C9A050] text-[#0D0D0F] rounded-tr-sm' : (theme === 'dark' ? 'bg-[#1A1A1E] text-[#E5E1D8] border border-[#2A2A2E] rounded-tl-sm' : 'bg-[#FFFFFF] text-[#0D0D0F] border border-[#E5E1D8] rounded-tl-sm')}`}>
                      {m.role === 'assistant' && <Bot className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#C9A050]" />}
                      <span className="leading-relaxed">{m.content}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className={`p-3 border-t flex flex-col ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#FFFFFF] border-[#E5E1D8]'}`}>
                <div className="flex items-center space-x-2">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={msgCount >= 10 ? "Message limit reached." : "Ask a quick question..."}
                    disabled={msgCount >= 10}
                    className={`flex-1 px-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:border-[#C9A050] disabled:opacity-50 ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E] text-[#F0ECE1]' : 'bg-[#F0ECE1] border-[#E5E1D8] text-[#0D0D0F]'}`}
                  />
                  <button 
                    onClick={handleSend}
                    disabled={msgCount >= 10 || !input.trim()}
                    className="p-1.5 rounded-lg bg-[#C9A050] text-[#0D0D0F] disabled:opacity-50 cursor-pointer hover:bg-[#D4AF37] transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className={`text-[9px] mt-1.5 text-center ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#9E9A90]'}`}>
                  {msgCount}/10 free messages used
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
