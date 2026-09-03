import React, { useState, useEffect } from 'react';
import {
  Hash,
  Sparkles,
  Grid,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  Layers,
  ArrowRight,
  RefreshCw,
  Sliders,
  Shield,
  Flame,
  CloudUpload,
  Loader2,
} from 'lucide-react';
import { UserProfile, NumerologyReport } from '../types';
import { CHALDEAN_VALUES, reduceToSingleDigit } from '../services/astroEngine';
import { saveNumerologyReport } from '../services/numerologyApi';
import { ApiError, api } from '../services/api';
import { API_ENDPOINTS } from '../config/api_config';

interface NumerologyViewProps {
  profile: UserProfile;
  numerology: NumerologyReport;
  isAuthenticated?: boolean;
}

export const NumerologyView: React.FC<NumerologyViewProps> = ({
  profile,
  numerology,
  isAuthenticated,
}) => {
  const [testName, setTestName] = useState(profile.fullName);
  
  const [backendData, setBackendData] = useState<NumerologyReport | null>(null);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const fetchBackendData = async () => {
      setIsAiLoading(true);
      try {
        // Fetch math/calc data from backend
        const calcData = await api.post<any>('/numerology/calculate', {
          fullName: profile.fullName,
          birthDate: profile.birthDate
        });
        
        if (calcData && calcData.data) {
          setBackendData(calcData.data);
          
          // Then fetch AI insights
          const missingNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => !calcData.data.loShuGrid[n]);
          const aiData = await api.post<any>(API_ENDPOINTS.NUMEROLOGY.AI_INSIGHTS, {
            mulank: calcData.data.mulank,
            bhagyank: calcData.data.bhagyank,
            namank: calcData.data.namankChaldean,
            missingNumbers,
            language: 'en'
          });
          
          if (aiData) setAiInsights(aiData);
        }
      } catch (e) {
        console.error('Failed to fetch Numerology data', e);
      } finally {
        setIsAiLoading(false);
      }
    };
    fetchBackendData();
  }, [profile.fullName, profile.birthDate]);

  const activeNumerology = backendData || numerology;
  const [activeTab, setActiveTab] = useState<'matrix' | 'loshu' | 'name_correction' | 'remedies'>('matrix');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSaveReport = async () => {
    setSaveState('saving');
    setSaveError(null);
    try {
      await saveNumerologyReport(profile.id, activeNumerology, profile);
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2500);
    } catch (err) {
      setSaveState('error');
      setSaveError(err instanceof ApiError ? err.message : 'Could not save report');
    }
  };

  // Calculate dynamic Chaldean value for test name
  const cleanTestName = testName.toUpperCase().replace(/[^A-Z]/g, '');
  let testChaldeanSum = 0;
  for (const ch of cleanTestName) {
    testChaldeanSum += CHALDEAN_VALUES[ch] || 0;
  }
  const testChaldeanSingle = reduceToSingleDigit(testChaldeanSum);

  // Standard 3x3 Lo Shu layout positions
  // Top Row: 4, 9, 2
  // Mid Row: 3, 5, 7
  // Bot Row: 8, 1, 6
  const loShuPositions = [
    [4, 9, 2],
    [3, 5, 7],
    [8, 1, 6],
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#2A2A2E]">
          <div>
            <div className="flex items-center space-x-2 text-xs font-sans font-semibold tracking-widest text-[#C9A050] uppercase mb-1">
              <Hash className="w-4 h-4" />
              <span>Vedic & Chaldean Numerology Matrix</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F0ECE1]">
              Sacred Numbers & Lo Shu Magic Grid
            </h1>
            <p className="text-xs font-sans text-[#9E9A90] mt-1 leading-relaxed">
              Decode the planetary vibrational codes governing your psyche (Mulank), karmic destiny (Bhagyank), and name resonance (Namank).
            </p>
          </div>

          {/* Core Numbers Badges */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="text-center bg-[#1A1A1E] border border-[#C9A050]/30 px-3.5 py-2 rounded-xl">
              <div className="text-[9px] uppercase font-sans font-bold text-[#9E9A90] tracking-wider">Mulank (Psychic)</div>
              <div className="text-2xl font-serif font-bold text-[#C9A050]">{activeNumerology.mulank}</div>
            </div>
            <div className="text-center bg-[#1A1A1E] border border-[#C9A050]/30 px-3.5 py-2 rounded-xl">
              <div className="text-[9px] uppercase font-sans font-bold text-[#9E9A90] tracking-wider">Bhagyank (Destiny)</div>
              <div className="text-2xl font-serif font-bold text-[#C9A050]">{activeNumerology.bhagyank}</div>
            </div>
            <div className="text-center bg-[#1A1A1E] border border-[#C9A050]/30 px-3.5 py-2 rounded-xl">
              <div className="text-[9px] uppercase font-sans font-bold text-[#9E9A90] tracking-wider">Namank (Name)</div>
              <div className="text-2xl font-serif font-bold text-[#C9A050]">{activeNumerology.namankChaldean}</div>
            </div>

            {isAuthenticated && (
              <button
                onClick={handleSaveReport}
                disabled={saveState === 'saving'}
                title={saveError || 'Save this report to your account'}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer shrink-0 ${
                  saveState === 'saved'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                    : saveState === 'error'
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                    : 'bg-[#1A1A1E] border-[#2A2A2E] text-[#C9A050] hover:border-[#C9A050]/50'
                }`}
              >
                {saveState === 'saving' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : saveState === 'saved' ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : saveState === 'error' ? (
                  <AlertCircle className="w-3.5 h-3.5" />
                ) : (
                  <CloudUpload className="w-3.5 h-3.5" />
                )}
                <span>
                  {saveState === 'saving'
                    ? 'Saving...'
                    : saveState === 'saved'
                    ? 'Saved'
                    : saveState === 'error'
                    ? 'Retry Save'
                    : 'Save Report'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap gap-2 pt-4">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-sans font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'matrix'
                ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20'
                : 'bg-[#1A1A1E] text-[#9E9A90] hover:text-white border border-[#2A2A2E]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Mulank & Bhagyank Synthesis</span>
          </button>
          <button
            onClick={() => setActiveTab('loshu')}
            className={`px-4 py-2 rounded-xl text-xs font-sans font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'loshu'
                ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20'
                : 'bg-[#1A1A1E] text-[#9E9A90] hover:text-white border border-[#2A2A2E]'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Lo Shu 3x3 Magic Grid ({activeNumerology.loShuPlanes.length} Planes)</span>
          </button>
          <button
            onClick={() => setActiveTab('name_correction')}
            className={`px-4 py-2 rounded-xl text-xs font-sans font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'name_correction'
                ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20'
                : 'bg-[#1A1A1E] text-[#9E9A90] hover:text-white border border-[#2A2A2E]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Chaldean Name Correction Tool</span>
          </button>
          <button
            onClick={() => setActiveTab('remedies')}
            className={`px-4 py-2 rounded-xl text-xs font-sans font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'remedies'
                ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20'
                : 'bg-[#1A1A1E] text-[#9E9A90] hover:text-white border border-[#2A2A2E]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Numerology Remedies & Gems</span>
          </button>
        </div>
      </div>

      {/* View 1: Mulank & Bhagyank Matrix */}
      {activeTab === 'matrix' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mulank (Psychic Number) Deep Dive */}
          <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2E]">
              <div className="flex items-center space-x-2">
                <span className="w-8 h-8 rounded-xl bg-[#C9A050]/20 text-[#C9A050] font-serif font-bold text-base flex items-center justify-center border border-[#C9A050]/30">
                  {activeNumerology.mulank}
                </span>
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#F0ECE1]">Mulank (Psychic / Driver Number)</h3>
                  <p className="text-[11px] text-[#9E9A90]">Sum of Birth Day ({profile.birthDate.split('-')[2]})</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#C9A050]">{activeNumerology.mulankPlanet}</span>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div>
                <span className="text-[9px] uppercase font-bold text-[#9E9A90] tracking-wider">Psychological Drivers</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {(aiInsights?.mulankCharacteristics || activeNumerology.mulankCharacteristics).map((trait: string) => (
                    <span
                      key={trait}
                      className="px-2.5 py-1 rounded-lg bg-[#1A1A1E] border border-[#2A2A2E] text-[#C9A050] font-medium"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-[#1A1A1E] rounded-xl border border-[#2A2A2E] space-y-1">
                <span className="text-[9px] uppercase font-bold text-[#C9A050] tracking-wider">Instinctive Nature</span>
                <p className="text-[#E5E1D8] leading-relaxed">
                  Your Mulank reveals how you instinctively react to challenges, your personal desires, and your subconscious behavioral patterns.
                  Ruled by {activeNumerology.mulankPlanet}, you radiate authority and strive for self-directed excellence.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-[#1A1A1E]/60 rounded-lg border border-[#2A2A2E]">
                  <span className="text-[9px] text-[#9E9A90] block uppercase font-bold tracking-wider">Favorable Days</span>
                  <span className="font-semibold text-[#C9A050]">{activeNumerology.luckyDays.join(', ')}</span>
                </div>
                <div className="p-3 bg-[#1A1A1E]/60 rounded-lg border border-[#2A2A2E]">
                  <span className="text-[9px] text-[#9E9A90] block uppercase font-bold tracking-wider">Lucky Colors</span>
                  <span className="font-semibold text-[#C9A050]">{activeNumerology.luckyColors.join(', ')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bhagyank (Destiny Number) Deep Dive */}
          <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2E]">
              <div className="flex items-center space-x-2">
                <span className="w-8 h-8 rounded-xl bg-[#C9A050]/20 text-[#C9A050] font-serif font-bold text-base flex items-center justify-center border border-[#C9A050]/30">
                  {activeNumerology.bhagyank}
                </span>
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#F0ECE1]">Bhagyank (Destiny / Conductor Number)</h3>
                  <p className="text-[11px] text-[#9E9A90]">Sum of Day + Month + Year ({profile.birthDate})</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#C9A050]">{activeNumerology.bhagyankPlanet}</span>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div className="p-3.5 bg-[#1A1A1E] rounded-xl border border-[#2A2A2E] space-y-1">
                <span className="text-[9px] uppercase font-bold text-[#C9A050] tracking-wider">Karmic Life Mission</span>
                <p className="text-[#E5E1D8] leading-relaxed">{activeNumerology.bhagyankMission}</p>
              </div>

              <div className="p-3.5 bg-[#1A1A1E] rounded-xl border border-[#2A2A2E] space-y-1">
                <span className="text-[9px] uppercase font-bold text-[#C9A050] tracking-wider">Mulank-Bhagyank Synergy</span>
                <p className="text-[#E5E1D8] leading-relaxed">
                  Your combination of Mulank {activeNumerology.mulank} and Bhagyank {activeNumerology.bhagyank} creates an energetic balance between 
                  daily execution and grand karmic accomplishments. Harness this alignment by scheduling critical launches on your auspicious dates.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-[#1A1A1E]/60 rounded-lg border border-[#2A2A2E]">
                  <span className="text-[9px] text-[#9E9A90] block uppercase font-bold tracking-wider">Friendly Numbers</span>
                  <span className="font-semibold text-[#C9A050]">{activeNumerology.luckyNumbers.join(', ')}</span>
                </div>
                <div className="p-3 bg-[#1A1A1E]/60 rounded-lg border border-[#2A2A2E]">
                  <span className="text-[9px] text-[#9E9A90] block uppercase font-bold tracking-wider">Unfavorable Numbers</span>
                  <span className="font-semibold text-[#C9A050]">{activeNumerology.unfavorableNumbers.join(', ') || 'None (Universal Friend)'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Lo Shu 3x3 Magic Grid */}
      {activeTab === 'loshu' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 5 Cols: Visual Lo Shu Grid */}
          <div className="lg:col-span-5 bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-3 border-b border-[#2A2A2E] mb-4 text-xs">
              <span className="font-serif font-bold text-[#F0ECE1]">Sacred 3x3 Lo Shu Matrix</span>
              <span className="text-[#C9A050] font-mono">Date: {profile.birthDate.replace(/-/g, '')}</span>
            </div>

            {/* 3x3 Grid */}
            <div className="w-full max-w-[320px] aspect-square grid grid-cols-3 grid-rows-3 gap-2 p-3 bg-[#08080A] rounded-2xl border border-[#C9A050]/40 shadow-inner">
              {loShuPositions.map((row) =>
                row.map((num) => {
                  const count = activeNumerology.loShuGrid[num] || 0;
                  const isPresent = count > 0;
                  return (
                    <div
                      key={num}
                      className={`rounded-xl border flex flex-col items-center justify-center p-2 transition ${
                        isPresent
                          ? 'bg-[#1A1A1E] border-[#C9A050] shadow-md shadow-[#C9A050]/10'
                          : 'bg-[#141418]/60 border-[#2A2A2E] text-[#9E9A90]'
                      }`}
                    >
                      <span className={`text-2xl font-serif font-bold ${isPresent ? 'text-[#C9A050]' : 'text-[#504E48]'}`}>
                        {num}
                      </span>
                      <span
                        className={`text-[10px] font-sans font-bold px-1.5 py-0.5 rounded-full mt-1 ${
                          isPresent ? 'bg-[#C9A050] text-[#0D0D0F]' : 'bg-[#1A1A1E] text-[#9E9A90]'
                        }`}
                      >
                        {isPresent ? `${count}x` : 'Absent'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-4 text-xs text-[#9E9A90] text-center space-y-1 font-sans">
              <p>Numbers extracted directly from your complete birth date string ({profile.birthDate}).</p>
              <p className="text-[#C9A050]/90 font-medium">Missing numbers can be energetically balanced using spatial Vastu & crystal remedies.</p>
            </div>
          </div>

          {/* Right 7 Cols: Lo Shu Planes & Strengths */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2E]">
                <h3 className="text-base font-serif font-bold text-[#F0ECE1]">Planes of Strength & Arrows of Destiny</h3>
                <span className="text-xs text-[#C9A050] font-mono font-medium">8 Geometric Vectors</span>
              </div>

              <div className="space-y-3 font-sans">
                {activeNumerology.loShuPlanes.map((plane) => (
                  <div key={plane.name} className="p-3.5 bg-[#1A1A1E] rounded-xl border border-[#2A2A2E] space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-serif font-bold text-[#F0ECE1]">{plane.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border border-transparent ${
                          plane.status !== 'Empty'
                            ? 'bg-[#C9A050]/20 text-[#C9A050]'
                            : 'bg-[#141418] text-[#9E9A90]'
                        }`}
                      >
                        {plane.status} ({Math.round(plane.strength)}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-[#141418] rounded-full overflow-hidden border border-[#2A2A2E]">
                      <div
                        className="h-full bg-gradient-to-r from-[#C9A050] to-[#E5C158] rounded-full"
                        style={{ width: `${plane.strength}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-[#9E9A90] leading-relaxed">
                      {isAiLoading ? (
                        <span className="flex items-center text-[#C9A050] space-x-2 animate-pulse"><Sparkles className="w-3 h-3" /> <span>Synthesizing Vedic Insights...</span></span>
                      ) : (
                        (aiInsights?.planeMeanings && aiInsights.planeMeanings[plane.name]) || plane.meaning
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 3: Chaldean Name Correction Simulator */}
      {activeTab === 'name_correction' && (
        <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl space-y-6">
          <div className="pb-4 border-b border-[#2A2A2E]">
            <h3 className="text-base font-serif font-bold text-[#F0ECE1] flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-[#C9A050]" />
              <span>Chaldean & Pythagorean Name Spelling Optimizer</span>
            </h3>
            <p className="text-xs font-sans text-[#9E9A90] mt-1">
              Ancient Chaldean numerology assigns sacred vibrations to each letter. Test subtle spelling variations to achieve optimum wealth (5 or 6) or authority (1).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#C9A050] mb-1">
                  Test Name Spelling
                </label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#1A1A1E] border border-[#2A2A2E] rounded-lg text-sm text-[#F0ECE1] focus:outline-none focus:border-[#C9A050] font-medium"
                />
              </div>

              {/* Letter breakdown */}
              <div className="p-3 bg-[#08080A] rounded-xl border border-[#2A2A2E] space-y-2">
                <span className="text-[9px] uppercase font-bold text-[#9E9A90] block tracking-wider">Letter Gematria Values</span>
                <div className="flex flex-wrap gap-1">
                  {cleanTestName.split('').map((char, idx) => (
                    <div key={idx} className="p-1 px-2 bg-[#1A1A1E] rounded text-center border border-[#2A2A2E]">
                      <div className="text-xs font-bold text-[#F0ECE1]">{char}</div>
                      <div className="text-[10px] font-mono text-[#C9A050]">{CHALDEAN_VALUES[char] || 0}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Output */}
            <div className="bg-[#1A1A1E] p-5 rounded-xl border border-[#2A2A2E] space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-[#9E9A90]">Total Compound Vibration:</span>
                <span className="text-lg font-serif font-bold text-[#C9A050] font-mono">{testChaldeanSum}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-[#9E9A90]">Single Digit Namank:</span>
                <span className="text-2xl font-serif font-bold text-[#C9A050] font-mono">{testChaldeanSingle}</span>
              </div>

              <div className="p-3 rounded-lg bg-[#141418] border border-[#2A2A2E] text-xs">
                <span className="font-serif font-bold text-[#C9A050] block mb-1">Vibrational Compatibility</span>
                <p className="text-[#9E9A90] text-[11px] leading-relaxed">
                  {[1, 3, 5, 6].includes(testChaldeanSingle)
                    ? `✓ Highly favorable vibration ${testChaldeanSingle}. Resonates strongly with commercial prosperity, leadership respect, and smooth financial transactions.`
                    : `⚠️ Vibration ${testChaldeanSingle} requires conscious balancing or a slight single-letter adjustment to align with Mercury (5) or Venus (6).`}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-[#9E9A90] tracking-wider">Classical Recommendations</span>
                {activeNumerology.nameCorrectionSuggestions.map((sug, i) => (
                  <p key={i} className="text-[11px] text-[#9E9A90]">• {sug}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 4: Numerology Remedies */}
      {activeTab === 'remedies' && (
        <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl space-y-4">
          <div className="pb-3 border-b border-[#2A2A2E]">
            <h3 className="text-base font-serif font-bold text-[#F0ECE1] flex items-center space-x-2">
              <Flame className="w-4 h-4 text-[#C9A050]" />
              <span>Personalized Ancient Numerology Remedies & Vastu Upayas</span>
            </h3>
            <p className="text-xs font-sans text-[#9E9A90] mt-1">
              Correct missing energetic vibrations from your Lo Shu grid and strengthen your Mulank planetary ruler.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
            {(aiInsights?.remedies || activeNumerology.remedies).map((rem: string, idx: number) => (
              <div key={idx} className="p-3.5 bg-[#1A1A1E] rounded-xl border border-[#2A2A2E] flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-[#C9A050]/20 text-[#C9A050] font-serif font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-[#C9A050]/30">
                  {idx + 1}
                </span>
                <p className="text-xs text-[#E5E1D8] leading-relaxed">{rem}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
