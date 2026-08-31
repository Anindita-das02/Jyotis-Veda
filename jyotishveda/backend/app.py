from flask import Flask, request, jsonify
from flask_cors import CORS

from database.db_connection import get_db_connection
from controllers.sample import get_sample_data
from controllers import auth_controller
from controllers import profile_controller
from controllers import numerology_controller
from controllers import match_making
from controllers import counselling_controller
from controllers import daily_insights_controller
from controllers import global_zodiac_controller
from controllers import birth_chart_controller
from controllers import roadmap_controller
from controllers import calendar_controller
from utils.security import require_auth, decode_token
import jwt as pyjwt

app = Flask(__name__)
CORS(app)

@app.route("/daily-insights/panchang", methods=["POST"])
def calculate_ephemeris_panchang():
    return daily_insights_controller.calculate_ephemeris_panchang()

@app.route("/daily-insights/horoscope", methods=["POST"])
def daily_horoscope():
    return daily_insights_controller.daily_horoscope()

@app.route("/zodiac/global-forecast", methods=["POST"])
def zodiac_forecast():
    return global_zodiac_controller.zodiac_forecast()

@app.route("/birth-chart/generate", methods=["POST"])
def calculate_ephemeris_chart():
    return birth_chart_controller.calculate_ephemeris_chart()

@app.route("/birth-chart/ai-interpretation", methods=["POST"])
def post_interpret():
    return birth_chart_controller.post_interpret()

@app.route("/ai/roadmap", methods=["POST"])
def generate_roadmap():
    return roadmap_controller.post_roadmap_insights()

@app.route("/calendar/convert", methods=["POST"])
def convert_calendar():
    return calendar_controller.convert_date()

@app.route("/calendar/month", methods=["POST"])
def get_calendar_month():
    return calendar_controller.get_panjika_month()

@app.route("/calendar/full-panjika", methods=["POST"])
def get_full_panjika():
    return calendar_controller.get_full_panjika()


@app.route("/")
def home():
    return "Server is running!"


@app.route("/health")
def health():
    return get_sample_data()


# ---------------- Auth ----------------

@app.route("/auth/register", methods=["POST"])
def register():
    return auth_controller.register()


@app.route("/auth/login", methods=["POST"])
def login():
    return auth_controller.login()


@app.route("/auth/current-user", methods=["GET"])
@require_auth
def me():
    return auth_controller.me(request.user_id)


# ---------------- Profiles (require login) ----------------

@app.route("/user/profiles", methods=["GET"])
@require_auth
def get_profiles():
    return profile_controller.list_profiles(request.user_id)


@app.route("/user/profiles", methods=["POST"])
@require_auth
def post_profile():
    return profile_controller.create_profile(request.user_id)


@app.route("/user/profiles/<profile_id>", methods=["PUT"])
@require_auth
def put_profile(profile_id):
    return profile_controller.update_profile(request.user_id, profile_id)


@app.route("/user/profiles/<profile_id>", methods=["DELETE"])
@require_auth
def delete_profile(profile_id):
    return profile_controller.delete_profile(request.user_id, profile_id)


# ---------------- Numerology reports (require login) ----------------

@app.route("/numerology/reports", methods=["POST"])
@require_auth
def post_numerology():
    return numerology_controller.save_numerology(request.user_id)


@app.route("/numerology/reports/<profile_id>", methods=["GET"])
@require_auth
def get_numerology(profile_id):
    return numerology_controller.get_numerology(request.user_id, profile_id)



@app.route("/numerology/ai-insights", methods=["POST"])
def post_numerology_insights():
    return numerology_controller.get_dynamic_insights()



# ---------------- Matchmaking / Kundli Milan reports (require login) ----------------


@app.route("/api/matchmaking/reports", methods=["POST"])
@require_auth
def post_match_report1():
    # ডাইনামিক কুন্ডলী মিলন এবং রিপোর্ট সেভ করার জন্য কল হবে
    return match_making.create_match_report(request.user_id)


@app.route("/api/matchmaking/reports", methods=["GET"])
@require_auth
def get_match_reports1():
    # ইউজারের আগের সেভ করা সমস্ত রিপোর্ট দেখার জন্য
    return match_making.list_match_reports(request.user_id)


@app.route("/api/matchmaking/reports/<report_id>", methods=["GET"])
@require_auth
def get_match_report1(report_id):
    # নির্দিষ্ট কোনো একটি রিপোর্টের বিস্তারিত জানার জন্য
    return match_making.get_match_report(request.user_id, report_id)


@app.route("/api/matchmaking/reports/<report_id>/pdf", methods=["GET"])
def get_match_report_pdf1(report_id):
    # PDF ডাউনলোড করার জন্য (এখানে টোকেন URL প্যারামিটারে আসে)
    token = request.args.get("token", "")
    if not token:
        return jsonify({"status": "error", "message": "Missing token", "error_code": "AUTH_REQUIRED"}), 401
    try:
        payload = decode_token(token)
    except pyjwt.PyJWTError:
        return jsonify({"status": "error", "message": "Invalid or expired token", "error_code": "TOKEN_INVALID"}), 401

    return match_making.download_match_report_pdf(payload["sub"], report_id)



# ---------------- AI Counsellor sessions & messages (require login) ----------------

@app.route("/ai-counsellor/sessions", methods=["GET"])
@require_auth
def get_sessions():
    return counselling_controller.list_sessions(request.user_id)


@app.route("/ai-counsellor/sessions", methods=["POST"])
@require_auth
def post_session():
    return counselling_controller.create_session(request.user_id)


@app.route("/ai-counsellor/sessions/<session_id>", methods=["PUT"])
@require_auth
def put_session(session_id):
    return counselling_controller.rename_session(request.user_id, session_id)


@app.route("/ai-counsellor/sessions/<session_id>", methods=["DELETE"])
@require_auth
def delete_session(session_id):
    return counselling_controller.delete_session(request.user_id, session_id)


@app.route("/ai-counsellor/sessions/<session_id>/messages", methods=["GET"])
@require_auth
def get_session_messages(session_id):
    return counselling_controller.get_messages(request.user_id, session_id)


@app.route("/ai-counsellor/sessions/<session_id>/messages", methods=["POST"])
@require_auth
def post_session_message(session_id):
    return counselling_controller.send_message(request.user_id, session_id)


if __name__ == "__main__":
    # Fail fast if MySQL isn't reachable, rather than starting silently broken.
    conn = get_db_connection()
    conn.close()
    app.run(host="0.0.0.0", port=5001, debug=True)
