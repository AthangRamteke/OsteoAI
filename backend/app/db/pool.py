"""
db/pool.py
=======================================================================
PostgreSQL connection handling.

A single lazily-created psycopg connection pool is shared by the whole
process. Callers use the `connection()` context manager, which hands
out a pooled connection inside a transaction: the transaction commits
when the block exits normally and rolls back if it raises.

Every failure mode here surfaces as DatabaseUnavailable so callers can
tell a database problem apart from an application bug.
=======================================================================
"""

from __future__ import annotations

import logging
import threading
from contextlib import contextmanager
from typing import Iterator

from app.config import database_url, db_connect_timeout, db_pool_size

logger = logging.getLogger("osteoai.db")


class DatabaseUnavailable(RuntimeError):
    """The database is not configured, not reachable, or refused the work."""


_pool = None
_pool_lock = threading.Lock()
_import_error: str | None = None

try:
    from psycopg import Error as PsycopgError
    from psycopg.rows import dict_row
    from psycopg_pool import ConnectionPool
except ImportError as exc:  # driver not installed yet
    PsycopgError = Exception  # type: ignore[assignment, misc]
    dict_row = None  # type: ignore[assignment]
    ConnectionPool = None  # type: ignore[assignment]
    _import_error = str(exc)


def is_configured() -> bool:
    """True when a DATABASE_URL is set and the driver is importable."""

    return database_url() is not None and ConnectionPool is not None


def _get_pool():
    global _pool

    if _pool is not None:
        return _pool

    url = database_url()

    if url is None:
        raise DatabaseUnavailable(
            "DATABASE_URL is not set; assessment persistence is disabled."
        )

    if ConnectionPool is None:
        raise DatabaseUnavailable(
            f"PostgreSQL driver is not installed ({_import_error}). "
            "Install it with: pip install -r requirements.txt"
        )

    with _pool_lock:
        if _pool is None:
            minimum, maximum = db_pool_size()

            try:
                _pool = ConnectionPool(
                    conninfo=url,
                    min_size=minimum,
                    max_size=maximum,
                    timeout=db_connect_timeout(),
                    kwargs={"row_factory": dict_row},
                    # Do not block application start-up on the database.
                    open=True,
                    check=ConnectionPool.check_connection,
                )
            except Exception as exc:
                raise DatabaseUnavailable(
                    f"Could not create the connection pool: {exc}"
                ) from exc

    return _pool


@contextmanager
def connection() -> Iterator["object"]:
    """
    Yield a pooled connection wrapped in a transaction.

    Commits on clean exit, rolls back on any exception, and always
    returns the connection to the pool.
    """

    pool = _get_pool()

    try:
        with pool.connection() as conn:
            with conn.transaction():
                yield conn
    except DatabaseUnavailable:
        raise
    except PsycopgError as exc:
        raise DatabaseUnavailable(f"Database error: {exc}") from exc
    except Exception as exc:
        raise DatabaseUnavailable(f"Database unavailable: {exc}") from exc


def ping() -> bool:
    """Cheap connectivity probe. Never raises."""

    if not is_configured():
        return False

    try:
        with connection() as conn:
            conn.execute("SELECT 1")
        return True
    except DatabaseUnavailable as exc:
        logger.warning("Database ping failed: %s", exc)
        return False


def close_pool() -> None:
    """Close the pool on application shutdown."""

    global _pool

    with _pool_lock:
        if _pool is not None:
            try:
                _pool.close()
            finally:
                _pool = None
