import swisseph as swe
from datetime import datetime, timedelta

def get_julian_day_ut(date_str, time_str, timezone_offset):
    """
    Convert local date and time to UTC Julian Day.
    date_str: "YYYY-MM-DD"
    time_str: "HH:mm"
    timezone_offset: float (e.g., 5.5 for IST)
    """
    try:
        dt_local = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
        dt_utc = dt_local - timedelta(hours=timezone_offset)
        
        year = dt_utc.year
        month = dt_utc.month
        day = dt_utc.day
        hour = dt_utc.hour + dt_utc.minute / 60.0 + dt_utc.second / 3600.0
        
        # 1 means Gregorian Calendar
        jd_ut = swe.julday(year, month, day, hour, 1)
        return jd_ut
    except Exception as e:
        raise ValueError(f"Invalid date/time format: {e}")

def calculate_panchang_data(date_str, time_str, timezone_offset):
    jd_ut = get_julian_day_ut(date_str, time_str, timezone_offset)
    
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    flags = swe.FLG_SIDEREAL | swe.FLG_SWIEPH | swe.FLG_SPEED
    
    # Calculate Sun and Moon positions
    sun_res, _ = swe.calc_ut(jd_ut, swe.SUN, flags)
    moon_res, _ = swe.calc_ut(jd_ut, swe.MOON, flags)
    
    sun_lon = sun_res[0]
    moon_lon = moon_res[0]
    
    # Panchang Calculations
    # 1. Tithi: Angle between Moon and Sun (12 degrees per Tithi)
    diff = (moon_lon - sun_lon) % 360
    tithi_idx = int(diff / 12)
    
    # 2. Karana: Half of Tithi (6 degrees per Karana)
    karana_idx = int(diff / 6)
    
    # 3. Yoga: Sum of longitudes of Sun and Moon (13°20' or 13.3333 degrees per Yoga)
    sum_lon = (sun_lon + moon_lon) % 360
    yoga_idx = int(sum_lon / (40.0 / 3.0))
    
    # 4. Nakshatra: Moon's longitude (13°20' per Nakshatra)
    nak_idx = int(moon_lon / (40.0 / 3.0))
    
    return {
        "sunLongitude": sun_lon,
        "moonLongitude": moon_lon,
        "tithiIndex": tithi_idx,
        "karanaIndex": karana_idx,
        "yogaIndex": yoga_idx,
        "nakshatraIndex": nak_idx
    }

def calculate_chart_data(date_str, time_str, lat, lon, timezone_offset):
    jd_ut = get_julian_day_ut(date_str, time_str, timezone_offset)
    
    # Set Sidereal mode to Lahiri
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    
    # Flags: Sidereal + Moshier/Swiss + Speed calculation
    flags = swe.FLG_SIDEREAL | swe.FLG_SWIEPH | swe.FLG_SPEED
    
    planets_to_calc = {
        "sun": swe.SUN,
        "moon": swe.MOON,
        "mars": swe.MARS,
        "mercury": swe.MERCURY,
        "jupiter": swe.JUPITER,
        "venus": swe.VENUS,
        "saturn": swe.SATURN,
        "rahu": swe.TRUE_NODE, # True Node for Rahu
    }
    
    planet_results = {}
    for p_name, p_id in planets_to_calc.items():
        res, _ = swe.calc_ut(jd_ut, p_id, flags)
        lon_deg = res[0]
        speed = res[3]
        
        planet_results[p_name] = {
            "longitude": lon_deg,
            "isRetrograde": speed < 0
        }
        
    # Calculate Ketu (180 degrees opposite to Rahu)
    rahu_lon = planet_results["rahu"]["longitude"]
    planet_results["ketu"] = {
        "longitude": (rahu_lon + 180.0) % 360.0,
        "isRetrograde": planet_results["rahu"]["isRetrograde"]
    }
    
    # Ascendant Calculation
    # swe.houses returns tropical cusps and ascmc (Ascendant is ascmc[0])
    cusps, ascmc = swe.houses(jd_ut, lat, lon, b'W') # Whole Sign or Placidus (W / P) doesn't matter for exact ASC degree
    trop_asc = ascmc[0]
    
    # Get Ayanamsha for this epoch
    aya = swe.get_ayanamsa_ut(jd_ut)
    sid_asc = (trop_asc - aya) % 360.0
    if sid_asc < 0:
        sid_asc += 360.0
        
    return {
        "ascendant": sid_asc,
        "planets": planet_results,
        "ayanamsha": aya
    }
