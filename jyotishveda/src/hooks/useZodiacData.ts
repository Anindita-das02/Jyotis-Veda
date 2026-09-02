import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';
import { ZodiacSign } from '../services/zodiacData';

// Sanskrit script mapping (Devanagari) for each zodiac
const SANSKRIT_SCRIPTS: Record<string, string> = {
  aries: 'मेष', taurus: 'वृषभ', gemini: 'मिथुन', cancer: 'कर्क',
  leo: 'सिंह', virgo: 'कन्या', libra: 'तुला', scorpio: 'वृश्चिक',
  sagittarius: 'धनु', capricorn: 'मकर', aquarius: 'कुम्भ', pisces: 'मीन'
};

const SANSKRIT_NAMES: Record<string, string> = {
  aries: 'Mesha', taurus: 'Vrishabha', gemini: 'Mithuna', cancer: 'Karka',
  leo: 'Simha', virgo: 'Kanya', libra: 'Tula', scorpio: 'Vrishchika',
  sagittarius: 'Dhanu', capricorn: 'Makara', aquarius: 'Kumbha', pisces: 'Meena'
};

const GLYPHS: Record<string, string> = {
  aries: '♈︎ Ram', taurus: '♉︎ Bull', gemini: '♊︎ Twins', cancer: '♋︎ Crab',
  leo: '♌︎ Lion', virgo: '♍︎ Maiden', libra: '♎︎ Scales', scorpio: '♏︎ Scorpion',
  sagittarius: '♐︎ Archer', capricorn: '♑︎ Sea-Goat', aquarius: '♒︎ Water-Bearer', pisces: '♓︎ Fish'
};

const POLARITIES: Record<string, string> = {
  aries: 'Yang (+)', taurus: 'Yin (−)', gemini: 'Yang (+)', cancer: 'Yin (−)',
  leo: 'Yang (+)', virgo: 'Yin (−)', libra: 'Yang (+)', scorpio: 'Yin (−)',
  sagittarius: 'Yang (+)', capricorn: 'Yin (−)', aquarius: 'Yang (+)', pisces: 'Yin (−)'
};

const SANSKRIT_RULERS: Record<string, string> = {
  Mars: 'Mangal', Venus: 'Shukra', Mercury: 'Budha', Moon: 'Chandra',
  Sun: 'Surya', Jupiter: 'Guru', Saturn: 'Shani'
};

function generateDailyVitality(signId: any): number {
  // Generate a pseudo-random but stable daily vitality based on sign + date
  const str = String(signId || 'aries');
  const today = new Date();
  const seed = str.length + today.getDate() + today.getMonth() + today.getFullYear();
  const charCode = str.length > 0 ? str.charCodeAt(0) : 65;
  return 60 + (seed * 7 + charCode * 3) % 35;
}

const LUCKY_GEMSTONES: Record<string, string> = {
  aries: 'Red Coral (Moonga)', taurus: 'Diamond (Heera)', gemini: 'Emerald (Panna)',
  cancer: 'Pearl (Moti)', leo: 'Ruby (Manik)', virgo: 'Emerald (Panna)',
  libra: 'Diamond (Heera)', scorpio: 'Red Coral (Moonga)', sagittarius: 'Yellow Sapphire (Pukhraj)',
  capricorn: 'Blue Sapphire (Neelam)', aquarius: 'Blue Sapphire (Neelam)', pisces: 'Yellow Sapphire (Pukhraj)'
};

const LUCKY_COLORS: Record<string, string> = {
  aries: 'Scarlet Red', taurus: 'Emerald Green', gemini: 'Bright Yellow',
  cancer: 'Silver White', leo: 'Royal Gold', virgo: 'Forest Green',
  libra: 'Pastel Pink', scorpio: 'Deep Crimson', sagittarius: 'Purple',
  capricorn: 'Dark Brown', aquarius: 'Electric Blue', pisces: 'Sea Green'
};

const LUCKY_DAYS: Record<string, string> = {
  aries: 'Tuesday', taurus: 'Friday', gemini: 'Wednesday',
  cancer: 'Monday', leo: 'Sunday', virgo: 'Wednesday',
  libra: 'Friday', scorpio: 'Tuesday', sagittarius: 'Thursday',
  capricorn: 'Saturday', aquarius: 'Saturday', pisces: 'Thursday'
};

const AFFIRMATIONS: Record<string, string> = {
  aries: 'I boldly forge my own destiny with courage and fire.',
  taurus: 'I am grounded in abundance and attract prosperity effortlessly.',
  gemini: 'My mind is a bridge between worlds, sharp and ever-curious.',
  cancer: 'I nurture with love and my intuition guides me home.',
  leo: 'I shine with authentic radiance; the universe celebrates my light.',
  virgo: 'I refine the world with precision and serve with grace.',
  libra: 'I create harmony in all relationships and honor justice.',
  scorpio: 'I transform through depth; my power lies in rebirth.',
  sagittarius: 'I expand beyond horizons; wisdom is my compass.',
  capricorn: 'I build legacies with discipline; time is my ally.',
  aquarius: 'I innovate for humanity; my vision shapes the future.',
  pisces: 'I flow with cosmic currents; my compassion heals the world.'
};

const CHAKRAS: Record<string, string> = {
  aries: 'Solar Plexus (Manipura)', taurus: 'Heart (Anahata)', gemini: 'Throat (Vishuddha)',
  cancer: 'Sacral (Svadhisthana)', leo: 'Solar Plexus (Manipura)', virgo: 'Throat (Vishuddha)',
  libra: 'Heart (Anahata)', scorpio: 'Root (Muladhara)', sagittarius: 'Third Eye (Ajna)',
  capricorn: 'Root (Muladhara)', aquarius: 'Third Eye (Ajna)', pisces: 'Crown (Sahasrara)'
};

export function useZodiacData() {
  const [zodiacs, setZodiacs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchZodiacs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/zodiac/all`);
        if (!response.ok) {
          throw new Error('Failed to fetch zodiacs');
        }
        const data = await response.json();
        if (data.status === 'success' && Array.isArray(data.data)) {
          // Map DB fields to frontend-expected fields
          const mapped = data.data.map((z: any) => {
            const canonicalId = String(
              z.slug || z.sign_id || (typeof z.id === 'string' && isNaN(Number(z.id)) ? z.id : '') || z.name || 'aries'
            ).toLowerCase().trim();

            return {
              ...z,
              id: canonicalId,
              // Core fields from DB (snake_case -> camelCase aliases)
              tropicalDates: z.tropical_dates || z.tropicalDates || '',
              siderealDates: z.sidereal_dates || z.siderealDates || '',
              rulingPlanet: z.ruling_planet || z.rulingPlanet || '',
              chineseArchetype: z.chinese_archetype || z.chineseArchetype || '',
              
              // Derived display fields the UI expects
              sanskritName: SANSKRIT_NAMES[canonicalId] || z.sanskrit?.split('(')[0]?.trim() || z.name,
              sanskritScript: SANSKRIT_SCRIPTS[canonicalId] || z.sanskrit?.match(/\(([^)]+)\)/)?.[1] || '',
              glyph: GLYPHS[canonicalId] || z.symbol || '♈︎',
              polarity: POLARITIES[canonicalId] || 'Yang (+)',
              ruler: z.ruling_planet || z.rulingPlanet || 'Mars',
              sanskritRuler: SANSKRIT_RULERS[z.ruling_planet || z.rulingPlanet] || z.ruling_planet || 'Mangal',
              
              // Daily vitality (pseudo-random, stable per day)
              vitalityToday: z.vitalityToday || generateDailyVitality(canonicalId),
              loveRating: z.loveRating || (generateDailyVitality(canonicalId + '_love') % 30 + 65),
              careerRating: z.careerRating || (generateDailyVitality(canonicalId + '_career') % 25 + 70),
              wealthRating: z.wealthRating || (generateDailyVitality(canonicalId + '_wealth') % 28 + 68),
              
              // Fields the detail section needs (AI will override these dynamically)
              powerNumbers: z.powerNumbers || [generateDailyVitality(canonicalId) % 9 + 1, generateDailyVitality(canonicalId + 'p') % 9 + 1, generateDailyVitality(canonicalId + 'q') % 9 + 1],
              luckyGemstone: z.luckyGemstone || LUCKY_GEMSTONES[canonicalId] || 'Ruby',
              luckyColor: z.luckyColor || LUCKY_COLORS[canonicalId] || 'Gold',
              luckyDay: z.luckyDay || LUCKY_DAYS[canonicalId] || 'Sunday',
              affirmation: z.affirmation || AFFIRMATIONS[canonicalId] || 'I align with the cosmic flow.',
              resonantChakra: z.resonantChakra || CHAKRAS[canonicalId] || 'Solar Plexus',
              
              // Forecast placeholders (AI generates these)
              todayForecast: z.todayForecast || 'Click refresh to consult AI Daivajna for today\'s personalized cosmic reading.',
              weeklyForecast: z.weeklyForecast || 'Click refresh to consult AI Daivajna for this week\'s transit overview.',
              monthlyForecast: z.monthlyForecast || 'Click refresh to consult AI Daivajna for monthly planetary ingress analysis.',
              yearly2026Forecast: z.yearly2026Forecast || 'Click refresh to consult AI Daivajna for your 2026/2027 long-range panorama.',
              
              // Match arrays
              bestRomanceMatches: z.bestRomanceMatches || [],
              bestCareerMatches: z.bestCareerMatches || [],
              growthMatches: z.growthMatches || [],
            };
          });
          setZodiacs(mapped);
          setError(null);
        } else {
          throw new Error(data.message || 'Error fetching data');
        }
      } catch (err: any) {
        console.error('Error fetching zodiacs:', err);
        setError(err.message || 'Failed to load zodiac data');
      } finally {
        setLoading(false);
      }
    };

    fetchZodiacs();
  }, []);

  return { zodiacs, loading, error };
}
