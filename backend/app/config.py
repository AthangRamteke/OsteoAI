"""
config.py
=======================================================================
Environment configuration for the OsteoAI backend.

Values come from the process environment, optionally seeded from
backend/.env. The loader mirrors the one already used by
app/agent/llm.py: it only calls os.environ.setdefault, so a variable
exported by the shell always wins and calling it twice is harmless.
=======================================================================
"""

from __future__ import annotations

import logging
import os
import secrets
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]


def load_dotenv() -> None:
    """Seed os.environ from backend/.env if that file exists."""

    env_path = BACKEND_ROOT / ".env"

    if not env_path.is_file():
        return

    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()

        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


load_dotenv()


def _flag(name: str, default: bool) -> bool:
    raw = os.getenv(name)

    if raw is None:
        return default

    return raw.strip().lower() in {"1", "true", "yes", "on"}


def database_url() -> str | None:
    """
    PostgreSQL connection string, or None when persistence is not
    configured. Returning None is a supported state: the API keeps
    serving predictions without a database.
    """

    url = os.getenv("DATABASE_URL", "").strip()

    return url or None


def database_required() -> bool:
    """
    When true, a failed database write makes POST /api/predict fail
    instead of returning an unsaved prediction. Default false so the
    prototype still runs on a machine without PostgreSQL.
    """

    return _flag("DB_REQUIRED", False)


def db_pool_size() -> tuple[int, int]:
    """(min, max) pooled connections."""

    return (
        int(os.getenv("DB_POOL_MIN", "1")),
        int(os.getenv("DB_POOL_MAX", "5")),
    )


def db_connect_timeout() -> float:
    return float(os.getenv("DB_CONNECT_TIMEOUT", "5"))


# ---------------------------------------------------------------------
# Authentication
# ---------------------------------------------------------------------

_ephemeral_secret: str | None = None


def jwt_secret() -> str:
    """
    Signing key for session tokens. Without JWT_SECRET a random key is
    generated per process, which works but signs everyone out whenever
    the backend restarts.
    """

    global _ephemeral_secret

    secret = os.getenv("JWT_SECRET", "").strip()

    if secret:
        return secret

    if _ephemeral_secret is None:
        _ephemeral_secret = secrets.token_urlsafe(48)
        logging.getLogger("osteoai.auth").warning(
            "JWT_SECRET not set - using a temporary key; "
            "sessions end when the backend restarts."
        )

    return _ephemeral_secret


def jwt_expiry_hours(remember: bool) -> float:
    """Token lifetime: long with "Remember me", short without."""

    if remember:
        return float(os.getenv("JWT_REMEMBER_HOURS", str(24 * 30)))

    return float(os.getenv("JWT_SESSION_HOURS", "12"))


# ---------------------------------------------------------------------
# Hospital finder (OpenStreetMap services)
# ---------------------------------------------------------------------


def osm_user_agent() -> str:
    """
    Identifying User-Agent sent to Nominatim and Overpass. Their usage
    policies require one that names the application, ideally with a
    contact address.
    """

    return os.getenv("OSM_USER_AGENT", "").strip() or (
        "OsteoAI/1.0 (academic project; hospital finder)"
    )
