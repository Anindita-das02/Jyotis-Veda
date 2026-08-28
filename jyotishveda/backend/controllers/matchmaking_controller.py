import uuid
import json
from flask import request, jsonify, Response

from database.db_connection import call_procedure
from services.report_service import generate_match_report_pdf


def _error(message, code, http_status=400):
    return jsonify({"status": "error", "message": message, "error_code": code}), http_status


def _row_to_summary(row: dict) -> dict:
    return {
        "id": row["id"],
        "partner1Name": row["partner1_name"],
        "partner1BirthDate": row["partner1_birth_date"].isoformat() if hasattr(row["partner1_birth_date"], "isoformat") else str(row["partner1_birth_date"]),
        "partner2Name": row["partner2_name"],
        "partner2BirthDate": row["partner2_birth_date"].isoformat() if hasattr(row["partner2_birth_date"], "isoformat") else str(row["partner2_birth_date"]),
        "totalScore": float(row["total_score"]),
        "maxScore": float(row["max_score"]),
        "manglikStatus": row.get("manglik_status"),
        "createdAt": row["created_at"].isoformat() if hasattr(row.get("created_at"), "isoformat") else row.get("created_at"),
    }


def _row_to_full(row: dict) -> dict:
    summary = _row_to_summary(row)
    report_json = row.get("report_json")
    if isinstance(report_json, str):
        report_json = json.loads(report_json)
    summary["report"] = report_json
    return summary


def create_match_report(user_id: str):
    """Persists a Kundli Milan result the frontend already computed via
    astroEngine.ts's calculateKundliMilan(). The backend stores the
    deterministic score/report as-is; it does not recompute the
    Ashta Koota matching itself."""
    body = request.get_json(silent=True) or {}
    p1_name = body.get("partner1Name")
    p1_dob = body.get("partner1BirthDate")
    p2_name = body.get("partner2Name")
    p2_dob = body.get("partner2BirthDate")
    total_score = body.get("totalScore")
    report = body.get("report")

    required_missing = [
        name for name, val in [
            ("partner1Name", p1_name), ("partner1BirthDate", p1_dob),
            ("partner2Name", p2_name), ("partner2BirthDate", p2_dob),
            ("totalScore", total_score),
        ] if val in (None, "")
    ]
    if required_missing or not isinstance(report, dict):
        return _error(f"Missing required field(s): {', '.join(required_missing) or 'report'}", "VALIDATION_ERROR")

    try:
        total_score = float(total_score)
        max_score = float(body.get("maxScore", 36.0))
    except (TypeError, ValueError):
        return _error("totalScore and maxScore must be numeric", "VALIDATION_ERROR")

    report_id = str(uuid.uuid4())
    rows = call_procedure("sp_create_match_report", [
        report_id, user_id, p1_name, p1_dob, p2_name, p2_dob,
        total_score, max_score, body.get("manglikStatus"),
        json.dumps(report),
    ])
    if not rows:
        return _error("Could not save match report", "SAVE_FAILED", 500)

    return jsonify({"status": "success", "data": _row_to_full(rows[0])}), 201


def list_match_reports(user_id: str):
    rows = call_procedure("sp_get_match_reports", [user_id])
    return jsonify({"status": "success", "data": [_row_to_summary(r) for r in rows]})


def get_match_report(user_id: str, report_id: str):
    rows = call_procedure("sp_get_match_report", [report_id, user_id])
    if not rows:
        return _error("Match report not found", "NOT_FOUND", 404)

    return jsonify({"status": "success", "data": _row_to_full(rows[0])})


def download_match_report_pdf(user_id: str, report_id: str):
    rows = call_procedure("sp_get_match_report", [report_id, user_id])
    if not rows:
        return _error("Match report not found", "NOT_FOUND", 404)

    row = dict(rows[0])
    report_json = row.get("report_json")
    if isinstance(report_json, str):
        report_json = json.loads(report_json)
    row["report_json"] = report_json

    pdf_bytes = generate_match_report_pdf(row)
    filename = f"jyotishveda-kundli-milan-{report_id[:8]}.pdf"
    return Response(
        pdf_bytes,
        mimetype="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
