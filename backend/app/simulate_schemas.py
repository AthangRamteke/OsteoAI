"""Pydantic contracts for POST /api/simulate."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class SimulationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    base_payload: dict[str, Any] = Field(
        ...,
        description="The patient's current model input row.",
    )

    changes: dict[str, Any] = Field(
        ...,
        description="Adjustable inputs to override for the hypothetical run.",
    )


class SimulationOutcome(BaseModel):
    model_config = ConfigDict(extra="forbid")

    probability: float
    risk_level: str
    prediction: int


class SimulationResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    baseline: SimulationOutcome
    simulated: SimulationOutcome
    delta: float = Field(
        ...,
        description="Simulated minus baseline probability, in [-1, 1].",
    )
    delta_points: float = Field(
        ...,
        description="The same difference expressed in percentage points.",
    )
    applied_changes: dict[str, Any]
    ignored_changes: list[str] = Field(
        default_factory=list,
        description="Requested changes refused because the input is not adjustable.",
    )
    shap_explanations: list[dict[str, Any]] = Field(default_factory=list)
    disclaimer: str
