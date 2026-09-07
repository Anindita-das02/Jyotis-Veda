import json
import math
import re
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional, Tuple, List
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from geopy.geocoders import Nominatim
from timezonefinder import TimezoneFinder

import swisseph as swe
from flask import request, jsonify, Response

from database.db_connection import call_procedure
from services.report_service import generate_match_report_pdf
from services.llm_extractor1 import get_ai_response


# ============================================================
# ASTROLOGICAL REFERENCE DATA
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
    {"name": "Capricorn", "sanskrit": "Makara (मকর)", "lord": "Saturn", "element": "Earth", "symbol": "♑"},
    {"name": "Aquarius", "sanskrit": "Kumbha (कुम्भ)", "lord": "Saturn", "element": "Air", "symbol": "♒"},
    {"name": "Pisces", "sanskrit": "Meena (मीन)", "lord": "Jupiter", "element": "Water", "symbol": "♓"},
]

# Exact 27 Nakshatras, each 13°20′.
NAKSHATRAS = [
    {"name": "Ashwini", "lord": "Ketu", "deity": "Ashwini Kumaras"},
    {"name": "Bharani", "lord": "Venus", "deity": "Yama"},
    {"name": "Krittika", "lord": "Sun", "deity": "Agni"},
    {"name": "Rohini", "lord": "Moon", "deity": "Prajapati"},
    {"name": "Mrigashira", "lord": "Mars", "deity": "Soma"},
    {"name": "Ardra", "lord": "Rahu", "deity": "Rudra"},
    {"name": "Punarvasu", "lord": "Jupiter", "deity": "Aditi"},
    {"name": "Pushya", "lord": "Saturn", "deity": "Brihaspati"},
    {"name": "Ashlesha", "lord": "Mercury", "deity": "Nagas"},
    {"name": "Magha", "lord": "Ketu", "deity": "Pitris"},
    {"name": "Purva Phalguni", "lord": "Venus", "deity": "Bhaga"},
    {"name": "Uttara Phalguni", "lord": "Sun", "deity": "Aryaman"},
    {"name": "Hasta", "lord": "Moon", "deity": "Savitr"},
    {"name": "Chitra", "lord": "Mars", "deity": "Vishvakarma"},
    {"name": "Swati", "lord": "Rahu", "deity": "Vayu"},
    {"name": "Vishakha", "lord": "Jupiter", "deity": "Indra-Agni"},
    {"name": "Anuradha", "lord": "Saturn", "deity": "Mitra"},
    {"name": "Jyeshtha", "lord": "Mercury", "deity": "Indra"},
    {"name": "Mula", "lord": "Ketu", "deity": "Nirriti"},
    {"name": "Purva Ashadha", "lord": "Venus", "deity": "Apas"},
    {"name": "Uttara Ashadha", "lord": "Sun", "deity": "Vishvedevas"},
    {"name": "Shravana", "lord": "Moon", "deity": "Vishnu"},
    {"name": "Dhanishta", "lord": "Mars", "deity": "Vasus"},
    {"name": "Shatabhisha", "lord": "Rahu", "deity": "Varuna"},
    {"name": "Purva Bhadrapada", "lord": "Jupiter", "deity": "Aja Ekapada"},
    {"name": "Uttara Bhadrapada", "lord": "Saturn", "deity": "Ahirbudhnya"},
    {"name": "Revati", "lord": "Mercury", "deity": "Pushan"},
]

# Gana / Yoni / Nadi tables are fixed traditional reference data.
NAKSHATRA_ATTRIBUTES = {
    "Ashwini": {"index": 0, "gana": "Deva", "yoni": "Horse", "nadi": "Adi"},
    "Bharani": {"index": 1, "gana": "Manushya", "yoni": "Elephant", "nadi": "Madhya"},
    "Krittika": {"index": 2, "gana": "Rakshasa", "yoni": "Sheep", "nadi": "Antya"},
    "Rohini": {"index": 3, "gana": "Manushya", "yoni": "Serpent", "nadi": "Antya"},
    "Mrigashira": {"index": 4, "gana": "Deva", "yoni": "Serpent", "nadi": "Madhya"},
    "Ardra": {"index": 5, "gana": "Manushya", "yoni": "Dog", "nadi": "Adi"},
    "Punarvasu": {"index": 6, "gana": "Deva", "yoni": "Cat", "nadi": "Adi"},
    "Pushya": {"index": 7, "gana": "Deva", "yoni": "Sheep", "nadi": "Madhya"},
    "Ashlesha": {"index": 8, "gana": "Rakshasa", "yoni": "Cat", "nadi": "Antya"},
    "Magha": {"index": 9, "gana": "Rakshasa", "yoni": "Rat", "nadi": "Antya"},
    "Purva Phalguni": {"index": 10, "gana": "Manushya", "yoni": "Rat", "nadi": "Madhya"},
    "Uttara Phalguni": {"index": 11, "gana": "Manushya", "yoni": "Cow", "nadi": "Adi"},
    "Hasta": {"index": 12, "gana": "Deva", "yoni": "Buffalo", "nadi": "Adi"},
    "Chitra": {"index": 13, "gana": "Rakshasa", "yoni": "Tiger", "nadi": "Madhya"},
    "Swati": {"index": 14, "gana": "Deva", "yoni": "Buffalo", "nadi": "Antya"},
    "Vishakha": {"index": 15, "gana": "Rakshasa", "yoni": "Tiger", "nadi": "Antya"},
    "Anuradha": {"index": 16, "gana": "Deva", "yoni": "Deer", "nadi": "Madhya"},
    "Jyeshtha": {"index": 17, "gana": "Rakshasa", "yoni": "Deer", "nadi": "Adi"},
    "Mula": {"index": 18, "gana": "Rakshasa", "yoni": "Dog", "nadi": "Adi"},
    "Purva Ashadha": {"index": 19, "gana": "Manushya", "yoni": "Monkey", "nadi": "Madhya"},
    "Uttara Ashadha": {"index": 20, "gana": "Manushya", "yoni": "Mongoose", "nadi": "Antya"},
    "Shravana": {"index": 21, "gana": "Deva", "yoni": "Monkey", "nadi": "Antya"},
    "Dhanishta": {"index": 22, "gana": "Rakshasa", "yoni": "Lion", "nadi": "Madhya"},
    "Shatabhisha": {"index": 23, "gana": "Rakshasa", "yoni": "Horse", "nadi": "Adi"},
    "Purva Bhadrapada": {"index": 24, "gana": "Manushya", "yoni": "Lion", "nadi": "Adi"},
    "Uttara Bhadrapada": {"index": 25, "gana": "Manushya", "yoni": "Cow", "nadi": "Madhya"},
    "Revati": {"index": 26, "gana": "Deva", "yoni": "Elephant", "nadi": "Antya"},
}

# Traditional yoni enemy pairs.
YONI_ENEMIES = {
    frozenset(("Horse", "Buffalo")),
    frozenset(("Elephant", "Lion")),
    frozenset(("Sheep", "Monkey")),
    frozenset(("Serpent", "Mongoose")),
    frozenset(("Dog", "Deer")),
    frozenset(("Cat", "Rat")),
    frozenset(("Cow", "Tiger")),
}

# Common standard Yoni friendship pairs. Unlisted non-enemy pairs receive 2.
YONI_FRIENDS = {
    frozenset(("Horse", "Horse")),
    frozenset(("Elephant", "Elephant")),
    frozenset(("Sheep", "Sheep")),
    frozenset(("Serpent", "Serpent")),
    frozenset(("Dog", "Dog")),
    frozenset(("Cat", "Cat")),
    frozenset(("Rat", "Rat")),
    frozenset(("Cow", "Cow")),
    frozenset(("Tiger", "Tiger")),
    frozenset(("Deer", "Deer")),
    frozenset(("Monkey", "Monkey")),
    frozenset(("Buffalo", "Buffalo")),
    frozenset(("Lion", "Lion")),
    frozenset(("Mongoose", "Mongoose")),
    # Frequently used friendly combinations.
    frozenset(("Horse", "Sheep")),
    frozenset(("Horse", "Monkey")),
    frozenset(("Elephant", "Sheep")),
    frozenset(("Elephant", "Buffalo")),
    frozenset(("Cow", "Buffalo")),
    frozenset(("Deer", "Monkey")),
    frozenset(("Dog", "Monkey")),
    frozenset(("Cat", "Monkey")),
    frozenset(("Rat", "Monkey")),
    frozenset(("Lion", "Monkey")),
}

# Natural planetary relationships used by Graha Maitri.
GRAHA_REL = {
    "Sun": {"friends": {"Moon", "Mars", "Jupiter"}, "neutral": {"Mercury"}, "enemies": {"Venus", "Saturn"}},
    "Moon": {"friends": {"Sun", "Mercury"}, "neutral": {"Mars", "Jupiter", "Venus", "Saturn"}, "enemies": set()},
    "Mars": {"friends": {"Sun", "Moon", "Jupiter"}, "neutral": {"Venus", "Saturn"}, "enemies": {"Mercury"}},
    "Mercury": {"friends": {"Sun", "Venus"}, "neutral": {"Mars", "Jupiter", "Saturn"}, "enemies": {"Moon"}},
    "Jupiter": {"friends": {"Sun", "Moon", "Mars"}, "neutral": {"Saturn"}, "enemies": {"Mercury", "Venus"}},
    "Venus": {"friends": {"Mercury", "Saturn"}, "neutral": {"Mars", "Jupiter"}, "enemies": {"Sun", "Moon"}},
    "Saturn": {"friends": {"Mercury", "Venus"}, "neutral": {"Jupiter"}, "enemies": {"Sun", "Moon", "Mars"}},
}

PLANET_IDS = {
    "sun": swe.SUN,
    "moon": swe.MOON,
    "mars": swe.MARS,
    "mercury": swe.MERCURY,
    "jupiter": swe.JUPITER,
    "venus": swe.VENUS,
    "saturn": swe.SATURN,
    "rahu": swe.TRUE_NODE,
}

PLANET_META = {
    "sun": ("Sun", "Surya (सूर्य)", "☉"),
    "moon": ("Moon", "Chandra (चन्द्र)", "☽"),
    "mars": ("Mars", "Mangal (मंगल)", "♂"),
    "mercury": ("Mercury", "Budha (बुध)", "☿"),
    "jupiter": ("Jupiter", "Guru (गुरु)", "♃"),
    "venus": ("Venus", "Shukra (शुक्र)", "♀"),
    "saturn": ("Saturn", "Shani (शनि)", "♄"),
    "rahu": ("Rahu", "Rahu (राहु)", "☊"),
    "ketu": ("Ketu", "Ketu (केतु)", "☋"),
}

_geolocator = Nominatim(user_agent="jyotishveda-kundli/1.0")
_timezone_finder = TimezoneFinder()


def resolve_birth_place(place: str) -> dict:
    """Resolve human-readable birthplace to coordinates + IANA timezone."""
    place = str(place or "").strip()
    if not place:
        raise ValueError("birth place is required")

    location = _geolocator.geocode(
        place, exactly_one=True, addressdetails=True, language="en", timeout=10
    )
    if location is None:
        raise ValueError(f"Could not resolve birth place: {place}")

    lat = float(location.latitude)
    lon = float(location.longitude)
    _validate_lat_lon(lat, lon)

    tz_name = _timezone_finder.timezone_at(lat=lat, lng=lon)
    if not tz_name:
        raise ValueError(f"Could not determine timezone for birth place: {place}")
    try:
        ZoneInfo(tz_name)
    except ZoneInfoNotFoundError:
        raise ValueError(f"Invalid timezone resolved for birth place: {tz_name}")

    return {
        "latitude": lat,
        "longitude": lon,
        "timezone": tz_name,
        "resolvedPlace": getattr(location, "address", None) or place,
    }


def prepare_partner(partner: dict) -> dict:
    """Accept only name/date/time/place from the client and enrich location internally."""
    if not isinstance(partner, dict):
        raise ValueError("partner must be a JSON object")
    q = dict(partner)
    if not q.get("name"):
        q["name"] = q.get("fullName")
    if not q.get("dob"):
        q["dob"] = q.get("birthDate")
    if not q.get("time"):
        q["time"] = q.get("birthTime")
    if not q.get("place"):
        q["place"] = q.get("birthPlace")

    if q.get("latitude") is None or q.get("longitude") is None or not q.get("timezone"):
        q.update(resolve_birth_place(q.get("place")))
    return q


# ============================================================
# BASIC HELPERS
# ============================================================

def _error(message: str, code: str, http_status: int = 400):
    return jsonify({"status": "error", "message": message, "error_code": code}), http_status


def _norm360(x: float) -> float:
    return x % 360.0


def _format_dms(deg: float) -> str:
    deg = deg % 30.0
    d = int(deg)
    minutes_float = (deg - d) * 60
    m = int(minutes_float)
    s = round((minutes_float - m) * 60, 1)
    return f"{d}° {m}′ {s}″"


def _reduce_to_single_digit(num: int, keep_masters: bool = False) -> int:
    if keep_masters and num in (11, 22, 33):
        return num
    while num > 9:
        num = sum(int(d) for d in str(abs(num)))
    return num


def _get_varna(rashi_idx: int) -> Dict[str, Any]:
    # Standard Rashi varna grouping.
    if rashi_idx in (3, 7, 11):
        return {"name": "Brahmin", "rank": 4}
    if rashi_idx in (0, 4, 8):
        return {"name": "Kshatriya", "rank": 3}
    if rashi_idx in (1, 5, 9):
        return {"name": "Vaishya", "rank": 2}
    return {"name": "Shudra", "rank": 1}


def _vashya_class(rashi_idx: int) -> str:
    """
    Conventional Rashi Vashya animal/human classes.

    Note: Sagittarius is conventionally split by degree (first half
    human, second half quadruped), so a sign-only classifier cannot be
    perfectly accurate for Vashya. The detailed scorer below therefore
    accepts the Moon/Lagna longitude when available.
    """
    classes = {
        0: "Chatushpada",   # Aries
        1: "Chatushpada",   # Taurus
        2: "Manava",        # Gemini
        3: "Jalachara",     # Cancer
        4: "Vanachara",     # Leo
        5: "Manava",        # Virgo
        6: "Manava",        # Libra
        7: "Keeta",         # Scorpio
        8: "Chatushpada",   # Sagittarius (degree split handled separately)
        9: "Chatushpada",   # Capricorn
        10: "Manava",       # Aquarius
        11: "Jalachara",    # Pisces
    }
    return classes[rashi_idx]


def _vashya_class_from_longitude(longitude: float) -> str:
    """Return the conventional Vashya class, including Sagittarius split."""
    lon = _norm360(longitude)
    sign = int(lon // 30)
    deg = lon % 30
    if sign == 8 and deg < 15.0:
        return "Manava"
    if sign == 8 and deg >= 15.0:
        return "Chatushpada"
    return _vashya_class(sign)


def _validate_lat_lon(lat: float, lon: float):
    if not -90 <= lat <= 90:
        raise ValueError("latitude must be between -90 and 90")
    if not -180 <= lon <= 180:
        raise ValueError("longitude must be between -180 and 180")


def _local_to_utc_jd(local_dt: datetime, timezone_name: str) -> Tuple[datetime, float]:
    """Convert local civil time in an IANA timezone to UTC/JD(UT).

    The conversion is intentionally timezone-database based rather than a
    fixed numeric offset, because historical DST/offset changes matter.
    For an ambiguous DST clock time, ``fold=0`` is used unless the caller
    supplies a datetime with ``fold=1``. Non-existent local times are rejected.
    """
    try:
        tz = ZoneInfo(timezone_name)
    except ZoneInfoNotFoundError as exc:
        raise ValueError(f"Invalid IANA timezone: {timezone_name}") from exc

    if local_dt.tzinfo is None:
        aware = local_dt.replace(tzinfo=tz, fold=getattr(local_dt, "fold", 0))
    else:
        aware = local_dt.astimezone(tz)

    # Round-trip through UTC. If it does not reproduce the same local clock,
    # the supplied local time falls inside a DST gap and is not a real instant.
    utc_dt = aware.astimezone(timezone.utc)
    roundtrip = utc_dt.astimezone(tz)
    if roundtrip.replace(tzinfo=None) != local_dt.replace(tzinfo=None):
        raise ValueError(
            f"Birth time {local_dt.isoformat()} does not exist in timezone {timezone_name}"
        )

    hour_decimal = (
        utc_dt.hour
        + utc_dt.minute / 60.0
        + utc_dt.second / 3600.0
        + utc_dt.microsecond / 3_600_000_000.0
    )
    jd = swe.julday(utc_dt.year, utc_dt.month, utc_dt.day, hour_decimal, swe.GREG_CAL)
    return utc_dt, jd


def _parse_local_birth_datetime(date_str: str, time_str: str, tz_name: str) -> Tuple[datetime, float]:
    time_str = time_str.strip()
    if len(time_str) == 5:
        time_str += ":00"

    try:
        local_naive = datetime.strptime(
            f"{date_str.strip()} {time_str}", "%Y-%m-%d %H:%M:%S"
        )
    except ValueError as exc:
        raise ValueError("birth date/time must be YYYY-MM-DD and HH:MM[:SS]") from exc

    return _local_to_utc_jd(local_naive, tz_name)


def _nakshatra_from_longitude(sidereal_longitude: float) -> Dict[str, Any]:
    span = 360.0 / 27.0
    pada_span = span / 4.0
    idx = min(26, int(_norm360(sidereal_longitude) / span))
    within = _norm360(sidereal_longitude) - idx * span
    pada = min(4, int(within / pada_span) + 1)

    n = NAKSHATRAS[idx]
    return {
        "index": idx,
        "name": n["name"],
        "lord": n["lord"],
        "deity": n["deity"],
        "pada": pada,
        "degreesInNakshatra": round(within, 6),
    }


def _planet_object(pid: str, lon: float, speed: float, house: int) -> Dict[str, Any]:
    sign_idx = int(_norm360(lon) // 30)
    deg_in_sign = _norm360(lon) % 30.0
    nak = _nakshatra_from_longitude(lon)
    name, sanskrit, symbol = PLANET_META[pid]

    return {
        "id": pid,
        "name": name,
        "sanskritName": sanskrit,
        "symbol": symbol,
        "signIndex": sign_idx,
        "signName": ZODIAC_SIGNS[sign_idx]["name"],
        "signSanskrit": ZODIAC_SIGNS[sign_idx]["sanskrit"],
        "degree": round(deg_in_sign, 6),
        "degreeDMS": _format_dms(deg_in_sign),
        "totalDegree": round(_norm360(lon), 6),
        "longitudeSidereal": round(_norm360(lon), 6),
        "speedLongitude": round(speed, 8),
        "retrograde": speed < 0,
        "house": int(house),
        "nakshatra": nak["name"],
        "nakshatraLord": nak["lord"],
        "nakshatraDeity": nak["deity"],
        "pada": nak["pada"],
    }


# ============================================================
# VALIDATION / NORMALIZATION
# ============================================================

def validate_partner(partner: Any, partner_name: str = "partner") -> Optional[str]:
    if not isinstance(partner, dict):
        return f"{partner_name} must be a JSON object"

    name = partner.get("name") or partner.get("fullName")
    dob = partner.get("dob") or partner.get("birthDate")
    time_val = partner.get("time") or partner.get("birthTime")
    place = partner.get("place") or partner.get("birthPlace")

    missing = []
    if not str(name or "").strip():
        missing.append("name/fullName")
    if not str(dob or "").strip():
        missing.append("dob/birthDate")
    if not str(time_val or "").strip():
        missing.append("time/birthTime")
    if not str(place or "").strip():
        missing.append("place/birthPlace")

    if missing:
        return f"{partner_name} missing field(s): " + ", ".join(missing)

    try:
        datetime.strptime(str(dob).strip(), "%Y-%m-%d")
    except ValueError:
        return f"{partner_name} DOB must be in YYYY-MM-DD format"

    try:
        t = str(time_val).strip()
        if len(t) == 5:
            datetime.strptime(t, "%H:%M")
        else:
            datetime.strptime(t, "%H:%M:%S")
    except ValueError:
        return f"{partner_name} time must be in HH:MM:SS or HH:MM format"

    try:
        float(partner.get("latitude"))
        float(partner.get("longitude"))
    except (TypeError, ValueError):
        return f"{partner_name} must contain numeric latitude and longitude"

    tz_name = partner.get("timezone") or partner.get("timeZone")
    if not isinstance(tz_name, str) or "/" not in tz_name:
        return (
            f"{partner_name} timezone must be an IANA timezone such as "
            f"'Asia/Kolkata' (do not use a fixed 5.5 offset for historical accuracy)"
        )

    try:
        ZoneInfo(tz_name)
    except Exception:
        return f"{partner_name} has invalid IANA timezone: {tz_name}"

    try:
        _validate_lat_lon(float(partner["latitude"]), float(partner["longitude"]))
    except ValueError as exc:
        return f"{partner_name}: {exc}"

    house_system = str(partner.get("houseSystem") or partner.get("house_system") or "W").upper()
    if len(house_system) != 1 or not house_system.isalpha():
        return f"{partner_name} houseSystem must be a single Swiss Ephemeris code"

    node_type = str(partner.get("nodeType") or partner.get("node_type") or "true").lower()
    if node_type not in {"true", "mean"}:
        return f"{partner_name} nodeType must be 'true' or 'mean'"

    return None


def _normalize_partner(p: dict) -> dict:
    """
    Unlike the old implementation, this does NOT silently invent Delhi,
    12:00, or an arbitrary timezone. Missing astronomical inputs remain errors.
    """
    tz_name = p.get("timezone") or p.get("timeZone")

    return {
        "id": p.get("id") or str(uuid.uuid4()),
        "name": str(p.get("name") or p.get("fullName") or "").strip(),
        "fullName": str(p.get("name") or p.get("fullName") or "").strip(),
        "dob": str(p.get("dob") or p.get("birthDate") or "").strip(),
        "birthDate": str(p.get("dob") or p.get("birthDate") or "").strip(),
        "time": str(p.get("time") or p.get("birthTime") or "").strip(),
        "birthTime": str(p.get("time") or p.get("birthTime") or "").strip(),
        "place": str(p.get("place") or p.get("birthPlace") or "").strip(),
        "birthPlace": str(p.get("place") or p.get("birthPlace") or "").strip(),
        "latitude": float(p["latitude"]),
        "longitude": float(p["longitude"]),
        "timezone": tz_name,
        "horoscopeSystem": p.get("horoscopeSystem", "vedic"),
        "houseSystem": p.get("houseSystem") or p.get("house_system") or "W",
        "nodeType": p.get("nodeType") or p.get("node_type") or "true",
    }


# ============================================================
# ASTRONOMICAL KUNDLI
# ============================================================

def generate_kundli(partner: dict) -> dict:
    """
    Calculate a sidereal Vedic-style natal chart with Swiss Ephemeris.

    Defaults:
      * Lahiri ayanamsha
      * geocentric positions
      * True lunar node (Rahu); Ketu is exactly opposite Rahu
      * Whole-sign houses (traditional Vedic-style default)

    ``houseSystem`` may be ``"W"`` for Whole Sign or ``"P"`` for Placidus
    (or another Swiss Ephemeris house-system code supported by your build).
    ``nodeType`` may be ``"true"`` or ``"mean"``.
    """
    p = _normalize_partner(partner)
    lat = p["latitude"]
    lon = p["longitude"]
    _validate_lat_lon(lat, lon)

    _, jd_ut = _parse_local_birth_datetime(p["dob"], p["time"], p["timezone"])

    swe.set_sid_mode(swe.SIDM_LAHIRI)

    house_system = str(p.get("houseSystem") or p.get("house_system") or "W").upper()
    if len(house_system) != 1:
        raise ValueError("houseSystem must be a single Swiss Ephemeris house-system code")

    node_type = str(p.get("nodeType") or p.get("node_type") or "true").lower()
    if node_type not in {"true", "mean"}:
        raise ValueError("nodeType must be 'true' or 'mean'")

    flags = swe.FLG_SWIEPH | swe.FLG_SPEED | swe.FLG_SIDEREAL

    try:
        houses, ascmc = swe.houses_ex(
            jd_ut, lat, lon, house_system.encode("ascii"), swe.FLG_SIDEREAL
        )
    except Exception as exc:
        raise ValueError(
            f"Swiss Ephemeris house calculation failed for houseSystem={house_system}: {exc}"
        ) from exc

    asc_sid = _norm360(float(ascmc[0]))
    asc_sign_idx = int(asc_sid // 30)
    asc_nak = _nakshatra_from_longitude(asc_sid)

    node_swe_id = swe.TRUE_NODE if node_type == "true" else swe.MEAN_NODE
    planet_ids = dict(PLANET_IDS)
    planet_ids["rahu"] = node_swe_id

    calculated_planets = []
    planets_by_id = {}

    for pid, swe_id in planet_ids.items():
        try:
            xx, retflag = swe.calc_ut(jd_ut, swe_id, flags)
        except Exception as exc:
            raise ValueError(f"Swiss Ephemeris failed for {pid}: {exc}") from exc
        if not xx or len(xx) < 4:
            raise ValueError(f"Swiss Ephemeris returned invalid data for {pid}")

        sid_lon = _norm360(float(xx[0]))
        speed = float(xx[3])
        house = _house_from_cusps(sid_lon, houses)
        obj = _planet_object(pid, sid_lon, speed, house)
        obj["ephemerisReturnFlag"] = int(retflag)
        calculated_planets.append(obj)
        planets_by_id[pid] = obj

    rahu = planets_by_id["rahu"]
    ketu_lon = _norm360(rahu["totalDegree"] + 180.0)
    ketu_house = _house_from_cusps(ketu_lon, houses)
    ketu = _planet_object("ketu", ketu_lon, -rahu["speedLongitude"], ketu_house)
    ketu["ephemerisReturnFlag"] = rahu.get("ephemerisReturnFlag", 0)
    planets_by_id["ketu"] = ketu
    calculated_planets.append(ketu)

    house_cusps = []
    for i, cusp in enumerate(houses, start=1):
        c = _norm360(float(cusp))
        house_cusps.append({
            "house": i,
            "longitudeSidereal": round(c, 6),
            "signIndex": int(c // 30),
            "signName": ZODIAC_SIGNS[int(c // 30)]["name"],
            "degree": round(c % 30, 6),
        })

    return {
        "calculation": {
            "engine": "Swiss Ephemeris / pyswisseph",
            "zodiac": "Sidereal",
            "ayanamsha": "Lahiri",
            "ephemerisFlags": flags,
            "julianDayUT": jd_ut,
            "latitude": lat,
            "longitude": lon,
            "timezone": p["timezone"],
            "houseSystem": house_system,
            "nodeType": node_type,
            "coordinateFrame": "Geocentric",
        },
        "ascendant": {
            "longitudeSidereal": round(asc_sid, 6),
            "signIndex": asc_sign_idx,
            "degree": round(asc_sid % 30, 6),
            "degreeDMS": _format_dms(asc_sid),
            "signName": ZODIAC_SIGNS[asc_sign_idx]["name"],
            "signSanskrit": ZODIAC_SIGNS[asc_sign_idx]["sanskrit"],
            "nakshatra": asc_nak["name"],
            "nakshatraLord": asc_nak["lord"],
            "pada": asc_nak["pada"],
        },
        "houseCusps": house_cusps,
        "planets": calculated_planets,
        "planetsById": planets_by_id,
        "partner": p,
    }


def _house_from_cusps(longitude: float, cusps) -> int:
    """
    Find the house in a circular list of 12 cusps.
    """
    lon = _norm360(longitude)
    c = [_norm360(float(x)) for x in cusps]

    for i in range(12):
        start = c[i]
        end = c[(i + 1) % 12]

        if start <= end:
            inside = start <= lon < end
        else:
            inside = lon >= start or lon < end

        if inside:
            return i + 1

    return 12


# ============================================================
# NUMEROLOGY – OPTIONAL, NOT PART OF ASHTA KOOTA
# ============================================================

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


def calculate_numerology(name: str, dob_str: str) -> dict:
    day = int(dob_str.split("-")[2])
    mulank = _reduce_to_single_digit(day)
    bhagyank = _reduce_to_single_digit(sum(int(d) for d in dob_str if d.isdigit()))

    upper = name.upper()
    chaldean_sum = sum(CHALDEAN_VALUES.get(c, 0) for c in upper if c.isalpha())
    pythagorean_sum = sum(PYTHAGOREAN_VALUES.get(c, 0) for c in upper if c.isalpha())

    return {
        "mulank": mulank,
        "bhagyank": bhagyank,
        "namankChaldean": _reduce_to_single_digit(chaldean_sum),
        "namankPythagorean": _reduce_to_single_digit(pythagorean_sum),
    }


# ============================================================
# ASHTA KOOTA – 36 GUNA
# ============================================================

def _tara_points(nak1_idx: int, nak2_idx: int) -> Tuple[float, int, int]:
    # Count inclusive from each birth star; reduce modulo 9.
    t12 = ((nak2_idx - nak1_idx) % 27) + 1
    t21 = ((nak1_idx - nak2_idx) % 27) + 1

    tara1 = ((t12 - 1) % 9) + 1
    tara2 = ((t21 - 1) % 9) + 1

    good = {1, 2, 4, 6, 8, 9}
    score = (1.5 if tara1 in good else 0.0) + (1.5 if tara2 in good else 0.0)
    return score, tara1, tara2


def _yoni_score(y1: str, y2: str) -> float:
    pair = frozenset((y1, y2))
    if y1 == y2:
        return 4.0
    if pair in YONI_ENEMIES:
        return 0.0
    if pair in YONI_FRIENDS:
        return 3.0
    return 2.0


def _graha_maitri_score(lord1: str, lord2: str) -> float:
    if lord1 == lord2:
        return 5.0

    r1 = GRAHA_REL[lord1]
    r2 = GRAHA_REL[lord2]

    def rel(a, b):
        if b in GRAHA_REL[a]["friends"]:
            return "friend"
        if b in GRAHA_REL[a]["enemies"]:
            return "enemy"
        return "neutral"

    a = rel(lord1, lord2)
    b = rel(lord2, lord1)

    if a == "friend" and b == "friend":
        return 5.0
    if (a == "friend" and b == "neutral") or (a == "neutral" and b == "friend"):
        return 4.0
    if a == "neutral" and b == "neutral":
        return 3.0
    if (a == "enemy" and b == "neutral") or (a == "neutral" and b == "enemy"):
        return 1.0
    return 0.0


def _gana_score(g1: str, g2: str) -> float:
    if g1 == g2:
        return 6.0
    if {g1, g2} == {"Deva", "Manushya"}:
        return 5.0
    if {g1, g2} == {"Manushya", "Rakshasa"}:
        return 0.0
    return 1.0


def _vashya_score_from_classes(c1: str, c2: str) -> float:
    if c1 == c2:
        return 2.0
    cross = {
        frozenset(("Manava", "Chatushpada")): 1.0,
        frozenset(("Manava", "Jalachara")): 1.0,
        frozenset(("Manava", "Keeta")): 0.5,
        frozenset(("Manava", "Vanachara")): 1.0,
        frozenset(("Chatushpada", "Jalachara")): 0.5,
        frozenset(("Chatushpada", "Keeta")): 0.0,
        frozenset(("Chatushpada", "Vanachara")): 1.0,
        frozenset(("Jalachara", "Keeta")): 1.0,
        frozenset(("Jalachara", "Vanachara")): 0.0,
        frozenset(("Keeta", "Vanachara")): 0.0,
    }
    return cross.get(frozenset((c1, c2)), 0.0)


def _vashya_score(r1: int, r2: int, lon1: float | None = None, lon2: float | None = None) -> float:
    c1 = _vashya_class_from_longitude(lon1) if lon1 is not None else _vashya_class(r1)
    c2 = _vashya_class_from_longitude(lon2) if lon2 is not None else _vashya_class(r2)
    return _vashya_score_from_classes(c1, c2)


def _bhakoot_relation(r1: int, r2: int) -> str:
    """Return the conventional Rashi relation label."""
    d = (r2 - r1) % 12
    labels = {
        0: "1/1",
        1: "2/12", 11: "2/12",
        2: "3/11", 10: "3/11",
        3: "4/10", 9: "4/10",
        4: "5/9", 8: "5/9",
        5: "6/8", 7: "6/8",
        6: "7/7",
    }
    return labels[d]


def calculate_ashta_koota(chart1: dict, chart2: dict) -> Tuple[List[dict], Dict[str, dict], float, float]:
    moon1 = chart1["planetsById"]["moon"]
    moon2 = chart2["planetsById"]["moon"]

    nak1 = NAKSHATRA_ATTRIBUTES[moon1["nakshatra"]]
    nak2 = NAKSHATRA_ATTRIBUTES[moon2["nakshatra"]]
    r1 = moon1["signIndex"]
    r2 = moon2["signIndex"]
    lord1 = ZODIAC_SIGNS[r1]["lord"]
    lord2 = ZODIAC_SIGNS[r2]["lord"]

    v1 = _get_varna(r1)
    v2 = _get_varna(r2)
    varna_score = 1.0 if v1["rank"] >= v2["rank"] else 0.0

    vashya_score = _vashya_score(
        r1, r2, moon1["longitudeSidereal"], moon2["longitudeSidereal"]
    )
    vashya_c1 = _vashya_class_from_longitude(moon1["longitudeSidereal"])
    vashya_c2 = _vashya_class_from_longitude(moon2["longitudeSidereal"])

    tara_score, tara12, tara21 = _tara_points(nak1["index"], nak2["index"])
    yoni_score = _yoni_score(nak1["yoni"], nak2["yoni"])
    graha_score = _graha_maitri_score(lord1, lord2)
    gana_score = _gana_score(nak1["gana"], nak2["gana"])

    # IMPORTANT: with zero-based Rashi indexes, the traditional Bhakoot
    # dosha relations are 2/12, 5/9 and 6/8. Their offsets are:
    # {1, 11}, {4, 8}, {5, 7}.
    d12 = (r2 - r1) % 12
    bhakoot_relation = _bhakoot_relation(r1, r2)
    bhakoot_dosha = d12 in {1, 4, 5, 7, 8, 11}
    bhakoot_score = 0.0 if bhakoot_dosha else 7.0

    same_nadi = nak1["nadi"] == nak2["nadi"]
    nadi_score = 0.0 if same_nadi else 8.0

    kootas = [
        _koota("varna", "Varna Koota", "वर्ण कूट", 1, varna_score,
               v1["name"], v2["name"], "Traditional Varna compatibility"),
        _koota("vashya", "Vashya Koota", "वश्य कूट", 2, vashya_score,
               vashya_c1, vashya_c2, "Mutual influence and receptivity"),
        _koota("tara", "Tara Koota", "तारा कूट", 3, tara_score,
               f"Tara {tara12}", f"Tara {tara21}", "Birth-star compatibility"),
        _koota("yoni", "Yoni Koota", "योनि कूट", 4, yoni_score,
               nak1["yoni"], nak2["yoni"], "Instinctual/physical compatibility"),
        _koota("graha_maitri", "Graha Maitri Koota", "ग्रह मैत्री कूट", 5, graha_score,
               lord1, lord2, "Moon-sign lord compatibility"),
        _koota("gana", "Gana Koota", "गण कूट", 6, gana_score,
               nak1["gana"], nak2["gana"], "Temperament compatibility"),
        _koota("bhakoot", "Bhakoot Koota", "भकूट कूट", 7, bhakoot_score,
               ZODIAC_SIGNS[r1]["name"], ZODIAC_SIGNS[r2]["name"], "Rashi relationship"),
        _koota("nadi", "Nadi Koota", "नाड़ी कूट", 8, nadi_score,
               nak1["nadi"], nak2["nadi"], "Nadi compatibility"),
    ]

    total = round(sum(x["obtainedPoints"] for x in kootas), 2)
    max_score = 36.0

    ashta = {
        "varna": {"score": varna_score, "maxScore": 1},
        "vashya": {"score": vashya_score, "maxScore": 2,
                   "class1": vashya_c1, "class2": vashya_c2},
        "tara": {"score": tara_score, "maxScore": 3,
                 "tara1": tara12, "tara2": tara21},
        "yoni": {"score": yoni_score, "maxScore": 4,
                 "yoni1": nak1["yoni"], "yoni2": nak2["yoni"]},
        "grahaMaitri": {"score": graha_score, "maxScore": 5,
                        "lord1": lord1, "lord2": lord2},
        "gana": {"score": gana_score, "maxScore": 6},
        "bhakoot": {
            "score": bhakoot_score,
            "maxScore": 7,
            "dosha": bhakoot_dosha,
            "relation": bhakoot_relation,
            "offsetZeroBased": d12,
            "cancellationApplied": False,
            "note": "Cancellation rules vary by Jyotish tradition; raw score is retained conservatively.",
        },
        "nadi": {
            "score": nadi_score,
            "maxScore": 8,
            "sameNadi": same_nadi,
            "cancellationApplied": False,
            "note": "Nadi cancellation rules vary by tradition; raw score is retained conservatively.",
        },
    }

    return kootas, ashta, total, max_score


def _koota(kid, name, sanskrit, max_points, score, p1, p2, area):
    return {
        "id": kid,
        "name": name,
        "sanskritName": sanskrit,
        "maxPoints": float(max_points),
        "maxScore": float(max_points),
        "obtainedPoints": float(score),
        "score": float(score),
        "p1Value": p1,
        "p2Value": p2,
        "area": area,
        "verdict": (
            "Excellent" if score == max_points
            else "Good" if score >= max_points * 0.5
            else "Challenging"
        ),
    }


# ============================================================
# MANGLIK / KUJA DOSHA
# ============================================================

def _mars_manglik_from_house(house: int) -> bool:
    return house in {1, 2, 4, 7, 8, 12}


def _manglik_reference(chart: dict, reference: str) -> dict:
    """Evaluate Mars from Lagna, Moon or Venus when requested."""
    ref = reference.lower()
    if ref == "lagna":
        house = chart["planetsById"]["mars"]["house"]
    elif ref in {"moon", "venus"}:
        ref_sign = chart["planetsById"][ref]["signIndex"]
        mars_sign = chart["planetsById"]["mars"]["signIndex"]
        house = ((mars_sign - ref_sign) % 12) + 1
    else:
        raise ValueError("Manglik reference must be Lagna, Moon or Venus")
    return {"reference": reference, "house": house, "isManglik": _mars_manglik_from_house(house)}


def calculate_manglik_dosha(chart1: dict, chart2: dict) -> dict:
    """
    Report the common Mars-house criterion from Lagna and also the optional
    Moon/Venus reference checks. This does NOT silently apply every regional
    cancellation rule because those rules differ across Jyotish traditions.
    """
    checks = {}
    for key, chart in (("partner1", chart1), ("partner2", chart2)):
        refs = {r: _manglik_reference(chart, r) for r in ("Lagna", "Moon", "Venus")}
        checks[key] = {
            "name": chart["partner"]["name"],
            "marsSign": chart["planetsById"]["mars"]["signName"],
            "marsHouseFromLagna": chart["planetsById"]["mars"]["house"],
            "fromLagna": refs["Lagna"],
            "fromMoon": refs["Moon"],
            "fromVenus": refs["Venus"],
        }

    m1 = checks["partner1"]["fromLagna"]["isManglik"]
    m2 = checks["partner2"]["fromLagna"]["isManglik"]
    both_lagna_manglik = m1 and m2

    return {
        "partner1": checks["partner1"],
        "partner2": checks["partner2"],
        "isNeutralized": both_lagna_manglik,
        "bothManglikFromLagna": both_lagna_manglik,
        "status": (
            "Both Manglik from Lagna" if both_lagna_manglik
            else "Both Non-Manglik from Lagna" if not m1 and not m2
            else "One Partner Manglik from Lagna"
        ),
        "method": "Mars in houses 1,2,4,7,8,12; evaluated from Lagna, Moon and Venus",
        "cancellation": {
            "automaticallyApplied": False,
            "note": "Full Kuja Dosha cancellation depends on the selected Jyotish tradition and additional chart factors.",
        },
    }


# ============================================================
# COMPLETE MILAN
# ============================================================

def calculate_kundli_milan(partner1: dict, partner2: dict) -> dict:
    err1 = validate_partner(partner1, "partner1")
    if err1:
        raise ValueError(err1)
    err2 = validate_partner(partner2, "partner2")
    if err2:
        raise ValueError(err2)

    p1 = _normalize_partner(partner1)
    p2 = _normalize_partner(partner2)

    chart1 = generate_kundli(p1)
    chart2 = generate_kundli(p2)

    kootas, ashta, total_score, max_score = calculate_ashta_koota(chart1, chart2)
    manglik = calculate_manglik_dosha(chart1, chart2)

    percentage = round(total_score / max_score * 100.0, 2)

    if total_score >= 28:
        verdict = "Excellent"
    elif total_score >= 24:
        verdict = "Very Good"
    elif total_score >= 18:
        verdict = "Acceptable / Moderate"
    else:
        verdict = "Challenging"

    moon1 = chart1["planetsById"]["moon"]
    moon2 = chart2["planetsById"]["moon"]

    report = {
        "partner1": p1,
        "partner2": p2,
        "partners": {
            "partner1": {
                "name": p1["name"],
                "dob": p1["dob"],
                "time": p1["time"],
                "place": p1["place"],
                "rashi": moon1["signName"],
                "nakshatra": moon1["nakshatra"],
                "nakshatraPada": moon1["pada"],
            },
            "partner2": {
                "name": p2["name"],
                "dob": p2["dob"],
                "time": p2["time"],
                "place": p2["place"],
                "rashi": moon2["signName"],
                "nakshatra": moon2["nakshatra"],
                "nakshatraPada": moon2["pada"],
            },
        },
        "calculatedAt": datetime.now(timezone.utc).isoformat(),
        "calculationEngine": "Swiss Ephemeris",
        "ayanamsha": "Lahiri",
        "zodiac": "Sidereal",
        "totalScore": total_score,
        "totalPoints": total_score,
        "maxScore": max_score,
        "maxPoints": max_score,
        "percentage": percentage,
        "verdictTitle": f"{verdict} Match",
        "summary": {
            "totalScore": total_score,
            "maxScore": max_score,
            "percentage": percentage,
            "verdictTitle": f"{verdict} Match",
            "description": (
                f"Ashta Koota score is {total_score:g}/{max_score:g} "
                f"({percentage}%). This score is based on traditional "
                f"Moon Nakshatra/Rashi matching."
            ),
        },
        "charts": {
            "partner1": chart1,
            "partner2": chart2,
        },
        "kootas": kootas,
        "ashtaKoota": ashta,
        "manglik": manglik,
        "numerologyMilan": {
            "note": "Optional/non-Ashta-Koota system",
            "partner1": calculate_numerology(p1["name"], p1["dob"]),
            "partner2": calculate_numerology(p2["name"], p2["dob"]),
        },
        "methodNotes": [
            "Planetary longitudes are calculated from Swiss Ephemeris.",
            "Sidereal zodiac uses Lahiri ayanamsha.",
            "Birth time is converted from the supplied IANA timezone to UTC using the IANA tz database.",
            "Default house system is Whole Sign; Placidus can be selected explicitly with houseSystem='P'.",
            "Rahu defaults to True Node; Mean Node can be selected with nodeType='mean'.",
            "Ashta Koota uses Moon Rashi and Nakshatra.",
            "Manglik reports Mars from Lagna, Moon and Venus without silently applying tradition-specific cancellation rules.",
            "Nadi/Bhakoot cancellation is intentionally conservative; a complete traditional cancellation analysis is separate.",
            "Western synastry is not mixed into the 36-Guna score.",
        ],
    }

    return {
        "totalScore": total_score,
        "maxScore": max_score,
        "manglikStatus": manglik["status"],
        "report": report,
    }


# ============================================================
# DATABASE SERIALIZATION
# ============================================================

def _row_to_summary(row: dict) -> dict:
    return {
        "id": row["id"],
        "partner1Name": row["partner1_name"],
        "partner1BirthDate": row["partner1_birth_date"].isoformat()
        if hasattr(row["partner1_birth_date"], "isoformat")
        else str(row["partner1_birth_date"]),
        "partner2Name": row["partner2_name"],
        "partner2BirthDate": row["partner2_birth_date"].isoformat()
        if hasattr(row["partner2_birth_date"], "isoformat")
        else str(row["partner2_birth_date"]),
        "totalScore": float(row["total_score"]),
        "maxScore": float(row["max_score"]),
        "manglikStatus": row.get("manglik_status"),
        "createdAt": row["created_at"].isoformat()
        if hasattr(row.get("created_at"), "isoformat")
        else row.get("created_at"),
    }


def _row_to_full(row: dict) -> dict:
    result = _row_to_summary(row)
    report_json = row.get("report_json")
    if isinstance(report_json, str):
        try:
            report_json = json.loads(report_json)
        except Exception:
            pass
    result["report"] = report_json
    return result


# ============================================================
# CONTROLLER ENDPOINTS
# ============================================================

def create_match_report(user_id: str):
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        return _error("Request body must be valid JSON", "INVALID_JSON")

    partner1 = body.get("partner1")
    partner2 = body.get("partner2")
    supplied_report = body.get("report")

    if not partner1:
        partner1 = {
            "name": body.get("partner1Name"),
            "dob": body.get("partner1BirthDate"),
            "time": body.get("partner1BirthTime"),
            "place": body.get("partner1BirthPlace") or body.get("partner1Place"),
            "houseSystem": body.get("partner1HouseSystem", "W"),
            "nodeType": body.get("partner1NodeType", "true"),
        }

    if not partner2:
        partner2 = {
            "name": body.get("partner2Name"),
            "dob": body.get("partner2BirthDate"),
            "time": body.get("partner2BirthTime"),
            "place": body.get("partner2BirthPlace") or body.get("partner2Place"),
            "houseSystem": body.get("partner2HouseSystem", "W"),
            "nodeType": body.get("partner2NodeType", "true"),
        }

    # Resolve coordinates/timezone automatically from the human-readable birthplace.
    try:
        partner1 = prepare_partner(partner1)
        partner2 = prepare_partner(partner2)
    except Exception as exc:
        return _error(str(exc), "BIRTH_PLACE_RESOLUTION_ERROR")

    # Always calculate on the backend when dynamic inputs are supplied.
    if not supplied_report:
        err1 = validate_partner(partner1, "partner1")
        if err1:
            return _error(err1, "VALIDATION_ERROR")

        err2 = validate_partner(partner2, "partner2")
        if err2:
            return _error(err2, "VALIDATION_ERROR")

        try:
            result = calculate_kundli_milan(partner1, partner2)
        except Exception as exc:
            return _error(f"Failed to calculate Kundli Milan: {exc}", "CALCULATION_ERROR", 500)

        report = result["report"]
        total_score = float(result["totalScore"])
        max_score = float(result["maxScore"])
        manglik_status = result["manglikStatus"]

        p1 = _normalize_partner(partner1)
        p2 = _normalize_partner(partner2)

        p1_name, p1_dob = p1["name"], p1["dob"]
        p2_name, p2_dob = p2["name"], p2["dob"]

    else:
        # Kept only for backward compatibility with old frontend payloads.
        # For astronomical integrity, dynamic calculation is recommended.
        report = supplied_report
        p1_name = body.get("partner1Name") or partner1.get("name")
        p1_dob = body.get("partner1BirthDate") or partner1.get("dob")
        p2_name = body.get("partner2Name") or partner2.get("name")
        p2_dob = body.get("partner2BirthDate") or partner2.get("dob")

        try:
            total_score = float(body["totalScore"])
            max_score = float(body.get("maxScore", 36))
        except (KeyError, TypeError, ValueError):
            return _error("totalScore/maxScore must be numeric", "VALIDATION_ERROR")

        manglik_status = body.get("manglikStatus", "Unknown")

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
                report_json_str,
            ],
        )
    except Exception as exc:
        return _error(f"Database error while saving report: {exc}", "DATABASE_ERROR", 500)

    if not rows:
        return _error("Could not save match report", "SAVE_FAILED", 500)

    return jsonify({
        "status": "success",
        "message": "Astronomical Kundli Milan report generated and saved successfully",
        "data": _row_to_full(rows[0]),
    }), 201


def list_match_reports(user_id: str):
    try:
        rows = call_procedure("sp_get_match_reports", [user_id])
        return jsonify({
            "status": "success",
            "data": [_row_to_summary(r) for r in rows],
        })
    except Exception as exc:
        return _error(f"Database error while fetching reports: {exc}", "DATABASE_ERROR", 500)


def get_match_report(user_id: str, report_id: str):
    try:
        rows = call_procedure("sp_get_match_report", [report_id, user_id])
        if not rows:
            return _error("Match report not found", "NOT_FOUND", 404)

        return jsonify({
            "status": "success",
            "data": _row_to_full(rows[0]),
        })
    except Exception as exc:
        return _error(f"Database error while fetching report: {exc}", "DATABASE_ERROR", 500)


def download_match_report_pdf(user_id: str, report_id: str):
    try:
        rows = call_procedure("sp_get_match_report", [report_id, user_id])
        if not rows:
            return _error("Match report not found", "NOT_FOUND", 404)

        row = dict(rows[0])
        report_json = row.get("report_json")

        if isinstance(report_json, str):
            report_json = json.loads(report_json)

        row["report_json"] = report_json
        pdf_bytes = generate_match_report_pdf(row)

        filename = f"jyotishveda-kundli-milan-{report_id[:8]}.pdf"

        return Response(
            pdf_bytes,
            mimetype="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            },
        )
    except Exception as exc:
        return _error(f"Error generating PDF: {exc}", "PDF_ERROR", 500)


# ============================================================
# AI SYNTHESIS
# ============================================================

# def generate_ai_synthesis(user_id: str):
#     body = request.get_json(silent=True) or {}

  

#     data = body.get("data", {})
#     report = data.get("report", {})

#     partner1 = report.get("partner1", {})
#     partner2 = report.get("partner2", {})
#     ashtaKoota = report.get("ashtaKoota", {})

#     # ---------------------------------------------------------
#     # Partner names
#     # ---------------------------------------------------------

#     p1_name = (
#         partner1.get("fullName")
#         or partner1.get("name")
#         or data.get("partner1Name")
#         or "Partner 1"
#     )

#     p2_name = (
#         partner2.get("fullName")
#         or partner2.get("name")
#         or data.get("partner2Name")
#         or "Partner 2"
#     )

#     # ---------------------------------------------------------
#     # Total Ashta Koota score
#     # ---------------------------------------------------------

#     score = ashtaKoota.get(
#         "totalPoints",
#         ashtaKoota.get(
#             "totalScore",
#             report.get("totalScore", "Unknown")
#         )
#     )

#     # ---------------------------------------------------------
#     # System prompt
#     # ---------------------------------------------------------

#     system_prompt = """
# You are an AI assistant for a Vedic astrology application.

# Use ONLY the astrology data supplied in the request.
# Do not invent planetary positions, Nakshatra, Rashi, Dosha or scores.
# Explain that Ashta Koota is a traditional Jyotish matching framework,
# not a scientific guarantee of relationship outcome.

# Return ONLY valid JSON. No Markdown.
# Required keys:
# overall_compatibility,
# guna_milan,
# psychological_affinity,
# emotional_resonance,
# karmic_bond,
# physical_harmonization,
# manglik_dosha,
# nadi_analysis,
# bhakoot_analysis,
# family_and_married_life,
# wealth_and_prosperity,
# major_strengths,
# major_challenges,
# conflict_resolution,
# vedic_remedies,
# final_assessment
# """

#     prompt = f"""
# PARTNER 1:
# {json.dumps(partner1, ensure_ascii=False, indent=2)}

# PARTNER 2:
# {json.dumps(partner2, ensure_ascii=False, indent=2)}

# KUNDLI MILAN:
# {json.dumps(ashtaKoota, ensure_ascii=False, indent=2)}

# TOTAL ASHTA KOOTA SCORE: {score}/36

# Provide a cautious Vedic-Jyotish-oriented synthesis for
# {p1_name} and {p2_name}. Do not add astrology facts that are absent.
# """

#     try:
#         synthesis = get_ai_response(
#             system_prompt,
#             [{"role": "user", "content": prompt}],
#         )

#         synthesis = synthesis.strip()
#         if synthesis.startswith("```"):
#             synthesis = re.sub(r"^```(?:json)?\s*", "", synthesis)
#             synthesis = re.sub(r"\s*```$", "", synthesis)

#         data = json.loads(synthesis)

#         return jsonify({
#             "success": True,
#             "synthesis": data,
#         })
#     except Exception as exc:
#         return _error(f"LLM Error: {exc}", "LLM_FAILED", 500)



def generate_ai_synthesis(user_id: str):
    body = request.get_json(silent=True) or {}

    data = body.get("data", {})
    report = data.get("report", {})

    partner1 = report.get("partner1", {})
    partner2 = report.get("partner2", {})
    ashtaKoota = report.get("ashtaKoota", {})

    # ---------------------------------------------------------
    # Partner names
    # ---------------------------------------------------------

    p1_name = (
        partner1.get("fullName")
        or partner1.get("name")
        or data.get("partner1Name")
        or "Partner 1"
    )

    p2_name = (
        partner2.get("fullName")
        or partner2.get("name")
        or data.get("partner2Name")
        or "Partner 2"
    )

    # ---------------------------------------------------------
    # Total Ashta Koota score
    # ---------------------------------------------------------

    score = ashtaKoota.get("totalPoints")

    if score is None:
        score = ashtaKoota.get("totalScore")

    if score is None:
        score = report.get("totalScore")

    if score is None:
        score = data.get("totalScore", "Unknown")

    # ---------------------------------------------------------
    # Manglik Status
    #
    # IMPORTANT:
    # Manglik status directly comes from data.manglikStatus
    # ---------------------------------------------------------

    manglik_status = data.get("manglikStatus", "")

    # ---------------------------------------------------------
    # Check whether Manglik is present
    # ---------------------------------------------------------

    manglik_present = (
        "manglik" in str(manglik_status).lower()
    )

    # ---------------------------------------------------------
    # System Prompt
    # ---------------------------------------------------------

    system_prompt = """
You are an AI assistant for a Vedic astrology application.

IMPORTANT RULES:

1. Use ONLY the astrology data supplied in the request.

2. Do NOT invent planetary positions, Nakshatra, Rashi,
   Dosha, Ashta Koota scores or Manglik information.

3. The Ashta Koota and Manglik calculations have already
   been performed by the astrology calculation engine.

4. DO NOT recalculate Manglik Dosha.

5. Use the supplied Manglik status exactly as provided.

6. Do not invent Manglik cancellation or neutralization rules.

7. Ashta Koota is a traditional Jyotish matching framework,
   not a scientifically proven guarantee of relationship outcome.

8. If information is missing, clearly say that it is unavailable.

9. Return ONLY valid JSON.

10. Do NOT return Markdown or ```json code fences.

Required keys:

overall_compatibility,
guna_milan,
psychological_affinity,
emotional_resonance,
karmic_bond,
physical_harmonization,
manglik_dosha,
nadi_analysis,
bhakoot_analysis,
family_and_married_life,
wealth_and_prosperity,
major_strengths,
major_challenges,
conflict_resolution,
vedic_remedies,
final_assessment
"""

    # ---------------------------------------------------------
    # User Prompt
    # ---------------------------------------------------------

    prompt = f"""
PARTNER 1:
{json.dumps(partner1, ensure_ascii=False, indent=2)}

PARTNER 2:
{json.dumps(partner2, ensure_ascii=False, indent=2)}

ASHTA KOOTA:
{json.dumps(ashtaKoota, ensure_ascii=False, indent=2)}

TOTAL ASHTA KOOTA SCORE:
{score}/36

MANGALIK STATUS:
{manglik_status}

MANGALIK DOSHA PRESENT:
{manglik_present}

PARTNER 1 NAME:
{p1_name}

PARTNER 2 NAME:
{p2_name}

Provide a cautious Vedic-Jyotish-oriented synthesis for
{p1_name} and {p2_name}.

Use ONLY the supplied astrology data.

DO NOT recalculate Manglik Dosha.

DO NOT recalculate or modify the Ashta Koota score.

Use the supplied Manglik status exactly as provided.

If Manglik status indicates that one or both partners are
Manglik, describe the Manglik condition accordingly.

If Manglik status indicates that there is no Manglik Dosha,
do not claim that Manglik Dosha exists.
"""

    try:

        # -----------------------------------------------------
        # Generate Main AI Synthesis
        # -----------------------------------------------------

        synthesis = get_ai_response(
            system_prompt,
            [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
        )

        synthesis = synthesis.strip()

        # -----------------------------------------------------
        # Remove Markdown code fence
        # -----------------------------------------------------

        if synthesis.startswith("```"):

            synthesis = re.sub(
                r"^```(?:json)?\s*",
                "",
                synthesis
            )

            synthesis = re.sub(
                r"\s*```$",
                "",
                synthesis
            )

        # -----------------------------------------------------
        # Parse AI JSON
        # -----------------------------------------------------

        synthesis_data = json.loads(synthesis)

        # -----------------------------------------------------
        # Force actual Manglik status into final response
        # -----------------------------------------------------

        synthesis_data["manglik_dosha"] = {
            "present": manglik_present,
            "status": manglik_status
        }

        # -----------------------------------------------------
        # MANGALIK REMEDIES
        #
        # If Manglik status exists:
        # AI will generate minimum 3 remedies.
        # -----------------------------------------------------

        if manglik_present:

            manglik_remedies = (
                generate_manglik_remedies_with_ai(
                    manglik_status
                )
            )

            if not isinstance(manglik_remedies, list):
                raise RuntimeError(
                    "Manglik remedies must be a list"
                )

            if len(manglik_remedies) < 3:
                raise RuntimeError(
                    "AI returned fewer than 3 Manglik remedies"
                )

            synthesis_data["vedic_remedies"] = (
                manglik_remedies
            )

        else:

            synthesis_data["vedic_remedies"] = []

        # -----------------------------------------------------
        # Final Response
        # -----------------------------------------------------

        return jsonify({
            "success": True,
            "synthesis": synthesis_data
        })

    except json.JSONDecodeError as exc:

        return _error(
            f"AI returned invalid JSON: {exc}",
            "INVALID_AI_JSON",
            500
        )

    except RuntimeError as exc:

        return _error(
            str(exc),
            "MANGALIK_REMEDY_FAILED",
            500
        )

    except Exception as exc:

        return _error(
            f"LLM Error: {exc}",
            "LLM_FAILED",
            500
        )


def generate_manglik_remedies_with_ai(manglik_status: str) -> list:

    prompt = f"""
You are a traditional Vedic Jyotish assistant.

The astrology calculation engine has already calculated
the Manglik status.

Manglik Status:
{manglik_status}

DO NOT calculate Manglik Dosha again.

Generate AT LEAST 3 DISTINCT traditional Vedic Jyotish
remedies for this Manglik condition.

Rules:

1. Remedies must be generated dynamically by AI.
2. Minimum 3 remedies are required.
3. Remedies must be related to Manglik / Kuja Dosha.
4. Do not invent planetary positions.
5. Do not invent cancellation rules.
6. Do not claim that a remedy guarantees removal or
   cancellation of Manglik Dosha.
7. Keep remedies traditional and practical.
8. Return ONLY valid JSON.

Required format:

{{
    "remedies": [
        "Remedy 1",
        "Remedy 2",
        "Remedy 3"
    ]
}}
"""

    response = get_ai_response(
        """
You are a Vedic Jyotish remedy assistant.

Generate Manglik remedies dynamically from the
supplied Manglik status.

Return ONLY valid JSON.
""",
        [
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    response = response.strip()

    # ---------------------------------------------------------
    # Remove Markdown code fence
    # ---------------------------------------------------------

    if response.startswith("```"):

        response = re.sub(
            r"^```(?:json)?\s*",
            "",
            response
        )

        response = re.sub(
            r"\s*```$",
            "",
            response
        )

    # ---------------------------------------------------------
    # Parse JSON
    # ---------------------------------------------------------

    result = json.loads(response)

    remedies = result.get("remedies", [])

    if not isinstance(remedies, list):
        raise RuntimeError(
            "AI remedies must be a list"
        )

    remedies = [
        remedy.strip()
        for remedy in remedies
        if isinstance(remedy, str)
        and remedy.strip()
    ]

    # ---------------------------------------------------------
    # Minimum 3 remedies
    # ---------------------------------------------------------

    if len(remedies) < 3:
        raise RuntimeError(
            "AI returned fewer than 3 Manglik remedies"
        )

    return remedies