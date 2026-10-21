"""Pydantic contracts for GET /api/doctors/nearby."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict


class Origin(BaseModel):
    model_config = ConfigDict(extra="forbid")

    lat: float
    lng: float
    label: str | None = None
    source: Literal["device", "pincode", "place"]


class Hospital(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    name: str
    category: Literal["hospital", "clinic", "doctor"]
    specialist: bool
    lat: float
    lng: float
    distance_km: float
    address: str | None = None
    phones: list[str] = []
    website: str | None = None
    email: str | None = None
    opening_hours: str | None = None
    emergency: bool = False


class NearbyResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    origin: Origin
    radius_km: int
    widened: bool
    results: list[Hospital]
