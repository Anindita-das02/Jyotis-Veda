export type HoroscopeTradition = 'parashari' | 'jaimini' | 'lal_kitab' | 'kp_system' | 'bhrigu_nadi';
export type ChartStyle = 'north_indian' | 'south_indian' | 'east_indian';

export interface UserProfile {
  id: string;
  fullName: string;
  gender: 'male' | 'female' | 'other';
  birthDate: string; // YYYY-MM-DD
  birthTime?: string; // HH:mm (Optional)
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: number; // e.g. +5.5 for IST
  focusAreas: string[]; // e.g. ['Career & Wealth', 'Marriage & Love', 'Health', 'Spiritual Growth']
  notes?: string;
  createdAt: string;
  isPremium?: boolean;
  horoscopeSystem?: 'vedic' | 'western'; // Astrological generation system choice
  relationLabel?: string; // e.g. 'Self' | 'Partner' | 'Child' | 'Parent' | 'Client'
}

export interface PlanetPosition {
  id: string;
  name: string;
  sanskritName: string;
  symbol: string;
  signIndex: number; // 0 (Aries/Mesha) to 11 (Pisces/Meena)
  signName: string;
  signSanskrit: string;
  degree: number; // 0 to 30 within the sign
  totalDegree: number; // 0 to 360
  house: number; // 1 to 12
  isRetrograde: boolean;
  nakshatra: string;
  nakshatraLord: string;
  pada: number; // 1 to 4
  dignity: 'Exalted' | 'Moolatrikona' | 'Own' | 'Friendly' | 'Neutral' | 'Enemy' | 'Debilitated';
  karaka?: string; // Jaimini Chara Karaka (AK, AmK, BK, MK, PK, GK, DK)
  gemstone: string;
  element: string;
}

export interface HouseData {
  houseNumber: number;
  signIndex: number;
  signName: string;
  signSanskrit: string;
  signLord: string;
  planets: PlanetPosition[];
  significance: string;
  sanskritName: string;
  kpSubLord?: string;
  kpStarLord?: string;
  lalKitabState?: string;
}

export interface DashaPeriod {
  planet: string;
  sanskrit: string;
  startDate: string;
  endDate: string;
  durationYears: number;
  isCurrent: boolean;
  subPeriods?: {
    planet: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
  }[];
}

export interface VedicYoga {
  id: string;
  name: string;
  sanskritName: string;
  type: 'Raja Yoga' | 'Dhana Yoga' | 'Mahapurusha Yoga' | 'Auspicious' | 'Challenging';
  planetsInvolved: string[];
  description: string;
  effect: string;
  remedy?: string;
}

export interface VedicDosha {
  id: string;
  name: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'None';
  isPresent: boolean;
  description: string;
  impactArea: string;
  vedicRemedies: string[];
}

export interface PanchangInfo {
  date: string;
  tithi: string;
  tithiEnd: string;
  nakshatra: string;
  nakshatraEnd: string;
  yoga: string;
  karana: string;
  solarSign: string;
  lunarSign: string;
  sunrise: string;
  sunset: string;
  rahuKaal: string;
  abhijitMuhurta: string;
  brahmaMuhurta: string;
  auspiciousScore: number;
  timings?: {
    sunrise: string;
    sunset: string;
    rahuKaal: string;
    abhijitMuhurta: string;
    brahmaMuhurta: string;
  };
  rituals?: {
    morningTitle: string;
    morningDesc: string;
    eveningTitle: string;
    eveningDesc: string;
  };
  luckyData?: {
    luckyNumber: number;
    luckyColor: string;
  };
}

export interface NumerologyReport {
  mulank: number; // Psychic Number (1-9)
  mulankPlanet: string;
  mulankCharacteristics: string[];
  bhagyank: number; // Destiny Number (1-9 or Master 11, 22, 33)
  bhagyankPlanet: string;
  bhagyankMission: string;
  namankChaldean: number;
  namankPythagorean: number;
  nameCompatibility: string;
  nameCorrectionSuggestions: string[];
  loShuGrid: {
    [key: number]: number; // count of digits 1-9
  };
  loShuPlanes: {
    name: string;
    numbers: number[];
    strength: number; // 0-100%
    status: 'Strong' | 'Moderate' | 'Weak' | 'Empty';
    meaning: string;
  }[];
  luckyNumbers: number[];
  unfavorableNumbers: number[];
  luckyDays: string[];
  luckyColors: string[];
  luckyGemstones: string[];
  remedies: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  traditionContext?: HoroscopeTradition;
  remediesRecommended?: string[];
  actionableStep?: string;
  audioGenerated?: boolean;
}

export interface RoadmapMilestone {
  id: string;
  timelinePhase?: '0 - 12 Months (Immediate)' | '1 - 3 Years (Medium Term)' | '3 - 5 Years (Growth)' | '5 - 10 Years (Legacy & Destiny)';
  timeframe?: string;
  category: string;
  title: string;
  astrologicalBasis?: string;
  guidance?: string;
  favorableTransits?: string;
  remedialAction?: string;
  forecast?: string;
  favorableWindow?: string;
  cautions?: string;
  actionableRitualOrRemedy?: string;
  status?: 'Completed' | 'In-Progress' | 'Pending';
  completed?: boolean;
  userNotes?: string;
}

export type LifeMilestone = RoadmapMilestone;

export interface ConsultationTier {
  id: string;
  name?: string;
  title?: string;
  tagline?: string;
  description?: string;
  priceINR: number;
  priceUSD: number;
  popular?: boolean;
  isPopular?: boolean;
  deliveryTime: string;
  features: string[];
  category?: 'report' | 'counselling' | 'blueprint' | 'live';
}

export interface ConsultationBooking {
  id: string;
  referenceCode: string;
  userId: string;
  userName: string;
  userEmail: string;
  tierId: string;
  tierTitle: string;
  amount: number;
  currency: 'INR' | 'USD';
  paymentMethod: 'UPI' | 'Card' | 'NetBanking';
  status: 'Completed' | 'Processing' | 'Scheduled';
  bookingDate: string;
  scheduledTime?: string;
  reportReady: boolean;
  downloadUrl?: string;
}

export interface KGraphNode {
  id: string;
  label: string;
  category: string;
  sanskritName?: string;
  sanskritSutra?: string;
  description: string;
  significance?: string;
  remedyCode?: string;
  properties?: Record<string, any>;
  x?: number;
  y?: number;
}

export interface KGraphEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
  weight: number;
}

export interface RunbookRecord {
  id: string;
  title: string;
  tradition?: HoroscopeTradition | 'general';
  sourceTreatise?: string;
  contentSummary?: string;
  rawTextSnippet?: string;
  entitiesExtracted: number;
  status?: 'Completed' | 'Pending' | 'Active' | 'idle' | 'running' | 'completed' | 'failed';
  dateIngested?: string;
  addedNodesCount?: number;
}

export interface RunbookConfig {
  id: string;
  name: string;
  title?: string;
  description: string;
  type: 'text_corpus_ingestion' | 'user_session_ingestion' | 'ontology_enrichment' | 'remedy_synthesizer';
  targetNodes?: string[];
  lastRun?: string;
  entitiesExtracted: number;
  status?: 'idle' | 'running' | 'completed' | 'failed';
}

export interface SystemAnalytics {
  totalUsers: number;
  activeSessionsToday: number;
  totalConsultations: number;
  revenueINR: number;
  kGraphNodesCount: number;
  runbooksExecuted: number;
  popularTradition: string;
  queriesAnsweredToday: number;
}

export interface KootaItem {
  id: string;
  name: string;
  sanskritName: string;
  maxPoints: number;
  obtainedPoints: number;
  p1Value: string;
  p2Value: string;
  area: string;
  description: string;
  verdict: 'Excellent' | 'Good' | 'Average' | 'Challenging' | 'Critical';
  status: 'good' | 'average' | 'critical';
  details: string;
}

export interface ManglikAnalysis {
  partner1: {
    name: string;
    isManglik: boolean;
    severity: 'None' | 'Mild' | 'Moderate' | 'High (Purna Manglik)';
    marsHouse: number;
    cancellation: string;
  };
  partner2: {
    name: string;
    isManglik: boolean;
    severity: 'None' | 'Mild' | 'Moderate' | 'High (Purna Manglik)';
    marsHouse: number;
    cancellation: string;
  };
  verdict: string;
  isNeutralized: boolean;
  explanation: string;
}

export interface SynastryAspect {
  title: string;
  planets: string;
  harmonyScore: number; // 0-100
  verdict: string;
  description: string;
}

export interface AshtaKootaMilanResult {
  partner1: UserProfile;
  partner2: UserProfile;
  calculatedAt: string;
  totalPoints: number;
  maxPoints: number; // 36
  percentage: number;
  verdictTitle: string;
  verdictColor: string;
  summary: string;
  kootas: KootaItem[];
  manglik: ManglikAnalysis;
  nadiDosha: {
    hasDosha: boolean;
    isCancelled: boolean;
    partner1Nadi: string;
    partner2Nadi: string;
    reason: string;
    remedy: string;
  };
  bhakootDosha: {
    hasDosha: boolean;
    isCancelled: boolean;
    partner1Rashi: string;
    partner2Rashi: string;
    rashiDistance: string;
    reason: string;
    remedy: string;
  };
  synastry: SynastryAspect[];
  numerologyMilan: {
    partner1Mulank: number;
    partner2Mulank: number;
    partner1Bhagyank: number;
    partner2Bhagyank: number;
    harmonyScore: number; // 0-100
    description: string;
  };
  elementalBalance: {
    partner1Element: string;
    partner2Element: string;
    synergy: string;
    score: number;
  };
  remedies: string[];
  auspiciousMuhuratAdvice: string;
  aiDeepSynthesis?: string;
}
