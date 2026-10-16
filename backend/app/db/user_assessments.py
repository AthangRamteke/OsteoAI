"""
db/user_assessments.py
=======================================================================
A signed-in user's assessment history. Every query is scoped by user_id,
so one account can never read or delete another's records. All SQL is
parameterized, and nothing here logs health data.
=======================================================================
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from app.db.pool import DatabaseUnavailable, connection

try:
    from psycopg.types.json import Jsonb
except ImportError:  # driver not installed; pool.py reports this clearly
    Jsonb = None  # type: ignore[assignment]

MAX_RECORDS_PER_USER = 200


def list_records(user_id: int) -> list[dict[str, Any]]:
    """The user's history entries, newest first."""

    with connection() as conn:
        rows = conn.execute(
            "SELECT record FROM user_assessments "
            "WHERE user_id = %s ORDER BY saved_at DESC LIMIT %s",
            (user_id, MAX_RECORDS_PER_USER),
        ).fetchall()

    return [row["record"] for row in rows]


def add_record(
    user_id: int, record_id: str, saved_at: datetime, record: dict[str, Any]
) -> bool:
    """Store one entry. Returns False if the user already has that id."""

    if Jsonb is None:
        raise DatabaseUnavailable("PostgreSQL driver is not installed.")

    with connection() as conn:
        row = conn.execute(
            "INSERT INTO user_assessments (user_id, record_id, saved_at, record) "
            "VALUES (%s, %s, %s, %s) "
            "ON CONFLICT (user_id, record_id) DO NOTHING "
            "RETURNING id",
            (user_id, record_id, saved_at, Jsonb(record)),
        ).fetchone()

    return row is not None


def delete_record(user_id: int, record_id: str) -> bool:
    """Delete one of the user's entries. Returns whether one was removed."""

    with connection() as conn:
        row = conn.execute(
            "DELETE FROM user_assessments "
            "WHERE user_id = %s AND record_id = %s RETURNING id",
            (user_id, record_id),
        ).fetchone()

    return row is not None
