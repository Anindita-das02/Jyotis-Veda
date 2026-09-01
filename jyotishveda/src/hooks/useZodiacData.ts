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

function generateDailyVitality(signId: string): number {
  // Generate a pseudo-random but stable daily vitality based on sign + date
  const today = new Date();
  const seed = signId.length + today.getDate() + today.getMonth() + today.getFullYear();
  return 60 + (seed * 7 + signId.charCodeAt(0) * 3) % 35;
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
        if (data.status === 'success') {
          // Map DB fields to frontend-expected fields
          const mapped = data.data.map((z: any) => ({
            ...z,
            // Core fields from DB (snake_case -> camelCase aliases)
            tropicalDates: z.tropical_dates,
            siderealDates: z.sidereal_dates,
            rulingPlanet: z.ruling_planet,
            chineseArchetype: z.chinese_archetype || z.chinese_archetype,
            
            // Derived display fields the UI expects
            sanskritName: SANSKRIT_NAMES[z.id] || z.sanskrit?.split('(')[0]?.trim() || z.name,
            sanskritScript: SANSKRIT_SCRIPTS[z.id] || z.sanskrit?.match(/\(([^)]+)\)/)?.[1] || '',
            glyph: GLYPHS[z.id] || z.symbol,
            polarity: POLARITIES[z.id] || 'Yang (+)',
            ruler: z.ruling_planet,
            sanskritRuler: SANSKRIT_RULERS[z.ruling_planet] || z.ruling_planet,
            
            // Daily vitality (pseudo-random, stable per day)
            vitalityToday: z.vitalityToday || generateDailyVitality(z.id),
            loveRating: z.loveRating || generateDailyVitality(z.id + '_love') % 30 + 65,
            careerRating: z.careerRating || generateDailyVitality(z.id + '_career') % 25 + 70,
            wealthRating: z.wealthRating || generateDailyVitality(z.id + '_wealth') % 28 + 68,
            
            // Fields the detail section needs (AI will override these dynamically)
            powerNumbers: z.powerNumbers || [generateDailyVitality(z.id) % 9 + 1, generateDailyVitality(z.id + 'p') % 9 + 1, generateDailyVitality(z.id + 'q') % 9 + 1],
            luckyGemstone: z.luckyGemstone || LUCKY_GEMSTONES[z.id] || 'Ruby',
            luckyColor: z.luckyColor || LUCKY_COLORS[z.id] || 'Gold',
            luckyDay: z.luckyDay || LUCKY_DAYS[z.id] || 'Sunday',
            affirmation: z.affirmation || AFFIRMATIONS[z.id] || 'I align with the cosmic flow.',
            resonantChakra: z.resonantChakra || CHAKRAS[z.id] || 'Solar Plexus',
            
            // Forecast placeholders (AI generates these)
            todayForecast: z.todayForecast || 'Click refresh to consult AI Daivajna for today\'s personalized cosmic reading.',
            weeklyForecast: z.weeklyForecast || 'Click refresh to consult AI Daivajna for this week\'s transit overview.',
            monthlyForecast: z.monthlyForecast || 'Click refresh to consult AI Daivajna for monthly planetary ingress analysis.',
            yearly2026Forecast: z.yearly2026Forecast || 'Click refresh to consult AI Daivajna for your 2026/2027 long-range panorama.',
            
            // Match arrays
            bestRomanceMatches: z.bestRomanceMatches || [],
            bestCareerMatches: z.bestCareerMatches || [],
            growthMatches: z.growthMatches || [],
          }));
          setZodiacs(mapped);
        } else {
          throw new Error(data.message || 'Error fetching data');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchZodiacs();
  }, []);

  return { zodiacs, loading, error };
}
