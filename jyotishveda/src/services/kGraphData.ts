import { KGraphNode, KGraphEdge, RunbookConfig, SystemAnalytics, ConsultationTier } from '../types';

export const INITIAL_KGRAPH_NODES: KGraphNode[] = [
  // Treatises & Texts
  { id: 'bphs', label: 'Brihat Parashara Hora Shastra', category: 'treatise', sanskritName: 'बृहत्पाराशर होरा शास्त्र', description: 'Foundational encyclopedia of Vedic Astrology compiled by Sage Parashara.', significance: 'Root canonical authority for Rashis, Bhavas, Yogas, and Vimshottari Dasha.' },
  { id: 'jaimini_sutras', label: 'Jaimini Upadesha Sutram', category: 'treatise', sanskritName: 'जैमिनी उपदेश सूत्र', description: 'Sutra-style treatise by Maharishi Jaimini focusing on Chara Karakas, Arudhas, and Chara Dasha.', significance: 'Pinpoint precision for Soul purpose (Atmakaraka), spouse (Darakaraka), and destiny status.' },
  { id: 'lal_kitab', label: 'Lal Kitab (1952)', category: 'treatise', sanskritName: 'लाल किताब', description: 'Unique ancient remedial treatise blending Persian and Vedic astromancy.', significance: 'Practical, immediate non-mantric karmic remedies (Upay) and dormant house awakening.' },
  { id: 'bhrigu_nandi_nadi', label: 'Bhrigu Nandi Nadi', category: 'treatise', sanskritName: 'भृगु नन्दी नाड़ी', description: 'Classical Nadi astrology focusing on planetary conjunctions and Jeeva/Karma interactions.', significance: 'Past life karma decoding, effortless transit triggers without complex ascendant math.' },
  { id: 'kp_readers', label: 'KP Krishnamurti Paddhati', category: 'treatise', sanskritName: 'के.पी. कृष्णमूर्ति पद्धति', description: 'Modern stellar astrological system using cuspal sub-lords and ruling planets.', significance: 'Binary yes/no event fruition and exact minute-level timing of life events.' },

  // Planets (Grahas)
  { id: 'graha_sun', label: 'Surya (Sun)', category: 'planet', sanskritName: 'सूर्य', description: 'The King, Soul (Atman), Vitality, Father, Royal Authority, and Dharma.', significance: 'Exalted in Aries (10°), Debilitated in Libra (10°). Gemstone: Ruby.', remedyCode: 'Surya Arghya at Sunrise, Gayatri Mantra.' },
  { id: 'graha_moon', label: 'Chandra (Moon)', category: 'planet', sanskritName: 'चन्द्र', description: 'Mind (Manas), Emotions, Mother, Nurturance, Water, and Memory.', significance: 'Exalted in Taurus (3°), Debilitated in Scorpio (3°). Gemstone: Natural Pearl.', remedyCode: 'Offer water to Shiva, respect mother, wear pearl.' },
  { id: 'graha_mars', label: 'Mangal (Mars)', category: 'planet', sanskritName: 'मंगल', description: 'Commander, Energy, Courage, Real Estate, Siblings, Blood, and Willpower.', significance: 'Exalted in Capricorn (28°), Debilitated in Cancer (28°). Gemstone: Red Coral.', remedyCode: 'Hanuman Chalisa, donate red lentils on Tuesday.' },
  { id: 'graha_mercury', label: 'Budha (Mercury)', category: 'planet', sanskritName: 'बुध', description: 'Prince, Intellect, Commerce, Logic, Speech, Mathematics, and Analytical Genius.', significance: 'Exalted in Virgo (15°), Debilitated in Pisces (15°). Gemstone: Emerald.', remedyCode: 'Feed green grass to cows on Wednesday, Vishnu Sahasranama.' },
  { id: 'graha_jupiter', label: 'Guru (Jupiter)', category: 'planet', sanskritName: 'गुरु / बृहस्पति', description: 'Preceptor, Wisdom, Wealth, Children, Spiritual Dharma, Grace, and Expansion.', significance: 'Exalted in Cancer (5°), Debilitated in Capricorn (5°). Gemstone: Yellow Sapphire.', remedyCode: 'Respect gurus and teachers, chant Brihaspati mantra, wear yellow.' },
  { id: 'graha_venus', label: 'Shukra (Venus)', category: 'planet', sanskritName: 'शुक्र', description: 'Minister, Love, Marriage, Aesthetics, Luxury, Creative Arts, and Ojas (Vital Fluids).', significance: 'Exalted in Pisces (27°), Debilitated in Virgo (27°). Gemstone: Diamond / Opal.', remedyCode: 'Worship Goddess Lakshmi, chant Sri Suktam, wear clean white/scented clothes.' },
  { id: 'graha_saturn', label: 'Shani (Saturn)', category: 'planet', sanskritName: 'शनि', description: 'Judge, Karma, Longevity, Discipline, Perseverance, Labor, and Justice.', significance: 'Exalted in Libra (20°), Debilitated in Aries (20°). Gemstone: Blue Sapphire.', remedyCode: 'Light mustard oil lamp under Peepal tree, feed black dogs, serve the needy.' },
  { id: 'graha_rahu', label: 'Rahu (North Node)', category: 'planet', sanskritName: 'राहु', description: 'Shadowy Planet of Ambition, Unconventional Mastery, Foreign Travel, and Technological Disruptions.', significance: 'Co-lord of Aquarius. Gemstone: Hessonite Garnet (Gomed).', remedyCode: 'Maha Mrityunjaya mantra, keep silver square, avoid black attire on auspicious days.' },
  { id: 'graha_ketu', label: 'Ketu (South Node)', category: 'planet', sanskritName: 'केतु', description: 'Moksha Karaka, Spirituality, Detachment, Intuition, Genetics, and Occult Wisdom.', significance: 'Co-lord of Scorpio. Gemstone: Cat’s Eye (Lehsuniya).', remedyCode: 'Feed multi-colored stray dogs, worship Lord Ganesha, practice meditation.' },

  // Key Yogas
  { id: 'yoga_gajakesari', label: 'Gajakesari Yoga', category: 'yoga', sanskritName: 'गजकेसरी योग', description: 'Formed when Jupiter is in 1st, 4th, 7th, or 10th house from Moon.', significance: 'Unconquerable intellect, regal dignity, virtuous speech, and long-lasting fame.' },
  { id: 'yoga_budhaditya', label: 'Budhaditya Yoga', category: 'yoga', sanskritName: 'बुधादित्य योग', description: 'Sun and Mercury conjunction in auspicious house.', significance: 'Executive sharpness, administrative mastery, and academic/commercial triumphs.' },
  { id: 'yoga_pancha_mahapurusha', label: 'Pancha Mahapurusha Yogas', category: 'yoga', sanskritName: 'पंच महापुरुष योग', description: 'Non-luminary planet (Mars, Mercury, Jupiter, Venus, Saturn) in Kendra & Own/Exalted sign.', significance: 'Produces titans in society (Ruchaka, Bhadra, Hamsa, Malavya, Sasa).' },
  { id: 'yoga_vipreet_raja', label: 'Vipreet Raja Yoga', category: 'yoga', sanskritName: 'विपरीत राजयोग', description: 'Lords of Dusthanas (6, 8, 12) occupying other Dusthanas (Harsha, Sarala, Vimala).', significance: 'Victory extracted from unexpected catastrophes, rival collapses, and inherited fortune.' },

  // Doshas & Karmic Afflictions
  { id: 'dosha_manglik', label: 'Kuja / Manglik Dosha', category: 'dosha', sanskritName: 'मांगलिक दोष', description: 'Mars situated in 1st, 4th, 7th, 8th, or 12th house from Lagna or Moon.', significance: 'High energetic friction in marital dynamics if not harmonized or paired with matching energy.' },
  { id: 'dosha_kaalsarp', label: 'Kaal Sarp Yoga', category: 'dosha', sanskritName: 'कालसर्प योग', description: 'All 7 physical planets hemmed between Rahu and Ketu axis.', significance: 'Initial structural struggle followed by volcanic meteoric rise past age 33.' },
  { id: 'dosha_sadesati', label: 'Shani Sade Sati', category: 'dosha', sanskritName: 'साढ़े साती', description: 'Saturn transiting 12th, 1st, and 2nd houses from natal Moon across 7.5 years.', significance: 'Deep karmic cleansing, structural maturity, pruning of ego and non-essentials.' },

  // Houses (Key sample)
  { id: 'house_1', label: '1st House (Lagna)', category: 'house', sanskritName: 'तनु भाव', description: 'Physical vitality, temperament, foundational life trajectory.', significance: 'The mast of the chart; sets the coordinate grid for all 12 houses.' },
  { id: 'house_7', label: '7th House (Kalatra)', category: 'house', sanskritName: 'जाया / कलत्र भाव', description: 'Spouse, long-term romantic commitment, partnerships, public audience.', significance: 'Direct reflection of the 1st house; balance of give and take.' },
  { id: 'house_10', label: '10th House (Karma)', category: 'house', sanskritName: 'कर्म भाव', description: 'Career, profession, social prestige, authority, executive actions.', significance: 'Peak zenith of the sky; dictates professional impact and destiny.' },

  // Runbook Corpus
  { id: 'rb_parashara_remedies', label: 'Runbook: Parashara Graha Shanti Corpus', category: 'runbook', description: 'Ingested rules for planet-specific mantras, gemstone karakas, and charity timings.', significance: 'Integrated into Daivajna AI context memory for remedial prescriptions.' },
  { id: 'rb_lalkitab_farmans', label: 'Runbook: Lal Kitab Karmic Farman Ingestion', category: 'runbook', description: '1952 Farman rules regarding dormant house wakeups, silver remedies, and mercury-moon clashes.', significance: 'Active in AI counselling for non-traditional practical lifestyle modifications.' },
];

export const INITIAL_KGRAPH_EDGES: KGraphEdge[] = [
  { id: 'e1', source: 'bphs', target: 'graha_sun', relation: 'Defines Karakatwas', weight: 1 },
  { id: 'e2', source: 'bphs', target: 'graha_moon', relation: 'Defines Karakatwas', weight: 1 },
  { id: 'e3', source: 'bphs', target: 'yoga_gajakesari', relation: 'Classical Formulation', weight: 1 },
  { id: 'e4', source: 'bphs', target: 'yoga_pancha_mahapurusha', relation: 'Classical Formulation', weight: 1 },
  { id: 'e5', source: 'jaimini_sutras', target: 'graha_jupiter', relation: 'Chara Karaka Matrix', weight: 1 },
  { id: 'e6', source: 'lal_kitab', target: 'graha_saturn', relation: 'Upaya Prescriptions', weight: 1 },
  { id: 'e7', source: 'lal_kitab', target: 'graha_rahu', relation: 'Farman Directives', weight: 1 },
  { id: 'e8', source: 'bhrigu_nandi_nadi', target: 'graha_jupiter', relation: 'Jeeva Karaka Rule', weight: 1 },
  { id: 'e9', source: 'bhrigu_nandi_nadi', target: 'graha_saturn', relation: 'Karma Karaka Rule', weight: 1 },
  { id: 'e10', source: 'kp_readers', target: 'house_10', relation: 'Cuspal Sub-Lord Timing', weight: 1 },
  { id: 'e11', source: 'graha_jupiter', target: 'yoga_gajakesari', relation: 'Core Component', weight: 1 },
  { id: 'e12', source: 'graha_moon', target: 'yoga_gajakesari', relation: 'Core Component', weight: 1 },
  { id: 'e13', source: 'graha_sun', target: 'yoga_budhaditya', relation: 'Conjunction Partner', weight: 1 },
  { id: 'e14', source: 'graha_mercury', target: 'yoga_budhaditya', relation: 'Conjunction Partner', weight: 1 },
  { id: 'e15', source: 'graha_mars', target: 'dosha_manglik', relation: 'Afflicting Graha', weight: 1 },
  { id: 'e16', source: 'graha_rahu', target: 'dosha_kaalsarp', relation: 'Nodal Axis Head', weight: 1 },
  { id: 'e17', source: 'graha_ketu', target: 'dosha_kaalsarp', relation: 'Nodal Axis Tail', weight: 1 },
  { id: 'e18', source: 'graha_saturn', target: 'dosha_sadesati', relation: 'Transit Ruler', weight: 1 },
  { id: 'e19', source: 'graha_moon', target: 'dosha_sadesati', relation: 'Target Luminary', weight: 1 },
  { id: 'e20', source: 'graha_sun', target: 'house_1', relation: 'Karakas of Vitality', weight: 1 },
  { id: 'e21', source: 'graha_venus', target: 'house_7', relation: 'Natural Karaka', weight: 1 },
  { id: 'e22', source: 'graha_saturn', target: 'house_10', relation: 'Karma Karaka', weight: 1 },
  { id: 'e23', source: 'rb_parashara_remedies', target: 'bphs', relation: 'Extracted From', weight: 1 },
  { id: 'e24', source: 'rb_lalkitab_farmans', target: 'lal_kitab', relation: 'Extracted From', weight: 1 },
];

export const INITIAL_RUNBOOKS: RunbookConfig[] = [
  {
    id: 'rb-001',
    name: 'Brihat Parashara 7th House & Relationship Synthesis',
    title: 'Brihat Parashara 7th House & Relationship Synthesis',
    description: 'Ingested 48 Sanskrit shlokas detailing marriage compatibility, Darakaraka placement in Navamsha (D9), and Kuja Dosha mitigation through Guru aspect.',
    type: 'text_corpus_ingestion',
    lastRun: '2026-08-20',
    entitiesExtracted: 18,
    status: 'idle',
  },
  {
    id: 'rb-002',
    name: 'Lal Kitab 1952 Edition - Dormant Saturn & Rahu Upayas',
    title: 'Lal Kitab 1952 Edition - Dormant Saturn & Rahu Upayas',
    description: 'Ingested 32 practical remedial algorithms: keeping silver square for 4th house Rahu, floating copper coins in running water for 8th house Mars, feeding blind people on Saturday for 10th house Shani.',
    type: 'remedy_synthesizer',
    lastRun: '2026-08-22',
    entitiesExtracted: 24,
    status: 'idle',
  },
  {
    id: 'rb-003',
    name: 'Bhrigu Nandi Nadi - Jupiter & Saturn Conjunction Rules',
    title: 'Bhrigu Nandi Nadi - Jupiter & Saturn Conjunction Rules',
    description: 'Ingested directional chart rules for professional ascension when Jupiter (Jeeva) contacts Saturn (Karma) in trines (1, 5, 9). Predicts sudden breakthrough between age 28 and 36.',
    type: 'ontology_enrichment',
    lastRun: '2026-08-24',
    entitiesExtracted: 15,
    status: 'idle',
  },
  {
    id: 'rb-004',
    name: 'Chaldean & Pythagorean Numerology Master Vibrations',
    title: 'Chaldean & Pythagorean Numerology Master Vibrations',
    description: 'Ingested gematria conversion tables for compound numbers 1 to 52, including the fortune compound numbers 19 (Prince of Heaven), 23 (Royal Star of the Lion), and 37.',
    type: 'user_session_ingestion',
    lastRun: '2026-08-25',
    entitiesExtracted: 21,
    status: 'idle',
  },
];

export const CONSULTATION_TIERS: ConsultationTier[] = [
  {
    id: 'tier-quick-audit',
    title: 'Vedic Kundli & Numerology Express Audit',
    tagline: 'Comprehensive 15-page diagnostic report with daily auspicious rituals.',
    priceINR: 499,
    priceUSD: 9,
    deliveryTime: 'Instant Digital PDF Download',
    category: 'report',
    features: [
      'Full Birth Chart (North, South, East Indian styles)',
      'Planetary dignities, Nakshatras & Pada analysis',
      'Mulank, Bhagyank, Namank & Lo Shu 3x3 Magic Grid',
      'Vimshottari Mahadasha & Current Antardasha breakdown',
      'Vedic Dosha check (Manglik, Kaal Sarp, Sade Sati)',
      'Customized Lucky Gemstones, Colors, and Mantras',
    ],
  },
  {
    id: 'tier-10yr-blueprint',
    title: '10-Year Career & Wealth Astro-Blueprint',
    tagline: 'Deep dive multi-tradition roadmap (Parashari + KP + Lal Kitab) for personal & business success.',
    priceINR: 1499,
    priceUSD: 24,
    popular: true,
    deliveryTime: 'Instant Access + Priority AI Consultation',
    category: 'blueprint',
    features: [
      'Everything in Express Audit',
      'Interactive 10-Year Personal & Professional Life Roadmap',
      'Jaimini Chara Karakas (Atmakaraka & Amatyakaraka career resonance)',
      'KP Cuspal Sub-Lord timing for major financial/property milestones',
      'Lal Kitab Dormant House awakening remedies (Upayas)',
      'Name Spelling optimization analysis & Chaldean correction',
      'Unlimited questions with Daivajna AI Astrologer (30 Days)',
    ],
  },
  {
    id: 'tier-milan-compatibility',
    title: 'Kundli Milan & Relationship Synergy Deep-Dive',
    tagline: 'Ashtakoota 36-Guna matching, Manglik mitigation, and emotional harmony blueprint.',
    priceINR: 1999,
    priceUSD: 29,
    deliveryTime: 'Instant Analysis + Downloadable Report',
    category: 'counselling',
    features: [
      'Complete 36 Guna Ashtakoota compatibility calculation',
      'Bhakoot, Nadi, and Gana Dosha remedies and cancellation rules',
      'Darakaraka & Upapada Lagna (UL) marriage timing check',
      '7th & 8th House Navamsha (D9) joint wealth and progeny forecast',
      'Harmonization remedies: Mangal Shanti, Yantras, and mutual rituals',
      'Interactive AI Relationship Counsellor session access',
    ],
  },
  {
    id: 'tier-live-consult',
    title: '1-on-1 Certified Acharya & AI Video Masterclass',
    tagline: 'Private 45-minute live consultation with Senior Vedic Astrologer + AI Transcripts & Remedies.',
    priceINR: 3499,
    priceUSD: 49,
    deliveryTime: 'Scheduled within 24-48 Hours',
    category: 'live',
    features: [
      'Everything in 10-Year Career & Wealth Blueprint',
      '45-Minute Private 1-on-1 Video Session with Certified Vedic Pandit',
      'Prashna Kundli (Horary astrology for immediate burning questions)',
      'Vedic Remedial Kit recommendation (Consecrated Yantra + Gemstone advice)',
      'Recorded session video + AI transcribed session summary & action plan',
      '6 Months VIP Priority Support & Monthly Transit Alerts',
    ],
  },
];

export const INITIAL_ANALYTICS: SystemAnalytics = {
  totalUsers: 14820,
  activeSessionsToday: 1240,
  totalConsultations: 3840,
  revenueINR: 2845000,
  kGraphNodesCount: 68,
  runbooksExecuted: 142,
  popularTradition: 'Parashari Vedic & Chaldean Numerology',
  queriesAnsweredToday: 6920,
};
