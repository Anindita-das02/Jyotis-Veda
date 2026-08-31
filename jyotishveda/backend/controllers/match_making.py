import math
import uuid
import json
from datetime import datetime
from typing import Dict, Any, Optional, Tuple, List

from flask import request, jsonify, Response

from database.db_connection import call_procedure
from services.report_service import generate_match_report_pdf


# ============================================================
# ASTROLOGICAL REFERENCE CONSTANTS & TABLES
# ============================================================

ZODIAC_SIGNS = [
    {"name": "Aries", "sanskrit": "Mesha (मेष)", "lord": "Mars", "element": "Fire", "symbol": "♈"},
    {"name": "Taurus", "sanskrit": "Vrishabha (वृषभ)", "lord": "Venus", "element": "Earth", "symbol": "♉"},
    {"name": "Gemini", "sanskrit": "Mithuna (मिथुन)", "lord": "Mercury", "element": "Air", "symbol": "♊"},
    {"name": "Cancer", "sanskrit": "Karka (कर्क)", "lord": "Moon", "element": "Water", "symbol": "♋"},
    {"name": "Leo", "sanskrit": "Simha (सिंह)", "lord": "Sun", "element": "Fire", "symbol": "♌"},
    {"name": "Virgo", "sanskrit": "Kanya (कन्या)", "lord": "Mercury", "element": "Earth", "symbol": "♍"},
    {"name": "Libra", "sanskrit": "Tula (तुला)", "lord": "Venus", "element": "Air", "symbol": "♎"},
    {"name": "Scorpio", "sanskrit": "Vrishchika (वृश्चिक)", "lord": "Mars", "element": "Water", "symbol": "♏"},
    {"name": "Sagittarius", "sanskrit": "Dhanu (धनु)", "lord": "Jupiter", "element": "Fire", "symbol": "♐"},
    {"name": "Capricorn", "sanskrit": "Makara (मकर)", "lord": "Saturn", "element": "Earth", "symbol": "♑"},
    {"name": "Aquarius", "sanskrit": "Kumbha (कुम्भ)", "lord": "Saturn", "element": "Air", "symbol": "♒"},
    {"name": "Pisces", "sanskrit": "Meena (मीन)", "lord": "Jupiter", "element": "Water", "symbol": "♓"},
]

NAKSHATRAS = [
    {"name": "Ashwini", "lord": "Ketu", "deity": "Ashwini Kumaras", "degrees": 13.3333},
    {"name": "Bharani", "lord": "Venus", "deity": "Yama", "degrees": 13.3333},
    {"name": "Krittika", "lord": "Sun", "deity": "Agni", "degrees": 13.3333},
    {"name": "Rohini", "lord": "Moon", "deity": "Brahma / Prajapati", "degrees": 13.3333},
    {"name": "Mrigashira", "lord": "Mars", "deity": "Soma", "degrees": 13.3333},
    {"name": "Ardra", "lord": "Rahu", "deity": "Rudra", "degrees": 13.3333},
    {"name": "Punarvasu", "lord": "Jupiter", "deity": "Aditi", "degrees": 13.3333},
    {"name": "Pushya", "lord": "Saturn", "deity": "Brihaspati", "degrees": 13.3333},
    {"name": "Ashlesha", "lord": "Mercury", "deity": "Nagas / Serpents", "degrees": 13.3333},
    {"name": "Magha", "lord": "Ketu", "deity": "Pitris (Ancestors)", "degrees": 13.3333},
    {"name": "Purva Phalguni", "lord": "Venus", "deity": "Bhaga", "degrees": 13.3333},
    {"name": "Uttara Phalguni", "lord": "Sun", "deity": "Aryaman", "degrees": 13.3333},
    {"name": "Hasta", "lord": "Moon", "deity": "Savitr", "degrees": 13.3333},
    {"name": "Chitra", "lord": "Mars", "deity": "Vishwakarma", "degrees": 13.3333},
    {"name": "Swati", "lord": "Rahu", "deity": "Vayu", "degrees": 13.3333},
    {"name": "Vishakha", "lord": "Jupiter", "deity": "Indra-Agni", "degrees": 13.3333},
    {"name": "Anuradha", "lord": "Saturn", "deity": "Mitra", "degrees": 13.3333},
    {"name": "Jyeshtha", "lord": "Mercury", "deity": "Indra", "degrees": 13.3333},
    {"name": "Mula", "lord": "Ketu", "deity": "Nirriti", "degrees": 13.3333},
    {"name": "Purva Ashadha", "lord": "Venus", "deity": "Apas (Water)", "degrees": 13.3333},
    {"name": "Uttara Ashadha", "lord": "Sun", "deity": "Vishwadevas", "degrees": 13.3333},
    {"name": "Shravana", "lord": "Moon", "deity": "Vishnu", "degrees": 13.3333},
    {"name": "Dhanishta", "lord": "Mars", "deity": "Ashta Vasus", "degrees": 13.3333},
    {"name": "Shatabhisha", "lord": "Rahu", "deity": "Varuna", "degrees": 13.3333},
    {"name": "Purva Bhadrapada", "lord": "Jupiter", "deity": "Aja Ekapada", "degrees": 13.3333},
    {"name": "Uttara Bhadrapada", "lord": "Saturn", "deity": "Ahirbudhnya", "degrees": 13.3333},
    {"name": "Revati", "lord": "Mercury", "deity": "Pushan", "degrees": 13.3333},
]

NAKSHATRA_ATTRIBUTES = {
    "Ashwini": {"index": 0, "gana": "Deva", "yoni": "Horse (Ashwa)", "nadi": "Adi", "rashiIndex": 0, "rashiName": "Aries", "lord": "Ketu"},
    "Bharani": {"index": 1, "gana": "Manushya", "yoni": "Elephant (Gaja)", "nadi": "Madhya", "rashiIndex": 0, "rashiName": "Aries", "lord": "Venus"},
    "Krittika": {"index": 2, "gana": "Rakshasa", "yoni": "Ram (Mesha)", "nadi": "Antya", "rashiIndex": 1, "rashiName": "Taurus", "lord": "Sun"},
    "Rohini": {"index": 3, "gana": "Manushya", "yoni": "Serpent (Sarpa)", "nadi": "Antya", "rashiIndex": 1, "rashiName": "Taurus", "lord": "Moon"},
    "Mrigashira": {"index": 4, "gana": "Deva", "yoni": "Serpent (Sarpa)", "nadi": "Madhya", "rashiIndex": 1, "rashiName": "Taurus", "lord": "Mars"},
    "Ardra": {"index": 5, "gana": "Manushya", "yoni": "Dog (Shwan)", "nadi": "Adi", "rashiIndex": 2, "rashiName": "Gemini", "lord": "Rahu"},
    "Punarvasu": {"index": 6, "gana": "Deva", "yoni": "Cat (Marjara)", "nadi": "Adi", "rashiIndex": 2, "rashiName": "Gemini", "lord": "Jupiter"},
    "Pushya": {"index": 7, "gana": "Deva", "yoni": "Ram (Mesha)", "nadi": "Madhya", "rashiIndex": 3, "rashiName": "Cancer", "lord": "Saturn"},
    "Ashlesha": {"index": 8, "gana": "Rakshasa", "yoni": "Cat (Marjara)", "nadi": "Antya", "rashiIndex": 3, "rashiName": "Cancer", "lord": "Mercury"},
    "Magha": {"index": 9, "gana": "Rakshasa", "yoni": "Rat (Mushaka)", "nadi": "Antya", "rashiIndex": 4, "rashiName": "Leo", "lord": "Ketu"},
    "Purva Phalguni": {"index": 10, "gana": "Manushya", "yoni": "Rat (Mushaka)", "nadi": "Madhya", "rashiIndex": 4, "rashiName": "Leo", "lord": "Venus"},
    "Uttara Phalguni": {"index": 11, "gana": "Manushya", "yoni": "Cow (Gau)", "nadi": "Adi", "rashiIndex": 5, "rashiName": "Virgo", "lord": "Sun"},
    "Hasta": {"index": 12, "gana": "Deva", "yoni": "Buffalo (Mahisha)", "nadi": "Adi", "rashiIndex": 5, "rashiName": "Virgo", "lord": "Moon"},
    "Chitra": {"index": 13, "gana": "Rakshasa", "yoni": "Tiger (Vyaghra)", "nadi": "Madhya", "rashiIndex": 5, "rashiName": "Virgo", "lord": "Mars"},
    "Swati": {"index": 14, "gana": "Deva", "yoni": "Buffalo (Mahisha)", "nadi": "Antya", "rashiIndex": 6, "rashiName": "Libra", "lord": "Rahu"},
    "Vishakha": {"index": 15, "gana": "Rakshasa", "yoni": "Tiger (Vyaghra)", "nadi": "Antya", "rashiIndex": 6, "rashiName": "Libra", "lord": "Jupiter"},
    "Anuradha": {"index": 16, "gana": "Deva", "yoni": "Deer (Mriga)", "nadi": "Madhya", "rashiIndex": 7, "rashiName": "Scorpio", "lord": "Saturn"},
    "Jyeshtha": {"index": 17, "gana": "Rakshasa", "yoni": "Deer (Mriga)", "nadi": "Adi", "rashiIndex": 7, "rashiName": "Scorpio", "lord": "Mercury"},
    "Mula": {"index": 18, "gana": "Rakshasa", "yoni": "Dog (Shwan)", "nadi": "Adi", "rashiIndex": 8, "rashiName": "Sagittarius", "lord": "Ketu"},
    "Purva Ashadha": {"index": 19, "gana": "Manushya", "yoni": "Monkey (Vanara)", "nadi": "Madhya", "rashiIndex": 8, "rashiName": "Sagittarius", "lord": "Venus"},
    "Uttara Ashadha": {"index": 20, "gana": "Manushya", "yoni": "Mongoose (Nakula)", "nadi": "Antya", "rashiIndex": 9, "rashiName": "Capricorn", "lord": "Sun"},
    "Shravana": {"index": 21, "gana": "Deva", "yoni": "Monkey (Vanara)", "nadi": "Antya", "rashiIndex": 9, "rashiName": "Capricorn", "lord": "Moon"},
    "Dhanishta": {"index": 22, "gana": "Rakshasa", "yoni": "Lion (Simha)", "nadi": "Madhya", "rashiIndex": 9, "rashiName": "Capricorn", "lord": "Mars"},
    "Shatabhisha": {"index": 23, "gana": "Rakshasa", "yoni": "Horse (Ashwa)", "nadi": "Adi", "rashiIndex": 10, "rashiName": "Aquarius", "lord": "Rahu"},
    "Purva Bhadrapada": {"index": 24, "gana": "Manushya", "yoni": "Lion (Simha)", "nadi": "Adi", "rashiIndex": 10, "rashiName": "Aquarius", "lord": "Jupiter"},
    "Uttara Bhadrapada": {"index": 25, "gana": "Manushya", "yoni": "Cow (Gau)", "nadi": "Madhya", "rashiIndex": 11, "rashiName": "Pisces", "lord": "Saturn"},
    "Revati": {"index": 26, "gana": "Deva", "yoni": "Elephant (Gaja)", "nadi": "Antya", "rashiIndex": 11, "rashiName": "Pisces", "lord": "Mercury"},
}

YONI_ENEMIES = {
    "Horse (Ashwa)": "Buffalo (Mahisha)",
    "Buffalo (Mahisha)": "Horse (Ashwa)",
    "Elephant (Gaja)": "Lion (Simha)",
    "Lion (Simha)": "Elephant (Gaja)",
    "Ram (Mesha)": "Monkey (Vanara)",
    "Monkey (Vanara)": "Ram (Mesha)",
    "Serpent (Sarpa)": "Mongoose (Nakula)",
    "Mongoose (Nakula)": "Serpent (Sarpa)",
    "Dog (Shwan)": "Deer (Mriga)",
    "Deer (Mriga)": "Dog (Shwan)",
    "Cat (Marjara)": "Rat (Mushaka)",
    "Rat (Mushaka)": "Cat (Marjara)",
    "Cow (Gau)": "Tiger (Vyaghra)",
    "Tiger (Vyaghra)": "Cow (Gau)",
}

GRAHA_FRIENDSHIPS = {
    "Sun": {"friends": ["Moon", "Mars", "Jupiter"], "neutrals": ["Mercury"], "enemies": ["Venus", "Saturn"]},
    "Moon": {"friends": ["Sun", "Mercury"], "neutrals": ["Mars", "Jupiter", "Venus", "Saturn"], "enemies": []},
    "Mars": {"friends": ["Sun", "Moon", "Jupiter"], "neutrals": ["Venus", "Saturn"], "enemies": ["Mercury"]},
    "Mercury": {"friends": ["Sun", "Venus"], "neutrals": ["Mars", "Jupiter", "Saturn"], "enemies": ["Moon"]},
    "Jupiter": {"friends": ["Sun", "Moon", "Mars"], "neutrals": ["Saturn"], "enemies": ["Mercury", "Venus"]},
    "Venus": {"friends": ["Mercury", "Saturn"], "neutrals": ["Mars", "Jupiter"], "enemies": ["Sun", "Moon"]},
    "Saturn": {"friends": ["Mercury", "Venus"], "neutrals": ["Jupiter"], "enemies": ["Sun", "Moon", "Mars"]},
}

CHALDEAN_VALUES = {
    "A": 1, "I": 1, "J": 1, "Q": 1, "Y": 1,
    "B": 2, "K": 2, "R": 2,
    "C": 3, "G": 3, "L": 3, "S": 3,
    "D": 4, "M": 4, "T": 4,
    "E": 5, "H": 5, "N": 5, "X": 5,
    "U": 6, "V": 6, "W": 6,
    "O": 7, "Z": 7,
    "F": 8, "P": 8,
}

PYTHAGOREAN_VALUES = {
    "A": 1, "J": 1, "S": 1,
    "B": 2, "K": 2, "T": 2,
    "C": 3, "L": 3, "U": 3,
    "D": 4, "M": 4, "V": 4,
    "E": 5, "N": 5, "W": 5,
    "F": 6, "O": 6, "X": 6,
    "G": 7, "P": 7, "Y": 7,
    "H": 8, "Q": 8, "Z": 8,
    "I": 9, "R": 9,
}


# ============================================================
# HELPER & ERROR UTILITIES
# ============================================================

def _error(message: str, code: str, http_status: int = 400):
    return jsonify({
        "status": "error",
        "message": message,
        "error_code": code
    }), http_status


def _reduce_to_single_digit(num: int, keep_masters: bool = False) -> int:
    if keep_masters and num in (11, 22, 33):
        return num
    while num > 9:
        num = sum(int(d) for d in str(num))
    return num


def _get_varna(rashi_idx: int) -> Dict[str, Any]:
    if rashi_idx in (3, 7, 11):
        return {"name": "Brahmin (Spiritual / Intellectual)", "rank": 4}
    if rashi_idx in (0, 4, 8):
        return {"name": "Kshatriya (Leadership / Valor)", "rank": 3}
    if rashi_idx in (1, 5, 9):
        return {"name": "Vaishya (Commercial / Pragmatic)", "rank": 2}
    return {"name": "Shudra (Service / Artisan)", "rank": 1}


def _get_vashya(rashi_idx: int) -> str:
    if rashi_idx in (0, 1):
        return "Chatushpada (Quadruped)"
    if rashi_idx in (2, 5, 6, 10):
        return "Manava (Human / Biped)"
    if rashi_idx in (3, 7, 11):
        return "Jalachara (Water / Aquatic)"
    if rashi_idx == 4:
        return "Vanachara (Wild / Lion)"
    return "Keeta (Insect / Scorpio-Makara)"


# ============================================================
# VALIDATE PARTNER
# ============================================================

def validate_partner(partner: Any, partner_name: str = "partner") -> Optional[str]:
    """
    Validates a partner dict. Accepts both standard frontend and backend keys:
    - name or fullName
    - dob or birthDate (YYYY-MM-DD)
    - time or birthTime (HH:MM:SS or HH:MM)
    - place or birthPlace
    """
    if not isinstance(partner, dict):
        return f"{partner_name} must be a JSON object"

    name = partner.get("name") or partner.get("fullName")
    dob = partner.get("dob") or partner.get("birthDate")
    time_val = partner.get("time") or partner.get("birthTime")
    place = partner.get("place") or partner.get("birthPlace")

    missing = []
    if not name or not str(name).strip():
        missing.append("name/fullName")
    if not dob or not str(dob).strip():
        missing.append("dob/birthDate")
    if not time_val or not str(time_val).strip():
        missing.append("time/birthTime")
    if not place or not str(place).strip():
        missing.append("place/birthPlace")

    if missing:
        return f"{partner_name} missing field(s): " + ", ".join(missing)

    # Validate DOB
    try:
        datetime.strptime(str(dob).strip(), "%Y-%m-%d")
    except ValueError:
        return f"{partner_name} DOB must be in YYYY-MM-DD format"

    # Validate time
    time_clean = str(time_val).strip()
    valid_time = False
    for fmt in ("%H:%M:%S", "%H:%M"):
        try:
            datetime.strptime(time_clean, fmt)
            valid_time = True
            break
        except ValueError:
            pass

    if not valid_time:
        return f"{partner_name} time must be in HH:MM:SS or HH:MM format"

    return None


def _normalize_partner(p: dict) -> dict:
    """Normalizes partner dictionary keys for consistent calculations."""
    name = str(p.get("name") or p.get("fullName") or "Partner").strip()
    dob = str(p.get("dob") or p.get("birthDate") or "1995-01-01").strip()
    time_str = str(p.get("time") or p.get("birthTime") or "12:00:00").strip()
    place = str(p.get("place") or p.get("birthPlace") or "New Delhi, India").strip()
    gender = str(p.get("gender") or "unspecified").strip().lower()

    lat = p.get("latitude")
    lon = p.get("longitude")
    try:
        lat = float(lat) if lat is not None else 28.6139
    except (ValueError, TypeError):
        lat = 28.6139

    try:
        lon = float(lon) if lon is not None else 77.2090
    except (ValueError, TypeError):
        lon = 77.2090

    if len(time_str) == 5:
        time_str += ":00"

    return {
        "id": p.get("id") or str(uuid.uuid4()),
        "name": name,
        "fullName": name,
        "dob": dob,
        "birthDate": dob,
        "time": time_str,
        "birthTime": time_str[:5],
        "place": place,
        "birthPlace": place,
        "gender": gender,
        "latitude": lat,
        "longitude": lon,
        "timezone": p.get("timezone", 5.5),
        "horoscopeSystem": p.get("horoscopeSystem", "vedic"),
    }


# ============================================================
# DYNAMIC KUNDLI & CHART GENERATION
# ============================================================

def generate_kundli(partner: dict) -> dict:
    """
    Computes dynamic Vedic Sidereal planetary positions, Ascendant,
    and house occupancy from birth date, time, and coordinates.
    """
    p = _normalize_partner(partner)
    b_date_str = p["dob"]
    b_time_str = p["time"]

    try:
        b_dt = datetime.strptime(f"{b_date_str} {b_time_str}", "%Y-%m-%d %H:%M:%S")
    except ValueError:
        b_dt = datetime.strptime(f"{b_date_str} {b_time_str[:5]}", "%Y-%m-%d %H:%M")

    day_of_year = (b_dt - datetime(b_dt.year, 1, 1)).days + 1
    birth_hours = b_dt.hour + b_dt.minute / 60.0 + b_dt.second / 3600.0

    lat = p["latitude"]
    lon = p["longitude"]

    # Deterministic astronomical seed calculation
    seed = (b_dt.year * 365 + day_of_year) * 24 + birth_hours + lat * 0.5 + lon * 0.2

    # Ascendant (Lagna)
    total_lagna_deg = (math.floor(seed * 1.618 + (lon / 15.0) * 30.0 + birth_hours * 15.0)) % 360.0
    if total_lagna_deg < 0:
        total_lagna_deg += 360.0

    lagna_sign_index = int(total_lagna_deg // 30)
    lagna_deg = round(total_lagna_deg % 30, 2)
    lagna_nak_idx = int(total_lagna_deg // 13.333333) % 27

    planet_configs = [
        {"id": "sun", "name": "Sun", "sanskrit": "Surya (सूर्य)", "symbol": "☉", "baseRate": 0.9856, "offset": 280},
        {"id": "moon", "name": "Moon", "sanskrit": "Chandra (चन्द्र)", "symbol": "☽", "baseRate": 13.176, "offset": 45},
        {"id": "mars", "name": "Mars", "sanskrit": "Mangal (मंगल)", "symbol": "♂", "baseRate": 0.524, "offset": 120},
        {"id": "mercury", "name": "Mercury", "sanskrit": "Budha (बुध)", "symbol": "☿", "baseRate": 1.2, "offset": 310},
        {"id": "jupiter", "name": "Jupiter", "sanskrit": "Guru (गुरु)", "symbol": "♃", "baseRate": 0.083, "offset": 190},
        {"id": "venus", "name": "Venus", "sanskrit": "Shukra (शुक्र)", "symbol": "♀", "baseRate": 1.15, "offset": 70},
        {"id": "saturn", "name": "Saturn", "sanskrit": "Shani (शनि)", "symbol": "♄", "baseRate": 0.033, "offset": 240},
        {"id": "rahu", "name": "Rahu", "sanskrit": "Rahu (राहु)", "symbol": "☊", "baseRate": -0.052, "offset": 15},
        {"id": "ketu", "name": "Ketu", "sanskrit": "Ketu (केतु)", "symbol": "☋", "baseRate": -0.052, "offset": 195},
    ]

    calculated_planets = []
    planets_by_id = {}

    for idx, cfg in enumerate(planet_configs):
        tot_deg = (cfg["offset"] + (seed * cfg["baseRate"] * 0.1) + idx * 23.5) % 360.0
        if tot_deg < 0:
            tot_deg += 360.0

        sign_idx = int(tot_deg // 30)
        deg_in_sign = round(tot_deg % 30, 2)
        nak_idx = int(tot_deg // 13.333333) % 27
        pada = int((tot_deg % 13.333333) // 3.333333) + 1
        house = ((sign_idx - lagna_sign_index + 12) % 12) + 1

        p_obj = {
            "id": cfg["id"],
            "name": cfg["name"],
            "sanskritName": cfg["sanskrit"],
            "symbol": cfg["symbol"],
            "signIndex": sign_idx,
            "signName": ZODIAC_SIGNS[sign_idx]["name"],
            "signSanskrit": ZODIAC_SIGNS[sign_idx]["sanskrit"],
            "degree": deg_in_sign,
            "totalDegree": round(tot_deg, 2),
            "house": house,
            "nakshatra": NAKSHATRAS[nak_idx]["name"],
            "nakshatraLord": NAKSHATRAS[nak_idx]["lord"],
            "pada": pada,
        }
        calculated_planets.append(p_obj)
        planets_by_id[cfg["id"]] = p_obj

    return {
        "ascendant": {
            "signIndex": lagna_sign_index,
            "degree": lagna_deg,
            "signName": ZODIAC_SIGNS[lagna_sign_index]["name"],
            "signSanskrit": ZODIAC_SIGNS[lagna_sign_index]["sanskrit"],
            "nakshatra": NAKSHATRAS[lagna_nak_idx]["name"],
        },
        "planets": calculated_planets,
        "planetsById": planets_by_id,
        "partner": p,
    }


# ============================================================
# DYNAMIC NUMEROLOGY CALCULATION
# ============================================================

def calculate_numerology(name: str, dob_str: str) -> dict:
    parts = dob_str.split("-")
    day_num = int(parts[2]) if len(parts) > 2 else 1
    mulank = _reduce_to_single_digit(day_num)

    # Bhagyank (Full birth date sum)
    dob_digits = [int(d) for d in dob_str if d.isdigit()]
    bhagyank = _reduce_to_single_digit(sum(dob_digits))

    # Namank (Chaldean & Pythagorean)
    upper_name = name.upper()
    chaldean_sum = sum(CHALDEAN_VALUES.get(char, 0) for char in upper_name if char.isalpha())
    namank_chaldean = _reduce_to_single_digit(chaldean_sum)

    pythagorean_sum = sum(PYTHAGOREAN_VALUES.get(char, 0) for char in upper_name if char.isalpha())
    namank_pythagorean = _reduce_to_single_digit(pythagorean_sum)

    mulank_planets = {
        1: "Sun (Surya)", 2: "Moon (Chandra)", 3: "Jupiter (Guru)",
        4: "Rahu (Dragon's Head)", 5: "Mercury (Budha)", 6: "Venus (Shukra)",
        7: "Ketu (Dragon's Tail)", 8: "Saturn (Shani)", 9: "Mars (Mangal)"
    }

    return {
        "mulank": mulank,
        "bhagyank": bhagyank,
        "namankChaldean": namank_chaldean,
        "namankPythagorean": namank_pythagorean,
        "mulankPlanet": mulank_planets.get(mulank, "Sun (Surya)")
    }


# ============================================================
# DYNAMIC ASHTA KOOTA MILAN CALCULATION (36 GUNAS)
# ============================================================

def calculate_ashta_koota(chart1: dict, chart2: dict) -> Tuple[List[dict], Dict[str, dict], float, float]:
    moon1 = chart1["planetsById"].get("moon") or chart1["planets"][1]
    moon2 = chart2["planetsById"].get("moon") or chart2["planets"][1]

    nak1_name = moon1["nakshatra"]
    nak2_name = moon2["nakshatra"]

    nak1 = NAKSHATRA_ATTRIBUTES.get(nak1_name, NAKSHATRA_ATTRIBUTES["Ashwini"])
    nak2 = NAKSHATRA_ATTRIBUTES.get(nak2_name, NAKSHATRA_ATTRIBUTES["Rohini"])

    rashi1_idx = moon1["signIndex"]
    rashi2_idx = moon2["signIndex"]

    rashi1_lord = ZODIAC_SIGNS[rashi1_idx]["lord"]
    rashi2_lord = ZODIAC_SIGNS[rashi2_idx]["lord"]

    # 1. VARNA KOOTA (Max 1 point)
    varna1 = _get_varna(rashi1_idx)
    varna2 = _get_varna(rashi2_idx)
    varna_points = 1.0 if varna1["rank"] >= varna2["rank"] else 0.0

    varna_koota = {
        "id": "varna",
        "name": "Varna Koota",
        "sanskritName": "वर्ण कूट",
        "maxPoints": 1.0,
        "maxScore": 1.0,
        "obtainedPoints": varna_points,
        "score": varna_points,
        "p1Value": varna1["name"].split(" ")[0],
        "p2Value": varna2["name"].split(" ")[0],
        "area": "Spiritual Ego & Work Harmony",
        "description": "Measures spiritual alignment, intellectual ego balance, and vocational mutual respect.",
        "verdict": "Excellent" if varna_points == 1.0 else "Challenging",
        "status": "good" if varna_points == 1.0 else "average",
        "details": (
            "Harmonious spiritual polarity; both individuals share mutual respect for core vocational ethics."
            if varna_points == 1.0
            else "Slight ego dissonance in vocational authority; remedied through clear communication of personal boundaries."
        )
    }

    # 2. VASHYA KOOTA (Max 2 points)
    vashya1 = _get_vashya(rashi1_idx)
    vashya2 = _get_vashya(rashi2_idx)
    vashya_points = 0.0

    if vashya1 == vashya2:
        vashya_points = 2.0
    elif ("Manava" in vashya1 and "Chatushpada" in vashya2) or ("Manava" in vashya2 and "Chatushpada" in vashya1):
        vashya_points = 1.0
    elif ("Jalachara" in vashya1 and "Manava" in vashya2) or ("Jalachara" in vashya2 and "Manava" in vashya1):
        vashya_points = 1.5
    elif "Vanachara" in vashya1 or "Vanachara" in vashya2:
        vashya_points = 0.5
    else:
        vashya_points = 1.0

    vashya_koota = {
        "id": "vashya",
        "name": "Vashya Koota",
        "sanskritName": "वश्य कूट",
        "maxPoints": 2.0,
        "maxScore": 2.0,
        "obtainedPoints": vashya_points,
        "score": vashya_points,
        "p1Value": vashya1.split(" ")[0],
        "p2Value": vashya2.split(" ")[0],
        "area": "Dominance & Magnetic Attraction",
        "description": "Assesses interpersonal power balance, natural magnetic influence, and mutual receptivity.",
        "verdict": "Excellent" if vashya_points >= 1.5 else ("Good" if vashya_points >= 1.0 else "Average"),
        "status": "good" if vashya_points >= 1.5 else "average",
        "details": (
            "Strong mutual attraction and natural willingness to support each other without power struggles."
            if vashya_points >= 1.5
            else "Balanced interpersonal dynamic; occasional need for collaborative consensus in decision making."
        )
    }

    # 3. TARA KOOTA (Max 3 points)
    tara1to2 = ((nak2["index"] - nak1["index"] + 27) % 9) + 1
    tara2to1 = ((nak1["index"] - nak2["index"] + 27) % 9) + 1
    auspicious_taras = [1, 2, 4, 6, 8, 9]
    tara_points = 0.0
    if tara1to2 in auspicious_taras:
        tara_points += 1.5
    if tara2to1 in auspicious_taras:
        tara_points += 1.5

    tara_koota = {
        "id": "tara",
        "name": "Tara Koota",
        "sanskritName": "तारा कूट",
        "maxPoints": 3.0,
        "maxScore": 3.0,
        "obtainedPoints": tara_points,
        "score": tara_points,
        "p1Value": f"Tara {tara1to2}/9 ({nak1['lord']})",
        "p2Value": f"Tara {tara2to1}/9 ({nak2['lord']})",
        "area": "Destiny, Health & Longevity Accord",
        "description": "Evaluates cosmic fortune, health protection, longevity, and mutual auspicious timing.",
        "verdict": "Excellent" if tara_points == 3.0 else ("Good" if tara_points >= 1.5 else "Challenging"),
        "status": "good" if tara_points >= 1.5 else "critical",
        "details": (
            "Exceptionally auspicious planetary star concordance; brings protection, mutual longevity, and prosperity."
            if tara_points == 3.0
            else ("Beneficial star alignment with solid overall life protection." if tara_points >= 1.5 else "Challenging Tara cycle; recommended to recite Maha Mrityunjaya Mantra together for health vitality.")
        )
    }

    # 4. YONI KOOTA (Max 4 points)
    yoni1 = nak1["yoni"]
    yoni2 = nak2["yoni"]
    yoni_points = 0.0

    if yoni1 == yoni2:
        yoni_points = 4.0
    elif YONI_ENEMIES.get(yoni1) == yoni2 or YONI_ENEMIES.get(yoni2) == yoni1:
        yoni_points = 0.0
    else:
        is_friendly = (
            ("Gaja" in yoni1 and "Gau" in yoni2) or ("Gau" in yoni1 and "Gaja" in yoni2) or
            ("Ashwa" in yoni1 and "Mriga" in yoni2) or ("Mriga" in yoni1 and "Ashwa" in yoni2) or
            ("Vanara" in yoni1 and "Marjara" in yoni2) or ("Marjara" in yoni1 and "Vanara" in yoni2)
        )
        yoni_points = 3.0 if is_friendly else 2.0

    yoni_koota = {
        "id": "yoni",
        "name": "Yoni Koota",
        "sanskritName": "योनि कूट",
        "maxPoints": 4.0,
        "maxScore": 4.0,
        "obtainedPoints": yoni_points,
        "score": yoni_points,
        "p1Value": yoni1.split(" ")[0],
        "p2Value": yoni2.split(" ")[0],
        "area": "Physical & Biological Compatibility",
        "description": "Measures instinctual affinity, physical comfort, intimate satisfaction, and biological sync.",
        "verdict": "Excellent" if yoni_points == 4.0 else ("Good" if yoni_points >= 2.0 else "Critical"),
        "status": "good" if yoni_points >= 2.0 else "critical",
        "details": (
            "Same Yoni animal archetype; perfect instinctual harmony, mutual physical fondness, and deep bonding."
            if yoni_points == 4.0
            else ("Harmonious physical compatibility with great mutual understanding of intimacy needs." if yoni_points >= 2.0 else "Inimical Yoni pairing; requires patience, conscious tenderness, and emotional communication.")
        )
    }

    # 5. GRAHA MAITRI (Max 5 points)
    lord1 = rashi1_lord
    lord2 = rashi2_lord
    graha_points = 0.0

    if lord1 == lord2:
        graha_points = 5.0
    else:
        p1_to_p2_friend = lord2 in GRAHA_FRIENDSHIPS.get(lord1, {}).get("friends", [])
        p1_to_p2_neutral = lord2 in GRAHA_FRIENDSHIPS.get(lord1, {}).get("neutrals", [])
        p2_to_p1_friend = lord1 in GRAHA_FRIENDSHIPS.get(lord2, {}).get("friends", [])
        p2_to_p1_neutral = lord1 in GRAHA_FRIENDSHIPS.get(lord2, {}).get("neutrals", [])

        if p1_to_p2_friend and p2_to_p1_friend:
            graha_points = 5.0
        elif (p1_to_p2_friend and p2_to_p1_neutral) or (p2_to_p1_friend and p1_to_p2_neutral):
            graha_points = 4.0
        elif p1_to_p2_neutral and p2_to_p1_neutral:
            graha_points = 3.0
        elif p1_to_p2_friend or p2_to_p1_friend:
            graha_points = 1.0
        else:
            graha_points = 0.5

    graha_koota = {
        "id": "graha_maitri",
        "name": "Graha Maitri Koota",
        "sanskritName": "ग्रह मैत्री कूट",
        "maxPoints": 5.0,
        "maxScore": 5.0,
        "obtainedPoints": graha_points,
        "score": graha_points,
        "p1Value": f"{ZODIAC_SIGNS[rashi1_idx]['name']} ({lord1})",
        "p2Value": f"{ZODIAC_SIGNS[rashi2_idx]['name']} ({lord2})",
        "area": "Mental Harmony & Friendship",
        "description": "Governs intellectual camaraderie, shared worldview, emotional rapport, and friendship.",
        "verdict": "Excellent" if graha_points >= 4.0 else ("Good" if graha_points >= 3.0 else "Average"),
        "status": "good" if graha_points >= 3.0 else "average",
        "details": (
            "Moon sign lords are mutual friends; deep intellectual wavelength, emotional transparency, and laughter."
            if graha_points >= 4.0
            else ("Neutral planetary lords; mutual respect and functional communication thrive with common goals." if graha_points >= 3.0 else "Incompatible Moon sign lords; intellectual views differ, encouraging personal patience and growth.")
        )
    }

    # 6. GANA KOOTA (Max 6 points)
    gana1 = nak1["gana"]
    gana2 = nak2["gana"]
    gana_points = 0.0

    if gana1 == gana2:
        gana_points = 6.0
    elif (gana1 == "Deva" and gana2 == "Manushya") or (gana1 == "Manushya" and gana2 == "Deva"):
        gana_points = 5.0
    elif (gana1 == "Deva" and gana2 == "Rakshasa") or (gana1 == "Rakshasa" and gana2 == "Deva"):
        gana_points = 1.0
    else:
        gana_points = 0.0

    gana_koota = {
        "id": "gana",
        "name": "Gana Koota",
        "sanskritName": "गण कूट",
        "maxPoints": 6.0,
        "maxScore": 6.0,
        "obtainedPoints": gana_points,
        "score": gana_points,
        "p1Value": f"{gana1} Gana",
        "p2Value": f"{gana2} Gana",
        "area": "Temperament & Psychological Constitution",
        "description": "Evaluates emotional temperament, lifestyle expectations, stress tolerance, and social persona.",
        "verdict": "Excellent" if gana_points >= 5.0 else ("Average" if gana_points >= 1.0 else "Critical"),
        "status": "good" if gana_points >= 5.0 else "critical",
        "details": (
            "Compatible psychological constitution; harmonious emotional reactions, conflict resolution, and lifestyle pace."
            if gana_points >= 5.0
            else "Temperamental contrast (e.g. Divine/Human vs Fierce); remedied through conscious emotional empathy and space."
        )
    }

    # 7. BHAKOOT KOOTA (Max 7 points)
    rashi_diff = ((rashi2_idx - rashi1_idx + 12) % 12) + 1
    alt_diff = 14 - rashi_diff
    is_bhakoot_inauspicious = (
        (rashi_diff in (2, 12) and alt_diff in (2, 12)) or
        (rashi_diff in (6, 8) and alt_diff in (6, 8)) or
        (rashi_diff in (5, 9) and alt_diff in (5, 9) and lord1 != lord2)
    )
    is_bhakoot_cancelled = is_bhakoot_inauspicious and (lord1 == lord2 or graha_points >= 4.0)

    bhakoot_points = 7.0 if (not is_bhakoot_inauspicious or is_bhakoot_cancelled) else 0.0

    bhakoot_koota = {
        "id": "bhakoot",
        "name": "Bhakoot Koota",
        "sanskritName": "भकूट कूट",
        "maxPoints": 7.0,
        "maxScore": 7.0,
        "obtainedPoints": bhakoot_points,
        "score": bhakoot_points,
        "p1Value": f"{ZODIAC_SIGNS[rashi1_idx]['name']} ({rashi1_idx + 1})",
        "p2Value": f"{ZODIAC_SIGNS[rashi2_idx]['name']} ({rashi2_idx + 1})",
        "area": "Emotional Connection & Family Welfare",
        "description": "Governs marital longevity, joint financial accumulation, emotional flow, and progeny prosperity.",
        "verdict": "Excellent" if bhakoot_points == 7.0 else "Critical",
        "status": "good" if bhakoot_points == 7.0 else "critical",
        "details": (
            (
                "Bhakoot Dosha cancelled due to shared/friendly planetary lordship; auspicious family abundance."
                if is_bhakoot_cancelled
                else "Auspicious Rashi angular disposition; grants joy, family harmony, and sustained financial growth."
            )
            if bhakoot_points == 7.0
            else f"Challenging {rashi_diff}/{alt_diff} Rashi disposition (Bhakoot Dosha); requires joint charitable offerings and Shiva-Parvati worship."
        )
    }

    # 8. NADI KOOTA (Max 8 points)
    nadi1 = nak1["nadi"]
    nadi2 = nak2["nadi"]
    is_same_nadi = (nadi1 == nadi2)
    is_nadi_cancelled = is_same_nadi and (nak1["index"] != nak2["index"] or rashi1_idx != rashi2_idx)

    nadi_points = 8.0 if (not is_same_nadi or is_nadi_cancelled) else 0.0

    nadi_koota = {
        "id": "nadi",
        "name": "Nadi Koota",
        "sanskritName": "नाड़ी कूट",
        "maxPoints": 8.0,
        "maxScore": 8.0,
        "obtainedPoints": nadi_points,
        "score": nadi_points,
        "p1Value": f"{nadi1} Nadi",
        "p2Value": f"{nadi2} Nadi",
        "area": "Genetic Compatibility & Progeny Energy",
        "description": "Highest-weighted Koota; ensures genetic vitality, nervous-system resonance, and healthy progeny.",
        "verdict": "Excellent" if nadi_points == 8.0 else "Critical",
        "status": "good" if nadi_points == 8.0 else "critical",
        "details": (
            (
                "Same Nadi cancelled through auspicious nakshatra/rashi variance; ensures genetic vigor and vitality."
                if is_nadi_cancelled
                else "Different Nadis (Vata/Pitta/Kapha balance); ideal bio-magnetic sync and strong hereditary longevity."
            )
            if nadi_points == 8.0
            else f"Nadi Dosha detected ({nadi1} Nadi for both); recommended to perform Maha Mrityunjaya Japa & gold/cow charity."
        )
    }

    kootas = [
        varna_koota,
        vashya_koota,
        tara_koota,
        yoni_koota,
        graha_koota,
        gana_koota,
        bhakoot_koota,
        nadi_koota,
    ]

    ashta_koota_dict = {
        "varna": {"score": varna_points, "maxScore": 1.0, "obtainedPoints": varna_points, "maxPoints": 1.0},
        "vashya": {"score": vashya_points, "maxScore": 2.0, "obtainedPoints": vashya_points, "maxPoints": 2.0},
        "tara": {"score": tara_points, "maxScore": 3.0, "obtainedPoints": tara_points, "maxPoints": 3.0},
        "yoni": {"score": yoni_points, "maxScore": 4.0, "obtainedPoints": yoni_points, "maxPoints": 4.0},
        "grahaMaitri": {"score": graha_points, "maxScore": 5.0, "obtainedPoints": graha_points, "maxPoints": 5.0},
        "gana": {"score": gana_points, "maxScore": 6.0, "obtainedPoints": gana_points, "maxPoints": 6.0},
        "bhakoot": {"score": bhakoot_points, "maxScore": 7.0, "obtainedPoints": bhakoot_points, "maxPoints": 7.0},
        "nadi": {"score": nadi_points, "maxScore": 8.0, "obtainedPoints": nadi_points, "maxPoints": 8.0},
    }

    total_score = sum(k["obtainedPoints"] for k in kootas)
    max_score = 36.0

    return kootas, ashta_koota_dict, total_score, max_score


# ============================================================
# DYNAMIC MANGLIK (KUJA DOSHA) ANALYSIS
# ============================================================

def calculate_manglik_dosha(chart1: dict, chart2: dict) -> dict:
    mars1 = chart1["planetsById"].get("mars") or chart1["planets"][2]
    mars2 = chart2["planetsById"].get("mars") or chart2["planets"][2]

    p1 = chart1["partner"]
    p2 = chart2["partner"]

    manglik_houses = (1, 2, 4, 7, 8, 12)
    is_p1_manglik = mars1["house"] in manglik_houses
    is_p2_manglik = mars2["house"] in manglik_houses

    p1_severity = "None"
    if is_p1_manglik:
        p1_severity = "High (Purna Manglik)" if mars1["house"] in (7, 8) else "Moderate"

    p2_severity = "None"
    if is_p2_manglik:
        p2_severity = "High (Purna Manglik)" if mars2["house"] in (7, 8) else "Moderate"

    p1_cancelled = is_p1_manglik and mars1["signName"] in ("Aries", "Scorpio", "Capricorn")
    p2_cancelled = is_p2_manglik and mars2["signName"] in ("Aries", "Scorpio", "Capricorn")

    is_neutralized = (is_p1_manglik and is_p2_manglik) or (not is_p1_manglik and not is_p2_manglik)

    if is_neutralized:
        if is_p1_manglik and is_p2_manglik:
            manglik_status = "Both Manglik (Neutralized)"
            verdict_text = "Both Partners Manglik (Perfect Mutual Neutralization)"
            explanation = "Kuja Dosha intensity is completely neutralized between both horoscopes, ensuring marital peace and vitality."
        else:
            manglik_status = "Both Non-Manglik"
            verdict_text = "Neither Partner Manglik (Clean Planetary Axis)"
            explanation = "Clean astrological axis with no Kuja Dosha constraints in either horoscope."
    elif is_p1_manglik:
        manglik_status = f"{p1['name']} Manglik"
        verdict_text = f"One Partner Manglik ({p1['name']})"
        explanation = f"{p1['name']} has active Kuja Dosha (Mars in house {mars1['house']}). Performing Kumbh Vivah or Hanuman Chalisa remedies ensures full protection."
    else:
        manglik_status = f"{p2['name']} Manglik"
        verdict_text = f"One Partner Manglik ({p2['name']})"
        explanation = f"{p2['name']} has active Kuja Dosha (Mars in house {mars2['house']}). Performing Kumbh Vivah or Hanuman Chalisa remedies ensures full protection."

    return {
        "partner1": {
            "name": p1["name"],
            "isManglik": is_p1_manglik,
            "severity": p1_severity,
            "marsHouse": mars1["house"],
            "cancellation": "Cancelled by Mars Own/Exalted Sign" if p1_cancelled else ("Active" if is_p1_manglik else "No Dosha")
        },
        "partner2": {
            "name": p2["name"],
            "isManglik": is_p2_manglik,
            "severity": p2_severity,
            "marsHouse": mars2["house"],
            "cancellation": "Cancelled by Mars Own/Exalted Sign" if p2_cancelled else ("Active" if is_p2_manglik else "No Dosha")
        },
        "status": manglik_status,
        "verdict": verdict_text,
        "isNeutralized": is_neutralized,
        "explanation": explanation
    }


# ============================================================
# COMPREHENSIVE KUNDLI MILAN CALCULATION
# ============================================================

def calculate_kundli_milan(partner1: dict, partner2: dict) -> dict:
    """
    Computes complete, authentic Ashta Koota Kundli Milan match report
    dynamically for two partners.
    """
    p1 = _normalize_partner(partner1)
    p2 = _normalize_partner(partner2)

    chart1 = generate_kundli(p1)
    chart2 = generate_kundli(p2)

    num1 = calculate_numerology(p1["name"], p1["dob"])
    num2 = calculate_numerology(p2["name"], p2["dob"])

    kootas, ashta_koota_dict, total_score, max_score = calculate_ashta_koota(chart1, chart2)
    manglik_analysis = calculate_manglik_dosha(chart1, chart2)

    percentage = round((total_score / max_score) * 100, 2)

    # Verdict Evaluation
    if total_score >= 28:
        verdict_title = "Uttam Milan • Highly Auspicious Match"
        verdict_color = "#C9A050"
        summary = f"Exceptional compatibility with {total_score:g}/36 Gunas ({percentage}%). This sacred union promises profound emotional resonance, marital bliss, financial prosperity, and mutual spiritual evolution."
    elif total_score >= 21:
        verdict_title = "Madhyam Shubh • Very Good Match"
        verdict_color = "#7EBC89"
        summary = f"Strong compatibility with {total_score:g}/36 Gunas ({percentage}%). The couple possesses high harmony across major life domains. Minor remedial recommendations ensure enduring companionship."
    elif total_score >= 18:
        verdict_title = "Samanya • Average Match (Recommended with Remedies)"
        verdict_color = "#E6A15C"
        summary = f"Acceptable compatibility with {total_score:g}/36 Gunas ({percentage}%). Crosses the classical 18-point threshold. Practicing suggested astrological remedies harmonizes specific difference areas."
    else:
        verdict_title = "Alpa Milan • Challenging Match (Strict Remedies Needed)"
        verdict_color = "#E06C75"
        summary = f"Compatibility score is {total_score:g}/36 Gunas ({percentage}%). While individual karmic bonds can overcome astrological scores, dedicated remedial pujas and mature communication are essential."

    # Moon sign indices
    moon1 = chart1["planetsById"].get("moon") or chart1["planets"][1]
    moon2 = chart2["planetsById"].get("moon") or chart2["planets"][1]
    r1_idx = moon1["signIndex"]
    r2_idx = moon2["signIndex"]

    # Elemental balance
    elem1 = ZODIAC_SIGNS[r1_idx]["element"]
    elem2 = ZODIAC_SIGNS[r2_idx]["element"]
    if elem1 == elem2:
        elem_score = 95
        elem_synergy = f"Twin {elem1} Connection (Deep Instinctual Kinship)"
    elif (elem1 == "Fire" and elem2 == "Air") or (elem1 == "Air" and elem2 == "Fire"):
        elem_score = 92
        elem_synergy = "Fire & Air (Inspirational, Creative & Expansive)"
    elif (elem1 == "Earth" and elem2 == "Water") or (elem1 == "Water" and elem2 == "Earth"):
        elem_score = 90
        elem_synergy = "Earth & Water (Grounded, Fertile & Emotionally Rich)"
    else:
        elem_score = 70
        elem_synergy = f"{elem1} & {elem2} Balance (Dynamic Growth Through Diversity)"

    elemental_balance = {
        "partner1Element": elem1,
        "partner2Element": elem2,
        "synergy": elem_synergy,
        "score": elem_score
    }

    # Western Synastry Aspects
    sun1 = chart1["planetsById"].get("sun") or chart1["planets"][0]
    sun2 = chart2["planetsById"].get("sun") or chart2["planets"][0]
    venus1 = chart1["planetsById"].get("venus") or chart1["planets"][5]
    venus2 = chart2["planetsById"].get("venus") or chart2["planets"][5]
    mars2 = chart2["planetsById"].get("mars") or chart2["planets"][2]

    synastry = [
        {
            "title": "Sun-Moon Core Synergy",
            "planets": f"{sun1['signName']} Sun ⚹ {moon2['signName']} Moon",
            "harmonyScore": min(98, int(70 + ashta_koota_dict['grahaMaitri']['score'] * 5)),
            "verdict": "Deep Soul Understanding",
            "description": "Ego consciousness aligns effortlessly with emotional vulnerability, creating a nurturing safe harbor."
        },
        {
            "title": "Venus-Mars Romantic Magnetism",
            "planets": f"{venus1['signName']} Venus ☌ {mars2['signName']} Mars",
            "harmonyScore": min(95, int(65 + ashta_koota_dict['yoni']['score'] * 7)),
            "verdict": "Passionate Vitality",
            "description": "Sensory appreciation and passionate devotion stimulate ongoing romantic sparks and mutual affection."
        },
        {
            "title": "Mercury-Jupiter Intellectual Growth",
            "planets": "Mercury ⚹ Jupiter Cross-Trine",
            "harmonyScore": 88,
            "verdict": "Philosophical Alignment",
            "description": "Enriches conversations, shared business acumen, collaborative investments, and travel aspirations."
        }
    ]

    # Numerology Milan
    mulank_diff = abs(num1["mulank"] - num2["mulank"])
    if num1["mulank"] == num2["mulank"]:
        num_score = 95
    elif mulank_diff in (1, 3, 5):
        num_score = 90
    elif mulank_diff in (2, 4):
        num_score = 75
    else:
        num_score = 80

    numerology_milan = {
        "partner1Mulank": num1["mulank"],
        "partner2Mulank": num2["mulank"],
        "partner1Bhagyank": num1["bhagyank"],
        "partner2Bhagyank": num2["bhagyank"],
        "harmonyScore": num_score,
        "description": f"Mulank {num1['mulank']} ({num1['mulankPlanet'].split('(')[0].strip()}) and Mulank {num2['mulank']} ({num2['mulankPlanet'].split('(')[0].strip()}) share an intuitive numerical frequency for cooperative success."
    }

    # Vedic Remedies
    remedies = [
        "Perform Joint Gauri-Shankar Puja on Shukla Paksha Mondays to invite divine marital grace.",
        "Chant the sacred Shukra Beej Mantra ('Om Shum Shukraya Namaha') for enduring romantic sweetness.",
        "Light a pure cow ghee lamp facing East during sunset on Thursdays for spiritual harmony and family prosperity.",
        "Wear a natural Rose Quartz or energize a Sphatik (Quartz) Shivling in the northeast corner of your home."
    ]

    if not manglik_analysis["isNeutralized"] and (manglik_analysis["partner1"]["isManglik"] or manglik_analysis["partner2"]["isManglik"]):
        remedies.insert(0, "Recite Hanuman Chalisa on Tuesdays and offer red flowers to neutralize Mars intensity.")

    if ashta_koota_dict["nadi"]["score"] == 0:
        remedies.insert(0, "Perform Maha Mrityunjaya Homa or donate food and warm blankets to the needy to pacify Nadi Dosha.")

    # Detailed report object
    report = {
        "partner1": p1,
        "partner2": p2,
        "partners": {
            "partner1": {
                "name": p1["name"],
                "dob": p1["dob"],
                "time": p1["time"],
                "place": p1["place"],
                "rashi": ZODIAC_SIGNS[r1_idx]["name"],
                "nakshatra": moon1["nakshatra"]
            },
            "partner2": {
                "name": p2["name"],
                "dob": p2["dob"],
                "time": p2["time"],
                "place": p2["place"],
                "rashi": ZODIAC_SIGNS[r2_idx]["name"],
                "nakshatra": moon2["nakshatra"]
            }
        },
        "calculatedAt": datetime.utcnow().isoformat(),
        "totalScore": total_score,
        "totalPoints": total_score,
        "maxScore": max_score,
        "maxPoints": max_score,
        "percentage": percentage,
        "verdictTitle": verdict_title,
        "verdictColor": verdict_color,
        "summary": {
            "totalScore": total_score,
            "maxScore": max_score,
            "percentage": percentage,
            "verdictTitle": verdict_title,
            "description": summary
        },
        "kootas": kootas,
        "ashtaKoota": ashta_koota_dict,
        "manglik": manglik_analysis,
        "synastry": synastry,
        "numerologyMilan": numerology_milan,
        "elementalBalance": elemental_balance,
        "remedies": remedies,
        "auspiciousMuhuratAdvice": "Auspicious wedding & partnership Muhurats are ideal during Shukla Paksha under Rohini, Uttara Phalguni, Uttara Ashadha, or Revati Nakshatras during Venus/Jupiter Hora."
    }

    return {
        "totalScore": total_score,
        "maxScore": max_score,
        "manglikStatus": manglik_analysis["status"],
        "report": report
    }


# ============================================================
# DATABASE HELPERS & ROW SERIALIZATION
# ============================================================

def _row_to_summary(row: dict) -> dict:
    return {
        "id": row["id"],
        "partner1Name": row["partner1_name"],
        "partner1BirthDate": row["partner1_birth_date"].isoformat() if hasattr(row["partner1_birth_date"], "isoformat") else str(row["partner1_birth_date"]),
        "partner2Name": row["partner2_name"],
        "partner2BirthDate": row["partner2_birth_date"].isoformat() if hasattr(row["partner2_birth_date"], "isoformat") else str(row["partner2_birth_date"]),
        "totalScore": float(row["total_score"]),
        "maxScore": float(row["max_score"]),
        "manglikStatus": row.get("manglik_status"),
        "createdAt": row["created_at"].isoformat() if hasattr(row.get("created_at"), "isoformat") else row.get("created_at"),
    }


def _row_to_full(row: dict) -> dict:
    summary = _row_to_summary(row)
    report_json = row.get("report_json")
    if isinstance(report_json, str):
        try:
            report_json = json.loads(report_json)
        except Exception:
            pass
    summary["report"] = report_json
    return summary


# ============================================================
# CONTROLLER ENDPOINTS
# ============================================================
def create_match_report(user_id: str):
    """
    Creates and persists a Kundli Milan match report.
    Accepts:
    1) Dynamic partner inputs (Nested):
       { "partner1": {...}, "partner2": {...} }
    2) Dynamic partner inputs (Flat):
       { "partner1Name": "...", "partner1BirthDate": "...", "partner1BirthTime": "...", "partner1BirthPlace": "...", ... }
    """
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        return _error("Request body must be valid JSON", "INVALID_JSON")

    partner1 = body.get("partner1")
    partner2 = body.get("partner2")
    report = body.get("report")

    # Construct partner objects from flat keys if nested objects aren't provided
    if not partner1:
        partner1 = {
            "name": body.get("partner1Name"),
            "dob": body.get("partner1BirthDate"),
            "time": body.get("partner1BirthTime") or "12:00:00",
            "place": body.get("partner1BirthPlace") or body.get("partner1Place") or "New Delhi, India",
        }
    if not partner2:
        partner2 = {
            "name": body.get("partner2Name"),
            "dob": body.get("partner2BirthDate"),
            "time": body.get("partner2BirthTime") or "12:00:00",
            "place": body.get("partner2BirthPlace") or body.get("partner2Place") or "New Delhi, India",
        }

    # If "report" is not sent, we FORCE dynamic computation (Mode 1)
    if not report:
        err1 = validate_partner(partner1, "partner1")
        if err1:
            return _error(err1, "VALIDATION_ERROR")

        err2 = validate_partner(partner2, "partner2")
        if err2:
            return _error(err2, "VALIDATION_ERROR")

        try:
            # Backend-এ ডায়নামিক কুন্ডলী মিলনের সমস্ত লজিক কল করা হচ্ছে
            calc_result = calculate_kundli_milan(partner1, partner2)
        except Exception as exc:
            return _error(f"Failed to calculate Kundli Milan: {exc}", "CALCULATION_ERROR", 500)

        total_score = float(calc_result["totalScore"])
        max_score = float(calc_result["maxScore"])
        manglik_status = calc_result["manglikStatus"]
        report = calc_result["report"]

        p1_norm = _normalize_partner(partner1)
        p2_norm = _normalize_partner(partner2)
        p1_name = p1_norm["name"]
        p1_dob = p1_norm["dob"]
        p2_name = p2_norm["name"]
        p2_dob = p2_norm["dob"]

    # Mode 2: Precomputed payload from frontend (if report was already provided)
    else:
        p1_name = body.get("partner1Name") or partner1.get("name")
        p1_dob = body.get("partner1BirthDate") or partner1.get("dob")
        p2_name = body.get("partner2Name") or partner2.get("name")
        p2_dob = body.get("partner2BirthDate") or partner2.get("dob")
        total_score_val = body.get("totalScore")

        required_missing = [
            field for field, val in [
                ("partner1Name", p1_name),
                ("partner1BirthDate", p1_dob),
                ("partner2Name", p2_name),
                ("partner2BirthDate", p2_dob),
                ("totalScore", total_score_val),
            ] if not val
        ]
        if required_missing or not isinstance(report, dict):
            return _error(f"Missing required field(s): {', '.join(required_missing) or 'report'}", "VALIDATION_ERROR")

        try:
            total_score = float(total_score_val)
            max_score = float(body.get("maxScore", 36.0))
        except (TypeError, ValueError):
            return _error("totalScore and maxScore must be numeric", "VALIDATION_ERROR")

        manglik_status = body.get("manglikStatus") or "Non-Manglik"

    # MySQL ডেটাবেসে রিপোর্ট সেভ করার লজিক
    report_id = str(uuid.uuid4())
    report_json_str = json.dumps(report, ensure_ascii=False)

    try:
        rows = call_procedure(
            "sp_create_match_report",
            [
                report_id,
                user_id,
                p1_name,
                p1_dob,
                p2_name,
                p2_dob,
                total_score,
                max_score,
                manglik_status,
                report_json_str
            ]
        )
    except Exception as exc:
        return _error(f"Database error while saving report: {exc}", "DATABASE_ERROR", 500)

    if not rows:
        return _error("Could not save match report", "SAVE_FAILED", 500)

    return jsonify({
        "status": "success",
        "message": "Kundli Milan report generated and saved successfully",
        "data": _row_to_full(rows[0])
    }), 201

def list_match_reports(user_id: str):
    """Lists saved matchmaking reports for the current user."""
    try:
        rows = call_procedure("sp_get_match_reports", [user_id])
        return jsonify({
            "status": "success",
            "data": [_row_to_summary(r) for r in rows]
        })
    except Exception as exc:
        return _error(f"Database error while fetching reports: {exc}", "DATABASE_ERROR", 500)


def get_match_report(user_id: str, report_id: str):
    """Retrieves full matchmaking report details by ID."""
    try:
        rows = call_procedure("sp_get_match_report", [report_id, user_id])
        if not rows:
            return _error("Match report not found", "NOT_FOUND", 404)

        return jsonify({
            "status": "success",
            "data": _row_to_full(rows[0])
        })
    except Exception as exc:
        return _error(f"Database error while fetching report: {exc}", "DATABASE_ERROR", 500)


def download_match_report_pdf(user_id: str, report_id: str):
    """Generates and downloads PDF Kundli Milan match report."""
    try:
        rows = call_procedure("sp_get_match_report", [report_id, user_id])
        if not rows:
            return _error("Match report not found", "NOT_FOUND", 404)

        row = dict(rows[0])
        report_json = row.get("report_json")
        if isinstance(report_json, str):
            try:
                report_json = json.loads(report_json)
            except Exception:
                pass
        row["report_json"] = report_json

        pdf_bytes = generate_match_report_pdf(row)
        filename = f"jyotishveda-kundli-milan-{report_id[:8]}.pdf"
        return Response(
            pdf_bytes,
            mimetype="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except Exception as exc:
        return _error(f"Error generating PDF: {exc}", "PDF_ERROR", 500)