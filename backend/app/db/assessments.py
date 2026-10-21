"""
db/assessments.py
=======================================================================
Persistence for submitted assessments.

All SQL here is parameterized; no value is ever formatted into a query
string. Nothing in this module logs assessment inputs or prediction
payloads - health data stays in the database, not in the console.
=======================================================================
"""

from __future__ import annotations

import logging
from typing import Any

from app.db.pool import DatabaseUnavailable, connection

try:
    from psycopg.types.json import Jsonb
except ImportError:  # driver not installed; pool.py reports this clearly
    Jsonb = None  # type: ignore[assignment]

logger = logging.getLogger("osteoai.db")

_INSERT = """
    INSERT INTO assessments (
        age,
        gender,
        bmi,
        features,
        prediction,
        osteoporosis_probability,
        risk_level,
        model_version,
        threshold_used,
        shap_explanations,
        user_id
    )
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    RETURNING id, created_at
"""


def _number(value: Any) -> float | None:
    """Coerce a model feature to float, or None when absent/non-numeric."""

    if value is None:
        return None

    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def save_assessment(
    features: dict[str, Any],
    result: dict[str, Any],
    user_id: int | None = None,
) -> int:
    """
    Store one assessment and its prediction as a single row.

    `features` is the validated request body, `result` the prediction
    response. `user_id` is the signed-in owner, or None when unknown.
    Returns the new row id.

    Raises DatabaseUnavailable if the row could not be written, so the
    caller can never report an unsaved assessment as saved. The whole
    statement runs in one transaction, so a submission produces either
    exactly one row or none.
    """

    if Jsonb is None:
        raise DatabaseUnavailable(
            "PostgreSQL driver is not installed; cannot save the assessment."
        )

    with connection() as conn:
        row = conn.execute(
            _INSERT,
            (
                _number(features.get("age")),
                _number(features.get("gender")),
                _number(features.get("bmi")),
                Jsonb(features),
                int(result["prediction"]),
                float(result["osteoporosis_probability"]),
                str(result["risk_level"]),
                str(result["model_version"]),
                float(result["threshold_used"]),
                Jsonb(result.get("shap_explanations", [])),
                user_id,
            ),
        ).fetchone()

    if not row:
        raise DatabaseUnavailable("Insert returned no row id.")

    # Identifier only - never the payload.
    logger.info("Saved assessment id=%s", row["id"])

    return int(row["id"])


def count_assessments() -> int:
    """Row count, for verification scripts."""

    with connection() as conn:
        row = conn.execute("SELECT count(*) AS n FROM assessments").fetchone()

    return int(row["n"]) if row else 0
