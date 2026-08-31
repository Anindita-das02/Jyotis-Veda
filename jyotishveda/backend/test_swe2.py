import swisseph as swe
jd = swe.julday(2026, 4, 15, 0, 1)

print("Testing 6 args...")
try:
    print(swe.rise_trans(jd, swe.SUN, "", swe.FLG_SWIEPH, swe.CALC_RISE, (88.3639, 22.5726, 0.0)))
except Exception as e:
    print("Error 6 args:", e)

print("Testing 7 args...")
try:
    print(swe.rise_trans(jd, swe.SUN, "", swe.FLG_SWIEPH, swe.CALC_RISE, (88.3639, 22.5726, 0.0), 0.0))
except Exception as e:
    print("Error 7 args:", e)

