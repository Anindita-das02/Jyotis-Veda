import swisseph as swe
from datetime import datetime

jd = swe.julday(2026, 4, 15, 0, 1)
try:
    res = swe.rise_trans(jd, swe.SUN, "", swe.FLG_SWIEPH, swe.CALC_RISE, (88.3639, 22.5726, 0.0), 0, 0)
    print("SUCCESS:", res)
except Exception as e:
    print("ERROR:", str(e))
