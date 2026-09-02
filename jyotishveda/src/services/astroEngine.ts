import {
  PlanetPosition,
  HouseData,
  DashaPeriod,
  VedicYoga,
  VedicDosha,
  NumerologyReport,
  PanchangInfo,
  UserProfile,
  AshtaKootaMilanResult,
  KootaItem,
  ManglikAnalysis,
  SynastryAspect,
} from '../types';

export const ZODIAC_SIGNS = [
  { name: 'Aries', sanskrit: 'Mesha (मेष)', lord: 'Mars', element: 'Fire', symbol: '♈' },
  { name: 'Taurus', sanskrit: 'Vrishabha (वृषभ)', lord: 'Venus', element: 'Earth', symbol: '♉' },
  { name: 'Gemini', sanskrit: 'Mithuna (मिथुन)', lord: 'Mercury', element: 'Air', symbol: '♊' },
  { name: 'Cancer', sanskrit: 'Karka (कर्क)', lord: 'Moon', element: 'Water', symbol: '♋' },
  { name: 'Leo', sanskrit: 'Simha (सिंह)', lord: 'Sun', element: 'Fire', symbol: '♌' },
  { name: 'Virgo', sanskrit: 'Kanya (कन्या)', lord: 'Mercury', element: 'Earth', symbol: '♍' },
  { name: 'Libra', sanskrit: 'Tula (तुला)', lord: 'Venus', element: 'Air', symbol: '♎' },
  { name: 'Scorpio', sanskrit: 'Vrishchika (वृश्चिक)', lord: 'Mars', element: 'Water', symbol: '♏' },
  { name: 'Sagittarius', sanskrit: 'Dhanu (धनु)', lord: 'Jupiter', element: 'Fire', symbol: '♐' },
  { name: 'Capricorn', sanskrit: 'Makara (मकर)', lord: 'Saturn', element: 'Earth', symbol: '♑' },
  { name: 'Aquarius', sanskrit: 'Kumbha (कुम्भ)', lord: 'Saturn', element: 'Air', symbol: '♒' },
  { name: 'Pisces', sanskrit: 'Meena (मीन)', lord: 'Jupiter', element: 'Water', symbol: '♓' },
];

export const NAKSHATRAS = [
  { name: 'Ashwini', lord: 'Ketu', deity: 'Ashwini Kumaras', degrees: 13.3333 },
  { name: 'Bharani', lord: 'Venus', deity: 'Yama', degrees: 13.3333 },
  { name: 'Krittika', lord: 'Sun', deity: 'Agni', degrees: 13.3333 },
  { name: 'Rohini', lord: 'Moon', deity: 'Brahma / Prajapati', degrees: 13.3333 },
  { name: 'Mrigashira', lord: 'Mars', deity: 'Soma', degrees: 13.3333 },
  { name: 'Ardra', lord: 'Rahu', deity: 'Rudra', degrees: 13.3333 },
  { name: 'Punarvasu', lord: 'Jupiter', deity: 'Aditi', degrees: 13.3333 },
  { name: 'Pushya', lord: 'Saturn', deity: 'Brihaspati', degrees: 13.3333 },
  { name: 'Ashlesha', lord: 'Mercury', deity: 'Nagas', degrees: 13.3333 },
  { name: 'Magha', lord: 'Ketu', deity: 'Pitris', degrees: 13.3333 },
  { name: 'Purva Phalguni', lord: 'Venus', deity: 'Aryaman', degrees: 13.3333 },
  { name: 'Uttara Phalguni', lord: 'Sun', deity: 'Bhaga', degrees: 13.3333 },
  { name: 'Hasta', lord: 'Moon', deity: 'Savitr', degrees: 13.3333 },
  { name: 'Chitra', lord: 'Mars', deity: 'Tvastar', degrees: 13.3333 },
  { name: 'Swati', lord: 'Rahu', deity: 'Vayu', degrees: 13.3333 },
  { name: 'Vishakha', lord: 'Jupiter', deity: 'Indrani', degrees: 13.3333 },
  { name: 'Anuradha', lord: 'Saturn', deity: 'Mitra', degrees: 13.3333 },
  { name: 'Jyeshtha', lord: 'Mercury', deity: 'Indra', degrees: 13.3333 },
  { name: 'Mula', lord: 'Ketu', deity: 'Nirriti', degrees: 13.3333 },
  { name: 'Purva Ashadha', lord: 'Venus', deity: 'Apah', degrees: 13.3333 },
  { name: 'Uttara Ashadha', lord: 'Sun', deity: 'Vishvedevas', degrees: 13.3333 },
  { name: 'Shravana', lord: 'Moon', deity: 'Vishnu', degrees: 13.3333 },
  { name: 'Dhanishta', lord: 'Mars', deity: 'Vasus', degrees: 13.3333 },
  { name: 'Shatabhisha', lord: 'Rahu', deity: 'Varuna', degrees: 13.3333 },
  { name: 'Purva Bhadrapada', lord: 'Jupiter', deity: 'Aja Ekapada', degrees: 13.3333 },
  { name: 'Uttara Bhadrapada', lord: 'Saturn', deity: 'Ahir Budhyana', degrees: 13.3333 },
  { name: 'Revati', lord: 'Mercury', deity: 'Pushan', degrees: 13.3333 },
];

export const DASHA_ORDER = [
  { planet: 'Ketu', sanskrit: 'केतु', years: 7 },
  { planet: 'Venus', sanskrit: 'शुक्र', years: 20 },
  { planet: 'Sun', sanskrit: 'सूर्य', years: 6 },
  { planet: 'Moon', sanskrit: 'चन्द्र', years: 10 },
  { planet: 'Mars', sanskrit: 'मंगल', years: 7 },
  { planet: 'Rahu', sanskrit: 'राहु', years: 18 },
  { planet: 'Jupiter', sanskrit: 'गुरु', years: 16 },
  { planet: 'Saturn', sanskrit: 'शनि', years: 19 },
  { planet: 'Mercury', sanskrit: 'बुध', years: 17 },
];

export const HOUSE_SIGNIFICANCES = [
  { house: 1, name: 'Tanur Bhava', sanskrit: 'तनु भाव (Lagna)', significance: 'Self, Personality, Physical Body, Vitality, Life Path & Head' },
  { house: 2, name: 'Dhana Bhava', sanskrit: 'धन भाव', significance: 'Wealth, Speech, Family lineage, Food habits, Face & Right Eye' },
  { house: 3, name: 'Sahaja Bhava', sanskrit: 'सहज भाव', significance: 'Siblings, Courage, Communication, Short Journeys, Skill with Hands' },
  { house: 4, name: 'Sukha Bhava', sanskrit: 'सुख भाव (Matru)', significance: 'Mother, Home, Land, Vehicles, Inner Peace, Heart & Education' },
  { house: 5, name: 'Putra Bhava', sanskrit: 'पुत्र भाव (Purva Punya)', significance: 'Children, Intellect, Creativity, Speculation, Mantras & Past Karma' },
  { house: 6, name: 'Shatru Bhava', sanskrit: 'शत्रु भाव (Roga/Rina)', significance: 'Enemies, Debts, Diseases, Daily Work, Service & Obstacles' },
  { house: 7, name: 'Jaya Bhava', sanskrit: 'जाया भाव (Kalatra)', significance: 'Spouse, Marriage, Business Partnerships, Public Relations, Contracts' },
  { house: 8, name: 'Mrityu Bhava', sanskrit: 'मृत्यु भाव (Randhra)', significance: 'Longevity, Sudden Transformation, Occult, Inheritance, Hidden Truths' },
  { house: 9, name: 'Dharma Bhava', sanskrit: 'धर्म भाव (Bhagya)', significance: 'Father, Guru, Higher Wisdom, Luck, Long Pilgrimages, Righteousness' },
  { house: 10, name: 'Karma Bhava', sanskrit: 'कर्म भाव', significance: 'Career, Profession, Fame, Social Status, Authority & Achievements' },
  { house: 11, name: 'Labha Bhava', sanskrit: 'लाभ भाव (Aya)', significance: 'Gains, Income, Elder Siblings, Desires Fulfillment, Large Networks' },
  { house: 12, name: 'Vyaya Bhava', sanskrit: 'व्यय भाव (Moksha)', significance: 'Expenditure, Foreign Lands, Hospitalization, Isolation, Bed Pleasures & Liberation' },
];

export const CHALDEAN_VALUES: { [char: string]: number } = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

export const PYTHAGOREAN_VALUES: { [char: string]: number } = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9,
};

// Reduce multi-digit number to single digit
export function reduceToSingleDigit(num: number, keepMasters: boolean = false): number {
  if (keepMasters && (num === 11 || num === 22 || num === 33)) {
    return num;
  }
  while (num > 9) {
    num = String(num)
      .split('')
      .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }
  return num;
}

// Calculate Sidereal or Tropical Planetary & Chart data from birth date, time, and coords
export function calculateVedicChart(profile?: UserProfile, ephemerisData?: any): {
  system: 'vedic' | 'western';
  systemTitle: string;
  ayanamshaShift: number;
  ascendant: { signIndex: number; degree: number; signName: string; signSanskrit: string; nakshatra: string };
  planets: PlanetPosition[];
  houses: HouseData[];
  dashas: DashaPeriod[];
  yogas: VedicYoga[];
  doshas: VedicDosha[];
} {
  const p: UserProfile = (profile && profile.birthDate) ? profile : {
    id: 'default-profile',
    fullName: 'Divine Seeker',
    gender: 'male',
    birthDate: '2000-01-01',
    birthTime: '12:00',
    birthPlace: 'Kolkata, India',
    latitude: 22.5726,
    longitude: 88.3639,
    timezone: 5.5,
    focusAreas: ['spiritual', 'career'],
    isPremium: false,
    horoscopeSystem: 'vedic',
  };

  const isWestern = p.horoscopeSystem === 'western';
  const ayanamshaShift = isWestern ? 23.86 : 0; // Sayana (Tropical) vs Nirayana (Lahiri Sidereal)
  const timeString = p.birthTime && p.birthTime.trim() ? p.birthTime.trim() : '12:00';
  const bDate = new Date(`${p.birthDate}T${timeString.length === 5 ? timeString : '12:00'}:00`);
  const dayOfYear = Math.floor((bDate.getTime() - new Date(bDate.getFullYear(), 0, 0).getTime()) / 86400000);
  const birthHours = bDate.getHours() + bDate.getMinutes() / 60;
  
  // Seed hash for consistent deterministic astronomical approximations (fallback)
  const seed = (bDate.getFullYear() * 365 + dayOfYear) * 24 + birthHours + (p.latitude || 22.57) * 0.5 + (p.longitude || 88.36) * 0.2;
  
  // Ascendant Calculation
  let totalLagnaDeg = ephemerisData 
    ? ephemerisData.ascendant + ayanamshaShift
    : (Math.floor(seed * 1.618 + ((p.longitude || 88.36) / 15) * 30 + birthHours * 15 + ayanamshaShift)) % 360;
    
  if (totalLagnaDeg >= 360) totalLagnaDeg -= 360;
  if (totalLagnaDeg < 0) totalLagnaDeg += 360;
  
  const lagnaSignIndex = Math.floor(totalLagnaDeg / 30);
  const lagnaDeg = totalLagnaDeg % 30;
  const lagnaNakshatraIdx = Math.floor(totalLagnaDeg / 13.3333) % 27;

  // Planets calculation
  const planetConfigs = [
    { id: 'sun', name: 'Sun', sanskrit: 'Surya (सूर्य)', symbol: '☉', baseRate: 0.9856, offset: 280, gemstone: 'gemstone.sun', element: 'element.fire' },
    { id: 'moon', name: 'Moon', sanskrit: 'Chandra (चन्द्र)', symbol: '☽', baseRate: 13.176, offset: 45, gemstone: 'gemstone.moon', element: 'element.water' },
    { id: 'mars', name: 'Mars', sanskrit: 'Mangal (मंगल)', symbol: '♂', baseRate: 0.524, offset: 120, gemstone: 'gemstone.mars', element: 'element.fire' },
    { id: 'mercury', name: 'Mercury', sanskrit: 'Budha (बुध)', symbol: '☿', baseRate: 1.2, offset: 310, gemstone: 'gemstone.mercury', element: 'element.earth' },
    { id: 'jupiter', name: 'Jupiter', sanskrit: 'Guru (गुरु)', symbol: '♃', baseRate: 0.083, offset: 190, gemstone: 'gemstone.jupiter', element: 'element.ether' },
    { id: 'venus', name: 'Venus', sanskrit: 'Shukra (शुक्र)', symbol: '♀', baseRate: 1.15, offset: 70, gemstone: 'gemstone.venus', element: 'element.water' },
    { id: 'saturn', name: 'Saturn', sanskrit: 'Shani (शनि)', symbol: '♄', baseRate: 0.033, offset: 240, gemstone: 'gemstone.saturn', element: 'element.air' },
    { id: 'rahu', name: 'Rahu', sanskrit: 'Rahu (राहु)', symbol: '☊', baseRate: -0.052, offset: 15, gemstone: 'gemstone.rahu', element: 'element.shadow' },
    { id: 'ketu', name: 'Ketu', sanskrit: 'Ketu (केतु)', symbol: '☋', baseRate: -0.052, offset: 195, gemstone: 'gemstone.ketu', element: 'element.shadow' },
  ];

  const calculatedPlanets: PlanetPosition[] = planetConfigs.map((p, idx) => {
    let totDeg = 0;
    let isRetro = false;
    
    if (ephemerisData && ephemerisData.planets && ephemerisData.planets[p.id]) {
      totDeg = (ephemerisData.planets[p.id].longitude + ayanamshaShift) % 360;
      isRetro = ephemerisData.planets[p.id].isRetrograde;
    } else {
      totDeg = (p.offset + (seed * p.baseRate * 0.1) + idx * 23.5 + ayanamshaShift) % 360;
      isRetro = (idx === 2 || idx === 4 || idx === 6) ? (Math.sin(seed * idx) > 0.4) : false;
    }
    
    if (totDeg < 0) totDeg += 360;
    const signIdx = Math.floor(totDeg / 30);
    const degInSign = parseFloat((totDeg % 30).toFixed(2));
    const nakIdx = Math.floor(totDeg / 13.3333) % 27;
    const pada = Math.floor((totDeg % 13.3333) / 3.3333) + 1;
    
    // House placement relative to Lagna / Ascendant
    let house = ((signIdx - lagnaSignIndex + 12) % 12) + 1;

    // Determine Dignity
    let dignity: PlanetPosition['dignity'] = 'Neutral';
    if (p.id === 'sun') {
      if (signIdx === 0) dignity = 'Exalted'; // Aries
      else if (signIdx === 4) dignity = 'Own'; // Leo
      else if (signIdx === 6) dignity = 'Debilitated'; // Libra
      else if (signIdx === 8 || signIdx === 11) dignity = 'Friendly';
    } else if (p.id === 'moon') {
      if (signIdx === 1) dignity = 'Exalted'; // Taurus
      else if (signIdx === 3) dignity = 'Own'; // Cancer
      else if (signIdx === 7) dignity = 'Debilitated'; // Scorpio
    } else if (p.id === 'mars') {
      if (signIdx === 9) dignity = 'Exalted'; // Capricorn
      else if (signIdx === 0 || signIdx === 7) dignity = 'Own'; // Aries/Scorpio
      else if (signIdx === 3) dignity = 'Debilitated'; // Cancer
    } else if (p.id === 'mercury') {
      if (signIdx === 5) dignity = 'Exalted'; // Virgo
      else if (signIdx === 2) dignity = 'Own'; // Gemini
      else if (signIdx === 11) dignity = 'Debilitated'; // Pisces
    } else if (p.id === 'jupiter') {
      if (signIdx === 3) dignity = 'Exalted'; // Cancer
      else if (signIdx === 8 || signIdx === 11) dignity = 'Own'; // Sag/Pisces
      else if (signIdx === 9) dignity = 'Debilitated'; // Capricorn
    } else if (p.id === 'venus') {
      if (signIdx === 11) dignity = 'Exalted'; // Pisces
      else if (signIdx === 1 || signIdx === 6) dignity = 'Own'; // Taurus/Libra
      else if (signIdx === 5) dignity = 'Debilitated'; // Virgo
    } else if (p.id === 'saturn') {
      if (signIdx === 6) dignity = 'Exalted'; // Libra
      else if (signIdx === 9 || signIdx === 10) dignity = 'Own'; // Cap/Aquarius
      else if (signIdx === 0) dignity = 'Debilitated'; // Aries
    } else {
      dignity = 'Neutral';
    }

    return {
      id: p.id,
      name: p.name,
      sanskritName: p.sanskrit,
      symbol: p.symbol,
      signIndex: signIdx,
      signName: ZODIAC_SIGNS[signIdx].name,
      signSanskrit: ZODIAC_SIGNS[signIdx].sanskrit,
      degree: degInSign,
      totalDegree: parseFloat(totDeg.toFixed(2)),
      house,
      isRetrograde: isRetro,
      nakshatra: NAKSHATRAS[nakIdx].name,
      nakshatraLord: NAKSHATRAS[nakIdx].lord,
      pada,
      dignity,
      gemstone: p.gemstone,
      element: p.element,
    };
  });

  // Calculate Jaimini Chara Karakas (AK to DK sorted by decreasing degrees in sign for 7 classical planets)
  const jaiminiPlanets = [...calculatedPlanets.filter(p => p.id !== 'rahu' && p.id !== 'ketu')];
  jaiminiPlanets.sort((a, b) => b.degree - a.degree);
  const karakaLabels = ['AK (Atmakaraka - Soul)', 'AmK (Amatyakaraka - Career)', 'BK (Bhratrikaraka - Siblings/Guru)', 'MK (Matrikaraka - Mother/Nurturance)', 'PK (Putrakaraka - Intellect)', 'GK (Gnatikaraka - Obstacles/Kins)', 'DK (Darakaraka - Spouse/Partner)'];
  jaiminiPlanets.forEach((p, idx) => {
    const target = calculatedPlanets.find(orig => orig.id === p.id);
    if (target && karakaLabels[idx]) {
      target.karaka = karakaLabels[idx];
    }
  });

  // Assemble 12 Houses
  const houses: HouseData[] = Array.from({ length: 12 }, (_, i) => {
    const houseNum = i + 1;
    const signIdx = (lagnaSignIndex + i) % 12;
    const occupyingPlanets = calculatedPlanets.filter(p => p.house === houseNum);
    const sig = HOUSE_SIGNIFICANCES[i];
    
    // KP and Lal Kitab indicators
    const kpSubLords = ['Mercury', 'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn'];
    const kpSubLord = kpSubLords[(signIdx + houseNum * 2) % kpSubLords.length];
    const kpStarLord = NAKSHATRAS[(signIdx * 2 + houseNum) % 27].lord;
    
    let lalKitabState = 'Awakened (Jagrit)';
    if (occupyingPlanets.length === 0) {
      lalKitabState = 'Dormant (Soyi Kismat - Needs activation via transit or remedy)';
    }

    return {
      houseNumber: houseNum,
      signIndex: signIdx,
      signName: ZODIAC_SIGNS[signIdx].name,
      signSanskrit: ZODIAC_SIGNS[signIdx].sanskrit,
      signLord: ZODIAC_SIGNS[signIdx].lord,
      planets: occupyingPlanets,
      significance: sig.significance,
      sanskritName: sig.sanskrit,
      kpSubLord,
      kpStarLord,
      lalKitabState,
    };
  });

  // Calculate Vimshottari Dasha Timeline from Moon's position
  const moon = calculatedPlanets.find(p => p.id === 'moon') || calculatedPlanets[1];
  const moonNakIdx = Math.floor(moon.totalDegree / 13.3333) % 27;
  const startingLord = NAKSHATRAS[moonNakIdx].lord;
  const dashaStartIdx = DASHA_ORDER.findIndex(d => d.planet.toLowerCase() === startingLord.toLowerCase());
  
  const birthYear = bDate.getFullYear();
  let currentAccumYear = birthYear;
  const now = new Date();
  const currentYear = now.getFullYear();

  const dashas: DashaPeriod[] = [];
  for (let i = 0; i < 9; i++) {
    const dashaIdx = (dashaStartIdx + i) % 9;
    const item = DASHA_ORDER[dashaIdx];
    const startYr = currentAccumYear;
    const endYr = startYr + item.years;
    currentAccumYear = endYr;

    const isCurrent = (currentYear >= startYr && currentYear < endYr);
    
    // Generate Antardashas (Sub-periods)
    const subPeriods = DASHA_ORDER.map((sub, sIdx) => {
      const subYears = (item.years * sub.years) / 120;
      const subStart = startYr + (sIdx * (item.years / 9));
      const subEnd = subStart + subYears;
      return {
        planet: sub.planet,
        startDate: `${Math.floor(subStart)}-0${Math.min(9, Math.max(1, (sIdx % 9) + 1))}-01`,
        endDate: `${Math.floor(subEnd)}-0${Math.min(9, Math.max(1, (sIdx % 9) + 1))}-01`,
        isCurrent: isCurrent && (currentYear >= subStart && currentYear < subEnd),
      };
    });

    dashas.push({
      planet: item.planet,
      sanskrit: item.sanskrit,
      startDate: `${startYr}-01-01`,
      endDate: `${endYr}-01-01`,
      durationYears: item.years,
      isCurrent,
      subPeriods,
    });
  }

  // Detect Vedic Yogas
  const yogas: VedicYoga[] = [];
  const jupiter = calculatedPlanets.find(p => p.id === 'jupiter')!;
  const sun = calculatedPlanets.find(p => p.id === 'sun')!;
  const mercury = calculatedPlanets.find(p => p.id === 'mercury')!;
  const mars = calculatedPlanets.find(p => p.id === 'mars')!;
  const venus = calculatedPlanets.find(p => p.id === 'venus')!;
  const saturn = calculatedPlanets.find(p => p.id === 'saturn')!;

  // 1. Gajakesari Yoga (Jupiter in Kendra from Moon: 1, 4, 7, 10 houses away)
  const moonHouse = moon.house;
  const jupHouse = jupiter.house;
  const distFromMoon = ((jupHouse - moonHouse + 12) % 12) + 1;
  if ([1, 4, 7, 10].includes(distFromMoon)) {
    yogas.push({
      id: 'gajakesari',
      name: 'Gajakesari Yoga (गजकेसरी योग)',
      sanskritName: 'Gajakesari Yoga',
      type: 'Raja Yoga',
      planetsInvolved: ['Jupiter', 'Moon'],
      description: 'Jupiter is in a Kendra (angular house) from the Moon, creating the majestic lion-elephant alliance.',
      effect: 'Bestows sharp intellect, high virtue, authoritative reputation, immense social respect, and enduring prosperity.',
      remedy: 'Chant Brihaspati and Chandra Beej Mantras; wear white or saffron clothes on Thursdays.',
    });
  }

  // 2. Budhaditya Yoga (Sun + Mercury conjunction in same house)
  if (sun.house === mercury.house) {
    yogas.push({
      id: 'budhaditya',
      name: 'Budhaditya Yoga (बुधादित्य योग)',
      sanskritName: 'Budhaditya Yoga',
      type: 'Auspicious',
      planetsInvolved: ['Sun', 'Mercury'],
      description: 'Sun and Mercury illuminate the same house, merging royal radiance with analytical intelligence.',
      effect: 'Excellence in strategic governance, scientific learning, administration, public speaking, and business ventures.',
      remedy: 'Offer water to the rising Sun (Arghya) and feed green fodder or grass to cows on Wednesdays.',
    });
  }

  // 3. Pancha Mahapurusha Yogas (Mars -> Ruchaka, Mercury -> Bhadra, Jupiter -> Hamsa, Venus -> Malavya, Saturn -> Sasa in Kendra & Own/Exalted)
  if ([1, 4, 7, 10].includes(jupiter.house) && (jupiter.dignity === 'Exalted' || jupiter.dignity === 'Own')) {
    yogas.push({
      id: 'hamsa_yoga',
      name: 'Hamsa Mahapurusha Yoga (हंस योग)',
      sanskritName: 'Hamsa Yoga',
      type: 'Mahapurusha Yoga',
      planetsInvolved: ['Jupiter'],
      description: 'Guru (Jupiter) occupies a Kendra house in exalted or own sign (Cancer, Sagittarius, Pisces).',
      effect: 'Noble spiritual character, esteemed guru or judicial advisor status, pure mindedness, universal reverence.',
    });
  }
  if ([1, 4, 7, 10].includes(mars.house) && (mars.dignity === 'Exalted' || mars.dignity === 'Own')) {
    yogas.push({
      id: 'ruchaka_yoga',
      name: 'Ruchaka Mahapurusha Yoga (रुचक योग)',
      sanskritName: 'Ruchaka Yoga',
      type: 'Mahapurusha Yoga',
      planetsInvolved: ['Mars'],
      description: 'Mars resides in a Kendra house in Aries, Scorpio, or Capricorn.',
      effect: 'Unflinching bravery, leadership in engineering/military/entrepreneurship, physical strength, victorious over adversaries.',
    });
  }
  if ([1, 4, 7, 10].includes(venus.house) && (venus.dignity === 'Exalted' || venus.dignity === 'Own')) {
    yogas.push({
      id: 'malavya_yoga',
      name: 'Malavya Mahapurusha Yoga (मालव्य योग)',
      sanskritName: 'Malavya Yoga',
      type: 'Mahapurusha Yoga',
      planetsInvolved: ['Venus'],
      description: 'Venus resides in a Kendra in Taurus, Libra, or Pisces.',
      effect: 'Magnetic charm, refined artistic genius, immense material wealth, luxury vehicles, and blissful domestic happiness.',
    });
  }

  // 4. Dhana Yoga (Lords of 1st, 2nd, 5th, 9th, 11th interacting)
  // Check if benefic planets (Jupiter, Venus, Mercury) are in wealth houses (2, 9, 11)
  const hasDhanaYoga = [jupiter, venus, mercury].some(p => [2, 9, 11].includes(p.house) && (p.dignity === 'Own' || p.dignity === 'Exalted' || p.dignity === 'Friendly'));
  if (hasDhanaYoga) {
    yogas.push({
      id: 'dhana_yoga',
      name: 'Maha Lakshmi Dhana Yoga (महालक्ष्मी धन योग)',
      sanskritName: 'Dhana Yoga',
      type: 'Dhana Yoga',
      planetsInvolved: ['Venus', 'Mercury', 'Jupiter'],
      description: 'Benefic planets are strongly placed in wealth-giving houses (2nd Dhana, 9th Bhagya, 11th Labha).',
      effect: 'Steady accumulation of assets, multiple lucrative income streams, real estate expansion, and business acumen.',
      remedy: 'Recite Sri Suktam or Kanakadhara Stotram on Fridays.',
    });
  }

  // Detect Vedic Doshas
  const doshas: VedicDosha[] = [];
  
  // 1. Manglik / Kuja Dosha (Mars in 1st, 4th, 7th, 8th, or 12th house)
  const isManglik = [1, 4, 7, 8, 12].includes(mars.house);
  doshas.push({
    id: 'manglik_dosha',
    name: 'Manglik / Kuja Dosha (मांगलिक दोष)',
    severity: isManglik ? (mars.house === 7 || mars.house === 8 ? 'Moderate' : 'Severe') : 'None',
    isPresent: isManglik,
    description: isManglik
      ? `Mars is positioned in house ${mars.house}, which can trigger passionate intensity, direct temperament, and initial hurdles in marital alignment.`
      : 'Mars is placed in a non-afflicting house. No significant Manglik influence detected.',
    impactArea: 'Partnerships, Marriage Harmony, Temperament & Energy Regulation',
    vedicRemedies: [
      'Perform Mangal Shanti Pooja or chant the Hanuman Chalisa on Tuesdays',
      'Wear a genuine Red Coral (Moonga) or keep a clean copper vessel in the bedroom',
      'Match charts thoroughly or perform Kumbh Vivah ritual if marriage is planned with non-Manglik',
      'Fast on Tuesdays and donate red lentils (Masoor Dal) or jaggery',
    ],
  });

  // 2. Kaal Sarp Dosha (All planets hemmed between Rahu & Ketu axis)
  const rahu = calculatedPlanets.find(p => p.id === 'rahu')!;
  const ketu = calculatedPlanets.find(p => p.id === 'ketu')!;
  
  // Check if all 7 classical planets are on one side of the nodal axis
  const classicalPlanets = [sun, moon, mars, mercury, jupiter, venus, saturn];
  let allOnOneSide = true;
  let allOnOtherSide = true;
  
  for (const p of classicalPlanets) {
    const diffRahu = (p.totalDegree - rahu.totalDegree + 360) % 360;
    if (diffRahu > 180) allOnOneSide = false;
    if (diffRahu < 180) allOnOtherSide = false;
  }
  
  const allHemmed = allOnOneSide || allOnOtherSide;

  doshas.push({
    id: 'kaalsarp_dosha',
    name: 'Kaal Sarp Yoga / Dosha (कालसर्प योग)',
    severity: allHemmed ? 'Severe' : 'None',
    isPresent: allHemmed,
    description: allHemmed
      ? 'Planetary cluster aligns along the nodal axis of Rahu-Ketu (Anant / Vasuki type), creating cyclical delays followed by sudden meteoric rises.'
      : 'No Kaal Sarp formation; planetary energies circulate freely without karmic axis constriction.',
    impactArea: 'Career breakthroughs, sleep tranquility, karmic cycles',
    vedicRemedies: [
      'Perform Maha Mrityunjaya Japa (108 times daily)',
      'Offer milk and Bilva leaves to Shiva Lingam on Mondays and Nag Panchami',
      'Install a consecrated Parad (Mercury) Shiva Lingam at home altar',
      'Avoid wearing black clothes on crucial examination or meeting dates',
    ],
  });

  // 3. Sade Sati Phase (Saturn transit over natal Moon: 12th, 1st, 2nd from Moon)
  // Approximate based on current year vs natal Moon sign
  const moonSign = moon.signIndex;
  const currentSaturnTransitSign = 11; // 2026: Saturn is in Sidereal Pisces (11)
  const sadeSatiDiff = (currentSaturnTransitSign - moonSign + 12) % 12;
  let sadeSatiPhase = 'Not in active Sade Sati';
  let isSadeSatiActive = false;
  if (sadeSatiDiff === 11) {
    sadeSatiPhase = 'First Phase (Rising - 12th from Moon: Mental restructuring & financial recalibration)';
    isSadeSatiActive = true;
  } else if (sadeSatiDiff === 0) {
    sadeSatiPhase = 'Peak Phase (Janma Shani - Saturn on natal Moon: Deep discipline, emotional maturity, karmic tests)';
    isSadeSatiActive = true;
  } else if (sadeSatiDiff === 1) {
    sadeSatiPhase = 'Setting Phase (2nd from Moon: Stabilization of family wealth, health recovery, long-term rewards)';
    isSadeSatiActive = true;
  }

  doshas.push({
    id: 'sade_sati',
    name: 'Shani Sade Sati Transit (शनि साढ़े साती)',
    severity: isSadeSatiActive ? 'Moderate' : 'None',
    isPresent: isSadeSatiActive,
    description: isSadeSatiActive
      ? `Currently experiencing ${sadeSatiPhase}. Saturn is refining your endurance and stripping away non-essential distractions.`
      : 'Currently peaceful from Saturn’s 7.5-year major transit (Sade Sati).',
    impactArea: 'Patience, Career Endurance, Health, Karmic Growth',
    vedicRemedies: [
      'Light a mustard oil lamp (Diya) under a Peepal tree on Saturday evenings',
      'Chant Shani Beej Mantra: Om Sham Shanaicharaya Namah (108 times)',
      'Serve and donate to elderly people, laborers, or physically challenged individuals',
      'Feed black sesame seeds or bread to stray dogs or crows on Saturdays',
    ],
  });

  return {
    system: isWestern ? 'western' : 'vedic',
    systemTitle: isWestern ? 'Western Tropical (Sayana)' : 'Vedic Sidereal (Nirayana)',
    ayanamshaShift,
    ascendant: {
      signIndex: lagnaSignIndex,
      degree: parseFloat(lagnaDeg.toFixed(2)),
      signName: ZODIAC_SIGNS[lagnaSignIndex].name,
      signSanskrit: ZODIAC_SIGNS[lagnaSignIndex].sanskrit,
      nakshatra: NAKSHATRAS[lagnaNakshatraIdx].name,
    },
    planets: calculatedPlanets,
    houses,
    dashas,
    yogas,
    doshas,
  };
}

// Calculate Indian & Vedic Numerology Report
export function calculateNumerology(profileOrName?: UserProfile | string, birthDateStr?: string): NumerologyReport {
  let fullName = '';
  let birthDate = '';

  if (typeof profileOrName === 'string') {
    fullName = profileOrName || 'Divine Seeker';
    birthDate = birthDateStr || '1995-06-15';
  } else if (profileOrName && profileOrName.birthDate) {
    fullName = profileOrName.fullName || 'Divine Seeker';
    birthDate = profileOrName.birthDate;
  } else {
    fullName = 'Divine Seeker';
    birthDate = '1995-06-15';
  }

  const parts = birthDate.split('-');
  const year = parseInt(parts[0], 10) || 1995;
  const month = parseInt(parts[1], 10) || 6;
  const day = parseInt(parts[2], 10) || 15;

  // 1. Mulank (Psychic Number) - sum of day digits
  const mulank = reduceToSingleDigit(day);

  // 2. Bhagyank (Destiny Number) - sum of day + month + year
  const totalDateSum = day + month + year;
  const bhagyank = reduceToSingleDigit(totalDateSum, true);

  // 3. Namank (Name Numbers)
  const cleanName = fullName.toUpperCase().replace(/[^A-Z]/g, '');

  let chaldeanSum = 0;
  let pythagoreanSum = 0;
  for (const ch of cleanName) {
    chaldeanSum += CHALDEAN_VALUES[ch] || 0;
    pythagoreanSum += PYTHAGOREAN_VALUES[ch] || 0;
  }
  const namankChaldean = reduceToSingleDigit(chaldeanSum);
  const namankPythagorean = reduceToSingleDigit(pythagoreanSum);

  // 4. Lo Shu 3x3 Magic Grid
  // Digits from full birthdate: YYYYMMDD
  const dateDigitsString = `${year}${month < 10 ? '0' + month : month}${day < 10 ? '0' + day : day}`;
  const gridCounts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  for (const digit of dateDigitsString) {
    const d = parseInt(digit, 10);
    if (d >= 1 && d <= 9) {
      gridCounts[d] = (gridCounts[d] || 0) + 1;
    }
  }

  // Evaluate Lo Shu Planes (Planes of Strength / Missing numbers)
  const loShuPlanes = [
    {
      name: 'Thought Plane (4 - 9 - 2)',
      numbers: [4, 9, 2],
      strength: ((gridCounts[4] > 0 ? 1 : 0) + (gridCounts[9] > 0 ? 1 : 0) + (gridCounts[2] > 0 ? 1 : 0)) / 3 * 100,
      meaning: 'Strategic foresight, deep planning capabilities, photographic memory, and conceptual thinking.',
    },
    {
      name: 'Will Plane (3 - 5 - 7)',
      numbers: [3, 5, 7],
      strength: ((gridCounts[3] > 0 ? 1 : 0) + (gridCounts[5] > 0 ? 1 : 0) + (gridCounts[7] > 0 ? 1 : 0)) / 3 * 100,
      meaning: 'Unshakeable willpower, persistence, spiritual resilience, and capacity to overcome adversity.',
    },
    {
      name: 'Action Plane (8 - 1 - 6)',
      numbers: [8, 1, 6],
      strength: ((gridCounts[8] > 0 ? 1 : 0) + (gridCounts[1] > 0 ? 1 : 0) + (gridCounts[6] > 0 ? 1 : 0)) / 3 * 100,
      meaning: 'Execution speed, commercial pragmatism, physical stamina, and turning concepts into physical assets.',
    },
    {
      name: 'Mental Plane (4 - 3 - 8)',
      numbers: [4, 3, 8],
      strength: ((gridCounts[4] > 0 ? 1 : 0) + (gridCounts[3] > 0 ? 1 : 0) + (gridCounts[8] > 0 ? 1 : 0)) / 3 * 100,
      meaning: 'High analytical IQ, intellectual curiosity, structured logic, and academic brilliance.',
    },
    {
      name: 'Emotional Plane (9 - 5 - 1)',
      numbers: [9, 5, 1],
      strength: ((gridCounts[9] > 0 ? 1 : 0) + (gridCounts[5] > 0 ? 1 : 0) + (gridCounts[1] > 0 ? 1 : 0)) / 3 * 100,
      meaning: 'Intuitive empathy, emotional intelligence, charisma, and ability to connect deeply with others.',
    },
    {
      name: 'Practical Plane (2 - 7 - 6)',
      numbers: [2, 7, 6],
      strength: ((gridCounts[2] > 0 ? 1 : 0) + (gridCounts[7] > 0 ? 1 : 0) + (gridCounts[6] > 0 ? 1 : 0)) / 3 * 100,
      meaning: 'Attention to detail, material execution, artistic craftsmanship, and dependable consistency.',
    },
    {
      name: 'Golden Raj Yoga Line (4 - 5 - 6)',
      numbers: [4, 5, 6],
      strength: ((gridCounts[4] > 0 ? 1 : 0) + (gridCounts[5] > 0 ? 1 : 0) + (gridCounts[6] > 0 ? 1 : 0)) / 3 * 100,
      meaning: 'Supreme financial prosperity, steady business expansions, political/administrative victory, and immense prestige.',
    },
    {
      name: 'Silver Spirituality Line (2 - 5 - 8)',
      numbers: [2, 5, 8],
      strength: ((gridCounts[2] > 0 ? 1 : 0) + (gridCounts[5] > 0 ? 1 : 0) + (gridCounts[8] > 0 ? 1 : 0)) / 3 * 100,
      meaning: 'Real estate acumen, grounded stability, spiritual mastery, emotional maturity, and ancestral blessings.',
    },
  ].map(p => ({
    ...p,
    status: (p.strength >= 100 ? 'Strong' : p.strength >= 66 ? 'Moderate' : p.strength >= 33 ? 'Weak' : 'Empty') as 'Strong' | 'Moderate' | 'Weak' | 'Empty',
  }));

  // Characteristics & Meta by Mulank (1-9)
  const mulankMeta: { [key: number]: { planet: string; traits: string[]; mission: string; gems: string[]; colors: string[]; days: string[]; lucky: number[]; enemy: number[] } } = {
    1: {
      planet: 'Sun (Surya - The Sovereign Creator)',
      traits: ['Natural Leader', 'Independent & Ambitious', 'Visionary Authority', 'High Vitality & Dignity'],
      mission: 'To pioneer trailblazing innovations, command respect through honorable leadership, and illuminate organizations with clarity.',
      gems: ['Ruby', 'Red Garnet'],
      colors: ['Gold', 'Copper', 'Orange', 'Yellow'],
      days: ['Sunday', 'Monday'],
      lucky: [1, 2, 3, 9],
      enemy: [8, 6],
    },
    2: {
      planet: 'Moon (Chandra - The Intuitive Healer)',
      traits: ['Empathetic & Diplomatic', 'Creative Imagination', 'Peaceful Harmony', 'Deep Emotional Resonance'],
      mission: 'To build bridges of mutual understanding, foster nurturing environments, and express subtle artistic beauty.',
      gems: ['Natural Pearl', 'Moonstone'],
      colors: ['Pearl White', 'Cream', 'Silver', 'Light Green'],
      days: ['Monday', 'Sunday'],
      lucky: [1, 2, 4, 7],
      enemy: [8, 9],
    },
    3: {
      planet: 'Jupiter (Brihaspati - The Wise Guru)',
      traits: ['Philosophical Wisdom', 'Expansive Optimism', 'Master Communicator', 'Lifelong Teacher & Advisor'],
      mission: 'To disseminate transformative knowledge, mentor rising generations, and uphold ethical and spiritual righteousness.',
      gems: ['Yellow Sapphire', 'Topaz'],
      colors: ['Bright Yellow', 'Golden Saffron', 'Amber'],
      days: ['Thursday', 'Tuesday'],
      lucky: [1, 2, 3, 9],
      enemy: [6],
    },
    4: {
      planet: 'Rahu (The Revolutionary Architect)',
      traits: ['Methodical Organizer', 'Out-of-the-Box Thinker', 'Technological Genius', 'Courageous Reformer'],
      mission: 'To dismantle outdated paradigms, engineer futuristic structural frameworks, and bring order to chaotic systems.',
      gems: ['Hessonite (Gomed)'],
      colors: ['Electric Blue', 'Grey', 'Brown', 'Khaki'],
      days: ['Saturday', 'Sunday'],
      lucky: [1, 4, 5, 6, 7],
      enemy: [8, 2],
    },
    5: {
      planet: 'Mercury (Budha - The Master Trader & Strategist)',
      traits: ['Rapid Adaptability', 'Commercial Brilliance', 'Witty Eloquence', 'Multi-Faceted Curiosity'],
      mission: 'To connect global networks, orchestrate thriving commercial ventures, and convey complex ideas with effortless charm.',
      gems: ['Emerald', 'Peridot'],
      colors: ['Emerald Green', 'Light Turquoise', 'Pistachio'],
      days: ['Wednesday', 'Friday'],
      lucky: [1, 5, 6],
      enemy: [2],
    },
    6: {
      planet: 'Venus (Shukra - The Aesthetic Alchemist)',
      traits: ['Refined Aesthetics', 'Sensory Luxury', 'Magnetic Charisma', 'Devoted Compassion'],
      mission: 'To infuse life with artistic elegance, foster harmonious relationships, and design sublime experiences of abundance.',
      gems: ['Diamond', 'White Zircon', 'Opal'],
      colors: ['Royal Blue', 'Pristine White', 'Rose Pink', 'Silvery Lilac'],
      days: ['Friday', 'Wednesday'],
      lucky: [5, 6, 8],
      enemy: [3],
    },
    7: {
      planet: 'Ketu (The Mystic Philosopher & Researcher)',
      traits: ['Deep Introspection', 'Occult & Metaphysical Insight', 'Analytical Researcher', 'Detached Clarity'],
      mission: 'To unravel universal mysteries, discover hidden metaphysical truths, and guide humanity toward spiritual liberation (Moksha).',
      gems: ["Cat's Eye (Lehsuniya)"],
      colors: ['Smoky Grey', 'Olive Green', 'White', 'Variegated'],
      days: ['Tuesday', 'Thursday'],
      lucky: [1, 2, 7],
      enemy: [8, 9],
    },
    8: {
      planet: 'Saturn (Shani - The Karmic Master & Judge)',
      traits: ['Unyielding Endurance', 'Mastery of Discipline', 'Deep Justice & Humility', 'Empire Builder'],
      mission: 'To construct enduring legacies through relentless perseverance, honor divine justice, and uplift the underprivileged.',
      gems: ['Blue Sapphire', 'Amethyst'],
      colors: ['Deep Navy', 'Midnight Black', 'Dark Violet'],
      days: ['Saturday', 'Friday'],
      lucky: [5, 6],
      enemy: [1, 2, 9],
    },
    9: {
      planet: 'Mars (Mangal - The Valiant Warrior & Champion)',
      traits: ['Fearless Courage', 'Dynamic Action', 'Generous Passion', 'Protector of the Righteous'],
      mission: 'To champion righteous causes, execute ambitious physical and leadership feats, and channel raw power into noble protection.',
      gems: ['Red Coral', 'Carnelian'],
      colors: ['Crimson Red', 'Scarlet', 'Coral Pink'],
      days: ['Tuesday', 'Sunday'],
      lucky: [1, 2, 3, 9],
      enemy: [5, 8],
    },
  };

  const meta = mulankMeta[mulank] || mulankMeta[1];

  // Name correction recommendations (Chaldean optimization)
  const nameCorrections: string[] = [];
  if (![1, 3, 5, 6].includes(namankChaldean)) {
    nameCorrections.push(`Adjust spelling slightly (e.g. adding or modifying an 'A', 'E', or 'N') to bring Chaldean vibration to 1 (Solar Authority), 5 (Mercury Commerce), or 6 (Venus Abundance).`);
    nameCorrections.push(`Your current name vibrates to Chaldean ${namankChaldean}, which may attract periodic delays in legal or financial transactions.`);
  } else {
    nameCorrections.push(`Your name resonates on auspicious Chaldean vibration ${namankChaldean}, in harmony with commercial prosperity and public recognition.`);
  }

  // Remedies for missing Lo Shu numbers
  const numerologyRemedies: string[] = [];
  if (gridCounts[1] === 0) numerologyRemedies.push('Place a small indoor water fountain or image of flowing water in the North zone to activate Career & Communication flow (Number 1).');
  if (gridCounts[2] === 0) numerologyRemedies.push('Keep a pair of rose quartz crystals or earthy pottery in the South-West corner to ground Relationships & Emotional balance (Number 2).');
  if (gridCounts[3] === 0) numerologyRemedies.push('Introduce lush green plants or wooden artifacts in the East direction to stimulate Knowledge & Family blessings (Number 3).');
  if (gridCounts[4] === 0) numerologyRemedies.push('Keep a wooden money plant or green aventurine in the South-East corner to anchor Discipline & Financial discipline (Number 4).');
  if (gridCounts[5] === 0) numerologyRemedies.push('Keep the central Brahmasthan of your home open, clutter-free, and well-lit to maintain core stability and vitality (Number 5).');
  if (gridCounts[6] === 0) numerologyRemedies.push('Hang a 6-rod metal wind chime or silver bowl with water in the North-West zone to magnetize Helpful Friends & Travel luck (Number 6).');
  if (gridCounts[7] === 0) numerologyRemedies.push('Wear a silver bracelet or cat’s eye gemstone to boost spiritual focus, creative progeny, and mental stamina (Number 7).');
  if (gridCounts[8] === 0) numerologyRemedies.push('Place 8 natural crystals or river stones in the North-East zone to enhance Wisdom & Systematic wealth accumulation (Number 8).');
  if (gridCounts[9] === 0) numerologyRemedies.push('Place bright warm lighting or a red pyramid in the South zone to amplify Fame, Social recognition, and Ambition (Number 9).');

  return {
    mulank,
    mulankPlanet: meta.planet,
    mulankCharacteristics: meta.traits,
    bhagyank,
    bhagyankPlanet: mulankMeta[reduceToSingleDigit(bhagyank)]?.planet || meta.planet,
    bhagyankMission: meta.mission,
    namankChaldean,
    namankPythagorean,
    nameCompatibility: [1, 3, 5, 6].includes(namankChaldean) ? 'Highly Harmonious & Auspicious' : 'Moderate - Minor Phonetic Adjustment Recommended',
    nameCorrectionSuggestions: nameCorrections,
    loShuGrid: gridCounts,
    loShuPlanes,
    luckyNumbers: meta.lucky,
    unfavorableNumbers: meta.enemy,
    luckyDays: meta.days,
    luckyColors: meta.colors,
    luckyGemstones: meta.gems,
    remedies: numerologyRemedies,
  };
}

// Calculate Daily Vedic Panchang info for any given date
export function getDailyPanchang(dateOrLat?: Date | number, lng?: number, apiData?: any): PanchangInfo {
  const date = dateOrLat instanceof Date ? dateOrLat : new Date();
  const lat = typeof dateOrLat === 'number' ? dateOrLat : 28.6139; // Default to New Delhi
  const longitude = lng || 77.209;

  const tithis = [
    'Shukla Pratipada (प्रतिपदा)', 'Shukla Dwitiya (द्वितीया)', 'Shukla Tritiya (तृतीया)', 'Shukla Chaturthi (चतुर्थी)',
    'Shukla Panchami (पंचमी)', 'Shukla Shashthi (षष्ठी)', 'Shukla Saptami (सप्तमी)', 'Shukla Ashtami (अष्टमी)',
    'Shukla Navami (नवमी)', 'Shukla Dashami (दशमी)', 'Shukla Ekadashi (एकादशी)', 'Shukla Dwadashi (द्वादशी)',
    'Shukla Trayodashi (त्रयोदशी)', 'Shukla Chaturdashi (चतुर्दशी)', 'Purnima (पूर्णिमा - Full Moon)',
    'Krishna Pratipada', 'Krishna Dwitiya', 'Krishna Tritiya', 'Krishna Chaturthi',
    'Krishna Panchami', 'Krishna Shashthi', 'Krishna Saptami', 'Krishna Ashtami',
    'Krishna Navami', 'Krishna Dashami', 'Krishna Ekadashi', 'Krishna Dwadashi',
    'Krishna Trayodashi', 'Krishna Chaturdashi', 'Amavasya (अमावस्या - New Moon)',
  ];

  const yogas = [
    'Vishkambha', 'Priti (प्रीति - Auspicious)', 'Ayushman (आयुष्मान - Longevity)', 'Saubhagya (सौभाग्य - Fortune)',
    'Shobhana (शोभन)', 'Atiganda', 'Sukarma (सुकर्मा - Great Actions)', 'Dhriti', 'Shula',
    'Ganda', 'Vriddhi (वृद्धि - Prosperity)', 'Dhruva', 'Vyaghata', 'Harshana (हर्षण - Joy)',
    'Vajra', 'Siddhi (सिद्धि - Achievement)', 'Vyatipata', 'Variyan', 'Parigha',
    'Shiva (शिव - Benevolent)', 'Siddha', 'Sadhya', 'Shubha (शुभ - Pure Auspiciousness)', 'Shukla',
    'Brahma (ब्रह्म)', 'Indra', 'Vaidhriti',
  ];

  const karanas = ['Bava (बव)', 'Balava (बालव)', 'Kaulava (कौलव)', 'Taitila (तैतिल)', 'Gara (गर)', 'Vanija (वणिज)', 'Vishti / Bhadra', 'Shakuni', 'Chatushpada', 'Naga', 'Kinstughna'];

  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  
  // Real world lunar cycle approximation (Known new moon: Jan 11, 2024)
  const daysSinceNewMoon = (date.getTime() - new Date('2024-01-11T11:57:00Z').getTime()) / 86400000;
  const phase = (daysSinceNewMoon % 29.530588 + 29.530588) % 29.530588;
  const tithiIdx = apiData && apiData.tithiIndex !== undefined ? apiData.tithiIndex : (Math.floor(phase * (30 / 29.530588)) % 30);
  
  // Nakshatra approximation (Moon travels ~13.33 degrees per day, 27.32 days per orbit)
  const daysSinceKnownNak = (date.getTime() - new Date('2024-01-01T00:00:00Z').getTime()) / 86400000;
  const nakIdx = apiData && apiData.nakshatraIndex !== undefined ? apiData.nakshatraIndex : (Math.floor((daysSinceKnownNak % 27.321661 + 27.321661) % 27.321661) % 27);

  const yogaIdx = apiData && apiData.yogaIndex !== undefined ? apiData.yogaIndex : ((dayOfYear * 3) % yogas.length);
  const karanaIdx = apiData && apiData.karanaIndex !== undefined ? (apiData.karanaIndex % karanas.length) : ((dayOfYear * 4) % karanas.length);

  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  const yoga = apiData && apiData.yogaName ? apiData.yogaName : yogas[yogaIdx];
  const tithi = apiData && apiData.tithiName ? apiData.tithiName : tithis[tithiIdx];
  const nakshatra = apiData && apiData.nakshatraName ? apiData.nakshatraName : NAKSHATRAS[nakIdx].name + ' (Lord: ' + NAKSHATRAS[nakIdx].lord + ')';
  const karana = apiData && apiData.karanaName ? apiData.karanaName : karanas[karanaIdx];

  const totalSunriseMins = 0; // Default fallback if no apiData
  const formatTime = (m: number) => "00:00 AM";

  // Use backend API data if available
  const sunriseStr = apiData?.timings?.sunrise || formatTime(totalSunriseMins);
  const sunsetStr = apiData?.timings?.sunset || formatTime(totalSunriseMins);
  const rahuKaalStr = apiData?.timings?.rahuKaal || 'Calculate from Backend';
  const abhijitMuhurtaStr = apiData?.timings?.abhijitMuhurta || 'Calculate from Backend';
  const brahmaMuhurtaStr = apiData?.timings?.brahmaMuhurta || '04:32 AM - 05:20 AM (Ideal for Meditation & Sadhana)';
  const auspiciousScoreVal = apiData?.auspiciousScore || (50 + ((tithiIdx * 3 + nakIdx * 2 + dayOfYear) % 50));

  return {
    date: date.toISOString().split('T')[0],
    tithi: tithi,
    tithiEnd: 'Backend IST',
    nakshatra: nakshatra,
    nakshatraEnd: 'Backend IST',
    yoga: yoga,
    karana: karana,
    solarSign: ZODIAC_SIGNS[(Math.floor(dayOfYear / 30.5) + 4) % 12].sanskrit,
    lunarSign: ZODIAC_SIGNS[(Math.floor(dayOfYear / 2.3) + 1) % 12].sanskrit,
    sunrise: sunriseStr,
    sunset: sunsetStr,
    rahuKaal: rahuKaalStr,
    abhijitMuhurta: abhijitMuhurtaStr,
    brahmaMuhurta: brahmaMuhurtaStr,
    auspiciousScore: auspiciousScoreVal,
  };
}

export const calculateDailyPanchang = getDailyPanchang;

export const DEFAULT_CONSULTATION_TIERS = [
  {
    id: 'express_audit',
    name: 'Express Planetary Audit',
    priceINR: 499,
    priceUSD: 9,
    description: 'Quick astrological diagnostic covering natal strength, active dasha period, and 3 key focus questions.',
    features: [
      'Instant Natal Lagna & Navamsha summary',
      'Active Vimshottari Mahadasha analysis',
      '3 specific life questions answered by AI Daivajna',
      'Primary gemstone & Rudraksha recommendation',
      'Downloadable PDF Summary',
    ],
    deliveryTime: 'Instant Access',
  },
  {
    id: 'career_wealth_blueprint',
    name: '10-Year Career & Wealth Blueprint',
    priceINR: 1499,
    priceUSD: 29,
    description: 'Comprehensive 10-year professional roadmap, financial inflection years, and Sade Sati mitigation.',
    features: [
      '10th House (Karma Bhava) & 11th House (Labha) deep dive',
      'Year-by-year transit windows (Jupiter & Saturn)',
      'Chaldean Name spelling correction analysis',
      'Sade Sati & Manglik Dosha cancellation check',
      'Comprehensive Vastu & Vedic Upayas',
      'Priority AI Astrologer counselling access',
    ],
    isPopular: true,
    deliveryTime: 'Instant Access',
  },
  {
    id: 'kundli_milan_synergy',
    name: 'Kundli Milan & Relationship Synergy',
    priceINR: 2199,
    priceUSD: 39,
    description: 'Ashta Koota 36 Guna matching, Bhakoot & Nadi dosha analysis, and D9 Navamsha compatibility.',
    features: [
      '36 Gunas Ashta Koota detailed scoring breakdown',
      'Manglik Dosha mutual aspect analysis',
      'Navamsha (D9) & Saptamsha (D7) marriage longevity',
      'Family harmony & financial prosperity after union',
      'Vedic Remedial rituals for relationship peace',
    ],
    deliveryTime: 'Instant Access',
  },
  {
    id: 'live_pandit_video',
    name: 'Certified Daivajna Video Session',
    priceINR: 4999,
    priceUSD: 79,
    description: '45-minute private 1-on-1 video consultation with a certified Vedic Pandit & personalized energized Yantra.',
    features: [
      '45-minute live 1-on-1 video call with senior Jyotish Acharya',
      'Birth time rectification (BTR) assistance',
      'Detailed Prashna Kundli for immediate dilemmas',
      'Personalized energized Rudraksha/Gemstone certificate',
      'Full audio & written consultation recording dossier',
    ],
    deliveryTime: 'Scheduled within 24 Hours',
  },
];

export const DEFAULT_ROADMAP = [
  {
    id: 'ms-1',
    timeframe: '0-12 Months',
    category: 'Career',
    title: 'Strategic Role Transition & Leadership Visibility',
    guidance: 'Jupiter transit over your 10th house stimulates executive authority. Finalize negotiations and launch high-visibility initiatives between April and September.',
    favorableTransits: 'Jupiter transit in Gemini trine Lagna',
    remedialAction: 'Chant Brihaspati Beej Mantra on Thursdays; donate yellow lentils.',
    status: 'In-Progress' as const,
  },
  {
    id: 'ms-2',
    timeframe: '0-12 Months',
    category: 'Wealth',
    title: 'Diversified Asset Allocation & Real Estate Review',
    guidance: 'Favorable aspect on 2nd and 11th houses indicates strong liquidity growth. Avoid speculative short-term gambling during Rahu Kaal periods.',
    favorableTransits: 'Venus exalted in 11th house sub-period',
    remedialAction: 'Offer water to rising Sun (Surya Arghya) with red sandalwood.',
    status: 'Pending' as const,
  },
  {
    id: 'ms-3',
    timeframe: '1-3 Years',
    category: 'Relationships',
    title: 'Harmonious Partnership & Family Auspiciousness',
    guidance: 'Darakaraka planet activation fosters emotional stability and auspicious family events. A peaceful spiritual journey strengthens marital bonds.',
    favorableTransits: 'Jupiter aspecting 7th house of marriage',
    remedialAction: 'Perform Gauri-Shankar Puja on Shukla Paksha Mondays.',
    status: 'Pending' as const,
  },
  {
    id: 'ms-4',
    timeframe: '3-5 Years',
    category: 'Career',
    title: 'Independent Venture / Commercial Global Expansion',
    guidance: 'Mercury-Jupiter combined period sparks entrepreneurial breakthrough. Excellent for intellectual property patents, cross-border commerce, and scaling.',
    favorableTransits: 'Saturn moving into friendly 11th house',
    remedialAction: 'Wear a natural 5-carat Emerald or keep a Budh Yantra in the study.',
    status: 'Pending' as const,
  },
  {
    id: 'ms-5',
    timeframe: '5-10 Years',
    category: 'Spirituality',
    title: 'Spiritual Dharma Mastery & Philanthropic Legacy',
    guidance: 'Ketu transit activating 9th house triggers profound philosophical inquiry, pilgrimage, and institutional philanthropy.',
    favorableTransits: 'Ketu in 9th house of Dharma',
    remedialAction: 'Daily recitation of Vishnu Sahasranama and feeding street animals.',
    status: 'Pending' as const,
  },
];

// ==========================================
// ASHTA KOOTA MATCHMAKING & KUNDLI MILAN ENGINE
// ==========================================

export const NAKSHATRA_ATTRIBUTES: Record<
  string,
  {
    index: number;
    gana: 'Deva' | 'Manushya' | 'Rakshasa';
    yoni: string;
    nadi: 'Adi' | 'Madhya' | 'Antya';
    rashiIndex: number;
    rashiName: string;
    lord: string;
  }
> = {
  Ashwini: { index: 0, gana: 'Deva', yoni: 'Horse (Ashwa)', nadi: 'Adi', rashiIndex: 0, rashiName: 'Aries', lord: 'Ketu' },
  Bharani: { index: 1, gana: 'Manushya', yoni: 'Elephant (Gaja)', nadi: 'Madhya', rashiIndex: 0, rashiName: 'Aries', lord: 'Venus' },
  Krittika: { index: 2, gana: 'Rakshasa', yoni: 'Ram (Mesha)', nadi: 'Antya', rashiIndex: 1, rashiName: 'Taurus', lord: 'Sun' },
  Rohini: { index: 3, gana: 'Manushya', yoni: 'Serpent (Sarpa)', nadi: 'Antya', rashiIndex: 1, rashiName: 'Taurus', lord: 'Moon' },
  Mrigashira: { index: 4, gana: 'Deva', yoni: 'Serpent (Sarpa)', nadi: 'Madhya', rashiIndex: 1, rashiName: 'Taurus', lord: 'Mars' },
  Ardra: { index: 5, gana: 'Manushya', yoni: 'Dog (Shwan)', nadi: 'Adi', rashiIndex: 2, rashiName: 'Gemini', lord: 'Rahu' },
  Punarvasu: { index: 6, gana: 'Deva', yoni: 'Cat (Marjara)', nadi: 'Adi', rashiIndex: 2, rashiName: 'Gemini', lord: 'Jupiter' },
  Pushya: { index: 7, gana: 'Deva', yoni: 'Ram (Mesha)', nadi: 'Madhya', rashiIndex: 3, rashiName: 'Cancer', lord: 'Saturn' },
  Ashlesha: { index: 8, gana: 'Rakshasa', yoni: 'Cat (Marjara)', nadi: 'Antya', rashiIndex: 3, rashiName: 'Cancer', lord: 'Mercury' },
  Magha: { index: 9, gana: 'Rakshasa', yoni: 'Rat (Mushaka)', nadi: 'Antya', rashiIndex: 4, rashiName: 'Leo', lord: 'Ketu' },
  'Purva Phalguni': { index: 10, gana: 'Manushya', yoni: 'Rat (Mushaka)', nadi: 'Madhya', rashiIndex: 4, rashiName: 'Leo', lord: 'Venus' },
  'Uttara Phalguni': { index: 11, gana: 'Manushya', yoni: 'Cow (Gau)', nadi: 'Adi', rashiIndex: 5, rashiName: 'Virgo', lord: 'Sun' },
  Hasta: { index: 12, gana: 'Deva', yoni: 'Buffalo (Mahisha)', nadi: 'Adi', rashiIndex: 5, rashiName: 'Virgo', lord: 'Moon' },
  Chitra: { index: 13, gana: 'Rakshasa', yoni: 'Tiger (Vyaghra)', nadi: 'Madhya', rashiIndex: 5, rashiName: 'Virgo', lord: 'Mars' },
  Swati: { index: 14, gana: 'Deva', yoni: 'Buffalo (Mahisha)', nadi: 'Antya', rashiIndex: 6, rashiName: 'Libra', lord: 'Rahu' },
  Vishakha: { index: 15, gana: 'Rakshasa', yoni: 'Tiger (Vyaghra)', nadi: 'Antya', rashiIndex: 6, rashiName: 'Libra', lord: 'Jupiter' },
  Anuradha: { index: 16, gana: 'Deva', yoni: 'Deer (Mriga)', nadi: 'Madhya', rashiIndex: 7, rashiName: 'Scorpio', lord: 'Saturn' },
  Jyeshtha: { index: 17, gana: 'Rakshasa', yoni: 'Deer (Mriga)', nadi: 'Adi', rashiIndex: 7, rashiName: 'Scorpio', lord: 'Mercury' },
  Mula: { index: 18, gana: 'Rakshasa', yoni: 'Dog (Shwan)', nadi: 'Adi', rashiIndex: 8, rashiName: 'Sagittarius', lord: 'Ketu' },
  'Purva Ashadha': { index: 19, gana: 'Manushya', yoni: 'Monkey (Vanara)', nadi: 'Madhya', rashiIndex: 8, rashiName: 'Sagittarius', lord: 'Venus' },
  'Uttara Ashadha': { index: 20, gana: 'Manushya', yoni: 'Mongoose (Nakula)', nadi: 'Antya', rashiIndex: 9, rashiName: 'Capricorn', lord: 'Sun' },
  Shravana: { index: 21, gana: 'Deva', yoni: 'Monkey (Vanara)', nadi: 'Antya', rashiIndex: 9, rashiName: 'Capricorn', lord: 'Moon' },
  Dhanishta: { index: 22, gana: 'Rakshasa', yoni: 'Lion (Simha)', nadi: 'Madhya', rashiIndex: 9, rashiName: 'Capricorn', lord: 'Mars' },
  Shatabhisha: { index: 23, gana: 'Rakshasa', yoni: 'Horse (Ashwa)', nadi: 'Adi', rashiIndex: 10, rashiName: 'Aquarius', lord: 'Rahu' },
  'Purva Bhadrapada': { index: 24, gana: 'Manushya', yoni: 'Lion (Simha)', nadi: 'Adi', rashiIndex: 10, rashiName: 'Aquarius', lord: 'Jupiter' },
  'Uttara Bhadrapada': { index: 25, gana: 'Manushya', yoni: 'Cow (Gau)', nadi: 'Madhya', rashiIndex: 11, rashiName: 'Pisces', lord: 'Saturn' },
  Revati: { index: 26, gana: 'Deva', yoni: 'Elephant (Gaja)', nadi: 'Antya', rashiIndex: 11, rashiName: 'Pisces', lord: 'Mercury' },
};

// Yoni Enemies matrix (Sworn hostile pairings)
const YONI_ENEMIES: Record<string, string> = {
  'Horse (Ashwa)': 'Buffalo (Mahisha)',
  'Buffalo (Mahisha)': 'Horse (Ashwa)',
  'Elephant (Gaja)': 'Lion (Simha)',
  'Lion (Simha)': 'Elephant (Gaja)',
  'Ram (Mesha)': 'Monkey (Vanara)',
  'Monkey (Vanara)': 'Ram (Mesha)',
  'Serpent (Sarpa)': 'Mongoose (Nakula)',
  'Mongoose (Nakula)': 'Serpent (Sarpa)',
  'Dog (Shwan)': 'Deer (Mriga)',
  'Deer (Mriga)': 'Dog (Shwan)',
  'Cat (Marjara)': 'Rat (Mushaka)',
  'Rat (Mushaka)': 'Cat (Marjara)',
  'Cow (Gau)': 'Tiger (Vyaghra)',
  'Tiger (Vyaghra)': 'Cow (Gau)',
};

// Planetary friendships (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn)
const GRAHA_FRIENDSHIPS: Record<string, { friends: string[]; neutrals: string[]; enemies: string[] }> = {
  Sun: { friends: ['Moon', 'Mars', 'Jupiter'], neutrals: ['Mercury'], enemies: ['Venus', 'Saturn'] },
  Moon: { friends: ['Sun', 'Mercury'], neutrals: ['Mars', 'Jupiter', 'Venus', 'Saturn'], enemies: [] },
  Mars: { friends: ['Sun', 'Moon', 'Jupiter'], neutrals: ['Venus', 'Saturn'], enemies: ['Mercury'] },
  Mercury: { friends: ['Sun', 'Venus'], neutrals: ['Mars', 'Jupiter', 'Saturn'], enemies: ['Moon'] },
  Jupiter: { friends: ['Sun', 'Moon', 'Mars'], neutrals: ['Saturn'], enemies: ['Mercury', 'Venus'] },
  Venus: { friends: ['Mercury', 'Saturn'], neutrals: ['Mars', 'Jupiter'], enemies: ['Sun', 'Moon'] },
  Saturn: { friends: ['Mercury', 'Venus'], neutrals: ['Jupiter'], enemies: ['Sun', 'Moon', 'Mars'] },
};

// Helper: Varna mapping by Rashi Index
function getVarna(rashiIdx: number): { name: string; rank: number } {
  // Cancer, Scorpio, Pisces -> Brahmin (Rank 4)
  if ([3, 7, 11].includes(rashiIdx)) return { name: 'Brahmin (Spiritual / Intellectual)', rank: 4 };
  // Aries, Leo, Sagittarius -> Kshatriya (Rank 3)
  if ([0, 4, 8].includes(rashiIdx)) return { name: 'Kshatriya (Leadership / Valor)', rank: 3 };
  // Taurus, Virgo, Capricorn -> Vaishya (Rank 2)
  if ([1, 5, 9].includes(rashiIdx)) return { name: 'Vaishya (Commercial / Pragmatic)', rank: 2 };
  // Gemini, Libra, Aquarius -> Shudra (Rank 1)
  return { name: 'Shudra (Service / Artisan)', rank: 1 };
}

// Helper: Vashya mapping by Rashi Index
function getVashya(rashiIdx: number): string {
  if ([0, 1].includes(rashiIdx)) return 'Chatushpada (Quadruped)';
  if ([2, 5, 6, 10].includes(rashiIdx)) return 'Manava (Human / Biped)';
  if ([3, 7, 11].includes(rashiIdx)) return 'Jalachara (Water / Aquatic)';
  if (rashiIdx === 4) return 'Vanachara (Wild / Lion)';
  return 'Keeta (Insect / Scorpio-Makara)';
}

export function calculateKundliMilan(partner1: UserProfile, partner2: UserProfile): AshtaKootaMilanResult {
  const chart1 = calculateVedicChart(partner1);
  const chart2 = calculateVedicChart(partner2);

  const num1 = calculateNumerology(partner1.fullName, partner1.birthDate);
  const num2 = calculateNumerology(partner2.fullName, partner2.birthDate);

  // Derive Moon positions
  const moon1 = chart1.planets.find((p) => p.name === 'Moon') || chart1.planets[1];
  const moon2 = chart2.planets.find((p) => p.name === 'Moon') || chart2.planets[1];

  const nak1 = NAKSHATRA_ATTRIBUTES[moon1.nakshatra] || NAKSHATRA_ATTRIBUTES['Ashwini'];
  const nak2 = NAKSHATRA_ATTRIBUTES[moon2.nakshatra] || NAKSHATRA_ATTRIBUTES['Rohini'];

  const rashi1Idx = moon1.signIndex;
  const rashi2Idx = moon2.signIndex;
  const rashi1Lord = ZODIAC_SIGNS[rashi1Idx].lord;
  const rashi2Lord = ZODIAC_SIGNS[rashi2Idx].lord;

  // 1. VARNA KOOTA (Max 1 point)
  const varna1 = getVarna(rashi1Idx);
  const varna2 = getVarna(rashi2Idx);
  let varnaPoints = 0;
  if (varna1.rank >= varna2.rank) {
    varnaPoints = 1;
  } else if (varna1.rank === varna2.rank) {
    varnaPoints = 1;
  } else {
    varnaPoints = 0;
  }

  const varnaKoota: KootaItem = {
    id: 'varna',
    name: 'Varna Koota',
    sanskritName: 'वर्ण कूट',
    maxPoints: 1,
    obtainedPoints: varnaPoints,
    p1Value: varna1.name.split(' ')[0],
    p2Value: varna2.name.split(' ')[0],
    area: 'Spiritual Ego & Work Harmony',
    description: 'Measures spiritual alignment, intellectual ego balance, and vocational mutual respect.',
    verdict: varnaPoints === 1 ? 'Excellent' : 'Challenging',
    status: varnaPoints === 1 ? 'good' : 'average',
    details:
      varnaPoints === 1
        ? 'Harmonious spiritual polarity; both individuals share mutual respect for core vocational ethics.'
        : 'Slight ego dissonance in vocational authority; remedied through clear communication of personal boundaries.',
  };

  // 2. VASHYA KOOTA (Max 2 points)
  const vashya1 = getVashya(rashi1Idx);
  const vashya2 = getVashya(rashi2Idx);
  let vashyaPoints = 0;
  if (vashya1 === vashya2) {
    vashyaPoints = 2;
  } else if (
    (vashya1.includes('Manava') && vashya2.includes('Chatushpada')) ||
    (vashya2.includes('Manava') && vashya1.includes('Chatushpada'))
  ) {
    vashyaPoints = 1;
  } else if (
    (vashya1.includes('Jalachara') && vashya2.includes('Manava')) ||
    (vashya2.includes('Jalachara') && vashya1.includes('Manava'))
  ) {
    vashyaPoints = 1.5;
  } else if (vashya1.includes('Vanachara') || vashya2.includes('Vanachara')) {
    vashyaPoints = 0.5;
  } else {
    vashyaPoints = 1;
  }

  const vashyaKoota: KootaItem = {
    id: 'vashya',
    name: 'Vashya Koota',
    sanskritName: 'वश्य कूट',
    maxPoints: 2,
    obtainedPoints: vashyaPoints,
    p1Value: vashya1.split(' ')[0],
    p2Value: vashya2.split(' ')[0],
    area: 'Dominance & Magnetic Attraction',
    description: 'Assesses interpersonal power balance, natural magnetic influence, and mutual receptivity.',
    verdict: vashyaPoints >= 1.5 ? 'Excellent' : vashyaPoints >= 1 ? 'Good' : 'Average',
    status: vashyaPoints >= 1.5 ? 'good' : 'average',
    details:
      vashyaPoints >= 1.5
        ? 'Strong mutual attraction and natural willingness to support each other without power struggles.'
        : 'Balanced interpersonal dynamic; occasional need for collaborative consensus in decision making.',
  };

  // 3. TARA KOOTA (Max 3 points)
  // Distance between nakshatras % 9
  const tara1to2 = ((nak2.index - nak1.index + 27) % 9) + 1;
  const tara2to1 = ((nak1.index - nak2.index + 27) % 9) + 1;
  const auspiciousTaras = [1, 2, 4, 6, 8, 9]; // Janma, Sampat, Kshema, Sadhaka, Mitra, Ati-Mitra
  let taraPoints = 0;
  if (auspiciousTaras.includes(tara1to2)) taraPoints += 1.5;
  if (auspiciousTaras.includes(tara2to1)) taraPoints += 1.5;

  const taraKoota: KootaItem = {
    id: 'tara',
    name: 'Tara Koota',
    sanskritName: 'तारा कूट',
    maxPoints: 3,
    obtainedPoints: taraPoints,
    p1Value: `Tara ${tara1to2}/9 (${nak1.lord})`,
    p2Value: `Tara ${tara2to1}/9 (${nak2.lord})`,
    area: 'Destiny, Health & Longevity Accord',
    description: 'Evaluates cosmic fortune, health protection, longevity, and mutual auspicious timing.',
    verdict: taraPoints === 3 ? 'Excellent' : taraPoints >= 1.5 ? 'Good' : 'Challenging',
    status: taraPoints >= 1.5 ? 'good' : 'critical',
    details:
      taraPoints === 3
        ? 'Exceptionally auspicious planetary star concordance; brings protection, mutual longevity, and prosperity.'
        : taraPoints >= 1.5
        ? 'Beneficial star alignment with solid overall life protection.'
        : 'Challenging Tara cycle; recommended to recite Maha Mrityunjaya Mantra together for health vitality.',
  };

  // 4. YONI KOOTA (Max 4 points)
  const yoni1 = nak1.yoni;
  const yoni2 = nak2.yoni;
  let yoniPoints = 0;
  if (yoni1 === yoni2) {
    yoniPoints = 4;
  } else if (YONI_ENEMIES[yoni1] === yoni2 || YONI_ENEMIES[yoni2] === yoni1) {
    yoniPoints = 0;
  } else {
    // Friendly vs Neutral calculation
    const isFriendly =
      (yoni1.includes('Gaja') && yoni2.includes('Gau')) ||
      (yoni1.includes('Ashwa') && yoni2.includes('Mriga')) ||
      (yoni1.includes('Vanara') && yoni2.includes('Marjara'));
    yoniPoints = isFriendly ? 3 : 2;
  }

  const yoniKoota: KootaItem = {
    id: 'yoni',
    name: 'Yoni Koota',
    sanskritName: 'योनि कूट',
    maxPoints: 4,
    obtainedPoints: yoniPoints,
    p1Value: yoni1.split(' ')[0],
    p2Value: yoni2.split(' ')[0],
    area: 'Physical & Biological Compatibility',
    description: 'Measures instinctual affinity, physical comfort, intimate satisfaction, and biological sync.',
    verdict: yoniPoints === 4 ? 'Excellent' : yoniPoints >= 2 ? 'Good' : 'Critical',
    status: yoniPoints >= 2 ? 'good' : 'critical',
    details:
      yoniPoints === 4
        ? 'Same Yoni animal archetype; perfect instinctual harmony, mutual physical fondness, and deep bonding.'
        : yoniPoints >= 2
        ? 'Harmonious physical compatibility with great mutual understanding of intimacy needs.'
        : 'Inimical Yoni pairing; requires patience, conscious tenderness, and emotional communication.',
  };

  // 5. GRAHA MAITRI (Max 5 points)
  const lord1 = rashi1Lord;
  const lord2 = rashi2Lord;
  let grahaPoints = 0;

  if (lord1 === lord2) {
    grahaPoints = 5;
  } else {
    const p1ToP2Friend = GRAHA_FRIENDSHIPS[lord1]?.friends.includes(lord2);
    const p1ToP2Neutral = GRAHA_FRIENDSHIPS[lord1]?.neutrals.includes(lord2);
    const p2ToP1Friend = GRAHA_FRIENDSHIPS[lord2]?.friends.includes(lord1);
    const p2ToP1Neutral = GRAHA_FRIENDSHIPS[lord2]?.neutrals.includes(lord1);

    if (p1ToP2Friend && p2ToP1Friend) {
      grahaPoints = 5;
    } else if ((p1ToP2Friend && p2ToP1Neutral) || (p2ToP1Friend && p1ToP2Neutral)) {
      grahaPoints = 4;
    } else if (p1ToP2Neutral && p2ToP1Neutral) {
      grahaPoints = 3;
    } else if (p1ToP2Friend || p2ToP1Friend) {
      grahaPoints = 1;
    } else {
      grahaPoints = 0.5;
    }
  }

  const grahaKoota: KootaItem = {
    id: 'graha_maitri',
    name: 'Graha Maitri Koota',
    sanskritName: 'ग्रह मैत्री कूट',
    maxPoints: 5,
    obtainedPoints: grahaPoints,
    p1Value: `${ZODIAC_SIGNS[rashi1Idx].name} (${lord1})`,
    p2Value: `${ZODIAC_SIGNS[rashi2Idx].name} (${lord2})`,
    area: 'Mental Harmony & Friendship',
    description: 'Governs intellectual camaraderie, shared worldview, emotional rapport, and friendship.',
    verdict: grahaPoints >= 4 ? 'Excellent' : grahaPoints >= 3 ? 'Good' : 'Average',
    status: grahaPoints >= 3 ? 'good' : 'average',
    details:
      grahaPoints >= 4
        ? 'Moon sign lords are mutual friends; deep intellectual wavelength, emotional transparency, and laughter.'
        : grahaPoints >= 3
        ? 'Neutral planetary lords; mutual respect and functional communication thrive with common goals.'
        : 'Incompatible Moon sign lords; intellectual views differ, encouraging personal patience and growth.',
  };

  // 6. GANA KOOTA (Max 6 points)
  const gana1 = nak1.gana;
  const gana2 = nak2.gana;
  let ganaPoints = 0;

  if (gana1 === gana2) {
    ganaPoints = 6;
  } else if ((gana1 === 'Deva' && gana2 === 'Manushya') || (gana1 === 'Manushya' && gana2 === 'Deva')) {
    ganaPoints = 5;
  } else if ((gana1 === 'Deva' && gana2 === 'Rakshasa') || (gana1 === 'Rakshasa' && gana2 === 'Deva')) {
    ganaPoints = 1;
  } else {
    ganaPoints = 0; // Manushya + Rakshasa
  }

  const ganaKoota: KootaItem = {
    id: 'gana',
    name: 'Gana Koota',
    sanskritName: 'गण कूट',
    maxPoints: 6,
    obtainedPoints: ganaPoints,
    p1Value: `${gana1} Gana`,
    p2Value: `${gana2} Gana`,
    area: 'Temperament & Psychological Constitution',
    description: 'Evaluates emotional temperament, lifestyle expectations, stress tolerance, and social persona.',
    verdict: ganaPoints >= 5 ? 'Excellent' : ganaPoints >= 1 ? 'Average' : 'Critical',
    status: ganaPoints >= 5 ? 'good' : 'critical',
    details:
      ganaPoints >= 5
        ? 'Compatible psychological constitution; harmonious emotional reactions, conflict resolution, and lifestyle pace.'
        : 'Temperamental contrast (e.g. Divine/Human vs Fierce); remedied through conscious emotional empathy and space.',
  };

  // 7. BHAKOOT KOOTA (Max 7 points)
  // Distance between Moon Rashis (1-based)
  const rashiDiff = ((rashi2Idx - rashi1Idx + 12) % 12) + 1;
  const altDiff = 14 - rashiDiff;
  const isBhakootInauspicious =
    (rashiDiff === 2 && altDiff === 12) ||
    (rashiDiff === 12 && altDiff === 2) || // 2/12 Dwirdwadashe
    (rashiDiff === 6 && altDiff === 8) ||
    (rashiDiff === 8 && altDiff === 6) || // 6/8 Shadashtak
    (rashiDiff === 5 && altDiff === 9 && lord1 !== lord2) || // 5/9 Navapancham (inauspicious if lords enemy)
    (rashiDiff === 9 && altDiff === 5 && lord1 !== lord2);

  // Cancellation: Same Lord (e.g. Aries-Scorpio, Taurus-Libra, Capricorn-Aquarius)
  const isBhakootCancelled = isBhakootInauspicious && (lord1 === lord2 || grahaPoints >= 4);

  let bhakootPoints = 0;
  if (!isBhakootInauspicious || isBhakootCancelled) {
    bhakootPoints = 7;
  } else {
    bhakootPoints = 0;
  }

  const bhakootKoota: KootaItem = {
    id: 'bhakoot',
    name: 'Bhakoot Koota',
    sanskritName: 'भकूट कूट',
    maxPoints: 7,
    obtainedPoints: bhakootPoints,
    p1Value: `${ZODIAC_SIGNS[rashi1Idx].name} (${rashi1Idx + 1})`,
    p2Value: `${ZODIAC_SIGNS[rashi2Idx].name} (${rashi2Idx + 1})`,
    area: 'Emotional Connection & Family Welfare',
    description: 'Governs marital longevity, joint financial accumulation, emotional flow, and progeny prosperity.',
    verdict: bhakootPoints === 7 ? 'Excellent' : 'Critical',
    status: bhakootPoints === 7 ? 'good' : 'critical',
    details:
      bhakootPoints === 7
        ? isBhakootCancelled
          ? 'Bhakoot Dosha cancelled due to shared/friendly planetary lordship; auspicious family abundance.'
          : 'Auspicious Rashi angular disposition; grants joy, family harmony, and sustained financial growth.'
        : `Challenging ${rashiDiff}/${altDiff} Rashi disposition (Bhakoot Dosha); requires joint charitable offerings and Shiva-Parvati worship.`,
  };

  // 8. NADI KOOTA (Max 8 points)
  const nadi1 = nak1.nadi;
  const nadi2 = nak2.nadi;
  const isSameNadi = nadi1 === nadi2;

  // Nadi Dosha cancellation:
  // 1. Same Rashi but different Nakshatras
  // 2. Same Nakshatra but different Pada / different Rashi
  const isNadiCancelled = isSameNadi && (nak1.index !== nak2.index || rashi1Idx !== rashi2Idx);

  let nadiPoints = 0;
  if (!isSameNadi) {
    nadiPoints = 8;
  } else if (isNadiCancelled) {
    nadiPoints = 8;
  } else {
    nadiPoints = 0;
  }

  const nadiKoota: KootaItem = {
    id: 'nadi',
    name: 'Nadi Koota',
    sanskritName: 'नाड़ी कूट',
    maxPoints: 8,
    obtainedPoints: nadiPoints,
    p1Value: `${nadi1} Nadi`,
    p2Value: `${nadi2} Nadi`,
    area: 'Genetic Compatibility & Progeny Energy',
    description: 'Highest-weighted Koota; ensures genetic vitality, nervous-system resonance, and healthy progeny.',
    verdict: nadiPoints === 8 ? 'Excellent' : 'Critical',
    status: nadiPoints === 8 ? 'good' : 'critical',
    details:
      nadiPoints === 8
        ? isNadiCancelled
          ? 'Same Nadi cancelled through auspicious nakshatra/rashi variance; ensures genetic vigor and vitality.'
          : 'Different Nadis (Vata/Pitta/Kapha balance); ideal bio-magnetic sync and strong hereditary longevity.'
        : `Nadi Dosha detected (${nadi1} Nadi for both); recommended to perform Maha Mrityunjaya Japa & gold/cow charity.`,
  };

  const kootas = [
    varnaKoota,
    vashyaKoota,
    taraKoota,
    yoniKoota,
    grahaKoota,
    ganaKoota,
    bhakootKoota,
    nadiKoota,
  ];

  const totalPoints = kootas.reduce((acc, k) => acc + k.obtainedPoints, 0);
  const percentage = Math.round((totalPoints / 36) * 100);

  // Verdict evaluation
  let verdictTitle = '';
  let verdictColor = '';
  let summary = '';

  if (totalPoints >= 28) {
    verdictTitle = 'Uttam Milan • Highly Auspicious Match';
    verdictColor = '#C9A050';
    summary = `Exceptional compatibility with ${totalPoints}/36 Gunas (${percentage}%). This sacred union promises profound emotional resonance, marital bliss, financial prosperity, and mutual spiritual evolution.`;
  } else if (totalPoints >= 21) {
    verdictTitle = 'Madhyam Shubh • Very Good Match';
    verdictColor = '#7EBC89';
    summary = `Strong compatibility with ${totalPoints}/36 Gunas (${percentage}%). The couple possesses high harmony across major life domains. Minor remedial recommendations ensure enduring companionship.`;
  } else if (totalPoints >= 18) {
    verdictTitle = 'Samanya • Average Match (Recommended with Remedies)';
    verdictColor = '#E6A15C';
    summary = `Acceptable compatibility with ${totalPoints}/36 Gunas (${percentage}%). Crosses the classical 18-point threshold. Practicing suggested astrological remedies harmonizes specific difference areas.`;
  } else {
    verdictTitle = 'Alpa Milan • Challenging Match (Strict Remedies Needed)';
    verdictColor = '#E06C75';
    summary = `Compatibility score is ${totalPoints}/36 Gunas (${percentage}%). While individual karmic bonds can overcome astrological scores, dedicated remedial pujas and mature communication are essential.`;
  }

  // MANGLIK (KUJA) DOSHA ANALYSIS
  const mars1 = chart1.planets.find((p) => p.name === 'Mars') || chart1.planets[3];
  const mars2 = chart2.planets.find((p) => p.name === 'Mars') || chart2.planets[3];

  const manglikHouses = [1, 2, 4, 7, 8, 12];
  const isP1Manglik = manglikHouses.includes(mars1.house);
  const isP2Manglik = manglikHouses.includes(mars2.house);

  let p1Severity: 'None' | 'Mild' | 'Moderate' | 'High (Purna Manglik)' = 'None';
  if (isP1Manglik) {
    p1Severity = mars1.house === 7 || mars1.house === 8 ? 'High (Purna Manglik)' : 'Moderate';
  }

  let p2Severity: 'None' | 'Mild' | 'Moderate' | 'High (Purna Manglik)' = 'None';
  if (isP2Manglik) {
    p2Severity = mars2.house === 7 || mars2.house === 8 ? 'High (Purna Manglik)' : 'Moderate';
  }

  const isNeutralized = (isP1Manglik && isP2Manglik) || (!isP1Manglik && !isP2Manglik);

  const manglikAnalysis: ManglikAnalysis = {
    partner1: {
      name: partner1.fullName,
      isManglik: isP1Manglik,
      severity: p1Severity,
      marsHouse: mars1.house,
      cancellation: isP1Manglik ? (mars1.signName === 'Aries' || mars1.signName === 'Scorpio' || mars1.signName === 'Capricorn' ? 'Cancelled by Mars Own/Exalted Sign' : 'Active') : 'No Dosha',
    },
    partner2: {
      name: partner2.fullName,
      isManglik: isP2Manglik,
      severity: p2Severity,
      marsHouse: mars2.house,
      cancellation: isP2Manglik ? (mars2.signName === 'Aries' || mars2.signName === 'Scorpio' || mars2.signName === 'Capricorn' ? 'Cancelled by Mars Own/Exalted Sign' : 'Active') : 'No Dosha',
    },
    verdict: isNeutralized
      ? isP1Manglik && isP2Manglik
        ? 'Both Partners Manglik (Perfect Mutual Neutralization)'
        : 'Neither Partner Manglik (Clean Planetary Axis)'
      : 'One Partner Manglik (Requires Mars Pacification Remedy)',
    isNeutralized,
    explanation: isNeutralized
      ? 'Kuja Dosha intensity is completely neutralized between both horoscopes, ensuring marital peace and vitality.'
      : `${isP1Manglik ? partner1.fullName : partner2.fullName} has active Kuja Dosha. Performing Kumbh Vivah or Hanuman Chalisa remedies ensures full protection.`,
  };

  // WESTERN SYNASTRY ASPECTS
  const sun1 = chart1.planets.find((p) => p.name === 'Sun') || chart1.planets[0];
  const sun2 = chart2.planets.find((p) => p.name === 'Sun') || chart2.planets[0];
  const venus1 = chart1.planets.find((p) => p.name === 'Venus') || chart1.planets[5];
  const venus2 = chart2.planets.find((p) => p.name === 'Venus') || chart2.planets[5];

  const synastry: SynastryAspect[] = [
    {
      title: 'Sun-Moon Core Synergy',
      planets: `${sun1.signName} Sun ⚹ ${moon2.signName} Moon`,
      harmonyScore: Math.min(98, 70 + (grahaPoints * 5)),
      verdict: 'Deep Soul Understanding',
      description: 'Ego consciousness aligns effortlessly with emotional vulnerability, creating a nurturing safe harbor.',
    },
    {
      title: 'Venus-Mars Romantic Magnetism',
      planets: `${venus1.signName} Venus ☌ ${mars2.signName} Mars`,
      harmonyScore: Math.min(95, 65 + (yoniPoints * 7)),
      verdict: 'Passionate Vitality',
      description: 'Sensory appreciation and passionate devotion stimulate ongoing romantic sparks and mutual affection.',
    },
    {
      title: 'Mercury-Jupiter Intellectual Growth',
      planets: `Mercury ⚹ Jupiter Cross-Trine`,
      harmonyScore: 88,
      verdict: 'Philosophical Alignment',
      description: 'Enriches conversations, shared business acumen, collaborative investments, and travel aspirations.',
    },
  ];

  // NUMEROLOGY COMPATIBILITY
  const mulankDiff = Math.abs(num1.mulank - num2.mulank);
  let numScore = 85;
  if (num1.mulank === num2.mulank) numScore = 95;
  else if (mulankDiff === 1 || mulankDiff === 3 || mulankDiff === 5) numScore = 90;
  else if (mulankDiff === 2 || mulankDiff === 4) numScore = 75;

  const numerologyMilan = {
    partner1Mulank: num1.mulank,
    partner2Mulank: num2.mulank,
    partner1Bhagyank: num1.bhagyank,
    partner2Bhagyank: num2.bhagyank,
    harmonyScore: numScore,
    description: `Mulank ${num1.mulank} (${num1.mulankPlanet.split('(')[0]}) and Mulank ${num2.mulank} (${num2.mulankPlanet.split('(')[0]}) share an intuitive numerical frequency for cooperative success.`,
  };

  // ELEMENTAL BALANCE
  const elem1 = ZODIAC_SIGNS[rashi1Idx].element;
  const elem2 = ZODIAC_SIGNS[rashi2Idx].element;
  let elemScore = 80;
  let elemSynergy = `${elem1} & ${elem2} Harmony`;
  if (elem1 === elem2) {
    elemScore = 95;
    elemSynergy = `Twin ${elem1} Connection (Deep Instinctual Kinship)`;
  } else if ((elem1 === 'Fire' && elem2 === 'Air') || (elem1 === 'Air' && elem2 === 'Fire')) {
    elemScore = 92;
    elemSynergy = 'Fire & Air (Inspirational, Creative & Expansive)';
  } else if ((elem1 === 'Earth' && elem2 === 'Water') || (elem1 === 'Water' && elem2 === 'Earth')) {
    elemScore = 90;
    elemSynergy = 'Earth & Water (Grounded, Fertile & Emotionally Rich)';
  } else {
    elemScore = 70;
    elemSynergy = `${elem1} & ${elem2} Balance (Dynamic Growth Through Diversity)`;
  }

  const elementalBalance = {
    partner1Element: elem1,
    partner2Element: elem2,
    synergy: elemSynergy,
    score: elemScore,
  };

  // REMEDIES
  const remedies: string[] = [
    'Perform Joint Gauri-Shankar Puja on Shukla Paksha Mondays to invite divine marital grace.',
    'Chant the sacred Shukra Beej Mantra ("Om Shum Shukraya Namaha") for enduring romantic sweetness.',
    'Light a pure cow ghee lamp facing East during sunset on Thursdays for spiritual harmony and family prosperity.',
    'Wear a natural Rose Quartz or energize a Sphatik (Quartz) Shivling in the northeast corner of your home.',
  ];

  if (!isNeutralized && (isP1Manglik || isP2Manglik)) {
    remedies.unshift('Recite Hanuman Chalisa on Tuesdays and offer red flowers to neutralize Mars intensity.');
  }

  if (nadiPoints === 0) {
    remedies.unshift('Perform Maha Mrityunjaya Homa or donate food and warm blankets to the needy to pacify Nadi Dosha.');
  }

  return {
    partner1,
    partner2,
    calculatedAt: new Date().toISOString(),
    totalPoints,
    maxPoints: 36,
    percentage,
    verdictTitle,
    verdictColor,
    summary,
    kootas,
    manglik: manglikAnalysis,
    nadiDosha: {
      hasDosha: isSameNadi,
      isCancelled: isNadiCancelled,
      partner1Nadi: nadi1,
      partner2Nadi: nadi2,
      reason: isSameNadi ? (isNadiCancelled ? 'Cancelled by Nakshatra/Rashi variance' : 'Both share same Nadi') : 'Different Nadis',
      remedy: 'Maha Mrityunjaya Japa and Gold/Cow charity on auspicious constellation days.',
    },
    bhakootDosha: {
      hasDosha: isBhakootInauspicious,
      isCancelled: isBhakootCancelled,
      partner1Rashi: ZODIAC_SIGNS[rashi1Idx].name,
      partner2Rashi: ZODIAC_SIGNS[rashi2Idx].name,
      rashiDistance: `${rashiDiff}/${altDiff}`,
      reason: isBhakootInauspicious ? (isBhakootCancelled ? 'Cancelled by common/friendly lordship' : `${rashiDiff}/${altDiff} placement`) : 'Auspicious Rashi Disposition',
      remedy: 'Recite Vishnu Sahasranama and offer yellow sweets to Lord Brihaspati.',
    },
    synastry,
    numerologyMilan,
    elementalBalance,
    remedies,
    auspiciousMuhuratAdvice: 'Auspicious wedding & partnership Muhurats are ideal during Shukla Paksha under Rohini, Uttara Phalguni, Uttara Ashadha, or Revati Nakshatras during Venus/Jupiter Hora.',
  };
}

export const PRESET_MATCHMAKING_COUPLES: { label: string; partner1: UserProfile; partner2: UserProfile }[] = [
  {
    label: 'Aarav & Priya (High Auspicious Match • 31/36 Gunas)',
    partner1: {
      id: 'p1-aarav',
      fullName: 'Aarav Sharma',
      gender: 'male',
      birthDate: '1995-06-15',
      birthTime: '07:30',
      birthPlace: 'New Delhi, India',
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 5.5,
      focusAreas: ['Career & Executive Leadership', 'Marriage & Love'],
      createdAt: new Date().toISOString(),
      horoscopeSystem: 'vedic',
    },
    partner2: {
      id: 'p2-priya',
      fullName: 'Priya Patel',
      gender: 'female',
      birthDate: '1998-11-22',
      birthTime: '14:45',
      birthPlace: 'Mumbai, India',
      latitude: 19.0760,
      longitude: 72.8777,
      timezone: 5.5,
      focusAreas: ['Marriage, Love & Kundli Milan', 'Spiritual Dharma'],
      createdAt: new Date().toISOString(),
      horoscopeSystem: 'vedic',
    },
  },
  {
    label: 'Rohan & Ananya (Global Tech Innovators • 29/36 Gunas)',
    partner1: {
      id: 'p1-rohan',
      fullName: 'Rohan Verma',
      gender: 'male',
      birthDate: '1992-03-10',
      birthTime: '10:15',
      birthPlace: 'Bengaluru, India',
      latitude: 12.9716,
      longitude: 77.5946,
      timezone: 5.5,
      focusAreas: ['Wealth & Investments', 'Marriage & Family'],
      createdAt: new Date().toISOString(),
      horoscopeSystem: 'vedic',
    },
    partner2: {
      id: 'p2-ananya',
      fullName: 'Ananya Iyer',
      gender: 'female',
      birthDate: '1994-08-18',
      birthTime: '18:30',
      birthPlace: 'Chennai, India',
      latitude: 13.0827,
      longitude: 80.2707,
      timezone: 5.5,
      focusAreas: ['Art, Dharma & Relationships'],
      createdAt: new Date().toISOString(),
      horoscopeSystem: 'vedic',
    },
  },
  {
    label: 'Vikram & Meera (Classical Dharma & Manglik Neutralized)',
    partner1: {
      id: 'p1-vikram',
      fullName: 'Vikramaditya Rao',
      gender: 'male',
      birthDate: '1990-12-05',
      birthTime: '06:00',
      birthPlace: 'Hyderabad, India',
      latitude: 17.3850,
      longitude: 78.4867,
      timezone: 5.5,
      focusAreas: ['Enterprise, Legacy & Marital Harmony'],
      createdAt: new Date().toISOString(),
      horoscopeSystem: 'vedic',
    },
    partner2: {
      id: 'p2-meera',
      fullName: 'Meera Deshmukh',
      gender: 'female',
      birthDate: '1993-04-25',
      birthTime: '21:10',
      birthPlace: 'Pune, India',
      latitude: 18.5204,
      longitude: 73.8567,
      timezone: 5.5,
      focusAreas: ['Spiritual Growth, Family & Progeny'],
      createdAt: new Date().toISOString(),
      horoscopeSystem: 'vedic',
    },
  },
];

