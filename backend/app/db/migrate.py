"""
db/migrate.py
=======================================================================
Apply backend/app/db/schema.sql to the configured database.

Repeat-safe: the schema file only creates objects if they are missing
and never drops or truncates anything, so running this against a
database that already holds assessments leaves those rows untouched.

Usage (from backend/, with the venv active):

    python -m app.db.migrate
=======================================================================
"""

from __future__ import annotations

import sys
from pathlib import Path

from app.config import database_url
from app.db.pool import DatabaseUnavailable, connection

SCHEMA_PATH = Path(__file__).resolve().parent / "schema.sql"


def apply_schema() -> list[str]:
    """Run the schema file and return the applied migration versions."""

    sql = SCHEMA_PATH.read_text(encoding="utf-8")

    with connection() as conn:
        conn.execute(sql)
        rows = conn.execute(
            "SELECT version FROM schema_migrations ORDER BY version"
        ).fetchall()

    return [row["version"] for row in rows]


def main() -> int:
    url = database_url()

    if url is None:
        print(
            "DATABASE_URL is not set.\n"
            "Copy backend/.env.example to backend/.env and set it first.",
            file=sys.stderr,
        )
        return 2

    try:
        versions = apply_schema()
    except DatabaseUnavailable as exc:
        print(f"Migration failed: {exc}", file=sys.stderr)
        return 1

    print("Schema applied. Migrations present:")
    for version in versions:
        print(f"  - {version}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
