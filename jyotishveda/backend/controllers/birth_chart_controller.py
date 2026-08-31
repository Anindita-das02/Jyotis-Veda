from flask import request, jsonify
from services.ephemeris_service import calculate_chart_data

def calculate_ephemeris_chart():
    data = request.json
    if not data:
        return jsonify({"status": "error", "message": "No data provided"}), 400

    date_str = data.get("birthDate")
    time_str = data.get("birthTime")
    lat = data.get("latitude")
    lon = data.get("longitude")
    tz_offset = data.get("timezone", 5.5)

    if not all([date_str, time_str, lat is not None, lon is not None]):
        return jsonify({"status": "error", "message": "Missing required fields"}), 400

    try:
        result = calculate_chart_data(date_str, time_str, float(lat), float(lon), float(tz_offset))
        return jsonify({"status": "success", "data": result})
    except Exception as e:
        print(f"Error in calculate_ephemeris_chart: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

def post_interpret():
    body = request.get_json(silent=True) or {}
    profile = body.get("profile", {})
    tradition = body.get("tradition", "parashari")
    chart_data = body.get("chartData", {})
    numerology = body.get("numerology", {})
    language = body.get("language", "en")
    
    try:
        from services.llm_service import get_interpret_response
        interpretation = get_interpret_response(profile, tradition, chart_data, numerology, language)
        return jsonify({"status": "success", "data": {"interpretation": interpretation}})
    except Exception as e:
        print(f"Error in interpret insights: {e}")
        return jsonify({"status": "error", "message": str(e), "error_code": "LLM_ERROR"}), 500
