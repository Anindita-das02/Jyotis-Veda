import math
from datetime import datetime

def format_time(total_mins):
    h = int(total_mins // 60)
    m = int(total_mins % 60)
    ampm = 'PM' if h >= 12 else 'AM'
    display_h = 12 if h % 12 == 0 else h % 12
    return f"{display_h:02d}:{m:02d} {ampm}"

def get_day_of_week(year, month, day):
    # 0 = Sunday, 1 = Monday, ... 6 = Saturday (JS style)
    dt = datetime(year, month, day)
    return dt.isoweekday() % 7

def calculate_sun_times_and_muhurtas(year, month, day, lat, longitude, tz_offset):
    date = datetime(year, month, day)
    dayOfYear = (date - datetime(year, 1, 1)).days
    
    N = dayOfYear
    lngHour = longitude / 15.0
    tSunrise = N + ((6 - lngHour) / 24.0)
    tSunset = N + ((18 - lngHour) / 24.0)
    
    M_sunrise = (0.9856 * tSunrise) - 3.289
    M_sunset = (0.9856 * tSunset) - 3.289
    
    L_sunrise = (M_sunrise + (1.916 * math.sin(math.radians(M_sunrise))) + (0.020 * math.sin(math.radians(2 * M_sunrise))) + 282.634 + 360) % 360
    L_sunset = (M_sunset + (1.916 * math.sin(math.radians(M_sunset))) + (0.020 * math.sin(math.radians(2 * M_sunset))) + 282.634 + 360) % 360
    
    RA_sunrise = (math.degrees(math.atan(0.91764 * math.tan(math.radians(L_sunrise)))) + 360) % 360
    RA_sunset = (math.degrees(math.atan(0.91764 * math.tan(math.radians(L_sunset)))) + 360) % 360
    
    RA_sunrise = (RA_sunrise + (math.floor(L_sunrise / 90) * 90 - math.floor(RA_sunrise / 90) * 90)) / 15.0
    RA_sunset = (RA_sunset + (math.floor(L_sunset / 90) * 90 - math.floor(RA_sunset / 90) * 90)) / 15.0
    
    sinDec_sunrise = 0.39782 * math.sin(math.radians(L_sunrise))
    cosDec_sunrise = math.cos(math.asin(sinDec_sunrise))
    sinDec_sunset = 0.39782 * math.sin(math.radians(L_sunset))
    cosDec_sunset = math.cos(math.asin(sinDec_sunset))
    
    val_sunrise = (math.cos(math.radians(90.833)) - (sinDec_sunrise * math.sin(math.radians(lat)))) / (cosDec_sunrise * math.cos(math.radians(lat)))
    val_sunset = (math.cos(math.radians(90.833)) - (sinDec_sunset * math.sin(math.radians(lat)))) / (cosDec_sunset * math.cos(math.radians(lat)))
    
    cosH_sunrise = max(-1, min(1, val_sunrise))
    cosH_sunset = max(-1, min(1, val_sunset))
    
    H_sunrise = (360 - math.degrees(math.acos(cosH_sunrise))) / 15.0
    H_sunset = math.degrees(math.acos(cosH_sunset)) / 15.0
    
    UT_sunrise = (H_sunrise + RA_sunrise - (0.06571 * tSunrise) - 6.622 - lngHour + 24) % 24
    UT_sunset = (H_sunset + RA_sunset - (0.06571 * tSunset) - 6.622 - lngHour + 24) % 24
    
    totalSunriseMins = ((UT_sunrise + tz_offset + 24) % 24) * 60
    totalSunsetMins = ((UT_sunset + tz_offset + 24) % 24) * 60
    
    totalDaylightMins = totalSunsetMins - totalSunriseMins
    if totalDaylightMins < 0:
        totalDaylightMins += 24 * 60
        
    partMins = totalDaylightMins / 8.0
    
    day_of_week = get_day_of_week(year, month, day)
    rahuParts = [8, 2, 7, 5, 6, 4, 3]
    rahuPart = rahuParts[day_of_week]
    
    rahuStartMins = totalSunriseMins + partMins * (rahuPart - 1)
    rahuEndMins = rahuStartMins + partMins
    
    abhijitStartMins = totalSunriseMins + (totalDaylightMins / 2.0) - 24
    abhijitEndMins = abhijitStartMins + 48
    
    # Real Brahma Muhurta
    brahmaStartMins = totalSunriseMins - 96
    if brahmaStartMins < 0:
        brahmaStartMins += 24 * 60
    brahmaEndMins = brahmaStartMins + 48
    
    return {
        "sunrise": format_time(totalSunriseMins),
        "sunset": format_time(totalSunsetMins),
        "rahuKaal": f"{format_time(rahuStartMins)} - {format_time(rahuEndMins)} (Avoid new tasks, sign agreements)",
        "abhijitMuhurta": f"{format_time(abhijitStartMins)} - {format_time(abhijitEndMins)} (Highly auspicious for success)",
        "brahmaMuhurta": f"{format_time(brahmaStartMins)} - {format_time(brahmaEndMins)} (Ideal for Meditation & Sadhana)"
    }

def get_daily_rituals(nakshatra_idx):
    # Nakshatra Lords follow a strict sequence of 9: 
    # Ketu, Venus, Sun, Moon, Mars, Rahu, Jupiter, Saturn, Mercury
    lord_idx = nakshatra_idx % 9
    
    rituals = [
        { # 0: Ketu
            "morningTitle": "Ganesha Atharvashirsha",
            "morningDesc": "Offer durva grass to Lord Ganesha to remove unseen obstacles and calm the restless mind.",
            "eveningTitle": "Ketu Beej Mantra",
            "eveningDesc": "Chant 'Om Sraam Sreem Sraum Sah Ketave Namah' to enhance intuition and spiritual detachment."
        },
        { # 1: Venus (Shukra)
            "morningTitle": "Sri Suktam Path",
            "morningDesc": "Offer white flowers or fragrant perfumes to Goddess Lakshmi. Recite the Sri Suktam for luxury and harmonious relationships.",
            "eveningTitle": "Shukra Beej Mantra",
            "eveningDesc": "Light a ghee diya at dusk. Recite 'Om Dram Dreem Draum Sah Shukraya Namah' to enhance magnetism."
        },
        { # 2: Sun (Surya)
            "morningTitle": "Surya Arghya & Aditya Hrudayam",
            "morningDesc": "Offer water to the rising Sun with red flowers and a pinch of kumkum. Recite the Aditya Hrudayam Stotram for vitality.",
            "eveningTitle": "Gayatri Mantra Japa",
            "eveningDesc": "Light a sesame oil diya. Chant the Gayatri Mantra 108 times to illuminate the intellect."
        },
        { # 3: Moon (Chandra)
            "morningTitle": "Shiva Linga Abhishekam",
            "morningDesc": "Offer raw milk, water, and bel patra to a Shiva Linga. Chant 'Om Namah Shivaya' to calm the restless mind.",
            "eveningTitle": "Chandra Beej Mantra",
            "eveningDesc": "Sit facing the Northwest. Recite 'Om Shram Shreem Shraum Sah Chandraya Namah' for emotional intelligence."
        },
        { # 4: Mars (Mangal)
            "morningTitle": "Hanuman Chalisa",
            "morningDesc": "Wear red garments. Recite the Hanuman Chalisa or Bajrang Baan to overcome obstacles and cultivate martial courage.",
            "eveningTitle": "Mangal Mantra",
            "eveningDesc": "Light a ghee diya. Chant 'Om Kram Kreem Kroum Sah Bhaumaya Namah' to channel raw energy into productive action."
        },
        { # 5: Rahu
            "morningTitle": "Durga Saptashati & Bhairava",
            "morningDesc": "Offer prayers to Goddess Durga to dispel illusions and anxieties caused by Rahu's shadowy energy.",
            "eveningTitle": "Rahu Beej Mantra",
            "eveningDesc": "Recite 'Om Bhraam Bhreem Bhraum Sah Rahave Namah' after sunset to protect against sudden setbacks."
        },
        { # 6: Jupiter (Guru)
            "morningTitle": "Guru Mantra & Yellow Offerings",
            "morningDesc": "Wear yellow or apply a turmeric tilak. Chant 'Om Brihaspataye Namah' 108 times for wisdom and expansion.",
            "eveningTitle": "Dakshinamurthy Stotram",
            "eveningDesc": "Light a ghee diya at dusk. Meditate upon Lord Dakshinamurthy for profound spiritual insight and clarity."
        },
        { # 7: Saturn (Shani)
            "morningTitle": "Shani Mantra & Charity",
            "morningDesc": "Offer black sesame seeds and mustard oil to Lord Shani. Feed crows or street dogs to appease karmic blockages.",
            "eveningTitle": "Maha Mrityunjaya & Shiva Japa",
            "eveningDesc": "Light a mustard oil diya at dusk. Recite 'Om Tryambakam Yajamahe...' for protection."
        },
        { # 8: Mercury (Budh)
            "morningTitle": "Vishnu Sahasranama",
            "morningDesc": "Offer Tulsi leaves to Lord Vishnu. Listen to or recite the Vishnu Sahasranama for financial stability.",
            "eveningTitle": "Budh Beej Mantra",
            "eveningDesc": "Chant 'Om Bram Breem Braum Sah Budhaya Namah' to sharpen intellect and improve communication."
        }
    ]
    return rituals[lord_idx]

def get_numerology_daily(mulank, year, month, day):
    # Dynamic Daily Numerology: 
    # Personal Day Number = (Mulank + Current Day + Current Month + Current Year) reduced to single digit
    def reduce_to_single_digit(n):
        while n > 9:
            n = sum(int(digit) for digit in str(n))
        return n
        
    date_sum = sum(int(d) for d in f"{year}{month:02d}{day:02d}")
    personal_day_number = reduce_to_single_digit(int(mulank) + date_sum)
    
    # Map the Personal Day Number to its ruling planet's attributes for the day
    planet_attributes = {
        1: {"color": "Gold / Saffron (Sun)", "vibe": "New beginnings & Leadership"},
        2: {"color": "White / Pearl (Moon)", "vibe": "Cooperation & Intuition"},
        3: {"color": "Yellow (Jupiter)", "vibe": "Creativity & Expansion"},
        4: {"color": "Grey / Blue (Rahu)", "vibe": "Hard work & Organization"},
        5: {"color": "Green (Mercury)", "vibe": "Communication & Change"},
        6: {"color": "Pink / White (Venus)", "vibe": "Love & Harmony"},
        7: {"color": "Light Green (Ketu)", "vibe": "Spirituality & Analysis"},
        8: {"color": "Black / Dark Blue (Saturn)", "vibe": "Karma & Financial Power"},
        9: {"color": "Red (Mars)", "vibe": "Energy & Completion"}
    }
    
    day_data = planet_attributes.get(personal_day_number, planet_attributes[1])
    
    return personal_day_number, day_data["color"]

