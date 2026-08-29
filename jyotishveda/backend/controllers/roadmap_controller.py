from flask import Blueprint, request, jsonify

roadmap_bp = Blueprint('roadmap', __name__)

@roadmap_bp.route("/api/gemini/roadmap", methods=["POST"])
def post_roadmap_insights():
    body = request.get_json(silent=True) or {}
    profile = body.get("profile", {})
    tradition = body.get("tradition", "Vedic")
    language = body.get("language", "en")
    
    chart_data = body.get("chartData", {})
    numerology = body.get("numerology", {})
    
    try:
        from services.llm_service import get_roadmap_insights_response
        json_res = get_roadmap_insights_response(profile, tradition, chart_data, numerology, language)
        import json
        insights_data = json.loads(json_res)
        return jsonify({"status": "success", "data": insights_data})
    except Exception as e:
        print(f"Error in roadmap insights: {e}")
        return jsonify({"status": "error", "message": str(e), "error_code": "LLM_ERROR"}), 500
