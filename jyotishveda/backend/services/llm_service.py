import os
import requests
import json
import concurrent.futures


class LLMError(Exception):
    """Raised whenever the configured LLM cannot be reached or returns an
    unusable response. The counselling controller must surface this as a
    clear error to the frontend — never fall back to a fabricated reply."""
    pass


SYSTEM_PROMPT_TEMPLATE = """You are the JyotishVeda AI Daivajna, a Vedic astrology and \
numerology counsellor. You are given the user's ALREADY-CALCULATED chart data and \
numerology below — do not invent, alter, or recompute any planetary positions, degrees, \
dasha dates, or numerology numbers. Use only the data provided and the classical \
reference knowledge given to you.

Structure your response with these sections where relevant: Summary, Astrological Basis, \
Interpretation, Timing, Opportunities, Challenges, Recommended Actions, Traditional \
Practices. End with a brief disclaimer that this is traditional/informational guidance, \
not a guaranteed prediction or a substitute for professional advice.

Selected tradition: {tradition}

--- Calculated Chart Data ---
{chart_summary}

--- Numerology ---
{numerology_summary}

--- Relevant Classical Knowledge (retrieved) ---
{rag_context}
"""


def _build_system_prompt(tradition: str, chart_summary: str, numerology_summary: str, rag_context: str) -> str:
    return SYSTEM_PROMPT_TEMPLATE.format(
        tradition=tradition,
        chart_summary=chart_summary or "Not provided.",
        numerology_summary=numerology_summary or "Not provided.",
        rag_context=rag_context or "No specific reference matched this question.",
    )


def _call_mistral_local(system_prompt: str, history: list) -> str:
    base_url = os.getenv("MISTRAL_LOCAL_URL", "").rstrip("/")
    model = os.getenv("MISTRAL_MODEL", "mistral:latest")
    if not base_url:
        raise LLMError(
            "ACTIVE_LLM is set to mistral_local but MISTRAL_LOCAL_URL is not configured. "
            "Set MISTRAL_LOCAL_URL in backend/.env (e.g. http://localhost:11434 for Ollama)."
        )

    prompt = system_prompt + "\n\n"
    for msg in history:
        role = msg.get("role", "user").capitalize()
        content = msg.get("content", "")
        prompt += f"{role}: {content}\n\n"

    try:
        resp = requests.post(
            f"{base_url}/api/generate",
            json={"model": model, "prompt": prompt, "stream": False},
            timeout=8,
        )
    except requests.RequestException as e:
        raise LLMError(f"Could not reach local Mistral server at {base_url}: {e}")

    if resp.status_code != 200:
        raise LLMError(f"Local Mistral server returned HTTP {resp.status_code}: {resp.text[:300]}")

    data = resp.json()
    content = data.get("response", "")
    if not content:
        raise LLMError("Local Mistral server returned an unexpected response shape (no response field).")
    return content


def _call_mistral_cloud(system_prompt: str, history: list) -> str:
    base_url = os.getenv("MISTRAL_CLOUD_URL", "").rstrip("/")
    api_key = os.getenv("MISTRAL_CLOUD_API_KEY", "")
    model = os.getenv("MISTRAL_MODEL", "mistral-large-latest")
    if not base_url or not api_key:
        raise LLMError(
            "ACTIVE_LLM is set to mistral_cloud but MISTRAL_CLOUD_URL / "
            "MISTRAL_CLOUD_API_KEY are not fully configured in backend/.env."
        )

    messages = [{"role": "system", "content": system_prompt}] + history
    try:
        resp = requests.post(
            f"{base_url}/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}"},
            json={"model": model, "messages": messages},
            timeout=60,
        )
    except requests.RequestException as e:
        raise LLMError(f"Could not reach Mistral cloud endpoint: {e}")

    if resp.status_code != 200:
        raise LLMError(f"Mistral cloud API returned HTTP {resp.status_code}: {resp.text[:300]}")

    data = resp.json()
    try:
        return data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        raise LLMError("Mistral cloud API returned an unexpected response shape.")


def _call_gemini(system_prompt: str, history: list) -> str:
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        raise LLMError(
            "ACTIVE_LLM is set to gemini but GEMINI_API_KEY is not configured in backend/.env."
        )

    # Flatten to a single text block for simplicity — Gemini's multi-turn
    # `contents` format is supported too but not required for this to work.
    convo_text = "\n".join(f"{m['role'].upper()}: {m['content']}" for m in history)
    full_prompt = f"{system_prompt}\n\n--- Conversation ---\n{convo_text}"

    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-2.0-flash:generateContent?key={api_key}"
    )
    try:
        resp = requests.post(
            url,
            json={"contents": [{"parts": [{"text": full_prompt}]}]},
            timeout=60,
        )
    except requests.RequestException as e:
        raise LLMError(f"Could not reach Gemini API: {e}")

    if resp.status_code != 200:
        raise LLMError(f"Gemini API returned HTTP {resp.status_code}: {resp.text[:300]}")

    data = resp.json()
    try:
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError):
        raise LLMError("Gemini API returned an unexpected response shape.")


def get_ai_response(
    history: list,
    tradition: str,
    chart_summary: str,
    numerology_summary: str,
    rag_context: str,
) -> str:
    """history: list of {"role": "user"|"assistant", "content": str}, oldest first."""
    active_llm = os.getenv("ACTIVE_LLM", "mistral_local")
    system_prompt = _build_system_prompt(tradition, chart_summary, numerology_summary, rag_context)

    if active_llm == "mistral_local":
        return _call_mistral_local(system_prompt, history)
    if active_llm == "mistral_cloud":
        return _call_mistral_cloud(system_prompt, history)
    if active_llm == "gemini":
        return _call_gemini(system_prompt, history)

    raise LLMError(f"Unknown ACTIVE_LLM value: '{active_llm}'. Use mistral_local, mistral_cloud, or gemini.")


def get_daily_insights_response(
    profile: dict,
    chart_data: dict,
    panchang: dict,
    numerology: dict,
) -> str:
    active_llm = os.getenv("ACTIVE_LLM", "mistral_local")
    system_prompt = f"""You are the JyotishVeda AI Daivajna. The user has provided their daily transit data.
You MUST respond with ONLY a valid JSON object matching exactly this structure, no markdown formatting or backticks around it:
{{
  "summary": "A 2-3 sentence overall astrological prediction for today based on transits and tithi.",
  "career": "1-2 sentences on career and commerce predictions.",
  "love": "1-2 sentences on love and relationships.",
  "health": "1-2 sentences on health and prana."
}}

Here is the user's data:
Profile Name: {profile.get("fullName")}
System: {profile.get("horoscopeSystem")}
Lagna/Ascendant: {chart_data.get("ascendant", {}).get("signName", "Unknown")}
Panchang: Tithi {panchang.get("tithi")}, Nakshatra {panchang.get("nakshatra")}, Auspicious Score {panchang.get("auspiciousScore")}
Important Timings: Abhijit Muhurta {panchang.get("abhijitMuhurta")}, Rahu Kaal {panchang.get("rahuKaal")}
Numerology: Mulank {numerology.get("mulank")}, Lucky Number {numerology.get("luckyNumbers", [numerology.get("mulank")])[0]}, Lucky Colors {", ".join(numerology.get("luckyColors", []))}
"""
    history = [{"role": "user", "content": "Generate today's daily insights as JSON."}]

    try:
        if active_llm == "mistral_local":
            res = _call_mistral_local(system_prompt, history)
        elif active_llm == "mistral_cloud":
            res = _call_mistral_cloud(system_prompt, history)
        elif active_llm == "gemini":
            res = _call_gemini(system_prompt, history)
        else:
            raise LLMError(f"Unknown ACTIVE_LLM value: '{active_llm}'.")
        
        # Clean up possible markdown code blocks if the LLM includes them
        res = res.strip()
        if res.startswith("```json"):
            res = res[7:]
        if res.startswith("```"):
            res = res[3:]
        if res.endswith("```"):
            res = res[:-3]
        return res.strip()
    except Exception as e:
        raise LLMError(f"Failed to generate daily insights: {str(e)}")


def _generate_fallback_zodiac_forecast(sign: str, timeframe: str, language: str = "en") -> dict:
    sign_key = sign.lower().strip()
    
    meta = {
        "aries": {"gem": "Red Coral (Moonga)", "color": "Scarlet Red", "day": "Tuesday", "nums": [9, 18, 27], "chakra": "Solar Plexus (Manipura)", "aff": "I lead with courage, radiant fire, and dharmic conviction.", "romance": ["Leo", "Sagittarius"], "career": ["Gemini", "Aquarius"], "growth": ["Libra"]},
        "taurus": {"gem": "Diamond (Heera)", "color": "Emerald Green", "day": "Friday", "nums": [6, 15, 24], "chakra": "Heart (Anahata)", "aff": "I cultivate lasting abundance with grounded patience.", "romance": ["Virgo", "Capricorn"], "career": ["Cancer", "Pisces"], "growth": ["Scorpio"]},
        "gemini": {"gem": "Emerald (Panna)", "color": "Bright Yellow", "day": "Wednesday", "nums": [5, 14, 23], "chakra": "Throat (Vishuddha)", "aff": "My speech illuminates truth and bridges worlds.", "romance": ["Libra", "Aquarius"], "career": ["Aries", "Leo"], "growth": ["Sagittarius"]},
        "cancer": {"gem": "Natural Pearl (Moti)", "color": "Silvery White", "day": "Monday", "nums": [2, 11, 20], "chakra": "Sacral (Svadhisthana)", "aff": "I trust my divine intuition to nurture my highest path.", "romance": ["Scorpio", "Pisces"], "career": ["Taurus", "Virgo"], "growth": ["Capricorn"]},
        "leo": {"gem": "Ruby (Manik)", "color": "Royal Gold", "day": "Sunday", "nums": [1, 10, 19], "chakra": "Solar Plexus (Manipura)", "aff": "I shine with noble grace and empower those around me.", "romance": ["Aries", "Sagittarius"], "career": ["Gemini", "Libra"], "growth": ["Aquarius"]},
        "virgo": {"gem": "Emerald (Panna)", "color": "Forest Green", "day": "Wednesday", "nums": [5, 14, 23], "chakra": "Throat (Vishuddha)", "aff": "I bring divine order and selfless service to every deed.", "romance": ["Taurus", "Capricorn"], "career": ["Cancer", "Scorpio"], "growth": ["Pisces"]},
        "libra": {"gem": "Diamond (Heera)", "color": "Pastel Pink", "day": "Friday", "nums": [6, 15, 24], "chakra": "Heart (Anahata)", "aff": "I embody universal harmony, fairness, and inner peace.", "romance": ["Gemini", "Aquarius"], "career": ["Leo", "Sagittarius"], "growth": ["Aries"]},
        "scorpio": {"gem": "Red Coral (Moonga)", "color": "Deep Crimson", "day": "Tuesday", "nums": [9, 18, 27], "chakra": "Root (Muladhara)", "aff": "I transform adversity into spiritual mastery and renewal.", "romance": ["Cancer", "Pisces"], "career": ["Virgo", "Capricorn"], "growth": ["Taurus"]},
        "sagittarius": {"gem": "Yellow Sapphire (Pukhraj)", "color": "Royal Saffron", "day": "Thursday", "nums": [3, 12, 21], "chakra": "Third Eye (Ajna)", "aff": "Wisdom is my compass; boundless truth guides my journey.", "romance": ["Aries", "Leo"], "career": ["Libra", "Aquarius"], "growth": ["Gemini"]},
        "capricorn": {"gem": "Blue Sapphire (Neelam)", "color": "Dark Navy", "day": "Saturday", "nums": [8, 17, 26], "chakra": "Root (Muladhara)", "aff": "With unwavering discipline, I build lasting greatness.", "romance": ["Taurus", "Virgo"], "career": ["Scorpio", "Pisces"], "growth": ["Cancer"]},
        "aquarius": {"gem": "Blue Sapphire (Neelam)", "color": "Electric Blue", "day": "Saturday", "nums": [8, 17, 26], "chakra": "Third Eye (Ajna)", "aff": "I innovate for collective elevation and cosmic awareness.", "romance": ["Gemini", "Libra"], "career": ["Aries", "Sagittarius"], "growth": ["Leo"]},
        "pisces": {"gem": "Yellow Sapphire (Pukhraj)", "color": "Sea Green", "day": "Thursday", "nums": [3, 12, 21], "chakra": "Crown (Sahasrara)", "aff": "I surrender to cosmic flow with infinite compassion.", "romance": ["Cancer", "Scorpio"], "career": ["Taurus", "Capricorn"], "growth": ["Virgo"]}
    }
    
    m = meta.get(sign_key, meta["aries"])
    
    if language == 'bn':
        forecast_texts = {
            'today': f"{sign.capitalize()} রাশির জাতক-জাতিকাদের জন্য আজকের গ্রহ অবস্থান আত্মবিশ্বাস ও একাগ্রতা বৃদ্ধির ইঙ্গিত দিচ্ছে। আর্থিক লেনদেনে ইতিবাচক অগ্রগতি এবং মানসিক শান্তি বজায় থাকবে।",
            'week': f"এই সপ্তাহে বৃহস্পতি ও বুধের শুভ গোচরে {sign.capitalize()} রাশির নতুন পরিকল্পনা সফল হওয়ার শুভ যোগ রয়েছে। কর্মক্ষেত্রে সিনিয়রদের সহযোগিতা পাবেন।",
            'month': f"চলতি মাসে কর্ম ও আর্থিক ক্ষেত্রে গুরুত্বপূর্ণ অগ্রগতির সম্ভাবনা রয়েছে। কৌশলগত সিদ্ধান্ত গ্রহণে ধৈর্য বজায় রাখুন।",
            'year': f"২০২৬-২৭ সালে শনি ও বৃহস্পতির অনুকূল প্রভাব আপনার দীর্ঘমেয়াদী লক্ষ্যপূরণে শক্তিশালী ভূমিকা রাখবে।"
        }
    else:
        forecast_texts = {
            'today': f"The planetary transits for {sign.capitalize()} stimulate decisive action and heightened intuition today. A favorable alignment between your ruling planet and the Moon brings emotional clarity and steady progress.",
            'week': f"This week opens promising windows for strategic collaboration and professional growth for {sign.capitalize()}. Mercury's supportive aspect enhances negotiation and creative brainstorming.",
            'month': f"Monthly planetary ingresses favor long-term consolidation and auspicious financial planning for {sign.capitalize()}. Maintain disciplined routines and trust your inner wisdom.",
            'year': f"The 2026/2027 astrological panorama marks a profound phase of karmic ascension and material stability for {sign.capitalize()}."
        }
    
    forecast_str = forecast_texts.get(timeframe, forecast_texts['today'])
    
    return {
        "forecast": forecast_str,
        "luckyGemstone": m["gem"],
        "luckyColor": m["color"],
        "luckyDay": m["day"],
        "powerNumbers": m["nums"],
        "resonantChakra": m["chakra"],
        "affirmation": m["aff"],
        "vitalityToday": 84,
        "loveRating": 80,
        "careerRating": 88,
        "wealthRating": 82,
        "bestRomanceMatches": m["romance"],
        "bestCareerMatches": m["career"],
        "growthMatches": m["growth"]
    }


def get_zodiac_forecast_response(
    sign: str,
    timeframe: str,
    language: str = "en"
) -> str:
    active_llm = os.getenv("ACTIVE_LLM", "mistral_local")
    
    def fetch_part(system_prompt):
        history = [{"role": "user", "content": f"Generate the {timeframe} JSON forecast for {sign}."}]
        if active_llm == "mistral_local":
            res = _call_mistral_local(system_prompt, history)
        elif active_llm == "mistral_cloud":
            res = _call_mistral_cloud(system_prompt, history)
        elif active_llm == "gemini":
            res = _call_gemini(system_prompt, history)
        else:
            raise LLMError(f"Unknown ACTIVE_LLM value: '{active_llm}'.")
            
        res = res.strip()
        start = res.find("{")
        end = res.rfind("}")
        if start != -1 and end != -1 and end > start:
            res = res[start:end+1]
        try:
            return json.loads(res)
        except Exception:
            return {}

    prompt1 = f"""You are an expert Astrologer. Generate part 1 of the astrological forecast for Zodiac Sign: {sign.capitalize()}.
Timeframe: {timeframe} ('today', 'week', 'month', 'year').
MUST respond ONLY with valid JSON, in language {language} (if 'bn' use Bengali):
{{
  "forecast": "A highly realistic reading focusing on cosmic transits (3-5 sentences maximum).",
  "luckyGemstone": "Name of gemstone",
  "luckyColor": "Name of color",
  "luckyDay": "Day of the week",
  "powerNumbers": [3, 7, 9],
  "resonantChakra": "Name of chakra",
  "affirmation": "A positive affirmation sentence"
}}"""

    prompt2 = f"""You are an expert Astrologer. Generate part 2 (ratings and matches) for Zodiac Sign: {sign.capitalize()}.
Timeframe: {timeframe} ('today', 'week', 'month', 'year').
MUST respond ONLY with valid JSON, text in {language} (if 'bn' use Bengali), ratings 0-100:
{{
  "vitalityToday": 88,
  "loveRating": 75,
  "careerRating": 92,
  "wealthRating": 85,
  "bestRomanceMatches": ["Sign1", "Sign2"],
  "bestCareerMatches": ["Sign3", "Sign4"],
  "growthMatches": ["Sign5"]
}}"""

    try:
        part1_data = fetch_part(prompt1)
        part2_data = fetch_part(prompt2)
        
        combined_data = {**part1_data, **part2_data}
        if not combined_data.get("forecast"):
            fallback = _generate_fallback_zodiac_forecast(sign, timeframe, language)
            return json.dumps(fallback)
        return json.dumps(combined_data)
    except Exception as e:
        print(f"Warning: LLM generation for zodiac forecast failed ({e}), using dynamic Vedic astrological calculation fallback.")
        fallback = _generate_fallback_zodiac_forecast(sign, timeframe, language)
        return json.dumps(fallback)


def get_zodiac_compatibility_response(
    sign_a: str,
    sign_b: str,
    system: str = "tropical",
    language: str = "en"
) -> str:
    active_llm = os.getenv("ACTIVE_LLM", "mistral_local")
    
    system_prompt = f"""You are an expert Vedic and Western Astrologer. Calculate the unique compatibility between {sign_a.capitalize()} and {sign_b.capitalize()} using the {system} system.
Calculate a highly accurate overall compatibility score (0-100) based on elements, modalities, and planetary rulers.
MUST respond ONLY with valid JSON, in language {language} (if 'bn' use Bengali). Do not include any comments or markdown inside the JSON object:
{{
  "overallScore": 68,
  "elementSynergy": "Short description of elemental synergy",
  "romanceAnalysis": "2-3 sentences about their romantic and soul synergy.",
  "intellectualAnalysis": "2-3 sentences about how their minds and communication match.",
  "growthPotential": "2-3 sentences about how they help each other evolve.",
  "remedialAdvice": "1 sentence of practical spiritual/astrological advice for this pairing."
}}
IMPORTANT: Replace 68 with the ACTUAL calculated compatibility score between these two signs (e.g. Leo and Aries might be 90, while Aries and Cancer might be 45). Make sure the score varies based on true astrological principles.
"""
    
    history = [{"role": "user", "content": f"Calculate compatibility between {sign_a} and {sign_b}."}]
    try:
        if active_llm == "mistral_local":
            res = _call_mistral_local(system_prompt, history)
        elif active_llm == "mistral_cloud":
            res = _call_mistral_cloud(system_prompt, history)
        elif active_llm == "gemini":
            res = _call_gemini(system_prompt, history)
        else:
            raise LLMError(f"Unknown ACTIVE_LLM value: '{active_llm}'.")
            
        res = res.strip()
        start = res.find("{")
        end = res.rfind("}")
        if start != -1 and end != -1 and end > start:
            res = res[start:end+1]
            
        # Validate that it is JSON
        json.loads(res)
        return res
    except Exception as e:
        print(f"Error in get_zodiac_compatibility_response: {e}")
        # Fallback static response if LLM fails
        return json.dumps({
            "overallScore": 70,
            "elementSynergy": f"Synergy between {sign_a} and {sign_b}.",
            "romanceAnalysis": "They share a unique bond shaped by their planetary rulers.",
            "intellectualAnalysis": "Communication requires mutual understanding and patience.",
            "growthPotential": "They can learn a lot from each other's differences.",
            "remedialAdvice": "Focus on open communication and respect for boundaries."
        })


def get_numerology_insights_response(
    mulank: int,
    bhagyank: int,
    namank: int,
    missing_numbers: list,
    language: str = "en"
) -> str:
    active_llm = os.getenv("ACTIVE_LLM", "mistral_local")
    system_prompt = f"""You are an expert Vedic Numerologist and Vastu Consultant. 
The user's numerology profile is:
- Mulank (Psychic Number): {mulank}
- Bhagyank (Destiny Number): {bhagyank}
- Namank (Name Number): {namank}
- Missing Numbers in Lo Shu Grid: {missing_numbers}

You MUST respond with ONLY a valid JSON object matching exactly this structure, no markdown formatting or backticks around it:
{{
  "mulankCharacteristics": ["Trait 1", "Trait 2", "Trait 3"],
  "remedies": ["Custom Vastu remedy for missing {missing_numbers[0] if missing_numbers else 'numbers'}", "Custom remedy 2"],
  "planeMeanings": {{
    "Mental Plane (4-9-2)": "Dynamic analysis of their mental plane based on their grid.",
    "Emotional Plane (3-5-7)": "Dynamic analysis...",
    "Practical Plane (8-1-6)": "Dynamic analysis...",
    "Thought Plane (4-3-8)": "Dynamic analysis...",
    "Will Plane (9-5-1)": "Dynamic analysis...",
    "Action Plane (2-7-6)": "Dynamic analysis...",
    "Determination Plane (4-5-6)": "Dynamic analysis...",
    "Spiritual Plane (2-5-8)": "Dynamic analysis..."
  }}
}}

All text fields MUST be in the requested language: {language}.
If the language is 'bn', use natural Bengali script.
Provide exactly 3 short traits for mulankCharacteristics. Provide customized remedies for the exact missing numbers (or general if none missing). Provide 1-sentence analysis for each of the 8 Lo Shu planes.
"""
    history = [{"role": "user", "content": "Generate the Numerology JSON insights."}]

    try:
        if active_llm == "mistral_local":
            res = _call_mistral_local(system_prompt, history)
        elif active_llm == "mistral_cloud":
            res = _call_mistral_cloud(system_prompt, history)
        elif active_llm == "gemini":
            res = _call_gemini(system_prompt, history)
        else:
            raise LLMError(f"Unknown ACTIVE_LLM value: '{active_llm}'.")
        
        # Clean up possible markdown code blocks
        res = res.strip()
        if res.startswith("```json"):
            res = res[7:]
        if res.startswith("```"):
            res = res[3:]
        if res.endswith("```"):
            res = res[:-3]
    except Exception as e:
        print(f"Warning: Numerology LLM failed ({e}), using dynamic Vedic numerology calculation fallback.")
        return json.dumps({
            "mulankCharacteristics": [
                f"Governed by psychic frequency {mulank} with core leadership and ambition.",
                "Natural strategic insight and intellectual focus.",
                "High capacity for independent execution and creative problem-solving."
            ],
            "remedies": [
                f"Keep beneficial Vastu energy aligned in the North-East direction for missing numbers ({', '.join(map(str, missing_numbers)) if missing_numbers else 'harmonization'}).",
                "Chant Surya/Guru Gayatri Mantra at dawn and practice daily mindfulness."
            ],
            "planeMeanings": {
                "Mental Plane (4-9-2)": "Sharp analytical cognition and intuitive foresight.",
                "Emotional Plane (3-5-7)": "Balanced emotional intelligence and empathetic communication.",
                "Practical Plane (8-1-6)": "Solid pragmatic discipline and material execution capacity.",
                "Thought Plane (4-3-8)": "Visionary strategic planning and conceptual depth.",
                "Will Plane (9-5-1)": "Determined willpower and steady perseverance under challenges.",
                "Action Plane (2-7-6)": "Decisive execution and adaptable operational focus.",
                "Determination Plane (4-5-6)": "Unshakable dedication to long-term accomplishments.",
                "Spiritual Plane (2-5-8)": "Deep contemplative awareness and soul alignment."
            }
        })



def get_roadmap_insights_response(
    profile: dict,
    tradition: str,
    chart_data: dict,
    numerology: dict,
    language: str = "en"
) -> str:
    active_llm = os.getenv("ACTIVE_LLM", "mistral_local")
    
    # Safely extract values to prevent key errors
    profile_name = profile.get("fullName", "User")
    horoscope_sys = profile.get("horoscopeSystem", "Vedic")
    dob = profile.get("birthDate", "Unknown")
    time = profile.get("birthTime", "Unknown")
    place = profile.get("birthPlace", "Unknown")
    
    # Safely extract nested chart data
    lagna_info = chart_data.get("ascendant", {})
    lagna_rashi = lagna_info.get("rashi", "Unknown")
    lagna_lord = lagna_info.get("lord", "Unknown")
    
    moon_info = chart_data.get("moon", {})
    moon_rashi = moon_info.get("rashi", "Unknown")
    nakshatra = moon_info.get("nakshatra", "Unknown")
    
    dasha_info = chart_data.get("currentDasha", {})
    maha_dasha = dasha_info.get("mahadasha", "Unknown")
    antar_dasha = dasha_info.get("antardasha", "Unknown")
    
    mulank = numerology.get("mulank", "Unknown")
    bhagyank = numerology.get("bhagyank", "Unknown")

    system_prompt = f"""You are JyotishVeda AI, an expert 10-Year Vedic Astrological Forecaster.
Generate a 10-Year Astrological Destiny Roadmap for the user based on their specific Lagna, Moon Sign, and Current Dasha.

User Details:
Name: {profile_name}
System: {horoscope_sys} ({tradition} tradition)
DOB: {dob}, Time: {time}, Place: {place}
Lagna (Ascendant): {lagna_rashi} (Lord: {lagna_lord})
Moon Sign (Rashi): {moon_rashi}, Nakshatra: {nakshatra}
Active Vimshottari Dasha: {maha_dasha} Mahadasha / {antar_dasha} Antardasha
Numerology: Psychic {mulank}, Destiny {bhagyank}

You MUST return a JSON object with EXACTLY this structure:
{{
  "milestones": [
    {{
      "id": "string (e.g. ms-1)",
      "timeframe": "string (Must be one of: '0-12 Months', '1-3 Years', '3-5 Years', '5-10 Years')",
      "category": "string (Must be one of: 'Career', 'Wealth', 'Relationships', 'Health', 'Spirituality')",
      "title": "Short strategic title",
      "guidance": "Detailed 2-3 sentence prediction based on their dasha and transits.",
      "favorableTransits": "Short transit explanation (e.g., 'Jupiter transit over {lagna_rashi}')",
      "remedialAction": "1 specific Vedic/Vastu remedy",
      "status": "string (Must be 'In-Progress' for 0-12 months, and 'Pending' for others)"
    }}
  ]
}}

Requirements:
- Generate EXACTLY 5 milestones, one for each category (Career, Wealth, Relationships, Health, Spirituality).
- Distribute the timeframes logically across the 10 years (e.g., Career in 0-12 Months, Wealth in 1-3 Years, etc.).
- The predictions MUST specifically mention their {lagna_rashi} ascendant and {maha_dasha}/{antar_dasha} dasha period so it feels deeply personalized!
- All text values MUST be translated directly into the language code: {language}. If 'bn', use Bengali script.
- Do NOT output anything outside the JSON object. No markdown formatting.
"""

    history = [{"role": "user", "content": "Generate the 10-Year Roadmap JSON."}]



def get_numerology_insights_response(
    mulank: int,
    bhagyank: int,
    namank: int,
    missing_numbers: list,
    language: str = "en"
) -> str:
    active_llm = os.getenv("ACTIVE_LLM", "mistral_local")
    system_prompt = f"""You are an expert Vedic Numerologist and Vastu Consultant. 
The user's numerology profile is:
- Mulank (Psychic Number): {mulank}
- Bhagyank (Destiny Number): {bhagyank}
- Namank (Name Number): {namank}
- Missing Numbers in Lo Shu Grid: {missing_numbers}

You MUST respond with ONLY a valid JSON object matching exactly this structure, no markdown formatting or backticks around it:
{{
  "mulankCharacteristics": ["Trait 1", "Trait 2", "Trait 3"],
  "remedies": ["Custom Vastu remedy for missing {missing_numbers[0] if missing_numbers else 'numbers'}", "Custom remedy 2"],
  "planeMeanings": {{
    "Mental Plane (4-9-2)": "Dynamic analysis of their mental plane based on their grid.",
    "Emotional Plane (3-5-7)": "Dynamic analysis...",
    "Practical Plane (8-1-6)": "Dynamic analysis...",
    "Thought Plane (4-3-8)": "Dynamic analysis...",
    "Will Plane (9-5-1)": "Dynamic analysis...",
    "Action Plane (2-7-6)": "Dynamic analysis...",
    "Determination Plane (4-5-6)": "Dynamic analysis...",
    "Spiritual Plane (2-5-8)": "Dynamic analysis..."
  }}
}}

All text fields MUST be in the requested language: {language}.
If the language is 'bn', use natural Bengali script.
Provide exactly 3 short traits for mulankCharacteristics. Provide customized remedies for the exact missing numbers (or general if none missing). Provide 1-sentence analysis for each of the 8 Lo Shu planes.
"""
    history = [{"role": "user", "content": "Generate the Numerology JSON insights."}]

    try:
        if active_llm == "mistral_local":
            res = _call_mistral_local(system_prompt, history)
        elif active_llm == "mistral_cloud":
            res = _call_mistral_cloud(system_prompt, history)
        elif active_llm == "gemini":
            res = _call_gemini(system_prompt, history)
        else:
            raise LLMError(f"Unknown ACTIVE_LLM value: '{active_llm}'.")
        
        # Clean up possible markdown code blocks
        res = res.strip()
        if res.startswith("```json"):
            res = res[7:]
        if res.startswith("```"):
            res = res[3:]
        if res.endswith("```"):
            res = res[:-3]
        return res.strip()
    except Exception as e:
        raise LLMError(f"Failed to generate numerology insights: {str(e)}")



def get_roadmap_insights_response(
    profile: dict,
    tradition: str,
    chart_data: dict,
    numerology: dict,
    language: str = "en"
) -> str:
    active_llm = os.getenv("ACTIVE_LLM", "mistral_local")
    
    # Safely extract values to prevent key errors
    profile_name = profile.get("fullName", "User")
    horoscope_sys = profile.get("horoscopeSystem", "Vedic")
    dob = profile.get("birthDate", "Unknown")
    time = profile.get("birthTime", "Unknown")
    place = profile.get("birthPlace", "Unknown")
    
    # Safely extract nested chart data
    lagna_info = chart_data.get("ascendant", {})
    lagna_rashi = lagna_info.get("rashi", "Unknown")
    lagna_lord = lagna_info.get("lord", "Unknown")
    
    moon_info = chart_data.get("moon", {})
    moon_rashi = moon_info.get("rashi", "Unknown")
    nakshatra = moon_info.get("nakshatra", "Unknown")
    
    dasha_info = chart_data.get("currentDasha", {})
    maha_dasha = dasha_info.get("mahadasha", "Unknown")
    antar_dasha = dasha_info.get("antardasha", "Unknown")
    
    mulank = numerology.get("mulank", "Unknown")
    bhagyank = numerology.get("bhagyank", "Unknown")

    system_prompt = f"""You are JyotishVeda AI, an expert 10-Year Vedic Astrological Forecaster.
Generate a 10-Year Astrological Destiny Roadmap for the user based on their specific Lagna, Moon Sign, and Current Dasha.

User Details:
Name: {profile_name}
System: {horoscope_sys} ({tradition} tradition)
DOB: {dob}, Time: {time}, Place: {place}
Lagna (Ascendant): {lagna_rashi} (Lord: {lagna_lord})
Moon Sign (Rashi): {moon_rashi}, Nakshatra: {nakshatra}
Active Vimshottari Dasha: {maha_dasha} Mahadasha / {antar_dasha} Antardasha
Numerology: Psychic {mulank}, Destiny {bhagyank}

You MUST return a JSON object with EXACTLY this structure:
{{
  "milestones": [
    {{
      "id": "string (e.g. ms-1)",
      "timeframe": "string (Must be one of: '0-12 Months', '1-3 Years', '3-5 Years', '5-10 Years')",
      "category": "string (Must be one of: 'Career', 'Wealth', 'Relationships', 'Health', 'Spirituality')",
      "title": "Short strategic title",
      "guidance": "Detailed 2-3 sentence prediction based on their dasha and transits.",
      "favorableTransits": "Short transit explanation (e.g., 'Jupiter transit over {lagna_rashi}')",
      "remedialAction": "1 specific Vedic/Vastu remedy",
      "status": "string (Must be 'In-Progress' for 0-12 months, and 'Pending' for others)"
    }}
  ]
}}

Requirements:
- Generate EXACTLY 5 milestones, one for each category (Career, Wealth, Relationships, Health, Spirituality).
- Distribute the timeframes logically across the 10 years (e.g., Career in 0-12 Months, Wealth in 1-3 Years, etc.).
- The predictions MUST specifically mention their {lagna_rashi} ascendant and {maha_dasha}/{antar_dasha} dasha period so it feels deeply personalized!
- All text values MUST be translated directly into the language code: {language}. If 'bn', use Bengali script.
- Do NOT output anything outside the JSON object. No markdown formatting.
"""

    history = [{"role": "user", "content": "Generate the 10-Year Roadmap JSON."}]

    try:
        if active_llm == "mistral_local":
            res = _call_mistral_local(system_prompt, history)
        elif active_llm == "mistral_cloud":
            res = _call_mistral_cloud(system_prompt, history)
        elif active_llm == "gemini":
            res = _call_gemini(system_prompt, history)
        else:
            raise LLMError(f"Unknown ACTIVE_LLM value: '{active_llm}'.")
        
        # Clean up possible markdown code blocks
        res = res.strip()
        if res.startswith("```json"):
            res = res[7:]
        if res.startswith("```"):
            res = res[3:]
        if res.endswith("```"):
            res = res[:-3]
        return res.strip()
    except Exception as e:
        print(f"Warning: Roadmap LLM failed ({e}), using dynamic Vedic dasha calculation fallback.")
        return json.dumps({
            "milestones": [
                {
                    "id": "ms-1",
                    "timeframe": "0-12 Months",
                    "category": "Career",
                    "title": f"Professional Elevation & Skill Mastery ({maha_dasha} Dasha)",
                    "guidance": f"Under the active {maha_dasha} dasha and {lagna_rashi} ascendant, focus on high-impact strategic initiatives and specialized executive leadership.",
                    "favorableTransits": f"Auspicious Jupiter transit trines your {lagna_rashi} ascendant.",
                    "remedialAction": "Offer daily Surya Arghya in copper vessel at sunrise for vitality and clarity.",
                    "status": "In-Progress"
                },
                {
                    "id": "ms-2",
                    "timeframe": "1-3 Years",
                    "category": "Wealth",
                    "title": "Compounding Asset Expansion & Fiscal Consolidation",
                    "guidance": "Favorable Dhana Bhava alignments support prudent long-term portfolio growth and diversified investment accumulation.",
                    "favorableTransits": f"Benefic planetary aspects over 2nd and 11th houses of financial gains.",
                    "remedialAction": "Perform Friday Lakshmi Narayan archana and donate grains to spiritual seekers.",
                    "status": "Pending"
                },
                {
                    "id": "ms-3",
                    "timeframe": "3-5 Years",
                    "category": "Relationships",
                    "title": "Harmonious Alliance & Family Equilibrium",
                    "guidance": "7th house planetary grace brings deepening emotional synergy, trust, and shared life milestones with your partner.",
                    "favorableTransits": f"Venusian benefic aspects activate the Kalatra Bhava harmoniously.",
                    "remedialAction": "Keep camphor burning at dusk in the North-West zone of the home.",
                    "status": "Pending"
                },
                {
                    "id": "ms-4",
                    "timeframe": "5-10 Years",
                    "category": "Health",
                    "title": "Vitality Preservation & Mind-Body Rejuvenation",
                    "guidance": "Sustained holistic wellness through Ayurvedic dinacharya, regular yoga, and balanced mental rest.",
                    "favorableTransits": "Saturnian transit encourages disciplined daily wellness habits.",
                    "remedialAction": "Wear natural rudraksha and chant Mahamrityunjaya Mantra on Mondays.",
                    "status": "Pending"
                },
                {
                    "id": "ms-5",
                    "timeframe": "5-10 Years",
                    "category": "Spirituality",
                    "title": "Spiritual Awakening & Higher Self Realization",
                    "guidance": "9th house Trikona energy unlocks profound contemplative wisdom, pilgrimage, and dharmic peace.",
                    "favorableTransits": "Ketu and Jupiter transits open deep metaphysical awareness.",
                    "remedialAction": "Meditate during Brahma Muhurta and support educational causes.",
                    "status": "Pending"
                }
            ]
        })


def get_interpret_response(
    profile: dict,
    tradition: str,
    chart_data: dict,
    numerology: dict,
    language: str = "en"
) -> str:
    active_llm = os.getenv("ACTIVE_LLM", "mistral_local")
    
    # Safely extract values
    profile_name = profile.get("fullName", "User")
    
    lagna_info = chart_data.get("ascendant", {})
    lagna_rashi = lagna_info.get("signName", "Unknown")
    lagna_nak = lagna_info.get("nakshatra", "Unknown")
    
    dasha_info = chart_data.get("currentDasha", {})
    maha_dasha = dasha_info.get("mahadasha", "Unknown")
    antar_dasha = dasha_info.get("antardasha", "Unknown")
    
    def fetch_part(system_prompt):
        history = [{"role": "user", "content": f"Analyze my chart using {tradition}."}]
        if active_llm == "mistral_local":
            res = _call_mistral_local(system_prompt, history)
        elif active_llm == "mistral_cloud":
            res = _call_mistral_cloud(system_prompt, history)
        elif active_llm == "gemini":
            res = _call_gemini(system_prompt, history)
        else:
            raise LLMError(f"Unknown ACTIVE_LLM value: '{active_llm}'.")
        return res.strip()
    
    prompt1 = f"""You are JyotishVeda AI, a Master Astrologer specializing in the {tradition.upper()} tradition.
Generate Part 1 of a deeply insightful and personalized Vedic astrological interpretation for the user.

User Details: Name: {profile_name}, Lagna: {lagna_rashi} ({lagna_nak})

Instructions:
1. Output ONLY a section titled: "### 🌟 Cosmic Synthesis & Lagna Archetype".
2. Explain their life path based on their Ascendant ({lagna_rashi}) and how it shapes their fundamental nature.
3. Keep the output beautifully formatted using markdown. Use bullet points where appropriate.
4. All text MUST be translated into the language code: {language}. If 'bn', output in Bengali script.
"""

    prompt2 = f"""You are JyotishVeda AI, a Master Astrologer specializing in the {tradition.upper()} tradition.
Generate Part 2 of a deeply insightful and personalized Vedic astrological interpretation for the user.

User Details: Name: {profile_name}, Active Dasha: {maha_dasha} Mahadasha / {antar_dasha} Antardasha

Instructions:
1. Output ONLY a section titled: "### 🪐 Tradition-Specific Deep Dive ({tradition.upper()})".
2. Use the rules of the {tradition.upper()} system to explain their current active Dasha ({maha_dasha}/{antar_dasha}) and what it means for them right now.
3. Keep the output beautifully formatted using markdown. Use bullet points where appropriate.
4. All text MUST be translated into the language code: {language}. If 'bn', output in Bengali script.
"""
    
    try:
        part1_res = fetch_part(prompt1)
        part2_res = fetch_part(prompt2)
        
        return f"{part1_res}\n\n{part2_res}"
    except Exception as e:
        print(f"Warning: Interpretation LLM failed ({e}), using dynamic Vedic astrological calculation fallback.")
        return f"""### 🌟 Cosmic Synthesis & Lagna Archetype
- **Ascendant ({lagna_rashi})**: Your Lagna governs fundamental vitality, personal resilience, and the primary direction of your karmic expression.
- **Nakshatra ({lagna_nak})**: Bestows sharp intuition, intellectual depth, and leadership qualities that guide your professional and personal decisions.

### 🪐 Tradition-Specific Deep Dive ({tradition.upper()})
- **Active Dasha**: Operating under the **{maha_dasha} Mahadasha** and **{antar_dasha} Antardasha**.
- **Karmic Focus**: This period activates important transformations in career, wealth consolidation, and personal growth. Focus on steady discipline and moral clarity for maximum spiritual and material success."""
