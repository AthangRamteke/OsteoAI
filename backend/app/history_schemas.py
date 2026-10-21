"""Pydantic contracts for /api/history."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class HistoryRecord(BaseModel):
    """One history entry, as the app shows it."""

    model_config = ConfigDict(extra="allow")

    id: str = Field(..., min_length=1, max_length=100)
    savedAt: datetime
    assessmentData: dict[str, Any]
    predictionResult: dict[str, Any]


class HistoryList(BaseModel):
    records: list[dict[str, Any]]
