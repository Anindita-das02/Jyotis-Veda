import uuid
import json
from flask import request, jsonify

from database.db_connection import call_procedure


def _error(message, code, http_status=400):
    return jsonify({"status": "error", "message": message, "error_code": code}), http_status


def _row_to_report(row: dict) -> dict:
    report_json = row.get("report_json")
    if isinstance(report_json, str):
        report_json = json.loads(report_json)

    return {
        "id": row["id"],
        "profileId": row["profile_id"],
        "mulank": row["mulank"],
        "bhagyank": row["bhagyank"],
        "namankChaldean": row["namank_chaldean"],
        "namankPythagorean": row["namank_pythagorean"],
        "report": report_json,
        "createdAt": row["created_at"].isoformat() if hasattr(row.get("created_at"), "isoformat") else row.get("created_at"),
    }


def save_numerology(user_id: str):
    """Persists a numerology report the frontend already computed via
    astroEngine.ts. The backend does not recompute or validate the
    numerology math itself — it only stores the deterministic result
    against the owning profile, after confirming that profile belongs
    to this user (enforced by requiring profile_id + user_id together
    in the stored procedure's WHERE-equivalent insert path below)."""
    body = request.get_json(silent=True) or {}
    profile_id = body.get("profileId")
    report = body.get("report")

    if not profile_id or not isinstance(report, dict):
        return _error("profileId and report are required", "VALIDATION_ERROR")

    required = ["mulank", "bhagyank", "namankChaldean", "namankPythagorean"]
    missing = [f for f in required if f not in report]
    if missing:
        return _error(f"report is missing field(s): {', '.join(missing)}", "VALIDATION_ERROR")

    # Confirm the profile actually belongs to this user before attaching
    # a report to it (defense in depth beyond the FK constraint).
    owned = call_procedure("sp_get_profile", [profile_id, user_id])
    if not owned:
        return _error("Profile not found", "NOT_FOUND", 404)

    report_id = str(uuid.uuid4())
    rows = call_procedure("sp_save_numerology", [
        report_id, profile_id, user_id,
        int(report["mulank"]), int(report["bhagyank"]),
        int(report["namankChaldean"]), int(report["namankPythagorean"]),
        json.dumps(report),
    ])
    if not rows:
        return _error("Could not save numerology report", "SAVE_FAILED", 500)

    return jsonify({"status": "success", "data": _row_to_report(rows[0])}), 201


def get_numerology(user_id: str, profile_id: str):
    rows = call_procedure("sp_get_numerology", [profile_id, user_id])
    if not rows:
        return _error("No saved numerology report for this profile", "NOT_FOUND", 404)

    return jsonify({"status": "success", "data": _row_to_report(rows[0])})
