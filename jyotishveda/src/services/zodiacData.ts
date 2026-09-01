export interface ZodiacSign {
  id: string;
  name: string;
  sanskrit: string;
  symbol: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  modality: 'Cardinal' | 'Fixed' | 'Mutable';
  ruling_planet: string;
  tropical_dates: string;
  sidereal_dates: string;
  motto: string;
  chinese_archetype: string;
  nakshatras: string[];
  
  // These are now generated dynamically by AI, not stored in DB
  vitalityToday?: number;
  loveRating?: number;
  careerRating?: number;
  wealthRating?: number;
  todayForecast?: string;
  weeklyForecast?: string;
  monthlyForecast?: string;
  yearly2026Forecast?: string;
  luckyGemstone?: string;
  luckyColor?: string;
  luckyDay?: string;
  powerNumbers?: number[];
  resonantChakra?: string;
  affirmation?: string;
  bestRomanceMatches?: string[];
  bestCareerMatches?: string[];
  growthMatches?: string[];
}

export interface ZodiacCompatibilityResult {
  signA: ZodiacSign;
  signB: ZodiacSign;
  overallScore: number; // 0-100%
  elementSynergy: string;
  romanceAnalysis: string;
  intellectualAnalysis: string;
  growthPotential: string;
  remedialAdvice: string;
}

export function calculateZodiacCompatibility(
  signAId: string, 
  signBId: string, 
  system: 'tropical' | 'sidereal' = 'tropical',
  allSigns: ZodiacSign[]
): ZodiacCompatibilityResult {
  
  const signA = allSigns.find((s) => s.id === signAId) || allSigns[0];
  const signB = allSigns.find((s) => s.id === signBId) || allSigns[1];

  let baseScore = 75;

  if (signA.element === signB.element) {
    baseScore += signA.id === signB.id ? 12 : 18;
  } else if (
    (signA.element === 'Fire' && signB.element === 'Air') ||
    (signA.element === 'Air' && signB.element === 'Fire') ||
    (signA.element === 'Earth' && signB.element === 'Water') ||
    (signA.element === 'Water' && signB.element === 'Earth')
  ) {
    baseScore += 15;
  } else if (
    (signA.element === 'Fire' && signB.element === 'Water') ||
    (signA.element === 'Water' && signB.element === 'Fire')
  ) {
    baseScore -= 8;
  }

  if (signA.modality === signB.modality && signA.id !== signB.id) {
    baseScore += 2;
  }

  // We no longer check explicit matches because those arrays are dynamic now, 
  // we rely strictly on element and planetary synergy for the base math.
  
  if (system === 'sidereal') {
    const asuraGroup = ['Mercury', 'Venus', 'Saturn'];
    const devaGroup = ['Sun', 'Moon', 'Mars', 'Jupiter'];
    
    if (signA.ruler === signB.ruler) {
      baseScore += 4;
    } else if (asuraGroup.includes(signA.ruler) && asuraGroup.includes(signB.ruler)) {
      baseScore += 3;
    } else if (devaGroup.includes(signA.ruler) && devaGroup.includes(signB.ruler)) {
      baseScore += 3;
    } else {
      baseScore -= 6;
    }
    
    if (baseScore % 2 === 0) {
      baseScore -= 1;
    } else {
      baseScore += 2;
    }
  }

  let overallScore = Math.min(99, Math.max(55, baseScore));

  const isFireAir = (signA.element === 'Fire' && signB.element === 'Air') || (signA.element === 'Air' && signB.element === 'Fire');
  const isEarthWater = (signA.element === 'Earth' && signB.element === 'Water') || (signA.element === 'Water' && signB.element === 'Earth');

  let elementSynergy = `${signA.element} & ${signB.element} dynamic union.`;
  if (signA.element === signB.element) {
    elementSynergy = `Harmonious ${signA.element} Resonance: Innate mutual understanding and shared instinctual wavelength.`;
  } else if (isFireAir) {
    elementSynergy = `Dynamic Inspiration: Air fuels the Sacred Fire, generating endless enthusiasm and visionary ideas.`;
  } else if (isEarthWater) {
    elementSynergy = `Nourishing Manifestation: Water softens and enriches Earth, allowing grounded dreams to blossom into enduring reality.`;
  }

  return {
    signA,
    signB,
    overallScore,
    elementSynergy,
    romanceAnalysis: `The connection between ${signA.name} (${signA.symbol}) and ${signB.name} (${signB.symbol}) blends ${signA.ruling_planet}'s energetic qualities with ${signB.ruling_planet}'s guidance.`,
    intellectualAnalysis: `Communication flows with clarity when ${signA.name}'s ${signA.motto} philosophy interacts constructively with ${signB.name}'s natural perspective.`,
    growthPotential: `Both partners serve as mirrors for evolution, helping each other transcend limitations through compassionate dialogue and mutual respect.`,
    remedialAdvice: `Engage in shared meditation during twilight, honor each other's elemental needs, and wear harmonious resonant colors on joint endeavors.`,
  };
}
