import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Lock,
  Compass,
  Hash,
  Milestone,
  Bot,
  Volume2,
  VolumeX,
  ArrowRight,
  ShieldCheck,
  Award,
  Activity,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface PremiumFeatureDetail {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  desc: string;
  fullDescription: string;
  icon: any;
  targetTab: string;
  videoPoster: string;
  videoSrc?: string;
  keyBenefits: string[];
  specs: { label: string; value: string }[];
}

export const PREMIUM_FEATURES_CATALOG: PremiumFeatureDetail[] = [
  {
    id: 'birth-chart',
    title: 'Deep Birth Chart',
    subtitle: 'Vedic Kundli & Divisional Charts',
    tagline: 'High Precision Planetary Ephemeris & D1/D9 Calculations',
    desc: 'Detailed Kundli and planetary positions based on precise birth time and geographical coordinates.',
    fullDescription:
      'Unlock deep celestial insights with high-precision Swiss Ephemeris calculations. Computes your Lagna, Rashi, Bhava Chalit, and D9 Navamsha charts with exact planetary longitudes, retrograde motions, combustion states, and planetary dignities.',
    icon: Compass,
    targetTab: 'horoscope',
    videoPoster: '/golden_zodiac_wheel.jpg',
    keyBenefits: [
      'Comprehensive North & South Indian Chart formats',
      'Precise D1 Rashi, D9 Navamsha, and Bhava Chalit alignments',
      'Detailed planetary dignities, shadbala scores & house lordships',
      'Auspicious yogas and dosha identifications (Manglik, Kaal Sarp)',
    ],
    specs: [
      { label: 'Precision', value: '0.001 Arcsecond' },
      { label: 'Tradition', value: 'Lahiri / Drik Ganita' },
      { label: 'House System', value: 'Placidus / Equal House' },
      { label: 'Divisional Charts', value: 'D1 to D60' },
    ],
  },
  {
    id: 'numerology',
    title: 'Personalized Numerology',
    subtitle: 'Pythagorean & Chaldean Systems',
    tagline: 'Discover Destiny, Soul Urge & Karmic Vibrations',
    desc: 'Discover your life path, destiny, and soul urge numbers synthesized with celestial harmonics.',
    fullDescription:
      'Experience an exhaustive numerological synthesis combining ancient Chaldean vibrations and modern Pythagorean matrices. Calculate your Life Path, Destiny, Soul Urge, and personal year cycles to uncover lucky dates, colors, and gemstones.',
    icon: Hash,
    targetTab: 'numerology',
    videoPoster: '/golden_zodiac_wheel.jpg',
    keyBenefits: [
      'Life Path & Destiny Number deep breakdown',
      'Soul Urge and Personality hidden vibration analysis',
      'Personal Year, Month & Day auspicious timing forecast',
      'Harmonious Gemstones, Lucky Days & Auspicious Colors guide',
    ],
    specs: [
      { label: 'Systems Supported', value: 'Chaldean & Pythagorean' },
      { label: 'Master Numbers', value: '11, 22, 33 Decoded' },
      { label: 'Karmic Lessons', value: 'Full Matrix' },
      { label: 'Compatibility', value: 'Name & Date Synergy' },
    ],
  },
  {
    id: 'roadmap',
    title: 'Life Roadmap',
    subtitle: 'Vimshottari Dasha & Transit Timeline',
    tagline: 'Navigate Major Life Milestones, Career & Wealth Windows',
    desc: 'Navigate your upcoming dashas, major life milestones, and planetary transits across a 120-year span.',
    fullDescription:
      'Map your entire lifetime destiny across the 120-year Vimshottari Mahadasha and Antardasha cycles. Identify upcoming golden windows for career promotions, wealth generation, marriage timing, and Saturn Sade Sati transits.',
    icon: Milestone,
    targetTab: 'roadmap',
    videoPoster: '/golden_zodiac_wheel.jpg',
    keyBenefits: [
      'Detailed 120-Year Vimshottari Mahadasha & Antardasha timeline',
      'Career, Wealth, Marriage & Health inflection point markers',
      'Saturn Sade Sati, Dhaiya & Kantaka Shani impact phases',
      'Actionable Vedic astrological remedies for difficult transit periods',
    ],
    specs: [
      { label: 'Cycle Range', value: '120-Year Full Dasha' },
      { label: 'Sub-Periods', value: 'Mahadasha & Antardasha' },
      { label: 'Transit Sync', value: 'Real-Time Planetary Engine' },
      { label: 'Milestone Mapping', value: 'AI Predictive Graph' },
    ],
  },
  {
    id: 'ai-astrologer',
    title: 'AI Astrologer Pro',
    subtitle: '24/7 Vedic Oracle Consultation',
    tagline: 'Unlimited Real-Time Astrological Guidance with Zero Caps',
    desc: 'Unlimited deep astrological chat and custom queries powered by advanced AI and Vedic literature.',
    fullDescription:
      'Engage in real-time personalized dialogues with our AI Astrological Oracle. Synthesizing Brihat Parashara Hora Shastra and planetary transits, the AI Counsellor provides empathetic guidance on career, relationships, and remedies without caps.',
    icon: Bot,
    targetTab: 'ai_chat',
    videoPoster: '/golden_zodiac_wheel.jpg',
    keyBenefits: [
      'Unlimited astrological queries with real-time chart context',
      'Instant answers for career, business, love, and health dilemmas',
      'Vedic remedies: Mantras, Yantras, Gemstones & Charity guidance',
      'Context-aware memory tuned to your specific birth chart',
    ],
    specs: [
      { label: 'Availability', value: '24/7 Real-Time Oracle' },
      { label: 'Knowledge Base', value: 'Parashara & Jaimini Sutras' },
      { label: 'Query Limit', value: 'Unlimited in Pro' },
      { label: 'Remedies', value: 'Personalized Vedic Guidance' },
    ],
  },
];

interface FeaturePreviewModalProps {
  feature: PremiumFeatureDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  theme?: string;
}

export const FeaturePreviewModal: React.FC<FeaturePreviewModalProps> = ({
  feature,
  isOpen,
  onClose,
  onLoginClick,
  onRegisterClick,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const totalDuration = 15;
  const intervalRef = useRef<any>(null);

  // 15-second simulation timer for multi-scene dynamic video demo
  useEffect(() => {
    if (!isOpen || !feature) {
      setCurrentTime(0);
      setIsPlaying(true);
      return;
    }

    intervalRef.current = setInterval(() => {
      if (isPlaying) {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            return 0;
          }
          return +(prev + 0.1).toFixed(1);
        });
      }
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isOpen, feature, isPlaying]);

  if (!isOpen || !feature) return null;

  const Icon = feature.icon;
  const progressPercent = Math.min(100, (currentTime / totalDuration) * 100);

  // Determine current active scene based on time (Scene 1: 0-5s, Scene 2: 5-10s, Scene 3: 10-15s)
  const currentSceneIndex = currentTime < 5 ? 1 : currentTime < 10 ? 2 : 3;

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setIsPlaying(true);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          style={{
            backgroundColor: isDark ? '#121216' : '#FFFFFF',
            borderColor: isDark ? '#C9A050' : '#C9A050',
            color: isDark ? '#FFFFFF' : '#111827',
          }}
          className="w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Bar Header (Compact) */}
          <div
            style={{
              borderBottomColor: isDark ? 'rgba(201,160,80,0.25)' : 'rgba(201,160,80,0.3)',
              background: isDark
                ? 'linear-gradient(to right, rgba(201,160,80,0.15), transparent)'
                : 'linear-gradient(to right, rgba(201,160,80,0.12), transparent)',
            }}
            className="px-4 py-3 sm:px-5 sm:py-3.5 border-b flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C9A050] to-[#8C6B28] text-[#0D0D0F] flex items-center justify-center shadow-md shadow-[#C9A050]/30 shrink-0">
                <Icon className="w-5 h-5 font-bold text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3
                    style={{ color: isDark ? '#F59E0B' : '#92400E' }}
                    className="text-base sm:text-lg font-serif font-black"
                  >
                    {feature.title}
                  </h3>
                  <span
                    style={{
                      backgroundColor: isDark ? 'rgba(201,160,80,0.2)' : 'rgba(201,160,80,0.25)',
                      color: isDark ? '#FDE68A' : '#78350F',
                      borderColor: 'rgba(201,160,80,0.4)',
                    }}
                    className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border"
                  >
                    Premium Feature
                  </span>
                </div>
                <p
                  style={{ color: isDark ? '#D1D5DB' : '#4B5563' }}
                  className="text-[11px] font-semibold"
                >
                  {feature.subtitle}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{ color: isDark ? '#9CA3AF' : '#1F2937' }}
              className="p-1.5 rounded-full hover:bg-black/10 transition-colors cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body: 2 Columns - Zero Vertical Scroll Required */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 sm:p-5 items-start">
            
            {/* Left Column (6 Cols): Multi-Scene 15s Continuous Video Demonstration */}
            <div className="lg:col-span-6 flex flex-col space-y-3">
              
              {/* Scene Indicator Pills */}
              <div className="flex items-center justify-between gap-1 text-[10px] font-bold">
                <div
                  style={{
                    backgroundColor: currentSceneIndex === 1 ? '#C9A050' : isDark ? '#1F2937' : '#F3F4F6',
                    color: currentSceneIndex === 1 ? '#000000' : isDark ? '#9CA3AF' : '#4B5563',
                    borderColor: currentSceneIndex === 1 ? '#C9A050' : 'transparent',
                  }}
                  className="flex-1 py-1 px-1.5 rounded-md text-center border font-bold transition-all"
                >
                  1. Ephemeris Scan
                </div>
                <div
                  style={{
                    backgroundColor: currentSceneIndex === 2 ? '#C9A050' : isDark ? '#1F2937' : '#F3F4F6',
                    color: currentSceneIndex === 2 ? '#000000' : isDark ? '#9CA3AF' : '#4B5563',
                    borderColor: currentSceneIndex === 2 ? '#C9A050' : 'transparent',
                  }}
                  className="flex-1 py-1 px-1.5 rounded-md text-center border font-bold transition-all"
                >
                  2. Live Computation
                </div>
                <div
                  style={{
                    backgroundColor: currentSceneIndex === 3 ? '#C9A050' : isDark ? '#1F2937' : '#F3F4F6',
                    color: currentSceneIndex === 3 ? '#000000' : isDark ? '#9CA3AF' : '#4B5563',
                    borderColor: currentSceneIndex === 3 ? '#C9A050' : 'transparent',
                  }}
                  className="flex-1 py-1 px-1.5 rounded-md text-center border font-bold transition-all"
                >
                  3. Vedic Synthesis
                </div>
              </div>

              {/* Video Player Container (Compact 16/10 aspect ratio) */}
              <div className="relative rounded-xl overflow-hidden border border-[#C9A050]/40 bg-[#0A0A0C] aspect-[16/10] flex flex-col justify-between group shadow-lg">
                
                {/* DYNAMIC MULTI-SCENE VISUAL CANVAS */}
                <div className="absolute inset-0 overflow-hidden">
                  
                  {/* SCENE 1 (0-5s): Cosmic Ephemeris Scanning */}
                  {currentSceneIndex === 1 && (
                    <motion.div
                      key="scene-1"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 flex flex-col items-center justify-center p-3 bg-gradient-to-b from-[#14120B] via-[#0A0A0C] to-black"
                    >
                      <img
                        src="/golden_zodiac_wheel.jpg"
                        alt="Zodiac Scanning"
                        className="absolute inset-0 w-full h-full object-cover opacity-35 filter brightness-90 animate-spin"
                        style={{ animationDuration: '40s' }}
                      />
                      <div className="absolute inset-0 bg-radial from-transparent to-black/90" />
                      
                      {/* Scanning HUD Overlay */}
                      <div className="relative z-10 text-center space-y-1.5 max-w-[280px]">
                        <div className="w-10 h-10 mx-auto rounded-full border-2 border-[#C9A050] border-t-transparent animate-spin flex items-center justify-center">
                          <Activity className="w-4 h-4 text-[#C9A050]" />
                        </div>
                        <div className="text-[11px] font-mono font-bold text-[#C9A050] tracking-wider uppercase">
                          Scanning Planetary Longitudes
                        </div>
                        <div className="p-1.5 rounded-lg bg-black/80 border border-[#C9A050]/30 font-mono text-[9.5px] text-gray-300 text-left space-y-0.5">
                          <div className="flex justify-between">
                            <span>☉ Sun (Surya):</span>
                            <span className="text-[#C9A050]">24°12' Leo (D1)</span>
                          </div>
                          <div className="flex justify-between">
                            <span>☽ Moon (Chandra):</span>
                            <span className="text-[#C9A050]">18°05' Rohini</span>
                          </div>
                          <div className="flex justify-between">
                            <span>♃ Jupiter (Guru):</span>
                            <span className="text-green-400">Exalted (D9)</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* SCENE 2 (5-10s): Feature-Specific Live Computation Simulation */}
                  {currentSceneIndex === 2 && (
                    <motion.div
                      key="scene-2"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 flex flex-col justify-center p-3 bg-gradient-to-b from-[#18150E] via-[#0E0D0A] to-black"
                    >
                      {/* Deep Birth Chart Simulation */}
                      {feature.id === 'birth-chart' && (
                        <div className="space-y-1.5 max-w-[290px] mx-auto w-full">
                          <div className="flex items-center justify-between text-[11px] font-bold text-[#C9A050]">
                            <span className="flex items-center space-x-1">
                              <Compass className="w-3.5 h-3.5" />
                              <span>D1 Rashi & D9 Navamsha</span>
                            </span>
                            <span className="text-[9px] text-green-400">100% Calculated</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1 p-1.5 rounded-lg bg-black/85 border border-[#C9A050]/40 text-[9px] text-center font-mono">
                            <div className="p-1 rounded bg-[#C9A050]/15 text-[#C9A050] font-bold border border-[#C9A050]/30">Lagna: Leo</div>
                            <div className="p-1 rounded bg-white/5 text-gray-300">2H: Virgo</div>
                            <div className="p-1 rounded bg-white/5 text-gray-300">3H: Libra</div>
                            <div className="p-1 rounded bg-white/5 text-gray-300">4H: Scorpio</div>
                            <div className="p-1 rounded bg-gradient-to-r from-[#C9A050]/30 to-[#8C6B28]/30 font-bold text-white border border-[#C9A050]/50">D9 Guru</div>
                            <div className="p-1 rounded bg-white/5 text-gray-300">6H: Cap</div>
                            <div className="p-1 rounded bg-white/5 text-gray-300">7H: Aqua</div>
                            <div className="p-1 rounded bg-white/5 text-gray-300">8H: Pisces</div>
                            <div className="p-1 rounded bg-[#C9A050]/15 text-[#C9A050] font-bold">10H: Taurus</div>
                          </div>
                          <p className="text-[9px] text-center text-gray-300">
                            ★ Gaja Kesari Yoga & Budhaditya Yoga Detected
                          </p>
                        </div>
                      )}

                      {/* Personalized Numerology Simulation */}
                      {feature.id === 'numerology' && (
                        <div className="space-y-1.5 max-w-[290px] mx-auto w-full">
                          <div className="flex items-center justify-between text-[11px] font-bold text-[#C9A050]">
                            <span className="flex items-center space-x-1">
                              <Hash className="w-3.5 h-3.5" />
                              <span>Pythagorean Vibrations</span>
                            </span>
                            <span className="text-[9px] text-green-400">Harmonized</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5 text-center">
                            <div className="p-1.5 rounded-lg bg-black/85 border border-[#C9A050]/40">
                              <div className="text-[8px] text-gray-400 uppercase">Life Path</div>
                              <div className="text-base font-bold text-[#C9A050] font-mono">7</div>
                              <div className="text-[7.5px] text-gray-400">Mystic & Seeker</div>
                            </div>
                            <div className="p-1.5 rounded-lg bg-black/85 border border-[#C9A050]/40">
                              <div className="text-[8px] text-gray-400 uppercase">Destiny</div>
                              <div className="text-base font-bold text-amber-400 font-mono">11</div>
                              <div className="text-[7.5px] text-gray-400">Master Illuminator</div>
                            </div>
                            <div className="p-1.5 rounded-lg bg-black/85 border border-[#C9A050]/40">
                              <div className="text-[8px] text-gray-400 uppercase">Soul Urge</div>
                              <div className="text-base font-bold text-[#C9A050] font-mono">3</div>
                              <div className="text-[7.5px] text-gray-400">Creative Spirit</div>
                            </div>
                          </div>
                          <div className="p-1 rounded bg-black/70 border border-white/10 text-[8.5px] text-center text-gray-300">
                            Auspicious Gems: <span className="text-[#C9A050] font-bold">Cat's Eye & Yellow Sapphire</span>
                          </div>
                        </div>
                      )}

                      {/* Life Roadmap Simulation */}
                      {feature.id === 'roadmap' && (
                        <div className="space-y-1.5 max-w-[290px] mx-auto w-full">
                          <div className="flex items-center justify-between text-[11px] font-bold text-[#C9A050]">
                            <span className="flex items-center space-x-1">
                              <Milestone className="w-3.5 h-3.5" />
                              <span>120-Yr Vimshottari Timeline</span>
                            </span>
                            <span className="text-[9px] text-green-400">Active Transit</span>
                          </div>
                          <div className="space-y-1 p-1.5 rounded-lg bg-black/85 border border-[#C9A050]/40 text-[9px]">
                            <div className="flex items-center justify-between p-1 rounded bg-[#C9A050]/20 text-[#C9A050] font-bold">
                              <span>♃ Jupiter Mahadasha</span>
                              <span className="text-[8.5px] text-amber-300">2024 - 2040 (Golden Peak)</span>
                            </div>
                            <div className="flex items-center justify-between p-0.5 px-1 rounded bg-white/5 text-gray-300">
                              <span>├── Venus Antardasha</span>
                              <span className="text-[8.5px] text-green-400">High Wealth</span>
                            </div>
                            <div className="flex items-center justify-between p-0.5 px-1 rounded bg-white/5 text-gray-300">
                              <span>└── Sun Antardasha</span>
                              <span className="text-[8.5px] text-blue-300">Leadership</span>
                            </div>
                          </div>
                          <p className="text-[8.5px] text-center text-amber-300">
                            Inflection Marker: Major Career Elevation in Next 18 Months
                          </p>
                        </div>
                      )}

                      {/* AI Astrologer Pro Simulation */}
                      {feature.id === 'ai-astrologer' && (
                        <div className="space-y-1.5 max-w-[290px] mx-auto w-full">
                          <div className="flex items-center justify-between text-[11px] font-bold text-[#C9A050]">
                            <span className="flex items-center space-x-1">
                              <Bot className="w-3.5 h-3.5" />
                              <span>AI Oracle Dialogue</span>
                            </span>
                            <span className="text-[9px] text-green-400">Streaming Live...</span>
                          </div>
                          <div className="space-y-1 p-2 rounded-lg bg-black/85 border border-[#C9A050]/40 text-[9px]">
                            <div className="text-gray-400 font-mono">Q: When is the best time for tech venture?</div>
                            <div className="p-1.5 rounded bg-[#C9A050]/15 text-gray-200 border-l-2 border-[#C9A050] leading-snug">
                              "Jupiter transit indicates starting between <span className="text-[#C9A050] font-bold">Oct 2026 and Feb 2027</span> yields immense success."
                            </div>
                          </div>
                          <div className="text-[8.5px] text-center text-green-400 font-mono">
                            ✓ Parashara Brihat Hora Shastra Verified
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* SCENE 3 (10-15s): Vedic Synthesis & Final Verdict */}
                  {currentSceneIndex === 3 && (
                    <motion.div
                      key="scene-3"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 flex flex-col items-center justify-center p-3 bg-gradient-to-b from-[#1C180E] via-[#0D0C08] to-black text-center space-y-1.5"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9A050] to-[#8C6B28] text-[#0D0D0F] flex items-center justify-center shadow-md shadow-[#C9A050]/40 animate-pulse">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-xs font-serif font-bold text-[#C9A050] tracking-wide">
                        Full Astrological Report Ready
                      </div>
                      <p className="text-[10px] text-gray-300 max-w-[240px] leading-tight">
                        All celestial dimensions, planetary transits, and remedial gem prescriptions compiled.
                      </p>
                      <div className="px-2.5 py-0.5 rounded-full bg-[#C9A050]/20 border border-[#C9A050]/40 text-[#C9A050] text-[9px] font-bold">
                        🔒 Log in to Unlock Full Access
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Top HUD Badges */}
                <div className="relative z-20 p-2.5 flex items-center justify-between pointer-events-none">
                  <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-[#C9A050]/40 text-[#C9A050] text-[9px] font-bold tracking-wider shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping mr-0.5" />
                    <span>15s DEMO VIDEO</span>
                  </div>
                  <div className="px-1.5 py-0.5 rounded bg-black/80 backdrop-blur text-[9px] font-mono text-white/90 border border-white/20">
                    00:{Math.floor(currentTime).toString().padStart(2, '0')} / 00:15
                  </div>
                </div>

                {/* Bottom Video Controls Bar */}
                <div className="relative z-20 p-2 bg-gradient-to-t from-black/95 via-black/80 to-transparent flex flex-col space-y-1">
                  {/* Progress Bar */}
                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const newPercent = clickX / rect.width;
                      setCurrentTime(+(newPercent * totalDuration).toFixed(1));
                    }}
                    className="w-full bg-white/20 h-1 rounded-full overflow-hidden cursor-pointer relative"
                  >
                    <div
                      className="bg-gradient-to-r from-[#C9A050] to-[#E5C170] h-full transition-all duration-100 ease-linear rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-white text-[11px]">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={togglePlayPause}
                        className="p-0.5 rounded-full hover:bg-white/20 text-[#C9A050] transition cursor-pointer"
                        title={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      </button>
                      <button
                        onClick={handleRestart}
                        className="p-0.5 rounded-full hover:bg-white/20 text-gray-300 hover:text-white transition cursor-pointer"
                        title="Restart 15s Demo"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                      <span className="text-[10px] font-mono text-gray-300">
                        00:{Math.floor(currentTime).toString().padStart(2, '0')} / 00:15
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-0.5 rounded-full hover:bg-white/20 text-gray-300 hover:text-white transition cursor-pointer"
                        title={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                      </button>
                      <span className="text-[8.5px] px-1 py-0.5 rounded bg-[#C9A050]/20 text-[#C9A050] font-bold">
                        HD 1080P
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Specifications Grid (Crystal Clear Contrast) */}
              <div
                style={{
                  backgroundColor: isDark ? '#18181D' : '#F9F7F1',
                  borderColor: isDark ? '#374151' : '#D1D5DB',
                }}
                className="grid grid-cols-2 gap-1.5 p-2 rounded-xl border text-[11px]"
              >
                {feature.specs.map((spec, i) => (
                  <div key={i} className="flex flex-col">
                    <span
                      style={{ color: isDark ? '#9CA3AF' : '#4B5563' }}
                      className="text-[9px] font-bold uppercase tracking-wider"
                    >
                      {spec.label}
                    </span>
                    <span
                      style={{ color: isDark ? '#F59E0B' : '#92400E' }}
                      className="font-bold text-[11px]"
                    >
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column (6 Cols): Ultra High-Contrast, Crystal Clear Typography & Benefits */}
            <div className="lg:col-span-6 flex flex-col space-y-3">
              
              {/* Feature Overview Section */}
              <div>
                <h4
                  style={{ color: isDark ? '#F59E0B' : '#92400E' }}
                  className="text-xs font-black uppercase tracking-wider mb-1.5 flex items-center space-x-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-[#C9A050]" />
                  <span>Feature Overview</span>
                </h4>
                {/* Ultra High Contrast Solid Dark Text (Never light or blurry) */}
                <p
                  style={{ color: isDark ? '#F3F4F6' : '#111827' }}
                  className="text-xs sm:text-[13px] leading-relaxed font-bold"
                >
                  {feature.fullDescription}
                </p>
              </div>

              {/* Key Benefits List (Pure White, Solid Dark Black Text, Crisp Borders) */}
              <div>
                <h4
                  style={{ color: isDark ? '#F59E0B' : '#92400E' }}
                  className="text-xs font-black uppercase tracking-wider mb-2 flex items-center space-x-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-[#C9A050]" />
                  <span>What You Get After Unlocking:</span>
                </h4>
                <div className="space-y-1.5">
                  {feature.keyBenefits.map((benefit, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: isDark ? '#1C1917' : '#FFFFFF',
                        borderColor: isDark ? 'rgba(201,160,80,0.3)' : '#D1D5DB',
                        color: isDark ? '#FFFFFF' : '#000000',
                      }}
                      className="flex items-start space-x-2.5 p-2 px-3 rounded-xl border shadow-sm transition-all"
                    >
                      <CheckCircle2
                        style={{ color: isDark ? '#F59E0B' : '#B45309' }}
                        className="w-4 h-4 shrink-0 mt-0.5"
                      />
                      <span
                        style={{ color: isDark ? '#FFFFFF' : '#000000' }}
                        className="text-xs font-bold leading-snug"
                      >
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Login Gate Action Card (Compact & High-Contrast) */}
              <div
                style={{
                  backgroundColor: isDark ? '#18181D' : '#F9F7F1',
                  borderColor: isDark ? 'rgba(201,160,80,0.4)' : '#D1D5DB',
                }}
                className="p-3 rounded-xl border shadow-sm"
              >
                <div
                  style={{ color: isDark ? '#F59E0B' : '#92400E' }}
                  className="flex items-center space-x-1.5 mb-1 text-xs font-black"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Access Requires Authentication</span>
                </div>
                <p
                  style={{ color: isDark ? '#E5E7EB' : '#1F2937' }}
                  className="text-xs mb-2.5 font-bold leading-snug"
                >
                  Log in with your JyotishVeda account to immediately access full calculations, personalized charts, and AI consults.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onLoginClick();
                    }}
                    className="w-full sm:flex-1 py-2.5 px-3.5 rounded-xl bg-[#C9A050] hover:bg-[#D4AF37] text-black font-black text-xs transition-all shadow-md shadow-[#C9A050]/20 flex items-center justify-center space-x-1.5 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>Log In to Unlock</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      onRegisterClick();
                    }}
                    style={{
                      backgroundColor: isDark ? '#292524' : '#FFFFFF',
                      color: isDark ? '#FFFFFF' : '#111827',
                      borderColor: '#D1D5DB',
                    }}
                    className="w-full sm:w-auto py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all border cursor-pointer hover:border-black shadow-xs"
                  >
                    Create Free Account
                  </button>
                </div>

                <div
                  style={{ color: isDark ? '#9CA3AF' : '#4B5563' }}
                  className="flex items-center justify-center space-x-1.5 mt-2 text-[10px] font-bold"
                >
                  <ShieldCheck
                    style={{ color: isDark ? '#F59E0B' : '#B45309' }}
                    className="w-3 h-3"
                  />
                  <span>Instant access upon authentication • Zero setup fee</span>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
