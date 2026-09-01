from flask import request, jsonify
import json
from services.llm_service import get_zodiac_forecast_response
from database.db_connection import call_procedure

def get_all_zodiacs():
    try:
        results = call_procedure("sp_zodiac_ops", ["get_all", None])
        # The nakshatras are stored as comma separated strings, we need to convert them to lists for the frontend
        for row in results:
            if row.get('nakshatras'):
                row['nakshatras'] = [n.strip() for n in row['nakshatras'].split(',')]
        return jsonify({"status": "success", "data": results})
    except Exception as e:
        print(f"Error in get_all_zodiacs: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

def zodiac_forecast():
    data = request.json
    if not data:
        return jsonify({"status": "error", "message": "No data provided"}), 400

    sign = data.get("sign", "")
    timeframe = data.get("timeframe", "today")
    language = data.get("language", "en")

    if not sign:
        return jsonify({"status": "error", "message": "Sign is required"}), 400

    try:
        forecast_json_str = get_zodiac_forecast_response(sign, timeframe, language)
        forecast_data = json.loads(forecast_json_str)
        return jsonify({"data": forecast_data})
    except Exception as e:
        print(f"Error in zodiac_forecast: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
