import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Clock,
  Sparkles,
  Calendar,
  AlertTriangle,
  Flame,
  Volume2,
  CheckCircle2,
  Share2,
  Shield,
  Compass,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { API_ENDPOINTS } from '../config/api_config';
import { UserProfile, PanchangInfo, NumerologyReport } from '../types';

interface DailyHoroscopeViewProps {
  profile: UserProfile;
  panchang: PanchangInfo;
  numerology: NumerologyReport;
  chartData: any;
  onNavigateToTab: (tab: string) => void;
  theme: 'light' | 'dark';
}

interface DailyAiInsights {
  summary: string;
  career: string;
  love: string;
  health: string;
  morning_ritual_title: string;
  morning_ritual_desc: string;
  evening_ritual_title: string;
  evening_ritual_desc: string;
  lucky_color_desc: string;
}

export const DailyHoroscopeView: React.FC<DailyHoroscopeViewProps> = ({
  profile,
  panchang,
  numerology,
  chartData,
  onNavigateToTab,
  theme,
}) => {
  const [aiInsights, setAiInsights] = useState<DailyAiInsights | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const fetchDailyAiReading = async () => {
    setIsLoadingAi(true);
    try {
      const data = await api.post<{ insights: DailyAiInsights }>(API_ENDPOINTS.INSIGHTS.DAILY_HOROSCOPE, {
        profile,
        chartData,
        panchang,
        numerology,
      });
      if (data && data.insights) {
        setAiInsights(data.insights);
      }
    } catch (e) {
      console.error('Failed to fetch AI insights:', e);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSpeech = () => {
    if (!('speechSynthesis' in window)) return;
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }
    if (!aiInsights) return;
    const text = `${aiInsights.summary}. For your career: ${aiInsights.career}. In love and harmony: ${aiInsights.love}. For your health: ${aiInsights.health}.`;
    const clean = text.replace(/[#*`_>-]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsPlayingAudio(false);
    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(
      `Daily Vedic Insight for ${profile.fullName} | JyotishVeda AI:\nTithi: ${panchang.tithi} | Nakshatra: ${panchang.nakshatra}\nAbhijit Muhurta: ${panchang.abhijitMuhurta}`
    );
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const getCosmicHarmony = (score: number) => {
    if (score >= 80) return { title: 'High Pranic Vitality', desc: 'Optimal for key initiatives', color: 'text-[#C9A050]', icon: CheckCircle2 };
    if (score >= 60) return { title: 'Balanced Energy', desc: 'Favorable for routine tasks', color: 'text-[#C9A050]', icon: Sparkles };
    if (score >= 40) return { title: 'Mixed Harmonics', desc: 'Proceed with awareness', color: 'text-orange-400', icon: Compass };
    return { title: 'Low Vitality', desc: 'Avoid major new beginnings', color: 'text-rose-400', icon: AlertTriangle };
  };

  const getLuckyColorDesc = (color: string) => {
    if (!color) return 'Amplifies cosmic harmony';
    const c = color.toLowerCase();
    if (c.includes('red') || c.includes('coral') || c.includes('scarlet')) return 'Amplifies vital energy & action';
    if (c.includes('blue') || c.includes('navy')) return 'Enhances calm focus & depth';
    if (c.includes('green') || c.includes('emerald') || c.includes('pistachio')) return 'Attracts growth & prosperity';
    if (c.includes('yellow') || c.includes('gold') || c.includes('amber')) return 'Boosts wisdom & optimism';
    if (c.includes('white') || c.includes('pearl') || c.includes('silver')) return 'Invokes peace & intuition';
    if (c.includes('grey') || c.includes('brown')) return 'Grounds spiritual energy';
    if (c.includes('black') || c.includes('violet')) return 'Promotes discipline & protection';
    if (c.includes('pink') || c.includes('lilac')) return 'Nurtures compassion & charm';
    return 'Amplifies cosmic harmony';
  };

  const getDailyRituals = (day: number, sunrise: string) => {
    const rituals = [
      { // Sunday (Sun)
        morningTitle: 'Surya Arghya & Gayatri Recitation',
        morningDesc: `Offer pure water in a copper vessel facing East between ${sunrise} and 08:30 AM with a pinch of red kumkum. Recite the Gayatri Mantra 11 or 21 times for mental clarity and life vitality.`,
        eveningTitle: 'Aditya Hrudayam Path',
        eveningDesc: 'Light a ghee diya at dusk. Listen to or recite the Aditya Hrudayam Stotram for health and overcoming obstacles.'
      },
      { // Monday (Moon)
        morningTitle: 'Shiva Lingam Jalabhishekam',
        morningDesc: `Offer water or raw milk with black sesame seeds to a Shiva Lingam in the morning. Chant "Om Namah Shivaya" 108 times for emotional peace.`,
        eveningTitle: 'Chandra Beej Mantra',
        eveningDesc: 'Light a sesame oil diya after sunset. Recite the Chandra Beej Mantra ("Om Shram Shreem Shraum Sah Chandramase Namah") for mental tranquility.'
      },
      { // Tuesday (Mars)
        morningTitle: 'Hanuman Chalisa Recitation',
        morningDesc: `Offer red flowers to Lord Hanuman in the morning. Recite the Hanuman Chalisa to invoke courage, strength, and protection against negative energies.`,
        eveningTitle: 'Rinmochan Mangal Stotram',
        eveningDesc: 'Light a jasmine oil or ghee diya at dusk. Recite the Mangal Stotram to clear debts and calm aggressive Martian energies.'
      },
      { // Wednesday (Mercury)
        morningTitle: 'Ganesha Atharvashirsha',
        morningDesc: `Offer durva grass to Lord Ganesha in the morning. Recite the Ganesha Atharvashirsha for sharp intellect and smooth execution of business plans.`,
        eveningTitle: 'Vishnu Sahasranama',
        eveningDesc: 'Light a ghee diya in the evening. Listen to the Vishnu Sahasranama for financial stability and calm nervous tension.'
      },
      { // Thursday (Jupiter)
        morningTitle: 'Guru Mantra & Yellow Offerings',
        morningDesc: `Wear yellow or apply a turmeric/sandalwood tilak on your forehead. Chant "Om Brihaspataye Namah" 108 times for wisdom and expansion.`,
        eveningTitle: 'Dakshinamurthy Stotram',
        eveningDesc: 'Light a ghee diya at dusk. Meditate upon Lord Dakshinamurthy (the ultimate Guru) for profound spiritual insight and clarity.'
      },
      { // Friday (Venus)
        morningTitle: 'Sri Suktam Path',
        morningDesc: `Offer white flowers or fragrant perfumes to Goddess Lakshmi. Recite the Sri Suktam for luxury, abundance, and harmonious relationships.`,
        eveningTitle: 'Shukra Beej Mantra',
        eveningDesc: 'Light a ghee diya at dusk. Recite the Shukra Beej Mantra ("Om Dram Dreem Draum Sah Shukraya Namah") to enhance magnetism and aesthetic joy.'
      },
      { // Saturday (Saturn)
        morningTitle: 'Shani Mantra & Charity',
        morningDesc: `Offer black sesame seeds and mustard oil to Lord Shani. Feed crows or street dogs to appease karmic blockages.`,
        eveningTitle: 'Maha Mrityunjaya & Shiva Japa',
        eveningDesc: 'Light a mustard oil diya under a Peepal tree or at home at dusk. Recite "Om Tryambakam Yajamahe..." for protection and neutralizing unfavorable transits.'
      }
    ];
    return rituals[day] || rituals[0];
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) return 'Shubh Prabhat'; // Good Morning
    if (hour >= 12 && hour < 17) return 'Shubh Madhyahn'; // Good Afternoon
    if (hour >= 17 && hour < 20) return 'Shubh Sandhya'; // Good Evening
    return 'Shubh Ratri'; // Good Night
  };

  const getIntroText = (score: number) => {
    if (score >= 80) return "Today's planetary harmonics emphasize strategic foresight, purposeful intellect, and harmonious execution.";
    if (score >= 60) return "Today's cosmic transits favor steady progress, routine refinement, and maintaining emotional equilibrium.";
    if (score >= 40) return "Current planetary alignments suggest cautious optimism; unexpected shifts require adaptable and measured responses.";
    return "Today's challenging cosmic energy calls for deep introspection, patience, and avoiding major new commitments.";
  };

  const harmony = getCosmicHarmony(panchang.auspiciousScore);

  return (
    <div className="space-y-6">
      {/* Top Banner: Greeting & Cosmic Alignment Score */}
      <div className={`relative overflow-hidden rounded-xl border p-6 sm:p-8 shadow-2xl ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-white border-[#E5E1D8] text-[#2A2A2E]'}`}>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#C9A050]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-sans font-semibold tracking-widest text-[#C9A050] mb-2 uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {profile.horoscopeSystem === 'western' ? 'Western Tropical' : 'Vedic Sidereal'} Daily Transit • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h1 className={`text-3xl sm:text-4xl font-serif font-bold tracking-tight ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
              {getGreeting()}, <span className="text-[#C9A050] italic">{profile.fullName}</span>
            </h1>
            <p className="text-sm font-sans text-[#9E9A90] mt-2 max-w-2xl leading-relaxed">
              Your natal {profile.horoscopeSystem === 'western' ? 'Ascendant' : 'Lagna'} is <span className={`font-semibold ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'}`}>{chartData?.ascendant?.signName}</span> ({profile.horoscopeSystem === 'western' ? 'Tropical Sayana' : 'Sidereal Nirayana'}) with{' '}
              <span className="font-semibold text-[#C9A050]">Mulank {numerology.mulank}</span> ({numerology.mulankPlanet.split('(')[0]}). 
              {getIntroText(panchang.auspiciousScore)}
            </p>
          </div>

          {/* Alignment Score Meter */}
          <div className={`flex items-center space-x-4 border rounded-xl p-4 shrink-0 shadow-lg ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'}`}>
            <div className="text-center">
              <div className="text-3xl font-serif font-black text-[#C9A050]">{panchang.auspiciousScore}%</div>
              <div className="text-[9px] uppercase font-sans font-bold tracking-widest text-[#9E9A90]">Cosmic Harmony</div>
            </div>
            <div className="h-10 w-[1px] bg-[#2A2A2E]" />
            <div className={`text-xs font-sans space-y-1 ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'}`}>
              <div className={`flex items-center space-x-1.5 font-medium ${harmony.color}`}>
                <harmony.icon className="w-3.5 h-3.5" />
                <span>{harmony.title}</span>
              </div>
              <div className="text-[11px] text-[#9E9A90]">{harmony.desc}</div>
            </div>
          </div>
        </div>

        {/* Quick Auspicious Attributes Strip */}
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
          <div className={`p-3.5 rounded-lg border ${theme === 'dark' ? 'bg-[#1A1A1E]/80 border-[#2A2A2E]' : 'bg-[#F9F7F1]/80 border-[#E5E1D8]'}`}>
            <div className="text-[9px] text-[#9E9A90] uppercase font-sans font-bold tracking-wider">Lucky Number Today</div>
            <div className="text-xl font-serif font-bold text-[#C9A050] mt-0.5">{numerology.luckyNumbers[0] || numerology.mulank}</div>
            <div className="text-[11px] text-[#9E9A90]">Ruled by {numerology.mulankPlanet.split('(')[0]}</div>
          </div>

          <div className={`p-3.5 rounded-lg border ${theme === 'dark' ? 'bg-[#1A1A1E]/80 border-[#2A2A2E]' : 'bg-[#F9F7F1]/80 border-[#E5E1D8]'}`}>
            <div className="text-[9px] text-[#9E9A90] uppercase font-sans font-bold tracking-wider">Lucky Color & Tone</div>
            <div className="text-xl font-serif font-bold text-[#C9A050] mt-0.5">{numerology.luckyColors[0] || 'Golden Saffron'}</div>
            <div className="text-[11px] text-[#9E9A90] line-clamp-1" title={aiInsights?.lucky_color_desc || getLuckyColorDesc(numerology.luckyColors[0])}>
              {aiInsights?.lucky_color_desc || getLuckyColorDesc(numerology.luckyColors[0])}
            </div>
          </div>

          <div className={`p-3.5 rounded-lg border ${theme === 'dark' ? 'bg-[#1A1A1E]/80 border-[#2A2A2E]' : 'bg-[#F9F7F1]/80 border-[#E5E1D8]'}`}>
            <div className="text-[9px] text-[#9E9A90] uppercase font-sans font-bold tracking-wider">Shubh Abhijit Muhurta</div>
            <div className={`text-sm font-sans font-bold mt-1 ${theme === 'dark' ? 'text-emerald-400' : 'text-[#C9A050]'}`}>{panchang.abhijitMuhurta.split('(')[0].trim()}</div>
            <div className="text-[11px] text-[#9E9A90]">
              {panchang.abhijitMuhurta.match(/\(([^)]+)\)/)?.[1] || 'Victory window for tasks'}
            </div>
          </div>

          <div className={`p-3.5 rounded-lg border ${theme === 'dark' ? 'bg-[#1A1A1E]/80 border-[#2A2A2E]' : 'bg-[#F9F7F1]/80 border-[#E5E1D8]'}`}>
            <div className="text-[9px] text-[#9E9A90] uppercase font-sans font-bold tracking-wider">Rahu Kaal (Avoid Starts)</div>
            <div className={`text-sm font-sans font-bold mt-1 ${theme === 'dark' ? 'text-rose-400' : 'text-[#C9A050]'}`}>{panchang.rahuKaal.split('(')[0].trim()}</div>
            <div className="text-[11px] text-[#9E9A90]">
              {panchang.rahuKaal.match(/\(([^)]+)\)/)?.[1] || 'Inauspicious time bracket'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Panchang Deep Dive & Daily AI Horoscope */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Daily AI Insights & Daily Ritual */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Personalized Forecast Card */}
          <div className={`border rounded-xl p-6 shadow-xl ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-white border-[#E5E1D8] text-[#2A2A2E]'}`}>
            <div className={`flex items-center justify-between pb-4 border-b mb-4 ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-[#C9A050]/15 text-[#C9A050] border border-[#C9A050]/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className={`text-xl font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>Daily AI Vedic Horoscope Interpretation</h2>
                  <p className="text-xs font-sans text-[#9E9A90]">Personalized transit synthesis based on your specific birth chart & active dasha</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {aiInsights && (
                  <>
                    <button
                      onClick={handleSpeech}
                      className={`p-2 rounded-lg border transition cursor-pointer text-xs flex items-center space-x-1 ${
                        isPlayingAudio
                          ? 'bg-[#C9A050] text-[#0D0D0F] border-[#C9A050]'
                          : 'bg-[#1A1A1E] text-[#E5E1D8] border-[#2A2A2E] hover:text-white'
                      }`}
                      title="Listen to reading"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span className="hidden sm:inline">{isPlayingAudio ? 'Stop' : 'Listen'}</span>
                    </button>
                    <button
                      onClick={handleShare}
                      className={`p-2 rounded-lg border hover:text-white transition cursor-pointer text-xs flex items-center space-x-1 ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-[#F9F7F1] border-[#E5E1D8] text-[#2A2A2E]'}`}
                      title="Copy & Share"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="hidden sm:inline">{isCopied ? 'Copied!' : 'Share'}</span>
                    </button>
                  </>
                )}

                <button
                  onClick={fetchDailyAiReading}
                  disabled={isLoadingAi}
                  className={`px-3.5 py-2 rounded-lg font-bold text-xs shadow-md transition cursor-pointer flex items-center space-x-1.5 disabled:opacity-50 ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-[#C9A050] to-[#A07828] hover:from-[#D4AF37] hover:to-[#B38730] text-[#0D0D0F] shadow-[#C9A050]/15'
                      : 'bg-[#FFFFFF] border border-[#C9A050]/50 text-[#C9A050] hover:bg-[#C9A050]/10 shadow-[#C9A050]/10'
                  }`}
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin' : ''}`} />
                  <span>{isLoadingAi ? 'Consulting...' : aiInsights ? 'Regenerate Insight' : 'Generate Full AI Reading'}</span>
                </button>
              </div>
            </div>

            {/* Reading Content */}
            {isLoadingAi ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
                <div className="w-9 h-9 border-2 border-[#C9A050] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-[#C9A050] font-serif font-semibold">Consulting Planetary Ephemeris & AI Model...</p>
                <p className="text-[11px] text-[#9E9A90] max-w-sm">Calculating Moon transit, Nakshatra lord aspect, and today’s Tithi vibration for your Ascendant.</p>
              </div>
            ) : aiInsights ? (
              <div className="space-y-4">
                <div className={`prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed space-y-3 whitespace-pre-line p-5 rounded-xl border font-serif ${theme === 'dark' ? 'border-[#2A2A2E] text-[#E5E1D8] bg-[#08080A]' : 'border-[#E5E1D8] text-[#2A2A2E] bg-[#F0ECE1]'}`}>
                  {aiInsights.summary}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className={`p-3.5 /60 rounded-lg border ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'}`}>
                    <span className="text-[9px] uppercase font-sans font-bold tracking-wider text-[#C9A050]">Career & Commerce</span>
                    <p className="text-xs font-sans text-[#9E9A90] mt-1">{aiInsights.career}</p>
                  </div>
                  <div className={`p-3.5 /60 rounded-lg border ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'}`}>
                    <span className="text-[9px] uppercase font-sans font-bold tracking-wider text-[#C9A050]">Love & Harmony</span>
                    <p className="text-xs font-sans text-[#9E9A90] mt-1">{aiInsights.love}</p>
                  </div>
                  <div className={`p-3.5 /60 rounded-lg border ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'}`}>
                    <span className="text-[9px] uppercase font-sans font-bold tracking-wider text-[#C9A050]">Health & Prana</span>
                    <p className="text-xs font-sans text-[#9E9A90] mt-1">{aiInsights.health}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border space-y-2 ${theme === 'dark' ? 'bg-[#1A1A1E]/80 border-[#2A2A2E]' : 'bg-[#F9F7F1]/80 border-[#E5E1D8]'}`}>
                  <div className="text-sm font-serif font-semibold text-[#C9A050] flex items-center space-x-2">
                    <Sun className="w-4 h-4 text-[#C9A050]" />
                    <span>Today’s Dominant Cosmic Rhythm: {panchang.tithi} in {panchang.nakshatra}</span>
                  </div>
                  <p className={`text-xs font-sans leading-relaxed ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'}`}>
                    {panchang.auspiciousScore >= 80 ? "The Moon traverses through highly auspicious degrees today, stimulating sharp communication, favorable business contracts, and relationship harmony." 
                    : panchang.auspiciousScore >= 60 ? "Planetary aspects indicate a balanced rhythm today. Steady progress is favored over risky leaps, maintaining equilibrium in daily affairs."
                    : panchang.auspiciousScore >= 40 ? "Mixed cosmic influences suggest proceeding with awareness. Unexpected shifts might require adaptable responses rather than rigid plans."
                    : "Current planetary transits suggest a phase of introspection and caution. It is a day to lay low, conserve energy, and avoid unnecessary conflicts."}
                    {" "}Maintain an even temperament during the Rahu Kaal window ({panchang.rahuKaal.split('(')[0].trim()}).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className={`p-3.5 /60 rounded-lg border ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'}`}>
                    <span className="text-[9px] uppercase font-sans font-bold tracking-wider text-[#C9A050]">Career & Commerce</span>
                    <p className="text-xs font-sans text-[#9E9A90] mt-1">
                      {panchang.auspiciousScore >= 80 ? "Excellent for structured negotiations, strategy decks, and leadership decisions."
                      : panchang.auspiciousScore >= 60 ? "Good for routine administrative tasks and organizing future workflows."
                      : panchang.auspiciousScore >= 40 ? "Avoid finalizing major contracts today. Focus on reviewing details instead."
                      : "Not ideal for initiating new ventures. Focus on clearing backlogs silently."}
                    </p>
                  </div>
                  <div className={`p-3.5 /60 rounded-lg border ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'}`}>
                    <span className="text-[9px] uppercase font-sans font-bold tracking-wider text-[#C9A050]">Love & Harmony</span>
                    <p className="text-xs font-sans text-[#9E9A90] mt-1">
                      {panchang.auspiciousScore >= 80 ? "Nurturing dialogue resolves past hesitations; evening hours favor quiet companionship."
                      : panchang.auspiciousScore >= 60 ? "Mutual understanding grows through patient listening and shared domestic activities."
                      : panchang.auspiciousScore >= 40 ? "Potential for minor misunderstandings. Practice clear and gentle communication."
                      : "Give space to loved ones. Solitude might be more restorative than socializing today."}
                    </p>
                  </div>
                  <div className={`p-3.5 /60 rounded-lg border ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'}`}>
                    <span className="text-[9px] uppercase font-sans font-bold tracking-wider text-[#C9A050]">Health & Prana</span>
                    <p className="text-xs font-sans text-[#9E9A90] mt-1">
                      {panchang.auspiciousScore >= 80 ? "High stamina; hydrate with warm herbal infusions to balance Pitta-Vata energy."
                      : panchang.auspiciousScore >= 60 ? "Stable energy levels; gentle yoga or evening walks are highly recommended."
                      : panchang.auspiciousScore >= 40 ? "Energy may fluctuate. Ensure adequate rest and avoid heavy, rich meals."
                      : "Vitality is lower than usual. Prioritize deep rest and grounding practices."}
                    </p>
                  </div>
                </div>

                <button
                  onClick={fetchDailyAiReading}
                  className="w-full py-3 rounded-lg border border-[#C9A050]/40 bg-[#C9A050]/10 hover:bg-[#C9A050]/20 text-[#C9A050] text-xs font-sans font-semibold flex items-center justify-center space-x-2 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Click to Unlock Comprehensive AI Vedic Deep-Dive Reading</span>
                </button>
              </div>
            )}
          </div>

          {/* Daily Vedic Sadhana & Upaya Card */}
          <div className={`border rounded-xl p-6 shadow-xl ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-white border-[#E5E1D8] text-[#2A2A2E]'}`}>
            <div className="flex items-center space-x-2 text-[#C9A050] font-serif font-bold text-base mb-3">
              <Flame className="w-4 h-4" />
              <span>Recommended Daily Vedic Ritual (Nitya Sadhana)</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#1A1A1E]/80 border-[#2A2A2E]' : 'bg-[#F9F7F1]/80 border-[#E5E1D8]'}`}>
                <span className="text-[9px] uppercase font-sans font-bold text-[#C9A050] tracking-widest">Morning Sadhana</span>
                <h4 className={`text-sm font-serif font-bold mt-1 ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                  {aiInsights?.morning_ritual_title || getDailyRituals(new Date().getDay(), panchang.sunrise).morningTitle}
                </h4>
                <p className="text-xs font-sans text-[#9E9A90] mt-1 leading-relaxed">
                  {aiInsights?.morning_ritual_desc || getDailyRituals(new Date().getDay(), panchang.sunrise).morningDesc}
                </p>
              </div>

              <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#1A1A1E]/80 border-[#2A2A2E]' : 'bg-[#F9F7F1]/80 border-[#E5E1D8]'}`}>
                <span className="text-[9px] uppercase font-sans font-bold text-[#C9A050] tracking-widest">Evening Sadhana</span>
                <h4 className={`text-sm font-serif font-bold mt-1 ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                  {aiInsights?.evening_ritual_title || getDailyRituals(new Date().getDay(), panchang.sunrise).eveningTitle}
                </h4>
                <p className="text-xs font-sans text-[#9E9A90] mt-1 leading-relaxed">
                  {aiInsights?.evening_ritual_desc || getDailyRituals(new Date().getDay(), panchang.sunrise).eveningDesc}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Complete Vedic Panchang Breakdown & Fast Actions */}
        <div className="space-y-6">
          {/* Panchang Deep Dive Card */}
          <div className={`border rounded-xl p-6 shadow-xl ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-white border-[#E5E1D8] text-[#2A2A2E]'}`}>
            <div className={`flex items-center justify-between pb-3 border-b mb-4 ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-[#C9A050]" />
                <h3 className={`text-base font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>Sacred Panchang Parameters</h3>
              </div>
              <span className="text-[10px] font-sans text-[#C9A050]/80 font-medium">Sidereal Vedic</span>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div className={`flex justify-between items-center py-1.5 border-b /60 ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
                <span className="text-[#9E9A90]">Tithi (Lunar Day)</span>
                <span className={`font-semibold text-right ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>{panchang.tithi}</span>
              </div>
              <div className={`flex justify-between items-center py-1.5 border-b /60 ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
                <span className="text-[#9E9A90]">Nakshatra (Asterism)</span>
                <span className={`font-semibold text-right font-serif ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>{panchang.nakshatra}</span>
              </div>
              <div className={`flex justify-between items-center py-1.5 border-b /60 ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
                <span className="text-[#9E9A90]">Vedic Yoga</span>
                <span className={`font-semibold text-right ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>{panchang.yoga}</span>
              </div>
              <div className={`flex justify-between items-center py-1.5 border-b /60 ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
                <span className="text-[#9E9A90]">Karana (Half Tithi)</span>
                <span className={`font-semibold text-right ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>{panchang.karana}</span>
              </div>
              <div className={`flex justify-between items-center py-1.5 border-b /60 ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
                <span className="text-[#9E9A90]">Sun Sign (Surya Rashi)</span>
                <span className={`font-semibold text-right ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>{panchang.solarSign}</span>
              </div>
              <div className={`flex justify-between items-center py-1.5 border-b /60 ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
                <span className="text-[#9E9A90]">Moon Sign (Chandra Rashi)</span>
                <span className={`font-semibold text-right font-serif ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>{panchang.lunarSign}</span>
              </div>
              <div className={`flex justify-between items-center py-1.5 border-b /60 ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
                <span className="text-[#9E9A90]">Sunrise / Sunset</span>
                <span className={`font-semibold text-right ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>{panchang.sunrise} / {panchang.sunset}</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-[#9E9A90]">Brahma Muhurta</span>
                <span className={`font-semibold text-right ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>{panchang.brahmaMuhurta}</span>
              </div>
            </div>
          </div>

          {/* Quick Nav Cards */}
          <div className={`border rounded-xl p-5 shadow-xl space-y-3 ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-white border-[#E5E1D8] text-[#2A2A2E]'}`}>
            <h3 className="text-xs font-sans font-bold text-[#C9A050] uppercase tracking-wider">Explore Your Vedic Blueprint</h3>
            
            <button
              onClick={() => onNavigateToTab('horoscope')}
              className={`w-full text-left p-3 rounded-lg hover:bg-[#1E1E24] border transition cursor-pointer flex items-center justify-between group ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'}`}
            >
              <div>
                <div className={`text-xs font-semibold group-hover:text-[#C9A050] transition ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>5 Indian Ancient Traditions</div>
                <div className="text-[11px] text-[#9E9A90]">Parashari, Jaimini, Lal Kitab, KP & Nadi</div>
              </div>
              <Compass className="w-4 h-4 text-[#C9A050] group-hover:translate-x-0.5 transition" />
            </button>

            <button
              onClick={() => onNavigateToTab('counsellor')}
              className={`w-full text-left p-3 rounded-lg hover:bg-[#1E1E24] border transition cursor-pointer flex items-center justify-between group ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'}`}
            >
              <div>
                <div className={`text-xs font-semibold group-hover:text-[#C9A050] transition ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>Interactive AI Astrologer</div>
                <div className="text-[11px] text-[#9E9A90]">Counselling grounded in your exact birth chart</div>
              </div>
              <Sparkles className="w-4 h-4 text-[#C9A050] group-hover:translate-x-0.5 transition" />
            </button>

            <button
              onClick={() => onNavigateToTab('roadmap')}
              className={`w-full text-left p-3 rounded-lg hover:bg-[#1E1E24] border transition cursor-pointer flex items-center justify-between group ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'}`}
            >
              <div>
                <div className={`text-xs font-semibold group-hover:text-[#C9A050] transition ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>Personal & Career Roadmap</div>
                <div className="text-[11px] text-[#9E9A90]">10-Year milestone forecasts & dasha windows</div>
              </div>
              <Zap className="w-4 h-4 text-[#C9A050] group-hover:translate-x-0.5 transition" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
