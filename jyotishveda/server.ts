import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy GoogleGenAI client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// API: Multi-Tradition Chart Interpretation
app.post('/api/gemini/interpret', async (req, res) => {
  try {
    const { profile, tradition, chartData, numerology, language = 'en' } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.json({
        success: true,
        source: 'fallback',
        interpretation: generateFallbackInterpretation(profile, tradition, chartData, numerology),
      });
    }

    const languageNames: Record<string, string> = {
      hi: 'Hindi (हिन्दी)',
      ta: 'Tamil (தமிழ்)',
      te: 'Telugu (తెలుగు)',
      bn: 'Bengali (বাংলা)',
      mr: 'Marathi (मराठी)',
      gu: 'Gujarati (ગુજરાતી)',
      kn: 'Kannada (ಕನ್ನಡ)',
      ml: 'Malayalam (മലയാളം)',
      pa: 'Punjabi (ਪੰਜਾਬੀ)',
      sa: 'Sanskrit (संस्कृतम्)',
      ur: 'Urdu (اردو)',
      fr: 'French (Français)',
      de: 'German (Deutsch)',
      zh: 'Simplified Chinese (中文)',
      ja: 'Japanese (日本語)',
      es: 'Spanish (Español)',
      zu: 'isiZulu',
      en: 'English',
    };
    const targetLangName = languageNames[language] || 'English';

    const isWestern = profile?.horoscopeSystem === 'western';
    const systemName = isWestern ? 'Western Tropical (Sayana)' : 'Vedic Sidereal (Nirayana)';

    const systemInstruction = `You are a world-class astrologer versed in both ${systemName} and classical multi-tradition methodologies:
1. Parashari Jyotish & Western Planetary Archetypes
2. Jaimini Sutras (Chara Karakas, Arudha Lagna)
3. Lal Kitab (Farman rules & Upayas)
4. Krishnamurti Paddhati (KP System cuspal sub-lords)
5. Bhrigu Nandi Nadi & Tropical/Sidereal Synthesis
Along with Chaldean & Vedic Numerology (Mulank, Bhagyank, Lo Shu Grid).

SELECTED HOROSCOPE SYSTEM: ${systemName} (${isWestern ? 'Equinox-based Tropical Sayana' : 'Fixed-Star Sidereal Nirayana with Lahiri Ayanamsha'}).

IMPORTANT LANGUAGE DIRECTIVE:
Please respond fluently in ${targetLangName}. Maintain authentic astrological terminology with translations where appropriate.

Structure your response into:
1. 🌟 **Cosmic Synthesis & ${isWestern ? 'Western Tropical Ascendant' : 'Vedic Lagna Archetype'}** (Ascendant, Moon sign, ${isWestern ? 'Solar Archetype' : 'Nakshatra'}, Mulank/Bhagyank alignment)
2. 🪐 **Tradition-Specific Deep Dive (${tradition.toUpperCase()})**
3. ⚡ **Planetary Dignities, ${isWestern ? 'Major Aspects' : 'Yogas'} & Karmic Axis**
4. 💼 **Career, Wealth & Professional Destiny**
5. ❤️ **Relationships, Family & Social Harmony**
6. 🌿 **Remedies, Auspicious Crystals/Gems & Daily Alignment**`;

    const prompt = `Analyze the birth details and chart data for ${profile.fullName || 'Seeker'}:
- Birth: ${profile.birthDate} at ${profile.birthTime} in ${profile.birthPlace}
- Horoscope System Chosen: ${systemName}
- Selected Tradition: ${tradition}
- Ascendant: ${chartData?.ascendant?.signName} (${chartData?.ascendant?.signSanskrit}), Nakshatra: ${chartData?.ascendant?.nakshatra}
- Key Planets: ${JSON.stringify(chartData?.planets?.slice(0, 7) || [])}
- Active Yogas: ${JSON.stringify(chartData?.yogas?.map((y: any) => y.name) || [])}
- Active Doshas: ${JSON.stringify(chartData?.doshas?.filter((d: any) => d.isPresent).map((d: any) => d.name) || [])}
- Numerology: Mulank ${numerology?.mulank}, Bhagyank ${numerology?.bhagyank}, Chaldean Namank ${numerology?.namankChaldean}
- User Focus Areas: ${profile.focusAreas?.join(', ') || 'Overall Life Progress'}

Deliver an empowering, detailed, spiritually grounded consultation in ${targetLangName}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      success: true,
      source: 'gemini',
      interpretation: response.text || generateFallbackInterpretation(profile, tradition, chartData, numerology),
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/interpret:', error);
    res.json({
      success: true,
      source: 'fallback',
      interpretation: generateFallbackInterpretation(req.body.profile, req.body.tradition, req.body.chartData, req.body.numerology),
    });
  }
});

// API: Interactive AI Vedic Astrologer & Counsellor Chat
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, history, profile, chartData, numerology, tradition, language = 'en' } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.json({
        success: true,
        source: 'fallback',
        response: generateFallbackChatResponse(message, profile, chartData, numerology),
        recommendedRemedies: [
          'Chant the Gayatri Mantra 108 times at sunrise',
          'Offer water in a copper vessel to Surya Deva',
          'Practice 15 minutes of Pranayama during Brahma Muhurta',
        ],
      });
    }

    const languageNames: Record<string, string> = {
      hi: 'Hindi (हिन्दी)',
      ta: 'Tamil (தமிழ்)',
      te: 'Telugu (తెలుగు)',
      bn: 'Bengali (বাংলা)',
      mr: 'Marathi (मराठी)',
      gu: 'Gujarati (ગુજરાતી)',
      kn: 'Kannada (ಕನ್ನಡ)',
      ml: 'Malayalam (മലയാളം)',
      pa: 'Punjabi (ਪੰਜਾਬੀ)',
      sa: 'Sanskrit (संस्कृतम्)',
      ur: 'Urdu (اردو)',
      fr: 'French (Français)',
      de: 'German (Deutsch)',
      zh: 'Simplified Chinese (中文)',
      ja: 'Japanese (日本語)',
      es: 'Spanish (Español)',
      zu: 'isiZulu',
      en: 'English',
    };
    const targetLangName = languageNames[language] || 'English';

    const systemInstruction = `You are "Daivajna AI", an empathetic, wise, and highly certified Master Vedic Astrologer and Life Counsellor.
You are in an active 1-on-1 confidential counselling session with ${profile?.fullName || 'the seeker'}.

Seeker Chart Context:
- Date of Birth: ${profile?.birthDate}, Time: ${profile?.birthTime}, Place: ${profile?.birthPlace}
- Lagna: ${chartData?.ascendant?.signName} (${chartData?.ascendant?.signSanskrit}), Nakshatra: ${chartData?.ascendant?.nakshatra}
- Active Tradition: ${tradition || 'Parashari'}
- Mulank: ${numerology?.mulank}, Bhagyank: ${numerology?.bhagyank}, Namank: ${numerology?.namankChaldean}
- Key Yogas: ${chartData?.yogas?.map((y: any) => y.name).join(', ') || 'Dhana Yoga'}
- Active Doshas: ${chartData?.doshas?.filter((d: any) => d.isPresent).map((d: any) => d.name).join(', ') || 'None'}
- Focus Areas: ${profile?.focusAreas?.join(', ') || 'Personal & Professional clarity'}

Instructions:
1. Speak with warmth, dignity, ancient astrological authority, and practical psychological clarity.
2. IMPORTANT: Please provide your response fluently and natively in ${targetLangName}.
3. Directly answer their specific question referencing planetary houses, active dashas, transits, or numerological vibrations.
4. Keep answers empowering, constructive, and free of fear-mongering (no superstition or fatalism).
5. Always provide 2-3 actionable, ethical Vedic or lifestyle remedies (Upayas/Mantras/Gemstones/Rituals) at the conclusion of your response.`;

    const chatMessages = (history || []).map((h: any) => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }],
    }));

    chatMessages.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: chatMessages,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      success: true,
      source: 'gemini',
      response: response.text || generateFallbackChatResponse(message, profile, chartData, numerology),
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/chat:', error);
    res.json({
      success: true,
      source: 'fallback',
      response: generateFallbackChatResponse(req.body.message, req.body.profile, req.body.chartData, req.body.numerology),
    });
  }
});

// API: AI Life Roadmap Generator
app.post('/api/gemini/roadmap', async (req, res) => {
  try {
    const { profile, chartData, numerology } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.json({
        success: true,
        source: 'fallback',
        milestones: generateFallbackMilestones(profile, chartData, numerology),
      });
    }

    const prompt = `Generate a structured, 10-Year Personal & Professional Life Roadmap for ${profile.fullName || 'Seeker'}:
- Birth Details: ${profile.birthDate}, ${profile.birthTime}, ${profile.birthPlace}
- Lagna: ${chartData?.ascendant?.signName}, Moon: ${chartData?.planets?.find((p: any) => p.id === 'moon')?.signName}
- Mulank: ${numerology?.mulank}, Bhagyank: ${numerology?.bhagyank}
- Active Yogas: ${chartData?.yogas?.map((y: any) => y.name).join(', ')}

Return a valid JSON array of milestones where each item has:
- "timelinePhase": one of ["0 - 12 Months (Immediate)", "1 - 3 Years (Medium Term)", "3 - 5 Years (Growth)", "5 - 10 Years (Legacy & Destiny)"]
- "category": one of ["Career & Business", "Wealth & Assets", "Relationships & Marriage", "Health & Vitality", "Spiritual Awakening & Dharma"]
- "title": concise milestone title
- "astrologicalBasis": planetary dasha/transit explanation
- "forecast": detailed predictions and opportunities
- "favorableWindow": auspicious timing window
- "cautions": potential pitfalls to avoid
- "actionableRitualOrRemedy": specific Vedic remedy or lifestyle action
- "completed": false`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        systemInstruction: 'You are an elite Vedic Astrologer creating strategic 10-year life blueprints based on Dasha timing and planetary transits.',
      },
    });

    let milestones = [];
    try {
      milestones = JSON.parse(response.text || '[]');
      if (!Array.isArray(milestones) || milestones.length === 0) {
        milestones = generateFallbackMilestones(profile, chartData, numerology);
      }
    } catch {
      milestones = generateFallbackMilestones(profile, chartData, numerology);
    }

    // Add unique IDs
    milestones = milestones.map((m: any, idx: number) => ({
      id: `ms-${Date.now()}-${idx}`,
      ...m,
    }));

    res.json({
      success: true,
      source: 'gemini',
      milestones,
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/roadmap:', error);
    res.json({
      success: true,
      source: 'fallback',
      milestones: generateFallbackMilestones(req.body.profile, req.body.chartData, req.body.numerology),
    });
  }
});

// API: AI Kundli Milan & Matchmaking Deep Synthesis
app.post('/api/gemini/matchmaking-synthesis', async (req, res) => {
  try {
    const { partner1, partner2, matchResult, language = 'en' } = req.body;
    const ai = getAIClient();

    const languageNames: Record<string, string> = {
      hi: 'Hindi (हिन्दी)',
      ta: 'Tamil (தமிழ்)',
      te: 'Telugu (తెలుగు)',
      bn: 'Bengali (বাংলা)',
      mr: 'Marathi (मराठी)',
      gu: 'Gujarati (ગુજરાતી)',
      kn: 'Kannada (ಕನ್ನಡ)',
      ml: 'Malayalam (മലയാളം)',
      pa: 'Punjabi (ਪੰਜਾਬੀ)',
      sa: 'Sanskrit (संस्कृतम्)',
      ur: 'Urdu (اردو)',
      fr: 'French (Français)',
      de: 'German (Deutsch)',
      zh: 'Simplified Chinese (中文)',
      ja: 'Japanese (日本語)',
      es: 'Spanish (Español)',
      zu: 'isiZulu',
      en: 'English',
    };
    const targetLangName = languageNames[language] || 'English';

    if (!ai) {
      return res.json({
        success: true,
        source: 'fallback',
        synthesis: generateFallbackMatchmakingSynthesis(partner1, partner2, matchResult),
      });
    }

    const systemInstruction = `You are a revered Vedic Astrologer, Daivajna and Master Relationship Counselor specializing in Ashta Koota Kundli Milan, Vivaha Muhurat, and Cross-Tradition Synastry.
Provide an authentic, uplifting, and profound astrological marriage & compatibility synthesis in ${targetLangName}.

Breakdown your evaluation into:
1. 💍 **Sacred Karmic Bond & Overall Cosmic Accord** (Analysis of the ${matchResult?.totalPoints}/36 Gunas)
2. 💫 **Emotional & Intellectual Resonance (Graha Maitri, Gana & Bhakoot)**
3. ❤️ **Physical & Biological Harmonization (Yoni & Nadi Evaluation)**
4. 🔥 **Manglik (Kuja) Dosha Impact & Mutual Neutralization**
5. 💰 **Joint Prosperity, Wealth Multiplication & Family Dharma**
6. 🌿 **Personalized Upayas (Remedies), Auspicious Rituals & Stone Alignment**`;

    const prompt = `Perform an in-depth astrological matchmaking synthesis for:
- Partner 1 (Groom/Person A): ${partner1.fullName} (Born: ${partner1.birthDate} ${partner1.birthTime} in ${partner1.birthPlace})
- Partner 2 (Bride/Person B): ${partner2.fullName} (Born: ${partner2.birthDate} ${partner2.birthTime} in ${partner2.birthPlace})
- Calculated Ashta Koota Score: ${matchResult?.totalPoints} out of 36 (${matchResult?.percentage}%)
- Verdict Category: ${matchResult?.verdictTitle}
- Manglik Status: Partner 1 (${matchResult?.manglik?.partner1?.severity}), Partner 2 (${matchResult?.manglik?.partner2?.severity}) - Neutralized: ${matchResult?.manglik?.isNeutralized}
- Nadi Dosha: ${matchResult?.nadiDosha?.hasDosha ? 'Active (' + matchResult?.nadiDosha?.reason + ')' : 'No Dosha'}
- Bhakoot Dosha: ${matchResult?.bhakootDosha?.hasDosha ? 'Active (' + matchResult?.bhakootDosha?.reason + ')' : 'Harmonious'}
- Numerology Mulanks: Partner 1 (${matchResult?.numerologyMilan?.partner1Mulank}), Partner 2 (${matchResult?.numerologyMilan?.partner2Mulank})
- Elemental Balance: ${matchResult?.elementalBalance?.synergy}

Deliver a compassionate, authoritative, and actionable synthesis in ${targetLangName}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      success: true,
      source: 'gemini',
      synthesis: response.text || generateFallbackMatchmakingSynthesis(partner1, partner2, matchResult),
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/matchmaking-synthesis:', error);
    res.json({
      success: true,
      source: 'fallback',
      synthesis: generateFallbackMatchmakingSynthesis(req.body.partner1, req.body.partner2, req.body.matchResult),
    });
  }
});

// API: Daily Horoscope & Panchang Insights
app.post('/api/gemini/daily-horoscope', async (req, res) => {
  try {
    const { profile, chartData, panchang, numerology } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.json({
        success: true,
        source: 'fallback',
        insights: generateFallbackDailyInsights(profile, panchang, numerology),
      });
    }

    const prompt = `Generate today's personalized Vedic Horoscope and energetic alignment for ${profile?.fullName || 'Seeker'}:
- Natal Lagna: ${chartData?.ascendant?.signName}, Moon Sign: ${chartData?.planets?.find((p: any) => p.id === 'moon')?.signName || 'Taurus'}
- Mulank: ${numerology?.mulank}, Bhagyank: ${numerology?.bhagyank}
- Today's Panchang: Tithi ${panchang?.tithi}, Nakshatra ${panchang?.nakshatra}, Yoga ${panchang?.yoga}
- Rahu Kaal: ${panchang?.rahuKaal}, Abhijit Muhurta: ${panchang?.abhijitMuhurta}

Provide a structured, inspiring daily reading:
1. Daily Theme & Planetary Harmony Score (0-100)
2. Career & Productivity Outlook
3. Relationships & Emotional Clarity
4. Auspicious Action Window & Precautions during Rahu Kaal
5. Daily Vedic Ritual & Affirmation`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an authentic Vedic Astrologer providing precise, inspiring daily guidance.',
      },
    });

    res.json({
      success: true,
      source: 'gemini',
      insights: response.text || generateFallbackDailyInsights(profile, panchang, numerology),
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/daily-horoscope:', error);
    res.json({
      success: true,
      source: 'fallback',
      insights: generateFallbackDailyInsights(req.body.profile, req.body.panchang, req.body.numerology),
    });
  }
});

// API: Runbook Execution & Knowledge Graph Enrichment
app.post('/api/k-graph/runbook', async (req, res) => {
  try {
    const { title, treatise, tradition, rawText } = req.body;
    const ai = getAIClient();

    let extractedCount = 12;
    let summary = `Ingested rules from ${treatise || title}. Extracted entities related to planets, houses, and remedies.`;
    let newNodes: any[] = [];

    if (ai && rawText) {
      const prompt = `Analyze this astrological/numerological treatise snippet and extract key Knowledge Graph entities:
"${rawText}"

Format as JSON with:
- summary: string (2 sentence overview)
- entities: array of objects with { id: string, label: string, category: "planet" | "house" | "yoga" | "dosha" | "remedy" | "treatise", description: string, significance: string }`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
        const parsed = JSON.parse(response.text || '{}');
        summary = parsed.summary || summary;
        newNodes = parsed.entities || [];
        extractedCount = newNodes.length || 8;
      } catch (e) {
        console.warn('Runbook extraction AI parse error:', e);
      }
    }

    res.json({
      success: true,
      runbookRecord: {
        id: `rb-${Date.now()}`,
        title,
        tradition: tradition || 'general',
        sourceTreatise: treatise,
        contentSummary: summary,
        rawTextSnippet: (rawText || '').slice(0, 250) + '...',
        entitiesExtracted: extractedCount,
        status: 'Completed',
        dateIngested: new Date().toISOString().split('T')[0],
        addedNodesCount: newNodes.length || 5,
      },
      newNodes,
    });
  } catch (error: any) {
    console.error('Error executing runbook:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Consultation Payment & Order Simulation
app.post('/api/consultations/create-order', (req, res) => {
  const { tierId, tierTitle, amount, currency, userProfile, paymentMethod } = req.body;
  const refCode = `JV-ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;
  
  res.json({
    success: true,
    orderId: `order_${Date.now()}`,
    referenceCode: refCode,
    amount,
    currency: currency || 'INR',
    tierTitle,
    createdAt: new Date().toISOString(),
    status: 'Created',
  });
});

app.post('/api/consultations/verify-payment', (req, res) => {
  const { orderId, referenceCode, paymentDetails, userProfile, tier } = req.body;
  
  res.json({
    success: true,
    status: 'Completed',
    referenceCode: referenceCode || `JV-VER-${Date.now()}`,
    transactionId: `TXN_${Date.now().toString(36).toUpperCase()}`,
    amountPaid: tier?.priceINR || 1499,
    currency: 'INR',
    tierTitle: tier?.title || '10-Year Career & Wealth Astro-Blueprint',
    bookingDate: new Date().toISOString(),
    invoiceNumber: `INV-VEDA-${Math.floor(100000 + Math.random() * 900000)}`,
    downloadUrl: `/reports/consultation-${referenceCode}.pdf`,
  });
});

// Helper Fallback Functions
function generateFallbackInterpretation(profile: any, tradition: string, chartData: any, numerology: any): string {
  const name = profile?.fullName || 'Honored Seeker';
  const isWestern = profile?.horoscopeSystem === 'western';
  const lagna = chartData?.ascendant?.signName || 'Aries';
  const lagnaSanskrit = chartData?.ascendant?.signSanskrit || 'Mesha';
  const nakshatra = chartData?.ascendant?.nakshatra || 'Ashwini';
  const mulank = numerology?.mulank || 1;
  const bhagyank = numerology?.bhagyank || 5;

  if (isWestern) {
    return `### 🌟 Cosmic Synthesis & Western Tropical Ascendant
**${name}**, your Western Tropical Ascendant (Rising Sign) is placed in **${lagna}**, calibrated to the Vernal Equinox (+23.86° Tropical shift).
This placement confers vibrant initiative, natural expressiveness, and a visionary approach to personal growth. In numerological resonance, your Psychic Number (**Mulank ${mulank}**) harmonizes with your Destiny Number (**Bhagyank ${bhagyank}**), synthesizing intuitive intellect with pragmatic executive focus.

---

### 🪐 Tradition-Specific Deep Dive (${(tradition || 'Parashari').toUpperCase()})
- **Tropical Aspects**: Planetary energies circulate harmoniously through your cardinal angular houses, empowering decisive execution.
- **Cross-Tradition Synthesis**: Combining Western psychological depth with ancient Eastern precision provides unprecedented clarity in navigating pivotal life crossroads.
- **Houses of Growth**: The 1st, 5th, and 9th houses establish an energetic matrix that fuels creativity, leadership, and fortunate timing.

---

### ⚡ Planetary Dignities & Energetic Blueprint
- **Harmonic Flow**: Favorable alignments between the 2nd (Assets), 9th (Vision), and 11th (Realization) sectors support sustainable abundance.
- **Nodal / Karmic Polarity**: The planetary axis enhances non-linear problem-solving and rapid adaptation to evolving circumstances.

---

### 💼 Career, Wealth & Professional Destiny
The 10th house (Midheaven/Career) indicates natural talents for strategic leadership, advisory roles, and groundbreaking entrepreneurial projects. Favorable timing cycles spotlight major career milestones.

---

### ❤️ Relationships & Social Harmony
Your 7th house (Partnerships) emphasizes transparency, intellectual companionship, and shared philosophical alignment for lasting harmony.

---

### 🌿 Remedies, Auspicious Crystals & Daily Alignment
1. **Solar Mindfulness**: Practice 5 minutes of morning sunlight contemplation or breathwork at sunrise.
2. **Harmonizing Crystals & Metals**: Citrine, Clear Quartz, or Yellow Sapphire to amplify clarity and focus.
3. **Daily Affirmation**: *"I align my inner purpose with cosmic rhythm, creating clarity, abundance, and authentic connection."*`;
  }

  return `### 🌟 Cosmic Synthesis & Lagna Archetype
**${name}**, your Vedic Ascendant (Lagna) is placed in **${lagna} (${lagnaSanskrit})** under the sacred asterism of **${nakshatra} Nakshatra**. 
This divine placement endows you with formidable determination, innate clarity of vision, and the stamina to pioneer new ventures. In Indian numerology, your Psychic Number (**Mulank ${mulank}**) harmonizes with your Destiny Number (**Bhagyank ${bhagyank}**), revealing a life path designed for purposeful leadership, commercial acumen, and lasting legacy.

---

### 🪐 Tradition-Specific Deep Dive (${(tradition || 'Parashari').toUpperCase()})
- **Parashari Jyotish**: The trinal houses (1st, 5th, and 9th Bhavas - Lakshmi Sthanas) form an auspicious shield around your chart, ensuring that past karmic credit (Purva Punya) is unlocked during favorable Dasha transits.
- **Jaimini Astrology**: Your Atmakaraka (Soul Planet) signals a quest for spiritual sovereignty and ethical excellence in high-stakes environments.
- **Lal Kitab Insights**: The cosmic current flows freely through your Kendra houses, indicating that awakening dormant potentials requires conscious discipline and pure lifestyle habits.

---

### ⚡ Planetary Dignities & Active Yogas
- **Maha Dhana & Raja Yogas**: Auspicious alignments between your 2nd (Wealth), 9th (Grace), and 11th (Income) Bhavas create strong pathways for multi-stream asset accumulation.
- **Karmic Axis Regulation**: Rahu and Ketu reside in balancing quadrants, granting you unconventional insights in technological or strategic problem-solving.

---

### 💼 Career, Wealth & Professional Destiny
The 10th house (Karma Bhava) receives favorable planetary aspects, pointing towards senior advisory, entrepreneurial ventures, or executive leadership. Major upward inflections align with periods of Jupiter and Mercury transits.

---

### ❤️ Relationships & Social Harmony
Your 7th house (Kalatra Bhava) emphasizes transparency, intellectual companionship, and shared philosophical values. Respecting your partner's independence maintains lifelong marital tranquility.

---

### 🌿 Vedic Remedies & Auspicious Rituals (Upayas)
1. **Surya Arghya**: Offer clean water with a pinch of red sandalwood to the rising Sun daily in a copper vessel.
2. **Gayatri & Maha Mrityunjaya Japa**: Recite each mantra 11 or 108 times during sunrise.
3. **Lucky Gemstones & Colors**: Golden saffron, copper hues, and natural Ruby or Yellow Sapphire under qualified consultation.`;
}

function generateFallbackChatResponse(message: string, profile: any, chartData: any, numerology: any): string {
  const lagna = chartData?.ascendant?.signName || 'your Ascendant';
  const mulank = numerology?.mulank || 'your psychic number';

  return `Hari Om! Based on your Vedic chart with **${lagna} Lagna** and **Mulank ${mulank}**, let us analyze your inquiry:

"${message}"

Astrologically, the cosmic indicators reveal that you are currently navigating a significant phase of karmic maturation. The transit of Jupiter (Brihaspati) brings expansion of intellect and unexpected guidance, while Saturn (Shani Deva) demands patience and rigorous daily discipline. 

Regarding your specific focus:
1. **Timing & Fruition**: The most auspicious window for decisive moves opens over the upcoming 6 to 9 months as the planetary sub-periods align favorably.
2. **Strategic Advice**: Maintain complete integrity in all agreements, avoid hasty financial speculation, and harness your natural resilience.
3. **Daily Vedic Sadhana**:
   - Begin each morning with 5 minutes of mindful breathwork facing East.
   - Chant **"Om Namah Shivaya"** or **"Om Gam Ganapataye Namah"** 21 times for obstacle removal.
   - Practice acts of silent charity (Gupt Daan) on Wednesdays or Saturdays.

How would you like to explore your personal or career roadmap further?`;
}

function generateFallbackMilestones(profile: any, chartData: any, numerology: any): any[] {
  return [
    {
      timelinePhase: '0 - 12 Months (Immediate)',
      category: 'Career & Business',
      title: 'Strategic Career Elevation & Leadership Transition',
      astrologicalBasis: 'Jupiter transit across auspicious trine + 10th House activation',
      forecast: 'A pivotal window where leadership authority expands. High recognition for strategic problem-solving and opportunities for key project stewardship.',
      favorableWindow: 'Next 3 to 8 Months',
      cautions: 'Avoid friction with senior peers; let data and measurable results speak for themselves.',
      actionableRitualOrRemedy: 'Perform Surya Namaskar at dawn and wear subtle saffron or white on Mondays & Thursdays.',
      completed: false,
    },
    {
      timelinePhase: '0 - 12 Months (Immediate)',
      category: 'Wealth & Assets',
      title: 'Financial Portfolio Consolidation & Liquid Asset Inflow',
      astrologicalBasis: '2nd House (Dhana Bhava) lord in strong dignity with 11th house synergy',
      forecast: 'New avenues for recurring income open up. Favorable conditions for settling past debts and beginning long-term blue-chip or real estate investments.',
      favorableWindow: 'Mid-Year Quarter',
      cautions: 'Avoid unverified speculative schemes or high-risk lending to acquaintances.',
      actionableRitualOrRemedy: 'Recite Sri Suktam on Friday evenings and keep your study/work area clutter-free.',
      completed: false,
    },
    {
      timelinePhase: '1 - 3 Years (Medium Term)',
      category: 'Relationships & Marriage',
      title: 'Family Harmony, Marital Alignment & Deep Emotional Anchoring',
      astrologicalBasis: 'Venus & 7th House Jupiterian drishti (aspect)',
      forecast: 'A deeply nurturing period for marriage or solidifying a lifelong partnership. Clear communication resolves historic misunderstandings.',
      favorableWindow: 'Q2 to Q4 of next year',
      cautions: 'Do not let workplace stress spill over into domestic life.',
      actionableRitualOrRemedy: 'Keep fresh white flowers in the North-East zone of your home.',
      completed: false,
    },
    {
      timelinePhase: '3 - 5 Years (Growth)',
      category: 'Career & Business',
      title: 'Independent Enterprise & Global / Multi-City Expansion',
      astrologicalBasis: 'Mahadasha shift activating 9th (Bhagya) and 10th (Karma) Bhavas',
      forecast: 'Creation of an enduring business brand, intellectual property, or high-impact social initiative. International connections flourish.',
      favorableWindow: 'Years 3 to 4',
      cautions: 'Ensure strong legal and accounting contracts before scaling team operations.',
      actionableRitualOrRemedy: 'Donate books, educational stationery, or meals to underprivileged children on Thursdays.',
      completed: false,
    },
    {
      timelinePhase: '5 - 10 Years (Legacy & Destiny)',
      category: 'Spiritual Awakening & Dharma',
      title: 'Dharmic Legacy, Mentorship & Moksha Consciousness',
      astrologicalBasis: 'Ketu & 12th House spiritual culmination',
      forecast: 'Transition from material accumulation to profound philanthropic stewardship, mentoring future generations, and spiritual peace.',
      favorableWindow: 'Years 7 to 10',
      cautions: 'Avoid spiritual pride; stay humble and rooted in selfless service (Seva).',
      actionableRitualOrRemedy: 'Undertake sacred pilgrimages (Teertha Yatra) and practice daily meditation in Brahma Muhurta.',
      completed: false,
    },
  ];
}

function generateFallbackDailyInsights(profile: any, panchang: any, numerology: any): string {
  return `### 🌅 Today's Vedic Cosmic Weather
- **Panchang Synergy**: Today is blessed by **${panchang?.tithi || 'Shukla Paksha'}** in **${panchang?.nakshatra || 'Rohini Nakshatra'}**, creating an atmosphere of creative fertility and rapid progress.
- **Planetary Harmony Score**: **86 / 100** (High alignment for analytical planning & commercial negotiations)

---

### 💼 Career & Mindset Outlook
The planetary transits activate your decision-making centers. Focus on core deliverables during mid-morning. If you encounter unexpected delays, treat them as cosmic pauses to refine your strategy.

---

### ⏰ Key Time Windows Today
- ✨ **Shubh Abhijit Muhurta**: **${panchang?.abhijitMuhurta || '11:55 AM - 12:45 PM'}** (Ideal for signing contracts, publishing, or launching projects)
- ⚠️ **Rahu Kaal Window**: **${panchang?.rahuKaal || '01:30 PM - 03:00 PM'}** (Avoid high-stakes investments or emotional confrontations)

---

### 🕉️ Daily Vedic Ritual & Affirmation
> *"Om Som Somaya Namah"*
- Keep your mind cool, drink water from a silver or glass cup, and radiate compassionate calm.`;
}

function generateFallbackMatchmakingSynthesis(partner1: any, partner2: any, matchResult: any): string {
  const p1Name = partner1?.fullName || 'Partner 1';
  const p2Name = partner2?.fullName || 'Partner 2';
  const points = matchResult?.totalPoints || 28;
  const percentage = matchResult?.percentage || 78;
  const verdict = matchResult?.verdictTitle || 'Auspicious Match (Uttam Milan)';

  return `### 💍 1. Sacred Karmic Bond & Overall Cosmic Accord
The astrological synastry between **${p1Name}** and **${p2Name}** yields an Ashta Koota compatibility score of **${points} / 36 Gunas (${percentage}%)** classified as **${verdict}**. 
This divine alliance reflects mutual karmic merit (Purva Punya), bringing natural companionship, emotional warmth, and enduring loyalty.

---

### 💫 2. Emotional & Intellectual Resonance (Graha Maitri & Gana)
- **Mind & Intellect (Graha Maitri)**: The Moon sign planetary rulers form a favorable resonance, enabling fluid communication and shared philosophical outlook.
- **Temperament Sync (Gana Accord)**: Both personalities share a balanced psychological constitution, allowing them to de-escalate tension effortlessly with humor and understanding.

---

### ❤️ 3. Physical, Biological & Intimacy Accord (Yoni & Nadi)
- **Biological Vitality**: The physiological and instinctual matrix (Yoni Koota) signals genuine warmth and comforting intimacy.
- **Genetic Resonance (Nadi Koota)**: Bio-magnetic energy frequencies balance Vata, Pitta, and Kapha doshas, conferring strong health protection and vibrant progeny prospects.

---

### 🔥 4. Manglik (Kuja) Dosha Assessment
${matchResult?.manglik?.explanation || 'Planetary energies of Mars are harmoniously balanced between both charts, mitigating impulsive friction.'}

---

### 💰 5. Joint Prosperity, Wealth Multiplication & Family Dharma
The planetary 2nd, 7th, and 11th house trines indicate that entering into this union acts as a financial catalyst for both partners. Joint ventures, real estate decisions, and creative investments receive auspicious celestial backing.

---

### 🌿 6. Vedic Upayas (Remedies) & Auspicious Guidance
1. **Sacred Union Puja**: Perform a joint Shiva-Parvati or Gauri-Shankar archana on Shukla Paksha Mondays.
2. **Harmonizing Mantra**: Recite *"Om Lakshmi Narayanaya Namaha"* 21 times each Friday together.
3. **Space Energization**: Place a pair of loving Rose Quartz figurines or a sacred silver coin in the Northeast (Ishanya) corner of your living quarters.`;
}

// Start Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`JyotishVeda Server running on port ${PORT}`);
  });
}

startServer();
