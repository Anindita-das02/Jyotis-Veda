import os
import requests


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

    messages = [{"role": "system", "content": system_prompt}] + history
    try:
        resp = requests.post(
            f"{base_url}/api/chat",
            json={"model": model, "messages": messages, "stream": False},
            timeout=60,
        )
    except requests.RequestException as e:
        raise LLMError(f"Could not reach local Mistral server at {base_url}: {e}")

    if resp.status_code != 200:
        raise LLMError(f"Local Mistral server returned HTTP {resp.status_code}: {resp.text[:300]}")

    data = resp.json()
    content = (data.get("message") or {}).get("content")
    if not content:
        raise LLMError("Local Mistral server returned an unexpected response shape (no message.content).")
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
  "health": "1-2 sentences on health and prana.",
  "morning_ritual_title": "Title for a morning ritual",
  "morning_ritual_desc": "Description for the morning ritual",
  "evening_ritual_title": "Title for an evening ritual",
  "evening_ritual_desc": "Description for the evening ritual",
  "lucky_color_desc": "Brief 1-sentence reason why the lucky color is auspicious today."
}}

Here is the user's data:
Profile Name: {profile.get("fullName")}
System: {profile.get("horoscopeSystem")}
Panchang: Tithi {panchang.get("tithi")}, Nakshatra {panchang.get("nakshatra")}, Auspicious Score {panchang.get("auspiciousScore")}
Numerology: Mulank {numerology.get("mulank")}, Lucky Colors {", ".join(numerology.get("luckyColors", []))}
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


def get_zodiac_forecast_response(
    sign: str,
    timeframe: str,
    language: str = "en"
) -> str:
    active_llm = os.getenv("ACTIVE_LLM", "mistral_local")
    system_prompt = f"""You are an expert Astrologer. Generate a personalized astrological forecast and attributes for the Zodiac Sign: {sign.capitalize()}.
The timeframe for this forecast is: {timeframe} (options: 'today', 'week', 'month', 'year').

You MUST respond with ONLY a valid JSON object matching exactly this structure, no markdown formatting or backticks around it:
{{
  "forecast": "A highly realistic, mystical yet practical reading focusing on general cosmic transits (3-5 sentences maximum).",
  "vitalityToday": 88,
  "loveRating": 75,
  "careerRating": 92,
  "wealthRating": 85,
  "luckyGemstone": "Name of a gemstone",
  "luckyColor": "Name of a color",
  "luckyDay": "Day of the week",
  "powerNumbers": [3, 7, 9],
  "resonantChakra": "Name of chakra",
  "affirmation": "A positive affirmation sentence",
  "bestRomanceMatches": ["Sign1", "Sign2"],
  "bestCareerMatches": ["Sign3", "Sign4"],
  "growthMatches": ["Sign5"]
}}

All text fields (except sign names in arrays) MUST be in the requested language: {language}.
If the language is 'bn', use natural Bengali script for text fields.
The numbers (ratings) should be integers between 0 and 100 based on the astrological aspects for this {timeframe}.
"""
    history = [{"role": "user", "content": f"Generate the {timeframe} JSON forecast for {sign}."}]

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
        raise LLMError(f"Failed to generate zodiac forecast: {str(e)}")
