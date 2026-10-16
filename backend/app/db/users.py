"""
db/users.py
=======================================================================
Account storage. All SQL is parameterized. Password hashes never leave
this module except to the verifier in routers/auth.py.
=======================================================================
"""

from __future__ import annotations

from typing import Any

from app.db.pool import connection

_PUBLIC_COLUMNS = "id, name, email, created_at"


def normalize_email(email: str) -> str:
    return email.strip().lower()


def create_user(name: str, email: str, password_hash: str) -> dict[str, Any] | None:
    """
    Insert a user. Returns the new user, or None if the email is taken.

    ON CONFLICT makes the duplicate check and the insert one atomic
    statement, so two simultaneous sign-ups cannot both succeed.
    """

    with connection() as conn:
        return conn.execute(
            f"""
            INSERT INTO users (name, email, password_hash)
            VALUES (%s, %s, %s)
            ON CONFLICT (email) DO NOTHING
            RETURNING {_PUBLIC_COLUMNS}
            """,
            (name.strip(), normalize_email(email), password_hash),
        ).fetchone()


def get_user_with_hash(email: str) -> dict[str, Any] | None:
    with connection() as conn:
        return conn.execute(
            f"SELECT {_PUBLIC_COLUMNS}, password_hash FROM users WHERE email = %s",
            (normalize_email(email),),
        ).fetchone()


def get_user_by_id(user_id: int) -> dict[str, Any] | None:
    with connection() as conn:
        return conn.execute(
            f"SELECT {_PUBLIC_COLUMNS} FROM users WHERE id = %s",
            (user_id,),
        ).fetchone()


def update_password_hash(user_id: int, password_hash: str) -> None:
    with connection() as conn:
        conn.execute(
            "UPDATE users SET password_hash = %s WHERE id = %s",
            (password_hash, user_id),
        )
