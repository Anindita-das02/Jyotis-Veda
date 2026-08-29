from flask import Blueprint, request, jsonify
import json
from services.llm_service import get_daily_insights_response
from services.ephemeris_service import calculate_panchang_data

daily_insights_bp = Blueprint('daily_insights', __name__)

@daily_insights_bp.route("/api/ephemeris/panchang", methods=["POST"])
def calculate_ephemeris_panchang():
    data = request.json
    if not data:
        return jsonify({"status": "error", "message": "No data provided"}), 400

    date_str = data.get("date")
    time_str = data.get("time")
    tz_offset = data.get("timezone", 5.5)

    if not all([date_str, time_str]):
        return jsonify({"status": "error", "message": "Missing required fields"}), 400

    try:
        result = calculate_panchang_data(date_str, time_str, float(tz_offset))
        return jsonify({"status": "success", "data": result})
    except Exception as e:
        print(f"Error in calculate_ephemeris_panchang: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@daily_insights_bp.route("/api/gemini/daily-horoscope", methods=["POST"])
def daily_horoscope():
    data = request.json
    if not data:
        return jsonify({"status": "error", "message": "No data provided"}), 400

    profile = data.get("profile", {})
    chart_data = data.get("chartData", {})
    panchang = data.get("panchang", {})
    numerology = data.get("numerology", {})

    try:
        json_res = get_daily_insights_response(profile, chart_data, panchang, numerology)
        return jsonify({"insights": json.loads(json_res)})
    except Exception as e:
        print(f"Error in daily_horoscope: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
