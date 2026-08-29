from flask import Flask, request, jsonify
from flask_cors import CORS

from database.db_connection import get_db_connection
from controllers.sample import get_sample_data
from controllers import auth_controller
from controllers import profile_controller
from controllers import numerology_controller
from controllers import matchmaking_controller
from controllers import counselling_controller
from controllers.daily_insights_controller import daily_insights_bp
from controllers.global_zodiac_controller import global_zodiac_bp
from controllers.birth_chart_controller import birth_chart_bp
from utils.security import require_auth, decode_token
import jwt as pyjwt

app = Flask(__name__)
CORS(app)

app.register_blueprint(daily_insights_bp)
app.register_blueprint(global_zodiac_bp)
app.register_blueprint(birth_chart_bp)


@app.route("/")
def home():
    return "Server is running!"


@app.route("/api/health")
def health():
    return get_sample_data()


# ---------------- Auth ----------------

@app.route("/api/auth/register", methods=["POST"])
def register():
    return auth_controller.register()


@app.route("/api/auth/login", methods=["POST"])
def login():
    return auth_controller.login()


@app.route("/api/auth/me", methods=["GET"])
@require_auth
def me():
    return auth_controller.me(request.user_id)


# ---------------- Profiles (require login) ----------------

@app.route("/api/profiles", methods=["GET"])
@require_auth
def get_profiles():
    return profile_controller.list_profiles(request.user_id)


@app.route("/api/profiles", methods=["POST"])
@require_auth
def post_profile():
    return profile_controller.create_profile(request.user_id)


@app.route("/api/profiles/<profile_id>", methods=["PUT"])
@require_auth
def put_profile(profile_id):
    return profile_controller.update_profile(request.user_id, profile_id)


@app.route("/api/profiles/<profile_id>", methods=["DELETE"])
@require_auth
def delete_profile(profile_id):
    return profile_controller.delete_profile(request.user_id, profile_id)


# ---------------- Numerology reports (require login) ----------------

@app.route("/api/numerology", methods=["POST"])
@require_auth
def post_numerology():
    return numerology_controller.save_numerology(request.user_id)


@app.route("/api/numerology/<profile_id>", methods=["GET"])
@require_auth
def get_numerology(profile_id):
    return numerology_controller.get_numerology(request.user_id, profile_id)


# ---------------- Matchmaking / Kundli Milan reports (require login) ----------------

@app.route("/api/matchmaking/reports", methods=["POST"])
@require_auth
def post_match_report():
    return matchmaking_controller.create_match_report(request.user_id)


@app.route("/api/matchmaking/reports", methods=["GET"])
@require_auth
def get_match_reports():
    return matchmaking_controller.list_match_reports(request.user_id)


@app.route("/api/matchmaking/reports/<report_id>", methods=["GET"])
@require_auth
def get_match_report(report_id):
    return matchmaking_controller.get_match_report(request.user_id, report_id)


@app.route("/api/matchmaking/reports/<report_id>/pdf", methods=["GET"])
def get_match_report_pdf(report_id):
    # PDF downloads are triggered via direct navigation/window.open, which
    # cannot set an Authorization header — so this endpoint also accepts
    # the JWT as a `token` query param, validated the same way.
    token = request.args.get("token", "")
    if not token:
        return jsonify({"status": "error", "message": "Missing token", "error_code": "AUTH_REQUIRED"}), 401
    try:
        payload = decode_token(token)
    except pyjwt.PyJWTError:
        return jsonify({"status": "error", "message": "Invalid or expired token", "error_code": "TOKEN_INVALID"}), 401

    return matchmaking_controller.download_match_report_pdf(payload["sub"], report_id)


# ---------------- AI Counsellor sessions & messages (require login) ----------------

@app.route("/api/counsellor/sessions", methods=["GET"])
@require_auth
def get_sessions():
    return counselling_controller.list_sessions(request.user_id)


@app.route("/api/counsellor/sessions", methods=["POST"])
@require_auth
def post_session():
    return counselling_controller.create_session(request.user_id)


@app.route("/api/counsellor/sessions/<session_id>", methods=["PUT"])
@require_auth
def put_session(session_id):
    return counselling_controller.rename_session(request.user_id, session_id)


@app.route("/api/counsellor/sessions/<session_id>", methods=["DELETE"])
@require_auth
def delete_session(session_id):
    return counselling_controller.delete_session(request.user_id, session_id)


@app.route("/api/counsellor/sessions/<session_id>/messages", methods=["GET"])
@require_auth
def get_session_messages(session_id):
    return counselling_controller.get_messages(request.user_id, session_id)


@app.route("/api/counsellor/sessions/<session_id>/messages", methods=["POST"])
@require_auth
def post_session_message(session_id):
    return counselling_controller.send_message(request.user_id, session_id)


if __name__ == "__main__":
    # Fail fast if MySQL isn't reachable, rather than starting silently broken.
    conn = get_db_connection()
    conn.close()
    app.run(host="0.0.0.0", port=5001, debug=True)
