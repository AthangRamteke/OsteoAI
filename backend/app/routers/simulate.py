"""POST /api/simulate: hypothetical What-if comparison.

Re-runs the same frozen model on a copy of the patient's inputs with
selected lifestyle values changed. The result is a comparison of two
model estimates, NOT evidence that making the change in real life
produces that outcome.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException

from app.services.predictor import predict_patient
from app.simulate_schemas import SimulationRequest, SimulationResponse


router = APIRouter(
    prefix="/api",
    tags=["simulate"],
)


# Only lifestyle-style inputs a person could plausibly change are
# adjustable. Age, gender and family history are deliberately excluded.
ADJUSTABLE_FEATURES = {
    "bmi",
    "weight_kg",
    "waist_cm",
    "hip_cm",
    "smoked_100_cigarettes",
    "alcohol_frequency",
    "alcohol_drinks_per_day",
    "vigorous_work_activity",
    "moderate_work_activity",
    "walk_or_bicycle",
    "vigorous_recreation",
    "moderate_recreation",
    "sedentary_minutes",
}


def _summary(result: dict[str, Any]) -> dict[str, Any]:
    return {
        "probability": result["osteoporosis_probability"],
        "risk_level": result["risk_level"],
        "prediction": result["prediction"],
    }


@router.post("/simulate", response_model=SimulationResponse)
def simulate(payload: SimulationRequest) -> SimulationResponse:
    base = dict(payload.base_payload)

    rejected = sorted(set(payload.changes) - ADJUSTABLE_FEATURES)
    applied = {
        key: value
        for key, value in payload.changes.items()
        if key in ADJUSTABLE_FEATURES
    }

    if not applied:
        raise HTTPException(
            status_code=422,
            detail=(
                "No adjustable inputs were provided. Adjustable inputs: "
                + ", ".join(sorted(ADJUSTABLE_FEATURES))
            ),
        )

    simulated_payload = {**base, **applied}

    # Keep BMI consistent when weight or height is adjusted, so the
    # hypothetical row stays internally coherent.
    height = simulated_payload.get("height_cm")
    weight = simulated_payload.get("weight_kg")
    if "bmi" not in applied and height and weight:
        try:
            simulated_payload["bmi"] = float(weight) / (float(height) / 100) ** 2
        except (TypeError, ValueError, ZeroDivisionError):
            pass

    try:
        baseline = predict_patient(base)
        simulated = predict_patient(simulated_payload)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Simulation failed: {exc}",
        ) from exc

    delta = (
        simulated["osteoporosis_probability"]
        - baseline["osteoporosis_probability"]
    )

    return SimulationResponse(
        baseline=_summary(baseline),
        simulated=_summary(simulated),
        delta=delta,
        delta_points=delta * 100,
        applied_changes=applied,
        ignored_changes=rejected,
        shap_explanations=simulated["shap_explanations"],
        disclaimer=(
            "This compares two model estimates for the same person with "
            "different inputs. It is a hypothetical model comparison, not "
            "a prediction that changing this factor will change your real "
            "bone health."
        ),
    )
