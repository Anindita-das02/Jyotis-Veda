from flask import Blueprint, request, jsonify
from services.ephemeris_service import calculate_chart_data

birth_chart_bp = Blueprint('birth_chart', __name__)

@birth_chart_bp.route("/api/ephemeris/chart", methods=["POST"])
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
