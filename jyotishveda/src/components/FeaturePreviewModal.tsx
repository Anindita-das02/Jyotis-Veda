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
  TrendingUp,
  Award,
  Layers,
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
      'Unlock deep celestial insights with high-precision Swiss Ephemeris calculations. Our Deep Birth Chart engine computes your Lagna (Ascendant), Rashi (Moon sign), Bhava Chalit, and D9 Navamsha charts with exact planetary longitudes, retrograde motions, combustion states, and planetary dignities (Exalted, Moolatrikona, Debilitated).',
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
      'Experience an exhaustive numerological synthesis combining ancient Chaldean vibrations and modern Pythagorean matrices. Calculate your Life Path, Destiny/Expression, Soul Urge (Hearts Desire), Personality numbers, and personal year cycles to uncover your hidden strengths, lucky dates, auspicious colors, and ideal gemstones.',
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
      'Map your entire lifetime destiny across the 120-year Vimshottari Mahadasha and Antardasha cycles. Identify upcoming golden windows for career promotions, wealth generation, marriage timing, and spiritual awakening. Track key transit impacts like Saturn Sade Sati, Jupiter returns, and Rahu-Ketu nodal shifts.',
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
      'Engage in real-time personalized dialogues with our state-of-the-art AI Astrological Oracle. Synthesizing Brihat Parashara Hora Shastra, Jaimini Sutras, and planetary transits, the AI Counsellor provides empathetic, deeply personalized counsel on career paths, romantic relationships, business decisions, and remedial rituals without any message limits.',
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
  const totalDuration = 15; // 15 seconds continuous video preview
  const intervalRef = useRef<any>(null);

  // 15-second timer simulator for multi-scene dynamic video demo
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
            return 0; // Loop back continuously
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
      <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className={`w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden my-auto flex flex-col ${
            isDark
              ? 'bg-[#121216] border-[#C9A050]/40 text-[#E5E1D8]'
              : 'bg-[#FCFAF7] border-[#C9A050]/40 text-[#1C1917]'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Bar Header */}
          <div className="p-4 sm:p-5 border-b border-[#C9A050]/20 flex items-center justify-between bg-gradient-to-r from-[#C9A050]/15 via-transparent to-transparent">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C9A050] to-[#8C6B28] text-[#0D0D0F] flex items-center justify-center shadow-md shadow-[#C9A050]/30 shrink-0">
                <Icon className="w-5 h-5 font-bold" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-[#8C6B28] dark:text-[#C9A050]">
                    {feature.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C9A050]/20 text-[#8C6B28] dark:text-[#E5C170] border border-[#C9A050]/40">
                    Premium Feature
                  </span>
                </div>
                <p className="text-xs text-[#78716C] dark:text-[#9E9A90] font-medium">{feature.subtitle}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isDark
                  ? 'hover:bg-white/10 text-gray-400 hover:text-white'
                  : 'hover:bg-black/10 text-gray-700 hover:text-black'
              }`}
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body: 2 Columns on Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 sm:p-6 overflow-y-auto max-h-[calc(85vh-130px)]">
            
            {/* Left Column (6 Cols): Multi-Scene 15s Continuous Video Demonstration */}
            <div className="lg:col-span-6 flex flex-col space-y-4">
              
              {/* Scene Indicator Pills */}
              <div className="flex items-center justify-between gap-1 text-[10px] font-bold">
                <div className={`flex-1 py-1 px-1.5 rounded-md text-center border transition-all ${
                  currentSceneIndex === 1
                    ? 'bg-[#C9A050] text-[#0D0D0F] border-[#C9A050] shadow-xs'
                    : isDark ? 'bg-white/5 border-transparent text-gray-400' : 'bg-black/5 border-transparent text-gray-700'
                }`}>
                  1. Ephemeris Scan
                </div>
                <div className={`flex-1 py-1 px-1.5 rounded-md text-center border transition-all ${
                  currentSceneIndex === 2
                    ? 'bg-[#C9A050] text-[#0D0D0F] border-[#C9A050] shadow-xs'
                    : isDark ? 'bg-white/5 border-transparent text-gray-400' : 'bg-black/5 border-transparent text-gray-700'
                }`}>
                  2. Live Computation
                </div>
                <div className={`flex-1 py-1 px-1.5 rounded-md text-center border transition-all ${
                  currentSceneIndex === 3
                    ? 'bg-[#C9A050] text-[#0D0D0F] border-[#C9A050] shadow-xs'
                    : isDark ? 'bg-white/5 border-transparent text-gray-400' : 'bg-black/5 border-transparent text-gray-700'
                }`}>
                  3. Vedic Synthesis
                </div>
              </div>

              {/* Video Player Container */}
              <div className="relative rounded-2xl overflow-hidden border border-[#C9A050]/40 bg-[#0A0A0C] aspect-[4/3] flex flex-col justify-between group shadow-xl">
                
                {/* DYNAMIC MULTI-SCENE VISUAL CANVAS */}
                <div className="absolute inset-0 overflow-hidden">
                  
                  {/* SCENE 1 (0-5s): Cosmic Ephemeris Scanning */}
                  {currentSceneIndex === 1 && (
                    <motion.div
                      key="scene-1"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#14120B] via-[#0A0A0C] to-black"
                    >
                      <img
                        src="/golden_zodiac_wheel.jpg"
                        alt="Zodiac Scanning"
                        className="absolute inset-0 w-full h-full object-cover opacity-35 filter brightness-90 animate-spin"
                        style={{ animationDuration: '40s' }}
                      />
                      <div className="absolute inset-0 bg-radial from-transparent to-black/90" />
                      
                      {/* Scanning HUD Overlay */}
                      <div className="relative z-10 text-center space-y-2 max-w-[280px]">
                        <div className="w-12 h-12 mx-auto rounded-full border-2 border-[#C9A050] border-t-transparent animate-spin flex items-center justify-center">
                          <Activity className="w-5 h-5 text-[#C9A050]" />
                        </div>
                        <div className="text-xs font-mono font-bold text-[#C9A050] tracking-wider uppercase">
                          Scanning Planetary Longitudes
                        </div>
                        <div className="p-2 rounded-lg bg-black/75 border border-[#C9A050]/30 font-mono text-[10px] text-gray-300 text-left space-y-0.5">
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
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 flex flex-col justify-center p-4 bg-gradient-to-b from-[#18150E] via-[#0E0D0A] to-black"
                    >
                      {/* Deep Birth Chart Simulation */}
                      {feature.id === 'birth-chart' && (
                        <div className="space-y-2 max-w-[300px] mx-auto w-full">
                          <div className="flex items-center justify-between text-xs font-bold text-[#C9A050]">
                            <span className="flex items-center space-x-1">
                              <Compass className="w-3.5 h-3.5" />
                              <span>D1 Rashi & D9 Navamsha</span>
                            </span>
                            <span className="text-[10px] text-green-400">100% Calculated</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-black/80 border border-[#C9A050]/40 text-[10px] text-center font-mono">
                            <div className="p-1.5 rounded bg-[#C9A050]/15 text-[#C9A050] font-bold border border-[#C9A050]/30">Lagna: Leo</div>
                            <div className="p-1.5 rounded bg-white/5 text-gray-300">2H: Virgo</div>
                            <div className="p-1.5 rounded bg-white/5 text-gray-300">3H: Libra</div>
                            <div className="p-1.5 rounded bg-white/5 text-gray-300">4H: Scorpio</div>
                            <div className="p-1.5 rounded bg-gradient-to-r from-[#C9A050]/30 to-[#8C6B28]/30 font-bold text-white border border-[#C9A050]/50">D9 Guru</div>
                            <div className="p-1.5 rounded bg-white/5 text-gray-300">6H: Cap</div>
                            <div className="p-1.5 rounded bg-white/5 text-gray-300">7H: Aqua</div>
                            <div className="p-1.5 rounded bg-white/5 text-gray-300">8H: Pisces</div>
                            <div className="p-1.5 rounded bg-[#C9A050]/15 text-[#C9A050] font-bold">10H: Taurus</div>
                          </div>
                          <p className="text-[10px] text-center text-gray-400">
                            ★ Gaja Kesari Yoga & Budhaditya Yoga Detected
                          </p>
                        </div>
                      )}

                      {/* Personalized Numerology Simulation */}
                      {feature.id === 'numerology' && (
                        <div className="space-y-2 max-w-[300px] mx-auto w-full">
                          <div className="flex items-center justify-between text-xs font-bold text-[#C9A050]">
                            <span className="flex items-center space-x-1">
                              <Hash className="w-3.5 h-3.5" />
                              <span>Pythagorean Vibrations</span>
                            </span>
                            <span className="text-[10px] text-green-400">Harmonized</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-2 rounded-xl bg-black/80 border border-[#C9A050]/40">
                              <div className="text-[9px] text-gray-400 uppercase">Life Path</div>
                              <div className="text-lg font-bold text-[#C9A050] font-mono">7</div>
                              <div className="text-[8px] text-gray-400">Mystic & Seeker</div>
                            </div>
                            <div className="p-2 rounded-xl bg-black/80 border border-[#C9A050]/40">
                              <div className="text-[9px] text-gray-400 uppercase">Destiny</div>
                              <div className="text-lg font-bold text-amber-400 font-mono">11</div>
                              <div className="text-[8px] text-gray-400">Master Illuminator</div>
                            </div>
                            <div className="p-2 rounded-xl bg-black/80 border border-[#C9A050]/40">
                              <div className="text-[9px] text-gray-400 uppercase">Soul Urge</div>
                              <div className="text-lg font-bold text-[#C9A050] font-mono">3</div>
                              <div className="text-[8px] text-gray-400">Creative Spirit</div>
                            </div>
                          </div>
                          <div className="p-1.5 rounded-lg bg-black/60 border border-white/10 text-[9px] text-center text-gray-300">
                            Auspicious Gems: <span className="text-[#C9A050] font-bold">Cat's Eye & Yellow Sapphire</span>
                          </div>
                        </div>
                      )}

                      {/* Life Roadmap Simulation */}
                      {feature.id === 'roadmap' && (
                        <div className="space-y-2 max-w-[300px] mx-auto w-full">
                          <div className="flex items-center justify-between text-xs font-bold text-[#C9A050]">
                            <span className="flex items-center space-x-1">
                              <Milestone className="w-3.5 h-3.5" />
                              <span>120-Yr Vimshottari Timeline</span>
                            </span>
                            <span className="text-[10px] text-green-400">Active Transit</span>
                          </div>
                          <div className="space-y-1.5 p-2 rounded-xl bg-black/80 border border-[#C9A050]/40 text-[10px]">
                            <div className="flex items-center justify-between p-1 rounded bg-[#C9A050]/20 text-[#C9A050] font-bold">
                              <span>♃ Jupiter Mahadasha</span>
                              <span className="text-[9px] text-amber-300">2024 - 2040 (Golden Peak)</span>
                            </div>
                            <div className="flex items-center justify-between p-1 rounded bg-white/5 text-gray-300">
                              <span>├── Venus Antardasha</span>
                              <span className="text-[9px] text-green-400">High Wealth Expansion</span>
                            </div>
                            <div className="flex items-center justify-between p-1 rounded bg-white/5 text-gray-300">
                              <span>└── Sun Antardasha</span>
                              <span className="text-[9px] text-blue-300">Executive Leadership</span>
                            </div>
                          </div>
                          <p className="text-[9px] text-center text-amber-300">
                            Inflection Marker: Major Career Elevation in Next 18 Months
                          </p>
                        </div>
                      )}

                      {/* AI Astrologer Pro Simulation */}
                      {feature.id === 'ai-astrologer' && (
                        <div className="space-y-2 max-w-[300px] mx-auto w-full">
                          <div className="flex items-center justify-between text-xs font-bold text-[#C9A050]">
                            <span className="flex items-center space-x-1">
                              <Bot className="w-3.5 h-3.5" />
                              <span>AI Oracle Dialogue</span>
                            </span>
                            <span className="text-[10px] text-green-400">Streaming Live...</span>
                          </div>
                          <div className="space-y-1.5 p-2.5 rounded-xl bg-black/85 border border-[#C9A050]/40 text-[10px]">
                            <div className="text-gray-400 font-mono">Q: When is the best time for my tech venture?</div>
                            <div className="p-2 rounded bg-[#C9A050]/15 text-gray-200 border-l-2 border-[#C9A050] leading-relaxed">
                              "According to your 10th House lord Venus and current Jupiter transit, starting between <span className="text-[#C9A050] font-bold">Oct 2026 and Feb 2027</span> yields immense global recognition."
                            </div>
                          </div>
                          <div className="text-[9px] text-center text-green-400 font-mono">
                            ✓ Parashara Brihat Hora Shastra Context Verified
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
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#1C180E] via-[#0D0C08] to-black text-center space-y-2.5"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C9A050] to-[#8C6B28] text-[#0D0D0F] flex items-center justify-center shadow-lg shadow-[#C9A050]/40 animate-pulse">
                        <Award className="w-6 h-6" />
                      </div>
                      <div className="text-sm font-serif font-bold text-[#C9A050] tracking-wide">
                        Full Astrological Report Ready
                      </div>
                      <p className="text-[11px] text-gray-300 max-w-[260px] leading-snug">
                        All celestial dimensions, planetary transits, and remedial gem prescriptions are compiled.
                      </p>
                      <div className="px-3 py-1 rounded-full bg-[#C9A050]/20 border border-[#C9A050]/40 text-[#C9A050] text-[10px] font-bold">
                        🔒 Log in to Unlock Full Access
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Top HUD Badges */}
                <div className="relative z-20 p-3 flex items-center justify-between pointer-events-none">
                  <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#C9A050]/40 text-[#C9A050] text-[10px] font-bold tracking-wider shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping mr-0.5" />
                    <span>15s DEMO VIDEO</span>
                  </div>
                  <div className="px-2 py-0.5 rounded bg-black/75 backdrop-blur text-[10px] font-mono text-white/90 border border-white/20">
                    00:{Math.floor(currentTime).toString().padStart(2, '0')} / 00:15
                  </div>
                </div>

                {/* Bottom Video Controls Bar */}
                <div className="relative z-20 p-3 bg-gradient-to-t from-black/95 via-black/80 to-transparent flex flex-col space-y-2">
                  {/* Progress Bar */}
                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const newPercent = clickX / rect.width;
                      setCurrentTime(+(newPercent * totalDuration).toFixed(1));
                    }}
                    className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden cursor-pointer relative"
                  >
                    <div
                      className="bg-gradient-to-r from-[#C9A050] to-[#E5C170] h-full transition-all duration-100 ease-linear rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-white text-xs">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={togglePlayPause}
                        className="p-1 rounded-full hover:bg-white/20 text-[#C9A050] transition cursor-pointer"
                        title={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                      </button>
                      <button
                        onClick={handleRestart}
                        className="p-1 rounded-full hover:bg-white/20 text-gray-300 hover:text-white transition cursor-pointer"
                        title="Restart 15s Demo"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[11px] font-mono text-gray-300">
                        00:{Math.floor(currentTime).toString().padStart(2, '0')} / 00:15
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-1 rounded-full hover:bg-white/20 text-gray-300 hover:text-white transition cursor-pointer"
                        title={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#C9A050]/20 text-[#C9A050] font-bold">
                        HD 1080P
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Specifications Grid (Crystal Clear Contrast) */}
              <div className={`grid grid-cols-2 gap-2 p-3 rounded-xl border text-xs ${
                isDark ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-white border-[#D4CFC4] shadow-xs'
              }`}>
                {feature.specs.map((spec, i) => (
                  <div key={i} className="flex flex-col">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-[#9E9A90]' : 'text-[#78716C]'}`}>{spec.label}</span>
                    <span className={`font-bold text-xs ${isDark ? 'text-[#C9A050]' : 'text-[#8C6B28]'}`}>{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column (6 Cols): Detailed Feature Overview & High-Contrast Checklist */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3.5">
                <div>
                  <h4 className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-[#C9A050]' : 'text-[#8C6B28]'}`}>
                    Feature Overview
                  </h4>
                  {/* High Contrast, Crystal Clear Text */}
                  <p className={`text-xs sm:text-sm leading-relaxed font-normal ${isDark ? 'text-[#E5E1D8]' : 'text-gray-900'}`}>
                    {feature.fullDescription}
                  </p>
                </div>

                {/* Key Benefits List (Sharp, Distinct Cards) */}
                <div>
                  <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-[#C9A050]' : 'text-[#8C6B28]'}`}>
                    What You Get After Unlocking:
                  </h4>
                  <div className="space-y-2">
                    {feature.keyBenefits.map((benefit, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start space-x-2.5 p-2.5 rounded-xl border transition-all ${
                          isDark
                            ? 'bg-[#181611]/80 border-[#C9A050]/25 hover:border-[#C9A050]/50'
                            : 'bg-white border-[#D4CFC4] hover:border-[#C9A050]/50 shadow-xs'
                        }`}
                      >
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isDark ? 'text-[#C9A050]' : 'text-[#8C6B28]'}`} />
                        <span className={`text-xs font-semibold leading-snug ${isDark ? 'text-[#E5E1D8]' : 'text-gray-900'}`}>
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Login Gate Action Card */}
              <div className={`p-4 rounded-xl border mt-3 ${
                isDark
                  ? 'bg-gradient-to-br from-[#1C1A14] to-[#121216] border-[#C9A050]/35'
                  : 'bg-gradient-to-br from-[#FDFBF7] to-[#F5EFE0] border-[#C9A050]/40 shadow-sm'
              }`}>
                <div className={`flex items-center space-x-2 mb-1.5 text-xs font-bold ${isDark ? 'text-[#C9A050]' : 'text-[#8C6B28]'}`}>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Access Requires Authentication</span>
                </div>
                <p className={`text-xs mb-3 font-medium ${isDark ? 'text-[#9E9A90]' : 'text-[#57534E]'}`}>
                  Log in with your JyotishVeda account to immediately access full calculations, personalized charts, and AI consults.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onLoginClick();
                    }}
                    className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#C9A050] hover:bg-[#D4AF37] text-[#0D0D0F] font-bold text-xs sm:text-sm transition-all shadow-md shadow-[#C9A050]/30 flex items-center justify-center space-x-2 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>Log In to Unlock</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      onRegisterClick();
                    }}
                    className={`w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      isDark
                        ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8] hover:border-[#C9A050] hover:text-[#C9A050]'
                        : 'bg-white border-[#D4CFC4] text-[#1C1917] hover:border-[#C9A050] hover:text-[#8C6B28]'
                    }`}
                  >
                    Create Free Account
                  </button>
                </div>

                <div className="flex items-center justify-center space-x-2 mt-2.5 text-[10px] text-[#78716C] dark:text-[#9E9A90] font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#8C6B28] dark:text-[#C9A050]" />
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
