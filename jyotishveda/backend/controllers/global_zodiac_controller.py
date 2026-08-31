from flask import request, jsonify
import json
from services.llm_service import get_zodiac_forecast_response

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
