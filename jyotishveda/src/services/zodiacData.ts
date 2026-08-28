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
    summary: 'Fearless initiator of the cosmic cycle, ruled by dynamic vitality, unyielding drive, and spontaneous leadership.',
    vitalityToday: 92,
    loveRating: 84,
    careerRating: 95,
    wealthRating: 88,
    todayForecast: 'Mars energizes your 1st house sector, igniting swift decisive breakthroughs in leadership, negotiations, and personal projects. Speak with clarity and channel this fiery momentum into constructive action.',
    weeklyForecast: 'The upcoming Moon-Jupiter trine enhances your confidence in professional pitches and creative ventures. Mid-week brings unexpected financial windfalls.',
    monthlyForecast: 'Solar transit illuminates long-range investments and bold executive initiatives. Focus on building durable alliances while avoiding impulsive commitments.',
    yearly2026Forecast: '2026/2027 marks a transformational chapter of sovereign leadership and expansion into global arenas as Saturn anchors your discipline while Jupiter showers professional recognition.',
    luckyGemstone: 'Red Coral (Moonga) & Ruby',
    luckyColor: 'Crimson Red & Warm Saffron',
    luckyDay: 'Tuesday',
    powerNumbers: [9, 18, 27, 1],
    resonantChakra: 'Manipura (Solar Plexus) & Muladhara',
    affirmation: 'I channel the sacred fire of purpose with clarity, strength, and compassion.',
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
    summary: 'The architect of tangible prosperity, grounded aesthetics, sensory beauty, and immovable loyalty.',
    vitalityToday: 89,
    loveRating: 94,
    careerRating: 86,
    wealthRating: 96,
    todayForecast: 'Venus radiates in harmonious aspect with your wealth axis, making today exceptional for financial structuring, high-value artistic acquisitions, and deepening romantic intimacy.',
    weeklyForecast: 'Patience reaps extraordinary rewards as ongoing business endeavors mature. Favorable cosmic winds support property and luxury asset decisions.',
    monthlyForecast: 'A new moon in your domestic sphere invites home revitalization and heartfelt reconciliation with family members.',
    yearly2026Forecast: 'Jupiter blesses your 2nd and 11th houses, generating substantial long-term wealth growth, real estate expansion, and elevated cultural prestige.',
    luckyGemstone: 'Diamond (Heera) & White Zircon',
    luckyColor: 'Silk White, Emerald Green & Rose Gold',
    luckyDay: 'Friday',
    powerNumbers: [6, 15, 24, 5],
    resonantChakra: 'Anahata (Heart Chakra)',
    affirmation: 'I am grounded in cosmic abundance, beauty, and steadfast peace.',
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
    summary: 'The brilliant communicator and intellectual alchemist, weaving ideas, languages, technology, and connections.',
    vitalityToday: 86,
    loveRating: 88,
    careerRating: 93,
    wealthRating: 85,
    todayForecast: 'Mercury sharpens your mental acuity and digital outreach. Expect synchronistic conversations that open unexpected collaborative doorways in international ventures.',
    weeklyForecast: 'Public speaking, content creation, and strategic publishing receive stellar celestial backing. Keep note of dream visions and sudden insights.',
    monthlyForecast: 'A pivotal shift in your networking sector expands your diaspora circle and introduces visionary mentors.',
    yearly2026Forecast: 'Mastery over communications, cross-border business, and technological innovation will propel your career into widespread prominence.',
    luckyGemstone: 'Emerald (Panna) & Peridot',
    luckyColor: 'Electric Green, Sky Blue & Yellow',
    luckyDay: 'Wednesday',
    powerNumbers: [5, 14, 23, 3],
    resonantChakra: 'Vishuddha (Throat Chakra)',
    affirmation: 'My words carry wisdom, clarity, and the power to unite diverse worlds.',
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
    summary: 'The sacred guardian of emotion, intuition, ancestral heritage, and unconditional empathetic shelter.',
    vitalityToday: 88,
    loveRating: 96,
    careerRating: 84,
    wealthRating: 90,
    todayForecast: 'The Moon heightens your psychic sensitivity and empathetic resonance. Trust your gut instincts regarding personal partnerships and domestic investments.',
    weeklyForecast: 'Pushya nakshatra alignment brings profound spiritual serenity, family celebrations, and auspicious timing for entering new agreements.',
    monthlyForecast: 'Focus turns toward legacy planning and honoring roots. A powerful moment to align financial security with emotional well-being.',
    yearly2026Forecast: 'Emotional self-mastery and real estate achievements define this era. You become a beacon of refuge and community support for your diaspora.',
    luckyGemstone: 'Natural Pearl (Moti) & Moonstone',
    luckyColor: 'Silver, Pearl White & Seafoam Green',
    luckyDay: 'Monday',
    powerNumbers: [2, 11, 20, 7],
    resonantChakra: 'Swadhisthana (Sacral Chakra) & Anahata',
    affirmation: 'I trust my inner ocean of intuition and nurture all that is sacred in my life.',
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
    summary: 'The luminous monarch of the cosmos, exuding radiant warmth, artistic brilliance, generosity, and natural majesty.',
    vitalityToday: 97,
    loveRating: 91,
    careerRating: 98,
    wealthRating: 92,
    todayForecast: 'Surya Deva crowns your solar plexus with unmatched executive charisma. Ideal for leading keynote presentations, inspiring teams, and claiming your rightful seat at the table.',
    weeklyForecast: 'A dramatic elevation in public reputation. Honor your creative gifts and maintain gracious humility to win over influential stakeholders.',
    monthlyForecast: 'Magha nakshatra influences awaken ancestral blessings and legacy recognition. Financial expansion through leadership roles is assured.',
    yearly2026Forecast: 'A golden multi-year epoch for career triumphs, global stage presence, and philanthropic patronage that leaves an indelible mark.',
    luckyGemstone: 'Ruby (Manikya) & Amber',
    luckyColor: 'Imperial Gold, Saffron & Royal Purple',
    luckyDay: 'Sunday',
    powerNumbers: [1, 10, 19, 28],
    resonantChakra: 'Sahasrara & Manipura (Crown & Solar Plexus)',
    affirmation: 'I shine my authentic light fearlessly, illuminating the path for others.',
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
    summary: 'The master of precision, service, analytical mastery, holistic healing, and sacred order in everyday life.',
    vitalityToday: 87,
    loveRating: 83,
    careerRating: 94,
    wealthRating: 91,
    todayForecast: 'Hasta nakshatra stimulates your hands-on problem solving skills and meticulous craftsmanship. Complex technical or legal matters unravel effortlessly in your favor today.',
    weeklyForecast: 'A health and wellness reset pays dividends in daily productivity. Streamline your operational workflows and delegate administrative tasks.',
    monthlyForecast: 'Financial auditing reveals new revenue streams and investment optimizations. Professional praise comes from senior executives.',
    yearly2026Forecast: 'Elevated technical authority, publishing mastery, and wellness industry leadership bring profound recognition and sustainable prosperity.',
    luckyGemstone: 'Emerald (Panna) & Green Tourmaline',
    luckyColor: 'Sage Green, Ivory & Earthy Ochre',
    luckyDay: 'Wednesday',
    powerNumbers: [5, 14, 23, 6],
    resonantChakra: 'Vishuddha & Anahata',
    affirmation: 'I bring divine precision, healing order, and graceful service to the world.',
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
    summary: 'The ambassador of universal peace, refined elegance, contractual justice, and unconditional balance.',
    vitalityToday: 90,
    loveRating: 97,
    careerRating: 88,
    wealthRating: 91,
    todayForecast: 'Swati nakshatra breeze brings romantic serendipity, balanced agreements, and creative breakthroughs. Your diplomatic grace dissolves longstanding friction in negotiations.',
    weeklyForecast: 'Partnerships take center stage. Collaborative alliances formed this week contain extraordinary mutual prosperity potential.',
    monthlyForecast: 'Artistic, legal, and public relations endeavors flourish. Treat yourself to aesthetic surroundings and cultural celebrations.',
    yearly2026Forecast: 'A grand harmonization of relationships, international joint ventures, and cultural diplomacy marks your rising global trajectory.',
    luckyGemstone: 'White Sapphire, Opal & Blue Diamond',
    luckyColor: 'Pastel Blue, Rose Quartz & Cream',
    luckyDay: 'Friday',
    powerNumbers: [6, 15, 24, 7],
    resonantChakra: 'Anahata & Ajna (Heart & Third Eye)',
    affirmation: 'I embody perfect balance, unconditional beauty, and righteous justice.',
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
    summary: 'The mystic alchemist capable of traversing life’s deepest shadows and rising renewed as the golden Phoenix.',
    vitalityToday: 94,
    loveRating: 92,
    careerRating: 96,
    wealthRating: 97,
    todayForecast: 'Anuradha nakshatra invokes profound friendship and strategic financial alchemy. Uncover hidden market inefficiencies and protect valuable confidential intellectual assets.',
    weeklyForecast: 'Psychological breakthroughs and occult/esoteric studies yield life-changing clarity. Financial returns from royalties or shared resources spike.',
    monthlyForecast: 'A regenerative transit purges obsolete obligations, leaving you in an unassailable position of sovereign authority.',
    yearly2026Forecast: 'Karmic rebirth and immense wealth consolidation. You step into immense spiritual and material mastery across global spheres.',
    luckyGemstone: 'Red Coral, Cat’s Eye (Lehsunia) & Garnet',
    luckyColor: 'Deep Maroon, Obsidian Black & Blood Orange',
    luckyDay: 'Tuesday',
    powerNumbers: [9, 18, 27, 4],
    resonantChakra: 'Muladhara & Swadhisthana (Root & Kundalini Gate)',
    affirmation: 'I embrace transformation and rise continuously in sovereign power and light.',
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
    summary: 'The cosmic philosopher and seeker of supreme truth, traversing continents and dimensions with unquenchable optimism.',
    vitalityToday: 95,
    loveRating: 89,
    careerRating: 93,
    wealthRating: 94,
    todayForecast: 'Jupiter beams benevolent rays across your higher learning and travel sector. Ideal for publishing, embarking on long journeys, and establishing international academic or spiritual ties.',
    weeklyForecast: 'Purva Ashadha water energy fuels unbeatable persuasive authority. Philosophical insights resolve long-term dilemmas for yourself and your peers.',
    monthlyForecast: 'Cross-border ventures bring lucrative contracts. Mentor younger seekers and celebrate your expansive worldview.',
    yearly2026Forecast: 'Jupiter’s monumental transit bestows spiritual awakening, honorary titles, international book releases, and visionary mentorship status.',
    luckyGemstone: 'Yellow Sapphire (Pukhraj) & Citrine',
    luckyColor: 'Royal Yellow, Sunset Gold & Tangerine',
    luckyDay: 'Thursday',
    powerNumbers: [3, 12, 21, 30],
    resonantChakra: 'Ajna & Sahasrara (Third Eye & Crown)',
    affirmation: 'I walk in truth, expansive wisdom, and infinite cosmic grace.',
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
    summary: 'The master builder of timeless legacies, characterized by disciplined perseverance, ethical duty, and sovereign patience.',
    vitalityToday: 91,
    loveRating: 82,
    careerRating: 99,
    wealthRating: 96,
    todayForecast: 'Shravana nakshatra bestows supreme listening skills and corporate foresight. Senior dignitaries and institutional boards place immense trust in your operational stewardship.',
    weeklyForecast: 'Milestone career deliverables cross the finish line with resounding acclaim. Long-term capital investments show robust upward stability.',
    monthlyForecast: 'Saturnian discipline refines your lifestyle and executive routines. You become an immovable pillar of strength in your field.',
    yearly2026Forecast: 'Historic legacy building, monumental executive governance, and real estate dynasty creation define your 2026/2027 panorama.',
    luckyGemstone: 'Blue Sapphire (Neelam) & Amethyst',
    luckyColor: 'Midnight Navy, Slate Grey & Deep Indigo',
    luckyDay: 'Saturday',
    powerNumbers: [8, 17, 26, 4],
    resonantChakra: 'Muladhara (Root Chakra)',
    affirmation: 'Through patience, discipline, and dharma, I construct monuments that endure.',
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
    summary: 'The futuristic visionary pouring cosmic knowledge into humanity, pioneering egalitarian communities, AI, and universal upliftment.',
    vitalityToday: 93,
    loveRating: 86,
    careerRating: 95,
    wealthRating: 92,
    todayForecast: 'Shatabhisha (The 100 Physicians nakshatra) sparks breakthrough technical innovations, scientific research, and global diaspora network building. Your ideas are years ahead of the curve.',
    weeklyForecast: 'Grassroots movements, digital platforms, and open-source collaborations receive extraordinary viral resonance.',
    monthlyForecast: 'Unconventional investment strategies in frontier technologies yield surprising windfalls. Stay true to your humanitarian ethos.',
    yearly2026Forecast: 'A golden epoch for revolutionizing your industry, leading visionary global communities, and creating planetary positive impact.',
    luckyGemstone: 'Blue Sapphire, Hessonite (Gomed) & Tanzanite',
    luckyColor: 'Electric Cyan, Cobalt Blue & Silver',
    luckyDay: 'Saturday',
    powerNumbers: [4, 13, 22, 31, 8],
    resonantChakra: 'Ajna & Vishuddha',
    affirmation: 'I channel the waters of future wisdom for the collective upliftment of all.',
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
    summary: 'The oceanic mystic concluding the zodiacal voyage, dissolving illusions into pure compassion, poetry, and Moksha.',
    vitalityToday: 91,
    loveRating: 98,
    careerRating: 87,
    wealthRating: 90,
    todayForecast: 'Revati nakshatra wraps you in profound artistic inspiration, musical ecstasy, and deep spiritual communion. Lucid dreams and meditative silence unlock hidden life answers.',
    weeklyForecast: 'Philanthropic ventures, artistic compositions, and international ocean crossings bring immense soul fulfillment.',
    monthlyForecast: 'Financial karma resolves in your favor through unexpected forgiveness and divine synchronicity. Maintain healthy energetic boundaries.',
    yearly2026Forecast: 'A transcendent era of spiritual realization, artistic masterpieces, international acclaim, and peaceful inner liberation.',
    luckyGemstone: 'Yellow Sapphire, Aquamarine & Amethyst',
    luckyColor: 'Sea Green, Lavender & Golden Yellow',
    luckyDay: 'Thursday',
    powerNumbers: [3, 7, 12, 21],
    resonantChakra: 'Sahasrara (Crown of Cosmic Unity)',
    affirmation: 'I surrender to the infinite ocean of divine love, peace, and spiritual grace.',
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

export function calculateZodiacCompatibility(signAId: string, signBId: string): ZodiacCompatibilityResult {
  const signA = ZODIAC_SIGNS.find((s) => s.id === signAId) || ZODIAC_SIGNS[0];
  const signB = ZODIAC_SIGNS.find((s) => s.id === signBId) || ZODIAC_SIGNS[1];

  let baseScore = 75;

  // Same element (Fire+Fire, Earth+Earth, etc.)
  if (signA.element === signB.element) {
    baseScore += 18;
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

  const overallScore = Math.min(99, Math.max(55, baseScore));

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
