"""
db/lookup_cache.py
=======================================================================
Small TTL cache for responses from external lookup services.

PostgreSQL is used when it is available so cached results survive a
restart and are shared between workers. When the database is not
configured or unreachable the cache degrades to a per-process dict, so
the feature still works on a machine without PostgreSQL.
=======================================================================
"""

from __future__ import annotations

import logging
import threading
import time
from typing import Any

from app.db.pool import DatabaseUnavailable, connection, is_configured

try:
    from psycopg.types.json import Jsonb
except ImportError:  # driver not installed yet
    Jsonb = None  # type: ignore[assignment]

logger = logging.getLogger("osteoai.cache")

_memory: dict[str, tuple[float, Any]] = {}
_memory_lock = threading.Lock()
_MEMORY_LIMIT = 500


def _memory_get(key: str) -> Any | None:
    with _memory_lock:
        entry = _memory.get(key)

        if entry is None:
            return None

        expires_at, payload = entry

        if expires_at <= time.monotonic():
            del _memory[key]
            return None

        return payload


def _memory_put(key: str, payload: Any, ttl_seconds: int) -> None:
    with _memory_lock:
        if len(_memory) >= _MEMORY_LIMIT:
            now = time.monotonic()

            for stale in [k for k, (exp, _) in _memory.items() if exp <= now]:
                del _memory[stale]

            if len(_memory) >= _MEMORY_LIMIT:
                _memory.pop(next(iter(_memory)))

        _memory[key] = (time.monotonic() + ttl_seconds, payload)


def get(key: str) -> Any | None:
    """Return the cached payload for `key`, or None if absent/expired."""

    cached = _memory_get(key)

    if cached is not None:
        return cached

    if not is_configured():
        return None

    try:
        with connection() as conn:
            row = conn.execute(
                "SELECT payload, "
                "       EXTRACT(EPOCH FROM (expires_at - now())) AS ttl "
                "FROM lookup_cache "
                "WHERE cache_key = %s AND expires_at > now()",
                (key,),
            ).fetchone()
    except DatabaseUnavailable as exc:
        logger.debug("Cache read skipped: %s", exc)
        return None

    if row is None:
        return None

    # Warm the in-process layer for the remaining lifetime.
    _memory_put(key, row["payload"], max(int(row["ttl"]), 1))

    return row["payload"]


def put(key: str, payload: Any, ttl_seconds: int) -> None:
    """Store `payload` under `key` for `ttl_seconds`."""

    _memory_put(key, payload, ttl_seconds)

    if not is_configured() or Jsonb is None:
        return

    try:
        with connection() as conn:
            conn.execute(
                "INSERT INTO lookup_cache (cache_key, payload, expires_at) "
                "VALUES (%s, %s, now() + make_interval(secs => %s)) "
                "ON CONFLICT (cache_key) DO UPDATE "
                "SET payload = EXCLUDED.payload, "
                "    expires_at = EXCLUDED.expires_at, "
                "    created_at = now()",
                (key, Jsonb(payload), ttl_seconds),
            )
            conn.execute("DELETE FROM lookup_cache WHERE expires_at <= now()")
    except DatabaseUnavailable as exc:
        logger.debug("Cache write skipped: %s", exc)
