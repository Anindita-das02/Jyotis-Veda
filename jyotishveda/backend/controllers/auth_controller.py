import uuid
import re
from flask import request, jsonify
from mysql.connector import IntegrityError

from database.db_connection import call_procedure
from utils.security import hash_password, verify_password, issue_token

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _error(message, code, http_status=400):
    return jsonify({"status": "error", "message": message, "error_code": code}), http_status


def register():
    body = request.get_json(silent=True) or {}
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""
    full_name = (body.get("fullName") or "").strip()

    if not EMAIL_RE.match(email):
        return _error("A valid email is required", "INVALID_EMAIL")
    if len(password) < 8:
        return _error("Password must be at least 8 characters", "WEAK_PASSWORD")
    if not full_name:
        return _error("Full name is required", "INVALID_NAME")

    user_id = str(uuid.uuid4())
    password_hash = hash_password(password)

    try:
        rows = call_procedure("sp_user_ops", ['create', user_id, email, password_hash, full_name])
    except IntegrityError:
        return _error("An account with this email already exists", "EMAIL_TAKEN", 409)

    if not rows:
        return _error("Could not create account", "REGISTER_FAILED", 500)

    user = rows[0]
    token = issue_token(user["id"], user["role"])

    return jsonify({
        "status": "success",
        "data": {
            "token": token,
            "user": {
                "id": user["id"],
                "email": email,
                "fullName": user["full_name"],
                "role": user["role"],
            },
        },
    }), 201


def login():
    body = request.get_json(silent=True) or {}
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""

    rows = call_procedure("sp_user_ops", ['get_by_email', '', email, '', ''])
    if not rows:
        return _error("Invalid email or password", "INVALID_CREDENTIALS", 401)

    user = rows[0]
    if not user["is_active"]:
        return _error("This account has been deactivated", "ACCOUNT_DISABLED", 403)
    if not verify_password(password, user["password_hash"]):
        return _error("Invalid email or password", "INVALID_CREDENTIALS", 401)

    token = issue_token(user["id"], user["role"])

    return jsonify({
        "status": "success",
        "data": {
            "token": token,
            "user": {
                "id": user["id"],
                "email": user["email"],
                "fullName": user["full_name"],
                "role": user["role"],
            },
        },
    })


def me(user_id):
    rows = call_procedure("sp_user_ops", ['get_by_id', user_id, '', '', ''])
    if not rows:
        return _error("User not found", "NOT_FOUND", 404)

    user = rows[0]
    return jsonify({
        "status": "success",
        "data": {
            "id": user["id"],
            "email": user["email"],
            "fullName": user["full_name"],
            "role": user["role"],
            "createdAt": user["created_at"].isoformat() if user.get("created_at") else None,
        },
    })


def google_auth():
    body = request.get_json(silent=True) or {}
    email = (body.get("email") or "").strip().lower()
    full_name = (body.get("fullName") or "").strip() or "Google User"

    if not email or not EMAIL_RE.match(email):
        return _error("A valid Google email is required", "INVALID_EMAIL")

    # Check if user already exists
    rows = call_procedure("sp_get_user_by_email", [email])
    if rows:
        user = rows[0]
        if not user["is_active"]:
            return _error("This account has been deactivated", "ACCOUNT_DISABLED", 403)
        token = issue_token(user["id"], user["role"])
        return jsonify({
            "status": "success",
            "data": {
                "token": token,
                "user": {
                    "id": user["id"],
                    "email": user["email"],
                    "fullName": user["full_name"],
                    "role": user["role"],
                },
            },
        })

    # If user doesn't exist, create a new user account with a secure generated password hash
    user_id = str(uuid.uuid4())
    random_pw = uuid.uuid4().hex + "G00gle!"
    password_hash = hash_password(random_pw)

    try:
        new_rows = call_procedure("sp_create_user", [user_id, email, password_hash, full_name])
    except IntegrityError:
        # Fallback if race condition occurred
        existing = call_procedure("sp_get_user_by_email", [email])
        if existing:
            user = existing[0]
            token = issue_token(user["id"], user["role"])
            return jsonify({
                "status": "success",
                "data": {
                    "token": token,
                    "user": {
                        "id": user["id"],
                        "email": user["email"],
                        "fullName": user["full_name"],
                        "role": user["role"],
                    },
                },
            })
        return _error("An account with this email already exists", "EMAIL_TAKEN", 409)

    if not new_rows:
        return _error("Could not create account via Google", "REGISTER_FAILED", 500)

    user = new_rows[0]
    token = issue_token(user["id"], user["role"])

    return jsonify({
        "status": "success",
        "data": {
            "token": token,
            "user": {
                "id": user["id"],
                "email": email,
                "fullName": user["full_name"],
                "role": user["role"],
            },
        },
    }), 201

