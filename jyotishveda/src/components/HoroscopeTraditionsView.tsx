import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Layers,
  CheckCircle,
  Flame,
  Volume2,
} from 'lucide-react';

import {
  UserProfile,
  HoroscopeTradition,
  ChartStyle,
  PlanetPosition,
  HouseData,
  DashaPeriod,
  VedicYoga,
  VedicDosha,
  NumerologyReport,
} from '../types';

import { getTranslation } from '../services/translations';
import { api } from '../services/api';
import { API_ENDPOINTS } from '../config/api_config';

const PlanetBadge = ({
  p,
  isDiamond,
}: {
  p: any;
  isDiamond?: boolean;
}) => (
  <div className="group relative z-50">
    <span
      className={`cursor-help transition-all duration-300 block ${
        isDiamond
          ? 'text-[10px] font-sans font-bold text-[#E5E1D8] bg-[#1A1A1E] px-1 rounded border border-[#C9A050]/40 hover:scale-110 shadow-sm hover:shadow-[#C9A050]/30'
          : 'text-[9px] font-bold text-[#C9A050] hover:scale-110 hover:text-[#F0ECE1] hover:drop-shadow-[0_0_4px_rgba(201,160,80,0.8)]'
      }`}
    >
      {p.name.slice(0, 2)}
    </span>

    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-[#141418]/95 backdrop-blur-xl border border-[#C9A050]/40 text-[#E5E1D8] text-[10px] rounded-lg px-3 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.8)] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[100] flex flex-col items-center translate-y-2 group-hover:translate-y-0 scale-95 group-hover:scale-100">
      <span className="font-bold text-[#C9A050] text-xs">
        {p.name} ({p.sanskritName})
      </span>

      <div className="flex items-center gap-1.5 mt-1 opacity-90">
        {p.isRetrograde && (
          <span className="text-[#C9A050] uppercase tracking-wider text-[8px] font-bold bg-[#C9A050]/15 px-1 rounded border border-[#C9A050]/30">
            Retrograde
          </span>
        )}

        <span>
          {p.degree.toFixed(2)}° {p.signName}
        </span>
      </div>

      <div className="mt-1 text-[9px] text-[#9E9A90]">
        {p.nakshatra} (Pada {p.pada})
      </div>

      <div className="mt-0.5 text-[8px] text-[#C9A050]/90 uppercase tracking-widest bg-[#C9A050]/10 px-1.5 rounded-sm">
        {p.dignity}
      </div>
    </div>
  </div>
);

interface HoroscopeTraditionsViewProps {
  profile: UserProfile;
  tradition: HoroscopeTradition;
  setTradition: (t: HoroscopeTradition) => void;

  chartData: {
    ascendant: {
      signIndex: number;
      degree: number;
      signName: string;
      signSanskrit: string;
      nakshatra: string;
    };
    planets: PlanetPosition[];
    houses: HouseData[];
    dashas: DashaPeriod[];
    yogas: VedicYoga[];
    doshas: VedicDosha[];
    divisionalCharts?: { d9: any; d10: any };
    aspects?: any[];
    gemstones?: any[];
    kpSystem?: { houses: number[] };
  };

  numerology: NumerologyReport;
  language?: string;
}

export const HoroscopeTraditionsView: React.FC<
  HoroscopeTraditionsViewProps
> = ({
  profile,
  tradition,
  setTradition,
  chartData,
  numerology,
  language = 'en',
}) => {
  const [chartStyle, setChartStyle] =
    useState<ChartStyle>('north_indian');

  const [selectedHouse, setSelectedHouse] =
    useState<HouseData | null>(chartData.houses[0]);

  const [selectedPlanet, setSelectedPlanet] =
    useState<PlanetPosition | null>(chartData.planets[0]);

  const [aiInterpretation, setAiInterpretation] =
    useState<string | null>(null);

  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const t = (key: string) =>
    getTranslation(key, language);

  const traditionsList: {
    id: HoroscopeTradition;
    name: string;
    tag: string;
    description: string;
  }[] = [
    {
      id: 'parashari',
      name: t('tradition.parashari.name'),
      tag: t('tradition.parashari.tag'),
      description: t('tradition.parashari.desc'),
    },
    {
      id: 'jaimini',
      name: t('tradition.jaimini.name'),
      tag: t('tradition.jaimini.tag'),
      description: t('tradition.jaimini.desc'),
    },
    {
      id: 'lal_kitab',
      name: t('tradition.lal_kitab.name'),
      tag: t('tradition.lal_kitab.tag'),
      description: t('tradition.lal_kitab.desc'),
    },
    {
      id: 'kp_system',
      name: t('tradition.kp_system.name'),
      tag: t('tradition.kp_system.tag'),
      description: t('tradition.kp_system.desc'),
    },
    {
      id: 'bhrigu_nadi',
      name: t('tradition.bhrigu_nadi.name'),
      tag: t('tradition.bhrigu_nadi.tag'),
      description: t('tradition.bhrigu_nadi.desc'),
    },
  ];

  const handleGenerateAIInterpretation = async () => {
    setIsLoadingAi(true);

    try {
      const data = await api.post<any>(
        API_ENDPOINTS.BIRTH_CHART.INTERPRET,
        {
          profile,
          tradition,
          chartData,
          numerology,
          language,
        }
      );

      if (data && data.interpretation) {
        setAiInterpretation(data.interpretation);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const clean = text.replace(/[#*`_>-]/g, ' ');

    const utterance =
      new SpeechSynthesisUtterance(clean);

    utterance.rate = 0.95;

    utterance.onend = () =>
      setIsPlayingAudio(false);

    setIsPlayingAudio(true);

    window.speechSynthesis.speak(utterance);
  };

  // --------------------------------------------------
  // NORTH INDIAN CHART
  // --------------------------------------------------

  const renderNorthIndianChart = () => {
    return (
      <div className="relative w-full max-w-[380px] aspect-square mx-auto bg-[#08080A] rounded-xl border border-[#C9A050]/40 p-1 shadow-2xl select-none">
        <svg
          viewBox="0 0 300 300"
          className="w-full h-full text-[#C9A050] stroke-[#C9A050]/60 stroke-[1.5]"
        >
          <rect
            x="5"
            y="5"
            width="290"
            height="290"
            fill="none"
            className="stroke-[#C9A050]/80 stroke-2"
          />

          <line
            x1="5"
            y1="5"
            x2="295"
            y2="295"
          />

          <line
            x1="295"
            y1="5"
            x2="5"
            y2="295"
          />

          <line
            x1="150"
            y1="5"
            x2="5"
            y2="150"
          />

          <line
            x1="5"
            y1="150"
            x2="150"
            y2="295"
          />

          <line
            x1="150"
            y1="295"
            x2="295"
            y2="150"
          />

          <line
            x1="295"
            y1="150"
            x2="150"
            y2="5"
          />
        </svg>

        {/* House 1 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[0])
          }
          className={`absolute top-[18%] left-[32%] w-[36%] h-[26%] flex flex-col items-center justify-center cursor-pointer rounded transition p-1 ${
            selectedHouse?.houseNumber === 1
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[10px] font-serif font-bold text-[#C9A050]">
            H1 ({chartData.houses[0].signIndex + 1})
          </span>

          <span className="text-[9px] text-[#9E9A90]">
            Lagna {chartData.ascendant.signName.slice(0, 3)}
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center mt-0.5">
            {chartData.houses[0].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
                isDiamond
              />
            ))}
          </div>
        </div>

        {/* House 2 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[1])
          }
          className={`absolute top-[4%] left-[6%] w-[26%] h-[22%] flex flex-col items-center justify-center cursor-pointer rounded transition ${
            selectedHouse?.houseNumber === 2
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[9px] font-serif font-bold text-[#E5E1D8]">
            H2 ({chartData.houses[1].signIndex + 1})
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center">
            {chartData.houses[1].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
              />
            ))}
          </div>
        </div>

        {/* House 3 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[2])
          }
          className={`absolute top-[26%] left-[4%] w-[22%] h-[26%] flex flex-col items-center justify-center cursor-pointer rounded transition ${
            selectedHouse?.houseNumber === 3
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[9px] font-serif font-bold text-[#E5E1D8]">
            H3 ({chartData.houses[2].signIndex + 1})
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center">
            {chartData.houses[2].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
              />
            ))}
          </div>
        </div>

        {/* House 4 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[3])
          }
          className={`absolute top-[38%] left-[16%] w-[26%] h-[26%] flex flex-col items-center justify-center cursor-pointer rounded transition ${
            selectedHouse?.houseNumber === 4
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[10px] font-serif font-bold text-[#C9A050]">
            H4 ({chartData.houses[3].signIndex + 1})
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center">
            {chartData.houses[3].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
                isDiamond
              />
            ))}
          </div>
        </div>

        {/* House 5 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[4])
          }
          className={`absolute top-[58%] left-[4%] w-[22%] h-[26%] flex flex-col items-center justify-center cursor-pointer rounded transition ${
            selectedHouse?.houseNumber === 5
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[9px] font-serif font-bold text-[#E5E1D8]">
            H5 ({chartData.houses[4].signIndex + 1})
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center">
            {chartData.houses[4].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
              />
            ))}
          </div>
        </div>

        {/* House 6 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[5])
          }
          className={`absolute bottom-[4%] left-[6%] w-[26%] h-[22%] flex flex-col items-center justify-center cursor-pointer rounded transition ${
            selectedHouse?.houseNumber === 6
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[9px] font-serif font-bold text-[#E5E1D8]">
            H6 ({chartData.houses[5].signIndex + 1})
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center">
            {chartData.houses[5].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
              />
            ))}
          </div>
        </div>

        {/* House 7 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[6])
          }
          className={`absolute bottom-[16%] left-[32%] w-[36%] h-[26%] flex flex-col items-center justify-center cursor-pointer rounded transition ${
            selectedHouse?.houseNumber === 7
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[10px] font-serif font-bold text-[#C9A050]">
            H7 ({chartData.houses[6].signIndex + 1})
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center">
            {chartData.houses[6].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
                isDiamond
              />
            ))}
          </div>
        </div>

        {/* House 8 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[7])
          }
          className={`absolute bottom-[4%] right-[6%] w-[26%] h-[22%] flex flex-col items-center justify-center cursor-pointer rounded transition ${
            selectedHouse?.houseNumber === 8
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[9px] font-serif font-bold text-[#E5E1D8]">
            H8 ({chartData.houses[7].signIndex + 1})
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center">
            {chartData.houses[7].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
              />
            ))}
          </div>
        </div>

        {/* House 9 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[8])
          }
          className={`absolute top-[58%] right-[4%] w-[22%] h-[26%] flex flex-col items-center justify-center cursor-pointer rounded transition ${
            selectedHouse?.houseNumber === 9
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[9px] font-serif font-bold text-[#E5E1D8]">
            H9 ({chartData.houses[8].signIndex + 1})
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center">
            {chartData.houses[8].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
              />
            ))}
          </div>
        </div>

        {/* House 10 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[9])
          }
          className={`absolute top-[38%] right-[16%] w-[26%] h-[26%] flex flex-col items-center justify-center cursor-pointer rounded transition ${
            selectedHouse?.houseNumber === 10
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[10px] font-serif font-bold text-[#C9A050]">
            H10 ({chartData.houses[9].signIndex + 1})
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center">
            {chartData.houses[9].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
                isDiamond
              />
            ))}
          </div>
        </div>

        {/* House 11 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[10])
          }
          className={`absolute top-[26%] right-[4%] w-[22%] h-[26%] flex flex-col items-center justify-center cursor-pointer rounded transition ${
            selectedHouse?.houseNumber === 11
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[9px] font-serif font-bold text-[#E5E1D8]">
            H11 ({chartData.houses[10].signIndex + 1})
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center">
            {chartData.houses[10].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
              />
            ))}
          </div>
        </div>

        {/* House 12 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[11])
          }
          className={`absolute top-[4%] right-[6%] w-[26%] h-[22%] flex flex-col items-center justify-center cursor-pointer rounded transition ${
            selectedHouse?.houseNumber === 12
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[9px] font-serif font-bold text-[#E5E1D8]">
            H12 ({chartData.houses[11].signIndex + 1})
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center">
            {chartData.houses[11].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  // --------------------------------------------------
  // SOUTH INDIAN CHART
  // --------------------------------------------------

  const renderSouthIndianChart = () => {
    const gridSignIndices = [
      [11, 0, 1, 2],
      [10, -1, -1, 3],
      [9, -1, -1, 4],
      [8, 7, 6, 5],
    ];

    return (
      <div className="w-full max-w-[380px] aspect-square mx-auto bg-[#08080A] rounded-xl border border-[#C9A050]/40 p-2 shadow-2xl grid grid-cols-4 grid-rows-4 gap-1 select-none">
        {gridSignIndices.map((row, rIdx) =>
          row.map((signIdx, cIdx) => {
            if (signIdx === -1) {
              if (rIdx === 1 && cIdx === 1) {
                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className="col-span-2 row-span-2 bg-[#141418] border border-[#2A2A2E] rounded-lg flex flex-col items-center justify-center p-2 text-center"
                  >
                    <span className="text-[#C9A050] font-serif font-bold text-xs">
                      South Indian Kundli
                    </span>

                    <span className="text-[10px] text-[#9E9A90] mt-1">
                      Lagna in House 1 (
                      {chartData.ascendant.signName})
                    </span>

                    <span className="text-[9px] text-[#C9A050]/80 mt-1 font-mono">
                      12 Fixed Rashis Matrix
                    </span>
                  </div>
                );
              }

              return null;
            }

            const houseMatchingSign =
              chartData.houses.find(
                (h) => h.signIndex === signIdx
              );

            const isLagnaSign =
              chartData.ascendant.signIndex === signIdx;

            const planetsInSign =
              chartData.planets.filter(
                (p) => p.signIndex === signIdx
              );

            const isSelected =
              selectedHouse?.signIndex === signIdx;

            return (
              <div
                key={`${rIdx}-${cIdx}`}
                onClick={() =>
                  houseMatchingSign &&
                  setSelectedHouse(houseMatchingSign)
                }
                className={`border rounded p-1 flex flex-col justify-between cursor-pointer transition ${
                  isSelected
                    ? 'border-[#C9A050] bg-[#C9A050]/15'
                    : isLagnaSign
                    ? 'border-[#C9A050]/50 bg-[#141418]'
                    : 'border-[#2A2A2E] bg-[#141418]/60 hover:bg-[#1A1A1E]'
                }`}
              >
                <div className="flex justify-between items-center text-[9px] font-bold">
                  <span
                    className={
                      isLagnaSign
                        ? 'text-[#C9A050]'
                        : 'text-[#9E9A90]'
                    }
                  >
                    {isLagnaSign
                      ? 'ASC/L'
                      : `H${houseMatchingSign?.houseNumber || ''}`}
                  </span>

                  <span className="text-[#9E9A90] font-mono">
                    {signIdx + 1}
                  </span>
                </div>

                <div className="flex flex-wrap gap-0.5 justify-center py-0.5">
                  {planetsInSign.map((p) => (
                    <span
                      key={p.id}
                      className="text-[9px] font-bold text-[#E5E1D8] bg-[#1A1A1E] px-0.5 rounded border border-[#C9A050]/30"
                    >
                      {p.name.slice(0, 2)}
                    </span>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  // --------------------------------------------------
  // EAST INDIAN CHART
  // --------------------------------------------------

  const renderEastIndianChart = () => {
    return (
      <div className="w-full max-w-[380px] aspect-square mx-auto bg-[#08080A] rounded-xl border border-[#C9A050]/40 p-3 shadow-2xl flex flex-col items-center justify-center select-none text-center">
        <div className="text-xs font-serif font-bold text-[#C9A050] mb-2">
          East Indian (Rashi Chakra) Layout
        </div>

        <div className="grid grid-cols-3 gap-2 w-full h-[85%]">
          {chartData.houses
            .slice(0, 9)
            .map((h) => (
              <div
                key={h.houseNumber}
                onClick={() => setSelectedHouse(h)}
                className={`p-2 border rounded-lg flex flex-col justify-between cursor-pointer text-xs ${
                  selectedHouse?.houseNumber ===
                  h.houseNumber
                    ? 'border-[#C9A050] bg-[#C9A050]/15'
                    : 'border-[#2A2A2E] bg-[#141418] hover:bg-[#1A1A1E]'
                }`}
              >
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-[#C9A050] font-serif">
                    Bhava {h.houseNumber}
                  </span>

                  <span className="text-[#9E9A90]">
                    {h.signName.slice(0, 3)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 justify-center my-1">
                  {h.planets.map((p) => (
                    <span
                      key={p.id}
                      className="text-[10px] font-bold text-[#E5E1D8] bg-[#1A1A1E] px-1 rounded border border-[#C9A050]/30"
                    >
                      {p.name.slice(0, 2)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#2A2A2E]">
          <div>
            <div className="flex items-center space-x-2 text-xs font-sans font-semibold tracking-widest text-[#C9A050] uppercase mb-1">
              <Compass className="w-4 h-4" />

              <span>
                {profile.horoscopeSystem === 'western'
                  ? 'Western Tropical (Sayana) Horoscope Engine'
                  : 'Vedic Sidereal (Nirayana) Jyotish Engine'}
              </span>

              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1A1A1E] text-[#9E9A90] border border-[#2A2A2E] normal-case tracking-normal">
                {profile.horoscopeSystem === 'western'
                  ? 'Equinox-Aligned • Ayanamsha: +23.86° Tropical Shift'
                  : 'Lahiri Ayanamsha (~24°) • 27 Nakshatras'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F0ECE1]">
              {profile.horoscopeSystem === 'western'
                ? 'Western & Multi-Tradition Astrological Synthesis'
                : 'Vedic Birth Chart & Multi-Tradition Synthesis'}
            </h1>

            <p className="text-xs font-sans text-[#9E9A90] mt-1 leading-relaxed">
              Synthesizing {profile.fullName}&apos;s profile
              across Parashari, Jaimini, Lal Kitab, KP
              System, and Bhrigu Nadi methodologies.
            </p>
          </div>

          {/* CHART STYLE */}

          <div className="flex items-center space-x-1.5 bg-[#1A1A1E] p-1 rounded-xl border border-[#2A2A2E] self-start md:self-auto">
            <span className="text-[11px] text-[#9E9A90] px-2 font-medium">
              Chart Style:
            </span>

            <button
              onClick={() =>
                setChartStyle('north_indian')
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition cursor-pointer ${
                chartStyle === 'north_indian'
                  ? 'bg-[#C9A050] text-[#0D0D0F] shadow'
                  : 'text-[#9E9A90] hover:text-white'
              }`}
            >
              North Indian
            </button>

            <button
              onClick={() =>
                setChartStyle('south_indian')
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition cursor-pointer ${
                chartStyle === 'south_indian'
                  ? 'bg-[#C9A050] text-[#0D0D0F] shadow'
                  : 'text-[#9E9A90] hover:text-white'
              }`}
            >
              South Indian
            </button>

            <button
              onClick={() =>
                setChartStyle('east_indian')
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition cursor-pointer ${
                chartStyle === 'east_indian'
                  ? 'bg-[#C9A050] text-[#0D0D0F] shadow'
                  : 'text-[#9E9A90] hover:text-white'
              }`}
            >
              East Indian
            </button>
          </div>
        </div>

        {/* TRADITIONS */}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 mt-5">
          {traditionsList.map((traditionItem) => {
            const isActive =
              tradition === traditionItem.id;

            return (
              <button
                key={traditionItem.id}
                onClick={() =>
                  setTradition(traditionItem.id)
                }
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'bg-[#1A1A1E] border-[#C9A050] shadow-md shadow-[#C9A050]/10'
                    : 'bg-[#141418] border-[#2A2A2E] hover:border-[#C9A050]/40 text-[#9E9A90]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-serif font-bold ${
                        isActive
                          ? 'text-[#C9A050]'
                          : 'text-[#F0ECE1]'
                      }`}
                    >
                      {traditionItem.name}
                    </span>

                    {isActive && (
                      <CheckCircle className="w-3.5 h-3.5 text-[#C9A050]" />
                    )}
                  </div>

                  <span className="text-[10px] text-[#C9A050]/80 font-mono block mt-0.5">
                    {traditionItem.tag}
                  </span>
                </div>

                <p className="text-[11px] text-[#9E9A90] mt-2 line-clamp-2 leading-relaxed">
                  {traditionItem.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN GRID (2 COLUMNS ON TABLETS & DESKTOPS) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* LEFT COLUMN */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-5 text-[#E5E1D8] shadow-xl flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-[#2A2A2E] text-xs">
              <span className="font-serif font-semibold text-[#C9A050] flex items-center space-x-1.5">
                <Layers className="w-4 h-4" />

                <span>
                  Click any House to inspect
                </span>
              </span>

              <span className="text-[#9E9A90]">
                Lagna: {chartData.ascendant.signName} (
                {chartData.ascendant.degree}°)
              </span>
            </div>

            {chartStyle === 'north_indian' &&
              renderNorthIndianChart()}

            {chartStyle === 'south_indian' &&
              renderSouthIndianChart()}

            {chartStyle === 'east_indian' &&
              renderEastIndianChart()}

            <p className="text-[11px] text-[#9E9A90] mt-4 text-center">
              Houses indicate life domains (Bhavas).
              Badges show planetary placements and
              conjunctions.
            </p>
          </div>

          {/* SELECTED HOUSE */}

          {selectedHouse && (
            <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-5 text-[#E5E1D8] shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2E]">
                <div className="flex items-center space-x-2">
                  <span className="w-7 h-7 rounded-lg bg-[#C9A050]/20 text-[#C9A050] font-serif font-bold text-xs flex items-center justify-center border border-[#C9A050]/30">
                    {selectedHouse.houseNumber}
                  </span>

                  <div>
                    <h3 className="text-sm font-serif font-bold text-[#F0ECE1]">
                      {selectedHouse.sanskritName}
                    </h3>

                    <span className="text-[11px] text-[#9E9A90]">
                      Sign: {selectedHouse.signName} (
                      {selectedHouse.signSanskrit}) • Lord:{' '}
                      {selectedHouse.signLord}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded bg-[#1A1A1E] text-[#C9A050] font-medium border border-[#2A2A2E]">
                  {selectedHouse.planets.length} Planets
                </span>
              </div>

              <div className="mt-3 space-y-2 text-xs font-sans">
                <div>
                  <span className="text-[9px] uppercase font-bold text-[#9E9A90] tracking-wider">
                    Significance
                  </span>

                  <p className="text-[#E5E1D8] mt-0.5 leading-relaxed">
                    {selectedHouse.significance}
                  </p>
                </div>

                {tradition === 'kp_system' && (
                  <div className="p-2.5 bg-[#1A1A1E] rounded-lg border border-[#2A2A2E] flex justify-between">
                    <span>
                      KP Cuspal Sub-Lord:{' '}
                      <strong className="text-[#C9A050]">
                        {selectedHouse.kpSubLord}
                      </strong>
                    </span>

                    <span>
                      Star Lord:{' '}
                      <strong className="text-[#C9A050]">
                        {selectedHouse.kpStarLord}
                      </strong>
                    </span>
                  </div>
                )}

                {tradition === 'lal_kitab' && (
                  <div className="p-2.5 bg-[#1A1A1E] rounded-lg border border-[#2A2A2E]">
                    <span className="text-[11px] text-[#9E9A90]">
                      Lal Kitab Farman State:
                    </span>

                    <p className="text-[#C9A050] font-semibold text-xs mt-0.5">
                      {selectedHouse.lalKitabState}
                    </p>
                  </div>
                )}

                {selectedHouse.planets.length > 0 && (
                  <div>
                    <span className="text-[9px] uppercase font-bold text-[#9E9A90] tracking-wider">
                      Occupying Grahas
                    </span>

                    <div className="grid grid-cols-1 gap-1.5 mt-1">
                      {selectedHouse.planets.map((p) => (
                        <div
                          key={p.id}
                          onClick={() =>
                            setSelectedPlanet(p)
                          }
                          className="p-2 bg-[#1A1A1E] rounded-lg border border-[#2A2A2E] flex items-center justify-between cursor-pointer hover:border-[#C9A050]/50"
                        >
                          <span className="font-semibold text-[#C9A050]">
                            {p.sanskritName} ({p.name})
                          </span>

                          <span className="text-[11px] text-[#9E9A90]">
                            {p.degree}° in {p.nakshatra} (
                            {p.dignity})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* YOGAS & DOSHAS (Moved to Left Column for perfect balanced layout) */}
          <div className="grid grid-cols-1 gap-4">
            {/* YOGAS */}
            <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-5 text-[#E5E1D8] shadow-xl space-y-3">
              <div className="flex items-center space-x-2 text-[#C9A050] font-serif font-bold text-xs pb-2 border-b border-[#2A2A2E]">
                <Sparkles className="w-4 h-4" />
                <span>
                  Detected Auspicious Yogas ({chartData.yogas.length})
                </span>
              </div>

              <div className="space-y-2">
                {chartData.yogas.map((y) => (
                  <div
                    key={y.id}
                    className="p-3 bg-[#1A1A1E] rounded-xl border border-[#2A2A2E]"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-serif font-bold text-[#C9A050]">
                        {y.name}
                      </h4>

                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#C9A050]/15 text-[#C9A050] font-sans">
                        {y.type}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#9E9A90] mt-1 leading-relaxed font-sans">
                      {y.effect}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* DOSHAS */}
            <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-5 text-[#E5E1D8] shadow-xl space-y-3">
              <div className="flex items-center space-x-2 text-[#C9A050] font-serif font-bold text-xs pb-2 border-b border-[#2A2A2E]">
                <Flame className="w-4 h-4" />
                <span>
                  Karmic Doshas & Planetary Afflictions
                </span>
              </div>

              <div className="space-y-2">
                {chartData.doshas.map((d) => (
                  <div
                    key={d.id}
                    className="p-3 bg-[#1A1A1E] rounded-xl border border-[#2A2A2E]"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-serif font-bold text-[#F0ECE1]">
                        {d.name}
                      </h4>

                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold font-sans ${
                          d.isPresent
                            ? 'dignity-badge-severe'
                            : 'dignity-badge-neutral'
                        }`}
                      >
                        {d.isPresent
                          ? d.severity
                          : 'Neutral'}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#9E9A90] mt-1 leading-relaxed font-sans">
                      {d.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ASPECTS */}
            {chartData.aspects && chartData.aspects.length > 0 && (
              <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-5 text-[#E5E1D8] shadow-xl space-y-3">
                <div className="flex items-center space-x-2 text-[#C9A050] font-serif font-bold text-xs pb-2 border-b border-[#2A2A2E]">
                  <Sparkles className="w-4 h-4" />
                  <span>
                    Planetary Aspects (Drishti)
                  </span>
                </div>
                <div className="space-y-2">
                  {chartData.aspects.map((asp, idx) => (
                    <div key={idx} className="p-2 bg-[#1A1A1E] rounded-lg border border-[#2A2A2E] flex items-center justify-between">
                      <span className="text-[11px] text-[#E5E1D8] font-semibold uppercase">{asp.aspectingPlanet}</span>
                      <span className="text-[9px] text-[#9E9A90] bg-[#2A2A2E]/50 px-2 rounded-full">{asp.aspectType}</span>
                      <span className="text-[11px] text-[#C9A050] font-semibold uppercase">{asp.aspectedPlanet}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* GEMSTONES */}
            {chartData.gemstones && chartData.gemstones.length > 0 && (
              <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-5 text-[#E5E1D8] shadow-xl space-y-3">
                <div className="flex items-center space-x-2 text-[#C9A050] font-serif font-bold text-xs pb-2 border-b border-[#2A2A2E]">
                  <Layers className="w-4 h-4" />
                  <span>
                    Favorable Gemstones (Lagna Based)
                  </span>
                </div>
                <div className="space-y-2">
                  {chartData.gemstones.map((g, idx) => (
                    <div key={idx} className="p-3 bg-[#1A1A1E] rounded-lg border border-[#2A2A2E] flex flex-col">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[12px] font-bold text-[#F0ECE1]">{g.gem}</span>
                        <span className="text-[10px] text-[#C9A050] uppercase tracking-wide">{g.planet}</span>
                      </div>
                      <span className="text-[10px] text-[#9E9A90]">{g.purpose}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="md:col-span-7 space-y-6">
          {/* PLANETARY TABLE */}

          <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl overflow-x-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#2A2A2E] mb-4">
              <div>
                <h3 className="text-base font-serif font-bold text-[#F0ECE1]">
                  Sidereal Planetary Positions
                  (Graha Spashta)
                </h3>

                <p className="text-xs text-[#9E9A90]">
                  Lahiri Ayanamsha • Click a planet for
                  remedies & karakas
                </p>
              </div>

              <span className="text-[10px] px-2 py-0.5 bg-[#C9A050]/15 text-[#C9A050] rounded font-semibold border border-[#C9A050]/30 font-mono">
                {chartData.planets.length} Grahas
              </span>
            </div>

            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-[#2A2A2E] text-[#9E9A90] font-semibold">
                  <th className="pb-2.5 pl-3 pr-2">Planet</th>
                  <th className="pb-2.5 px-2">Sign (Rashi)</th>
                  <th className="pb-2.5 px-2">Degree</th>
                  <th className="pb-2.5 px-2">Nakshatra & Pada</th>
                  <th className="pb-2.5 px-2">Dignity</th>
                  {tradition === 'jaimini' && (
                    <th className="pb-2.5 px-2">Chara Karaka</th>
                  )}
                  <th className="pb-2.5 pr-3 pl-2">Gemstone</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#2A2A2E]/60">
                {chartData.planets.map((p) => {
                  const isSelected = selectedPlanet?.id === p.id;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedPlanet(p)}
                      className={`hover:bg-[#1A1A1E] transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#C9A050]/15 font-semibold text-[#C9A050]'
                          : 'text-[#E5E1D8]'
                      }`}
                    >
                      <td className="py-2.5 pl-3 pr-2 flex items-center space-x-2 font-medium text-[#F0ECE1]">
                        <span className="text-sm sm:text-base text-[#C9A050] w-4 text-center shrink-0 inline-block">
                          {p.symbol}
                        </span>
                        <span className="whitespace-nowrap">{p.name}</span>
                        {p.isRetrograde && (
                          <span className="text-[10px] text-[#C9A050] font-bold shrink-0">
                            (R)
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-2 whitespace-nowrap">
                        {p.signName}
                      </td>

                      <td className="py-2.5 px-2 font-mono whitespace-nowrap">
                        {p.degree}°
                      </td>

                      <td className="py-2.5 px-2 text-[#9E9A90] whitespace-nowrap">
                        {p.nakshatra} (P{p.pada})
                      </td>

                      <td className="py-2.5 px-2 whitespace-nowrap">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            p.dignity === 'Exalted'
                              ? 'dignity-badge-neutral'
                              : p.dignity === 'Own'
                              ? 'dignity-badge-own'
                              : p.dignity === 'Debilitated'
                              ? 'dignity-badge-debilitated'
                              : 'dignity-badge-neutral'
                          }`}
                        >
                          {p.dignity}
                        </span>
                      </td>

                      {tradition === 'jaimini' && (
                        <td className="py-2.5 px-2 text-[#C9A050] font-medium font-serif whitespace-nowrap">
                          {p.karaka || '-'}
                        </td>
                      )}

                      <td className="py-2.5 pr-3 pl-2 text-[11px] text-[#9E9A90] whitespace-nowrap">
                        {t(p.gemstone).split('(')[0]}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* DASHA */}

          <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2E] mb-4">
              <div>
                <h3 className="text-base font-serif font-bold text-[#F0ECE1]">
                  Vimshottari Mahadasha Timeline
                  (120 Years)
                </h3>

                <p className="text-xs text-[#9E9A90]">
                  Calculated from Moon’s natal Nakshatra
                  degree
                </p>
              </div>

              <span className="text-xs text-[#C9A050] font-semibold">
                Active: Jupiter Mahadasha
              </span>
            </div>

            <div className="space-y-2.5 font-sans">
              {chartData.dashas.map((d) => (
                <div
                  key={d.planet}
                  className={`p-3 rounded-xl border transition ${
                    d.isCurrent
                      ? 'bg-[#1A1A1E] border-[#C9A050] shadow-md'
                      : 'bg-[#141418]/60 border-[#2A2A2E] text-[#9E9A90]'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`font-bold ${
                          d.isCurrent
                            ? 'text-[#C9A050] text-sm font-serif'
                            : 'text-[#E5E1D8]'
                        }`}
                      >
                        {d.planet} ({d.sanskrit})
                      </span>

                      {d.isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-[#C9A050] text-[#0D0D0F] font-bold text-[9px] uppercase tracking-wider">
                          ACTIVE DASHA
                        </span>
                      )}
                    </div>

                    <span className="font-mono text-[#9E9A90] text-[11px]">
                      {d.startDate.slice(0, 4)} –{' '}
                      {d.endDate.slice(0, 4)} (
                      {d.durationYears} Years)
                    </span>
                  </div>

                  {d.isCurrent && d.subPeriods && (
                    <div className="mt-3 pt-3 border-t border-[#2A2A2E]">
                      <span className="text-[9px] uppercase font-bold text-[#C9A050] block mb-1.5 tracking-wider">
                        Active Antardashas (Sub-Periods)
                      </span>

                      <div className="flex flex-wrap gap-1.5">
                        {d.subPeriods
                          .slice(0, 6)
                          .map((sub) => (
                            <span
                              key={sub.planet}
                              className={`px-2 py-1 rounded text-[11px] border ${
                                sub.isCurrent
                                  ? 'bg-[#C9A050] text-[#0D0D0F] font-bold border-[#C9A050]'
                                  : 'bg-[#1A1A1E] text-[#E5E1D8] border-[#2A2A2E]'
                              }`}
                            >
                              {sub.planet} (
                              {sub.startDate.slice(0, 7)})
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI COMPREHENSIVE SYNTHESIS (FULL WIDTH ACROSS ENTIRE PAGE) */}
      <div className="w-full bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2E] flex-wrap gap-3">
          <div>
            <h3 className="text-base font-serif font-bold text-[#F0ECE1] flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#C9A050]" />
              <span>
                AI Comprehensive Synthesis ({tradition.toUpperCase()})
              </span>
            </h3>
            <p className="text-xs text-[#9E9A90]">
              Deep AI analysis integrating chart positions, dashas & ancient rules
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {aiInterpretation && (
              <button
                onClick={() => handleSpeech(aiInterpretation)}
                className="p-2 rounded-lg bg-[#1A1A1E] border border-[#2A2A2E] text-[#E5E1D8] hover:text-white transition cursor-pointer text-xs flex items-center space-x-1"
              >
                <Volume2 className="w-4 h-4" />
                <span>{isPlayingAudio ? 'Stop' : 'Listen'}</span>
              </button>
            )}

            <button
              onClick={handleGenerateAIInterpretation}
              disabled={isLoadingAi}
              className="px-3.5 py-2 rounded-lg bg-[#C9A050]/15 hover:bg-[#C9A050]/25 border border-[#C9A050]/40 text-[#C9A050] font-bold text-xs shadow-sm transition cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Sparkles
                className={`w-3.5 h-3.5 ${
                  isLoadingAi ? 'animate-spin' : ''
                }`}
              />
              <span>
                {isLoadingAi
                  ? 'Synthesizing...'
                  : aiInterpretation
                  ? 'Regenerate Analysis'
                  : 'Run Full AI Analysis'}
              </span>
            </button>
          </div>
        </div>

        {isLoadingAi ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
            <div className="w-9 h-9 border-2 border-[#C9A050] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-[#C9A050] font-serif font-semibold">
              JyotishVeda AI synthesizing multi-tradition Vedic sutras...
            </p>
          </div>
        ) : aiInterpretation ? (
          <div className="prose prose-invert max-w-none text-[#E5E1D8] text-xs sm:text-sm leading-relaxed space-y-3 whitespace-pre-line bg-[#08080A] p-5 rounded-xl border border-[#2A2A2E] font-serif">
            {aiInterpretation}
          </div>
        ) : (
          <div className="text-center py-6 bg-[#1A1A1E]/40 rounded-xl border border-[#2A2A2E]">
            <p className="text-xs text-[#9E9A90] font-sans">
              Ready to generate a comprehensive synthesis combining{' '}
              <strong className="text-[#C9A050]">{tradition}</strong> rules with your active Dasha timeline and yogas.
            </p>
            <button
              onClick={handleGenerateAIInterpretation}
              className="mt-3 px-4 py-2 rounded-lg bg-[#C9A050]/15 hover:bg-[#C9A050]/25 border border-[#C9A050]/40 text-[#C9A050] text-xs font-semibold cursor-pointer transition"
            >
              Click to Generate Deep AI Interpretation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};