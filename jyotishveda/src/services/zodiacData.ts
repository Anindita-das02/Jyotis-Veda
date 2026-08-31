export interface ZodiacSign {
  id: string;
  name: string;
  sanskritName: string;
  sanskritScript: string;
  symbol: string;
  glyph: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  modality: 'Cardinal' | 'Fixed' | 'Mutable';
  polarity: 'Yang (Active)' | 'Yin (Receptive)';
  ruler: string;
  sanskritRuler: string;
  tropicalDates: string; // e.g. Mar 21 – Apr 19
  siderealDates: string; // e.g. Apr 14 – May 14
  motto: string;
  chineseArchetype: string;
  nakshatras: string[];
  summary: string;
  vitalityToday: number; // 0-100
  loveRating: number; // 0-100
  careerRating: number; // 0-100
  wealthRating: number; // 0-100
  todayForecast: string;
  weeklyForecast: string;
  monthlyForecast: string;
  yearly2026Forecast: string;
  luckyGemstone: string;
  luckyColor: string;
  luckyDay: string;
  powerNumbers: number[];
  resonantChakra: string;
  affirmation: string;
  bestRomanceMatches: string[];
  bestCareerMatches: string[];
  growthMatches: string[];
}

export const ZODIAC_SIGNS: ZodiacSign[] = [
  {
    id: 'aries',
    name: 'Aries',
    sanskritName: 'Mesha',
    sanskritScript: 'मेष',
    symbol: '♈',
    glyph: 'The Ram',
    element: 'Fire',
    modality: 'Cardinal',
    polarity: 'Yang (Active)',
    ruler: 'Mars',
    sanskritRuler: 'Mangala (मंगल)',
    tropicalDates: 'March 21 – April 19',
    siderealDates: 'April 14 – May 14',
    motto: 'I Am & I Lead',
    chineseArchetype: 'Dragon / Tiger Synergy (Pioneering Courage)',
    nakshatras: ['Ashwini (1-4)', 'Bharani (1-4)', 'Krittika (1st Pada)'],
    summary: 'zodiac.aries.summary',
    vitalityToday: 92,
    loveRating: 84,
    careerRating: 95,
    wealthRating: 88,
    todayForecast: 'zodiac.aries.todayForecast',
    weeklyForecast: 'The upcoming Moon-Jupiter trine enhances your confidence in professional pitches and creative ventures. Mid-week brings unexpected financial windfalls.',
    monthlyForecast: 'Solar transit illuminates long-range investments and bold executive initiatives. Focus on building durable alliances while avoiding impulsive commitments.',
    yearly2026Forecast: '2026/2027 marks a transformational chapter of sovereign leadership and expansion into global arenas as Saturn anchors your discipline while Jupiter showers professional recognition.',
    luckyGemstone: 'zodiac.aries.luckyGemstone',
    luckyColor: 'zodiac.aries.luckyColor',
    luckyDay: 'zodiac.aries.luckyDay',
    powerNumbers: [9, 18, 27, 1],
    resonantChakra: 'Manipura (Solar Plexus) & Muladhara',
    affirmation: 'zodiac.aries.affirmation',
    bestRomanceMatches: ['Leo', 'Sagittarius', 'Gemini'],
    bestCareerMatches: ['Capricorn', 'Aquarius', 'Leo'],
    growthMatches: ['Cancer', 'Libra', 'Scorpio'],
  },
  {
    id: 'taurus',
    name: 'Taurus',
    sanskritName: 'Vrishabha',
    sanskritScript: 'वृषभ',
    symbol: '♉',
    glyph: 'The Celestial Bull',
    element: 'Earth',
    modality: 'Fixed',
    polarity: 'Yin (Receptive)',
    ruler: 'Venus',
    sanskritRuler: 'Shukra (शुक्र)',
    tropicalDates: 'April 20 – May 20',
    siderealDates: 'May 15 – June 14',
    motto: 'I Have & I Cultivate',
    chineseArchetype: 'Ox Archetype (Enduring Abundance & Steadfast Grounding)',
    nakshatras: ['Krittika (2-4)', 'Rohini (1-4)', 'Mrigashira (1-2)'],
    summary: 'zodiac.taurus.summary',
    vitalityToday: 89,
    loveRating: 94,
    careerRating: 86,
    wealthRating: 96,
    todayForecast: 'zodiac.taurus.todayForecast',
    weeklyForecast: 'Patience reaps extraordinary rewards as ongoing business endeavors mature. Favorable cosmic winds support property and luxury asset decisions.',
    monthlyForecast: 'A new moon in your domestic sphere invites home revitalization and heartfelt reconciliation with family members.',
    yearly2026Forecast: 'Jupiter blesses your 2nd and 11th houses, generating substantial long-term wealth growth, real estate expansion, and elevated cultural prestige.',
    luckyGemstone: 'zodiac.taurus.luckyGemstone',
    luckyColor: 'zodiac.taurus.luckyColor',
    luckyDay: 'zodiac.taurus.luckyDay',
    powerNumbers: [6, 15, 24, 5],
    resonantChakra: 'Anahata (Heart Chakra)',
    affirmation: 'zodiac.taurus.affirmation',
    bestRomanceMatches: ['Virgo', 'Capricorn', 'Cancer'],
    bestCareerMatches: ['Taurus', 'Virgo', 'Pisces'],
    growthMatches: ['Scorpio', 'Aquarius', 'Leo'],
  },
  {
    id: 'gemini',
    name: 'Gemini',
    sanskritName: 'Mithuna',
    sanskritScript: 'मिथुन',
    symbol: '♊',
    glyph: 'The Divine Twins',
    element: 'Air',
    modality: 'Mutable',
    polarity: 'Yang (Active)',
    ruler: 'Mercury',
    sanskritRuler: 'Budha (बुध)',
    tropicalDates: 'May 21 – June 20',
    siderealDates: 'June 15 – July 15',
    motto: 'I Think & I Connect',
    chineseArchetype: 'Monkey Archetype (Agile Intellect & Dynamic Versatility)',
    nakshatras: ['Mrigashira (3-4)', 'Ardra (1-4)', 'Punarvasu (1-3)'],
    summary: 'zodiac.gemini.summary',
    vitalityToday: 86,
    loveRating: 88,
    careerRating: 93,
    wealthRating: 85,
    todayForecast: 'zodiac.gemini.todayForecast',
    weeklyForecast: 'Public speaking, content creation, and strategic publishing receive stellar celestial backing. Keep note of dream visions and sudden insights.',
    monthlyForecast: 'A pivotal shift in your networking sector expands your diaspora circle and introduces visionary mentors.',
    yearly2026Forecast: 'Mastery over communications, cross-border business, and technological innovation will propel your career into widespread prominence.',
    luckyGemstone: 'zodiac.gemini.luckyGemstone',
    luckyColor: 'zodiac.gemini.luckyColor',
    luckyDay: 'zodiac.gemini.luckyDay',
    powerNumbers: [5, 14, 23, 3],
    resonantChakra: 'Vishuddha (Throat Chakra)',
    affirmation: 'zodiac.gemini.affirmation',
    bestRomanceMatches: ['Libra', 'Aquarius', 'Aries'],
    bestCareerMatches: ['Gemini', 'Sagittarius', 'Leo'],
    growthMatches: ['Virgo', 'Pisces', 'Sagittarius'],
  },
  {
    id: 'cancer',
    name: 'Cancer',
    sanskritName: 'Karka',
    sanskritScript: 'कर्क',
    symbol: '♋',
    glyph: 'The Celestial Crab',
    element: 'Water',
    modality: 'Cardinal',
    polarity: 'Yin (Receptive)',
    ruler: 'Moon',
    sanskritRuler: 'Chandra (चन्द्र)',
    tropicalDates: 'June 21 – July 22',
    siderealDates: 'July 16 – August 16',
    motto: 'I Feel & I Nurture',
    chineseArchetype: 'Rabbit / Sheep Archetype (Intuitive Protection & Deep Empathy)',
    nakshatras: ['Punarvasu (4th Pada)', 'Pushya (1-4)', 'Ashlesha (1-4)'],
    summary: 'zodiac.cancer.summary',
    vitalityToday: 88,
    loveRating: 96,
    careerRating: 84,
    wealthRating: 90,
    todayForecast: 'zodiac.cancer.todayForecast',
    weeklyForecast: 'Pushya nakshatra alignment brings profound spiritual serenity, family celebrations, and auspicious timing for entering new agreements.',
    monthlyForecast: 'Focus turns toward legacy planning and honoring roots. A powerful moment to align financial security with emotional well-being.',
    yearly2026Forecast: 'Emotional self-mastery and real estate achievements define this era. You become a beacon of refuge and community support for your diaspora.',
    luckyGemstone: 'zodiac.cancer.luckyGemstone',
    luckyColor: 'zodiac.cancer.luckyColor',
    luckyDay: 'zodiac.cancer.luckyDay',
    powerNumbers: [2, 11, 20, 7],
    resonantChakra: 'Swadhisthana (Sacral Chakra) & Anahata',
    affirmation: 'zodiac.cancer.affirmation',
    bestRomanceMatches: ['Scorpio', 'Pisces', 'Taurus'],
    bestCareerMatches: ['Cancer', 'Capricorn', 'Virgo'],
    growthMatches: ['Aries', 'Libra', 'Capricorn'],
  },
  {
    id: 'leo',
    name: 'Leo',
    sanskritName: 'Simha',
    sanskritScript: 'सिंह',
    symbol: '♌',
    glyph: 'The Royal Lion',
    element: 'Fire',
    modality: 'Fixed',
    polarity: 'Yang (Active)',
    ruler: 'Sun',
    sanskritRuler: 'Surya (सूर्य)',
    tropicalDates: 'July 23 – August 22',
    siderealDates: 'August 17 – September 16',
    motto: 'I Will & I Radiate',
    chineseArchetype: 'Tiger / Lion Archetype (Magnanimous Sovereignty & Charisma)',
    nakshatras: ['Magha (1-4)', 'Purva Phalguni (1-4)', 'Uttara Phalguni (1st Pada)'],
    summary: 'zodiac.leo.summary',
    vitalityToday: 97,
    loveRating: 91,
    careerRating: 98,
    wealthRating: 92,
    todayForecast: 'zodiac.leo.todayForecast',
    weeklyForecast: 'A dramatic elevation in public reputation. Honor your creative gifts and maintain gracious humility to win over influential stakeholders.',
    monthlyForecast: 'Magha nakshatra influences awaken ancestral blessings and legacy recognition. Financial expansion through leadership roles is assured.',
    yearly2026Forecast: 'A golden multi-year epoch for career triumphs, global stage presence, and philanthropic patronage that leaves an indelible mark.',
    luckyGemstone: 'zodiac.leo.luckyGemstone',
    luckyColor: 'zodiac.leo.luckyColor',
    luckyDay: 'zodiac.leo.luckyDay',
    powerNumbers: [1, 10, 19, 28],
    resonantChakra: 'Sahasrara & Manipura (Crown & Solar Plexus)',
    affirmation: 'zodiac.leo.affirmation',
    bestRomanceMatches: ['Aries', 'Sagittarius', 'Libra'],
    bestCareerMatches: ['Aries', 'Gemini', 'Scorpio'],
    growthMatches: ['Taurus', 'Scorpio', 'Aquarius'],
  },
  {
    id: 'virgo',
    name: 'Virgo',
    sanskritName: 'Kanya',
    sanskritScript: 'कन्या',
    symbol: '♍',
    glyph: 'The Celestial Maiden',
    element: 'Earth',
    modality: 'Mutable',
    polarity: 'Yin (Receptive)',
    ruler: 'Mercury',
    sanskritRuler: 'Budha (बुध)',
    tropicalDates: 'August 23 – September 22',
    siderealDates: 'September 17 – October 16',
    motto: 'I Analyze & I Perfect',
    chineseArchetype: 'Rooster / Snake Archetype (Methodical Mastery & Discernment)',
    nakshatras: ['Uttara Phalguni (2-4)', 'Hasta (1-4)', 'Chitra (1-2)'],
    summary: 'zodiac.virgo.summary',
    vitalityToday: 87,
    loveRating: 83,
    careerRating: 94,
    wealthRating: 91,
    todayForecast: 'zodiac.virgo.todayForecast',
    weeklyForecast: 'A health and wellness reset pays dividends in daily productivity. Streamline your operational workflows and delegate administrative tasks.',
    monthlyForecast: 'Financial auditing reveals new revenue streams and investment optimizations. Professional praise comes from senior executives.',
    yearly2026Forecast: 'Elevated technical authority, publishing mastery, and wellness industry leadership bring profound recognition and sustainable prosperity.',
    luckyGemstone: 'zodiac.virgo.luckyGemstone',
    luckyColor: 'zodiac.virgo.luckyColor',
    luckyDay: 'zodiac.virgo.luckyDay',
    powerNumbers: [5, 14, 23, 6],
    resonantChakra: 'Vishuddha & Anahata',
    affirmation: 'zodiac.virgo.affirmation',
    bestRomanceMatches: ['Taurus', 'Capricorn', 'Scorpio'],
    bestCareerMatches: ['Taurus', 'Virgo', 'Aquarius'],
    growthMatches: ['Gemini', 'Sagittarius', 'Pisces'],
  },
  {
    id: 'libra',
    name: 'Libra',
    sanskritName: 'Tula',
    sanskritScript: 'तुला',
    symbol: '♎',
    glyph: 'The Cosmic Scales',
    element: 'Air',
    modality: 'Cardinal',
    polarity: 'Yang (Active)',
    ruler: 'Venus',
    sanskritRuler: 'Shukra (शुक्र)',
    tropicalDates: 'September 23 – October 22',
    siderealDates: 'October 17 – November 15',
    motto: 'I Balance & I Harmonize',
    chineseArchetype: 'Dog / Pig Archetype (Diplomatic Grace & Aesthetic Concord)',
    nakshatras: ['Chitra (3-4)', 'Swati (1-4)', 'Vishakha (1-3)'],
    summary: 'zodiac.libra.summary',
    vitalityToday: 90,
    loveRating: 97,
    careerRating: 88,
    wealthRating: 91,
    todayForecast: 'zodiac.libra.todayForecast',
    weeklyForecast: 'Partnerships take center stage. Collaborative alliances formed this week contain extraordinary mutual prosperity potential.',
    monthlyForecast: 'Artistic, legal, and public relations endeavors flourish. Treat yourself to aesthetic surroundings and cultural celebrations.',
    yearly2026Forecast: 'A grand harmonization of relationships, international joint ventures, and cultural diplomacy marks your rising global trajectory.',
    luckyGemstone: 'zodiac.libra.luckyGemstone',
    luckyColor: 'zodiac.libra.luckyColor',
    luckyDay: 'zodiac.libra.luckyDay',
    powerNumbers: [6, 15, 24, 7],
    resonantChakra: 'Anahata & Ajna (Heart & Third Eye)',
    affirmation: 'zodiac.libra.affirmation',
    bestRomanceMatches: ['Gemini', 'Aquarius', 'Leo'],
    bestCareerMatches: ['Libra', 'Gemini', 'Sagittarius'],
    growthMatches: ['Aries', 'Cancer', 'Capricorn'],
  },
  {
    id: 'scorpio',
    name: 'Scorpio',
    sanskritName: 'Vrishchika',
    sanskritScript: 'वृश्चिक',
    symbol: '♏',
    glyph: 'The Phoenix Scorpion',
    element: 'Water',
    modality: 'Fixed',
    polarity: 'Yin (Receptive)',
    ruler: 'Mars & Pluto',
    sanskritRuler: 'Mangala & Ketu (मंगल / केतु)',
    tropicalDates: 'October 23 – November 21',
    siderealDates: 'November 16 – December 15',
    motto: 'I Transform & I Pierce Truth',
    chineseArchetype: 'Snake / Dragon Archetype (Mystic Depth & Alchemical Power)',
    nakshatras: ['Vishakha (4th Pada)', 'Anuradha (1-4)', 'Jyeshtha (1-4)'],
    summary: 'zodiac.scorpio.summary',
    vitalityToday: 94,
    loveRating: 92,
    careerRating: 96,
    wealthRating: 97,
    todayForecast: 'zodiac.scorpio.todayForecast',
    weeklyForecast: 'Psychological breakthroughs and occult/esoteric studies yield life-changing clarity. Financial returns from royalties or shared resources spike.',
    monthlyForecast: 'A regenerative transit purges obsolete obligations, leaving you in an unassailable position of sovereign authority.',
    yearly2026Forecast: 'Karmic rebirth and immense wealth consolidation. You step into immense spiritual and material mastery across global spheres.',
    luckyGemstone: 'zodiac.scorpio.luckyGemstone',
    luckyColor: 'zodiac.scorpio.luckyColor',
    luckyDay: 'zodiac.scorpio.luckyDay',
    powerNumbers: [9, 18, 27, 4],
    resonantChakra: 'Muladhara & Swadhisthana (Root & Kundalini Gate)',
    affirmation: 'zodiac.scorpio.affirmation',
    bestRomanceMatches: ['Cancer', 'Pisces', 'Virgo'],
    bestCareerMatches: ['Scorpio', 'Capricorn', 'Taurus'],
    growthMatches: ['Leo', 'Aquarius', 'Taurus'],
  },
  {
    id: 'sagittarius',
    name: 'Sagittarius',
    sanskritName: 'Dhanu',
    sanskritScript: 'धनु',
    symbol: '♐',
    glyph: 'The Golden Archer',
    element: 'Fire',
    modality: 'Mutable',
    polarity: 'Yang (Active)',
    ruler: 'Jupiter',
    sanskritRuler: 'Guru / Brihaspati (बृहस्पति)',
    tropicalDates: 'November 22 – December 21',
    siderealDates: 'December 16 – January 14',
    motto: 'I Seek & I Expand',
    chineseArchetype: 'Horse Archetype (Expansive Freedom, Wisdom & Odyssey)',
    nakshatras: ['Mula (1-4)', 'Purva Ashadha (1-4)', 'Uttara Ashadha (1st Pada)'],
    summary: 'zodiac.sagittarius.summary',
    vitalityToday: 95,
    loveRating: 89,
    careerRating: 93,
    wealthRating: 94,
    todayForecast: 'zodiac.sagittarius.todayForecast',
    weeklyForecast: 'Purva Ashadha water energy fuels unbeatable persuasive authority. Philosophical insights resolve long-term dilemmas for yourself and your peers.',
    monthlyForecast: 'Cross-border ventures bring lucrative contracts. Mentor younger seekers and celebrate your expansive worldview.',
    yearly2026Forecast: 'Jupiter’s monumental transit bestows spiritual awakening, honorary titles, international book releases, and visionary mentorship status.',
    luckyGemstone: 'zodiac.sagittarius.luckyGemstone',
    luckyColor: 'zodiac.sagittarius.luckyColor',
    luckyDay: 'zodiac.sagittarius.luckyDay',
    powerNumbers: [3, 12, 21, 30],
    resonantChakra: 'Ajna & Sahasrara (Third Eye & Crown)',
    affirmation: 'zodiac.sagittarius.affirmation',
    bestRomanceMatches: ['Aries', 'Leo', 'Aquarius'],
    bestCareerMatches: ['Aries', 'Sagittarius', 'Libra'],
    growthMatches: ['Virgo', 'Pisces', 'Gemini'],
  },
  {
    id: 'capricorn',
    name: 'Capricorn',
    sanskritName: 'Makara',
    sanskritScript: 'मकर',
    symbol: '♑',
    glyph: 'The Mountain Sea-Goat',
    element: 'Earth',
    modality: 'Cardinal',
    polarity: 'Yin (Receptive)',
    ruler: 'Saturn',
    sanskritRuler: 'Shani (शनि)',
    tropicalDates: 'December 22 – January 19',
    siderealDates: 'January 15 – February 12',
    motto: 'I Master & I Endure',
    chineseArchetype: 'Ox / Rat Synergy (Strategic Endurance & Executive Empire)',
    nakshatras: ['Uttara Ashadha (2-4)', 'Shravana (1-4)', 'Dhanishta (1-2)'],
    summary: 'zodiac.capricorn.summary',
    vitalityToday: 91,
    loveRating: 82,
    careerRating: 99,
    wealthRating: 96,
    todayForecast: 'zodiac.capricorn.todayForecast',
    weeklyForecast: 'Milestone career deliverables cross the finish line with resounding acclaim. Long-term capital investments show robust upward stability.',
    monthlyForecast: 'Saturnian discipline refines your lifestyle and executive routines. You become an immovable pillar of strength in your field.',
    yearly2026Forecast: 'Historic legacy building, monumental executive governance, and real estate dynasty creation define your 2026/2027 panorama.',
    luckyGemstone: 'zodiac.capricorn.luckyGemstone',
    luckyColor: 'zodiac.capricorn.luckyColor',
    luckyDay: 'zodiac.capricorn.luckyDay',
    powerNumbers: [8, 17, 26, 4],
    resonantChakra: 'Muladhara (Root Chakra)',
    affirmation: 'zodiac.capricorn.affirmation',
    bestRomanceMatches: ['Taurus', 'Virgo', 'Scorpio'],
    bestCareerMatches: ['Taurus', 'Aries', 'Virgo'],
    growthMatches: ['Aries', 'Cancer', 'Libra'],
  },
  {
    id: 'aquarius',
    name: 'Aquarius',
    sanskritName: 'Kumbha',
    sanskritScript: 'कुम्भ',
    symbol: '♒',
    glyph: 'The Cosmic Water-Bearer',
    element: 'Air',
    modality: 'Fixed',
    polarity: 'Yang (Active)',
    ruler: 'Saturn & Uranus',
    sanskritRuler: 'Shani & Rahu (शनि / राहु)',
    tropicalDates: 'January 20 – February 18',
    siderealDates: 'February 13 – March 13',
    motto: 'I Know & I Innovate',
    chineseArchetype: 'Tiger / Monkey Archetype (Futuristic Visionary & Humanitarian)',
    nakshatras: ['Dhanishta (3-4)', 'Shatabhisha (1-4)', 'Purva Bhadrapada (1-3)'],
    summary: 'zodiac.aquarius.summary',
    vitalityToday: 93,
    loveRating: 86,
    careerRating: 95,
    wealthRating: 92,
    todayForecast: 'zodiac.aquarius.todayForecast',
    weeklyForecast: 'Grassroots movements, digital platforms, and open-source collaborations receive extraordinary viral resonance.',
    monthlyForecast: 'Unconventional investment strategies in frontier technologies yield surprising windfalls. Stay true to your humanitarian ethos.',
    yearly2026Forecast: 'A golden epoch for revolutionizing your industry, leading visionary global communities, and creating planetary positive impact.',
    luckyGemstone: 'zodiac.aquarius.luckyGemstone',
    luckyColor: 'zodiac.aquarius.luckyColor',
    luckyDay: 'zodiac.aquarius.luckyDay',
    powerNumbers: [4, 13, 22, 31, 8],
    resonantChakra: 'Ajna & Vishuddha',
    affirmation: 'zodiac.aquarius.affirmation',
    bestRomanceMatches: ['Gemini', 'Libra', 'Sagittarius'],
    bestCareerMatches: ['Aquarius', 'Gemini', 'Aries'],
    growthMatches: ['Taurus', 'Leo', 'Scorpio'],
  },
  {
    id: 'pisces',
    name: 'Pisces',
    sanskritName: 'Meena',
    sanskritScript: 'मीन',
    symbol: '♓',
    glyph: 'The Two Cosmic Fishes',
    element: 'Water',
    modality: 'Mutable',
    polarity: 'Yin (Receptive)',
    ruler: 'Jupiter & Neptune',
    sanskritRuler: 'Guru / Brihaspati (बृहस्पति)',
    tropicalDates: 'February 19 – March 20',
    siderealDates: 'March 14 – April 13',
    motto: 'I Believe & I Transcends',
    chineseArchetype: 'Rabbit / Pig Archetype (Mystic Compassion & Universal Ocean)',
    nakshatras: ['Purva Bhadrapada (4th Pada)', 'Uttara Bhadrapada (1-4)', 'Revati (1-4)'],
    summary: 'zodiac.pisces.summary',
    vitalityToday: 91,
    loveRating: 98,
    careerRating: 87,
    wealthRating: 90,
    todayForecast: 'zodiac.pisces.todayForecast',
    weeklyForecast: 'Philanthropic ventures, artistic compositions, and international ocean crossings bring immense soul fulfillment.',
    monthlyForecast: 'Financial karma resolves in your favor through unexpected forgiveness and divine synchronicity. Maintain healthy energetic boundaries.',
    yearly2026Forecast: 'A transcendent era of spiritual realization, artistic masterpieces, international acclaim, and peaceful inner liberation.',
    luckyGemstone: 'zodiac.pisces.luckyGemstone',
    luckyColor: 'zodiac.pisces.luckyColor',
    luckyDay: 'zodiac.pisces.luckyDay',
    powerNumbers: [3, 7, 12, 21],
    resonantChakra: 'Sahasrara (Crown of Cosmic Unity)',
    affirmation: 'zodiac.pisces.affirmation',
    bestRomanceMatches: ['Cancer', 'Scorpio', 'Taurus'],
    bestCareerMatches: ['Pisces', 'Cancer', 'Virgo'],
    growthMatches: ['Gemini', 'Virgo', 'Sagittarius'],
  },
];

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

export function calculateZodiacCompatibility(signAId: string, signBId: string, system: 'tropical' | 'sidereal' = 'tropical'): ZodiacCompatibilityResult {
  const signA = ZODIAC_SIGNS.find((s) => s.id === signAId) || ZODIAC_SIGNS[0];
  const signB = ZODIAC_SIGNS.find((s) => s.id === signBId) || ZODIAC_SIGNS[1];

  let baseScore = 75;

  // Same element (Fire+Fire, Earth+Earth, etc.)
  if (signA.element === signB.element) {
    baseScore += signA.id === signB.id ? 12 : 18; // slightly lower for identical signs
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

  // Modality checks
  if (signA.modality === signB.modality && signA.id !== signB.id) {
    baseScore += 2;
  }

  // Bonus for explicit matches
  if (signA.bestRomanceMatches.includes(signB.name)) {
    baseScore += 5;
  }
  if (signA.growthMatches.includes(signB.name)) {
    baseScore += 3;
  }
  if (signB.bestRomanceMatches.includes(signA.name)) {
    baseScore += 5;
  }

  // Vedic Sidereal specific adjustments (e.g. planetary friendships can shift scores slightly)
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
      baseScore -= 6; // Cross-group friction in Vedic
    }
    
    // Ensure there is always a slight visible shift for the user to see the system changed
    if (baseScore % 2 === 0) {
      baseScore -= 1;
    } else {
      baseScore += 2;
    }
  }

  // Calculate final score with a slightly lower cap for tropical so sidereal can exceed it, or just use 99
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
    romanceAnalysis: `The connection between ${signA.name} (${signA.glyph}) and ${signB.name} (${signB.glyph}) blends ${signA.ruler}'s energetic qualities with ${signB.ruler}'s guidance, producing a compelling balance of passion and loyalty.`,
    intellectualAnalysis: `Communication flows with clarity when ${signA.name}'s ${signA.motto} philosophy interacts constructively with ${signB.name}'s natural perspective.`,
    growthPotential: `Both partners serve as mirrors for evolution, helping each other transcend limitations through compassionate dialogue and mutual respect.`,
    remedialAdvice: `Engage in shared meditation during twilight, honor each other's elemental needs, and wear harmonious resonant colors on joint endeavors.`,
  };
}
