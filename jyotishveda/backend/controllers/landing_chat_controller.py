import re
from datetime import datetime
from flask import request, jsonify
import os

def extract_birth_date(text: str):
    """Extract dates like DD-MM-YYYY, YYYY-MM-DD, DD/MM/YYYY, or Month DD, YYYY"""
    match = re.search(r'(\b\d{1,2})[-/.](\d{1,2})[-/.](\d{4}\b)', text)
    if match:
        d, m, y = int(match.group(1)), int(match.group(2)), int(match.group(3))
        if d > 12 and m <= 12:
            return y, m, d
        elif m > 12 and d <= 12:
            return y, d, m
        return y, m, d
    
    match = re.search(r'(\b\d{4})[-/.](\d{1,2})[-/.](\d{1,2}\b)', text)
    if match:
        return int(match.group(1)), int(match.group(2)), int(match.group(3))
    
    return None

def calculate_life_path(year: int, month: int, day: int) -> int:
    digits = [int(c) for c in f"{year}{month:02d}{day:02d}" if c.isdigit()]
    total = sum(digits)
    while total > 9 and total not in [11, 22, 33]:
        total = sum(int(c) for c in str(total))
    return total

def get_zodiac_sign(month: int, day: int) -> str:
    zodiac_dates = [
        (1, 20, "Makara (Capricorn)"), (2, 19, "Kumbha (Aquarius)"),
        (3, 20, "Meena (Pisces)"), (4, 20, "Mesha (Aries)"),
        (5, 21, "Vrishabha (Taurus)"), (6, 21, "Mithuna (Gemini)"),
        (7, 22, "Karka (Cancer)"), (8, 23, "Simha (Leo)"),
        (9, 23, "Kanya (Virgo)"), (10, 23, "Tula (Libra)"),
        (11, 22, "Vrishchika (Scorpio)"), (12, 21, "Dhanu (Sagittarius)"),
        (12, 31, "Makara (Capricorn)")
    ]
    for m, d, sign in zodiac_dates:
        if month < m or (month == m and day <= d):
            return sign
    return "Mithuna (Gemini)"

def get_astrological_knowledge(dob):
    year, month, day = dob
    life_path = calculate_life_path(year, month, day)
    sign = get_zodiac_sign(month, day)
    
    traits_map = {
        1: {
            "planet": "Surya Dev (Sun)",
            "gems": "Ruby (Manik) & Red Garnet",
            "color": "Golden Amber & Saffron",
            "day": "Ravivar (Sunday)",
            "good": [
                "Natural pioneering leadership, fearless initiative, and high social dignity.",
                "Exceptional capacity to execute ambitious projects independently."
            ],
            "bad": [
                "Tendency toward obstinacy and ego friction with superiors or partners.",
                "Impatience with slower processes—avoid hasty financial speculation."
            ]
        },
        2: {
            "planet": "Chandra Dev (Moon)",
            "gems": "Natural Pearl (Moti) & Moonstone",
            "color": "Silvery White & Milk Cream",
            "day": "Somvar (Monday)",
            "good": [
                "Deep intuitive empathy, diplomatic mastery, and peacemaking acumen.",
                "High artistic and emotional intelligence that builds strong alliances."
            ],
            "bad": [
                "Vulnerability to emotional fluctuations, mood shifts, and self-doubt.",
                "Difficulty in confronting conflict directly or setting firm boundaries."
            ]
        },
        3: {
            "planet": "Devaguru Brihaspati (Jupiter)",
            "gems": "Yellow Sapphire (Pukhraj) & Citrine",
            "color": "Golden Yellow & Saffron",
            "day": "Guruvar (Thursday)",
            "good": [
                "Profound strategic wisdom, visionary clarity, and inspirational communication.",
                "Natural talent for advisory, mentorship, and high-level problem solving."
            ],
            "bad": [
                "Over-optimism leading to neglecting fine contractual details or budgets.",
                "Scattered focus when handling too many concurrent initiatives."
            ]
        },
        4: {
            "planet": "Rahu Dev",
            "gems": "Hessonite Garnet (Gomed)",
            "color": "Electric Blue & Charcoal",
            "day": "Shanivar (Saturday)",
            "good": [
                "Extraordinary analytical discipline, technical depth, and unyielding work ethic.",
                "Ability to build solid, lasting systems under adverse circumstances."
            ],
            "bad": [
                "Resistance to unexpected changes and rigid perfectionism.",
                "Prone to mental burnout by overworking without adequate rest."
            ]
        },
        5: {
            "planet": "Budha Dev (Mercury)",
            "gems": "Emerald (Panna) & Peridot",
            "color": "Emerald Green & Light Mint",
            "day": "Budhvar (Wednesday)",
            "good": [
                "Fast intellectual agility, sharp commercial negotiation, and versatile adaptability.",
                "Thrives in dynamic, high-speed environments and technological innovation."
            ],
            "bad": [
                "Restlessness and getting easily bored with repetitive long-term routines.",
                "Impulsive decision-making during high-stress periods."
            ]
        },
        6: {
            "planet": "Shukra Dev (Venus)",
            "gems": "Diamond / White Zircon & Opal",
            "color": "Diamond White & Soft Rose",
            "day": "Shukravar (Friday)",
            "good": [
                "Magnetic charisma, high aesthetic sense, and profound commitment to harmony.",
                "Excellent at managing people, partnerships, and brand reputation."
            ],
            "bad": [
                "Tendency to compromise personal boundaries to please others.",
                "Emotional stress caused by high expectations from close associates."
            ]
        },
        7: {
            "planet": "Ketu Dev",
            "gems": "Cat's Eye (Lehsuniya)",
            "color": "Smoky Grey & Earth Brown",
            "day": "Guruvar (Thursday)",
            "good": [
                "Profound metaphysical depth, elite research capabilities, and sharp spiritual radar.",
                "Mastery over complex investigative and strategic analysis."
            ],
            "bad": [
                "Tendency toward social detachment, over-skepticism, and isolation.",
                "Overanalyzing simple matters, leading to delayed action."
            ]
        },
        8: {
            "planet": "Shani Dev (Saturn)",
            "gems": "Blue Sapphire (Neelam) & Amethyst",
            "color": "Royal Blue & Navy",
            "day": "Shanivar (Saturday)",
            "good": [
                "Immense capacity for large-scale enterprise, financial acumen, and perseverance.",
                "Rises steadily through disciplined effort to commanding positions."
            ],
            "bad": [
                "Tendency toward workaholism and neglecting emotional relationships.",
                "Early-life obstacles and delays requiring persistent patience."
            ]
        },
        9: {
            "planet": "Mangal Dev (Mars)",
            "gems": "Red Coral (Moonga) & Carnelian",
            "color": "Bright Coral Red & Royal Saffron",
            "day": "Mangalvar (Tuesday)",
            "good": [
                "Courageous leadership, unyielding resilience, and high humanitarian generosity.",
                "Supreme ability to fight through crises and champion major breakthroughs."
            ],
            "bad": [
                "Quick temper, impatience, and difficulty tolerating incompetence.",
                "Tendency to burn out from fighting unnecessary battles or emotional friction."
            ]
        }
    }
    
    t = traits_map.get(life_path, traits_map[9])
    return {
        "dob_str": f"{day:02d}-{month:02d}-{year}",
        "sign": sign,
        "life_path": life_path,
        "planet": t["planet"],
        "gems": t["gems"],
        "color": t["color"],
        "day": t["day"],
        "good": t["good"],
        "bad": t["bad"]
    }

def generate_astrological_reply(user_message: str, history: list, dob=None):
    msg_lower = user_message.lower().strip()
    
    # 1. Check if DOB is present in current message
    detected_dob = extract_birth_date(user_message)
    if detected_dob:
        dob = detected_dob
        k = get_astrological_knowledge(dob)
        reply = (
            f"🕉️ **Kalyan Ho! Detailed Janma Kundli Analysis ({k['dob_str']})**:\n\n"
            f"Your chart aligns with **{k['sign']}**, governed by the planetary grace of **{k['planet']}** (Life Path **{k['life_path']}**)."
        )
        return reply, dob

    # 2. If user asks questions without having provided DOB
    needs_dob = any(w in msg_lower for w in ['career', 'job', 'future', 'marriage', 'love', 'health', 'wealth', 'business', 'promotion', 'gemstone', 'color', 'remedy', 'switch', 'timing', 'details'])
    if needs_dob and not dob:
        return (
            "Ayushman Bhava! To look into your Janma Kundli and reveal the precise planetary alignments for your query, please share your **Date of Birth (DD-MM-YYYY)** and **Birth Time**.",
            None
        )

    # 3. Context-aware authentic Guruji responses when DOB is known (Direct, No counter-questions)
    if dob:
        k = get_astrological_knowledge(dob)
        
        # A. Favorable Career Fields & Business
        if any(w in msg_lower for w in ['field', 'business', 'favorable', 'industry', 'domain', 'suitable', 'stream']):
            reply = (
                f"🎯 **Karma Bhava (10th House of Career) Analysis for {k['sign']}**:\n\n"
                f"🌟 **Shubh Fields & Opportunities**:\n"
                f"• Technology Leadership, Strategic Management, FinTech, and Executive Advisory.\n"
                f"• Independent Enterprise and high-impact innovation.\n\n"
                f"⚠️ **Fields to Avoid / Precaution**:\n"
                f"• Low-autonomy repetitive clerical routines or high-risk unverified partnerships."
            )
            return reply, dob

        # B. Timing for Job Switch / Promotion
        elif any(w in msg_lower for w in ['time', 'timing', 'switch', 'promotion', 'when', 'change job', 'elevation', 'next step']):
            reply = (
                f"⏳ **Shubh Muhurta & Gochar (Transit) Windows**:\n\n"
                f"🌟 **Favorable Window**:\n"
                f"• The upcoming **6 to 9 months** bring auspicious Jupiter transit support for promotion and salary elevation.\n"
                f"• Best execution period: During waxing lunar phase (Shukla Paksha).\n\n"
                f"⚠️ **Inauspicious Period**:\n"
                f"• Avoid sudden resignations or aggressive negotiations during Mercury retrograde cycles."
            )
            return reply, dob

        # C. Lucky Gemstones & Colors
        elif any(w in msg_lower for w in ['gemstone', 'gem', 'stone', 'color', 'colour', 'lucky', 'wearing']):
            reply = (
                f"💎 **Shubh Ratna (Gemstone) & Harmonious Vibrations**:\n\n"
                f"🌟 **Recommended Gems & Colors**:\n"
                f"• **Primary Gemstone**: **{k['gems']}** (Energize on an auspicious morning and wear in Gold/Silver ring).\n"
                f"• **Favorable Colors**: **{k['color']}** (Amplifies focus, vitality, and aura protection).\n\n"
                f"⚠️ **Colors to Avoid**:\n"
                f"• Minimize dull charcoal black, murky brown, and faded grey during crucial milestones."
            )
            return reply, dob

        # D. Relationship / Love / Marriage
        elif any(w in msg_lower for w in ['love', 'marriage', 'relationship', 'partner', 'spouse', 'compatib']):
            reply = (
                f"💖 **Kalatra Bhava (7th House of Relationships)**:\n\n"
                f"🌟 **Harmonious Aspects**:\n"
                f"• Highest compatibility with loyal, intellectually grounded partners who value mutual spiritual growth.\n"
                f"• Upcoming Venus transits favor emotional stability and long-term commitment.\n\n"
                f"⚠️ **Vulnerability**:\n"
                f"• Guard against impatience, high expectations, and miscommunication during high workload phases."
            )
            return reply, dob

        # E. Wealth & Financial Prospects
        elif any(w in msg_lower for w in ['wealth', 'finance', 'money', 'financial', 'income', 'earning', 'investment']):
            reply = (
                f"💰 **Dhana Bhava & Labha Sthana (2nd & 11th Houses)**:\n\n"
                f"🌟 **Prosperity Strengths**:\n"
                f"• Compounding wealth accumulation through specialized mastery, digital assets, and strategic equities.\n\n"
                f"⚠️ **Financial Precautions**:\n"
                f"• Avoid speculative short-term trading and unwritten loan guarantees to acquaintances."
            )
            return reply, dob

        # F. Auspicious Days & Directions
        elif any(w in msg_lower for w in ['day', 'days', 'direction', 'weekday', 'start', 'auspicious']):
            reply = (
                f"📅 **Shubh Var & Beneficial Directions**:\n\n"
                f"🌟 **Auspicious Timings**:\n"
                f"• **Shubh Day**: **{k['day']}** (Blessed for contracts, starting ventures, and major milestones).\n"
                f"• **Shubh Direction**: **North-East (Ishanya Disha)** for study and workspace.\n"
                f"• **Shubh Hours**: Morning 07:00 AM – 10:30 AM (Brahma & Abhijit Muhurta)."
            )
            return reply, dob

        # G. Astrological Remedies & Mantras
        elif any(w in msg_lower for w in ['remedy', 'remedies', 'mantra', 'peace', 'prosperity', 'puja', 'ritual']):
            reply = (
                f"🌿 **Sacred Vedic Remedies & Harmonizing Upay**:\n\n"
                f"🌟 **Prescribed Practices**:\n"
                f"• **Sacred Japa**: Chant \`Om Gurave Namah\` or \`Gayatri Mantra\` 108 times at sunrise on {k['day']}.\n"
                f"• **Daana (Charity)**: Offering grains or assisting students and spiritual seekers.\n"
                f"• **Surya Arghya**: Offer water in a copper vessel to the rising Sun for vitality and mental clarity."
            )
            return reply, dob

        # H. Overall Destiny Summary / Summary
        elif any(w in msg_lower for w in ['summar', 'overall', 'destiny', 'conclusion', 'all in all', 'roadmap', 'thank']):
            reply = (
                f"🌟 **Overall Destiny Synthesis ({k['sign']})**:\n\n"
                f"My blessings upon you, dear soul. Your Janma Kundli reflects a noble karmic journey of intellectual leadership, impactful creation, and material fulfillment.\n\n"
                f"By maintaining moral discipline, steady patience, and avoiding impulsive reactions, the cosmic grahas fully support your glorious path."
            )
            return reply, dob

        # I. General Career
        else:
            reply = (
                f"🕉️ **Karma & Career Guidance ({k['sign']} | Life Path {k['life_path']})**:\n\n"
                f"🌟 **Core Strengths**: Strategic leadership, technical agility, and high problem-solving capacity.\n"
                f"⚠️ **Precaution**: Avoid overcommitting to too many simultaneous projects without delegation."
            )
            return reply, dob

def public_chat():
    body = request.get_json(silent=True) or {}
    messages = body.get("messages", [])
    msg_count = body.get("msgCount", 0)
    saved_dob = body.get("dob", None)

    # 1. On 3rd message (or if limit reached), directly return the login gate message
    if msg_count >= 2:
        return jsonify({
            "status": "success",
            "reply": "Please login to unlock deep analysis and detailed celestial wisdom.",
            "isLimitReached": True,
            "msgCount": msg_count + 1,
            "dob": saved_dob
        })

    if not messages:
        return jsonify({
            "status": "success",
            "reply": "Namaste. I am JyotishVeda, your Vedic Daivajna. How may I guide your astrological journey today?",
            "isLimitReached": False,
            "msgCount": msg_count,
            "dob": saved_dob
        })

    last_user_msg = messages[-1].get("content", "")
    detected_dob = extract_birth_date(last_user_msg) or saved_dob

    # 2. Try Live LLM (Gemini / Mistral) if configured in backend/.env
    try:
        from services import llm_service
        active_llm = os.getenv("ACTIVE_LLM", "")
        gemini_key = os.getenv("GEMINI_API_KEY", "")
        mistral_key = os.getenv("MISTRAL_CLOUD_API_KEY", "")
        mistral_local = os.getenv("MISTRAL_LOCAL_URL", "")

        has_llm = (active_llm == "gemini" and gemini_key) or \
                  (active_llm == "mistral_cloud" and mistral_key) or \
                  (active_llm == "mistral_local" and mistral_local)

        if has_llm:
            dob_context = f"User DOB: {detected_dob[2]:02d}-{detected_dob[1]:02d}-{detected_dob[0]}" if detected_dob else "DOB not yet provided."
            llm_reply = llm_service.get_ai_response(
                history=messages,
                tradition="vedic",
                chart_summary=dob_context,
                numerology_summary="",
                rag_context=""
            )
            if llm_reply and len(llm_reply.strip()) > 10:
                return jsonify({
                    "status": "success",
                    "reply": llm_reply,
                    "dob": detected_dob,
                    "isLimitReached": (msg_count + 1 >= 3),
                    "msgCount": msg_count + 1
                })
    except Exception:
        pass

    # 3. Dynamic Vedic Astrological Calculation Engine
    reply, new_dob = generate_astrological_reply(last_user_msg, messages, detected_dob)
    
    return jsonify({
        "status": "success",
        "reply": reply,
        "dob": new_dob or detected_dob,
        "isLimitReached": (msg_count + 1 >= 3),
        "msgCount": msg_count + 1
    })
