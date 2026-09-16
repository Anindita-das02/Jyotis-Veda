import os
import time
import requests
from typing import Dict, Any, Optional
from database.db_connection import get_db_connection

# In-memory settings cache: {key: (value, timestamp)}
_CACHE: Dict[str, tuple[str, float]] = {}
CACHE_TTL = 30.0  # seconds


def init_settings_table():
    """Ensures the system_settings table exists in MySQL."""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS system_settings (
                setting_key VARCHAR(100) PRIMARY KEY,
                setting_value TEXT NOT NULL,
                description VARCHAR(255) NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'admin'
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """
        )
        conn.commit()
    except Exception as e:
        print(f"[SettingsService] Warning: Could not initialize system_settings table: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()


def load_all_settings():
    """Loads all settings in ONE single query to avoid multiple remote DB roundtrips."""
    now = time.time()
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT setting_key, setting_value FROM system_settings")
        rows = cursor.fetchall()
        for r in rows:
            if r.get("setting_key") and r.get("setting_value") is not None:
                _CACHE[r["setting_key"]] = (str(r["setting_value"]), now)
    except Exception as e:
        print(f"[SettingsService] Bulk load settings warning: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()

# Initialize table & warm up settings cache on import
try:
    init_settings_table()
    load_all_settings()
except Exception:
    pass


def get_setting(key: str, default: Optional[str] = None) -> str:
    """
    Retrieves a setting value.
    Priority:
    1. In-memory cache (if not expired)
    2. MySQL system_settings table (bulk loaded)
    3. os.getenv(key, default)
    """
    now = time.time()
    if key in _CACHE:
        val, ts = _CACHE[key]
        if now - ts < CACHE_TTL:
            return val

    # Bulk reload to refresh all keys in one roundtrip
    load_all_settings()

    if key in _CACHE:
        val, ts = _CACHE[key]
        return val

    # Fallback to .env / os.getenv
    fallback_val = os.getenv(key, default or "")
    _CACHE[key] = (fallback_val, now)
    return fallback_val


def set_setting(key: str, value: str, updated_by: str = "admin", description: Optional[str] = None) -> bool:
    """Sets a setting in the database and updates cache."""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO system_settings (setting_key, setting_value, updated_by, description)
            VALUES (%s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                setting_value = VALUES(setting_value),
                updated_by = VALUES(updated_by),
                description = COALESCE(VALUES(description), description)
            """,
            (key, str(value), updated_by, description),
        )
        conn.commit()
        _CACHE[key] = (str(value), time.time())
        return True
    except Exception as e:
        print(f"[SettingsService] Error saving setting {key}: {e}")
        # Even if DB fails, update local in-memory cache so process can function
        _CACHE[key] = (str(value), time.time())
        return False
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()


def mask_key(k: str) -> str:
    """Masks secret API key for safe UI display (e.g. AIzaSy...ABCD)."""
    if not k:
        return ""
    if len(k) <= 8:
        return "****"
    return f"{k[:6]}...{k[-4:]}"


def get_llm_config() -> Dict[str, Any]:
    """Returns the complete LLM configuration with masked credentials."""
    active_llm = get_setting("ACTIVE_LLM", "mistral_local")
    mistral_local_url = get_setting("MISTRAL_LOCAL_URL", "http://122.163.121.176:3041")
    mistral_model = get_setting("MISTRAL_MODEL", "mistral:latest")

    mistral_cloud_url = get_setting("MISTRAL_CLOUD_URL", "https://api.mistral.ai")
    mistral_cloud_key = get_setting("MISTRAL_CLOUD_API_KEY", "")

    gemini_api_key = get_setting("GEMINI_API_KEY", "")
    gemini_model = get_setting("GEMINI_MODEL", "gemini-2.0-flash")

    openai_api_key = get_setting("OPENAI_API_KEY", "")
    openai_model = get_setting("OPENAI_MODEL", "gpt-4o-mini")
    openai_base_url = get_setting("OPENAI_BASE_URL", "https://api.openai.com/v1")

    return {
        # Flat format matching LLMConfig TypeScript interface:
        "ACTIVE_LLM": active_llm,
        "MISTRAL_LOCAL_URL": mistral_local_url,
        "MISTRAL_MODEL": mistral_model,
        "GEMINI_API_KEY": mask_key(gemini_api_key),
        "GEMINI_MODEL": gemini_model,
        "MISTRAL_CLOUD_URL": mistral_cloud_url,
        "MISTRAL_CLOUD_API_KEY": mask_key(mistral_cloud_key),
        "OPENAI_API_KEY": mask_key(openai_api_key),
        "OPENAI_MODEL": openai_model,
        "OPENAI_BASE_URL": openai_base_url,
        # Nested format for backward compatibility:
        "active_llm": active_llm,
        "mistral_local": {
            "url": mistral_local_url,
            "model": mistral_model,
        },
        "mistral_cloud": {
            "url": mistral_cloud_url,
            "model": mistral_model,
            "is_configured": bool(mistral_cloud_key),
            "masked_key": mask_key(mistral_cloud_key),
        },
        "gemini": {
            "model": gemini_model,
            "is_configured": bool(gemini_api_key),
            "masked_key": mask_key(gemini_api_key),
        },
        "openai": {
            "base_url": openai_base_url,
            "model": openai_model,
            "is_configured": bool(openai_api_key),
            "masked_key": mask_key(openai_api_key),
        },
        "available_providers": ["mistral_local", "gemini", "mistral_cloud", "openai"],
    }


def update_llm_config(data: Dict[str, Any], updated_by: str = "admin") -> bool:
    """Updates the LLM configuration in database."""
    # Active LLM
    active_llm = data.get("ACTIVE_LLM") or data.get("active_llm")
    if active_llm:
        set_setting("ACTIVE_LLM", active_llm.strip(), updated_by=updated_by, description="Active LLM provider")

    # Local Mistral
    mistral_url = data.get("MISTRAL_LOCAL_URL") or data.get("mistral_local_url")
    if mistral_url:
        set_setting("MISTRAL_LOCAL_URL", mistral_url.strip(), updated_by=updated_by)
    mistral_model = data.get("MISTRAL_MODEL") or data.get("mistral_model")
    if mistral_model:
        set_setting("MISTRAL_MODEL", mistral_model.strip(), updated_by=updated_by)

    # Mistral Cloud
    mc_url = data.get("MISTRAL_CLOUD_URL") or data.get("mistral_cloud_url")
    if mc_url:
        set_setting("MISTRAL_CLOUD_URL", mc_url.strip(), updated_by=updated_by)
    mc_key = data.get("MISTRAL_CLOUD_API_KEY") or data.get("mistral_cloud_api_key")
    if mc_key and not mc_key.startswith("***") and "..." not in mc_key:
        set_setting("MISTRAL_CLOUD_API_KEY", mc_key.strip(), updated_by=updated_by)

    # Gemini
    gem_key = data.get("GEMINI_API_KEY") or data.get("gemini_api_key")
    if gem_key and not gem_key.startswith("***") and "..." not in gem_key:
        set_setting("GEMINI_API_KEY", gem_key.strip(), updated_by=updated_by)
    gem_model = data.get("GEMINI_MODEL") or data.get("gemini_model")
    if gem_model:
        set_setting("GEMINI_MODEL", gem_model.strip(), updated_by=updated_by)

    # OpenAI
    oa_key = data.get("OPENAI_API_KEY") or data.get("openai_api_key")
    if oa_key and not oa_key.startswith("***") and "..." not in oa_key:
        set_setting("OPENAI_API_KEY", oa_key.strip(), updated_by=updated_by)
    oa_model = data.get("OPENAI_MODEL") or data.get("openai_model")
    if oa_model:
        set_setting("OPENAI_MODEL", oa_model.strip(), updated_by=updated_by)
    oa_base = data.get("OPENAI_BASE_URL") or data.get("openai_base_url")
    if oa_base:
        set_setting("OPENAI_BASE_URL", oa_base.strip(), updated_by=updated_by)

    return True


def test_llm_connection(provider: str, config: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Tests a single ping connection to the specified LLM provider."""
    if config is None:
        config = {}

    start_time = time.time()
    test_prompt = "Respond with 'OK' only."

    try:
        if provider == "mistral_local":
            base_url = (
                config.get("MISTRAL_LOCAL_URL")
                or config.get("url")
                or get_setting("MISTRAL_LOCAL_URL", "http://122.163.121.176:3041")
            ).rstrip("/")
            model = (
                config.get("MISTRAL_MODEL")
                or config.get("model")
                or get_setting("MISTRAL_MODEL", "mistral:latest")
            )
            if not base_url:
                return {"success": False, "message": "Local Mistral URL is empty"}

            # Try /v1/chat/completions or /api/generate
            endpoint = f"{base_url}/api/generate"
            try:
                resp = requests.post(
                    endpoint,
                    json={"model": model, "prompt": test_prompt, "stream": False},
                    timeout=15,
                )
            except Exception:
                # Fallback to OpenAI-compatible /v1/chat/completions
                resp = requests.post(
                    f"{base_url}/v1/chat/completions",
                    json={"model": model, "messages": [{"role": "user", "content": test_prompt}]},
                    timeout=15,
                )

            latency = int((time.time() - start_time) * 1000)
            if resp.status_code == 200:
                return {"success": True, "latency_ms": latency, "message": f"Connected to {model} successfully ({latency}ms)"}
            return {"success": False, "message": f"Server returned HTTP {resp.status_code}: {resp.text[:150]}"}

        elif provider == "gemini":
            api_key = (
                config.get("GEMINI_API_KEY")
                or config.get("api_key")
                or get_setting("GEMINI_API_KEY", "")
            )
            model = (
                config.get("GEMINI_MODEL")
                or config.get("model")
                or get_setting("GEMINI_MODEL", "gemini-2.0-flash")
            )
            if not api_key or api_key.startswith("***") or "..." in api_key:
                api_key = get_setting("GEMINI_API_KEY", "")
            if not api_key:
                return {"success": False, "message": "Gemini API key is required"}

            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            resp = requests.post(
                url,
                json={"contents": [{"parts": [{"text": test_prompt}]}]},
                timeout=15,
            )
            latency = int((time.time() - start_time) * 1000)
            if resp.status_code == 200:
                return {"success": True, "latency_ms": latency, "message": f"Connected to Gemini ({model}) successfully ({latency}ms)"}
            return {"success": False, "message": f"Gemini API returned HTTP {resp.status_code}: {resp.text[:150]}"}

        elif provider == "mistral_cloud":
            base_url = (
                config.get("MISTRAL_CLOUD_URL")
                or config.get("url")
                or get_setting("MISTRAL_CLOUD_URL", "https://api.mistral.ai")
            ).rstrip("/")
            api_key = (
                config.get("MISTRAL_CLOUD_API_KEY")
                or config.get("api_key")
                or get_setting("MISTRAL_CLOUD_API_KEY", "")
            )
            model = (
                config.get("MISTRAL_MODEL")
                or config.get("model")
                or get_setting("MISTRAL_MODEL", "mistral-large-latest")
            )
            if not api_key or api_key.startswith("***") or "..." in api_key:
                api_key = get_setting("MISTRAL_CLOUD_API_KEY", "")
            if not api_key:
                return {"success": False, "message": "Mistral Cloud API key is required"}

            resp = requests.post(
                f"{base_url}/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                json={"model": model, "messages": [{"role": "user", "content": test_prompt}]},
                timeout=15,
            )
            latency = int((time.time() - start_time) * 1000)
            if resp.status_code == 200:
                return {"success": True, "latency_ms": latency, "message": f"Connected to Mistral Cloud ({model}) successfully ({latency}ms)"}
            return {"success": False, "message": f"Mistral Cloud returned HTTP {resp.status_code}: {resp.text[:150]}"}

        elif provider == "openai":
            base_url = (
                config.get("OPENAI_BASE_URL")
                or config.get("base_url")
                or get_setting("OPENAI_BASE_URL", "https://api.openai.com/v1")
            ).rstrip("/")
            api_key = (
                config.get("OPENAI_API_KEY")
                or config.get("api_key")
                or get_setting("OPENAI_API_KEY", "")
            )
            model = (
                config.get("OPENAI_MODEL")
                or config.get("model")
                or get_setting("OPENAI_MODEL", "gpt-4o-mini")
            )
            if not api_key or api_key.startswith("***") or "..." in api_key:
                api_key = get_setting("OPENAI_API_KEY", "")
            if not api_key:
                return {"success": False, "message": "OpenAI API key is required"}

            resp = requests.post(
                f"{base_url}/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                json={"model": model, "messages": [{"role": "user", "content": test_prompt}]},
                timeout=15,
            )
            latency = int((time.time() - start_time) * 1000)
            if resp.status_code == 200:
                return {"success": True, "latency_ms": latency, "message": f"Connected to OpenAI ({model}) successfully ({latency}ms)"}
            return {"success": False, "message": f"OpenAI returned HTTP {resp.status_code}: {resp.text[:150]}"}

        else:
            return {"success": False, "message": f"Unknown provider: {provider}"}

    except Exception as exc:
        latency = int((time.time() - start_time) * 1000)
        return {"success": False, "latency_ms": latency, "message": f"Connection error: {str(exc)}"}
